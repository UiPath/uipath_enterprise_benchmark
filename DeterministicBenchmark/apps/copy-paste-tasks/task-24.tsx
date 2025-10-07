import React, { useState, useEffect } from 'react';

interface ServiceTicket {
  id: string;
  ticketRef: string;
  customerId: string;
  issueSummary: string;
  priorityLevel: string;
  reportedBy: string;
  reportDate: string;
  category: string;
  estimatedHours: number;
  affectedSystems: string[];
  assignedTo?: string;
  slaTimer?: number;
  status: string;
}

// Expected source data from Excel
const EXPECTED_TICKETS = [
  {
    ticketRef: 'TKT-4729',
    customerId: 'CORP-8851',
    issueSummary: 'Authentication server timeout errors',
    priorityLevel: 'Critical',
    reportedBy: 'Jennifer Martinez',
    reportDate: '2024-01-20',
    category: 'Network Infrastructure',
    estimatedHours: 6,
    affectedSystems: ['Login System', 'VPN']
  },
  {
    ticketRef: 'TKT-4730',
    customerId: 'CORP-2194',
    issueSummary: 'Database query performance degradation',
    priorityLevel: 'High',
    reportedBy: 'Michael Rodriguez',
    reportDate: '2024-01-21',
    category: 'Database Systems',
    estimatedHours: 12,
    affectedSystems: ['Customer DB', 'Reporting']
  },
  {
    ticketRef: 'TKT-4731',
    customerId: 'CORP-5573',
    issueSummary: 'Mobile app push notifications failing',
    priorityLevel: 'Medium',
    reportedBy: 'Sarah Thompson',
    reportDate: '2024-01-22',
    category: 'Mobile Applications',
    estimatedHours: 8,
    affectedSystems: ['iOS App', 'Notification Service']
  }
];

const PRIORITY_COLORS = {
  'Critical': '#dc2626',
  'High': '#ea580c',
  'Medium': '#ca8a04',
  'Low': '#65a30d'
};

const CATEGORY_TAGS = [
  'Network Infrastructure',
  'Database Systems',
  'Mobile Applications',
  'Web Services',
  'Security',
  'Hardware',
  'Email Systems',
  'Cloud Services'
];

const SYSTEM_TAGS = [
  'Login System',
  'VPN',
  'Customer DB',
  'Reporting',
  'iOS App',
  'Android App',
  'Notification Service',
  'API Gateway',
  'Payment Gateway',
  'Email Server'
];

const TEAM_MEMBERS = [
  'Auto-assign',
  'John Smith',
  'Sarah Chen',
  'Mike Johnson',
  'Lisa Anderson',
  'Robert Kim'
];

