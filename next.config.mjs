import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Required on Next 14 to load instrumentation.ts (stable in Next 15).
    instrumentationHook: true,
  },
};

// withSentryConfig is a no-op for source-map upload unless SENTRY_AUTH_TOKEN is
// set; it still wires client/server/edge configs. Safe to ship without Sentry env.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  telemetry: false,
  // Don't fail the build if Sentry can't upload source maps.
  errorHandler: () => {},
});
