// Salesforce Tasks for Computer Use Testing
// ============================================================================

export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  expectedOutcome: string;
  category: string;
}

// Initial task definitions - will be expanded as we build more features
export const SALESFORCE_TASKS: TaskDefinition[] = [
  {
    id: 'sf-navigate-home',
    name: 'Navigate to Salesforce Home',
    description: 'Open the Salesforce app and verify homepage displays correctly',
    instructions: [
      'Click on the Salesforce CRM app from the main app selector',
      'Verify the homepage loads with dashboard widgets',
      'Check that the navigation tabs are visible (Home, Chatter, Campaigns, Leads, etc.)'
    ],
    expectedOutcome: 'Homepage displays with proper navigation and dashboard widgets',
    category: 'Navigation'
  },
  {
    id: 'sf-app-launcher',
    name: 'Use App Launcher',
    description: 'Test the App Launcher modal functionality',
    instructions: [
      'Click the App Launcher button (grid icon) in the top-left',
      'Verify the App Launcher modal opens',
      'Type "Marketing" in the search box',
      'Click on Marketing CRM Classic',
      'Verify navigation works correctly'
    ],
    expectedOutcome: 'App Launcher opens, search works, and navigation functions properly',
    category: 'Navigation'
  }
];

// Export for future task runner integration
export default SALESFORCE_TASKS;
