import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface TaskClassifierProps {
  taskIdNum: number | null;
  appPath: string;
}

const TaskClassifier: React.FC<TaskClassifierProps> = ({ taskIdNum, appPath }) => {
  // Only show when explicitly enabled via environment variable
  const showClassifier = import.meta.env.VITE_SHOW_TASK_CLASSIFIER === 'true';
  
  if (!showClassifier) {
    return null;
  }

  const controlTypes = [
    'Buttons', 'Calendar', 'Checkbox', 'Color Picker', 'Command Interface', 'Date Input', 'Password', 'Radio Buttons', 'Range', 'Selection Controls', 'Slider', 'Spinner', 'Star Rating', 'Text Input', 'Text Link', 'Textarea', 'Token Input'
  ];
  
  const actionTypes = [
    'Cancel', 'Classify', 'Clear', 'Compare', 'Compute', 'Create', 'Delete', 'Double Click', 'Drag', 'Expand', 'Extract', 'Filter', 'Focus', 'Hover', 'Hotkey', 'Keyboard Navigation', 'Navigate', 'Open', 'Right Click', 'Scroll', 'Select', 'Sort', 'Toggle', 'Type', 'Update', 'Visual Search', 'Wait'
  ];
  
  const structureTypes = [
    'Accordion', 'Breadcrumbs', 'Card', 'Carousel', 'CLI', 'Custom Design', 'Date Range', 'Discrete Tokens', 'Error State', 'Feed', 'Form', 'Grid', 'Hierarchical', 'List', 'Menu', 'Mobile Design', 'Modal', 'Modals', 'Navigation', 'Pagination', 'Pre-filled', 'Search/Filter', 'Table', 'Tree', 'Wizard'
  ];

  // Storage key for current task
  const storageKey = `task-selections-${appPath.replace('/', '')}-${taskIdNum}`;
  
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [controlsOpen, setControlsOpen] = useState(false);
  const [structureOpen, setStructureOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const structureRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Load from localStorage when task changes
  useEffect(() => {
    if (taskIdNum) {
      setIsLoaded(false);
      console.log(`Loading selections for task ${taskIdNum} with key: ${storageKey}`);
      
      try {
        const saved = localStorage.getItem(storageKey);
        console.log('Raw saved data:', saved);
        
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('Parsed saved data:', parsed);
          
          setSelectedControls(parsed.controls || []);
          setSelectedStructure(parsed.structure || []);
          setSelectedActions(parsed.actions || []);
        } else {
          console.log('No saved data, using empty arrays');
          setSelectedControls([]);
          setSelectedStructure([]);
          setSelectedActions([]);
        }
      } catch (e) {
        console.error('Error loading from localStorage:', e);
        setSelectedControls([]);
        setSelectedStructure([]);
        setSelectedActions([]);
      }
      
      setIsLoaded(true);
    }
  }, [taskIdNum, storageKey]);
  
  // Save to localStorage whenever selections change (but only after initial load)
  useEffect(() => {
    if (taskIdNum && isLoaded) {
      const dataToSave = {
        controls: selectedControls,
        structure: selectedStructure,
        actions: selectedActions
      };
      console.log(`Saving selections for task ${taskIdNum}:`, dataToSave);
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      console.log('Data saved to localStorage with key:', storageKey);
    }
  }, [selectedControls, selectedStructure, selectedActions, taskIdNum, storageKey, isLoaded]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
        setControlsOpen(false);
      }
      if (structureRef.current && !structureRef.current.contains(event.target as Node)) {
        setStructureOpen(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Helper functions for combo boxes
  const toggleControl = (control: string) => {
    setSelectedControls(prev => 
      prev.includes(control) 
        ? prev.filter(c => c !== control)
        : [...prev, control]
    );
  };
  
  const toggleStructure = (structure: string) => {
    setSelectedStructure(prev => 
      prev.includes(structure) 
        ? prev.filter(c => c !== structure)
        : [...prev, structure]
    );
  };
  
  const toggleAction = (action: string) => {
    setSelectedActions(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };
  
  const removeControl = (control: string) => {
    setSelectedControls(prev => prev.filter(c => c !== control));
  };
  
  const removeStructure = (structure: string) => {
    setSelectedStructure(prev => prev.filter(c => c !== structure));
  };
  
  const removeAction = (action: string) => {
    setSelectedActions(prev => prev.filter(a => a !== action));
  };
  
  const printReport = () => {
    // Collect data from all collections and tasks
    const collectionsData: { [collection: string]: { [taskId: number]: any } } = {};
    
    console.log('DEBUG: Scanning localStorage for task data...');
    console.log('DEBUG: localStorage length:', localStorage.length);
    
    // Check localStorage for all task data across all collections
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('task-selections-')) {
        console.log('DEBUG: Found key:', key);
        try {
          const keyParts = key.split('-');
          console.log('DEBUG: Key parts:', keyParts);
          
          if (keyParts.length >= 4) {
            const collection = keyParts.slice(2, -1).join('-'); // Handle multi-word collection names
            const taskId = parseInt(keyParts[keyParts.length - 1]);
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            
            console.log('DEBUG: Parsed - Collection:', collection, 'TaskId:', taskId, 'Data:', data);
            
            if (data.controls?.length > 0 || data.structure?.length > 0 || data.actions?.length > 0) {
              if (!collectionsData[collection]) {
                collectionsData[collection] = {};
              }
              collectionsData[collection][taskId] = {
                controls: data.controls || [],
                structure: data.structure || [],
                actions: data.actions || []
              };
              console.log('DEBUG: Added to collectionsData');
            } else {
              console.log('DEBUG: Skipped - no data');
            }
          } else {
            console.log('DEBUG: Skipped - invalid key format');
          }
        } catch (e) {
          console.warn(`Failed to parse data for key ${key}:`, e);
        }
      }
    }
    
    console.log('DEBUG: Final collectionsData:', collectionsData);
    
    // Sort collections and tasks
    const sortedCollections: { [collection: string]: { [taskId: number]: any } } = {};
    Object.keys(collectionsData).sort().forEach(collection => {
      sortedCollections[collection] = {};
      Object.keys(collectionsData[collection])
        .map(id => parseInt(id))
        .sort((a, b) => a - b)
        .forEach(taskId => {
          sortedCollections[collection][taskId] = collectionsData[collection][taskId];
        });
    });
    
    const currentCollection = appPath.replace('/', '');
    const totalTasks = Object.values(collectionsData).reduce((sum, collection) => 
      sum + Object.keys(collection).length, 0
    );
    
    const report = {
      totalTasksAnalyzed: totalTasks,
      currentTask: {
        collection: currentCollection,
        taskId: taskIdNum
      },
      timestamp: new Date().toISOString(),
      collections: sortedCollections
    };
    
    console.log('='.repeat(60));
    console.log('COMPREHENSIVE TASK ANALYSIS REPORT');
    console.log('='.repeat(60));
    console.log(JSON.stringify(report, null, 2));
    console.log('='.repeat(60));
  };

  return (
    <div className="mb-5 bg-white border rounded shadow-sm px-4 py-3">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="relative" ref={controlsRef}>
            <div
              onClick={() => setControlsOpen(!controlsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[2.5rem] cursor-pointer"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setControlsOpen(!controlsOpen);
                }
              }}
            >
              <div className="flex-1 flex flex-wrap gap-1 items-center">
                {selectedControls.length > 0 ? (
                  selectedControls.map((control) => (
                    <span
                      key={control}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {control}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeControl(control);
                        }}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Controls</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
            {controlsOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-auto">
                {controlTypes.map((control) => (
                  <div
                    key={control}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => toggleControl(control)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedControls.includes(control)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span className="text-sm">{control}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="relative" ref={structureRef}>
            <div
              onClick={() => setStructureOpen(!structureOpen)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[2.5rem] cursor-pointer"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setStructureOpen(!structureOpen);
                }
              }}
            >
              <div className="flex-1 flex flex-wrap gap-1 items-center">
                {selectedStructure.length > 0 ? (
                  selectedStructure.map((structure) => (
                    <span
                      key={structure}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {structure}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStructure(structure);
                        }}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Structure</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
            {structureOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-auto">
                {structureTypes.map((structure) => (
                  <div
                    key={structure}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => toggleStructure(structure)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStructure.includes(structure)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span className="text-sm">{structure}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="relative" ref={actionsRef}>
            <div
              onClick={() => setActionsOpen(!actionsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[2.5rem] cursor-pointer"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActionsOpen(!actionsOpen);
                }
              }}
            >
              <div className="flex-1 flex flex-wrap gap-1 items-center">
                {selectedActions.length > 0 ? (
                  selectedActions.map((action) => (
                    <span
                      key={action}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {action}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAction(action);
                        }}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Actions</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
            {actionsOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-auto">
                {actionTypes.map((action) => (
                  <div
                    key={action}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => toggleAction(action)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedActions.includes(action)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-start">
          <button
            onClick={printReport}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 whitespace-nowrap"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskClassifier;
