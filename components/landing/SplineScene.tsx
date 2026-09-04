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
          src={SPLINE_URL}
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="mono text-text-muted">Loading 3D scene…</span>
          </div>
        )}
    </div>
  );
}
