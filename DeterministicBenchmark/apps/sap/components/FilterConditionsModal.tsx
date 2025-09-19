// SAP Filter Conditions Modal Component
// ============================================================================

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FilterClause {
  id: string;
  operator: string;
  value: string;
  value2?: string;
}

interface FilterConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (clauses: FilterClause[]) => void;
  fieldName: string;
  currentValue?: string;
  existingClauses?: FilterClause[];
}

const FILTER_OPERATORS = [
  'equal to',
  'not equal to', 
  'greater',
  'greater than or equal to',
  'less',
  'less than or equal to',
  'contains pattern',
  'does not contain pattern',
  'between',
  'not between'
];

const FilterConditionsModal: React.FC<FilterConditionsModalProps> = ({ 
  isOpen, 
  onClose, 
  onApply,
  fieldName,
  currentValue = '',
  existingClauses
}) => {
  const [clauses, setClauses] = useState<FilterClause[]>([]);

  // Initialize with existing clauses or create default clause when modal opens
  React.useEffect(() => {
    if (isOpen) {

      
      if (existingClauses && existingClauses.length > 0) {
        // Use existing clauses - make a deep copy to avoid reference issues
        setClauses(existingClauses.map(clause => ({ ...clause })));
      } else {
        // Create default clause only if no existing clauses
        setClauses([{
          id: '1',
          operator: 'equal to',
          value: currentValue || '',
          value2: ''
        }]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateClause = (id: string, field: keyof FilterClause, value: string) => {
    setClauses(prev => prev.map(clause => 
      clause.id === id ? { ...clause, [field]: value } : clause
    ));
  };

  const addClause = () => {
    // Generate a unique ID that doesn't conflict with existing clauses
    const existingIds = clauses.map(c => parseInt(c.id)).filter(id => !isNaN(id));
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newId = (maxId + 1).toString();
    
    setClauses(prev => [...prev, {
      id: newId,
      operator: 'equal to',
      value: '',
      value2: ''
    }]);
  };

  const removeClause = (id: string) => {
    if (clauses.length > 1) {
      setClauses(prev => prev.filter(clause => clause.id !== id));
    }
  };

  const handleGo = () => {
    // Filter out empty clauses (check both value and value2 for between operations)
    const validClauses = clauses.filter(clause => {
      const hasValue = clause.value && clause.value.trim();
      const needsValue2 = clause.operator === 'between' || clause.operator === 'not between';
      const hasValue2 = needsValue2 ? (clause.value2 && clause.value2.trim()) : true;
      return hasValue && hasValue2;
    });
    

    
    if (validClauses.length > 0) {
      onApply(validClauses);
    } else {
      // If no valid clauses, clear the filter
      onApply([]);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGo();
    }
  };

  const needsSecondValue = (operator: string) => operator === 'between' || operator === 'not between';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white shadow-xl w-[500px] mx-4 flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-gray-100">
          <h2 className="text-lg font-normal text-gray-900">Define Filter Conditions</h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {fieldName}
              </label>
            </div>
            
            {/* Filter Clauses */}
            <div className="space-y-4">
              {clauses.map((clause, index) => (
                <div key={clause.id} className="border border-gray-300 rounded p-4 space-y-3">
                  {/* Show AND between clauses */}
                  {index > 0 && (
                    <div className="text-sm text-gray-600 font-medium mb-2">AND</div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Condition {index + 1}</span>
                  </div>
                  
                  {/* Operator Dropdown */}
                  <select 
                    value={clause.operator}
                    onChange={(e) => updateClause(clause.id, 'operator', e.target.value)}
                    className="w-full border border-gray-400 px-3 py-2 text-sm bg-white"
                  >
                    {FILTER_OPERATORS.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>

                  {/* Value Input */}
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text"
                      value={clause.value}
                      onChange={(e) => updateClause(clause.id, 'value', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter value..."
                      className="flex-1 border border-gray-400 px-3 py-2 text-sm bg-white"
                    />
                    {clauses.length > 1 && (
                      <button
                        onClick={() => removeClause(clause.id)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Remove condition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Second Value Input (for between operations) */}
                  {needsSecondValue(clause.operator) && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">and</label>
                      <input 
                        type="text"
                        value={clause.value2 || ''}
                        onChange={(e) => updateClause(clause.id, 'value2', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter second value..."
                        className="w-full border border-gray-400 px-3 py-2 text-sm bg-white"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Button */}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={addClause}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm border border-blue-600 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-300">
          <button 
            onClick={handleGo}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm border border-blue-600"
          >
            Go
          </button>
          <button 
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm border border-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterConditionsModal;