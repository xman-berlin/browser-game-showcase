import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// CPU dust particles spawned at the character's feet while moving.
// Phase 5 will replace this with a GPUComputationRenderer system.

const MAX_PARTICLES = 40

interface Particle {
  active: boolean
  age: number
  lifetime: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
}

interface DustParticlesProps {
  charPos: React.RefObject<THREE.Vector3>
  speedRef: React.RefObject<number>
}

export default function DustParticles({ charPos, speedRef }: DustParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const spawnTimer = useRef(0)

  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: MAX_PARTICLES }, () => ({
      active: false, age: 0, lifetime: 1,
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      size: 0.1,
    })), [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#c8b89a',
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  }), [])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const speed = speedRef.current ?? 0
    const moving = speed > 0

    // ── Spawn ────────────────────────────────────────────────────────────
    if (moving) {
      // faster spawn rate when running
      const interval = speed >= 1.5 ? 0.04 : 0.08
      spawnTimer.current += delta
      while (spawnTimer.current >= interval) {
        spawnTimer.current -= interval
        const slot = particles.findIndex(p => !p.active)
        if (slot === -1) break
        const p = particles[slot]
        p.active = true
        p.age = 0
        p.lifetime = 0.5 + Math.random() * 0.4
        // spawn slightly behind feet, spread laterally
        p.x = charPos.current.x + (Math.random() - 0.5) * 0.4
        p.y = charPos.current.y + 0.05
        p.z = charPos.current.z + (Math.random() - 0.5) * 0.4
        p.vx = (Math.random() - 0.5) * 1.2
        p.vy = 0.4 + Math.random() * 0.6
        p.vz = (Math.random() - 0.5) * 1.2
        p.size = 0.08 + Math.random() * 0.12
      }
    } else {
      spawnTimer.current = 0
    }

    // ── Update & render ──────────────────────────────────────────────────
    let visibleCount = 0
    for (const p of particles) {
      if (!p.active) continue
      p.age += delta
      if (p.age >= p.lifetime) { p.active = false; continue }

      const t = p.age / p.lifetime  // 0→1
      p.x += p.vx * delta
      p.y += p.vy * delta * (1 - t) // decelerate upward
      p.z += p.vz * delta

      const scale = p.size * (1 + t * 1.5)
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(visibleCount, dummy.matrix)

      // fade out
      const opacity = (1 - t) * 0.45
      meshRef.current.setColorAt?.(visibleCount, new THREE.Color().setScalar(0.75 + t * 0.15))
      mat.opacity = opacity  // shared — good enough for a simple effect

      visibleCount++
    }

    meshRef.current.count = visibleCount
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]} material={mat} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
    </instancedMesh>
  )
}
