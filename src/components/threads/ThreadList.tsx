import { useState } from 'react'
import { useThreadStore, type Thread } from '../../stores/useThreadStore'

interface ThreadListProps {
  threads: Thread[]
}

export function ThreadList({ threads }: ThreadListProps) {
  const { selectedThreadId, selectThread, renameThread, archiveThread } = useThreadStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const startEdit = (thread: Thread) => {
    setEditingId(thread.id)
    setEditingName(thread.name)
  }

  const saveEdit = (threadId: string) => {
    if (editingName.trim()) {
      renameThread(threadId, editingName)
    }
    setEditingId(null)
  }

  return (
    <div className="space-y-1 px-2">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className={`flex items-center justify-between p-3 rounded transition ${
            selectedThreadId === thread.id
              ? 'bg-neural-purple/30 border border-neural-purple/50'
              : 'hover:bg-neural-purple/10'
          }`}
        >
          <div
            onClick={() => selectThread(thread.id)}
            className="flex items-center flex-1 min-w-0 cursor-pointer"
          >
            {editingId === thread.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => saveEdit(thread.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(thread.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                className="flex-1 px-2 py-1 bg-neural-dark border border-neural-purple rounded text-sm text-white focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-neural-blue mr-2 flex-shrink-0" />
                <span className="text-sm truncate">{thread.name}</span>
                {thread.message_count > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    {thread.message_count}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="ml-2 flex gap-1 flex-shrink-0">
            <button
              onClick={() => startEdit(thread)}
              className="text-neural-purple hover:text-neural-cyan transition text-xs px-2 py-1"
              title="Rename"
            >
              ✏️
            </button>
            <button
              onClick={() => archiveThread(thread.id)}
              className="text-neural-purple hover:text-neural-cyan transition text-xs px-2 py-1"
              title="Archive"
            >
              📦
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
