import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  LayoutDashboard,
  ShoppingBag,
  History,
  Key,
  Settings,
  UserCircle,
} from 'lucide-react';
import Logo from '../common/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define navigation items
const navItems = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { name: 'Products', path: '/products', icon: <ShoppingBag size={20} /> },
  { name: 'Transactions', path: '/transactions', icon: <History size={20} /> },
  { name: 'API Keys', path: '/api-keys', icon: <Key size={20} /> },
  { name: 'Profile & Team', path: '/profile', icon: <UserCircle size={20} /> },
  { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);
  
  // Close sidebar if pressing escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  // Handle clicks outside sidebar on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const sidebarElement = document.getElementById('sidebar');
      if (isOpen && sidebarElement && !sidebarElement.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
    
      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-white border-r border-gray-200
          lg:translate-x-0 lg:relative lg:flex-shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header with logo and close button */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
            <Link to="/" className="flex items-center space-x-3">
              <Logo size={24} />
              <span className="text-xl font-bold text-gray-900">MicroTrax</span>
            </Link>
            
            <button
              className="p-1 rounded-md lg:hidden hover:bg-gray-100"
              onClick={onClose}
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center px-4 py-3 text-sm rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className={`mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-100 text-center">
            <div className="text-xs text-gray-500">
              MicroTrax Admin v1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;