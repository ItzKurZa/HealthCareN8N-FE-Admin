import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

export function StatCard({ title, value, icon: Icon, bgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-4 rounded-lg`}>
          <Icon size={28} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
