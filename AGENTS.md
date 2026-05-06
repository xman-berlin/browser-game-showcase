# AGENTS.md — Browser Game Showcase

## Project Overview

A browser-based interactive tech demo showcasing the maximum graphical capabilities of modern browsers (2025). Features a playable character, avatar builder, procedural world, and a comprehensive post-processing pipeline with every effect individually toggleable.

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **3D**: Three.js r167 with WebGPU Renderer (WebGL2 fallback)
- **React-3D**: @react-three/fiber + @react-three/drei
- **Post-Processing**: @react-three/postprocessing
- **GPU Particles**: GPUComputationRenderer
- **Shaders**: GLSL (via vite-plugin-glsl) + Three.js NodeMaterial
- **State**: Zustand
- **Styling**: Tailwind CSS

## Project Structure

```
src/
├── store/          # Zustand stores (avatarStore, showcaseStore)
├── scene/          # R3F scene components (terrain, sky, lighting, shadows)
├── character/      # Player controller, model, animations, materials
├── avatar/         # Avatar builder UI + logic
├── effects/        # Particles, ray marching, post-processing, shaders
│   └── shaders/    # .vert.glsl / .frag.glsl files
└── ui/             # HUD, FeaturePanel, AvatarBuilderPanel
```

## Key Conventions

- All shader files live in `src/effects/shaders/` with `.vert.glsl` / `.frag.glsl` extension
- Imported via `vite-plugin-glsl` as raw strings
- Feature toggles are managed in `showcaseStore` (Zustand)
- Avatar configuration is managed in `avatarStore` (Zustand) with localStorage persistence
- All 3D components use `@react-three/fiber` hooks (`useFrame`, `useThree`, `useGLTF`, etc.)
- Character models are Mixamo-rigged `.glb` files in `public/models/`
- HDR environment maps in `public/textures/`

## Graphics Features

Each feature has a toggle in `showcaseStore.features`:

| Key | Description |
|-----|-------------|
| `pbr` | PBR Materials (MeshPhysicalMaterial) vs flat shading |
| `ibl` | Image Based Lighting (HDR env map) |
| `shadows` | Dynamic shadows (PCFSoft + Cascaded) |
| `raymarching` | Volumetric clouds + god rays |
| `particles` | GPU particle systems |
| `bloom` | Bloom post-processing effect |
| `dof` | Depth of Field |
| `motionBlur` | Motion blur |
| `chromaticAberration` | Chromatic aberration |
| `proceduralTerrain` | Procedural texture blending on terrain |

## Development Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server (localhost:5173)
npm run build     # production build
npm run preview   # preview production build
```

## Implementation Plan

See [plan.md](./plan.md) for the full 6-phase implementation checklist.

## Notes for AI Agents

- Always check `showcaseStore` before adding new visual features — add a toggle for every new effect
- GPU particle systems use `GPUComputationRenderer` — position/velocity stored as render textures
- Shaders must handle both WebGPU (WGSL-like NodeMaterial) and WebGL2 (GLSL) where possible
- Morph targets for the avatar are controlled via `mesh.morphTargetInfluences[]`
- Post-processing order matters: Bloom → DOF → MotionBlur → ChromaticAberration → SMAA
