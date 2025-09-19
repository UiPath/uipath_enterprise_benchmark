import React, { useState, useRef, useEffect } from 'react';

interface SimpleSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
  showTooltip?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  unit?: string;
}

const SimpleSlider: React.FC<SimpleSliderProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  className = "",
  showTooltip = true,
  showTicks = true,
  tickCount = 11,
  unit = ""
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate slider position as percentage
  const getSliderPosition = () => {
    const range = max - min;
    const valueOffset = value - min;
    return Math.max(0, Math.min(100, (valueOffset / range) * 100));
  };

  // Handle mouse/touch position to value conversion
  const handlePositionToValue = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = Math.round(min + (percentage * (max - min)));

    if (newValue !== value) {
      onChange(newValue);
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handlePositionToValue(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handlePositionToValue(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handlePositionToValue(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      handlePositionToValue(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add/remove global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div className={className}>
      {/* Label */}
      <h3 className="text-base font-semibold text-gray-900 mb-3">{label}</h3>
      
      {/* Min/Max labels */}
      <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
      
      {/* Interactive single-handle slider */}
      <div className="relative mt-2">
        <div
          ref={sliderRef}
          className="relative h-1 bg-blue-600 rounded cursor-pointer select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Single handle with optional tooltip */}
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-md transition-transform cursor-grab ${
              isDragging ? 'scale-110 cursor-grabbing' : 'hover:scale-105'
            }`}
            style={{ left: `calc(${getSliderPosition()}% - 8px)` }}
          >
            {/* Tooltip showing current value */}
            {showTooltip && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {value} {unit}
              </div>
            )}
          </div>
        </div>
        
        {/* Tick marks */}
        {showTicks && (
          <div className="flex justify-between mt-1">
            {Array.from({ length: tickCount }).map((_, i) => (
              <span key={i} className="w-px h-3 bg-blue-600 inline-block" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleSlider;
