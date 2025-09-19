// SAP Icon Toolbar Component
// ============================================================================

import React from 'react';

interface IconToolbarProps {
  onExecute?: () => void;
  selectOptions?: string[];
  selectValue?: string;
  transactionInput?: { value: string };
  onTransactionChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTransactionSubmit?: (e: React.FormEvent) => void;
  showHelp?: boolean;
  onToggleHelp?: () => void;
  onBack?: () => void;
  onReturnToMenu?: () => void;
}

const IconToolbar: React.FC<IconToolbarProps> = ({ 
  onExecute, 
  selectOptions, 
  selectValue, 
  transactionInput, 
  onTransactionChange, 
  onTransactionSubmit, 
  showHelp, 
  onToggleHelp, 
  onBack, 
  onReturnToMenu 
}) => {
  return (
    <div className="bg-gray-200 border-b border-gray-400 px-2 py-1">
      <div className="flex items-center space-x-1">
        {onExecute && (
          <button 
            onClick={onExecute}
            title="Execute"
            className="w-6 h-6 bg-green-500 hover:bg-green-600 border border-green-600 flex items-center justify-center text-xs text-white"
          >
            ✓
          </button>
        )}
        
        {transactionInput ? (
          <form onSubmit={onTransactionSubmit} className="flex items-center space-x-1">
            <div className="relative">
              <input
                type="text"
                value={transactionInput.value}
                onChange={onTransactionChange}
                placeholder="Enter transaction code..."
                className="h-6 bg-white border border-gray-400 text-xs px-2 w-32 pr-6"
              />
              <button 
                type="button"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 hover:text-gray-800 flex items-center justify-center"
                onClick={onToggleHelp}
              >
                ▼
              </button>
            </div>
            <button type="submit" className="w-6 h-6 bg-gray-100 border border-gray-400 hover:bg-gray-50 flex items-center justify-center text-xs">↵</button>
          </form>
        ) : (
          selectOptions && (
            <select className="h-6 bg-white border border-gray-400 text-xs px-1" value={selectValue} readOnly>
              {selectOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          )
        )}
        
        <div className="flex space-x-1">
          {['⬅', '❌', '📄', '🔄', '🌐', '🖨', '📊', '⚙', '🔍', '❓'].map((icon, i) => (
            <button 
              key={i} 
              onClick={
                icon === '⬅' && onBack ? onBack :
                icon === '❌' && onReturnToMenu ? onReturnToMenu : 
                undefined
              }
              title={
                icon === '⬅' ? 'Back' :
                icon === '❌' ? 'Back to Main Menu' :
                ''
              }
              className="w-6 h-6 bg-gray-100 border border-gray-400 hover:bg-gray-50 flex items-center justify-center text-xs"
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IconToolbar;
