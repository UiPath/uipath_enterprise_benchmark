import React, { useState } from 'react';
import { ArrowLeft, Plus, User, Phone, Mail, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import { Lead, Task, Call, Event, Email, User as UserType, Account, Opportunity, Case } from '../data';
import Header from './Header';
import MainNavigation from './MainNavigation';
import NewTaskModal from './NewTaskModal';
import NewCallModal from './NewCallModal';
import NewEventModal from './NewEventModal';
import NewEmailModal from './NewEmailModal';
import './slds-path.css';

interface LeadDetailProps {
  lead: Lead;
  tasks: Task[];
  calls: Call[];
  events: Event[];
  emails: Email[];
  onBack: () => void;
  onOpenAppLauncher: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCreateCall: (call: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCreateEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCreateEmail: (email: Omit<Email, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (id: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCall: (id: string, call: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateEvent: (id: string, event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateEmail: (id: string, email: Omit<Email, 'id' | 'createdAt' | 'updatedAt'>) => void;
  recentLeads: Lead[];
  users: UserType[];
  accounts: Account[];
  opportunities: Opportunity[];
  cases: Case[];
}

const LeadDetail: React.FC<LeadDetailProps> = ({ 
  lead, 
  tasks,
  calls,
  events,
  emails,
  onBack, 
  onOpenAppLauncher,
  onUpdateLead,
  onCreateTask,
  onCreateCall,
  onCreateEvent,
  onCreateEmail,
  onUpdateTask,
  onUpdateCall,
  onUpdateEvent,
  onUpdateEmail,
  recentLeads,
  users,
  accounts,
  opportunities,
  cases
}) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'details' | 'chatter'>('activity');
  const [chatterPost, setChatterPost] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewCallModal, setShowNewCallModal] = useState(false);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showNewEmailModal, setShowNewEmailModal] = useState(false);
  
  // Edit modal states
  const [editingActivity, setEditingActivity] = useState<{
    type: 'task' | 'call' | 'event' | 'email';
    data: any;
  } | null>(null);

  const handlePostChatter = () => {
    if (chatterPost.trim()) {
      console.log('Posting to Chatter:', chatterPost);
      setChatterPost('');
    }
  };



  const handleStartEdit = () => {
    setIsEditing(true);
    // Initialize form data with current lead values
    setFormData({
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      company: lead.company || '',
      title: lead.title || '',
      phone: lead.phone || '',
      mobile: lead.mobile || '',
      fax: lead.fax || '',
      email: lead.email || '',
      website: lead.website || '',
      status: lead.status || 'Open - Not Contacted',
      leadSource: lead.leadSource || undefined,
      industry: lead.industry || undefined,
      rating: lead.rating || undefined,
      annualRevenue: lead.annualRevenue || '',
      numberOfEmployees: lead.numberOfEmployees || '',
      street: lead.street || '',
      city: lead.city || '',
      state: lead.state || '',
      postalCode: lead.postalCode || '',
      country: lead.country || '',
      productInterest: lead.productInterest || '',
      currentGenerators: lead.currentGenerators || '',
      sicCode: lead.sicCode || '',
      primary: lead.primary || undefined,
      numberOfLocations: lead.numberOfLocations || '',
      description: lead.description || ''
    });
  };

  const handleSaveEdit = () => {
    const updatedLead = { ...lead, ...formData };
    onUpdateLead(updatedLead);
    setIsEditing(false);
    setFormData({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleFormDataChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Handle editing activities
  const handleEditActivity = (type: 'task' | 'call' | 'event' | 'email', activityId: string) => {
    let activityData;
    
    switch (type) {
      case 'task':
        activityData = tasks.find(task => task.id === activityId);
        break;
      case 'call':
        activityData = calls.find(call => call.id === activityId);
        break;
      case 'event':
        activityData = events.find(event => event.id === activityId);
        break;
      case 'email':
        activityData = emails.find(email => email.id === activityId);
        break;
    }

    if (activityData) {
      setEditingActivity({ type, data: activityData });
    }
  };

  const handleCloseEditModal = () => {
    setEditingActivity(null);
  };

  const handleUpdateActivity = (updatedData: any) => {
    if (!editingActivity) return;

    switch (editingActivity.type) {
      case 'task':
        onUpdateTask(editingActivity.data.id, updatedData);
        break;
      case 'call':
        onUpdateCall(editingActivity.data.id, updatedData);
        break;
      case 'event':
        onUpdateEvent(editingActivity.data.id, updatedData);
        break;
      case 'email':
        onUpdateEmail(editingActivity.data.id, updatedData);
        break;
    }

    // Close the modal
    setEditingActivity(null);
    
    // Force a small delay to ensure state updates are processed
    // This helps with immediate UI updates when activities move between leads
    setTimeout(() => {
      // The component will automatically re-render due to prop changes from the update
      console.log('Activity updated and feed should refresh');
    }, 50);
  };

  // Get upcoming and overdue tasks only for this specific lead
  const getUpcomingTasks = () => {
    return tasks.filter(task => 
      (task.relatedToId === lead.id || task.nameId === lead.id) &&
      task.status !== 'Completed' && 
      (task.dueDate || task.status === 'Not Started' || task.status === 'In Progress')
    );
  };

  // Create completed activity feed (excluding incomplete tasks)
  const createCompletedActivityFeed = () => {
    const activities: Array<{
      id: string;
      type: 'task' | 'call' | 'event' | 'email';
      subject: string;
      activityDate: Date; // When the activity actually happened
      status?: string;
      dueDate?: Date;
      priority?: string;
      assignedToName?: string;
      description?: string;
      comments?: string;
      location?: string;
      from?: string;
      to?: string[];
      body?: string;
      startTime?: string;
      endTime?: string;
      emailStatus?: 'sent' | 'bounced' | 'delivered';
    }> = [];

    // Add completed tasks only for this specific lead
    tasks.forEach(task => {
      if ((task.relatedToId === lead.id || task.nameId === lead.id) && task.status === 'Completed') {
        activities.push({
          id: task.id,
          type: 'task',
          subject: task.subject,
          activityDate: task.updatedAt, // Use completion date
          status: task.status,
          dueDate: task.dueDate,
          priority: task.priority,
          assignedToName: task.assignedToName,
          description: task.description
        });
      }
    });

    // Add all calls for this specific lead (calls are always "completed" when logged)
    calls.forEach(call => {
      if (call.relatedToId === lead.id || call.nameId === lead.id) {
        activities.push({
          id: call.id,
          type: 'call',
          subject: call.subject,
          activityDate: call.createdAt, // When call was logged
          comments: call.comments
        });
      }
    });

    // Add events that have occurred for this specific lead
    events.forEach(event => {
      const eventDate = new Date(event.startDate);
      const now = new Date();
      if ((event.relatedToId === lead.id || event.nameId === lead.id) && eventDate <= now) { // Only past events for this lead
        activities.push({
          id: event.id,
          type: 'event',
          subject: event.subject,
          activityDate: eventDate, // Actual event date
          location: event.location,
          startTime: event.startTime,
          endTime: event.endTime
        });
      }
    });

    // Add emails for this specific lead (with status indicators)
    emails.forEach(email => {
      if (email.nameId === lead.id) {
        activities.push({
          id: email.id,
          type: 'email',
          subject: email.subject,
          activityDate: email.createdAt, // When email was sent
          from: email.from,
          to: email.to,
          body: email.body,
          emailStatus: email.subject.includes('TEST') ? 'bounced' : 'sent' // Demo logic for bounced emails
        });
      }
    });

    // Sort by activity date (newest first)
    return activities.sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime());
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return (
          <div className="w-6 h-6 bg-green-100 rounded-sm flex items-center justify-center">
            <CheckCircle size={14} className="text-green-600" />
          </div>
        );
      case 'call':
        return (
          <div className="w-6 h-6 bg-teal-100 rounded-sm flex items-center justify-center">
            <svg className="w-3 h-3 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </div>
        );
      case 'event':
        return (
          <div className="w-6 h-6 bg-purple-100 rounded-sm flex items-center justify-center">
            <Calendar size={14} className="text-purple-600" />
          </div>
        );
      case 'email':
        return (
          <div className="w-6 h-6 bg-blue-100 rounded-sm flex items-center justify-center">
            <Mail size={14} className="text-blue-600" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-100 rounded-sm flex items-center justify-center">
            <span className="text-gray-600 text-xs">?</span>
          </div>
        );
    }
  };

  const formatActivityTime = (createdAt: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';  
    } else {
      return createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderActivityTab = () => (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center space-x-3 p-4">
        <button 
          onClick={() => setShowNewTaskModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          <Plus size={14} className="text-green-600" />
          <span>New Task</span>
        </button>
        <button 
          onClick={() => setShowNewCallModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          <Phone size={14} className="text-blue-600" />
          <span>Log a Call</span>
        </button>
        <button 
          onClick={() => setShowNewEventModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          <Calendar size={14} className="text-purple-600" />
          <span>New Event</span>
        </button>
        <button 
          onClick={() => setShowNewEmailModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          <Mail size={14} className="text-gray-600" />
          <span>Email</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-gray-600">
          Filters: All time • All activities • All types
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <button className="text-blue-600 hover:underline">Refresh</button>
          <button className="text-blue-600 hover:underline">Expand All</button>
          <button className="text-blue-600 hover:underline">View All</button>
        </div>
      </div>

      {/* Upcoming & Overdue Tasks */}
      <div className="bg-white rounded border">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-medium text-gray-900 flex items-center">
            <span className="mr-2">▼</span>
            Upcoming & Overdue
          </h3>
        </div>
        <div className="p-4">
          {(() => {
            const upcomingTasks = getUpcomingTasks();
            return upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 mb-4 last:mb-0">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon('task')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <button 
                        className="font-medium text-blue-600 text-sm cursor-pointer hover:underline text-left"
                        onClick={() => handleEditActivity('task', task.id)}
                      >
                        {task.subject}
                      </button>
                      <span className="text-sm text-gray-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {task.description || 'You have an upcoming task'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 py-4">No upcoming tasks</div>
            );
          })()}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded border">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-medium text-gray-900 flex items-center">
            <span className="mr-2">▼</span>
            August • 2025
          </h3>
        </div>
        <div className="p-4">
          {(() => {
            const completedActivities = createCompletedActivityFeed();
            return completedActivities.length > 0 ? (
              completedActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 mb-4 last:mb-0">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="font-medium text-blue-600 text-sm cursor-pointer hover:underline text-left"
                          onClick={() => handleEditActivity(activity.type, activity.id)}
                        >
                          {activity.subject}
                        </button>
                        {/* Email status indicator */}
                        {activity.type === 'email' && activity.emailStatus === 'bounced' && (
                          <span className="inline-flex items-center space-x-1">
                            <svg className="w-3 h-3 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                            </svg>
                            <span className="text-xs text-orange-600 font-medium">Bounced</span>
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatActivityTime(activity.activityDate)}
                        {activity.startTime && (
                          <span> | {activity.startTime}</span>
                        )}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {activity.type === 'task' && 'You completed a task'}
                      {activity.type === 'call' && (activity.comments || 'You logged a call')}
                      {activity.type === 'event' && `You had an event${activity.location ? ` at ${activity.location}` : ''}`}
                      {activity.type === 'email' && activity.to && activity.to.length > 0 && (
                        <>You sent an email to <span className="text-blue-600">{activity.to[0].split('@')[0]}</span></>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 py-4">No more past activities to load.</div>
            );
          })()}
        </div>
      </div>

      {/* No Past Activity */}
      <div className="text-center py-8 text-gray-500">
        <p>No past activity. Past meetings and tasks marked as done show up here.</p>
      </div>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Lead Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Owner</label>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-sm text-gray-900">{lead.ownerName}</span>
            </div>
          </div>

          {/* Name */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.firstName || lead.firstName || ''}
                  onChange={(e) => handleFormDataChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  value={formData.lastName || lead.lastName || ''}
                  onChange={(e) => handleFormDataChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Last Name"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.firstName} {lead.lastName}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520"
                  fill="currentColor"
                  onClick={handleStartEdit}
                >
                  <path d="M453 45L357 141l76 76 96-96c17-17 17-42 0-59l-17-17c-17-17-42-17-59 0zm-306 306c-3 3-5 7-6 11l-12 84c-1 7 5 13 12 12l84-12c4-1 8-3 11-6l207-207-76-76-220 194z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Company */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.company || lead.company}
                onChange={(e) => handleFormDataChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.company}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520" 
                  onClick={handleStartEdit}
                >
                  <g>
                    <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"></path>
                  </g>
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.title || lead.title || ''}
                onChange={(e) => handleFormDataChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.title || ''}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520" 
                  onClick={handleStartEdit}
                >
                  <g>
                    <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"></path>
                  </g>
                </svg>
              </div>
            )}
          </div>

          {/* Lead Source */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
            {isEditing ? (
              <select
                value={formData.leadSource || lead.leadSource || ''}
                onChange={(e) => handleFormDataChange('leadSource', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--None--</option>
                <option value="Web">Web</option>
                <option value="Phone Inquiry">Phone Inquiry</option>
                <option value="Partner Referral">Partner Referral</option>
                <option value="Purchased List">Purchased List</option>
                <option value="Trade Show">Trade Show</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.leadSource || 'Purchased List'}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520"
                  fill="currentColor"
                  onClick={handleStartEdit}
                >
                  <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Industry */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            {isEditing ? (
              <select
                value={formData.industry || lead.industry || ''}
                onChange={(e) => handleFormDataChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--None--</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Apparel">Apparel</option>
                <option value="Banking">Banking</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Communications">Communications</option>
                <option value="Construction">Construction</option>
                <option value="Consulting">Consulting</option>
                <option value="Education">Education</option>
                <option value="Electronics">Electronics</option>
                <option value="Energy">Energy</option>
                <option value="Engineering">Engineering</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Environmental">Environmental</option>
                <option value="Finance">Finance</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Government">Government</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Insurance">Insurance</option>
                <option value="Machinery">Machinery</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Media">Media</option>
                <option value="Not For Profit">Not For Profit</option>
                <option value="Recreation">Recreation</option>
                <option value="Retail">Retail</option>
                <option value="Shipping">Shipping</option>
                <option value="Technology">Technology</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Transportation">Transportation</option>
                <option value="Utilities">Utilities</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.industry || ''}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520"
                  fill="currentColor"
                  onClick={handleStartEdit}
                >
                  <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Annual Revenue */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Revenue</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.annualRevenue || lead.annualRevenue || ''}
                onChange={(e) => handleFormDataChange('annualRevenue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.annualRevenue || ''}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520"
                  fill="currentColor"
                  onClick={handleStartEdit}
                >
                  <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Phone */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (2)</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone || lead.phone || ''}
                onChange={(e) => handleFormDataChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">{lead.phone || ''}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520" 
                  onClick={handleStartEdit}
                >
                  <g>
                    <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"></path>
                  </g>
                </svg>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.mobile || lead.mobile || ''}
                onChange={(e) => handleFormDataChange('mobile', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.mobile || ''}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520" 
                  onClick={handleStartEdit}
                >
                  <g>
                    <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"></path>
                  </g>
                </svg>
              </div>
            )}
          </div>

          {/* Fax */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.fax || lead.fax || ''}
                onChange={(e) => handleFormDataChange('fax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.fax || ''}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520"
                  fill="currentColor"
                  onClick={handleStartEdit}
                >
                  <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email || lead.email || ''}
                onChange={(e) => handleFormDataChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">{lead.email || ''}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520" 
                  onClick={handleStartEdit}
                >
                  <g>
                    <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"></path>
                  </g>
                </svg>
              </div>
            )}
          </div>

          {/* Website */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            {isEditing ? (
              <input
                type="url"
                value={formData.website || lead.website || ''}
                onChange={(e) => handleFormDataChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.website || ''}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520"
                  fill="currentColor"
                  onClick={handleStartEdit}
                >
                  <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Lead Status */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Status</label>
            {isEditing ? (
              <select
                value={formData.status || lead.status}
                onChange={(e) => handleFormDataChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Open - Not Contacted">Open - Not Contacted</option>
                <option value="Working - Contacted">Working - Contacted</option>
                <option value="Closed - Converted">Closed - Converted</option>
                <option value="Closed - Not Converted">Closed - Not Converted</option>
              </select>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.status}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520" 
                  onClick={handleStartEdit}
                >
                  <g>
                    <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"></path>
                  </g>
                </svg>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            {isEditing ? (
              <select
                value={formData.rating || lead.rating || ''}
                onChange={(e) => handleFormDataChange('rating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--None--</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.rating || ''}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520"
                  fill="currentColor"
                  onClick={handleStartEdit}
                >
                  <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
                </svg>
              </div>
            )}
          </div>

          {/* No. of Employees */}
          <div className="pb-2 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">No. of Employees</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.numberOfEmployees || lead.numberOfEmployees || ''}
                onChange={(e) => handleFormDataChange('numberOfEmployees', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.numberOfEmployees || ''}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520"
                  fill="currentColor"
                  onClick={handleStartEdit}
                >
                  <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional sections */}
      <div className="space-y-6">
        {/* Address */}
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Address</h3>
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={formData.street || lead.street || ''}
                onChange={(e) => handleFormDataChange('street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Street"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.city || lead.city || ''}
                  onChange={(e) => handleFormDataChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={formData.state || lead.state || ''}
                  onChange={(e) => handleFormDataChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="State"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.postalCode || lead.postalCode || ''}
                  onChange={(e) => handleFormDataChange('postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Postal Code"
                />
                <input
                  type="text"
                  value={formData.country || lead.country || ''}
                  onChange={(e) => handleFormDataChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Country"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">{lead.city && lead.state ? `${lead.city}, ${lead.state}` : 'KS, USA'}</span>
              <svg 
                className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                focusable="false" 
                aria-hidden="true" 
                viewBox="0 0 520 520"
                fill="currentColor"
                onClick={handleStartEdit}
              >
                <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="pb-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Product Interest</h3>
            {isEditing ? (
              <select
                value={formData.productInterest || lead.productInterest || ''}
                onChange={(e) => handleFormDataChange('productInterest', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--None--</option>
                <option value="GC1000 series">GC1000 series</option>
                <option value="GC5000 series">GC5000 series</option>
                <option value="GC3000 series">GC3000 series</option>
                <option value="TruckCall">TruckCall</option>
                <option value="SLA: Bronze">SLA: Bronze</option>
                <option value="SLA: Silver">SLA: Silver</option>
                <option value="SLA: Gold">SLA: Gold</option>
                <option value="SLA: Platinum">SLA: Platinum</option>
              </select>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.productInterest || 'GC5000 series'}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520"
                  fill="currentColor"
                  onClick={handleStartEdit}
                >
                  <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
                </svg>
              </div>
            )}
          </div>
          <div className="pb-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Generator(s)</h3>
            {isEditing ? (
              <input
                type="text"
                value={formData.currentGenerators || lead.currentGenerators || ''}
                onChange={(e) => handleFormDataChange('currentGenerators', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{lead.currentGenerators || 'All'}</span>
                <svg 
                  className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                  focusable="false" 
                  aria-hidden="true" 
                  viewBox="0 0 520 520"
                  fill="currentColor"
                  onClick={handleStartEdit}
                >
                  <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="pb-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Created By</h3>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-sm text-gray-900">UiPath Labs, 03.04.2023, 13:21</span>
            </div>
          </div>
          <div className="pb-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Last Modified By</h3>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-sm text-gray-900">UiPath Labs, 04.08.2025, 07:09</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Description</h3>
          {isEditing ? (
            <textarea
              value={formData.description || lead.description || ''}
              onChange={(e) => handleFormDataChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">{lead.description || 'javascript:void(0)'}</span>
              <svg 
                className="text-gray-400 cursor-pointer hover:text-blue-600 slds-icon slds-icon_xx-small" 
                focusable="false" 
                aria-hidden="true" 
                viewBox="0 0 520 520"
                fill="currentColor"
                onClick={handleStartEdit}
              >
                <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"/>
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Global Save/Cancel buttons when editing */}
      {isEditing && (
        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );

  const renderChatterTab = () => (
    <div className="p-6 space-y-6">
      {/* Post Composer */}
      <div className="bg-white border rounded">
        <div className="flex items-center space-x-2 px-4 py-2 border-b">
          <button className="px-3 py-1 text-sm text-blue-600 border-b-2 border-blue-600 font-medium">Post</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">Poll</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">Question</button>
        </div>
        <div className="p-4">
          <textarea
            value={chatterPost}
            onChange={(e) => setChatterPost(e.target.value)}
            placeholder="Share an update..."
            className="w-full border-none resize-none focus:outline-none text-sm"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handlePostChatter}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Activity Filter */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Most Recent Activity</div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search this feed..."
            className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white border rounded p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">{task.createdBy}</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Task created</span>
                  <span className="text-sm text-gray-500">2m ago</span>
                </div>
                <div className="mb-3">
                  <div className="font-medium text-gray-900">{task.subject}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>Subject: {task.subject}</div>
                    <div>Name: {task.relatedToName}</div>
                    <div>Related To: -</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <button className="hover:text-blue-600">
                    <MessageSquare size={14} className="inline mr-1" />
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity to display.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen">
        <Header onOpenAppLauncher={onOpenAppLauncher} />
      <MainNavigation 
        currentTab="leads" 
        recentLeads={recentLeads}
      />

      {/* Lead Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center">
                  <User size={16} className="text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Lead</div>
                  <h1 className="text-lg font-medium text-gray-900">{lead.salutation || 'Mr.'} {lead.firstName} {lead.lastName}</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
                <Plus size={14} />
                <span>Follow</span>
              </button>
              <button className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                New Case
              </button>
              <button className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                New Note
              </button>
              <button className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                Submit for Approval
              </button>
            </div>
          </div>

          {/* Lead Summary */}
          <div className="grid grid-cols-4 gap-8 mb-4">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Title</div>
              <div className="text-sm text-gray-900">{lead.title}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Company</div>
              <div className="text-sm text-gray-900">{lead.company}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Phone (2)</div>
              <div className="text-sm text-blue-600">{lead.phone}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Email</div>
              <div className="text-sm text-blue-600">{lead.email}</div>
            </div>
          </div>
        </div>

        {/* Status Pipeline using SLDS Path */}
        <div className="px-6 pb-4">
          <div className="slds-path">
            <ul role="listbox" aria-orientation="horizontal" className="slds-path__nav">
              {lead.status === 'Working - Contacted' ? (
                // Pipeline for Working - Contacted status
                <>
                  {/* Stage 1 - Complete */}
                  <li role="presentation" className="slds-is-complete slds-path__item">
                    <a className="slds-path__link" tabIndex={-1}>
                      <span className="slds-path__stage">
                        <svg className="slds-icon slds-icon_xx-small" focusable="false" aria-hidden="true" viewBox="0 0 520 520">
                          <g>
                            <path d="M191 425L26 259c-6-6-6-16 0-22l22-22c6-6 16-6 22 0l124 125a10 10 0 0015 0L452 95c6-6 16-6 22 0l22 22c6 6 6 16 0 22L213 425c-6 7-16 7-22 0z"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="slds-path__title">Open - Not Contacted</span>
                    </a>
                  </li>
                  
                  {/* Stage 2 - Current */}
                  <li role="presentation" className="slds-is-current slds-is-active slds-path__item">
                    <a className="slds-path__link" tabIndex={0}>
                      <span className="slds-path__stage"></span>
                      <span className="slds-path__title">Working - Contacted</span>
                    </a>
                  </li>
                  
                  {/* Stage 3 - Incomplete */}
                  <li role="presentation" className="slds-is-incomplete slds-path__item">
                    <a className="slds-path__link" tabIndex={-1}>
                      <span className="slds-path__stage"></span>
                      <span className="slds-path__title">Closed - Not Converted</span>
                    </a>
                  </li>
                  
                  {/* Stage 4 - Incomplete */}
                  <li role="presentation" className="slds-is-incomplete slds-path__item">
                    <a className="slds-path__link" tabIndex={-1}>
                      <span className="slds-path__stage"></span>
                      <span className="slds-path__title">Converted</span>
                    </a>
                  </li>
                </>
              ) : (
                // Pipeline for Closed - Converted status  
                <>
                  {/* Stage 1 - Complete */}
                  <li role="presentation" className="slds-is-complete slds-path__item">
                    <a className="slds-path__link" tabIndex={-1}>
                      <span className="slds-path__stage">
                        <svg className="slds-icon slds-icon_xx-small" focusable="false" aria-hidden="true" viewBox="0 0 520 520">
                          <g>
                            <path d="M191 425L26 259c-6-6-6-16 0-22l22-22c6-6 16-6 22 0l124 125a10 10 0 0015 0L452 95c6-6 16-6 22 0l22 22c6 6 6 16 0 22L213 425c-6 7-16 7-22 0z"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="slds-path__title">Open - Not Contacted</span>
                    </a>
                  </li>
                  
                  {/* Stage 2 - Complete */}
                  <li role="presentation" className="slds-is-complete slds-path__item">
                    <a className="slds-path__link" tabIndex={-1}>
                      <span className="slds-path__stage">
                        <svg className="slds-icon slds-icon_xx-small" focusable="false" aria-hidden="true" viewBox="0 0 520 520">
                          <g>
                            <path d="M191 425L26 259c-6-6-6-16 0-22l22-22c6-6 16-6 22 0l124 125a10 10 0 0015 0L452 95c6-6 16-6 22 0l22 22c6 6 6 16 0 22L213 425c-6 7-16 7-22 0z"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="slds-path__title">Working - Contacted</span>
                    </a>
                  </li>
                  
                  {/* Stage 3 - Complete */}
                  <li role="presentation" className="slds-is-complete slds-path__item">
                    <a className="slds-path__link" tabIndex={-1}>
                      <span className="slds-path__stage">
                        <svg className="slds-icon slds-icon_xx-small" focusable="false" aria-hidden="true" viewBox="0 0 520 520">
                          <g>
                            <path d="M191 425L26 259c-6-6-6-16 0-22l22-22c6-6 16-6 22 0l124 125a10 10 0 0015 0L452 95c6-6 16-6 22 0l22 22c6 6 6 16 0 22L213 425c-6 7-16 7-22 0z"></path>
                          </g>
                        </svg>
                      </span>
                      <span className="slds-path__title">Closed - Not Converted</span>
                    </a>
                  </li>
                  
                  {/* Current Stage - Converted */}
                  <li role="presentation" className="slds-is-current slds-is-active slds-path__item">
                    <a className="slds-path__link" tabIndex={0}>
                      <span className="slds-path__stage"></span>
                      <span className="slds-path__title">Closed - Converted</span>
                    </a>
                  </li>
                </>
              )}
            </ul>
            
            {/* Action Button */}
            <div className="slds-path__action">
              <button className="slds-button slds-button_brand">
                {lead.status === 'Working - Contacted' 
                  ? '✓ Mark Status as Complete'
                  : 'Change Converted Status'
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Content */}
        <div className="flex-1 p-6">
          {/* Tab Panel - White Background */}
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Tabs */}
            <div className="flex items-center space-x-8 border-b px-6 pt-4 pb-2">
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-2 text-sm font-medium border-b-2 ${
                  activeTab === 'activity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 text-sm font-medium border-b-2 ${
                  activeTab === 'details'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('chatter')}
                className={`pb-2 text-sm font-medium border-b-2 ${
                  activeTab === 'chatter'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Chatter
              </button>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'activity' && renderActivityTab()}
              {activeTab === 'details' && renderDetailsTab()}
              {activeTab === 'chatter' && renderChatterTab()}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 bg-white border-l">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Related</h2>
          
          <div className="space-y-4">
            {/* Duplicate Alert */}
            {lead.id === 'lead_002' ? (
              <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded">
                <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">!</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">We found 1 potential duplicate of this Lead.</div>
                  <button className="text-blue-600 text-sm hover:underline">View Duplicates</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded">
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={12} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">We found no potential duplicates of this Lead.</div>
                </div>
              </div>
            )}

            {/* Campaign History */}
            <div className="border rounded">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">C</span>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">Campaign History (0)</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <span>▼</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSave={onCreateTask}
        relatedLead={lead}
        availableLeads={recentLeads}
        users={users}
        accounts={accounts}
        opportunities={opportunities}
        cases={cases}
      />

      {/* New Call Modal */}
      <NewCallModal
        isOpen={showNewCallModal}
        onClose={() => setShowNewCallModal(false)}
        onSave={onCreateCall}
        relatedLead={lead}
        availableLeads={recentLeads}
        users={users}
        accounts={accounts}
        opportunities={opportunities}
        cases={cases}
      />

      {/* New Event Modal */}
      <NewEventModal
        isOpen={showNewEventModal}
        onClose={() => setShowNewEventModal(false)}
        onSave={onCreateEvent}
        relatedLead={lead}
        availableLeads={recentLeads}
        users={users}
        accounts={accounts}
        opportunities={opportunities}
        cases={cases}
      />

      {/* New Email Modal */}
      <NewEmailModal
        isOpen={showNewEmailModal}
        onClose={() => setShowNewEmailModal(false)}
        onSave={onCreateEmail}
        relatedLead={lead}
        availableLeads={recentLeads}
        users={users}
        accounts={accounts}
        opportunities={opportunities}
        cases={cases}
      />

      {/* Edit Modals */}
      {editingActivity?.type === 'task' && (
        <NewTaskModal
          isOpen={true}
          onClose={handleCloseEditModal}
          onSave={handleUpdateActivity}
          relatedLead={lead}
          availableLeads={recentLeads}
          users={users}
          accounts={accounts}
          opportunities={opportunities}
          cases={cases}
          existingTask={editingActivity.data}
        />
      )}

      {editingActivity?.type === 'call' && (
        <NewCallModal
          isOpen={true}
          onClose={handleCloseEditModal}
          onSave={handleUpdateActivity}
          relatedLead={lead}
          availableLeads={recentLeads}
          users={users}
          accounts={accounts}
          opportunities={opportunities}
          cases={cases}
          existingCall={editingActivity.data}
        />
      )}

      {editingActivity?.type === 'event' && (
        <NewEventModal
          isOpen={true}
          onClose={handleCloseEditModal}
          onSave={handleUpdateActivity}
          relatedLead={lead}
          availableLeads={recentLeads}
          users={users}
          accounts={accounts}
          opportunities={opportunities}
          cases={cases}
          existingEvent={editingActivity.data}
        />
      )}

      {editingActivity?.type === 'email' && (
        <NewEmailModal
          isOpen={true}
          onClose={handleCloseEditModal}
          onSave={handleUpdateActivity}
          relatedLead={lead}
          availableLeads={recentLeads}
          users={users}
          accounts={accounts}
          opportunities={opportunities}
          cases={cases}
          existingEmail={editingActivity.data}
        />
      )}
    </>
  );
};

export default LeadDetail;
