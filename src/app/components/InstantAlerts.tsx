import React, { useEffect, useState } from 'react';
import { Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { initSocket, onInstantAlert, disconnectSocket } from '../../lib/socket';

interface Alert {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface InstantAlertsProps {
  userId: string;
  apiBase: string;
}

const InstantAlerts: React.FC<InstantAlertsProps> = ({ userId, apiBase }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = initSocket(apiBase, userId);
    
    onInstantAlert((payload) => {
      const newAlert: Alert = {
        id: payload.id || Date.now().toString(),
        title: payload.title,
        message: payload.message,
        createdAt: payload.createdAt || new Date().toISOString(),
        read: false,
      };
      setAlerts(prev => [newAlert, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
      }, 5000);
    });

    return () => disconnectSocket();
  }, [userId, apiBase]);

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-2">
      {unreadCount > 0 && (
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Bell className="w-4 h-4" />
          تنبيهات جديدة ({unreadCount})
        </div>
      )}
      
      <div className="max-h-64 overflow-y-auto space-y-2">
        {alerts.map(alert => (
          <div
            key={alert.id}
            onClick={() => markAsRead(alert.id)}
            className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-blue-900">{alert.title}</h4>
                <p className="text-xs text-blue-700 mt-1">{alert.message}</p>
                <time className="text-xs text-blue-500 mt-1 block">
                  {new Date(alert.createdAt).toLocaleString('ar-EG')}
                </time>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstantAlerts;
