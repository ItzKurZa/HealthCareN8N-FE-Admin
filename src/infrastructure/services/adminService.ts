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
