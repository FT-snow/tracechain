"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { useReducedMotion } from "framer-motion";

export default function GradientBackground() {
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
            brightness={0.75}
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
      </div>
      <div className="fixed inset-0 -z-10 bg-black/25" aria-hidden="true" />
    </>
  );
}
