import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useShowcaseStore } from '../store/showcaseStore'
import { useAvatarStore } from '../store/avatarStore'
import particleVert from './shaders/particle.vert.glsl'
import particleFrag from './shaders/particle.frag.glsl'

const AURA_COUNT = 160
const FIRE_COUNT = 80
const FIRE_POS = new THREE.Vector3(-5, 0.5, 5)

function getScale(camera: THREE.PerspectiveCamera, height: number) {
  const fov = camera.fov * Math.PI / 180
  return height * 0.5 / Math.tan(fov * 0.5)
}

function MagicAura({ charPos, color, intensity, enabled, pixelRatio, scale }: {
  charPos: React.RefObject<THREE.Vector3>
  color: THREE.Color
  intensity: number
  enabled: boolean
  pixelRatio: number
  scale: number
}) {
  const pointsRef = useRef<THREE.Points>(null)

  const phaseData = useMemo(() => {
    const phases = new Float32Array(AURA_COUNT)
    const radii = new Float32Array(AURA_COUNT)
    const heights = new Float32Array(AURA_COUNT)
    const sizes = new Float32Array(AURA_COUNT)
    for (let i = 0; i < AURA_COUNT; i++) {
      const angle = (i * 137.5) % 360
      phases[i] = (angle / 360) * Math.PI * 2
      radii[i] = 0.6 + ((i * 7) % 100) / 100 * 1.4
      heights[i] = ((i * 13) % 100) / 100 * 2.5 - 1.25
      sizes[i] = 0.15 + ((i * 3) % 100) / 100 * 0.2
    }
    return { phases, radii, heights, sizes }
  }, [])

  const alphaArr = useMemo(() => new Float32Array(AURA_COUNT), [])
  const positions = useMemo(() => new Float32Array(AURA_COUNT * 3), [])
  const colorArr = useMemo(() => {
    const c = new Float32Array(AURA_COUNT * 3)
    for (let i = 0; i < AURA_COUNT; i++) {
      c[i * 3] = color.r
      c[i * 3 + 1] = color.g
      c[i * 3 + 2] = color.b
    }
    return c
  }, [color])

  useFrame(() => {
    if (!pointsRef.current) return
    const mat = pointsRef.current.material as THREE.ShaderMaterial
    mat.uniforms.uPixelRatio.value = pixelRatio
    mat.uniforms.uScale.value = scale
    mat.opacity = intensity

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const aSize = pointsRef.current.geometry.attributes.aSize.array as Float32Array
    const aAlpha = pointsRef.current.geometry.attributes.aAlpha.array as Float32Array
    const cp = charPos.current
    const now = performance.now() * 0.001

    for (let i = 0; i < AURA_COUNT; i++) {
      const t = phaseData.phases[i] + now * (0.5 + (i % 5) * 0.15)
      pos[i * 3] = cp.x + Math.cos(t) * phaseData.radii[i]
      pos[i * 3 + 1] = cp.y + 1.2 + phaseData.heights[i] + Math.sin(t * 0.7) * 0.3
      pos[i * 3 + 2] = cp.z + Math.sin(t) * phaseData.radii[i]
      aSize[i] = phaseData.sizes[i] * (0.8 + 0.4 * intensity)
      aAlpha[i] = (0.2 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.5))) * intensity
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.aSize.needsUpdate = true
    pointsRef.current.geometry.attributes.aAlpha.needsUpdate = true

    pointsRef.current.geometry.computeBoundingSphere()
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(phaseData.sizes.slice(), 1))
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphaArr, 1))
    geo.setAttribute('aColor', new THREE.BufferAttribute(colorArr, 3))
    geo.computeBoundingSphere()
    return geo
  }, [positions, phaseData.sizes, alphaArr, colorArr])

  if (!enabled) return null

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={particleVert}
        fragmentShader={particleFrag}
        uniforms={{ uPixelRatio: { value: pixelRatio }, uScale: { value: scale } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function FireEffect({ enabled, pixelRatio, scale }: { enabled: boolean; pixelRatio: number; scale: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const mutableRef = useRef<{
    ages: Float32Array; lifetimes: Float32Array; drift: Float32Array
  } | null>(null)

  const fireData = useMemo(() => {
    const pos = new Float32Array(FIRE_COUNT * 3)
    const sz = new Float32Array(FIRE_COUNT)
    const alpha = new Float32Array(FIRE_COUNT)
    const cols = new Float32Array(FIRE_COUNT * 3)

    for (let i = 0; i < FIRE_COUNT; i++) {
      const angle = (i * 97.3) % 360
      const r = ((i * 11) % 100) / 100 * 0.8
      const drx = Math.cos((angle / 360) * Math.PI * 2) * r
      const drz = Math.sin((angle / 360) * Math.PI * 2) * r
      pos[i * 3] = FIRE_POS.x + drx
      pos[i * 3 + 1] = FIRE_POS.y + ((i * 7) % 100) / 100 * 2
      pos[i * 3 + 2] = FIRE_POS.z + drz
      sz[i] = 0.1 + ((i * 5) % 100) / 100 * 0.3
      alpha[i] = 1.0
      const t = ((i * 3) % 100) / 100
      cols[i * 3] = 1.0
      cols[i * 3 + 1] = 0.4 + t * 0.5
      cols[i * 3 + 2] = t * t * 0.3
    }
    return { pos, sz, alpha, cols }
  }, [])

  useEffect(() => {
    const ages = new Float32Array(FIRE_COUNT)
    const lifetimes = new Float32Array(FIRE_COUNT)
    const drift = new Float32Array(FIRE_COUNT * 2)
    for (let i = 0; i < FIRE_COUNT; i++) {
      const angle = (i * 97.3) % 360
      const r = ((i * 11) % 100) / 100 * 0.8
      const drx = Math.cos((angle / 360) * Math.PI * 2) * r
      const drz = Math.sin((angle / 360) * Math.PI * 2) * r
      drift[i * 2] = drx
      drift[i * 2 + 1] = drz
      lifetimes[i] = 1.0 + ((i * 17) % 100) / 100 * 1.5
      ages[i] = ((i * 23) % 100) / 100 * lifetimes[i]
    }
    mutableRef.current = { ages, lifetimes, drift }
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current || !mutableRef.current) return
    const mat = pointsRef.current.material as THREE.ShaderMaterial
    mat.uniforms.uPixelRatio.value = pixelRatio
    mat.uniforms.uScale.value = scale

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const aAlpha = pointsRef.current.geometry.attributes.aAlpha.array as Float32Array
    const { ages, lifetimes, drift } = mutableRef.current

    for (let i = 0; i < FIRE_COUNT; i++) {
      ages[i] += delta
      if (ages[i] >= lifetimes[i]) {
        const angle2 = ((i * 97.3 + i * 7) % 360)
        const r2 = ((i * 11 + i * 3) % 100) / 100 * 0.8
        const drx2 = Math.cos((angle2 / 360) * Math.PI * 2) * r2
        const drz2 = Math.sin((angle2 / 360) * Math.PI * 2) * r2
        pos[i * 3] = FIRE_POS.x + drx2
        pos[i * 3 + 1] = FIRE_POS.y
        pos[i * 3 + 2] = FIRE_POS.z + drz2
        ages[i] = 0
        aAlpha[i] = 1.0
      }

      const t = ages[i] / lifetimes[i]
      pos[i * 3] += drift[i * 2] * delta * 0.5
      pos[i * 3 + 1] += (1.5 + t * 2) * delta
      pos[i * 3 + 2] += drift[i * 2 + 1] * delta * 0.5
      aAlpha[i] = 1.0 - t * t
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.aAlpha.needsUpdate = true

    pointsRef.current.geometry.computeBoundingSphere()
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(fireData.pos, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(fireData.sz, 1))
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(fireData.alpha, 1))
    geo.setAttribute('aColor', new THREE.BufferAttribute(fireData.cols, 3))
    geo.computeBoundingSphere()
    return geo
  }, [fireData])

  if (!enabled) return null

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={particleVert}
        fragmentShader={particleFrag}
        uniforms={{ uPixelRatio: { value: pixelRatio }, uScale: { value: scale } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function ParticleSystem({ charPos }: { charPos: React.RefObject<THREE.Vector3> }) {
  const { features } = useShowcaseStore()
  const { config } = useAvatarStore()
  const { camera, gl, viewport } = useThree()
  const pixelRatio = viewport.dpr
  const scale = getScale(camera as THREE.PerspectiveCamera, gl.domElement.clientHeight)

  const auraColor = useMemo(() => new THREE.Color(config.auraColor), [config.auraColor])

  if (!features.particles) return null

  return (
    <group>
      <MagicAura
        charPos={charPos}
        color={auraColor}
        intensity={config.auraIntensity}
        enabled={config.auraEnabled}
        pixelRatio={pixelRatio}
        scale={scale}
      />
      <FireEffect enabled pixelRatio={pixelRatio} scale={scale} />
    </group>
  )
}
