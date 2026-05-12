import { useAvatarStore } from '../store/avatarStore'

const keys = ['height', 'shoulderWidth', 'bodyBuild', 'faceShape', 'eyeShape', 'noseShape'] as const

const labels: Record<string, string> = {
  height: 'Height',
  shoulderWidth: 'Shoulder Width',
  bodyBuild: 'Body Build',
  faceShape: 'Face Shape',
  eyeShape: 'Eye Shape',
  noseShape: 'Nose Shape',
}

export default function BodyOptions() {
  const { config, setConfig } = useAvatarStore()

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">Morph targets — requires model with blendshapes (Blender preparation needed)</p>
      {keys.map(key => (
        <div key={key}>
          <div className="flex justify-between text-xs mb-1">
            <span>{labels[key]}</span>
            <span className="text-gray-500">{config[key].toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={config[key]}
            onChange={e => setConfig({ [key]: parseFloat(e.target.value) })}
            className="w-full accent-purple-500 h-1 rounded-full appearance-none bg-gray-700 cursor-pointer"
          />
        </div>
      ))}
    </div>
  )
}
