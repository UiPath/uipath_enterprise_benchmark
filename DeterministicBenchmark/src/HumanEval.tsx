/**
 * Human Performance Evaluation System - Phase 1
 * Single file implementation for tracking user interactions and task performance
 */

// TypeScript interfaces
export interface HumanEvalStep {
  stepNumber: number;
  timestamp: number;
  action: {
    type: 'click' | 'keypress' | 'input' | 'navigation' | 'scroll' | 'wheel' | 'drag' | 'test_result';
    target: string;         // element selector or description
    value?: string;         // key pressed, input value, scroll position, etc.
    // For drag actions:
    sourceElement?: string; // source element selector
    targetElement?: string; // target element selector  
    deltaX?: number;        // horizontal movement
    deltaY?: number;        // vertical movement
    duration?: number;      // drag duration in ms
    // For test_result actions:
    testSuccess?: boolean;  // test result success/failure
    testMessage?: string;   // test result message
  };
  consoleLog?: string;      // [Test] or [Cheat] message if any
}

export interface HumanEvalSession {
  sessionId: string;
  app: string;              // "combo-box-tasks"
  taskId: number;           // 4
  url: string;              // "/combo-box-tasks/4?mode=test"
  startTime: number;
  endTime?: number;
  finalStatus: 'code#0' | 'code#1';
  totalSteps: number;
  duration: number;         // milliseconds
  steps: HumanEvalStep[];
}

export interface HumanEvalStorage {
  sessions: HumanEvalSession[];
  completedTasks: {
    [appName: string]: {
      [taskId: number]: {
        completed: boolean;
        bestTime?: number;
        attempts: number;
      }
    }
  };
}

interface HumanEvalCurrentSession {
  sessionId: string;
  app: string;
  taskId: number;
  url: string;
  startTime: number;
  stepCount: number;
}

// Storage keys to avoid conflicts
const STORAGE_KEYS = {
  SESSIONS: 'humanEval_sessions',
  COMPLETED_TASKS: 'humanEval_completedTasks',
  CURRENT_SESSION: 'humanEval_currentSession'
} as const;

// Test result caching system
// Obsolete interfaces removed - no longer needed with direct test events

// Core tracking service
class HumanEvalTracker {
  private originalConsoleLog: typeof console.log;
  private currentSession: HumanEvalCurrentSession | null = null;
  private stepBuffer: HumanEvalStep[] = [];
  private lastKeypressStep: HumanEvalStep | null = null;
  private keypressMergeTimeout: number | null = null;
  private lastScrollStep: HumanEvalStep | null = null;
  private scrollMergeTimeout: number | null = null;
  private recentWheelEvents: Set<number> = new Set(); // Track recent wheel event timestamps
  private activeDragOperation: {
    sourceElement: string;
    sourcePosition: { x: number; y: number };
    startTime: number;
  } | null = null;
  private isEnabled: boolean;
  
  // Clean up - no more complex caching system needed

  constructor() {
    this.originalConsoleLog = console.log.bind(console);
    
    // Check if HumanEval is enabled via environment variable
    this.isEnabled = typeof window !== 'undefined' && 
      ((import.meta as any).env?.VITE_ENABLE_HUMAN_EVAL === 'true' || 
       (window as any).__VITE_ENABLE_HUMAN_EVAL__ === 'true');
    
    if (!this.isEnabled) {
      console.log('[HumanEval] System disabled - set VITE_ENABLE_HUMAN_EVAL=true to enable');
      return;
    }
    
    // Temporarily disable console interception for debugging
    // this.setupConsoleInterception();
    this.loadCurrentSession();
    this.setupEventListeners();
    this.setupAutoSessionDetection();
    
    // Debug: Test normal console logging
    console.log('[HumanEval] System initialized - normal console should work');
  }

  /**
   * Setup console log interception to capture [Test] and [Cheat] messages
   */
  private setupConsoleInterception(): void {
    const self = this;
    
    // Test the interception immediately
    self.originalConsoleLog('[HumanEval] Console interception setup complete');
    
    // Store reference to avoid infinite recursion
    const originalLog = self.originalConsoleLog;
    
    console.log = function(...args: any[]) {
      // Always call original console.log to maintain normal logging
      originalLog.apply(console, args);
      
      // Check if this is a test or cheat message
      const message = args.join(' ');
      if (message.includes('[Test]') || message.includes('[Cheat]')) {
        originalLog(`[HumanEval] ✅ Intercepted: ${message}`);
        self.recordConsoleLog(message);
      }
    };
    
    // Test the interception
    console.log('[Test] Console interception test - this should be intercepted');
  }

  /**
   * Record a console log message as part of the current step
   */
  private recordConsoleLog(message: string): void {
    if (!this.currentSession) return;

    // Find the most recent step to attach this log to, or create a new step
    const lastStep = this.stepBuffer[this.stepBuffer.length - 1];
    const timestamp = Date.now();
    
    if (lastStep && (timestamp - lastStep.timestamp) < 1000) {
      // Attach to recent step (within 1 second)
      lastStep.consoleLog = message;
    } else {
      // Create new step for this console log
      this.recordStep({
        type: 'navigation',
        target: 'console',
        value: message
      }, message);
    }
  }

