import { useAvatarStore } from '../store/avatarStore'

const colorFields: { key: 'skinColor' | 'hairColor' | 'eyeColor'; label: string }[] = [
  { key: 'skinColor', label: 'Skin' },
  { key: 'hairColor', label: 'Hair' },
  { key: 'eyeColor', label: 'Eyes' },
]

const skinPresets = ['#f4c5a0', '#d4a574', '#c68642', '#8d5524', '#6b3a1f', '#3b2314', '#1a0e05']
const hairPresets = ['#1a0e05', '#3b2314', '#6b3a1f', '#8d5524', '#c68642', '#e8c47a', '#d4d4d4', '#ff4444', '#44ff44']
const eyePresets = ['#4a90d9', '#5b8c3e', '#8b5e3c', '#6b3a8d', '#d44444', '#888888']

const presetMap: Record<string, string[]> = {
  skinColor: skinPresets,
  hairColor: hairPresets,
  eyeColor: eyePresets,
}

export default function ColorPicker() {
  const { config, setConfig } = useAvatarStore()

  return (
    <div className="space-y-4">
      {colorFields.map(field => (
        <div key={field.key}>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-6 h-6 rounded-full border border-white/20 shrink-0"
              style={{ backgroundColor: config[field.key] }}
            />
            <span className="text-xs font-medium">{field.label}</span>
            <input
              type="text"
              value={config[field.key]}
              onChange={e => setConfig({ [field.key]: e.target.value })}
              className="ml-auto bg-gray-900 text-xs rounded px-2 py-0.5 w-20 border border-white/10 text-right font-mono"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {presetMap[field.key].map(color => (
              <button
                key={color}
                onClick={() => setConfig({ [field.key]: color })}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  config[field.key] === color ? 'border-white scale-110' : 'border-white/20 hover:border-white/50'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
