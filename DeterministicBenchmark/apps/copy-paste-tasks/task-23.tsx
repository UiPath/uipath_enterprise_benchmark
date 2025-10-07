import React, { useState, useEffect } from 'react';

interface CompanyRegistration {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  streetAddress: string;
  cityStateZip: string;
  industry: string;
  annualRevenue: number;
  employeeCount: number;
  completed: boolean;
}

interface AddressLookupResult {
  street: string;
  cityStateZip: string;
}

const INDUSTRIES = [
  { id: 'software', name: 'Software Development', image: '💻', description: 'Tech & Software' },
  { id: 'manufacturing', name: 'Manufacturing', image: '🏭', description: 'Industrial Production' },
  { id: 'consulting', name: 'Management Consulting', image: '📊', description: 'Business Advisory' },
  { id: 'healthcare', name: 'Healthcare Services', image: '🏥', description: 'Medical & Health' },
  { id: 'retail', name: 'Retail & E-commerce', image: '🛒', description: 'Sales & Commerce' },
  { id: 'finance', name: 'Financial Services', image: '💰', description: 'Banking & Finance' },
];

// Expected source data from Excel
const EXPECTED_COMPANIES = [
  {
    companyName: 'Meridian Technologies',
    contactPerson: 'Lisa Chen',
    email: 'lisa.chen@meridiantech.com',
    phone: '8005551234',
    streetAddress: '4250 Executive Square',
    cityStateZip: 'San Diego, CA 92121',
    industry: 'Software Development',
    annualRevenue: 8500000,
    employeeCount: 125
  },
  {
    companyName: 'Cascade Manufacturing',
    contactPerson: 'Robert Wilson',
    email: 'rwilson@cascademfg.net',
    phone: '5035552468',
    streetAddress: '1875 Industrial Parkway',
    cityStateZip: 'Portland, OR 97210',
    industry: 'Manufacturing',
    annualRevenue: 15200000,
    employeeCount: 340
  },
  {
    companyName: 'Pinnacle Consulting Group',
    contactPerson: 'Dr. Amanda Foster',
    email: 'afoster@pinnacle-consulting.biz',
    phone: '4045553579',
    streetAddress: '3300 Peachtree Road NE',
    cityStateZip: 'Atlanta, GA 30305',
    industry: 'Management Consulting',
    annualRevenue: 3750000,
    employeeCount: 78
  }
];

