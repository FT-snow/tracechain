"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ReactNode } from "react";

const RAW_URL = process.env.NEXT_PUBLIC_CONVEX_URL as string | undefined;

// Tolerate accidental quotes / whitespace in the env value
const CONVEX_URL = RAW_URL?.trim().replace(/^["']|["']$/g, "") ?? "";

const convex = CONVEX_URL
  ? new ConvexReactClient(CONVEX_URL)
  : null;

export function Providers({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <MissingConvexNotice />
    );
  }
  return (
    <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>
  );
}

function MissingConvexNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold leading-none tracking-tight text-risk-hi">
          Config
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
          NEXT_PUBLIC_CONVEX_URL is missing on this deployment. Convex Auth
          cannot start without it.
        </p>
        <pre className="mono mt-4 overflow-x-auto text-xs text-text-muted">
{`Vercel → Settings → Environment Variables
NEXT_PUBLIC_CONVEX_URL = https://your-deployment.convex.cloud
(check Production + Preview, then Redeploy)`}
        </pre>
      </div>
    </div>
  );
}
