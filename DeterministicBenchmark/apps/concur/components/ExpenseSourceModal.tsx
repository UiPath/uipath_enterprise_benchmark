import React from 'react';
import { X } from 'lucide-react';
import { type Expense } from '../data';

interface ExpenseSourceModalProps {
  showExpenseSourceModal: boolean;
  setShowExpenseSourceModal: (show: boolean) => void;
  selectedExpenseForDetails: Expense | null;
}

const ExpenseSourceModal: React.FC<ExpenseSourceModalProps> = React.memo(({ 
  showExpenseSourceModal,
  setShowExpenseSourceModal,
  selectedExpenseForDetails
}) => {
  const handleCloseModal = React.useCallback(() => {
    setShowExpenseSourceModal(false);
  }, [setShowExpenseSourceModal]);

  if (!showExpenseSourceModal || !selectedExpenseForDetails) return null;

  const expense = selectedExpenseForDetails;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Expense Source</h2>
          <button 
            onClick={handleCloseModal}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Header Summary */}
          <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{expense.vendorDetails.split('\n')[0]}</h3>
              <p className="text-sm text-gray-600">{expense.date}</p>
            </div>
            <div className="text-xl font-bold text-gray-900">{expense.amount}</div>
          </div>

          {/* Expense Details Table */}
          <div className="mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Expense Source</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Vendor</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 text-sm text-gray-900">{expense.expenseSource}</td>
                  <td className="py-2 text-sm text-gray-900">{expense.vendorDetails}</td>
                  <td className="py-2 text-sm text-gray-900">{expense.date}</td>
                  <td className="py-2 text-sm text-gray-900">{expense.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detailed Information Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Left Card - Expense Details */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{expense.amount}</h4>
                <p className="text-sm text-gray-600">{expense.date}</p>
                <p className="text-sm text-gray-600">{expense.expenseSource}</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Expense Type:</span>
                  <div>{expense.expenseType}</div>
                </div>
                <div>
                  <span className="font-medium">Vendor:</span>
                  <div>{expense.vendorDetails.split('\n')[0]}</div>
                </div>
                <div>
                  <span className="font-medium">Location:</span>
                  <div>{expense.vendorDetails.split('\n').slice(1).join(', ')}</div>
                </div>
                {expense.expenseSource === 'Corporate Card' && (
                  <div>
                    <span className="font-medium">Payment Type:</span>
                    <div>{expense.paymentType}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Card - Receipt/Additional Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 min-h-[200px] flex items-center justify-center">
                {expense.expenseSource === 'Expenseit' ? (
                  <div>
                    <div className="text-blue-600 mb-2">ℹ️</div>
                    <div className="text-sm">Some receipt data could not be read. Consider entering it manually.</div>
                    <div className="text-xs mt-2 text-blue-600 underline cursor-pointer">Tips for taking clear receipt images</div>
                  </div>
                ) : (
                  <div>Receipt/Card Transaction Details</div>
                )}
              </div>
            </div>
          </div>

          {/* Reference Number */}
          {expense.expenseSource === 'Corporate Card' && (
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm">
                <span className="font-medium">Reference Number:</span>
                <div className="mt-1 text-gray-600">600003{Math.random().toString().substring(2, 15)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button 
            onClick={handleCloseModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

ExpenseSourceModal.displayName = 'ExpenseSourceModal';

export default ExpenseSourceModal;
