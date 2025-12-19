import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

export interface Booking {
  id: string;
  userId: string;
  patientName: string;
  department: string;
  doctor: string;
  appointmentDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface DashboardStats {
  todayAppointments: number;
  newAppointments: number;
  recentRecords: number;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  patientName: string;
  files: Array<{
    fileId: string;
    fileName: string;
    uploadDate: string;
  }>;
  updatedAt: string;
}

export interface DepartmentDoctor {
  departments: string[];
  doctors: Array<{
    name: string;
    department: string;
  }>;
}

export type EmployeeRole = 'admin' | 'doctor' | 'nurse' | 'staff';

export interface RegistrationData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: EmployeeRole;
  department: string;
}

class AdminService {
  // Đăng nhập
  async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.account.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Đăng nhập thất bại');
    }

    // Backend trả về token trong result.auth.stsTokenManager.accessToken
    const token = result.auth.stsTokenManager.accessToken;
    localStorage.setItem('adminToken', token);
    return result;
  }

  // Lấy danh sách khoa và bác sĩ
  async getDepartmentsAndDoctors(): Promise<DepartmentDoctor> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.departmentsDoctors}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error('Không thể tải danh sách khoa và bác sĩ');
    }

    // Backend trả về { success: true, data: { departments, doctors } }
    return result.data;
  }

  // Hủy lịch hẹn (Backend hiện có route /cancel/:bookingId)
  async cancelBooking(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.cancel(id)}`, {
      method: 'POST', // Backend dùng router.post('/cancel/:bookingId')
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Không thể hủy lịch');
    }
  }
}

export const adminService = new AdminService();
