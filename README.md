# Browser Game Showcase

Maximale Browser-Grafik mit spielbarem Charakter und Avatar-Builder — eine interaktive Tech-Demo, die das grafische Maximum moderner Browser-Technologie (2025) demonstriert.

## About

Eine interaktive Tech-Demo, die das grafische Maximum moderner Browser-Technologie zeigt. Der Nutzer steuert einen Charakter durch eine prozedurale Szene mit PBR-Materialien, Echtzeit-Schatten, GPU-Partikeln, Post-Processing und Ray-Marching-Effekten. Ein integrierter Avatar-Builder erlaubt Echtzeit-Customization mit sofortiger visueller Vorschau. Alle Grafik-Features sind als UI-Switches sichtbar — das Projekt dient bewusst als Showcase-Referenz für zukünftige Spieleprojekte.

## Grafik-Features

- **PBR Materials** — Clearcoat, Transmission/IOR, Iridescence, IBL
- **Ray Marching** — Volumetrische Wolken, SDF-Objekte, God Rays
- **Prozedurale Welt** — Shader-generiertes Terrain via Simplex Noise
- **GPU-Partikel** — GPUComputationRenderer: Feuer, Magie-Aura, Staub
- **Post-Processing** — Bloom, Depth of Field, Motion Blur, Chromatic Aberration, SMAA
- **Dynamische Schatten** — PCFSoftShadowMap + Cascaded Shadow Maps
- **Feature-Panel** — Jeden Grafik-Layer einzeln an/ausschalten

## Avatar-Builder

- Körper-Morphs (Größe, Proportionen, Körperbau)
- Farb-Customization (Haut, Haar, Augen via HSL-Picker)
- Outfit-Presets (Krieger, Magier, Dieb, Sci-Fi)
- Material-Presets (Leder, Metall, Stoff, Energie-Schild)
- Magische Aura mit Partikel-Intensität
- Export/Import als JSON (localStorage-Persistenz)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite, TypeScript |
| 3D Engine | Three.js r167 (WebGPU Renderer + WebGL2 Fallback) |
| React-3D | @react-three/fiber + @react-three/drei |
| Post-Processing | @react-three/postprocessing |
| Partikel (GPU) | GPUComputationRenderer |
| Shader | GLSL + Three.js NodeMaterial |
| State | Zustand |
| Styling | Tailwind CSS |
| Deployment | Vercel / Netlify |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone git@github.com:<your-username>/browser-game-showcase.git
cd browser-game-showcase
npm install
```

### Environment Variables

```bash
# .env.local
VITE_WEBGPU_ENABLED=true   # WebGPU Renderer aktivieren (Fallback: WebGL2)
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Steuerung

| Taste | Aktion |
|-------|--------|
| WASD | Charakter bewegen |
| Maus | Kamera drehen |
| Tab | Avatar-Builder öffnen |
| F | Feature-Panel öffnen |

## Project Status

- [ ] Phase 1: Projektsetup & Rendering-Grundgerüst
- [ ] Phase 2: Prozedurale Welt & PBR-Materialien
- [ ] Phase 3: Spielbarer Charakter & Kamera
- [ ] Phase 4: Avatar-Builder
- [ ] Phase 5: Partikel-Systeme & Shader-Effekte
- [ ] Phase 6: Post-Processing & Final Polish

See [plan.md](./plan.md) for the full implementation plan.
