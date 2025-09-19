// SAP Stock Overview - Main App Component
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';

// Import Components
import MenuScreen from './components/MenuScreen';
import StockSelectionScreen from './components/StockSelectionScreen';
import ResultsScreen from './components/ResultsScreen';
import IconToolbar from './components/IconToolbar';
import Modal from './components/Modal';

// Import Data and Types
import { 
  SAMPLE_MATERIALS, 
  SAMPLE_STOCK_DATA,
  getInitialFormData,
  getInitialDisplayLevels,
  getMaterialById,
  getStockDataByMaterial,
  FormData,
  DisplayLevels
} from './data';

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const SapStockOverview: React.FC = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'stock' | 'results' | 'submit'>('menu');
  const [viewHistory, setViewHistory] = useState<string[]>(['menu']);
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [displayLevels, setDisplayLevels] = useState<DisplayLevels>(getInitialDisplayLevels());
  const [submitResults, setSubmitResults] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const showModalAlert = (title: string, message: string) => {
    setModalContent({ title, message });
    setShowModal(true);
  };

  // Initialize view from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewFromUrl = urlParams.get('view');
    if (viewFromUrl && ['menu', 'stock', 'results', 'submit'].includes(viewFromUrl)) {
      setCurrentView(viewFromUrl as any);
      setViewHistory([viewFromUrl]);
    }
  }, []);

  const selectedMaterialData = useMemo(() => 
    getMaterialById(formData.material),
    [formData.material]
  );

  const selectedStockData = useMemo(() => {
    const materialStockData = getStockDataByMaterial(formData.material);
    
    // If a specific plant is selected, filter the stock data to only show that plant
    if (formData.plant && materialStockData.organizations) {
      const filteredOrganizations: { [key: string]: any } = {};
      
      // Find organizations that contain the selected plant
      Object.entries(materialStockData.organizations).forEach(([orgId, orgData]) => {
        if (orgData.plants && Object.keys(orgData.plants).some(plantCode => plantCode === formData.plant)) {
          // Create a filtered organization with only the selected plant
          const filteredOrgData = {
            ...orgData,
            plants: {
              [formData.plant]: orgData.plants[formData.plant]
            }
          };
          
          // Update organization-level stock totals to match the selected plant
          const plantData = orgData.plants[formData.plant];
          Object.keys(filteredOrgData).forEach(key => {
            if (key !== 'name' && key !== 'type' && key !== 'plants' && plantData[key] !== undefined) {
              filteredOrgData[key] = plantData[key];
            }
          });
          
          filteredOrganizations[orgId] = filteredOrgData;
        }
      });
      
      // Calculate new full totals based on filtered organizations
      const newFullTotals = { name: 'Full' };
      const stockKeys = ['unrestricted', 'qualityInspection', 'reserved', 'rcptReservation', 'onOrder', 'consgtOrdered', 'stockTransfer', 'consignment'];
      
      stockKeys.forEach(key => {
        let total = 0;
        Object.values(filteredOrganizations).forEach((org: any) => {
          if (org[key]) total += org[key];
        });
        if (total > 0) newFullTotals[key] = total;
      });
      
      return {
        full: newFullTotals,
        organizations: filteredOrganizations
      };
    }
    
    return materialStockData;
  }, [formData.material, formData.plant]);

  const handleFormChange = (field: string, value: any) => {
    if (field === 'reset') {
      setFormData(getInitialFormData());
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleExecute = () => {
    if (formData.material) {
      navigateToView('results');
      setExpandedNodes({ full: true });
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Navigation with URL updates and history tracking
  const navigateToView = (newView: 'menu' | 'stock' | 'results' | 'submit') => {
    if (newView !== currentView) {
      setViewHistory(prev => [...prev, newView]);
      setCurrentView(newView);
      // Update URL without page reload
      const url = new URL(window.location);
      url.searchParams.set('view', newView);
      window.history.pushState({}, '', url);
    }
  };

  const handleNavigateToSubmit = () => {
    navigateToView('submit');
  };

  // Expose navigation function to window for task toolbar integration
  useEffect(() => {
    (window as any).navigateToSubmit = handleNavigateToSubmit;
    return () => {
      delete (window as any).navigateToSubmit;
    };
  }, []);

  const handleBackFromSubmit = () => {
    const previousView = viewHistory[viewHistory.length - 2] || 'menu';
    setViewHistory(prev => prev.slice(0, -1));
    setCurrentView(previousView as any);
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('view', previousView);
    window.history.pushState({}, '', url);
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionCode.toUpperCase() === 'MMBE') {
      navigateToView('stock');
    }
  };

  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionCode(e.target.value);
  };

  const handleToggleHelp = () => {
    setShowHelp(!showHelp);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'menu':
        return <MenuScreen onNavigate={navigateToView} />;
      case 'stock':
        return (
          <div className="bg-gray-100">
            <div className="bg-blue-100 border-b border-gray-300 p-3">
              <h1 className="text-lg font-normal italic">Stock Overview: Company Code/Plant/Storage Location/Batch</h1>
            </div>
            <StockSelectionScreen
              formData={formData}
              onFormChange={handleFormChange}
              onExecute={handleExecute}
              onBack={() => navigateToView('menu')}
              materials={SAMPLE_MATERIALS}
              displayLevels={displayLevels}
              setDisplayLevels={setDisplayLevels}
            />
          </div>
        );
      case 'results':
        return (
          <div className="bg-gray-100">
            <ResultsScreen
              selectedMaterial={formData.material}
              materialData={selectedMaterialData}
              stockData={selectedStockData}
              expandedNodes={expandedNodes}
              onToggle={toggleNode}
              onBack={() => navigateToView('stock')}
            />
          </div>
        );
      case 'submit':
        return (
          <div className="bg-gray-100">
            <div className="p-6 max-w-[1200px]">
              <div className="bg-blue-100 border-b border-gray-300 p-3 mb-4">
                <h1 className="text-lg font-normal italic">Submit Results</h1>
              </div>
              
              <div className="bg-white border border-gray-400 mb-4 shadow-sm">
                <div className="bg-blue-100 px-4 py-2 border-b border-gray-300">
                  <h3 className="text-sm font-normal text-gray-800">Task Results</h3>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your response:
                    </label>
                    <textarea
                      value={submitResults}
                      onChange={(e) => setSubmitResults(e.target.value)}
                      className="w-full h-64 p-3 border border-gray-400 rounded text-sm font-mono"
                      placeholder="Enter your task results here..."
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        // Attempt to parse the submission as JSON
                        let parsedResult;
                        try {
                          parsedResult = JSON.parse(submitResults);
                        } catch (e) {
                          // If parsing fails, store it as a raw string.
                          parsedResult = submitResults;
                        }
                        
                        // Set the app_state to the submitted value.
                        (window as any).app_state = {
                          submission: parsedResult
                        };
                        
                        console.log('SAP state updated on window.app_state', (window as any).app_state);
                        showModalAlert('Success', 'Results submitted successfully!');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm border border-green-700 rounded shadow-sm"
                    >
                      Submit Results and Finish Task
                    </button>
                    <button 
                      onClick={handleBackFromSubmit}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 text-sm border border-gray-400 shadow-sm"
                    >
                      Back to the app
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <MenuScreen onNavigate={navigateToView} />;
    }
  };

  // Root level SAP app with toolbar
  const getIconToolbarProps = () => {
    switch (currentView) {
      case 'menu':
        return {
          onExecute: () => handleTransactionSubmit({ preventDefault: () => {} } as React.FormEvent),
          transactionInput: { value: transactionCode },
          onTransactionChange: handleTransactionChange,
          onTransactionSubmit: handleTransactionSubmit,
          showHelp,
          onToggleHelp: handleToggleHelp,
          onBack: undefined, // No back button on menu
          onReturnToMenu: undefined // Already on menu
        };
      case 'stock':
        return {
          onExecute: handleExecute,
          selectOptions: ['Stock Overview', 'Material Display', 'Plant Overview'],
          selectValue: 'Stock Overview',
          onBack: () => navigateToView('menu'),
          onReturnToMenu: () => navigateToView('menu')
        };
      case 'results':
        return {
          onExecute: () => {/* Could add refresh functionality */},
          selectOptions: ['Stock Results', 'Detailed View', 'Summary View'],
          selectValue: 'Stock Results',
          onBack: () => navigateToView('stock'),
          onReturnToMenu: () => navigateToView('menu')
        };
      case 'submit':
        return {
          onExecute: () => {/* Could add refresh functionality */},
          selectOptions: ['Submit Results'],
          selectValue: 'Submit Results',
          onBack: handleBackFromSubmit,
          onReturnToMenu: () => navigateToView('menu')
        };
      default:
        return undefined;
    }
  };

  const iconToolbarProps = getIconToolbarProps();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Icon Toolbar - Root Level */}
      {iconToolbarProps && (
        <IconToolbar {...iconToolbarProps} />
      )}
      
      <div className="flex-1">
        {renderCurrentView()}
      </div>
      {showModal && <Modal title={modalContent.title} message={modalContent.message} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default SapStockOverview;

// UiBench metadata
export const metadata = {
  description: "SAP stock overview system (MMBE transaction) with hierarchical stock display, material selection, and organizational breakdown",
  version: "2.0.0",
  author: "SAP Integration Team",
  category: "Enterprise",
  tags: ["sap", "inventory", "stock", "materials", "erp"]
};
