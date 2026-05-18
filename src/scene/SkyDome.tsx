import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import skyFrag from '../effects/shaders/sky.frag.glsl'

const SUN_DIR = new THREE.Vector3(0.5, 0.8, 0.3).normalize()

export default function SkyDome() {
  const meshRef = useRef<THREE.Mesh>(null)

  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      uSunDir:            { value: SUN_DIR },
      uSunColor:          { value: new THREE.Color('#fff5e0') },
      uZenith:            { value: new THREE.Color('#0a1a40') },
      uHorizon:           { value: new THREE.Color('#e8905a') },
      uGround:            { value: new THREE.Color('#2a1a0a') },
      uRayleighStrength:  { value: 0.6 },
      uMieStrength:       { value: 0.4 },
      uMieDirectionalG:   { value: 8.0 },
    },
    vertexShader: `
      varying vec3 vWorldDir;
      void main() {
        vWorldDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: skyFrag,
    depthWrite: false,
  })

  useFrame(() => {
    // Sky is static; clouds animated via RayMarchingPass
  })

  return (
    <mesh ref={meshRef} material={skyMaterial}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  )
}