  /**
   * Start a new tracking session
   */
  startSession(app: string, taskId: number, url: string): string {
    if (!this.isEnabled) return '';
    
    // End any existing session first
    if (this.currentSession) {
      this.endSession(); // Automatically determines status from test_result events
    }

    const sessionId = this.generateSessionId();
    const startTime = Date.now();

    this.currentSession = {
      sessionId,
      app,
      taskId,
      url,
      startTime,
      stepCount: 0
    };

    this.stepBuffer = [];
    this.saveCurrentSession();

    console.log(`[Session Start] ${app}/task-${taskId} | Session: ${sessionId}`);
    return sessionId;
  }

  /**
   * End the current tracking session
   */
  endSession(): void {
    if (!this.isEnabled || !this.currentSession) return;

    // Finalize any pending keypress and scroll merges before ending session
    this.finalizeKeypressMerge();
    this.finalizeScrollMerge();

    const endTime = Date.now();
    const duration = endTime - this.currentSession.startTime;

    // Only save sessions that have recorded user actions
    if (this.stepBuffer.length > 0) {
      const finalStatus = this.getLatestTestResult();
      
      const completedSession: HumanEvalSession = {
        sessionId: this.currentSession.sessionId,
        app: this.currentSession.app,
        taskId: this.currentSession.taskId,
        url: this.currentSession.url,
        startTime: this.currentSession.startTime,
        endTime,
        finalStatus,
        totalSteps: this.stepBuffer.length,
        duration: Math.round(duration / 1000),
        steps: [...this.stepBuffer]
      };

      // Save the completed session
      this.saveSession(completedSession);
      
      // Update completion tracking
        this.updateCompletionStatus(
          this.currentSession.app,
          this.currentSession.taskId,
          finalStatus === 'code#1',
          Math.round(duration / 1000)
        );
        
        // Comprehensive final state logging
        console.log(`🏁 [Session End] ${this.currentSession.app}/task-${this.currentSession.taskId} | Status: ${finalStatus} | Duration: ${Math.round(duration / 1000)}s | Steps: ${this.stepBuffer.length}`);
        console.log(`📊 [Final State] Clean event system - no complex caching needed`);
        
        // Show step-by-step final results
        console.log(`📋 [Step Summary]:`);
        this.stepBuffer.forEach((step, index) => {
          if (step.action.type === 'test_result') {
            const status = step.action.testSuccess ? 'SUCCESS' : 'FAIL';
            console.log(`  ${index + 1}. ${step.action.type} → ${status} (${step.action.testMessage})`);
          } else if (step.action.type === 'keypress') {
            console.log(`  ${index + 1}. ${step.action.type} → "${step.action.value}" on ${step.action.target}`);
          } else if (step.action.type === 'input') {
            console.log(`  ${index + 1}. ${step.action.type} → "${step.action.value}" into ${step.action.target}`);
          } else if (step.action.type === 'drag') {
            console.log(`  ${index + 1}. ${step.action.type} → ${step.action.sourceElement} to ${step.action.targetElement} (Δx: ${step.action.deltaX}, Δy: ${step.action.deltaY})`);
          } else if (step.action.type === 'wheel') {
            console.log(`  ${index + 1}. ${step.action.type} → ${step.action.target} (${step.action.value})`);
          } else {
            console.log(`  ${index + 1}. ${step.action.type} → ${step.action.target}`);
          }
        });
        
        // Show current DOM test status for reference (not used in final status determination)
        
        // Show completion summary
        this.showTaskCompletionSummary(this.currentSession.app, this.currentSession.taskId, finalStatus, Math.round(duration / 1000), this.stepBuffer.length);
    } else {
      console.log(`[Session Skip] ${this.currentSession.app}/task-${this.currentSession.taskId} | No actions recorded, session not saved`);
    }

    // Clear current session
    this.currentSession = null;
    this.stepBuffer = [];
    this.clearCurrentSession();
  }

  /**
   * Record a user action step - simplified (no test result matching needed)
   */
  recordStep(
    action: HumanEvalStep['action'],
    consoleLog?: string
  ): void {
    if (!this.isEnabled || !this.currentSession) return;

    this.currentSession.stepCount++;

    const step: HumanEvalStep = {
      stepNumber: this.currentSession.stepCount,
      timestamp: Date.now(),
      action,
      consoleLog
    };

    this.stepBuffer.push(step);
    
    const actionDescription = action.type === 'test_result' 
      ? `${action.testSuccess ? 'SUCCESS' : 'FAIL'}: ${action.testMessage}`
      : `on ${action.target}`;
    
    console.log(`📝 [Event] Step ${step.stepNumber}: ${action.type} ${actionDescription}`);

    this.saveCurrentSession();
  }

