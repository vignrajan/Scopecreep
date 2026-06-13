import crypto from "crypto";
import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";
import { appUrl } from "@/lib/utils";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY });
  configured = true;
}

/**
 * Create a hosted Lemon Squeezy checkout for a given variant. The Supabase
 * user id is stashed in `custom` so the webhook can map the purchase back to
 * a user, and prefilled email improves conversion.
 */
export async function createCheckoutUrl(params: {
  variantId: string;
  userId: string;
  email: string;
}): Promise<string> {
  ensureConfigured();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;

  const { data, error } = await createCheckout(storeId, params.variantId, {
    checkoutData: {
      email: params.email,
      custom: { user_id: params.userId },
    },
    productOptions: {
      redirectUrl: appUrl("/dashboard/billing?upgraded=1"),
    },
    checkoutOptions: { embed: false },
  });

  if (error || !data?.data.attributes.url) {
    throw new Error(error?.message ?? "Failed to create checkout");
  }
  return data.data.attributes.url;
}

/**
 * Returns the Lemon Squeezy customer-portal URL for a subscription, where the
 * user can update their card or cancel. Null if unavailable.
 */
export async function getCustomerPortalUrl(
  subscriptionId: string,
): Promise<string | null> {
  ensureConfigured();
  const { data, error } = await getSubscription(subscriptionId);
  if (error || !data) return null;
  const urls = data.data.attributes.urls;
  return urls?.customer_portal ?? urls?.update_payment_method ?? null;
}

/**
 * Verify a Lemon Squeezy webhook signature.
 * `rawBody` MUST be the exact bytes received (do not JSON.parse first).
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(digest, "hex");
  const b = Buffer.from(signatureHeader, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
