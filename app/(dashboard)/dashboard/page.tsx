"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import CountUp from "@/components/ui/CountUp";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { demoAlerts } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

const stats: { label: string; to: number; suffix?: string }[] = [
  { label: "Active Traces", to: 12 },
  { label: "Exchanges Found", to: 8 },
  { label: "Alerts Today", to: 3 },
  { label: "Avg Trace Time", to: 47, suffix: "s" },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function DashboardHome() {
  const router = useRouter();
  const [quick, setQuick] = useState("");

  const goTrace = () => {
    const a = quick.trim();
    if (a) router.push(`/trace?address=${encodeURIComponent(a)}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] leading-tight font-bold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="mt-1 text-base text-text-secondary">
          TraceChain system overview
        </p>
      </div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-5 lg:grid-cols-4"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            className="card p-5"
          >
            <div className="text-4xl font-bold tabular-nums text-[#9882B9]">
              <span className="sr-only">
                {s.to}
                {s.suffix === "s" ? " seconds" : ""} {s.label.toLowerCase()}
              </span>
              <span aria-hidden="true">
                <CountUp to={s.to} suffix={s.suffix} duration={1} />
              </span>
            </div>
            <div
              className="mono mt-1 text-xs uppercase tracking-[0.16em] text-text-muted"
              aria-hidden="true"
            >
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-lg font-semibold text-text-primary">Recent Alerts</h3>
            <Link href="/watch" className="mono text-xs uppercase tracking-wider text-text-secondary hover:text-text-primary">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {demoAlerts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                <div
                  className="mt-0.5 h-2 w-2 shrink-0"
                  style={{
                    background:
                      a.severity === "high"
                        ? "var(--risk-hi)"
                        : "var(--risk-med)",
                  }}
                />
                <div className="flex-1">
                  <div className="text-sm text-text-primary">{a.message}</div>
                  <div className="mono mt-0.5 text-[13px] text-text-muted">
                    {timeAgo(a.time)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Trace */}
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">Quick Trace</h3>
          <p className="mb-5 text-sm text-text-secondary">
            Paste a wallet address to begin an immediate trace.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goTrace()}
              placeholder="0x…"
              className="input flex-1 font-mono text-sm"
            />
            <button onClick={goTrace} className="btn-primary text-sm">
              Go
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {["BTC", "ETH", "BSC", "TRX"].map((chain) => (
              <div
                key={chain}
                  className="rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                <span className="mono text-xs font-medium text-text-secondary">
                  {chain}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
