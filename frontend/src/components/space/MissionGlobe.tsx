import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import {
  SATELLITES,
  OBSERVATORIES,
  TARGETS,
  CONSTELLATION_COLOR,
  TIER_META,
} from "@/lib/orbital/data";
import { satPosition, latLonToVec3, EARTH_RADIUS_KM, type Sat } from "@/lib/orbital/sim";

const EARTH_R = 2; // scene units
const KM_TO_SCENE = EARTH_R / EARTH_RADIUS_KM;

function Earth() {
  const ref = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  const proceduralTex = useMemo(() => makeEarthTexture(), []);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous"); // Fix cross-origin WebGL security blocks
    // Load high-fidelity Earth daytime satellite map
    loader.load(
      "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.anisotropy = 8;
        setTexture(loadedTex);
      },
      undefined,
      (err) => {
        console.warn("Failed to load real Earth map, using procedural fallback.", err);
        setTexture(proceduralTex);
      }
    );
  }, [proceduralTex]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += 0.008 * dt;
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.012 * dt;
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[EARTH_R, 128, 128]} />
        <meshStandardMaterial
          map={texture || proceduralTex}
          roughness={0.85}
          metalness={0.12}
          emissive={texture ? new THREE.Color("#08122d") : new THREE.Color("#0a1530")}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh ref={cloudsRef} scale={1.008}>
        <sphereGeometry args={[EARTH_R, 64, 64]} />
        <meshStandardMaterial color="#b6d4ff" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      {/* Atmosphere */}
      <mesh scale={1.08}>
        <sphereGeometry args={[EARTH_R, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{ uColor: { value: new THREE.Color("#5cc8ff") } }}
          vertexShader={`varying vec3 vN; void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
          fragmentShader={`varying vec3 vN;uniform vec3 uColor;void main(){float i=pow(0.7-dot(vN,vec3(0,0,1.)),2.2);gl_FragColor=vec4(uColor,1.)*i;}`}
        />
      </mesh>
      {/* Grid overlay */}
      <mesh scale={1.001}>
        <sphereGeometry args={[EARTH_R, 32, 16]} />
        <meshBasicMaterial color="#5cc8ff" wireframe transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

function makeEarthTexture(): THREE.Texture {
  const size = 2048;
  const c = document.createElement("canvas");
  c.width = size; c.height = size / 2;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, "#0a1c3a"); g.addColorStop(0.5, "#0c2855"); g.addColorStop(1, "#0a1c3a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
  const rand = mulberry(13);
  ctx.fillStyle = "#16493a";
  for (let i = 0; i < 700; i++) {
    const x = rand() * c.width, y = rand() * c.height, r = 6 + rand() * 80;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.4 + rand()), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#236a52";
  for (let i = 0; i < 900; i++) {
    const x = rand() * c.width, y = rand() * c.height, r = 2 + rand() * 22;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.5 + rand()), rand() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }
  const cap = ctx.createLinearGradient(0, 0, 0, c.height);
  cap.addColorStop(0, "rgba(225,240,255,0.9)");
  cap.addColorStop(0.08, "rgba(225,240,255,0)");
  cap.addColorStop(0.92, "rgba(225,240,255,0)");
  cap.addColorStop(1, "rgba(225,240,255,0.9)");
  ctx.fillStyle = cap; ctx.fillRect(0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function mulberry(a: number) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function Satellites({
  sats,
  simTime,
  selectedId,
  onSelect,
  highlightedId,
}: {
  sats: Sat[];
  simTime: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  highlightedId: string | null;
}) {
  const groupRef = useRef<THREE.InstancedMesh>(null!);
  const clickGroupRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => {
    const arr = new Float32Array(sats.length * 3);
    sats.forEach((s, i) => {
      const c = new THREE.Color(CONSTELLATION_COLOR[s.constellation] || "#9fd6ff");
      arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b;
    });
    return arr;
  }, [sats]);

  const geometryRef = useRef<THREE.SphereGeometry>(null);
  const clickGeometryRef = useRef<THREE.SphereGeometry>(null);

  useEffect(() => {
    // Set a large bounding sphere on the geometry so raycasting doesn't get clipped.
    // Three.js InstancedMesh raycasting does an initial check on the geometry's bounding sphere.
    if (geometryRef.current) {
      geometryRef.current.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 10);
    }
    if (clickGeometryRef.current) {
      clickGeometryRef.current.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 10);
    }
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    for (let i = 0; i < sats.length; i++) {
      const [x, y, z] = satPosition(sats[i], simTime);
      dummy.position.set(x * KM_TO_SCENE, z * KM_TO_SCENE, -y * KM_TO_SCENE);
      const isSelected = sats[i].id === selectedId || sats[i].id === highlightedId;
      
      // Update visual mesh
      dummy.scale.setScalar(isSelected ? 0.055 : 0.026);
      dummy.updateMatrix();
      groupRef.current.setMatrixAt(i, dummy.matrix);

      // Update click target mesh (always larger for easy clicking)
      if (clickGroupRef.current) {
        dummy.scale.setScalar(isSelected ? 0.12 : 0.095);
        dummy.updateMatrix();
        clickGroupRef.current.setMatrixAt(i, dummy.matrix);
      }
    }
    groupRef.current.instanceMatrix.needsUpdate = true;
    if (clickGroupRef.current) {
      clickGroupRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Visible Satellites */}
      <instancedMesh
        ref={groupRef}
        args={[undefined, undefined, sats.length]}
        raycast={() => null}
      >
        <sphereGeometry ref={geometryRef} args={[1, 8, 8]} />
        <meshBasicMaterial vertexColors={false} color="#bfeaff" toneMapped={false} />
        <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
      </instancedMesh>

      {/* Invisible Click Targets (larger scale for much better UX) */}
      <instancedMesh
        ref={clickGroupRef}
        args={[undefined, undefined, sats.length]}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (typeof e.instanceId === "number") onSelect(sats[e.instanceId].id);
        }}
      >
        <sphereGeometry ref={clickGeometryRef} args={[1, 6, 6]} />
        <meshBasicMaterial transparent opacity={0.0} depthWrite={false} color="#ffffff" />
      </instancedMesh>
    </group>
  );
}

function OrbitPath({ sat, simTime }: { sat: Sat; simTime: number }) {
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const N = 128;
    const periodSec = sat.periodMin * 60;
    for (let i = 0; i <= N; i++) {
      const t = simTime - periodSec / 2 + (i / N) * periodSec;
      const [x, y, z] = satPosition(sat, t);
      pts.push(new THREE.Vector3(x * KM_TO_SCENE, z * KM_TO_SCENE, -y * KM_TO_SCENE));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [sat, simTime]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial attach="material" color="#5cc8ff" linewidth={2} transparent opacity={0.8} depthWrite={false} />
    </line>
  );
}

function ObservatoryPin({
  obs,
  target,
  isConflict,
}: {
  obs: typeof OBSERVATORIES[number];
  target?: { tier: 0 | 1 | 2 | 3; raDeg: number; decDeg: number };
  isConflict: boolean;
}) {
  const pos = useMemo(() => {
    const [x, y, z] = latLonToVec3(obs.latDeg, obs.lonDeg, EARTH_R * 1.005);
    return new THREE.Vector3(x, y, z);
  }, [obs]);

  const tierColor = target ? TIER_META[target.tier].var : "#7dd3fc";
  const surfaceNormal = pos.clone().normalize();
  const coneHeight = 1.6;

  // Orient cone: default cone points +Y in three; we want from pos along surfaceNormal
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    surfaceNormal,
  );

  return (
    <group>
      {/* Pin */}
      <mesh position={pos}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={tierColor} toneMapped={false} />
      </mesh>
      {/* Pulse ring */}
      <mesh position={pos} quaternion={quat}>
        <ringGeometry args={[0.035, 0.05, 32]} />
        <meshBasicMaterial color={tierColor} transparent opacity={0.5} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* FoV cone */}
      <group position={pos.clone().add(surfaceNormal.clone().multiplyScalar(coneHeight / 2))} quaternion={quat}>
        <mesh>
          <coneGeometry args={[0.25, coneHeight, 32, 1, true]} />
          <meshBasicMaterial
            color={isConflict ? "#ff5070" : tierColor}
            transparent
            opacity={isConflict ? 0.35 : 0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <coneGeometry args={[0.25, coneHeight, 32, 1, true]} />
          <meshBasicMaterial color={isConflict ? "#ff5070" : tierColor} wireframe transparent opacity={0.4} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function CameraRig() {
  const { camera } = useThree();
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.05;
    camera.position.x += (Math.sin(t) * 0.002);
  });
  return null;
}

export interface MissionGlobeProps {
  simTime: number;
  selectedSatId: string | null;
  highlightedSatId: string | null;
  conflictObservatoryId: string | null;
  onSelectSat: (id: string | null) => void;
  visibleSats?: Sat[];
}

export function MissionGlobe(props: MissionGlobeProps) {
  const sats = props.visibleSats || SATELLITES;
  const selectedSat = sats.find((s) => s.id === props.selectedSatId) || null;

  return (
    <Canvas
      camera={{ position: [0, 1.2, 7], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      onPointerMissed={() => props.onSelectSat(null)}
    >
      <color attach="background" args={["#05080f"]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[6, 2, 5]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-6, -2, -4]} intensity={0.4} color="#3a6cff" />
      <Suspense fallback={null}>
        <Stars radius={120} depth={60} count={7000} factor={3.5} fade speed={0.2} />
        <Earth />
        <Satellites
          sats={sats}
          simTime={props.simTime}
          selectedId={props.selectedSatId}
          highlightedId={props.highlightedSatId}
          onSelect={props.onSelectSat}
        />
        {selectedSat && <OrbitPath sat={selectedSat} simTime={props.simTime} />}
        {OBSERVATORIES.map((o) => {
          const target = TARGETS.find((t) => t.observatoryId === o.id);
          return (
            <ObservatoryPin
              key={o.id}
              obs={o}
              target={target}
              isConflict={props.conflictObservatoryId === o.id}
            />
          );
        })}
        <CameraRig />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={14}
        rotateSpeed={0.4}
        autoRotate
        autoRotateSpeed={0.18}
      />
    </Canvas>
  );
}
