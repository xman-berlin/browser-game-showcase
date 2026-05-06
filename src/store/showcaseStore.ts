import { create } from 'zustand'

export interface ShowcaseFeatures {
  pbr: boolean
  ibl: boolean
  shadows: boolean
  raymarching: boolean
  particles: boolean
  bloom: boolean
  dof: boolean
  motionBlur: boolean
  chromaticAberration: boolean
  proceduralTerrain: boolean
}

interface ShowcaseStore {
  features: ShowcaseFeatures
  toggleFeature: (key: keyof ShowcaseFeatures) => void
  setFeature: (key: keyof ShowcaseFeatures, value: boolean) => void
}

const defaultFeatures: ShowcaseFeatures = {
  pbr: true,
  ibl: true,
  shadows: true,
  raymarching: false,
  particles: false,
  bloom: true,
  dof: false,
  motionBlur: false,
  chromaticAberration: false,
  proceduralTerrain: true,
}

export const useShowcaseStore = create<ShowcaseStore>((set) => ({
  features: defaultFeatures,
  toggleFeature: (key) =>
    set((state) => ({
      features: { ...state.features, [key]: !state.features[key] },
    })),
  setFeature: (key, value) =>
    set((state) => ({
      features: { ...state.features, [key]: value },
    })),
}))
