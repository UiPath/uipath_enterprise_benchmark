import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorModalProps {
  showErrorModal: boolean;
  setShowErrorModal: (show: boolean) => void;
  errorMessage: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  showErrorModal,
  setShowErrorModal,
  errorMessage
}) => {
  if (!showErrorModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Error</h2>
          </div>
          <button 
            onClick={() => setShowErrorModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-gray-700">{errorMessage}</p>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button 
            onClick={() => setShowErrorModal(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
