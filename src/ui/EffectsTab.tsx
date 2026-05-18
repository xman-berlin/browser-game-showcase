import { useAvatarStore } from '../store/avatarStore'

export default function EffectsTab() {
  const { config, setConfig } = useAvatarStore()

  return (
    <div className="space-y-4 text-xs">
      {/* Aura on/off */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.auraEnabled}
          onChange={(e) => setConfig({ auraEnabled: e.target.checked })}
          className="accent-purple-500"
        />
        <span>Magic Aura</span>
      </label>

      {/* Aura color */}
      <div className="space-y-1">
        <span className="text-gray-400">Aura Color</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={config.auraColor}
            onChange={(e) => setConfig({ auraColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-white/20 bg-transparent"
          />
          <span className="text-gray-500 font-mono">{config.auraColor}</span>
        </div>
      </div>

      {/* Aura intensity */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">Intensity</span>
          <span className="text-gray-500">{Math.round(config.auraIntensity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={config.auraIntensity}
          onChange={(e) => setConfig({ auraIntensity: parseFloat(e.target.value) })}
          className="w-full accent-purple-500"
        />
      </div>

      <p className="text-gray-500 pt-2 border-t border-white/10">
        Particles must be enabled in the Graphics Features panel.
      </p>
    </div>
  )
}
