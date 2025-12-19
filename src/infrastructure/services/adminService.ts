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
  async register(data: RegistrationData): Promise<{ token: string; user: any }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.account.register}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng ký thất bại');
    }

    const result = await response.json();
    if (result.token) {
      localStorage.setItem('adminToken', result.token);
    }
    return result;
  }

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.account.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Đăng nhập thất bại');
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
    }
    return data;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.list}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải thống kê');
    }

    const bookings: Booking[] = await response.json();
    const today = new Date().toISOString().split('T')[0];

    return {
      todayAppointments: bookings.filter(b => b.appointmentDate.startsWith(today)).length,
      newAppointments: bookings.filter(b => b.status === 'pending').length,
      recentRecords: 0,
    };
  }

  async getBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.list}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách lịch hẹn');
    }

    return response.json();
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.updateStatus(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Không thể cập nhật trạng thái');
    }
  }

  async getMedicalRecords(): Promise<MedicalRecord[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.medical.list}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải hồ sơ bệnh án');
    }

    return response.json();
  }

  async getDepartmentsAndDoctors(): Promise<DepartmentDoctor> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.booking.departmentsDoctors}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách khoa và bác sĩ');
    }

    return response.json();
  }

  logout(): void {
    localStorage.removeItem('adminToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('adminToken');
  }
}

export const adminService = new AdminService();
