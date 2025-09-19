import React from 'react';
import { X } from 'lucide-react';
import { type FormData } from '../data';

interface CreateReportModalProps {
  showCreateReportModal: boolean;
  setShowCreateReportModal: (show: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: (editMode: boolean) => void;
  fieldErrors: Record<string, boolean>;
  setFieldErrors: (errors: Record<string, boolean>) => void;
  reportName: string;
  setReportName: (name: string) => void;
  businessPurpose: string;
  setBusinessPurpose: (purpose: string) => void;
  policy: string;
  setPolicy: (policy: string) => void;
  travelRelated: string;
  setTravelRelated: (related: string) => void;
  reportDate: string;
  setReportDate: (date: string) => void;
  reportNumber: string;
  employeeId: string;
  countryCode: string;
  logicalSystem: string;
  location: string;
  company: string;
  costCenter: string;
  setCostCenter: (center: string) => void;
  tripStartDate: string;
  setTripStartDate: (date: string) => void;
  tripEndDate: string;
  setTripEndDate: (date: string) => void;
  psaProject: string;
  setPsaProject: (project: string) => void;
  psaAssignment: string;
  setPsaAssignment: (assignment: string) => void;
  internalOrder: string;
  setInternalOrder: (order: string) => void;
  comment: string;
  setComment: (comment: string) => void;
  createReport: (skipValidation?: boolean) => void;
  setErrorMessage: (message: string) => void;
  setShowErrorModal: (show: boolean) => void;
}

const CreateReportModal: React.FC<CreateReportModalProps> = React.memo(({ 
  showCreateReportModal,
  setShowCreateReportModal,
  isEditMode,
  setIsEditMode,
  fieldErrors,
  setFieldErrors,
  reportName,
  setReportName,
  businessPurpose,
  setBusinessPurpose,
  policy,
  setPolicy,
  travelRelated,
  setTravelRelated,
  reportDate,
  setReportDate,
  reportNumber,
  employeeId,
  countryCode,
  logicalSystem,
  location,
  company,
  costCenter,
  setCostCenter,
  tripStartDate,
  setTripStartDate,
  tripEndDate,
  setTripEndDate,
  psaProject,
  setPsaProject,
  psaAssignment,
  setPsaAssignment,
  internalOrder,
  setInternalOrder,
  comment,
  setComment,
  createReport,
  setErrorMessage,
  setShowErrorModal
}) => {
  const handleModalClose = React.useCallback(() => {
    setShowCreateReportModal(false);
    setIsEditMode(false);
    setFieldErrors({});
  }, [setShowCreateReportModal, setIsEditMode, setFieldErrors]);

  const handleCreateReport = React.useCallback(() => {
    // SIMPLE VALIDATION: Check global state directly, set errors immediately
    const missingFields = [];
    const errors: Record<string, boolean> = {};
    
    if (!reportName.trim()) {
      missingFields.push('Report Name');
      errors.reportName = true;
    }
    if (!businessPurpose.trim()) {
      missingFields.push('Business Purpose');
      errors.businessPurpose = true;
    }
    if (!policy.trim()) {
      missingFields.push('Policy');
      errors.policy = true;
    }
    if (!travelRelated.trim()) {
      missingFields.push('Travel related');
      errors.travelRelated = true;
    }
    
    // IMMEDIATE ERROR HANDLING: Set errors and show modal in same render cycle
    if (missingFields.length > 0) {
      setFieldErrors(errors);
      setErrorMessage(`Before you can save this report, you must provide valid information for: ${missingFields.join(', ')}`);
      setShowErrorModal(true);
      return;
    }
    
    // SUCCESS: Clear errors and create report
    setFieldErrors({});
    createReport(true);
  }, [reportName, businessPurpose, policy, travelRelated, setFieldErrors, setErrorMessage, setShowErrorModal, createReport]);

  if (!showCreateReportModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Report' : 'Create New Report'}
          </h2>
          <button 
            onClick={handleModalClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="mb-4">
            <a href="#" className="text-blue-600 hover:underline text-sm">Create From an Approved Request</a>
          </div>

          {/* Responsive grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Row 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                value={reportName}
                onChange={(e) => {
                  setReportName(e.target.value);
                  if (fieldErrors.reportName && e.target.value.trim()) {
                    setFieldErrors(prev => ({ ...prev, reportName: false }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.reportName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy <span className="text-red-500">*</span>
              </label>
              <select 
                value={policy}
                onChange={(e) => {
                  setPolicy(e.target.value);
                  // Clear field error when user makes a selection
                  if (fieldErrors.policy && e.target.value.trim()) {
                    setFieldErrors(prev => ({ ...prev, policy: false }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.policy ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option>Netherlands Policy - SAP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Number</label>
              <input 
                type="text"
                value={reportNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
              <input 
                type="text"
                value={employeeId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Date</label>
              <input 
                type="text"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Purpose <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={businessPurpose}
                onChange={(e) => {
                  setBusinessPurpose(e.target.value);
                  if (fieldErrors.businessPurpose && e.target.value.trim()) {
                    setFieldErrors(prev => ({ ...prev, businessPurpose: false }));
                  }
                }}
                rows={3}
                placeholder="0/64"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  fieldErrors.businessPurpose ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country Code</label>
              <input 
                type="text"
                value={countryCode}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Total <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logical System</label>
              <input 
                type="text"
                value={logicalSystem}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input 
                type="text"
                value={company}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Center</label>
              <input 
                type="text"
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Is Billable?</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option></option>
              </select>
            </div>

            {/* Row 4 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input 
                type="text"
                value={location}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel related <span className="text-red-500">*</span>
              </label>
              <select 
                value={travelRelated}
                onChange={(e) => {
                  setTravelRelated(e.target.value);
                  if (fieldErrors.travelRelated && e.target.value.trim()) {
                    setFieldErrors(prev => ({ ...prev, travelRelated: false }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.travelRelated ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value=""></option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Start Date</label>
              <input 
                type="text"
                value={tripStartDate}
                onChange={(e) => setTripStartDate(e.target.value)}
                placeholder="MM/DD/YYYY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip End Date</label>
              <input 
                type="text"
                value={tripEndDate}
                onChange={(e) => setTripEndDate(e.target.value)}
                placeholder="MM/DD/YYYY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Row 5 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Destination</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option></option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PSA Project</label>
              <select 
                value={psaProject}
                onChange={(e) => setPsaProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>(8841000000000MUCHAUC) *NA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PSA Assignment</label>
              <select 
                value={psaAssignment}
                onChange={(e) => setPsaAssignment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option></option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Internal Order</label>
              <select 
                value={internalOrder}
                onChange={(e) => setInternalOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option></option>
              </select>
            </div>

            {/* Row 6 - Comment spans full width */}
            <div className="col-span-1 md:col-span-2 xl:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="0/500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button 
            onClick={handleModalClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateReport}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {isEditMode ? 'Save' : 'Create Report'}
          </button>
        </div>
      </div>
    </div>
  );
});

CreateReportModal.displayName = 'CreateReportModal';

export default CreateReportModal;
