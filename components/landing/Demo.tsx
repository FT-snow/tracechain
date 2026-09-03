"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Reveal from "./Reveal";

function CountUp({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="mono">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const productStats = [
  { label: "time to exchange ID", value: 60, suffix: "", decimals: 0, prefix: "<", time: "1min" },
  { label: "triage verdict", value: 30, suffix: "s", decimals: 0, time: "30s" },
  { label: "chains covered", value: 4, suffix: "", decimals: 0, time: "4" },
  { label: "watch coverage", value: 24, suffix: "/7", decimals: 0, time: "24/7" },
];

export default function Demo() {
  return (
    <section id="product" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <Reveal className="mb-14 max-w-2xl">
          <span className="mono text-[11px] uppercase tracking-[0.22em] text-info">
            See it live
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            An infinite trace, in real time.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            Watch a wallet resolve to an exchange, node by node — and keep
            watching after. This is the product demo of the fund-flow graph.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Preview frame */}
          <Reveal className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-risk-hi/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-risk-med/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-risk-low/70" />
                <span className="mono ml-3 text-[10px] uppercase tracking-[0.15em] text-text-muted">
                  live trace · 0x7a2…488D
                </span>
              </div>
              <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-bg">
                <div className="mono pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-[11px] uppercase tracking-[0.25em] text-text-muted">
                    animated fund-flow graph
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-4">
                    <span className="h-3 w-3 rounded-full bg-trace shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                    <span className="h-3 w-3 rounded-full bg-info shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <span className="h-3 w-3 rounded-full bg-risk-med shadow-[0_0_10px_rgba(255,149,0,0.8)]" />
                    <span className="h-4 w-4 animate-pulse rounded-full bg-risk-hi shadow-[0_0_14px_rgba(255,59,59,0.9)]" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Stat strip */}
          <div className="flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
            {productStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col justify-center gap-1 bg-bg px-7 py-6"
              >
                <div className="mono text-3xl font-bold text-text-primary md:text-4xl">
                  {s.prefix}
                  <CountUp
                    value={s.value}
                    suffix={s.suffix}
                    decimals={s.decimals}
                  />
                </div>
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
