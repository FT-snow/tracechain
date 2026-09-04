"use client";

import { useState, useEffect } from "react";
import { demoAlerts } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

interface Watched {
  address: string;
  chain: string;
  since: number;
}

function inferChain(address: string) {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "ETH";
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)) return "BTC";
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return "TRX";
  return "ETH";
}

export default function WatchPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [watched, setWatched] = useState<Watched[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("tracechain_watch");
    if (raw) setWatched(JSON.parse(raw));
  }, []);

  const persist = (list: Watched[]) => {
    setWatched(list);
    localStorage.setItem("tracechain_watch", JSON.stringify(list));
  };

  const add = () => {
    const addr = input.trim();
    if (addr.length < 20) {
      setError("Address too short");
      return;
    }
    if (watched.some((w) => w.address === addr)) {
      setError("Already watched");
      return;
    }
    setError(null);
    persist([...watched, { address: addr, chain: inferChain(addr), since: Date.now() }]);
    setInput("");
  };

  const remove = (address: string) =>
    persist(watched.filter((w) => w.address !== address));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Live Watch
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Registered wallets are polled continuously. Movement triggers alerts.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Paste wallet address to watch"
          className="input flex-1 font-mono text-sm"
        />
        <button onClick={add} className="btn-primary">
          Watch
        </button>
      </div>

      {error && (
        <div className="rounded-sm border border-risk-hi/40 bg-risk-hi/5 px-4 py-3">
          <span className="text-sm text-risk-hi">{error}</span>
        </div>
      )}

      <div className="card">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-text-primary">
            Watched Wallets
          </h3>
        </div>
        {watched.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-text-secondary">
            No wallets registered. Paste an address above.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {watched.map((w) => (
              <div
                key={w.address}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div>
                  <div className="font-mono text-sm text-text-primary">
                    {w.address}
                  </div>
                  <div className="mono mt-0.5 text-[10px] text-text-muted">
                    {w.chain} · since {new Date(w.since).toISOString().slice(0, 10)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="mono text-[10px] uppercase tracking-wider text-risk-low">
                    polling
                  </span>
                  <button
                    onClick={() => remove(w.address)}
                    className="mono text-xs text-text-muted transition-colors hover:text-risk-hi"
                  >
                    remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-text-primary">Alerts</h3>
        </div>
        <div className="divide-y divide-border">
          {demoAlerts.map((a) => (
            <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
              <div
                className="mt-1.5 h-2 w-2 shrink-0"
                style={{
                  background:
                    a.severity === "high" ? "var(--risk-hi)" : "var(--risk-med)",
                }}
              />
              <div className="flex-1">
                <div className="text-sm text-text-primary">{a.message}</div>
                <div className="mono mt-0.5 text-[10px] text-text-muted">
                  {timeAgo(a.time)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
