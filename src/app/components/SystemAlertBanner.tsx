import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { notificationCenterService, SystemAnnouncement } from '../services/notificationCenterService';
import { initSocket, onSystemAnnouncement, offSystemAnnouncement } from '../../lib/socket';
import { useAuth } from '../context/AuthContext';

export function SystemAlertBanner() {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState<SystemAnnouncement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    notificationCenterService
      .getActiveAnnouncement()
      .then((res) => setAnnouncement(res.data || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const socket = initSocket('/api/v1', user.id);

    const handler = (payload: SystemAnnouncement | null) => {
      setAnnouncement(payload || null);
      setDismissed(false);
    };

    onSystemAnnouncement(handler);
    return () => {
      offSystemAnnouncement(handler);
      socket?.disconnect();
    };
  }, [user?.id]);

  if (!announcement || !announcement.active || dismissed) {
    return null;
  }

  return (
    <div className="w-full bg-amber-500 text-black px-4 py-2 text-sm border-b border-amber-600">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold mr-2">{announcement.title}</span>
          <span>{announcement.message}</span>
        </div>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss announcement">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
