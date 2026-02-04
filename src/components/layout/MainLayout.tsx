import { useEffect } from 'react'
import { LeftSidebar } from './LeftSidebar'
import { RightSidebar } from './RightSidebar'
import { NeuralCanvas } from '../visualization/NeuralCanvas'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { useProjectStore } from '../../stores/useProjectStore'
import { useNotificationStore } from '../../stores/useNotificationStore'
import { tauriService } from '../../services/tauriService'

export function MainLayout() {
  const { projects, setProjects } = useProjectStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    const loadProjects = async () => {
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
      }
    }

    loadProjects()

    // Refresh projects every 5 seconds
    const interval = setInterval(loadProjects, 5000)
    return () => clearInterval(interval)
  }, [setProjects, addNotification])

  return (
    <div className="flex h-screen bg-neural-dark text-white overflow-hidden">
      {/* Left Sidebar - Projects */}
      <div className="w-64 border-r border-neural-purple/30 flex flex-col">
        <LeftSidebar />
      </div>

      {/* Center - Neural Visualization */}
      <div className="flex-1 relative">
        <NeuralCanvas projects={projects} />
      </div>

      {/* Right Sidebar - Threads */}
      <div className="w-80 border-l border-neural-purple/30 flex flex-col">
        <RightSidebar />
      </div>

      {/* Notification Center */}
      <NotificationCenter />
    </div>
  )
}
