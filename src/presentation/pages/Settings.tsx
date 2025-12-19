import { useEffect, useState } from 'react';
import { Building2, Users } from 'lucide-react';
import { adminService, DepartmentDoctor } from '../../infrastructure/services/adminService';

export function Settings() {
  const [data, setData] = useState<DepartmentDoctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await adminService.getDepartmentsAndDoctors();
      setData(result);
    } catch (error) {
      console.error('Error loading settings:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình Bệnh viện</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin khoa và bác sĩ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="text-blue-700" size={24} />
            <h2 className="text-lg font-semibold text-gray-900">Danh sách Khoa</h2>
          </div>
          <div className="space-y-2">
            {data?.departments.map((dept, index) => (
              <div
                key={index}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="font-medium text-gray-900">{dept}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-green-700" size={24} />
            <h2 className="text-lg font-semibold text-gray-900">Danh sách Bác sĩ</h2>
          </div>
          <div className="space-y-3">
            {data?.doctors.map((doctor, index) => (
              <div
                key={index}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <p className="font-medium text-gray-900">{doctor.name}</p>
                <p className="text-sm text-gray-600 mt-1">{doctor.department}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
