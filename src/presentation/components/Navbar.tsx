import { User } from 'lucide-react';

interface NavbarProps {
  userName?: string; // Đổi tên prop từ adminName thành userName cho chuẩn
  userRole?: string; // Thêm prop role
}

export function Navbar({ userName = 'Người dùng', userRole = '' }: NavbarProps) {
  
  // Hàm chuyển đổi role sang tiếng Việt
  const getRoleDisplayName = (role?: string) => {
    if (!role) return '';
    
    // Chuẩn hóa về chữ thường để so sánh
    const lowerRole = role.toLowerCase();
    
    if (lowerRole.includes('admin')) return 'Administrator';
    if (lowerRole.includes('doctor')) return 'Doctor';
    if (lowerRole.includes('nurse')) return 'Nurse';
    if (lowerRole.includes('staff')) return 'Staff';
    
    return role; // Trả về nguyên gốc nếu không khớp
  };

  const displayRole = getRoleDisplayName(userRole);

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-full">
            <User size={20} className="text-blue-700" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800 leading-tight">
              {userName}
            </span>
            {displayRole && (
              <span className="text-xs text-blue-600 font-medium leading-tight">
                {displayRole}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}