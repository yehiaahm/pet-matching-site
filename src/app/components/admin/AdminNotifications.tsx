import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { BellRing, Send, AlertTriangle, Trash2, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { notificationCenterService, NotificationPriority, NotificationType } from '../../services/notificationCenterService';

export default function AdminNotifications() {
  const [target, setTarget] = useState<'all' | 'user'>('all');
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('INFO');
  const [priority, setPriority] = useState<NotificationPriority>('MEDIUM');
  const [sendEmail, setSendEmail] = useState(false);

  const [warningUserId, setWarningUserId] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(true);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [filterUserId, setFilterUserId] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  const loadAdminData = async () => {
    try {
      const [notifs, anns] = await Promise.all([
        notificationCenterService.adminList({
          page: 1,
          limit: 50,
          userId: filterUserId || undefined,
          type: filterType !== 'ALL' ? filterType : undefined,
          priority: filterPriority !== 'ALL' ? filterPriority : undefined,
        }),
        notificationCenterService.adminAnnouncements(),
      ]);
      setNotifications(notifs.data || []);
      setAnnouncements(anns.data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load data';
      toast.error(message);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [filterUserId, filterType, filterPriority]);

  const sendNotification = async () => {
    try {
      if (!title || !message) {
        toast.error('Title and message are required');
        return;
      }
      if (target === 'user' && !userId) {
        toast.error('Please provide user id');
        return;
      }

      await notificationCenterService.adminSend({
        target,
        userId: target === 'user' ? userId : undefined,
        title,
        message,
        type,
        priority,
        sendEmail,
      });

      toast.success('Notification sent successfully');
      setTitle('');
      setMessage('');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send notification');
    }
  };

  const sendWarning = async () => {
    try {
      if (!warningUserId || !warningMessage) {
        toast.error('User id and warning message are required');
        return;
      }
      await notificationCenterService.adminSendWarning({ userId: warningUserId, message: warningMessage });
      toast.success('Warning sent');
      setWarningMessage('');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send warning');
    }
  };

  const createAnnouncement = async () => {
    try {
      if (!announcementTitle || !announcementMessage) {
        toast.error('Announcement title and message are required');
        return;
      }
      await notificationCenterService.adminCreateAnnouncement({
        title: announcementTitle,
        message: announcementMessage,
        active: announcementActive,
      });
      toast.success('Announcement saved');
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save announcement');
    }
  };

  const toggleAnnouncement = async (id: string, active: boolean) => {
    await notificationCenterService.adminToggleAnnouncement(id, active);
    await loadAdminData();
  };

  const deleteAnnouncement = async (id: string) => {
    await notificationCenterService.adminDeleteAnnouncement(id);
    await loadAdminData();
  };

  const deleteNotification = async (id: string) => {
    await notificationCenterService.adminDelete(id);
    await loadAdminData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BellRing className="w-5 h-5" /> Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Select value={target} onValueChange={(value: 'all' | 'user') => setTarget(value)}>
              <SelectTrigger><SelectValue placeholder="Target" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users (broadcast)</SelectItem>
                <SelectItem value="user">Specific user</SelectItem>
              </SelectContent>
            </Select>

            {target === 'user' ? (
              <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
            ) : (
              <div className="flex items-center text-sm text-muted-foreground px-2">Broadcast mode enabled</div>
            )}

            <Select value={type} onValueChange={(value: NotificationType) => setType(value)}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                <SelectItem value="WARNING">WARNING</SelectItem>
                <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={(value: NotificationPriority) => setPriority(value)}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">LOW</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" />
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write notification message..." rows={4} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Auto email
              <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
            </div>
            <Button onClick={sendNotification} className="gap-2"><Send className="w-4 h-4" /> Send instantly</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" /> Send User Warning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={warningUserId} onChange={(e) => setWarningUserId(e.target.value)} placeholder="User ID" />
          <Textarea value={warningMessage} onChange={(e) => setWarningMessage(e.target.value)} placeholder="Warning message" rows={3} />
          <Button variant="destructive" onClick={sendWarning}>Send warning</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5" /> System Banner Announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Banner title" />
          <Textarea value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} placeholder="Banner message" rows={3} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">Active <Switch checked={announcementActive} onCheckedChange={setAnnouncementActive} /></div>
            <Button onClick={createAnnouncement}>Save announcement</Button>
          </div>

          <div className="space-y-2 pt-2">
            {announcements.map((item) => (
              <div key={item.id} className="p-3 border rounded-lg flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{item.title} {item.active ? <Badge>ACTIVE</Badge> : <Badge variant="outline">INACTIVE</Badge>}</div>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleAnnouncement(item.id, !item.active)}>{item.active ? 'Disable' : 'Enable'}</Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteAnnouncement(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-2">
            <Input value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)} placeholder="Filter by user ID" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger><SelectValue placeholder="Filter type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                <SelectItem value="WARNING">WARNING</SelectItem>
                <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger><SelectValue placeholder="Filter priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto">
          {notifications.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{item.title}</div>
                <p className="text-sm text-muted-foreground">{item.message}</p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge variant={item.priority === 'CRITICAL' ? 'destructive' : 'secondary'}>{item.priority}</Badge>
                  <span className="text-muted-foreground">to: {item.users?.email || item.userId || 'unknown'}</span>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deleteNotification(item.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
