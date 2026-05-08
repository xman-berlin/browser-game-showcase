import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useShowcaseStore } from './store/showcaseStore'
import ProceduralTerrain from './scene/ProceduralTerrain'
import EnvironmentLighting from './scene/EnvironmentLighting'
import SkyDome from './scene/SkyDome'
import ShadowSetup from './scene/ShadowSetup'
import DecorationObjects from './scene/DecorationObjects'
import PlayerController from './character/PlayerController'

function Scene() {
  return (
    <>
      <SkyDome />
      <ShadowSetup />
      <EnvironmentLighting />
      <ProceduralTerrain />
      <DecorationObjects />
      <PlayerController />
    </>
  )
}

export default function App() {
  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 12, 28], fov: 60 }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 pointer-events-none">
        <FeatureOverlay />
        <ControlsHint />
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
