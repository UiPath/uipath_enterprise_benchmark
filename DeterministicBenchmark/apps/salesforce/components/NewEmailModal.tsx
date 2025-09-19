import React, { useState } from 'react';
import { X, Search, Mail, Bold, Italic, Underline, Link, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Lead, Email, User as UserType, Account, Opportunity, Case } from '../data';
import SearchableDropdown, { DropdownOption } from './SearchableDropdown';

interface NewEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (email: Omit<Email, 'id' | 'createdAt' | 'updatedAt'>) => void;
  relatedLead: Lead;
  availableLeads: Lead[];
  users: UserType[];
  accounts: Account[];
  opportunities: Opportunity[];
  cases: Case[];
  existingEmail?: Email;
}

const NewEmailModal: React.FC<NewEmailModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  relatedLead,
  availableLeads,
  users,
  accounts,
  opportunities,
  cases,
  existingEmail 
}) => {
  const [formData, setFormData] = useState({
    from: existingEmail?.from || 'UiPath Labs <uipathlabs@gmail.com>',
    to: existingEmail?.to?.[0] || (existingEmail?.nameId ? (() => {
      const targetLead = availableLeads.find(l => l.id === existingEmail.nameId);
      return targetLead?.email || targetLead?.firstName + ' ' + targetLead?.lastName || '';
    })() : relatedLead.email || `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim()),
    bcc: existingEmail?.bcc?.[0] || 'uipathlabs@gmail.com',
    subject: existingEmail?.subject || '',
    body: existingEmail?.body || '\n\nPowered by Salesforce\nhttp://www.salesforce.com/'
  });

  // SearchableDropdown selections
  const [selectedName, setSelectedName] = useState<DropdownOption | null>(
    existingEmail && existingEmail.nameId 
      ? {
          id: existingEmail.nameId,
          name: existingEmail.name,
          type: 'lead' as const
        }
      : {
          id: relatedLead.id,
          name: `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
          type: 'lead' as const
        }
  );

  const [selectedAssignedTo, setSelectedAssignedTo] = useState<DropdownOption | null>(
    existingEmail && existingEmail.assignedToId 
      ? {
          id: existingEmail.assignedToId,
          name: existingEmail.assignedToName,
          type: 'user' as const
        }
      : users.find(u => u.id === 'user_002') 
        ? {
            id: 'user_002',
            name: 'Marcus Rodriguez', // Default for emails
            type: 'user' as const
          }
        : null
  );

  const [selectedRelatedTo, setSelectedRelatedTo] = useState<DropdownOption | null>(
    existingEmail && existingEmail.relatedToId && existingEmail.relatedToType === 'Account'
      ? {
          id: existingEmail.relatedToId,
          name: existingEmail.relatedToName,
          type: 'account' as const
        }
      : null
  );
  
  // Convert data to DropdownOption format
  const leadOptions: DropdownOption[] = availableLeads.map(lead => ({
    id: lead.id,
    name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
    subtitle: lead.company,
    type: 'lead'
  }));

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
    
    // If changing the To field, try to match it with a lead and update the Name field
    if (field === 'to') {
      // First try to match by email address
      let matchingLead = availableLeads.find(lead => lead.email === value);
      
      // If no email match, try to match by name
      if (!matchingLead) {
        matchingLead = availableLeads.find(lead => {
          const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
          return fullName === value;
        });
      }
      
      if (matchingLead) {
        const leadOption = {
          id: matchingLead.id,
          name: `${matchingLead.firstName || ''} ${matchingLead.lastName || ''}`.trim(),
          type: 'lead' as const
        };
        setSelectedName(leadOption);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      alert('Subject is required');
      return;
    }

    if (!formData.to.trim()) {
      alert('To field is required');
      return;
    }

    const emailData = {
      to: [formData.to],
      from: formData.from,
      cc: [],
      subject: formData.subject,
      body: formData.body,
      bcc: formData.bcc ? [formData.bcc] : [],
      nameId: selectedName?.id || relatedLead.id,
      name: selectedName?.name || `${relatedLead.firstName} ${relatedLead.lastName}`,
      relatedToId: selectedRelatedTo?.id || '',
      relatedToName: selectedRelatedTo?.name || '',
      relatedToType: 'Account' as const,
      assignedToId: selectedAssignedTo?.id || 'user_002',
      assignedToName: selectedAssignedTo?.name || 'Marcus Rodriguez',
      createdBy: selectedAssignedTo?.name || 'Marcus Rodriguez'
    };

    onSave(emailData);
    onClose();
    
    // Reset form
    setFormData({
      from: 'UiPath Labs <uipathlabs@gmail.com>',
      to: relatedLead.email || `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
      bcc: 'uipathlabs@gmail.com',
      subject: '',
      body: '\n\nPowered by Salesforce\nhttp://www.salesforce.com/'
    });
    setSelectedName({
      id: relatedLead.id,
      name: `${relatedLead.firstName || ''} ${relatedLead.lastName || ''}`.trim(),
      type: 'lead' as const
    });
  };

  const removeBccPerson = () => {
    setFormData(prev => ({ ...prev, bcc: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                <Mail size={14} className="text-gray-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">{existingEmail ? 'Edit Email' : 'Email'}</h2>
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

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto">
              {/* Email Header Fields */}
              <div className="px-6 py-4 space-y-4 border-b border-gray-200">
                {/* From */}
                <div className="flex items-center">
                  <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">
                    * From
                  </label>
                  <div className="flex-1 ml-4">
                    <select 
                      value={formData.from}
                      onChange={(e) => handleInputChange('from', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="UiPath Labs <uipathlabs@gmail.com>">UiPath Labs &lt;uipathlabs@gmail.com&gt;</option>
                    </select>
                    <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </div>
                </div>

                {/* To */}
                <div className="flex items-center">
                  <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">
                    To
                  </label>
                  <div className="flex-1 ml-4">
                    <input
                      type="text"
                      value={formData.to}
                      onChange={(e) => handleInputChange('to', e.target.value)}
                      placeholder="Enter email address or name (will auto-update Name field)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="text-right mt-1">
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Cc
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bcc */}
                <div className="flex items-center">
                  <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">
                    Bcc
                  </label>
                  <div className="flex-1 ml-4">
                    {formData.bcc ? (
                      <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-sm bg-blue-50">
                        <span className="text-sm text-gray-900 flex-1">{formData.bcc}</span>
                        <button
                          type="button"
                          onClick={removeBccPerson}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Remove bcc recipient"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="email"
                        value={formData.bcc}
                        onChange={(e) => handleInputChange('bcc', e.target.value)}
                        placeholder="Enter email address..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="flex items-center">
                  <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">
                    Subject
                  </label>
                  <div className="flex-1 ml-4">
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Enter Subject..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="flex items-start">
                  <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0 pt-2">
                    Name
                  </label>
                  <div className="flex-1 ml-4">
                    <SearchableDropdown
                      label=""
                      placeholder="Search Leads..."
                      value={selectedName}
                      options={leadOptions}
                      onSelect={(option) => {
                        setSelectedName(option);
                        // Sync the To field with the selected lead's email if available
                        if (option) {
                          const lead = availableLeads.find(l => l.id === option.id);
                          if (lead && lead.email) {
                            setFormData(prev => ({ ...prev, to: lead.email }));
                          } else {
                            setFormData(prev => ({ ...prev, to: option.name }));
                          }
                        }
                      }}
                      dropdownType="lead"
                    />
                  </div>
                </div>

                {/* Assigned To */}
                <div className="flex items-start">
                  <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0 pt-2">
                    Assigned To
                  </label>
                  <div className="flex-1 ml-4">
                    <SearchableDropdown
                      label=""
                      required
                      placeholder="Search People..."
                      value={selectedAssignedTo}
                      options={userOptions}
                      onSelect={setSelectedAssignedTo}
                      dropdownType="user"
                    />
                  </div>
                </div>

                {/* Related To */}
                <div className="flex items-start">
                  <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0 pt-2">
                    Related To
                  </label>
                  <div className="flex-1 ml-4">
                    <SearchableDropdown
                      label=""
                      placeholder="Search Accounts..."
                      value={selectedRelatedTo}
                      options={accountOptions}
                      onSelect={setSelectedRelatedTo}
                      dropdownType="account"
                      newOptionText="New Account"
                    />
                  </div>
                </div>
              </div>

              {/* Rich Text Toolbar */}
              <div className="px-6 py-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-1">
                  <select className="px-2 py-1 text-sm border border-gray-300 rounded">
                    <option>Plex</option>
                  </select>
                  <select className="px-2 py-1 text-sm border border-gray-300 rounded">
                    <option>Plex</option>
                  </select>
                  
                  <div className="border-l border-gray-300 h-6 mx-2"></div>
                  
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Bold">
                    <Bold size={16} />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Italic">
                    <Italic size={16} />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Underline">
                    <Underline size={16} />
                  </button>
                  
                  <div className="border-l border-gray-300 h-6 mx-2"></div>
                  
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Text Color">
                    <div className="w-4 h-4 border-b-2 border-red-500">A</div>
                  </button>
                  
                  <div className="border-l border-gray-300 h-6 mx-2"></div>
                  
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Numbered List">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
                    </svg>
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Bulleted List">
                    <List size={16} />
                  </button>
                  
                  <div className="border-l border-gray-300 h-6 mx-2"></div>
                  
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Align Left">
                    <AlignLeft size={16} />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Align Center">
                    <AlignCenter size={16} />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Align Right">
                    <AlignRight size={16} />
                  </button>
                  
                  <div className="border-l border-gray-300 h-6 mx-2"></div>
                  
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Insert Link">
                    <Link size={16} />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Insert Image">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 11c.83 0 1.5-.67 1.5-1.5S9.83 8 9 8s-1.5.67-1.5 1.5S8.17 11 9 11zm8 6H7l2.5-3.21L11 15.29 13.5 12 17 17z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Email Body */}
              <div className="px-6 py-4 flex-1">
                <textarea
                  value={formData.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  className="w-full h-80 px-3 py-2 border-0 resize-none focus:outline-none text-sm leading-relaxed"
                  placeholder="Compose your email..."
                />
              </div>

              {/* Related To */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center">
                  <label className="w-20 text-sm font-medium text-gray-700 flex-shrink-0">
                    Related To
                  </label>
                  <div className="flex-1 ml-4 flex">
                    <div className="flex items-center px-3 py-2 bg-blue-500 border border-gray-300 rounded-l-sm">
                      <span className="text-white text-xs font-bold">L</span>
                      <svg className="w-3 h-3 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
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
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                type="submit"
                className="px-6 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewEmailModal;
