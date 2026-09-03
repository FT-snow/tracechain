"use client";

import { ShieldCheck, Landmark, Scale, Lock } from "lucide-react";
import Reveal from "./Reveal";

const badges = [
  { icon: Landmark, label: "SIH26183" },
  { icon: ShieldCheck, label: "Ministry of Home Affairs" },
  { icon: Scale, label: "Court-Admissible Evidence" },
  { icon: Lock, label: "Chain-of-Custody Hashed" },
];

const statRow = [
  { value: "3+", label: "Indicative solutions" },
  { value: "4", label: "Blockchains traced" },
  { value: "100%", label: "Evidence, own the data" },
  { value: "24/7", label: "Live watch coverage" },
];

export default function Trust() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <Reveal className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {badges.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2.5 text-sm text-text-secondary"
            >
              <b.icon className="h-4 w-4 text-trace" />
              <span className="font-medium">{b.label}</span>
            </div>
          ))}
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
          {statRow.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              className="bg-surface-2 px-6 py-8 text-center"
            >
              <div className="mono text-2xl font-bold text-text-primary md:text-3xl">
                {s.value}
              </div>
              <div className="mono mt-1 text-[10px] uppercase tracking-[0.16em] text-text-muted">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
