import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useShowcaseStore } from '../store/showcaseStore'
import raymarchingFrag from './shaders/raymarching.frag.glsl'

const SUN_DIR = new THREE.Vector3(0.5, 0.8, 0.3).normalize()

export default function RayMarchingPass() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { features } = useShowcaseStore()
  const { camera } = useThree()
  const timeRef = useRef(0)

  const uniforms = useMemo(() => ({
    uCameraPos:   { value: new THREE.Vector3(0, 0, 0) },
    uSunDir:      { value: SUN_DIR },
    uTime:        { value: 0 },
    uCloudScale:  { value: 0.006 },
    uCoverage:    { value: 0.45 },
    uDensity:     { value: 1.5 },
    uStepSize:    { value: 4.0 },
  }), [])

  useFrame((_, delta) => {
    timeRef.current += delta * 0.5
    const u = (meshRef.current?.material as THREE.ShaderMaterial | undefined)?.uniforms
    if (u) {
      u.uTime.value = timeRef.current
      u.uCameraPos.value.copy(camera.position)
    }
  })

  if (!features.raymarching) return null

  return (
    <mesh ref={meshRef} renderOrder={1}>
      <sphereGeometry args={[380, 32, 16]} />
      <shaderMaterial
        vertexShader={`
          varying vec3 vWorldDir;
          void main() {
            vWorldDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={raymarchingFrag}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}
