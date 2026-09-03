"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState, useEffect } from "react";
import { Hop } from "@/lib/data";
import { shortenAddress } from "@/lib/utils";

const COLORS = {
  victim: "#a855f7",
  wallet: "#3b82f6",
  mixer: "#ff9500",
  exchange: "#ff3b3b",
};

function nodeColor(type: Hop["type"]) {
  return COLORS[type] ?? COLORS.wallet;
}

function Node({
  position,
  color,
  radius,
  label,
  sublabel,
  appear,
  pulse,
  onClick,
}: {
  position: [number, number, number];
  color: string;
  radius: number;
  label: string;
  sublabel?: string;
  appear?: boolean;
  pulse?: boolean;
  onClick?: () => void;
}) {
  const scale = useRef(0);
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (appear) {
      scale.current = Math.min(1, scale.current + delta * 2.2);
      if (mesh.current) {
        mesh.current.scale.setScalar(scale.current);
        const m = (mesh.current.material as THREE.MeshStandardMaterial);
        m.opacity = scale.current;
      }
    }
    if (pulse && mesh.current) {
      const s = 1 + Math.sin(Date.now() * 0.004) * 0.12;
      mesh.current.scale.setScalar(scale.current * s);
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={mesh} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.4 : pulse ? 1.1 : 0.55}
          transparent
          opacity={appear ? 0 : 1}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      <Html
        center
        distanceFactor={14}
        position={[0, radius + 1.1, 0]}
        style={{ pointerEvents: "none", opacity: appear ? Math.max(scale.current * 0.9, 0) : 1 }}
      >
        <div
          className="flex flex-col items-center gap-0.5 whitespace-nowrap"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span className="text-[10px] tracking-wider text-text-secondary">{label}</span>
          {sublabel && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-medium"
              style={{ color: "#000", background: color }}
            >
              {sublabel}
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}

function Edge({
  from,
  to,
  appear,
  color,
  delay,
}: {
  from: [number, number, number];
  to: [number, number, number];
  appear?: boolean;
  color: string;
  delay?: number;
}) {
  const ref = useRef<THREE.Line>(null);
  const progress = useRef(0);
  const startTime = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    if (appear) {
      if (startTime.current === 0) startTime.current = clock.getElapsedTime();
      const delayDone = delay ? clock.getElapsedTime() - startTime.current > delay : true;
      if (delayDone) {
        progress.current = Math.min(1, progress.current + delta * 1.6);
        const opacity = progress.current;
        const line = (ref.current.material as THREE.LineBasicMaterial);
        line.opacity = opacity * 0.85;
        // shorten line as it "draws"
        const geom = ref.current.geometry as THREE.BufferGeometry;
        const pos = geom.attributes.position as THREE.BufferAttribute;
        const mid = [
          from[0] + (to[0] - from[0]) * 0.5,
          from[1] + (to[1] - from[1]) * 0.5 + 2.5,
          from[2] + (to[2] - from[2]) * 0.5,
        ];
        const end = [
          from[0] + (to[0] - from[0]) * progress.current,
          from[1] + (to[1] - from[1]) * progress.current,
          from[2] + (to[2] - from[2]) * progress.current,
        ];
        pos.setXYZ(0, from[0], from[1], from[2]);
        pos.setXYZ(1, mid[0], mid[1], mid[2]);
        pos.setXYZ(2, end[0], end[1], end[2]);
        pos.needsUpdate = true;
      }
    }
  });

  return (
    <line ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array([...from, ...from, ...from]), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.15} />
    </line>
  );
}

function FlowParticle({
  from,
  to,
  color,
  delay,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  delay: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const startTime = useRef(0);
  const mid = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + 2.5,
    (from[2] + to[2]) / 2,
  ];

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (startTime.current === 0) startTime.current = clock.getElapsedTime();
    const t = (clock.getElapsedTime() - startTime.current - delay) % 2.4;
    if (t < 0) return;
    const p = t / 2.4;
    // quadratic bezier
    const x = (1 - p) * (1 - p) * from[0] + 2 * (1 - p) * p * mid[0] + p * p * to[0];
    const y = (1 - p) * (1 - p) * from[1] + 2 * (1 - p) * p * mid[1] + p * p * to[1];
    const z = (1 - p) * (1 - p) * from[2] + 2 * (1 - p) * p * mid[2] + p * p * to[2];
    ref.current.position.set(x, y, z);
    (ref.current.material as THREE.MeshStandardMaterial).color.set(color);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.16, 12, 12]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
}

function Scene({
  hops,
  victimAddress,
  building,
}: {
  hops: Hop[];
  victimAddress: string;
  building: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const { nodes, edges, staged } = useMemo(() => {
    const nodesArr: {
      address: string;
      type: Hop["type"];
      label?: string;
      pos: [number, number, number];
    }[] = [];
    nodesArr.push({ address: victimAddress, type: "victim", label: "Victim", pos: [0, 0, 6] });

    hops.forEach((h, i) => {
      const angle = (i / Math.max(hops.length, 1)) * Math.PI * 0.9 - Math.PI * 0.25;
      const r = 5.5;
      nodesArr.push({
        address: h.to,
        type: h.type,
        label: h.label,
        pos: [Math.cos(angle) * r, (i % 2 === 0 ? 1.5 : -1.5) + Math.sin(angle) * 1.2, -i * 2.2],
      });
    });

    const edgesArr = hops.map((h, i) => ({
      from: i === 0 ? 0 : i,
      to: i + 1,
      color: nodeColor(h.type),
      amount: h.amount,
    }));

    return { nodes: nodesArr, edges: edgesArr, staged: building };
  }, [hops, victimAddress, building]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={40} color="#8b5cf6" />
      <pointLight position={[-10, -5, -6]} intensity={20} color="#3b82f6" />
      <gridHelper args={[40, 40, "#1e1e1e", "#141414"]} position={[0, -5.5, -4]} />

      {nodes.map((n, i) => (
        <Node
          key={n.address}
          position={n.pos}
          color={COLORS[n.type]}
          radius={n.type === "exchange" ? 0.7 : n.type === "victim" ? 0.65 : 0.45}
          label={shortenAddress(n.address)}
          sublabel={n.label ?? (n.type === "victim" ? "Victim Reported" : n.type.toUpperCase())}
          appear={staged}
          pulse={n.type === "exchange" || (selected === i && n.type !== "exchange")}
          onClick={() => setSelected(i)}
        />
      ))}

      {edges.map((e, i) => (
        <Edge
          key={i}
          from={nodes[e.from].pos}
          to={nodes[e.to].pos}
          color={e.color}
          appear={staged}
          delay={i * 0.35}
        />
      ))}

      {edges.map((e, i) => (
        <FlowParticle
          key={`p-${i}`}
          from={nodes[e.from].pos}
          to={nodes[e.to].pos}
          color={e.color}
          delay={i * 0.35}
        />
      ))}

      <OrbitControls
        enablePan={false}
        autoRotate={false}
        enableDamping
        minDistance={6}
        maxDistance={26}
        target={[0, 0, -2]}
      />
    </>
  );
}

export default function FundFlowGraph({
  hops,
  victimAddress,
  building = true,
}: {
  hops: Hop[];
  victimAddress: string;
  building?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-full w-full" />;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 4, 16], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      className="h-full w-full"
    >
      <Scene hops={hops} victimAddress={victimAddress} building={building} />
    </Canvas>
  );
}
