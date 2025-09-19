import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

// Seeded random number generator for deterministic results
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate realistic test data for 150 tasks
const generateTaskData = () => {
  const rng = new SeededRandom(12345); // Fixed seed for deterministic results
  
  const taskPrefixes = [
    'Implement', 'Fix', 'Update', 'Review', 'Deploy', 'Test', 'Debug', 'Optimize',
    'Refactor', 'Document', 'Migrate', 'Configure', 'Monitor', 'Backup', 'Secure'
  ];
  
  const components = [
    'user authentication system', 'payment gateway', 'database schema', 'API endpoints',
    'frontend components', 'email notifications', 'search functionality', 'reporting dashboard',
    'mobile app interface', 'security protocols', 'backup procedures', 'logging system',
    'cache layer', 'integration tests', 'deployment pipeline', 'monitoring alerts',
    'user permissions', 'data validation', 'performance metrics', 'error handling'
  ];
  
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Open', 'In Progress', 'Review', 'Testing', 'Done'];
  
  const urgentKeywords = [
    'urgent security vulnerability needs immediate attention',
    'urgent production issue affecting all users',
    'critical bug causing urgent data loss',
    'urgent deadline for client presentation tomorrow',
    'server outage requires urgent intervention',
    'urgent compliance issue must be resolved',
    'payment system failure needs urgent fix',
    'urgent performance issue slowing down system',
    'database corruption requiring urgent backup restore',
    'urgent API security patch needed',
    'critical memory leak causing urgent system crashes',
    'urgent customer complaints about login failures'
  ];
  
  const regularDescriptions = [
    'routine maintenance and system updates',
    'standard feature enhancement requested by team',
    'code refactoring to improve maintainability',
    'documentation update for new developers',
    'scheduled backup verification process',
    'regular performance optimization review',
    'standard user interface improvements',
    'routine security audit and compliance check',
    'planned database migration to new version',
    'regular integration with third-party services'
  ];
  
  const tasks = [];
  let urgentCount = 0;
  
  for (let i = 0; i < 150; i++) {
    const taskId = `TSK-2024-${String(i + 1).padStart(3, '0')}`;
    const prefix = taskPrefixes[Math.floor(rng.next() * taskPrefixes.length)];
    const component = components[Math.floor(rng.next() * components.length)];
    
    // Ensure exactly 12 tasks contain "urgent"
    let title, description;
    const shouldBeUrgent = urgentCount < 12 && (rng.next() < 0.12 || (150 - i <= 12 - urgentCount));
    
    if (shouldBeUrgent) {
      urgentCount++;
      if (rng.next() < 0.6) {
        title = `${prefix} ${component} - URGENT`;
        description = regularDescriptions[Math.floor(rng.next() * regularDescriptions.length)];
      } else {
        title = `${prefix} ${component}`;
        description = urgentKeywords[Math.floor(rng.next() * urgentKeywords.length)];
      }
    } else {
      title = `${prefix} ${component}`;
      description = regularDescriptions[Math.floor(rng.next() * regularDescriptions.length)];
    }
    
    tasks.push({
      id: taskId,
      title: title,
      description: description,
      priority: priorities[Math.floor(rng.next() * priorities.length)],
      status: statuses[Math.floor(rng.next() * statuses.length)]
    });
  }
  
  return tasks;
};

const Task6: React.FC = () => {
  const [allTasks] = useState(generateTaskData);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(allTasks);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [emailSent, setEmailSent] = useState(false);
  const hasLoggedOnce = useRef(false);
  
  // Find urgent tasks for testing
  const urgentTasks = allTasks.filter(task => 
    task.title.toLowerCase().includes('urgent') || 
    task.description.toLowerCase().includes('urgent')
  );
  
  // Single-run console logging for human testers
  useEffect(() => {
    if (!hasLoggedOnce.current) {
      console.log('=== EXPECTED VALUES (for testers) ===');
      console.log('Total tasks with "urgent":', urgentTasks.length);
      console.log('Urgent task IDs:', urgentTasks.map(t => t.id).join(', '));
      console.log('Expected urgent tasks:');
      urgentTasks.forEach(task => {
        console.log(`${task.id}: ${task.title} - ${task.description}`);
      });
      hasLoggedOnce.current = true;
    }
  }, [urgentTasks]);
  
  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      allTasks,
      searchResults,
      searchTerm,
      emailForm,
      urgentTasks,
      totalTasks: allTasks.length,
      urgentTaskCount: urgentTasks.length,
      emailSent
    };
  }, [allTasks, searchResults, searchTerm, emailForm, urgentTasks, emailSent]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults(allTasks);
      return;
    }
    
    const filtered = allTasks.filter(task =>
      task.title.toLowerCase().includes(term.toLowerCase()) ||
      task.description.toLowerCase().includes(term.toLowerCase()) ||
      task.id.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleEmailChange = (field: string, value: string) => {
    setEmailForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendEmail = () => {
    if (emailForm.to && emailForm.subject && emailForm.body) {
      setEmailSent(true);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Panel - Search Interface & Results Table */}
      <div className="w-2/3 p-4 bg-white border-r overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Task Search System</h2>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Search Results */}
        <div className="border border-gray-300 rounded overflow-auto max-h-[75vh]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Task ID</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Title</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Description</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Priority</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((task, index) => (
                <tr key={task.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 font-mono text-blue-600">
                    {highlightText(task.id, searchTerm)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {highlightText(task.title, searchTerm)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 max-w-xs">
                    <div className="truncate" title={task.description}>
                      {highlightText(task.description, searchTerm)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                      task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'Done' ? 'bg-green-100 text-green-800' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {searchResults.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No tasks found matching "{searchTerm}"
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {searchResults.length} of {allTasks.length} tasks
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      </div>

      {/* Right Panel - Email Form or Confirmation */}
      <div className="w-1/3 p-4 bg-gray-50 overflow-auto">
        {!emailSent ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Compose Email</h2>
            
            <div className="bg-white p-4 rounded border">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="email"
                    value={emailForm.to}
                    onChange={(e) => handleEmailChange('to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="manager@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => handleEmailChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Urgent Tasks Report"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                  <textarea
                    value={emailForm.body}
                    onChange={(e) => handleEmailChange('body', e.target.value)}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                    placeholder="Create numbered list of urgent task IDs:&#10;1. TSK-2024-001&#10;2. TSK-2024-002&#10;etc."
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSendEmail}
                  disabled={!emailForm.to || !emailForm.subject || !emailForm.body}
                  className="w-full px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Send Email
                </button>
              </div>

            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">Email Sent</h2>
            
            <div className="bg-white p-6 rounded border">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Email Sent Successfully!</h3>
                <p className="text-gray-600 mb-4">
                  Your urgent tasks report has been sent to {emailForm.to}
                </p>
                <div className="bg-gray-50 p-4 rounded text-left text-sm">
                  <div className="mb-2">
                    <span className="font-medium">To:</span> {emailForm.to}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Subject:</span> {emailForm.subject}
                  </div>
                  <div>
                    <span className="font-medium">Message sent at:</span> {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Task6;
