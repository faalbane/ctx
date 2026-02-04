import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Project {
  id: string
  name: string
  path: string
  sessions: string[]
  created_at: string
  is_favorite: boolean
}

interface ProjectStore {
  projects: Project[]
  selectedProjectId: string | null
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  selectProject: (projectId: string) => void
  toggleFavorite: (projectId: string) => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      selectedProjectId: null,
      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),
      selectProject: (projectId) => set({ selectedProjectId: projectId }),
      toggleFavorite: (projectId) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, is_favorite: !p.is_favorite } : p
        ),
      })),
    }),
    {
      name: 'project-store',
    }
  )
)
