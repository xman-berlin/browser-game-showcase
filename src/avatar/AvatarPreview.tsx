import { useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAvatarStore } from '../store/avatarStore'

const OUTFIT_MODELS: Record<string, Record<string, string>> = {
  male: {
    warrior: 'quat_male_king',
    mage: 'quat_male_hoodie',
    rogue: 'quat_male_adventurer',
    scifi: 'quat_male_astronaut',
  },
  female: {
    warrior: 'quat_female_soldier',
    mage: 'quat_female_witch',
    rogue: 'quat_female_punk',
    scifi: 'quat_female_scifi',
  },
}

function applyPreset(mat: THREE.MeshStandardMaterial, key: string) {
  switch (key) {
    case 'leather': mat.roughness = 0.8; mat.metalness = 0; break
    case 'metal':   mat.roughness = 0.3; mat.metalness = 1; break
    case 'cloth':   mat.roughness = 0.9; mat.metalness = 0; break
    case 'energy':
      mat.roughness = 0.2; mat.metalness = 0
      mat.emissive.set('#7c3aed')
      mat.emissiveIntensity = 0.6
      break
  }
}

function PreviewModel() {
  const config = useAvatarStore(s => s.config)
  const modelFile = OUTFIT_MODELS[config.baseModel]?.[config.outfitPreset] || 'quat_male_adventurer'
  // Clone the scene so modifications don't affect the main scene's cached materials
  const { scene } = useGLTF(`/models/${modelFile}.glb`)
  const cloned = scene.clone(true)

  useEffect(() => {
    const { skinColor, hairColor, eyeColor, outfitMaterial } = config
    cloned.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return
      const mesh = child as THREE.Mesh
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of materials as THREE.MeshStandardMaterial[]) {
        const matName = mat.name.toLowerCase()
        if (matName.includes('eye')) {
          mat.color.set(eyeColor)
        } else if (matName.includes('hair') || matName.includes('eyebrow')) {
          mat.color.set(hairColor)
        } else {
          mat.color.set(skinColor)
        }
        applyPreset(mat, outfitMaterial)
        mat.needsUpdate = true
      }
    })
  }, [cloned, config])

  return <primitive object={cloned} />
}

export default function AvatarPreview() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1.1, 2.2], fov: 25 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <hemisphereLight args={['#b0d8ff', '#4a3a2a', 0.3]} />
        <Suspense fallback={null}>
          <PreviewModel />
        </Suspense>
        <OrbitControls
          enableDamping
          dampingFactor={0.12}
          minDistance={1.5}
          maxDistance={6}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0.9, 0]}
        />
      </Canvas>
    </div>
  )
}
