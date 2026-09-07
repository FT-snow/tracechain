"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Demo from "@/components/landing/Demo";
import Faq from "@/components/landing/Faq";
import Cta from "@/components/landing/Cta";
import Footer from "@/components/landing/Footer";
import GradientBackground from "@/components/landing/GradientBackground";

export default function LandingPage() {
  return (
    <>
      <GradientBackground />
      <Navbar />
      <main>
        <Hero />
        <Demo />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
