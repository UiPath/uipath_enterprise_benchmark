import React from 'react';
import { Calendar, User } from 'lucide-react';
import Header from './Header';
import MainNavigation from './MainNavigation';
import DashboardWidget from './DashboardWidget';
import { Lead } from '../data';

interface HomepageProps {
  onOpenAppLauncher: () => void;
  recentLeads: Lead[];
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const Homepage: React.FC<HomepageProps> = ({ 
  onOpenAppLauncher, 
  recentLeads 
}) => {
  return (
    <div className="min-h-screen">
      <Header onOpenAppLauncher={onOpenAppLauncher} />
      <MainNavigation 
        currentTab="home" 
        recentLeads={recentLeads}
      />

      {/* Main Dashboard Content */}
      <div className="p-6">
        {/* Performance Chart */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">Quarterly Performance</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <span>CLOSED $0</span>
                <span>OPEN (OPPTY) $0</span>
                <span>GOAL --</span>
              </div>
            </div>
            {/* Chart placeholder */}
            <div className="h-64 bg-gradient-to-b from-blue-50 to-blue-100 rounded flex items-end justify-around p-4">
              <div className="text-center text-xs text-gray-500">
                <div className="h-16 w-8 bg-orange-300 rounded-t mb-1"></div>
                NOV
              </div>
              <div className="text-center text-xs text-gray-500">
                <div className="h-24 w-8 bg-blue-400 rounded-t mb-1"></div>
                DEC
              </div>
              <div className="text-center text-xs text-gray-500">
                <div className="h-20 w-8 bg-green-400 rounded-t mb-1"></div>
                JAN
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="w-3 h-3 bg-orange-300 rounded"></div>
                <span>Closed</span>
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span>Goal</span>
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Closed + Open (&gt;70%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Events */}
          <DashboardWidget 
            title="Today's Events" 
            action={<button className="text-blue-600 text-sm hover:underline">View Calendar</button>}
          >
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">Looks like you're free and clear the rest of the day.</p>
            </div>
          </DashboardWidget>

          {/* Today's Tasks */}
          <DashboardWidget 
            title="Today's Tasks" 
            action={<button className="text-blue-600 text-sm hover:underline">View All</button>}
          >
            <div className="text-center py-8">
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
                </div>
                <p className="text-gray-500 text-sm">Nothing due today. Be a go-getter, and check back soon.</p>
              </div>
            </div>
          </DashboardWidget>

          {/* Recent Records */}
          <DashboardWidget 
            title="Recent Records" 
            action={<button className="text-blue-600 text-sm hover:underline">View All</button>}
          >
            <div className="space-y-3">
              {recentLeads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{lead.company}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(lead.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>

          {/* Key Deals */}
          <DashboardWidget 
            title="Key Deals - Recent Opportunities" 
            action={<button className="text-blue-600 text-sm hover:underline">View All Key Deals</button>}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Battle Arena Tobinnden</span>
                <span className="font-medium">$69,573.00</span>
              </div>
              <div className="text-xs text-gray-500">
                Acme Core UK Ltd. - 04.07.2025
              </div>
              
              <div className="flex items-center justify-between text-sm border-t pt-3">
                <span className="text-gray-600">Amin Hadinot</span>
                <span className="font-medium">$50,000.00</span>
              </div>
              <div className="text-xs text-gray-500">
                TESTDEMOACCOUNT - 04.08.2025
              </div>
              
              <div className="flex items-center justify-between text-sm border-t pt-3">
                <span className="text-gray-600">TestAlias2</span>
                <span className="font-medium">$232,323.00</span>
              </div>
              <div className="text-xs text-gray-500">
                RelationshipTest_Test - 31.12.2024
              </div>
            </div>
          </DashboardWidget>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
