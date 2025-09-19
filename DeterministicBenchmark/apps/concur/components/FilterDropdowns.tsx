import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import TimeRangeSlider from './TimeRangeSlider';

// ========================================================================
// INDIVIDUAL FILTER DROPDOWN COMPONENTS
// ========================================================================

interface FilterDropdownProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ 
  label, 
  isOpen, 
  onToggle, 
  children, 
  className = "" 
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 ${
          isOpen ? 'bg-blue-50 border-blue-300 text-blue-600' : 'text-gray-700'
        }`}
      >
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[300px]">
          {children}
        </div>
      )}
    </div>
  );
};

// ========================================================================
// TIME FILTER DROPDOWN
// ========================================================================

interface TimeFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  departStart: number;
  departEnd: number;
  arriveStart: number;
  arriveEnd: number;
  setDepartStart: (h: number) => void;
  setDepartEnd: (h: number) => void;
  setArriveStart: (h: number) => void;
  setArriveEnd: (h: number) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({
  isOpen,
  onToggle,
  departStart,
  departEnd,
  arriveStart,
  arriveEnd,
  setDepartStart,
  setDepartEnd,
  setArriveStart,
  setArriveEnd
}) => {
  const handleReset = () => {
    setDepartStart(0);
    setDepartEnd(23);
    setArriveStart(0);
    setArriveEnd(23);
  };

  return (
    <FilterDropdown label="Time" isOpen={isOpen} onToggle={onToggle}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Time</h3>
          <button 
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Reset
          </button>
        </div>
        
        <div className="space-y-6">
          <TimeRangeSlider
            label="Departing"
            startHour={departStart}
            endHour={departEnd}
            onStartChange={setDepartStart}
            onEndChange={setDepartEnd}
            showDropdown={false}
            showTimeInLabel={true}
            anytimeText="anytime"
          />
          <TimeRangeSlider
            label="Arriving"
            startHour={arriveStart}
            endHour={arriveEnd}
            onStartChange={setArriveStart}
            onEndChange={setArriveEnd}
            showDropdown={false}
            showTimeInLabel={true}
            anytimeText="anytime"
          />
        </div>
      </div>
    </FilterDropdown>
  );
};

// ========================================================================
// FLEXIBILITY FILTER DROPDOWN
// ========================================================================

interface FlexibilityFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  fullyRefundable: boolean;
  freeChanges: boolean;
  setFullyRefundable: (value: boolean) => void;
  setFreeChanges: (value: boolean) => void;
}

export const FlexibilityFilter: React.FC<FlexibilityFilterProps> = ({
  isOpen,
  onToggle,
  fullyRefundable,
  freeChanges,
  setFullyRefundable,
  setFreeChanges
}) => {
  return (
    <FilterDropdown label="Flexibility" isOpen={isOpen} onToggle={onToggle}>
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Flexibility</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-2 border border-blue-300 rounded cursor-pointer hover:bg-blue-50">
            <input
              type="checkbox"
              checked={fullyRefundable}
              onChange={(e) => setFullyRefundable(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Fully Refundable</span>
          </label>
          
          <label className="flex items-center space-x-3 p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={freeChanges}
              onChange={(e) => setFreeChanges(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Free Changes</span>
          </label>
        </div>
      </div>
    </FilterDropdown>
  );
};

// ========================================================================
// NUMBER OF STOPS FILTER DROPDOWN
// ========================================================================

interface StopsFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedStops: string;
  setSelectedStops: (value: string) => void;
}

export const StopsFilter: React.FC<StopsFilterProps> = ({
  isOpen,
  onToggle,
  selectedStops,
  setSelectedStops
}) => {
  const stopsOptions = [
    { value: 'any', label: 'Any stops', enabled: true },
    { value: 'nonstop', label: 'Nonstop', enabled: true },
    { value: '1-stop', label: '1 stop', enabled: true },
    { value: '1-or-fewer', label: '1 stop or fewer', enabled: true },
    { value: '2-stops', label: '2 stops', enabled: true },
    { value: '2-or-fewer', label: '2 stops or fewer', enabled: true }
  ];

  return (
    <FilterDropdown label="Number of Stops" isOpen={isOpen} onToggle={onToggle}>
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Number of Stops</h3>
        
        <div className="space-y-3">
          {stopsOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 p-2 rounded cursor-pointer ${
                option.value === selectedStops
                  ? 'border border-blue-300 bg-blue-50'
                  : 'border border-gray-300 hover:bg-gray-50'
              } ${!option.enabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="stops"
                value={option.value}
                checked={selectedStops === option.value}
                onChange={(e) => setSelectedStops(e.target.value)}
                disabled={!option.enabled}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </FilterDropdown>
  );
};

// ========================================================================
// POLICY FILTER DROPDOWN
// ========================================================================

interface PolicyFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  inPolicyFares: boolean;
  leastCostLogical: boolean;
  setInPolicyFares: (value: boolean) => void;
  setLeastCostLogical: (value: boolean) => void;
}

export const PolicyFilter: React.FC<PolicyFilterProps> = ({
  isOpen,
  onToggle,
  inPolicyFares,
  leastCostLogical,
  setInPolicyFares,
  setLeastCostLogical
}) => {
  return (
    <FilterDropdown label="Policy" isOpen={isOpen} onToggle={onToggle}>
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Policy</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-2 border border-blue-300 rounded cursor-pointer hover:bg-blue-50">
            <input
              type="checkbox"
              checked={inPolicyFares}
              onChange={(e) => setInPolicyFares(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">In-policy Fares</span>
          </label>
          
          <label className="flex items-center space-x-3 p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={leastCostLogical}
              onChange={(e) => setLeastCostLogical(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Least Cost Logical Fares</span>
          </label>
        </div>
      </div>
    </FilterDropdown>
  );
};

// ========================================================================
// CARRIERS FILTER DROPDOWN
// ========================================================================

interface Carrier {
  name: string;
  preference?: string;
  price: string;
  selected: boolean;
}

interface CarriersFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  carriers: Carrier[];
  setCarriers: (carriers: Carrier[]) => void;
}

export const CarriersFilter: React.FC<CarriersFilterProps> = ({
  isOpen,
  onToggle,
  carriers,
  setCarriers
}) => {
  const handleCarrierToggle = (index: number) => {
    const updated = [...carriers];
    updated[index].selected = !updated[index].selected;
    setCarriers(updated);
  };

  return (
    <FilterDropdown label="Carriers" isOpen={isOpen} onToggle={onToggle}>
      <div className="w-[500px] p-4 max-h-96 overflow-y-auto">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Carriers</h3>
        <p className="text-sm text-gray-600 mb-4">*Some fares are excluded due to your policy settings.</p>
        
        <div className="space-y-3">
          {carriers.map((carrier, index) => (
            <label
              key={carrier.name}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                carrier.selected 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={carrier.selected}
                onChange={() => handleCarrierToggle(index)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-900 min-w-[120px]">
                  {carrier.name}
                </span>
                <div className="flex items-center space-x-3">
                  {carrier.preference && (
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {carrier.preference}
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-900 min-w-[80px] text-right">
                    {carrier.price}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </FilterDropdown>
  );
};
