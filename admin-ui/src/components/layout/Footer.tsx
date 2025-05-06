import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MicroTrax. All rights reserved.
        </div>
        
        <div className="mt-2 sm:mt-0 text-sm text-gray-500">
          <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
          <span className="mx-2">·</span>
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
          <span className="mx-2">·</span>
          <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;