  // Obsolete methods removed - no more complex caching needed

  // All obsolete retroactive update methods removed

  /**
   * Show a task completion summary with performance metrics
   */
  private showTaskCompletionSummary(app: string, taskId: number, status: 'code#0' | 'code#1', duration: number, actionCount: number): void {
    console.log(`📋 Task ${app}/${taskId} | Actions: ${actionCount} | Duration: ${duration}s | Status: ${status}`);
  }

  /**
   * Record a click action with automatic test result capture
   */
  recordClick(target: string): void {
    // Finalize any pending keypress merge before recording click
    this.finalizeKeypressMerge();
    
    console.log(`🖱️ [Click] ${target}`);
    this.recordStep({
      type: 'click',
      target
    });
  }

  /**
   * Record a keypress action with intelligent merging
   */
  recordKeypress(key: string, target: string): void {
    const now = Date.now();
    
    // Check if this is a simple character (no modifiers, single printable character)
    const isSimpleChar = key.length === 1 && /^[a-zA-Z0-9\s.,!?@#$%^&*()_+\-=\[\]{}|;':",./<>?`~]$/.test(key);
    
    // Check if we can merge with the previous keypress
    if (isSimpleChar && 
        this.lastKeypressStep && 
        this.lastKeypressStep.action.target === target &&
        this.lastKeypressStep.action.type === 'keypress' &&
        (now - this.lastKeypressStep.timestamp) < 2000) { // Within 2 seconds
      
      // Clear any pending timeout
      if (this.keypressMergeTimeout) {
        clearTimeout(this.keypressMergeTimeout);
      }
      
      // Merge the keystroke
      const currentValue = this.lastKeypressStep.action.value || '';
      const newValue = currentValue + key;
      this.lastKeypressStep.action.value = newValue;
      this.lastKeypressStep.timestamp = now; // Update timestamp
      
      console.log(`[Keypress Merged] "${newValue}" on ${target}`);
      
      // Set a timeout to finalize this merged keypress
      this.keypressMergeTimeout = window.setTimeout(() => {
        this.finalizeKeypressMerge();
      }, 2000);
      
      return;
    }
    
    // Finalize any previous keypress merge
    this.finalizeKeypressMerge();
    
    // Create new keypress step
    const step: HumanEvalStep = {
      stepNumber: this.currentSession ? this.currentSession.stepCount + 1 : 1,
      timestamp: now,
      action: {
        type: 'keypress',
        target,
        value: key
      }
    };
    
    if (isSimpleChar) {
      this.lastKeypressStep = step;
      console.log(`[Keypress Start] "${key}" on ${target}`);
      
      // Set timeout to finalize if no more keystrokes come
      this.keypressMergeTimeout = window.setTimeout(() => {
        this.finalizeKeypressMerge();
      }, 2000);
    } else {
      // Special keys (Enter, Escape, etc.) - record immediately
      console.log(`[Keypress] ${key} on ${target}`);
      this.recordStep(step.action);
    }
  }
  
  /**
   * Finalize any pending keypress merge
   */
  private finalizeKeypressMerge(): void {
    if (this.lastKeypressStep) {
      console.log(`[Keypress Final] "${this.lastKeypressStep.action.value}" on ${this.lastKeypressStep.action.target}`);
      this.recordStep(this.lastKeypressStep.action);
      this.lastKeypressStep = null;
    } else {
      console.log(`[Keypress Final] No pending keypress to finalize`);
    }
    
    if (this.keypressMergeTimeout) {
      clearTimeout(this.keypressMergeTimeout);
      this.keypressMergeTimeout = null;
    }
  }

  /**
   * Record an input action
   */
  recordInput(target: string, value: string): void {
    // Finalize any pending keypress merge before recording input
    this.finalizeKeypressMerge();
    
    console.log(`[Input] "${value}" into ${target}`);
    this.recordStep({
      type: 'input',
      target,
      value
    });
  }

  /**
   * Record a navigation action
   */
  recordNavigation(target: string): void {
    // Finalize any pending keypress merge before recording navigation
    this.finalizeKeypressMerge();
    
    console.log(`[Navigation] ${target}`);
    this.recordStep({
      type: 'navigation',
      target
    });
  }

  /**
   * Record a scroll action
   */
  recordScroll(target: string, scrollInfo: string): void {
    // Always ignore scroll events - we only want wheel events for user-initiated scrolling
    // Scroll events are typically programmatic or secondary to wheel events
    console.log(`📜 [Scroll Ignored] ${target} - wheel events take priority`);
    return;
  }

  recordWheel(target: string, wheelInfo: string): void {
    const now = Date.now();
    
    // Track this wheel event timestamp
    this.recentWheelEvents.add(now);
    
    // Clean up old wheel event timestamps (older than 500ms)
    for (const timestamp of this.recentWheelEvents) {
      if (now - timestamp > 500) {
        this.recentWheelEvents.delete(timestamp);
      }
    }
    
    console.log(`🎡 [Wheel] ${target} | ${wheelInfo}`);
    this.recordScrollWithMerging('wheel', target, wheelInfo);
  }

  /**
   * Record scroll/wheel action with intelligent merging of consecutive events
   */
  private recordScrollWithMerging(
    type: 'scroll' | 'wheel', 
    target: string, 
    info: string
  ): void {
    const now = Date.now();
    
    // Check if we can merge with the previous scroll event
    if (this.lastScrollStep && 
        this.lastScrollStep.action.target === target &&
        this.lastScrollStep.action.type === type &&
        (now - this.lastScrollStep.timestamp) < 1000) { // Within 1 second
      
      // Clear any existing timeout
      if (this.scrollMergeTimeout) {
        clearTimeout(this.scrollMergeTimeout);
      }
      
      // Merge the scroll info
      const currentInfo = this.lastScrollStep.action.value || '';
      const newInfo = this.mergeScrollInfo(currentInfo, info, type);
      this.lastScrollStep.action.value = newInfo;
      this.lastScrollStep.timestamp = now; // Update timestamp
      
      console.log(`📜 [${type === 'scroll' ? 'Scroll' : 'Wheel'} Merged] ${target} (${newInfo})`);
      
      // Set a timeout to finalize this merged scroll
      this.scrollMergeTimeout = window.setTimeout(() => {
        this.finalizeScrollMerge();
      }, 1000);
      
      return;
    }
    
    // Finalize any previous scroll merge
    this.finalizeScrollMerge();
    
    // Create new scroll step
    const step: HumanEvalStep = {
      stepNumber: this.currentSession ? this.currentSession.stepCount + 1 : 1,
      timestamp: now,
      action: {
        type,
        target,
        value: info
      }
    };
    
    // Start a new merge sequence
    this.lastScrollStep = step;
    console.log(`📜 [${type === 'scroll' ? 'Scroll' : 'Wheel'} Start] ${target} (${info})`);
    
    // Set timeout to finalize if no more scroll events come
    this.scrollMergeTimeout = window.setTimeout(() => {
      this.finalizeScrollMerge();
    }, 1000);
  }

  /**
   * Merge scroll information intelligently
   */
  private mergeScrollInfo(currentInfo: string, newInfo: string, type: 'scroll' | 'wheel'): string {
    if (type === 'scroll') {
      // For scroll events, just use the latest position
      return newInfo;
    } else {
      // For wheel events, accumulate delta values
      const current = this.parseWheelInfo(currentInfo);
      const new_ = this.parseWheelInfo(newInfo);
      
      return `deltaX:${(current.deltaX + new_.deltaX).toFixed(1)}, deltaY:${(current.deltaY + new_.deltaY).toFixed(1)}, deltaZ:${(current.deltaZ + new_.deltaZ).toFixed(1)}`;
    }
  }

  /**
   * Parse wheel info string into delta values
   */
  private parseWheelInfo(wheelInfo: string): { deltaX: number; deltaY: number; deltaZ: number } {
    const match = wheelInfo.match(/deltaX:([^,]+), deltaY:([^,]+), deltaZ:([^,]+)/);
    if (match) {
      return {
        deltaX: parseFloat(match[1]) || 0,
        deltaY: parseFloat(match[2]) || 0,
        deltaZ: parseFloat(match[3]) || 0
      };
    }
    return { deltaX: 0, deltaY: 0, deltaZ: 0 };
  }

  /**
   * Finalize any pending scroll merge
   */
  private finalizeScrollMerge(): void {
    if (this.lastScrollStep) {
      const type = this.lastScrollStep.action.type;
      console.log(`📜 [${type === 'scroll' ? 'Scroll' : 'Wheel'} Final] ${this.lastScrollStep.action.target} (${this.lastScrollStep.action.value})`);
      this.recordStep(this.lastScrollStep.action);
      this.lastScrollStep = null;
    }
    
    if (this.scrollMergeTimeout) {
      clearTimeout(this.scrollMergeTimeout);
      this.scrollMergeTimeout = null;
    }
  }

  recordDrag(sourceElement: string, targetElement: string, dragStartEvent: DragEvent, dropEvent: DragEvent): void {
    // Finalize any pending keypress merge before recording drag
    this.finalizeKeypressMerge();
    
    const deltaX = dropEvent.clientX - dragStartEvent.clientX;
    const deltaY = dropEvent.clientY - dragStartEvent.clientY;
    const duration = dropEvent.timeStamp - dragStartEvent.timeStamp;

    console.log(`🖱️ [Drag] ${sourceElement} → ${targetElement} (Δx: ${deltaX}, Δy: ${deltaY}, ${duration.toFixed(1)}ms)`);
    
    this.recordStep({
      type: 'drag',
      target: 'drag_operation',
      sourceElement,
      targetElement,
      deltaX,
      deltaY,
      duration
    });
  }

  /**
   * Record a test result event - called directly from TaskWrapper when test() runs
   */
  recordTestResult(success: boolean, message: string): void {
    if (!this.isEnabled || !this.currentSession) return;

    const status = success ? 'code#1' : 'code#0';
    console.log(`🧪 [Test Result] ${status} - ${message}`);
    
    this.recordStep({
      type: 'test_result',
      target: 'test_execution',
      value: status,
      testSuccess: success,
      testMessage: message
    });
  }

  /**
   * Get current session info
   */
  getCurrentSession(): HumanEvalCurrentSession | null {
    return this.currentSession;
  }

  /**
   * Get all stored sessions
   */
  getAllSessions(): HumanEvalSession[] {
    if (!this.isEnabled) return [];
    const storage = this.getStorage();
    return storage.sessions;
  }

  /**
   * Get completion status for all tasks
   */
  getCompletedTasks(): HumanEvalStorage['completedTasks'] {
    if (!this.isEnabled) return {};
    const storage = this.getStorage();
    return storage.completedTasks;
  }

  /**
   * Export all data for analysis
   */
  exportData(): HumanEvalStorage {
    return this.getStorage();
  }

  /**
   * Clear all tracking data
   */
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_TASKS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    this.currentSession = null;
    this.stepBuffer = [];
    console.log('[HumanEval] Cleared all tracking data');
  }

