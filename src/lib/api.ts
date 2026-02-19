/**
 * Unified API Configuration
 * مركز موحد لجميع اتصالات الـ API
 */

// الحصول على URL الأساسي للـ API
export const getApiBaseUrl = (): string => {
  // أولاً: نتحقق من متغير البيئة
  const envApiBase = import.meta.env.VITE_API_BASE;
  
  if (envApiBase) {
    return envApiBase;
  }
  
  // ثانياً: استخدام القيمة الافتراضية حسب البيئة
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api/v1';
  }
  
  // في حالة الإنتاج، استخدام URL النسبي
  return '/api/v1';
};

// تصدير URL الثابت
export const API_BASE_URL = getApiBaseUrl();

/**
 * إنشاء headers افتراضية للطلبات
 */
export const getDefaultHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // إضافة token إذا كان موجوداً
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * دالة fetch محسّنة مع معالجة الأخطاء
 */
export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getDefaultHeaders(),
      ...options.headers,
    },
    credentials: 'include', // لإرسال الكوكيز
  };

  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    
    // محاولة قراءة الاستجابة
    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // التحقق من نجاح الطلب
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`, data);
      
      // رمي خطأ مع التفاصيل
      throw {
        status: response.status,
        message: data?.message || data?.error || 'حدث خطأ في الاتصال بالخادم',
        data: data,
      };
    }

    console.log(`✅ API Success: ${options.method || 'GET'} ${url}`);
    return data;
    
  } catch (error: any) {
    console.error(`❌ API Request Failed: ${url}`, error);
    
    // إذا كان الخطأ من fetch نفسها (network error)
    if (!error.status) {
      throw {
        status: 0,
        message: 'فشل الاتصال بالخادم. تأكد من تشغيل الخادم.',
        error: error,
      };
    }
    
    throw error;
  }
};

/**
 * دوال مساعدة للطلبات الشائعة
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * دوال خاصة بالـ Authentication
 */
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api.post('/auth/register', userData),

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post('/auth/refresh'),

  getProfile: () => api.get('/auth/profile'),
};

/**
 * دوال خاصة بالحيوانات الأليفة
 */
export const petsApi = {
  getAll: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get(`/pets${query}`);
  },

  getById: (id: string) => api.get(`/pets/${id}`),

  create: (petData: any) => api.post('/pets', petData),

  update: (id: string, petData: any) => api.put(`/pets/${id}`, petData),

  delete: (id: string) => api.delete(`/pets/${id}`),
};

/**
 * دوال خاصة بالمطابقة
 */
export const matchApi = {
  getMatches: (petId: string, params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get(`/matches/${petId}${query}`);
  },

  calculateScore: (petId1: string, petId2: string) =>
    api.post('/matches/calculate-score', { petId1, petId2 }),
};

/**
 * دوال خاصة بطلبات التزاوج
 */
export const breedingRequestsApi = {
  getAll: () => api.get('/breeding-requests'),

  getById: (id: string) => api.get(`/breeding-requests/${id}`),

  create: (requestData: any) => api.post('/breeding-requests', requestData),

  updateStatus: (id: string, status: string) =>
    api.patch(`/breeding-requests/${id}/status`, { status }),

  delete: (id: string) => api.delete(`/breeding-requests/${id}`),
};

/**
 * دوال خاصة بالرسائل
 */
export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),

  getMessages: (conversationId: string) =>
    api.get(`/messages/conversations/${conversationId}`),

  sendMessage: (recipientId: string, content: string) =>
    api.post('/messages', { recipientId, content }),

  markAsRead: (messageId: string) =>
    api.patch(`/messages/${messageId}/read`),
};

/**
 * دوال خاصة بالإدارة (Admin)
 */
export const adminApi = {
  getStats: () => api.get('/admin/stats'),

  getUsers: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get(`/admin/users${query}`);
  },

  updateUserStatus: (userId: string, status: any) =>
    api.patch(`/admin/users/${userId}/status`, status),

  getPets: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get(`/admin/pets${query}`);
  },

  approvePet: (petId: string) => api.patch(`/admin/pets/${petId}/approve`),

  rejectPet: (petId: string, reason: string) =>
    api.patch(`/admin/pets/${petId}/reject`, { reason }),
};

export default api;
