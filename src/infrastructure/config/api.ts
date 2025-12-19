export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  booking: {
    list: '/api/booking',
    departmentsDoctors: '/api/booking/departments-doctors',
    updateStatus: (id: string) => `/api/booking/${id}/status`,
  },
  medical: {
    list: '/api/medical',
    byUser: (userId: string) => `/api/medical/user/${userId}`,
    file: (fileId: string) => `/api/medical/file/${fileId}`,
  },
  account: {
    login: '/api/account/login',
    register: '/api/account/register',
    profile: '/api/account/profile',
  },
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
