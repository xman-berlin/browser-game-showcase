# Plan: Browser Game Showcase — Maximale Browser-Grafik mit Avatar-Builder

## Context

Eine interaktive Tech-Demo, die das grafische Maximum moderner Browser-Technologie (2025) zeigt. Der Nutzer steuert einen Charakter durch eine prozedurale Szene mit PBR-Materialien, Echtzeit-Schatten, GPU-Partikeln, Post-Processing und Ray-Marching-Effekten. Ein integrierter Avatar-Builder erlaubt Echtzeit-Customization mit sofortiger visueller Vorschau. Alle Grafik-Features sind als UI-Switches sichtbar — das Projekt dient bewusst als Showcase-Referenz für zukünftige Spieleprojekte.

## Progress

- [ ] Phase 1: Projektsetup & Rendering-Grundgerüst
- [ ] Phase 2: Prozedurale Welt & PBR-Materialien
- [ ] Phase 3: Spielbarer Charakter & Kamera
- [ ] Phase 4: Avatar-Builder
- [ ] Phase 5: Partikel-Systeme & Shader-Effekte
- [ ] Phase 6: Post-Processing & Final Polish

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite, TypeScript |
| 3D Engine | Three.js r167 (WebGPU Renderer mit WebGL2-Fallback) |
| React-3D | @react-three/fiber + @react-three/drei |
| Post-Processing | @react-three/postprocessing |
| Partikel (GPU) | three/examples/jsm/misc/GPUComputationRenderer |
| Shader | GLSL (inline via glsl-literal) + Three.js NodeMaterial |
| State | Zustand |
| Styling | Tailwind CSS |
| Deployment | Vercel / Netlify (statisch) |
| Package Manager | npm |

---

## Project Structure

