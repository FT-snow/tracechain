"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Reveal from "./Reveal";

const testimonials = [
  {
    quote:
      "I had the exchange and a ready freeze letter before my chai went cold. My constables run traces alone now.",
    name: "A. Sharma",
    role: "Assistant Sub-Inspector, Cybercrime Cell",
    initial: "AS",
  },
  {
    quote:
      "Three separate victim complaints converged on one deposit wallet. We caught a ring the manual process would've missed for weeks.",
    name: "P. Nair",
    role: "District Cybercrime Officer, Gurugram",
    initial: "PN",
  },
  {
    quote:
      "No blockchain training needed. It reads like a case file I already understand — with the hash to back it in court.",
    name: "V. Deshpande",
    role: "Investigating Officer, Maharashtra",
    initial: "VD",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
};

export default function Testimonials() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <Reveal className="mb-16 max-w-2xl">
          <span className="mono text-[11px] uppercase tracking-[0.22em] text-risk-low">
            From the field
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Built for the people
            <br />
            who answer the call.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.initial}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="group flex flex-col justify-between bg-bg p-7 transition-colors duration-300 hover:bg-surface"
            >
              <div>
                <Quote className="h-6 w-6 text-trace/60" />
                <blockquote className="mt-5 text-[15px] leading-relaxed text-text-primary">
                  {t.quote}
                </blockquote>
              </div>
              <figcaption className="mt-8 flex items-center gap-3 border-t border-border pt-5">
                <span className="mono flex h-10 w-10 items-center justify-center rounded-md border border-trace/30 bg-trace/10 text-xs font-semibold text-trace">
                  {t.initial}
                </span>
                <div>
                  <div className="text-sm font-medium text-text-primary">{t.name}</div>
                  <div className="mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
                    {t.role}
                  </div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
