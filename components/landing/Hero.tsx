"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Zap, Activity, Radio } from "lucide-react";
import dynamic from "next/dynamic";

const SplineScene = dynamic(() => import("./SplineScene"), {
  ssr: false,
  loading: () => null,
});

const stats = [
  { icon: Zap, label: "30s triage", value: "30s" },
  { icon: Activity, label: "4 chains", value: "4" },
  { icon: Radio, label: "live watch", value: "24/7" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen pt-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* LEFT */}
        <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-center px-5 py-20 md:px-8 lg:border-r lg:border-border">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.div variants={item} className="mb-8">
              <span className="mono inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-trace shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
                SIH26183 · Ministry of Home Affairs
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-5xl md:text-6xl"
            >
              Trace every
              <br />
              <span className="text-trace">wallet.</span> Before
              <br />
              they cash out.
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-md text-base leading-relaxed text-text-secondary md:text-lg"
            >
              Real-time identification of fraud-linked crypto exchanges from
              victim-reported wallet addresses — through automated blockchain
              analytics. Submit an address, get a court-ready trace in
              minutes, not days.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#cta"
                className="group inline-flex items-center gap-2 rounded-md bg-text-primary px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-text-secondary"
              >
                Trace a wallet in 30s
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#product"
                className="mono group inline-flex items-center gap-1.5 rounded-md border border-border px-5 py-3 text-sm text-text-secondary transition-colors hover:border-trace/50 hover:text-text-primary"
              >
                View the trace
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </motion.div>

            <motion.div variants={item} className="mt-10 flex divide-x divide-border">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1 pr-8 first:pl-0 [&+div]:pl-8">
                  <div className="flex items-center gap-1.5">
                    <s.icon className="h-3.5 w-3.5 text-trace" />
                    <span className="mono text-lg font-semibold text-text-primary">
                      {s.value}
                    </span>
                  </div>
                  <span className="mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT — Spline, strict right half */}
        <div className="relative hidden h-[calc(100vh-4rem)] lg:block">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 60% 50%, rgba(168,85,247,0.18) 0%, transparent 100%), radial-gradient(40% 40% at 40% 80%, rgba(59,130,246,0.12) 0%, transparent 100%)",
            }}
          />
          <SplineScene />
        </div>
      </div>

      {/* Mobile Spline — constrained height, below text */}
      <div className="relative mx-auto h-[340px] max-w-7xl lg:hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 70% at 50% 50%, rgba(168,85,247,0.2) 0%, transparent 100%)",
          }}
        />
        <SplineScene />
      </div>
    </section>
  );
}
