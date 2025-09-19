import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Folder, FolderOpen, File, Home, Menu, X, Play, Pause, MoreHorizontal, Square, CheckSquare } from 'lucide-react';
import TaskWrapper from '../src/TaskWrapper';


// 1. Expandable Tree View
const ExpandableTreeView = () => {
  const [expanded, setExpanded] = useState(new Set(['folder1']));
  const [checked, setChecked] = useState(new Set<string>());
  const [selectedItem, setSelectedItem] = useState('');
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedItem,
      expanded: Array.from(expanded),
      checked: Array.from(checked)
    };
  }, [selectedItem, expanded, checked]);
  
  const tree = {
    folder1: { name: 'Documents', type: 'folder', children: ['file1', 'file2', 'folder2'] },
    folder2: { name: 'Projects', type: 'folder', children: ['file3', 'file4'] },
    file1: { name: 'Report.pdf', type: 'file' },
    file2: { name: 'Notes.txt', type: 'file' },
    file3: { name: 'App.js', type: 'file' },
    file4: { name: 'Style.css', type: 'file' }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checked);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setChecked(newChecked);
  };

  const renderNode = (id: string, level: number = 0) => {
    const node = tree[id as keyof typeof tree];
    const isExpanded = expanded.has(id);
    
    return (
      <div key={id}>
        <div className="flex items-center space-x-2 py-1 hover:bg-gray-50" style={{ paddingLeft: `${level * 20}px` }}>
          <div onClick={() => { toggleCheck(id); setSelectedItem(node.name); }} className="cursor-pointer">
            {checked.has(id) ? <CheckSquare className="h-4 w-4 text-blue-600" /> : <Square className="h-4 w-4 text-gray-400" />}
          </div>
          
          {node.type === 'folder' && (
            <div onClick={() => toggleExpanded(id)} className="cursor-pointer">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          )}
          
          <div 
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => setSelectedItem(node.name)}
          >
            {node.type === 'folder' ? (
              isExpanded ? <FolderOpen className="h-4 w-4 text-yellow-600" /> : <Folder className="h-4 w-4 text-yellow-600" />
            ) : (
              <File className="h-4 w-4 text-gray-500" />
            )}
            <span className={`text-sm ${selectedItem === node.name ? 'text-blue-600 font-medium' : ''}`}>
              {node.name}
            </span>
          </div>
        </div>
        
        {node.type === 'folder' && 'children' in node && node.children && isExpanded && (
          <div>
            {node.children.map(childId => renderNode(childId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="border rounded-md p-3 bg-white">
        {renderNode('folder1')}
      </div>
    </div>
  );
};

// 2. Accordion Panels
const AccordionPanels = () => {
  const [expandedPanels, setExpandedPanels] = useState(['general']);
  const [multiMode, setMultiMode] = useState(false);
  const [selected, setSelected] = useState('');
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selected,
      expandedPanels,
      multiMode
    };
  }, [selected, expandedPanels, multiMode]);
  
  const panels = [
    {
      id: 'general',
      title: 'General',
      items: ['Profile', 'Account', 'Privacy']
    },
    {
      id: 'notifications',
      title: 'Notifications', 
      items: ['Email', 'Push', 'SMS']
    },
    {
      id: 'appearance',
      title: 'Appearance',
      items: ['Theme', 'Layout', 'Colors']
    }
  ];
  
  const togglePanel = (panelId: string) => {
    if (multiMode) {
      setExpandedPanels(prev => 
        prev.includes(panelId) 
          ? prev.filter(id => id !== panelId)
          : [...prev, panelId]
      );
    } else {
      setExpandedPanels([panelId]);
    }
  };

  return (
    <div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={multiMode}
              onChange={(e) => setMultiMode(e.target.checked)}
            />
            <span className="text-sm">Multi-mode (allow multiple panels open)</span>
          </label>
        </div>
        <div className="border rounded-md">
          {panels.map((panel) => (
            <div key={panel.id} className="border-b last:border-b-0">
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                onClick={() => togglePanel(panel.id)}
              >
                <span className="font-medium">{panel.title}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  expandedPanels.includes(panel.id) ? 'rotate-180' : ''
                }`} />
              </button>
              {expandedPanels.includes(panel.id) && (
                <div className="px-3 pb-3 space-y-1">
                  {panel.items.map((item) => (
                    <button
                      key={item}
                      className={`block w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 ${
                        selected === item ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                      onClick={() => setSelected(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Stepper Wizard
const StepperWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [mode, setMode] = useState('linear');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [completed, setCompleted] = useState(false);
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      currentStep,
      mode,
      selectedPlan,
      completed
    };
  }, [currentStep, mode, selectedPlan, completed]);
  
  const linearSteps = ['Account', 'Profile', 'Preferences', 'Review'];
  const branchedSteps = ['Account', 'Plan', 'Payment', 'Confirmation'];
  
  const steps = mode === 'linear' ? linearSteps : branchedSteps;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="mode"
              checked={mode === 'linear'}
              onChange={() => {
                setMode('linear');
                setCurrentStep(0);
                setCompleted(false);
              }}
            />
            <span className="text-sm">Linear Flow</span>
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              name="mode"
              checked={mode === 'branched'}
              onChange={() => {
                setMode('branched');
                setCurrentStep(0);
                setCompleted(false);
              }}
            />
            <span className="text-sm">Branched Flow</span>
          </label>
        </div>
        
        <div className="flex items-center">
          {steps.map((_, index) => (
            <React.Fragment key={index}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                index <= currentStep 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="border rounded-md p-4 min-h-[200px]">
          <h3 className="font-semibold mb-3">{steps[currentStep]}</h3>
          {mode === 'branched' && currentStep === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Choose your plan:</p>
              {['Basic', 'Business', 'Enterprise'].map((plan) => (
                <label key={plan} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="plan"
                    checked={selectedPlan === plan}
                    onChange={() => setSelectedPlan(plan)}
                  />
                  <span className="text-sm">{plan}</span>
                </label>
              ))}
            </div>
          )}
          {completed && (
            <div className="text-green-600 font-semibold">
              Wizard completed! Selected plan: {selectedPlan || 'None'}
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 inline mr-1" />
            Previous
          </button>
          <button
            onClick={nextStep}
            disabled={completed}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 inline ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Mega Menu
const MegaMenu = () => {
  const [activeMenu, setActiveMenu] = useState('');
  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      activeMenu,
      selectedItem
    };
  }, [activeMenu, selectedItem]);

  const menuData = {
    'Products': ['React Components', 'Vue Templates', 'Angular Modules'],
    'Services': ['Frontend', 'Backend', 'Full Stack'],
    'Support': ['Help Center', 'Contact', 'Documentation']
  };

  return (
    <div>
      <div className="relative">
        <div className="flex bg-gray-900 text-white">
          {Object.keys(menuData).map(menu => (
            <div
              key={menu}
              className={`px-6 py-3 cursor-pointer hover:bg-gray-700 ${activeMenu === menu ? 'bg-gray-700' : ''}`}
              onMouseEnter={() => setActiveMenu(menu)}
            >
              {menu}
            </div>
          ))}
        </div>
        
        {activeMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border shadow-lg z-10" onMouseLeave={() => setActiveMenu('')}>
            <div className="p-4">
              <h3 className="font-semibold mb-3">{activeMenu}</h3>
              <div className="space-y-2">
                {menuData[activeMenu as keyof typeof menuData].map(item => (
                  <div
                    key={item}
                    onClick={() => { setSelectedItem(item); setActiveMenu(''); }}
                    className="p-2 rounded hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {selectedItem && <div className="mt-4 p-3 bg-blue-50 rounded">Selected: <strong>{selectedItem}</strong></div>}
    </div>
  );
};

// 5. Classic Menubar Dropdowns
const ClassicMenubar = () => {
  const [activeMenu, setActiveMenu] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      activeMenu,
      selectedAction
    };
  }, [activeMenu, selectedAction]);

  const menus = {
    'File': ['New', 'Open', 'Save', 'Save As', 'Exit'],
    'Edit': ['Undo', 'Redo', 'Cut', 'Copy', 'Paste'],
    'View': ['Zoom In', 'Zoom Out', 'Full Screen']
  };

  return (
    <div>
      <div className="relative">
        <div className="flex bg-gray-100 border">
          {Object.keys(menus).map(menu => (
            <div
              key={menu}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${activeMenu === menu ? 'bg-gray-200' : ''}`}
              onClick={() => setActiveMenu(activeMenu === menu ? '' : menu)}
            >
              {menu}
            </div>
          ))}
        </div>
        
        {activeMenu && (
          <div className="absolute top-full left-0 bg-white border shadow-lg z-10 min-w-48">
            {menus[activeMenu as keyof typeof menus].map(item => (
              <div
                key={item}
                onClick={() => { setSelectedAction(item); setActiveMenu(''); }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedAction && <div className="mt-4 p-3 bg-green-50 rounded">Action: <strong>{selectedAction}</strong></div>}
    </div>
  );
};

// 6. Context Menu
const ContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  const [selectedAction, setSelectedAction] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedAction,
      contextMenu
    };
  }, [selectedAction, contextMenu]);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div>
      <div 
        className="border rounded p-4 bg-gray-50 cursor-pointer"
        onContextMenu={handleRightClick}
        onClick={() => setContextMenu(null)}
      >
        Right-click anywhere in this area to open context menu
      </div>
      
      {contextMenu && (
        <div 
          className="fixed bg-white border shadow-lg z-50 min-w-32"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {['Cut', 'Copy', 'Paste', 'Delete'].map(action => (
            <div
              key={action}
              onClick={() => { setSelectedAction(action); setContextMenu(null); }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {action}
            </div>
          ))}
        </div>
      )}
      
      {selectedAction && <div className="mt-4 p-3 bg-green-50 rounded">Action: <strong>{selectedAction}</strong></div>}
    </div>
  );
};

// 7. Slide-in Drawer
const SlideInDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      isOpen,
      selectedItem
    };
  }, [isOpen, selectedItem]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded"
      >
        <Menu className="h-4 w-4" />
        <span>Menu</span>
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Navigation</h3>
              <button onClick={() => setIsOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4">
              {['Home', 'Profile', 'Settings', 'Help'].map(item => (
                <div
                  key={item}
                  onClick={() => { setSelectedItem(item); setIsOpen(false); }}
                  className="py-2 px-3 hover:bg-gray-100 cursor-pointer rounded"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {selectedItem && <div className="mt-4 p-3 bg-blue-50 rounded">Selected: <strong>{selectedItem}</strong></div>}
    </div>
  );
};

// 8. Toolbar Overflow
const ToolbarOverflow = () => {
  const [showOverflow, setShowOverflow] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      showOverflow,
      selectedTool
    };
  }, [showOverflow, selectedTool]);

  const mainTools = ['Bold', 'Italic', 'Underline'];
  const overflowTools = ['Strikethrough', 'Subscript', 'Superscript', 'Archive'];

  return (
    <div>
      <div className="flex items-center bg-gray-100 rounded p-2">
        {mainTools.map(tool => (
          <button
            key={tool}
            onClick={() => setSelectedTool(tool)}
            className="px-3 py-1 hover:bg-gray-200 rounded text-sm mx-1"
          >
            {tool}
          </button>
        ))}
        
        <div className="relative">
          <button
            onClick={() => setShowOverflow(!showOverflow)}
            className="px-2 py-1 hover:bg-gray-200 rounded ml-2"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {showOverflow && (
            <div className="absolute top-full right-0 mt-1 bg-white border shadow-lg z-10 min-w-32">
              {overflowTools.map(tool => (
                <div
                  key={tool}
                  onClick={() => { setSelectedTool(tool); setShowOverflow(false); }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {tool}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {selectedTool && <div className="mt-4 p-3 bg-green-50 rounded">Tool: <strong>{selectedTool}</strong></div>}
    </div>
  );
};

// 9. Static Breadcrumbs
const StaticBreadcrumbs = () => {
  const [currentPath] = useState(['Home', 'Documents', 'Projects']);
  const [selectedCrumb, setSelectedCrumb] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      currentPath,
      selectedCrumb
    };
  }, [currentPath, selectedCrumb]);

  return (
    <div>
      <nav className="flex items-center space-x-2 text-sm">
        <Home className="h-4 w-4 text-gray-500" />
        {currentPath.map((crumb, index) => (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <button
              onClick={() => setSelectedCrumb(crumb)}
              className={`hover:text-blue-600 ${selectedCrumb === crumb ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
            >
              {crumb}
            </button>
          </div>
        ))}
      </nav>
      
      {selectedCrumb && <div className="mt-4 p-3 bg-blue-50 rounded">Navigated to: <strong>{selectedCrumb}</strong></div>}
    </div>
  );
};

// 10. Filter Chip Breadcrumbs
const FilterChipBreadcrumbs = () => {
  const [filters, setFilters] = useState(['Category: Electronics', 'Price: $100-500', 'Brand: Apple']);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      filters
    };
  }, [filters]);

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            <span>{filter}</span>
            <button
              onClick={() => removeFilter(index)}
              className="ml-2 hover:text-blue-900"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Export the App component
// 11-20. Remaining components (simplified for space)
const HistoryBreadcrumbs = () => {
  const [currentPath, setCurrentPath] = useState(['Home', 'Shop', 'Electronics', 'Computers', 'Laptops']);
  const [history] = useState([
    ['Home'],
    ['Home', 'Shop'],
    ['Home', 'Shop', 'Electronics'],
    ['Home', 'Shop', 'Products'],
    ['Home', 'Shop', 'Electronics', 'Computers'],
    ['Home', 'Shop', 'Electronics', 'Computers', 'Laptops']
  ]);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      currentPath,
      history
    };
  }, [currentPath, history]);

  const goToPath = (pathIndex: number) => {
    if (pathIndex < currentPath.length) {
      setCurrentPath(currentPath.slice(0, pathIndex + 1));
    }
  };

  return (
    <div>
      <div className="space-y-3">
        <div className="flex items-center gap-1 p-2 bg-gray-100 rounded">
          {currentPath.map((segment, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-3 w-3 text-gray-500" />}
              <button
                className={`px-2 py-1 rounded cursor-pointer hover:bg-gray-200 ${
                  index === currentPath.length - 1 ? 'bg-blue-500 text-white' : ''
                }`}
                onClick={() => goToPath(index)}
              >
                {segment}
              </button>
            </React.Fragment>
          ))}
        </div>
        
        <div className="text-sm">
          <p className="font-medium mb-2">Available paths from history:</p>
          <div className="space-y-1">
            {history.map((path, index) => (
              <button
                key={index}
                className="block text-left px-2 py-1 rounded hover:bg-gray-100 text-blue-600"
                onClick={() => setCurrentPath([...path])}
              >
                {path.join(' > ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DropdownCrumbs = () => {
  const [selectedPath, setSelectedPath] = useState('Documents/Reports/Q4');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedPath
    };
  }, [selectedPath]);

  const paths = ['Documents/Reports/Q4', 'Documents/Images/Photos', 'Downloads/Software'];

  return (
    <div>
      <select
        value={selectedPath}
        onChange={(e) => setSelectedPath(e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        {paths.map(path => (
          <option key={path} value={path}>{path}</option>
        ))}
      </select>
    </div>
  );
};

const FixedTabStrips = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      activeTab
    };
  }, [activeTab]);

  const tabs = ['dashboard', 'analytics', 'reports', 'settings'];

  return (
    <div>
      <div className="border-b">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 text-sm">Content for {activeTab}</div>
    </div>
  );
};

const ScrollableTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      activeTab
    };
  }, [activeTab]);

  const tabs = Array.from({length: 12}, (_, i) => `Tab ${i + 1}`);

  return (
    <div>
      <div className="overflow-x-auto max-w-md">
        <div className="flex min-w-max border-b">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 text-sm whitespace-nowrap ${
                activeTab === index ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const VerticalTabs = () => {
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      activeTab
    };
  }, [activeTab]);

  const tabs = ['profile', 'account', 'security', 'notifications'];

  return (
    <div>
      <div className="flex">
        <div className="w-32 border-r">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full px-3 py-2 text-left text-sm capitalize ${
                activeTab === tab ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex-1 p-4 text-sm">Content for {activeTab}</div>
      </div>
    </div>
  );
};

const NestedTabsets = () => {
  const [primaryTab, setPrimaryTab] = useState('design');
  const [secondaryTab, setSecondaryTab] = useState('colors');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      primaryTab,
      secondaryTab
    };
  }, [primaryTab, secondaryTab]);

  const tabSets = {
    design: ['colors', 'typography', 'layout'],
    code: ['html', 'css', 'javascript']
  };

  return (
    <div>
      <div className="border rounded">
        <div className="flex border-b bg-gray-50">
          {Object.keys(tabSets).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setPrimaryTab(tab);
                setSecondaryTab(tabSets[tab as keyof typeof tabSets][0]);
              }}
              className={`px-4 py-2 text-sm capitalize ${
                primaryTab === tab ? 'bg-white border-t-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex border-b">
          {tabSets[primaryTab as keyof typeof tabSets].map(tab => (
            <button
              key={tab}
              onClick={() => setSecondaryTab(tab)}
              className={`px-3 py-2 text-sm ${
                secondaryTab === tab ? 'bg-blue-50 text-blue-600' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-4 text-sm">Content: {primaryTab} / {secondaryTab}</div>
      </div>
    </div>
  );
};

const HorizontalCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      currentIndex
    };
  }, [currentIndex]);

  const items = Array.from({length: 6}, (_, i) => `Item ${i + 1}`);

  return (
    <div>
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${currentIndex * 200}px)` }}
          >
            {items.map((item, index) => (
              <div key={index} className="w-48 flex-shrink-0 p-4 border rounded mr-4 text-center">
                {item}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCurrentIndex(Math.min(items.length - 1, currentIndex + 1))}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-1"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const AutoplaySlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      currentSlide,
      userPaused,
      isFocused
    };
  }, [currentSlide, userPaused, isFocused]);

  const slides = ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4'];
  const isPaused = userPaused || isFocused;

  const togglePause = () => {
    if (userPaused) {
      // When resuming, advance immediately and clear focus to avoid conflict
      setCurrentSlide(prev => (prev + 1) % 4);
      setIsFocused(false); // Clear focus state to allow restart
      setUserPaused(false);
    } else {
      setUserPaused(true);
    }
  };

  // Start slideshow automatically on mount  
  useEffect(() => {
    setUserPaused(false);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      let timeout: number;
      
      const scheduleNext = () => {
        timeout = window.setTimeout(() => {
          setCurrentSlide(prev => (prev + 1) % 4);
          scheduleNext(); // Schedule the next one
        }, 2000);
      };
      
      // Start the cycle
      scheduleNext();
      
      return () => clearTimeout(timeout);
    }
  }, [isPaused]);

  return (
    <div>
      <div
        className="relative border rounded p-8 text-center"
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <div className="text-lg font-medium">{slides[currentSlide]}</div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="absolute top-2 right-2">
          <button
            onClick={togglePause}
            className="p-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            {userPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const ScrubTimeline = () => {
  const [selectedMonth, setSelectedMonth] = useState(5);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedMonth
    };
  }, [selectedMonth]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="11"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {months.map((month, index) => (
            <span key={index} className={index === selectedMonth ? 'font-bold text-blue-600' : ''}>
              {month}
            </span>
          ))}
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded text-center">
          Selected: <strong>{months[selectedMonth]} 2024</strong>
        </div>
      </div>
    </div>
  );
};

const CoverFlowLane = () => {
  const [focusedIndex, setFocusedIndex] = useState(2);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      focusedIndex
    };
  }, [focusedIndex]);

  const items = Array.from({length: 7}, (_, i) => `Album ${i + 1}`);

  return (
    <div>
      <div className="flex items-center justify-center space-x-2 py-8">
        {items.map((item, index) => {
          const distance = Math.abs(index - focusedIndex);
          const scale = distance === 0 ? 1 : distance === 1 ? 0.8 : 0.6;
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.7 : 0.4;

          return (
            <div
              key={index}
              onClick={() => setFocusedIndex(index)}
              className="cursor-pointer transition-all duration-300 bg-gray-200 rounded flex items-center justify-center text-xs"
              style={{
                width: `${80 * scale}px`,
                height: `${100 * scale}px`,
                opacity,
                transform: `translateZ(${distance === 0 ? 0 : -50 * distance}px)`
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Task data
const tasks = [
  { 
    id: 1, 
    name: 'Expandable Tree View', 
    component: ExpandableTreeView,
    task: 'Expand Projects folder and select "App.js"',
    ux: 'Tree view with tri-state checkboxes',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedItem === 'App.js';
      return { success };
    }
  },
  { 
    id: 2, 
    name: 'Accordion Panels', 
    component: AccordionPanels,
    task: 'Switch to multi-mode, open Notifications, select "Push"',
    ux: 'Single mode closes others, multi-mode allows multiple open',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selected === 'Push' && appState?.multiMode === true;
      return { success };
    }
  },
  { 
    id: 3, 
    name: 'Stepper Wizard', 
    component: StepperWizard,
    task: 'Switch to branched mode, select Business plan, complete wizard',
    ux: 'Linear flows sequentially, branched allows different paths',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.mode === 'branched' && appState?.selectedPlan === 'Business' && appState?.completed === true;
      return { success };
    }
  },
  { 
    id: 4, 
    name: 'Mega Menu', 
    component: MegaMenu,
    task: 'Click Products, then select "React Components"',
    ux: 'Mega menu with layered sub-panels',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedItem === 'React Components';
      return { success };
    }
  },
  { 
    id: 5, 
    name: 'Classic Menubar', 
    component: ClassicMenubar,
    task: 'File → Save As',
    ux: 'Classic menubar with dropdowns',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedAction === 'Save As';
      return { success };
    }
  },
  { 
    id: 6, 
    name: 'Context Menu', 
    component: ContextMenu,
    task: 'Right-click text area and select "Copy"',
    ux: 'Context menu anchored to pointer',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedAction === 'Copy';
      return { success };
    }
  },
  { 
    id: 7, 
    name: 'Slide-in Drawer', 
    component: SlideInDrawer,
    task: 'Open hamburger menu and select "Profile"',
    ux: 'Slide-in side drawer navigation',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedItem === 'Profile';
      return { success };
    }
  },
  { 
    id: 8, 
    name: 'Toolbar Overflow', 
    component: ToolbarOverflow,
    task: 'Click "..." and select "Archive"',
    ux: 'Toolbar with overflow menu',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedTool === 'Archive';
      return { success };
    }
  },
  { 
    id: 9, 
    name: 'Static Breadcrumbs', 
    component: StaticBreadcrumbs,
    task: 'Click "Documents" in breadcrumb trail',
    ux: 'Static location breadcrumbs (folder paths)',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedCrumb === 'Documents';
      return { success };
    }
  },
  { 
    id: 10, 
    name: 'Filter Chip Breadcrumbs', 
    component: FilterChipBreadcrumbs,
    task: 'Remove first two filter chips, keep only "Brand: Apple"',
    ux: 'Filter-chip breadcrumbs (removable tokens)',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.filters?.length === 1 && appState?.filters?.[0] === 'Brand: Apple';
      return { success };
    }
  },
  { 
    id: 11, 
    name: 'History Breadcrumbs', 
    component: HistoryBreadcrumbs,
    task: 'Click "Products" to go back to that page',
    ux: 'Shows navigation history, click any segment to go back',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.currentPath?.length === 3 && appState?.currentPath?.includes('Products');
      return { success };
    }
  },
  { 
    id: 12, 
    name: 'Dropdown Crumbs', 
    component: DropdownCrumbs,
    task: 'Select a path containing "Images"',
    ux: 'Dropdown crumbs for sibling selection',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedPath?.includes('Images');
      return { success };
    }
  },
  { 
    id: 13, 
    name: 'Fixed Tab Strips', 
    component: FixedTabStrips,
    task: 'Switch to "analytics" tab',
    ux: 'Fixed-width top tab strips',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.activeTab === 'analytics';
      return { success };
    }
  },
  { 
    id: 14, 
    name: 'Scrollable Tabs', 
    component: ScrollableTabs,
    task: 'Scroll and select "Tab 9"',
    ux: 'Momentum-scrollable tab rows',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.activeTab === 8;
      return { success };
    }
  },
  { 
    id: 15, 
    name: 'Vertical Tabs', 
    component: VerticalTabs,
    task: 'Select "security" tab',
    ux: 'Vertical side tabs',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.activeTab === 'security';
      return { success };
    }
  },
  { 
    id: 16, 
    name: 'Nested Tabsets', 
    component: NestedTabsets,
    task: 'Switch to "code" then select "javascript"',
    ux: 'Nested tabsets swapping child bars',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.primaryTab === 'code' && appState?.secondaryTab === 'javascript';
      return { success };
    }
  },
  { 
    id: 17, 
    name: 'Horizontal Carousel', 
    component: HorizontalCarousel,
    task: 'Navigate the carousel to show "Item 4" first on the left.',
    ux: 'Horizontal carousels with snap points',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.currentIndex === 3;
      return { success };
    }
  },
  { 
    id: 18, 
    name: 'Autoplay Slideshow', 
    component: AutoplaySlideshow,
    task: 'Pause slideshow when "Slide 3" is visible',
    ux: 'Autoplay slideshows that pause on focus',
    test: () => {
      const appState = (window as any).app_state;
      const success = (appState?.userPaused || appState?.isFocused) && appState?.currentSlide === 2;
      return { success };
    }
  },
  { 
    id: 19, 
    name: 'Scrub Timeline', 
    component: ScrubTimeline,
    task: 'Scrub timeline to "Aug"',
    ux: 'Scrubbable timelines for date/event ranges',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedMonth === 7;
      return { success };
    }
  },
  { 
    id: 20, 
    name: 'Cover Flow Lane', 
    component: CoverFlowLane,
    task: 'Focus on "Album 5"',
    ux: 'Cover-flow lanes centering the focused item',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.focusedIndex === 4;
      return { success };
    }
  }
];

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Navigation Patterns: Hierarchical & Spatial', appPath: '/navigation-hierarchical-spatial' };

// Main App using TaskWrapper
export default function App() {
  return (
    <TaskWrapper 
      tasks={tasks}
      appName="Navigation Patterns: Hierarchical & Spatial"
      appPath="/navigation-hierarchical-spatial"
    />
  );
} 