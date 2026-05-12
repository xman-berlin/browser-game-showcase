# AGENTS.md — Browser Game Showcase

## Status

Phases 1-3 complete. Phase 4 (Avatar Builder) is next — see `plan.md`.

## Tech Stack

- React 19 + Vite 8 + TypeScript 6
- Three.js r184 with WebGL2 (R3F `Canvas` default). `VITE_WEBGPU_ENABLED` env var is reserved for future custom renderer path — do not pass `WebGPURenderer` to `Canvas`'s `gl` prop.
- `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`
- Zustand v5 (with `persist` middleware in `avatarStore`)
- Tailwind CSS v3
- Shaders: GLSL files imported via `vite-plugin-glsl` (`*.vert.glsl` / `*.frag.glsl` / `*.glsl`) — NOT `glsl-literal`
- Type declarations for shader imports in `src/glsl.d.ts`

## Commands

```bash
npm run dev       # dev server at localhost:5173
npm run build     # tsc -b && vite build (typecheck + bundle)
npm run lint      # eslint .
npm run preview   # vite preview
```

Build fails on type errors (`tsc -b`). Run `npm run lint` before committing.

## Architecture

- **Entry**: `src/main.tsx` → `src/App.tsx` → R3F `Canvas` + `Scene` component + UI overlay
- **State**:
  - `showcaseStore.ts` — feature toggles (`features` map), `toggleFeature(key)`, `setFeature(key, value)`. All features default on except `raymarching`, `particles`, `dof`, `motionBlur`, `chromaticAberration`.
  - `avatarStore.ts` — avatar config with localStorage persistence (`persist` middleware, key `avatar-config`)
- **Built directories** (with code): `store/`, `scene/` (5 components), `character/` (3 components), `effects/shaders/` (2 terrain shaders)
- **Empty directories** (not yet implemented): `avatar/`, `ui/`, `utils/`

## Important Conventions

- Every new visual feature needs a toggle in `showcaseStore.features` — check before adding effects
- All 3D components use R3F hooks (`useFrame`, `useThree`, `useGLTF`, etc.)
- Post-processing order: `Render → Bloom → DOF → MotionBlur → ChromaticAberration → SMAA → Output` — do not reorder
- Morph targets controlled via `mesh.morphTargetInfluences[]`
- `.glb` models and animations in `public/models/` and `public/animations/` are gitignored (download separately). Current assets: `ybot.glb`, `idle.glb`, `walk.glb`, `run.glb`. HDR env map: `industrial_sunset_02_4k.hdr`.

## Quirks

- `database.db` / `database.db-shm` / `database.db-wal` at repo root are OpenCode tool artifacts — already gitignored
- No tests or CI configured
- `index.html` title is still `browser-game-scaffold`
- No `.env.local` file committed — use `VITE_WEBGPU_ENABLED=true` to enable WebGPU renderer path
- `tsc -b` uses project references (`tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`). `tsconfig.app.json` has `verbatimModuleSyntax: true` — use `import type` for type-only imports.
