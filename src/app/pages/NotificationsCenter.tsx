import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { onInstantAlert, initSocket, disconnectSocket } from '../../lib/socket';
import { Bell, CheckCircle, MessageSquare, Heart, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationItem {
  id: string;
  type: 'match' | 'message' | 'system' | 'general';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const NotificationRow: React.FC<{ item: NotificationItem; onRead: (id: string) => void }>
  = ({ item, onRead }) => {
  const icon = item.type === 'match' ? Heart : item.type === 'message' ? MessageSquare : item.type === 'system' ? Info : Bell;
  const Icon = icon;
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted rounded-xl transition">
      <Icon className="w-5 h-5 text-info mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">{item.title}</h4>
          {!item.read && <Badge variant="default">جديد</Badge>}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
        <time className="text-xs text-muted-foreground mt-1 block">{new Date(item.createdAt).toLocaleString('ar-EG')}</time>
      </div>
      {!item.read && (
        <Button size="sm" variant="secondary" onClick={() => onRead(item.id)}>تم القراءة</Button>
      )}
    </div>
  );
};

const NotificationsCenter: React.FC<{ apiBase: string; userId: string }> = ({ apiBase, userId }) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [tab, setTab] = useState<string>('all');

  useEffect(() => {
    const socket = initSocket(apiBase, userId);
    onInstantAlert((payload) => {
      const item: NotificationItem = {
        id: payload.id || crypto.randomUUID(),
        type: payload.type || 'general',
        title: payload.title || 'تنبيه جديد',
        message: payload.message || 'لديك إشعار جديد',
        createdAt: payload.createdAt || new Date().toISOString(),
        read: false,
      };
      setItems(prev => [item, ...prev]);
      toast(item.title, { description: item.message });
    });
    return () => disconnectSocket();
  }, [apiBase, userId]);

  const markRead = (id: string) => setItems(prev => prev.map(it => it.id === id ? { ...it, read: true } : it));
  const markAllRead = () => setItems(prev => prev.map(it => ({ ...it, read: true })));

  const filtered = items.filter(it => {
    if (tab === 'all') return true;
    if (tab === 'matches') return it.type === 'match';
    if (tab === 'messages') return it.type === 'message';
    if (tab === 'system') return it.type === 'system';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="shadow-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-info" />
              مركز الإشعارات
            </CardTitle>
            <Button variant="secondary" onClick={markAllRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              تعليم الكل كمقروء
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-4 gap-2">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="matches">التطابقات</TabsTrigger>
              <TabsTrigger value="messages">الرسائل</TabsTrigger>
              <TabsTrigger value="system">النظام</TabsTrigger>
            </TabsList>
            <Separator className="my-4" />
            <TabsContent value="all" className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">أنت مُطّلع على كل شيء</div>
              ) : (
                filtered.map(item => (
                  <NotificationRow key={item.id} item={item} onRead={markRead} />
                ))
              )}
            </TabsContent>
            <TabsContent value="matches" />
            <TabsContent value="messages" />
            <TabsContent value="system" />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsCenter;
