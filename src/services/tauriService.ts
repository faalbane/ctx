import { invoke } from '@tauri-apps/api/core'
import type { Project } from '../stores/useProjectStore'

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

  async renameProject(oldId: string, newId: string): Promise<void> {
    return invoke('rename_project', { oldId, newId })
  },

  async spawnClaudeSession(projectId: string): Promise<string> {
    return invoke('spawn_claude_session', { projectId })
  },

  async terminateSession(sessionId: string): Promise<void> {
    return invoke('terminate_session', { sessionId })
  },

  async listActiveSessions(): Promise<Array<{ id: string; projectId: string; state: string; createdAt: string; outputCount: number }>> {
    return invoke('list_active_sessions')
  },

  async getActiveSession(sessionId: string): Promise<{ id: string; projectId: string; state: string; createdAt: string; outputCount: number }> {
    return invoke('get_session', { sessionId })
  },

  async getSessionOutput(sessionId: string): Promise<Array<{ timestamp: string; text: string; line_type: string }>> {
    return invoke('get_session_output', { sessionId })
  },
}
