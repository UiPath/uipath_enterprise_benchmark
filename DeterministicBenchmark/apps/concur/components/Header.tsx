import React from 'react';
import { Bell, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  setCurrentView: (view: 'dashboard' | 'manage-expenses' | 'report-details') => void;
}

const Header: React.FC<HeaderProps> = ({ setCurrentView }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="w-full max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - SAP Concur Logo + Home Menu */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">SAP</div>
              <span className="text-lg font-medium text-gray-900">Concur</span>
            </div>
            <div className="relative">
              <button 
                className="flex items-center space-x-1 px-3 py-2 rounded hover:bg-gray-100"
                onClick={() => setCurrentView('dashboard')}
              >
                <span className="text-gray-700">Home</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Right side - User info */}
          <div className="flex items-center space-x-4">
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">HC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
