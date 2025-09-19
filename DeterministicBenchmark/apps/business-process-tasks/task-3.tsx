import React, { useState, useEffect } from 'react';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  accessible: boolean;
  children?: FileItem[];
}

interface AccessError {
  message: string;
  suggestions: string[];
}

const Task3: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [currentItems, setCurrentItems] = useState<FileItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['/']);
  const [accessError, setAccessError] = useState<AccessError | null>(null);
  const [accessedFiles, setAccessedFiles] = useState<string[]>([]);
  const [deniedPaths, setDeniedPaths] = useState<string[]>([]);

  // File system structure with protected files and alternative paths
  const fileSystem: FileItem[] = [
    {
      id: 'root',
      name: 'Root',
      type: 'folder',
      path: '/',
      accessible: true,
      children: [
        {
          id: 'secure',
          name: 'secure',
          type: 'folder',
          path: '/secure',
          accessible: false,
          children: [
            {
              id: 'reports',
              name: 'reports',
              type: 'folder',
              path: '/secure/reports',
              accessible: false,
              children: [
                {
                  id: 'financial-report.pdf',
                  name: 'financial-report.pdf',
                  type: 'file',
                  path: '/secure/reports/financial-report.pdf',
                  accessible: false
                },
                {
                  id: 'budget-analysis.pdf',
                  name: 'budget-analysis.pdf',
                  type: 'file',
                  path: '/secure/reports/budget-analysis.pdf',
                  accessible: false
                }
              ]
            },
            {
              id: 'confidential',
              name: 'confidential',
              type: 'folder',
              path: '/secure/confidential',
              accessible: false,
              children: [
                {
                  id: 'contracts',
                  name: 'contracts',
                  type: 'folder',
                  path: '/secure/confidential/contracts',
                  accessible: false,
                  children: [
                    {
                      id: 'client-contract.pdf',
                      name: 'client-contract.pdf',
                      type: 'file',
                      path: '/secure/confidential/contracts/client-contract.pdf',
                      accessible: false
                    },
                    {
                      id: 'vendor-agreement.pdf',
                      name: 'vendor-agreement.pdf',
                      type: 'file',
                      path: '/secure/confidential/contracts/vendor-agreement.pdf',
                      accessible: false
                    },
                    {
                      id: 'compliance-report.pdf',
                      name: 'compliance-report.pdf',
                      type: 'file',
                      path: '/secure/confidential/contracts/compliance-report.pdf',
                      accessible: false
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'public',
          name: 'public',
          type: 'folder',
          path: '/public',
          accessible: true,
          children: [
            {
              id: 'reports',
              name: 'reports',
              type: 'folder',
              path: '/public/reports',
              accessible: true,
              children: [
                {
                  id: 'financial-report.pdf',
                  name: 'financial-report.pdf',
                  type: 'file',
                  path: '/public/reports/financial-report.pdf',
                  accessible: true
                }
              ]
            }
          ]
        },
        {
          id: 'shared',
          name: 'shared',
          type: 'folder',
          path: '/shared',
          accessible: true,
          children: [
            {
              id: 'documents',
              name: 'documents',
              type: 'folder',
              path: '/shared/documents',
              accessible: true,
              children: [
                {
                  id: 'contracts',
                  name: 'contracts',
                  type: 'folder',
                  path: '/shared/documents/contracts',
                  accessible: true,
                  children: [
                    {
                      id: 'client-contract.pdf',
                      name: 'client-contract.pdf',
                      type: 'file',
                      path: '/shared/documents/contracts/client-contract.pdf',
                      accessible: true
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'archive',
          name: 'archive',
          type: 'folder',
          path: '/archive',
          accessible: true,
          children: [
            {
              id: 'reports',
              name: 'reports',
              type: 'folder',
              path: '/archive/reports',
              accessible: true,
              children: [
                {
                  id: 'budget-analysis.pdf',
                  name: 'budget-analysis.pdf',
                  type: 'file',
                  path: '/archive/reports/budget-analysis.pdf',
                  accessible: true
                }
              ]
            }
          ]
        },
        {
          id: 'backup',
          name: 'backup',
          type: 'folder',
          path: '/backup',
          accessible: true,
          children: [
            {
              id: 'confidential',
              name: 'confidential',
              type: 'folder',
              path: '/backup/confidential',
              accessible: true,
              children: [
                {
                  id: 'contracts',
                  name: 'contracts',
                  type: 'folder',
                  path: '/backup/confidential/contracts',
                  accessible: true,
                  children: [
                    {
                      id: 'vendor-agreement.pdf',
                      name: 'vendor-agreement.pdf',
                      type: 'file',
                      path: '/backup/confidential/contracts/vendor-agreement.pdf',
                      accessible: true
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'documents',
          name: 'documents',
          type: 'folder',
          path: '/documents',
          accessible: true,
          children: [
            {
              id: 'legal',
              name: 'legal',
              type: 'folder',
              path: '/documents/legal',
              accessible: true,
              children: [
                {
                  id: 'compliance-report.pdf',
                  name: 'compliance-report.pdf',
                  type: 'file',
                  path: '/documents/legal/compliance-report.pdf',
                  accessible: true
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  // Target files that need to be accessed
  const targetFiles = [
    '/secure/reports/financial-report.pdf',
    '/secure/confidential/contracts/client-contract.pdf',
    '/secure/confidential/contracts/vendor-agreement.pdf',
    '/secure/reports/budget-analysis.pdf',
    '/secure/confidential/contracts/compliance-report.pdf'
  ];

  // Error messages with hints for alternative paths
  const getAccessError = (path: string): AccessError => {
    const errorMessages: { [key: string]: AccessError } = {
      '/secure/reports/financial-report.pdf': {
        message: 'Access Denied to /secure/reports/. Try: /public/reports/ or contact admin for /archive/reports/',
        suggestions: ['/public/reports/', '/archive/reports/']
      },
      '/secure/confidential/contracts/client-contract.pdf': {
        message: 'Access Denied to /secure/confidential/. Try: /shared/documents/contracts/ or contact admin for /backup/confidential/contracts/',
        suggestions: ['/shared/documents/contracts/', '/backup/confidential/contracts/']
      },
      '/secure/confidential/contracts/vendor-agreement.pdf': {
        message: 'Access Denied to /secure/confidential/. Try: /backup/confidential/contracts/ or contact admin for /shared/documents/contracts/',
        suggestions: ['/backup/confidential/contracts/', '/shared/documents/contracts/']
      },
      '/secure/reports/budget-analysis.pdf': {
        message: 'Access Denied to /secure/reports/. Try: /archive/reports/ or contact admin for /public/reports/',
        suggestions: ['/archive/reports/', '/public/reports/']
      },
      '/secure/confidential/contracts/compliance-report.pdf': {
        message: 'Access Denied to /secure/confidential/. Try: /documents/legal/ or contact admin for /shared/documents/contracts/',
        suggestions: ['/documents/legal/', '/shared/documents/contracts/']
      }
    };

    return errorMessages[path] || {
      message: 'Access Denied',
      suggestions: []
    };
  };

  // Find items by path
  const findItemsByPath = (path: string): FileItem[] => {
    if (path === '/') {
      return fileSystem[0].children || [];
    }

    const pathParts = path.split('/').filter(part => part !== '');
    let current = fileSystem[0];

    for (const part of pathParts) {
      if (current.children) {
        const found = current.children.find(child => child.name === part);
        if (found) {
          current = found;
        } else {
          return [];
        }
      } else {
        return [];
      }
    }

    return current.children || [];
  };

  // Navigate to a folder
  const navigateToFolder = (path: string) => {
    const items = findItemsByPath(path);
    if (items.length > 0) {
      setCurrentPath(path);
      setCurrentItems(items);
      setBreadcrumbs(path.split('/').filter(part => part !== ''));
      setAccessError(null);
    }
  };

  // Handle file/folder click
  const handleItemClick = (item: FileItem) => {
    if (item.type === 'folder') {
      navigateToFolder(item.path);
    } else {
      // Try to access file
      if (item.accessible) {
        // File is accessible
        if (!accessedFiles.includes(item.path)) {
          setAccessedFiles([...accessedFiles, item.path]);
        }
        setAccessError(null);
      } else {
        // File is not accessible, show error with hints
        const error = getAccessError(item.path);
        setAccessError(error);
        if (!deniedPaths.includes(item.path)) {
          setDeniedPaths([...deniedPaths, item.path]);
        }
      }
    }
  };

  // Navigate using breadcrumbs
  const navigateToBreadcrumb = (index: number) => {
    const path = '/' + breadcrumbs.slice(0, index + 1).join('/');
    navigateToFolder(path);
  };

  // Initialize with root directory
  useEffect(() => {
    navigateToFolder('/');
  }, []);

  // Helper function to check if an accessed file corresponds to a target file
  const getAccessedTargetFiles = () => {
    const targetFileMap: { [key: string]: string } = {
      '/secure/reports/financial-report.pdf': '/public/reports/financial-report.pdf',
      '/secure/confidential/contracts/client-contract.pdf': '/shared/documents/contracts/client-contract.pdf',
      '/secure/confidential/contracts/vendor-agreement.pdf': '/backup/confidential/contracts/vendor-agreement.pdf',
      '/secure/reports/budget-analysis.pdf': '/archive/reports/budget-analysis.pdf',
      '/secure/confidential/contracts/compliance-report.pdf': '/documents/legal/compliance-report.pdf'
    };

    const completedTargets: string[] = [];
    
    for (const [targetFile, accessibleFile] of Object.entries(targetFileMap)) {
      if (accessedFiles.includes(accessibleFile)) {
        completedTargets.push(targetFile);
      }
    }
    
    return completedTargets;
  };

  // Expose state for testing
  useEffect(() => {
    const accessedTargetFiles = getAccessedTargetFiles();
    const appState = {
      currentPath,
      accessedFiles,
      deniedPaths,
      targetFiles,
      totalTargetFiles: targetFiles.length,
      accessedTargetFiles
    };
    (window as any).app_state = appState;
    
  }, [currentPath, accessedFiles, deniedPaths, targetFiles]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>File Access System</h2>
      <p>Navigate folder hierarchy to access 5 protected files. Use error message hints to find alternative access paths.</p>
      
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <strong>Current Location:</strong>
          <span>
            <button
              onClick={() => navigateToFolder('/')}
              style={{
                background: 'none',
                border: 'none',
                color: currentPath === '/' ? '#333' : '#0066cc',
                cursor: 'pointer',
                textDecoration: currentPath === '/' ? 'none' : 'underline',
                fontWeight: currentPath === '/' ? 'bold' : 'normal'
              }}
            >
              Root
            </button>
            {breadcrumbs.length > 0 && <span style={{ margin: '0 5px' }}>/</span>}
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: index === breadcrumbs.length - 1 ? '#333' : '#0066cc',
                    cursor: 'pointer',
                    textDecoration: index === breadcrumbs.length - 1 ? 'none' : 'underline',
                    fontWeight: index === breadcrumbs.length - 1 ? 'bold' : 'normal'
                  }}
                >
                  {crumb}
                </button>
                {index < breadcrumbs.length - 1 && <span style={{ margin: '0 5px' }}>/</span>}
              </span>
            ))}
          </span>
        </div>
        
        {/* Back Button */}
        {currentPath !== '/' && (
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={() => {
                if (breadcrumbs.length > 1) {
                  navigateToBreadcrumb(breadcrumbs.length - 2);
                } else {
                  navigateToFolder('/');
                }
              }}
              style={{
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Back
            </button>
          </div>
        )}
      </div>

      {/* Access Error Modal */}
      {accessError && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          border: '2px solid #ff4444',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          maxWidth: '500px'
        }}>
          <h3 style={{ color: '#ff4444', marginTop: 0 }}>Access Denied</h3>
          <p style={{ marginBottom: '15px' }}>{accessError.message}</p>
          <div style={{ marginBottom: '15px' }}>
            <strong>Suggested alternatives:</strong>
            <ul style={{ marginTop: '5px' }}>
              {accessError.suggestions.map((suggestion, index) => (
                <li key={index} style={{ color: '#0066cc', cursor: 'pointer' }}
                    onClick={() => {
                      navigateToFolder(suggestion);
                      setAccessError(null);
                    }}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setAccessError(null)}
            style={{
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* File/Folder List */}
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', minHeight: '400px' }}>
        <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
          <strong>Contents of {currentPath === '/' ? 'Root Directory' : currentPath}</strong>
        </div>
        <div style={{ padding: '10px' }}>
          {currentItems.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>This folder is empty</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: item.type === 'folder' ? '#f0f8ff' : '#fff',
                    transition: 'background-color 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = item.type === 'folder' ? '#e6f3ff' : '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = item.type === 'folder' ? '#f0f8ff' : '#fff';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ marginRight: '8px', fontSize: '16px' }}>
                      {item.type === 'folder' ? '📁' : '📄'}
                    </span>
                    <strong>{item.name}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {item.type === 'folder' ? 'Folder' : 'File'}
                  </div>
                  {accessedFiles.includes(item.path) && (
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
        <h3>Access Progress</h3>
        <p><strong>Target Files:</strong> {targetFiles.length}</p>
        <p><strong>Successfully Accessed:</strong> {accessedFiles.filter(file => targetFiles.includes(file)).length}</p>
        <p><strong>Access Denied Attempts:</strong> {deniedPaths.length}</p>
        
        <div style={{ marginTop: '10px' }}>
          <strong>Accessed Files:</strong>
          <ul style={{ marginTop: '5px' }}>
            {accessedFiles.filter(file => targetFiles.includes(file)).map((file, index) => (
              <li key={index} style={{ color: '#4CAF50' }}>✓ {file}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
        <h4>Instructions:</h4>
        <ul>
          <li>Navigate through the folder structure to find and access 5 protected files</li>
          <li>When you encounter "Access Denied" errors, read the error messages carefully</li>
          <li>Error messages contain hints about alternative paths where the same files can be found</li>
          <li>Use the suggested paths to access the files through alternative routes</li>
          <li>Successfully access all 5 target files to complete the task</li>
        </ul>
      </div>
    </div>
  );
};

export default Task3;
