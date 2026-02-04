import { useState } from 'react'
import { useNotificationStore } from '../../stores/useNotificationStore'

export function NotificationCenter() {
  const { notifications, markAsRead, removeNotification, clearNotifications } = useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification bell icon */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3 bg-neural-purple rounded-full hover:bg-neural-purple/80 transition shadow-lg"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification dropdown */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-96 bg-neural-dark border border-neural-purple/50 rounded-lg shadow-2xl max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neural-purple/30 bg-neural-purple/10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <p className="text-xs text-gray-400 mt-1">{unreadCount} unread</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-200 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Notifications list */}
            {notifications.length > 0 ? (
              <div className="overflow-y-auto flex-1 divide-y divide-neural-purple/10">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition hover:bg-neural-purple/5 ${
                      notification.read ? 'opacity-70' : 'bg-neural-purple/5'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg flex-shrink-0">
                          {notification.type === 'error' && '❌'}
                          {notification.type === 'warning' && '⚠️'}
                          {notification.type === 'success' && '✅'}
                          {notification.type === 'info' && 'ℹ️'}
                        </span>
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-xs text-gray-500 hover:text-red-400 transition flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 ml-7">{notification.message}</p>
                    <div className="flex gap-2 ml-7">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-neural-cyan hover:text-neural-blue transition"
                        >
                          Mark as read
                        </button>
                      )}
                      <span className="text-xs text-gray-600">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            )}

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-neural-purple/30 bg-neural-purple/5">
                <button
                  onClick={() => clearNotifications()}
                  className="w-full text-xs text-neural-cyan hover:text-neural-blue transition py-2"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
