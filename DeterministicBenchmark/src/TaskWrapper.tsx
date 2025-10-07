import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TaskClassifier from './TaskClassifier';
import { humanEvalTracker } from './HumanEval';

interface TaskData {
  id: number;
  name: string;
  component: React.ComponentType;
  task: string;
  ux: string;
  test?: () => { success: boolean; message?: string };
  fullWidth?: boolean;
  requireResultSubmission?: boolean;
}

interface TaskWrapperProps {
  tasks: TaskData[];
  appName: string;
  appPath: string;
}

// Custom hook to get task execution status from HumanEval
function useTaskExecutionStatus(appPath: string, taskId: number) {
  const [status, setStatus] = useState<'success' | 'failed' | 'none'>('none');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Only enable when explicitly enabled via environment variable
  const enableHumanEval = (import.meta as any).env?.VITE_ENABLE_HUMAN_EVAL === 'true';
  
  const updateStatus = useCallback(() => {
    if (!enableHumanEval) {
      setStatus('none');
      return;
    }
    
    // Extract app name from appPath (e.g., '/time-pickers' -> 'time-pickers')
    const appName = appPath.replace('/:taskId?', '').replace('/', '');
    
    try {
      // Get all sessions and completed tasks from HumanEval storage
      const allSessions = humanEvalTracker.getAllSessions();
      const completedTasks = humanEvalTracker.getCompletedTasks();
      
      // Check if there's a successful completion in completedTasks
      if (completedTasks[appName] && completedTasks[appName][taskId] && completedTasks[appName][taskId].completed) {
        setStatus('success');
        return;
      }
      
      // Check sessions for this specific app and task
      const taskSessions = allSessions.filter(session => 
        session.app === appName && session.taskId === taskId
      );
      
      if (taskSessions.length === 0) {
        setStatus('none');
        return;
      }
      
      // Check if any session was successful
      const hasSuccess = taskSessions.some(session => session.finalStatus === 'code#1');
      if (hasSuccess) {
        setStatus('success');
      } else {
        // All sessions failed
        setStatus('failed');
      }
    } catch (error) {
      console.warn('Error reading HumanEval status:', error);
      setStatus('none');
    }
  }, [appPath, taskId, enableHumanEval]);
  
  useEffect(() => {
    updateStatus();
  }, [updateStatus, refreshTrigger]);
  
  // Listen for changes to update status in real-time
  useEffect(() => {
    if (!enableHumanEval) return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'humanEval_sessions' || e.key === 'humanEval_completedTasks') {
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    // Listen for focus events to refresh when returning from a task
    const handleFocus = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    // Listen for popstate events (back/forward navigation)
    const handlePopState = () => {
      setTimeout(() => setRefreshTrigger(prev => prev + 1), 100);
    };
    
    // Polling as fallback to catch any missed updates
    const pollInterval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 500); // Check every 0.5 seconds
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('popstate', handlePopState);
      clearInterval(pollInterval);
    };
  }, [enableHumanEval]);
  
  return enableHumanEval ? status : 'none';
}