export const Task24: React.FC = () => {
  // Initialize app_state immediately
  if (!(window as any).app_state) {
    (window as any).app_state = {
      tickets: [],
      createdTickets: [],
      expectedTickets: EXPECTED_TICKETS
    };
  }

  // Initialize with some demo tickets to populate all columns
  const [tickets, setTickets] = useState<ServiceTicket[]>([
    {
      id: 'demo-open-1',
      ticketRef: 'TKT-4725',
      customerId: 'CORP-1234',
      issueSummary: 'Email server slow response time',
      priorityLevel: 'Low',
      reportedBy: 'Demo User',
      reportDate: '2024-01-18',
      category: 'Email Systems',
      estimatedHours: 3,
      affectedSystems: ['Email Server'],
      assignedTo: 'Lisa Anderson',
      slaTimer: 48,
      status: 'Open'
    },
    {
      id: 'demo-progress-1',
      ticketRef: 'TKT-4726',
      customerId: 'CORP-5678',
      issueSummary: 'Backup job failing overnight',
      priorityLevel: 'Medium',
      reportedBy: 'Demo User',
      reportDate: '2024-01-19',
      category: 'Cloud Services',
      estimatedHours: 5,
      affectedSystems: ['API Gateway'],
      assignedTo: 'Mike Johnson',
      slaTimer: 24,
      status: 'In Progress'
    },
    {
      id: 'demo-resolved-1',
      ticketRef: 'TKT-4720',
      customerId: 'CORP-9012',
      issueSummary: 'Password reset for locked account',
      priorityLevel: 'High',
      reportedBy: 'Demo User',
      reportDate: '2024-01-17',
      category: 'Security',
      estimatedHours: 1,
      affectedSystems: ['Login System'],
      assignedTo: 'Sarah Chen',
      slaTimer: 8,
      status: 'Resolved'
    }
  ]);
  
  // Form data for current ticket
  const [formData, setFormData] = useState({
    ticketRef: '',
    customerId: '',
    issueSummary: '',
    priorityLevel: 'Medium',
    priorityColor: PRIORITY_COLORS['Medium'],
    reportedBy: '',
    reportDate: '',
    category: '',
    estimatedHours: 0,
    affectedSystems: [] as string[],
    assignedTo: 'Auto-assign',
    slaTimer: 0
  });

  // Update app_state whenever tickets or form data change
  useEffect(() => {
    // Filter out demo tickets from validation
    const realTickets = tickets.filter(t => !t.id.startsWith('demo-'));
    const createdTickets = realTickets.map(t => ({
      ticketRef: t.ticketRef,
      customerId: t.customerId,
      issueSummary: t.issueSummary,
      priorityLevel: t.priorityLevel,
      reportedBy: t.reportedBy,
      reportDate: t.reportDate,
      category: t.category,
      estimatedHours: t.estimatedHours,
      affectedSystems: t.affectedSystems,
      assignedTo: t.assignedTo,
      status: t.status
    }));

    // Expose current form data for progressive validation
    (window as any).app_state = {
      tickets: tickets,
      createdTickets: createdTickets,
      currentFormData: {
        ticketRef: formData.ticketRef,
        customerId: formData.customerId,
        issueSummary: formData.issueSummary,
        priorityLevel: formData.priorityLevel,
        reportedBy: formData.reportedBy,
        reportDate: formData.reportDate,
        category: formData.category,
        estimatedHours: formData.estimatedHours,
        affectedSystems: formData.affectedSystems,
        assignedTo: formData.assignedTo,
        slaTimer: formData.slaTimer
      },
      expectedTickets: EXPECTED_TICKETS
    };
  }, [tickets, formData]);

  const handlePriorityChange = (priority: string) => {
    setFormData({
      ...formData,
      priorityLevel: priority,
      priorityColor: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]
    });
  };

  const handleCategorySelect = (category: string) => {
    setFormData({
      ...formData,
      category: category
    });
  };

  const handleSystemToggle = (system: string) => {
    const currentSystems = formData.affectedSystems;
    if (currentSystems.includes(system)) {
      setFormData({
        ...formData,
        affectedSystems: currentSystems.filter(s => s !== system)
      });
    } else {
      setFormData({
        ...formData,
        affectedSystems: [...currentSystems, system]
      });
    }
  };

  const handleAutoAssignment = () => {
    // Simple auto-assignment logic based on priority
    const assignments = {
      'Critical': 'John Smith',
      'High': 'Sarah Chen',
      'Medium': 'Mike Johnson',
      'Low': 'Lisa Anderson'
    };
    const assigned = assignments[formData.priorityLevel as keyof typeof assignments] || 'Robert Kim';
    setFormData({
      ...formData,
      assignedTo: assigned
    });
  };

  const calculateSLA = () => {
    // Calculate SLA based on priority (in hours)
    const slaHours = {
      'Critical': 4,
      'High': 8,
      'Medium': 24,
      'Low': 48
    };
    const sla = slaHours[formData.priorityLevel as keyof typeof slaHours] || 24;
    setFormData({
      ...formData,
      slaTimer: sla
    });
  };

  const handleCreateTicket = () => {
    // Validation
    if (!formData.ticketRef.trim()) return;
    if (!formData.customerId.trim()) return;
    if (!formData.issueSummary.trim()) return;
    if (!formData.reportedBy.trim()) return;
    if (!formData.reportDate.trim()) return;
    if (!formData.category.trim()) return;
    if (formData.affectedSystems.length === 0) return;

    const newTicket: ServiceTicket = {
      id: `ticket-${Date.now()}-${Math.random()}`,
      ticketRef: formData.ticketRef.trim(),
      customerId: formData.customerId.trim(),
      issueSummary: formData.issueSummary.trim(),
      priorityLevel: formData.priorityLevel,
      reportedBy: formData.reportedBy.trim(),
      reportDate: formData.reportDate,
      category: formData.category,
      estimatedHours: formData.estimatedHours,
      affectedSystems: [...formData.affectedSystems],
      assignedTo: formData.assignedTo,
      slaTimer: formData.slaTimer,
      status: 'Open'
    };

    setTickets([...tickets, newTicket]);

    // Reset form
    setFormData({
      ticketRef: '',
      customerId: '',
      issueSummary: '',
      priorityLevel: 'Medium',
      priorityColor: PRIORITY_COLORS['Medium'],
      reportedBy: '',
      reportDate: '',
      category: '',
      estimatedHours: 0,
      affectedSystems: [],
      assignedTo: 'Auto-assign',
      slaTimer: 0
    });
  };

  const handleMoveTicket = (ticketId: string, newStatus: string) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    ));
  };

  const handleRemoveTicket = (ticketId: string) => {
    setTickets(tickets.filter(t => t.id !== ticketId));
  };

  const getTicketsByStatus = (status: string) => {
    return tickets.filter(t => t.status === status);
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">IT Service Ticket System</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Ticket Creation Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Create Ticket</h2>
            
            <div className="space-y-4">
              {/* Ticket Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket Reference
                </label>
                <input
                  type="text"
                  value={formData.ticketRef}
                  onChange={(e) => setFormData({ ...formData, ticketRef: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="TKT-XXXX"
                />
              </div>

              {/* Customer ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="CORP-XXXX"
                />
              </div>

              {/* Issue Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Summary
                </label>
                <textarea
                  value={formData.issueSummary}
                  onChange={(e) => setFormData({ ...formData, issueSummary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Describe the issue"
                />
              </div>

              {/* Priority Level with Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(PRIORITY_COLORS).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => handlePriorityChange(priority)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        formData.priorityLevel === priority
                          ? 'ring-2 ring-offset-2 ring-blue-500'
                          : ''
                      }`}
                      style={{
                        backgroundColor: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS],
                        color: 'white'
                      }}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reported By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reported By
                </label>
                <input
                  type="text"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Reporter name"
                />
              </div>

              {/* Report Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Date
                </label>
                <input
                  type="date"
                  value={formData.reportDate}
                  onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Category Tag Cloud */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleCategorySelect(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        formData.category === tag
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Affected Systems - Multi-select Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affected Systems
                </label>
                <div className="flex flex-wrap gap-2">
                  {SYSTEM_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSystemToggle(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        formData.affectedSystems.includes(tag)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {formData.affectedSystems.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    Selected: {formData.affectedSystems.join(', ')}
                  </div>
                )}
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Hours"
                />
              </div>

              {/* Auto-Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                >
                  {TEAM_MEMBERS.map((member) => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
                <button
                  onClick={handleAutoAssignment}
                  className="w-full py-2 px-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm font-medium"
                >
                  🤖 Trigger Auto-Assignment
                </button>
              </div>

              {/* SLA Timer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SLA Timer
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.slaTimer}
                    onChange={(e) => setFormData({ ...formData, slaTimer: parseInt(e.target.value) || 0 })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Hours"
                  />
                  <button
                    onClick={calculateSLA}
                    className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium whitespace-nowrap"
                  >
                    Calculate SLA
                  </button>
                </div>
                {formData.slaTimer > 0 && (
                  <div className="mt-1 text-xs text-gray-600">
                    ⏱️ {formData.slaTimer} hours until SLA breach
                  </div>
                )}
              </div>

              {/* Create Ticket Button */}
              <button
                onClick={handleCreateTicket}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Ticket Board</h2>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Open Column */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-blue-900">Open</h3>
                  <span className="bg-blue-200 text-blue-900 text-xs font-semibold px-2 py-1 rounded-full">
                    {getTicketsByStatus('Open').length}
                  </span>
                </div>
                
                <div className="space-y-3 max-h-[700px] overflow-y-auto">
                  {getTicketsByStatus('Open').map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg p-3 shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: PRIORITY_COLORS[ticket.priorityLevel as keyof typeof PRIORITY_COLORS] }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm text-gray-900">{ticket.ticketRef}</div>
                        <button
                          onClick={() => handleRemoveTicket(ticket.id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{ticket.issueSummary}</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: PRIORITY_COLORS[ticket.priorityLevel as keyof typeof PRIORITY_COLORS] }}
                        >
                          {ticket.priorityLevel}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                          {ticket.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{ticket.reportedBy}</span>
                        <span>{ticket.estimatedHours}h</span>
                      </div>
                      {ticket.assignedTo && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          👤 {ticket.assignedTo}
                        </div>
                      )}
                      {ticket.slaTimer && ticket.slaTimer > 0 && (
                        <div className="mt-1 text-xs text-orange-600">
                          ⏱️ SLA: {ticket.slaTimer}h
                        </div>
                      )}
                      <div className="mt-2 flex gap-1">
                        <button
                          onClick={() => handleMoveTicket(ticket.id, 'In Progress')}
                          className="flex-1 py-1 px-2 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                        >
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-yellow-900">In Progress</h3>
                  <span className="bg-yellow-200 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full">
                    {getTicketsByStatus('In Progress').length}
                  </span>
                </div>
                
                <div className="space-y-3 max-h-[700px] overflow-y-auto">
                  {getTicketsByStatus('In Progress').map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg p-3 shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: PRIORITY_COLORS[ticket.priorityLevel as keyof typeof PRIORITY_COLORS] }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm text-gray-900">{ticket.ticketRef}</div>
                        <button
                          onClick={() => handleRemoveTicket(ticket.id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{ticket.issueSummary}</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: PRIORITY_COLORS[ticket.priorityLevel as keyof typeof PRIORITY_COLORS] }}
                        >
                          {ticket.priorityLevel}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                          {ticket.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{ticket.reportedBy}</span>
                        <span>{ticket.estimatedHours}h</span>
                      </div>
                      {ticket.assignedTo && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          👤 {ticket.assignedTo}
                        </div>
                      )}
                      <div className="mt-2 flex gap-1">
                        <button
                          onClick={() => handleMoveTicket(ticket.id, 'Open')}
                          className="flex-1 py-1 px-2 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => handleMoveTicket(ticket.id, 'Resolved')}
                          className="flex-1 py-1 px-2 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolved Column */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-green-900">Resolved</h3>
                  <span className="bg-green-200 text-green-900 text-xs font-semibold px-2 py-1 rounded-full">
                    {getTicketsByStatus('Resolved').length}
                  </span>
                </div>
                
                <div className="space-y-3 max-h-[700px] overflow-y-auto">
                  {getTicketsByStatus('Resolved').map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg p-3 shadow-sm border-l-4 opacity-75"
                      style={{ borderLeftColor: PRIORITY_COLORS[ticket.priorityLevel as keyof typeof PRIORITY_COLORS] }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm text-gray-900">{ticket.ticketRef}</div>
                        <button
                          onClick={() => handleRemoveTicket(ticket.id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{ticket.issueSummary}</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: PRIORITY_COLORS[ticket.priorityLevel as keyof typeof PRIORITY_COLORS] }}
                        >
                          {ticket.priorityLevel}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                          {ticket.category}
                        </span>
                      </div>
                      <div className="text-xs text-green-600 font-medium mt-2">
                        ✓ Resolved
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task24;
