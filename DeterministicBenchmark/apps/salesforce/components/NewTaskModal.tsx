import React, { useState } from 'react';
import { X, Calendar, Search, User } from 'lucide-react';
import { Lead, Task, DROPDOWN_OPTIONS, User as UserType, Account, Opportunity, Case } from '../data';
import SearchableDropdown, { DropdownOption } from './SearchableDropdown';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  relatedLead: Lead;
  availableLeads: Lead[];
  users: UserType[];
  accounts: Account[];
  opportunities: Opportunity[];
  cases: Case[];
  existingTask?: Task;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  relatedLead,
  availableLeads,
  users,
  accounts,
  opportunities,
  cases,
  existingTask 
}) => {
  const [formData, setFormData] = useState({
    subject: existingTask?.subject || '',
    dueDate: existingTask?.dueDate ? existingTask.dueDate.toISOString().split('T')[0] : '',
    description: existingTask?.description || '',
    status: existingTask?.status || ('Not Started' as const),
    priority: existingTask?.priority || ('Normal' as const),
    nameId: existingTask?.nameId || relatedLead.id,
    name: existingTask?.name || `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
    relatedToId: existingTask?.relatedToId || relatedLead.id,
    relatedToName: existingTask?.relatedToName || `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
    assignedToId: existingTask?.assignedToId || 'user_001',
    assignedToName: existingTask?.assignedToName || 'UiPath Labs'
  });

  const [showLeadsList, setShowLeadsList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // SearchableDropdown selections
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<DropdownOption | null>(
    existingTask && existingTask.assignedToId 
      ? {
          id: existingTask.assignedToId,
          name: existingTask.assignedToName,
          type: 'user' as const
        }
      : users.find(u => u.id === 'user_001') 
        ? {
            id: 'user_001',
            name: 'Sarah Chen', // Default user
            type: 'user' as const
          }
        : null
  );

  const [selectedRelatedTo, setSelectedRelatedTo] = useState<DropdownOption | null>(() => {
    if (existingTask && existingTask.relatedToId) {
      const type: 'account' | 'lead' = existingTask.relatedToType === 'Account' ? 'account' : 'lead';
      return {
        id: existingTask.relatedToId,
        name: existingTask.relatedToName,
        type: type
      };
    }
    return null;
  });
  
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearName = () => {
    setFormData(prev => ({ ...prev, nameId: '', name: '', relatedToId: '', relatedToName: '' }));
    setShowLeadsList(true);
    setSearchQuery('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      alert('Subject is required');
      return;
    }

    const taskData = {
      subject: formData.subject,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      nameId: formData.nameId,
      name: formData.name,
      relatedToId: selectedRelatedTo?.id || formData.relatedToId,
      relatedToName: selectedRelatedTo?.name || formData.relatedToName,
      relatedToType: selectedRelatedTo?.type === 'account' ? 'Account' as const : (existingTask?.relatedToType || 'Lead') as 'Account' | 'Lead',
      assignedToId: selectedAssignedTo?.id || formData.assignedToId,
      assignedToName: selectedAssignedTo?.name || formData.assignedToName,
      createdBy: selectedAssignedTo?.name || formData.assignedToName
    };

    onSave(taskData);
    onClose();
    
    // Reset form
    setFormData({
      subject: '',
      dueDate: '',
      description: '',
      status: 'Not Started' as const,
      priority: 'Normal' as const,
      nameId: relatedLead.id,
      name: `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
      relatedToId: relatedLead.id,
      relatedToName: `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
      assignedToId: 'user_001',
      assignedToName: 'UiPath Labs'
    });
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-600" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900">{existingTask ? 'Edit Task' : 'New Task'}</h2>
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
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
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

              {/* Due Date */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                              <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                              </svg>
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
              <SearchableDropdown
                label="Related To"
                placeholder="Search Accounts..."
                value={selectedRelatedTo}
                options={accountOptions}
                onSelect={setSelectedRelatedTo}
                dropdownType="account"
                newOptionText="New Account"
              />

              {/* Assigned To */}
              <SearchableDropdown
                label="Assigned To"
                required
                placeholder="Search People..."
                value={selectedAssignedTo}
                options={userOptions}
                onSelect={setSelectedAssignedTo}
                dropdownType="user"
              />

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  * Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {DROPDOWN_OPTIONS.taskStatus.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
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

export default NewTaskModal;
