// SAP Modal Component
// ============================================================================

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
