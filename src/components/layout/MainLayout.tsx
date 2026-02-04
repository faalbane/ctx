import { useEffect, useState } from 'react'
import { LeftSidebar } from './LeftSidebar'
import { RightSidebar } from './RightSidebar'
import { NeuralCanvas } from '../visualization/NeuralCanvas'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { SettingsPanel } from '../settings/SettingsPanel'
import { useProjectStore } from '../../stores/useProjectStore'
import { useNotificationStore } from '../../stores/useNotificationStore'
import { tauriService } from '../../services/tauriService'

export function MainLayout() {
  const { projects, setProjects, selectProject } = useProjectStore()
  const { addNotification } = useNotificationStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true)
      try {
        const projectList = await tauriService.scanProjects()
        setProjects(projectList)

        if (projectList.length > 0) {
          addNotification({
            type: 'success',
            title: 'Projects Loaded',
            message: `Found ${projectList.length} Claude Code project(s)`,
            read: false,
          })
        } else {
          addNotification({
            type: 'info',
            title: 'No Projects',
            message: 'Create a Claude Code session to get started',
            read: false,
          })
        }
      } catch (error) {
        console.error('Failed to load projects:', error)
        addNotification({
          type: 'error',
          title: 'Failed to Load Projects',
          message: 'Could not scan ~/.claude/projects directory',
          read: false,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()

    // Refresh projects every 5 seconds
    const interval = setInterval(loadProjects, 5000)

    return () => clearInterval(interval)
  }, [setProjects, addNotification])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + T for settings
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault()
        setIsSettingsOpen(!isSettingsOpen)
      }

      // Cmd/Ctrl + K for search (future feature)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // TODO: Open search dialog
      }

      // ESC to clear selection
      if (e.key === 'Escape') {
        selectProject(null as any)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSettingsOpen, selectProject])

  return (
    <div className="flex h-screen bg-neural-dark text-white overflow-hidden">
      {/* Left Sidebar - Projects */}
      <div className="w-64 border-r border-neural-purple/30 flex flex-col">
        <LeftSidebar />
      </div>

      {/* Center - Neural Visualization */}
      <div className="flex-1 relative">
        <NeuralCanvas projects={projects} />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-neural-cyan"></div>
          </div>
        )}

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-4 left-4 p-2 bg-neural-purple/20 hover:bg-neural-purple/40 rounded-lg transition text-sm"
          title="Settings (⌘T)"
        >
          ⚙️
        </button>
      </div>

      {/* Right Sidebar - Threads */}
      <div className="w-80 border-l border-neural-purple/30 flex flex-col">
        <RightSidebar />
      </div>

      {/* Notification Center */}
      <NotificationCenter />

      {/* Settings Panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
