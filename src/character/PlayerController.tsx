import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import CharacterModel from './CharacterModel'
import DustParticles from './DustParticles'
import { useAvatarStore } from '../store/avatarStore'
import { COLLISION_CYLINDERS } from '../scene/DecorationObjects'

const CHAR_RADIUS = 0.4 // character collision radius in world units

// ── Terrain height approximation (mirrors terrain.vert.glsl FBM) ──────────────
function mod289(x: number) { return x - Math.floor(x / 289.0) * 289.0 }

function snoise2(vx: number, vy: number): number {
  const C0 = 0.211324865405187
  const C1 = 0.366025403784439
  const C3 = 0.024390243902439

  const ix = Math.floor(vx + (vx + vy) * C1)
  const iy = Math.floor(vy + (vx + vy) * C1)
  const x0x = vx - ix + (ix + iy) * C0
  const x0y = vy - iy + (ix + iy) * C0

  const i1x = x0x > x0y ? 1 : 0
  const i1y = x0x > x0y ? 0 : 1

  const x1x = x0x - i1x + C0
  const x1y = x0y - i1y + C0
  const x2x = x0x - 1.0 + 2.0 * C0
  const x2y = x0y - 1.0 + 2.0 * C0

  const ii = mod289(ix)
  const jj = mod289(iy)

  const permute = (x: number) => mod289(((x * 34.0) + 1.0) * x)
  const p0 = permute(permute(jj) + ii)
  const p1 = permute(permute(jj + i1y) + ii + i1x)
  const p2 = permute(permute(jj + 1) + ii + 1)

  const m0 = Math.max(0.5 - (x0x * x0x + x0y * x0y), 0)
  const m1 = Math.max(0.5 - (x1x * x1x + x1y * x1y), 0)
  const m2 = Math.max(0.5 - (x2x * x2x + x2y * x2y), 0)

  const gx0 = 2.0 * ((p0 * C3) % 1) - 1
  const gy0 = Math.abs(gx0) - 0.5
  const gx0n = gx0 - Math.floor(gx0 + 0.5)

  const gx1 = 2.0 * ((p1 * C3) % 1) - 1
  const gy1 = Math.abs(gx1) - 0.5
  const gx1n = gx1 - Math.floor(gx1 + 0.5)

  const gx2 = 2.0 * ((p2 * C3) % 1) - 1
  const gy2 = Math.abs(gx2) - 0.5
  const gx2n = gx2 - Math.floor(gx2 + 0.5)

  const m0sq = m0 * m0
  const m1sq = m1 * m1
  const m2sq = m2 * m2

  // Normalization factor (matches GLSL: m *= 1.79284... - 0.85373... * (a0²+h²))
  const n0 = 1.79284291400159 - 0.85373472095314 * (gx0n * gx0n + gy0 * gy0)
  const n1 = 1.79284291400159 - 0.85373472095314 * (gx1n * gx1n + gy1 * gy1)
  const n2 = 1.79284291400159 - 0.85373472095314 * (gx2n * gx2n + gy2 * gy2)

  return 130.0 * (
    (m0sq * m0sq) * n0 * (gx0n * x0x + gy0 * x0y) +
    (m1sq * m1sq) * n1 * (gx1n * x1x + gy1 * x1y) +
    (m2sq * m2sq) * n2 * (gx2n * x2x + gy2 * x2y)
  )
}

function fbm(px: number, py: number): number {
  let value = 0, amp = 0.5, freq = 1.0
  for (let i = 0; i < 6; i++) {
    value += amp * snoise2(px * freq, py * freq)
    freq *= 2.0
    amp  *= 0.5
  }
  return value
}

const TERRAIN_SCALE  = 0.05
const HEIGHT_SCALE   = 5.0

export function getTerrainHeight(worldX: number, worldZ: number): number {
  // Terrain plane rotation: -PI/2 on X axis.
  // local X = world X, local Y = -world Z  (rotation maps local+Y → world-Z)
  const px = worldX * TERRAIN_SCALE
  const py = (-worldZ) * TERRAIN_SCALE
  const h = fbm(px, py) + 0.4 * fbm(px * 0.3 + 3.7, py * 0.3 + 1.9)
  return h * HEIGHT_SCALE
}

// ── Constants ────────────────────────────────────────────────────────────────
const WALK_SPEED = 5.0
const RUN_SPEED  = 10.0
const CAM_DISTANCE = 8.0
const CAM_HEIGHT   = 3.5
const CAM_LERP     = 6.0
const ROTATE_SPEED = 2.5

// ── Input state ──────────────────────────────────────────────────────────────
const keys: Record<string, boolean> = {}