  /**
   * Private helper methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStorage(): HumanEvalStorage {
    const sessionsData = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const completedTasksData = localStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);

    return {
      sessions: sessionsData ? JSON.parse(sessionsData) : [],
      completedTasks: completedTasksData ? JSON.parse(completedTasksData) : {}
    };
  }

  private saveSession(session: HumanEvalSession): void {
    const storage = this.getStorage();
    storage.sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(storage.sessions));
  }

  private updateCompletionStatus(
    app: string, 
    taskId: number, 
    completed: boolean, 
    duration: number
  ): void {
    const storage = this.getStorage();
    
    if (!storage.completedTasks[app]) {
      storage.completedTasks[app] = {};
    }
    
    if (!storage.completedTasks[app][taskId]) {
      storage.completedTasks[app][taskId] = {
        completed: false,
        attempts: 0
      };
    }

    const taskStatus = storage.completedTasks[app][taskId];
    taskStatus.attempts++;
    
    if (completed) {
      taskStatus.completed = true;
      if (!taskStatus.bestTime || duration < taskStatus.bestTime) {
        taskStatus.bestTime = duration;
      }
    }

    localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(storage.completedTasks));
  }

  private saveCurrentSession(): void {
    if (this.currentSession) {
      const sessionData = {
        ...this.currentSession,
        steps: this.stepBuffer
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(sessionData));
    }
  }

  private loadCurrentSession(): void {
    const sessionData = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      this.currentSession = {
        sessionId: parsed.sessionId,
        app: parsed.app,
        taskId: parsed.taskId,
        url: parsed.url,
        startTime: parsed.startTime,
        stepCount: parsed.stepCount || 0
      };
      this.stepBuffer = parsed.steps || [];
    }
  }

  private clearCurrentSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  /**
   * Setup global event listeners to automatically capture user interactions
   */
  /**
   * Check if an event target is within the task content area
   */
  private isWithinTaskContent(target: Element | null): boolean {
    if (!target) return false;
    
    // Check if the target or any parent has id="task-content-area"
    let current = target as Element;
    while (current && current !== document.body) {
      if (current.id === 'task-content-area') {
        return true;
      }
      current = current.parentElement as Element;
    }
    
    return false;
  }

