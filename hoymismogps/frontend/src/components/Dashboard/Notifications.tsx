
import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { alerts } = useAppStore();

  // Demo notification on startup
  useEffect(() => {
    const welcomeNotification: Notification = {
      id: 'welcome',
      type: 'success',
      title: 'HoyMismoGPS',
      message: 'Sistema de rastreo GPS en tiempo real activado',
      timestamp: new Date(),
      duration: 5000,
    };
    
    setNotifications([welcomeNotification]);
  }, []);

  // Create notifications from alerts
  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[0];
      if (!latestAlert.isRead) {
        const alertNotification: Notification = {
          id: latestAlert.id || `alert-${Date.now()}`,
          type: latestAlert.alertType === 'offline' ? 'error' : 'warning',
          title: latestAlert.title,
          message: latestAlert.message,
          timestamp: new Date(latestAlert.createdAt),
          duration: 8000,
        };
        
        setNotifications(prev => [alertNotification, ...prev.slice(0, 4)]);
      }
    }
  }, [alerts]);

  // Auto-remove notifications
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [notifications]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-400 to-green-500 text-black shadow-green-400/30';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-yellow-400/30';
      case 'error':
        return 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-400/30';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-blue-400/30';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getNotificationColors(notification.type)}
            p-4 rounded-xl font-medium shadow-2xl slide-in
            transition-all duration-300 hover:scale-105
          `}
        >
          <div className="flex items-start gap-3">
            {getNotificationIcon(notification.type)}
            
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm mb-1">
                {notification.title}
              </div>
              <div className="text-xs opacity-90 break-words">
                {notification.message}
              </div>
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
