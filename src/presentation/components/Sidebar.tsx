import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { adminService } from '../../infrastructure/services/adminService';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  // Lấy thông tin user (bao gồm role) từ token thông qua service
  const user = adminService.getUserInfo();

  // Định nghĩa menu với phân quyền (Role-based Access Control)
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'doctor', 'nurse', 'staff']
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: CalendarCheck,
      roles: ['admin', 'doctor', 'staff']
    },
    {
      id: 'records',
      label: 'Medical Records',
      icon: FileText,
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      roles: ['admin']
    },
  ];

  // Lọc các mục menu mà user hiện tại có quyền truy cập
  const visibleItems = menuItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-blue-700 text-white flex flex-col shadow-lg">
      <div className="p-6 border-b border-blue-600">
        <h1 className="text-xl font-bold tracking-tight">Hospital Admin</h1>
        {user && (
          <div className="mt-2">
            <p className="text-xs text-blue-200 uppercase font-semibold">{user.role}</p>
            <p className="text-sm truncate text-blue-100">{user.fullName}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'text-blue-100 hover:bg-blue-600'
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-600">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}