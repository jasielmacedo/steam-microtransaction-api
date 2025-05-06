import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import Button from '../ui/Button';

interface HeaderProps {
  pageTitle: string;
  user: { name: string; email: string } | null;
  onMenuClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, user, onMenuClick, onLogout }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and page title */}
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              onClick={onMenuClick}
            >
              <Menu size={24} />
            </button>
            
            <h1 className="ml-2 lg:ml-0 text-lg sm:text-xl font-semibold text-gray-900">
              {pageTitle}
            </h1>
          </div>
          
          {/* Right side - User dropdown and notifications */}
          <div className="flex items-center space-x-4">
            {/* Notification bell */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 focus:ring-0"
            >
              <Bell size={20} />
            </Button>
            
            {/* User dropdown */}
            <div className="relative">
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={toggleUserMenu}
              >
                <div className="h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                
                <ChevronDown size={16} className="text-gray-500" />
              </div>
              
              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                  <div className="block px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    Signed in as <span className="font-medium">{user?.email}</span>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <User size={16} className="mr-2" />
                    Profile & Team
                  </button>
                  
                  <button
                    onClick={onLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;