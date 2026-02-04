import { useState, useEffect } from 'react'
import { useProjectStore } from '../../stores/useProjectStore'
import { useThreadStore } from '../../stores/useThreadStore'
import { useLiveSessionStore } from '../../stores/useLiveSessionStore'
import { tauriService } from '../../services/tauriService'
import { ThreadList } from '../threads/ThreadList'

export function RightSidebar() {
  const { selectedProjectId } = useProjectStore()
  const { threads, setThreads } = useThreadStore()
  const { sessions } = useLiveSessionStore()
  const [loading, setLoading] = useState(false)
  const [launching, setLaunching] = useState(false)

  const activeSessions = selectedProjectId ? sessions.filter(s => s.projectId === selectedProjectId) : []

  useEffect(() => {
    if (!selectedProjectId) {
      setThreads([])
      return
    }

    const loadSessions = async () => {
      setLoading(true)
      try {
        const sessions = await tauriService.listSessions(selectedProjectId)

        // Convert sessions to threads
        const threads = sessions.map((sessionId) => ({
          id: sessionId,
          session_id: sessionId,
          name: sessionId,
          agents: [],
          message_count: 0,
        }))

        setThreads(threads)
      } catch (error) {
        console.error('Failed to load sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [selectedProjectId, setThreads])

  const handleLaunchSession = async () => {
    if (!selectedProjectId) return

    setLaunching(true)
    try {
      await tauriService.spawnClaudeSession(selectedProjectId)
    } catch (error) {
      console.error('Failed to launch session:', error)
    } finally {
      setLaunching(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-neural-dark">
      {/* Header */}
      <div className="p-4 border-b border-neural-purple/30">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Threads</h2>
          {activeSessions.length > 0 && (
            <span className="text-xs bg-neural-cyan/20 text-neural-cyan px-2 py-1 rounded">
              {activeSessions.length} live
            </span>
          )}
        </div>
        {selectedProjectId && (
          <p className="text-xs text-neural-cyan mt-1">{selectedProjectId}</p>
        )}
      </div>

      {/* Launch Session Button */}
      {selectedProjectId && (
        <div className="p-3 border-b border-neural-purple/20">
          <button
            onClick={handleLaunchSession}
            disabled={launching || activeSessions.length >= 5}
            className="w-full px-3 py-2 bg-neural-cyan/20 hover:bg-neural-cyan/40 disabled:opacity-50 disabled:cursor-not-allowed text-sm rounded transition font-medium"
          >
            {launching ? 'Launching...' : '+ Launch Session'}
          </button>
          {activeSessions.length >= 5 && (
            <p className="text-xs text-orange-400 mt-2">Max 5 concurrent sessions reached</p>
          )}
        </div>
      )}

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {!selectedProjectId ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Select a project to view threads
          </div>
        ) : loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Loading threads...
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No threads in this project
          </div>
        ) : (
          <ThreadList threads={threads} />
        )}
      </div>
    </div>
  )
}
