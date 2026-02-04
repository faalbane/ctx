import { invoke } from '@tauri-apps/api/core'
import type { Project } from '../stores/useProjectStore'
import type { Thread } from '../stores/useThreadStore'

export interface Session {
  id: string
  project_id: string
  name: string
  messages: Array<{
    id: string
    role: string
    content: unknown
    timestamp: string
  }>
  created_at: string
  updated_at: string
  is_waiting: boolean
}

export const tauriService = {
  async scanProjects(): Promise<Project[]> {
    return invoke('scan_projects')
  },

  async getProject(projectId: string): Promise<Project> {
    return invoke('get_project', { projectId })
  },

  async listSessions(projectId: string): Promise<string[]> {
    return invoke('list_sessions', { projectId })
  },

  async getSession(projectId: string, sessionId: string): Promise<Session> {
    return invoke('get_session', { projectId, sessionId })
  },
}
