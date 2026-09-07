"use client";

import { useEffect, useState } from "react";

interface DatasetEntry {
  address: string;
  chain: string;
  name: string;
  walletType: string;
}

interface DatasetInfo {
  version: number;
  sha256: string;
  count: number;
  chains: string[];
  entries: DatasetEntry[];
}

export default function ProvenancePage() {
  const [data, setData] = useState<DatasetInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dataset", {
      headers: process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY
        ? { "x-api-key": process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY }
        : {},
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Dataset unavailable"))))
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Provenance
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          The exchange dataset every report cites. Exact-address matching means
          no heuristics — and this page is the receipts.
        </p>
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
              { label: "dataset version", v: `v${data.version}` },
              { label: "entries", v: data.count },
              { label: "chains", v: data.chains.join(" · ") },
              { label: "integrity", v: "sha-256 bound" },
            ].map((s) => (
              <div key={s.label} className="bg-surface p-4">
                <div className="mono text-xl font-bold text-text-primary">{s.v}</div>
                <div className="mono mt-0.5 truncate text-[10px] uppercase tracking-wider text-text-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mono rounded-sm border border-border bg-surface px-4 py-2 text-[10px] text-text-muted">
            dataset sha256: {data.sha256}
          </div>

          <div className="card">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-text-primary">
                Registry ({data.count} entries)
              </h3>
            </div>
            <div className="divide-y divide-border font-mono text-xs">
              {data.entries.map((e) => (
                <div key={e.address + e.chain} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="w-56 shrink-0 text-text-primary">{e.name}</span>
                  <span className="w-12 shrink-0 uppercase text-text-muted">{e.chain}</span>
                  <span className="w-20 shrink-0 text-text-secondary">{e.walletType}</span>
                  <span className="truncate text-text-secondary">{e.address}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-text-muted">
            Sources: addresses published by the exchanges themselves
            (proof-of-reserve and status pages) plus public law-enforcement
            liaison channels. Every generated report records the dataset version
            and integrity hash it used, so matching is auditable per report.
          </p>
        </>
      )}

      {!data && !error && (
        <div className="rounded-sm border border-dashed border-border py-16 text-center">
          <p className="text-sm text-text-secondary">loading registry…</p>
        </div>
      )}
    </div>
  );
}
