import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Switch } from './ui/switch';
import { notificationCenterService, PlatformNotification } from '../services/notificationCenterService';
import { initSocket, onInstantAlert, offInstantAlert } from '../../lib/socket';
import { toast } from 'sonner';

interface NotificationBellProps {
  apiBase: string;
  userId: string;
}

const soundKey = 'notification_sound_enabled';

export function NotificationBell({ apiBase, userId }: NotificationBellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PlatformNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem(soundKey) !== 'false');

  const topFive = useMemo(() => items.slice(0, 5), [items]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const socket = initSocket(apiBase, userId);

    const onAlert = (payload: any) => {
      const created: PlatformNotification = {
        id: payload.id || crypto.randomUUID(),
        userId,
        title: payload.title || 'New notification',
        message: payload.message || '',
        type: String(payload.type || 'INFO').toUpperCase() as any,
        priority: String(payload.priority || 'MEDIUM').toUpperCase() as any,
        isRead: false,
        createdAt: payload.createdAt || new Date().toISOString(),
      };

      setItems((prev) => [created, ...prev]);
      setUnreadCount((count) => count + 1);

      if (created.priority === 'CRITICAL') {
        toast.error(created.title, { description: created.message });
      } else {
        toast(created.title, { description: created.message });
      }

      if (soundEnabled) {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.25;
        audio.play().catch(() => {});
      }
    };

    onInstantAlert(onAlert);
    return () => {
      offInstantAlert(onAlert);
      socket?.disconnect();
    };
  }, [apiBase, userId, soundEnabled]);

  const loadData = async () => {
    try {
      await notificationCenterService.syncHealthAlerts();
      const response = await notificationCenterService.list('ALL', 1, 10);
      const fetched = response.data || [];
      setItems(fetched);
      setUnreadCount(response.unreadCount || 0);

      const criticalUnread = fetched.find((item) => item.priority === 'CRITICAL' && !item.isRead);
      if (criticalUnread) {
        toast.error(criticalUnread.title, { description: criticalUnread.message });
      }
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    await notificationCenterService.markAllRead();
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  const deleteAll = async () => {
    await notificationCenterService.deleteAll();
    setItems([]);
    setUnreadCount(0);
  };

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem(soundKey, enabled ? 'true' : 'false');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label="notifications">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-red-600 text-white text-[10px] px-1 flex items-center justify-center font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="p-3 border-b flex items-center justify-between">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
          <Badge variant="secondary">{unreadCount} unread</Badge>
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {topFive.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            topFive.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`w-full text-left px-3 py-3 border-b hover:bg-muted/60 transition ${item.isRead ? '' : 'bg-blue-50/50'}`}
                onClick={() => navigate('/notifications')}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate pr-2">{item.title}</p>
                  <Badge variant={item.priority === 'CRITICAL' ? 'destructive' : 'outline'}>{item.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.message}</p>
              </button>
            ))
          )}
        </div>

        <DropdownMenuSeparator />
        <div className="px-3 py-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />} Notification sound
          </span>
          <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
        </div>

        <div className="p-3 grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" onClick={markAllRead} className="gap-1">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
          <Button size="sm" variant="outline" onClick={deleteAll} className="gap-1">
            <Trash2 className="w-4 h-4" /> Delete all
          </Button>
          <Button size="sm" className="col-span-2" onClick={() => navigate('/notifications')}>
            Open Notifications Center
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
