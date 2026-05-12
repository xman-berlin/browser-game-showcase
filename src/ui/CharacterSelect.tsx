import { useAvatarStore } from '../store/avatarStore'
import type { BaseModel } from '../store/avatarStore'

interface CharacterSelectProps {
  onStart: () => void
}

const characters: { key: BaseModel; label: string; description: string; color: string }[] = [
  { key: 'male', label: 'Male', description: 'Adventurer — Modular parts', color: '#6b8eff' },
  { key: 'female', label: 'Female', description: 'Adventurer — Modular parts', color: '#ff6b9d' },
]

export default function CharacterSelect({ onStart }: CharacterSelectProps) {
  const { config, setConfig } = useAvatarStore()

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">Browser Game Showcase</h1>
        <p className="text-gray-400 text-sm mb-8">Choose your avatar to begin</p>

        <div className="flex gap-4 justify-center mb-8">
          {characters.map(c => (
            <button
              key={c.key}
              onClick={() => setConfig({ baseModel: c.key })}
              className={`w-44 p-6 rounded-xl border-2 transition-all ${
                config.baseModel === c.key
                  ? 'border-purple-400 bg-purple-900/30 shadow-lg shadow-purple-500/20'
                  : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
              }`}
            >
              <div
                className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
                style={{ backgroundColor: c.color + '30', color: c.color }}
              >
                {c.key === 'male' ? '♂' : '♀'}
              </div>
              <div className="font-bold text-white text-sm">{c.label}</div>
              <div className="text-gray-500 text-xs mt-1">{c.description}</div>
            </button>
          ))}
        </div>

        <button
          onClick={onStart}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Enter World
        </button>
      </div>
    </div>
  )
}
