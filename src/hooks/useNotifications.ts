import { useEffect } from 'react'
import { useNotificationStore } from '../stores/useNotificationStore'
import { useProjectStore } from '../stores/useProjectStore'

export function useNotifications() {
  const { addNotification } = useNotificationStore()
  const { selectedProjectId } = useProjectStore()

  useEffect(() => {
    // Monitor for session updates and detect waiting states
    // This would integrate with the Tauri backend to listen for events

    // Example: When a session is waiting for user input
    const handleWaitingState = () => {
      addNotification({
        type: 'warning',
        title: 'Action Required',
        message: 'Claude Code session is waiting for input',
        read: false,
      })
    }

    // Example: When a session completes
    const handleSessionComplete = () => {
      addNotification({
        type: 'success',
        title: 'Session Complete',
        message: 'Claude Code session has finished processing',
        read: false,
      })
    }

    // Set up event listeners when component mounts
    // In production, these would connect to Tauri events

    return () => {
      // Clean up listeners
    }
  }, [addNotification, selectedProjectId])
}
