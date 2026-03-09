import prisma from '../prisma/client.js';

const notificationsStore = [];
const announcementsStore = [];

const DAY_MS = 24 * 60 * 60 * 1000;

const daysSince = (dateValue) => {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.floor((Date.now() - parsed.getTime()) / DAY_MS);
};

const sameUtcDate = (left, right) => {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  return (
    leftDate.getUTCFullYear() === rightDate.getUTCFullYear() &&
    leftDate.getUTCMonth() === rightDate.getUTCMonth() &&
    leftDate.getUTCDate() === rightDate.getUTCDate()
  );
};

const normalizeType = (value) => String(value || 'ALL').toUpperCase();
const normalizePriority = (value) => String(value || 'MEDIUM').toUpperCase();

const nowIso = () => new Date().toISOString();

const ensureAdminLike = (req, res) => {
  const role = String(req.user?.role || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (!['admin', 'super_admin'].includes(role)) {
    res.status(403).json({ message: 'Admin only' });
    return false;
  }
  return true;
};

const canAccessNotification = (notification, userId) => {
  if (!notification) return false;
  if (!notification.userId) return true;
  return notification.userId === userId;
};

export const createNotificationForUser = ({
  userId = null,
  title = 'Notification',
  message = '',
  type = 'INFO',
  priority = 'MEDIUM',
}) => {
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    title: String(title),
    message: String(message),
    type: normalizeType(type),
    priority: normalizePriority(priority),
    isRead: false,
    createdAt: nowIso(),
  };

  notificationsStore.unshift(notification);
  return notification;
};

export const listNotifications = async (req, res) => {
  const type = normalizeType(req.query.type);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const base = notificationsStore.filter((item) => canAccessNotification(item, req.user.id));
  const filtered = type === 'ALL' ? base : base.filter((item) => normalizeType(item.type) === type);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const start = (page - 1) * limit;
  const data = sorted.slice(start, start + limit);
  const unreadCount = base.filter((item) => !item.isRead).length;

  res.json({
    success: true,
    data,
    unreadCount,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    },
  });
};

export const unreadCount = async (req, res) => {
  const count = notificationsStore.filter((item) => canAccessNotification(item, req.user.id) && !item.isRead).length;
  res.json({ success: true, unreadCount: count });
};

export const markRead = async (req, res) => {
  const index = notificationsStore.findIndex((item) => item.id === req.params.id && canAccessNotification(item, req.user.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notificationsStore[index] = { ...notificationsStore[index], isRead: true };
  return res.json({ success: true });
};

export const markAllRead = async (req, res) => {
  for (let index = 0; index < notificationsStore.length; index += 1) {
    const item = notificationsStore[index];
    if (canAccessNotification(item, req.user.id)) {
      notificationsStore[index] = { ...item, isRead: true };
    }
  }

  res.json({ success: true });
};

export const deleteOne = async (req, res) => {
  const index = notificationsStore.findIndex((item) => item.id === req.params.id && canAccessNotification(item, req.user.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notificationsStore.splice(index, 1);
  return res.json({ success: true });
};

export const deleteAll = async (req, res) => {
  const remain = notificationsStore.filter((item) => !canAccessNotification(item, req.user.id));
  notificationsStore.length = 0;
  notificationsStore.push(...remain);
  res.json({ success: true });
};

export const activeAnnouncement = async (_req, res) => {
  const active = [...announcementsStore]
    .filter((item) => item.active)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;

  res.json({ success: true, data: active });
};

export const adminSend = async (req, res) => {
  if (!ensureAdminLike(req, res)) return;

  const payload = req.body || {};
  createNotificationForUser({
    userId: payload.target === 'user' ? payload.userId || null : null,
    title: payload.title || 'Notification',
    message: payload.message || '',
    type: payload.type || 'INFO',
    priority: payload.priority || 'MEDIUM',
  });
  res.json({ success: true, message: 'Notification sent' });
};

export const adminWarning = async (req, res) => {
  if (!ensureAdminLike(req, res)) return;

  const payload = req.body || {};
  createNotificationForUser({
    userId: payload.userId || null,
    title: payload.title || 'Warning',
    message: payload.message || '',
    type: 'WARNING',
    priority: 'HIGH',
  });
  res.json({ success: true, message: 'Warning sent' });
};

export const adminList = async (req, res) => {
  if (!ensureAdminLike(req, res)) return;

  const type = req.query.type ? normalizeType(req.query.type) : null;
  const priority = req.query.priority ? normalizePriority(req.query.priority) : null;
  const userId = req.query.userId ? String(req.query.userId) : null;

  const data = notificationsStore.filter((item) => {
    if (type && normalizeType(item.type) !== type) return false;
    if (priority && normalizePriority(item.priority) !== priority) return false;
    if (userId && String(item.userId || '') !== userId) return false;
    return true;
  });

  res.json({ success: true, data });
};

export const adminDelete = async (req, res) => {
  if (!ensureAdminLike(req, res)) return;

  const index = notificationsStore.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notificationsStore.splice(index, 1);
  return res.json({ success: true });
};

export const adminAnnouncements = async (req, res) => {
  if (!ensureAdminLike(req, res)) return;
  const data = [...announcementsStore].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, data });
};

export const adminCreateAnnouncement = async (req, res) => {
  if (!ensureAdminLike(req, res)) return;

  const payload = req.body || {};
  const announcement = {
    id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: String(payload.title || 'Announcement'),
    message: String(payload.message || ''),
    active: Boolean(payload.active),
    createdAt: nowIso(),
  };

  announcementsStore.unshift(announcement);
  res.json({ success: true, data: announcement });
};

export const adminToggleAnnouncement = async (req, res) => {
  if (!ensureAdminLike(req, res)) return;

  const index = announcementsStore.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Announcement not found' });
  }

  announcementsStore[index] = {
    ...announcementsStore[index],
    active: Boolean(req.body?.active),
  };

  return res.json({ success: true, data: announcementsStore[index] });
};

export const adminDeleteAnnouncement = async (req, res) => {
  if (!ensureAdminLike(req, res)) return;

  const index = announcementsStore.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Announcement not found' });
  }

  announcementsStore.splice(index, 1);
  return res.json({ success: true });
};

