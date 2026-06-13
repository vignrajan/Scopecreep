import type { Plan } from "@/types";

export interface PlanConfig {
  id: Plan;
  name: string;
  price: string;
  /** Max active projects. null = unlimited. */
  maxActiveProjects: number | null;
  /** Max AI scope analyses per calendar month. null = unlimited. */
  maxAnalysesPerMonth: number | null;
  /** Whether the plan unlocks the client e-sign flow. */
  clientESign: boolean;
  features: string[];
  /** Lemon Squeezy variant id (env-driven; undefined for free). */
  variantIdEnv?: string;
  comingSoon?: boolean;
}

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    maxActiveProjects: 1,
    maxAnalysesPerMonth: 5,
    clientESign: false,
    features: ["1 active project", "5 scope analyses / month", "Manual classification"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$19/mo",
    maxActiveProjects: null,
    maxAnalysesPerMonth: null,
    clientESign: true,
    variantIdEnv: "LEMONSQUEEZY_PRO_VARIANT_ID",
    features: [
      "Unlimited projects",
      "Unlimited analyses",
      "Client e-sign",
      "Email notifications",
    ],
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: "$49/mo",
    maxActiveProjects: null,
    maxAnalysesPerMonth: null,
    clientESign: true,
    variantIdEnv: "LEMONSQUEEZY_AGENCY_VARIANT_ID",
    comingSoon: true,
    features: ["Everything in Pro", "5 team seats", "White-label client pages"],
  },
};

/** Abuse guard on the AI endpoint, applied to every plan. */
export const AI_HOURLY_RATE_LIMIT = 20;

export function planConfig(plan: Plan): PlanConfig {
  return PLANS[plan] ?? PLANS.free;
}

/** Resolve a Lemon Squeezy variant id back to a plan. */
export function planForVariant(variantId: string | null | undefined): Plan {
  if (!variantId) return "free";
  if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return "pro";
  if (variantId === process.env.LEMONSQUEEZY_AGENCY_VARIANT_ID) return "agency";
  return "free";
}
