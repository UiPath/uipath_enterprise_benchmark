import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter, MoreHorizontal, ChevronDown, ChevronRight, User, Calendar, Tag, AlertTriangle, X, Code, GitBranch, GitCommit, ExternalLink, Check, Edit2, Trash2, Copy, ArrowUp, ArrowDown, Minus } from 'lucide-react';

// Seeded random number generator for deterministic results
let seed = 12345; // Fixed seed for consistent results
const seededRandom = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

// Move CreateTaskModal outside to prevent re-creation on every render
const CreateTaskModal = ({ 
  showCreateModal, 
  setShowCreateModal, 
  newTask, 
  setNewTask, 
  formErrors, 
  assignees, 
  createTask, 
  loading 
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-96 max-w-90vw max-h-90vh overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Create New Task</h2>
        <button onClick={() => setShowCreateModal(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input 
            type="text" 
            className={`w-full border rounded px-3 py-2 ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter task title" 
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
          />
          {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea 
            className={`w-full border rounded px-3 py-2 h-20 ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter description"
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
          />
          {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select 
              className={`w-full border rounded px-3 py-2 ${formErrors.type ? 'border-red-500' : 'border-gray-300'}`}
              value={newTask.type}
              onChange={(e) => setNewTask({...newTask, type: e.target.value})}
            >
              <option value="" disabled>Select type</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
            </select>
            {formErrors.type && <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority *</label>
            <select 
              className={`w-full border rounded px-3 py-2 ${formErrors.priority ? 'border-red-500' : 'border-gray-300'}`}
              value={newTask.priority}
              onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
            >
              <option value="" disabled>Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {formErrors.priority && <p className="text-red-500 text-xs mt-1">{formErrors.priority}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Assignee</label>
          <select 
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={newTask.assignee}
            onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
          >
            <option value="">Unassigned</option>
            {assignees.map(assignee => (
              <option key={assignee.id} value={assignee.id}>{assignee.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estimate</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g., 3d, 1w"
              value={newTask.estimate}
              onChange={(e) => setNewTask({...newTask, estimate: e.target.value})}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={createTask}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
        <button 
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => setShowCreateModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const ProjectApp = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters
  const [currentView, setCurrentView] = useState(searchParams.get('view') || 'kanban');
  const [selectedProject, setSelectedProject] = useState(searchParams.get('project') || 'ComputerVision');
  const [selectedTask, setSelectedTask] = useState(searchParams.get('task') || null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('create') === 'true');
  const [expandedProjects, setExpandedProjects] = useState(new Set(['ML']));
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('created');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    type: 'all'
  });
  const [editingField, setEditingField] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [mouseDownTime, setMouseDownTime] = useState(null);
  const isDraggingRef = useRef(false);
  const lastClickTimesRef = useRef(new Map()); // Track last click time for each task
  
  // Track operations for testing
  const [operationHistory, setOperationHistory] = useState([]);
  
  const draggedItem = useRef(null);
  const contextMenuRef = useRef(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    onConfirm: null
  });

  // Modal helper function
  const showModalAlert = (title, message, onConfirm = null) => {
    setModalContent({ title, message, onConfirm });
    setShowModal(true);
  };

  // Enhanced task data with proper state management
  const [tasks, setTasks] = useState([
    {
      id: 'ML-2438',
      title: 'Check inference speed for qa-screen endpoint',
      type: 'task',
      status: 'todo',
      assignee: { name: 'Elena Rodriguez', avatar: 'ER', id: 'elena' },
      priority: 'medium',
      created: '2024-01-15',
      updated: '2024-01-20',
      description: 'The UIA team has observed increased inference times in Alpha following the migration to Gemini 2.5-Flash.',
      project: 'ComputerVision',
      labels: ['performance', 'gemini'],
      dueDate: '2024-02-01',
      estimate: '3d',
      branch: null,
      commits: []
    },
    {
      id: 'ML-2445',
      title: 'Fix the current usage of thinking tokens for gemini2.5-flash and re-evaluate the models with a fixed thinking budget',
      type: 'task',
      status: 'progress',
      assignee: { name: 'Marcus Chen', avatar: 'MC', id: 'marcus' },
      priority: 'high',
      created: '2024-01-12',
      updated: '2024-01-18',
      project: 'ComputerVision',
      labels: ['critical', 'gemini'],
      dueDate: '2024-01-25',
      estimate: '5d',
      branch: 'feature/thinking-tokens-fix',
      commits: ['abc123: Initial token budget implementation']
    },
    {
      id: 'ML-2442',
      title: 'ST model returns empty response when given an ambiguous description',
      type: 'bug',
      status: 'todo',
      assignee: { name: 'Sarah Kim', avatar: 'SK', id: 'sarah' },
      priority: 'high',
      created: '2024-01-10',
      updated: '2024-01-16',
      project: 'ComputerVision',
      labels: ['bug', 'model'],
      dueDate: '2024-01-30',
      estimate: '2d',
      branch: null,
      commits: []
    },
    {
      id: 'ML-2443',
      title: 'Build a simple web tool to compare two models for the semantic endpoints',
      type: 'task',
      status: 'todo',
      assignee: { name: 'David Wilson', avatar: 'DW', id: 'david' },
      priority: 'medium',
      created: '2024-01-08',
      updated: '2024-01-14',
      project: 'ComputerVision',
      labels: ['tooling', 'comparison'],
      dueDate: null,
      estimate: '1w',
      branch: null,
      commits: []
    },
    {
      id: 'ML-2439',
      title: 'Migrate the close-popup model to gemini2.5-flash',
      type: 'task',
      status: 'done',
      assignee: { name: 'Anna Petrov', avatar: 'AP', id: 'anna' },
      priority: 'medium',
      created: '2024-01-05',
      updated: '2024-01-12',
      project: 'ComputerVision',
      labels: ['migration', 'gemini'],
      dueDate: '2024-01-12',
      estimate: '2d',
      branch: 'feature/gemini-migration',
      commits: ['def456: Migrate popup model', 'ghi789: Update configuration']
    },
    {
      id: 'ML-2441',
      title: 'Download and visualize production data for qa-screen, qa-dom and get-element-description endpoints',
      type: 'task',
      status: 'done',
      assignee: { name: 'James Foster', avatar: 'JF', id: 'james' },
      priority: 'low',
      created: '2024-01-03',
      updated: '2024-01-10',
      project: 'ComputerVision',
      labels: ['data', 'visualization'],
      dueDate: '2024-01-10',
      estimate: '3d',
      branch: 'feature/data-visualization',
      commits: ['jkl012: Add data download script', 'mno345: Create visualization dashboard']
    },
    {
      id: 'ML-2444',
      title: 'Fix model fallback at request-time',
      type: 'bug',
      status: 'done',
      assignee: { name: 'Lisa Zhang', avatar: 'LZ', id: 'lisa' },
      priority: 'high',
      created: '2024-01-01',
      updated: '2024-01-08',
      project: 'ComputerVision',
      labels: ['bug', 'fallback'],
      dueDate: '2024-01-08',
      estimate: '1d',
      branch: 'hotfix/model-fallback',
      commits: ['pqr678: Fix fallback logic', 'stu901: Add fallback tests']
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: '',
    type: '',
    estimate: '',
    dueDate: '',
    labels: []
  });

  // This useEffect hook will run whenever the 'tasks' state changes.
  useEffect(() => {
    // We make a copy and assign it to the global window object.
    window.app_state = {
      tasks: JSON.parse(JSON.stringify(tasks)), // Deep copy to prevent mutations
      operationHistory: JSON.parse(JSON.stringify(operationHistory)), // Track operations
      currentView: currentView, // Track current view mode
      filters: JSON.parse(JSON.stringify(filters)) // Track current filters
    };
    // console.log('Kanban state updated on window.app_state');
  }, [tasks, operationHistory, currentView, filters]); // The [tasks] part tells React to only run this code when 'tasks' changes.

  const [formErrors, setFormErrors] = useState({});

  const projects = {
    'ML': {
      name: 'ML',
      children: ['Computer Use', 'ComputerVision', 'Semistructured', 'DataCuration', 'Data Pipelines+Infra']
    }
  };

  const assignees = [
    { id: 'elena', name: 'Elena Rodriguez', avatar: 'ER' },
    { id: 'marcus', name: 'Marcus Chen', avatar: 'MC' },
    { id: 'sarah', name: 'Sarah Kim', avatar: 'SK' },
    { id: 'david', name: 'David Wilson', avatar: 'DW' },
    { id: 'anna', name: 'Anna Petrov', avatar: 'AP' },
    { id: 'james', name: 'James Foster', avatar: 'JF' },
    { id: 'lisa', name: 'Lisa Zhang', avatar: 'LZ' }
  ];

  // Function to update URL parameters
  const updateURLParams = useCallback((updates) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || value === false) {
          newParams.delete(key);
        } else {
          newParams.set(key, value.toString());
        }
      });
      
      return newParams;
    });
  }, [setSearchParams]);

  // Sync state changes with URL
  useEffect(() => {
    updateURLParams({
      view: currentView !== 'kanban' ? currentView : null,
      project: selectedProject !== 'ComputerVision' ? selectedProject : null,
      task: selectedTask,
      search: searchQuery,
      create: showCreateModal || null
    });
  }, [currentView, selectedProject, selectedTask, searchQuery, showCreateModal, updateURLParams]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.querySelector('input[placeholder="Search board"]')?.focus();
            break;
          case 'n':
            e.preventDefault();
            setShowCreateModal(true);
            break;
          case 'Escape':
            setSelectedTask(null);
            setContextMenu(null);
            setShowCreateModal(false);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close context menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Advanced filtering and sorting
  const getFilteredAndSortedTasks = useCallback(() => {
    let filtered = tasks.filter(task => {
      if (task.project !== selectedProject) return false;
      
      // Text search
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !task.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      
      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      
      // Assignee filter
      if (filters.assignee !== 'all' && task.assignee.id !== filters.assignee) return false;
      
      // Type filter
      if (filters.type !== 'all' && task.type !== filters.type) return false;
      
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'assignee') {
        aVal = a.assignee.name;
        bVal = b.assignee.name;
      }
      
      if (sortField === 'created' || sortField === 'updated') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, selectedProject, searchQuery, filters, sortField, sortDirection]);

  const filteredTasks = getFilteredAndSortedTasks();

  // CRUD Operations
  const createTask = () => {
    // Validation
    const errors = {};
    if (!newTask.title.trim()) errors.title = 'Title is required';
    if (!newTask.description.trim()) errors.description = 'Description is required';
    if (!newTask.type) errors.type = 'Type is required';
    if (!newTask.priority) errors.priority = 'Priority is required';
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const assignee = assignees.find(a => a.id === newTask.assignee);
      const task = {
        id: `ML-${Math.floor(seededRandom() * 10000)}`,
        title: newTask.title,
        description: newTask.description,
        type: newTask.type,
        status: 'todo',
        assignee,
        priority: newTask.priority,
        created: new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().split('T')[0],
        project: selectedProject,
        labels: newTask.labels,
        dueDate: newTask.dueDate || null,
        estimate: newTask.estimate,
        branch: null,
        commits: []
      };
      
      setTasks(prev => [...prev, task]);
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        priority: '',
        type: '',
        estimate: '',
        dueDate: '',
        labels: []
      });
      setFormErrors({});
      setShowCreateModal(false);
      setLoading(false);
    }, 500);
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updated: new Date().toISOString().split('T')[0] }
        : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setSelectedTask(null);
  };

  const duplicateTask = (task) => {
    const newTask = {
      ...task,
      id: `ML-${Math.floor(seededRandom() * 10000)}`,
      title: `${task.title} (Copy)`,
      status: 'todo',
      created: new Date().toISOString().split('T')[0],
      updated: new Date().toISOString().split('T')[0],
      branch: null,
      commits: []
    };
    setTasks(prev => [...prev, newTask]);
  };

  // Bulk operations
  const bulkUpdateStatus = (status) => {
    const taskIds = Array.from(selectedTasks);
    
    // Record bulk operation
    setOperationHistory(prev => [...prev, {
      type: 'bulk_update',
      taskIds: taskIds,
      toStatus: status,
      view: currentView,
      filters: JSON.parse(JSON.stringify(filters)),
      timestamp: Date.now()
    }]);
    
    taskIds.forEach(taskId => {
      updateTask(taskId, { status });
    });
    setSelectedTasks(new Set());
  };

  const bulkDelete = () => {
    setTasks(prev => prev.filter(task => !selectedTasks.has(task.id)));
    setSelectedTasks(new Set());
  };

  // Development actions
  const createBranch = (task) => {
    const branchName = `feature/${task.id.toLowerCase()}-${task.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}`;
    updateTask(task.id, { branch: branchName });
    // Show success modal
    showModalAlert(
      'Branch Created',
      `Successfully created branch: ${branchName}`,
      null
    );
  };

  const createCommit = (task) => {
    const commitMsg = `${task.id}: ${task.title.slice(0, 50)}`;
    const commitHash = seededRandom().toString(36).substr(2, 6);
    const newCommit = `${commitHash}: ${commitMsg}`;
    updateTask(task.id, { 
      commits: [...(task.commits || []), newCommit]
    });
    console.log(`Created commit: ${newCommit}`);
  };

  const openWithVSCode = (task) => {
    // Simulate opening VS Code
    console.log(`Opening ${task.id} in VS Code`);
    window.open(`vscode://file/${task.project}/${task.id}`, '_blank');
  };

  // Drag and drop with visual feedback
  const handleDragStart = (e, task) => {
    // Set drag data immediately without any state changes
    isDraggingRef.current = true;
    draggedItem.current = task;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    
    // Apply visual feedback via direct DOM manipulation instead of React state
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    // Clean up drag state regardless of whether drop was successful
    draggedItem.current = null;
    
    // Restore visual state via direct DOM manipulation
    e.target.style.opacity = '1';
    
    // Clean up React state that doesn't interfere with drag
    setDragOverColumn(null);
    
    // Reset dragging state after a brief delay to prevent click interference
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedItem.current && draggedItem.current.status !== newStatus) {
      const taskId = draggedItem.current.id;
      const oldStatus = draggedItem.current.status;
      
      // Record drag and drop operation
      setOperationHistory(prev => [...prev, {
        type: 'drag_drop',
        taskId: taskId,
        fromStatus: oldStatus,
        toStatus: newStatus,
        timestamp: Date.now()
      }]);
      
      updateTask(taskId, { status: newStatus });
    }
    
    // Clean up drag state
    draggedItem.current = null;
    
    // Reset dragging state after a brief delay to prevent click interference
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  // Context menu
  const handleContextMenu = (e, task) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      task
    });
  };

  // Sorting
  const handleSort = (field) => {
    const newDirection = sortField === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    
    // Record sorting operation
    setOperationHistory(prev => [...prev, {
      type: 'sort',
      field: field,
      direction: newDirection,
      view: currentView,
      timestamp: Date.now()
    }]);
    
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Project expansion toggle
  const toggleProject = (projectKey) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectKey)) {
        newSet.delete(projectKey);
      } else {
        newSet.add(projectKey);
      }
      return newSet;
    });
  };

  // UI Helper Components
  const getStatusBadge = (status) => {
    const badges = {
      'todo': 'bg-gray-100 text-gray-700',
      'progress': 'bg-blue-100 text-blue-700',
      'done': 'bg-green-100 text-green-700'
    };
    const labels = {
      'todo': 'TO DO',
      'progress': 'IN PROGRESS', 
      'done': 'CLOSED'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'high': <AlertTriangle className="w-4 h-4 text-red-500" />,
      'medium': <Minus className="w-4 h-4 text-yellow-500" />,
      'low': <ArrowDown className="w-4 h-4 text-green-500" />
    };
    return icons[priority] || null;
  };

  const getTypeIcon = (type) => {
    return type === 'bug' ? 
      <div className="w-3 h-3 bg-red-500 transform rotate-45"></div> :
      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
  };

  const SortableHeader = ({ field, children }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ArrowUp className="w-3 h-3" /> : 
            <ArrowDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  const handleTaskMouseDown = (e, task) => {
    const time = Date.now();
    setMouseDownTime(time);
  };

  // Parent-level double-click detection
  const handleTaskCardMouseDown = (e, task) => {
    const now = Date.now();
    const lastTime = lastClickTimesRef.current.get(task.id) || 0;
    const timeSinceLastClick = now - lastTime;
    
    // Update the time immediately
    lastClickTimesRef.current.set(task.id, now);
    
    // Check if this is a double-click (within 400ms of previous mousedown)
    if (timeSinceLastClick < 400 && timeSinceLastClick > 50 && lastTime > 0) {
      // This is a double-click - prevent drag and open detail panel
      e.preventDefault();
      e.stopPropagation();
      
      // Open task detail panel for editing
      setSelectedTask(task.id);
      
      // Reset to prevent triple-click issues
      lastClickTimesRef.current.set(task.id, 0);
      return true; // Indicate double-click was handled
    }
    
    return false; // Not a double-click
  };

  const handleTaskClick = (e, task) => {
    // Don't handle click if we're in the middle of a drag operation
    if (isDraggingRef.current) {
      e.preventDefault();
      return;
    }
    
    // If this was a quick click (not a drag attempt), handle it
    const clickDuration = Date.now() - (mouseDownTime || 0);
    if (clickDuration < 200) { // 200ms threshold for distinguishing click vs drag
      setSelectedTask(task.id);
    }
  };

  const TaskCard = ({ task, isDraggable = false }) => {
    const handleCardDragStart = (e) => {
      if (!isDraggable) {
        e.preventDefault();
        return;
      }
      handleDragStart(e, task);
    };

    const handleCardDragEnd = (e) => {
      if (!isDraggable) return;
      handleDragEnd(e);
    };

    const handleMouseDown = (e) => {
      // Use parent-level double-click detection
      const isDoubleClick = handleTaskCardMouseDown(e, task);
      
      // If it was a double-click, don't proceed with drag logic
      if (isDoubleClick) {
        return;
      }
      
      // Only call the original mouse down handler if this is not a double-click and we're draggable
      if (isDraggable && !e.defaultPrevented) {
        handleTaskMouseDown(e, task);
      }
    };

    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${
          isDraggable ? 'cursor-move' : ''
        }`}
        draggable={isDraggable}
        onMouseDown={handleMouseDown}
        onDragStart={handleCardDragStart}
        onDragEnd={handleCardDragEnd}
        onContextMenu={(e) => handleContextMenu(e, task)}
      >
      <div className="flex items-center gap-2 mb-2">
        {getTypeIcon(task.type)}
        <span className="text-sm font-medium text-blue-600">{task.id}</span>
        {task.branch && (
          <GitBranch className="w-3 h-3 text-green-500" title={`Branch: ${task.branch}`} />
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
              {task.assignee.avatar}
            </div>
          )}
          {task.labels && task.labels.length > 0 && (
            <div className="flex gap-1">
              {task.labels.slice(0, 2).map(label => (
                <span key={label} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {task.dueDate && (
            <Calendar className="w-3 h-3 text-gray-400" />
          )}
          {getPriorityIcon(task.priority)}
        </div>
      </div>
    </div>
    );
  };

  const FilterDropdown = ({ type, value, onChange, options }) => (
    <select 
      className="text-sm border border-gray-300 rounded px-2 py-1"
      value={value}
      onChange={(e) => onChange(type, e.target.value)}
    >
      <option value="all">All {type}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const ContextMenu = ({ menu }) => (
    <div 
      ref={contextMenuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
      style={{ left: menu.x, top: menu.y }}
    >
      <button 
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        onClick={() => {
          setSelectedTask(menu.task.id);
          setContextMenu(null);
        }}
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </button>
      <button 
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        onClick={() => {
          duplicateTask(menu.task);
          setContextMenu(null);
        }}
      >
        <Copy className="w-4 h-4" />
        Duplicate
      </button>
      <button 
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        onClick={() => {
          createBranch(menu.task);
          setContextMenu(null);
        }}
      >
        <GitBranch className="w-4 h-4" />
        Create Branch
      </button>
      <div className="border-t border-gray-100 my-1"></div>
      <button 
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
        onClick={() => {
          deleteTask(menu.task.id);
          setContextMenu(null);
        }}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );



  const EditableField = ({ value, onSave, type = 'text', options = null }) => {
    const [editValue, setEditValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
      onSave(editValue);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(value);
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          {type === 'select' ? (
            <select 
              value={editValue} 
              onChange={(e) => setEditValue(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              autoFocus
            />
          )}
          <button onClick={handleSave} className="text-green-600 hover:text-green-800">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group">
        <span>{value || 'None'}</span>
        <button 
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const DetailPanel = ({ task, onClose }) => (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-40 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {getTypeIcon(task.type)}
            <span className="font-medium text-blue-600">{task.id}</span>
            {task.branch && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                {task.branch}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <EditableField
            value={task.title}
            onSave={(newTitle) => updateTask(task.id, { title: newTitle })}
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <EditableField
              value={task.description}
              onSave={(newDesc) => updateTask(task.id, { description: newDesc })}
              type="textarea"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <EditableField
              value={task.status}
              onSave={(newStatus) => updateTask(task.id, { status: newStatus })}
              type="select"
              options={[
                { value: 'todo', label: 'To Do' },
                { value: 'progress', label: 'In Progress' },
                { value: 'done', label: 'Done' }
              ]}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Assignee</span>
            </div>
            <div className="ml-6">
              <EditableField
                value={task.assignee?.id || ''}
                onSave={(newAssigneeId) => {
                  const assignee = assignees.find(a => a.id === newAssigneeId);
                  updateTask(task.id, { assignee });
                }}
                type="select"
                options={assignees.map(a => ({ value: a.id, label: a.name }))}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Priority</span>
            </div>
            <div className="ml-6">
              <EditableField
                value={task.priority}
                onSave={(newPriority) => updateTask(task.id, { priority: newPriority })}
                type="select"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' }
                ]}
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-3">Development</div>
            <div className="space-y-2">
              <button 
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => openWithVSCode(task)}
              >
                <ExternalLink className="w-4 h-4" />
                Open with VS Code
              </button>
              <button 
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => createBranch(task)}
                disabled={!!task.branch}
              >
                <GitBranch className="w-4 h-4" />
                {task.branch ? `Branch: ${task.branch}` : 'Create branch'}
              </button>
              <button 
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => createCommit(task)}
                disabled={!task.branch}
              >
                <GitCommit className="w-4 h-4" />
                Create commit
              </button>
            </div>
            
            {task.commits && task.commits.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Recent Commits</div>
                <div className="space-y-1">
                  {task.commits.slice(-3).map((commit, idx) => (
                    <div key={idx} className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                      {commit}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Due date</span>
              <EditableField
                value={task.dueDate}
                onSave={(newDate) => updateTask(task.id, { dueDate: newDate })}
                type="date"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimate</span>
              <EditableField
                value={task.estimate}
                onSave={(newEst) => updateTask(task.id, { estimate: newEst })}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Labels</span>
              <span>{task.labels?.join(', ') || 'None'}</span>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">UP</span>
            </div>
            <span className="font-semibold">Bridgepoint Financial</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">For you</div>
            <div className="space-y-1">
              <div className="text-sm px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">Recent</div>
              <div className="text-sm px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">Starred</div>
              <div className="text-sm px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">Apps</div>
              <div className="text-sm px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">Roadmaps</div>
              <div className="text-sm px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">Plans</div>
            </div>
          </div>
          
          <div className="p-2 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">Projects</div>
            <div className="space-y-1">
              {Object.entries(projects).map(([key, project]) => (
                <div key={key}>
                  <div 
                    className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => toggleProject(key)}
                  >
                    {expandedProjects.has(key) ? 
                      <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    }
                    <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                    <span className="text-sm font-medium">{project.name}</span>
                  </div>
                  {expandedProjects.has(key) && (
                    <div className="ml-6 space-y-1">
                      {project.children.map(child => (
                        <div 
                          key={child}
                          className={`px-2 py-1 text-sm cursor-pointer rounded ${
                            selectedProject === child ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setSelectedProject(child)}
                        >
                          {child}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">{selectedProject}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredTasks.length} tasks
              </span>
              <button className="p-2 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-100 rounded-lg">
                  <button
                    className={`px-3 py-1 text-sm rounded-lg ${
                      currentView === 'kanban' ? 'bg-white shadow-sm' : ''
                    }`}
                    onClick={() => setCurrentView('kanban')}
                  >
                    Kanban board
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-lg ${
                      currentView === 'list' ? 'bg-white shadow-sm' : ''
                    }`}
                    onClick={() => setCurrentView('list')}
                  >
                    List
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search board (⌘K)"
                      className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FilterDropdown
                      type="status"
                      value={filters.status}
                      onChange={(type, value) => setFilters({...filters, [type]: value})}
                      options={[
                        { value: 'todo', label: 'To Do' },
                        { value: 'progress', label: 'In Progress' },
                        { value: 'done', label: 'Done' }
                      ]}
                    />
                    <FilterDropdown
                      type="priority"
                      value={filters.priority}
                      onChange={(type, value) => setFilters({...filters, [type]: value})}
                      options={[
                        { value: 'high', label: 'High' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'low', label: 'Low' }
                      ]}
                    />
                    <FilterDropdown
                      type="assignee"
                      value={filters.assignee}
                      onChange={(type, value) => setFilters({...filters, [type]: value})}
                      options={assignees.map(a => ({ value: a.id, label: a.name }))}
                    />
                  </div>
                </div>
              </div>
              
              <button 
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 whitespace-nowrap shrink-0"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4" />
                Create (⌘N)
              </button>
            </div>
            
            {selectedTasks.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">{selectedTasks.size} selected</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => bulkUpdateStatus('progress')}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                  >
                    Start Progress
                  </button>
                  <button
                    onClick={() => bulkUpdateStatus('done')}
                    className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors"
                  >
                    Mark Done
                  </button>
                  <button
                    onClick={bulkDelete}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'kanban' ? (
            <div className="h-full p-6">
              <div className="grid grid-cols-3 gap-6 h-full">
                {/* TO DO Column */}
                <div 
                  className={`bg-gray-50 rounded-lg p-4 transition-all ${
                    dragOverColumn === 'todo' ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, 'todo')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'todo')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium text-gray-700">TO DO</h2>
                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {filteredTasks.filter(t => t.status === 'todo').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredTasks.filter(t => t.status === 'todo').map(task => (
                      <TaskCard key={task.id} task={task} isDraggable={true} />
                    ))}
                  </div>
                </div>

                {/* IN PROGRESS Column */}
                <div 
                  className={`bg-gray-50 rounded-lg p-4 transition-all ${
                    dragOverColumn === 'progress' ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, 'progress')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'progress')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium text-gray-700">IN PROGRESS</h2>
                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {filteredTasks.filter(t => t.status === 'progress').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredTasks.filter(t => t.status === 'progress').map(task => (
                      <TaskCard key={task.id} task={task} isDraggable={true} />
                    ))}
                  </div>
                </div>

                {/* DONE Column */}
                <div 
                  className={`bg-gray-50 rounded-lg p-4 transition-all ${
                    dragOverColumn === 'done' ? 'bg-green-50 ring-2 ring-green-300' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, 'done')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'done')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium text-gray-700">DONE</h2>
                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {filteredTasks.filter(t => t.status === 'done').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredTasks.filter(t => t.status === 'done').map(task => (
                      <TaskCard key={task.id} task={task} isDraggable={true} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTasks(new Set(filteredTasks.map(t => t.id)));
                          } else {
                            setSelectedTasks(new Set());
                          }
                        }}
                      />
                    </th>
                    <SortableHeader field="type">Type</SortableHeader>
                    <SortableHeader field="id">Key</SortableHeader>
                    <SortableHeader field="title">Summary</SortableHeader>
                    <SortableHeader field="status">Status</SortableHeader>
                    <SortableHeader field="assignee">Assignee</SortableHeader>
                    <SortableHeader field="priority">Priority</SortableHeader>
                    <SortableHeader field="created">Created</SortableHeader>
                    <SortableHeader field="updated">Updated</SortableHeader>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map(task => (
                    <tr 
                      key={task.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onContextMenu={(e) => handleContextMenu(e, task)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(task.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedTasks);
                            if (e.target.checked) {
                              newSelected.add(task.id);
                            } else {
                              newSelected.delete(task.id);
                            }
                            setSelectedTasks(newSelected);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeIcon(task.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {task.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md" onClick={() => setSelectedTask(task.id)}>
                        {task.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {task.assignee ? (
                            <>
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                {task.assignee.avatar}
                              </div>
                              <span className="text-sm">{task.assignee.name}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityIcon(task.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.created}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.updated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals and Panels */}
      {showCreateModal && (
        <CreateTaskModal 
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          newTask={newTask}
          setNewTask={setNewTask}
          formErrors={formErrors}
          assignees={assignees}
          createTask={createTask}
          loading={loading}
        />
      )}
      {selectedTask && tasks.find(t => t.id === selectedTask) && (
        <DetailPanel 
          task={tasks.find(t => t.id === selectedTask)} 
          onClose={() => setSelectedTask(null)}
        />
      )}
      {contextMenu && <ContextMenu menu={contextMenu} />}
      
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{modalContent.title}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600">{modalContent.message}</p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button 
                onClick={() => {
                  setShowModal(false);
                  if (modalContent.onConfirm) {
                    modalContent.onConfirm();
                  }
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectApp;