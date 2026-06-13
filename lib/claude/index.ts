import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult } from "@/types";

const MODEL = "claude-opus-4-8";

let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are a freelance project scope analyzer. Given the original project scope and a new client request, determine:
1. verdict: 'in_scope', 'out_of_scope', or 'ambiguous'
2. reasoning: 1-2 sentence explanation
3. estimated_hours: how many extra hours this would take if out of scope (0 if in scope)`;

// Structured-output schema — guarantees a parseable, well-shaped response
// instead of relying on "return JSON only" prompting.
const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["in_scope", "out_of_scope", "ambiguous"] },
    reasoning: { type: "string" },
    estimated_hours: { type: "number" },
  },
  required: ["verdict", "reasoning", "estimated_hours"],
  additionalProperties: false,
} as const;

/**
 * Classify a client request against the original scope.
 * Throws on API failure so the caller can surface the manual-fallback UI.
 */
export async function analyzeScopeRequest(
  originalScope: string,
  newRequest: string,
): Promise<AnalysisResult> {
  // Typed as a plain object and passed through `as any` so the call is robust
  // across SDK minor versions whose generated types may not yet include
  // `output_config` / adaptive `thinking` / `effort`.
  const params = {
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: { effort: "low", format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `ORIGINAL PROJECT SCOPE:\n${originalScope}\n\nNEW CLIENT REQUEST:\n${newRequest}`,
      },
    ],
  };

  const response = await getClient().messages.create(params as never);

  const textBlock = response.content.find((b: { type: string }) => b.type === "text") as
    | { type: "text"; text: string }
    | undefined;
  if (!textBlock) {
    throw new Error("Claude returned no text content");
  }

  const parsed = JSON.parse(textBlock.text) as AnalysisResult;
  // Normalize: in-scope requests never carry extra hours.
  if (parsed.verdict === "in_scope") parsed.estimated_hours = 0;
  parsed.estimated_hours = Math.max(0, Number(parsed.estimated_hours) || 0);
  return parsed;
}
