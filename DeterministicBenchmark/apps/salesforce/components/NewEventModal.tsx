import React, { useState } from 'react';
import { X, Search, User, Calendar, Plus } from 'lucide-react';
import { Lead, Event, User as UserType, Account, Opportunity, Case } from '../data';
import SearchableDropdown, { DropdownOption } from './SearchableDropdown';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  relatedLead: Lead;
  availableLeads: Lead[];
  users: UserType[];
  accounts: Account[];
  opportunities: Opportunity[];
  cases: Case[];
  existingEvent?: Event;
}

const NewEventModal: React.FC<NewEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  relatedLead,
  availableLeads,
  users,
  accounts,
  opportunities,
  cases,
  existingEvent 
}) => {
  const [formData, setFormData] = useState({
    subject: existingEvent?.subject || '',
    startDate: existingEvent?.startDate ? existingEvent.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: existingEvent?.endDate ? existingEvent.endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: existingEvent?.startTime || '10:00',
    endTime: existingEvent?.endTime || '11:00',
    allDayEvent: existingEvent?.allDayEvent || false,
    location: existingEvent?.location || '',
    nameId: existingEvent?.nameId || relatedLead.id,
    name: existingEvent?.name || `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
    relatedToId: existingEvent?.relatedToId || relatedLead.id,
    relatedToName: existingEvent?.relatedToName || `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
    assignedToId: existingEvent?.assignedToId || 'user_001',
    assignedToName: existingEvent?.assignedToName || 'UiPath Labs'
  });
  
  const [showLeadsList, setShowLeadsList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // SearchableDropdown selections
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<DropdownOption | null>(
    existingEvent && existingEvent.assignedToId 
      ? {
          id: existingEvent.assignedToId,
          name: existingEvent.assignedToName,
          type: 'user' as const
        }
      : users.find(u => u.id === 'user_003') 
        ? {
            id: 'user_003',
            name: 'Jessica Thompson', // Default for events
            type: 'user' as const
          }
        : null
  );

  const [selectedRelatedTo, setSelectedRelatedTo] = useState<DropdownOption | null>(
    existingEvent && existingEvent.relatedToId && existingEvent.relatedToType === 'Account'
      ? {
          id: existingEvent.relatedToId,
          name: existingEvent.relatedToName,
          type: 'account' as const
        }
      : null
  );
  
  // Convert data to DropdownOption format
  const userOptions: DropdownOption[] = users.map(user => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    subtitle: user.title,
    type: 'user'
  }));
  
  const accountOptions: DropdownOption[] = accounts.map(account => ({
    id: account.id,
    name: account.name,
    subtitle: account.industry,
    type: 'account'
  }));

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      alert('Subject is required');
      return;
    }

    const eventData = {
      subject: formData.subject,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      startTime: formData.startTime,
      endTime: formData.endTime,
      allDayEvent: formData.allDayEvent,
      location: formData.location,
      nameId: formData.nameId,
      name: formData.name,
      relatedToId: selectedRelatedTo?.id || '',
      relatedToName: selectedRelatedTo?.name || '',
      relatedToType: 'Account' as const,
      assignedToId: selectedAssignedTo?.id || 'user_003',
      assignedToName: selectedAssignedTo?.name || 'Jessica Thompson',
      createdBy: selectedAssignedTo?.name || 'Jessica Thompson'
    };

    onSave(eventData);
    onClose();
    
    // Reset form
    setFormData({
      subject: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      allDayEvent: false,
      location: '',
      nameId: relatedLead.id,
      name: `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
      relatedToId: relatedLead.id,
      relatedToName: `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
      assignedToId: 'user_001',
      assignedToName: 'UiPath Labs'
    });
  };

  const clearName = () => {
    setFormData(prev => ({ ...prev, nameId: '', name: '' }));
    setShowLeadsList(true);
    setSearchQuery('');
  };

  const clearAssignedTo = () => {
    setFormData(prev => ({ ...prev, assignedToId: '', assignedToName: '' }));
  };

  const selectLead = (lead: Lead) => {
    const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
    setFormData(prev => ({ 
      ...prev, 
      nameId: lead.id, 
      name: fullName,
      relatedToId: lead.id,
      relatedToName: fullName
    }));
    setShowLeadsList(false);
    setSearchQuery('');
  };

  const filteredLeads = availableLeads.filter(lead => {
    const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim().toLowerCase();
    const company = lead.company?.toLowerCase() || '';
    const title = lead.title?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || company.includes(query) || title.includes(query);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                <Calendar size={14} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">{existingEvent ? 'Edit Event' : 'New Event'}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Minimize"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
              {/* Subject */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Start Date & Time */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Start</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      * Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      * Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        disabled={formData.allDayEvent}
                        className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">End</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      * Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      * Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        disabled={formData.allDayEvent}
                        className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* All-Day Event */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allDayEvent"
                  checked={formData.allDayEvent}
                  onChange={(e) => handleInputChange('allDayEvent', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="allDayEvent" className="text-sm font-medium text-gray-700">
                  All-Day Event
                </label>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="relative">
                  {formData.name && !showLeadsList ? (
                    <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-sm bg-blue-50">
                      <div className="w-5 h-5 bg-teal-100 rounded flex items-center justify-center">
                        <User size={12} className="text-teal-600" />
                      </div>
                      <span className="text-sm text-gray-900 flex-1">{formData.name}</span>
                      <button
                        type="button"
                        onClick={clearName}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Remove name"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="flex">
                        <div className="flex items-center px-3 py-2 bg-teal-500 border border-gray-300 rounded-l-sm">
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg className="w-3 h-3 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowLeadsList(true);
                          }}
                          onFocus={() => setShowLeadsList(true)}
                          placeholder="Search Leads..."
                          className="flex-1 px-3 py-2 border border-l-0 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex items-center px-3 py-2 bg-gray-50 border border-l-0 border-gray-300">
                          <span className="text-sm text-gray-600 mr-2">Search Accounts</span>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-sm hover:bg-gray-100"
                          aria-label="Search"
                        >
                          <Search size={14} className="text-gray-400" />
                        </button>
                      </div>
                      
                      {/* Dropdown */}
                      {showLeadsList && (
                        <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-sm shadow-lg max-h-64 overflow-y-auto">
                          {filteredLeads.map((lead) => (
                            <div
                              key={lead.id}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              onClick={() => selectLead(lead)}
                            >
                              <div className="w-6 h-6 bg-teal-100 rounded flex items-center justify-center mr-3">
                                <svg className="w-3 h-3 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  {`${lead.firstName || ''} ${lead.lastName || ''}`.trim()}
                                </div>
                                {lead.title && (
                                  <div className="text-sm text-gray-500">{lead.title}</div>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {/* New Lead Option */}
                          <div className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-t border-gray-200">
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-3">
                              <Plus size={14} className="text-gray-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">New Lead</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Related To */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Related To
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-sm">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">L</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value="Search Accounts..."
                    className="flex-1 px-3 py-2 border border-l-0 border-gray-300 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-sm hover:bg-gray-100"
                    aria-label="Search"
                  >
                    <Search size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Assigned To */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  * Assigned To
                </label>
                <div className="relative">
                  {formData.assignedToName ? (
                    <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-sm bg-blue-50">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <User size={12} className="text-white" />
                      </div>
                      <span className="text-sm text-gray-900 flex-1">{formData.assignedToName}</span>
                      <button
                        type="button"
                        onClick={clearAssignedTo}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Remove assigned to"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex">
                      <select className="flex-1 px-3 py-2 border border-gray-300 rounded-l-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select user...</option>
                      </select>
                      <button
                        type="button"
                        className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-sm hover:bg-gray-100"
                        aria-label="Search"
                      >
                        <Search size={14} className="text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewEventModal;