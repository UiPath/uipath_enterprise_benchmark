import React from 'react';
import { Plus, Calendar, AlertTriangle, Upload, FileText } from 'lucide-react';
import { type Report, type Expense } from '../data';
import Header from './Header';

interface ReportDetailsProps {
  currentReport: Report | null;
  setCurrentView: (view: 'dashboard' | 'manage-expenses' | 'report-details') => void;
  editReport: (report: Report) => void;
  setShowSubmitModal: (show: boolean) => void;
  setShowAddExpenseModal: (show: boolean) => void;
  setSelectedExpenseForReceipt: (expense: Expense | null) => void;
  setShowAttachReceiptModal: (show: boolean) => void;
}

const ReportDetails: React.FC<ReportDetailsProps> = ({
  currentReport,
  setCurrentView,
  editReport,
  setShowSubmitModal,
  setShowAddExpenseModal,
  setSelectedExpenseForReceipt,
  setShowAttachReceiptModal
}) => {
  if (!currentReport) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setCurrentView={setCurrentView} />
      
      {/* Sub Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button 
              onClick={() => setCurrentView('manage-expenses')}
              className="py-3 px-1 text-gray-500 hover:text-gray-700 text-sm"
            >
              Manage Expenses
            </button>
            <button className="py-3 px-1 text-gray-500 hover:text-gray-700 text-sm">
              Card Transactions
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="text-sm text-gray-600">
            <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => setCurrentView('dashboard')}>Home</span>
            <span className="mx-2">/</span>
            <span className="text-blue-600 hover:underline cursor-pointer">Expense</span>
            <span className="mx-2">/</span>
            <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => setCurrentView('manage-expenses')}>Manage Expenses</span>
            <span className="mx-2">/</span>
            <span>{currentReport.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Report Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {currentReport.name} RON {currentReport.totalAmount.toFixed(2)}
            </h1>
            <div className="text-sm text-gray-600 mt-1">
              <span className="text-blue-600">{currentReport.status}</span>
              <span className="mx-2">|</span>
              <span>Report Number: <button 
                onClick={() => editReport(currentReport)}
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
              >
                {currentReport.reportNumber}
              </button></span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Submit Report
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
              Copy Report
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
              Delete Report
            </button>
          </div>
        </div>

        {/* Report Details Tabs */}
        <div className="bg-white border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button className="py-3 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
              Report Details
            </button>
            <button className="py-3 px-1 text-gray-500 hover:text-gray-700 text-sm">
              Print/Share
            </button>
            <button className="py-3 px-1 text-gray-500 hover:text-gray-700 text-sm">
              Manage Receipts
            </button>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Expenses</h2>
            <button 
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>

          {currentReport.expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-blue-400" />
              </div>
              <div className="text-lg font-medium text-gray-900 mb-2">No Expenses</div>
              <div className="text-sm text-gray-600 mb-4">
                Add expenses to this report to submit for reimbursement.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alerts
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attach Receipt
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expense Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentReport.expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {!expense.hasReceipt && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => {
                            setSelectedExpenseForReceipt(expense);
                            setShowAttachReceiptModal(true);
                          }}
                          className={expense.hasReceipt ? "text-green-600 hover:text-green-800" : "text-blue-600 hover:text-blue-800"}
                        >
                          {expense.hasReceipt ? (
                            <FileText className="w-4 h-4" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-gray-400" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">{expense.paymentType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{expense.expenseType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-pre-line">{expense.vendorDetails}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{expense.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{expense.amount}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        RON {parseFloat(expense.amount.replace(/[^\d.-]/g, '')) || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
