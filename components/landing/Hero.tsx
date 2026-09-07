"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const SplineScene = dynamic(() => import("./SplineScene"), {
  ssr: false,
  loading: () => null,
});

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

function Sparkle({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-20 text-white/90",
        className,
      )}
      initial={reduceMotion ? { opacity: 0.9 } : { opacity: 0.45 }}
      animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], scale: [0.92, 1.06, 0.92] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <path
        d="M12 0C13.1 7.5 16.5 10.9 24 12C16.5 13.1 13.1 16.5 12 24C10.9 16.5 7.5 13.1 0 12C7.5 10.9 10.9 7.5 12 0Z"
        fill="currentColor"
      />
    </motion.svg>
  );
}

function SplineViewport() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-sm border border-[#9882B9]/25 bg-[#17111F]/25 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
      <SplineScene />
      <Sparkle className="left-[7%] top-[8%] h-5 w-5" />
      <Sparkle className="left-[4%] top-[28%] h-3 w-3" delay={1.2} />
      <Sparkle className="right-[8%] top-[46%] h-4 w-4" delay={0.6} />
      <Sparkle className="right-[15%] bottom-[10%] h-3 w-3" delay={1.8} />
      <span
        aria-hidden="true"
        className="absolute left-2 top-2 z-20 h-3 w-3 border-l-2 border-t-2 border-[#9882B9]/60"
      />
      <span
        aria-hidden="true"
        className="absolute right-2 top-2 z-20 h-3 w-3 border-r-2 border-t-2 border-[#9882B9]/60"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-2 left-2 z-20 h-3 w-3 border-b-2 border-l-2 border-[#9882B9]/60"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-2 right-2 z-20 h-3 w-3 border-b-2 border-r-2 border-[#9882B9]/60"
      />
    </div>
  );
}

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="hero" className="relative min-h-screen pt-16">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center lg:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center px-5 py-14 md:px-8">
          <motion.div
            variants={reduceMotion ? undefined : container}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            className="max-w-xl"
          >
            <motion.h1
              variants={item}
              className="text-6xl font-bold leading-none tracking-tight text-text-primary md:text-8xl"
            >
              Trace.
            </motion.h1>
            <motion.p
              variants={item}
              className="mt-5 max-w-md text-lg text-text-secondary"
            >
              Submit a wallet. Get the exchange. Under a minute.
            </motion.p>
            <motion.div
              variants={item}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <a href="/trace" className="btn-primary px-6 py-3">
                Trace a wallet
              </a>
              <a href="#product" className="btn-ghost px-6 py-3">
                View the trace
              </a>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative hidden h-[calc(100vh-4rem)] p-6 lg:block lg:p-8">
          <SplineViewport />
        </div>
      </div>

      <div className="relative mx-auto h-[300px] max-w-7xl p-3 lg:hidden">
        <SplineViewport />
      </div>
    </section>
  );
}
