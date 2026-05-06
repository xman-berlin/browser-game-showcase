import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Procedural sky dome: horizon-to-zenith gradient with a sun disc
export default function SkyDome() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Sky shader: simple gradient + sun disc
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      uSunDir:    { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
      uZenith:    { value: new THREE.Color('#0a1a40') },
      uHorizon:   { value: new THREE.Color('#e8905a') },
      uGround:    { value: new THREE.Color('#2a1a0a') },
    },
    vertexShader: `
      varying vec3 vWorldDir;
      void main() {
        vWorldDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uSunDir;
      uniform vec3 uZenith;
      uniform vec3 uHorizon;
      uniform vec3 uGround;
      varying vec3 vWorldDir;

      void main() {
        vec3 dir = normalize(vWorldDir);
        float t = clamp(dir.y, -1.0, 1.0);

        // Above horizon: horizon → zenith
        vec3 sky = mix(uHorizon, uZenith, smoothstep(0.0, 0.6, t));
        // Below horizon: horizon → ground
        sky = mix(uGround, sky, smoothstep(-0.15, 0.0, t));

        // Sun disc
        float sunDot = dot(dir, normalize(uSunDir));
        float sun = smoothstep(0.9985, 0.9995, sunDot);
        // Sun halo
        float halo = pow(max(sunDot, 0.0), 16.0) * 0.3;
        sky += vec3(1.0, 0.9, 0.7) * (sun + halo);

        gl_FragColor = vec4(sky, 1.0);
      }
    `,
    depthWrite: false,
  })

  useFrame(() => {
    // Sky is static for Phase 2; Phase 5 will animate clouds
  })

  return (
    <mesh ref={meshRef} material={skyMaterial}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  )
}
