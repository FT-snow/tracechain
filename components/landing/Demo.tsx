"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, Variants } from "framer-motion";
import Reveal from "./Reveal";
import { buildDemoTrace } from "@/lib/data";
import { shortenAddress } from "@/lib/utils";

const FundFlowGraph = dynamic(() => import("@/components/graph/FundFlowGraph"), {
  ssr: false,
  loading: () => null,
});

const HOLD_TICKS = 2;

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const frameVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  },
};

export default function Demo() {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);

  const demo = useMemo(() => buildDemoTrace(), []);
  const total = demo.hops.length;
  const visible = Math.min(tick, total);

  useEffect(() => {
    if (reduceMotion) {
      setTick(total);
      return;
    }
    const t = setInterval(() => {
      setTick((v) => (v >= total + HOLD_TICKS ? 1 : v + 1));
    }, 1100);
    return () => clearInterval(t);
  }, [reduceMotion, total]);

  return (
    <section id="product" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-40">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <h2 className="text-4xl font-bold text-text-primary md:text-5xl">
            Live
          </h2>
          <p className="mt-4 text-base text-text-secondary">
            A wallet resolves to its exchange, hop by hop.
          </p>
        </motion.div>

        <motion.div
          variants={frameVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14"
        >
          <div className="overflow-hidden rounded border border-border bg-surface">
            <div className="border-b border-border bg-surface-2 px-4 py-2.5">
              <span className="mono text-xs uppercase tracking-[0.15em] text-text-muted">
                live trace · {shortenAddress(demo.victimAddress)}
              </span>
            </div>
            <div className="relative aspect-video overflow-hidden bg-bg">
              <AnimatePresenceLabel show={visible === 0} />
              {visible > 0 && (
                <motion.div
                  key="graph"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.5 }}
                  className="absolute inset-0"
                >
                  <FundFlowGraph
                    hops={demo.hops.slice(0, visible)}
                    victimAddress={demo.victimAddress}
                    building={visible < total}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AnimatePresenceLabel({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="mono absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.25em] text-text-muted">
      tracing…
    </div>
  );
}
