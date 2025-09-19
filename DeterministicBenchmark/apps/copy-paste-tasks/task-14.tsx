import React, { useState, useEffect } from 'react';
import { Calendar, User, AlertCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';

class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

interface Ticket {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  creationDate: string;
  assignee: string;
  description: string;
  status: 'New' | 'Open' | 'Review' | 'Closed';
  daysSinceCreation: number;
}

const Task14: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null);

  // Generate deterministic ticket data
  const generateTickets = (): Ticket[] => {
    const rng = new SeededRandom(12345);
    const tickets: Ticket[] = [];
    
    const titles = [
      'Database connection timeout',
      'User authentication bug',
      'Payment processing error',
      'Email notifications not working',
      'File upload size limit',
      'Search functionality broken',
      'Dashboard loading slow',
      'Mobile layout issues',
      'API rate limiting error',
      'Report generation failure',
      'Cache invalidation bug',
      'Security vulnerability found',
      'Performance degradation',
      'Data synchronization error',
      'Third-party integration issue',
      'Backup system failure',
      'User profile update bug',
      'Navigation menu glitch',
      'Form validation error',
      'Session timeout issue',
      'Image rendering problem',
      'Notification system bug',
      'Shopping cart error',
      'Password reset failure',
      'Data export timeout',
      'Calendar sync issue',
      'Location services bug',
      'Video streaming error',
      'Chat system malfunction',
      'Analytics tracking bug',
      'Content management error',
      'Workflow automation issue',
      'Multi-language support bug',
      'Permissions system error',
      'Load balancer failure',
      'Database migration issue',
      'SSL certificate expiry',
      'Memory leak detected',
      'Cross-browser compatibility',
      'Responsive design issue',
      'Background job failure',
      'Logging system error',
      'Monitoring alert bug',
      'Configuration drift',
      'Service mesh issue'
    ];

    const assignees = [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Davis', 'David Wilson',
      'Lisa Chen', 'Robert Miller', 'Jennifer Garcia', 'William Jones', 'Jessica Taylor',
      'James Anderson', 'Ashley Martinez', 'Christopher Lee', 'Amanda Clark', 'Daniel Rodriguez'
    ];

    const priorities: ('Low' | 'Medium' | 'High')[] = [];
    
    // Create priority distribution for 45 tickets
    // We need exactly 12 tickets older than 30 days with specific priority distribution:
    // 5 High, 4 Medium, 3 Low for old tickets
    // Remaining 33 tickets distributed among priorities
    
    // First, add priorities for the 12 old tickets (positions will be scattered)
    const oldTicketPositions = [2, 5, 8, 11, 15, 19, 23, 27, 31, 35, 39, 43]; // Scattered positions
    const oldTicketPriorities: ('Low' | 'Medium' | 'High')[] = [
      'High', 'High', 'High', 'High', 'High', // 5 High priority
      'Medium', 'Medium', 'Medium', 'Medium',  // 4 Medium priority  
      'Low', 'Low', 'Low'                     // 3 Low priority
    ];
    
    // Shuffle old ticket priorities
    for (let i = oldTicketPriorities.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [oldTicketPriorities[i], oldTicketPriorities[j]] = [oldTicketPriorities[j], oldTicketPriorities[i]];
    }

    // Fill all 45 positions with priorities
    for (let i = 0; i < 45; i++) {
      const oldTicketIndex = oldTicketPositions.indexOf(i);
      if (oldTicketIndex !== -1) {
        priorities.push(oldTicketPriorities[oldTicketIndex]);
      } else {
        // Random priority for other tickets
        const randomPriorities: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
        priorities.push(randomPriorities[Math.floor(rng.next() * 3)]);
      }
    }

    const currentDate = new Date();
    
    for (let i = 0; i < 45; i++) {
      const isOldTicket = oldTicketPositions.includes(i);
      
      // Generate creation date
      let daysSinceCreation: number;
      if (isOldTicket) {
        // Old tickets: 31-60 days ago  
        daysSinceCreation = 31 + Math.floor(rng.next() * 30);
      } else {
        // Recent tickets: 1-30 days ago
        daysSinceCreation = 1 + Math.floor(rng.next() * 30);
      }
      
      const creationDate = new Date(currentDate);
      creationDate.setDate(creationDate.getDate() - daysSinceCreation);
      
      tickets.push({
        id: `TCK-${(i + 1).toString().padStart(3, '0')}`,
        title: titles[i % titles.length],
        priority: priorities[i],
        creationDate: creationDate.toLocaleDateString(),
        assignee: assignees[Math.floor(rng.next() * assignees.length)],
        description: `Issue description for ${titles[i % titles.length]}. This ticket requires attention from the development team.`,
        status: 'Open', // All tickets start in Open column
        daysSinceCreation
      });
    }

    return tickets;
  };

  useEffect(() => {
    const generatedTickets = generateTickets();
    setTickets(generatedTickets);
  }, []);

  // Expose state for testing
  useEffect(() => {
    const ticketsOlderThan30Days = tickets.filter(t => t.daysSinceCreation > 30);
    const highPriorityOldTickets = ticketsOlderThan30Days.filter(t => t.priority === 'High');
    
    (window as any).app_state = {
      tickets,
      ticketsOlderThan30Days,
      highPriorityOldTickets,
      reviewColumnTickets: tickets.filter(t => t.status === 'Review'),
      // For test validation
      expectedReviewTickets: highPriorityOldTickets.map(t => t.id)
    };
  }, [tickets]);

  const handleDragStart = (ticketId: string) => {
    setDraggedTicket(ticketId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus: 'New' | 'Open' | 'Review' | 'Closed') => {
    if (draggedTicket) {
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === draggedTicket 
            ? { ...ticket, status: targetStatus }
            : ticket
        )
      );
      setDraggedTicket(null);
    }
  };

  const getTicketsByStatus = (status: 'New' | 'Open' | 'Review' | 'Closed') => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const getPriorityColor = (priority: 'Low' | 'Medium' | 'High') => {
    switch (priority) {
      case 'High': return 'border-l-red-500 bg-red-50';
      case 'Medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'Low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: 'Low' | 'Medium' | 'High') => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTicketCard = (ticket: Ticket) => {
    const isOldTicket = ticket.daysSinceCreation > 30;
    
    return (
      <div
        key={ticket.id}
        draggable
        onDragStart={() => handleDragStart(ticket.id)}
        className={`p-3 mb-3 rounded-lg border border-gray-200 cursor-move hover:shadow-md transition-shadow ${getPriorityColor(ticket.priority)} ${
          draggedTicket === ticket.id ? 'opacity-50' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm">{ticket.id}</h4>
            <p className="text-sm text-gray-700 mt-1">{ticket.title}</p>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{ticket.creationDate}</span>
            {isOldTicket && (
              <span className="ml-2 text-orange-600 font-medium">
                ({ticket.daysSinceCreation} days old)
              </span>
            )}
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <User className="w-3 h-3 mr-1" />
            <span>{ticket.assignee}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderColumn = (status: 'New' | 'Open' | 'Review' | 'Closed', title: string, bgColor: string) => {
    const columnTickets = getTicketsByStatus(status);
    
    return (
      <div className="flex-1 bg-gray-50 rounded-lg p-4">
        <div className={`rounded-lg p-3 mb-4 ${bgColor}`}>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{columnTickets.length} tickets</p>
        </div>
        
        <div
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(status)}
          className="overflow-y-auto space-y-2"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          {columnTickets.map(renderTicketCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-white p-6 flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ticket Management System</h1>
      </div>
      
      <div className="grid grid-cols-4 gap-6 flex-1">
        {renderColumn('New', 'New', 'bg-blue-100')}
        {renderColumn('Open', 'Open', 'bg-yellow-100')}
        {renderColumn('Review', 'Review', 'bg-purple-100')}
        {renderColumn('Closed', 'Closed', 'bg-green-100')}
      </div>
    </div>
  );
};

export default Task14;
