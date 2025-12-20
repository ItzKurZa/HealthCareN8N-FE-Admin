import { useEffect, useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { adminService, MedicalRecord } from '../../infrastructure/services/adminService';
import { API_BASE_URL, API_ENDPOINTS } from '../../infrastructure/config/api';

export function Records() {
  const [records, setRecords] = useState<MedicalRecord[]>([]); 
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await adminService.getMedicalRecords();
      setRecords(Array.isArray(data) ? data : []); 
    } catch (error) {
      console.error('Error loading records:', error);
      setRecords([]); // Nếu lỗi, đảm bảo state là mảng rỗng
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (fileId: string) => {
    const fileUrl = `${API_BASE_URL}${API_ENDPOINTS.medical.file(fileId)}`;
    window.open(fileUrl, '_blank');
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Hồ sơ Bệnh nhân</h1>
        <p className="text-gray-600 mt-1">Danh sách bệnh nhân và hồ sơ y tế</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột Trái: Danh sách bệnh nhân */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách bệnh nhân</h2>
          <div className="space-y-3">
            {/* [FIX]: Thêm dấu ? trước .map và kiểm tra mảng */}
            {records && records.length > 0 ? (
              records.map((record) => (
                <button
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedRecord?.id === record.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{record.patientName}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {/* [FIX]: Thêm dấu ? để tránh lỗi nếu files bị undefined */}
                        {record.files?.length || 0} tệp tin
                      </p>
                    </div>
                    <FileText className="text-blue-700" size={24} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Cập nhật: {record.updatedAt ? new Date(record.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </button>
              ))
            ) : (
              // Hiển thị khi không có dữ liệu (thay vì crash)
              <div className="text-center py-12 text-gray-500">
                Chưa có hồ sơ nào
              </div>
            )}
          </div>
        </div>

        {/* Cột Phải: Chi tiết hồ sơ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedRecord ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hồ sơ của {selectedRecord.patientName}
              </h2>
              <div className="space-y-3">
                {/* [FIX]: Kiểm tra mảng files trước khi map */}
                {selectedRecord.files && selectedRecord.files.length > 0 ? (
                  selectedRecord.files.map((file) => (
                    <div
                      key={file.fileId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-700" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">{file.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString('vi-VN') : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewFile(file.fileId)}
                          className="p-2 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Xem"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleViewFile(file.fileId)}
                          className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                          title="Tải xuống"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm text-center py-4">Bệnh nhân này chưa có file nào.</div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Chọn một bệnh nhân để xem hồ sơ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}