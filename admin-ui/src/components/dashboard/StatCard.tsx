import React, { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  color
}) => {
  // Map color to Tailwind classes
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
  };
  
  const iconBg = colorMap[color] || 'bg-gray-50';

  return (
    <div className="card p-4 sm:p-6 transition-transform hover:translate-y-[-2px]">
      <div className="flex items-center mb-2 sm:mb-3">
        <div className={`p-2 rounded-lg mr-3 sm:mr-4 ${iconBg}`}>
          {icon}
        </div>
        <h3 className="text-xs sm:text-sm text-gray-500 font-medium">{title}</h3>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-lg sm:text-2xl font-bold text-gray-900">{value}</div>
        
        <div className={`flex items-center text-xs sm:text-sm ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? (
            <ChevronUp size={16} className="mr-1" />
          ) : (
            <ChevronDown size={16} className="mr-1" />
          )}
          {change}
        </div>
      </div>
    </div>
  );
};

export default StatCard;