import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calculator, DollarSign, Clock } from 'lucide-react';

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

interface LineItem {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  lineItems: LineItem[];
  isExpanded?: boolean;
}

// Generate deterministic invoice data
const generateInvoiceData = (): Invoice[] => {
  const rng = new SeededRandom(12345); // Fixed seed for deterministic results
  
  const clients = [
    'Acme Corporation', 'Global Industries Inc', 'TechStart Solutions', 'Metro Holdings LLC',
    'Premier Services Co', 'Digital Dynamics Ltd', 'Horizon Enterprises', 'Quantum Systems Inc',
    'Nexus Technologies', 'Alpha Partners Group', 'Beta Solutions LLC', 'Gamma Industries',
    'Delta Consulting Firm', 'Epsilon Marketing Inc', 'Zeta Manufacturing Co', 'Theta Logistics',
    'Lambda Software Corp', 'Sigma Analytics Inc', 'Omega Financial Group', 'Phoenix Ventures',
    'Aurora Business Solutions', 'Celestial Services Inc', 'Meridian Consulting', 'Pinnacle Corp',
    'Summit Technologies', 'Apex Industries Ltd', 'Vertex Solutions Inc', 'Matrix Holdings',
    'Catalyst Enterprises', 'Synergy Business Group'
  ];

  const services = [
    'Consulting Services', 'Software Development', 'Marketing Campaign', 'System Integration',
    'Training Program', 'Support Services', 'Project Management', 'Data Analysis',
    'Website Development', 'Mobile App Development', 'Cloud Migration', 'Security Audit',
    'Business Strategy', 'Technical Documentation', 'Quality Assurance', 'Database Design',
    'Network Setup', 'User Interface Design', 'API Development', 'Performance Optimization',
    'Compliance Review', 'Risk Assessment', 'Process Improvement', 'Staff Augmentation'
  ];

  const invoices: Invoice[] = [];
  let overdueCount = 0;
  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Pre-determine which invoices should be overdue (scattered throughout)
  const overdueIndices = [2, 5, 8, 11, 15, 19, 23, 27]; // Scattered positions for 8 overdue invoices
  
  for (let i = 0; i < 30; i++) {
    // Generate invoice date within past 90 days
    const daysAgo = Math.floor(rng.next() * 90);
    const invoiceDate = new Date(currentDate);
    invoiceDate.setDate(invoiceDate.getDate() - daysAgo);
    
    // Generate due date 30-90 days from invoice date
    const dueDaysFromInvoice = 30 + Math.floor(rng.next() * 61); // 30-90 days
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + dueDaysFromInvoice);
    
    // Determine if this should be overdue (scattered throughout the list)
    let isOverdue = overdueIndices.includes(i);
    if (isOverdue) {
      // Force it to be overdue by setting due date in the past
      const pastDays = 5 + Math.floor(rng.next() * 30); // 5-35 days overdue
      dueDate.setTime(currentDate.getTime() - (pastDays * 24 * 60 * 60 * 1000));
      overdueCount++;
    }
    
    // Generate line items (2-8 items per invoice)
    const lineItemCount = 2 + Math.floor(rng.next() * 7); // 2-8 items
    const lineItems: LineItem[] = [];
    let invoiceTotal = 0;
    
    for (let j = 0; j < lineItemCount; j++) {
      const service = services[Math.floor(rng.next() * services.length)];
      const quantity = 1 + Math.floor(rng.next() * 5); // 1-5 quantity
      const unitPrice = Math.round((50 + rng.next() * 450) * 100) / 100; // $50-$500 per unit
      const total = Math.round(quantity * unitPrice * 100) / 100;
      
      lineItems.push({
        id: `INV-${(i + 1).toString().padStart(3, '0')}-${j + 1}`,
        item: service,
        quantity,
        unitPrice,
        total
      });
      
      invoiceTotal += total;
    }
    
    invoiceTotal = Math.round(invoiceTotal * 100) / 100;
    
    // Determine status
    let status: 'Paid' | 'Pending' | 'Overdue' = 'Pending';
    if (isOverdue) {
      status = 'Overdue';
    } else if (rng.next() > 0.7) { // 30% chance of being paid
      status = 'Paid';
    }
    
    invoices.push({
      id: `inv-${i + 1}`,
      invoiceNumber: `INV-2024-${(i + 1).toString().padStart(4, '0')}`,
      client: clients[i % clients.length],
      date: invoiceDate.toLocaleDateString('en-US'),
      dueDate: dueDate.toLocaleDateString('en-US'),
      amount: invoiceTotal,
      status,
      lineItems,
      isExpanded: false
    });
  }
  
  // Sort by invoice number to scatter overdue invoices throughout the list
  invoices.sort((a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber));
  
  return invoices;
};

