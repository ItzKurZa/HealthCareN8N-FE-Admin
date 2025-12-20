import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

// ... (Các interface giữ nguyên như cũ)
export interface Booking {
  id: string;
  userId: string;
  patientName: string;
  department: string;
  doctor_name: string;
  appointment_date: string;
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

    if (user.role == 'patient') {
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
      // 1. Lấy thông tin User hiện tại
      const user = this.getUserInfo();
      if (!user) throw new Error('User not found');

      // 2. Gọi API lấy dữ liệu (Sử dụng Promise.all để chạy song song cho nhanh)
      const [appointments, medicalRecords] = await Promise.all([
        this.getBookings(),
        this.getMedicalRecords()
      ]);

      // [FIX] Đảm bảo biến là mảng, nếu API lỗi trả về null/undefined thì gán mảng rỗng
      const safeAppointments = Array.isArray(appointments) ? appointments : [];
      const safeRecords = Array.isArray(medicalRecords) ? medicalRecords : [];

      // 3. Logic lọc dữ liệu an toàn (Thêm dấu ? và || false)

      // -- Đếm Lịch hẹn chờ duyệt --
      const pendingAppointments = safeAppointments.filter(app => {
        const isPending = app.status === 'pending';

        // Logic phân quyền đếm số
        if (user.role.toLowerCase() === 'admin') return isPending;

        if (user.role.toLowerCase().includes('doctor')) {
          return isPending && app.doctor_name?.includes(user.name);
        }

        if (['nurse', 'staff'].some(r => user.role.toLowerCase().includes(r))) {
          return isPending && app.department?.includes(user.department);
        }

        return false;
      }).length;

      // -- Đếm Lịch hẹn hôm nay --
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = safeAppointments.filter(app => {
        // [FIX] Kiểm tra app.date và app.time tồn tại trước khi dùng
        if (!app.appointment_date) return false;

        const isToday = app.appointment_date.startsWith(today);

        if (user.role === 'admin') return isToday;

        if (user.role.toLowerCase().includes('doctor')) {
          return isToday && app.doctor_name?.includes(user.name);
        }

        if (['nurse', 'staff'].some(r => user.role.toLowerCase().includes(r))) {
          return isToday && app.department?.includes(user.department);
        }

        return false;
      }).length;

      // -- Đếm Hồ sơ mới (trong tháng này) --
      const currentMonth = new Date().getMonth();
      const newRecords = safeRecords.filter(record => {
        if (!record.updatedAt) return false;
        const recordDate = new Date(record.updatedAt);
        return recordDate.getMonth() === currentMonth;
      }).length;

      return {
        todayAppointments: todayAppointments,
        newAppointments: pendingAppointments,
        recentRecords: newRecords,
      };

    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      // Trả về số liệu 0 thay vì crash app
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