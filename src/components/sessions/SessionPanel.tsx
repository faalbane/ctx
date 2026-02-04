import { useEffect, useRef, useState } from 'react'
import { useLiveSessionStore } from '../../stores/useLiveSessionStore'
import { tauriService } from '../../services/tauriService'

export function SessionPanel() {
  const { selectedSessionId, sessions } = useLiveSessionStore()
  const [autoScroll, setAutoScroll] = useState(true)
  const [panelHeight, setPanelHeight] = useState(200)
  const [isDraggingResize, setIsDraggingResize] = useState(false)
  const outputEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedSession = selectedSessionId
    ? sessions.find((s) => s.id === selectedSessionId)
    : null

  // Auto-scroll when new output arrives
  useEffect(() => {
    if (autoScroll && outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedSession?.output.length, autoScroll])

  // Handle resize
  useEffect(() => {
    if (!isDraggingResize) return

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY
      setPanelHeight(Math.max(100, Math.min(newHeight, window.innerHeight - 100)))
    }

    const handleMouseUp = () => {
      setIsDraggingResize(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingResize])

  if (!selectedSession) {
    return null
  }

  return (
    <div
      ref={containerRef}
      style={{ height: `${panelHeight}px` }}
      className="border-t border-neural-purple/30 bg-neural-dark flex flex-col"
    >
      {/* Resize Handle */}
      <div
        onMouseDown={() => setIsDraggingResize(true)}
        className="h-1 bg-neural-purple/30 hover:bg-neural-cyan/50 cursor-ns-resize transition"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-neural-purple/20 bg-neural-dark/50">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              selectedSession.state === 'idle'
                ? 'bg-blue-400'
                : selectedSession.state === 'working'
                  ? 'bg-orange-400 animate-pulse'
                  : 'bg-green-400'
            }`}
          />
          <span className="text-sm font-medium">Session: {selectedSession.id.slice(0, 8)}</span>
          <span className="text-xs text-neural-cyan">
            {selectedSession.projectId} • {selectedSession.output.length} lines
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3"
            />
            Auto-scroll
          </label>
          <button
            onClick={() => {
              const store = useLiveSessionStore.getState()
              store.clearSessionOutput(selectedSession.id)
            }}
            className="px-2 py-1 text-xs bg-neural-purple/20 hover:bg-neural-purple/40 rounded transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto bg-black/30 font-mono text-xs p-3 space-y-0">
        {selectedSession.output.length === 0 ? (
          <div className="text-neural-purple/50 text-center py-4">Waiting for output...</div>
        ) : (
          selectedSession.output.map((line, idx) => (
            <div
              key={idx}
              className={`${
                line.type === 'stderr' ? 'text-red-400' : 'text-neural-cyan'
              } break-all whitespace-pre-wrap`}
            >
              {line.text}
            </div>
          ))
        )}
        <div ref={outputEndRef} />
      </div>

      {/* Input Field */}
      <div className="border-t border-neural-purple/20 p-3 bg-neural-dark/50 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Send input to session..."
          className="flex-1 px-3 py-2 bg-neural-dark border border-neural-purple/30 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neural-cyan"
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              const input = (e.target as HTMLInputElement).value.trim()
              if (input) {
                try {
                  await tauriService.sendInputToSession(selectedSession.id, input + '\n')
                  ;(e.target as HTMLInputElement).value = ''
                } catch (error) {
                  console.error('Failed to send input:', error)
                }
              }
            }
          }}
        />
        <button
          onClick={async () => {
            const inputElement = inputRef.current
            if (inputElement) {
              const input = inputElement.value.trim()
              if (input) {
                try {
                  await tauriService.sendInputToSession(selectedSession.id, input + '\n')
                  inputElement.value = ''
                } catch (error) {
                  console.error('Failed to send input:', error)
                }
              }
            }
          }}
          className="px-3 py-2 bg-neural-cyan/20 hover:bg-neural-cyan/40 text-sm rounded transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
