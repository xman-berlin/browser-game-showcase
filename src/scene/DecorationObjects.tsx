import { useMemo } from 'react'
import * as THREE from 'three'
import { useShowcaseStore } from '../store/showcaseStore'

// Scattered decoration objects showcasing PBR material features:
//   - Stones:    MeshPhysicalMaterial with clearcoat
//   - Crystals:  MeshPhysicalMaterial with transmission + IOR
//   - Sculpture: MeshPhysicalMaterial with iridescence

function getTerrainHeight(x: number, z: number): number {
  // Approximate the terrain height at a given xz position
  // (mirrors the fbm logic from terrain.vert.glsl at low precision)
  const scale = 0.08
  const sin = Math.sin, cos = Math.cos
  const p = (x: number, y: number) => {
    let v = 0, a = 0.5, f = 1.0
    for (let i = 0; i < 4; i++) {
      v += a * (sin(x * f * 1.3 + 0.7) * cos(y * f * 0.9 + 1.2) * 0.5 + 0.5) * 2 - a
      f *= 2; a *= 0.5
    }
    return v
  }
  return p(x * scale, z * scale) * 6.0
}

interface StoneProps { position: [number, number, number]; scale: number }
function Stone({ position, scale }: StoneProps) {
  const { features } = useShowcaseStore()
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#7a7068',
    roughness: 0.8,
    metalness: 0.1,
    clearcoat: features.pbr ? 0.4 : 0,
    clearcoatRoughness: 0.3,
  }), [features.pbr])

  return (
    <mesh position={position} scale={scale} castShadow receiveShadow material={mat}>
      <dodecahedronGeometry args={[1, 0]} />
    </mesh>
  )
}

interface CrystalProps { position: [number, number, number]; color: string; scale: number }
function Crystal({ position, color, scale }: CrystalProps) {
  const { features } = useShowcaseStore()
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.05,
    metalness: 0.0,
    transmission: features.pbr ? 0.9 : 0,
    thickness: 1.5,
    ior: 1.5,
    transparent: true,
    opacity: features.pbr ? 0.85 : 1.0,
  }), [features.pbr, color])

  return (
    <mesh position={position} scale={[scale * 0.4, scale, scale * 0.4]} castShadow material={mat}>
      <coneGeometry args={[1, 2.5, 6]} />
    </mesh>
  )
}

interface SculptureProps { position: [number, number, number] }
function MetalSculpture({ position }: SculptureProps) {
  const { features } = useShowcaseStore()
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#aaaacc',
    roughness: 0.15,
    metalness: 1.0,
    iridescence: features.pbr ? 1.0 : 0,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [100, 400],
  }), [features.pbr])

  return (
    <group position={position}>
      <mesh castShadow receiveShadow material={mat}>
        <torusKnotGeometry args={[0.8, 0.25, 128, 16]} />
      </mesh>
    </group>
  )
}

// Scatter items around the terrain
const STONES: Array<{ x: number; z: number; s: number }> = [
  { x: -8,  z: -5,  s: 0.6 }, { x: 5,   z: -10, s: 0.9 },
  { x: 12,  z: 3,   s: 0.5 }, { x: -14, z: 8,   s: 0.7 },
  { x: 3,   z: 14,  s: 1.0 }, { x: -6,  z: 12,  s: 0.4 },
  { x: 18,  z: -8,  s: 0.8 }, { x: -18, z: -3,  s: 0.6 },
]

const CRYSTALS: Array<{ x: number; z: number; color: string; s: number }> = [
  { x: -5,  z: 5,   color: '#88ccff', s: 1.2 },
  { x: 9,   z: -7,  color: '#cc88ff', s: 0.9 },
  { x: -12, z: -10, color: '#88ffcc', s: 1.5 },
  { x: 15,  z: 10,  color: '#ffcc88', s: 1.0 },
]

const SCULPTURES: Array<{ x: number; z: number }> = [
  { x: 0,   z: -8 },
  { x: -10, z: 5  },
  { x: 10,  z: 8  },
]

export default function DecorationObjects() {
  return (
    <group>
      {STONES.map((s, i) => {
        const y = getTerrainHeight(s.x, s.z)
        return <Stone key={i} position={[s.x, y + s.s * 0.4, s.z]} scale={s.s} />
      })}
      {CRYSTALS.map((c, i) => {
        const y = getTerrainHeight(c.x, c.z)
        return <Crystal key={i} position={[c.x, y + c.s * 0.6, c.z]} color={c.color} scale={c.s} />
      })}
      {SCULPTURES.map((s, i) => {
        const y = getTerrainHeight(s.x, s.z)
        return <MetalSculpture key={i} position={[s.x, y + 1.2, s.z]} />
      })}
    </group>
  )
}
