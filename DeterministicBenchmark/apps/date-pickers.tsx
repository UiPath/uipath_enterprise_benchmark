import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, ChevronDown } from 'lucide-react';
import TaskWrapper from '../src/TaskWrapper';

// Smart Date Input Component
const DateInput = ({ value, onChange, placeholder = "YYYY-MM-DD", className = "" }) => {
  const inputRef = useRef();

  const formatDate = (inputValue) => {
    const digits = inputValue.replace(/\D/g, '');
    let formatted = '';

    if (digits.length >= 8) {
      formatted = `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`;
    } else if (digits.length >= 6) {
      formatted = `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6)}`;
    } else if (digits.length >= 4) {
      formatted = `${digits.slice(0,4)}-${digits.slice(4)}`;
    } else {
      formatted = digits;
    }

    return formatted;
  };

  const handleInput = (e) => {
    const inputValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    const formatted = formatDate(inputValue);
    
    onChange(formatted);

    // Set cursor position after state update
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = calculateCursorPosition(inputValue, formatted, cursorPos);
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    const cursorPos = e.target.selectionStart;
    const currentValue = e.target.value;

    if (e.key === 'Backspace' && cursorPos > 0) {
      // If cursor is right after a hyphen, delete both hyphen and the digit before it
      if (currentValue[cursorPos - 1] === '-') {
        e.preventDefault();
        const beforeHyphen = currentValue.substring(0, cursorPos - 2);
        const afterHyphen = currentValue.substring(cursorPos);
        const newValue = beforeHyphen + afterHyphen;
        const formatted = formatDate(newValue);
        onChange(formatted);
        
        setTimeout(() => {
          if (inputRef.current) {
            const newPos = Math.max(0, cursorPos - 2);
            inputRef.current.setSelectionRange(newPos, newPos);
          }
        }, 0);
      }
    }
  };

  const calculateCursorPosition = (oldValue, newValue, oldCursorPos) => {
    // Count digits before cursor in old value
    const digitsBefore = oldValue.substring(0, oldCursorPos).replace(/\D/g, '').length;
    
    // Find position after same number of digits in new value
    let digitCount = 0;
    for (let i = 0; i < newValue.length; i++) {
      if (/\d/.test(newValue[i])) {
        digitCount++;
        if (digitCount === digitsBefore + 1) {
          return i + 1;
        }
      }
    }
    
    return newValue.length;
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleInput}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      maxLength="10"
      className={className}
    />
  );
};

// Success component: update global statusCode for toolbar indicator


// Utility functions for date manipulation
const formatDate = (date: Date | null): string => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
};

const formatDateForData = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  return date1.toDateString() === date2.toDateString();
};

