import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search as ChevronDown, Calendar, Clock, Navigation as NavigationIcon, TreePine, MapPin, Type } from 'lucide-react';
import { lazy, Suspense } from 'react';

// Create lazy components directly in route rendering to avoid early resolution

// Loading component for lazy-loaded apps
function AppLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading app...</p>
      </div>
    </div>
  );
}

const simpleTasks = [
  {
    id: 'combo-box-tasks',
    name: 'Combo Box Tasks',
    description: '20 different combo box scenarios for testing computer use agents',
    icon: ChevronDown,
    path: '/combo-box-tasks',
  },
  {
    id: 'date-pickers',
    name: 'Date Picker Tasks',
    description: '20 different date picker scenarios for testing temporal interactions',
    icon: Calendar,
    path: '/date-pickers',
  },
  {
    id: 'time-pickers',
    name: 'Time Picker Tasks',
    description: '20 different time picker scenarios for testing temporal interactions',
    icon: Clock,
    path: '/time-pickers',
  },
  {
    id: 'input-boxes',
    name: 'Input Form Tasks',
    description: '20 diverse input form scenarios for testing form interactions and validation',
    icon: Type,
    path: '/input-boxes',
  },
  {
    id: 'navigation-lists-tables',
    name: 'Navigation: Lists & Tables',
    description: '20 navigation patterns for lists, tables, and structured data',
    icon: NavigationIcon,
    path: '/navigation-lists-tables',
  },
  {
    id: 'navigation-hierarchical-spatial',
    name: 'Navigation: Hierarchical & Spatial',
    description: '20 navigation patterns for hierarchical structures, menus, and spatial interfaces',
    icon: TreePine,
    path: '/navigation-hierarchical-spatial',
  },
  {
    id: 'navigation-search-interaction',
    name: 'Navigation: Search & Interaction',
    description: '16 navigation patterns for search, keyboard shortcuts, and spatial interaction',
    icon: MapPin,
    path: '/navigation-search-interaction',
  },
];

const complexTasks = [
  {
    id: 'kanban-board',
    name: 'Kanban Board',
    description: 'UiBench Kanban tasks grouped under the Kanban Board app',
    icon: Type,
    path: '/kanban-board',
  },
  {
    id: 'workday',
    name: 'Workday',
    description: 'UiBench Workday tasks',
    icon: Type,
    path: '/workday',
  },
  {
    id: 'sap-stock',
    name: 'SAP Stock Overview',
    description: 'UiBench SAP stock queries',
    icon: Type,
    path: '/sap-stock',
  },
  {
    id: 'concur',
    name: 'Concur Expense Management',
    description: 'UiBench Concur expense reporting and management tasks',
    icon: Type,
    path: '/concur',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'UiBench Salesforce tasks',
    icon: Type,
    path: '/salesforce',
  },
  {
    id: 'copy-paste-tasks',
    name: 'Copy-Paste & Iteration Tasks',
    description: 'UiBench copy-paste and iterative data manipulation tasks',
    icon: Type,
    path: '/copy-paste-tasks',
  },
  {
    id: 'business-process-tasks',
    name: 'Business Process Tasks',
    description: 'UiBench business process workflows including batch processing, data validation, and compliance tasks',
    icon: Type,
    path: '/business-process-tasks',
  },
];

// Define lazy components only when routes are rendered
const LazyComboBoxTasksApp = lazy(() => import('../apps/combo-box-tasks'));
const LazyDatePickersApp = lazy(() => import('../apps/date-pickers'));
const LazyTimePickersApp = lazy(() => import('../apps/time-pickers'));
const LazyInputBoxesApp = lazy(() => import('../apps/input-boxes'));
const LazyNavigationListsTablesApp = lazy(() => import('../apps/navigation-lists-tables'));
const LazyNavigationHierarchicalSpatialApp = lazy(() => import('../apps/navigation-hierarchical-spatial'));
const LazyNavigationSearchInteractionApp = lazy(() => import('../apps/navigation-search-interaction'));
const LazyKanbanTasksApp = lazy(() => import('../apps/kanban-tasks'));
const LazyWorkdayTasksApp = lazy(() => import('../apps/workday-tasks'));
const LazySAPTasksApp = lazy(() => import('../apps/sap-stock-overview-tasks'));
const LazyConcurTasksApp = lazy(() => import('../apps/concur-tasks'));
const LazySalesforceTasksApp = lazy(() => import('../apps/salesforce-tasks'));
const LazyCopyPasteTasksApp = lazy(() => import('../apps/copy-paste-tasks'));
const LazyBusinessProcessTasksApp = lazy(() => import('../apps/business-process-tasks'));

// Clean implementation - all apps are now lazily loaded via route definitions

function AppSelector() {
  const renderAppGrid = (apps: typeof simpleTasks) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apps.map((app) => {
        const IconComponent = app.icon;
        return (
          <Link
            key={app.id}
            to={app.path}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer block"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {app.name}
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              {app.description}
            </p>
            <div className="mt-4 text-gray-600 group-hover:text-gray-800 text-sm font-medium">
              Click to open →
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Computer Use Playground
          </h1>
        </div>
        
        {/* Simple Tasks Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Simple Tasks</h2>
          {renderAppGrid(simpleTasks)}
        </div>

        {/* Complex Tasks Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Complex Tasks</h2>
          {renderAppGrid(complexTasks)}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppSelector />} />
        {/* Define routes manually to ensure lazy loading works correctly */}
        <Route
          path="/combo-box-tasks/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyComboBoxTasksApp />
            </Suspense>
          }
        />
        <Route
          path="/date-pickers/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyDatePickersApp />
            </Suspense>
          }
        />
        <Route
          path="/time-pickers/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyTimePickersApp />
            </Suspense>
          }
        />
        <Route
          path="/input-boxes/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyInputBoxesApp />
            </Suspense>
          }
        />
        <Route
          path="/navigation-lists-tables/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyNavigationListsTablesApp />
            </Suspense>
          }
        />
        <Route
          path="/navigation-hierarchical-spatial/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyNavigationHierarchicalSpatialApp />
            </Suspense>
          }
        />
        <Route
          path="/navigation-search-interaction/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyNavigationSearchInteractionApp />
            </Suspense>
          }
        />
        <Route
          path="/kanban-board/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyKanbanTasksApp />
            </Suspense>
          }
        />
        <Route
          path="/workday/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyWorkdayTasksApp />
            </Suspense>
          }
        />
        <Route
          path="/sap-stock/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazySAPTasksApp />
            </Suspense>
          }
        />
        <Route
          path="/concur/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyConcurTasksApp />
            </Suspense>
          }
        />
        <Route
          path="/salesforce/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazySalesforceTasksApp />
            </Suspense>
          }
        />
        <Route
          path="/copy-paste-tasks/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyCopyPasteTasksApp />
            </Suspense>
          }
        />
        <Route
          path="/business-process-tasks/:taskId?"
          element={
            <Suspense fallback={<AppLoading />}>
              <LazyBusinessProcessTasksApp />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 