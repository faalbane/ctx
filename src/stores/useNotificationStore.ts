import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markAsRead: (notificationId: string) => void
  clearNotifications: () => void
  removeNotification: (notificationId: string) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
      },
      ...state.notifications,
    ],
  })),
  markAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    ),
  })),
  clearNotifications: () => set({ notifications: [] }),
  removeNotification: (notificationId) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== notificationId),
  })),
}))