// ── Component ────────────────────────────────────────────────────────────────
export default function PlayerController({ avatarOpen, charPosRef }: { avatarOpen?: boolean; charPosRef?: React.RefObject<THREE.Vector3> }) {
  const groupRef = useRef<THREE.Group>(null!)
  const { camera } = useThree()
  const { baseModel, outfitPreset } = useAvatarStore(s => s.config)

  // Character state
  const charPos   = useRef(new THREE.Vector3(0, 0, 0))
  const charYaw   = useRef(0) // radians, Y-axis rotation
  const speedRef  = useRef(0)

  // Camera orbit
  const camYaw    = useRef(0)
  const camPitch  = useRef(0.25) // slight downward tilt
  const camTarget = useRef(new THREE.Vector3())

  const isOpen = !!avatarOpen

  const avatarOpenRef = useRef(isOpen)
  const isDragging    = useRef(false)
  const lastMouseX    = useRef(0)
  const lastMouseY    = useRef(0)

  // When builder closes, snap camera back to character
  const prevOpenRef = useRef(false)

  useEffect(() => {
    avatarOpenRef.current = isOpen
    if (prevOpenRef.current && !isOpen) {
      const offset = new THREE.Vector3(
        Math.sin(camYaw.current) * CAM_DISTANCE,
        CAM_HEIGHT,
        Math.cos(camYaw.current) * CAM_DISTANCE,
      )
      camTarget.current.set(charPos.current.x, charPos.current.y + 1.6, charPos.current.z)
      camera.position.copy(camTarget.current).add(offset)
      camera.lookAt(camTarget.current)
    }
    prevOpenRef.current = isOpen
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { keys[e.code] = true }
    const onKeyUp   = (e: KeyboardEvent) => { keys[e.code] = false }

    const onMouseDown = (e: MouseEvent) => {
      if (avatarOpenRef.current) return
      const canvas = document.querySelector('canvas')
      if (!canvas?.contains(e.target as Node)) return
      if (e.button === 2 || e.button === 0) {
        isDragging.current = true
        lastMouseX.current = e.clientX
        lastMouseY.current = e.clientY
      }
    }
    const onMouseUp   = () => { isDragging.current = false }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastMouseX.current
      const dy = e.clientY - lastMouseY.current
      lastMouseX.current = e.clientX
      lastMouseY.current = e.clientY
      camYaw.current   -= dx * 0.005
      camPitch.current  = Math.max(0.05, Math.min(1.2, camPitch.current + dy * 0.005))
    }
    const onContextMenu = (e: Event) => e.preventDefault()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup',   onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('contextmenu', onContextMenu)

    // Init character on terrain
    const startY = getTerrainHeight(0, 0)
    charPos.current.set(0, startY, 0)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup',   onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // ── Input ──────────────────────────────────────────────────────────────
    const forward = keys['KeyW'] || keys['ArrowUp']
    const back    = keys['KeyS'] || keys['ArrowDown']
    const left    = keys['KeyA'] || keys['ArrowLeft']
    const right   = keys['KeyD'] || keys['ArrowRight']
    const running = keys['ShiftLeft'] || keys['ShiftRight']

    const moving = forward || back || left || right
    const speed  = moving ? (running ? 2 : 1) : 0
    speedRef.current = speed

    if (moving) {
      // Determine move direction in world XZ based on camera yaw.
      // Camera sits at camYaw offset behind the character (+Z side at camYaw=0).
      // Forward (W) = away from camera = camYaw + PI.
      let inputAngle = camYaw.current + Math.PI
      if (forward && !back)  inputAngle += 0
      else if (back && !forward) inputAngle += Math.PI
      if (left  && !right) inputAngle += Math.PI * 0.5
      if (right && !left)  inputAngle -= Math.PI * 0.5
      if ((forward || back) && (left || right)) {
        if (forward && left)  inputAngle = camYaw.current + Math.PI + Math.PI * 0.25
        if (forward && right) inputAngle = camYaw.current + Math.PI - Math.PI * 0.25
        if (back    && left)  inputAngle = camYaw.current + Math.PI + Math.PI * 0.75
        if (back    && right) inputAngle = camYaw.current + Math.PI - Math.PI * 0.75
      }

      // Smooth character yaw toward movement direction
      let diff = inputAngle - charYaw.current
      while (diff >  Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      charYaw.current += diff * Math.min(1, ROTATE_SPEED * delta)

      // Move — charYaw points in movement direction; sin/cos gives XZ displacement
      charPos.current.x += Math.sin(charYaw.current) * (running ? RUN_SPEED : WALK_SPEED) * delta
      charPos.current.z += Math.cos(charYaw.current) * (running ? RUN_SPEED : WALK_SPEED) * delta

      // Clamp to terrain bounds (80×80 plane)
      charPos.current.x = Math.max(-39, Math.min(39, charPos.current.x))
      charPos.current.z = Math.max(-39, Math.min(39, charPos.current.z))
    }

    // ── Collision push-out ────────────────────────────────────────────────
    for (const col of COLLISION_CYLINDERS) {
      const dx = charPos.current.x - col.x
      const dz = charPos.current.z - col.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      const minDist = col.radius + CHAR_RADIUS
      if (dist < minDist && dist > 0.001) {
        const push = (minDist - dist) / dist
        charPos.current.x += dx * push
        charPos.current.z += dz * push
      }
    }

    // ── Ground snapping ────────────────────────────────────────────────────
    const groundY = getTerrainHeight(charPos.current.x, charPos.current.z)
    charPos.current.y = groundY

    // Sync to shared position ref for builder preview
    if (charPosRef) {
      charPosRef.current.copy(charPos.current)
    }

    // ── Apply to group ─────────────────────────────────────────────────────
    groupRef.current.position.copy(charPos.current)
    groupRef.current.rotation.y = charYaw.current

    // ── Camera (skip when avatar builder is open — OrbitControls takes over) ─
    if (avatarOpenRef.current) return

    const targetPos = charPos.current.clone().add(new THREE.Vector3(0, 1.6, 0))
    const cosP = Math.cos(camPitch.current)
    const sinP = Math.sin(camPitch.current)
    const camOffset = new THREE.Vector3(
      Math.sin(camYaw.current) * cosP * CAM_DISTANCE,
      sinP * CAM_DISTANCE + CAM_HEIGHT,
      Math.cos(camYaw.current) * cosP * CAM_DISTANCE,
    )
    camera.position.lerp(targetPos.clone().add(camOffset), Math.min(1, CAM_LERP * delta))
    camTarget.current.lerp(targetPos, Math.min(1, CAM_LERP * delta))
    camera.lookAt(camTarget.current)
  })

  return (
    <>
      <CharacterModel key={`${baseModel}-${outfitPreset}`} groupRef={groupRef} speedRef={speedRef} />
      <DustParticles charPos={charPos} speedRef={speedRef} />
    </>
  )
}
