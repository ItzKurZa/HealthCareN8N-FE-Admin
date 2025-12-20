import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

// ... (Các interface giữ nguyên như cũ)
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

export type EmployeeRole = 'admin' | 'doctors' | 'nurses' | 'staffs';

export interface RegistrationData {
  cccd: string;
  email: string;
  password: string;
  fullname: string;
  phone: string;
  role: EmployeeRole;
  department: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
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
      throw new Error(result.message || 'Invalid email or password!');
    }

    const token = result.auth?.idToken;
    const user = result.user;

    if(user.role == 'patient') {
      throw new Error('Patient cannot login hospital page!');
    }

    if (token) {
      localStorage.setItem('adminToken', token);
      
      if (user) {
        localStorage.setItem('adminUser', JSON.stringify(user));
      }
    } else {
      throw new Error('Không tìm thấy Token đăng nhập');
    }

    return result.auth;
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
    return result;
  }

  // SỬA: Hàm này cần đảm bảo không lỗi nếu API chưa có
  async getDepartments(): Promise<DepartmentDoctor> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.departmentsDoctors}`);

      // Kiểm tra nếu response không OK (ví dụ 404)
      if (!response.ok) {
        console.warn('API Departments chưa sẵn sàng hoặc lỗi:', response.status);
        return { departments: [], doctors: [] };
      }

      const result = await response.json();
      return result.data || { departments: [], doctors: [] };
    } catch (error) {
      console.error('Lỗi khi lấy Departments:', error);
      return { departments: [], doctors: [] };
    }
  }

  async getDepartmentsAndDoctors(): Promise<DepartmentDoctor> {
    return this.getDepartments();
  }

  getUserInfo(): AdminUser | null {
    try {
      const userStr = localStorage.getItem('adminUser');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      return user as AdminUser;
    } catch {
      return null;
    }
  }

  async getBookings(): Promise<Booking[]> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.list}`, {
        headers: getAuthHeaders(),
      });

      // Nếu server trả về 404 (Not Found), trả về mảng rỗng thay vì crash
      if (!response.ok) {
        console.warn(`Get Bookings failed: ${response.status} ${response.statusText}`);
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
    const url = status === 'cancelled'
      ? API_ENDPOINTS.booking.cancel(id)
      : API_ENDPOINTS.booking.updateStatus(id);

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error('Failed to update status');
  }

  async getMedicalRecords(): Promise<MedicalRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.medical.list}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.warn(`Get Records failed: ${response.status} ${response.statusText}`);
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching records:', error);
      return [];
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Vì getBookings và getMedicalRecords đã được sửa để trả về mảng rỗng khi lỗi
      // nên Promise.all này sẽ không bị crash nữa.
      const [bookings, records] = await Promise.all([
        this.getBookings(),
        this.getMedicalRecords()
      ]);

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const todayAppointments = bookings.filter(b =>
        b.appointmentDate.includes(todayStr) && b.status !== 'cancelled'
      ).length;

      const newAppointments = bookings.filter(b => b.status === 'pending').length;
      const recentRecords = records.length;

      return {
        todayAppointments,
        newAppointments,
        recentRecords
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      return {
        todayAppointments: 0,
        newAppointments: 0,
        recentRecords: 0
      };
    }
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
}

export const adminService = new AdminService();