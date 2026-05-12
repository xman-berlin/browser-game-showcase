import { useAvatarStore } from '../store/avatarStore'

const outfits: { key: 'warrior' | 'mage' | 'rogue' | 'scifi'; label: string }[] = [
  { key: 'warrior', label: 'Warrior' },
  { key: 'mage', label: 'Mage' },
  { key: 'rogue', label: 'Rogue' },
  { key: 'scifi', label: 'Sci-Fi' },
]

const materials: { key: 'leather' | 'metal' | 'cloth' | 'energy'; label: string }[] = [
  { key: 'leather', label: 'Leather' },
  { key: 'metal', label: 'Metal' },
  { key: 'cloth', label: 'Cloth' },
  { key: 'energy', label: 'Energy' },
]

export default function OutfitSelector() {
  const { config, setConfig } = useAvatarStore()

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-400 mb-2">Outfit Preset</p>
        <div className="grid grid-cols-2 gap-2">
          {outfits.map(o => (
            <button
              key={o.key}
              onClick={() => setConfig({ outfitPreset: o.key })}
              className={`py-2 px-3 text-xs rounded border transition-colors ${
                config.outfitPreset === o.key
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-2">Outfit Material</p>
        <div className="grid grid-cols-2 gap-2">
          {materials.map(m => (
            <button
              key={m.key}
              onClick={() => setConfig({ outfitMaterial: m.key })}
              className={`py-2 px-3 text-xs rounded border transition-colors ${
                config.outfitMaterial === m.key
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
