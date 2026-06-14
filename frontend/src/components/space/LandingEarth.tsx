import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function Earth({ rotationSpeed = 0.04 }: { rotationSpeed?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const atmRef = useRef<THREE.Mesh>(null!);

  // Procedural earth-like material using fbm displacement
  const earthTex = useMemo(() => makeEarthTexture(), []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += rotationSpeed * dt;
    if (cloudsRef.current) cloudsRef.current.rotation.y += rotationSpeed * 1.5 * dt;
  });

  return (
    <group rotation={[0.35, 0, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[2, 96, 96]} />
        <meshStandardMaterial
          map={earthTex}
          roughness={0.85}
          metalness={0.05}
          emissive={new THREE.Color("#0a1830")}
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Clouds */}
      <mesh ref={cloudsRef} scale={1.012}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#cfe6ff"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
      {/* Atmosphere */}
      <mesh ref={atmRef} scale={1.08}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            uColor: { value: new THREE.Color("#5cc8ff") },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPos;
            void main(){
              vNormal = normalize(normalMatrix * normal);
              vPos = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            uniform vec3 uColor;
            void main(){
              float intensity = pow(0.75 - dot(vNormal, vec3(0,0,1.0)), 2.5);
              gl_FragColor = vec4(uColor, 1.0) * intensity;
            }
          `}
        />
      </mesh>
    </group>
  );
}

function makeEarthTexture(): THREE.Texture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext("2d")!;
  // Ocean base
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#0a1d3a");
  grad.addColorStop(0.5, "#0d2a52");
  grad.addColorStop(1, "#0a1d3a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Procedural land blobs
  const rand = mulberry32(7);
  ctx.fillStyle = "#1c4a3e";
  for (let i = 0; i < 400; i++) {
    const x = rand() * canvas.width;
    const y = rand() * canvas.height;
    const r = 8 + rand() * 60;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.4 + rand()), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // Greener highlights
  ctx.fillStyle = "#2a6e54";
  for (let i = 0; i < 600; i++) {
    const x = rand() * canvas.width;
    const y = rand() * canvas.height;
    const r = 3 + rand() * 18;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + rand()), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // Polar caps
  const cap = ctx.createLinearGradient(0, 0, 0, canvas.height);
  cap.addColorStop(0, "rgba(220,235,255,0.85)");
  cap.addColorStop(0.08, "rgba(220,235,255,0)");
  cap.addColorStop(0.92, "rgba(220,235,255,0)");
  cap.addColorStop(1, "rgba(220,235,255,0.85)");
  ctx.fillStyle = cap;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function SatelliteSwarm({ count = 220 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const data = useMemo(() => {
    const arr: { radius: number; speed: number; phase: number; inc: number; raan: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        radius: 2.35 + Math.random() * 0.5,
        speed: 0.12 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
        inc: (Math.random() - 0.5) * Math.PI * 0.9,
        raan: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const M = d.phase + d.speed * t;
      const xOrb = d.radius * Math.cos(M);
      const yOrb = d.radius * Math.sin(M);
      const x1 = xOrb;
      const y1 = yOrb * Math.cos(d.inc);
      const z1 = yOrb * Math.sin(d.inc);
      const cR = Math.cos(d.raan), sR = Math.sin(d.raan);
      dummy.position.set(x1 * cR - y1 * sR, x1 * sR + y1 * cR, z1);
      dummy.scale.setScalar(0.015);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#a5e3ff" />
    </instancedMesh>
  );
}

export function LandingEarth() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 2, 5]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-6, -2, -4]} intensity={0.3} color="#3a6cff" />
      <Suspense fallback={null}>
        <Stars radius={80} depth={50} count={5000} factor={3} fade speed={0.3} />
        <Earth />
        <SatelliteSwarm count={180} />
      </Suspense>
    </Canvas>
  );
}
