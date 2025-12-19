import { User } from 'lucide-react';

interface NavbarProps {
  adminName?: string;
}

export function Navbar({ adminName = 'Quản trị viên' }: NavbarProps) {
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
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <User size={20} className="text-blue-700" />
          <span className="font-medium text-gray-700">{adminName}</span>
        </div>
      </div>
    </header>
  );
}
