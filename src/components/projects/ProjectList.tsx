import { useState, useRef, useEffect } from 'react'
import { useProjectStore, type Project } from '../../stores/useProjectStore'
import { tauriService } from '../../services/tauriService'

interface ProjectListProps {
  projects: Project[]
}

interface EditingState {
  projectId: string
  newName: string
}

export function ProjectList({ projects }: ProjectListProps) {
  const { selectedProjectId, selectProject, toggleFavorite, renameProject } = useProjectStore()
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [contextMenu, setContextMenu] = useState<{ projectId: string; x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleDoubleClick = (project: Project) => {
    setEditing({ projectId: project.id, newName: project.name })
  }

  const handleContextMenu = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault()
    setContextMenu({ projectId, x: e.clientX, y: e.clientY })
  }

  const handleRenameConfirm = async (oldId: string, newName: string) => {
    if (newName.trim() && newName !== oldId) {
      try {
        await tauriService.renameProject(oldId, newName)
        renameProject(oldId, newName)
      } catch (error) {
        console.error('Failed to rename project:', error)
      }
    }
    setEditing(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent, oldId: string) => {
    if (e.key === 'Enter') {
      handleRenameConfirm(oldId, editing?.newName || '')
    } else if (e.key === 'Escape') {
      setEditing(null)
    }
  }

  return (
    <>
      <div className="space-y-1 px-2">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => selectProject(project.id)}
            onDoubleClick={() => handleDoubleClick(project)}
            onContextMenu={(e) => handleContextMenu(e, project.id)}
            className={`flex items-center justify-between p-3 rounded cursor-pointer transition ${
              selectedProjectId === project.id
                ? 'bg-neural-purple/30 border border-neural-purple/50'
                : 'hover:bg-neural-purple/10'
            }`}
          >
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-2 h-2 rounded-full bg-neural-cyan mr-2 flex-shrink-0" />
              {editing?.projectId === project.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editing.newName}
                  onChange={(e) => setEditing({ ...editing, newName: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, project.id)}
                  onBlur={() => handleRenameConfirm(project.id, editing.newName)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm bg-neural-dark border border-neural-cyan/50 rounded px-2 py-1 text-neural-cyan focus:outline-none focus:border-neural-cyan"
                />
              ) : (
                <span className="text-sm truncate">{project.name}</span>
              )}
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

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed bg-neural-dark border border-neural-purple/50 rounded shadow-lg z-50 py-1"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
          >
            <button
              onClick={() => {
                const project = projects.find((p) => p.id === contextMenu.projectId)
                if (project) {
                  handleDoubleClick(project)
                  setContextMenu(null)
                }
              }}
              className="w-full px-4 py-2 text-sm text-left hover:bg-neural-purple/20 transition"
            >
              Rename
            </button>
          </div>
        </>
      )}
    </>
  )
}
