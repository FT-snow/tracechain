"use client";

import { useState } from "react";

interface NftTransfer {
  collection: string;
  symbol: string;
  tokenId: string;
  standard: string;
  from: string;
  to: string;
  txHash: string;
  timestamp: number;
  toExchange: string | null;
}

interface NftResponse {
  address: string;
  source: string;
  transfers: NftTransfer[];
  summary: { received: number; sent: number; flagged: number; collections: number };
}

const short = (a: string) =>
  !a ? "" : a.length > 13 ? a.slice(0, 7) + "…" + a.slice(-4) : a;

export default function NftPage() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<NftResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async () => {
    const address = input.trim();
    if (address.length < 20) {
      setError("Enter an Ethereum address");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY
            ? { "x-api-key": process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY }
            : {}),
        },
        body: JSON.stringify({ address }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Lookup failed");
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] leading-tight font-bold tracking-tight text-text-primary">
          NFTs
        </h1>
        <p className="mt-1 text-base text-text-secondary">
          ERC-721 and ERC-1155 transfers for any Ethereum address. NFTs landing
          on exchange wallets are flagged.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="Ethereum address (0x…)"
          className="input flex-1 font-mono text-sm"
        />
        <button onClick={lookup} disabled={loading} className="btn-primary">
          {loading ? "Loading…" : "Trace NFTs"}
        </button>
      </div>

      {error && (
        <div className="rounded-sm border border-risk-hi/40 bg-risk-hi/5 px-4 py-3">
          <span className="text-sm text-risk-hi">{error}</span>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-4">
            {[
              { label: "received", v: data.summary.received },
              { label: "sent", v: data.summary.sent },
              { label: "flagged", v: data.summary.flagged },
              { label: "collections", v: data.summary.collections },
            ].map((s) => (
              <div key={s.label} className="bg-surface p-4">
                <div className="mono text-xl font-bold text-text-primary">{s.v}</div>
                <div className="mono mt-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <span className="mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
            source: {data.source} · blockscout
          </span>

          <div className="card">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-text-primary">
                Transfers
              </h3>
            </div>
            <div className="divide-y divide-border font-mono text-xs">
              {data.transfers.slice(0, 50).map((t, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="w-40 shrink-0 truncate text-text-primary">
                    {t.collection}
                  </span>
                  <span className="w-24 shrink-0 truncate text-text-muted">
                    #{t.tokenId}
                  </span>
                  <span className="w-16 shrink-0 text-text-muted">
                    {t.standard}
                  </span>
                  <span className="w-28 shrink-0 text-text-secondary">
                    {short(t.from)}
                  </span>
                  <span
                    className={`w-28 shrink-0 ${
                      t.toExchange ? "text-risk-hi" : "text-text-secondary"
                    }`}
                  >
                    {short(t.to)}
                    {t.toExchange ? ` → ${t.toExchange}` : ""}
                  </span>
                  <span className="truncate text-text-muted">{t.txHash.slice(0, 18)}…</span>
                </div>
              ))}
              {data.transfers.length > 50 && (
                <div className="px-5 py-3 text-center text-text-muted">
                  + {data.transfers.length - 50} more
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <div className="rounded-sm border border-dashed border-border py-20 text-center">
          <p className="text-sm text-text-secondary">
            Paste an Ethereum address to trace NFT movement
          </p>
        </div>
      )}
    </div>
  );
}
