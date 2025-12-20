import { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminService, Booking } from '../../infrastructure/services/adminService';

// Định nghĩa interface cho Department để TypeScript hiểu (nếu chưa có trong adminService)
interface Department {
  uid: string; // hoặc id, tùy vào response thực tế của bạn
  name: string;
  description?: string;
}

export function Appointments() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 1. THÊM STATE CHO DEPARTMENTS
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});

  // 2. GỘP VIỆC TẢI DỮ LIỆU VÀO MỘT USE EFFECT CHÍNH
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi song song 2 API để tiết kiệm thời gian
        const [bookingsData, deptData] = await Promise.all([
          adminService.getBookings(),
          adminService.getDepartments()
        ]);

        // Xử lý Bookings
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);

        // Xử lý Departments (dựa trên cấu trúc response bạn cung cấp: { departments: [], doctors: [] })
        const depts = deptData.departments || [];
        setDepartmentsList(depts);

        // Tạo Map { uid: name } để tra cứu nhanh khi render bảng
        const map: Record<string, string> = {};
        depts.forEach((d: any) => {
          // Lưu ý: Kiểm tra xem field ID trả về là 'uid', '_id' hay 'id'
          const key = d.uid || d.id || d._id; 
          if (key) map[key] = d.name;
        });
        setDepartmentMap(map);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effect để lọc dữ liệu khi có thay đổi
  useEffect(() => {
    filterBookingsList();
  }, [searchTerm, filterDepartment, bookings]);

  // Các hàm tiện ích giữ nguyên
  const handleUpdateStatus = async (id: string, status: Booking['status']) => {
    try {
      await adminService.updateBookingStatus(id, status);
      // Chỉ tải lại bookings, không cần tải lại departments
      const data = await adminService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

  const filterBookingsList = () => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.patientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDepartment !== 'all') {
      // b.department ở đây là UID, filterDepartment cũng là UID
      filtered = filtered.filter(b => b.department === filterDepartment);
    }

    setFilteredBookings(filtered);
  };

  const getStatusBadge = (status: Booking['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Lịch hẹn</h1>
        <p className="text-gray-600 mt-1">Danh sách tất cả lịch đặt khám của bệnh nhân</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bệnh nhân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            
            {/* 3. CẬP NHẬT DROPDOWN FILTER */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
            >
              <option value="all">Tất cả khoa</option>
              {departmentsList.map((dept: any) => (
                <option key={dept.uid || dept.id} value={dept.uid || dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bệnh nhân
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khoa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày khám
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.patientName}</div>
                  </td>
                  
                  {/* 4. HIỂN THỊ TÊN KHOA THAY VÌ UID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {departmentMap[booking.department] || booking.department}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.doctor_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.appointment_date).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <CheckCircle size={16} />
                          Xác nhận
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'completed')}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Clock size={16} />
                          Hoàn thành
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle size={16} />
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy lịch hẹn nào
          </div>
        )}
      </div>
    </div>
  );
}