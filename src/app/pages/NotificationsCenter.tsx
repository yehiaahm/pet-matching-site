import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { onInstantAlert, initSocket, disconnectSocket, offInstantAlert } from '../../lib/socket';
import { Bell, CheckCircle, MessageSquare, Info, Trash2, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { notificationCenterService, PlatformNotification } from '../services/notificationCenterService';
import { Switch } from '../components/ui/switch';

interface NotificationItem {
  id: string;
  type: 'SYSTEM' | 'WARNING' | 'MAINTENANCE' | 'INFO';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const soundKey = 'notification_sound_enabled';

const NotificationRow: React.FC<{ item: NotificationItem; onRead: (id: string) => void }>
  = ({ item, onRead }) => {
  const icon = item.type === 'WARNING' ? MessageSquare : item.type === 'SYSTEM' ? Info : Bell;
  const Icon = icon;
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted rounded-xl transition">
      <Icon className="w-5 h-5 text-info mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">{item.title}</h4>
          {!item.isRead && <Badge variant="default">جديد</Badge>}
          <Badge variant={item.priority === 'CRITICAL' ? 'destructive' : 'outline'}>{item.priority}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
        <time className="text-xs text-muted-foreground mt-1 block">{new Date(item.createdAt).toLocaleString('ar-EG')}</time>
      </div>
      {!item.isRead && (
        <Button size="sm" variant="secondary" onClick={() => onRead(item.id)}>تم القراءة</Button>
      )}
    </div>
  );
};

const NotificationsCenter: React.FC<{ apiBase: string; userId: string }> = ({ apiBase, userId }) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [tab, setTab] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem(soundKey) !== 'false');

  const unreadCount = useMemo(() => items.filter((it) => !it.isRead).length, [items]);

  const loadNotifications = async (currentType = tab) => {
    try {
      setLoading(true);
      await notificationCenterService.syncHealthAlerts();
      const response = await notificationCenterService.list(currentType, 1, 100);
      setItems((response.data || []) as NotificationItem[]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load notifications';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const socket = initSocket(apiBase, userId);
    loadNotifications('ALL');

    const handler = (payload: any) => {
      const item: NotificationItem = {
        id: payload.id || crypto.randomUUID(),
        type: String(payload.type || 'INFO').toUpperCase() as any,
        priority: String(payload.priority || 'MEDIUM').toUpperCase() as any,
        title: payload.title || 'تنبيه جديد',
        message: payload.message || 'لديك إشعار جديد',
        createdAt: payload.createdAt || new Date().toISOString(),
        isRead: false,
      };
      setItems(prev => [item, ...prev]);
      if (item.priority === 'CRITICAL') {
        toast.error(item.title, { description: item.message });
      } else {
        toast(item.title, { description: item.message });
      }

      if (soundEnabled) {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.25;
        audio.play().catch(() => {});
      }
    };

    onInstantAlert(handler);
    return () => {
      offInstantAlert(handler);
      disconnectSocket();
    };
  }, [apiBase, userId, soundEnabled]);

  const markRead = async (id: string) => {
    await notificationCenterService.markRead(id);
    setItems(prev => prev.map(it => it.id === id ? { ...it, isRead: true } : it));
  };

  const markAllRead = async () => {
    await notificationCenterService.markAllRead();
    setItems(prev => prev.map(it => ({ ...it, isRead: true })));
  };

  const deleteNotification = async (id: string) => {
    await notificationCenterService.deleteOne(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const deleteAll = async () => {
    await notificationCenterService.deleteAll();
    setItems([]);
  };

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem(soundKey, enabled ? 'true' : 'false');
  };

  const filtered = items.filter(it => {
    if (tab === 'ALL') return true;
    if (tab === 'SYSTEM') return it.type === 'SYSTEM';
    if (tab === 'WARNING') return it.type === 'WARNING';
    if (tab === 'MAINTENANCE') return it.type === 'MAINTENANCE';
    return true;
  });

  const onTabChange = (value: string) => {
    setTab(value);
    loadNotifications(value);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="shadow-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-info" />
              مركز الإشعارات
              <Badge variant="secondary">{unreadCount} غير مقروء</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-3">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />} الصوت
                <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
              </div>
              <Button variant="secondary" onClick={markAllRead}>
                <CheckCircle className="w-4 h-4 mr-2" />
                تعليم الكل كمقروء
              </Button>
              <Button variant="outline" onClick={deleteAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                حذف الكل
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={onTabChange}>
            <TabsList className="grid grid-cols-4 gap-2">
              <TabsTrigger value="ALL">الكل</TabsTrigger>
              <TabsTrigger value="SYSTEM">النظام</TabsTrigger>
              <TabsTrigger value="WARNING">التحذيرات</TabsTrigger>
              <TabsTrigger value="MAINTENANCE">الصيانة</TabsTrigger>
            </TabsList>
            <Separator className="my-4" />
            <TabsContent value={tab} className="space-y-2">
              {loading ? (
                <div className="text-center text-muted-foreground py-8">جاري التحميل...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">أنت مُطّلع على كل شيء</div>
              ) : (
                filtered.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <NotificationRow item={item} onRead={markRead} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteNotification(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
            <TabsContent value="SYSTEM" />
            <TabsContent value="WARNING" />
            <TabsContent value="MAINTENANCE" />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsCenter;
