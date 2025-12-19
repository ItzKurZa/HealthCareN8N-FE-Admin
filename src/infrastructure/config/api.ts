export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  account: {
    login: '/account/signin',      // Khớp với router.post('/signin', signin)
    register: '/account/signup',   // Khớp với router.post('/signup', signup)
    profile: '/account/profile',
  },
  booking: {
    list: '/booking',              // Cần backend hỗ trợ lấy tất cả cho admin
    departmentsDoctors: '/booking/departments-doctors', // Khớp với route hiện tại
    cancel: (id: string) => `/booking/cancel/${id}`,    // Khớp với route hiện tại
  },
  medical: {
    list: '/medical/upload', // Lưu ý: Backend hiện tại chỉ có route upload và delete
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Khớp với requireAuth trong backend
  };
};