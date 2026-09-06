"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { demoAlerts } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

interface Watched {
  address: string;
  chain: string;
  since: number;
}

interface PollResult {
  risk: number | null;
  source: string;
  hops: number;
  exchange: string | null;
  lastChecked: number;
  failed?: boolean;
}

function inferChain(address: string) {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "ETH";
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)) return "BTC";
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return "TRX";
  return "ETH";
}

const POLL_MS = 60_000;

export default function WatchPage() {
  const params = useSearchParams();
  const autoAdded = useRef(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [watched, setWatched] = useState<Watched[]>([]);
  const [results, setResults] = useState<Record<string, PollResult>>({});
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef(false);

  useEffect(() => {
    const raw = localStorage.getItem("tracechain_watch");
    if (raw) setWatched(JSON.parse(raw));
    const rawR = localStorage.getItem("tracechain_watch_results");
    if (rawR) setResults(JSON.parse(rawR));
  }, []);

  const persist = (list: Watched[]) => {
    setWatched(list);
    localStorage.setItem("tracechain_watch", JSON.stringify(list));
  };

  const poll = useCallback(async (list: Watched[]) => {
    if (pollingRef.current || list.length === 0) return;
    pollingRef.current = true;
    setPolling(true);
    const next: Record<string, PollResult> = { ...results };
    for (const w of list) {
      try {
        const res = await fetch("/api/trace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY
              ? { "x-api-key": process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY }
              : {}),
          },
          body: JSON.stringify({ address: w.address }),
        });
        const d = await res.json();
        if (res.ok) {
          next[w.address] = {
            risk: d.riskScore ?? null,
            source: d.source === "live" ? "live" : "simulated",
            hops: (d.hops ?? []).length,
            exchange: d.exchangeMatch?.name ?? null,
            lastChecked: Date.now(),
          };
        } else {
          next[w.address] = {
            risk: null,
            source: "error",
            hops: 0,
            exchange: null,
            lastChecked: Date.now(),
            failed: true,
          };
        }
      } catch {
        next[w.address] = {
          risk: null,
          source: "error",
          hops: 0,
          exchange: null,
          lastChecked: Date.now(),
          failed: true,
        };
      }
    }
    setResults(next);
    localStorage.setItem("tracechain_watch_results", JSON.stringify(next));
    pollingRef.current = false;
    setPolling(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    poll(watched);
    const t = setInterval(() => poll(watched), POLL_MS);
    return () => clearInterval(t);
  }, [watched, poll]);

  const add = (override?: string) => {
    const addr = (override ?? input).trim();
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

  useEffect(() => {
    const q = params.get("address");
    if (!q || autoAdded.current) return;
    autoAdded.current = true;
    const current: Watched[] = JSON.parse(
      localStorage.getItem("tracechain_watch") || "[]"
    );
    if (!current.some((w) => w.address === q)) {
      const next = [...current, { address: q, chain: inferChain(q), since: Date.now() }];
      setWatched(next);
      localStorage.setItem("tracechain_watch", JSON.stringify(next));
    }
  }, [params]);

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
        <button onClick={() => add()} className="btn-primary">
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
                  {(() => {
                    const r = results[w.address];
                    if (!r) {
                      return (
                        <span className="mono text-[10px] uppercase tracking-wider text-text-muted">
                          queued
                        </span>
                      );
                    }
                    if (r.failed) {
                      return (
                        <span className="mono text-[10px] uppercase tracking-wider text-risk-hi">
                          check failed
                        </span>
                      );
                    }
                    return (
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="mono text-xs font-bold text-text-primary">
                            {r.risk}/99
                          </div>
                          <div className="mono text-[9px] text-text-muted">
                            {r.source} · {r.hops} hops
                          </div>
                        </div>
                        <span className="mono text-[9px] text-text-muted">
                          {timeAgo(r.lastChecked)}
                        </span>
                      </div>
                    );
                  })()}
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
