import { useState, useEffect } from 'react';

interface ServiceClassification {
  serviceName: string;
  description: string;
  primaryCategory: string;
  subcategory: string;
  timestamp: string;
}

interface ServiceCatalog {
  catalogId: string;
  classificationDate: string;
  classifications: ServiceClassification[];
  timestamp: string;
}

// Taxonomy structure: 5 primary categories with 4 subcategories each
const TAXONOMY = {
  'Technology Services': [
    'Software Development',
    'Infrastructure Management',
    'Cybersecurity Solutions',
    'Data Analytics'
  ],
  'Business Services': [
    'Management Consulting',
    'Financial Advisory',
    'HR Services',
    'Marketing Strategy'
  ],
  'Creative Services': [
    'Graphic Design',
    'Video Production',
    'Content Writing',
    'Brand Development'
  ],
  'Professional Services': [
    'Legal Counsel',
    'Accounting Services',
    'Engineering Consulting',
    'Architectural Design'
  ],
  'Support Services': [
    'Customer Support',
    'Technical Support',
    'Facility Management',
    'Administrative Services'
  ]
};

const PRIMARY_CATEGORIES = Object.keys(TAXONOMY);

export default function Task37() {
  const [catalogId, setCatalogId] = useState('');
  const [classificationDate, setClassificationDate] = useState('');
  
  // Current service being classified
  const [currentServiceName, setCurrentServiceName] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  // Classified services (target: 20)
  const [classifiedServices, setClassifiedServices] = useState<ServiceClassification[]>([]);
  
  // Submitted catalogs
  const [submittedCatalogs, setSubmittedCatalogs] = useState<ServiceCatalog[]>([]);
  
  // Get available subcategories based on primary category selection
  const availableSubcategories = selectedPrimaryCategory 
    ? TAXONOMY[selectedPrimaryCategory as keyof typeof TAXONOMY] || []
    : [];
  
  // Reset subcategory when primary category changes
  useEffect(() => {
    setSelectedSubcategory('');
  }, [selectedPrimaryCategory]);
  
  // Check if current service can be added
  const canAddClassification = 
    currentServiceName.trim() !== '' &&
    currentDescription.trim() !== '' &&
    selectedPrimaryCategory !== '' &&
    selectedSubcategory !== '';
  
  // Check if catalog can be submitted (all 10 services classified)
  const canSubmitCatalog = 
    catalogId.trim() !== '' &&
    classificationDate.trim() !== '' &&
    classifiedServices.length === 10;
  
  const handleAddClassification = () => {
    if (canAddClassification) {
      const newClassification: ServiceClassification = {
        serviceName: currentServiceName.trim(),
        description: currentDescription.trim(),
        primaryCategory: selectedPrimaryCategory,
        subcategory: selectedSubcategory,
        timestamp: new Date().toISOString(),
      };
      
      setClassifiedServices([...classifiedServices, newClassification]);
      
      // Reset current service form
      setCurrentServiceName('');
      setCurrentDescription('');
      setSelectedPrimaryCategory('');
      setSelectedSubcategory('');
    }
  };
  
  const handleRemoveClassification = (index: number) => {
    setClassifiedServices(classifiedServices.filter((_, i) => i !== index));
  };
  
  const handleSubmitCatalog = () => {
    if (canSubmitCatalog) {
      const newCatalog: ServiceCatalog = {
        catalogId: catalogId.trim(),
        classificationDate: classificationDate.trim(),
        classifications: [...classifiedServices],
        timestamp: new Date().toISOString(),
      };
      
      setSubmittedCatalogs([...submittedCatalogs, newCatalog]);
      
      // Reset form
      setCatalogId('');
      setClassificationDate('');
      setClassifiedServices([]);
      setCurrentServiceName('');
      setCurrentDescription('');
      setSelectedPrimaryCategory('');
      setSelectedSubcategory('');
    }
  };
  
  // Calculate category distribution
  const categoryDistribution: Record<string, number> = {};
  PRIMARY_CATEGORIES.forEach(cat => {
    categoryDistribution[cat] = classifiedServices.filter(s => s.primaryCategory === cat).length;
  });
  
  // Expose state for testing
  useEffect(() => {
    (window as any).app_state = {
      catalogId,
      classificationDate,
      classifiedServices,
      unclassifiedCount: 10 - classifiedServices.length,
      categoryDistribution,
      submittedCatalogs,
      currentService: {
        serviceName: currentServiceName,
        description: currentDescription,
        primaryCategory: selectedPrimaryCategory,
        subcategory: selectedSubcategory,
      },
    };
    
    // Cheat function for testing - fill a complete service row
    // Order matches the shuffled document (copy-paste-task-37.docx)
    (window as any).task_37_fill = (rowNumber: number) => {
      const services = [
        { name: 'Custom Software Development', desc: 'Full-stack web application development using modern frameworks, database design, API integration, and deployment automation', primary: 'Technology Services', sub: 'Software Development' },
        { name: 'Business Process Optimization', desc: 'Strategic planning and process improvement consulting to streamline operations, reduce costs, and enhance organizational efficiency', primary: 'Business Services', sub: 'Management Consulting' },
        { name: 'Brand Identity Design', desc: 'Logo creation, visual style guides, color palette development, typography selection, and brand guidelines documentation', primary: 'Creative Services', sub: 'Brand Development' },
        { name: 'Network Security Assessment', desc: 'Comprehensive security audits including penetration testing, vulnerability scanning, firewall configuration review, and threat modeling', primary: 'Technology Services', sub: 'Cybersecurity Solutions' },
        { name: 'Corporate Tax Planning', desc: 'Tax strategy development, compliance review, deduction optimization, and audit preparation for corporate entities', primary: 'Professional Services', sub: 'Accounting Services' },
        { name: 'Video Production Services', desc: 'Commercial video shooting, post-production editing, motion graphics, and multimedia content creation', primary: 'Creative Services', sub: 'Video Production' },
        { name: 'Financial Risk Assessment', desc: 'Investment portfolio analysis, risk modeling, financial forecasting, and advisory services for asset management', primary: 'Business Services', sub: 'Financial Advisory' },
        { name: 'Helpdesk Support', desc: 'End-user technical assistance, ticket management, issue resolution, and customer service operations', primary: 'Support Services', sub: 'Customer Support' },
        { name: 'Structural Engineering Review', desc: 'Building design analysis, structural calculations, load bearing assessments, and engineering certification services', primary: 'Professional Services', sub: 'Engineering Consulting' },
        { name: 'IT Infrastructure Monitoring', desc: 'Network operations center, server monitoring, system maintenance, and technical support for IT infrastructure', primary: 'Support Services', sub: 'Technical Support' }
      ];
      
      if (rowNumber < 1 || rowNumber > 10) {
        console.error('Row number must be between 1 and 10');
        return;
      }
      
      const service = services[rowNumber - 1];
      setCurrentServiceName(service.name);
      setCurrentDescription(service.desc);
      setSelectedPrimaryCategory(service.primary);
      
      // Set subcategory after a brief delay to avoid useEffect clearing it
      setTimeout(() => {
        setSelectedSubcategory(service.sub);
      }, 10);
      
      console.log(`✅ Filled service ${rowNumber}: ${service.name}`);
      console.log(`   Primary: ${service.primary} → Subcategory: ${service.sub}`);
      console.log('Click "Add Classification" button or press Enter to add');
    };
  }, [catalogId, classificationDate, classifiedServices, submittedCatalogs, 
      currentServiceName, currentDescription, selectedPrimaryCategory, selectedSubcategory]);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Service Taxonomy Mapper</h1>
        <p className="text-gray-600">
          Classify 10 services from external PDF into taxonomy categories (2 per category)
        </p>
      </div>
      
      {/* Catalog Header */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Catalog Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catalog ID (e.g., CAT-2024-305)
            </label>
            <input
              type="text"
              value={catalogId}
              onChange={(e) => setCatalogId(e.target.value)}
              placeholder="CAT-2024-XXX"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classification Date
            </label>
            <input
              type="date"
              value={classificationDate}
              onChange={(e) => setClassificationDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Services Classified:
            </span>
            <span className={`text-2xl font-bold ${classifiedServices.length === 10 ? 'text-green-600' : 'text-blue-600'}`}>
              {classifiedServices.length} / 10
            </span>
          </div>
          {classifiedServices.length === 10 && (
            <span className="text-green-600 font-medium">✓ All services classified</span>
          )}
        </div>
      </div>
      
      {/* Service Classification Form */}
      {classifiedServices.length < 10 && (
        <div className="bg-white border border-gray-300 rounded p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            Service Classification ({classifiedServices.length + 1} of 10)
          </h2>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAddClassification();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input
                type="text"
                value={currentServiceName}
                onChange={(e) => setCurrentServiceName(e.target.value)}
                placeholder="e.g., Custom Software Development"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Description (from PDF)
              </label>
              <textarea
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
                placeholder="Full-stack web application development using modern frameworks, database design, API integration..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Category
                </label>
                <select
                  value={selectedPrimaryCategory}
                  onChange={(e) => setSelectedPrimaryCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select primary category...</option>
                  {PRIMARY_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={!selectedPrimaryCategory}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedPrimaryCategory ? 'Select subcategory...' : 'Select primary category first'}
                  </option>
                  {availableSubcategories.map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!canAddClassification}
              className={`w-full py-2 px-4 rounded font-medium ${
                canAddClassification
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ✓ Add Classification
            </button>
          </form>
        </div>
      )}
      
      {/* Category Distribution */}
      {classifiedServices.length > 0 && (
        <div className="bg-white border border-gray-300 rounded p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Category Distribution</h2>
          <div className="grid grid-cols-5 gap-3">
            {PRIMARY_CATEGORIES.map(cat => (
              <div key={cat} className="bg-gray-50 p-3 rounded text-center">
                <div className="text-xs text-gray-600 mb-1">{cat.split(' ')[0]}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {categoryDistribution[cat] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Classified Services Table */}
      {classifiedServices.length > 0 && (
        <div className="bg-white border border-gray-300 rounded p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Classified Services</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">#</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Service Name</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Taxonomy Path</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Description</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {classifiedServices.map((service, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm font-medium">
                      {service.serviceName}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      <span className="text-blue-600">{service.primaryCategory}</span>
                      <span className="text-gray-400 mx-1">→</span>
                      <span className="text-purple-600">{service.subcategory}</span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                      {service.description.length > 60 
                        ? service.description.substring(0, 60) + '...'
                        : service.description}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <button
                        onClick={() => handleRemoveClassification(index)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Submit Catalog Button */}
      {classifiedServices.length === 10 && (
        <div className="bg-white border border-gray-300 rounded p-4 mb-6">
          <button
            onClick={handleSubmitCatalog}
            disabled={!canSubmitCatalog}
            className={`w-full py-3 px-4 rounded font-medium text-lg ${
              canSubmitCatalog
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            ✓ Submit Complete Catalog
          </button>
        </div>
      )}
      
      {/* Submitted Catalogs */}
      {submittedCatalogs.length > 0 && (
        <div className="bg-white border border-gray-300 rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Submitted Catalogs</h2>
          {submittedCatalogs.map((catalog, catalogIndex) => (
            <div key={catalogIndex} className="mb-4 border border-gray-300 rounded p-4">
              <div className="grid grid-cols-3 gap-4 mb-3 bg-gray-50 p-3 rounded">
                <div>
                  <div className="text-xs text-gray-600">Catalog ID</div>
                  <div className="font-mono font-medium">{catalog.catalogId}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Classification Date</div>
                  <div className="font-medium">{catalog.classificationDate}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Total Services</div>
                  <div className="text-xl font-bold text-green-600">{catalog.classifications.length}</div>
                </div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium mb-2">Classification Summary:</div>
                <div className="grid grid-cols-5 gap-2">
                  {PRIMARY_CATEGORIES.map(cat => {
                    const count = catalog.classifications.filter(s => s.primaryCategory === cat).length;
                    return count > 0 ? (
                      <div key={cat} className="bg-blue-50 px-2 py-1 rounded text-xs">
                        <span className="font-medium">{cat.split(' ')[0]}:</span> {count}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

