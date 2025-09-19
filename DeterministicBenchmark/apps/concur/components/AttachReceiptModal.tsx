import React, { useState, useEffect } from 'react';
import { Calendar, Upload, X } from 'lucide-react';
import { type Expense, type Report } from '../data';

interface AttachReceiptModalProps {
  showAttachReceiptModal: boolean;
  setShowAttachReceiptModal: (show: boolean) => void;
  selectedExpenseForReceipt: Expense | null;
  availableReceipts: Expense[];
  setAvailableReceipts: (receipts: Expense[]) => void;
  setAvailableExpenses: (updater: (prev: Expense[]) => Expense[]) => void;
  currentReport: Report | null;
  setCurrentReport: (updater: (prev: Report | null) => Report | null) => void;
  onModalStateChange?: (modalState: {
    isOpen: boolean;
    selectedTab: string;
    selectedReceipt: number | null;
    selectedExpenseForReceipt: Expense | null;
  }) => void;
}

const AttachReceiptModal: React.FC<AttachReceiptModalProps> = ({
  showAttachReceiptModal,
  setShowAttachReceiptModal,
  selectedExpenseForReceipt,
  availableReceipts,
  setAvailableReceipts,
  setAvailableExpenses,
  currentReport,
  setCurrentReport,
  onModalStateChange
}) => {
  const [selectedTab, setSelectedTab] = useState('select');
  const [selectedReceipt, setSelectedReceipt] = useState<number | null>(null);

  // Notify parent of modal state changes for live cheat feedback
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange({
        isOpen: showAttachReceiptModal,
        selectedTab,
        selectedReceipt,
        selectedExpenseForReceipt
      });
    }
  }, [showAttachReceiptModal, selectedTab, selectedReceipt, selectedExpenseForReceipt, onModalStateChange]);

  if (!showAttachReceiptModal) return null;

  const handleFileUpload = (file: File) => {
    if (file && selectedExpenseForReceipt) {
      // Mark the expense as having a receipt attached
      setAvailableExpenses(prevExpenses => 
        prevExpenses.map(expense => 
          expense.id === selectedExpenseForReceipt.id 
            ? { ...expense, hasReceipt: true }
            : expense
        )
      );
      // Also update currentReport if this expense is in the current report
      if (currentReport) {
        setCurrentReport(prevReport => prevReport ? ({
          ...prevReport,
          expenses: prevReport.expenses.map(expense => 
            expense.id === selectedExpenseForReceipt.id 
              ? { ...expense, hasReceipt: true }
              : expense
          )
        }) : null);
      }
      setShowAttachReceiptModal(false);
    }
  };

  const handleDragAndDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Attach Receipt</h2>
            <button 
              onClick={() => setShowAttachReceiptModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {selectedExpenseForReceipt && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Expense Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-900 font-medium">{selectedExpenseForReceipt.paymentType}</div>
                <div className="text-sm text-gray-600">{selectedExpenseForReceipt.vendorDetails}</div>
                <div className="text-sm text-gray-600">{selectedExpenseForReceipt.date} • {selectedExpenseForReceipt.amount}</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button 
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                selectedTab === 'select' ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
              onClick={() => setSelectedTab('select')}
            >
              <Calendar className="w-4 h-4" />
              <span>Select from Available Receipts</span>
            </button>
            <button 
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                selectedTab === 'upload' ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
              onClick={() => setSelectedTab('upload')}
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Receipt</span>
            </button>
          </div>

          {selectedTab === 'upload' ? (
            <>
              {/* File Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                }}
                onDrop={handleDragAndDrop}
              >
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Receipt</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop your receipt here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supported formats: PNG, JPG, JPEG, PDF, TIF, TIFF (max 10MB)
                  </p>
                  
                  <input
                    type="file"
                    id="receipt-upload"
                    accept=".png,.jpg,.jpeg,.pdf,.tif,.tiff"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                  />
                  
                  <label 
                    htmlFor="receipt-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for clear receipt images:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Ensure the entire receipt is visible in the image</li>
                  <li>• Use good lighting and avoid shadows</li>
                  <li>• Keep the receipt flat and straight</li>
                  <li>• Make sure text is clear and readable</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Available Receipts Grid */}
              <div className="grid grid-cols-3 gap-4">
                {availableReceipts.map((expense) => (
                  <div 
                    key={expense.id}
                    className={`border rounded-lg p-4 cursor-pointer ${
                      selectedReceipt === expense.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedReceipt(expense.id)}
                  >
                    <div className="aspect-w-4 aspect-h-3 mb-3">
                      <img 
                        src={expense.receiptImage} 
                        alt={`Receipt for ${expense.vendorDetails.split('\\n')[0]}`}
                        className="object-cover rounded w-full h-32"
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{expense.vendorDetails.split('\\n')[0]}</div>
                    <div className="text-sm text-gray-600">{expense.date}</div>
                    <div className="text-sm font-medium text-gray-900">{expense.amount}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button 
            onClick={() => setShowAttachReceiptModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {selectedTab === 'select' && (
            <button 
              onClick={() => {
                if (selectedReceipt && selectedExpenseForReceipt) {
                  // Mark the expense as having a receipt attached
                  setAvailableExpenses(prevExpenses => 
                    prevExpenses.map(expense => 
                      expense.id === selectedExpenseForReceipt.id 
                        ? { ...expense, hasReceipt: true }
                        : expense
                    )
                  );
                  // Also update currentReport if this expense is in the current report
                  if (currentReport) {
                    setCurrentReport(prevReport => prevReport ? ({
                      ...prevReport,
                      expenses: prevReport.expenses.map(expense => 
                        expense.id === selectedExpenseForReceipt.id 
                          ? { ...expense, hasReceipt: true }
                          : expense
                      )
                    }) : null);
                  }
                  // Remove the selected receipt from available receipts
                  setAvailableReceipts(prevReceipts => 
                    prevReceipts.filter(receipt => receipt.id !== selectedReceipt)
                  );
                  setShowAttachReceiptModal(false);
                }
              }}
              disabled={!selectedReceipt}
              className={`px-4 py-2 rounded-md ${
                selectedReceipt 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Attach Selected Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachReceiptModal;
