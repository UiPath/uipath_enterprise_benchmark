// SAP Filter Input Component
// ============================================================================

import React, { useState } from 'react';
import { X } from 'lucide-react';
import FilterConditionsModal from './FilterConditionsModal';

interface FilterCondition {
  operator: string;
  value: string;
  value2?: string;
}

interface FilterClause {
  id: string;
  operator: string;
  value: string;
  value2?: string;
}

interface FilterInputProps {
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  onFilterChange?: (clauses: FilterClause[] | null) => void;
  placeholder?: string;
  className?: string;
  showFilterIcon?: boolean;
}

const FilterInput: React.FC<FilterInputProps> = ({ 
  fieldName,
  value,
  onChange,
  onFilterChange,
  placeholder,
  className = '',
  showFilterIcon = true
}) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterClauses, setFilterClauses] = useState<FilterClause[] | null>(null);

  const formatClausePill = (clause: FilterClause): string => {
    switch (clause.operator) {
      case 'contains pattern':
        return `*${clause.value}*`;
      case 'does not contain pattern':
        return `!(*${clause.value}*)`;
      case 'not equal to':
        return `!(=${clause.value})`;
      case 'greater':
        return `>${clause.value}`;
      case 'greater than or equal to':
        return `>=${clause.value}`;
      case 'less':
        return `<${clause.value}`;
      case 'less than or equal to':
        return `<=${clause.value}`;
      case 'between':
        return `${clause.value}...${clause.value2 || ''}`;
      case 'not between':
        return `!(${clause.value}...${clause.value2 || ''})`;
      case 'equal to':
        return `=${clause.value}`;  // Format equal to as =value when part of multiple clauses
      default:
        return clause.value;
    }
  };



  const shouldShowAsPill = (clauses: FilterClause[]): boolean => {
    return clauses.length > 1 || clauses[0].operator !== 'equal to';
  };

  const hasEqualToOnly = (clauses: FilterClause[]): boolean => {
    return clauses.length === 1 && clauses[0].operator === 'equal to';
  };

  const displayValue = filterClauses && hasEqualToOnly(filterClauses) ? filterClauses[0].value : value;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If there are filter clauses, clear them when user types
    if (filterClauses) {
      setFilterClauses(null);
      onFilterChange?.(null);
    }
    onChange(e.target.value);
  };

  const handleFilterApply = (clauses: FilterClause[]) => {
    setFilterClauses(clauses);
    onFilterChange?.(clauses);
    // Don't call onChange('') here as it triggers the parent's onChange which clears the filter
  };

  const handleFilterIconClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleRemoveFilter = () => {
    setFilterClauses(null);
    onFilterChange?.(null);
  };

  return (
    <div className="relative">
      <div className="flex">
        <input 
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={filterClauses && shouldShowAsPill(filterClauses) ? '' : placeholder}
          className={`border border-gray-400 px-2 py-1 text-sm bg-white ${showFilterIcon ? 'pr-8' : ''} ${className}`}
        />
        {showFilterIcon && (
          <button
            type="button"
            onClick={handleFilterIconClick}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors"
            title="Define filter conditions"
          >
            <span className="text-gray-600 text-sm">⚏</span>
          </button>
        )}
      </div>
      
      {/* Filter Condition Pills */}
      {filterClauses && shouldShowAsPill(filterClauses) && (
        <div className="absolute top-0.5 left-0.5 right-8 bottom-0.5 flex items-center gap-1 pointer-events-none overflow-hidden">
          {filterClauses.map((clause, index) => (
            <div key={clause.id} className="flex items-center bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-blue-800 pointer-events-auto flex-shrink-0">
              <span className="font-medium">{formatClausePill(clause)}</span>
              {filterClauses.length > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    const newClauses = filterClauses.filter((_, i) => i !== index);
                    if (newClauses.length === 0) {
                      handleRemoveFilter();
                    } else {
                      setFilterClauses(newClauses);
                      onFilterChange?.(newClauses);
                    }
                  }}
                  className="ml-1 hover:bg-blue-100 rounded p-0.5 transition-colors flex-shrink-0"
                  title="Remove this condition"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveFilter}
                  className="ml-1 hover:bg-blue-100 rounded p-0.5 transition-colors flex-shrink-0"
                  title="Remove filter condition"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      <FilterConditionsModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleFilterApply}
        fieldName={fieldName}
        currentValue={value}
        existingClauses={filterClauses}
      />
    </div>
  );
};

export default FilterInput;

