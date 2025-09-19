import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, FileText, Edit } from 'lucide-react';

// Generate 12 vendor invoices with mixed currency formats
const generateInvoiceData = () => {
  const vendors = [
    'Acme Corporation', 'Tech Solutions Inc.', 'Global Supplies Ltd.', 'Metro Industries',
    'Digital Systems Co.', 'Prime Vendors LLC', 'United Services', 'Advanced Materials',
    'Quality Products Inc.', 'Innovative Solutions', 'Premier Supplies', 'Elite Services'
  ];
  
  
  // Raw original amounts
  const amounts = [
    '$2,450.75', '1875.90 USD', 'Three Thousand Five Hundred and 25/100 Dollars', '2,134,80',
    '₤1,567.45', '$945.30', '3,200.15 USD', 'USD 1,789.65', '$4,123.50', '2456.80 USD',
    'Five Thousand Seven Hundred and 89/100 Dollars', '3,456,25'
  ];
  
  // Auto-normalized values (with intentional mistakes for CU agent to catch)
  const autoNormalizedAmounts = [
    '2,450.75', '1,875.90', '3,503.25', '2134',  // Mistake: wrong value (3,503.25 vs 3,500.25)
    '1,567.45', '945.30', '3,200.15', '1,789.65', '4,123.50', '2,456.80',
    '5,700.89', '3456'  // Mistake: missing decimal
  ];
  
  // Target values (correct final values)
  const targetAmounts = [
    '2,450.75', '1,875.90', '3,500.25', '2,134.80',
    '1,567.45', '945.30', '3,200.15', '1,789.65', '4,123.50', '2,456.80',
    '5,700.89', '3,456.25'
  ];
  
  return vendors.map((vendor, index) => ({
    id: index + 1,
    vendor,
    invoiceNumber: `INV-${(index + 1).toString().padStart(4, '0')}`,
    originalAmount: amounts[index],
    autoNormalized: autoNormalizedAmounts[index],  // Auto-normalized with mistakes
    expectedNormalized: targetAmounts[index],      // Correct target value
    normalizedAmount: '',
    currency: 'USD',
    status: 'pending' as 'pending' | 'completed' | 'error',
    isAmbiguous: [2, 10].includes(index), // 2 ambiguous cases
    notes: ''
  }));
};

// Currency conversion rules and helper functions
const parseAmount = (amountStr: string): number => {
  // Remove currency symbols and clean up
  let cleaned = amountStr.replace(/[£$₤]/g, '').replace(/USD|Dollars?/gi, '').trim();
  
  // Handle written amounts
  if (cleaned.includes('Thousand') || cleaned.includes('Hundred')) {
    // This is a simplified parser - in real world this would be more robust
    const thousandMatch = cleaned.match(/(\w+)\s+Thousand/i);
    const hundredMatch = cleaned.match(/(\w+)\s+Hundred/i);
    const centsMatch = cleaned.match(/and\s+(\d+)\/100/i);
    
    let amount = 0;
    if (thousandMatch) {
      const thousands = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      amount += (thousands[thousandMatch[1].toLowerCase() as keyof typeof thousands] || 0) * 1000;
    }
    if (hundredMatch) {
      const hundreds = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      amount += (hundreds[hundredMatch[1].toLowerCase() as keyof typeof hundreds] || 0) * 100;
    }
    
    // Add tens and ones from written form
    const writtenNumbers = {
      'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60,
      'seventy': 70, 'eighty': 80, 'ninety': 90, 'one': 1, 'two': 2,
      'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9
    };
    
    // Simple pattern matching for remaining numbers
    for (const [word, num] of Object.entries(writtenNumbers)) {
      if (cleaned.toLowerCase().includes(word)) {
        amount += num;
        break;
      }
    }
    
    if (centsMatch) {
      amount += parseInt(centsMatch[1]) / 100;
    }
    
    return amount;
  }
  
  // Handle European format (2,134,80) - comma as decimal separator
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    // This is European format with comma as decimal separator
    // Find the last comma and treat it as decimal separator
    const lastCommaIndex = cleaned.lastIndexOf(',');
    const beforeComma = cleaned.substring(0, lastCommaIndex);
    const afterComma = cleaned.substring(lastCommaIndex + 1);
    
    // Remove other commas (they're thousands separators) and add decimal point
    cleaned = beforeComma.replace(/,/g, '') + '.' + afterComma;
  } else if (cleaned.includes(',') && cleaned.includes('.')) {
    // Mixed format - determine which is decimal separator
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastComma > lastDot) {
      // Comma is decimal separator, dot is thousands separator
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Dot is decimal separator, comma is thousands separator
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  // Handle standard formats
  cleaned = cleaned.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
};

