"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Network,
  UserCheck,
  FileCheck2,
  Radio,
  Coins,
} from "lucide-react";
import Reveal from "./Reveal";

const benefits = [
  {
    icon: Zap,
    index: "01",
    title: "30-second triage verdict",
    body: "Overwhelmed cybercrime cells know instantly which complaints deserve analyst time — not three days of digging.",
  },
  {
    icon: Network,
    index: "02",
    title: "Real-time, multi-hop tracing",
    body: "BFS/DFS fund-flow across BTC, ETH, BSC and USDT-TRC20, building live hop-by-hop as blocks confirm.",
  },
  {
    icon: UserCheck,
    index: "03",
    title: "Zero training, self-serve",
    body: "A constable with no blockchain background runs a full trace end to end. No forensic analyst required.",
  },
  {
    icon: FileCheck2,
    index: "04",
    title: "Court-ready evidence, automatic",
    body: "Auto-generated PDF report, freeze letter, and SHA-256 chain-of-custody hash — admissible as-is.",
  },
  {
    icon: Radio,
    index: "05",
    title: "Never stops watching",
    body: "Live Watch keeps polling. Dormant funds moving weeks later still ping you automatically.",
  },
  {
    icon: Coins,
    index: "06",
    title: "Near-zero cost to run",
    body: "Built on free-tier chain APIs — deployable at every district cybercrime cell, not just central agencies.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

export default function Benefits() {
  return (
    <section id="features" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <Reveal className="mb-16 max-w-2xl">
          <span className="mono text-[11px] uppercase tracking-[0.22em] text-trace">
            Why it matters
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Speed over depth.
            <br />
            Built for the station, not the lab.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.index}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="group relative flex flex-col bg-bg p-7 transition-colors duration-300 hover:bg-surface"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface transition-colors group-hover:border-trace/40 group-hover:bg-trace/10">
                  <b.icon className="h-5 w-5 text-trace" />
                </div>
                <span className="mono text-xs font-medium text-text-muted">{b.index}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold leading-snug text-text-primary">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{b.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