const Task8: React.FC = () => {
  const [invoices] = useState<Invoice[]>(() => generateInvoiceData());
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());
  const [submittedInvoices, setSubmittedInvoices] = useState<Array<{invoiceNumber: string, amount: number}>>([]);
  const [inputValue, setInputValue] = useState('');
  
  // Calculate expected results - top 3 overdue invoices by value
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');
  const top3OverdueInvoices = overdueInvoices
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending
    .slice(0, 3); // Take top 3
  

  
  // Add invoice to submitted list
  const handleAddInvoice = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;
    
    // Find the invoice by number
    const invoice = invoices.find(inv => inv.invoiceNumber === trimmedInput);
    if (!invoice) {
      alert('Invoice number not found. Please check the invoice number and try again.');
      return;
    }
    
    // Check if already added
    if (submittedInvoices.some(sub => sub.invoiceNumber === trimmedInput)) {
      alert('This invoice has already been added.');
      return;
    }
    
    // Add to submitted list
    setSubmittedInvoices(prev => [...prev, { invoiceNumber: invoice.invoiceNumber, amount: invoice.amount }]);
    setInputValue('');
  };

  // Remove invoice from submitted list
  const handleRemoveInvoice = (invoiceNumber: string) => {
    setSubmittedInvoices(prev => prev.filter(sub => sub.invoiceNumber !== invoiceNumber));
  };

  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      invoices,
      overdueInvoices,
      top3OverdueInvoices,
      submittedInvoices,
      expandedInvoices: Array.from(expandedInvoices),
      isCompleted: submittedInvoices.length === 3
    };
  }, [invoices, overdueInvoices, top3OverdueInvoices, submittedInvoices, expandedInvoices]);

  const toggleExpanded = (invoiceId: string) => {
    setExpandedInvoices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    return dateStr;
  };

  const isOverdue = (invoice: Invoice): boolean => {
    return invoice.status === 'Overdue';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <DollarSign size={24} className="text-green-600" />
          <h1 className="text-xl font-semibold">Invoice Management</h1>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Invoice Table */}
        <div className="w-2/3 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium">Invoice List</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-10">#</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Invoice #</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Client</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Date</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Due Date</th>
                    <th className="border border-gray-300 px-3 py-2 text-right font-semibold">Amount</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => {
                    const isExpanded = expandedInvoices.has(invoice.id);
                    const overdue = isOverdue(invoice);
                    
                    return (
                      <React.Fragment key={invoice.id}>
                        {/* Main invoice row */}
                        <tr className={`${overdue ? 'bg-red-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <button
                              onClick={() => toggleExpanded(invoice.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Click to expand line items"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 font-mono">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 font-medium">
                            {invoice.client}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 font-mono">
                            {formatDate(invoice.date)}
                          </td>
                          <td className={`border border-gray-300 px-3 py-2 font-mono ${overdue ? 'font-bold text-red-600' : ''}`}>
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right font-mono font-medium">
                            {formatCurrency(invoice.amount)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                        
                        {/* Expanded line items */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="border border-gray-300 p-0">
                              <div className="bg-gray-50 p-4">
                                <h4 className="font-medium mb-2 text-gray-700">Line Items:</h4>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border border-gray-300 px-2 py-1 text-left">Item</th>
                                      <th className="border border-gray-300 px-2 py-1 text-center">Quantity</th>
                                      <th className="border border-gray-300 px-2 py-1 text-right">Unit Price</th>
                                      <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {invoice.lineItems.map((item) => (
                                      <tr key={item.id} className="bg-white">
                                        <td className="border border-gray-300 px-2 py-1">{item.item}</td>
                                        <td className="border border-gray-300 px-2 py-1 text-center">{item.quantity}</td>
                                        <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                                          {formatCurrency(item.unitPrice)}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1 text-right font-mono font-medium">
                                          {formatCurrency(item.total)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Top 3 Overdue Invoices */}
        <div className="w-1/3 p-4 bg-gray-50 overflow-auto">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold">Top 3 Overdue Invoices</h2>
            </div>
            
            {/* Input Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Invoice Number (highest value first)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInvoice()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter invoice number..."
                />
                <button
                  onClick={handleAddInvoice}
                  disabled={!inputValue.trim() || submittedInvoices.length >= 3}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the top 3 overdue invoices by total value, from highest to lowest
              </p>
            </div>

            {/* Results Table */}
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-300 px-3 py-2 text-left font-semibold">#</th>
                    <th className="border-b border-gray-300 px-3 py-2 text-left font-semibold">Invoice Number</th>
                    <th className="border-b border-gray-300 px-3 py-2 text-right font-semibold">Amount</th>
                    <th className="border-b border-gray-300 px-3 py-2 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-gray-500 text-sm">
                        No invoices added yet. Start by finding and adding the highest value overdue invoice.
                      </td>
                    </tr>
                  ) : (
                    submittedInvoices.map((submitted, index) => (
                      <tr key={submitted.invoiceNumber} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border-b border-gray-300 px-3 py-2 text-center font-medium">
                          {index + 1}
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2 font-mono">
                          {submitted.invoiceNumber}
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2 text-right font-mono">
                          {formatCurrency(submitted.amount)}
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2 text-center">
                          <button
                            onClick={() => handleRemoveInvoice(submitted.invoiceNumber)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="Remove invoice"
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

            {/* Progress indicator */}
            <div className="mt-3 text-xs text-gray-600">
              Progress: {submittedInvoices.length} of 3 invoices added
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task8;
