import { useState, useCallback } from 'react'
import { useAvatarStore } from '../store/avatarStore'
import BodyOptions from './BodyOptions'
import ColorPicker from './ColorPicker'
import OutfitSelector from './OutfitSelector'
import AvatarPreview from './AvatarPreview'
import EffectsTab from '../ui/EffectsTab'
type Tab = 'body' | 'colors' | 'outfit' | 'effects'

export default function AvatarBuilder({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('body')
  const { resetConfig, exportConfig, importConfig } = useAvatarStore()
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)

  const handleExport = useCallback(() => {
    const json = exportConfig()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'avatar-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [exportConfig])

  const handleImport = useCallback(() => {
    importConfig(importText)
    setShowImport(false)
    setImportText('')
  }, [importText, importConfig])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'body', label: 'Body' },
    { key: 'colors', label: 'Colors' },
    { key: 'outfit', label: 'Outfit' },
    { key: 'effects', label: 'Effects' },
  ]

  return (
    <div className="absolute top-0 right-0 h-full w-[750px] bg-black/80 text-white backdrop-blur-md pointer-events-auto flex flex-row z-50 shadow-2xl">
      {/* 3D Preview — left side, cloned scene to avoid shared material corruption */}
      <div className="flex-1 min-w-0 border-r border-white/10">
        <AvatarPreview />
      </div>

      {/* Controls — right side */}
      <div className="w-80 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-bold tracking-wide">Avatar Builder</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div className="flex border-b border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'body' && <BodyOptions />}
          {activeTab === 'colors' && <ColorPicker />}
          {activeTab === 'outfit' && <OutfitSelector />}
          {activeTab === 'effects' && <EffectsTab />}
        </div>

        <div className="border-t border-white/10 p-3 space-y-2">
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 rounded transition-colors">
              Export JSON
            </button>
            <button onClick={() => setShowImport(!showImport)} className="flex-1 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors">
              Import JSON
            </button>
            <button onClick={resetConfig} className="py-1.5 px-3 text-xs bg-red-900/50 hover:bg-red-800/50 rounded transition-colors text-red-300">
              Reset
            </button>
          </div>
          {showImport && (
            <div className="flex gap-2">
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Paste avatar JSON..."
                className="flex-1 bg-gray-900 text-xs rounded px-2 py-1 resize-none h-16 border border-white/10"
              />
              <button onClick={handleImport} className="px-3 py-1 text-xs bg-green-700 hover:bg-green-600 rounded transition-colors self-end">
                Load
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
