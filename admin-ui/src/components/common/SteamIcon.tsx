import React from "react";

interface SteamIconProps {
  size?: number;
  className?: string;
}

const SteamIcon: React.FC<SteamIconProps> = ({ size = 24, className = "" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`lucide lucide-custom-steam ${className}`}
    >
      <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-2.45-.3l-4.22 3.12a1 1 0 0 1-1.39-.22 1 1 0 0 1-.13-.41v-4.38a10 10 0 0 1 8.19-7.81z" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="10" cy="14" r="2" />
      <path d="M16 10v4h-6" />
    </svg>
  );
};

export default SteamIcon;