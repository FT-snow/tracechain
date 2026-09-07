"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Demo from "@/components/landing/Demo";
import Faq from "@/components/landing/Faq";
import Cta from "@/components/landing/Cta";
import Footer from "@/components/landing/Footer";

const CRTWarp = dynamic(() => import("@/components/landing/CRTWarp"), {
  ssr: false,
  loading: () => null,
});

function ShaderBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <CRTWarp
        color="#ffffff"
        backgroundColor="#000000"
        speed={0.45}
        curvature={0.25}
        scanlineStrength={0.32}
        scanlineFrequency={180}
        waveAmplitude={0.22}
        waveFrequency={2.5}
        bloom={0.7}
        bloomRadius={1}
        noise={0.05}
        vignette={0.6}
        brightness={1.15}
        pixelation={1}
        rgbShift={0}
        mouseReact
        mouseStrength={0.35}
        dpr={1}
        fps={30}
        className="opacity-60"
      />
      {/* flat scrim, not a gradient: typography first, ambience second */}
      <div className="absolute inset-0 bg-black/55" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <ShaderBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Demo />
          <Faq />
          <Cta />
        </main>
        <Footer />
      </div>
    </>
  );
}
