import React, { useState } from 'react';
import { X, Search, User, Building2, DollarSign, AlertCircle, Plus } from 'lucide-react';

export interface DropdownOption {
  id: string;
  name: string;
  subtitle?: string;
  type: 'user' | 'lead' | 'account' | 'opportunity' | 'case';
  icon?: string;
}

interface SearchableDropdownProps {
  label: string;
  required?: boolean;
  placeholder: string;
  value?: DropdownOption | null;
  options: DropdownOption[];
  onSelect: (option: DropdownOption | null) => void;
  onSearch?: (query: string) => void;
  dropdownType: 'user' | 'lead' | 'account' | 'opportunity' | 'case' | 'mixed';
  newOptionText?: string;
  className?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  required = false,
  placeholder,
  value,
  options,
  onSelect,
  onSearch,
  dropdownType,
  newOptionText,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClear = () => {
    onSelect(null);
    setIsOpen(true);
    setSearchQuery('');
  };

  const handleOptionSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    if (onSearch) {
      onSearch(query);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User size={12} className="text-blue-600" />;
      case 'lead':
        return (
          <svg className="w-3 h-3 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'account':
        return <Building2 size={12} className="text-purple-600" />;
      case 'opportunity':
        return <DollarSign size={12} className="text-green-600" />;
      case 'case':
        return <AlertCircle size={12} className="text-orange-600" />;
      default:
        return <Building2 size={12} className="text-gray-600" />;
    }
  };

  const getDropdownIcon = () => {
    switch (dropdownType) {
      case 'user':
        return <User size={14} className="text-white" />;
      case 'lead':
        return (
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'account':
      case 'mixed':
        return <Building2 size={14} className="text-white" />;
      default:
        return <Building2 size={14} className="text-white" />;
    }
  };

  const getDropdownColor = () => {
    switch (dropdownType) {
      case 'user':
        return 'bg-blue-500';
      case 'lead':
        return 'bg-teal-500';
      case 'account':
      case 'mixed':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredOptions = options.filter(option => {
    const query = searchQuery.toLowerCase();
    const name = option.name.toLowerCase();
    const subtitle = option.subtitle?.toLowerCase() || '';
    return name.includes(query) || subtitle.includes(query);
  });

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {required && <span className="text-red-500">* </span>}
        {label}
      </label>
      <div className="relative">
        {value && !isOpen ? (
          // Selected value display
          <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-sm bg-blue-50">
            <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
              {getTypeIcon(value.type)}
            </div>
            <span className="text-sm text-gray-900 flex-1">{value.name}</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Remove selection"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          // Search input
          <div className="relative">
            <div className="flex">
              <div className={`flex items-center px-3 py-2 border border-gray-300 rounded-l-sm ${getDropdownColor()}`}>
                {getDropdownIcon()}
                <svg className="w-3 h-3 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border border-l-0 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex items-center px-3 py-2 bg-gray-50 border border-l-0 border-gray-300">
                <span className="text-sm text-gray-600 mr-2">
                  {dropdownType === 'user' ? 'Search People...' : 
                   dropdownType === 'lead' ? 'Search Leads...' : 
                   'Search Accounts...'}
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-sm hover:bg-gray-100"
                aria-label="Search"
              >
                <Search size={14} className="text-gray-400" />
              </button>
            </div>
            
            {/* Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-sm shadow-lg max-h-64 overflow-y-auto">
                {filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-3">
                      {getTypeIcon(option.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {option.name}
                      </div>
                      {option.subtitle && (
                        <div className="text-sm text-gray-500">{option.subtitle}</div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* New option */}
                {newOptionText && (
                  <div className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-t border-gray-200">
                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-3">
                      <Plus size={14} className="text-gray-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{newOptionText}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableDropdown;
