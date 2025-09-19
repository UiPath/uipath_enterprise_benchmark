// SAP Stock Selection Screen Component
// ============================================================================

import React, { useState } from 'react';
import MaterialSelector from './MaterialSelector';
import MaterialNumberModal from './MaterialNumberModal';
import { FormData, DisplayLevels, Material } from '../data';
import { SAMPLE_PLANTS } from '../data';

interface StockSelectionScreenProps {
  formData: FormData;
  onFormChange: (field: string, value: any) => void;
  onExecute: () => void;
  onBack: () => void;
  materials: Material[];
  displayLevels: DisplayLevels;
  setDisplayLevels: React.Dispatch<React.SetStateAction<DisplayLevels>>;
}

const StockSelectionScreen: React.FC<StockSelectionScreenProps> = ({ 
  formData, 
  onFormChange, 
  onExecute, 
  onBack,
  materials,
  displayLevels,
  setDisplayLevels 
}) => {
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  const handleMaterialSelect = (materialId: string) => {
    onFormChange('material', materialId);
    setShowMaterialModal(false);
  };
  return (
    <div className="p-6 max-w-[1200px]">
      <div className="bg-white border border-gray-400 mb-4 shadow-sm">
        <div className="bg-blue-100 px-4 py-2 border-b border-gray-300">
          <h3 className="text-sm font-normal text-gray-800">Database selections</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-4 gap-4 items-center">
            <label className="text-sm text-gray-800">Material</label>
            <div className="flex items-center space-x-2">
              <MaterialSelector
                selectedMaterial={formData.material}
                onMaterialChange={(value) => onFormChange('material', value)}
                materials={materials}
              />
              <button 
                onClick={() => setShowMaterialModal(true)}
                className="bg-gray-200 hover:bg-gray-300 border border-gray-400 px-2 py-1 text-xs flex items-center justify-center"
                title="Search for Material"
              >
                <span className="text-gray-600 text-sm">⚏</span>
              </button>
            </div>
            <span className="text-sm text-gray-600">to</span>
            <input type="text" className="border border-gray-400 px-2 py-1 text-sm w-32 bg-white" />
          </div>

          <div className="grid grid-cols-4 gap-4 items-center">
            <label className="text-sm text-gray-800">Plant</label>
            <select
              value={formData.plant}
              onChange={(e) => onFormChange('plant', e.target.value)}
              className="border border-gray-400 px-2 py-1 text-sm w-32 bg-white"
            >
              <option value="">All Plants</option>
              {SAMPLE_PLANTS.map(plant => (
                <option key={plant.code} value={plant.code}>
                  {plant.code} - {plant.name}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">to</span>
            <input type="text" className="border border-gray-400 px-2 py-1 text-sm w-32 bg-white" />
          </div>

          <div className="grid grid-cols-4 gap-4 items-center">
            <label className="text-sm text-gray-800">Storage location</label>
            <input
              type="text"
              value={formData.storageLocation}
              onChange={(e) => onFormChange('storageLocation', e.target.value)}
              className="border border-gray-400 px-2 py-1 text-sm w-32 bg-white"
            />
            <span className="text-sm text-gray-600">to</span>
            <input type="text" className="border border-gray-400 px-2 py-1 text-sm w-32 bg-white" />
          </div>

          <div className="grid grid-cols-4 gap-4 items-center">
            <label className="text-sm text-gray-800">Batch</label>
            <input
              type="text"
              value={formData.batch}
              onChange={(e) => onFormChange('batch', e.target.value)}
              className="border border-gray-400 px-2 py-1 text-sm w-32 bg-white"
            />
            <span className="text-sm text-gray-600">to</span>
            <input type="text" className="border border-gray-400 px-2 py-1 text-sm w-32 bg-white" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-400 mb-4 shadow-sm">
        <div className="bg-blue-100 px-4 py-2 border-b border-gray-300">
          <h3 className="text-sm font-normal text-gray-800">Stock Type Selection</h3>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.specialStocks}
              onChange={(e) => onFormChange('specialStocks', e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm text-gray-800">Also Select Special Stocks</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.stockCommitments}
              onChange={(e) => onFormChange('stockCommitments', e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm text-gray-800">Also Select Stock Commitments</label>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-400 mb-4 shadow-sm">
        <div className="bg-blue-100 px-4 py-2 border-b border-gray-300">
          <h3 className="text-sm font-normal text-gray-800">Selection of Display Levels</h3>
        </div>
        <div className="p-4 space-y-2">
          {Object.entries(displayLevels).map(([key, checked]) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setDisplayLevels(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
                className="mr-2"
              />
              <label className="text-sm text-gray-800">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Material Number Modal */}
      <MaterialNumberModal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        materials={materials}
        onSelectMaterial={handleMaterialSelect}
      />
    </div>
  );
};

export default StockSelectionScreen;
