import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAvatarStore } from '../store/avatarStore'

function applyPreset(mat: THREE.MeshStandardMaterial, key: string) {
  switch (key) {
    case 'leather':
      mat.roughness = 0.8; mat.metalness = 0; break
    case 'metal':
      mat.roughness = 0.3; mat.metalness = 1; break
    case 'cloth':
      mat.roughness = 0.9; mat.metalness = 0; break
    case 'energy':
      mat.roughness = 0.2; mat.metalness = 0
      mat.emissive.set('#7c3aed')
      mat.emissiveIntensity = 0.6
      break
  }
}

interface CharacterModelProps {
  groupRef: React.RefObject<THREE.Group>
  speedRef: React.RefObject<number>
}

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

const ANIM_MAP: Record<string, string> = {
  idle: 'CharacterArmature|Idle_Neutral',
  walk: 'CharacterArmature|Walk',
  run:  'CharacterArmature|Run',
}

export default function CharacterModel({ groupRef, speedRef }: CharacterModelProps) {
  const avatarConfig = useAvatarStore(s => s.config)
  const modelFile = OUTFIT_MODELS[avatarConfig.baseModel]?.[avatarConfig.outfitPreset] || 'quat_male_adventurer'
  const { scene, animations } = useGLTF(`/models/${modelFile}.glb`)

  const { actions, mixer } = useAnimations(animations, groupRef)
  const current = useRef<string>('')

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  // Apply avatar colors + material presets to each body part mesh
  useEffect(() => {
    const { skinColor, hairColor, eyeColor, outfitMaterial, auraEnabled, auraColor } = avatarConfig

    scene.traverse((child) => {
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

        if (auraEnabled && mesh.name.toLowerCase() === 'aura') {
          mat.emissive.set(auraColor)
        }

        mat.needsUpdate = true
      }
    })
  }, [scene, avatarConfig])

  // Body morphs via group scaling
  useEffect(() => {
    if (!groupRef.current) return
    const { height, shoulderWidth, bodyBuild } = avatarConfig
    groupRef.current.scale.set(
      1 + (shoulderWidth - 0.5) * 0.4,
      1 + (height - 0.5) * 0.6,
      1 + (bodyBuild - 0.5) * 0.5,
    )
  }, [avatarConfig, groupRef])

  // Start idle animation once actions are ready
  useEffect(() => {
    const idle = actions[ANIM_MAP.idle]
    if (!idle) return
    idle.reset().fadeIn(0.01).play()
    current.current = ANIM_MAP.idle
  }, [actions])

  useFrame((_, delta) => {
    mixer.update(delta)

    const speed = speedRef.current ?? 0
    const target = speed >= 1.5 ? ANIM_MAP.run : speed >= 0.1 ? ANIM_MAP.walk : ANIM_MAP.idle
    if (target === current.current) return
    if (!actions[target] || !actions[current.current]) return

    actions[current.current]!.fadeOut(0.2)
    actions[target]!.reset().fadeIn(0.2).play()
    current.current = target
  })

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}

for (const gender of ['male', 'female']) {
  for (const outfit of ['warrior', 'mage', 'rogue', 'scifi']) {
    useGLTF.preload(`/models/${OUTFIT_MODELS[gender][outfit]}.glb`)
  }
}
