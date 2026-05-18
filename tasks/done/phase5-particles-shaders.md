# Phase 5: Particle Systems & Shader Effects

## Goal

Implement GPU-driven particle effects (magic aura, fire) and raymarched volumetric clouds with atmospheric scattering. Wire all effects to `showcaseStore` toggles and the avatar effects tab.

## Files to Create

### `src/effects/shaders/sky.frag.glsl`
- Rayleigh + Mie atmospheric scattering shader
- Sun disc + halo (migrated from current inline SkyDome shader)
- Uniforms: `uSunDir`, `uSunColor`, `uRayleighCoeff`, `uMieCoeff`, `uMieDirectionalG`

### `src/effects/shaders/raymarching.frag.glsl`
- Volumetric clouds via 3D FBM noise (ray marched)
- Noise: `simplex3d` + FBM with 4-6 octaves
- Uniforms: `uCameraPos`, `uSunDir`, `uTime`, `uCloudScale`, `uCoverage`, `uDensity`
- Blends cloud alpha over sky color

### `src/effects/shaders/particle.vert.glsl` + `particle.frag.glsl`
- Billboarded point sprites
- Vertex shader: size attenuation, circular soft edge
- Fragment shader: soft circle with color tint, alpha fade

### `src/effects/ParticleSystem.tsx`
- React component using R3F hooks
- Two subsystems:
  1. **Magic Aura**: Points following `charPos` ref. Particles orbit spirally around character. Activated by `features.particles && avatarStore.config.auraEnabled`. Color + intensity from avatar config.
  2. **Fire**: Static fire effect at a fixed scene position (e.g., near a crystal cluster). Always rendered when `features.particles` is on.
- Uses `THREE.Points` + `ShaderMaterial` (not InstancedMesh) for GPU-driven billboarding

### `src/effects/RayMarchingPass.tsx`
- Fullscreen shader quad (or inner sphere) for raymarched volumetric clouds
- Renders on top of sky, behind scene objects
- Toggled by `features.raymarching`

### `src/ui/EffectsTab.tsx`
- Fills the "Coming in Phase 5" placeholder in `AvatarBuilder.tsx` Effects tab
- Controls: aura on/off toggle, aura color picker, aura intensity slider

## Files to Modify

### `src/scene/SkyDome.tsx`
- Replace inline GLSL with `import skyFrag from '../effects/shaders/sky.frag.glsl'`
- Add atmospheric scattering uniforms
- Keep `useFrame` for potential time animation

### `src/App.tsx`
- Import and add `<ParticleSystem />` and `<RayMarchingPass />` to the Scene component
- ParticleSystem needs `charPos` ref — already available
- Both wrapped in feature-toggle checks

### `src/avatar/AvatarBuilder.tsx`
- Replace Effects tab placeholder content with `<EffectsTab />`

## Implementation Order

1. Write `sky.frag.glsl` — atmospheric scattering
2. Update `SkyDome.tsx` to use new shader
3. Write `raymarching.frag.glsl` — 3D FBM cloud noise
4. Write `RayMarchingPass.tsx` — fullscreen cloud pass
5. Write `particle.vert.glsl` + `particle.frag.glsl` — billboard shaders
6. Write `ParticleSystem.tsx` — aura + fire
7. Write `EffectsTab.tsx` — avatar builder effects UI
8. Wire everything in `App.tsx` Scene
9. Verify `npm run build` and `npm run lint` pass

## Verification

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds (tsc + vite)
- [ ] Sky dome shows Rayleigh scattering gradient with sun disc
- [ ] Ray marching clouds toggle via Graphics Features panel
- [ ] Magic aura particles follow character, toggle via avatar Effects tab
- [ ] Fire particles render at fixed scene position
- [ ] Particle toggle enables/disables both aura and fire
- [ ] Avatar Effects tab no longer shows "Coming in Phase 5"

## Review

### Files Created (7)
- `src/effects/shaders/sky.frag.glsl` — Rayleigh + Mie atmospheric scattering
- `src/effects/shaders/raymarching.frag.glsl` — 3D FBM noise volumetric clouds
- `src/effects/shaders/particle.vert.glsl` — Billboard point sprite vertex shader
- `src/effects/shaders/particle.frag.glsl` — Soft circle fragment shader
- `src/effects/ParticleSystem.tsx` — Magic aura + fire particle effects
- `src/effects/RayMarchingPass.tsx` — Raymarched clouds on inner sphere
- `src/ui/EffectsTab.tsx` — Avatar builder effects controls

### Files Modified (3)
- `src/scene/SkyDome.tsx` — Uses external sky.frag.glsl shader
- `src/avatar/AvatarBuilder.tsx` — Effects tab replaced with `<EffectsTab />`
- `src/App.tsx` — Added `<ParticleSystem>` and `<RayMarchingPass>` to Scene

### Verification
- [x] `npm run lint` passes (5 pre-existing errors in DustParticles, PlayerController, DecorationObjects only)
- [x] `npm run build` succeeds (tsc + vite)
- [x] Sky dome uses Rayleigh scattering with sun disc
- [x] Ray marching clouds toggle via Graphics Features panel (`features.raymarching`)
- [x] Magic aura particles follow character, toggle via avatar Effects tab
- [x] Fire particles render at fixed scene position (-5, 0.5, 5)
- [x] Particle toggle enables/disables both aura and fire
- [x] Avatar Effects tab no longer shows "Coming in Phase 5"

### Notes
- Particle data uses `geo.userData` pattern to satisfy React 19 hooks immutability rules
- Ray marching uniforms accessed via `meshRef.current.material.uniforms` for same reason
- All new features respect `showcaseStore` feature toggles (default off for raymarching, particles)
- Magic aura also respects `avatarStore` config (auraEnabled, auraColor, auraIntensity)
- Existing `DustParticles.tsx` still active alongside new GPU particle system

### Fixes During Phase 5 (May 18)
- **Point size formula**: Changed from hardcoded `4.0 / -mvPosition.z` to `uScale / -mvPosition.z` with `uScale = viewportHeight * 0.5 / tan(fov * 0.5)` for correct perspective sizing
- **Frustum culling**: Added `frustumCulled={false}` on `<points>` elements — default bounding sphere is incorrect for dynamically moving particles
- **Per-frame bounding sphere**: Added `geo.computeBoundingSphere()` in useFrame as safety
- **Material disposal on Canvas unmount**: Builder preview (`AvatarPreview.tsx`) shared materials with the cached GLTF scene via `scene.clone(true)`. Builder Canvas unmount triggered R3F's dispose logic on the shared materials, corrupting the main scene's avatar. Fixed with `deepCloneScene()` that also clones each `mesh.material` independently.
- **Avatar builder preview re-render loop**: `cloned` was created every render causing the material effect to re-run infinitely, blocking the Canvas from settling. Fixed with `useMemo`.
- **Aura alpha range**: Reduced from `0.2–0.5` (too bright) to `0.1–0.25` at default 0.5 intensity, giving a soft glow at default and good headroom up to 1.0.
- **aSize compounding bug**: `aSize` buffer attribute shared memory with `phaseData.sizes`, causing the size multiplier to compound each frame. Fixed with `.slice()` copy.
- **Particle performance**: Reduced count (200→160 aura, 120→80 fire), moved `performance.now()` outside loop, removed per-frame aColor updates.
- **Removed `useThree()` from sub-components**: R3F v9 store ticks trigger re-renders; moved camera/GL reads to the parent `ParticleSystem` and passed `scale`/`pixelRatio` as props instead.
