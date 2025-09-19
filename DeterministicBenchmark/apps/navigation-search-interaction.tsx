import React, { useState, useEffect } from 'react';
import { Search, ZoomIn, ZoomOut, Compass, ChevronUp } from 'lucide-react';
import TaskWrapper from '../src/TaskWrapper';


// 1. Click-drag Pan with Inertia
const ClickDragPan = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      position,
      isDragging
    };
  }, [position, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div>
      <div 
        className="relative h-48 bg-gray-100 border rounded-md overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="absolute inset-0 bg-green-200 border-2 border-green-400 rounded"
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        >
          <div className="flex items-center justify-center h-full">
            <Compass className="h-8 w-8 text-green-700" />
            <span className="ml-2 font-medium">Draggable Map</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Mouse-wheel Zoom
const MouseWheelZoom = () => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      zoom
    };
  }, [zoom]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    const element = document.getElementById('wheel-zoom-container');
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
      return () => element.removeEventListener('wheel', handleWheel);
    }
  }, []);

  return (
    <div>
      <div 
        id="wheel-zoom-container"
        className="h-48 bg-gray-100 border rounded-md overflow-hidden flex items-center justify-center"
      >
        <div 
          className="bg-blue-200 border-2 border-blue-400 rounded p-4 transition-transform"
          style={{ transform: `scale(${zoom})` }}
        >
          <ZoomIn className="h-6 w-6 text-blue-700" />
          <div className="text-sm font-medium mt-1">Zoom: {zoom.toFixed(1)}x</div>
        </div>
      </div>
      <div className="mt-2 flex space-x-2">
        <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))} className="px-2 py-1 bg-gray-200 rounded text-sm">-</button>
        <button onClick={() => setZoom(prev => Math.min(3, prev + 0.2))} className="px-2 py-1 bg-gray-200 rounded text-sm">+</button>
      </div>
    </div>
  );
};

// 3. Marker Clustering
const MarkerClustering = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedCluster, setSelectedCluster] = useState(-1);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      zoomLevel,
      selectedCluster
    };
  }, [zoomLevel, selectedCluster]);

  const clusters = [
    { id: 0, x: 30, y: 40, count: 5, expanded: zoomLevel >= 2 },
    { id: 1, x: 70, y: 60, count: 3, expanded: zoomLevel >= 2 },
  ];

  return (
    <div>
      <div className="relative h-48 bg-gray-100 border rounded-md overflow-hidden">
        {clusters.map(cluster => (
          <div key={cluster.id} style={{ position: 'absolute', left: `${cluster.x}%`, top: `${cluster.y}%` }}>
            {cluster.expanded ? (
              <div className="flex space-x-1">
                {Array.from({length: cluster.count}, (_, i) => (
                  <div 
                    key={i}
                    onClick={() => setSelectedCluster(cluster.id)}
                    className={`w-3 h-3 rounded-full cursor-pointer ${selectedCluster === cluster.id ? 'bg-red-600' : 'bg-red-400'}`}
                  />
                ))}
              </div>
            ) : (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {cluster.count}
              </div>
            )}
          </div>
        ))}
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <button onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))} className="p-2 bg-white border rounded hover:bg-gray-50">
            <ZoomOut className="h-5 w-5" />
          </button>
          <button onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.5))} className="p-2 bg-white border rounded hover:bg-gray-50">
            <ZoomIn className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">Zoom: {zoomLevel}x</div>
    </div>
  );
};

