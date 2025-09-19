import React, { useState, useEffect } from 'react';
import { Check, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface DiffItem {
  id: string;
  lineNumber: number;
  oldText: string;
  newText: string;
  type: 'addition' | 'modification' | 'deletion';
  isGood: boolean; // follows rules
  explanation: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const Task20: React.FC = () => {
  const [diffs, setDiffs] = useState<DiffItem[]>([]);
  const [selectedDiff, setSelectedDiff] = useState<string | null>(null);

  // Generate deterministic diffs
  useEffect(() => {
    const diffItems: DiffItem[] = [
      // GOOD DIFF 1: Acronym properly explained
      {
        id: 'diff-1',
        lineNumber: 12,
        oldText: 'The deployment uses CI process for automated testing.',
        newText: 'The deployment uses CI (Continuous Integration) process for automated testing.',
        type: 'modification',
        isGood: true,
        explanation: 'Correctly explains acronym "CI" on first use',
        status: 'pending'
      },
      
      // BAD DIFF 1: Date in wrong format
      {
        id: 'diff-2',
        lineNumber: 18,
        oldText: 'Testing phase completed.',
        newText: 'Testing phase completed on 03/10/2024.',
        type: 'modification',
        isGood: false,
        explanation: 'Date should be in yyyy-mm-dd format, not mm/dd/yyyy',
        status: 'pending'
      },
      
      // GOOD DIFF 2: Date format corrected
      {
        id: 'diff-3',
        lineNumber: 24,
        oldText: 'Release scheduled for March 15, 2024.',
        newText: 'Release scheduled for 2024-03-15.',
        type: 'modification',
        isGood: true,
        explanation: 'Correctly formats date as yyyy-mm-dd',
        status: 'pending'
      },
      
      // GOOD DIFF 3: Another acronym properly explained
      {
        id: 'diff-4',
        lineNumber: 36,
        oldText: 'API endpoints must be documented.',
        newText: 'API (Application Programming Interface) endpoints must be documented.',
        type: 'modification',
        isGood: true,
        explanation: 'Correctly explains acronym "API" on first use',
        status: 'pending'
      },
      
      // BAD DIFF 2: Acronym not explained
      {
        id: 'diff-5',
        lineNumber: 42,
        oldText: 'Database backup required.',
        newText: 'Database backup via RDBMS required.',
        type: 'modification',
        isGood: false,
        explanation: 'Acronym "RDBMS" not explained on first use',
        status: 'pending'
      },
      
      // BAD DIFF 3: Contains PII (personal name)
      {
        id: 'diff-6',
        lineNumber: 48,
        oldText: 'The system administrator will configure the environment.',
        newText: 'John Smith will configure the environment.',
        type: 'modification',
        isGood: false,
        explanation: 'Contains PII (personal name) which should not appear in documentation',
        status: 'pending'
      }
    ];

    setDiffs(diffItems);
  }, []);

  const handleDiffAction = (diffId: string, action: 'accept' | 'reject') => {
    setDiffs(prev => prev.map(diff => {
      if (diff.id === diffId) {
        const newStatus = action === 'accept' ? 'accepted' : 'rejected';
        // If already selected, allow to toggle back to pending
        if (diff.status === newStatus) {
          return { ...diff, status: 'pending' };
        }
        return { ...diff, status: newStatus };
      }
      return diff;
    }));
  };

  // Expose state for testing
  useEffect(() => {
    (window as any).app_state = {
      diffs,
      selectedDiff,
      goodDiffs: diffs.filter(d => d.isGood),
      badDiffs: diffs.filter(d => !d.isGood),
      acceptedDiffs: diffs.filter(d => d.status === 'accepted'),
      rejectedDiffs: diffs.filter(d => d.status === 'rejected'),
      completedReview: diffs.every(d => d.status !== 'pending')
    };
  }, [diffs, selectedDiff]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getContextLines = (lineNumber: number, type: 'before' | 'after') => {
    // Generate some context lines for the document
    const contextMap: Record<number, string[]> = {
      10: ['## Deployment Process Overview', 'This document outlines the standard deployment workflow.'],
      11: ['This document outlines the standard deployment workflow.', 'All teams must follow these procedures.'],
      12: ['All teams must follow these procedures.', 'The deployment uses CI process for automated testing.'],
      13: ['The deployment uses CI process for automated testing.', 'Each stage must be completed before proceeding.'],
      
      22: ['### Release Schedule', 'The following timeline applies to all releases:'],
      23: ['The following timeline applies to all releases:', '- Code freeze: One week prior'],
      24: ['- Code freeze: One week prior', 'Release scheduled for March 15, 2024.'],
      25: ['Release scheduled for March 15, 2024.', '- Post-release monitoring: 48 hours'],
      
      16: ['### Testing Requirements', 'All code changes require comprehensive testing.'],
      17: ['All code changes require comprehensive testing.', 'Unit tests must achieve 90% coverage.'],
      18: ['Unit tests must achieve 90% coverage.', 'Testing phase completed.'],
      19: ['Testing phase completed.', 'Integration tests follow unit testing.'],
      
      34: ['## Documentation Standards', 'All external interfaces must be properly documented.'],
      35: ['All external interfaces must be properly documented.', 'This includes REST endpoints and data schemas.'],
      36: ['This includes REST endpoints and data schemas.', 'API endpoints must be documented.'],
      37: ['API endpoints must be documented.', 'Include request/response examples.'],
      
      40: ['### Backup Procedures', 'Data integrity is critical during deployments.'],
      41: ['Data integrity is critical during deployments.', 'Always create backups before major changes.'],
      42: ['Always create backups before major changes.', 'Database backup required.'],
      43: ['Database backup required.', 'Verify backup completion before proceeding.'],
      
      46: ['### Environment Setup', 'Server configuration requires proper access controls.'],
      47: ['Server configuration requires proper access controls.', 'Only authorized personnel should have admin access.'],
      48: ['Only authorized personnel should have admin access.', 'The system administrator will configure the environment.'],
      49: ['The system administrator will configure the environment.', 'All configurations must be documented.']
    };

    return contextMap[lineNumber] || ['...', '...'];
  };

  const completedCount = diffs.filter(d => d.status !== 'pending').length;
  const progressPercentage = (completedCount / diffs.length) * 100;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content - Table Layout */}
      <div className="w-full">
        {/* Scrollable Table Content */}
        <div className="overflow-auto" style={{height: 'calc(100vh - 0px)'}}>
          <table className="w-full">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-24" />
              <col className="w-1/2" />
            </colgroup>
            <thead className="sticky top-0 bg-gray-50 border-b z-10">
              <tr>
                <th className="p-4 border-r border-gray-300 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Draft 1 (Original)</h2>
                    <span className="text-sm text-gray-500">deployment-guide.md</span>
                  </div>
                </th>
                <th className="p-4 border-r border-gray-300 bg-gray-100">
                  <div className="text-center text-xs font-medium text-gray-700">Actions</div>
                </th>
                <th className="p-4 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Draft 2 (Revised)</h2>
                    <span className="text-sm text-gray-500">deployment-guide.md</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {/* Context and diff rows */}
              {diffs.map((diff) => {
                const contextBefore = getContextLines(diff.lineNumber - 1, 'before');
                const contextAfter = getContextLines(diff.lineNumber + 1, 'after');
                
                return (
                  <React.Fragment key={diff.id}>
                    {/* Context lines before */}
                    {contextBefore.map((line, idx) => (
                      <tr key={`context-before-${diff.id}-${idx}`}>
                        <td className="p-2 text-gray-600 border-r border-gray-300 bg-white">
                          <span className="text-gray-400 w-8 inline-block text-right mr-4">
                            {diff.lineNumber - 2 + idx}
                          </span>
                          {line}
                        </td>
                        <td className="bg-gray-100 border-r border-gray-300"></td>
                        <td className="p-2 text-gray-600 bg-white">
                          <span className="text-gray-400 w-8 inline-block text-right mr-4">
                            {diff.lineNumber - 2 + idx}
                          </span>
                          {line}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Diff line */}
                    <tr key={`diff-${diff.id}`}>
                      {/* Original text */}
                      <td 
                        className={`p-2 border-r border-gray-300 transition-colors ${
                          selectedDiff === diff.id 
                            ? 'bg-red-100 border-l-4 border-red-400' 
                            : 'bg-red-50 hover:bg-red-100'
                        }`}
                      >
                        <span className="text-gray-400 w-8 inline-block text-right mr-4">
                          {diff.lineNumber}
                        </span>
                        <span className="line-through text-red-700">{diff.oldText}</span>
                      </td>
                      
                      {/* Action buttons */}
                      <td 
                        className="bg-gray-100 border-r border-gray-300 text-center group"
                        onMouseEnter={() => setSelectedDiff(diff.id)}
                      >
                        <div className="py-1 px-2">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleDiffAction(diff.id, 'accept')}
                              className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
                                diff.status === 'accepted'
                                  ? 'bg-green-600 text-white ring-2 ring-green-300 opacity-100'
                                  : diff.status === 'rejected'
                                  ? 'bg-gray-200 text-gray-500 hover:bg-green-100 hover:text-green-600 opacity-0 group-hover:opacity-100'
                                  : 'bg-green-100 text-green-600 hover:bg-green-600 hover:text-white opacity-0 group-hover:opacity-100'
                              }`}
                              title={diff.status === 'accepted' ? 'Already accepted (click to change)' : 'Accept change'}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDiffAction(diff.id, 'reject')}
                              className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
                                diff.status === 'rejected'
                                  ? 'bg-red-600 text-white ring-2 ring-red-300 opacity-100'
                                  : diff.status === 'accepted'
                                  ? 'bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100'
                                  : 'bg-red-100 text-red-600 hover:bg-red-600 hover:text-white opacity-0 group-hover:opacity-100'
                              }`}
                              title={diff.status === 'rejected' ? 'Already rejected (click to change)' : 'Reject change'}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      
                      {/* New text */}
                      <td 
                        className={`p-2 transition-colors ${
                          selectedDiff === diff.id 
                            ? 'bg-green-100 border-l-4 border-green-400' 
                            : 'bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        <span className="text-gray-400 w-8 inline-block text-right mr-4">
                          {diff.lineNumber}
                        </span>
                        <span className="text-green-700 font-medium">{diff.newText}</span>
                      </td>
                    </tr>
                    
                    {/* Context lines after */}
                    {contextAfter.map((line, idx) => (
                      <tr key={`context-after-${diff.id}-${idx}`}>
                        <td className="p-2 text-gray-600 border-r border-gray-300 bg-white">
                          <span className="text-gray-400 w-8 inline-block text-right mr-4">
                            {diff.lineNumber + 1 + idx}
                          </span>
                          {line}
                        </td>
                        <td className="bg-gray-100 border-r border-gray-300"></td>
                        <td className="p-2 text-gray-600 bg-white">
                          <span className="text-gray-400 w-8 inline-block text-right mr-4">
                            {diff.lineNumber + 1 + idx}
                          </span>
                          {line}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Spacer row */}
                    <tr key={`spacer-${diff.id}`}>
                      <td className="h-4 border-r border-gray-300 bg-white"></td>
                      <td className="h-4 bg-gray-100 border-r border-gray-300"></td>
                      <td className="h-4 bg-white"></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completion Message */}
      {completedCount === diffs.length && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-50 rounded-lg border border-green-200 shadow-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Review Complete!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            All {diffs.length} changes have been reviewed.
          </p>
        </div>
      )}
    </div>
  );
};

export default Task20;