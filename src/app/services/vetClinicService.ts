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
  if (!response.ok) throw new Error(payload?.message || payload?.error || 'Request failed');
  return payload as T;
};

export interface VetClinicServiceItem {
  id: string;
  type: string;
  name: string;
  duration: number;
  price: number;
}

export interface VetClinic {
  id: string;
  name: string;
  description?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  services: VetClinicServiceItem[];
}

export interface MyPet {
  id: string;
  name: string;
  breed: string;
  type: string;
  gender: string;
  age: number;
}

export const vetClinicService = {
  listClinics() {
    return api<{ success: boolean; data: VetClinic[] }>('/api/v1/vet-clinics');
  },

  getSlots(clinicId: string, date: string) {
    return api<{ success: boolean; data: { availableSlots: string[] } }>(
      `/api/v1/vet-clinics/${clinicId}/slots?date=${encodeURIComponent(date)}`
    );
  },

  createBooking(payload: {
    clinicId: string;
    serviceId: string;
    petId: string;
    bookingDate: string;
    timeSlot: string;
    userNotes?: string;
  }) {
    return api<{ success: boolean; data: any }>('/api/v1/vet-clinics/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  myBookings() {
    return api<{ success: boolean; data: any[] }>('/api/v1/vet-clinics/bookings/my');
  },

  adminBookings(filters: { status?: string; clinicId?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.clinicId) params.set('clinicId', filters.clinicId);

    return api<{ success: boolean; data: any[] }>(`/api/v1/vet-clinics/bookings/admin?${params.toString()}`);
  },

  updateBookingStatus(bookingId: string, payload: { status: string; adminNotes?: string; resultNotes?: string }) {
    return api<{ success: boolean; data: any }>(`/api/v1/vet-clinics/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  myPets() {
    return api<MyPet[] | { data: MyPet[] }>('/api/v1/pets/my');
  },
};
