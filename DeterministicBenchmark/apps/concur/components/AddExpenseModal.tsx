import React from 'react';
import { Search, Plus, Calendar, X } from 'lucide-react';
import { type Expense } from '../data';
import ExpenseTable from './ExpenseTable';

interface AddExpenseModalProps {
  showAddExpenseModal: boolean;
  setShowAddExpenseModal: (show: boolean) => void;
  availableExpenses: Expense[];
  selectedExpenses: Set<number>;
  setSelectedExpenses: (expenses: Set<number>) => void;
  addExpensesToReport: () => void;
  setShowExpenseSourceModal: (show: boolean) => void;
  setSelectedExpenseForDetails: (expense: Expense | null) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = React.memo(({ 
  showAddExpenseModal,
  setShowAddExpenseModal,
  availableExpenses,
  selectedExpenses,
  setSelectedExpenses,
  addExpensesToReport,
  setShowExpenseSourceModal,
  setSelectedExpenseForDetails
}) => {
  const handleCloseModal = React.useCallback(() => {
    setShowAddExpenseModal(false);
  }, [setShowAddExpenseModal]);

  const handleExpenseToggle = React.useCallback((expenseId: number, isChecked: boolean) => {
    setSelectedExpenses(prev => {
      const newSelected = new Set(prev);
      if (isChecked) {
        newSelected.add(expenseId);
      } else {
        newSelected.delete(expenseId);
      }
      return newSelected;
    });
  }, [setSelectedExpenses]);

  const handleRowClick = React.useCallback((expense: Expense, e: React.MouseEvent) => {
    // Prevent triggering when clicking the payment type
    if (e.target instanceof Element && e.target.closest('.payment-type-cell')) return;
    
    const isCurrentlySelected = selectedExpenses.has(expense.id);
    handleExpenseToggle(expense.id, !isCurrentlySelected);
  }, [selectedExpenses, handleExpenseToggle]);

  const handlePaymentTypeClick = React.useCallback((expense: Expense, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExpenseForDetails(expense);
    setShowExpenseSourceModal(true);
  }, [setSelectedExpenseForDetails, setShowExpenseSourceModal]);

  if (!showAddExpenseModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Expense to Report</h2>
          <button 
            onClick={handleCloseModal}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 rounded-md">
              <Search className="w-4 h-4" />
              <span>Scan Receipt</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 rounded-md">
              <Plus className="w-4 h-4" />
              <span>Manually Create Expense</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md">
              <Calendar className="w-4 h-4" />
              <span>Select from Available Expenses ({availableExpenses.length})</span>
            </button>
          </div>

          {/* Expenses Table */}
          <ExpenseTable 
            expenses={availableExpenses}
            selectable={true}
            selectedExpenses={selectedExpenses}
            onExpenseSelect={handleExpenseToggle}
            onRowClick={handleRowClick}
            onExpenseDetails={(expense) => {
              setSelectedExpenseForDetails(expense);
              setShowExpenseSourceModal(true);
            }}
            className="border border-gray-200 rounded-lg overflow-hidden"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button 
            onClick={handleCloseModal}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              addExpensesToReport();
              handleCloseModal();
            }}
            disabled={selectedExpenses.size === 0}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedExpenses.size === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Add To Report
          </button>
        </div>
      </div>
    </div>
  );
});

AddExpenseModal.displayName = 'AddExpenseModal';

export default AddExpenseModal;
