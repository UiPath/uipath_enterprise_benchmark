import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Save, Check } from 'lucide-react';

interface FormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  extension: string;
  country: string;
  cityProvince: string;
  
  // Billing Address
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  
  // Shipping Address
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
}

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border-t border-gray-300 first:border-t-0">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-800">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

interface AccordionFormProps {
  label: string;
  onSave: (data: FormData) => void;
  isSaved: boolean;
}

const AccordionForm: React.FC<AccordionFormProps> = ({ label, onSave, isSaved }) => {
  const [openSections, setOpenSections] = useState({
    personal: true,
    billing: false,
    shipping: false
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    extension: '',
    country: '',
    cityProvince: '',
    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingZipCode: ''
  });

  const [lastSavedData, setLastSavedData] = useState<FormData | null>(null);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setLastSavedData({ ...formData });
  };

  const isFormValid = formData.name.trim() !== '' && formData.email.trim() !== '';
  
  // Check if form data has changed since last save
  const hasChangedSinceSave = lastSavedData ? 
    JSON.stringify(formData) !== JSON.stringify(lastSavedData) : 
    true;
  
  // Show as saved only if actually saved AND no changes since then
  const showAsSaved = isSaved && !hasChangedSinceSave;

  return (
    <div className="border-2 border-gray-400 rounded-lg w-80 bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-300">
        <h4 className="font-medium text-gray-800">{label}</h4>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isFormValid || showAsSaved}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            showAsSaved 
              ? 'bg-green-100 text-green-700 cursor-default'
              : isFormValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {showAsSaved ? (
            <>
              <Check className="h-4 w-4 inline mr-1" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 inline mr-1" />
              Save
            </>
          )}
        </button>
      </div>

      <div className="accordion">
        <AccordionSection
          title="Personal Information"
          isOpen={openSections.personal}
          onToggle={() => toggleSection('personal')}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name<span className="text-red-500" aria-hidden="true">*</span>:
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email<span className="text-red-500" aria-hidden="true">*</span>:
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone:
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="extension" className="block text-sm font-medium text-gray-700 mb-1">
                Extension:
              </label>
              <input
                type="text"
                id="extension"
                value={formData.extension}
                onChange={(e) => handleInputChange('extension', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country:
              </label>
              <input
                type="text"
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="cityProvince" className="block text-sm font-medium text-gray-700 mb-1">
                City/Province:
              </label>
              <input
                type="text"
                id="cityProvince"
                value={formData.cityProvince}
                onChange={(e) => handleInputChange('cityProvince', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Billing Address"
          isOpen={openSections.billing}
          onToggle={() => toggleSection('billing')}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="billingAddress1" className="block text-sm font-medium text-gray-700 mb-1">
                Address 1:
              </label>
              <input
                type="text"
                id="billingAddress1"
                value={formData.billingAddress1}
                onChange={(e) => handleInputChange('billingAddress1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="billingAddress2" className="block text-sm font-medium text-gray-700 mb-1">
                Address 2:
              </label>
              <input
                type="text"
                id="billingAddress2"
                value={formData.billingAddress2}
                onChange={(e) => handleInputChange('billingAddress2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                City:
              </label>
              <input
                type="text"
                id="billingCity"
                value={formData.billingCity}
                onChange={(e) => handleInputChange('billingCity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">
                State:
              </label>
              <input
                type="text"
                id="billingState"
                value={formData.billingState}
                onChange={(e) => handleInputChange('billingState', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="billingZipCode" className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code:
              </label>
              <input
                type="text"
                id="billingZipCode"
                value={formData.billingZipCode}
                onChange={(e) => handleInputChange('billingZipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Shipping Address"
          isOpen={openSections.shipping}
          onToggle={() => toggleSection('shipping')}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="shippingAddress1" className="block text-sm font-medium text-gray-700 mb-1">
                Address 1:
              </label>
              <input
                type="text"
                id="shippingAddress1"
                value={formData.shippingAddress1}
                onChange={(e) => handleInputChange('shippingAddress1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="shippingAddress2" className="block text-sm font-medium text-gray-700 mb-1">
                Address 2:
              </label>
              <input
                type="text"
                id="shippingAddress2"
                value={formData.shippingAddress2}
                onChange={(e) => handleInputChange('shippingAddress2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="shippingCity" className="block text-sm font-medium text-gray-700 mb-1">
                City:
              </label>
              <input
                type="text"
                id="shippingCity"
                value={formData.shippingCity}
                onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="shippingState" className="block text-sm font-medium text-gray-700 mb-1">
                State:
              </label>
              <input
                type="text"
                id="shippingState"
                value={formData.shippingState}
                onChange={(e) => handleInputChange('shippingState', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="shippingZipCode" className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code:
              </label>
              <input
                type="text"
                id="shippingZipCode"
                value={formData.shippingZipCode}
                onChange={(e) => handleInputChange('shippingZipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
};

const Task8: React.FC = () => {
  const [primaryFormSaved, setPrimaryFormSaved] = useState(false);
  const [secondaryFormSaved, setSecondaryFormSaved] = useState(false);
  const [primaryFormData, setPrimaryFormData] = useState<FormData | null>(null);
  const [secondaryFormData, setSecondaryFormData] = useState<FormData | null>(null);

  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      primaryFormSaved,
      secondaryFormSaved,
      primaryFormData,
      secondaryFormData,
      bothFormsSaved: primaryFormSaved && secondaryFormSaved,
      formsCompleted: (primaryFormSaved ? 1 : 0) + (secondaryFormSaved ? 1 : 0)
    };
  }, [primaryFormSaved, secondaryFormSaved, primaryFormData, secondaryFormData]);

  const handlePrimarySave = (data: FormData) => {
    setPrimaryFormData(data);
    setPrimaryFormSaved(true);
  };

  const handleSecondarySave = (data: FormData) => {
    setSecondaryFormData(data);
    setSecondaryFormSaved(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Delivery Contact Forms
        </h1>
        
        <div className="flex justify-center gap-8">
          <AccordionForm
            label="Primary delivery contact"
            onSave={handlePrimarySave}
            isSaved={primaryFormSaved}
          />
          
          <AccordionForm
            label="Secondary delivery contact"
            onSave={handleSecondarySave}
            isSaved={secondaryFormSaved}
          />
        </div>

        {(primaryFormSaved || secondaryFormSaved) && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Form Submission Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${primaryFormSaved ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={primaryFormSaved ? 'text-green-700 font-medium' : 'text-gray-500'}>
                  Primary delivery contact form {primaryFormSaved ? 'completed' : 'pending'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${secondaryFormSaved ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={secondaryFormSaved ? 'text-green-700 font-medium' : 'text-gray-500'}>
                  Secondary delivery contact form {secondaryFormSaved ? 'completed' : 'pending'}
                </span>
              </div>
            </div>
            
            {primaryFormSaved && secondaryFormSaved && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Both delivery contact forms have been successfully submitted!
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Task8;