const formatToStandard = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const Task2: React.FC = () => {
  const [invoices, setInvoices] = useState(() => generateInvoiceData());
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
  const [conversionRule, setConversionRule] = useState('auto');
  const [manualAmount, setManualAmount] = useState('');
  const [completedCount, setCompletedCount] = useState(0);

  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      invoices,
      totalInvoices: 12,
      completedCount,
      normalizedInvoices: invoices.filter(inv => inv.normalizedAmount !== ''),
      allNormalized: invoices.every(inv => inv.normalizedAmount !== ''),
      conversionAccuracy: invoices.filter(inv => inv.normalizedAmount !== '').length / 12
    };
  }, [invoices, completedCount]);

  const normalizeAmount = (invoice: any, rule: string = 'auto', manual: string = '') => {
    if (rule === 'manual' && manual) {
      return formatToStandard(parseFloat(manual.replace(/,/g, '')));
    }
    
    // Use the auto-normalized value (with intentional mistakes for CU agent to catch)
    return invoice.autoNormalized;
  };

  const handleNormalize = () => {
    if (selectedInvoice === null) return;
    
    const selectedInvoiceData = invoices.find(inv => inv.id === selectedInvoice);
    if (!selectedInvoiceData) return;
    
    const normalized = normalizeAmount(selectedInvoiceData, conversionRule, manualAmount);
    
    // [Cheat] console log for human testers - confirm normalization success
    const lastLoggedKey = `task2_normalize_${selectedInvoice}_${Date.now()}`;
    if (!(window as any)[lastLoggedKey]) {
      const isValidFormat = normalized.match(/^\d{1,3}(,\d{3})*\.\d{2}$/) || normalized.match(/^\d+\.\d{2}$/);
      const isCorrectValue = normalized === selectedInvoiceData.expectedNormalized;
      const status = isValidFormat && isCorrectValue ? 'SUCCESS' : 'FAILED';
      const method = conversionRule === 'manual' ? 'Manual' : 'Auto';
      
      const statusIcon = status === 'SUCCESS' ? '✅' : '❌';
      console.log(`[Cheat] ${statusIcon} Normalization ${status}: Invoice ${selectedInvoiceData.invoiceNumber} "${selectedInvoiceData.originalAmount}" → "${normalized}" (${method})`);
      console.log(`[Cheat] Target: "${selectedInvoiceData.expectedNormalized}"`);
      
      if (!isValidFormat) {
        console.log(`[Cheat] ❌ Format error: Expected "1,234.56" or "1234.56" format, got "${normalized}"`);
      }
      if (!isCorrectValue) {
        console.log(`[Cheat] ❌ Value error: Expected "${selectedInvoiceData.expectedNormalized}", got "${normalized}"`);
      }
      
      (window as any)[lastLoggedKey] = true;
    }
    
    // Only mark as completed if both format and value are correct
    const isValidFormat = normalized.match(/^\d{1,3}(,\d{3})*\.\d{2}$/) || normalized.match(/^\d+\.\d{2}$/);
    const isCorrectValue = normalized === selectedInvoiceData.expectedNormalized;
    const isCompleted = isValidFormat && isCorrectValue;
    
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === selectedInvoice) {
        return {
          ...inv,
          normalizedAmount: isCompleted ? normalized : '', // Clear if incorrect
          status: isCompleted ? 'completed' as 'pending' | 'completed' | 'error' : 'pending' as 'pending' | 'completed' | 'error',
          notes: isCompleted ? (conversionRule === 'manual' ? `Manual override: ${manualAmount}` : 'Auto-converted') : ''
        };
      }
      return inv;
    });
    
    setInvoices(updatedInvoices);
    
    // Only increment completed count if normalization was successful
    if (isValidFormat && isCorrectValue) {
      setCompletedCount(prev => prev + 1);
    }
    
    setSelectedInvoice(null);
    setManualAmount('');
    setConversionRule('auto');
  };

  const resetInvoice = (invoiceId: number) => {
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          normalizedAmount: '',
          status: 'pending' as 'pending' | 'completed' | 'error',
          notes: ''
        };
      }
      return inv;
    });
    
    setInvoices(updatedInvoices);
    setCompletedCount(prev => prev - 1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 border border-gray-300 rounded" />;
    }
  };

  const selectedInvoiceData = invoices.find(inv => inv.id === selectedInvoice);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">Vendor Invoice Parser</h1>
        <p className="text-gray-600 mt-1">Normalize currency amounts to standard "1,234.56" decimal format</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Raw Invoice Data */}
        <div className="w-1/2 bg-white border-r p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Raw Invoice Data</h3>
            <div className="text-sm text-gray-600">
              {completedCount} / 12 normalized
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Invoice #</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Vendor</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Original Amount</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="max-h-96 overflow-y-auto">
                {invoices.map((invoice) => (
                  <tr 
                    key={invoice.id}
                    className={`cursor-pointer hover:bg-blue-50 ${
                      selectedInvoice === invoice.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                    } ${invoice.isAmbiguous ? 'bg-yellow-50' : ''}`}
                    onClick={() => setSelectedInvoice(invoice.id)}
                  >
                    <td className="px-3 py-2 font-medium">
                      {invoice.invoiceNumber}
                      {invoice.isAmbiguous && (
                        <AlertTriangle className="inline h-3 w-3 text-yellow-500 ml-1" />
                      )}
                    </td>
                    <td className="px-3 py-2 truncate">{invoice.vendor}</td>
                    <td className="px-3 py-2 font-mono text-blue-600">{invoice.originalAmount}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(invoice.status)}
                        <span className="text-xs">{invoice.status === 'completed' ? 'Done' : 'Pending'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel - Normalization Controls */}
        <div className="w-1/2 p-6">
          <h3 className="text-lg font-semibold mb-4">Normalization Panel</h3>
          
          {selectedInvoiceData ? (
            <div className="space-y-6">
              {/* Invoice Details */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium text-gray-800 mb-2">Selected Invoice</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Invoice:</span>
                    <div className="font-medium">{selectedInvoiceData.invoiceNumber}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Vendor:</span>
                    <div className="font-medium">{selectedInvoiceData.vendor}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Original Amount:</span>
                    <div className="font-mono text-lg text-blue-600">{selectedInvoiceData.originalAmount}</div>
                  </div>
                </div>
              </div>

              {/* Conversion Rules */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium text-gray-800 mb-3">Conversion Rules</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="conversionRule"
                      value="auto"
                      checked={conversionRule === 'auto'}
                      onChange={(e) => setConversionRule(e.target.value)}
                      className="mr-2"
                    />
                    <span>Auto-detect format</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="conversionRule"
                      value="manual"
                      checked={conversionRule === 'manual'}
                      onChange={(e) => setConversionRule(e.target.value)}
                      className="mr-2"
                    />
                    <span>Manual override</span>
                  </label>
                  
                  {conversionRule === 'manual' && (
                    <div className="ml-6">
                      <input
                        type="text"
                        placeholder="Enter amount (e.g., 1234.56)"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium text-gray-800 mb-3">Preview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Original:</span>
                    <div className="font-mono text-blue-600">{selectedInvoiceData.originalAmount}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Normalized:</span>
                    <div className="font-mono text-green-600 font-medium">
                      {conversionRule === 'manual' && manualAmount ? 
                        formatToStandard(parseFloat(manualAmount.replace(/,/g, ''))) :
                        selectedInvoiceData.autoNormalized
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleNormalize}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Normalize Amount
                </button>
                {selectedInvoiceData.status === 'completed' && (
                  <button
                    onClick={() => resetInvoice(selectedInvoiceData.id)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Reset
                  </button>
                )}
              </div>

              {selectedInvoiceData.isAmbiguous && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Ambiguous Case</span>
                  </div>
                  <p className="text-yellow-700 text-xs mt-1">
                    This invoice requires manual judgment for accurate conversion.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select an invoice from the left panel to begin normalization</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Panel - Standardized Results */}
      <div className="h-48 bg-white border-t p-4">
        <h3 className="text-lg font-semibold mb-3">Standardized Data Table</h3>
        <div className="bg-gray-50 rounded-lg border overflow-auto h-32">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Invoice #</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Original Amount</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Normalized Amount</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Currency</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {invoices.filter(inv => inv.normalizedAmount).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{invoice.invoiceNumber}</td>
                  <td className="px-3 py-2 font-mono text-blue-600">{invoice.originalAmount}</td>
                  <td className="px-3 py-2 font-mono text-green-600 font-medium">{invoice.normalizedAmount}</td>
                  <td className="px-3 py-2">{invoice.currency}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(invoice.status)}
                      <span className="text-xs capitalize">{invoice.status}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">{invoice.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Task2;