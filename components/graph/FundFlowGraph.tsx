"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState, useEffect } from "react";
import { Hop } from "@/lib/data";
import { shortenAddress } from "@/lib/utils";

const COLORS = {
  victim: "#f5f5f5",
  wallet: "#9a9a9a",
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
  highlight,
  onClick,
}: {
  position: [number, number, number];
  color: string;
  radius: number;
  label: string;
  sublabel?: string;
  appear?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}) {
  const scale = useRef(0);
  const mesh = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (appear) {
      scale.current = Math.min(1, scale.current + delta * 2.4);
    } else {
      scale.current = 1;
    }
    const hoverBoost = hovered ? 1.15 : 1;
    if (mesh.current) {
      mesh.current.scale.setScalar(scale.current * hoverBoost);
      const m = mesh.current.material as THREE.MeshStandardMaterial;
      m.opacity = scale.current;
    }
    if (ring.current) {
      ring.current.scale.setScalar(scale.current);
      ring.current.rotation.z += delta * 0.5;
      (ring.current.material as THREE.MeshBasicMaterial).opacity =
        scale.current * (highlight ? 0.85 : 0.35);
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh
        ref={mesh}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[radius, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.9 : highlight ? 0.7 : 0.25}
          transparent
          opacity={appear ? 0 : 1}
          roughness={0.55}
          metalness={0.15}
          flatShading
        />
      </mesh>
      {(highlight || hovered) && (
        <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius + 0.35, 0.015, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}
      <Html
        center
        distanceFactor={15}
        position={[0, radius + 0.9, 0]}
        style={{ pointerEvents: "none", opacity: appear ? Math.min(scale.current, 1) : 1 }}
        zIndexRange={[10, 0]}
      >
        <div
          className="flex flex-col items-center gap-0.5 whitespace-nowrap"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span className="text-[10px] tracking-wider text-text-secondary">
            {label}
          </span>
          {sublabel && (
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.14em]"
              style={{ color }}
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
  const geo = useMemo(() => {
    const mid: [number, number, number] = [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 + 2.2,
      (from[2] + to[2]) / 2,
    ];
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to)    );
    return new THREE.TubeGeometry(curve, 48, 0.03, 6, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);

  const startTime = useRef(0);
  const progress = useRef(0);
  const total = geo.index ? geo.index.count : 0;

  useEffect(() => {
    startTime.current = 0;
    progress.current = 0;
    geo.setDrawRange(0, 0);
    return () => geo.dispose();
  }, [geo]);

  useFrame(({ clock }, delta) => {
    if (!appear) {
      geo.setDrawRange(0, total);
      return;
    }
    if (startTime.current === 0) startTime.current = clock.getElapsedTime();
    const ready = !delay || clock.getElapsedTime() - startTime.current > delay;
    if (!ready) {
      geo.setDrawRange(0, 0);
      return;
    }
    progress.current = Math.min(1, progress.current + delta * 1.5);
    geo.setDrawRange(0, Math.floor(progress.current * total));
  });

  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={color} transparent opacity={0.75} />
    </mesh>
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
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + 2.2,
    (from[2] + to[2]) / 2,
  ];

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (startTime.current === 0) startTime.current = clock.getElapsedTime();
    const t = (clock.getElapsedTime() - startTime.current - delay) % 2.2;
    if (t < 0) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    const p = t / 2.2;
    const x =
      (1 - p) * (1 - p) * from[0] + 2 * (1 - p) * p * mid[0] + p * p * to[0];
    const y =
      (1 - p) * (1 - p) * from[1] + 2 * (1 - p) * p * mid[1] + p * p * to[1];
    const z =
      (1 - p) * (1 - p) * from[2] + 2 * (1 - p) * p * mid[2] + p * p * to[2];
    ref.current.position.set(x, y, z);
  });

  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[0.11, 10, 10]} />
      <meshBasicMaterial color={color} />
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

  const { nodes, edges } = useMemo(() => {
    const nodesArr: {
      address: string;
      type: Hop["type"];
      label?: string;
      pos: [number, number, number];
    }[] = [];
    nodesArr.push({
      address: victimAddress,
      type: "victim",
      label: "Victim",
      pos: [-9, 0, 3],
    });

    hops.forEach((h, i) => {
      // position depends ONLY on the hop index — fixed step per hop,
      // so existing nodes never move when a new hop appears (no wobble)
      const x = -9 + (i + 1) * 4.6;
      const z = 3 - (i + 1) * 3;
      nodesArr.push({
        address: h.to,
        type: h.type,
        label: h.label,
        pos: [x, i % 2 === 0 ? 1.4 : -1.4, z],
      });
    });

    const edgesArr = hops.map((h, i) => ({
      from: i,
      to: i + 1,
      color: nodeColor(h.type),
    }));

    return { nodes: nodesArr, edges: edgesArr };
  }, [hops, victimAddress]);

  return (
    <>
      <fog attach="fog" args={["#000000", 16, 42]} />
      <hemisphereLight args={["#ffffff", "#1a1a1a", 0.7]} />
      <directionalLight position={[6, 12, 8]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-8, -4, -6]} intensity={0.4} color="#888888" />

      {[6, 10.5, 15, 19.5].map((r) => (
        <mesh key={r} rotation={[Math.PI / 2, 0, 0]} position={[0, -3.4, 0]}>
          <torusGeometry args={[r, 0.012, 6, 72]} />
          <meshBasicMaterial color="#2a2a2a" transparent opacity={0.35} />
        </mesh>
      ))}

      {nodes.map((n, i) => (
        <Node
          key={n.address}
          position={n.pos}
          color={COLORS[n.type]}
          radius={n.type === "exchange" ? 0.72 : n.type === "victim" ? 0.66 : 0.44}
          label={shortenAddress(n.address)}
          sublabel={
            n.label ?? (n.type === "victim" ? "Victim Reported" : n.type.toUpperCase())
          }
          appear={building}
          highlight={n.type === "exchange" || n.type === "victim"}
          onClick={() => setSelected(i)}
        />
      ))}

      {edges.map((e, i) => (
        <Edge
          key={i}
          from={nodes[e.from].pos}
          to={nodes[e.to].pos}
          color={e.color}
          appear={building}
          delay={i * 0.3}
        />
      ))}

      {edges.map((e, i) => (
        <FlowParticle
          key={`p-${i}`}
          from={nodes[e.from].pos}
          to={nodes[e.to].pos}
          color={e.color}
          delay={i * 0.5}
        />
      ))}

      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.6}
        minDistance={7}
        maxDistance={26}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0, -1]}
        makeDefault
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
      camera={{ position: [0, 5, 17], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      className="h-full w-full"
    >
      <Scene hops={hops} victimAddress={victimAddress} building={building} />
    </Canvas>
  );
}
