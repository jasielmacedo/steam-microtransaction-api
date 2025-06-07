import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  className?: string;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ content, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <HelpCircle
        size={16}
        className="text-gray-400 hover:text-gray-600 cursor-help ml-1"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-6 transform">
          <div className="relative">
            {content}
            <div className="absolute top-2 -left-2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;