```
browser-game-showcase/
├── public/
│   ├── models/           # glTF/glb Charakter-Modelle (Mixamo-Rig)
│   ├── textures/         # HDR Environment Maps, PBR Textur-Sets
│   └── animations/       # Charakter-Animationen (.glb)
├── src/
│   ├── main.tsx
│   ├── App.tsx           # Root: Canvas + UI Layer
│   ├── store/
│   │   ├── avatarStore.ts       # Zustand: Avatar-Konfiguration
│   │   └── showcaseStore.ts     # Zustand: aktive Grafik-Features
│   ├── scene/
│   │   ├── SceneRoot.tsx        # R3F Canvas + Lighting Setup
│   │   ├── ProceduralTerrain.tsx # Shader-generiertes Terrain (Simplex Noise)
│   │   ├── SkyDome.tsx          # Prozedurale Atmosphäre + Wolken via Ray Marching
│   │   ├── EnvironmentLighting.tsx # HDR IBL + dynamische Sonne
│   │   └── ShadowSetup.tsx      # CascadedShadowMaps Konfiguration
│   ├── character/
│   │   ├── PlayerController.tsx  # WASD + Kamera-Follow Logic
│   │   ├── CharacterModel.tsx    # glTF-Loader + Morph Targets
│   │   ├── AnimationController.tsx # Idle/Walk/Run Blending
│   │   └── CharacterMaterials.ts  # PBR Material-Definitionen
│   ├── avatar/
│   │   ├── AvatarBuilder.tsx    # UI Panel: Avatar-Customization
│   │   ├── BodyOptions.tsx      # Körper-Morphs (Größe, Proportionen)
│   │   ├── ColorPicker.tsx      # Haut/Haar/Outfit Farben
│   │   └── MaterialPresets.ts   # PBR Material-Presets (Metall, Stoff, Leder)
│   ├── effects/
│   │   ├── ParticleSystem.tsx   # GPU-Partikel: Feuer, Magie, Staub
│   │   ├── RayMarchingPass.tsx  # Custom Fragment Shader: Nebel, SDF-Objekte
│   │   ├── PostProcessing.tsx   # Bloom, DOF, ChromaticAberration, MotionBlur
│   │   └── shaders/
│   │       ├── terrain.vert.glsl
│   │       ├── terrain.frag.glsl
│   │       ├── sky.frag.glsl    # Atmospheric Scattering
│   │       ├── particles.vert.glsl
│   │       └── raymarching.frag.glsl
│   ├── ui/
│   │   ├── HUD.tsx              # Crosshair, Charakter-Stats
│   │   ├── FeaturePanel.tsx     # Grafik-Feature Toggles (Showcase-UI)
│   │   └── AvatarBuilderPanel.tsx # Floating Panel mit Vorschau
│   └── utils/
│       ├── noise.ts             # Simplex Noise Implementierung
│       └── mathUtils.ts
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Grafik-Features im Detail

### PBR Materials (MeshPhysicalMaterial)
- **Clearcoat**: Lackierte Metall-Oberflächen auf Objekten in der Szene
- **Transmission + IOR**: Glas/Kristall-Objekte mit Licht-Brechung
- **Iridescence**: Schillernde Oberflächen (Insekten-Flügel, Ölfilm-Effekt)
- **IBL (Image Based Lighting)**: HDR Environment Map als Lichtquelle
- Roughness/Metalness/Normal/AO Maps für alle Haupt-Objekte

### Ray Marching (Custom Shader)
- Volumetrische Wolken via 3D Noise Ray Marching
- SDF-basierte Objekte (Sphere, Torus, Smooth-Union) als Deko-Elemente
- Atmosphärisches Licht-Streuen (Godrays / God-Rays)

### Prozedurale Terrain-Generierung
- Vertex Shader: Simplex Noise Höhenkarte (mehrere Oktaven)
- Fragment Shader: Automatische Textur-Mischung nach Höhe (Schnee, Fels, Gras)
- Dynamische LOD-Unterteilung via PlaneGeometry subdivision

### GPU-Partikel-System
- GPUComputationRenderer: Position + Velocity auf Texturen
- Effekte: Magische Aura (Charakter), Feuersbrunst, Staub beim Laufen
- Billboarding + Soft-Particles (Tiefenvergleich)

### Post-Processing Pipeline
```
Render → Bloom → DOF → MotionBlur → ChromaticAberration → SMAA → Output
```
- **Bloom**: Leuchtende Partikel, Magie-Effekte, helle Lichtquellen
- **Depth of Field**: Fokus auf Charakter, Hintergrund unscharf
- **Motion Blur**: Bei schneller Bewegung
- **Chromatic Aberration**: Rand-Farbverschiebung für cinematischen Look
- **SMAA**: Anti-Aliasing ohne Performance-Verlust

### Dynamische Schatten
- PCFSoftShadowMap für Charakter und nahe Objekte
- Cascaded Shadow Maps (drei Kaskaden) für Terrain und Distanz-Objekte
- Echtzeit-Schatten-Update bei Bewegung

---

## Avatar-Builder Features

| Kategorie | Optionen |
|-----------|----------|
| Körper | Größe, Schulterbreite, Körperbau (Morph Targets) |
| Gesicht | Gesichtsform, Augenform, Nasenform (Morph Targets) |
| Farben | Hautfarbe (HSL-Picker), Haarfarbe, Augenfarbe |
| Outfit | 4 Presets (Krieger, Magier, Dieb, Sci-Fi) |
| Material | Outfit-Material: Leder, Metall, Stoff, Energie-Schild |
| Effekte | Magische Aura an/aus, Aura-Farbe, Partikel-Intensität |
| Export | Avatar-Config als JSON speichern/laden (localStorage) |

---

## Showcase Feature-Panel (UI Toggles)

Rechtes Panel mit An/Aus-Switches für jeden Grafik-Layer — damit der Unterschied direkt sichtbar ist:

- [ ] PBR Materials (vs. Flat Shading)
- [ ] IBL Environment Lighting
- [ ] Dynamische Schatten
- [ ] Ray Marching Wolken
- [ ] GPU Partikel
- [ ] Bloom
- [ ] Depth of Field
- [ ] Motion Blur
- [ ] Chromatic Aberration
- [ ] Prozedurale Terrain-Texturen

---

## Environment Variables

```bash
# .env.local
VITE_WEBGPU_ENABLED=true   # WebGPU Renderer aktivieren (Fallback: WebGL2)
```

---

## Implementation Checklist

### Phase 1: Projektsetup & Rendering-Grundgerüst
- [ ] Vite + React + TypeScript Projekt initialisieren (`npm create vite@latest`)
- [ ] Abhängigkeiten installieren: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `zustand`, `tailwindcss`
- [ ] `vite.config.ts` mit GLSL-Plugin konfigurieren (`vite-plugin-glsl`)
- [ ] Three.js WebGPU Renderer in R3F einbinden (experimentell, mit WebGL2-Fallback)
- [ ] Basis-Canvas aufsetzen: schwarzer Hintergrund, OrbitControls zum Testen
- [ ] HDR Environment Map laden (Polyhaven kostenlos: `industrial_sunset_02`)
- [ ] Zustand-Stores anlegen: `avatarStore.ts`, `showcaseStore.ts`
- [ ] Tailwind CSS konfigurieren + Basis-Layout (Canvas fullscreen, UI-Overlay)

### Phase 2: Prozedurale Welt & PBR-Materialien
- [ ] `ProceduralTerrain.tsx`: PlaneGeometry (256x256 Segments), Vertex Shader mit Simplex Noise Höhenkarte
- [ ] `terrain.vert.glsl`: Mehrere Noise-Oktaven für natürliches Relief
- [ ] `terrain.frag.glsl`: Höhen-basierte Textur-Mischung (Gras/Fels/Schnee)
- [ ] Dekorations-Objekte platzieren: PBR Steine (Clearcoat), Kristalle (Transmission), Metallskulpturen (Iridescence)
- [ ] `EnvironmentLighting.tsx`: Direktionale Sonne + Hemisphere Light + HDR IBL
- [ ] `SkyDome.tsx`: Gradient-Atmosphäre als Hintergrund (später Ray Marching Wolken)
- [ ] `ShadowSetup.tsx`: PCFSoftShadowMap + CascadedShadowMaps konfigurieren
- [ ] Feature-Toggle für PBR vs. Flat Shading im `showcaseStore`

### Phase 3: Spielbarer Charakter & Kamera
- [ ] Mixamo-Charakter (Y-Bot oder X-Bot) als `.glb` herunterladen + in `public/models/` ablegen
- [ ] Animationen herunterladen: Idle, Walk, Run (separate `.glb` Dateien von Mixamo)
- [ ] `CharacterModel.tsx`: `useGLTF` Loader, Schatten aktivieren (`castShadow`)
- [ ] `AnimationController.tsx`: `useAnimations` + Animation-Blending (Idle↔Walk↔Run)
- [ ] `PlayerController.tsx`: WASD Tastatur-Input, Charakter-Rotation, Bewegungs-Vektor
- [ ] Third-Person-Kamera: folgt Charakter mit smoothem Lerp, Maus-Orbit
- [ ] Kollisionserkennung mit Terrain (Raycast nach unten für Bodenhaftung)
- [ ] Lauf-Staub-Partikel beim Bewegen als einfacher Vorläufer des GPU-Partikel-Systems

### Phase 4: Avatar-Builder
- [ ] Morph Targets im Mixamo-Modell prüfen / mit Blender hinzufügen (Körperbau-Morphs)
- [ ] `AvatarBuilderPanel.tsx`: Slide-in Panel (rechte Seite), Tab-Navigation
- [ ] `BodyOptions.tsx`: Slider-Komponenten für Morph-Target-Werte (Größe, Schultern, Körperbau)
- [ ] `ColorPicker.tsx`: HSL-Farbrad für Haut, Haar, Augen — live auf Material anwenden
- [ ] Outfit-Presets: 4 Outfit-Meshes im Modell als separate Objekte (sichtbar/unsichtbar schalten)
- [ ] Material-Preset-Wechsel: Outfit-Material per Klick ändern (Leder/Metall/Stoff/Energie)
- [ ] Avatar-Config in `avatarStore` speichern + localStorage-Persistenz
- [ ] Export/Import Button: JSON Download + File-Upload für Avatar-Config

### Phase 5: Partikel-Systeme & Shader-Effekte
- [ ] `ParticleSystem.tsx`: GPUComputationRenderer aufsetzen (Positions- + Velocity-Texture)
- [ ] `particles.vert.glsl`: GPU-seitige Positions-Updates via Feedback-Loop
- [ ] Magische Aura: Partikel spiralförmig um Charakter (im Avatar-Builder aktivierbar)
- [ ] Feuer-Effekt: Statisches Feuer-Element in der Szene (Partikel + Heat-Distortion)
- [ ] `RayMarchingPass.tsx`: Custom ShaderMaterial als Fullscreen-Pass
- [ ] `sky.frag.glsl`: Atmospheric Scattering (Rayleigh + Mie) für realistischen Himmel
- [ ] `raymarching.frag.glsl`: Volumetrische Wolken via 3D FBM Noise Ray Marching
- [ ] God Rays: Lichtstrahl-Effekt von der Sonne (Screen-Space Radial Blur)
- [ ] Feature-Toggles für alle Effekte in `showcaseStore` verknüpfen

### Phase 6: Post-Processing & Final Polish
- [ ] `PostProcessing.tsx`: `EffectComposer` mit allen Passes in richtiger Reihenfolge
- [ ] Bloom: `BloomEffect` mit Luminance Threshold, Radius konfigurieren
- [ ] Depth of Field: `DepthOfFieldEffect` mit Charakter als Fokus-Target
- [ ] Motion Blur: `MotionBlurEffect` bei Charakter-Bewegung
- [ ] Chromatic Aberration: `ChromaticAberrationEffect` subtil am Rand
- [ ] SMAA Anti-Aliasing als finaler Pass
- [ ] `FeaturePanel.tsx`: Toggles für alle Post-Processing Effekte
- [ ] Performance-Optimierungen: `instancedMesh` für Terrain-Deko, Frustum Culling prüfen
- [ ] `HUD.tsx`: Kleines Overlay mit FPS-Counter (drei/addons Stats), aktive Features anzeigen
- [ ] README schreiben: Screenshots, Feature-Liste, Steuerung, Tech-Erklärung
- [ ] Deployment auf Vercel / Netlify (statischer Build)
