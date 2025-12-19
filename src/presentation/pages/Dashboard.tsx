import { useEffect, useState } from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { adminService, DashboardStats } from '../../infrastructure/services/adminService';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    newAppointments: 0,
    recentRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600 mt-1">Thống kê và hoạt động hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Lịch khám hôm nay"
          value={stats.todayAppointments}
          icon={Calendar}
          bgColor="bg-blue-50"
          iconColor="text-blue-700"
        />
        <StatCard
          title="Lịch hẹn mới"
          value={stats.newAppointments}
          icon={Clock}
          bgColor="bg-green-50"
          iconColor="text-green-700"
        />
        <StatCard
          title="Hồ sơ cập nhật"
          value={stats.recentRecords}
          icon={FileText}
          bgColor="bg-purple-50"
          iconColor="text-purple-700"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Hệ thống sẵn sàng</p>
              <p className="text-xs text-gray-600">Tất cả các dịch vụ đang hoạt động bình thường</p>
            </div>
            <span className="text-xs text-gray-500">Vừa xong</span>
          </div>
        </div>
      </div>
    </div>
  );
}
