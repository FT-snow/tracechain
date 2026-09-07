"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function GradientBackground({
  brightness = 0.82,
  scrim = "bg-[#060204]/40",
}: {
  brightness?: number;
  scrim?: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <>
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <ShaderGradientCanvas
          lazyLoad={false}
          pointerEvents="none"
          style={{ width: "100%", height: "100%" }}
        >
          <ShaderGradient
            animate={reduceMotion ? "off" : "on"}
            brightness={brightness}
            cAzimuthAngle={180}
            cDistance={2.8}
            cPolarAngle={80}
            cameraZoom={9.1}
            color1="#606080"
            color2="#a800be"
            color3="#212121"
            envPreset="city"
            grain="on"
            lightType="3d"
            positionX={0}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.1}
            rotationX={50}
            rotationY={0}
            rotationZ={-60}
            shader="defaults"
            type="waterPlane"
            uAmplitude={0}
            uDensity={1.5}
            uFrequency={0}
            uSpeed={0.3}
            uStrength={1.5}
            uTime={8}
            wireframe={false}
          />
        </ShaderGradientCanvas>
        <div className={cn("absolute inset-0", scrim)} />
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>
    </>
  );
}
