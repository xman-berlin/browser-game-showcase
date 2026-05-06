import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AvatarConfig {
  // Body morphs (0–1)
  height: number
  shoulderWidth: number
  bodyBuild: number
  // Face morphs (0–1)
  faceShape: number
  eyeShape: number
  noseShape: number
  // Colors (hex strings)
  skinColor: string
  hairColor: string
  eyeColor: string
  // Outfit
  outfitPreset: 'warrior' | 'mage' | 'rogue' | 'scifi'
  outfitMaterial: 'leather' | 'metal' | 'cloth' | 'energy'
  // Effects
  auraEnabled: boolean
  auraColor: string
  auraIntensity: number
}

const defaultAvatar: AvatarConfig = {
  height: 0.5,
  shoulderWidth: 0.5,
  bodyBuild: 0.5,
  faceShape: 0.5,
  eyeShape: 0.5,
  noseShape: 0.5,
  skinColor: '#f4c5a0',
  hairColor: '#3b2314',
  eyeColor: '#4a90d9',
  outfitPreset: 'warrior',
  outfitMaterial: 'leather',
  auraEnabled: false,
  auraColor: '#7c3aed',
  auraIntensity: 0.5,
}

interface AvatarStore {
  config: AvatarConfig
  setConfig: (partial: Partial<AvatarConfig>) => void
  resetConfig: () => void
  exportConfig: () => string
  importConfig: (json: string) => void
}

export const useAvatarStore = create<AvatarStore>()(
  persist(
    (set, get) => ({
      config: defaultAvatar,
      setConfig: (partial) =>
        set((state) => ({ config: { ...state.config, ...partial } })),
      resetConfig: () => set({ config: defaultAvatar }),
      exportConfig: () => JSON.stringify(get().config, null, 2),
      importConfig: (json) => {
        try {
          const parsed = JSON.parse(json) as AvatarConfig
          set({ config: { ...defaultAvatar, ...parsed } })
        } catch {
          console.error('Failed to parse avatar config JSON')
        }
      },
    }),
    { name: 'avatar-config' }
  )
)
