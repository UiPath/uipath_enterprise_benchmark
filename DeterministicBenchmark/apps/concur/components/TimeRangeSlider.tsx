import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface TimeRangeSliderProps {
  label: string;
  startHour: number;
  endHour: number;
  onStartChange: (hour: number) => void;
  onEndChange: (hour: number) => void;
  showDropdown?: boolean;
  className?: string;
  showTimeInLabel?: boolean;  // Whether to show time range in the main label
  anytimeText?: string;       // Custom text when full range is selected (e.g., "anytime")
}

const TimeRangeSlider: React.FC<TimeRangeSliderProps> = ({
  label,
  startHour,
  endHour,
  onStartChange,
  onEndChange,
  showDropdown = true,
  className = "",
  showTimeInLabel = false,
  anytimeText = "anytime"
}) => {
  // State declarations first
  const [localStartHour, setLocalStartHour] = useState(startHour);
  const [localEndHour, setLocalEndHour] = useState(endHour);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [justFinishedDragging, setJustFinishedDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Refs to store current drag values for mouseUp callback
  const currentDragStartRef = useRef(startHour);
  const currentDragEndRef = useRef(endHour);
  
  // Update local state when props change (but not during drag or just after)
  useEffect(() => {
    
    if (!isDragging && !justFinishedDragging) {
      // Only update if the values actually changed from external source
      if (localStartHour !== startHour) {
        setLocalStartHour(startHour);
      }
      if (localEndHour !== endHour) {
        setLocalEndHour(endHour);
      }
    }
  }, [startHour, endHour, isDragging, justFinishedDragging, localStartHour, localEndHour]);
  
  // Clear the "just finished dragging" flag after a short delay
  useEffect(() => {
    if (justFinishedDragging) {
      const timer = setTimeout(() => {
        setJustFinishedDragging(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [justFinishedDragging]);
  
  // Format time for display (e.g., "5:00 AM")
  const formatTime = (hour: number) => {
    const isPM = hour >= 12;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${isPM ? 'PM' : 'AM'}`;
  };

  // Format time range (e.g., "5:00 AM - 9:00 PM")
  const formatTimeRange = (startHour: number, endHour: number) => {
    return `${formatTime(startHour)} - ${formatTime(endHour)}`;
  };

  // Check if this represents "anytime" (full or near-full range) - use displayed values
  const displayStartHour = isDragging ? localStartHour : startHour;
  const displayEndHour = isDragging ? localEndHour : endHour;
  const isAnytime = displayStartHour === 0 && displayEndHour === 23;

  // Generate the main label text
  const getMainLabel = () => {
    if (showTimeInLabel) {
      if (isAnytime) {
        // Full range: just "label anytime" (e.g., "Arriving anytime")
        return `${label} ${anytimeText}`;
      } else {
        // Specific range: "label: time range" (e.g., "Departure time: 4:00 AM - 11:59 PM")
        return `${label}: ${formatTimeRange(displayStartHour, displayEndHour)}`;
      }
    } else {
      return `${label}:`;
    }
  };

  // Calculate percentages for positioning using local state
  const startPercentage = (localStartHour / 23) * 100;
  const endPercentage = (localEndHour / 23) * 100;
  const rangeWidth = endPercentage - startPercentage;

  // Handle mouse events for dragging
  const handleMouseDown = (handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    // Initialize refs with current values when starting drag
    currentDragStartRef.current = localStartHour;
    currentDragEndRef.current = localEndHour;
    setIsDragging(handle);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const hour = Math.round((percentage / 100) * 23);


    // Update local state during drag (no parent callbacks)
    if (isDragging === 'start' && hour <= localEndHour) {
      setLocalStartHour(hour);
      currentDragStartRef.current = hour; // Update ref for mouseUp
    } else if (isDragging === 'end' && hour >= localStartHour) {
      setLocalEndHour(hour);
      currentDragEndRef.current = hour; // Update ref for mouseUp
    }
  };

  const handleMouseUp = () => {
    // Get latest values from refs (not affected by closure issues)
    const currentDragStartValue = currentDragStartRef.current;
    const currentDragEndValue = currentDragEndRef.current;
    const currentIsDragging = isDragging;
    
    
    // Update parent state when drag ends using the ref values
    if (currentIsDragging === 'start') {
      onStartChange(currentDragStartValue);
    } else if (currentIsDragging === 'end') {
      onEndChange(currentDragEndValue);
    }
    
    // Set flags to prevent immediate reset
    setIsDragging(null);
    setJustFinishedDragging(true);
  };

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => handleMouseMove(e);
    const onUp = () => handleMouseUp();
    // Use passive: false so we can prevent default if needed, and pointer capture across frames
    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseup', onUp, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMove as any);
      document.removeEventListener('mouseup', onUp as any);
    };
  }, [isDragging]);

  // Also support pointer events for better cross-browser dragging
  useEffect(() => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const onPointerMove = (e: PointerEvent) => handleMouseMove(e as unknown as MouseEvent);
    const onPointerUp = () => handleMouseUp();
    if (isDragging) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      return () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };
    }
  }, [isDragging]);

  return (
    <div className={className}>
      {/* Header with label and dropdown - only show if label exists or dropdown is shown */}
      {(label || showDropdown) && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">{getMainLabel()}</span>
          {showDropdown && (
            <span className="text-sm text-blue-600 cursor-pointer flex items-center">
              Departure Time <ChevronDown className="ml-1 h-3 w-3" />
            </span>
          )}
        </div>
      )}

      {/* Time range display - only show if not included in main label */}
      {!showTimeInLabel && (
        <div className="text-sm font-medium text-gray-700 mb-2">
          {isAnytime ? anytimeText : formatTimeRange(displayStartHour, displayEndHour)}
        </div>
      )}

      {/* Slider */}
      <div ref={sliderRef} className="relative h-2 bg-gray-200 rounded-full">
        {/* Active range */}
        <div 
          className="absolute h-2 bg-blue-500 rounded-full"
          style={{
            left: `${startPercentage}%`,
            width: `${rangeWidth}%`
          }}
        />
        
        {/* Start handle */}
        <span 
          role="slider"
          tabIndex={0}
          aria-label={`range start, ${formatTime(localStartHour)}`}
          aria-orientation="horizontal"
          aria-valuemin="0"
          aria-valuemax="24"
          aria-valuenow={localStartHour}
          aria-valuetext={formatTime(localStartHour)}
          className={`absolute cursor-pointer bg-white rounded border border-gray-300 shadow-sm px-2 py-1 ${isDragging === 'start' ? 'scale-110 shadow-md' : 'hover:shadow-md'}`}
          style={{ 
            left: `calc(${startPercentage}% - 16px)`, 
            top: '-4px'
          }}
          onMouseDown={handleMouseDown('start')}
        >
          <svg 
            aria-hidden="true" 
            width="16" 
            height="8" 
            viewBox="0 0 12 6" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-600"
          >
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M8.71299 0.0571123C8.99324 -0.0589735 9.31583 0.00519334 9.53033 0.219692L11.7803 2.46969C12.0732 2.76258 12.0732 3.23746 11.7803 3.53035L9.53033 5.78035C9.31583 5.99485 8.99324 6.05902 8.71299 5.94293C8.43273 5.82685 8.25 5.55337 8.25 5.25002V0.750022C8.25 0.446675 8.43273 0.173198 8.71299 0.0571123Z" 
              fill="currentColor"
            />
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M3.28701 0.0571123C3.56727 0.173198 3.75 0.446675 3.75 0.750022V5.25002C3.75 5.55337 3.56727 5.82685 3.28701 5.94293C3.00676 6.05902 2.68417 5.99485 2.46967 5.78035L0.21967 3.53035C-0.0732233 3.23746 -0.0732233 2.76258 0.21967 2.46969L2.46967 0.219692C2.68417 0.00519334 3.00676 -0.0589735 3.28701 0.0571123Z" 
              fill="currentColor"
            />
          </svg>
        </span>
        
        {/* End handle */}
        <span 
          role="slider"
          tabIndex={0}
          aria-label={`range end, ${formatTime(localEndHour)}`}
          aria-orientation="horizontal"
          aria-valuemin="0"
          aria-valuemax="24"
          aria-valuenow={localEndHour}
          aria-valuetext={formatTime(localEndHour)}
          className={`absolute cursor-pointer bg-white rounded border border-gray-300 shadow-sm px-2 py-1 ${isDragging === 'end' ? 'scale-110 shadow-md' : 'hover:shadow-md'}`}
          style={{ 
            left: `calc(${endPercentage}% - 16px)`, 
            top: '-4px'
          }}
          onMouseDown={handleMouseDown('end')}
        >
          <svg 
            aria-hidden="true" 
            width="16" 
            height="8" 
            viewBox="0 0 12 6" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-600"
          >
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M8.71299 0.0571123C8.99324 -0.0589735 9.31583 0.00519334 9.53033 0.219692L11.7803 2.46969C12.0732 2.76258 12.0732 3.23746 11.7803 3.53035L9.53033 5.78035C9.31583 5.99485 8.99324 6.05902 8.71299 5.94293C8.43273 5.82685 8.25 5.55337 8.25 5.25002V0.750022C8.25 0.446675 8.43273 0.173198 8.71299 0.0571123Z" 
              fill="currentColor"
            />
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M3.28701 0.0571123C3.56727 0.173198 3.75 0.446675 3.75 0.750022V5.25002C3.75 5.55337 3.56727 5.82685 3.28701 5.94293C3.00676 6.05902 2.68417 5.99485 2.46967 5.78035L0.21967 3.53035C-0.0732233 3.23746 -0.0732233 2.76258 0.21967 2.46969L2.46967 0.219692C2.68417 0.00519334 3.00676 -0.0589735 3.28701 0.0571123Z" 
              fill="currentColor"
            />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default TimeRangeSlider;
