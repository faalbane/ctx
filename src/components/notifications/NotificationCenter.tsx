import { useNotificationStore } from '../../stores/useNotificationStore'

export function NotificationCenter() {
  const { notifications, markAsRead, removeNotification } = useNotificationStore()
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification bell icon */}
      <div className="relative">
        <button className="relative p-3 bg-neural-purple rounded-full hover:bg-neural-purple/80 transition">
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification dropdown */}
        {notifications.length > 0 && (
          <div className="absolute bottom-16 right-0 w-80 bg-neural-dark border border-neural-purple/30 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-neural-purple/30">
              <h3 className="font-semibold text-sm">Notifications</h3>
            </div>

            <div className="divide-y divide-neural-purple/10">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition ${
                    notification.read ? 'opacity-60' : 'bg-neural-purple/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {notification.type === 'error' && '❌'}
                        {notification.type === 'warning' && '⚠️'}
                        {notification.type === 'success' && '✅'}
                        {notification.type === 'info' && 'ℹ️'}
                      </span>
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-xs text-gray-500 hover:text-gray-400"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{notification.message}</p>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-neural-cyan hover:text-neural-blue transition"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
