// SAP Material Selector Component
// ============================================================================

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Material } from '../data';

interface MaterialSelectorProps {
  selectedMaterial: string;
  onMaterialChange: (value: string) => void;
  materials: Material[];
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({ 
  selectedMaterial, 
  onMaterialChange, 
  materials 
}) => {
  return (
    <div className="relative">
      <select
        value={selectedMaterial}
        onChange={(e) => onMaterialChange(e.target.value)}
        className="border border-gray-400 px-2 py-1 text-sm w-32 bg-yellow-100 focus:bg-yellow-200 appearance-none pr-8"
      >
        <option value="">Select...</option>
        {materials.map(material => (
          <option key={material.id} value={material.id}>
            {material.id}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
    </div>
  );
};

export default MaterialSelector;