// 4. Pitch-locked 2.5D View
const PitchLocked2D = () => {
  const [rotation, setRotation] = useState(0);
  const [pitch] = useState(30); // Locked pitch

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      rotation,
      pitch
    };
  }, [rotation, pitch]);

  return (
    <div>
      <div className="h-48 bg-gradient-to-b from-blue-200 to-green-200 border rounded-md flex items-center justify-center overflow-hidden">
        <div 
          className="relative"
          style={{ 
            transform: `perspective(500px) rotateX(${pitch}deg) rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="w-16 h-16 bg-gray-600 border-2 border-gray-800 flex items-center justify-center">
            <Compass className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center space-x-2">
        <button onClick={() => setRotation(prev => prev - 15)} className="px-2 py-1 bg-gray-200 rounded text-sm">↺</button>
        <span className="text-sm">Rotation: {rotation}°</span>
        <button onClick={() => setRotation(prev => prev + 15)} className="px-2 py-1 bg-gray-200 rounded text-sm">↻</button>
      </div>
    </div>
  );
};

// 5. Global Query Bar
const GlobalQueryBar = () => {
  const [query, setQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      query,
      selectedResult
    };
  }, [query, selectedResult]);

  const allResults = ['React Components', 'Vue Templates', 'Angular Services', 'JavaScript Utils', 'CSS Frameworks'];
  const results = query ? allResults.filter(r => r.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div>
      <div className="relative">
        <div className="flex items-center border rounded-md p-2">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            className="flex-1 outline-none text-sm"
          />
        </div>
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-md shadow-lg z-10">
            {results.map(result => (
              <div
                key={result}
                onClick={() => { setSelectedResult(result); setQuery(''); }}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-b-0"
              >
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedResult && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
          Selected: <strong>{selectedResult}</strong>
        </div>
      )}
    </div>
  );
};

// 6. Faceted Sidebar Filter
const FacetedSidebar = () => {
  const [filters, setFilters] = useState({ category: '', price: '', rating: '' });
  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      filters,
      selectedItem
    };
  }, [filters, selectedItem]);

  const items = [
    { name: 'Laptop', category: 'Electronics', price: 'High', rating: '5' },
    { name: 'Book', category: 'Media', price: 'Low', rating: '4' },
    { name: 'Phone', category: 'Electronics', price: 'High', rating: '5' },
    { name: 'Shirt', category: 'Clothing', price: 'Medium', rating: '3' }
  ];

  const filteredItems = items.filter(item => 
    (!filters.category || item.category === filters.category) &&
    (!filters.price || item.price === filters.price) &&
    (!filters.rating || item.rating === filters.rating)
  );

  return (
    <div>
      <div className="flex space-x-4">
        <div className="w-48 border rounded-md p-3 bg-gray-50">
          <h3 className="font-medium text-sm mb-2">Filters</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Category</label>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                className="w-full mt-1 text-xs border rounded p-1"
              >
                <option value="">All</option>
                <option value="Electronics">Electronics</option>
                <option value="Media">Media</option>
                <option value="Clothing">Clothing</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Price</label>
              <select 
                value={filters.price} 
                onChange={(e) => setFilters(prev => ({...prev, price: e.target.value}))}
                className="w-full mt-1 text-xs border rounded p-1"
              >
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-2">
            {filteredItems.map(item => (
              <div
                key={item.name}
                onClick={() => setSelectedItem(item.name)}
                className={`p-3 border rounded cursor-pointer ${selectedItem === item.name ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
              >
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{item.category} • {item.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 7. Contextual In-list Search
const ContextualInListSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      searchTerm,
      selectedContact
    };
  }, [searchTerm, selectedContact]);

  const contacts = [
    'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams',
    'Frank Miller', 'Grace Lee', 'Henry Wilson', 'Ivy Chen', 'Jack Davis'
  ];

  const filteredContacts = contacts.filter(contact => 
    contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="border rounded-md">
        <div className="p-2 border-b">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
            className="w-full text-sm outline-none"
          />
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filteredContacts.map(contact => (
            <div
              key={contact}
              onClick={() => setSelectedContact(contact)}
              className={`px-3 py-2 cursor-pointer text-sm border-b last:border-b-0 ${
                selectedContact === contact ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              {contact}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 8. Command Palette
const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCommand, setSelectedCommand] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      isOpen,
      query,
      selectedCommand
    };
  }, [isOpen, query, selectedCommand]);

  const commands = [
    'Create New File', 'Open File', 'Save File', 'Search in Files', 'Toggle Sidebar',
    'Run Command', 'Git Commit', 'Format Document', 'Toggle Terminal', 'Settings'
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.toLowerCase().includes(query.toLowerCase())
  );

  const executeCommand = (command: string) => {
    setSelectedCommand(command);
    setIsOpen(false);
    setQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 bg-gray-100 border rounded text-sm flex items-center space-x-2"
      >
        <span className="inline-flex items-center min-w-[2.2rem] h-6 px-2 bg-gray-700 text-white text-xs font-mono font-semibold rounded border border-gray-500 shadow-sm justify-center">Ctrl</span>
        <span className="mx-1 font-bold text-gray-600">+</span>
        <span className="inline-flex items-center min-w-[1.5rem] h-6 px-2 bg-gray-200 text-gray-800 text-xs font-mono font-semibold rounded border border-gray-400 shadow-sm justify-center">K</span>
        <span className="ml-2">Open Command Palette</span>
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-96">
            <div className="p-3 border-b">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command..."
                className="w-full outline-none text-sm"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredCommands.map(command => (
                <div
                  key={command}
                  onClick={() => executeCommand(command)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-b-0"
                >
                  {command}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {selectedCommand && (
        <div className="mt-2 p-2 bg-green-50 rounded text-sm">
          Executed: <strong>{selectedCommand}</strong>
        </div>
      )}
    </div>
  );
};

// 9. Single-key Scroll Accelerators
const SingleKeyScroll = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      scrollPosition,
      focused
    };
  }, [scrollPosition, focused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'j' || e.key === 'J') {
      setScrollPosition(prev => Math.min(400, prev + 50));
    } else if (e.key === 'k' || e.key === 'K') {
      setScrollPosition(prev => Math.max(0, prev - 50));
    }
  };

  return (
    <div>
      <div
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.currentTarget.focus()}
        className={`h-48 border rounded-md p-2 outline-none overflow-hidden cursor-pointer ${focused ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
      >
        <div className="text-xs text-gray-500 mb-2">
          {focused ? 'Press J (down) or K (up) to scroll' : 'Click here to focus, then use J/K'}
        </div>
        <div className="relative h-full">
          <div 
            className="absolute inset-0 bg-gradient-to-b from-blue-100 to-blue-300 rounded"
            style={{ transform: `translateY(-${scrollPosition}px)` }}
          >
            <div className="p-4 space-y-4">
              {Array.from({length: 20}, (_, i) => (
                <div key={i} className="p-2 bg-white rounded text-sm">
                  Content item {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">Scroll position: {scrollPosition}px</div>
    </div>
  );
};

// 10. Link-hint Overlays
const LinkHintOverlay = () => {
  const [showHints, setShowHints] = useState(false);
  const [selectedLink, setSelectedLink] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      showHints,
      selectedLink
    };
  }, [showHints, selectedLink]);

  const links = [
    { id: 'home', text: 'Home', hint: '23' },
    { id: 'about', text: 'About', hint: '45' },
    { id: 'contact', text: 'Contact', hint: '67' },
    { id: 'blog', text: 'Blog', hint: '89' }
  ];

  const handleHintClick = (linkText: string) => {
    setSelectedLink(linkText);
    setShowHints(false);
  };

  return (
    <div>
      <div className="relative">
        <button
          onClick={() => setShowHints(!showHints)}
          className="mb-3 px-3 py-1 bg-gray-200 rounded text-sm"
        >
          {showHints ? 'Hide Hints' : 'Show Hints'}
        </button>
        
        <div className="border rounded-md p-4 bg-gray-50">
          <nav className="flex space-x-4">
            {links.map(link => (
              <div key={link.id} className="relative">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setSelectedLink(link.text); }}
                  className={`text-blue-600 hover:underline ${selectedLink === link.text ? 'font-bold' : ''}`}
                >
                  {link.text}
                </a>
                {showHints && (
                  <div
                    onClick={() => handleHintClick(link.text)}
                    className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-1 rounded cursor-pointer font-bold"
                  >
                    {link.hint}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        
        {selectedLink && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
            Selected: <strong>{selectedLink}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

// 11. Arrow-key Grid Navigation
const ArrowKeyGrid = () => {
  const [focusedCell, setFocusedCell] = useState({ row: 1, col: 1 });
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      focusedCell,
      focused
    };
  }, [focusedCell, focused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { row, col } = focusedCell;
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedCell({ row: Math.max(0, row - 1), col });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedCell({ row: Math.min(2, row + 1), col });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedCell({ row, col: Math.max(0, col - 1) });
        break;
      case 'ArrowRight':
        e.preventDefault();
        setFocusedCell({ row, col: Math.min(3, col + 1) });
        break;
    }
  };

  return (
    <div>
      <div
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        className={`inline-block outline-none ${focused ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="grid grid-cols-4 gap-1 border rounded-md p-2">
          {Array.from({length: 12}, (_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const isFocused = focusedCell.row === row && focusedCell.col === col;
            return (
              <div
                key={i}
                className={`w-12 h-12 border rounded flex items-center justify-center text-sm ${
                  isFocused ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                {row + 1},{col + 1}
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {focused ? 'Use arrow keys to navigate' : 'Click to focus, then use arrow keys'}
      </div>
    </div>
  );
};

// 12. Escape-to-cancel Shortcuts
const EscapeToCancel = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [text] = useState('Original text');
  const [tempText, setTempText] = useState('');
  const [hasEscapedModal, setHasEscapedModal] = useState(false);
  const [hasEscapedEdit, setHasEscapedEdit] = useState(false);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      modalOpen,
      editMode,
      text,
      tempText,
      hasEscapedModal,
      hasEscapedEdit
    };
  }, [modalOpen, editMode, text, tempText, hasEscapedModal, hasEscapedEdit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (modalOpen) {
        setModalOpen(false);
        setHasEscapedModal(true);
      } else if (editMode) {
        setEditMode(false);
        setTempText('');
        setHasEscapedEdit(true);
      }
    }
  };

  const openModal = () => {
    setModalOpen(true);
    setEditMode(false);
  };

  const startEdit = () => {
    setEditMode(true);
    setTempText(text);
    setModalOpen(false);
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0} className="outline-none">
      
      <div className="space-x-2">
        <button onClick={openModal} className="px-3 py-2 bg-blue-500 text-white rounded text-sm">
          Open Modal
        </button>
        <button onClick={startEdit} className="px-3 py-2 bg-green-500 text-white rounded text-sm">
          Edit Text
        </button>
      </div>

      {editMode && (
        <div className="mt-3 p-3 border rounded bg-yellow-50">
          <div className="text-sm font-medium mb-2">Edit Mode (Press Escape to cancel)</div>
          <input
            type="text"
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            autoFocus
          />
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium mb-4">Modal Dialog</h3>
            <p className="text-sm text-gray-600 mb-4">Press Escape to close this modal</p>
            <button
              onClick={() => setModalOpen(false)}
              className="px-3 py-2 bg-gray-500 text-white rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
        Current text: <strong>{text}</strong>
      </div>
    </div>
  );
};

// 13. In-page Anchor Links
const InPageAnchors = () => {
  const [clickedAnchor, setClickedAnchor] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      clickedAnchor
    };
  }, [clickedAnchor]);

  const scrollToSection = (sectionId: string) => {
    setClickedAnchor(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      <div className="border rounded-md">
        <div className="p-3 border-b bg-gray-50">
          <nav className="flex space-x-4">
            <a
              href="#section-1"
              onClick={(e) => { e.preventDefault(); scrollToSection('section-1'); }}
              className="text-blue-600 hover:underline text-sm"
            >
              Section 1
            </a>
            <a
              href="#section-2"
              onClick={(e) => { e.preventDefault(); scrollToSection('section-2'); }}
              className="text-blue-600 hover:underline text-sm"
            >
              Section 2
            </a>
            <a
              href="#section-3"
              onClick={(e) => { e.preventDefault(); scrollToSection('section-3'); }}
              className="text-blue-600 hover:underline text-sm"
            >
              Section 3
            </a>
          </nav>
        </div>
        
        <div className="h-48 overflow-y-auto p-3 space-y-6">
          <div id="section-1">
            <h3 className="font-medium text-sm mb-2">Section 1</h3>
            <p className="text-sm text-gray-600">This is the first section with some content.</p>
          </div>
          
          <div id="section-2">
            <h3 className="font-medium text-sm mb-2">Section 2</h3>
            <p className="text-sm text-gray-600">This is the second section - clicking this anchor triggers success!</p>
          </div>
          
          <div id="section-3">
            <h3 className="font-medium text-sm mb-2">Section 3</h3>
            <p className="text-sm text-gray-600">This is the third section with more content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 14. Scroll-spy Table of Contents
const ScrollSpyTOC = () => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      activeSection
    };
  }, [activeSection]);

  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'methodology', title: 'Methodology' },
    { id: 'results', title: 'Results' },
    { id: 'conclusion', title: 'Conclusion' }
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    
    // Simple scroll spy logic
    if (scrollTop < 100) setActiveSection('introduction');
    else if (scrollTop < 200) setActiveSection('methodology');
    else if (scrollTop < 300) setActiveSection('results');
    else setActiveSection('conclusion');
  };

  return (
    <div>
      <div className="flex border rounded-md overflow-hidden">
        <div className="w-40 bg-gray-50 border-r">
          <div className="p-2">
            <h4 className="text-xs font-medium mb-2">Contents</h4>
            {sections.map(section => (
              <div
                key={section.id}
                className={`text-xs py-1 px-2 rounded cursor-pointer ${
                  activeSection === section.id ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.title}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 h-48 overflow-y-auto p-3" onScroll={handleScroll}>
          <div className="space-y-16">
            <div id="introduction">
              <h3 className="font-medium text-sm mb-2">Introduction</h3>
              <p className="text-sm text-gray-600">
                This is the introduction section with important background information.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
            
            <div id="methodology">
              <h3 className="font-medium text-sm mb-2">Methodology</h3>
              <p className="text-sm text-gray-600">
                Our methodology section describes the approach we took.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            
            <div id="results">
              <h3 className="font-medium text-sm mb-2">Results</h3>
              <p className="text-sm text-gray-600">
                The results section presents our findings.
                Ut enim ad minim veniam, quis nostrud exercitation.
              </p>
            </div>
            
            <div id="conclusion">
              <h3 className="font-medium text-sm mb-2">Conclusion</h3>
              <p className="text-sm text-gray-600">
                In conclusion, we found several interesting patterns.
                Duis aute irure dolor in reprehenderit in voluptate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 15. Back to Top Button
const BackToTopButton = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [hasScrolledDown, setHasScrolledDown] = useState(false);
  const [usedButton, setUsedButton] = useState(false);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      scrollPosition,
      showButton,
      hasScrolledDown,
      usedButton
    };
  }, [scrollPosition, showButton, hasScrolledDown, usedButton]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollPosition(scrollTop);
    setShowButton(scrollTop > 100);
    if (scrollTop > 100) {
      setHasScrolledDown(true);
    }
  };

  const scrollToTop = () => {
    const container = document.getElementById('scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      setUsedButton(true);
    }
  };

  return (
    <div>
      <div className="relative">
        <div 
          id="scroll-container"
          className="h-48 overflow-y-auto border rounded-md p-3"
          onScroll={handleScroll}
        >
          <div className="space-y-4">
            {Array.from({length: 30}, (_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded text-sm">
                Content block {i + 1} - Keep scrolling to see the back to top button
              </div>
            ))}
          </div>
        </div>
        
        {showButton && (
          <button
            onClick={scrollToTop}
            className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
        
        <div className="text-xs text-gray-500 mt-1">
          Scroll position: {scrollPosition}px
        </div>
      </div>
    </div>
  );
};

// 16. Footnote Reference Hops
const FootnoteHops = () => {
  const [selectedFootnote, setSelectedFootnote] = useState('');
  const [returnedFromFootnote, setReturnedFromFootnote] = useState(false);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedFootnote,
      returnedFromFootnote
    };
  }, [selectedFootnote, returnedFromFootnote]);

  const goToFootnote = (footnoteId: string) => {
    setSelectedFootnote(footnoteId);
    setReturnedFromFootnote(false);
  };

  const returnToText = () => {
    setReturnedFromFootnote(true);
  };

  return (
    <div>
      <div className="border rounded-md p-4 space-y-4">
        <div className="text-sm">
          <p>
            This is a research paper with important findings
            <a
              href="#footnote-1"
              onClick={(e) => { e.preventDefault(); goToFootnote('footnote-1'); }}
              className="text-blue-600 hover:underline text-xs align-super"
            >
              [1]
            </a>
            {' '}and additional context
            <a
              href="#footnote-2"
              onClick={(e) => { e.preventDefault(); goToFootnote('footnote-2'); }}
              className="text-blue-600 hover:underline text-xs align-super"
            >
              [2]
            </a>
            {' '}that supports our conclusions.
          </p>
        </div>
        
        <hr className="border-gray-300" />
        
        <div className="text-xs space-y-2">
          <h4 className="font-medium">Footnotes:</h4>
          <div id="footnote-1" className={`${selectedFootnote === 'footnote-1' ? 'bg-yellow-100' : ''} p-1 rounded`}>
            <strong>[1]</strong> Smith, J. (2023). Research methodology handbook.
            <button
              onClick={returnToText}
              className="ml-2 text-blue-600 hover:underline"
            >
              ↵ Return to text
            </button>
          </div>
          <div id="footnote-2" className={`${selectedFootnote === 'footnote-2' ? 'bg-yellow-100' : ''} p-1 rounded`}>
            <strong>[2]</strong> Johnson, A. (2023). Statistical analysis in modern research.
            <button
              onClick={returnToText}
              className="ml-2 text-blue-600 hover:underline"
            >
              ↵ Return to text
            </button>
          </div>
        </div>
        
        {selectedFootnote && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Currently viewing: <strong>{selectedFootnote}</strong>
            {returnedFromFootnote && ' (returned to text)'}
          </div>
        )}
      </div>
    </div>
  );
};

// Task data
const tasks = [
  { 
    id: 1, 
    name: 'Click-drag Pan with Inertia', 
    component: ClickDragPan,
    task: 'Drag the map to move it significantly',
    ux: 'Click-drag pan with smooth movement',
    test: () => {
      const appState = (window as any).app_state;
      const success = Math.abs(appState?.position?.x || 0) > 50 || Math.abs(appState?.position?.y || 0) > 50;
      return { success };
    }
  },
  { 
    id: 2, 
    name: 'Mouse-wheel Zoom', 
    component: MouseWheelZoom,
    task: 'Zoom in using mouse wheel until 2x or higher',
    ux: 'Mouse-wheel zoom controls',
    test: () => {
      const appState = (window as any).app_state;
      const success = (appState?.zoom || 0) >= 2;
      return { success };
    }
  },
  { 
    id: 3, 
    name: 'Marker Clustering', 
    component: MarkerClustering,
    task: 'Zoom in to expand clusters using the zoom buttons, then click a marker from the largest cluster (5 markers)',
    ux: 'Clustering that expands on zoom',
    test: () => {
      const appState = (window as any).app_state;
      const zoomLevel = appState?.zoomLevel || 0;
      const selectedCluster = appState?.selectedCluster !== undefined ? appState.selectedCluster : -1;
      const success = zoomLevel >= 2 && selectedCluster === 0;
      return { success };
    }
  },
  { 
    id: 4, 
    name: 'Pitch-locked 2.5D View', 
    component: PitchLocked2D,
    task: 'Rotate the view clockwise more than 45 degrees (pitch is locked)',
    ux: '2.5D view with rotation but locked pitch',
    test: () => {
      const appState = (window as any).app_state;
      const success = (appState?.rotation || 0) > 45;
      return { success };
    }
  },
  { 
    id: 5, 
    name: 'Global Query Bar', 
    component: GlobalQueryBar,
    task: 'Search for "react" and select "React Components"',
    ux: 'Global search with type-ahead results',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedResult === 'React Components';
      return { success };
    }
  },
  { 
    id: 6, 
    name: 'Faceted Sidebar Filter', 
    component: FacetedSidebar,
    task: 'Filter by "Electronics" category and select "Laptop"',
    ux: 'Faceted sidebar with live filtering',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.filters?.category === 'Electronics' && appState?.selectedItem === 'Laptop';
      return { success };
    }
  },
  { 
    id: 7, 
    name: 'Contextual In-list Search', 
    component: ContextualInListSearch,
    task: 'Search for "jack" and select "Jack Davis"',
    ux: 'In-list incremental search',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedContact === 'Jack Davis';
      return { success };
    }
  },
  { 
    id: 8, 
    name: 'Command Palette', 
    component: CommandPalette,
    task: 'Open command palette (Ctrl+K) and select "Create New File"',
    ux: 'Fuzzy search command palette',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedCommand === 'Create New File';
      return { success };
    }
  },
  { 
    id: 9, 
    name: 'Single-key Scroll Accelerators', 
    component: SingleKeyScroll,
    task: 'Focus the area and use J/K keys to scroll down until you reveal "Content item 9"',
    ux: 'Single-key scroll accelerators (J/K)',
    test: () => {
      const appState = (window as any).app_state;
      const success = (appState?.scrollPosition || 0) >= 400;
      return { success };
    }
  },
  { 
    id: 10, 
    name: 'Link-hint Overlays', 
    component: LinkHintOverlay,
    task: 'Press "Show Hints" then click hint "45" to select About',
    ux: 'Link-hint overlays for keyboard navigation',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedLink === 'About';
      return { success };
    }
  },
  { 
    id: 11, 
    name: 'Arrow-key Grid Navigation', 
    component: ArrowKeyGrid,
    task: 'Focus grid and use arrow keys to navigate to cell (3,4)',
    ux: 'Arrow-key grid navigation with roving focus',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.focusedCell?.row === 2 && appState?.focusedCell?.col === 3;
      return { success };
    }
  },
  { 
    id: 12, 
    name: 'Escape-to-cancel Shortcuts', 
    component: EscapeToCancel,
    task: 'Open modal and press Escape to close, then open edit mode and press Escape to cancel',
    ux: 'Escape-to-cancel shortcuts',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.hasEscapedModal && appState?.hasEscapedEdit && appState?.modalOpen === false && appState?.editMode === false;
      return { success };
    }
  },
  { 
    id: 13, 
    name: 'In-page Anchor Links', 
    component: InPageAnchors,
    task: 'Click "Section 2" anchor link to jump to that section',
    ux: 'In-page anchor links with smooth scrolling',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.clickedAnchor === 'section-2';
      return { success };
    }
  },
  { 
    id: 14, 
    name: 'Scroll-spy Table of Contents', 
    component: ScrollSpyTOC,
    task: 'Scroll until "Methodology" is active in the table of contents',
    ux: 'Scroll-spy TOC that tracks reading position',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.activeSection === 'methodology';
      return { success };
    }
  },
  { 
    id: 15, 
    name: 'Back to Top Button', 
    component: BackToTopButton,
    task: 'Scroll down, then use "Back to Top" button to return',
    ux: 'Back to top button appears after scrolling',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.hasScrolledDown && appState?.usedButton && (appState?.scrollPosition || 0) < 50;
      return { success };
    }
  },
  { 
    id: 16, 
    name: 'Footnote Reference Hops', 
    component: FootnoteHops,
    task: 'Click footnote [2], then click "Return to text"',
    ux: 'Footnote ↔ reference bidirectional hops',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedFootnote === 'footnote-2' && appState?.returnedFromFootnote;
      return { success };
    }
  }
];

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Navigation Patterns: Search & Interaction', appPath: '/navigation-search-interaction' };

// Main App using TaskWrapper
export default function App() {
  return (
    <TaskWrapper 
      tasks={tasks}
      appName="Navigation Patterns: Search & Interaction"
      appPath="/navigation-search-interaction"
    />
  );
}