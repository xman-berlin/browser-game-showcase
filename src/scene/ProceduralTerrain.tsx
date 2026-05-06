import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useShowcaseStore } from '../store/showcaseStore'
import terrainVert from '../effects/shaders/terrain.vert.glsl'
import terrainFrag from '../effects/shaders/terrain.frag.glsl'

const SUN_DIR = new THREE.Vector3(1, 2, 1).normalize()
const SUN_COLOR = new THREE.Color(1.0, 0.95, 0.85)

export default function ProceduralTerrain() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { features } = useShowcaseStore()

  const uniforms = useMemo(() => ({
    uTime:         { value: 0 },
    uTerrainScale: { value: 0.05 },
    uHeightScale:  { value: 5.0 },
    uPBR:          { value: true },
    uSunDir:       { value: SUN_DIR },
    uSunColor:     { value: SUN_COLOR },
  }), [])

  // Keep uPBR in sync with store toggle
  useFrame((_, delta) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.ShaderMaterial
    mat.uniforms.uTime.value += delta
    mat.uniforms.uPBR.value = features.pbr
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, 0, 0]}
    >
      {/* 256×256 segments for smooth noise displacement */}
      <planeGeometry args={[80, 80, 256, 256]} />
      <shaderMaterial
        vertexShader={terrainVert}
        fragmentShader={terrainFrag}
        uniforms={uniforms}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}
