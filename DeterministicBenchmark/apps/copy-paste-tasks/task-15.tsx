import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calendar, User } from 'lucide-react';

class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  resource: string;
  phaseId: string;
  duration: number; // in days
}

interface Phase {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  tasks: Task[];
  isExpanded: boolean;
}

interface ResourceConflict {
  resource: string;
  task1: string;
  task2: string;
  overlapPeriod: string;
  conflictType: string;
  overlapDays: number;
}

const Task15: React.FC = () => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [resourceConflicts, setResourceConflicts] = useState<ResourceConflict[]>([]);
  const [addedConflicts, setAddedConflicts] = useState<ResourceConflict[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Generate deterministic project data
  const generateProjectData = (): Phase[] => {
    const rng = new SeededRandom(12345);
    
    const resources = [
      'Alex Chen', 'Sarah Davis', 'Michael Brown', 'Emma Wilson', 'David Rodriguez',
      'Lisa Johnson', 'James Parker', 'Rachel Kim', 'Kevin Martinez', 'Amanda Taylor',
      'Chris Anderson', 'Jessica Lee', 'Ryan Thompson', 'Nicole Garcia', 'Brandon Miller'
    ]; // 15 unique resources
    
    const phaseNames = [
      'Planning & Analysis',
      'Design & Architecture', 
      'Development Phase 1',
      'Development Phase 2',
      'Testing & QA',
      'Deployment & Launch'
    ];
    
    const phaseColors = [
      'bg-blue-100 border-blue-300',
      'bg-green-100 border-green-300', 
      'bg-purple-100 border-purple-300',
      'bg-orange-100 border-orange-300',
      'bg-red-100 border-red-300',
      'bg-teal-100 border-teal-300'
    ];
    
    const taskTemplates = [
      'Requirements gathering', 'Stakeholder interviews', 'Market research', 'User journey mapping',
      'System architecture', 'Database design', 'UI/UX mockups', 'Technical specifications',
      'Frontend development', 'Backend API development', 'Database implementation', 'Integration work',
      'Feature implementation', 'Security implementation', 'Performance optimization', 'Code review',
      'Unit testing', 'Integration testing', 'User acceptance testing', 'Security testing',
      'Production deployment', 'Server configuration', 'Documentation', 'User training'
    ];
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Start 30 days ago
    
    const phases: Phase[] = [];
    let currentDate = new Date(startDate);
    
    // Generate 6 phases over 4 months (~120 days)
    for (let phaseIndex = 0; phaseIndex < 6; phaseIndex++) {
      const phaseDuration = 18 + Math.floor(rng.next() * 8); // 18-25 days per phase
      const phaseStartDate = new Date(currentDate);
      const phaseEndDate = new Date(currentDate);
      phaseEndDate.setDate(phaseEndDate.getDate() + phaseDuration);
      
      const phase: Phase = {
        id: `phase-${phaseIndex + 1}`,
        name: phaseNames[phaseIndex],
        startDate: phaseStartDate,
        endDate: phaseEndDate,
        color: phaseColors[phaseIndex],
        tasks: [],
        isExpanded: false
      };
      
      // Generate 5-7 tasks per phase (35 total tasks across 6 phases)
      const tasksPerPhase = phaseIndex < 5 ? 6 : 5; // First 5 phases get 6 tasks, last gets 5 (total 35)
      
      for (let taskIndex = 0; taskIndex < tasksPerPhase; taskIndex++) {
        const taskDuration = 3 + Math.floor(rng.next() * 8); // 3-10 days
        const taskStartOffset = Math.floor(rng.next() * (phaseDuration - taskDuration));
        
        const taskStartDate = new Date(phaseStartDate);
        taskStartDate.setDate(taskStartDate.getDate() + taskStartOffset);
        const taskEndDate = new Date(taskStartDate);
        taskEndDate.setDate(taskEndDate.getDate() + taskDuration);
        
        const resource = resources[Math.floor(rng.next() * resources.length)];
        const taskTemplate = taskTemplates[Math.floor(rng.next() * taskTemplates.length)];
        
        const task: Task = {
          id: `task-${phaseIndex + 1}-${taskIndex + 1}`,
          name: `${taskTemplate} (Phase ${phaseIndex + 1})`,
          startDate: taskStartDate,
          endDate: taskEndDate,
          resource,
          phaseId: phase.id,
          duration: taskDuration
        };
        
        phase.tasks.push(task);
      }
      
      phases.push(phase);
      
      // Move to next phase with small overlap or gap
      currentDate.setDate(currentDate.getDate() + phaseDuration - 2); // 2-day overlap
    }
    
    return phases;
  };

  // Find resource conflicts (same resource assigned to overlapping tasks)
  const findResourceConflicts = (phases: Phase[]): ResourceConflict[] => {
    const conflicts: ResourceConflict[] = [];
    const allTasks: Task[] = phases.flatMap(phase => phase.tasks);
    
    // Group tasks by resource
    const tasksByResource: Record<string, Task[]> = {};
    allTasks.forEach(task => {
      if (!tasksByResource[task.resource]) {
        tasksByResource[task.resource] = [];
      }
      tasksByResource[task.resource].push(task);
    });
    
    // Check for overlaps within each resource's tasks
    Object.entries(tasksByResource).forEach(([resource, tasks]) => {
      for (let i = 0; i < tasks.length; i++) {
        for (let j = i + 1; j < tasks.length; j++) {
          const task1 = tasks[i];
          const task2 = tasks[j];
          
          // Check if tasks overlap
          const overlap = getDateOverlap(task1.startDate, task1.endDate, task2.startDate, task2.endDate);
          if (overlap.days > 0) {
            conflicts.push({
              resource,
              task1: task1.name,
              task2: task2.name,
              overlapPeriod: `${formatDate(overlap.start)} - ${formatDate(overlap.end)}`,
              conflictType: 'Resource Double-booking',
              overlapDays: overlap.days
            });
          }
        }
      }
    });
    
    // Return all conflicts found (should be exactly 4)
    return conflicts;
  };

  const getDateOverlap = (start1: Date, end1: Date, start2: Date, end2: Date) => {
    const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
    const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
    
    if (overlapStart <= overlapEnd) {
      const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return { start: overlapStart, end: overlapEnd, days };
    }
    
    return { start: new Date(), end: new Date(), days: 0 };
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateRange = (startDate: Date, endDate: Date): string => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  useEffect(() => {
    const generatedPhases = generateProjectData();
    setPhases(generatedPhases);
    
    const conflicts = findResourceConflicts(generatedPhases);
    setResourceConflicts(conflicts);
  }, []);

  // Expose state for testing
  useEffect(() => {
    (window as any).app_state = {
      phases,
      resourceConflicts,
      addedConflicts,
      selectedTasks: Array.from(selectedTasks),
      allTasks: phases.flatMap(phase => phase.tasks),
      totalTasks: phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
      expandedPhases: phases.filter(phase => phase.isExpanded).length
    };
  }, [phases, resourceConflicts, addedConflicts, selectedTasks]);

  // Real-time cheat logging for human testers
  useEffect(() => {
    if (resourceConflicts.length > 0) {
      // Find which conflicts are still missing (using normalized keys for bidirectional conflicts)
      const normalizeConflictKey = (resource: string, task1: string, task2: string) => {
        const tasks = [task1, task2].sort(); // Sort tasks alphabetically for consistent keys
        return `${resource}_${tasks[0]}_${tasks[1]}`;
      };
      
      const addedConflictKeys = new Set(
        addedConflicts.map((c: any) => normalizeConflictKey(c.resource, c.task1, c.task2))
      );
      
      const expectedConflictKeys = new Set(
        resourceConflicts.map((c: any) => normalizeConflictKey(c.resource, c.task1, c.task2))
      );
      
      const missingConflicts = resourceConflicts.filter((conflict: any) => {
        const key = normalizeConflictKey(conflict.resource, conflict.task1, conflict.task2);
        return !addedConflictKeys.has(key);
      });

      // Always log current status for human testers
      console.clear(); // Clear previous logs for cleaner display
      console.log(`[Cheat] Task 15 - Resource Conflict Analysis Status`);
      console.log(`[Cheat] Progress: ${addedConflictKeys.size}/${expectedConflictKeys.size} unique conflicts found (${addedConflicts.length} total entries)`);
      console.log(`[Cheat] Selected tasks: ${selectedTasks.size}/2`);
      console.log(`[Cheat] Phases expanded: ${phases.filter(phase => phase.isExpanded).length}/3 (minimum required)`);
      
      if (addedConflicts.length > 0) {
        console.log(`[Cheat] ✅ Found conflicts:`);
        addedConflicts.forEach((conflict: any, index: number) => {
          console.log(`[Cheat]   ${index + 1}. ${conflict.resource}: "${conflict.task1}" ↔ "${conflict.task2}" (${conflict.overlapDays} days)`);
        });
      }
      
      if (missingConflicts.length > 0) {
        console.log(`[Cheat] ❌ Still missing ${missingConflicts.length} conflicts:`);
        missingConflicts.forEach((conflict: any, index: number) => {
          console.log(`[Cheat]   ${index + 1}. ${conflict.resource}: "${conflict.task1}" ↔ "${conflict.task2}" (${conflict.overlapDays} days, ${conflict.overlapPeriod})`);
        });
      } else if (addedConflictKeys.size >= expectedConflictKeys.size) {
        // All unique conflicts found, but check other requirements
        const expandedPhases = phases.filter(phase => phase.isExpanded).length;
        const invalidOverlaps = addedConflicts.filter((conflict: any) => 
          !conflict.overlapDays || conflict.overlapDays < 1 || conflict.overlapDays > 10
        );
        
        if (invalidOverlaps.length > 0) {
          console.log(`[Cheat] ❌ All conflicts found but ${invalidOverlaps.length} have invalid overlap periods!`);
        } else if (expandedPhases < 3) {
          console.log(`[Cheat] ❌ All conflicts found but only ${expandedPhases}/3 phases expanded! Expand more phases.`);
        } else {
          console.log(`[Cheat] 🎉 Task complete! All ${expectedConflictKeys.size} unique conflicts found + ${expandedPhases} phases expanded.`);
        }
      }
      
      if (selectedTasks.size > 0) {
        const allTasks = phases.flatMap(phase => phase.tasks);
        const selectedTaskObjects = Array.from(selectedTasks).map(id => 
          allTasks.find(t => t.id === id)
        ).filter(t => t);
        
        console.log(`[Cheat] 🔍 Currently selected tasks:`);
        selectedTaskObjects.forEach((task: any, index: number) => {
          console.log(`[Cheat]   ${index + 1}. ${task.resource}: "${task.name}" (${formatDateRange(task.startDate, task.endDate)})`);
        });
        
        if (selectedTasks.size === 2) {
          const [task1, task2] = selectedTaskObjects;
          if (task1 && task2) {
            if (task1.resource === task2.resource) {
              const overlap = getDateOverlap(task1.startDate, task1.endDate, task2.startDate, task2.endDate);
              if (overlap.days > 0) {
                console.log(`[Cheat] ✅ Valid conflict pair! Same resource (${task1.resource}) with ${overlap.days} day overlap`);
              } else {
                console.log(`[Cheat] ❌ Same resource but no date overlap`);
              }
            } else {
              console.log(`[Cheat] ❌ Different resources: ${task1.resource} vs ${task2.resource}`);
            }
          }
        }
      }
      
      console.log(`[Cheat] ---`);
    }
  }, [resourceConflicts, addedConflicts, selectedTasks, phases]);

  const togglePhaseExpansion = (phaseId: string) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId 
        ? { ...phase, isExpanded: !phase.isExpanded }
        : phase
    ));
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const addSelectedAsConflict = () => {
    const selectedTaskArray = Array.from(selectedTasks);
    if (selectedTaskArray.length === 2) {
      // Find the two selected tasks
      const allTasks = phases.flatMap(phase => phase.tasks);
      const task1 = allTasks.find(t => t.id === selectedTaskArray[0]);
      const task2 = allTasks.find(t => t.id === selectedTaskArray[1]);
      
      if (task1 && task2 && task1.resource === task2.resource) {
        // Check if they actually overlap
        const overlap = getDateOverlap(task1.startDate, task1.endDate, task2.startDate, task2.endDate);
        if (overlap.days > 0) {
          const conflict: ResourceConflict = {
            resource: task1.resource,
            task1: task1.name,
            task2: task2.name,
            overlapPeriod: `${formatDate(overlap.start)} - ${formatDate(overlap.end)}`,
            conflictType: 'Resource Double-booking',
            overlapDays: overlap.days
          };
          
          // Check if this conflict already exists (handle bidirectional conflicts)
          const normalizeConflictKey = (resource: string, task1: string, task2: string) => {
            const tasks = [task1, task2].sort(); // Sort tasks alphabetically for consistent keys
            return `${resource}_${tasks[0]}_${tasks[1]}`;
          };
          
          const newConflictKey = normalizeConflictKey(conflict.resource, conflict.task1, conflict.task2);
          const existingConflictKeys = addedConflicts.map(c => 
            normalizeConflictKey(c.resource, c.task1, c.task2)
          );
          
          if (!existingConflictKeys.includes(newConflictKey)) {
            setAddedConflicts(prev => [...prev, conflict]);
          }
        }
      }
      
      // Clear selection after adding
      setSelectedTasks(new Set());
    }
  };

  const removeConflictFromTable = (index: number) => {
    setAddedConflicts(prev => prev.filter((_, i) => i !== index));
  };

  const renderTaskBar = (task: Task) => {
    const isSelected = selectedTasks.has(task.id);
    
    return (
      <div
        key={task.id}
        className={`relative mb-2 cursor-pointer ${isSelected ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'} rounded p-2 text-xs hover:bg-gray-50`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex-1">
            <div className="font-medium text-gray-900">{task.name}</div>
            <div className="text-gray-600 flex items-center mt-1">
              <User className="w-3 h-3 mr-1" />
              {task.resource}
            </div>
          </div>
          <button
            onClick={() => toggleTaskSelection(task.id)}
            className={`text-xs px-2 py-1 rounded ${
              isSelected 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
        </div>
        
        <div className="text-gray-500 mb-2">
          {formatDateRange(task.startDate, task.endDate)} ({task.duration} days)
        </div>
      </div>
    );
  };

  const renderPhase = (phase: Phase) => {
    const phaseDurationDays = Math.ceil((phase.endDate.getTime() - phase.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div key={phase.id} className="mb-4">
        <div
          className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${phase.color}`}
          onClick={() => togglePhaseExpansion(phase.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {phase.isExpanded ? (
                <ChevronDown className="w-5 h-5 mr-2" />
              ) : (
                <ChevronRight className="w-5 h-5 mr-2" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                <div className="text-sm text-gray-600 flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDateRange(phase.startDate, phase.endDate)} ({phaseDurationDays} days)
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">{phase.tasks.length} tasks</div>
            </div>
          </div>
        </div>
        
        {phase.isExpanded && (
          <div className="mt-3 ml-8 space-y-2">
            {phase.tasks.map(task => renderTaskBar(task))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Panel - Project Timeline */}
      <div className="w-2/3 p-6 bg-white border-r overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Project Timeline</h2>
        </div>
        
        <div className="space-y-4">
          {phases.map(renderPhase)}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Legend</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
              <span>Normal Task</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span>Resource Conflict</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Resource Allocation Table */}
      <div className="w-1/3 p-6 bg-gray-50 overflow-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Resource Allocation Table</h2>
          <p className="text-gray-600 mt-2">
            Select pairs of tasks with overlapping dates and same resource to identify conflicts.
          </p>
        </div>
        
        {/* Selection and Add Conflict Section */}
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Selected Tasks</h4>
              <p className="text-sm text-gray-600">
                {selectedTasks.size} of 2 tasks selected
              </p>
            </div>
            <button
              onClick={addSelectedAsConflict}
              disabled={selectedTasks.size !== 2}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Conflict
            </button>
          </div>
          {selectedTasks.size > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {selectedTasks.size === 1 ? 'Select one more task to create a conflict pair' : 
               selectedTasks.size === 2 ? 'Click "Add Conflict" if these tasks overlap with same resource' :
               'Too many tasks selected - deselect some tasks first'}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Resource Conflicts</h3>
            <p className="text-sm text-gray-600">
              Identified conflicts will appear here
            </p>
          </div>
          
          <div className="overflow-auto max-h-[600px]">
            {addedConflicts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conflicts identified yet. Select pairs of overlapping tasks with same resource.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left border-b">Resource Name</th>
                    <th className="px-3 py-2 text-left border-b">Task 1</th>
                    <th className="px-3 py-2 text-left border-b">Task 2</th>
                    <th className="px-3 py-2 text-left border-b">Overlap Period</th>
                    <th className="px-3 py-2 text-left border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {addedConflicts.map((conflict, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{conflict.resource}</td>
                      <td className="px-3 py-2">
                        <div className="truncate max-w-[120px]" title={conflict.task1}>
                          {conflict.task1}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="truncate max-w-[120px]" title={conflict.task2}>
                          {conflict.task2}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          {conflict.overlapPeriod}
                          <br />
                          <span className="text-red-600">
                            ({conflict.overlapDays} days)
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeConflictFromTable(index)}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Task15;
