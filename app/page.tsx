"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits";
import Problem from "@/components/landing/Problem";
import Demo from "@/components/landing/Demo";
import Trust from "@/components/landing/Trust";
import Testimonials from "@/components/landing/Testimonials";
import Uvp from "@/components/landing/Uvp";
import Faq from "@/components/landing/Faq";
import Cta from "@/components/landing/Cta";
import Footer from "@/components/landing/Footer";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-trace via-info to-risk-hi"
    />
  );
}

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Problem />
        <Demo />
        <Trust />
        <Testimonials />
        <Uvp />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
