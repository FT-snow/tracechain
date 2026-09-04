"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "./Reveal";

const faqs = [
  {
    q: "How does wallet tracing actually work?",
    a: "TraceChain traverses fund flow hop-by-hop across BTC, ETH, BSC and USDT-TRC20 automatically.",
  },
  {
    q: "Do I need blockchain training to use it?",
    a: "No — the plain-language interface lets anyone submit an address and get a report.",
  },
  {
    q: "How fast is an investigation?",
    a: "A standard three-to-five hop investigation resolves to an exchange in under a minute.",
  },
  {
    q: "Is the evidence usable in court?",
    a: "Yes — every report is SHA-256 hashed, making it tamper-proof and legally defensible.",
  },
  {
    q: "Does it keep watching afterwards?",
    a: "Live Watch polls registered wallets and alerts you if dormant funds later move.",
  },
  {
    q: "What does it cost to deploy?",
    a: "It runs on free-tier chain APIs, keeping per-station deployment cost near zero.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-5 py-24 md:px-8 md:py-32">
        <Reveal className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-text-primary md:text-5xl">
            Questions
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
                    className="flex shrink-0"
                  >
                    <Plus className="h-4 w-4 text-text-secondary" />
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
