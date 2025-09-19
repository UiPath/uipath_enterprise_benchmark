import React from 'react';
import { Calendar } from 'lucide-react';
import { type Expense } from '../data';

interface ExpenseTableProps {
  expenses: Expense[];
  showReceiptColumn?: boolean;
  selectable?: boolean;
  selectedExpenses?: Set<number>;
  onExpenseSelect?: (expenseId: number, isChecked: boolean) => void;
  onRowClick?: (expense: Expense, e: React.MouseEvent) => void;
  onExpenseDetails?: (expense: Expense) => void;
  className?: string;
}

const ExpenseTable: React.FC<ExpenseTableProps> = React.memo(({ 
  expenses,
  showReceiptColumn = false,
  selectable = false,
  selectedExpenses = new Set(),
  onExpenseSelect,
  onRowClick,
  onExpenseDetails,
  className = ""
}) => {
  const handleRowClick = React.useCallback((expense: Expense, e: React.MouseEvent) => {
    // Prevent triggering when clicking checkboxes or payment type
    if (e.target instanceof Element && (
      e.target.closest('input[type="checkbox"]') || 
      e.target.closest('.payment-type-cell')
    )) return;
    
    if (selectable && onRowClick) {
      onRowClick(expense, e);
    } else if (onExpenseDetails) {
      onExpenseDetails(expense);
    }
  }, [selectable, onRowClick, onExpenseDetails]);

  const handleExpenseToggle = React.useCallback((expenseId: number, isChecked: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpenseSelect) {
      onExpenseSelect(expenseId, isChecked);
    }
  }, [onExpenseSelect]);

  const handlePaymentTypeClick = React.useCallback((expense: Expense, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpenseDetails) {
      onExpenseDetails(expense);
    }
  }, [onExpenseDetails]);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                {showReceiptColumn ? <input type="checkbox" className="rounded" /> : ''}
              </th>
            )}
            {showReceiptColumn && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Type ↕
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expense Source
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expense Type ↕
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendor Details ↕
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date ↕
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount ↕
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map((expense) => (
            <tr 
              key={expense.id} 
              className={`hover:bg-gray-50 cursor-pointer ${
                selectable && selectedExpenses.has(expense.id) ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={(e) => handleRowClick(expense, e)}
            >
              {selectable && (
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={selectedExpenses.has(expense.id)}
                    onChange={(e) => handleExpenseToggle(expense.id, e.target.checked, e as any)}
                  />
                </td>
              )}
              {showReceiptColumn && (
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                </td>
              )}
              <td className="px-4 py-3 text-sm text-blue-600 hover:text-blue-800 cursor-pointer payment-type-cell"
                  onClick={(e) => handlePaymentTypeClick(expense, e)}>
                {expense.paymentType}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{expense.expenseSource}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{expense.expenseType}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-pre-line">{expense.vendorDetails}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{expense.date}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{expense.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

ExpenseTable.displayName = 'ExpenseTable';

export default ExpenseTable;
