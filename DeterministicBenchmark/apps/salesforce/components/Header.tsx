import React from 'react';
import { Search, Bell, HelpCircle, Settings, User } from 'lucide-react';

interface HeaderProps {
  onOpenAppLauncher: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAppLauncher }) => (
  <div className="bg-white border-b border-gray-200 shadow-sm">
    <div className="h-12 px-4 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onOpenAppLauncher}
          className="p-2 hover:bg-gray-100 rounded"
          aria-label="App Launcher"
        >
          {/* Salesforce-style 3x3 grid icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-600">
            <g fill="currentColor">
              {/* Top row */}
              <rect x="1" y="1" width="3" height="3" rx="0.5"/>
              <rect x="6" y="1" width="3" height="3" rx="0.5"/>
              <rect x="11" y="1" width="3" height="3" rx="0.5"/>
              {/* Middle row */}
              <rect x="1" y="6" width="3" height="3" rx="0.5"/>
              <rect x="6" y="6" width="3" height="3" rx="0.5"/>
              <rect x="11" y="6" width="3" height="3" rx="0.5"/>
              {/* Bottom row */}
              <rect x="1" y="11" width="3" height="3" rx="0.5"/>
              <rect x="6" y="11" width="3" height="3" rx="0.5"/>
              <rect x="11" y="11" width="3" height="3" rx="0.5"/>
            </g>
          </svg>
        </button>
        <div className="text-lg font-medium text-gray-800">
          Marketing CRM Classic
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded relative">
          <Bell size={16} className="text-gray-600" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </div>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <HelpCircle size={16} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <Settings size={16} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <User size={16} className="text-gray-600" />
        </button>
      </div>
    </div>
  </div>
);

export default Header;
