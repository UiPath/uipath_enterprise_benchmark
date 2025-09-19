import React, { useState, useRef, useEffect } from 'react';

interface EditableCellProps {
  value: string;
  field: string;
  leadId: string;
  isEditable: boolean;
  onSave: (leadId: string, field: string, value: string) => void;
  inputType?: 'text' | 'email' | 'tel';
  options?: string[]; // For dropdown fields like status
  className?: string;
  isEdited?: boolean; // Whether this cell has been edited
  onEditingStart?: (leadId: string, field: string) => void;
  onEditingEnd?: (leadId: string, field: string) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ 
  value, 
  field, 
  leadId, 
  isEditable, 
  onSave,
  inputType = 'text',
  options,
  className = '',
  isEdited = false,
  onEditingStart,
  onEditingEnd
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditable) {
      setEditValue(value);
      setIsEditing(true);
      onEditingStart?.(leadId, field);
    }
  };

  const handleEditingClick = (e: React.MouseEvent) => {
    // Prevent row navigation when clicking in editing mode
    e.stopPropagation();
  };

  const handleSave = () => {
    onSave(leadId, field, editValue);
    setIsEditing(false);
    onEditingEnd?.(leadId, field);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onEditingEnd?.(leadId, field);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Salesforce Lock Icon
  const LockIcon = () => (
    <svg 
      className="text-gray-400" 
      focusable="false" 
      aria-hidden="true" 
      viewBox="0 0 520 520" 
      width="12" 
      height="12"
    >
      <g>
        <path d="M110 190h40c6 0 10-3 10-9v-1A100 100 0 01267 80c53 4 93 50 93 104v-3c0 6 4 9 10 9h40c6 0 10-3 10-9v-1A160 160 0 00252 20c-85 4-150 76-152 161 1 5 5 9 10 9zm-10-9v4zm360 89a40 40 0 00-40-40H100a40 40 0 00-40 40v190a40 40 0 0040 40h320a40 40 0 0040-40zM306 427c2 6-3 13-10 13h-73c-7 0-11-6-10-13l18-60a48 48 0 01-21-48 50 50 0 0139-38c32-6 60 17 60 47 0 16-8 31-21 39z"></path>
      </g>
    </svg>
  );

  // Salesforce Edit (Pen/Crayon) Icon
  const EditIcon = () => (
    <svg 
      className="text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-blue-600" 
      focusable="false" 
      aria-hidden="true" 
      viewBox="0 0 520 520" 
      width="12" 
      height="12"
      onClick={handleStartEdit}
    >
      <g>
        <path d="M95 334l89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 00-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 000 14l88 88c4 4 10 4 14 0l25-25a38 38 0 000-55l-47-47a40 40 0 00-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 00-5 9z"></path>
      </g>
    </svg>
  );

  if (isEditing) {
    // Create background color style for edited cells
    const backgroundColor = isEdited ? { backgroundColor: 'rgb(249, 227, 182)' } : {};
    
    return (
      <div 
        className="flex items-center space-x-2 w-full h-full -mx-3 -my-3 px-3 py-3" 
        style={backgroundColor}
        onClick={handleEditingClick}
      >
        {options ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onClick={handleEditingClick}
            className="flex-1 px-2 py-1 text-xs border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={inputType}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onClick={handleEditingClick}
            className="flex-1 px-2 py-1 text-xs border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
          />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          className="p-1 text-green-600 hover:text-green-800 flex-shrink-0"
          title="Save"
        >
          ✓
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCancel();
          }}
          className="p-1 text-red-600 hover:text-red-800 flex-shrink-0"
          title="Cancel"
        >
          ✕
        </button>
      </div>
    );
  }

  // Create background color style for edited cells
  const backgroundColor = isEdited ? { backgroundColor: 'rgb(249, 227, 182)' } : {};

  return (
    <div 
      className={`flex items-center justify-between w-full h-full -mx-3 -my-3 px-3 py-3 ${className}`}
      style={backgroundColor}
    >
      <span className="text-xs text-gray-900 min-w-0 truncate">{value || ''}</span>
      {isEditable ? <EditIcon /> : <LockIcon />}
    </div>
  );
};

export default EditableCell;
