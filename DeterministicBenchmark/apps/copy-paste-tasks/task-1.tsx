import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';

// Generate realistic test data for 50 customer records
const generateCustomerData = () => {
  const names = [
    'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
    'Jessica Miller', 'Christopher Moore', 'Ashley Taylor', 'Matthew Anderson', 'Amanda Thomas',
    'Joshua Jackson', 'Melissa White', 'Andrew Harris', 'Stephanie Martin', 'Daniel Thompson',
    'Nicole Garcia', 'Ryan Martinez', 'Jennifer Robinson', 'Kevin Clark', 'Lisa Rodriguez',
    'Brandon Lewis', 'Michelle Lee', 'Jason Walker', 'Kimberly Hall', 'Justin Allen',
    'Elizabeth Young', 'Anthony Hernandez', 'Maria King', 'Mark Wright', 'Laura Lopez',
    'Steven Hill', 'Rebecca Scott', 'Brian Green', 'Sharon Adams', 'Patrick Baker',
    'Carol Gonzalez', 'Gary Nelson', 'Helen Carter', 'Raymond Mitchell', 'Cynthia Perez',
    'Jeremy Roberts', 'Angela Turner', 'Sean Phillips', 'Brenda Campbell', 'Carl Parker',
    'Marie Evans', 'Harold Edwards', 'Janet Collins', 'Arthur Stewart', 'Joyce Sanchez'
  ];
  
  const companies = [
    'Apple Inc.', 'Microsoft Corporation', 'Amazon.com Inc.', 'Alphabet Inc.', 'Tesla Inc.',
    'Meta Platforms Inc.', 'Netflix Inc.', 'NVIDIA Corporation', 'PayPal Holdings', 'Adobe Inc.',
    'Salesforce Inc.', 'Intel Corporation', 'Cisco Systems', 'Oracle Corporation', 'IBM',
    'Dell Technologies', 'HP Inc.', 'VMware Inc.', 'ServiceNow Inc.', 'Workday Inc.',
    'Zoom Video Communications', 'Slack Technologies', 'Dropbox Inc.', 'Box Inc.', 'Twilio Inc.',
    'Shopify Inc.', 'Square Inc.', 'DocuSign Inc.', 'Atlassian Corporation', 'Splunk Inc.',
    'CrowdStrike Holdings', 'Okta Inc.', 'Snowflake Inc.', 'Datadog Inc.', 'MongoDB Inc.',
    'Elastic N.V.', 'Palantir Technologies', 'Unity Software', 'Roblox Corporation', 'Coinbase Global',
    'Robinhood Markets', 'DoorDash Inc.', 'Uber Technologies', 'Lyft Inc.', 'Airbnb Inc.',
    'Pinterest Inc.', 'Snap Inc.', 'Twitter Inc.', 'LinkedIn Corporation', 'TikTok Ltd.'
  ];
  
  const statuses = ['Active', 'Inactive', 'Pending'];
  
  return names.map((name, index) => ({
    id: index + 1,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@${companies[index].toLowerCase().replace(/[^a-zA-Z]/g, '')}.com`,
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    company: companies[index],
    status: statuses[Math.floor(Math.random() * statuses.length)]
  }));
};

const Task1: React.FC = () => {
  const [customerData] = useState(generateCustomerData);
  const [selectedCells, setSelectedCells] = useState<{row: number, col: string} | null>(null);
  const [copiedValue, setCopiedValue] = useState<string>('');
  const [contactForms, setContactForms] = useState<Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
  }>>(() => 
    // Initialize 3 empty forms for rows 30, 40, 50
    Array.from({length: 3}, (_, i) => ({
      id: i + 1,
      name: '',
      email: '',
      phone: '',
      company: ''
    }))
  );
  const [activeForm, setActiveForm] = useState(0);
  const [submittedForms, setSubmittedForms] = useState<Set<number>>(new Set());
  
  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      contactForms,
      customerData,
      targetRows: [30, 40, 50], // rows 30, 40, 50 (1-indexed)
      completedForms: contactForms.filter(form => 
        form.name && form.email && form.phone && form.company
      ).length,
      submittedForms: Array.from(submittedForms)
    };
  }, [contactForms, customerData, submittedForms]);

  const handleCellClick = (rowIndex: number, column: string) => {
    setSelectedCells({ row: rowIndex, col: column });
    const customer = customerData[rowIndex];
    let value = '';
    switch (column) {
      case 'A': value = customer.name; break;
      case 'B': value = customer.email; break;
      case 'C': value = customer.phone; break;
      case 'D': value = customer.company; break;
      case 'E': value = customer.status; break;
    }
    setCopiedValue(value);
  };

  const handleCopy = async () => {
    if (!copiedValue) return;
    
    // Check if navigator and clipboard API are available
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(copiedValue);
      } catch (err) {
        // Fall through to fallback method
        const textArea = document.createElement('textarea');
        textArea.value = copiedValue;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } else {
      // Fallback method for when clipboard API is not available
      const textArea = document.createElement('textarea');
      textArea.value = copiedValue;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    
    // Hide the copy button after copying
    setSelectedCells(null);
    setCopiedValue('');
  };

  const handleSubmit = (formIndex: number) => {
    const form = contactForms[formIndex];
    if (form.name && form.email && form.phone && form.company) {
      setSubmittedForms(prev => new Set([...prev, formIndex]));
    }
  };

  const getColumnHeader = (col: string) => {
    switch (col) {
      case 'A': return 'Name';
      case 'B': return 'Email';
      case 'C': return 'Phone';
      case 'D': return 'Company';
      case 'E': return 'Status';
      default: return col;
    }
  };

  return (
    <div className="h-screen flex bg-gray-100 relative">
      {/* Left Panel - Excel-style Grid */}
      <div className="w-1/2 bg-white border-r flex flex-col">
        <div className="p-4 pb-2">
          <h2 className="text-lg font-semibold">Customer Table</h2>
        </div>
        
        <div className="flex-1 px-4 overflow-auto">
          <div className="border border-gray-300 rounded overflow-auto relative">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-center w-12">#</th>
                  {['A', 'B', 'C', 'D', 'E'].map(col => (
                    <th key={col} className="border border-gray-300 px-2 py-1 text-center">
                      {col}={getColumnHeader(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customerData.map((customer, index) => {
                  const rowNumber = index + 1;
                  const isSelected = selectedCells?.row === index;
                  
                  return (
                    <tr key={customer.id} className="relative">
                      <td className="border border-gray-300 px-2 py-1 text-center font-mono text-gray-500">
                        {rowNumber}
                      </td>
                      {[
                        {col: 'A', value: customer.name},
                        {col: 'B', value: customer.email},
                        {col: 'C', value: customer.phone},
                        {col: 'D', value: customer.company},
                        {col: 'E', value: customer.status}
                      ].map(({col, value}, colIndex) => {
                        const isSelectedCell = selectedCells?.row === index && selectedCells?.col === col;
                        return (
                          <td
                            key={col}
                            className={`border border-gray-300 px-2 py-1 cursor-pointer hover:bg-gray-100 relative ${
                              isSelectedCell ? 'bg-blue-200 ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => handleCellClick(index, col)}
                          >
                            {value}
                            {/* Copy button positioned under the specific selected cell */}
                            {isSelectedCell && (
                              <div 
                                className={`absolute z-20 min-w-max ${
                                  // Smart positioning based on column and table position
                                  col === 'E' || col === 'D' ? 'right-0' : 'left-0'
                                } ${
                                  // Position above if near bottom rows (last 5 rows)
                                  index >= customerData.length - 5 ? 'bottom-full pb-1' : 'top-full pt-1'
                                }`}
                              >
                                <button
                                  onClick={handleCopy}
                                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 shadow-lg text-sm font-medium whitespace-nowrap"
                                >
                                  <Copy size={14} />
                                  Copy "{copiedValue}"
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Status Section at Bottom */}
        <div className="p-2 border-t bg-gray-50">
          <div className="text-center text-gray-500 text-xs">
            Click on table cells to select and copy data • Target rows: 30, 40, 50
          </div>
        </div>
      </div>

      {/* Right Panel - Contact Forms */}
      <div className="w-1/2 p-4 bg-gray-50 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Contact Forms</h2>
        </div>

        {/* Form Tabs */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {contactForms.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveForm(index)}
              className={`px-3 py-1 text-sm rounded-t ${
                activeForm === index
                  ? 'bg-white border-l border-r border-t text-blue-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Form {index + 1}
            </button>
          ))}
        </div>

        {/* Active Form */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-medium mb-3">Contact Form {activeForm + 1}</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={contactForms[activeForm].name}
                onChange={(e) => {
                  const updatedForms = [...contactForms];
                  updatedForms[activeForm] = {
                    ...updatedForms[activeForm],
                    name: e.target.value
                  };
                  setContactForms(updatedForms);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={contactForms[activeForm].email}
                onChange={(e) => {
                  const updatedForms = [...contactForms];
                  updatedForms[activeForm] = {
                    ...updatedForms[activeForm],
                    email: e.target.value
                  };
                  setContactForms(updatedForms);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={contactForms[activeForm].phone}
                onChange={(e) => {
                  const updatedForms = [...contactForms];
                  updatedForms[activeForm] = {
                    ...updatedForms[activeForm],
                    phone: e.target.value
                  };
                  setContactForms(updatedForms);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={contactForms[activeForm].company}
                onChange={(e) => {
                  const updatedForms = [...contactForms];
                  updatedForms[activeForm] = {
                    ...updatedForms[activeForm],
                    company: e.target.value
                  };
                  setContactForms(updatedForms);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => handleSubmit(activeForm)}
              disabled={!contactForms[activeForm].name || !contactForms[activeForm].email || 
                       !contactForms[activeForm].phone || !contactForms[activeForm].company ||
                       submittedForms.has(activeForm)}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Submit Form
            </button>
            <div className="text-xs text-gray-500">
              Fill all fields to submit
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Task1;
