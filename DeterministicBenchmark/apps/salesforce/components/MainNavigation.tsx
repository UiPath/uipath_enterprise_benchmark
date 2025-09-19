import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Home, MessageSquare, Megaphone, Users, User, TrendingUp, 
  BarChart3, Calendar, ChevronDown
} from 'lucide-react';
import { Lead } from '../data';

interface MainNavigationProps {
  currentTab: string;
  recentLeads: Lead[];
  onNavigationAttempt?: (navigationFn: () => void) => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ 
  currentTab, 
  recentLeads,
  onNavigationAttempt
}) => {
  const [showLeadsDropdown, setShowLeadsDropdown] = useState(false);
  const [, setSearchParams] = useSearchParams();

  const handleTabClick = (tabId: string) => {
    const navigateToTab = () => {
      switch (tabId) {
        case 'home':
          setSearchParams({});
          break;
        case 'leads':
          setSearchParams({ view: 'leads' });
          break;
        case 'chatter':
        case 'campaigns':
        case 'contacts':
        case 'opportunities':
        case 'reports':
        case 'dashboards':
        case 'more':
          // For now, these navigate to home - can be implemented later
          setSearchParams({});
          break;
        default:
          setSearchParams({});
      }
    };

    // Use navigation confirmation if provided, otherwise navigate directly
    if (onNavigationAttempt) {
      onNavigationAttempt(navigateToTab);
    } else {
      navigateToTab();
    }
  };
  
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, hasDropdown: false },
    { id: 'chatter', label: 'Chatter', icon: MessageSquare, hasDropdown: false },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, hasDropdown: false },
    { id: 'leads', label: 'Leads', icon: Users, hasDropdown: true },
    { id: 'contacts', label: 'Contacts', icon: User, hasDropdown: false },
    { id: 'opportunities', label: 'Opportunities', icon: TrendingUp, hasDropdown: false },
    { id: 'reports', label: 'Reports', icon: BarChart3, hasDropdown: false },
    { id: 'dashboards', label: 'Dashboards', icon: Calendar, hasDropdown: false },
    { id: 'more', label: 'More', icon: ChevronDown, hasDropdown: false }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4">
        <nav className="flex space-x-6" aria-label="Main navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            if (tab.hasDropdown && tab.id === 'leads') {
              return (
                <div key={tab.id} className="relative">
                  <div className="flex items-center">
                    {/* Main Leads button */}
                    <button
                      onClick={() => handleTabClick(tab.id)}
                      className={`
                        flex items-center space-x-2 px-3 py-3 border-b-2 text-sm font-medium transition-colors
                        ${isActive 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                    
                    {/* Dropdown arrow */}
                    <button
                      onClick={() => setShowLeadsDropdown(!showLeadsDropdown)}
                      className={`
                        p-2 ml-1 text-sm font-medium transition-colors rounded
                        ${isActive 
                          ? 'text-blue-600 hover:bg-blue-50' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {showLeadsDropdown && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowLeadsDropdown(false)}
                      />
                      
                      {/* Dropdown Content */}
                      <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="p-3">
                          {/* New Lead */}
                          <button
                            onClick={() => {
                              setShowLeadsDropdown(false);
                              // Navigate to new lead form (future implementation)
                              setSearchParams({ view: 'leads' });
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center mr-3">
                              <span className="text-green-600 text-lg">+</span>
                            </div>
                            New Lead
                          </button>

                          {/* Recent records */}
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Recent records</h3>
                            <div className="space-y-1">
                              {recentLeads.slice(0, 3).map((lead) => (
                                <button
                                  key={lead.id}
                                  onClick={() => {
                                    setShowLeadsDropdown(false);
                                    setSearchParams({ view: `leads/${lead.id}` });
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                >
                                  <div className="w-6 h-6 bg-teal-100 rounded flex items-center justify-center mr-3">
                                    <User size={14} className="text-teal-600" />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                                    {lead.company && <div className="text-xs text-gray-500">{lead.company}</div>}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Open in new tab */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setShowLeadsDropdown(false);
                                const currentPath = window.location.pathname;
                                const newUrl = `${currentPath}?view=leads`;
                                window.open(newUrl, '_blank');
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-3">
                                <span className="text-gray-600 text-lg">+</span>
                              </div>
                              Open "Recently Viewed | L..." in New Tab
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex items-center space-x-2 px-3 py-3 border-b-2 text-sm font-medium transition-colors
                  ${isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default MainNavigation;
