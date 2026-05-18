

## Review

### Files Created
- `src/effects/PostProcessing.tsx` — EffectComposer with Bloom, DOF, ChromaticAberration, SMAA

### Files Modified
- `src/App.tsx` — Wrapped Scene in `<PostProcessing>` inside Canvas

### Notes
- `MotionBlur` effect not available in `@react-three/postprocessing` v3.0.4 — toggle remains in UI but is a no-op. Needs library upgrade or custom effect for implementation.
- Pass order follows AGENTS.md: `Render → Bloom → DOF → ChromaticAberration → SMAA → Output`
- Bloom defaults on (`features.bloom`), others default off per showcaseStore defaults
- DepthOfField uses `focusDistance` mode (no target tracking needed)
