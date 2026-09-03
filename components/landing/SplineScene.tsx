"use client";

import { useEffect, useRef, useState } from "react";

const SPLINE_URL =
  "https://my.spline.design/alliseeiscrypto-HsYM7Z8dNS2amPnh08tmBV25/";

export default function SplineScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {mounted && (
        <iframe
          src={`${SPLINE_URL}?output=dnt`}
          frameBorder="0"
          width="100%"
          height="100%"
          onLoad={() => setLoaded(true)}
          className="h-full w-full"
          style={{ background: "transparent" }}
          title="Cryptocurrency wallet tracing 3D visual"
          aria-label="3D visualization of cryptocurrency flow tracing"
        />
      )}

      {(!mounted || !loaded) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-bg via-surface to-bg">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 animate-ping rounded-full border border-trace/40" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-trace/20" />
            <div className="absolute inset-4 rounded-full bg-trace/40 blur-sm" />
          </div>
          <span className="mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
            booting trace engine
          </span>
        </div>
      )}
    </div>
  );
}
