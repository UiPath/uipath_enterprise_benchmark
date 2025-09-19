import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface AppLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToLeads: () => void;
}

const AppLauncher: React.FC<AppLauncherProps> = ({ 
  isOpen, 
  onClose, 
  onNavigateToLeads 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFullView, setShowFullView] = useState(false);

  const apps = [
    { 
      name: 'Service', 
      description: 'Customer service with accounts, contacts, cases, and more',
      icon: '🔧',
      bgColor: 'bg-purple-500'
    },
    { 
      name: 'Marketing CRM Classic', 
      description: 'Track sales and marketing efforts with CRM objects.',
      icon: '📊',
      bgColor: 'bg-blue-500'
    },
    { 
      name: 'Community', 
      description: 'Salesforce CRM Communities',
      icon: '👥',
      bgColor: 'bg-yellow-500'
    },
    { 
      name: 'Salesforce Chatter', 
      description: 'The Salesforce Chatter social network, including profiles and feeds',
      icon: '💬',
      bgColor: 'bg-blue-400'
    },
    { 
      name: 'Content', 
      description: 'Salesforce CRM Content',
      icon: '📄',
      bgColor: 'bg-yellow-600'
    },
    { 
      name: 'Sales Console', 
      description: '(Lightning Experience) Lets sales reps work with multiple records on one screen',
      icon: '🖥️',
      bgColor: 'bg-blue-600'
    },
    { 
      name: 'Service Console', 
      description: '(Lightning Experience) Lets support agents work with multiple records across customer service channels on one screen',
      icon: '🎧',
      bgColor: 'bg-purple-600'
    },
    { 
      name: 'Sales', 
      description: 'Manage your sales process with accounts, leads, opportunities, and more',
      icon: '💰',
      bgColor: 'bg-green-600'
    },
    { 
      name: 'Lightning Usage App', 
      description: 'View Adoption and Usage Metrics for Lightning Experience',
      icon: '⚡',
      bgColor: 'bg-purple-400'
    },
    { 
      name: 'Digital Experiences', 
      description: 'Manage content and media for all your sites.',
      icon: '🌐',
      bgColor: 'bg-indigo-500'
    },
    { 
      name: 'Salesforce Scheduler Setup', 
      description: 'Set up personalized appointment scheduling.',
      icon: '📅',
      bgColor: 'bg-gray-600'
    },
    { 
      name: 'Bolt Solutions', 
      description: 'Discover and manage business solutions designed for your industry.',
      icon: '🔩',
      bgColor: 'bg-blue-700'
    },
    { 
      name: 'Contact Center Demo_PH', 
      description: 'SFDC Test Suite Demo Environment',
      icon: '📞',
      bgColor: 'bg-blue-500'
    },
    { 
      name: 'Salesforce CPQ', 
      description: 'Salesforce CPQ simplifies configuration and ensures pricing accuracy.',
      icon: '💵',
      bgColor: 'bg-teal-600'
    },
    { 
      name: 'Automation', 
      description: 'Automate business processes and repetitive tasks.',
      icon: '🤖',
      bgColor: 'bg-blue-600'
    },
    { 
      name: 'UiPath', 
      description: 'Administer and monitor integration with UiPath Orchestrator.',
      icon: '🔗',
      bgColor: 'bg-orange-500'
    },
    { 
      name: 'Policy Center', 
      description: 'Policy Center',
      icon: '📋',
      bgColor: 'bg-blue-600'
    },
    { 
      name: 'My Service Journey', 
      description: 'Discover new customer service capabilities.',
      icon: '🗺️',
      bgColor: 'bg-blue-400'
    },
    { 
      name: 'Approvals', 
      description: 'Manage approvals and approval flows',
      icon: '✅',
      bgColor: 'bg-green-600'
    },
    { 
      name: 'Cosmin Test App', 
      description: '',
      icon: '🧪',
      bgColor: 'bg-gray-500'
    }
  ];

  const filteredApps = useMemo(() => {
    if (!searchTerm) return apps;
    return apps.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [apps, searchTerm]);

  const handleAppClick = (appName: string) => {
    if (appName === 'Marketing CRM Classic') {
      onNavigateToLeads();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Show full view modal
  if (showFullView) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
        
        {/* Full Modal */}
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-16">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setShowFullView(false)}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      ← Back
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">App Launcher</h2>
                  </div>
                  <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-4 relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search apps or items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">All Apps</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredApps.map((app, index) => (
                      <div
                        key={index}
                        onClick={() => handleAppClick(app.name)}
                        className="p-4 border border-gray-200 rounded-lg transition-colors cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg ${app.bgColor} text-white font-medium`}>
                            {app.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {app.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {app.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Items Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">All Items</h3>
                  <div className="grid grid-cols-4 gap-4 text-xs text-gray-500">
                    <div>
                      <h4 className="font-medium mb-2">Accounts</h4>
                      <h4 className="font-medium mb-2">Communication Subscriptions</h4>
                      <h4 className="font-medium mb-2">Flows</h4>
                      <h4 className="font-medium mb-2">Orchestrator Notifications</h4>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">SCA Cases</h4>
                    </div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show compact view (default)
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* Compact App Launcher Panel */}
      <div className="fixed top-12 left-4 w-96 max-h-96 z-50">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex overflow-hidden">
          
          {/* Compact Single Column Layout */}
          <div className="w-full flex flex-col max-h-96">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">App Launcher</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search apps or items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Apps List - Compact */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">Apps</h3>
                <div className="space-y-1">
                  {filteredApps.slice(0, 6).map((app, index) => (
                    <div
                      key={index}
                      onClick={() => handleAppClick(app.name)}
                      className="flex items-center px-3 py-2 rounded cursor-pointer text-sm transition-colors text-gray-900 hover:bg-blue-50"
                    >
                      <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center text-xs ${app.bgColor} text-white font-medium`}>
                        {app.name.charAt(0)}
                      </div>
                      <span className="truncate flex-1">{app.name}</span>
                      <div className="text-xs text-blue-600 ml-2">→</div>
                    </div>
                  ))}
                </div>

                {/* View All */}
                <div className="px-2 pt-2 border-t border-gray-200 mt-2">
                  <button 
                    onClick={() => setShowFullView(true)}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppLauncher;
