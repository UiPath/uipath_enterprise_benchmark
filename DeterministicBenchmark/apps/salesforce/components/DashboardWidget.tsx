import React from 'react';

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  title, 
  children, 
  action 
}) => (
  <div className="bg-white rounded-lg shadow border border-gray-200">
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        {action}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default DashboardWidget;