  private setupEventListeners(): void {
    if (!this.isEnabled || typeof window === 'undefined') return;

    // Capture clicks only within task content area
    document.addEventListener('click', (event) => {
      if (!this.currentSession) {
        console.log('[Debug] Click detected but no active session');
        return;
      }
      
      const target = event.target as HTMLElement;
      
      // Only record clicks within the task content area
      if (!this.isWithinTaskContent(target)) {
        console.log(`[Debug] Click outside task content area, ignoring: ${this.getElementSelector(target)}`);
        return;
      }
      
      const selector = this.getElementSelector(target);
      this.recordClick(selector);
    }, true);

    // Capture keypresses only within task content area
    document.addEventListener('keydown', (event) => {
      if (!this.currentSession) return;
      
      const target = event.target as HTMLElement;
      
      // Only record keypresses within the task content area
      if (!this.isWithinTaskContent(target)) {
        return;
      }
      
      const selector = this.getElementSelector(target);
      this.recordKeypress(event.key, selector);
    }, true);


    // Capture scroll events (including zoom/pan interactions)
    document.addEventListener('scroll', (event) => {
      if (!this.currentSession) return;
      
      const target = event.target;
      const selector = target === document ? 'document' : this.getElementSelector(target as HTMLElement);
      const scrollInfo = target === document 
        ? `x:${window.scrollX}, y:${window.scrollY}` 
        : `x:${(target as HTMLElement).scrollLeft}, y:${(target as HTMLElement).scrollTop}`;
      
      console.log(`📜 [Scroll] ${selector} (${scrollInfo})`);
      this.recordScroll(selector, scrollInfo);
    }, true);

    // Capture wheel events (mouse wheel, trackpad zoom/scroll)
    document.addEventListener('wheel', (event) => {
      if (!this.currentSession) return;
      
      // Only record wheel events within task content area
      const target = event.target as HTMLElement;
      if (!this.isWithinTaskContent(target)) {
        return;
      }
      
      const selector = this.getElementSelector(target);
      const wheelInfo = `deltaX:${event.deltaX.toFixed(1)}, deltaY:${event.deltaY.toFixed(1)}, deltaZ:${event.deltaZ.toFixed(1)}`;
      
      console.log(`🎡 [Wheel] ${selector} (${wheelInfo})`);
      this.recordWheel(selector, wheelInfo);
    }, true);

    // Capture drag and drop events - store dragstart for later combination with drop
    document.addEventListener('dragstart', (event) => {
      if (!this.currentSession) return;
      
      const target = event.target as HTMLElement;
      
      // Only record drags within the task content area
      if (!this.isWithinTaskContent(target)) {
        return;
      }
      
      const xpath = this.getElementXPath(target);
      // Store drag start info for later combination with drop
      this.activeDragOperation = {
        sourceElement: xpath,
        sourcePosition: { x: event.clientX, y: event.clientY },
        startTime: event.timeStamp
      };
      console.log(`[Drag Start] ${xpath} at (${event.clientX}, ${event.clientY})`);
    }, true);

    document.addEventListener('drop', (event) => {
      if (!this.currentSession) return;
      
      const target = event.target as HTMLElement;
      
      // Only record drops within the task content area
      if (!this.isWithinTaskContent(target)) {
        return;
      }
      
      const xpath = this.getElementXPath(target);
      
      // If we have an active drag operation, record the complete drag action
      if (this.activeDragOperation) {
        // Create synthetic dragstart event for recordDrag method
        const syntheticDragStart = {
          clientX: this.activeDragOperation.sourcePosition.x,
          clientY: this.activeDragOperation.sourcePosition.y,
          timeStamp: this.activeDragOperation.startTime
        } as DragEvent;
        
        this.recordDrag(
          this.activeDragOperation.sourceElement,
          xpath,
          syntheticDragStart,
          event
        );
        
        // Clear the active drag operation
        this.activeDragOperation = null;
      } else {
        console.log(`[Drop] ${xpath} - No active drag operation found`);
      }
    }, true);
  }

