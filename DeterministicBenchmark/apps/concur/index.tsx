import React, { useState, useEffect } from 'react';
import { 
  getInitialFormData, 
  getInitialAppState,
  getInitialViewState,
  DEFAULT_FORM_VALUES,
  MOCK_AVAILABLE_EXPENSES,
  MOCK_FLIGHT_RESULTS,
  type FormData,
  type AppState,
  type ViewState,
  type Report,
  type Expense,
  type TripSearchCriteria,
  type Flight,
  type FareClass
} from './data';

// Import components
import Dashboard from './components/Dashboard';
import ManageExpenses from './components/ManageExpenses';
import ReportDetails from './components/ReportDetails';
import CreateReportModal from './components/CreateReportModal';
import AddExpenseModal from './components/AddExpenseModal';
import ExpenseSourceModal from './components/ExpenseSourceModal';
import SubmitModal from './components/SubmitModal';
import ReportSubmittedModal from './components/ReportSubmittedModal';
import AttachReceiptModal from './components/AttachReceiptModal';
import ErrorModal from './components/ErrorModal';
import FlightResults from './components/FlightResults';

const ConcurApp: React.FC = () => {
  // View state management
  const [viewState, setViewState] = useState<ViewState>(getInitialViewState());
  
  // Form data state
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  
  // App state
  const [appState, setAppState] = useState<AppState>(getInitialAppState());
  
  // Modal and UI state
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedExpenses, setSelectedExpenses] = useState<Set<number>>(new Set());
  const [selectedExpenseForDetails, setSelectedExpenseForDetails] = useState<Expense | null>(null);
  const [selectedExpenseForReceipt, setSelectedExpenseForReceipt] = useState<Expense | null>(null);
  
  // Available receipts for attaching to expenses (separate from available expenses)
  const [availableReceipts, setAvailableReceipts] = useState<Expense[]>([...MOCK_AVAILABLE_EXPENSES]);
  
  // Modal state tracking for live cheat feedback
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    selectedTab: string;
    selectedReceipt: number | null;
    selectedExpenseForReceipt: Expense | null;
  }>({
    isOpen: false,
    selectedTab: 'select',
    selectedReceipt: null,
    selectedExpenseForReceipt: null
  });

  // Update window state for testing (optimized to prevent unnecessary re-renders)
  useEffect(() => {
    window.app_state = {
      availableExpenses: JSON.parse(JSON.stringify(appState.availableExpenses)),
      reports: JSON.parse(JSON.stringify(appState.reports)),
      submittedReports: JSON.parse(JSON.stringify(appState.submittedReports)),
      currentReport: appState.currentReport ? JSON.parse(JSON.stringify(appState.currentReport)) : null,
      submission: appState.submission,
      modalState: JSON.parse(JSON.stringify(modalState))
    };
  }, [appState, modalState]);

  // Handle click outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewState.showCreateDropdown && !(event.target as Element)?.closest('.create-dropdown-container')) {
        setViewState(prev => ({ ...prev, showCreateDropdown: false }));
      }
      if (viewState.showOverflowMenu && !(event.target as Element)?.closest('.overflow-menu-container')) {
        setViewState(prev => ({ ...prev, showOverflowMenu: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [viewState.showCreateDropdown, viewState.showOverflowMenu]);

  // Deep link: open flight results directly only when query param is present
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const viewParam = url.searchParams.get('view');
      if (viewParam === 'flight_results') {
        // Populate mock results and navigate to results view
        setAppState(prev => ({
          ...prev,
          travelState: {
            ...prev.travelState,
            isSearching: false,
            searchResults: MOCK_FLIGHT_RESULTS,
            currentView: 'results'
          }
        }));
        setViewState(prev => ({ ...prev, currentView: 'travel-results' }));
      }
    } catch {
      // no-op if URL parsing fails
    }
  }, []);

  // Helper functions
  const createReport = (skipValidation = false) => {
    if (!skipValidation) {
      // Validate required fields
      const missingFields = [];
      const errors: Record<string, boolean> = {};
      
      if (!formData.reportName.trim()) {
        missingFields.push('Report Name');
        errors.reportName = true;
      }
      if (!formData.businessPurpose.trim()) {
        missingFields.push('Business Purpose');
        errors.businessPurpose = true;
      }
      if (!formData.policy.trim()) {
        missingFields.push('Policy');
        errors.policy = true;
      }
      if (!formData.travelRelated.trim()) {
        missingFields.push('Travel related');
        errors.travelRelated = true;
      }
      
      if (missingFields.length > 0) {
        setFieldErrors(errors);
        setErrorMessage(`Before you can save this report, you must provide valid information for: ${missingFields.join(', ')}`);
        setViewState(prev => ({ ...prev, showErrorModal: true }));
        return;
      }
      
      // Clear any previous errors
      setFieldErrors({});
    }
    
    const reportData = {
      name: formData.reportName,
      businessPurpose: formData.businessPurpose,
      policy: formData.policy,
      employeeId: formData.employeeId,
      countryCode: formData.countryCode,
      reportDate: formData.reportDate,
      logicalSystem: formData.logicalSystem,
      location: formData.location,
      company: formData.company,
      costCenter: formData.costCenter || DEFAULT_FORM_VALUES.costCenter,
      travelRelated: formData.travelRelated === 'Yes',
      comment: formData.comment,
      tripStartDate: formData.tripStartDate,
      tripEndDate: formData.tripEndDate,
      psaProject: formData.psaProject,
      psaAssignment: formData.psaAssignment,
      internalOrder: formData.internalOrder
    };
    
    if (viewState.isEditMode && appState.currentReport) {
      // Update existing report
      const updatedReport: Report = {
        ...appState.currentReport,
        ...reportData,
        // Keep original report number and ID when editing
        id: appState.currentReport.id,
        reportNumber: appState.currentReport.reportNumber,
        // Update modified timestamp
        modified: new Date().toISOString()
      };
      
      setAppState(prev => ({
        ...prev,
        reports: prev.reports.map(report => 
          report.id === appState.currentReport!.id ? updatedReport : report
        ),
        currentReport: updatedReport
      }));
    } else {
      // Create new report
      const newReport: Report = {
        ...reportData,
        id: `RPT-${Date.now()}`,
        reportNumber: `HSH${Math.random().toString().substring(2, 7)}`,
        expenses: [],
        status: 'Not Submitted',
        totalAmount: 0,
        created: new Date().toISOString()
      };
      
      setAppState(prev => ({
        ...prev,
        reports: [...prev.reports, newReport],
        currentReport: newReport
      }));
    }
    
    setViewState(prev => ({ 
      ...prev, 
      showCreateReportModal: false, 
      isEditMode: false,
      currentView: 'report-details'
    }));
  };

  const resetReportForm = () => {
    setFormData(getInitialFormData());
    setFieldErrors({});
  };

  // Function to edit/reopen an existing report
  const editReport = (report: Report) => {
    // Populate form with existing report data, fallback to defaults
    setFormData({
      reportName: report.name,
      businessPurpose: report.businessPurpose,
      reportDate: report.reportDate,
      logicalSystem: report.logicalSystem || DEFAULT_FORM_VALUES.logicalSystem,
      location: report.location || DEFAULT_FORM_VALUES.location,
      company: report.company || DEFAULT_FORM_VALUES.company,
      policy: report.policy,
      travelRelated: report.travelRelated ? 'Yes' : 'No',
      psaProject: report.psaProject || DEFAULT_FORM_VALUES.psaProject,
      reportNumber: report.reportNumber,
      employeeId: report.employeeId,
      countryCode: report.countryCode,
      comment: report.comment || DEFAULT_FORM_VALUES.comment,
      costCenter: report.costCenter || DEFAULT_FORM_VALUES.costCenter,
      tripStartDate: report.tripStartDate || DEFAULT_FORM_VALUES.tripStartDate,
      tripEndDate: report.tripEndDate || DEFAULT_FORM_VALUES.tripEndDate,
      psaAssignment: report.psaAssignment || DEFAULT_FORM_VALUES.psaAssignment,
      internalOrder: report.internalOrder || DEFAULT_FORM_VALUES.internalOrder
    });
    
    // Clear any previous errors, set edit mode, and open modal
    setFieldErrors({});
    setViewState(prev => ({ 
      ...prev, 
      isEditMode: true, 
      showCreateReportModal: true 
    }));
  };

  const addExpensesToReport = () => {
    if (!appState.currentReport) return;
    
    const expensesToAdd = appState.availableExpenses.filter(exp => selectedExpenses.has(exp.id));
    const updatedReport: Report = {
      ...appState.currentReport,
      expenses: [...appState.currentReport.expenses, ...expensesToAdd],
      totalAmount: appState.currentReport.totalAmount + expensesToAdd.reduce((sum, exp) => {
        const amount = parseFloat(exp.amount.replace(/[^\d.-]/g, ''));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0)
    };
    
    setAppState(prev => ({
      ...prev,
      currentReport: updatedReport,
      reports: prev.reports.map(r => r.id === updatedReport.id ? updatedReport : r)
    }));
    setSelectedExpenses(new Set());
    setViewState(prev => ({ ...prev, showAddExpenseModal: false }));
  };

  const submitReport = () => {
    if (!appState.currentReport) return;
    
    const submittedReport: Report = {
      ...appState.currentReport,
      status: 'Submitted',
      submittedDate: new Date().toISOString()
    };
    
    setAppState(prev => ({
      ...prev,
      submittedReports: [...prev.submittedReports, submittedReport],
      reports: prev.reports.filter(r => r.id !== appState.currentReport!.id),
      // Remove submitted expenses from available expenses
      availableExpenses: appState.currentReport && appState.currentReport.expenses.length > 0
        ? prev.availableExpenses.filter(expense => 
            !appState.currentReport!.expenses.some(exp => exp.id === expense.id)
          )
        : prev.availableExpenses
    }));
    
    setViewState(prev => ({ 
      ...prev, 
      showSubmitModal: false, 
      showReportSubmittedModal: true 
    }));
  };

  // Travel search handlers
  const handleTravelSearchCriteriaChange = (criteria: TripSearchCriteria) => {
    setAppState(prev => ({
      ...prev,
      travelState: {
        ...prev.travelState,
        searchCriteria: criteria
      }
    }));
  };

  const handleTravelSearch = () => {
    const { fromAirport, toAirport, timeFilters } = appState.travelState.searchCriteria;
    
    // Here we would normally call an API to search for flights
    // For now, we'll use mock data and filter based on the search criteria
    setAppState(prev => ({
      ...prev,
      travelState: {
        ...prev.travelState,
        isSearching: true
      }
    }));
    
    // Simulate API call
    setTimeout(() => {
      // Filter flights based on search criteria (from/to airports and time filters)
      let filteredFlights = MOCK_FLIGHT_RESULTS;
      
      if (fromAirport && toAirport) {
        filteredFlights = MOCK_FLIGHT_RESULTS.filter(flight => {
          // Airport filtering
          const airportMatch = flight.route.from.code === fromAirport.code && 
                               flight.route.to.code === toAirport.code;
          
          if (!airportMatch) return false;
          
          // Time filtering based on search criteria
          
          // Departure time filtering
          const departureHour = new Date(flight.departureTime).getHours();
          if (departureHour < timeFilters.departureStart || departureHour > timeFilters.departureEnd) {
            return false;
          }
          
          // Arrival time filtering  
          const arrivalHour = new Date(flight.arrivalTime).getHours();
          if (arrivalHour < timeFilters.arrivalStart || arrivalHour > timeFilters.arrivalEnd) {
            return false;
          }
          
          return true;
        });
      }
      
      
      setAppState(prev => ({
        ...prev,
        travelState: {
          ...prev.travelState,
          isSearching: false,
          searchResults: filteredFlights,
          currentView: 'results'
        }
      }));
      // Navigate to flight results view
      setViewState(prev => ({ ...prev, currentView: 'travel-results' }));

      // Update URL to be reloadable to results view (?view=flight_results)
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'flight_results');
        window.history.replaceState(null, '', url.toString());
      } catch {
        // ignore
      }
    }, 2000);
  };

  // Flight results handlers
  const handleBackToSearch = () => {
    setViewState(prev => ({ ...prev, currentView: 'dashboard' }));
    setAppState(prev => ({
      ...prev,
      travelState: {
        ...prev.travelState,
        currentView: 'search'
      }
    }));

    // Clean up URL param when leaving results
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      window.history.replaceState(null, '', url.toString());
    } catch {
      // ignore
    }
  };

  const handleEditSearch = () => {
    setViewState(prev => ({ ...prev, currentView: 'dashboard' }));
    setAppState(prev => ({
      ...prev,
      travelState: {
        ...prev.travelState,
        currentView: 'search'
      }
    }));

    // Clean up URL param when leaving results
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      window.history.replaceState(null, '', url.toString());
    } catch {
      // ignore
    }
  };

  const handleSelectFlight = (flight: Flight, fareClass: FareClass) => {
    // Here we would navigate to booking flow
    alert(`Selected ${flight.primaryAirline} flight for €${fareClass.basePrice} (${fareClass.name})`);
  };

  // Getter functions for form fields
  const getFormField = (field: keyof FormData) => formData[field];
  const setFormField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Main Render
  return (
    <>
      {viewState.currentView === 'dashboard' && (
        <Dashboard
          availableExpenses={appState.availableExpenses}
          showCreateDropdown={viewState.showCreateDropdown}
          setShowCreateDropdown={(show) => setViewState(prev => ({ ...prev, showCreateDropdown: show }))}
          showOverflowMenu={viewState.showOverflowMenu}
          setShowOverflowMenu={(show) => setViewState(prev => ({ ...prev, showOverflowMenu: show }))}
          setCurrentView={(view) => setViewState(prev => ({ ...prev, currentView: view }))}
          resetReportForm={resetReportForm}
          setFieldErrors={setFieldErrors}
          setIsEditMode={(editMode) => setViewState(prev => ({ ...prev, isEditMode: editMode }))}
          setShowCreateReportModal={(show) => setViewState(prev => ({ ...prev, showCreateReportModal: show }))}
          travelSearchCriteria={appState.travelState.searchCriteria}
          onTravelSearchCriteriaChange={handleTravelSearchCriteriaChange}
          onTravelSearch={handleTravelSearch}
          isTravelSearching={appState.travelState.isSearching}
        />
      )}
      
      {viewState.currentView === 'manage-expenses' && (
        <ManageExpenses
          availableExpenses={appState.availableExpenses}
          reports={appState.reports}
          submittedReports={appState.submittedReports}
          setCurrentView={(view) => setViewState(prev => ({ ...prev, currentView: view }))}
          setCurrentReport={(report) => setAppState(prev => ({ ...prev, currentReport: report }))}
          resetReportForm={resetReportForm}
          setFieldErrors={setFieldErrors}
          setIsEditMode={(editMode) => setViewState(prev => ({ ...prev, isEditMode: editMode }))}
          setShowCreateReportModal={(show) => setViewState(prev => ({ ...prev, showCreateReportModal: show }))}
          setSelectedExpenseForDetails={setSelectedExpenseForDetails}
          setShowExpenseSourceModal={(show) => setViewState(prev => ({ ...prev, showExpenseSourceModal: show }))}
        />
      )}
      
      {viewState.currentView === 'report-details' && (
        <ReportDetails
          currentReport={appState.currentReport}
          setCurrentView={(view) => setViewState(prev => ({ ...prev, currentView: view }))}
          editReport={editReport}
          setShowSubmitModal={(show) => setViewState(prev => ({ ...prev, showSubmitModal: show }))}
          setShowAddExpenseModal={(show) => setViewState(prev => ({ ...prev, showAddExpenseModal: show }))}
          setSelectedExpenseForReceipt={setSelectedExpenseForReceipt}
          setShowAttachReceiptModal={(show) => setViewState(prev => ({ ...prev, showAttachReceiptModal: show }))}
        />
      )}
      
      {viewState.currentView === 'travel-results' && (
        <FlightResults
          searchCriteria={appState.travelState.searchCriteria}
          searchResults={appState.travelState.searchResults}
          onBackToSearch={handleBackToSearch}
          onEditSearch={handleEditSearch}
          onSelectFlight={handleSelectFlight}
          onFilterChange={(updatedCriteria) => {
            setAppState(prev => ({
              ...prev,
              travelState: {
                ...prev.travelState,
                searchCriteria: {
                  ...prev.travelState.searchCriteria,
                  ...updatedCriteria,
                  timeFilters: {
                    ...prev.travelState.searchCriteria.timeFilters,
                    ...(updatedCriteria.timeFilters || {})
                  }
                }
              }
            }));
          }}
        />
      )}

      
      <CreateReportModal 
        showCreateReportModal={viewState.showCreateReportModal}
        setShowCreateReportModal={(show) => setViewState(prev => ({ ...prev, showCreateReportModal: show }))}
        isEditMode={viewState.isEditMode}
        setIsEditMode={(editMode) => setViewState(prev => ({ ...prev, isEditMode: editMode }))}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
        reportName={getFormField('reportName')}
        setReportName={(name) => setFormField('reportName', name)}
        businessPurpose={getFormField('businessPurpose')}
        setBusinessPurpose={(purpose) => setFormField('businessPurpose', purpose)}
        policy={getFormField('policy')}
        setPolicy={(policy) => setFormField('policy', policy)}
        travelRelated={getFormField('travelRelated')}
        setTravelRelated={(related) => setFormField('travelRelated', related)}
        reportDate={getFormField('reportDate')}
        setReportDate={(date) => setFormField('reportDate', date)}
        reportNumber={getFormField('reportNumber')}
        employeeId={getFormField('employeeId')}
        countryCode={getFormField('countryCode')}
        logicalSystem={getFormField('logicalSystem')}
        location={getFormField('location')}
        company={getFormField('company')}
        costCenter={getFormField('costCenter')}
        setCostCenter={(center) => setFormField('costCenter', center)}
        tripStartDate={getFormField('tripStartDate')}
        setTripStartDate={(date) => setFormField('tripStartDate', date)}
        tripEndDate={getFormField('tripEndDate')}
        setTripEndDate={(date) => setFormField('tripEndDate', date)}
        psaProject={getFormField('psaProject')}
        setPsaProject={(project) => setFormField('psaProject', project)}
        psaAssignment={getFormField('psaAssignment')}
        setPsaAssignment={(assignment) => setFormField('psaAssignment', assignment)}
        internalOrder={getFormField('internalOrder')}
        setInternalOrder={(order) => setFormField('internalOrder', order)}
        comment={getFormField('comment')}
        setComment={(comment) => setFormField('comment', comment)}
        createReport={createReport}
        setErrorMessage={setErrorMessage}
        setShowErrorModal={(show) => setViewState(prev => ({ ...prev, showErrorModal: show }))}
      />
      
      <AddExpenseModal 
        showAddExpenseModal={viewState.showAddExpenseModal}
        setShowAddExpenseModal={(show) => setViewState(prev => ({ ...prev, showAddExpenseModal: show }))}
        availableExpenses={appState.availableExpenses}
        selectedExpenses={selectedExpenses}
        setSelectedExpenses={setSelectedExpenses}
        addExpensesToReport={addExpensesToReport}
        setShowExpenseSourceModal={(show) => setViewState(prev => ({ ...prev, showExpenseSourceModal: show }))}
        setSelectedExpenseForDetails={setSelectedExpenseForDetails}
      />
      
      <ExpenseSourceModal 
        showExpenseSourceModal={viewState.showExpenseSourceModal}
        setShowExpenseSourceModal={(show) => setViewState(prev => ({ ...prev, showExpenseSourceModal: show }))}
        selectedExpenseForDetails={selectedExpenseForDetails}
      />
      
      {viewState.showSubmitModal && (
        <SubmitModal 
          showSubmitModal={viewState.showSubmitModal}
          setShowSubmitModal={(show) => setViewState(prev => ({ ...prev, showSubmitModal: show }))}
          currentReport={appState.currentReport}
          submitReport={submitReport}
        />
      )}
      
      {viewState.showReportSubmittedModal && (
        <ReportSubmittedModal 
          showReportSubmittedModal={viewState.showReportSubmittedModal}
          setShowReportSubmittedModal={(show) => setViewState(prev => ({ ...prev, showReportSubmittedModal: show }))}
          currentReport={appState.currentReport}
          setCurrentReport={(report) => setAppState(prev => ({ ...prev, currentReport: report }))}
          setCurrentView={(view) => setViewState(prev => ({ ...prev, currentView: view }))}
        />
      )}
      
      {viewState.showAttachReceiptModal && (
        <AttachReceiptModal 
          showAttachReceiptModal={viewState.showAttachReceiptModal}
          setShowAttachReceiptModal={(show) => setViewState(prev => ({ ...prev, showAttachReceiptModal: show }))}
          selectedExpenseForReceipt={selectedExpenseForReceipt}
          availableReceipts={availableReceipts}
          setAvailableReceipts={setAvailableReceipts}
          setAvailableExpenses={(updater) => setAppState(prev => ({ ...prev, availableExpenses: updater(prev.availableExpenses) }))}
          currentReport={appState.currentReport}
          setCurrentReport={(updater) => setAppState(prev => ({ ...prev, currentReport: updater(prev.currentReport) }))}
          onModalStateChange={setModalState}
        />
      )}
      
      {viewState.showErrorModal && (
        <ErrorModal 
          showErrorModal={viewState.showErrorModal}
          setShowErrorModal={(show) => setViewState(prev => ({ ...prev, showErrorModal: show }))}
          errorMessage={errorMessage}
        />
      )}
    </>
  );
};

export default ConcurApp;
