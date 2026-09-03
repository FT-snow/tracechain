"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "./Reveal";

const faqs = [
  {
    q: "How does wallet tracing actually work?",
    a: "You submit a suspect wallet address. TraceChain runs an automated BFS/DFS traversal across BTC, ETH, BSC and USDT-TRC20, following fund flow hop-by-hop via free-tier chain APIs — no manual lookups.",
  },
  {
    q: "Do I need blockchain training to use it?",
    a: "No. The interface is plain-language, self-serve. A constable with zero blockchain background can submit an address and get a court-ready report end to end.",
  },
  {
    q: "How fast is the trace?",
    a: "A standard 3–5 hop trace resolves to an exchange in under a minute. Compare that to days of manual forensic work.",
  },
  {
    q: "Is the evidence usable in court?",
    a: "Yes. Every generated report is SHA-256 chain-of-custody hashed at creation, making it tamper-proof and legally defensible — not just a readable PDF.",
  },
  {
    q: "Does it keep watching after the trace?",
    a: "Live Watch polls registered wallets continuously. If dormant funds move later, the system re-triggers tracing and sends an automatic alert.",
  },
  {
    q: "What does it cost to deploy?",
    a: "It runs on free-tier chain APIs, so per-station deployment cost stays near zero — unlike lakhs-per-seat enterprise forensic licenses.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-5 py-24 md:px-8 md:py-32">
        <Reveal className="mb-14 text-center">
          <span className="mono text-[11px] uppercase tracking-[0.22em] text-trace">
            Questions
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Frequently asked
          </h2>
        </Reveal>

        <div className="divide-y divide-border border-b border-border">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.05}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium text-text-primary">
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-text-secondary"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-8 text-sm leading-relaxed text-text-secondary">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
