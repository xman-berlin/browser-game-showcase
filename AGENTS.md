# AGENTS.md — Browser Game Showcase

## Current Status

**Phase 1 complete.** Project is initialized. `npm install` has been run. Phase 2 (procedural world + PBR materials) is next — see `plan.md`.

**Note on WebGPU**: R3F's `Canvas` does not support `WebGPURenderer` as a drop-in. The project currently uses WebGL2 (Three.js default via R3F). `VITE_WEBGPU_ENABLED` is reserved for a future custom renderer path. Do not attempt to pass `WebGPURenderer` to `Canvas`'s `gl` prop — it will break.

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **3D**: Three.js r167 with WebGPU Renderer (WebGL2 fallback)
- **React-3D**: @react-three/fiber + @react-three/drei
- **Post-Processing**: @react-three/postprocessing
- **GPU Particles**: `three/examples/jsm/misc/GPUComputationRenderer`
- **Shaders**: GLSL via `vite-plugin-glsl` (file imports as raw strings) — **not** `glsl-literal`
- **State**: Zustand
- **Styling**: Tailwind CSS

## Environment Variables

```bash
# .env.local
VITE_WEBGPU_ENABLED=true   # enable WebGPU renderer; omit for WebGL2 fallback
```

## Development Commands

```bash
npm install       # install dependencies
npm run dev       # dev server at localhost:5173
npm run build     # production build
npm run preview   # preview production build
```

No lint, typecheck, or test commands are configured yet — add them when setting up the project.

## Project Structure (planned)

```
src/
├── main.tsx
├── App.tsx               # Root: Canvas + UI layer
├── store/                # avatarStore.ts, showcaseStore.ts (Zustand)
├── scene/                # SceneRoot, ProceduralTerrain, SkyDome, EnvironmentLighting, ShadowSetup
├── character/            # PlayerController, CharacterModel, AnimationController, CharacterMaterials
├── avatar/               # AvatarBuilder UI + logic
├── effects/              # ParticleSystem, RayMarchingPass, PostProcessing
│   └── shaders/          # .vert.glsl / .frag.glsl files
├── ui/                   # HUD, FeaturePanel, AvatarBuilderPanel
└── utils/                # noise.ts (Simplex Noise), mathUtils.ts
public/
├── models/               # Mixamo-rigged .glb character models (Y-Bot / X-Bot)
├── textures/             # HDR env maps (Polyhaven: industrial_sunset_02)
└── animations/           # Character animation .glb files
```

## Key Conventions

- Shader files: `src/effects/shaders/*.vert.glsl` / `*.frag.glsl`, imported via `vite-plugin-glsl` as raw strings
- Every new visual feature needs a toggle in `showcaseStore.features` — check before adding effects
- Avatar config lives in `avatarStore` (Zustand) with localStorage persistence
- Morph targets controlled via `mesh.morphTargetInfluences[]`
- All 3D components use R3F hooks (`useFrame`, `useThree`, `useGLTF`, etc.)

## Graphics Features

Each feature has a toggle in `showcaseStore.features`:

| Key | Description |
|-----|-------------|
| `pbr` | PBR Materials (MeshPhysicalMaterial) vs flat shading |
| `ibl` | Image Based Lighting (HDR env map) |
| `shadows` | Dynamic shadows (PCFSoft + Cascaded) |
| `raymarching` | Volumetric clouds + god rays |
| `particles` | GPU particle systems |
| `bloom` | Bloom post-processing |
| `dof` | Depth of Field |
| `motionBlur` | Motion blur |
| `chromaticAberration` | Chromatic aberration |
| `proceduralTerrain` | Procedural texture blending on terrain |

## Post-Processing Order

```
Render → Bloom → DOF → MotionBlur → ChromaticAberration → SMAA → Output
```

Order matters — do not reorder passes.

## Notes

- No tests or CI pipeline configured yet
- `database.db` files at repo root are OpenCode tool artifacts — add to `.gitignore`
- GPU particles use `GPUComputationRenderer`: position + velocity stored as render textures
- Shaders should handle WebGL2 (GLSL) primarily; WebGPU (NodeMaterial) is experimental
- See `plan.md` for the full 6-phase implementation checklist
