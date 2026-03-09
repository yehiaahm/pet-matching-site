export type NotificationType = 'SYSTEM' | 'WARNING' | 'MAINTENANCE' | 'INFO';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PlatformNotification {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  active: boolean;
  createdAt: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

const api = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || 'Request failed');
  }

  return payload as T;
};

export const notificationCenterService = {
  async list(type = 'ALL', page = 1, limit = 20) {
    return api<{ success: boolean; data: PlatformNotification[]; unreadCount: number }>(
      `/api/v1/notifications?type=${encodeURIComponent(type)}&page=${page}&limit=${limit}`
    );
  },

  async unreadCount() {
    return api<{ success: boolean; unreadCount: number }>(`/api/v1/notifications/unread-count`);
  },

  async syncHealthAlerts() {
    return api<{ success: boolean; createdCount: number }>(`/api/v1/notifications/health-alerts/sync`, {
      method: 'POST',
    });
  },

  async markRead(notificationId: string) {
    return api<{ success: boolean }>(`/api/v1/notifications/${notificationId}/read`, { method: 'PATCH' });
  },

  async markAllRead() {
    return api<{ success: boolean }>(`/api/v1/notifications/read-all`, { method: 'PATCH' });
  },

  async deleteOne(notificationId: string) {
    return api<{ success: boolean }>(`/api/v1/notifications/${notificationId}`, { method: 'DELETE' });
  },

  async deleteAll() {
    return api<{ success: boolean }>(`/api/v1/notifications/all`, { method: 'DELETE' });
  },

  async getActiveAnnouncement() {
    return api<{ success: boolean; data: SystemAnnouncement | null }>(`/api/v1/notifications/announcements/active`, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async adminSend(payload: {
    target: 'all' | 'user';
    userId?: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    sendEmail?: boolean;
  }) {
    return api<{ success: boolean; message: string }>(`/api/v1/notifications/admin/send`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async adminSendWarning(payload: { userId: string; title?: string; message: string }) {
    return api<{ success: boolean; message: string }>(`/api/v1/notifications/admin/warning`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async adminList(filters: { userId?: string; type?: string; priority?: string; page?: number; limit?: number } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    return api<{ success: boolean; data: Array<PlatformNotification & { users?: { email: string } }> }>(
      `/api/v1/notifications/admin/list?${params.toString()}`
    );
  },

  async adminDelete(notificationId: string) {
    return api<{ success: boolean }>(`/api/v1/notifications/admin/${notificationId}`, { method: 'DELETE' });
  },

  async adminAnnouncements() {
    return api<{ success: boolean; data: SystemAnnouncement[] }>(`/api/v1/notifications/admin/announcements`);
  },

  async adminCreateAnnouncement(payload: { title: string; message: string; active: boolean }) {
    return api<{ success: boolean; data: SystemAnnouncement }>(`/api/v1/notifications/admin/announcements`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async adminToggleAnnouncement(announcementId: string, active: boolean) {
    return api<{ success: boolean; data: SystemAnnouncement }>(`/api/v1/notifications/admin/announcements/${announcementId}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  },

  async adminDeleteAnnouncement(announcementId: string) {
    return api<{ success: boolean }>(`/api/v1/notifications/admin/announcements/${announcementId}`, {
      method: 'DELETE',
    });
  },
};
