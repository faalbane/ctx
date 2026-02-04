import { useEffect, useState, useRef } from 'react'
import { LeftSidebar } from './LeftSidebar'
import { RightSidebar } from './RightSidebar'
import { NeuralCanvas } from '../visualization/NeuralCanvas'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { SettingsPanel } from '../settings/SettingsPanel'
import { SessionPanel } from '../sessions/SessionPanel'
import { useProjectStore } from '../../stores/useProjectStore'
import { useNotificationStore } from '../../stores/useNotificationStore'
import { tauriService } from '../../services/tauriService'

const DEFAULT_LEFT_WIDTH = 256
const DEFAULT_RIGHT_WIDTH = 320
const MIN_SIDEBAR_WIDTH = 200
const MAX_SIDEBAR_WIDTH = 600

export function MainLayout() {
  const { projects, setProjects, selectProject } = useProjectStore()
  const { addNotification } = useNotificationStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('layout-left-width')
    return saved ? parseInt(saved) : DEFAULT_LEFT_WIDTH
  })
  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem('layout-right-width')
    return saved ? parseInt(saved) : DEFAULT_RIGHT_WIDTH
  })
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

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

  // Sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft) {
        const delta = e.clientX - startXRef.current
        const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, startWidthRef.current + delta))
        setLeftWidth(newWidth)
      } else if (isDraggingRight) {
        const delta = startXRef.current - e.clientX
        const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, startWidthRef.current + delta))
        setRightWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      if (isDraggingLeft) {
        localStorage.setItem('layout-left-width', leftWidth.toString())
        setIsDraggingLeft(false)
      } else if (isDraggingRight) {
        localStorage.setItem('layout-right-width', rightWidth.toString())
        setIsDraggingRight(false)
      }
    }

    if (isDraggingLeft || isDraggingRight) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'auto'
        document.body.style.userSelect = 'auto'
      }
    }
  }, [isDraggingLeft, isDraggingRight, leftWidth, rightWidth])

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
        selectProject(null!)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSettingsOpen, selectProject])

  const handleLeftResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    startXRef.current = e.clientX
    startWidthRef.current = leftWidth
    setIsDraggingLeft(true)
  }

  const handleRightResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    startXRef.current = e.clientX
    startWidthRef.current = rightWidth
    setIsDraggingRight(true)
  }

  return (
    <div className="flex flex-col h-screen bg-neural-dark text-white overflow-hidden">
      {/* Main Layout - Flex Row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Projects */}
        <div style={{ width: `${leftWidth}px` }} className="border-r border-neural-purple/30 flex flex-col">
          <LeftSidebar />
        </div>

        {/* Left Resize Handle */}
        <div
          onMouseDown={handleLeftResizeStart}
          className="w-1 bg-neural-purple/30 hover:bg-neural-cyan/50 cursor-col-resize transition group"
        />

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

        {/* Right Resize Handle */}
        <div
          onMouseDown={handleRightResizeStart}
          className="w-1 bg-neural-purple/30 hover:bg-neural-cyan/50 cursor-col-resize transition group"
        />

        {/* Right Sidebar - Threads */}
        <div style={{ width: `${rightWidth}px` }} className="border-l border-neural-purple/30 flex flex-col">
          <RightSidebar />
        </div>
      </div>

      {/* Session Panel - Bottom */}
      <SessionPanel />

      {/* Notification Center */}
      <NotificationCenter />

      {/* Settings Panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
