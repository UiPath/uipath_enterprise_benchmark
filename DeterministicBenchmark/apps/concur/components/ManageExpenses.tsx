import React from 'react';
import { Plus, Calendar, AlertTriangle } from 'lucide-react';
import { type Expense, type Report } from '../data';
import Header from './Header';
import ExpenseTable from './ExpenseTable';

interface ManageExpensesProps {
  availableExpenses: Expense[];
  reports: Report[];
  submittedReports: Report[];
  setCurrentView: (view: 'dashboard' | 'manage-expenses' | 'report-details') => void;
  setCurrentReport: (report: Report) => void;
  resetReportForm: () => void;
  setFieldErrors: (errors: Record<string, boolean>) => void;
  setIsEditMode: (editMode: boolean) => void;
  setShowCreateReportModal: (show: boolean) => void;
  setSelectedExpenseForDetails: (expense: Expense | null) => void;
  setShowExpenseSourceModal: (show: boolean) => void;
}

const ManageExpenses: React.FC<ManageExpensesProps> = ({
  availableExpenses,
  reports,
  submittedReports,
  setCurrentView,
  setCurrentReport,
  resetReportForm,
  setFieldErrors,
  setIsEditMode,
  setShowCreateReportModal,
  setSelectedExpenseForDetails,
  setShowExpenseSourceModal
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header setCurrentView={setCurrentView} />
      
      {/* Sub Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button className="py-3 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
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
            <span>Manage Expenses</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Manage Expenses</h1>

        {/* Report Library */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-gray-900">Report Library</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View:</span>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>Active Reports</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => {
                resetReportForm(); // Initialize form with fresh values
                setFieldErrors({}); // Clear any previous errors
                setIsEditMode(false); // Set to create mode
                setShowCreateReportModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Report</span>
            </button>
          </div>

          {reports.length === 0 && submittedReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-blue-400" />
              </div>
              <div className="text-lg font-medium text-gray-900 mb-2">No Reports</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Submitted Reports */}
              {submittedReports.map((report) => (
                <div 
                  key={report.id}
                  className="border border-gray-200 rounded-lg bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">{report.name}</h3>
                        <span className="text-xs text-gray-500">{new Date(report.submittedDate!).toLocaleDateString()}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">RON {report.totalAmount.toFixed(2)}</div>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span>Due Employee:</span>
                        <span className="font-medium">RON 0.00</span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Submitted
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Pending External Validation
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Active Reports */}
              {reports.map((report) => (
                <div 
                  key={report.id}
                  className="border border-gray-200 rounded p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setCurrentReport(report);
                    setCurrentView('report-details');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      <div className="text-xs text-gray-600">{report.status} | Report Number: {report.reportNumber}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      RON {report.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Available Expenses</h2>
          <div className="text-sm text-gray-600 mb-4">
            Drag and drop files to upload a new receipt. Valid file types for upload are .png, .jpg, .jpeg, .pdf, .tif or .tiff.
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-green-800">
                All incoming expenses will be automatically placed in reports marked "Not Submitted".
              </span>
            </div>
          </div>

          {/* Expense Table */}
          <ExpenseTable 
            expenses={availableExpenses}
            showReceiptColumn={true}
            selectable={true}
            onExpenseDetails={(expense) => {
              setSelectedExpenseForDetails(expense);
              setShowExpenseSourceModal(true);
            }}
          />

          <div className="mt-4 text-sm text-gray-600">
            To find missing transactions: <a href="#" className="text-blue-600 hover:underline">Card Transactions</a>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                Existing receipts are available from the receipt panel inside expense reports.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageExpenses;
