"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Catches errors in the root layout itself. Must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f0fdfa",
          color: "#134e4a",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.5rem", color: "#4b5563" }}>
          A critical error occurred.{error.digest ? ` Reference: ${error.digest}` : ""}
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            cursor: "pointer",
            background: "#0d9488",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.6rem 1.2rem",
            fontSize: "1rem",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