  /**
   * Generate an XPath for an element - more precise than CSS selectors
   */
  private getElementXPath(element: HTMLElement): string {
    if (!element || element === document.body) {
      return '/html/body';
    }

    // Handle document element
    if (element === document.documentElement) {
      return '/html';
    }

    let xpath = '';
    let currentElement = element;

    while (currentElement && currentElement !== document.body) {
      const tagName = currentElement.tagName.toLowerCase();
      
      if (currentElement.id) {
        // If element has ID, use it for precision
        xpath = `//${tagName}[@id='${currentElement.id}']` + xpath;
        break;
      } else {
        // Count siblings of same type
        const siblings = Array.from(currentElement.parentNode?.children || [])
          .filter(sibling => sibling.tagName === currentElement.tagName);
        
        if (siblings.length > 1) {
          const index = siblings.indexOf(currentElement) + 1;
          xpath = `/${tagName}[${index}]` + xpath;
        } else {
          xpath = `/${tagName}` + xpath;
        }
      }
      
      currentElement = currentElement.parentElement as HTMLElement;
    }

    return '/html/body' + xpath;
  }

  /**
   * Generate a CSS selector for an element - optimized for clustering analysis
   */
  private getElementSelector(element: HTMLElement): string {
    try {
      const tag = element.tagName.toLowerCase();
    
      // Priority 1: ID (best for clustering - unique identifier)
      if (element.id) {
        return `${tag}#${element.id}`;
      }
      
      // Priority 2: data-testid (designed for testing)
      if (element.dataset.testid) {
        return `${tag}[data-testid="${element.dataset.testid}"]`;
      }
      
      // Priority 3: name attribute (good for form controls)
      if (element.getAttribute('name')) {
        return `${tag}[name="${element.getAttribute('name')}"]`;
      }
      
      // Priority 4: Classes (good for clustering similar elements)
      if (element.className) {
        const classNameStr = typeof element.className === 'string' 
          ? element.className 
          : String(element.className);
        
        const classes = classNameStr.split(' ')
          .filter((c: string) => c.trim() && !c.startsWith('hover:') && !c.startsWith('focus:')) // Filter out Tailwind state classes
          .slice(0, 3); // Take up to 3 most relevant classes
        
        if (classes.length > 0) {
          return `${tag}.${classes.join('.')}`;
        }
      }
      
      // Priority 5: Type attribute (for input elements)
      if (element.getAttribute('type')) {
        return `${tag}[type="${element.getAttribute('type')}"]`;
      }
      
      // Priority 6: Role attribute (semantic meaning)
      if (element.getAttribute('role')) {
        return `${tag}[role="${element.getAttribute('role')}"]`;
      }
      
      // Priority 7: Aria-label (accessibility info)
      if (element.getAttribute('aria-label')) {
        const label = element.getAttribute('aria-label')!.substring(0, 20);
        return `${tag}[aria-label="${label}"]`;
      }
      
      // Priority 8: Placeholder (for inputs)
      if (element.getAttribute('placeholder')) {
        const placeholder = element.getAttribute('placeholder')!.substring(0, 20);
        return `${tag}[placeholder="${placeholder}"]`;
      }
      
      // Priority 9: Text content (for buttons, links, etc.)
      const text = element.textContent?.trim();
      if (text && text.length > 0 && text.length <= 50) {
        return `${tag}:"${text.substring(0, 20)}"`;
      }
      
      // Priority 10: Position-based selector (last resort)
      const parent = element.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(element) + 1;
          return `${tag}:nth-of-type(${index})`;
        }
      }
    
