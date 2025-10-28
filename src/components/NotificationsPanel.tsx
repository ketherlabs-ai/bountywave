import { Bell, Check, CheckCheck, Trash2, X, AlertCircle } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationsContext';
import { useState } from 'react';

export function NotificationsPanel() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bounty_created':
        return '🎯';
      case 'submission_received':
        return '💡';
      case 'winner_selected':
        return '🏆';
      case 'vote_received':
        return '🗳️';
      case 'payment_received':
        return '💰';
      case 'deadline_reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'winner_selected':
      case 'payment_received':
        return 'from-accent-500/20 to-green-500/20 border-accent-500/30';
      case 'bounty_created':
        return 'from-primary-500/20 to-blue-500/20 border-primary-500/30';
      case 'deadline_reminder':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      default:
        return 'from-neutral-700/20 to-neutral-600/20 border-neutral-600/30';
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return notifDate.toLocaleDateString();
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-neutral-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-neutral-950 text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-96 max-h-[600px] bg-neutral-900 border border-white/10 rounded-xl shadow-glow z-50 overflow-hidden">
            <div className="sticky top-0 bg-neutral-900 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-accent-400" />
                <h3 className="font-semibold text-white">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-accent-500/20 text-accent-400 text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck size={16} className="text-neutral-400" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} className="text-neutral-400" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell size={48} className="text-neutral-600 mb-3" />
                  <div className="text-neutral-400 text-sm">
                    No tienes notificaciones
                  </div>
                  <div className="text-neutral-500 text-xs mt-1">
                    Te notificaremos sobre nuevos retos y actividades
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group p-4 hover:bg-white/5 transition-all cursor-pointer ${
                        !notification.read ? 'bg-white/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0 text-xl`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm font-semibold ${notification.read ? 'text-neutral-300' : 'text-white'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-accent-400 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-500">
                              {formatTime(notification.created_at)}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                  title="Marcar como leída"
                                >
                                  <Check size={12} className="text-accent-400" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={12} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="sticky bottom-0 bg-neutral-900 border-t border-white/10 p-3 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function NotificationPermissionBanner() {
  const [show, setShow] = useState(true);
  const [requesting, setRequesting] = useState(false);

  if (!show || !('Notification' in window) || Notification.permission === 'granted') {
    return null;
  }

  if (Notification.permission === 'denied') {
    return null;
  }

  const handleRequestPermission = async () => {
    setRequesting(true);
    const granted = await Notification.requestPermission();
    if (granted === 'granted') {
      setShow(false);
    }
    setRequesting(false);
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-gradient-to-r from-primary-900 to-primary-800 border border-primary-500/30 rounded-xl p-4 shadow-glow z-50">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-primary-400 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-1 text-sm">
            Habilita las notificaciones
          </h4>
          <p className="text-neutral-300 text-xs mb-3">
            Recibe alertas sobre nuevos retos, votos y recompensas
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestPermission}
              disabled={requesting}
              className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {requesting ? 'Solicitando...' : 'Habilitar'}
            </button>
            <button
              onClick={() => setShow(false)}
              className="px-3 py-1.5 text-neutral-400 hover:text-white text-xs transition-colors"
            >
              Más tarde
            </button>
          </div>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
