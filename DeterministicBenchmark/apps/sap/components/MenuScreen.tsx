// SAP Menu Screen Component
// ============================================================================

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Star, FileText, Settings, Users, BarChart3 } from 'lucide-react';
import { SAP_MENU_STRUCTURE } from '../data';

interface MenuScreenProps {
  onNavigate: (view: string) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onNavigate }) => {
  const [transactionCode, setTransactionCode] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionCode.toUpperCase() === 'MMBE') {
      onNavigate('stock');
    }
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleMenuClick = (transaction?: string) => {
    if (transaction === 'MMBE') {
      onNavigate('stock');
    }
  };

  const getMenuIcon = (menuName: string) => {
    switch (menuName.toLowerCase()) {
      case 'office': return FileText;
      case 'cross-application components': return Settings;
      case 'collaboration projects': return Users;
      case 'logistics': return BarChart3;
      case 'accounting': return BarChart3;
      case 'human resources': return Users;
      case 'information systems': return BarChart3;
      case 'tools': return Settings;
      default: return FileText;
    }
  };

  const renderMenuItem = (item: any, level = 0): React.ReactNode => {
    const isExpanded = expandedMenus[item.id];
    const hasChildren = item.children && item.children.length > 0;
    const Icon = getMenuIcon(item.name);
    
    return (
      <div key={item.id}>
        <div 
          className={`flex items-center p-1 hover:bg-blue-50 cursor-pointer text-sm ${level > 0 ? 'ml-4' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else if (item.transaction) {
              handleMenuClick(item.transaction);
            }
          }}
        >
          {hasChildren ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu(item.id);
              }}
              className="mr-1 text-gray-600"
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : (
            <div className="w-3 mr-1"></div>
          )}
          <Icon size={12} className="mr-2 text-yellow-600" />
          <span className="flex-1">{item.name}</span>
          {item.transaction && (
            <span className="text-xs text-gray-500 ml-2">{item.transaction}</span>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-2">
            {item.children.map((child: any) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full bg-gray-100">
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-sm font-semibold text-gray-700">SAP Easy Access</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="mb-2">
              <div className="flex items-center p-2 hover:bg-blue-50 cursor-pointer">
                <FolderOpen size={16} className="text-yellow-600 mr-2" />
                <span className="text-sm">Favorites</span>
              </div>
              <div className="ml-6 p-1">
                <div className="flex items-center p-1 hover:bg-blue-50 cursor-pointer text-sm">
                  <Star size={12} className="text-yellow-500 mr-2" />
                  <span>Purchasing -&gt; Purchase Order -&gt; Create -&gt; Vendor/Supplying Plant Known</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center p-2 hover:bg-blue-50 cursor-pointer">
                <FolderOpen size={16} className="text-yellow-600 mr-2" />
                <span className="text-sm">SAP menu</span>
              </div>
              <div className="ml-6">
                {SAP_MENU_STRUCTURE.map(item => renderMenuItem(item))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='water' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%2387ceeb'/%3E%3Cstop offset='100%25' style='stop-color:%234682b4'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23water)'/%3E%3C/svg%3E")`
          }}
        >
          <div className="w-full h-full bg-blue-400 bg-opacity-20 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-light mb-4">SAP</h1>
              {showHelp && (
                <div className="bg-white bg-opacity-90 text-gray-800 p-4 rounded max-w-md">
                  <h3 className="font-medium mb-2">Transaction Codes:</h3>
                  <ul className="text-sm space-y-1">
                    <li><strong>MMBE</strong> - Stock Overview</li>
                    <li><strong>MM03</strong> - Display Material</li>
                    <li><strong>ME21N</strong> - Create Purchase Order</li>
                    <li><strong>MIGO</strong> - Goods Movement</li>
                  </ul>
                </div>
              )}
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded mt-4"
              >
                {showHelp ? 'Hide Help' : 'Show Transaction Codes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;
