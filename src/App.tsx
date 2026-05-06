import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import { useShowcaseStore } from './store/showcaseStore'

function Scene() {
  const { features } = useShowcaseStore()

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow={features.shadows} />

      {/* Placeholder geometry until Phase 2 terrain */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* HDR Environment (IBL) */}
      {features.ibl && (
        <Environment
          files="/textures/industrial_sunset_02_4k.hdr"
          background={false}
        />
      )}

      <OrbitControls makeDefault />
    </>
  )
}

export default function App() {
  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas — uses WebGL2 renderer (WebGPU via R3F is not yet stable) */}
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2, 5], fov: 60 }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* UI overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <FeatureOverlay />
      </div>
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
