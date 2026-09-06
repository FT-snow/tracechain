"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { TraceResult, Hop } from "@/lib/data";
import { shortenAddress, riskColor, riskLabel } from "@/lib/utils";

export default function TracePage() {
  const params = useSearchParams();
  const router = useRouter();
  const autoRan = useRef(false);
  const [input, setInput] = useState("");
  const [tracing, setTracing] = useState(false);
  const [trace, setTrace] = useState<TraceResult | null>(null);
  const [buildingHops, setBuildingHops] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const startTrace = async (override?: string) => {
    const targetAddr = (override ?? input).trim();
    if (!targetAddr) return;
    setTracing(true);
    setTrace(null);
    setBuildingHops(0);
    setError(null);
    setSource(null);

    try {
      const res = await fetch("/api/trace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY
            ? { "x-api-key": process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY }
            : {}),
        },
        body: JSON.stringify({ address: targetAddr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Trace failed");

      setSource(data.source === "live" ? "live" : "simulated");

      const hops: Hop[] = data.hops.map((h: Hop, i: number) => {
        const isLast = i === data.hops.length - 1;
        let type: Hop["type"] = "wallet";
        if (i === 0) type = "victim";
        else if (isLast && data.exchangeMatch) type = "exchange";
        if (data.mixerContact && i === 1) type = "mixer";
        return {
          ...h,
          type,
          label: isLast && data.exchangeMatch ? data.exchangeMatch.name : undefined,
        };
      });

      const result: TraceResult = {
        id: crypto.randomUUID(),
        victimAddress: data.address,
        status: "complete",
        hops,
        exchangeMatch: data.exchangeMatch
          ? {
              ...data.exchangeMatch,
              confidence: Math.round(data.exchangeMatch.confidence * 100),
            }
          : undefined,
        riskScore: data.riskScore,
        bridgeDetected: data.mixerContact === true && data.riskScore > 80,
        startedAt: data.generatedAt,
        riskBreakdown: {
          hopCount: data.riskBreakdown.hopCount,
          mixerContact: data.mixerContact,
          velocity: Math.round(data.riskBreakdown.velocity * 100),
          exchangeConfidence: Math.round(
            (data.riskBreakdown.exchangeConfidence ?? 0) * 100
          ),
          socialProof: 0,
        },
      };

      setTrace(result);
      for (let i = 1; i <= hops.length; i++) {
        await new Promise((r) => setTimeout(r, 700));
        setBuildingHops(i);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Trace failed");
    } finally {
      setTracing(false);
    }
  };

  useEffect(() => {
    if (!trace) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    const q = params.get("address");
    if (q && !autoRan.current) {
      autoRan.current = true;
      setInput(q);
      startTrace(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Trace Wallet
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Submit a suspect wallet address. Get a real-time trace in seconds.
        </p>
        {source && (
          <span className="mono mt-2 inline-block text-[10px] uppercase tracking-[0.16em] text-text-muted">
            source: {source}
            {source === "live" ? " · blockchain apis" : " · sandbox engine"}
          </span>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste wallet address (e.g. 0x7a25...)"
            className="input w-full font-mono text-sm"
            onKeyDown={(e) => e.key === "Enter" && startTrace()}
          />
        </div>
        <button
          onClick={() => startTrace()}
          disabled={tracing}
          className="btn-primary flex items-center gap-2"
        >
          {tracing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg border-t-transparent" />
              Tracing…
            </span>
          ) : (
            <>
              Trace Now
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-sm border border-risk-hi/40 bg-risk-hi/5 px-4 py-3">
          <span className="text-sm text-risk-hi">{error}</span>
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {trace && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Risk Score Bar */}
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-sm border font-mono text-xl font-bold"
                    style={{
                      borderColor: riskColor(trace.riskScore),
                      color: riskColor(trace.riskScore),
                      background: `${riskColor(trace.riskScore)}10`,
                    }}
                  >
                    {trace.riskScore}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      Risk Score
                    </div>
                    <div
                      className="mono text-xs font-semibold"
                      style={{ color: riskColor(trace.riskScore) }}
                    >
                      {riskLabel(trace.riskScore)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="mono text-lg font-bold text-text-primary">
                      {trace.hops.length}
                    </div>
                    <div className="mono text-[10px] uppercase tracking-wider text-text-muted">
                      hops
                    </div>
                  </div>
                  <div>
                    <div className="mono text-lg font-bold text-risk-hi">
                      {trace.riskBreakdown.mixerContact ? "YES" : "NO"}
                    </div>
                    <div className="mono text-[10px] uppercase tracking-wider text-text-muted">
                      mixer contact
                    </div>
                  </div>
                  <div>
                    <div className="mono text-lg font-bold text-risk-low">
                      {trace.exchangeMatch?.confidence ?? 0}%
                    </div>
                    <div className="mono text-[10px] uppercase tracking-wider text-text-muted">
                      exchange confidence
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Match */}
            {trace.exchangeMatch && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-sm border border-risk-hi/30 bg-risk-hi/5 p-5"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-sm font-semibold text-risk-hi">
                      Exchange Detected — {trace.exchangeMatch.name}
                    </div>
                    <div className="mono mt-1 text-xs text-text-secondary">
                      Deposit: {shortenAddress(trace.exchangeMatch.depositAddress, 8, 6)}{" "}
                      · Confidence: {trace.exchangeMatch.confidence}%
                      {trace.exchangeMatch.accountHint && (
                        <> · {trace.exchangeMatch.accountHint}</>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Hop Timeline */}
            <div className="card p-5">
              <h3 className="mb-4 text-sm font-semibold text-text-primary">
                Transaction Timeline
              </h3>
              <div className="space-y-0">
                {trace.hops.slice(0, buildingHops).map((h, i) => (
                  <HopCard key={i} hop={h} isFirst={i === 0} />
                ))}
              </div>
              {trace.hops.length > buildingHops && (
                <div className="flex items-center gap-2 border-t border-border pt-3 text-text-muted">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-surface-3" />
                  <span className="mono text-xs">tracing next hop…</span>
                </div>
              )}
            </div>

            {/* Risk Breakdown */}
            <div className="card p-5">
              <h3 className="mb-4 text-sm font-semibold text-text-primary">
                Explainability Panel
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  {
                    label: "Hop Count",
                    value: trace.riskBreakdown.hopCount,
                    max: 10,
                    weight: 25,
                  },
                  {
                    label: "Mixer Contact",
                    value: trace.riskBreakdown.mixerContact ? 1 : 0,
                    max: 1,
                    weight: 30,
                  },
                  {
                    label: "Velocity",
                    value: trace.riskBreakdown.velocity,
                    max: 100,
                    weight: 20,
                  },
                  {
                    label: "Exchange Match",
                    value: trace.riskBreakdown.exchangeConfidence,
                    max: 100,
                    weight: 12,
                  },
                ].map((item) => {
                  const pct = (item.value / item.max) * 100;
                  return (
                    <div key={item.label}>
                      <div className="mono text-[10px] uppercase tracking-wider text-text-muted">
                        {item.label}
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${pct}%`,
                            background: riskColor(pct * 1.2),
                          }}
                        />
                      </div>
                      <div className="mono mt-1.5 text-xs font-medium text-text-secondary">
                        {item.value} / {item.max}{" "}
                        <span className="text-text-muted">(+{item.weight}pts)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  router.push(`/reports?address=${encodeURIComponent(trace.victimAddress)}`)
                }
                className="btn-primary"
              >
                Generate Report
              </button>
              <button
                onClick={() => router.push(`/watch?address=${encodeURIComponent(trace.victimAddress)}`)}
                className="btn-ghost"
              >
                Enable Live Watch
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trace.victimAddress);
                  setCopied(true);
                }}
                className="btn-ghost"
              >
                {copied ? "Copied" : "Copy Address"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!trace && !tracing && (
        <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border py-20">
          <p className="text-sm text-text-secondary">
            Paste a wallet address above to begin tracing
          </p>
          <p className="mono mt-1 text-[10px] uppercase tracking-[0.18em] text-text-muted">
            btc · eth · bsc · usdt-trc20
          </p>
        </div>
      )}
    </div>
  );
}

function HopCard({ hop, isFirst }: { hop: Hop; isFirst: boolean }) {
  const colors: Record<string, string> = {
    wallet: "var(--text-secondary)",
    mixer: "var(--risk-med)",
    exchange: "var(--risk-hi)",
    victim: "var(--text-primary)",
  };
  const color = colors[hop.type] ?? "var(--text-secondary)";

  return (
    <div className="flex items-start gap-4 border-l-2 py-3" style={{ borderColor: color }}>
      <div className="ml-4 flex-1">
        <div className="flex items-center gap-2">
          <span className="mono text-xs font-medium text-text-primary">
            Hop {hop.hopNumber}
          </span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
            style={{ color: "#000", background: color }}
          >
            {hop.type}
          </span>
          {hop.label && (
            <span className="text-xs text-text-muted">{hop.label}</span>
          )}
        </div>
        <div className="mono mt-1 text-xs text-text-secondary">
          {shortenAddress(hop.from)} → {shortenAddress(hop.to)} ·{" "}
          {hop.amount} {hop.chain.toUpperCase()}
        </div>
        <div className="mono mt-0.5 text-[10px] text-text-muted">
          tx: {shortenAddress(hop.txHash, 10, 6)}
        </div>
      </div>
    </div>
  );
}
