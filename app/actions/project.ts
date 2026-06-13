"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { planConfig } from "@/lib/plans";
import type { AiVerdict, Plan } from "@/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export interface ActionResult {
  error?: string;
  ok?: boolean;
  id?: string;
  token?: string;
}

// ─── Projects ───────────────────────────────────────────────
export async function createProject(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const original_scope = String(formData.get("original_scope") ?? "").trim();
  if (!name || !original_scope) {
    return { error: "Project name and original scope are required." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();
  const plan: Plan = (profile?.plan as Plan) ?? "free";

  // Enforce active-project limit for the plan.
  const cap = planConfig(plan).maxActiveProjects;
  if (cap !== null) {
    const { count } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active");
    if ((count ?? 0) >= cap) {
      return {
        error: `Your ${planConfig(plan).name} plan allows ${cap} active project. Upgrade to add more.`,
      };
    }
  }

  const publicToken = nanoid(12);
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      client_name: String(formData.get("client_name") ?? "").trim() || null,
      client_email: String(formData.get("client_email") ?? "").trim() || null,
      original_scope,
      public_token: publicToken,
    })
    .select("id, public_token")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create project." };

  revalidatePath("/dashboard");
  return { ok: true, id: data.id, token: data.public_token };
}

export async function updateClientUpdate(
  projectId: string,
  text: string,
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("projects")
    .update({ client_update: text || null })
    .eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath(`/project/${projectId}`);
  return { ok: true };
}

export async function setProjectStatus(
  projectId: string,
  status: "active" | "completed" | "archived",
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath(`/project/${projectId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

// ─── Scope requests ─────────────────────────────────────────
export async function createScopeRequest(
  projectId: string,
  content: string,
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  if (!content.trim()) return { error: "Paste what your client asked for." };

  const { data, error } = await supabase
    .from("scope_requests")
    .insert({ project_id: projectId, content: content.trim() })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not log request." };
  revalidatePath(`/project/${projectId}/requests`);
  return { ok: true, id: data.id };
}

/** Manual classification fallback when the AI is unavailable. */
export async function setManualVerdict(
  requestId: string,
  projectId: string,
  verdict: AiVerdict,
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("scope_requests")
    .update({
      ai_verdict: verdict,
      ai_reasoning: "Manually classified by you.",
      ai_estimated_hours: verdict === "in_scope" ? 0 : null,
    })
    .eq("id", requestId);
  if (error) return { error: error.message };
  revalidatePath(`/project/${projectId}/requests`);
  return { ok: true };
}

export async function markRequestStatus(
  requestId: string,
  projectId: string,
  status: "pending" | "change_order_created" | "declined" | "accepted_free",
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("scope_requests")
    .update({ status })
    .eq("id", requestId);
  if (error) return { error: error.message };
  revalidatePath(`/project/${projectId}/requests`);
  return { ok: true };
}

// ─── Change orders ──────────────────────────────────────────
export async function createChangeOrder(
  projectId: string,
  input: {
    requestId?: string | null;
    title: string;
    description: string;
    hours: number;
    rate: number;
  },
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  if (!input.title.trim() || !input.description.trim()) {
    return { error: "Title and description are required." };
  }
  if (!(input.hours > 0) || !(input.rate > 0)) {
    return { error: "Hours and rate must be greater than zero." };
  }

  const { data, error } = await supabase
    .from("change_orders")
    .insert({
      project_id: projectId,
      request_id: input.requestId ?? null,
      title: input.title.trim(),
      description: input.description.trim(),
      hours: input.hours,
      rate: input.rate,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create change order." };

  if (input.requestId) {
    await supabase
      .from("scope_requests")
      .update({ status: "change_order_created" })
      .eq("id", input.requestId);
  }

  revalidatePath(`/project/${projectId}/change-orders`);
  revalidatePath(`/project/${projectId}/requests`);
  return { ok: true, id: data.id };
}

export async function updateChangeOrder(
  changeOrderId: string,
  projectId: string,
  input: { title: string; description: string; hours: number; rate: number },
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("change_orders")
    .update({
      title: input.title.trim(),
      description: input.description.trim(),
      hours: input.hours,
      rate: input.rate,
    })
    .eq("id", changeOrderId)
    .eq("status", "draft"); // only editable while a draft
  if (error) return { error: error.message };
  revalidatePath(`/project/${projectId}/change-orders`);
  return { ok: true };
}
