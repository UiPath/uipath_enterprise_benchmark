import React from 'react';
import { type Report } from '../data';

interface ReportSubmittedModalProps {
  showReportSubmittedModal: boolean;
  setShowReportSubmittedModal: (show: boolean) => void;
  currentReport: Report | null;
  setCurrentReport: (report: Report | null) => void;
  setCurrentView: (view: 'dashboard' | 'manage-expenses' | 'report-details') => void;
}

const ReportSubmittedModal: React.FC<ReportSubmittedModalProps> = ({
  showReportSubmittedModal,
  setShowReportSubmittedModal,
  currentReport,
  setCurrentReport,
  setCurrentView
}) => {
  if (!showReportSubmittedModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Report Status</h2>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Report Submitted</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">{currentReport?.name || 'OpenAI API expenses'}</span>
              <span className="font-semibold text-gray-900">RON {(currentReport?.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button 
            onClick={() => {
              setShowReportSubmittedModal(false);
              setCurrentReport(null);
              setCurrentView('manage-expenses');
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportSubmittedModal;
