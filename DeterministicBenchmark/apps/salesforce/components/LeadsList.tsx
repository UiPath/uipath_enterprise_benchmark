import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Users } from 'lucide-react';
import { Lead } from '../data';
import Header from './Header';
import MainNavigation from './MainNavigation';
import EditableCell from './EditableCell';

interface LeadsListProps {
  leads: Lead[];
  onLeadSelect: (leadId: string) => void;
  onCreateNew: () => void;
  onOpenAppLauncher: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onEditingStateChange?: (editingState: { localChanges: Record<string, Partial<Lead>>, editingCells: Set<string>, editedCells: Set<string> }) => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ 
  leads, 
  onLeadSelect, 
  onCreateNew, 
  onOpenAppLauncher,
  onUpdateLead,
  onEditingStateChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set());
  const [editingCells, setEditingCells] = useState<Set<string>>(new Set());
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  // Local state to track pending changes (not yet committed to global state)
  const [localChanges, setLocalChanges] = useState<Record<string, Partial<Lead>>>({});
  // Bulk status change modal state
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('Open - Not Contacted');

  // Expose editing state to parent component for app_state visibility
  useEffect(() => {
    if (onEditingStateChange) {
      onEditingStateChange({
        localChanges,
        editingCells,
        editedCells
      });
    }
  }, [localChanges, editingCells, editedCells, onEditingStateChange]);

  const filteredAndSortedLeads = useMemo(() => {
    // Apply local changes to leads before filtering/sorting
    const leadsWithLocalChanges = leads.map(lead => {
      const localChange = localChanges[lead.id];
      return localChange ? { ...lead, ...localChange } : lead;
    });
    
    let filtered = leadsWithLocalChanges;
    
    // Filter by search term
    if (searchTerm) {
      filtered = leadsWithLocalChanges.filter(lead => 
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort if field is specified
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal, bVal;
        
        // Special handling for name field - sort by full name display
        if (sortField === 'lastName') {
          aVal = `${a.firstName || ''} ${a.lastName || ''}`.trim();
          bVal = `${b.firstName || ''} ${b.lastName || ''}`.trim();
        } else {
          aVal = (a as any)[sortField] || '';
          bVal = (b as any)[sortField] || '';
        }
        
        const comparison = aVal.toString().localeCompare(bVal.toString());
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    return filtered;
  }, [leads, localChanges, searchTerm, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCellSave = (leadId: string, field: string, value: string) => {
    // Store changes locally instead of immediately updating global state
    setLocalChanges(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        [field]: value
      }
    }));
    
    // Mark cell as edited
    const cellKey = `${leadId}-${field}`;
    setEditedCells(prev => new Set(prev).add(cellKey));
  };

  // Helper function to check if a cell has been edited
  const isCellEdited = (leadId: string, field: string): boolean => {
    const cellKey = `${leadId}-${field}`;
    return editedCells.has(cellKey);
  };

  // Functions to track editing state
  const handleEditingStart = useCallback((leadId: string, field: string) => {
    const cellKey = `${leadId}-${field}`;
    setEditingCells(prev => new Set(prev).add(cellKey));
  }, []);

  const handleEditingEnd = useCallback((leadId: string, field: string) => {
    const cellKey = `${leadId}-${field}`;
    setEditingCells(prev => {
      const newSet = new Set(prev);
      newSet.delete(cellKey);
      return newSet;
    });
  }, []);

  // Navigation confirmation handlers
  const handleNavigationAttempt = useCallback((navigationFn: () => void) => {
    // Show confirmation if there are cells being edited OR local changes that haven't been committed
    const hasLocalChanges = Object.keys(localChanges).length > 0;
    if (editingCells.size > 0 || hasLocalChanges) {
      setPendingNavigation(() => navigationFn);
      setShowUnsavedChangesDialog(true);
    } else {
      navigationFn();
    }
  }, [editingCells.size, localChanges]);

  const handleConfirmNavigation = useCallback(() => {
    // Discard changes - clear local state and navigate
    setLocalChanges({});
    setEditingCells(new Set());
    setEditedCells(new Set());
    
    if (pendingNavigation) {
      pendingNavigation();
    }
    setShowUnsavedChangesDialog(false);
    setPendingNavigation(null);
  }, [pendingNavigation]);

  const handleCancelNavigation = useCallback(() => {
    // Continue editing - just close dialog, keep local state
    setShowUnsavedChangesDialog(false);
    setPendingNavigation(null);
  }, []);

  const handleSaveAndNavigate = useCallback(() => {
    // Commit local changes to global state
    Object.entries(localChanges).forEach(([leadId, changes]) => {
      const originalLead = leads.find(l => l.id === leadId);
      if (originalLead) {
        const updatedLead = { ...originalLead, ...changes };
        onUpdateLead(updatedLead);
      }
    });
    
    // Clear local state and navigate
    setLocalChanges({});
    setEditedCells(new Set());
    setEditingCells(new Set());
    
    if (pendingNavigation) {
      pendingNavigation();
    }
    setShowUnsavedChangesDialog(false);
    setPendingNavigation(null);
  }, [pendingNavigation, localChanges, leads, onUpdateLead]);

  // Safe navigation wrapper for lead selection
  const handleLeadSelectWithConfirmation = useCallback((leadId: string) => {
    handleNavigationAttempt(() => onLeadSelect(leadId));
  }, [handleNavigationAttempt, onLeadSelect]);

  // Prevent browser's unsaved changes popup when there are no unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show warning if there are cells being edited OR local changes that haven't been committed
      const hasLocalChanges = Object.keys(localChanges).length > 0;
      if (editingCells.size > 0 || hasLocalChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editingCells.size, localChanges]);

  // Checkbox selection logic
  const allLeadsSelected = filteredAndSortedLeads.length > 0 && 
    filteredAndSortedLeads.every(lead => selectedLeads.has(lead.id));
  const someLeadsSelected = selectedLeads.size > 0 && !allLeadsSelected;

  const handleHeaderCheckboxChange = () => {
    if (allLeadsSelected) {
      // Deselect all
      setSelectedLeads(new Set());
    } else {
      // Select all visible leads
      setSelectedLeads(new Set(filteredAndSortedLeads.map(lead => lead.id)));
    }
  };

  const handleRowCheckboxChange = (leadId: string) => {
    const newSelectedLeads = new Set(selectedLeads);
    if (selectedLeads.has(leadId)) {
      newSelectedLeads.delete(leadId);
    } else {
      newSelectedLeads.add(leadId);
    }
    setSelectedLeads(newSelectedLeads);
  };

  // Bulk status change handlers
  const handleChangeStatusClick = () => {
    if (selectedLeads.size > 0) {
      setShowChangeStatusModal(true);
    }
  };

  const handleStatusChange = () => {
    // Update all selected leads with the new status
    const updatedLeads = Array.from(selectedLeads);
    
    updatedLeads.forEach(leadId => {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        const updatedLead = { ...lead, status: selectedStatus as any };
        onUpdateLead(updatedLead);
      }
    });

    // Clear selection and close modal
    setSelectedLeads(new Set());
    setShowChangeStatusModal(false);
  };

  const handleCancelStatusChange = () => {
    setShowChangeStatusModal(false);
  };

  // Salesforce sort arrow icons
  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null; // Only show icon on sorted column
    
    const isAscending = sortDirection === 'asc';
    
    return (
      <svg 
        focusable="false" 
        aria-hidden="true" 
        viewBox="0 0 520 520" 
        className="slds-icon slds-icon-text-default slds-is-sortable__icon slds-icon_x-small w-3 h-3 text-gray-600"
        style={{ transform: isAscending ? 'rotate(180deg)' : 'none' }}
      >
        <g>
          <path d="M96 310c-8 8-8 19 0 27l150 147c8 8 20 8 28 0l151-147c8-8 8-19 0-27l-28-27a20 20 0 00-28 0l-47 46c-8 8-22 3-22-9V50c0-10-9-20-20-20h-40c-11 0-20 11-20 20v270c0 12-14 17-22 9l-47-46a20 20 0 00-28 0z"></path>
        </g>
      </svg>
    );
  };

  // Custom checkbox component for header
  const HeaderCheckbox = () => {
    if (someLeadsSelected) {
      // Indeterminate state - show dash (smaller, centered)
      return (
        <div
          className="w-3.5 h-3.5 border border-gray-300 rounded bg-blue-600 flex items-center justify-center cursor-pointer mx-auto"
          onClick={(e) => {
            e.stopPropagation();
            handleHeaderCheckboxChange();
          }}
        >
          <div className="w-1.5 h-px bg-white"></div>
        </div>
      );
    } else {
      // Regular checkbox
      return (
        <input
          type="checkbox"
          className="rounded border-gray-300 w-3.5 h-3.5"
          checked={allLeadsSelected}
          onChange={(e) => {
            e.stopPropagation();
            handleHeaderCheckboxChange();
          }}
        />
      );
    }
  };

  return (
    <div className="min-h-screen">
      <Header onOpenAppLauncher={onOpenAppLauncher} />
      <MainNavigation 
        currentTab="leads" 
        recentLeads={leads}
        onNavigationAttempt={handleNavigationAttempt}
      />

      {/* Leads Content */}
      <div className="p-4">
        {/* Leads Header */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <Users size={16} className="text-teal-600" />
                </div>
                <div>
                  <h1 className="text-lg font-medium text-gray-900">Leads</h1>
                  <div className="text-sm text-gray-500">Recently Viewed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar - Two Rows */}
          <div className="border-b border-gray-200 bg-white">
            {/* Top Row - Action Buttons */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-end">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={onCreateNew}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                  >
                    New
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                    Intelligence View
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                    Import
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                    Add to Campaign
                  </button>
                  <button 
                    onClick={handleChangeStatusClick}
                    className={`px-3 py-1.5 text-sm font-medium rounded ${
                      selectedLeads.size > 0 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={selectedLeads.size === 0}
                  >
                    Change Status
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bottom Row - Selection Status & Search Box */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                {/* Selection Status */}
                <div className="text-sm text-gray-600">
                  {selectedLeads.size > 0 && (
                    <span>{selectedLeads.size} item{selectedLeads.size > 1 ? 's' : ''} selected</span>
                  )}
                </div>
                
                {/* Search Box */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search this list..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="w-12 px-2 py-2 text-center">
                    {/* Row number header - empty */}
                  </th>
                  <th className="w-8 px-2 py-2 text-center">
                    <HeaderCheckbox />
                  </th>
                  <th className="w-32 px-3 py-2 text-left">
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 py-1 rounded" onClick={() => handleSort('lastName')}>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Name</span>
                      <SortIcon field="lastName" />
                    </div>
                  </th>
                  <th className="w-32 px-3 py-2 text-left">
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 py-1 rounded" onClick={() => handleSort('title')}>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Title</span>
                      <SortIcon field="title" />
                    </div>
                  </th>
                  <th className="w-32 px-3 py-2 text-left">
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 py-1 rounded" onClick={() => handleSort('company')}>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Company</span>
                      <SortIcon field="company" />
                    </div>
                  </th>
                  <th className="w-28 px-3 py-2 text-left">
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 py-1 rounded" onClick={() => handleSort('phone')}>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Phone</span>
                      <SortIcon field="phone" />
                    </div>
                  </th>
                  <th className="w-28 px-3 py-2 text-left">
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 py-1 rounded" onClick={() => handleSort('mobile')}>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mobile</span>
                      <SortIcon field="mobile" />
                    </div>
                  </th>
                  <th className="w-40 px-3 py-2 text-left">
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 py-1 rounded" onClick={() => handleSort('email')}>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Email</span>
                      <SortIcon field="email" />
                    </div>
                  </th>
                  <th className="w-32 px-3 py-2 text-left">
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 py-1 rounded" onClick={() => handleSort('status')}>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Lead Status</span>
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="w-24 px-3 py-2 text-left">
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 py-1 rounded" onClick={() => handleSort('ownerName')}>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Owner Alias</span>
                      <SortIcon field="ownerName" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredAndSortedLeads.map((lead, index) => (
                  <tr 
                    key={lead.id} 
                    className={`border-b border-gray-100 ${
                      selectedLeads.has(lead.id) 
                        ? 'bg-blue-50 hover:bg-blue-100' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-2 py-3 text-xs text-gray-500 text-center">
                      {index + 1}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 w-3.5 h-3.5" 
                        checked={selectedLeads.has(lead.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowCheckboxChange(lead.id);
                        }} 
                      />
                    </td>
                    <td className="text-sm text-blue-600 font-medium group cursor-pointer hover:underline" onClick={() => handleLeadSelectWithConfirmation(lead.id)}>
                      <EditableCell
                        value={`${lead.firstName || ''} ${lead.lastName || ''}`.trim()}
                        field="name"
                        leadId={lead.id}
                        isEditable={false}
                        onSave={handleCellSave}
                        className="text-blue-600 font-medium"
                        isEdited={isCellEdited(lead.id, 'name')}
                        onEditingStart={handleEditingStart}
                        onEditingEnd={handleEditingEnd}
                      />
                    </td>
                    <td className="text-sm text-gray-900 group">
                      <EditableCell
                        value={lead.title || ''}
                        field="title"
                        leadId={lead.id}
                        isEditable={true}
                        onSave={handleCellSave}
                        inputType="text"
                        isEdited={isCellEdited(lead.id, 'title')}
                        onEditingStart={handleEditingStart}
                        onEditingEnd={handleEditingEnd}
                      />
                    </td>
                    <td className="text-sm text-gray-900 group">
                      <EditableCell
                        value={lead.company}
                        field="company"
                        leadId={lead.id}
                        isEditable={true}
                        onSave={handleCellSave}
                        inputType="text"
                        isEdited={isCellEdited(lead.id, 'company')}
                        onEditingStart={handleEditingStart}
                        onEditingEnd={handleEditingEnd}
                      />
                    </td>
                    <td className="text-sm text-gray-900 group">
                      <EditableCell
                        value={lead.phone || ''}
                        field="phone"
                        leadId={lead.id}
                        isEditable={true}
                        onSave={handleCellSave}
                        inputType="tel"
                        isEdited={isCellEdited(lead.id, 'phone')}
                        onEditingStart={handleEditingStart}
                        onEditingEnd={handleEditingEnd}
                      />
                    </td>
                    <td className="text-sm text-gray-900 group">
                      <EditableCell
                        value={lead.mobile || ''}
                        field="mobile"
                        leadId={lead.id}
                        isEditable={true}
                        onSave={handleCellSave}
                        inputType="tel"
                        isEdited={isCellEdited(lead.id, 'mobile')}
                        onEditingStart={handleEditingStart}
                        onEditingEnd={handleEditingEnd}
                      />
                    </td>
                    <td className="text-sm text-blue-600 group">
                      <EditableCell
                        value={lead.email || ''}
                        field="email"
                        leadId={lead.id}
                        isEditable={true}
                        onSave={handleCellSave}
                        inputType="email"
                        className="text-blue-600"
                        isEdited={isCellEdited(lead.id, 'email')}
                        onEditingStart={handleEditingStart}
                        onEditingEnd={handleEditingEnd}
                      />
                    </td>
                    <td className="text-sm text-gray-900 group">
                      <EditableCell
                        value={lead.status}
                        field="status"
                        leadId={lead.id}
                        isEditable={true}
                        onSave={handleCellSave}
                        options={['Open - Not Contacted', 'Working - Contacted', 'Closed - Converted', 'Closed - Not Converted']}
                        isEdited={isCellEdited(lead.id, 'status')}
                        onEditingStart={handleEditingStart}
                        onEditingEnd={handleEditingEnd}
                      />
                    </td>
                    <td className="text-sm text-gray-900 group">
                      <EditableCell
                        value={lead.ownerName}
                        field="ownerName"
                        leadId={lead.id}
                        isEditable={false}
                        onSave={handleCellSave}
                        isEdited={isCellEdited(lead.id, 'ownerName')}
                        onEditingStart={handleEditingStart}
                        onEditingEnd={handleEditingEnd}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
            {filteredAndSortedLeads.length} items • Updated a few seconds ago
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      {showUnsavedChangesDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Save changes in Recently Viewed?</h2>
              <p className="text-gray-600 mb-2">There are unsaved changes.</p>
              <p className="text-gray-600 mb-6">If you leave this tab, you'll lose your changes.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelNavigation}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                >
                  Continue Editing
                </button>
                <button
                  onClick={handleConfirmNavigation}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleSaveAndNavigate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showChangeStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Change Status</h2>
                <button
                  onClick={handleCancelStatusChange}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {/* Selection count */}
              <div className="mb-6 text-sm text-gray-600">
                {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
              </div>

              {/* Status options */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  <span className="text-red-500">*</span> Change Status
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    {['Open - Not Contacted', 'Working - Contacted', 'Closed - Converted', 'Closed - Not Converted'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelStatusChange}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;
