// Salesforce Leads Clone - Main App Component
// ============================================================================

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { 
  getInitialAppData, 
  type AppData, 
  type ViewState,
  type Lead,
  type Task,
  type Call,
  type Event,
  type Email
} from './data';

// Import Components
import Homepage from './components/Homepage';
import AppLauncher from './components/AppLauncher';
import LeadsList from './components/LeadsList';
import LeadDetail from './components/LeadDetail';
import NewLeadModal from './components/NewLeadModal';

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const SalesforceApp: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Global state - data only, never affects form rendering
  const [appData, setAppData] = useState<AppData>(getInitialAppData());
  
  // Editing state from components (for live state visibility)
  const [leadsEditingState, setLeadsEditingState] = useState<{
    localChanges: Record<string, Partial<Lead>>;
    editingCells: Set<string>;
    editedCells: Set<string>;
  }>({
    localChanges: {},
    editingCells: new Set(),
    editedCells: new Set()
  });
  
  // View state - controls what's displayed
  const [viewState, setViewState] = useState<ViewState>({
    currentTab: 'home',
    currentView: 'dashboard',
    selectedLeadId: null,
    showAppLauncher: false,
    showNewLeadForm: false,
    showNewTaskModal: false,
    showNewCallModal: false,
    showNewEventModal: false,
    showNewEmailModal: false
  });

  // Sync URL with view state using search parameters
  useEffect(() => {
    const view = searchParams.get('view');
    if (!view || view === '' || view === 'dashboard') {
      setViewState(prev => ({
        ...prev,
        currentTab: 'home',
        currentView: 'dashboard'
      }));
    } else if (view === 'leads') {
      setViewState(prev => ({
        ...prev,
        currentTab: 'leads',
        currentView: 'leads-list'
      }));
    } else if (view.startsWith('leads/')) {
      const leadId = view.split('/')[1];
      setViewState(prev => ({
        ...prev,
        currentTab: 'leads',
        currentView: 'lead-detail',
        selectedLeadId: leadId
      }));
    }
  }, [searchParams]);

  // Memoize stable editing state to prevent unnecessary re-renders
  const stableEditingState = useMemo(() => ({
    localChanges: leadsEditingState.localChanges,
    editingCells: Array.from(leadsEditingState.editingCells),
    editedCells: Array.from(leadsEditingState.editedCells)
  }), [
    JSON.stringify(leadsEditingState.localChanges),
    leadsEditingState.editingCells.size,
    leadsEditingState.editedCells.size
  ]);

  // Expose state for computer use testing
  useEffect(() => {
    const view = searchParams.get('view') || 'dashboard';
    
    // Apply local changes to leads for live state visibility
    const leadsWithLocalChanges = appData.leads.map(lead => {
      const localChange = leadsEditingState.localChanges[lead.id];
      return localChange ? { ...lead, ...localChange } : lead;
    });
    
    const newAppState = {
      leads: JSON.parse(JSON.stringify(leadsWithLocalChanges)), // Leads with live editing applied
      savedLeads: JSON.parse(JSON.stringify(appData.leads)), // Original saved leads
      tasks: JSON.parse(JSON.stringify(appData.tasks)),
      calls: JSON.parse(JSON.stringify(appData.calls)), // Expose calls for task validation
      events: JSON.parse(JSON.stringify(appData.events)), // Expose events for task validation
      emails: JSON.parse(JSON.stringify(appData.emails)), // Expose emails for task validation
      currentView: viewState.currentView,
      selectedLeadId: viewState.selectedLeadId,
      currentURL: location.pathname,
      currentSearchParams: view,
      // Expose editing state for debugging
      editing: stableEditingState
    };
    
    // Only update app_state if it actually changed
    const currentAppState = (window as any).app_state;
    const newStateString = JSON.stringify(newAppState);
    const currentStateString = currentAppState ? JSON.stringify(currentAppState) : '';
    
    if (newStateString !== currentStateString) {
      (window as any).app_state = newAppState;
    }
  }, [appData, viewState, location.pathname, searchParams, stableEditingState, leadsEditingState.localChanges]);

  // Navigation handlers
  const handleNavigateToLeads = useCallback(() => {
    setSearchParams({ view: 'leads' });
  }, [setSearchParams]);

  const handleLeadSelect = useCallback((leadId: string) => {
    setSearchParams({ view: `leads/${leadId}` });
  }, [setSearchParams]);

  const handleCreateNewLead = useCallback(() => {
    setViewState(prev => ({ 
      ...prev, 
      showNewLeadForm: true 
    }));
  }, []);

  const handleOpenAppLauncher = useCallback(() => {
    setViewState(prev => ({ ...prev, showAppLauncher: true }));
  }, []);

  const handleCloseAppLauncher = useCallback(() => {
    setViewState(prev => ({ ...prev, showAppLauncher: false }));
  }, []);

  const handleUpdateLead = useCallback((updatedLead: Lead) => {
    setAppData(prev => ({
      ...prev,
      leads: prev.leads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      )
    }));
  }, []);

  const handleCreateTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAppData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
      metadata: { lastUpdated: Date.now() }
    }));
  }, []);

  const handleCreateCall = useCallback((callData: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCall: Call = {
      ...callData,
      id: `call_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAppData(prev => ({
      ...prev,
      calls: [...prev.calls, newCall],
      metadata: { lastUpdated: Date.now() }
    }));
  }, []);

  const handleCreateEvent = useCallback((eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: Event = {
      ...eventData,
      id: `event_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAppData(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
      metadata: { lastUpdated: Date.now() }
    }));
  }, []);

  const handleCreateEmail = useCallback((emailData: Omit<Email, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEmail: Email = {
      ...emailData,
      id: `email_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAppData(prev => ({
      ...prev,
      emails: [...prev.emails, newEmail],
      metadata: { lastUpdated: Date.now() }
    }));
  }, []);

  // Update handlers for editing existing activities
  const handleUpdateTask = useCallback((id: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setAppData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === id 
          ? { ...task, ...taskData, updatedAt: new Date() }
          : task
      ),
      metadata: { lastUpdated: Date.now() }
    }));
  }, []);

  const handleUpdateCall = useCallback((id: string, callData: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>) => {
    setAppData(prev => ({
      ...prev,
      calls: prev.calls.map(call => 
        call.id === id 
          ? { ...call, ...callData, updatedAt: new Date() }
          : call
      ),
      metadata: { lastUpdated: Date.now() }
    }));
  }, []);

  const handleUpdateEvent = useCallback((id: string, eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    setAppData(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event.id === id 
          ? { ...event, ...eventData, updatedAt: new Date() }
          : event
      ),
      metadata: { lastUpdated: Date.now() }
    }));
  }, []);

  const handleUpdateEmail = useCallback((id: string, emailData: Omit<Email, 'id' | 'createdAt' | 'updatedAt'>) => {
    setAppData(prev => ({
      ...prev,
      emails: prev.emails.map(email => 
        email.id === id 
          ? { ...email, ...emailData, updatedAt: new Date() }
          : email
      ),
      metadata: { lastUpdated: Date.now() }
    }));
  }, []);

  const handleCreateLead = useCallback((leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAppData(prev => ({
      ...prev,
      leads: [...prev.leads, newLead],
      metadata: { lastUpdated: Date.now() }
    }));
  }, []);

  const handleCloseNewLeadForm = useCallback(() => {
    setViewState(prev => ({ 
      ...prev, 
      showNewLeadForm: false 
    }));
  }, []);

  const handleLeadsEditingStateChange = useCallback((editingState: {
    localChanges: Record<string, Partial<Lead>>;
    editingCells: Set<string>;
    editedCells: Set<string>;
  }) => {
    setLeadsEditingState(editingState);
  }, []);



  // Render current view based on viewState
  const renderCurrentView = () => {
    switch (viewState.currentView) {
      case 'dashboard':
        return (
          <Homepage 
            onOpenAppLauncher={handleOpenAppLauncher}
            recentLeads={appData.leads}
          />
        );
      case 'leads-list':
        return (
          <LeadsList 
            leads={appData.leads}
            onLeadSelect={handleLeadSelect}
            onCreateNew={handleCreateNewLead}
            onOpenAppLauncher={handleOpenAppLauncher}
            onUpdateLead={handleUpdateLead}
            onEditingStateChange={handleLeadsEditingStateChange}
          />
        );
      case 'lead-detail':
        const lead = appData.leads.find(l => l.id === viewState.selectedLeadId);
        return lead ? (
          <LeadDetail 
            lead={lead}
            tasks={appData.tasks}
            calls={appData.calls}
            events={appData.events}
            emails={appData.emails}
            onBack={handleNavigateToLeads}
            onOpenAppLauncher={handleOpenAppLauncher}
            onUpdateLead={handleUpdateLead}
            onCreateTask={handleCreateTask}
            onCreateCall={handleCreateCall}
            onCreateEvent={handleCreateEvent}
            onCreateEmail={handleCreateEmail}
            onUpdateTask={handleUpdateTask}
            onUpdateCall={handleUpdateCall}
            onUpdateEvent={handleUpdateEvent}
            onUpdateEmail={handleUpdateEmail}
            recentLeads={appData.leads}
            users={appData.users}
            accounts={appData.accounts}
            opportunities={appData.opportunities}
            cases={appData.cases}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Not Found</h2>
              <button 
                onClick={handleNavigateToLeads}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Leads
              </button>
            </div>
          </div>
        );
      default:
        return (
          <Homepage 
            onOpenAppLauncher={handleOpenAppLauncher}
            recentLeads={appData.leads}
          />
        );
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#b0c4df'}}>
      {renderCurrentView()}
      
      <AppLauncher 
        isOpen={viewState.showAppLauncher}
        onClose={handleCloseAppLauncher}
        onNavigateToLeads={handleNavigateToLeads}
      />

      <NewLeadModal
        isOpen={viewState.showNewLeadForm}
        onClose={handleCloseNewLeadForm}
        onSave={handleCreateLead}
        users={appData.users}
      />
    </div>
  );
};

export default SalesforceApp;
