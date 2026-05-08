import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CharacterModelProps {
  groupRef: React.RefObject<THREE.Group>
  speedRef: React.RefObject<number>
}

// Load model + all animation GLBs at module level so they are always ready
const MODEL_URL = '/models/ybot.glb'
const IDLE_URL  = '/animations/idle.glb'
const WALK_URL  = '/animations/walk.glb'
const RUN_URL   = '/animations/run.glb'

export default function CharacterModel({ groupRef, speedRef }: CharacterModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const { animations: idleAnims } = useGLTF(IDLE_URL)
  const { animations: walkAnims } = useGLTF(WALK_URL)
  const { animations: runAnims }  = useGLTF(RUN_URL)

  // Strip root-motion position tracks so animations don't displace the group.
  // Assimp FBX conversion splits the Hips bone into "_$AssimpFbx$_Translation" and
  // "_$AssimpFbx$_Rotation" nodes. The Translation node's .position track carries
  // the horizontal locomotion offset that causes the per-loop snap. Drop it.
  function stripRootMotion(clip: THREE.AnimationClip): THREE.AnimationClip {
    clip.tracks = clip.tracks.filter(t => {
      const lower = t.name.toLowerCase()
      // Drop .position on any hips/root bone variant (plain or Assimp-split)
      const isHipsBone = lower.includes('hips') || lower.startsWith('root')
      return !(isHipsBone && lower.endsWith('.position'))
    })
    return clip
  }

  // Name the clips
  const clips = [
    ...(idleAnims.length ? [stripRootMotion(Object.assign(idleAnims[0].clone(), { name: 'idle' }))] : []),
    ...(walkAnims.length ? [stripRootMotion(Object.assign(walkAnims[0].clone(), { name: 'walk' }))] : []),
    ...(runAnims.length  ? [stripRootMotion(Object.assign(runAnims[0].clone(),  { name: 'run'  }))] : []),
  ]

  const { actions, mixer } = useAnimations(clips, groupRef)

  const current = useRef<string>('')

  // Enable shadows
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  // Start idle once actions are ready
  useEffect(() => {
    if (!actions.idle) return
    actions.idle.reset().fadeIn(0.01).play()
    current.current = 'idle'
  }, [actions])

  useFrame((_, delta) => {
    mixer.update(delta)

    const speed = speedRef.current ?? 0
    const target = speed >= 1.5 ? 'run' : speed >= 0.1 ? 'walk' : 'idle'
    if (target === current.current) return
    if (!actions[target] || !actions[current.current]) return

    actions[current.current]!.fadeOut(0.2)
    actions[target]!.reset().fadeIn(0.2).play()
    current.current = target
  })

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} scale={0.01} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
useGLTF.preload(IDLE_URL)
useGLTF.preload(WALK_URL)
useGLTF.preload(RUN_URL)
