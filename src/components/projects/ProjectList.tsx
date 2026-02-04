import { useProjectStore, type Project } from '../../stores/useProjectStore'

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  const { selectedProjectId, selectProject, toggleFavorite } = useProjectStore()

  return (
    <div className="space-y-1 px-2">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => selectProject(project.id)}
          className={`flex items-center justify-between p-3 rounded cursor-pointer transition ${
            selectedProjectId === project.id
              ? 'bg-neural-purple/30 border border-neural-purple/50'
              : 'hover:bg-neural-purple/10'
          }`}
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-2 h-2 rounded-full bg-neural-cyan mr-2 flex-shrink-0" />
            <span className="text-sm truncate">{project.name}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(project.id)
            }}
            className="ml-2 text-neural-purple hover:text-neural-cyan transition"
          >
            {project.is_favorite ? '★' : '☆'}
          </button>
        </div>
      ))}
    </div>
  )
}