      // Final fallback
      return tag;
    } catch (error) {
      // Error handling - return a safe fallback
      console.warn('[HumanEval] Error generating selector:', error);
      return element.tagName ? element.tagName.toLowerCase() : 'unknown';
    }
  }

  /**
   * Setup automatic session detection based on URL
   */
  private setupAutoSessionDetection(): void {
    if (!this.isEnabled || typeof window === 'undefined') return;

    // Check current URL and auto-start session if in test mode
    this.checkAndStartSession();

    // Listen for URL changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => humanEvalTracker.checkAndStartSession(), 100);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => humanEvalTracker.checkAndStartSession(), 100);
    };

    window.addEventListener('popstate', () => {
      setTimeout(() => this.checkAndStartSession(), 100);
    });
  }

  // App state monitoring removed - no longer needed with direct test result events

  /**
   * Get the final test result from test_result events (much simpler now)
   */
  private getLatestTestResult(): 'code#0' | 'code#1' {
    // Look for the latest test_result event
    for (let i = this.stepBuffer.length - 1; i >= 0; i--) {
      const step = this.stepBuffer[i];
      if (step.action.type === 'test_result') {
        const result = step.action.testSuccess ? 'code#1' : 'code#0';
        this.originalConsoleLog(`[Debug] Using test result from step ${step.stepNumber}: ${result}`);
        return result;
      }
    }
    
    // Fallback: check current DOM status
    this.originalConsoleLog(`[Debug] No test_result events found, checking DOM`);
    return this.getCurrentTestStatus();
  }

  /**
   * Get current test status by checking DOM only (clean solution)
   */
  private getCurrentTestStatus(): 'code#0' | 'code#1' {
    // Look for the test status display in TaskWrapper
    const statusElements = document.querySelectorAll('span.font-mono.text-sm.text-gray-700');
    
    let foundElements = [];
    for (const element of statusElements) {
      const text = element.textContent?.trim();
      foundElements.push(text);
      if (text === 'code#1') {
        console.log(`🎯 [DOM Success] Found code#1 in DOM`);
        return 'code#1';
      }
      if (text === 'code#0') {
        console.log(`❌ [DOM Failure] Found code#0 in DOM`);
        return 'code#0';
      }
    }
    
    // Fallback: look for any element containing code#1 or code#0
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      const text = element.textContent?.trim();
      if (text === 'code#1') {
        console.log(`🎯 [DOM Fallback] Found code#1 in ${element.tagName.toLowerCase()}.${element.className}`);
        return 'code#1';
      }
    }
    return 'code#0'; // Default to incomplete
  }
  
  
  /**
   * Get current test status from the DOM (fallback method)
   */
  private getTestStatusFromDOM(): 'code#0' | 'code#1' {
    // Debug: Let's find ALL elements that might contain code#0 or code#1
    const allElements = document.querySelectorAll('*');
    const potentialElements = [];
    
    for (const element of allElements) {
      const text = element.textContent?.trim();
      if (text === 'code#0' || text === 'code#1') {
        potentialElements.push({
          tag: element.tagName.toLowerCase(),
          classes: element.className,
          text: text,
          element: element
        });
      }
    }
    
    this.originalConsoleLog(`[Debug] Found ${potentialElements.length} elements with code status:`, potentialElements);
    
    // Look for code#1 first (success)
    for (const item of potentialElements) {
      if (item.text === 'code#1') {
        this.originalConsoleLog(`[Debug] ✅ Found code#1 in ${item.tag}.${item.classes}`);
        return 'code#1';
      }
    }
    
    // Then look for code#0 (failure)
    for (const item of potentialElements) {
      if (item.text === 'code#0') {
        this.originalConsoleLog(`[Debug] ❌ Found code#0 in ${item.tag}.${item.classes}`);
        return 'code#0';
      }
    }
    
    // Additional debug: log all elements that might contain the status
    this.originalConsoleLog(`[Debug] No code status found in DOM, defaulting to code#0`);
    return 'code#0'; // Default to incomplete
  }

  /**
   * Check current URL and start session if appropriate
   */
  private checkAndStartSession(): void {
    const url = window.location.pathname + window.location.search;
    
    // Parse app and task from URL
    const pathParts = window.location.pathname.split('/').filter(p => p);
    if (pathParts.length >= 2) {
      const app = pathParts[0];
      const taskId = parseInt(pathParts[1]);
      
      if (!isNaN(taskId)) {
        // Check if we need to start a new session
        const currentApp = this.currentSession?.app;
        const currentTaskId = this.currentSession?.taskId;
        
        if (!this.currentSession || 
            currentApp !== app || 
            currentTaskId !== taskId) {
          
          // End current session if exists
          if (this.currentSession) {
            const prevApp = this.currentSession.app;
            const prevTaskId = this.currentSession.taskId;
            this.endSession(); // Automatically determines status from test_result events
            console.log(`[Auto Session] Ended previous session for ${prevApp}/task-${prevTaskId}`);
          }
          
          // Start new session
          this.startSession(app, taskId, url);
          console.log(`[Auto Session] Detected task navigation, started tracking for ${app}/task-${taskId}`);
        }
      }
    } else {
      // Not in a task page - end current session if exists
      if (this.currentSession) {
        const prevApp = this.currentSession.app;
        const prevTaskId = this.currentSession.taskId;
        console.log(`[Auto Session] Left task area, ending session for ${prevApp}/task-${prevTaskId}`);
        this.endSession(); // Automatically determines status from test_result events
      }
    }
  }
}

