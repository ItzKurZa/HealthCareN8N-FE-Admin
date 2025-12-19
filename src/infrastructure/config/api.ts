export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  account: {
    login: '/account/signin',
    register: '/account/signup',
    profile: '/account/profile',
  },
  booking: {
    list: '/booking',
    departmentsDoctors: '/booking/departments-doctors',
    cancel: (id: string) => `/booking/cancel/${id}`,
    updateStatus: (id: string) => `/booking/${id}/status`, 
  },
  medical: {
    list: '/medical/upload-files',
    file: (id: string) => `/medical/files/${id}`,
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};