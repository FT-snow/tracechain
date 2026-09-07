"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthActions } from "@convex-dev/auth/react";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn("password", {
        flow: mode,
        email,
        password,
        redirectTo: "/dashboard",
      });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message.split("Uncaught Error: ")[1] ?? err.message : "Failed"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-text-primary">
          TraceChain
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          {mode === "signIn"
            ? "Officer access. Sign in to continue."
            : "Create an officer account."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="mono text-xs uppercase tracking-wider text-text-muted">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input mt-2 w-full font-mono text-sm"
              placeholder="officer@cybercrime.gov.in"
            />
          </div>
          <div>
            <label className="mono text-xs uppercase tracking-wider text-text-muted">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="input mt-2 w-full font-mono text-sm"
              placeholder="min 8 characters"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-risk-hi/40 bg-risk-hi/5 px-4 py-3">
              <span className="text-sm text-risk-hi">{error}</span>
            </div>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3">
            {busy ? "Working…" : mode === "signIn" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
          className="mono mt-6 text-xs text-text-muted transition-colors hover:text-text-primary"
        >
          {mode === "signIn"
            ? "no account? create one"
            : "have an account? sign in"}
        </button>
      </motion.div>
    </div>
  );
}
