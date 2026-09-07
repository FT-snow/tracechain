"use client";

import { useEffect, useState } from "react";

const CHAINS = ["BTC", "ETH", "BSC", "TRX"];

export default function SettingsPage() {
  const [apiBase, setApiBase] = useState("");
  const [pollInterval, setPollInterval] = useState("60");
  const [chains, setChains] = useState<Record<string, boolean>>({
    BTC: true,
    ETH: true,
    BSC: true,
    TRX: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiBase(localStorage.getItem("tracechain_api_base") || "http://localhost:3000");
    setPollInterval(localStorage.getItem("tracechain_poll") || "60");
    const raw = localStorage.getItem("tracechain_chains");
    if (raw) setChains(JSON.parse(raw));
  }, []);

  const save = () => {
    localStorage.setItem("tracechain_api_base", apiBase);
    localStorage.setItem("tracechain_poll", pollInterval);
    localStorage.setItem("tracechain_chains", JSON.stringify(chains));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[32px] leading-tight font-bold tracking-tight text-text-primary">
          Settings
        </h1>
        <p className="mt-1 text-base text-text-secondary">
          Stored locally on this workstation.
        </p>
      </div>

      <div className="card p-5">
        <div className="space-y-5">
          <div>
            <label className="mono text-xs uppercase tracking-wider text-text-muted">
              API base url
            </label>
            <input
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              className="input mt-2 w-full font-mono text-sm"
            />
          </div>

          <div>
            <label className="mono text-xs uppercase tracking-wider text-text-muted">
              Watch poll interval (seconds)
            </label>
            <input
              value={pollInterval}
              onChange={(e) => setPollInterval(e.target.value)}
              className="input mt-2 w-full font-mono text-sm"
            />
          </div>

          <div>
            <label className="mono text-xs uppercase tracking-wider text-text-muted">
              Enabled chains
            </label>
            <div className="mt-2 flex gap-2">
              {CHAINS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChains({ ...chains, [c]: !chains[c] })}
                  className={`rounded-lg border px-4 py-2 font-mono text-xs transition-colors ${
                    chains[c]
                      ? "border-border bg-surface-3 text-text-primary"
                      : "border-border bg-transparent text-text-muted"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
          <button onClick={save} className="btn-primary">
            Save
          </button>
          {saved && (
            <span className="mono text-xs text-risk-low">saved</span>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border p-5">
        <div className="mono text-xs uppercase tracking-wider text-text-muted">
          cli access
        </div>
        <pre className="mono mt-2 text-[13px] text-text-secondary">
{`bun cli/tracechain.js trace <address>
TRACECHAIN_URL=${apiBase || "http://localhost:3000"} bun cli/tracechain.js trace <address> --json`}
        </pre>
      </div>
    </div>
  );
}
