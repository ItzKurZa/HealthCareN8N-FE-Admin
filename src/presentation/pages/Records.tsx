import { useEffect, useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { adminService } from '../../infrastructure/services/adminService';

// Định nghĩa Interface UI (Đầu ra mong muốn)
interface UIMedicalRecord {
  id: string;
  patientName: string;
  updatedAt: string;
  files: Array<{
    fileId: string;
    fileName: string;
    uploadDate: string;
    link: string;
    mimeType: string;
  }>;
}

export function Records() {
  const [records, setRecords] = useState<UIMedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<UIMedicalRecord | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const response: any = await adminService.getMedicalRecords();
      
      // LOG QUAN TRỌNG: Hãy mở F12 xem dòng này để thấy cấu trúc thực tế
      console.log('🔥 DEBUG - API Response:', response); 

      // Lấy mảng dữ liệu gốc
      const rawData = response?.data || response;

      if (Array.isArray(rawData)) {
        // Log phần tử đầu tiên để kiểm tra tên trường (field names)
        if (rawData.length > 0) {
          console.log('🔥 DEBUG - Phần tử đầu tiên:', rawData[0]);
        }
        
        const groupedData = groupFilesByUser(rawData);
        setRecords(groupedData);
      } else {
        console.warn('Dữ liệu không phải là mảng', rawData);
        setRecords([]);
      }
    } catch (error) {
      console.error('Error loading records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // [FIX MẠNH MẼ]: Hàm này sẽ map dữ liệu bất chấp viết hoa hay thường
  const groupFilesByUser = (files: any[]): UIMedicalRecord[] => {
    const groups: Record<string, UIMedicalRecord> = {};

    files.forEach((file) => {
      // 1. Xử lý UserID (Kiểm tra nhiều trường hợp)
      const userId = file.userId || file.UserID || file.id || 'unknown';

      if (!groups[userId]) {
        groups[userId] = {
          id: userId,
          patientName: `Bệnh nhân ${userId.substring(0, 6)}...`,
          updatedAt: new Date().toISOString(),
          files: []
        };
      }

      // 2. Xử lý FileName (Ưu tiên fileName -> filename -> Name -> ID)
      const rawFileName = file.fileName || file.filename || file.Name || file.name;
      const displayFileName = rawFileName || file.fileId || 'Tài liệu không tên';

      // 3. Xử lý Link (Ưu tiên Link -> link -> Url -> url)
      const displayLink = file.Link || file.link || file.Url || file.url || '';

      // 4. Xử lý Date (Ưu tiên UploadDate -> uploadDate -> CreatedAt)
      const rawDate = file.UploadDate || file.uploadDate || file.createdAt || new Date().toISOString();

      // 5. Xử lý ID
      const fileId = file.fileId || file.FileId || file.id;

      groups[userId].files.push({
        fileId: fileId,
        fileName: displayFileName,
        uploadDate: rawDate,
        link: displayLink,
        mimeType: file.mimeType || 'application/octet-stream'
      });

      // Cập nhật ngày mới nhất
      groups[userId].updatedAt = rawDate;
    });

    return Object.values(groups);
  };

  const handleViewFile = (url: string) => {
    console.log("Opening URL:", url); // Debug xem URL là gì
    if (url && url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      alert(`Đường dẫn không hợp lệ hoặc bị thiếu! (URL: ${url})`);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Hồ sơ Bệnh nhân</h1>
        <p className="text-gray-600 mt-1">Danh sách bệnh nhân và hồ sơ y tế</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột Trái: Danh sách bệnh nhân */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách bệnh nhân</h2>
          <div className="space-y-3">
            {records.length > 0 ? (
              records.map((record, index) => (
                <button
                  key={`${record.id}-${index}`}
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
                        {record.files.length} tệp tin
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
                {selectedRecord.files.length > 0 ? (
                  selectedRecord.files.map((file, index) => (
                    <div
                      key={`${file.fileId}-${index}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-700" size={20} />
                        <div>
                          {/* Hiển thị tên file */}
                          <p className="font-medium text-gray-900">
                            {file.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString('vi-VN') : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewFile(file.link)}
                          className="p-2 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Xem"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleViewFile(file.link)}
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