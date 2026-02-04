import { useState, useEffect } from 'react'
import { useProjectStore } from '../../stores/useProjectStore'
import { useThreadStore } from '../../stores/useThreadStore'
import { tauriService } from '../../services/tauriService'
import { ThreadList } from '../threads/ThreadList'

export function RightSidebar() {
  const { selectedProjectId } = useProjectStore()
  const { threads, setThreads } = useThreadStore()
  const [loading, setLoading] = useState(false)

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
        const threads = sessions.map((sessionId, index) => ({
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

  return (
    <div className="flex flex-col h-full bg-neural-dark">
      {/* Header */}
      <div className="p-4 border-b border-neural-purple/30">
        <h2 className="text-lg font-semibold">Threads</h2>
        {selectedProjectId && (
          <p className="text-xs text-neural-cyan mt-1">{selectedProjectId}</p>
        )}
      </div>

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
