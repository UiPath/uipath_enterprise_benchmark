import React, { useState } from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { type Report } from '../data';

interface SubmitModalProps {
  showSubmitModal: boolean;
  setShowSubmitModal: (show: boolean) => void;
  currentReport: Report | null;
  submitReport: () => void;
}

const SubmitModal: React.FC<SubmitModalProps> = ({
  showSubmitModal,
  setShowSubmitModal,
  currentReport,
  submitReport
}) => {
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  
  if (!showSubmitModal) return null;
  
  const reportTotal = currentReport ? currentReport.totalAmount : 0;
  
  // Calculate expenses missing receipts
  const expensesWithoutReceipts = currentReport 
    ? currentReport.expenses.filter(expense => !expense.hasReceipt)
    : [];
  const alertCount = expensesWithoutReceipts.length;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Report Totals</h2>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Alerts - Only show if there are expenses missing receipts */}
          {alertCount > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => setShowAlertDetails(!showAlertDetails)}
              >
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Alerts: {alertCount} expense{alertCount !== 1 ? 's' : ''} missing receipt{alertCount !== 1 ? 's' : ''}
                </span>
                <ChevronDown className={`w-4 h-4 text-yellow-600 ml-auto transition-transform ${showAlertDetails ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Expandable Alert Details */}
              {showAlertDetails && (
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <div className="space-y-2">
                    {expensesWithoutReceipts.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                          <span className="text-yellow-800">
                            {expense.vendorDetails?.split('\n')[0] || 'Unknown Vendor'} - {expense.amount}
                          </span>
                        </div>
                        <span className="text-yellow-600 text-xs">Missing receipt</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Company Payments */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Payments</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">RON 0.00/Employee</span>
                <span className="text-sm text-gray-700">RON {reportTotal.toFixed(2)}/Citibank Corporate MasterCard - EMEA</span>
              </div>
            </div>
          </div>

          {/* Employee Payments */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Payments</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <span className="text-sm text-gray-700">RON 0.00/Company</span>
            </div>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Amount Total:</div>
              <div className="text-xl font-bold text-gray-900">RON {reportTotal.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Due Employee:</div>
              <div className="text-xl font-bold text-gray-900">RON 0.00</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Owed Company:</div>
              <div className="text-xl font-bold text-gray-900">RON 0.00</div>
            </div>
          </div>

          {/* Additional Amounts */}
          <div className="border-t border-gray-200 pt-6 mb-4">
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">
                  Amount Due (Citibank<br />Corporate MasterCard -<br />EMEA):
                </div>
                <div className="text-lg font-semibold text-gray-900">RON {reportTotal.toFixed(2)}</div>
              </div>
              <div className="text-center">
                {/* Empty space to match layout */}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Requested Amount:</div>
                <div className="text-lg font-semibold text-gray-900">RON {reportTotal.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Total Paid By Company:</div>
                <div className="text-lg font-semibold text-gray-900">RON {reportTotal.toFixed(2)}</div>
              </div>
            </div>

            <div className="text-center mt-6">
              <div className="text-sm text-gray-600 mb-1">Total Owed By Employee:</div>
              <div className="text-lg font-semibold text-gray-900">RON 0.00</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button 
            onClick={() => setShowSubmitModal(false)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={submitReport}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;
