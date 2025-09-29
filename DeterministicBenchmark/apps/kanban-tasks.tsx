import React from 'react';
import TaskWrapper from '../src/TaskWrapper';
import KanbanApp from './kanban';

type UiBenchTask = {
  id: string;
  instructions: string;
  test?: () => { success: boolean; message?: string };
  require_result_submission?: boolean;
};

const uiBenchTasks: UiBenchTask[] = [
  {
    id: 'kanban-create-dark-mode-issue',
    instructions: "Create a new issue with title 'Add dark mode to the UI' for Anna Petrov priority Low",
    test: () => {
      const currentTasks = (window as any).app_state?.tasks;
      if (!currentTasks) {
        return { success: false, message: 'App state not found.' };
      }
      const targetTask = currentTasks.find((t: any) => t.title === 'Add dark mode to the UI');
      if (!targetTask) {
        return { success: false, message: 'Task with title "Add dark mode to the UI" was not found.' };
      }
      if (!targetTask.assignee || targetTask.assignee.name !== 'Anna Petrov') {
        return { success: false, message: `Task is not assigned to Anna Petrov. Current assignee: ${targetTask.assignee?.name || 'Unassigned'}` };
      }
      if (targetTask.priority !== 'low') {
        return { success: false, message: `Task priority is not Low. Current priority: ${targetTask.priority}` };
      }
      if (targetTask.type !== 'task') {
        return { success: false, message: `Task type is not correct. Current type: ${targetTask.type}` };
      }
      if (targetTask.project !== 'ComputerVision') {
        return { success: false, message: `Task is not in the correct project. Current project: ${targetTask.project}` };
      }
      return { success: true, message: 'Task successfully created with correct title, assignee, and priority.' };
    }
  },
  {
    id: 'kanban-set-ml2445-status-done',
    instructions: 'Set ML-2445 status to Done',
    test: () => {
      const currentTasks = (window as any).app_state?.tasks;
      if (!currentTasks) {
        return { success: false, message: 'App state not found.' };
      }
      const targetTask = currentTasks.find((t: any) => t.id === 'ML-2445');
      if (!targetTask) {
        return { success: false, message: 'Task ML-2445 was not found.' };
      }
      if (targetTask.status !== 'done') {
        return { success: false, message: `Task ML-2445 status is not Done. Current status: ${targetTask.status}` };
      }
      return { success: true, message: 'Task ML-2445 status has been successfully set to Done.' };
    }
  },
  {
    id: 'kanban-mark-all-issues-done',
    instructions: 'Drag issues from To Do and In Progress columns into the Done column',
    test: () => {
      const currentTasks = (window as any).app_state?.tasks;
      const operationHistory = (window as any).app_state?.operationHistory;
      
      if (!currentTasks) {
        return { success: false, message: 'App state not found.' };
      }
      if (currentTasks.length === 0) {
        return { success: false, message: 'No tasks found in the app state.' };
      }
      
      // Check if all tasks are marked as done
      const allTasksDone = currentTasks.every((task: any) => task.status === 'done');
      if (!allTasksDone) {
        const incompleteTasks = currentTasks.filter((task: any) => task.status !== 'done');
        const taskIds = incompleteTasks.map((task: any) => task.id).join(', ');
        return { success: false, message: `Not all tasks are marked as Done. Incomplete tasks: ${taskIds}` };
      }
      
      // Check if drag and drop operations were used
      if (!operationHistory || !Array.isArray(operationHistory)) {
        return { success: false, message: 'Operation history not found. Please use drag and drop to move tasks.' };
      }
      
      const dragDropOps = operationHistory.filter((op: any) => op.type === 'drag_drop');
      if (dragDropOps.length === 0) {
        return { success: false, message: 'No drag and drop operations detected. Please drag tasks from To Do and In Progress columns to the Done column.' };
      }
      
      // Check if tasks were dragged to 'done' status
      const doneDragOps = dragDropOps.filter((op: any) => op.toStatus === 'done');
      if (doneDragOps.length === 0) {
        return { success: false, message: 'No tasks were dragged to Done status. Please drag tasks to the Done column.' };
      }
      
      // Check that ALL tasks were moved via drag and drop (no bulk operations allowed)
      const bulkOps = operationHistory.filter((op: any) => op.type === 'bulk_update');
      if (bulkOps.length > 0) {
        return { success: false, message: 'Bulk operations detected. All tasks must be moved individually using drag and drop, not bulk actions.' };
      }
      
      // Check that all tasks that were originally in To Do and In Progress were moved via drag and drop
      const originalTodoProgressTasks = ['ML-2438', 'ML-2445', 'ML-2442', 'ML-2443']; // Tasks that were originally in To Do and In Progress
      const draggedTaskIds = doneDragOps.map((op: any) => op.taskId);
      
      // All original To Do and In Progress tasks must have been dragged individually
      const undraggedOriginalTasks = originalTodoProgressTasks.filter((taskId: any) => !draggedTaskIds.includes(taskId));
      if (undraggedOriginalTasks.length > 0) {
        return { success: false, message: `Some original To Do and In Progress tasks were not moved via drag and drop. Tasks that must be dragged individually: ${undraggedOriginalTasks.join(', ')}` };
      }
      
      return { success: true, message: 'All tasks have been successfully marked as Done using drag and drop operations.' };
    }
  },
  {
    id: 'kanban-find-least-recently-updated',
    instructions: 'What is the task least recently updated? Format JSON response as {"key": str, "summary": str, "assignee": str, "updated": str}, and use the Submit Results button to send it.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      if (!submission) {
        return { success: false, message: 'No submission found in app state.' };
      }
      if (typeof submission !== 'object' || submission === null) {
        return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      }
      const requiredProperties = ['key', 'summary', 'assignee', 'updated'];
      for (const prop of requiredProperties) {
        if (!submission[prop] || typeof submission[prop] !== 'string') {
          return { success: false, message: `Submission missing or invalid property '${prop}'. Got: ${JSON.stringify(submission)}` };
        }
      }
      const expectedSubmission = {
        key: 'ML-2444',
        summary: 'Fix model fallback at request-time',
        assignee: 'Lisa Zhang',
        updated: '2024-01-08'
      };
      if (JSON.stringify(submission) !== JSON.stringify(expectedSubmission)) {
        return { success: false, message: `Submission does not match expected least recently updated task. Expected: ${JSON.stringify(expectedSubmission)}, Got: ${JSON.stringify(submission)}` };
      }
      return { success: true, message: 'Successfully identified the least recently updated task.' };
    }
  },
  {
    id: 'kanban-delete-todo-inprogress-issues',
    instructions: 'Delete all issues from To Do and In Progress columns',
    test: () => {
      const currentTasks = (window as any).app_state?.tasks;
      if (!currentTasks) {
        return { success: false, message: 'App state not found.' };
      }
      
      // Get the original task IDs that were in todo and progress columns
      const originalTodoProgressTasks = ['ML-2438', 'ML-2445', 'ML-2442', 'ML-2443'];
      
      // Check if any of these original tasks still exist in the system
      const remainingOriginalTasks = currentTasks.filter((task: any) => 
        originalTodoProgressTasks.includes(task.id)
      );
      
      if (remainingOriginalTasks.length > 0) {
        const remainingTaskIds = remainingOriginalTasks.map((task: any) => task.id).join(', ');
        return { success: false, message: `Original To Do and In Progress tasks still exist in the system. Remaining tasks: ${remainingTaskIds}. Tasks must be deleted, not just moved to Done.` };
      }
      
      return { success: true, message: 'All issues from To Do and In Progress columns have been successfully deleted.' };
    }
  },
  {
    id: 'kanban-list-view-filter-todo-mark-done',
    instructions: 'Go into List view, filter by status: To Do, select all issues and make them done',
    test: () => {
      const currentTasks = (window as any).app_state?.tasks;
      const operationHistory = (window as any).app_state?.operationHistory;
      const currentView = (window as any).app_state?.currentView;
      const filters = (window as any).app_state?.filters;
      
      if (!currentTasks) {
        return { success: false, message: 'App state not found.' };
      }
      
      // Check if all original To Do tasks are now marked as done
      const originalTodoTasks = ['ML-2438', 'ML-2442', 'ML-2443']; // Tasks that were originally in To Do status
      
      const todoTasks = currentTasks.filter((task: any) => 
        originalTodoTasks.includes(task.id) && task.status === 'todo'
      );
      
      if (todoTasks.length > 0) {
        const remainingTodoTaskIds = todoTasks.map((task: any) => task.id).join(', ');
        return { success: false, message: `Some To Do tasks are still not marked as done. Remaining To Do tasks: ${remainingTodoTaskIds}` };
      }
      
      // Verify that the original To Do tasks are now done
      const doneTasks = currentTasks.filter((task: any) => 
        originalTodoTasks.includes(task.id) && task.status === 'done'
      );
      
      if (doneTasks.length !== originalTodoTasks.length) {
        return { success: false, message: `Not all original To Do tasks have been marked as done. Expected ${originalTodoTasks.length} tasks to be done, but found ${doneTasks.length}` };
      }
      
      // Check if bulk operations were used in list view
      if (!operationHistory || !Array.isArray(operationHistory)) {
        return { success: false, message: 'Operation history not found. Please use the List view to complete this task.' };
      }
      
      const bulkOps = operationHistory.filter((op: any) => op.type === 'bulk_update');
      if (bulkOps.length === 0) {
        return { success: false, message: 'No bulk operations detected. Please select all issues and use bulk actions in List view.' };
      }
      
      // Check if bulk operation was done in list view
      const listViewBulkOps = bulkOps.filter((op: any) => op.view === 'list');
      if (listViewBulkOps.length === 0) {
        return { success: false, message: 'Bulk operations were not performed in List view. Please switch to List view and use bulk actions.' };
      }
      
      // Check if To Do filter was used
      const todoFilterOps = bulkOps.filter((op: any) => op.filters && op.filters.status === 'todo');
      if (todoFilterOps.length === 0) {
        return { success: false, message: 'Tasks were not filtered by To Do status. Please filter by To Do status before selecting all issues.' };
      }
      
      return { success: true, message: 'Successfully switched to List view, filtered by To Do status, selected all issues, and marked them as done using bulk operations.' };
    }
  },
  {
    id: 'kanban-list-view-sort-created-report-ids',
    instructions: 'Go into List view and report the IDs of the first created task and last created task. You can sort by clicking the "Created" column header. Format JSON response as {"first_created_task": "yyyy-mm-dd", "last_created_task": "yyyy-mm-dd"}, and use the Submit Results button to send it.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      const currentView = (window as any).app_state?.currentView;
      const operationHistory = (window as any).app_state?.operationHistory;
      
      // ========================
      // CHEAT SYSTEM - Simple JSON display
      // ========================
      console.log(`[Cheat] Expected: {"first_created_task": "2024-01-01", "last_created_task": "2024-01-15"}`);
      
      if (!submission) {
        return { success: false, message: 'No submission found in app state.' };
      }
      
      if (typeof submission !== 'object' || submission === null) {
        return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      }
      
      // Check if user was in List view
      if (currentView !== 'list') {
        return { success: false, message: 'Task must be completed in List view. Please switch to List view first.' };
      }
      
      // Check if user clicked on the Created column header (sorting operation)
      if (!operationHistory || !Array.isArray(operationHistory)) {
        return { success: false, message: 'Operation history not found. Please click on the "Created" column header to sort.' };
      }
      
      const sortOps = operationHistory.filter((op: any) => op.type === 'sort' && op.field === 'created');
      if (sortOps.length === 0) {
        return { success: false, message: 'No sorting by Created column detected. Please click on the "Created" column header to sort the tasks.' };
      }
      
      // Validate submission format
      const requiredProperties = ['first_created_task', 'last_created_task'];
      for (const prop of requiredProperties) {
        if (!submission[prop] || typeof submission[prop] !== 'string') {
          return { success: false, message: `Submission missing or invalid property '${prop}'. Got: ${JSON.stringify(submission)}` };
        }
      }
      
      // Expected submission based on the initial task data
      const expectedSubmission = {
        first_created_task: '2024-01-01', // ML-2444 was created first
        last_created_task: '2024-01-15'   // ML-2438 was created last
      };
      
      if (JSON.stringify(submission) !== JSON.stringify(expectedSubmission)) {
        return { success: false, message: `Submission does not match expected first and last created tasks. Expected: ${JSON.stringify(expectedSubmission)}, Got: ${JSON.stringify(submission)}` };
      }
      
      return { success: true, message: 'Successfully identified the first and last created tasks in List view.' };
    }
  },
  {
    id: 'kanban-count-issues-by-priority',
    instructions: 'Count issues by priority. Format JSON response as {"high_priority_count": int, "medium_priority_count": int, "low_priority_count": int}, and use the Submit Results button to send it.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      const currentTasks = (window as any).app_state?.tasks;
      
      // ========================
      // CHEAT SYSTEM - Simple JSON display
      // ========================
      console.log(`[Cheat] Expected: {"high_priority_count": 3, "medium_priority_count": 3, "low_priority_count": 1}`);
      
      if (!submission) {
        return { success: false, message: 'No submission found in app state.' };
      }
      
      if (typeof submission !== 'object' || submission === null) {
        return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      }
      
      // Validate submission format
      const requiredProperties = ['high_priority_count', 'medium_priority_count', 'low_priority_count'];
      for (const prop of requiredProperties) {
        if (!(prop in submission) || typeof submission[prop] !== 'number') {
          return { success: false, message: `Submission missing or invalid property '${prop}'. Expected number, got: ${typeof submission[prop]}` };
        }
      }
      
      // Expected counts based on initial task data
      const expectedSubmission = {
        high_priority_count: 3,  // ML-2445, ML-2442, ML-2444
        medium_priority_count: 3, // ML-2438, ML-2443, ML-2439
        low_priority_count: 1     // ML-2441
      };
      
      if (JSON.stringify(submission) !== JSON.stringify(expectedSubmission)) {
        return { success: false, message: `Submission does not match expected counts. Expected: ${JSON.stringify(expectedSubmission)}, Got: ${JSON.stringify(submission)}` };
      }
      
      return { success: true, message: 'Successfully counted issues by priority.' };
    }
  }
];

// DRY: factory that returns a unique component per task but reuses the same body.
function createTaskComponent(): React.FC {
  const C: React.FC = () => <KanbanApp />;
  return C;
}

const tasks = uiBenchTasks.map((t, index) => ({
  id: index + 1,
  name: t.id,
  component: createTaskComponent(),
  task: t.instructions,
  ux: t.require_result_submission
    ? 'Submit the requested JSON via the Submit Results button'
    : 'Interact with the Kanban to satisfy the instructions',
  test: t.test,
  fullWidth: true,
  requireResultSubmission: !!t.require_result_submission,
}));

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Kanban Board', appPath: '/kanban-board' };

const KanbanTasksApp: React.FC = () => {
  return (
    <TaskWrapper tasks={tasks} appName="Kanban Board" appPath="/kanban-board" />
  );
};

export default KanbanTasksApp;


