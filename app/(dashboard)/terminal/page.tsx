"use client";

import { useEffect, useRef, useState } from "react";

interface Line {
  text: string;
  dim?: boolean;
}

const HELP = [
  "commands:",
  "  trace <address>            trace a wallet (BTC/ETH/BSC/TRX)",
  "  nft <eth-address>          nft transfer history (ethereum)",
  "  report <address>           generate court-ready report",
  "  status                     session + engine status",
  "  clear                      clear screen",
  "  help                       this text",
];

export default function TerminalPage() {
  const [lines, setLines] = useState<Line[]>([
    { text: "tracechain terminal — connected to local engine" },
    { text: "type help for commands", dim: true },
    { text: "" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [lines]);

  const push = (text: string, dim = false) =>
    setLines((l) => [...l, { text, dim }]);

  const headers = () => ({
    "Content-Type": "application/json",
    ...(process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY
      ? { "x-api-key": process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY }
      : {}),
  });

  const short = (a: string) =>
    !a ? "" : a.length > 16 ? a.slice(0, 10) + "…" + a.slice(-4) : a;

  const time = (t: number) =>
    new Date(t).toISOString().slice(0, 16).replace("T", " ");

  const runTrace = async (addr: string) => {
    push(`tracing ${addr} …`, true);
    const res = await fetch("/api/trace", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ address: addr }),
    });
    const d = await res.json();
    if (!res.ok) {
      push(`error: ${d.error || res.status}`);
      return;
    }
    push(
      `chain: ${d.chain}   risk: ${d.riskScore}/99   source: ${d.source}${
        d.stoppedOn && d.source === "live" ? `   stopped: ${d.stoppedOn}` : ""
      }`
    );
    if (d.exchangeMatch)
      push(
        `exchange: ${d.exchangeMatch.name} (${Math.round(
          d.exchangeMatch.confidence * 100
        )}%) deposit ${short(d.exchangeMatch.depositAddress)}`
      );
    push("");
    push(`HOP FROM→TO                    AMOUNT     CHAIN  TIME                 TX`);
    for (const h of d.hops) {
      push(
        `${h.hopNumber}   ${short(h.from)}→${short(h.to)}  ${String(h.amount).padEnd(10)} ${h.chain.padEnd(6)} ${time(h.timestamp)}   ${h.txHash.slice(0, 18)}…`
      );
    }
    push(`${d.hops.length} hops · source ${d.source}`);
  };

  const runNft = async (addr: string) => {
    push(`nft ${addr} …`, true);
    const res = await fetch("/api/nft", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ address: addr }),
    });
    const d = await res.json();
    if (!res.ok) {
      push(`error: ${d.error || res.status}`);
      return;
    }
    push(
      `received ${d.summary.received} · sent ${d.summary.sent} · flagged ${d.summary.flagged} · collections ${d.summary.collections}`
    );
    push("");
    for (const t of d.transfers.slice(0, 15)) {
      push(
        `${t.collection.slice(0, 24).padEnd(24)} #${String(t.tokenId).slice(0, 10).padEnd(10)} ${t.from.slice(0, 8)}…→${t.to.slice(0, 8)}…${t.toExchange ? ` [${t.toExchange}]` : ""}`
      );
    }
    push(`${d.transfers.length} transfers · source ${d.source}`);
  };

  const runStatus = async () => {
    push("engine status — probing …", true);
    const t0 = Date.now();
    const res = await fetch("/api/trace", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ address: "0x28C6c06298d514Db089934071355E5743bf21d60" }),
    });
    const d = await res.json();
    if (!res.ok) {
      push(`trace engine: FAIL (${d.error || res.status})`);
      return;
    }
    push(`trace engine: OK   source: ${d.source}   latency: ${Date.now() - t0}ms   probe: ${d.stoppedOn}`);
    const rn = await fetch("/api/nft", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" }),
    });
    push(`nft engine: ${rn.ok ? "OK" : "FAIL"}   source: blockscout`);
    push(`session: signed in · api key: ${process.env.NEXT_PUBLIC_TRACECHAIN_API_KEY ? "present" : "absent"}`);
  };

  const runReport = async (addr: string) => {
    push(`report ${addr} — tracing then writing …`, true);
    const res = await fetch("/api/trace", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ address: addr }),
    });
    const trace = await res.json();
    if (!res.ok) {
      push(`error: ${trace.error || res.status}`);
      return;
    }
    push(`trace done (${trace.source}, ${trace.hops.length} hops) · generating report …`, true);
    const rr = await fetch("/api/report", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(trace),
    });
    const rep = await rr.json();
    if (!rr.ok) {
      push(`error: ${rep.error || rr.status}`);
      return;
    }
    const content: string = rep.report ?? String(rep);
    content.split("\n").slice(0, 60).forEach((l) => push(l, !l.startsWith("#")));
    if (content.split("\n").length > 60) push("… (truncated at 60 lines)");
  };

  const submit = async () => {
    const cmd = input.trim();
    setInput("");
    if (!cmd) return;
    push(`$ ${cmd}`);
    const [base, ...rest] = cmd.split(/\s+/);

    if (base === "clear") {
      setLines([]);
      return;
    }
    if (base === "help" || base === "?") {
      HELP.forEach((h) => push(h, h.startsWith(" ")));
      push("");
      return;
    }
    setBusy(true);
    try {
      if (base === "trace" && rest[0]) await runTrace(rest[0]);
      else if (base === "nft" && rest[0]) await runNft(rest[0]);
      else if (base === "report" && rest[0]) await runReport(rest[0]);
      else if (base === "status") await runStatus();
      else push("unknown command — type help", true);
    } catch {
      push("error: request failed");
    } finally {
      setBusy(false);
      push("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Terminal
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Same engine as the CLI run from any WSL shell — mirrored in browser.
        </p>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-bg">
        <div className="border-b border-border bg-surface px-4 py-2">
          <span className="mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
            tracechain-shell — wsl session mirror
          </span>
        </div>
        <div
          ref={boxRef}
          onClick={() => inputRef.current?.focus()}
          className="mono h-[60vh] overflow-y-auto p-4 text-xs leading-relaxed"
        >
          {lines.map((l, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap ${l.dim ? "text-text-muted" : "text-text-primary"}`}
            >
              {l.text}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-text-muted">$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !busy) submit();
              }}
              disabled={busy}
              spellCheck={false}
              autoFocus
              className="flex-1 bg-transparent text-text-primary outline-none"
              placeholder={busy ? "working…" : ""}
            />
          </div>
        </div>
      </div>

      <p className="mono text-[10px] text-text-muted">
        try: trace 0x28C6c06298d514Db089934071355E5743bf21d60
      </p>
    </div>
  );
}
