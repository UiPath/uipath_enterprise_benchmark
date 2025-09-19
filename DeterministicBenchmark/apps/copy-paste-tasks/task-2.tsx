import React, { useState, useEffect } from 'react';
import { FolderClosed, FolderOpen, File, FileText, Image } from 'lucide-react';

// File type interface
interface FileItem {
  name: string;
  type: 'file';
  extension: string;
  size: string;
  path: string;
}

interface FolderItem {
  name: string;
  type: 'folder';
  path: string;
  children: (FileItem | FolderItem)[];
  isExpanded: boolean;
}

interface TableRow {
  filename: string;
  fullPath: string;
  size: string;
}

// Generate realistic project folder structure
const generateProjectStructure = (): FolderItem => {
  const projectFolders = [
    'ProjectAlpha', 'ProjectBeta'
  ];

  const subfolderNames = [
    'Documentation', 'Requirements', 'Designs', 'Assets', 'Reports', 
    'Contracts', 'Budget', 'Timeline', 'Communications', 'Archive',
    'Deliverables', 'Resources', 'Templates', 'Proposals'
  ];

  const fileTypes = [
    { ext: 'pdf', weight: 35 }, // 35 PDFs as specified
    { ext: 'docx', weight: 50 },
    { ext: 'txt', weight: 40 },
    { ext: 'jpg', weight: 30 },
    { ext: 'png', weight: 25 },
    { ext: 'xlsx', weight: 20 }
  ];

  const generateFileName = (folder: string, subfolder: string, ext: string, fileIndex: number = 0) => {
    const templates = [
      `${folder}_Requirements`,
      `${folder}_${subfolder}_Summary`,
      `Budget_${folder}_Q4_2024`,
      `${subfolder}_Documentation`,
      `${folder}_${subfolder}_Report`,
      `Meeting_Notes_${folder}`,
      `${subfolder}_Guidelines`,
      `${folder}_Proposal_v1`,
      `${folder}_Proposal_v2`,
      `${folder}_Proposal_v3`, 
      `${subfolder}_Analysis_${new Date().getFullYear()}`,
      `${folder}_Final_Deliverable`,
      `${folder}_Contract_Draft`,
      `${folder}_Timeline_Rev1`,
      `${folder}_Specification_${subfolder}`,
      `${folder}_Budget_Final`,
      `${subfolder}_Report_Summary`,
      `${folder}_Manual_v1`,
      `${folder}_Guidelines_${subfolder}`,
      `${folder}_Analysis_Complete`
    ];
    
    // Use fileIndex to ensure variety and avoid duplicates
    const templateIndex = fileIndex % templates.length;
    const selectedTemplate = templates[templateIndex];
    
    // Add unique suffix for PDFs to guarantee uniqueness
    const uniqueSuffix = ext === 'pdf' ? `_${subfolder.slice(0, 3)}${fileIndex + 1}` : '';
    
    const base = (selectedTemplate + uniqueSuffix).replace(/[^a-zA-Z0-9_]/g, '_');
    return `${base}.${ext}`;
  };

  const generateFileSize = () => {
    const sizes = ['1.2 MB', '856 KB', '2.4 MB', '445 KB', '3.1 MB', '678 KB', '1.8 MB', '234 KB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  // Create all files first to ensure we get exactly 10 PDFs
  const allFiles: { folder: string; subfolder: string; file: FileItem }[] = [];
  
  // Generate exactly 10 PDF files
  let pdfCount = 0;
  projectFolders.forEach(folder => {
    const subfolderCount = 3; // Exactly 3 subfolders per project
    const shuffledSubfolders = [...subfolderNames].sort(() => 0.5 - Math.random()).slice(0, subfolderCount);
    
    shuffledSubfolders.forEach(subfolder => {
      // Add 1-2 PDFs per subfolder to distribute them (5 per project = 10 total)
      const pdfsInThisFolder = folder === 'ProjectAlpha' ? (subfolder === shuffledSubfolders[0] ? 2 : subfolder === shuffledSubfolders[1] ? 2 : 1) : (subfolder === shuffledSubfolders[0] ? 2 : subfolder === shuffledSubfolders[1] ? 2 : 1);
      for (let i = 0; i < pdfsInThisFolder && pdfCount < 10; i++) {
        const fileName = generateFileName(folder, subfolder, 'pdf', pdfCount);
        const path = `/${folder}/${subfolder}/${fileName}`;
        allFiles.push({
          folder,
          subfolder,
          file: {
            name: fileName,
            type: 'file',
            extension: 'pdf',
            size: generateFileSize(),
            path
          }
        });
        pdfCount++;
      }
    });
  });

  // Generate remaining files to reach ~50 total
  const remainingFilesNeeded = 50 - 10;
  let remainingCount = 0;

  projectFolders.forEach(folder => {
    const subfolderCount = 3;
    const shuffledSubfolders = [...subfolderNames].sort(() => 0.5 - Math.random()).slice(0, subfolderCount);
    
    shuffledSubfolders.forEach(subfolder => {
      const filesInThisFolder = 6 + Math.floor(Math.random() * 4); // 6-9 files per subfolder
      
      for (let i = 0; i < filesInThisFolder && remainingCount < remainingFilesNeeded; i++) {
        // Skip PDF since we already added them
        const nonPdfTypes = fileTypes.filter(t => t.ext !== 'pdf');
        const randomType = nonPdfTypes[Math.floor(Math.random() * nonPdfTypes.length)];
        const fileName = generateFileName(folder, subfolder, randomType.ext, remainingCount + i);
        const path = `/${folder}/${subfolder}/${fileName}`;
        
        allFiles.push({
          folder,
          subfolder,
          file: {
            name: fileName,
            type: 'file',
            extension: randomType.ext,
            size: generateFileSize(),
            path
          }
        });
        remainingCount++;
      }
    });
  });

  // Build the tree structure from the files
  const root: FolderItem = {
    name: 'Projects',
    type: 'folder',
    path: '/Projects',
    children: [],
    isExpanded: false
  };

  // Group files by folder structure
  const folderMap = new Map<string, FolderItem>();
  
  allFiles.forEach(({ folder, subfolder, file }) => {
    let mainFolder = folderMap.get(folder);
    if (!mainFolder) {
      mainFolder = {
        name: folder,
        type: 'folder',
        path: `/${folder}`,
        children: [],
        isExpanded: false
      };
      folderMap.set(folder, mainFolder);
      root.children.push(mainFolder);
    }

    let subFolder = mainFolder.children.find(c => c.name === subfolder) as FolderItem;
    if (!subFolder) {
      subFolder = {
        name: subfolder,
        type: 'folder',
        path: `/${folder}/${subfolder}`,
        children: [],
        isExpanded: false
      };
      mainFolder.children.push(subFolder);
    }

    subFolder.children.push(file);
  });

  return root;
};

const Task2: React.FC = () => {
  const [fileStructure, setFileStructure] = useState<FolderItem>(() => generateProjectStructure());
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [pdfTable, setPdfTable] = useState<TableRow[]>([]);
  const [pathInput, setPathInput] = useState<string>('');

  // Expose app state for testing
  useEffect(() => {
    // Count total PDFs in the file structure for verification
    const countPdfs = (item: FileItem | FolderItem): number => {
      if (item.type === 'file') {
        return item.extension === 'pdf' ? 1 : 0;
      }
      return item.children.reduce((sum, child) => sum + countPdfs(child), 0);
    };

    const totalPdfsInStructure = countPdfs(fileStructure);

    (window as any).app_state = {
      fileStructure,
      pdfTable,
      totalPdfsInStructure,
      foundPdfCount: pdfTable.length,
      selectedItem,
      pathInput
    };
  }, [fileStructure, pdfTable, selectedItem, pathInput]);

  const toggleFolder = (path: string) => {
    const updateFolder = (item: FolderItem): FolderItem => {
      if (item.path === path) {
        return { ...item, isExpanded: !item.isExpanded };
      }
      return {
        ...item,
        children: item.children.map(child => 
          child.type === 'folder' ? updateFolder(child) : child
        )
      };
    };

    setFileStructure(updateFolder(fileStructure));
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedItem(file);
  };

  const copyPath = async () => {
    if (!selectedItem) return;
    
    // Check if navigator and clipboard API are available
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(selectedItem.path);
        return;
      } catch (err) {
        // Fall through to fallback method
      }
    }
    
    // Fallback method for when clipboard API is not available
    const textArea = document.createElement('textarea');
    textArea.value = selectedItem.path;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  };

  const addFromInput = () => {
    if (pathInput.trim()) {
      // Find the file in the structure that matches this path
      const findFileByPath = (item: FileItem | FolderItem, targetPath: string): FileItem | null => {
        if (item.type === 'file' && item.path === targetPath) {
          return item;
        } else if (item.type === 'folder') {
          for (const child of item.children) {
            const result = findFileByPath(child, targetPath);
            if (result) return result;
          }
        }
        return null;
      };

      const foundFile = findFileByPath(fileStructure, pathInput.trim());
      
      if (foundFile && foundFile.extension === 'pdf') {
        // Check if already added
        const exists = pdfTable.some(row => row.fullPath === foundFile.path);
        if (!exists) {
          const newRow: TableRow = {
            filename: foundFile.name,
            fullPath: foundFile.path,
            size: foundFile.size
          };
          setPdfTable([...pdfTable, newRow]);
          setPathInput(''); // Clear input after adding
        }
      }
    }
  };



  const removeFromTable = (index: number) => {
    setPdfTable(pdfTable.filter((_, i) => i !== index));
  };

  const getFileIcon = (extension: string) => {
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'jpg':
      case 'png':
        return <Image className="h-4 w-4 text-purple-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderTreeItem = (item: FileItem | FolderItem, level: number = 0) => {
    if (item.type === 'folder') {
      const folder = item as FolderItem;
      return (
        <div key={folder.path}>
          <div
            className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100"
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => toggleFolder(folder.path)}
          >
            {folder.isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <FolderClosed className="h-4 w-4 text-blue-500" />
            )}
            <span className="text-sm font-medium">{folder.name}</span>
            <span className="text-xs text-gray-500">({folder.children.length})</span>
          </div>
          {folder.isExpanded && (
            <div>
              {folder.children.map(child => renderTreeItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    } else {
      const file = item as FileItem;
      return (
        <div
          key={file.path}
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 ${
            selectedItem?.path === file.path ? 'bg-blue-100' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => handleFileClick(file)}
        >
          {getFileIcon(file.extension)}
          <span className="text-sm">{file.name}</span>
          <span className="text-xs text-gray-400">{file.size}</span>
        </div>
      );
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Panel - File Explorer Tree */}
      <div className="w-1/2 p-4 bg-white border-r overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Project Files</h2>
          <button
            onClick={copyPath}
            disabled={!selectedItem}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm"
          >
            Copy Path
          </button>
        </div>
        
        {selectedItem && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
            <strong>Selected:</strong> {selectedItem.name}
            {selectedItem.extension === 'pdf' && (
              <span className="text-green-600 font-medium ml-2">(PDF File)</span>
            )}
            <div className="text-xs text-gray-600 mt-1">{selectedItem.path}</div>
          </div>
        )}
        
        <div className="border border-gray-300 rounded overflow-auto max-h-[70vh]">
          {renderTreeItem(fileStructure)}
        </div>
      </div>

      {/* Right Panel - PDF Summary Table */}
      <div className="w-1/2 p-4 bg-gray-50 overflow-auto">
        <h2 className="text-lg font-semibold mb-4">PDF File Summary</h2>
        
        {/* Path Input Form */}
        <div className="mb-4 p-3 bg-white border rounded">
          <div className="flex items-center gap-2">
            <label className="font-medium">Path:</label>
            <input
              type="text"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
              placeholder="Paste PDF file path here (Ctrl+V)..."
            />
            <button
              onClick={addFromInput}
              className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Add
            </button>
          </div>
        </div>

        <div className="bg-white border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b border-gray-300 px-3 py-2 text-left">Filename</th>
                <th className="border-b border-gray-300 px-3 py-2 text-left">Full Path</th>
                <th className="border-b border-gray-300 px-3 py-2 text-left">Size</th>
                <th className="border-b border-gray-300 px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {pdfTable.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                    No PDF files added yet. Select PDF files, copy their paths, and add them using the form above.
                  </td>
                </tr>
              ) : (
                pdfTable.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border-b border-gray-200 px-3 py-2">{row.filename}</td>
                    <td className="border-b border-gray-200 px-3 py-2 font-mono text-xs">{row.fullPath}</td>
                    <td className="border-b border-gray-200 px-3 py-2">{row.size}</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      <button
                        onClick={() => removeFromTable(index)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Task2;
