import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useShowcaseStore } from '../store/showcaseStore'

export default function EnvironmentLighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null)
  const { features } = useShowcaseStore()

  useFrame(() => {
    if (dirLightRef.current) {
      dirLightRef.current.castShadow = features.shadows
    }
  })

  return (
    <>
      {/* Directional sun */}
      <directionalLight
        ref={dirLightRef}
        position={[40, 60, 30]}
        intensity={2.2}
        color="#fff5e0"
        castShadow={features.shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.0005}
      />

      {/* Hemisphere sky/ground fill */}
      <hemisphereLight
        args={['#b0d8ff', '#4a3a2a', 0.6]}
      />

      {/* HDR IBL */}
      {features.ibl && (
        <Environment
          files="/textures/industrial_sunset_02_4k.hdr"
          background={false}
        />
      )}
    </>
  )
}
