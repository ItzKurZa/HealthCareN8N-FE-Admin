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
  cccd: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: EmployeeRole;
  department: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: EmployeeRole;
  department: string;
}

class AdminService {
  isAuthenticated(): boolean {
    return !!localStorage.getItem('adminToken');
  }

  async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.account.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      // Chuyển thông báo lỗi sang tiếng Anh nếu backend trả về tiếng Việt
      throw new Error(result.message || 'Invalid email or password');
    }

    // Backend trả về token trong result.data.auth.stsTokenManager.accessToken
    const token = result.data?.auth?.stsTokenManager?.accessToken;

    if (token) {
      localStorage.setItem('adminToken', token);
    }

    return result.data;
  }

  async register(data: RegistrationData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.account.register}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Registration failed');
    }

    // Nếu backend tự động đăng nhập sau khi đăng ký, lưu token tại đây
    if (result.auth?.stsTokenManager?.accessToken) {
      localStorage.setItem('adminToken', result.auth.stsTokenManager.accessToken);
    }

    return result;
  }

  async getDepartments(): Promise<DepartmentDoctor> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.departmentsDoctors}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error('Could not load departments and doctors');
    }

    return result.data;
  }

  getUserInfo(): AdminUser | null {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;
    try {
      // Decode JWT để lấy role (Sử dụng thư viện jwt-decode nếu cần)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  // Lấy danh sách lịch hẹn (Phân quyền: Admin xem tất cả, Doctor xem theo khoa)
  async getBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.list}`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return result.data;
  }

  // Cập nhật trạng thái lịch hẹn
  async updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.cancel(id)}`, { // Giả sử backend dùng chung route hoặc bạn bổ sung route /update-status
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    if (!response.ok) throw new Error('Failed to update status');
  }

  // Lấy danh sách hồ sơ bệnh án
  async getMedicalRecords(): Promise<MedicalRecord[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.medical.list}`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error('Failed to fetch records');
    return result.data;
  }

  logout() {
    localStorage.removeItem('adminToken');
  }
}

export const adminService = new AdminService();
