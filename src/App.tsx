import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useState, useEffect, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useShowcaseStore } from './store/showcaseStore'
import ProceduralTerrain from './scene/ProceduralTerrain'
import EnvironmentLighting from './scene/EnvironmentLighting'
import SkyDome from './scene/SkyDome'
import ShadowSetup from './scene/ShadowSetup'
import DecorationObjects from './scene/DecorationObjects'
import PlayerController from './character/PlayerController'
import AvatarBuilder from './avatar/AvatarBuilder'
import CharacterSelect from './ui/CharacterSelect'
import ParticleSystem from './effects/ParticleSystem'
import RayMarchingPass from './effects/RayMarchingPass'

function BuilderOrbitControls({ charPos }: { charPos: React.RefObject<THREE.Vector3> }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)
  useFrame(() => {
    if (controlsRef.current && charPos.current) {
      controlsRef.current.target.lerp(charPos.current, 0.1)
    }
  })
  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.1}
      minDistance={1}
      maxDistance={10}
      maxPolarAngle={Math.PI / 2}
    />
  )
}

function Scene({ avatarOpen, charPos }: { avatarOpen: boolean; charPos: React.RefObject<THREE.Vector3> }) {
  return (
    <>
      <SkyDome />
      <ShadowSetup />
      <EnvironmentLighting />
      <ProceduralTerrain />
      <DecorationObjects />
      <PlayerController avatarOpen={avatarOpen} charPosRef={charPos} />
      <ParticleSystem charPos={charPos} />
      <RayMarchingPass />
      {avatarOpen && <BuilderOrbitControls charPos={charPos} />}
    </>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const charPos = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    if (!started) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault()
        setAvatarOpen(v => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [started])

  if (!started) {
    return <CharacterSelect onStart={() => setStarted(true)} />
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 12, 28], fov: 60 }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <Scene avatarOpen={avatarOpen} charPos={charPos} />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 pointer-events-none">
        <FeatureOverlay />
        <ControlsHint />
        {avatarOpen && <AvatarBuilder onClose={() => setAvatarOpen(false)} />}
        {!avatarOpen && (
          <button
            onClick={() => setAvatarOpen(true)}
            className="absolute top-4 left-4 bg-purple-700/80 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium pointer-events-auto transition-colors backdrop-blur-sm"
          >
            Avatar
          </button>
        )}
      </div>
    </div>
  )
}

function ControlsHint() {
  return (
    <div className="absolute bottom-4 left-4 bg-black/50 text-white rounded-lg p-3 text-xs backdrop-blur-sm space-y-0.5">
      <div className="font-bold text-gray-300 mb-1">Controls</div>
      <div>WASD / Arrows — Move</div>
      <div>Shift — Run</div>
      <div>Drag — Orbit camera</div>
      <div>Tab — Avatar Builder</div>
    </div>
  )
}

function FeatureOverlay() {
  const { features, toggleFeature } = useShowcaseStore()

  const featureLabels: [keyof typeof features, string][] = [
    ['pbr', 'PBR'],
    ['ibl', 'IBL'],
    ['shadows', 'Shadows'],
    ['raymarching', 'Ray March'],
    ['particles', 'Particles'],
    ['bloom', 'Bloom'],
    ['dof', 'DOF'],
    ['motionBlur', 'Motion Blur'],
    ['chromaticAberration', 'Chromatic Ab.'],
    ['proceduralTerrain', 'Terrain'],
  ]

  return (
    <div className="absolute top-4 right-4 bg-black/60 text-white rounded-lg p-3 pointer-events-auto text-xs space-y-1 backdrop-blur-sm">
      <div className="font-bold text-sm mb-2 text-gray-200">Graphics Features</div>
      {featureLabels.map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 cursor-pointer hover:text-gray-200">
          <input
            type="checkbox"
            checked={features[key]}
            onChange={() => toggleFeature(key)}
            className="accent-purple-500"
          />
          <span className={features[key] ? 'text-white' : 'text-gray-500'}>{label}</span>
        </label>
      ))}
    </div>
  )
}