export const Task23: React.FC = () => {
  // Initialize app_state immediately
  if (!(window as any).app_state) {
    (window as any).app_state = {
      registrations: [],
      completedRegistrations: [],
      currentStep: 1,
      currentFormData: {},
      expectedCompanies: EXPECTED_COMPANIES
    };
  }

  const [currentStep, setCurrentStep] = useState(1);
  const [registrations, setRegistrations] = useState<CompanyRegistration[]>([]);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  
  // Form data for current registration
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    streetAddress: '',
    cityStateZip: '',
    industry: '',
    annualRevenue: 5000000,
    employeeCount: 100
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationBadge, setShowValidationBadge] = useState(false);

  // Auto-complete suggestions for company names
  const [companyNameSuggestions, setCompanyNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update app_state whenever relevant state changes
  useEffect(() => {
    const completedRegistrations = registrations.filter(r => r.completed);
    
    (window as any).app_state = {
      registrations: registrations,
      completedRegistrations: completedRegistrations,
      currentStep: currentStep,
      currentFormData: formData,
      expectedCompanies: EXPECTED_COMPANIES
    };
  }, [registrations, currentStep, formData]);

  // Auto-complete logic for company name
  useEffect(() => {
    if (formData.companyName.length >= 2) {
      const suggestions = EXPECTED_COMPANIES
        .map(c => c.companyName)
        .filter(name => 
          name.toLowerCase().includes(formData.companyName.toLowerCase())
        )
        .slice(0, 5);
      setCompanyNameSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [formData.companyName]);

  // Address lookup results
  const getAddressLookupResults = (query: string): AddressLookupResult[] => {
    if (!query || query.length < 3) return [];
    
    return EXPECTED_COMPANIES
      .filter(c => 
        c.streetAddress.toLowerCase().includes(query.toLowerCase()) ||
        c.cityStateZip.toLowerCase().includes(query.toLowerCase())
      )
      .map(c => ({
        street: c.streetAddress,
        cityStateZip: c.cityStateZip
      }));
  };

  const handleNextStep = () => {
    // Validate current step
    const errors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    } else if (currentStep === 2) {
      if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact person is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      else if (!formData.email.includes('@')) errors.email = 'Invalid email format';
      if (!formData.phone.trim()) errors.phone = 'Phone is required';
    } else if (currentStep === 3) {
      if (!formData.streetAddress.trim()) errors.streetAddress = 'Street address is required';
      if (!formData.cityStateZip.trim()) errors.cityStateZip = 'City, State, Zip is required';
    } else if (currentStep === 4) {
      if (!formData.industry) errors.industry = 'Industry selection is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setShowValidationBadge(true);
      return;
    }
    
    setValidationErrors({});
    setShowValidationBadge(false);
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitRegistration = () => {
    // Validate step 5
    const errors: Record<string, string> = {};
    if (formData.annualRevenue < 0) errors.annualRevenue = 'Revenue must be positive';
    if (formData.employeeCount < 1) errors.employeeCount = 'Employee count must be at least 1';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setShowValidationBadge(true);
      return;
    }

    const newRegistration: CompanyRegistration = {
      id: `reg-${Date.now()}-${Math.random()}`,
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      email: formData.email.toLowerCase(),
      phone: formData.phone,
      streetAddress: formData.streetAddress,
      cityStateZip: formData.cityStateZip,
      industry: formData.industry,
      annualRevenue: formData.annualRevenue,
      employeeCount: formData.employeeCount,
      completed: true
    };

    setRegistrations([...registrations, newRegistration]);

    // Reset form for next registration
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      streetAddress: '',
      cityStateZip: '',
      industry: '',
      annualRevenue: 5000000,
      employeeCount: 100
    });
    setCurrentStep(1);
    setSelectedIndustry('');
    setValidationErrors({});
    setShowValidationBadge(false);
  };

  const handleAddressSelect = (address: AddressLookupResult) => {
    setFormData({
      ...formData,
      streetAddress: address.street,
      cityStateZip: address.cityStateZip
    });
    setShowAddressPopup(false);
    setAddressSearchQuery('');
  };

  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(industry);
    setFormData({
      ...formData,
      industry: industry
    });
  };

  const getEmployeeRangeLabel = (count: number): string => {
    if (count < 50) return '1-49 (Small Business)';
    if (count < 250) return '50-249 (Medium Business)';
    if (count < 1000) return '250-999 (Large Business)';
    return '1000+ (Enterprise)';
  };

  const formatRevenue = (revenue: number): string => {
    return `$${(revenue / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Registration Wizard</h1>
      </div>

      {/* Completed Registrations Counter */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-900">Registration Progress</h3>
            <p className="text-sm text-green-700">
              Completed: {registrations.length} / {EXPECTED_COMPANIES.length} companies
            </p>
          </div>
          {registrations.length > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((registrations.length / EXPECTED_COMPANIES.length) * 100)}%
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Wizard */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Progress Bar */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step < currentStep
                          ? 'bg-green-500 text-white'
                          : step === currentStep
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step < currentStep ? '✓' : step}
                    </div>
                    {step < 5 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Breadcrumb */}
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Step {currentStep} of 5:</span>{' '}
                {currentStep === 1 && 'Company Information'}
                {currentStep === 2 && 'Contact Details'}
                {currentStep === 3 && 'Address Lookup'}
                {currentStep === 4 && 'Industry Selection'}
                {currentStep === 5 && 'Revenue & Size'}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {/* Step 1: Company Info */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Company Information</h2>
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        onFocus={() => setShowSuggestions(companyNameSuggestions.length > 0)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          validationErrors.companyName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Start typing company name..."
                      />
                      {validationErrors.companyName && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.companyName}</p>
                      )}
                      
                      {/* Auto-complete dropdown */}
                      {showSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                          {companyNameSuggestions.map((suggestion, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                              onMouseDown={() => {
                                setFormData({ ...formData, companyName: suggestion });
                                setShowSuggestions(false);
                              }}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-800">
                        💡 Tip: Start typing to see auto-complete suggestions from the Excel data
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Contact Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md ${
                          validationErrors.contactPerson ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter contact person name"
                      />
                      {validationErrors.contactPerson && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.contactPerson}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md ${
                          validationErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="email@example.com"
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                      )}
                      {formData.email && formData.email.includes('@') && !validationErrors.email && (
                        <div className="mt-1 flex items-center text-green-600 text-sm">
                          <span className="mr-1">✓</span> Valid email format
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md ${
                          validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Phone number"
                      />
                      {validationErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                      )}
                      {formData.phone && formData.phone.length >= 10 && !validationErrors.phone && (
                        <div className="mt-1 flex items-center text-green-600 text-sm">
                          <span className="mr-1">✓</span> Valid phone number
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Address Lookup */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Address Information</h2>
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowAddressPopup(true)}
                      className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
                    >
                      🔍 Open Address Lookup
                    </button>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Current Address:</h3>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={formData.streetAddress}
                          onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md bg-white ${
                            validationErrors.streetAddress ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter street address"
                        />
                        {validationErrors.streetAddress && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.streetAddress}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City, State, Zip *
                        </label>
                        <input
                          type="text"
                          value={formData.cityStateZip}
                          onChange={(e) => setFormData({ ...formData, cityStateZip: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md bg-white ${
                            validationErrors.cityStateZip ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="City, State Zip"
                        />
                        {validationErrors.cityStateZip && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.cityStateZip}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Industry Selection */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Industry Selection</h2>
                  <p className="text-gray-600 mb-4">
                    Select the industry that best matches the company from the Excel data
                  </p>
                  
                  {validationErrors.industry && (
                    <p className="text-red-500 text-sm mb-3">{validationErrors.industry}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {INDUSTRIES.map((industry) => (
                      <div
                        key={industry.id}
                        onClick={() => handleIndustrySelect(industry.name)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedIndustry === industry.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-4xl mb-2">{industry.image}</div>
                        <h3 className="font-semibold text-gray-900">{industry.name}</h3>
                        <p className="text-sm text-gray-600">{industry.description}</p>
                        {selectedIndustry === industry.name && (
                          <div className="mt-2 text-blue-600 font-medium text-sm">
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Revenue & Size */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Revenue & Company Size</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Revenue
                      </label>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-600">$</span>
                        <input
                          type="number"
                          min="0"
                          max="20000000"
                          step="50000"
                          value={formData.annualRevenue}
                          onChange={(e) => setFormData({ ...formData, annualRevenue: parseInt(e.target.value) || 0 })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Enter revenue amount"
                        />
                        <span className="text-sm text-gray-600 whitespace-nowrap">{formatRevenue(formData.annualRevenue)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20000000"
                        step="50000"
                        value={formData.annualRevenue}
                        onChange={(e) => setFormData({ ...formData, annualRevenue: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>$0M</span>
                        <span>$10M</span>
                        <span>$20M</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Count
                      </label>
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="number"
                          min="1"
                          max="500"
                          step="1"
                          value={formData.employeeCount}
                          onChange={(e) => setFormData({ ...formData, employeeCount: parseInt(e.target.value) || 1 })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Enter employee count"
                        />
                        <span className="text-sm text-blue-600 whitespace-nowrap">
                          {getEmployeeRangeLabel(formData.employeeCount)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="500"
                        step="1"
                        value={formData.employeeCount}
                        onChange={(e) => setFormData({ ...formData, employeeCount: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span>
                        <span>250</span>
                        <span>500</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Registration Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Company:</span>
                          <span className="font-medium">{formData.companyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact:</span>
                          <span className="font-medium">{formData.contactPerson}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{formData.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Industry:</span>
                          <span className="font-medium">{formData.industry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium">{formatRevenue(formData.annualRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employees:</span>
                          <span className="font-medium">{formData.employeeCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-md font-medium ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Previous
                </button>

                {showValidationBadge && Object.keys(validationErrors).length > 0 && (
                  <div className="text-red-600 text-sm font-medium">
                    ⚠️ Please fix validation errors
                  </div>
                )}

                {currentStep < 5 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitRegistration}
                    className="px-6 py-3 bg-green-500 text-white rounded-md font-medium hover:bg-green-600"
                  >
                    ✓ Complete Registration
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Completed Registrations */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="font-bold text-lg mb-4">Completed Registrations</h3>
            
            {registrations.length === 0 ? (
              <p className="text-gray-500 text-sm">No registrations completed yet</p>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg, idx) => (
                  <div key={reg.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-sm text-gray-900">
                        {idx + 1}. {reg.companyName}
                      </div>
                      <span className="text-green-600 text-lg">✓</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>{reg.contactPerson}</div>
                      <div>{reg.industry}</div>
                      <div>{formatRevenue(reg.annualRevenue)} • {reg.employeeCount} employees</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Lookup Popup */}
      {showAddressPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Address Lookup</h3>
              <button
                onClick={() => {
                  setShowAddressPopup(false);
                  setAddressSearchQuery('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <input
                type="text"
                value={addressSearchQuery}
                onChange={(e) => setAddressSearchQuery(e.target.value)}
                placeholder="Search by street address or city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-auto p-4">
              {addressSearchQuery.length < 3 ? (
                <p className="text-gray-500 text-sm">Type at least 3 characters to search...</p>
              ) : (
                <div className="space-y-2">
                  {getAddressLookupResults(addressSearchQuery).map((result, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAddressSelect(result)}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
                    >
                      <div className="font-medium text-gray-900">{result.street}</div>
                      <div className="text-sm text-gray-600">{result.cityStateZip}</div>
                    </div>
                  ))}
                  {getAddressLookupResults(addressSearchQuery).length === 0 && (
                    <p className="text-gray-500 text-sm">No addresses found matching your search</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task23;