const isDateInRange = (date: Date | null, start: Date | null, end: Date | null): boolean => {
  if (!date || !start || !end) return false;
  return date >= start && date <= end;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

// 1. Basic Calendar Picker
const BasicCalendarPicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const today = new Date();
  
  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setIsOpen(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="relative" ref={containerRef}>
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          className="w-full px-3 py-2 pr-10 border rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Select a date..."
        />
        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        
        {isOpen && (
          <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg p-4 w-80">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && selectDate(date)}
                  disabled={!date}
                  className={`p-2 text-sm rounded hover:bg-blue-100 ${
                    !date ? 'invisible' : 
                    isSameDay(date, today) ? 'bg-blue-500 text-white' :
                    selectedDate && isSameDay(date, selectedDate) ? 'bg-blue-200 text-blue-800' :
                    'hover:bg-gray-100'
                  }`}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Date Range Picker
const DateRangePicker = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  
  // Expose state in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      startDate: startDate ? formatDateForData(startDate) : null,
      endDate: endDate ? formatDateForData(endDate) : null
    };
  }, [startDate, endDate]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const selectDate = (date: Date) => {
    if (!startDate || selectingEnd) {
      if (!startDate) {
        setStartDate(date);
        setSelectingEnd(true);
      } else {
        if (date < startDate) {
          setEndDate(startDate);
          setStartDate(date);
        } else {
          setEndDate(date);
        }
        setSelectingEnd(false);
        setIsOpen(false);
      }
    } else {
      setStartDate(date);
      setEndDate(null);
      setSelectingEnd(true);
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={startDate && endDate ? 
            `${formatDate(startDate)} - ${formatDate(endDate)}` : 
            startDate ? `${formatDate(startDate)} - ...` : ''
          }
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          className="w-full px-3 py-2 pr-10 border rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Select date range..."
        />
        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        
        {isOpen && (
          <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg p-4 w-80">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) return <div key={index} className="invisible p-2"></div>;
                
                const isStart = startDate && isSameDay(date, startDate);
                const isEnd = endDate && isSameDay(date, endDate);
                const isInRange = startDate && endDate && isDateInRange(date, startDate, endDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => selectDate(date)}
                    disabled={!date}
                    className={`p-2 text-sm rounded ${
                      isStart || isEnd ? 'bg-blue-500 text-white' :
                      isInRange ? 'bg-blue-100 text-blue-800' :
                      'hover:bg-gray-100'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 text-xs text-gray-500 border-t pt-2">
              {selectingEnd ? 'Select end date' : 'Select start date'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Quick Selection Date Picker
const QuickSelectionPicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Expose state in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);

  const quickOptions = [
    { label: 'Today', date: today },
    { label: 'Yesterday', date: yesterday },
    { label: 'Last Week', date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { label: 'Last Month', date: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()) }
  ];

  const selectQuickDate = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          onClick={() => setShowCalendar(!showCalendar)}
          readOnly
          className="w-full px-3 py-2 pr-10 border rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Select a date..."
        />
        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        
        {showCalendar && (
          <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg p-4 w-80">
            {/* Quick selection buttons */}
            <div className="mb-4 border-b pb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h4>
              <div className="grid grid-cols-2 gap-2">
                {quickOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectQuickDate(option.date)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 rounded"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Calendar navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && selectQuickDate(date)}
                  disabled={!date}
                  className={`p-2 text-sm rounded hover:bg-blue-100 ${
                    !date ? 'invisible' : 
                    isSameDay(date, today) ? 'bg-blue-500 text-white' :
                    selectedDate && isSameDay(date, selectedDate) ? 'bg-blue-200 text-blue-800' :
                    'hover:bg-gray-100'
                  }`}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Typing-First Date Picker
const TypingFirstPicker = () => {
  const [input, setInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);
  
  const parseDate = (dateString: string): Date | null => {
    // Try multiple formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
    ];
    
    for (let format of formats) {
      const match = dateString.match(format);
      if (match) {
        let month, day, year;
        if (format === formats[1]) { // YYYY-MM-DD
          [, year, month, day] = match;
        } else { // MM/DD/YYYY or MM-DD-YYYY
          [, month, day, year] = match;
        }
        
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (date.getFullYear() == parseInt(year) && date.getMonth() == parseInt(month) - 1 && date.getDate() == parseInt(day)) {
          return date;
        }
      }
    }
    return null;
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    
    if (value.trim() === '') {
      setSelectedDate(null);
      setIsValid(true);
      return;
    }
    
    const parsedDate = parseDate(value);
    if (parsedDate) {
      setSelectedDate(parsedDate);
      setIsValid(true);
    } else {
      setSelectedDate(null);
      setIsValid(false);
    }
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const selectFromCalendar = (date: Date) => {
    setSelectedDate(date);
    setInput(formatDate(date));
    setIsValid(true);
    setShowCalendar(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
            isValid ? 'focus:ring-blue-500 border-gray-300' : 'focus:ring-red-500 border-red-300'
          }`}
          placeholder="MM/DD/YYYY or click calendar..."
        />
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          <Calendar className="h-5 w-5" />
        </button>
        
        {!isValid && input && (
          <div className="mt-1 text-sm text-red-600">
            Invalid date format. Try MM/DD/YYYY
          </div>
        )}
        
        {selectedDate && isValid && (
          <div className="mt-1 text-sm text-green-600">
            ✓ {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        )}
        
        {showCalendar && (
          <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg p-4 w-80">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && selectFromCalendar(date)}
                  disabled={!date}
                  className={`p-2 text-sm rounded hover:bg-blue-100 ${
                    !date ? 'invisible' : 
                    selectedDate && isSameDay(date, selectedDate) ? 'bg-blue-500 text-white' :
                    'hover:bg-gray-100'
                  }`}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Business Rule Date Picker (Hotel Booking Style)
const BusinessRulePicker = () => {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 3, 1)); // Start in April 2024
  const [isOpen, setIsOpen] = useState(false);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);
  
  // For demo purposes, set "today" to April 1, 2024 so April dates aren't considered past
  const today = new Date(2024, 3, 1); // April 1, 2024
  const minStay = 1; // Minimum 1 night
  const maxStay = 14; // Maximum 14 nights
  
  // Some dates are blocked (e.g., maintenance)
  const blockedDates = [
    new Date(2024, 3, 15), // April 15, 2024
    new Date(2024, 3, 16), // April 16, 2024
    new Date(2024, 3, 17), // April 17, 2024
  ];
  
  // Expose state in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      checkIn: checkIn ? formatDateForData(checkIn) : null,
      checkOut: checkOut ? formatDateForData(checkOut) : null
    };
  }, [checkIn, checkOut]);

  const isDateBlocked = (date: Date): boolean => {
    return blockedDates.some(blocked => isSameDay(date, blocked));
  };

  const isDateDisabled = (date: Date): boolean => {
    if (date < today) return true; // No past dates
    if (isDateBlocked(date)) return true; // No blocked dates
    
    if (selectingCheckOut && checkIn) {
      const daysDiff = Math.ceil((date.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < minStay || daysDiff > maxStay) return true;
      
      // Check if any dates in the range are blocked (excluding check-in and check-out dates)
      const startCheck = new Date(checkIn.getTime() + 24 * 60 * 60 * 1000); // Day after check-in
      let currentCheck = new Date(startCheck);
      
      while (currentCheck < date) {
        if (isDateBlocked(currentCheck)) return true;
        currentCheck = new Date(currentCheck.getTime() + 24 * 60 * 60 * 1000);
      }
    }
    
    return false;
  };

  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const selectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    if (!checkIn || selectingCheckOut) {
      if (!checkIn) {
        setCheckIn(date);
        setSelectingCheckOut(true);
      } else {
        setCheckOut(date);
        setSelectingCheckOut(false);
        setIsOpen(false);
      }
    } else {
      setCheckIn(date);
      setCheckOut(null);
      setSelectingCheckOut(true);
    }
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={checkIn && checkOut ? 
            `${formatDate(checkIn)} - ${formatDate(checkOut)} (${getNights()} nights)` : 
            checkIn ? `${formatDate(checkIn)} - Select checkout` : ''
          }
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          className="w-full px-3 py-2 pr-10 border rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Select check-in and check-out dates..."
        />
        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        
        {isOpen && (
          <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg p-4 w-80">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) return <div key={index} className="invisible p-2"></div>;
                
                const isCheckIn = checkIn && isSameDay(date, checkIn);
                const isCheckOut = checkOut && isSameDay(date, checkOut);
                const isInRange = checkIn && checkOut && isDateInRange(date, checkIn, checkOut);
                const isDisabled = isDateDisabled(date);
                const isBlocked = isDateBlocked(date);
                const isPast = date < today;
                
                return (
                  <button
                    key={index}
                    onClick={() => selectDate(date)}
                    disabled={isDisabled}
                    className={`p-2 text-sm rounded relative ${
                      isCheckIn || isCheckOut ? 'bg-blue-500 text-white' :
                      isInRange ? 'bg-blue-100 text-blue-800' :
                      isBlocked ? 'bg-red-100 text-red-500 cursor-not-allowed' :
                      isPast ? 'text-gray-300 cursor-not-allowed' :
                      isDisabled ? 'text-gray-400 cursor-not-allowed' :
                      'hover:bg-gray-100'
                    }`}
                  >
                    {date.getDate()}
                    {isBlocked && (
                      <X className="absolute inset-0 h-3 w-3 m-auto text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 text-xs text-gray-500 border-t pt-2 space-y-1">
              <div>{selectingCheckOut ? 'Select check-out date' : 'Select check-in date'}</div>
              <div>• Minimum stay: {minStay} night{minStay !== 1 ? 's' : ''}</div>
              <div>• Maximum stay: {maxStay} nights</div>
              <div>• <X className="inline h-3 w-3" /> = Unavailable</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 6. Inline Calendar Picker
const InlineCalendarPicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 7, 1)); // August 2024

  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);

  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="border rounded-md p-4 bg-white w-80 mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <button
              key={index}
              onClick={() => date && selectDate(date)}
              disabled={!date}
              className={`p-2 text-sm rounded hover:bg-blue-100 ${
                !date ? 'invisible' : 
                isSameDay(date, today) ? 'bg-blue-500 text-white' :
                selectedDate && isSameDay(date, selectedDate) ? 'bg-green-500 text-white' :
                'hover:bg-gray-100'
              }`}
            >
              {date?.getDate()}
            </button>
          ))}
        </div>
        
        {selectedDate && (
          <div className="mt-3 pt-3 border-t text-sm text-gray-600">
            Selected: {formatDate(selectedDate)}
          </div>
        )}
      </div>
      
    </div>
  );
};

// 7. Multi-Date Picker
const MultiDatePicker = () => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 8, 1)); // September 2024
  const [isOpen, setIsOpen] = useState(false);
  
  // Expose state in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDates: selectedDates.map(date => formatDateForData(date))
    };
  }, [selectedDates]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const toggleDate = (date: Date) => {
    setSelectedDates(prev => {
      const isSelected = prev.some(d => isSameDay(d, date));
      if (isSelected) {
        return prev.filter(d => !isSameDay(d, date));
      } else {
        return [...prev, date];
      }
    });
  };

  const clearAll = () => {
    setSelectedDates([]);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={selectedDates.length ? `${selectedDates.length} dates selected` : ''}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          className="w-full px-3 py-2 pr-10 border rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Select multiple dates..."
        />
        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        
        {isOpen && (
          <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg p-4 w-80">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                {selectedDates.length} selected
              </span>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) return <div key={index} className="invisible p-2"></div>;
                
                const isSelected = selectedDates.some(d => isSameDay(d, date));
                
                return (
                  <button
                    key={index}
                    onClick={() => toggleDate(date)}
                    className={`p-2 text-sm rounded relative ${
                      isSelected ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 8. Modal Date Picker
const ModalDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 1)); // October 2024
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(false);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isModalOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          onClick={openModal}
          readOnly
          className="w-full px-3 py-2 pr-10 border rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Click to open modal..."
        />
        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-96 max-w-full max-h-full overflow-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Select Date</h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-4">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && selectDate(date)}
                  disabled={!date}
                  className={`p-2 text-sm rounded hover:bg-blue-100 ${
                    !date ? 'invisible' : 
                    selectedDate && isSameDay(date, selectedDate) ? 'bg-blue-500 text-white' :
                    'hover:bg-gray-100'
                  }`}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

// 9. Dropdown Date Picker
const DropdownDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [tempMonth, setTempMonth] = useState(11); // December
  const [tempYear, setTempYear] = useState(2024);
  
  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);
  
  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInSelectedMonth = getDaysInMonth(tempYear, tempMonth);
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  const selectDate = (day: number) => {
    const date = new Date(tempYear, tempMonth, day);
    setSelectedDate(date);
    setShowDayDropdown(false);
  };

  return (
    <div>
      <div className="flex gap-2">
        {/* Month Dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => {
              setShowMonthDropdown(!showMonthDropdown);
              setShowYearDropdown(false);
              setShowDayDropdown(false);
            }}
            className="w-full px-3 py-2 border rounded-md bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>{months[tempMonth]}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {showMonthDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => {
                    setTempMonth(index);
                    setShowMonthDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                >
                  {month}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowYearDropdown(!showYearDropdown);
              setShowMonthDropdown(false);
              setShowDayDropdown(false);
            }}
            className="w-24 px-3 py-2 border rounded-md bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>{tempYear}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {showYearDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    setTempYear(year);
                    setShowYearDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Day Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDayDropdown(!showDayDropdown);
              setShowMonthDropdown(false);
              setShowYearDropdown(false);
            }}
            className="w-16 px-3 py-2 border rounded-md bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>{selectedDate && selectedDate.getMonth() === tempMonth && selectedDate.getFullYear() === tempYear ? selectedDate.getDate() : 'Day'}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {showDayDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => selectDate(day)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {selectedDate && (
        <div className="mt-3 text-sm text-gray-600">
          Selected: {formatDate(selectedDate)}
        </div>
      )}
      
    </div>
  );
};

// 10. Timeline Date Picker
const TimelineDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scale, setScale] = useState<'days' | 'months'>('months');

  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);

  const generateTimelineItems = () => {
    const items: { date: Date; label: string }[] = [];
    
    if (scale === 'months') {
      for (let i = 0; i < 12; i++) {
        const date = new Date(2024, i, 1);
        items.push({
          date,
          label: date.toLocaleDateString('en-US', { month: 'short' })
        });
      }
    } else {
      // Show all days in June 2024
      const daysInJune = getDaysInMonth(2024, 5); // June is month 5
      for (let day = 1; day <= daysInJune; day++) {
        const date = new Date(2024, 5, day);
        items.push({
          date,
          label: day.toString()
        });
      }
    }
    
    return items;
  };

  const timelineItems = generateTimelineItems();

  const selectDate = (date: Date) => {
    if (scale === 'months' && date.getMonth() === 5) {
      // If clicking June in month view, zoom to days
      setScale('days');
    } else if (scale === 'days') {
      // In day view, select the specific date
      setSelectedDate(date);
    }
  };

  const zoomOut = () => {
    if (scale === 'days') setScale('months');
  };

  return (
    <div>
      <div className="border rounded-md p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Scale: {scale}</span>
            {scale !== 'months' && (
              <button
                onClick={zoomOut}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Zoom Out
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {scale === 'months' ? '2024' : 'June 2024'}
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {timelineItems.map((item, index) => (
              <button
                key={index}
                onClick={() => selectDate(item.date)}
                className={`flex-shrink-0 px-3 py-2 text-sm rounded border transition-colors ${
                  selectedDate && isSameDay(item.date, selectedDate) 
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-center">
                  <div className="font-medium">{item.label}</div>
                  {scale === 'days' && (
                    <div className="text-xs text-gray-500">
                      {item.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {/* Timeline line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
        </div>
        
        {selectedDate && (
          <div className="mt-3 pt-3 border-t text-sm text-gray-600">
            Selected: {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        )}
      </div>
      
    </div>
  );
};

// 11. Recurring Date Picker
const RecurringDatePicker = () => {
  const [pattern, setPattern] = useState<'weekly' | 'monthly' | 'yearly' | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1)); // January 2024
  const [isOpen, setIsOpen] = useState(false);
  const [occurrences, setOccurrences] = useState(4);

  // Expose state in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      startDate: startDate ? formatDateForData(startDate) : null,
      pattern: pattern
    };
  }, [startDate, pattern]);

  const generateRecurringDates = () => {
    if (!startDate || !pattern) return [];
    const dates: Date[] = [startDate];
    
    for (let i = 1; i < occurrences; i++) {
      const nextDate = new Date(startDate);
      if (pattern === 'weekly') {
        nextDate.setDate(startDate.getDate() + (i * 7));
      } else if (pattern === 'monthly') {
        nextDate.setMonth(startDate.getMonth() + i);
      } else if (pattern === 'yearly') {
        nextDate.setFullYear(startDate.getFullYear() + i);
      }
      dates.push(nextDate);
    }
    return dates;
  };

  const recurringDates = generateRecurringDates();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const selectDate = (date: Date) => {
    setStartDate(date);
    setIsOpen(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="space-y-4">
        {/* Pattern Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Recurrence Pattern</label>
          <div className="flex gap-2">
            {[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setPattern(option.value as 'weekly' | 'monthly' | 'yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  pattern === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Date and Occurrences */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="text"
              value={startDate ? formatDate(startDate) : ''}
              onClick={() => setIsOpen(!isOpen)}
              readOnly
              className="w-full px-3 py-2 border rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Select start date..."
            />
            <Calendar className="absolute right-3 top-8 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Occurrences</label>
            <input
              type="number"
              value={occurrences}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setOccurrences(Math.min(Math.max(value, 1), 100));
              }}
              onKeyDown={(e) => {
                // Prevent entering values that would exceed 100
                if (e.key === 'ArrowUp' && occurrences >= 100) {
                  e.preventDefault();
                }
              }}
              min="1"
              max="100"
              className="w-20 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Calendar */}
        {isOpen && (
          <div className="border rounded-md p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && selectDate(date)}
                  disabled={!date}
                  className={`p-2 text-sm rounded hover:bg-blue-100 ${
                    !date ? 'invisible' : 
                    startDate && isSameDay(date, startDate) ? 'bg-blue-500 text-white' :
                    'hover:bg-gray-100'
                  }`}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recurring Dates Preview */}
        {recurringDates.length > 0 && pattern && (
          <div className="border rounded-md p-3 bg-blue-50">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              {pattern.charAt(0).toUpperCase() + pattern.slice(1)} Recurring Dates:
            </h4>
            <div className="text-sm text-blue-600 space-y-1">
              {recurringDates.slice(0, 4).map((date, index) => (
                <div key={index}>
                  {index + 1}. {formatDate(date)} ({date.toLocaleDateString('en-US', { weekday: 'long' })})
                </div>
              ))}
              {recurringDates.length > 4 && (
                <div className="text-xs opacity-75">... and {recurringDates.length - 4} more</div>
              )}
            </div>
          </div>
        )}

        {/* Show message when no pattern is selected */}
        {!pattern && (
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm text-gray-600">
              Please select a recurrence pattern to continue.
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 12. Timezone-Aware Picker
const TimezoneAwarePicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [timezone, setTimezone] = useState('America/New_York');
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1)); // March 2024
  const [isOpen, setIsOpen] = useState(false);

  // Expose state in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null,
      selectedTime: selectedTime,
      timezone: timezone
    };
  }, [selectedDate, selectedTime, timezone]);

  const timezones = [
    { value: 'America/New_York', label: 'EST (UTC-5)', city: 'New York' },
    { value: 'America/Los_Angeles', label: 'PST (UTC-8)', city: 'Los Angeles' },
    { value: 'Europe/London', label: 'GMT (UTC+0)', city: 'London' },
    { value: 'Europe/Paris', label: 'CET (UTC+1)', city: 'Paris' },
    { value: 'Asia/Tokyo', label: 'JST (UTC+9)', city: 'Tokyo' },
    { value: 'UTC', label: 'UTC (UTC+0)', city: 'Universal' },
  ];

  const getDateTimeInTimezone = () => {
    if (!selectedDate || !selectedTime) return null;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hours, minutes, 0, 0);
    
    return dateTime;
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={selectedDate ? formatDate(selectedDate) : ''}
              onClick={() => setIsOpen(!isOpen)}
              readOnly
              className="w-full px-3 py-2 border rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Select date..."
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {timezones.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label} - {tz.city}
            </option>
          ))}
        </select>

        {isOpen && (
          <div className="border rounded-md p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  className={`p-2 text-sm rounded hover:bg-blue-100 ${
                    !date ? 'invisible' : 
                    selectedDate && isSameDay(date, selectedDate) ? 'bg-blue-500 text-white' :
                    'hover:bg-gray-100'
                  }`}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {getDateTimeInTimezone() && (
        <div className="border rounded-md p-3 bg-blue-50">
          <h4 className="text-sm font-medium mb-1">Scheduled Time:</h4>
          <div className="text-sm text-gray-600">
            {getDateTimeInTimezone()?.toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short'
            })} ({timezone})
          </div>
        </div>
      )}
      
    </div>
  );
};

// 13. Mobile-Optimized Picker
const MobileOptimizedPicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1)); // January 2024 - requires navigation to April
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        // Swipe left - next month
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
      } else {
        // Swipe right - previous month
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
      }
    }
    
    setTouchStart(null);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="border rounded-md p-2 bg-white max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-3 px-2">
          <button
            onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
            className="p-3 hover:bg-gray-100 rounded-lg touch-manipulation"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h3 className="font-semibold text-lg">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
            className="p-3 hover:bg-gray-100 rounded-lg touch-manipulation"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        <div 
          className="select-none touch-manipulation"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="text-center text-sm font-medium text-gray-500 p-3">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <button
                key={index}
                onClick={() => date && setSelectedDate(date)}
                disabled={!date}
                className={`p-3 text-base rounded-lg hover:bg-blue-100 touch-manipulation ${
                  !date ? 'invisible' : 
                  selectedDate && isSameDay(date, selectedDate) ? 'bg-blue-500 text-white' :
                  'hover:bg-gray-100'
                }`}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-3 text-center text-xs text-gray-500 px-2">
          Swipe left/right to navigate months
        </div>
        
        {selectedDate && (
          <div className="mt-3 pt-3 border-t text-sm text-gray-600 text-center">
            Selected: {formatDate(selectedDate)}
          </div>
        )}
      </div>
      
    </div>
  );
};

// 14. Accessibility-First Picker
const AccessibilityFirstPicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 4, 1)); // May 2024
  const [focusedDate, setFocusedDate] = useState<Date | null>(new Date(2024, 4, 1)); // Start focused on May 1

  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);

  // Focus the first day when component mounts
  useEffect(() => {
    const firstDay = new Date(2024, 4, 1);
        const button = document.querySelector(`[data-date="${formatDateForData(firstDay)}"]`) as HTMLButtonElement;
    if (button) {
      button.focus();
    }
  }, []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const handleKeyDown = (e: React.KeyboardEvent, date: Date | null) => {
    if (!date) return;

    const currentIndex = days.findIndex(d => d && isSameDay(d, date));
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        // Find previous valid date
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (days[i]) {
            newIndex = i;
            break;
          }
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        // Find next valid date
        for (let i = currentIndex + 1; i < days.length; i++) {
          if (days[i]) {
            newIndex = i;
            break;
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Find date 7 positions up
        for (let i = currentIndex - 7; i >= 0; i--) {
          if (days[i]) {
            newIndex = i;
            break;
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        // Find date 7 positions down
        for (let i = currentIndex + 7; i < days.length; i++) {
          if (days[i]) {
            newIndex = i;
            break;
          }
        }
        break;
      case 'Home':
        e.preventDefault();
        newIndex = days.findIndex(d => d !== null);
        break;
      case 'End':
        e.preventDefault();
        newIndex = days.length - 1 - [...days].reverse().findIndex(d => d !== null);
        break;
      case 'PageUp':
        e.preventDefault();
        // Previous month
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
        setFocusedDate(new Date(currentYear, currentMonth - 1, 1));
        return;
      case 'PageDown':
        e.preventDefault();
        // Next month
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
        setFocusedDate(new Date(currentYear, currentMonth + 1, 1));
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setSelectedDate(date);
        return;
    }

    const newDate = days[newIndex];
    if (newDate) {
      setFocusedDate(newDate);
      // Auto-select the date when navigating to it
      setSelectedDate(newDate);
      // Focus the button
      setTimeout(() => {
        const button = document.querySelector(`[data-date="${formatDateForData(newDate)}"]`) as HTMLButtonElement;
        if (button) button.focus();
      }, 0);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div 
        className="border-2 border-gray-800 rounded-md p-4 bg-white"
        role="application"
        aria-label="Date picker"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
            className="p-2 border-2 border-gray-600 hover:border-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
            className="p-2 border-2 border-gray-600 hover:border-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div 
              key={day}
              className="text-center text-sm font-bold text-gray-800 p-2 border-b-2 border-gray-300"
              role="columnheader"
              aria-label={day}
            >
              {day.substring(0, 3)}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} role="gridcell" aria-hidden="true" className="p-2"></div>;
            }

            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isFocused = focusedDate && isSameDay(date, focusedDate);

            return (
              <div
                key={index}
                data-date={formatDateForData(date)}
                onKeyDown={(e) => handleKeyDown(e, date)}
                onFocus={() => setFocusedDate(date)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Keep focus on the currently selected day, not the clicked day
                  if (selectedDate) {
                    const selectedButton = document.querySelector(`[data-date="${formatDateForData(selectedDate)}"]`) as HTMLElement;
                    if (selectedButton) {
                      selectedButton.focus();
                    }
                  } else if (focusedDate) {
                    const focusedButton = document.querySelector(`[data-date="${formatDateForData(focusedDate)}"]`) as HTMLElement;
                    if (focusedButton) {
                      focusedButton.focus();
                    }
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`p-2 text-sm rounded border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-default select-none ${
                  isSelected 
                    ? 'bg-blue-600 text-white border-blue-800' 
                    : isFocused
                    ? 'border-gray-800 bg-gray-100'
                    : 'border-gray-300'
                }`}
                role="gridcell"
                aria-label={`${date.getDate()} ${monthNames[currentMonth]} ${currentYear}`}
                aria-selected={isSelected ? true : undefined}
                tabIndex={isFocused || (!focusedDate && date.getDate() === 1) ? 0 : -1}
              >
                {date?.getDate()}
              </div>
            );
          })}
        </div>
        
        
        {selectedDate && (
          <div 
            className="mt-3 pt-3 border-t-2 border-gray-300 text-base font-medium"
            aria-live="polite"
          >
            Selected: {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        )}
      </div>
      
    </div>
  );
};

// 15. Performance-Optimized Picker
const PerformanceOptimizedPicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentYear, setCurrentYear] = useState(2024);
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
  const [currentMonth, setCurrentMonth] = useState(5); // June

  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);

  // Generate years for large date range (20 years)
  const generateYears = () => {
    const years = [];
    for (let year = 2015; year <= 2034; year++) {
      years.push(year);
    }
    return years;
  };

  const generateMonthDays = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const years = generateYears();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const selectYear = (year: number) => {
    setCurrentYear(year);
    setViewMode('month');
  };

  const selectMonth = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setViewMode('month');
  };

  const days = viewMode === 'month' ? generateMonthDays(currentYear, currentMonth) : [];

  return (
    <div>
      <div className="border rounded-md p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Years
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {months[currentMonth]} {currentYear}
            </button>
          </div>
          
          {selectedDate && (
            <div className="text-sm text-gray-600">
              Selected: {formatDate(selectedDate)}
            </div>
          )}
        </div>

        {viewMode === 'year' && (
          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {years.map(year => (
              <button
                key={year}
                onClick={() => selectYear(year)}
                className={`p-3 text-center rounded border hover:bg-gray-100 ${
                  year === currentYear ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {viewMode === 'month' && (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => selectMonth(index)}
                  className={`p-2 text-sm text-center rounded border hover:bg-gray-100 ${
                    index === currentMonth ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  className={`p-2 text-sm rounded hover:bg-blue-100 ${
                    !date ? 'invisible' : 
                    selectedDate && isSameDay(date, selectedDate) ? 'bg-blue-500 text-white' :
                    'hover:bg-gray-100'
                  }`}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 16. Contextual Picker
const ContextualPicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [context] = useState('meeting'); // Could be: meeting, vacation, deadline, birthday
  const [suggestions] = useState([
    { date: new Date(2024, 5, 3), reason: 'Monday - good for meetings' },
    { date: new Date(2024, 5, 6), reason: 'Thursday - team availability high' },
    { date: new Date(2024, 5, 10), reason: 'Monday - start of week' },
  ]);

  // Expose state in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);

  return (
    <div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Context:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            {context.charAt(0).toUpperCase() + context.slice(1)}
          </span>
        </div>

        <div className="border rounded-md p-3 bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Smart Suggestions:</h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(suggestion.date)}
                className={`w-full p-2 text-left rounded border transition-colors ${
                  selectedDate && isSameDay(selectedDate, suggestion.date)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium text-sm">
                  {suggestion.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-xs opacity-75">
                  {suggestion.reason}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setSelectedDate(null)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Choose different date...
        </button>

        {selectedDate && (
          <div className="border rounded-md p-3 bg-green-50">
            <div className="text-sm font-medium text-green-800">
              Selected: {formatDate(selectedDate)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Optimal for {context} based on patterns
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 17. Integration Picker
const IntegrationPicker = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    location: ''
  });
  const [startDateString, setStartDateString] = useState('');
  const [endDateString, setEndDateString] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Convert string to date when it's complete
  const stringToDate = (dateString: string): Date | null => {
    if (dateString.length === 10) { // YYYY-MM-DD
      const date = new Date(dateString + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return null;
  };

  // Update dates when strings change
  useEffect(() => {
    const startDate = stringToDate(startDateString);
    const endDate = stringToDate(endDateString);
    setFormData(prev => ({ ...prev, startDate, endDate }));
  }, [startDateString, endDateString]);

  // Expose form data in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: formData.startDate ? formatDateForData(formData.startDate) : null,
      eventName: formData.eventName,
      startDate: formData.startDate ? formatDateForData(formData.startDate) : null,
      endDate: formData.endDate ? formatDateForData(formData.endDate) : null,
      location: formData.location,
      isSubmitted: isSubmitted
    };
  }, [formData, isSubmitted]);

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.eventName) newErrors.push('Event name is required');
    if (!formData.startDate) newErrors.push('Start date is required');
    if (!formData.endDate) newErrors.push('End date is required');
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.push('End date must be after start date');
    }
    if (!formData.location) newErrors.push('Location is required');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitted(true);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event Name</label>
          <input
            type="text"
            value={formData.eventName}
            onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event name..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DateInput
              value={startDateString}
              onChange={setStartDateString}
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {startDateString && startDateString.length >= 3 && !formData.startDate && (
              <div className="text-xs text-red-600 mt-1">
                ⚠ Invalid date format. Use YYYY-MM-DD
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DateInput
              value={endDateString}
              onChange={setEndDateString}
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {endDateString && endDateString.length >= 3 && !formData.endDate && (
              <div className="text-xs text-red-600 mt-1">
                ⚠ Invalid date format. Use YYYY-MM-DD
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter location..."
          />
        </div>

        {errors.length > 0 && (
          <div className="border border-red-300 rounded-md p-3 bg-red-50">
            <h4 className="text-sm font-medium text-red-800 mb-1">Validation Errors:</h4>
            <ul className="text-sm text-red-600 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Event
        </button>

        {isSubmitted && formData.startDate && formData.endDate && (
          <div className="border rounded-md p-3 bg-green-50">
            <h4 className="text-sm font-medium text-green-800 mb-1">✓ Event Created Successfully!</h4>
            <div className="text-sm text-green-600">
              <strong>{formData.eventName}</strong><br/>
              {formatDate(formData.startDate)} to {formatDate(formData.endDate)}<br/>
              Location: {formData.location}<br/>
              Duration: {Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
          </div>
        )}
      </form>
      
    </div>
  );
};

// 18. Compact Date Picker (replacing Voice-Enabled)
const CompactDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickDate, setQuickDate] = useState('');

  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
  }, [selectedDate]);

  const quickDates = [
    { label: 'Today', value: 'today', date: new Date() },
    { label: 'Tomorrow', value: 'tomorrow', date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { label: 'Next Week', value: 'next-week', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { label: 'Dec 1, 2024', value: 'dec-1', date: new Date(2024, 11, 1) },
    { label: 'End of Year', value: 'eoy', date: new Date(2024, 11, 31) },
  ];

  const handleQuickSelect = (date: Date, value: string) => {
    setSelectedDate(date);
    setQuickDate(value);
    setIsExpanded(false);
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const date = new Date(inputDate);
      setSelectedDate(date);
      setQuickDate('');
    }
  };

  return (
    <div>
      <div className="max-w-sm">
        {/* Compact main input */}
        <div className="flex gap-1">
          <input
            type="date"
            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
            onChange={handleDateInput}
            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {/* Quick selection dropdown */}
        {isExpanded && (
          <div className="mt-1 border rounded shadow-sm bg-white">
            <div className="p-2 border-b bg-gray-50">
              <div className="text-xs font-medium text-gray-600 mb-1">Quick Select:</div>
            </div>
            <div className="max-h-32 overflow-y-auto">
              {quickDates.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleQuickSelect(item.date, item.value)}
                  className={`w-full px-2 py-1 text-left text-sm hover:bg-blue-50 ${
                    quickDate === item.value ? 'bg-blue-100 text-blue-800' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected date display */}
        {selectedDate && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
            <div className="font-medium">Selected:</div>
            <div className="text-gray-600">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 19. AI-Assisted Picker
const AIAssistedPicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [context, setContext] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<Array<{date: Date, reason: string, confidence: number}>>([]);

  // Expose selected date in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedDate: selectedDate ? formatDateForData(selectedDate) : null
    };
    console.log('[AI-Assisted Picker] app_state updated:', (window as any).app_state);
    console.log('[AI-Assisted Picker] Raw selectedDate:', selectedDate);
  }, [selectedDate]);

  const generateAISuggestions = (userContext: string) => {
    // Simulate AI analysis
    const suggestions = [];
    const lowerContext = userContext.toLowerCase();
    console.log('[AI Suggestions] Analyzing context:', lowerContext);
    
    // Check for presentation/meeting related keywords (including partial matches)
    if (lowerContext.includes('presentation') || 
        lowerContext.includes('meeting') || 
        lowerContext.includes('quarterly') ||
        lowerContext.includes('quarter') ||
        lowerContext.includes('qua') ||
        lowerContext.includes('present') ||
        lowerContext.includes('conference') ||
        lowerContext.includes('demo')) {
      console.log('[AI Suggestions] Using presentation suggestions for:', lowerContext);
      // Only the FIRST suggestion is the correct AI recommendation
      suggestions.push({
        date: new Date(2024, 9, 15),
        reason: 'Tuesday - optimal for presentations (high attention)',
        confidence: 0.92
      });
      // Add plausible but incorrect alternatives
      suggestions.push({
        date: new Date(2024, 9, 17),
        reason: 'Thursday - good meeting attendance historically',
        confidence: 0.85
      });
      suggestions.push({
        date: new Date(2024, 9, 14),
        reason: 'Monday - fresh start for quarterly reviews',
        confidence: 0.78
      });
      suggestions.push({
        date: new Date(2024, 9, 18),
        reason: 'Friday - end of week wrap-up sessions',
        confidence: 0.71
      });
    }
    
    // Check for vacation/time off keywords
    if (lowerContext.includes('vacation') || 
        lowerContext.includes('time off') || 
        lowerContext.includes('holiday') ||
        lowerContext.includes('break')) {
      suggestions.push({
        date: new Date(2024, 9, 14),
        reason: 'Monday start allows long weekend',
        confidence: 0.88
      });
    }
    
    // Fallback suggestions for any other context (avoid dates that conflict with specific keyword suggestions)
    if (suggestions.length === 0 && lowerContext.length >= 3) {
      console.log('[AI Suggestions] Using fallback suggestions for:', lowerContext);
      suggestions.push({
        date: new Date(2024, 9, 21),
        reason: 'Monday - fresh start to the week',
        confidence: 0.75
      });
      suggestions.push({
        date: new Date(2024, 9, 23),
        reason: 'Wednesday - balanced weekday option',
        confidence: 0.70
      });
    }
    
    return suggestions;
  };

  const handleContextChange = (newContext: string) => {
    setContext(newContext);
    if (newContext.length >= 3) {
      setTimeout(() => {
        const suggestions = generateAISuggestions(newContext);
        setAiSuggestions(suggestions);
      }, 500);
    } else {
      setAiSuggestions([]);
    }
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">What are you scheduling?</label>
          <input
            type="text"
            value={context}
            onChange={(e) => handleContextChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 'quarterly presentation', 'team vacation', 'project deadline'..."
          />
        </div>

        {context && aiSuggestions.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            AI analyzing optimal dates...
          </div>
        )}

        {aiSuggestions.length > 0 && (
          <div className="border rounded-md p-3 bg-gradient-to-r from-purple-50 to-blue-50">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              🤖 AI Recommendations
            </h4>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => {
                const isSelected = selectedDate && isSameDay(selectedDate, suggestion.date);
                const isTopRecommendation = index === 0;
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedDate(suggestion.date);
                    }}
                    className={`w-full p-3 text-left rounded border transition-colors ${
                      isSelected
                        ? 'bg-purple-500 text-white border-purple-500'
                        : isTopRecommendation
                        ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300 hover:border-purple-400 hover:from-purple-200 hover:to-blue-200'
                        : 'bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">
                          {suggestion.date.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        {isTopRecommendation && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold">
                            TOP PICK
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {suggestion.reason}
                      </div>
                    </div>
                    <div className="text-xs font-mono opacity-75">
                      {Math.round(suggestion.confidence * 100)}%
                    </div>
                  </div>
                </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedDate && (
          <div className="border rounded-md p-3 bg-green-50">
            <div className="text-sm font-medium text-green-800">
              ✓ Scheduled: {formatDate(selectedDate)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              AI-optimized scheduling
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 20. Date Span Picker
const DateSpanPicker = () => {
  const [duration, setDuration] = useState(3);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 1)); // November 2024
  const [isOpen, setIsOpen] = useState(false);

  // Expose state in global state for testing
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      startDate: startDate ? formatDateForData(startDate) : null,
      duration: duration
    };
  }, [startDate, duration]);

  const endDate = startDate ? new Date(startDate.getTime() + (duration * 24 * 60 * 60 * 1000)) : null;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }

  const selectDate = (date: Date) => {
    setStartDate(date);
    setIsOpen(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={startDate ? formatDate(startDate) : ''}
              onClick={() => setIsOpen(!isOpen)}
              readOnly
              className="w-full px-3 py-2 pr-10 border rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Select start date..."
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              min="1"
              max="30"
              className="w-16 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">nights</span>
          </div>
        </div>

        {isOpen && (
          <div className="border rounded-md p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) return <div key={index} className="invisible p-2"></div>;
                
                const isStart = startDate && isSameDay(date, startDate);
                const isInSpan = startDate && endDate && date >= startDate && date < endDate;
                
                return (
                  <button
                    key={index}
                    onClick={() => selectDate(date)}
                    className={`p-2 text-sm rounded ${
                      isStart ? 'bg-blue-500 text-white' :
                      isInSpan ? 'bg-blue-100 text-blue-800' :
                      'hover:bg-gray-100'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {startDate && endDate && (
          <div className="border rounded-md p-3 bg-blue-50">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Booking Summary:</h4>
            <div className="text-sm text-blue-600 space-y-1">
              <div>Check-in: {formatDate(startDate)}</div>
              <div>Check-out: {formatDate(endDate)}</div>
              <div>Duration: {duration} nights</div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// Task data with inline test functions
const tasks = [
  { 
    id: 1, 
    name: 'Basic Calendar Picker', 
    component: BasicCalendarPicker,
    task: 'Select June 15, 2024',
    ux: 'Click input to open calendar, navigate with arrows, click date to select',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-06-15'; // June 15, 2024
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 2, 
    name: 'Date Range Picker', 
    component: DateRangePicker,
    task: 'Select March 10-15, 2024 as a date range',
    ux: 'Click first date, then second date. Range highlights in between.',
    test: () => {
      const appState = (window as any).app_state;
      const startDate = appState?.startDate;
      const endDate = appState?.endDate;
      const success = startDate === '2024-03-10' && 
                      endDate === '2024-03-15';
      return { success };
    }
  },
  { 
    id: 3, 
    name: 'Quick Selection Picker', 
    component: QuickSelectionPicker,
    task: 'Select "Yesterday" using quick selection',
    ux: 'Use preset buttons for common dates, or open calendar for custom dates',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      // Yesterday's date - this will be dynamic based on when the test runs
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const targetDate = formatDateForData(yesterday);
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 4, 
    name: 'Typing-First Picker', 
    component: TypingFirstPicker,
    task: 'Select December 25, 2024',
    ux: 'Use calendar to select date, typing field available but not required',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-12-25'; // December 25, 2024
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 5, 
    name: 'Business Rule Picker', 
    component: BusinessRulePicker,
    task: 'Book April 20-23, 2024 (3 nights)',
    ux: 'Minimum 2 nights, blocked dates shown, business rules enforced',
    test: () => {
      const appState = (window as any).app_state;
      const checkIn = appState?.checkIn;
      const checkOut = appState?.checkOut;
      const success = checkIn === '2024-04-20' && 
                      checkOut === '2024-04-23';
      return { success };
    }
  },
  { 
    id: 6, 
    name: 'Inline Calendar Picker', 
    component: InlineCalendarPicker,
    task: 'Select August 15, 2024',
    ux: 'Always-visible calendar, no popup interaction, direct selection',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-08-15'; // August 15, 2024
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 7, 
    name: 'Multi-Date Picker', 
    component: MultiDatePicker,
    task: 'Select September 5, 12, and 19, 2024',
    ux: 'Click multiple non-consecutive dates, checkbox-style selection',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDates = appState?.selectedDates; // Array of dates
      const targetDates = ['2024-09-05', '2024-09-12', '2024-09-19'];
      const success = selectedDates && 
                      selectedDates.length === 3 &&
                      targetDates.every(target => selectedDates.includes(target));
      return { success };
    }
  },
  { 
    id: 8, 
    name: 'Modal Date Picker', 
    component: ModalDatePicker,
    task: 'Select October 31, 2024 (Halloween)',
    ux: 'Full-screen modal overlay, escape to close, focus management',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-10-31'; // October 31, 2024 (Halloween)
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 9, 
    name: 'Dropdown Date Picker', 
    component: DropdownDatePicker,
    task: 'Select December 31, 2024 (New Year\'s Eve)',
    ux: 'Compact dropdowns for month, year, and day selection',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-12-31'; // December 31, 2024 (New Year's Eve)
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 10, 
    name: 'Timeline Date Picker', 
    component: TimelineDatePicker,
    task: 'Select June 21, 2024 (Summer Solstice)',
    ux: 'Horizontal timeline, click to zoom in, navigate by scale',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-06-21'; // June 21, 2024 (Summer Solstice)
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 11, 
    name: 'Recurring Date Picker', 
    component: RecurringDatePicker,
    task: 'Set weekly recurring meetings starting January 8, 2024',
    ux: 'Pattern-based selection with repetition rules',
    test: () => {
      const appState = (window as any).app_state;
      const startDate = appState?.startDate;
      const pattern = appState?.pattern;
      const success = startDate === '2024-01-08' && 
                      pattern === 'weekly';
      return { success };
    }
  },
  { 
    id: 12, 
    name: 'Timezone-Aware Picker', 
    component: TimezoneAwarePicker,
    task: 'Schedule March 10, 2024 at 3:00 PM London time',
    ux: 'Date, time, and timezone coordination with conversion',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const selectedTime = appState?.selectedTime;
      const timezone = appState?.timezone;
      const success = selectedDate === '2024-03-10' && 
                      selectedTime === '15:00' && 
                      timezone === 'Europe/London';
      return { success };
    }
  },
  { 
    id: 13, 
    name: 'Mobile-Optimized Picker', 
    component: MobileOptimizedPicker,
    task: 'Select April 22, 2024',
    ux: 'Touch-friendly, swipe navigation, large touch targets',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-04-22'; // April 22, 2024
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 14, 
    name: 'Accessibility-First Picker', 
    component: AccessibilityFirstPicker,
    task: 'Select May 25, 2024 using keyboard only',
    ux: 'Keyboard-only date selection, mouse navigation for months, screen reader optimized',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-05-25'; // May 25, 2024
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 15, 
    name: 'Performance-Optimized Picker', 
    component: PerformanceOptimizedPicker,
    task: 'Select December 25, 2024',
    ux: 'Large date range (2015-2034), lazy loading, virtual scrolling',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-12-25'; // December 25, 2024
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 16, 
    name: 'Contextual Picker', 
    component: ContextualPicker,
    task: 'Select June 6, 2024 (suggested meeting day)',
    ux: 'Context-aware suggestions based on usage patterns',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-06-06'; // June 6, 2024 (suggested meeting day)
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 17, 
    name: 'Integration Picker', 
    component: IntegrationPicker,
    task: 'Create "Conference" event July 15-17, 2024 in Seattle',
    ux: 'Form integration with validation and cross-field dependencies',
    test: () => {
      const appState = (window as any).app_state;
      const eventName = appState?.eventName;
      const startDate = appState?.startDate;
      const endDate = appState?.endDate;
      const location = appState?.location;
      const isSubmitted = appState?.isSubmitted;
      
      const success = isSubmitted && 
                      eventName === 'Conference' && 
                      startDate === '2024-07-15' && 
                      endDate === '2024-07-17' &&
                      location === 'Seattle';
      
      return { success };
    }
  },
  { 
    id: 18, 
    name: 'Compact Date Picker', 
    component: CompactDatePicker,
    task: 'Select December 1, 2024',
    ux: 'Compact interface with quick selections and minimal space usage',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      const targetDate = '2024-12-01'; // December 1, 2024
      const success = selectedDate === targetDate;
      return { success };
    }
  },
  { 
    id: 19, 
    name: 'AI-Assisted Picker', 
    component: AIAssistedPicker,
    task: 'Type "quarterly presentation" and select the TOP AI recommendation',
    ux: 'Context-aware AI suggestions with confidence scores',
    test: () => {
      const appState = (window as any).app_state;
      const selectedDate = appState?.selectedDate;
      
      // Only accept the TOP AI recommendation (first suggestion with highest confidence)
      const correctDate = '2024-10-15'; // October 15, 2024 - the top AI pick
      const success = selectedDate === correctDate;
      const message = selectedDate 
        ? `Selected: ${selectedDate}, Expected: TOP AI recommendation (${correctDate}), Valid: ${success ? 'YES' : 'NO'}`
        : 'No date selected yet';
      return { success, message };
    }
  },
  { 
    id: 20, 
    name: 'Date Span Picker', 
    component: DateSpanPicker,
    task: 'Book 5-night stay starting November 20, 2024',
    ux: 'Duration-based selection with automatic end date calculation',
    test: () => {
      const appState = (window as any).app_state;
      const startDate = appState?.startDate;
      const duration = appState?.duration;
      const success = startDate === '2024-11-20' && 
                      duration === 5;
      return { success };
    }
  }
];

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Date Picker Task Scenarios', appPath: '/date-pickers' };

// Main App using TaskWrapper
export default function App() {
  return (
    <TaskWrapper 
      tasks={tasks}
      appName="Date Picker Task Scenarios" 
      appPath="/date-pickers"
    />
  );
}