export const syncHealthAlerts = async (req, res) => {
  const pets = await prisma.pet.findMany({
    where: { ownerId: req.user.id },
    include: {
      healthRecords: {
        orderBy: { date: 'desc' },
        take: 20,
      },
    },
  });

  const created = [];
  const now = new Date().toISOString();

  for (const pet of pets) {
    const records = Array.isArray(pet.healthRecords) ? pet.healthRecords : [];
    const latestRecord = records[0] || null;
    const latestVaccineRecord = records.find((item) => Boolean(item.vaccine)) || null;

    const daysFromLastCheck = daysSince(latestRecord?.date);
    const daysFromLastVaccine = daysSince(latestVaccineRecord?.date);

    const needsVaccination = daysFromLastVaccine == null || daysFromLastVaccine >= 365;
    const needsVetVisit = daysFromLastCheck == null || daysFromLastCheck >= 180;

    if (!needsVaccination && !needsVetVisit) {
      continue;
    }

    let urgency = 'MEDIUM';
    if ((daysFromLastVaccine != null && daysFromLastVaccine >= 395) || (daysFromLastCheck != null && daysFromLastCheck >= 240)) {
      urgency = 'HIGH';
    }

    const title = `AI Health Alert - ${pet.name}`;
    const messageParts = [];
    if (needsVaccination) {
      messageParts.push(
        daysFromLastVaccine == null
          ? 'لا يوجد سجل تطعيم سابق.'
          : `مر ${daysFromLastVaccine} يوم على آخر تطعيم.`
      );
    }
    if (needsVetVisit) {
      messageParts.push(
        daysFromLastCheck == null
          ? 'لا يوجد سجل كشف بيطري سابق.'
          : `مر ${daysFromLastCheck} يوم على آخر كشف بيطري.`
      );
    }

    const existsToday = notificationsStore.some(
      (item) =>
        item.userId === req.user.id &&
        item.title === title &&
        sameUtcDate(item.createdAt, now)
    );

    if (existsToday) {
      continue;
    }

    const notification = createNotificationForUser({
      userId: req.user.id,
      title,
      message: messageParts.join(' '),
      type: 'WARNING',
      priority: urgency === 'HIGH' ? 'HIGH' : 'MEDIUM',
    });

    created.push(notification);
  }

  res.json({ success: true, createdCount: created.length, created });
};
