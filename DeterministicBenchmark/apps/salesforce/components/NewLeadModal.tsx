import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Lead, LeadStatus, User } from '../data';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  users: User[];
  existingLead?: Lead;
}

const NewLeadModal: React.FC<NewLeadModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  users: _users,
  existingLead 
}) => {
  const [formData, setFormData] = useState({
    // Required fields
    lastName: existingLead?.lastName || '',
    company: existingLead?.company || '',
    status: existingLead?.status || ('Open - Not Contacted' as LeadStatus),
    
    // Basic Information
    salutation: existingLead?.salutation || '',
    firstName: existingLead?.firstName || '',
    title: existingLead?.title || '',
    
    // Contact Information
    phone: existingLead?.phone || '',
    mobile: existingLead?.mobile || '',
    fax: existingLead?.fax || '',
    email: existingLead?.email || '',
    website: existingLead?.website || '',
    
    // Classification & Qualification
    leadSource: existingLead?.leadSource || '',
    industry: existingLead?.industry || '',
    rating: existingLead?.rating || '',
    
    // Business Information
    annualRevenue: existingLead?.annualRevenue || '',
    numberOfEmployees: existingLead?.numberOfEmployees || '',
    
    // Address Information
    street: existingLead?.street || '',
    city: existingLead?.city || '',
    state: existingLead?.state || '',
    postalCode: existingLead?.postalCode || '',
    country: existingLead?.country || '',
    
    // Additional Information
    productInterest: existingLead?.productInterest || '',
    currentGenerators: existingLead?.currentGenerators || '',
    sicCode: existingLead?.sicCode || '',
    primary: existingLead?.primary || '',
    numberOfLocations: existingLead?.numberOfLocations || '',
    description: existingLead?.description || '',
    
    // System Fields
    ownerId: existingLead?.ownerId || 'user_001',
    ownerName: existingLead?.ownerName || 'UiPath Labs'
  });

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || undefined  // Convert empty strings to undefined for optional fields
    }));
  };

  const handleSubmit = (saveAndNew: boolean = false) => {
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate required fields
    const errors: { [key: string]: string } = {};
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Complete this field.';
    }
    
    if (!formData.company.trim()) {
      errors.company = 'Complete this field.';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      // Required fields
      lastName: formData.lastName.trim(),
      company: formData.company.trim(),
      status: formData.status,
      
      // Basic Information
      salutation: (formData.salutation as Lead['salutation']) || undefined,
      firstName: formData.firstName.trim() || undefined,
      title: formData.title.trim() || undefined,
      
      // Contact Information
      phone: formData.phone.trim() || undefined,
      mobile: formData.mobile.trim() || undefined,
      fax: formData.fax.trim() || undefined,
      email: formData.email.trim() || undefined,
      website: formData.website.trim() || undefined,
      
      // Classification & Qualification
      leadSource: (formData.leadSource as Lead['leadSource']) || undefined,
      industry: (formData.industry as Lead['industry']) || undefined,
      rating: (formData.rating as Lead['rating']) || undefined,
      
      // Business Information
      annualRevenue: formData.annualRevenue.trim() || undefined,
      numberOfEmployees: formData.numberOfEmployees.trim() || undefined,
      
      // Address Information
      street: formData.street.trim() || undefined,
      city: formData.city.trim() || undefined,
      state: formData.state.trim() || undefined,
      postalCode: formData.postalCode.trim() || undefined,
      country: formData.country.trim() || undefined,
      
      // Additional Information
      productInterest: formData.productInterest || undefined,
      currentGenerators: formData.currentGenerators.trim() || undefined,
      sicCode: formData.sicCode.trim() || undefined,
      primary: (formData.primary as Lead['primary']) || undefined,
      numberOfLocations: formData.numberOfLocations.trim() || undefined,
      description: formData.description.trim() || undefined,
      
      // System Fields
      ownerId: formData.ownerId,
      ownerName: formData.ownerName,
      lastModifiedBy: formData.ownerName
    };

    onSave(leadData);
    
    if (saveAndNew) {
      // Reset form for new lead
      setFormData({
        lastName: '',
        company: '',
        status: 'Open - Not Contacted' as LeadStatus,
        salutation: '',
        firstName: '',
        title: '',
        phone: '',
        mobile: '',
        fax: '',
        email: '',
        website: '',
        leadSource: '',
        industry: '',
        rating: '',
        annualRevenue: '',
        numberOfEmployees: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        productInterest: '',
        currentGenerators: '',
        sicCode: '',
        primary: '',
        numberOfLocations: '',
        description: '',
        ownerId: 'user_001',
        ownerName: 'UiPath Labs'
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">New Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Required Information Notice */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="text-red-500">*</span> = Required Information
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Lead Information Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 bg-gray-100 px-3 py-2 rounded">
              Lead Information
            </h3>
            
            <div className="space-y-4">
              {/* Row 1: Lead Owner and Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Lead Owner</label>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">U</span>
                    </div>
                    <span className="text-sm text-gray-900">{formData.ownerName}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Name Section and Mobile */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500">*</span> Name
                  </label>
                  <div className="space-y-2">
                    {/* Salutation */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Salutation</label>
                      <select
                        value={formData.salutation}
                        onChange={(e) => handleInputChange('salutation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">--None--</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                      </select>
                    </div>
                    
                    {/* First Name */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="First Name"
                      />
                    </div>
                    
                    {/* Last Name */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        <span className="text-red-500">*</span> Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 ${
                          validationErrors.lastName 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Last Name"
                        required
                      />
                      {validationErrors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 3: Company and Fax */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500">*</span> Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 ${
                      validationErrors.company 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    required
                  />
                  {validationErrors.company && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.company}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Fax</label>
                  <input
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 4: Title and Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 5: Lead Source and Website */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Lead Source</label>
                  <select
                    value={formData.leadSource}
                    onChange={(e) => handleInputChange('leadSource', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">--None--</option>
                    <option value="Web">Web</option>
                    <option value="Phone Inquiry">Phone Inquiry</option>
                    <option value="Partner Referral">Partner Referral</option>
                    <option value="Purchased List">Purchased List</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 6: Industry and Lead Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">--None--</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Banking">Banking</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Communications">Communications</option>
                    <option value="Construction">Construction</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Education">Education</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Energy">Energy</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Finance">Finance</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Government">Government</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Machinery">Machinery</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Media">Media</option>
                    <option value="Not For Profit">Not For Profit</option>
                    <option value="Recreation">Recreation</option>
                    <option value="Retail">Retail</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Technology">Technology</option>
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500">*</span> Lead Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Open - Not Contacted">Open - Not Contacted</option>
                    <option value="Working - Contacted">Working - Contacted</option>
                    <option value="Closed - Converted">Closed - Converted</option>
                    <option value="Closed - Not Converted">Closed - Not Converted</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Annual Revenue and Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Annual Revenue</label>
                  <input
                    type="text"
                    value={formData.annualRevenue}
                    onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">--None--</option>
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>
              </div>

              {/* Row 8: No. of Employees (right column only) */}
              <div className="grid grid-cols-2 gap-4">
                <div></div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">No. of Employees</label>
                  <input
                    type="text"
                    value={formData.numberOfEmployees}
                    onChange={(e) => handleInputChange('numberOfEmployees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 bg-gray-100 px-3 py-2 rounded">
              Address Information
            </h3>
            
            <div className="space-y-4">
              {/* Address/Street */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Address</label>
                <label className="block text-xs text-gray-500 mb-1">Street</label>
                <textarea
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Zip/Postal Code */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Zip/Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* State/Province */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">State/Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 bg-gray-100 px-3 py-2 rounded">
              Additional Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Product Interest */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Product Interest</label>
                <select
                  value={formData.productInterest}
                  onChange={(e) => handleInputChange('productInterest', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">--None--</option>
                  <option value="GC1000 series">GC1000 series</option>
                  <option value="GC5000 series">GC5000 series</option>
                  <option value="GC3000 series">GC3000 series</option>
                </select>
              </div>

              {/* Current Generator(s) */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Current Generator(s)</label>
                <input
                  type="text"
                  value={formData.currentGenerators}
                  onChange={(e) => handleInputChange('currentGenerators', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* SIC Code */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">SIC Code</label>
                <input
                  type="text"
                  value={formData.sicCode}
                  onChange={(e) => handleInputChange('sicCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Primary */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Primary</label>
                <select
                  value={formData.primary}
                  onChange={(e) => handleInputChange('primary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">--None--</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Number of Locations */}
              <div className="col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Number of Locations</label>
                <input
                  type="text"
                  value={formData.numberOfLocations}
                  onChange={(e) => handleInputChange('numberOfLocations', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description Information Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 bg-gray-100 px-3 py-2 rounded">
              Description Information
            </h3>
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            Save & New
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewLeadModal;
