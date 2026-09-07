"use client";

import { useState } from "react";
import { TraceResult } from "@/lib/data";
import { shortenAddress } from "@/lib/utils";

interface Report {
  id: string;
  address: string;
  content: string;
  createdAt: number;
}

export default function ReportsPage() {
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const generate = async () => {
    const address = input.trim();
    if (address.length < 20) {
      setError("Enter a valid wallet address");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const traceRes = await fetch("/api/trace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY
            ? { "x-api-key": process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY }
            : {}),
        },
        body: JSON.stringify({ address }),
      });
      const trace: TraceResult = await traceRes.json();
      if (!traceRes.ok)
        throw new Error(
          (trace as unknown as { error?: string }).error || "Trace failed"
        );

      const reportRes = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY
            ? { "x-api-key": process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY }
            : {}),
        },
        body: JSON.stringify(trace),
      });
      const report = await reportRes.json();
      if (!reportRes.ok) throw new Error(report.error || "Report failed");

      const entry: Report = {
        id: crypto.randomUUID(),
        address,
        content: report.report ?? String(report),
        createdAt: Date.now(),
      };
      setReports([entry, ...reports]);
      setOpenId(entry.id);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Report generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] leading-tight font-bold tracking-tight text-text-primary">
          Reports
        </h1>
        <p className="mt-1 text-base text-text-secondary">
          Court-ready investigation reports generated from a live trace.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Wallet address to report on"
          className="input flex-1 font-mono text-sm"
        />
        <button onClick={generate} disabled={generating} className="btn-primary">
          {generating ? "Generating…" : "Generate Report"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-risk-hi/40 bg-risk-hi/5 px-4 py-3">
          <span className="text-sm text-risk-hi">{error}</span>
        </div>
      )}

      {reports.length === 0 && !generating && (
        <div className="rounded-lg border border-dashed border-border py-20 text-center">
          <p className="text-sm text-text-secondary">
            Paste an address and generate the first report
          </p>
        </div>
      )}

      <div className="space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="card">
            <button
              onClick={() => setOpenId(openId === r.id ? null : r.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div>
                <div className="font-mono text-sm text-text-primary">
                  {shortenAddress(r.address, 10, 6)}
                </div>
                <div className="mono mt-0.5 text-[13px] text-text-muted">
                  {new Date(r.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                </div>
              </div>
              <span className="mono text-xs text-text-secondary">
                {openId === r.id ? "hide" : "open"}
              </span>
            </button>
            {openId === r.id && (
              <div className="border-t border-border px-5 py-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text-secondary">
                  {r.content}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
