// SAP Material Number Modal Component
// ============================================================================

import React, { useState } from 'react';
import { X, Search, Menu } from 'lucide-react';
import { Material } from '../data';
import FilterInput from './FilterInput';

interface FilterClause {
  id: string;
  operator: string;
  value: string;
  value2?: string;
}

interface MaterialNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  onSelectMaterial: (materialId: string) => void;
}

const MaterialNumberModal: React.FC<MaterialNumberModalProps> = ({ 
  isOpen, 
  onClose, 
  materials,
  onSelectMaterial 
}) => {
  const [searchBy, setSearchBy] = useState('Material by Bill of Material');
  const [languageKey, setLanguageKey] = useState('EN');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  
  // Filter condition states
  const [materialDescriptionFilter, setMaterialDescriptionFilter] = useState<FilterClause[] | null>(null);
  const [materialFilter, setMaterialFilter] = useState<FilterClause[] | null>(null);
  const [alternativeBOMFilter, setAlternativeBOMFilter] = useState<FilterClause[] | null>(null);


  
  // Plant and BOM Usage don't have filter conditions in the original request
  const [plantValue, setPlantValue] = useState('');
  const [bomUsageValue, setBomUsageValue] = useState('');

  // Reset selection when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedMaterialId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper function to evaluate filter conditions (case insensitive)
  const evaluateFilterCondition = (value: string, clause: FilterClause): boolean => {
    const val = value.toLowerCase().trim();
    const condVal = clause.value.toLowerCase().trim();
    const condVal2 = clause.value2?.toLowerCase().trim() || '';

    switch (clause.operator) {
      case 'equal to':
        return val === condVal;
      case 'not equal to':
        return val !== condVal;
      case 'greater':
        return val > condVal;
      case 'greater than or equal to':
        return val >= condVal;
      case 'less':
        return val < condVal;
      case 'less than or equal to':
        return val <= condVal;
      case 'contains pattern':
        return val.includes(condVal);
      case 'does not contain pattern':
        return !val.includes(condVal);
      case 'between':
        return val >= condVal && val <= condVal2;
      case 'not between':
        return val < condVal || val > condVal2;
      default:
        return true;
    }
  };

  // Helper function to evaluate multiple filter clauses (AND logic)
  const evaluateFilterClauses = (value: string, clauses: FilterClause[]): boolean => {
    return clauses.every(clause => evaluateFilterCondition(value, clause));
  };


  const filteredMaterials = materials.filter(material => {
    // Check search term (only if no description filter is applied, or if single equal to filter)
    const hasEqualToOnly = materialDescriptionFilter && 
      materialDescriptionFilter.length === 1 && 
      materialDescriptionFilter[0].operator === 'equal to';
    
    const matchesSearchTerm = !searchTerm || 
      hasEqualToOnly ||
      (!materialDescriptionFilter && (
        material.id.toLowerCase().trim().includes(searchTerm.toLowerCase().trim()) ||
        material.description.toLowerCase().trim().includes(searchTerm.toLowerCase().trim())
      ));

    // Check filter conditions (all clauses must match - AND logic)
    const hasDescriptionFilter = materialDescriptionFilter && materialDescriptionFilter.length > 0;
    const matchesDescriptionFilter = !hasDescriptionFilter || 
      evaluateFilterClauses(material.description, materialDescriptionFilter);
    
    const hasMaterialFilter = materialFilter && materialFilter.length > 0;
    const matchesMaterialFilter = !hasMaterialFilter || 
      evaluateFilterClauses(material.id, materialFilter);
    
    const hasAlternativeBOMFilter = alternativeBOMFilter && alternativeBOMFilter.length > 0;
    // Alternative BOM filter (using default value "1" as shown in original)
    const matchesAlternativeBOMFilter = !hasAlternativeBOMFilter || 
      evaluateFilterClauses('1', alternativeBOMFilter);



    return matchesSearchTerm && matchesDescriptionFilter && matchesMaterialFilter && matchesAlternativeBOMFilter;
  });

  const handleMaterialSelect = (materialId: string) => {
    onSelectMaterial(materialId);
    onClose();
  };

  const handleMaterialClick = (materialId: string) => {
    setSelectedMaterialId(materialId);
  };

  const handleOK = () => {
    if (selectedMaterialId) {
      onSelectMaterial(selectedMaterialId);
    } else if (filteredMaterials.length > 0) {
      // Select first material if none is explicitly selected
      onSelectMaterial(filteredMaterials[0].id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white shadow-xl w-[70vw] mx-4 max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-gray-100">
          <h2 className="text-lg font-normal text-gray-900">Material Number (1)</h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tab Section */}
        <div className="border-b border-gray-300">
          <div className="bg-blue-100 px-4 py-2 border-b border-gray-300">
            <span className="text-sm font-medium text-blue-700">Search and Select</span>
          </div>
          
          {/* Search Controls */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">By:</span>
                <select 
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="border border-gray-400 px-2 py-1 text-sm bg-white min-w-[200px]"
                >
                  <option>Material by Bill of Material</option>
                  <option>Material Number</option>
                  <option>Material Description</option>
                </select>
                <button className="bg-gray-200 hover:bg-gray-300 border border-gray-400 px-3 py-1 text-sm">
                  Go
                </button>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm border border-blue-600 flex items-center space-x-1">
                <Search className="w-3 h-3" />
                <span>Hide Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Fields Section */}
        <div className="border-b border-gray-300 p-4 space-y-3">
          <div className="grid gap-4 text-sm font-medium text-gray-700" style={{gridTemplateColumns: "4fr 0.8fr 0.6fr 1.2fr 0.6fr 0.6fr"}}>
            <div>Material Description:</div>
            <div>Plant:</div>
            <div>BOM Usage:</div>
            <div>Material:</div>
            <div>Alternative BOM:</div>
            <div>Language:</div>
          </div>
          <div className="grid gap-4" style={{gridTemplateColumns: "4fr 0.8fr 0.6fr 1.2fr 0.6fr 0.6fr"}}>
            <FilterInput
              fieldName="Material Description"
              value={materialDescriptionFilter && 
                materialDescriptionFilter.length === 1 && 
                materialDescriptionFilter[0].operator === 'equal to' ? 
                materialDescriptionFilter[0].value : searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                // If user types and there are complex filter conditions, clear them
                // If user types and no filter exists, or has simple equal-to, keep search functionality
                const hasEqualToOnly = materialDescriptionFilter && 
                  materialDescriptionFilter.length === 1 && 
                  materialDescriptionFilter[0].operator === 'equal to';
                if (materialDescriptionFilter && !hasEqualToOnly) {
                  setMaterialDescriptionFilter(null);
                }
              }}
              onFilterChange={setMaterialDescriptionFilter}
              placeholder="Search materials..."
              className="w-full"
            />
            <input 
              type="text" 
              value={plantValue}
              onChange={(e) => setPlantValue(e.target.value)}
              className="border border-gray-400 px-2 py-1 text-sm bg-white" 
            />
            <input 
              type="text" 
              value={bomUsageValue}
              onChange={(e) => setBomUsageValue(e.target.value)}
              className="border border-gray-400 px-2 py-1 text-sm bg-white" 
            />
            <FilterInput
              fieldName="Material"
              value={materialFilter && 
                materialFilter.length === 1 && 
                materialFilter[0].operator === 'equal to' ? 
                materialFilter[0].value : ''}
              onChange={(value) => {
                if (value) {
                  // If user types, create or update an "equal to" filter
                  setMaterialFilter([{ id: '1', operator: 'equal to', value }]);
                } else {
                  // If empty, clear the filter
                  setMaterialFilter(null);
                }
              }}
              onFilterChange={setMaterialFilter}
              placeholder=""
              className="w-full"
            />
            <FilterInput
              fieldName="Alternative BOM"
              value={alternativeBOMFilter && 
                alternativeBOMFilter.length === 1 && 
                alternativeBOMFilter[0].operator === 'equal to' ? 
                alternativeBOMFilter[0].value : ''}
              onChange={(value) => {
                if (value) {
                  // If user types, create or update an "equal to" filter
                  setAlternativeBOMFilter([{ id: '1', operator: 'equal to', value }]);
                } else {
                  // If empty, clear the filter
                  setAlternativeBOMFilter(null);
                }
              }}
              onFilterChange={setAlternativeBOMFilter}
              placeholder=""
              className="w-full"
            />
            <input type="text" className="border border-gray-400 px-2 py-1 text-sm bg-white" />
          </div>
          
          {/* Language Key */}
          <div className="flex items-center space-x-2 pt-2">
            <span className="text-sm">Language Key:</span>
            <select 
              value={languageKey}
              onChange={(e) => setLanguageKey(e.target.value)}
              className="border border-gray-400 px-2 py-1 text-sm bg-white w-16"
            >
              <option>EN</option>
              <option>DE</option>
              <option>FR</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Items Count and Find Expression */}
          <div className="border-b border-gray-300 px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-medium">Items ({filteredMaterials.length})</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Find expression</span>
              <input 
                type="text"
                className="border border-gray-400 px-2 py-1 text-sm w-32"
                placeholder=""
              />
              <button className="bg-gray-200 hover:bg-gray-300 border border-gray-400 px-2 py-1 text-sm">🔍</button>
              <button className="bg-gray-200 hover:bg-gray-300 border border-gray-400 px-2 py-1 text-sm">⚙️</button>
            </div>
          </div>

          {/* Table Headers */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
            <div className="grid gap-4 text-sm font-medium text-gray-700" style={{gridTemplateColumns: "4fr 0.8fr 0.6fr 1.2fr 0.6fr 0.6fr"}}>
              <div className="flex items-center space-x-1">
                <span>Material Description</span>
                <Menu className="w-3 h-3" />
              </div>
              <div className="flex items-center space-x-1">
                <span>Plant</span>
                <Menu className="w-3 h-3" />
              </div>
              <div>BOM Usage</div>
              <div>Material</div>
              <div>Alternative BOM</div>
              <div>Language</div>
            </div>
          </div>

          {/* Material List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMaterials.map((material, index) => (
              <div 
                key={material.id}
                className={`grid gap-4 px-4 py-1 hover:bg-blue-100 cursor-pointer border-b border-gray-200 text-sm ${
                  selectedMaterialId === material.id ? 'bg-blue-50' : 'bg-white'
                }`}
                style={{gridTemplateColumns: "4fr 0.8fr 0.6fr 1.2fr 0.6fr 0.6fr"}}
                onClick={() => handleMaterialClick(material.id)}
                onDoubleClick={() => handleMaterialSelect(material.id)}
              >
                <div className="text-sm truncate pr-2" title={material.description}>{material.description}</div>
                <div className="text-sm">1410</div>
                <div className="text-sm">1</div>
                <div className="text-sm font-medium">{material.id}</div>
                <div className="text-sm">1</div>
                <div className="text-sm">EN</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-300">
          <button 
            onClick={handleOK}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm border border-blue-600"
          >
            OK
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm border border-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialNumberModal;
