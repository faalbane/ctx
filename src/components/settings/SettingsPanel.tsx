import { useState } from 'react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neural-dark border border-neural-purple/50 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
              className="w-full px-3 py-2 bg-neural-dark border border-neural-purple/30 rounded text-sm text-white focus:outline-none focus:border-neural-cyan"
            >
              <option value="dark">Dark (Neural)</option>
              <option value="light">Light</option>
            </select>
          </div>

          {/* Auto Refresh */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Auto-refresh projects</span>
            </label>
            {autoRefresh && (
              <div className="ml-6">
                <label className="text-xs text-gray-400 block mb-1">
                  Interval (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neural-dark border border-neural-purple/30 rounded text-sm text-white focus:outline-none focus:border-neural-cyan"
                />
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>⌘/Ctrl + K</span>
                <span>Search projects</span>
              </div>
              <div className="flex justify-between">
                <span>⌘/Ctrl + T</span>
                <span>Toggle settings</span>
              </div>
              <div className="flex justify-between">
                <span>ESC</span>
                <span>Clear selection</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="pt-4 border-t border-neural-purple/20">
            <h3 className="text-xs font-medium text-gray-500 mb-2">ABOUT</h3>
            <p className="text-xs text-gray-400">
              CTX v1.0.0 - Claude Code IDE with Neural Visualization
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Built with Tauri, React & Three Fiber
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 bg-neural-purple hover:bg-neural-purple/80 rounded text-sm font-medium transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}
