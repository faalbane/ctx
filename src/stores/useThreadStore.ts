import { create } from 'zustand'

export interface Thread {
  id: string
  session_id: string
  name: string
  agents: AgentState[]
  message_count: number
}

export interface AgentState {
  id: string
  name: string
  status: 'idle' | 'running' | 'waiting'
}

interface ThreadStore {
  threads: Thread[]
  selectedThreadId: string | null
  setThreads: (threads: Thread[]) => void
  addThread: (thread: Thread) => void
  selectThread: (threadId: string) => void
  renameThread: (threadId: string, name: string) => void
  archiveThread: (threadId: string) => void
}

export const useThreadStore = create<ThreadStore>((set) => ({
  threads: [],
  selectedThreadId: null,
  setThreads: (threads) => set({ threads }),
  addThread: (thread) => set((state) => ({
    threads: [...state.threads, thread]
  })),
  selectThread: (threadId) => set({ selectedThreadId: threadId }),
  renameThread: (threadId, name) => set((state) => ({
    threads: state.threads.map((t) =>
      t.id === threadId ? { ...t, name } : t
    ),
  })),
  archiveThread: (threadId) => set((state) => ({
    threads: state.threads.filter((t) => t.id !== threadId),
  })),
}))
