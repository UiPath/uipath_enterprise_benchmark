import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import TimeRangeSlider from './TimeRangeSlider';

interface DateRangePickerProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  departureDate: string;
  returnDate?: string;
  onDepartureDateChange: (date: string) => void;
  onReturnDateChange: (date: string) => void;
  onBothDatesChange?: (departureDate: string, returnDate: string) => void;
  onTimeRangeChange?: (departureStart: number, departureEnd: number, returnStart: number, returnEnd: number) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  tripType,
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  onBothDatesChange,
  onTimeRangeChange
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Get today's date as string for comparison
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [departureTimeStart, setDepartureTimeStart] = useState(0); // Full day
  const [departureTimeEnd, setDepartureTimeEnd] = useState(23); // Full day
  const [returnTimeStart, setReturnTimeStart] = useState(0); // Full day  
  const [returnTimeEnd, setReturnTimeEnd] = useState(23); // Full day
  
  // Notify parent component when time ranges change, but only when they actually change
  // Use a ref to track previous values to avoid unnecessary updates
  const prevTimeValues = useRef({
    departureStart: departureTimeStart,
    departureEnd: departureTimeEnd,
    returnStart: returnTimeStart,
    returnEnd: returnTimeEnd
  });
  
  useEffect(() => {
    // Only notify parent if values actually changed
    const hasChanged = 
      prevTimeValues.current.departureStart !== departureTimeStart ||
      prevTimeValues.current.departureEnd !== departureTimeEnd ||
      prevTimeValues.current.returnStart !== returnTimeStart ||
      prevTimeValues.current.returnEnd !== returnTimeEnd;
      
    if (hasChanged && onTimeRangeChange) {
      // Update ref with current values
      prevTimeValues.current = {
        departureStart: departureTimeStart,
        departureEnd: departureTimeEnd,
        returnStart: returnTimeStart,
        returnEnd: returnTimeEnd
      };
      
      // Notify parent
      onTimeRangeChange(departureTimeStart, departureTimeEnd, returnTimeStart, returnTimeEnd);
    }
  }, [departureTimeStart, departureTimeEnd, returnTimeStart, returnTimeEnd, onTimeRangeChange]);
  const [outboundTimeType, setOutboundTimeType] = useState('Departure Time');
  const [returnTimeType, setReturnTimeType] = useState('Departure Time');

  // State machine states
  type DateSelectionState = 'NO_DATES' | 'START_SELECTED' | 'RANGE_COMPLETE';
  
  const getState = (): DateSelectionState => {
    if (!departureDate && !returnDate) return 'NO_DATES';
    if (departureDate && !returnDate) return 'START_SELECTED';
    if (departureDate && returnDate) return 'RANGE_COMPLETE';
    return 'NO_DATES'; // fallback
  };
  
  const calendarRef = useRef<HTMLDivElement>(null);


  // Format date for display (MM/DD/YYYY)
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  // Get display value for the input
  const getDisplayValue = () => {
    if (!departureDate) return '';
    const formattedDeparture = formatDisplayDate(departureDate);
    if (tripType === 'round-trip' && returnDate) {
      const formattedReturn = formatDisplayDate(returnDate);
      return `${formattedDeparture} - ${formattedReturn}`;
    }
    return formattedDeparture;
  };

  // Generate calendar days for a month
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      days.push(currentDate);
    }
    return days;
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date, month: Date) => {
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    // Fix timezone issue by using local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return dateStr === departureDate || dateStr === returnDate;
  };

  // Check if date is in range (either selected or hovered preview)
  const isInRange = (date: Date) => {
    if (tripType !== 'round-trip') return false;
    
    // Fix timezone issue by using local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Show selected range
    if (departureDate && returnDate) {
      return dateStr > departureDate && dateStr < returnDate;
    }
    
    // Show hover preview range
    if (departureDate && hoveredDate && !returnDate) {
      const start = departureDate;
      const end = hoveredDate;
      if (end > start) {
        return dateStr > start && dateStr < end;
      } else if (end < start) {
        return dateStr > end && dateStr < start;
      }
    }
    
    return false;
  };

  // Check if date is on range border (for special styling)
  const isRangeBorder = (date: Date) => {
    if (tripType !== 'round-trip') return false;
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Selected range borders
    if (departureDate && returnDate) {
      return dateStr === departureDate || dateStr === returnDate;
    }
    
    // Hover preview borders
    if (departureDate && hoveredDate && !returnDate) {
      return dateStr === departureDate || dateStr === hoveredDate;
    }
    
    return false;
  };

  // State machine: Handle date click
  const handleDateClick = (date: Date) => {
    // Fix timezone issue by using local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const currentState = getState();
    
    if (tripType === 'one-way') {
      // One-way: always just set departure
      onDepartureDateChange(dateStr);
      return;
    }
    
    // State Machine for Round-trip
    switch (currentState) {
      case 'NO_DATES':
        // State 1: No dates → Set start date, go to START_SELECTED
        onDepartureDateChange(dateStr);
        break;
        
      case 'START_SELECTED':
        // State 2: Start selected → Set end date, go to RANGE_COMPLETE
        // Handle the case where user clicks earlier date (swap them)
        if (dateStr >= departureDate) {
          onReturnDateChange(dateStr);
        } else {
          onReturnDateChange(departureDate);
          onDepartureDateChange(dateStr);
        }
        break;
        
      case 'RANGE_COMPLETE':
        // State 3: Complete range → Delete past range, start fresh with new start
        if (onBothDatesChange) {
          // Use atomic update to avoid React batching issues
          onBothDatesChange(dateStr, '');
        } else {
          // Fallback to separate calls
          onReturnDateChange('');
          onDepartureDateChange(dateStr);
        }
        break;
        
      default:
        break;
    }
  };

  // Handle mouse enter for hover preview - only in START_SELECTED state
  const handleDateHover = (date: Date) => {
    const currentState = getState();
    
    // Only show hover preview when we have start selected but no end (State 2)
    if (tripType === 'round-trip' && currentState === 'START_SELECTED') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      setHoveredDate(dateStr);
    }
  };

  // Handle mouse leave
  const handleDateLeave = () => {
    setHoveredDate(null);
  };

  // Reset state when trip type changes
  useEffect(() => {
    if (tripType === 'one-way' && returnDate) {
      onReturnDateChange('');
    }
    setHoveredDate(null);
  }, [tripType, returnDate, onReturnDateChange]);

  // Initialize calendar to show current month or departure month
  useEffect(() => {
    if (departureDate) {
      const depDate = new Date(departureDate);
      setCurrentMonth(new Date(depDate.getFullYear(), depDate.getMonth(), 1));
    } else {
      setCurrentMonth(new Date());
    }
  }, [showCalendar, departureDate]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
        setHoveredDate(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-700 mb-1">Dates *</label>
      
      {/* Date Input */}
      <div className="relative">
        <input
          type="text"
          value={getDisplayValue()}
          onClick={() => setShowCalendar(!showCalendar)}
          readOnly
          placeholder={tripType === 'round-trip' ? 'MM/DD/YYYY - MM/DD/YYYY' : 'MM/DD/YYYY'}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
        />
        <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <div
          ref={calendarRef}
          className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-6 w-[800px]"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex space-x-8">
              <div className="text-center">
                <div className="font-medium text-blue-600">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">
                  {new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Dual Month Calendar */}
          <div className="grid grid-cols-2 gap-8">
            {/* First Month */}
            <div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays(currentMonth).map((date, index) => {
                  const isCurrentMonthDate = isCurrentMonth(date, currentMonth);
                  
                  // Fix timezone issue by using local date components
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const dateStr = `${year}-${month}-${day}`;
                  
                  const isDeparture = dateStr === departureDate;
                  const isReturn = dateStr === returnDate;
                  const isHovered = dateStr === hoveredDate;
                  const inRange = isInRange(date);
                  const isToday = dateStr === todayStr;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday = 0, Saturday = 6
                  
                  
                  // Build className step by step for clarity
                  let className = "h-8 w-8 text-xs rounded-full transition-all duration-150 relative cursor-pointer ";
                  
                  if (!isCurrentMonthDate) {
                    className += "text-gray-300 ";
                  } else if (isDeparture) {
                    className += "bg-purple-500 text-white border-2 border-purple-600 z-10 ";
                  } else if (isReturn) {
                    className += "bg-blue-600 text-white border-2 border-blue-700 z-10 ";
                  } else if (inRange) {
                    className += "bg-blue-100 text-blue-900 ";
                  } else if (isHovered && departureDate && !returnDate) {
                    className += "bg-blue-200 border-2 border-blue-300 text-blue-900 ";
                  } else if (isToday) {
                    // Today's date gets purple border (#a100c2)
                    className += isWeekend ? "border-2 text-gray-700 hover:bg-gray-100 " : "hover:bg-gray-100 border-2 text-gray-700 ";
                    className += "border-[#a100c2] ";
                    className += isWeekend ? "bg-[#ededed] " : "";
                  } else if (isWeekend) {
                    // Weekend dates get specific gray background (#ededed)
                    className += "bg-[#ededed] text-gray-700 hover:bg-gray-200 ";
                  } else {
                    className += "hover:bg-gray-100 ";
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => handleDateHover(date)}
                      onMouseLeave={handleDateLeave}
                      className={className}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Second Month */}
            <div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)).map((date, index) => {
                  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
                  const isCurrentMonthDate = isCurrentMonth(date, nextMonth);
                  
                  // Fix timezone issue by using local date components
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const dateStr = `${year}-${month}-${day}`;
                  
                  const isDeparture = dateStr === departureDate;
                  const isReturn = dateStr === returnDate;
                  const isHovered = dateStr === hoveredDate;
                  const inRange = isInRange(date);
                  const isToday = dateStr === todayStr;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday = 0, Saturday = 6
                  
                  
                  // Build className step by step for clarity
                  let className = "h-8 w-8 text-xs rounded-full transition-all duration-150 relative cursor-pointer ";
                  
                  if (!isCurrentMonthDate) {
                    className += "text-gray-300 ";
                  } else if (isDeparture) {
                    className += "bg-purple-500 text-white border-2 border-purple-600 z-10 ";
                  } else if (isReturn) {
                    className += "bg-blue-600 text-white border-2 border-blue-700 z-10 ";
                  } else if (inRange) {
                    className += "bg-blue-100 text-blue-900 ";
                  } else if (isHovered && departureDate && !returnDate) {
                    className += "bg-blue-200 border-2 border-blue-300 text-blue-900 ";
                  } else if (isToday) {
                    // Today's date gets purple border (#a100c2)
                    className += isWeekend ? "border-2 text-gray-700 hover:bg-gray-100 " : "hover:bg-gray-100 border-2 text-gray-700 ";
                    className += "border-[#a100c2] ";
                    className += isWeekend ? "bg-[#ededed] " : "";
                  } else if (isWeekend) {
                    // Weekend dates get specific gray background (#ededed)
                    className += "bg-[#ededed] text-gray-700 hover:bg-gray-200 ";
                  } else {
                    className += "hover:bg-gray-100 ";
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => handleDateHover(date)}
                      onMouseLeave={handleDateLeave}
                      className={className}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Preferences - Match Concur Style */}
          <div className="mt-6 border-t pt-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Outbound */}
              <div>
                {/* Label and Dropdown */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-700">Outbound:</span>
                  <div className="relative">
                    <select
                      value={outboundTimeType}
                      onChange={(e) => setOutboundTimeType(e.target.value)}
                      className="appearance-none bg-white border border-blue-500 text-blue-600 px-3 py-2 pr-8 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Departure Time">Departure Time</option>
                      <option value="Arrival Time">Arrival Time</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 pointer-events-none" />
                  </div>
                </div>
                
                {/* Time Range Slider */}
                <TimeRangeSlider
                  label=""
                  startHour={departureTimeStart}
                  endHour={departureTimeEnd}
                  onStartChange={setDepartureTimeStart}
                  onEndChange={setDepartureTimeEnd}
                  showDropdown={false}
                  showTimeInLabel={false}
                  anytimeText="Anytime"
                />
              </div>

              {/* Return (only for round-trip) */}
              {tripType === 'round-trip' && (
                <div>
                  {/* Label and Dropdown */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-700">Return:</span>
                    <div className="relative">
                      <select
                        value={returnTimeType}
                        onChange={(e) => setReturnTimeType(e.target.value)}
                        className="appearance-none bg-white border border-blue-500 text-blue-600 px-3 py-2 pr-8 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Departure Time">Departure Time</option>
                        <option value="Arrival Time">Arrival Time</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Time Range Slider */}
                  <TimeRangeSlider
                    label=""
                    startHour={returnTimeStart}
                    endHour={returnTimeEnd}
                    onStartChange={setReturnTimeStart}
                    onEndChange={setReturnTimeEnd}
                    showDropdown={false}
                    showTimeInLabel={false}
                    anytimeText="Anytime"
                  />
                </div>
              )}
            </div>
            
            {/* Done and Reset Buttons - Match Concur Style */}
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  if (onBothDatesChange) {
                    onBothDatesChange('', '');
                  } else {
                    onDepartureDateChange('');
                    onReturnDateChange('');
                  }
                  // Reset time sliders to default (full day)
                  setDepartureTimeStart(0);
                  setDepartureTimeEnd(23);
                  setReturnTimeStart(0);
                  setReturnTimeEnd(23);
                  
                  // Notify parent component about reset time ranges
                  if (onTimeRangeChange) {
                    onTimeRangeChange(0, 23, 0, 23);
                  }
                  // Reset dropdown selections
                  setOutboundTimeType('Departure Time');
                  setReturnTimeType('Departure Time');
                }}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded font-medium hover:bg-blue-50 transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowCalendar(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
