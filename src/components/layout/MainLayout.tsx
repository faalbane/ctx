import { useEffect } from 'react'
import { LeftSidebar } from './LeftSidebar'
import { RightSidebar } from './RightSidebar'
import { NeuralCanvas } from '../visualization/NeuralCanvas'
import { useProjectStore } from '../../stores/useProjectStore'
import { tauriService } from '../../services/tauriService'

export function MainLayout() {
  const { projects, setProjects } = useProjectStore()

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = await tauriService.scanProjects()
        setProjects(projectList)
      } catch (error) {
        console.error('Failed to load projects:', error)
      }
    }

    loadProjects()
  }, [setProjects])

  return (
    <div className="flex h-screen bg-neural-dark text-white">
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
    </div>
  )
}
