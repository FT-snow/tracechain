"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion, Variants } from "framer-motion";

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

        <div className="relative hidden h-[calc(100vh-4rem)] bg-bg p-6 lg:block lg:p-8">
          <div className="relative h-full w-full overflow-hidden rounded-sm border border-[#896ABD]/25 bg-[#17111F] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
            <SplineScene />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_52%,rgba(3,3,3,0.55)_100%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,transparent_78%,rgba(3,3,3,0.8)_100%)]"
            />
            <span
              aria-hidden="true"
              className="absolute left-2 top-2 z-20 h-3 w-3 border-l-2 border-t-2 border-[#A855F7]/60"
            />
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 z-20 h-3 w-3 border-r-2 border-t-2 border-[#A855F7]/60"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-2 z-20 h-3 w-3 border-b-2 border-l-2 border-[#A855F7]/60"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-2 right-2 z-20 h-3 w-3 border-b-2 border-r-2 border-[#A855F7]/60"
            />
          </div>
        </div>
      </div>

      <div className="relative mx-auto h-[300px] max-w-7xl p-3 lg:hidden">
        <div className="relative h-full w-full overflow-hidden rounded-sm border border-[#896ABD]/25 bg-[#17111F] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          <SplineScene />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_52%,rgba(3,3,3,0.55)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,transparent_78%,rgba(3,3,3,0.8)_100%)]"
          />
          <span
            aria-hidden="true"
            className="absolute left-2 top-2 z-20 h-3 w-3 border-l-2 border-t-2 border-[#A855F7]/60"
          />
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 z-20 h-3 w-3 border-r-2 border-t-2 border-[#A855F7]/60"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-2 z-20 h-3 w-3 border-b-2 border-l-2 border-[#A855F7]/60"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-2 right-2 z-20 h-3 w-3 border-b-2 border-r-2 border-[#A855F7]/60"
          />
        </div>
      </div>
    </section>
  );
}
