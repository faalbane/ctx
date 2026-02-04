import { create } from 'zustand'
import { listen } from '@tauri-apps/api/event'

export interface OutputLine {
  timestamp: string
  text: string
  type: 'stdout' | 'stderr'
}

export interface LiveSession {
  id: string
  projectId: string
  state: 'idle' | 'working' | 'waiting'
  output: OutputLine[]
  createdAt: string
}

interface SessionCreatedPayload {
  session_id: string
  project_id: string
}

interface SessionTerminatedPayload {
  session_id: string
}

interface SessionStateChangedPayload {
  session_id: string
  state: 'idle' | 'working' | 'waiting'
}

interface SessionOutputPayload {
  session_id: string
  line: string
  timestamp: string
  type: 'stdout' | 'stderr'
}

interface LiveSessionStore {
  sessions: LiveSession[]
  selectedSessionId: string | null
  addSession: (session: LiveSession) => void
  removeSession: (sessionId: string) => void
  selectSession: (sessionId: string | null) => void
  updateSessionState: (sessionId: string, state: 'idle' | 'working' | 'waiting') => void
  appendOutput: (sessionId: string, line: OutputLine) => void
  clearSessionOutput: (sessionId: string) => void
  getSession: (sessionId: string) => LiveSession | undefined
}

export const useLiveSessionStore = create<LiveSessionStore>((set, get) => {
  // Set up event listeners for Tauri events
  listen<SessionCreatedPayload>('session-created', (event) => {
    const { session_id, project_id } = event.payload
    const newSession: LiveSession = {
      id: session_id,
      projectId: project_id,
      state: 'idle',
      output: [],
      createdAt: new Date().toISOString(),
    }
    set((storeState) => ({
      sessions: [...storeState.sessions, newSession],
    }))
  })

  listen<SessionTerminatedPayload>('session-terminated', (event) => {
    const { session_id } = event.payload
    set((storeState) => ({
      sessions: storeState.sessions.filter((s) => s.id !== session_id),
      selectedSessionId: storeState.selectedSessionId === session_id ? null : storeState.selectedSessionId,
    }))
  })

  listen<SessionStateChangedPayload>('session-state-changed', (event) => {
    const { session_id, state } = event.payload
    set((storeState) => ({
      sessions: storeState.sessions.map((s) =>
        s.id === session_id ? { ...s, state } : s
      ),
    }))
  })

  listen<SessionOutputPayload>('session-output', (event) => {
    const { session_id, line, timestamp, type } = event.payload
    set((storeState) => ({
      sessions: storeState.sessions.map((s) =>
        s.id === session_id
          ? {
              ...s,
              output: [
                ...s.output,
                {
                  timestamp,
                  text: line,
                  type,
                },
              ],
            }
          : s
      ),
    }))
  })

  return {
    sessions: [],
    selectedSessionId: null,

    addSession: (session) =>
      set((state) => ({
        sessions: [...state.sessions, session],
      })),

    removeSession: (sessionId) =>
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        selectedSessionId: state.selectedSessionId === sessionId ? null : state.selectedSessionId,
      })),

    selectSession: (sessionId) =>
      set({ selectedSessionId: sessionId }),

    updateSessionState: (sessionId, newState) =>
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, state: newState } : s
        ),
      })),

    appendOutput: (sessionId, line) =>
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                output: [...s.output, line],
              }
            : s
        ),
      })),

    clearSessionOutput: (sessionId) =>
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, output: [] } : s
        ),
      })),

    getSession: (sessionId) => {
      const { sessions } = get()
      return sessions.find((s) => s.id === sessionId)
    },
  }
})