// Status dot component
function TaskStatusDot({ status }: { status: 'success' | 'failed' | 'none' }) {
  const colors = {
    success: 'bg-green-500',
    failed: 'bg-red-500',
    none: 'bg-gray-400'
  };
  
  return (
    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${colors[status]}`} />
  );
}

const TaskWrapper: React.FC<TaskWrapperProps> = ({ tasks, appName, appPath }) => {
  const { taskId } = useParams<{ taskId: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  
  // Compute current task id and selection for both list and detail views
  const taskIdNum = taskId ? parseInt(taskId, 10) : null;
  const currentTask = useMemo(
    () => (taskIdNum != null ? tasks.find((t) => t.id === taskIdNum) ?? null : null),
    [tasks, taskIdNum]
  );
  // Stable component reference regardless of list/detail view
  const ComponentUnsafe = ((currentTask?.component as React.ComponentType) || (() => null)) as React.ComponentType;
  const MemoComponent = useMemo(() => React.memo(ComponentUnsafe), [ComponentUnsafe]);
  
  // Optional test runner (only when app_state changes) — always call hooks in consistent order
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  const lastSuccessRef = useRef<boolean | null>(null);
  const lastMessageRef = useRef<string | null>(null);
  const lastAppStateRef = useRef<string>('');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submissionInput, setSubmissionInput] = useState('');
  
  
  
  const runTest = useMemo(() => (forceRun = false) => {
    if (!currentTask?.test) return;
    
    try {
      // Check if app_state changed (only run test if state changed or forced)
      const currentAppState = (window as any).app_state;
      const currentStateString = currentAppState ? JSON.stringify(currentAppState) : '';
      
      if (!forceRun && currentStateString === lastAppStateRef.current) {
        return; // No change, skip test
      }
      
      lastAppStateRef.current = currentStateString;
      
      const result = currentTask.test();
      if (result && typeof result.success === 'boolean') {
        const currentMessage = result.message || null;
        // Update state and log when success flag OR message changes
        if (lastSuccessRef.current !== result.success || lastMessageRef.current !== currentMessage) {
          lastSuccessRef.current = result.success;
          lastMessageRef.current = currentMessage;
          setTestResult(result);
          // Log test result message to console when result changes
          if (result.message) {
            console.log(`[Test] ${currentTask.name}: ${result.message}`);
          }
          
          // Notify HumanEval system of test result change
          if (typeof window !== 'undefined' && (window as any).humanEvalTracker) {
            (window as any).humanEvalTracker.recordTestResult(result.success, result.message || '');
          }
        }
      }
    } catch (err) {
      if (lastSuccessRef.current !== false || lastMessageRef.current !== 'Test execution error') {
        lastSuccessRef.current = false;
        lastMessageRef.current = 'Test execution error';
        const errorResult = { success: false, message: 'Test execution error' };
        setTestResult(errorResult);
        console.log(`[Test] ${currentTask.name}: ${errorResult.message}`);
      }
    }
  }, [currentTask]);

  useEffect(() => {
    if (!currentTask?.test) {
      setTestResult(null);
      lastSuccessRef.current = null;
      lastMessageRef.current = null;
      lastAppStateRef.current = '';
      return;
    }
    
    // Run once immediately
    runTest(true);
    
    // Set up polling but only run test when app_state actually changes
    const interval = setInterval(() => runTest(), 200); // Faster polling but efficient
    return () => clearInterval(interval);
  }, [currentTask, runTest]);

  // If no taskId is provided, show all tasks
  if (!taskId) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between bg-white border rounded shadow-sm px-5 py-3">
            <Link to="/" id="back-to-apps" className="text-gray-600 hover:text-gray-800 whitespace-nowrap">← Back to Apps</Link>
            <div className="text-base font-semibold text-gray-900 truncate max-w-[60vw]">{appName}</div>
            <div className="w-20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(({ id, name }) => {
              const TaskCard = () => {
                const executionStatus = useTaskExecutionStatus(appPath, id);
                return (
                  <Link
                    key={id}
                    to={`${appPath}/${id}`}
                    className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer block relative"
                  >
                    <TaskStatusDot status={executionStatus} />
                    <div className="text-sm text-gray-500 mb-1">Task {id}</div>
                    <div className="font-medium text-gray-900 truncate">{name}</div>
                  </Link>
                );
              };
              return <TaskCard key={id} />;
            })}
          </div>
        </div>
      </div>
    );
  }

  // Individual task view
  if (!currentTask) {
    return <Navigate to={appPath} replace />;
  }

  const currentIndex = tasks.findIndex((t) => t.id === (taskIdNum as number));
  const prevTask = currentIndex > 0 ? tasks[currentIndex - 1] : null;
  const nextTask = currentIndex < tasks.length - 1 ? tasks[currentIndex + 1] : null;


  // testResult already managed above

  // Test mode: show only the component, centered horizontally but near top
  if (mode === 'test') {
    const innerContainerClass = currentTask?.fullWidth
      ? 'w-full overflow-visible'
      : 'w-full overflow-visible rounded-md border p-4';
    const outerContainerClass = currentTask?.fullWidth ? 'w-full' : 'w-full max-w-7xl mx-auto';
    return (
      <div className="min-h-screen bg-gray-50 pt-8 px-4">
        <div className={outerContainerClass}>
          <div className="mb-2 flex items-center justify-between">
            {currentTask.test && (
              <div className="font-mono text-sm text-gray-600 hidden">{testResult?.success ? 'code#1' : 'code#0'}</div>
            )}
            {currentTask?.requireResultSubmission && (
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Results
              </button>
            )}
          </div>
          <div className={innerContainerClass}>
            <MemoComponent />
          </div>
        </div>
        {isSubmitOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
              <div className="p-4 border-b font-semibold">Submit Results</div>
              <div className="p-4">
                <textarea
                  className="w-full h-48 border rounded p-2 font-mono text-sm"
                  placeholder="Enter JSON or text to submit"
                  value={submissionInput}
                  onChange={(e) => setSubmissionInput(e.target.value)}
                />
              </div>
              <div className="p-4 border-t flex gap-2 justify-end">
                <button className="px-3 py-1 border rounded" onClick={() => setIsSubmitOpen(false)}>Cancel</button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={() => {
                    let parsed: any = submissionInput;
                    try { parsed = JSON.parse(submissionInput); } catch {}
                    (window as any).app_state = { ...(window as any).app_state, submission: parsed };
                    setIsSubmitOpen(false);
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className={currentTask.fullWidth ? 'w-full' : 'max-w-7xl mx-auto'}>
        {/* Compact toolbar */}
        <div className="mb-5 flex items-start justify-between bg-white border rounded shadow-sm px-4 py-3">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <Link to={appPath.replace('/:taskId?', '')} id="back-to-tasks" className="text-gray-600 hover:text-gray-800 whitespace-nowrap pt-0.5">
              ← Back to Tasks
            </Link>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-gray-900 max-w-[56vw] break-words leading-relaxed">
                <strong>Task:</strong> {currentTask.task}
              </div>
              {currentTask.ux && (
                <div className="text-xs text-gray-600 max-w-[56vw] mt-1 break-words leading-relaxed">
                  <strong>Hint:</strong> {currentTask.ux}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 whitespace-nowrap flex-shrink-0 pt-0.5">
            {currentTask.test && (
              <span className="font-mono text-sm text-gray-700 hidden">{testResult?.success ? 'code#1' : 'code#0'}</span>
            )}
            {currentTask.requireResultSubmission && (
              <button onClick={() => setIsSubmitOpen(true)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap">Submit Results</button>
            )}
            {mode !== 'test' && (
              <Link to={`${appPath}/${currentTask.id}?mode=test`} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Test Mode</Link>
            )}
          </div>
        </div>

        {/* Task classifier - only visible in dev mode */}
        <TaskClassifier taskIdNum={taskIdNum} appPath={appPath} />

        {/* Task content */}
        {currentTask.fullWidth ? (
          <div id="task-content-area" className="w-full">
            <MemoComponent />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div id="task-content-area" className="w-full rounded-md border overflow-visible p-4">
              <MemoComponent />
            </div>
          </div>
        )}

        {isSubmitOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
              <div className="p-4 border-b font-semibold">Submit Results</div>
              <div className="p-4">
                <textarea
                  className="w-full h-48 border rounded p-2 font-mono text-sm"
                  placeholder="Enter JSON or text to submit"
                  value={submissionInput}
                  onChange={(e) => setSubmissionInput(e.target.value)}
                />
              </div>
              <div className="p-4 border-t flex gap-2 justify-end">
                <button className="px-3 py-1 border rounded" onClick={() => setIsSubmitOpen(false)}>Cancel</button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={() => {
                    let parsed: any = submissionInput;
                    try { parsed = JSON.parse(submissionInput); } catch {}
                    (window as any).app_state = { ...(window as any).app_state, submission: parsed };
                    setIsSubmitOpen(false);
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation footer */}
        <div className="mt-8 flex justify-between items-center">
          {prevTask ? (
            <Link
              to={`${appPath}/${prevTask.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:shadow-sm transition-shadow"
            >
              <ChevronLeft className="h-4 w-4" />
              <div>
                <div className="text-sm text-gray-500">Previous</div>
                <div className="font-medium">{prevTask.name}</div>
              </div>
            </Link>
          ) : (
            <div></div>
          )}
          
          {nextTask ? (
            <Link
              to={`${appPath}/${nextTask.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:shadow-sm transition-shadow text-right"
            >
              <div>
                <div className="text-sm text-gray-500">Next</div>
                <div className="font-medium">{nextTask.name}</div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskWrapper; 