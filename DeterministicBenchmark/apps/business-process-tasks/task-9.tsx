import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  origin: string;
  destination: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  serviceType: string;
  comments: string;
}

interface ValidationErrors {
  [key: string]: boolean;
}

const Task9: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    origin: '',
    destination: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    serviceType: '',
    comments: ''
  });

  const totalSteps = 3;

  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      currentStep,
      completedSteps,
      isSubmitted,
      showConfirmation,
      formData,
      allStepsCompleted: completedSteps.length === totalSteps,
      formComplete: isSubmitted && !showConfirmation
    };
  }, [currentStep, completedSteps, isSubmitted, showConfirmation, formData]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    let isValid = true;
    const errors: ValidationErrors = {};

    if (step === 1) {
      // Contact Information validation
      const requiredFields = ['fullName', 'email', 'phone', 'country'];
      requiredFields.forEach(field => {
        if (!formData[field as keyof FormData].trim()) {
          errors[field] = true;
          isValid = false;
        }
      });

      // Email format validation
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = true;
        isValid = false;
      }
    } else if (step === 2) {
      // Package Details validation
      const requiredFields = ['origin', 'destination', 'weight', 'length', 'width', 'height'];
      requiredFields.forEach(field => {
        if (!formData[field as keyof FormData].trim()) {
          errors[field] = true;
          isValid = false;
        }
      });

      // Numeric validation for dimensions
      const numericFields = ['weight', 'length', 'width', 'height'];
      numericFields.forEach(field => {
        const value = formData[field as keyof FormData];
        if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
          errors[field] = true;
          isValid = false;
        }
      });
    } else if (step === 3) {
      // Review & Submit validation
      if (!formData.serviceType) {
        errors.serviceType = true;
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      setIsSubmitted(true);
      setShowConfirmation(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      country: '',
      origin: '',
      destination: '',
      weight: '',
      length: '',
      width: '',
      height: '',
      serviceType: '',
      comments: ''
    });
    setCurrentStep(1);
    setCompletedSteps([]);
    setIsSubmitted(false);
    setShowConfirmation(false);
    setValidationErrors({});
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
      
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
            validationErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.fullName && (
          <div className="text-red-500 text-sm mt-1">Full name is required.</div>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
            validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.email && (
          <div className="text-red-500 text-sm mt-1">Valid email is required.</div>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
            validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.phone && (
          <div className="text-red-500 text-sm mt-1">Phone number is required.</div>
        )}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Company Name
        </label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          Country <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="country"
          value={formData.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
            validationErrors.country ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.country && (
          <div className="text-red-500 text-sm mt-1">Country is required.</div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Package Details</h3>
      
      <div>
        <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
          Origin Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="origin"
          value={formData.origin}
          onChange={(e) => handleInputChange('origin', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
            validationErrors.origin ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.origin && (
          <div className="text-red-500 text-sm mt-1">Origin address is required.</div>
        )}
      </div>

      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
          Destination Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="destination"
          value={formData.destination}
          onChange={(e) => handleInputChange('destination', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
            validationErrors.destination ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.destination && (
          <div className="text-red-500 text-sm mt-1">Destination address is required.</div>
        )}
      </div>

      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
          Weight (kg) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="weight"
          min="0.1"
          value={formData.weight}
          onChange={(e) => handleInputChange('weight', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
            validationErrors.weight ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.weight && (
          <div className="text-red-500 text-sm mt-1">Weight is required.</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
            Length (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="length"
            min="1"
            value={formData.length}
            onChange={(e) => handleInputChange('length', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
              validationErrors.length ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.length && (
            <div className="text-red-500 text-sm mt-1">Required.</div>
          )}
        </div>

        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
            Width (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="width"
            min="1"
            value={formData.width}
            onChange={(e) => handleInputChange('width', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
              validationErrors.width ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.width && (
            <div className="text-red-500 text-sm mt-1">Required.</div>
          )}
        </div>

        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            Height (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="height"
            min="1"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
              validationErrors.height ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.height && (
            <div className="text-red-500 text-sm mt-1">Required.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <table className="w-full">
          <tbody className="space-y-2">
            <tr className="border-b border-gray-200">
              <td className="font-semibold py-2 pr-4 w-2/5">Name</td>
              <td className="py-2">{formData.fullName}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="font-semibold py-2 pr-4">Email</td>
              <td className="py-2">{formData.email}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="font-semibold py-2 pr-4">Phone</td>
              <td className="py-2">{formData.phone}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="font-semibold py-2 pr-4">Company</td>
              <td className="py-2">{formData.company || 'N/A'}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="font-semibold py-2 pr-4">Country</td>
              <td className="py-2">{formData.country}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="font-semibold py-2 pr-4">Origin</td>
              <td className="py-2">{formData.origin}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="font-semibold py-2 pr-4">Destination</td>
              <td className="py-2">{formData.destination}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="font-semibold py-2 pr-4">Weight</td>
              <td className="py-2">{formData.weight} kg</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="font-semibold py-2 pr-4">Dimensions</td>
              <td className="py-2">{formData.length} x {formData.width} x {formData.height} cm</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
          Service Type <span className="text-red-500">*</span>
        </label>
        <select
          id="serviceType"
          value={formData.serviceType}
          onChange={(e) => handleInputChange('serviceType', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
            validationErrors.serviceType ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required
        >
          <option value="">Select Service Type</option>
          <option value="standard">Standard</option>
          <option value="express">Express</option>
        </select>
        {validationErrors.serviceType && (
          <div className="text-red-500 text-sm mt-1">Please select a service type.</div>
        )}
      </div>

      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Comments
        </label>
        <textarea
          id="comments"
          rows={3}
          value={formData.comments}
          onChange={(e) => handleInputChange('comments', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <h2 className="text-2xl font-bold text-center mb-6">Request Transport Offer</h2>
        
        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  completedSteps.includes(step) 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {completedSteps.includes(step) ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-0.5 ${
                    completedSteps.includes(step) ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form steps */}
        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            {currentStep === totalSteps ? 'Submit' : 'Next'}
            {currentStep !== totalSteps && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Confirmation popup */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-4">
              <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
              <p className="text-gray-600 mb-4">
                Your transport request has been submitted successfully.
              </p>
              <div className="space-y-2">
                <button
                  onClick={resetForm}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Submit another request
                </button>
                <button
                  onClick={closeConfirmation}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Task9;
