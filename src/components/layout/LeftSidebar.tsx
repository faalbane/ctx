import { useState } from 'react'
import { useProjectStore } from '../../stores/useProjectStore'
import { ProjectList } from '../projects/ProjectList'

export function LeftSidebar() {
  const [searchTerm, setSearchTerm] = useState('')
  const { projects } = useProjectStore()

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const favoriteProjects = filteredProjects.filter((p) => p.is_favorite)
  const otherProjects = filteredProjects.filter((p) => !p.is_favorite)

  return (
    <div className="flex flex-col h-full bg-neural-dark">
      {/* Header */}
      <div className="p-4 border-b border-neural-purple/30">
        <h2 className="text-lg font-semibold mb-4">Projects</h2>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-neural-dark border border-neural-purple/30 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neural-purple"
        />
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {favoriteProjects.length > 0 && (
          <div className="border-b border-neural-purple/10 py-2">
            <div className="px-4 py-2 text-xs font-semibold text-neural-purple uppercase tracking-wider">
              Favorites
            </div>
            <ProjectList projects={favoriteProjects} />
          </div>
        )}

        {otherProjects.length > 0 && (
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-neural-purple uppercase tracking-wider">
              All Projects
            </div>
            <ProjectList projects={otherProjects} />
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            {projects.length === 0 ? 'No projects found' : 'No matching projects'}
          </div>
        )}
      </div>
    </div>
  )
}
