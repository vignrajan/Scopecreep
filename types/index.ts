export type Plan = "free" | "pro" | "agency";
export type ProjectStatus = "active" | "completed" | "archived";
export type RequestSource = "manual" | "email_paste";
export type AiVerdict = "in_scope" | "out_of_scope" | "ambiguous";
export type RequestStatus =
  | "pending"
  | "change_order_created"
  | "declined"
  | "accepted_free";
export type ChangeOrderStatus = "draft" | "sent" | "signed" | "declined";

export interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  hourly_rate: number;
  currency: string;
  plan: Plan;
  ls_customer_id: string | null;
  ls_subscription_id: string | null;
  ls_variant_id: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  client_name: string | null;
  client_email: string | null;
  original_scope: string;
  status: ProjectStatus;
  public_token: string;
  client_update: string | null;
  total_approved_extras: number;
  created_at: string;
}

export interface ScopeRequest {
  id: string;
  project_id: string;
  content: string;
  source: RequestSource;
  ai_verdict: AiVerdict | null;
  ai_reasoning: string | null;
  ai_estimated_hours: number | null;
  status: RequestStatus;
  created_at: string;
}

export interface ChangeOrder {
  id: string;
  project_id: string;
  request_id: string | null;
  co_number: number | null;
  title: string;
  description: string;
  hours: number;
  rate: number;
  total: number;
  status: ChangeOrderStatus;
  client_signed_at: string | null;
  client_ip: string | null;
  sign_token: string | null;
  sent_at: string | null;
  created_at: string;
}

/** Shape returned by the Claude analysis endpoint. */
export interface AnalysisResult {
  verdict: AiVerdict;
  reasoning: string;
  estimated_hours: number;
}