// Create singleton instance
export const humanEvalTracker = new HumanEvalTracker();

// Export dev console API functions
declare global {
  interface Window {
    exportHumanEvalData: () => HumanEvalStorage;
    clearHumanEvalData: () => void;
    getCurrentHumanEvalSession: () => HumanEvalCurrentSession | null;
    endCurrentHumanEvalSession: (status?: 'code#0' | 'code#1') => boolean;
    humanEvalTracker: HumanEvalTracker;
  }
}

// Attach global functions to window
if (typeof window !== 'undefined') {
  window.humanEvalTracker = humanEvalTracker;
  
  window.exportHumanEvalData = () => {
    const data = humanEvalTracker.exportData();
    return data;
  };

  window.clearHumanEvalData = () => {
    humanEvalTracker.clearAllData();
  };

  window.getCurrentHumanEvalSession = () => {
    return humanEvalTracker.getCurrentSession();
  };

  window.endCurrentHumanEvalSession = (status: 'code#0' | 'code#1' = 'code#1') => {
    const session = humanEvalTracker.getCurrentSession();
    if (session) {
      humanEvalTracker.endSession();
      console.log(`[Manual End] Ended session ${session.sessionId} with status ${status}`);
      return true;
    } else {
      console.log('[Manual End] No active session to end');
      return false;
    }
  };
}

// Test function for Phase 1
export function testHumanEvalTracker() {
  console.log('=== Testing HumanEvalTracker ===');

  // Clear any existing data
  humanEvalTracker.clearAllData();

  // Test 1: Start a session
  console.log('\n1. Starting session...');
  const sessionId = humanEvalTracker.startSession('combo-box-tasks', 4, '/combo-box-tasks/4?mode=test');
  console.log('Session ID:', sessionId);

  // Test 2: Record some steps
  console.log('\n2. Recording user actions...');
  humanEvalTracker.recordClick('button.submit-btn');
  humanEvalTracker.recordInput('input[name="search"]', 'test query');
  humanEvalTracker.recordKeypress('Enter', 'input[name="search"]');
  
  // Simulate a test result
  humanEvalTracker.recordClick('div.result-item');

  // Test 3: Console log interception
  console.log('\n3. Testing console log interception...');
  console.log('[Test] Task 4: Search functionality working correctly');
  console.log('[Cheat] Use the search box to find the correct item');

  // Test 4: Check current session
  console.log('\n4. Current session info:');
  const currentSession = humanEvalTracker.getCurrentSession();
  console.log(JSON.stringify(currentSession, null, 2));

  // Test 5: End session
  console.log('\n5. Ending session...');
  humanEvalTracker.endSession();

  // Test 6: Check stored data
  console.log('\n6. Stored data:');
  const allSessions = humanEvalTracker.getAllSessions();
  const completedTasks = humanEvalTracker.getCompletedTasks();
  
  console.log('Sessions:', allSessions.length);
  console.log('Completed tasks:', JSON.stringify(completedTasks, null, 2));

  // Test 7: Export data
  console.log('\n7. Testing global export function...');
  if (typeof window !== 'undefined' && window.exportHumanEvalData) {
    const exportedData = window.exportHumanEvalData();
    console.log('Export successful, sessions count:', exportedData.sessions.length);
  } else {
    console.log('Global export functions not available (running in Node.js context)');
  }

  console.log('\n=== Phase 1 Test Complete ===');
}

export default humanEvalTracker;
