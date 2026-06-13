import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeScopeRequest } from "@/lib/claude";
import { checkAnalysisLimits } from "@/lib/rate-limit";
import type { Plan } from "@/types";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestId = body?.requestId as string | undefined;
    if (!requestId) {
      return NextResponse.json({ error: "requestId is required" }, { status: 400 });
    }

    // Load the request + parent project. RLS guarantees ownership: a user can
    // only read scope_requests under projects they own.
    const { data: scopeRequest, error: loadErr } = await supabase
      .from("scope_requests")
      .select("id, content, project_id, projects(original_scope, user_id)")
      .eq("id", requestId)
      .single();

    if (loadErr || !scopeRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const project = scopeRequest.projects as unknown as {
      original_scope: string;
      user_id: string;
    };

    // Plan for limit checks.
    const { data: profile } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();
    const plan: Plan = (profile?.plan as Plan) ?? "free";

    const limit = await checkAnalysisLimits(user.id, plan);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error:
            limit.reason === "monthly"
              ? "You've hit your monthly analysis limit. Upgrade to Pro for unlimited analyses."
              : "Too many analyses in the last hour. Please try again shortly.",
          limit: limit.reason,
        },
        { status: 429 },
      );
    }

    // Run the classification. On failure, signal the manual-fallback UI.
    let result;
    try {
      result = await analyzeScopeRequest(project.original_scope, scopeRequest.content);
    } catch (err) {
      console.error("[analyze-request] Claude error:", err);
      return NextResponse.json(
        {
          error: "AI analysis unavailable, please classify manually",
          fallback: true,
        },
        { status: 503 },
      );
    }

    // Persist verdict on the request row.
    const { error: updateErr } = await supabase
      .from("scope_requests")
      .update({
        ai_verdict: result.verdict,
        ai_reasoning: result.reasoning,
        ai_estimated_hours: result.estimated_hours,
      })
      .eq("id", requestId);

    if (updateErr) {
      console.error("[analyze-request] update error:", updateErr);
      return NextResponse.json(
        { error: "Could not save analysis result" },
        { status: 500 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyze-request] unexpected:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
