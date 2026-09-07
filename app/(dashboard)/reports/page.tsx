"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { TraceResult } from "@/lib/data";
import { shortenAddress } from "@/lib/utils";

interface Report {
  id: string;
  address: string;
  content: string;
  createdAt: number;
  sha256Hash: string;
  contentHash: string;
  prevHash: string;
  datasetVersion: number;
  datasetSha: string;
  verify?: { verdict: string; detail: string; verifiedAt: number };
}

const CHAIN_KEY = "tracechain_reports_chain";

export default function ReportsPage() {
  const params = useSearchParams();
  const autoRan = useRef(false);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("tracechain_reports");
    if (raw) setReports(JSON.parse(raw));
  }, []);

  const store = (list: Report[]) => {
    setReports(list);
    localStorage.setItem("tracechain_reports", JSON.stringify(list));
  };

  const headers = () => ({
    "Content-Type": "application/json",
    ...(process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY
      ? { "x-api-key": process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY }
      : {}),
  });

  const readChain = (): string[] => {
    try {
      const raw = localStorage.getItem(CHAIN_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  };

  const lastHash = () => {
    const chain = readChain();
    return chain.length ? chain[chain.length - 1] : "";
  };

  const generate = async (override?: string) => {
    const address = (override ?? input).trim();
    if (address.length < 20) {
      setError("Enter a valid wallet address");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const traceRes = await fetch("/api/trace", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ address }),
      });
      const trace: TraceResult = await traceRes.json();
      if (!traceRes.ok)
        throw new Error(
          (trace as unknown as { error?: string }).error || "Trace failed"
        );

      const reportRes = await fetch("/api/report", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ ...trace, prevHash: lastHash() }),
      });
      const rep = await reportRes.json();
      if (!reportRes.ok) throw new Error(rep.error || "Report failed");

      const entry: Report = {
        id: crypto.randomUUID(),
        address,
        content: rep.report ?? String(rep),
        createdAt: Date.now(),
        sha256Hash: rep.sha256Hash ?? "",
        contentHash: rep.contentHash ?? rep.sha256Hash ?? "",
        prevHash: rep.prevHash ?? "",
        datasetVersion: rep.datasetVersion ?? 0,
        datasetSha: rep.datasetSha ?? "",
      };

      const chain = readChain();
      chain.push(entry.contentHash);
      localStorage.setItem(CHAIN_KEY, JSON.stringify(chain));

      const list = [entry, ...reports];
      store(list);
      setOpenId(entry.id);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Report generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const reverify = async (r: Report) => {
    setVerifying(r.id);
    try {
      const traceRes = await fetch("/api/trace", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ address: r.address }),
      });
      const trace: TraceResult = await traceRes.json();
      if (!traceRes.ok) throw new Error("Re-trace failed");

      const trailing = "";
      const reportRes = await fetch("/api/report", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ ...trace, prevHash: r.prevHash }),
      });
      const rep = await reportRes.json();
      if (!reportRes.ok) throw new Error(rep.error || "Re-verify failed");

      const same = rep.contentHash === r.contentHash;
      const verdict = same ? "REPRODUCED" : "CHANGED";
      const detail = same
        ? "content hash identical — case facts and report text re-derived exactly"
        : `hash differs — underlying chain state moved between runs${
            (trace as unknown as { source?: string }).source === "live"
              ? " (live ledger)"
              : ""
          }. First divergence in payload: hops ${
            trace.hops.length !== r.content.split("Hop ").length - 1 ? "count" : "detail"
          }`;

      const updated = reports.map((x) =>
        x.id === r.id
          ? { ...x, verify: { verdict, detail, verifiedAt: Date.now() } }
          : x
      );
      store(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Re-verify failed");
    } finally {
      setVerifying(null);
    }
  };

  const exportPdf = (r: Report) => {
    const w = window.open("", "_blank");
    if (!w) return;
    const body = r.content.replace(
      /&/g, "&amp;"
    ).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    w.document.write(`<!doctype html><html><head><title>TraceChain Report ${shortenAddress(r.address, 8, 6)}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #111; margin: 3rem auto; max-width: 46rem; line-height: 1.55; }
  pre { white-space: pre-wrap; font-family: inherit; }
  .meta { font-family: 'Courier New', monospace; font-size: 11px; background: #f4f4f4; border: 1px solid #ddd; padding: 0.75rem 1rem; margin: 1.5rem 0; }
  h1,h2,h3 { page-break-after: avoid; }
  footer { margin-top: 2rem; border-top: 1px solid #ccc; padding-top: 0.75rem; font-size: 11px; color: #555; font-family: 'Courier New', monospace; }
</style></head><body>
<pre>${body}</pre>
<footer>
SHA-256 (content): ${r.contentHash || r.sha256Hash}<br/>
previous-link: ${r.prevHash || "genesis"}<br/>
dataset: v${r.datasetVersion} · sha ${r.datasetSha}<br/>
generated: ${new Date(r.createdAt).toISOString()} · verify: ${r.verify ? r.verify.verdict : "not re-verified"}
</footer>
<script>setTimeout(() => window.print(), 400);</script>
</body></html>`);
    w.document.close?.();
  };

  const chainLen = (() => {
    const chain = readChain();
    return chain.length;
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Reports
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Court-ready investigation reports with SHA-256 content binding and a
          local hash chain. Reports on file: {reports.length}
          {chainLen ? ` · chain length: ${chainLen}` : ""}
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
        <button onClick={() => generate()} disabled={generating} className="btn-primary">
          {generating ? "Generating…" : "Generate Report"}
        </button>
      </div>

      {error && (
        <div className="rounded-sm border border-risk-hi/40 bg-risk-hi/5 px-4 py-3">
          <span className="text-sm text-risk-hi">{error}</span>
        </div>
      )}

      {reports.length === 0 && !generating && (
        <div className="rounded-sm border border-dashed border-border py-20 text-center">
          <p className="text-sm text-text-secondary">
            Paste an address and generate the first report
          </p>
        </div>
      )}

      <div className="space-y-3">
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
                <div className="mono mt-0.5 text-[10px] text-text-muted">
                  {new Date(r.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                </div>
              </div>
              <span className="mono text-xs text-text-secondary">
                {openId === r.id ? "hide" : "open"}
              </span>
            </button>
            {openId === r.id && (
              <div className="space-y-4 border-t border-border px-5 py-4">
                <div className="mono rounded-sm border border-border bg-surface-2 px-4 py-2 text-[10px] leading-relaxed text-text-muted">
                  content-hash: {r.contentHash || r.sha256Hash}
                  <br />
                  prev-link: {r.prevHash || "genesis"} · dataset v{r.datasetVersion} · sha {r.datasetSha}
                  {r.verify && (
                    <>
                      <br />
                      re-verify [{new Date(r.verify.verifiedAt).toISOString().slice(0, 16)}]:{" "}
                      <span className={r.verify.verdict === "REPRODUCED" ? "text-risk-low" : "text-risk-med"}>
                        {r.verify.verdict}
                      </span>{" "}
                      — {r.verify.detail}
                    </>
                  )}
                </div>

                <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text-secondary">
                  {r.content}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  <button onClick={() => exportPdf(r)} className="btn-primary text-xs">
                    Export PDF
                  </button>
                  <button
                    onClick={() => reverify(r)}
                    disabled={verifying === r.id}
                    className="btn-ghost text-xs"
                  >
                    {verifying === r.id ? "Re-verifying…" : "Re-verify"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
