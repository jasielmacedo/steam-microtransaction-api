import React from 'react';
import { Banknote } from 'lucide-react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 24, className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-2 rounded-lg">
        <Banknote size={size} />
      </div>
    </div>
  );
};

export default Logo;