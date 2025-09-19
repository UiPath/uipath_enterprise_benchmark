import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Calendar, ArrowLeft, X } from 'lucide-react';

// Helper functions for calendar (moved to top for reuse)
const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
};

// Company Events and Holidays for 2025
const companyEvents = [
  // January 2025
  { day: 1, month: 0, year: 2025, title: "New Year's Day", type: "holiday", color: "red" },
  { day: 20, month: 0, year: 2025, title: "MLK Day", type: "holiday", color: "red" },
  
  // February 2025
  { day: 17, month: 1, year: 2025, title: "Presidents' Day", type: "holiday", color: "red" },
  { day: 14, month: 1, year: 2025, title: "Valentine's Day", type: "event", color: "pink" },
  
  // March 2025
  { day: 17, month: 2, year: 2025, title: "St. Patrick's Day", type: "event", color: "green" },
  { day: 31, month: 2, year: 2025, title: "Cesar Chavez Day", type: "holiday", color: "red" },
  
  // April 2025
  { day: 15, month: 3, year: 2025, title: "Tax Day", type: "event", color: "gray" },
  { day: 21, month: 3, year: 2025, title: "Easter Monday", type: "holiday", color: "red" },
  
  // May 2025
  { day: 5, month: 4, year: 2025, title: "Cinco de Mayo", type: "event", color: "green" },
  { day: 26, month: 4, year: 2025, title: "Memorial Day", type: "holiday", color: "red" },
  
  // June 2025
  { day: 19, month: 5, year: 2025, title: "Juneteenth", type: "holiday", color: "red" },
  { day: 21, month: 5, year: 2025, title: "Summer Solstice", type: "event", color: "yellow" },
  
  // July 2025
  { day: 4, month: 6, year: 2025, title: "Independence Day", type: "holiday", color: "red" },
  { day: 17, month: 6, year: 2025, title: "Bridgepoint Financial Day", type: "company", color: "blue" },
  
  // August 2025
  { day: 15, month: 7, year: 2025, title: "Saint Mary's", type: "event", color: "gray" },
  { day: 25, month: 7, year: 2025, title: "National Park Service Day", type: "event", color: "green" },
  
  // September 2025
  { day: 1, month: 8, year: 2025, title: "Labor Day", type: "holiday", color: "red" },
  { day: 11, month: 8, year: 2025, title: "Patriot Day", type: "event", color: "gray" },
  { day: 22, month: 8, year: 2025, title: "Autumn Equinox", type: "event", color: "orange" },
  
  // October 2025
  { day: 13, month: 9, year: 2025, title: "Columbus Day", type: "holiday", color: "red" },
  { day: 31, month: 9, year: 2025, title: "Halloween", type: "event", color: "purple" },
  
  // November 2025
  { day: 11, month: 10, year: 2025, title: "Veterans Day", type: "holiday", color: "red" },
  { day: 27, month: 10, year: 2025, title: "Thanksgiving", type: "holiday", color: "red" },
  { day: 28, month: 10, year: 2025, title: "Black Friday", type: "event", color: "gray" },
  
  // December 2025
  { day: 25, month: 11, year: 2025, title: "Christmas Day", type: "holiday", color: "red" },
  { day: 31, month: 11, year: 2025, title: "New Year's Eve", type: "event", color: "blue" }
];

// Helper function to get events for a specific day
const getEventsForDay = (day, month, year) => {
  return companyEvents.filter(event => 
    event.day === day && event.month === month && event.year === year
  );
};

// Helper function to get event styling
const getEventStyle = (event) => {
  const baseStyle = "text-xs px-1 py-0.5 rounded text-center";
  
  switch (event.color) {
    case "red":
      return `${baseStyle} bg-red-100 text-red-800`;
    case "blue":
      return `${baseStyle} bg-blue-100 text-blue-800`;
    case "green":
      return `${baseStyle} bg-green-100 text-green-800`;
    case "yellow":
      return `${baseStyle} bg-yellow-100 text-yellow-800`;
    case "purple":
      return `${baseStyle} bg-purple-100 text-purple-800`;
    case "pink":
      return `${baseStyle} bg-pink-100 text-pink-800`;
    case "orange":
      return `${baseStyle} bg-orange-100 text-orange-800`;
    case "gray":
    default:
      return `${baseStyle} bg-gray-100 text-gray-600`;
  }
};

// Generate calendar days for any month/year
const generateCalendarDays = (viewingMonth, viewingYear) => {
  const days = [];
  
  // First day of the viewing month
  const firstDayOfMonth = new Date(viewingYear, viewingMonth, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  
  // Last day of the viewing month
  const lastDayOfMonth = new Date(viewingYear, viewingMonth + 1, 0);
  
  // Start from the Sunday of the week containing the first day
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(1 - firstDayOfWeek);
  
  // End on the Saturday of the week containing the last day
  const endDate = new Date(lastDayOfMonth);
  const lastDayOfWeek = lastDayOfMonth.getDay();
  endDate.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfWeek));
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    days.push(new Date(date));
  }
  return days;
};

// Reusable Calendar Component
const CalendarComponent = ({ 
  viewingMonth, 
  viewingYear, 
  onNavigateMonth, 
  onToggleDate, 
  onSetSelection,
  isDateSelected, 
  isDateRequested, 
  isInteractive = true,
  showBalance = true,
  showInstructions = true,
  availableBalance = null,
  className = ""
}) => {
  const balance = availableBalance || { statutoryPTO: 16, volunteering: 5 };
  const calendarDays = generateCalendarDays(viewingMonth, viewingYear);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDay, setDragStartDay] = useState(null);
  const [dragEndDay, setDragEndDay] = useState(null);
  const [tempSelectedDates, setTempSelectedDates] = useState(new Set());
  const [dragStartDayWasSelected, setDragStartDayWasSelected] = useState(false);

  // Handle mouse down on a day
  const handleMouseDown = (day, month, year) => {
    if (!isInteractive || !isDateSelected || !onToggleDate) return;
    
    const isCurrentMonth = month === viewingMonth && year === viewingYear;
    const isAlreadyRequested = isDateRequested ? isDateRequested(day, month, year) : false;
    
    if (!isCurrentMonth || isAlreadyRequested) return;

    // Store the initial state of the start day
    const startDayWasSelected = isDateSelected(day);
    console.log(`[DRAG START] Day ${day}, was selected: ${startDayWasSelected}`);
    setDragStartDayWasSelected(startDayWasSelected);

    setIsDragging(true);
    setDragStartDay(day);
    setDragEndDay(day);
    
    // Start with current selection for visual feedback
    const newTempSelection = new Set();
    newTempSelection.add(day);
    setTempSelectedDates(newTempSelection);
  };

  // Handle mouse move during drag
  const handleMouseMove = (day, month, year) => {
    if (!isDragging || !isInteractive || !isDateSelected || !onToggleDate) return;
    
    const isCurrentMonth = month === viewingMonth && year === viewingYear;
    const isAlreadyRequested = isDateRequested ? isDateRequested(day, month, year) : false;
    
    if (!isCurrentMonth || isAlreadyRequested) return;

    setDragEndDay(day);
    
    // Calculate range between start and current day
    const startDay = Math.min(dragStartDay, day);
    const endDay = Math.max(dragStartDay, day);
    
    // Generate all days in the range
    const rangeDays = [];
    for (let d = startDay; d <= endDay; d++) {
      rangeDays.push(d);
    }
    
    console.log(`[DRAG MOVE] Range: ${startDay} to ${endDay}, days: [${rangeDays.join(', ')}]`);
    
    // Create new temporary selection
    const newTempSelection = new Set();
    rangeDays.forEach(d => {
      newTempSelection.add(d);
    });
    setTempSelectedDates(newTempSelection);
  };

  // Handle mouse up - finalize selection
  const handleMouseUp = () => {
    if (!isDragging || !onToggleDate) return;
    
    console.log(`[DRAG END] Start day was selected: ${dragStartDayWasSelected}, temp dates: [${Array.from(tempSelectedDates).join(', ')}]`);
    
    // Apply the drag selection to the parent component
    if (tempSelectedDates.size > 0) {
      // Get current selection state
      const currentSelection = new Set();
      for (let day = 1; day <= 31; day++) {
        if (isDateSelected(day)) {
          currentSelection.add(day);
        }
      }
      console.log(`[DRAG END] Current selection before drag: [${Array.from(currentSelection).join(', ')}]`);
      
      // Create new selection based on drag operation
      const newSelection = new Set(currentSelection);
      
      if (dragStartDayWasSelected) {
        // We started with a selected day, so we're deselecting the range
        console.log(`[DRAG END] Deselecting range`);
        tempSelectedDates.forEach(day => {
          if (newSelection.has(day)) {
            console.log(`[DRAG END] Removing day ${day} from selection`);
            newSelection.delete(day);
          }
        });
      } else {
        // We started with an unselected day, so we're selecting the range
        console.log(`[DRAG END] Selecting range`);
        tempSelectedDates.forEach(day => {
          if (!newSelection.has(day)) {
            console.log(`[DRAG END] Adding day ${day} to selection`);
            newSelection.add(day);
          }
        });
      }
      
      console.log(`[DRAG END] New selection after drag: [${Array.from(newSelection).join(', ')}]`);
      
      // Use onSetSelection if available, otherwise fall back to individual toggles
      if (onSetSelection) {
        console.log(`[DRAG END] Using onSetSelection to set entire selection`);
        onSetSelection(newSelection);
      } else {
        // Fallback to individual toggles with delays
        const daysToToggle = [];
        for (let day = 1; day <= 31; day++) {
          const wasSelected = currentSelection.has(day);
          const shouldBeSelected = newSelection.has(day);
          
          if (wasSelected !== shouldBeSelected) {
            daysToToggle.push({ day, action: shouldBeSelected ? 'add' : 'remove' });
          }
        }
        
        console.log(`[DRAG END] Days to toggle: ${daysToToggle.map(d => `${d.day}(${d.action})`).join(', ')}`);
        
        // Apply toggles with increasing delays to avoid state batching
        daysToToggle.forEach(({ day, action }, index) => {
          setTimeout(() => {
            console.log(`[DRAG END] Toggling day ${day} ${action === 'add' ? 'ON' : 'OFF'}`);
            onToggleDate(day);
          }, index * 50); // Increased delay to 50ms
        });
      }
    }
    
    setIsDragging(false);
    setDragStartDay(null);
    setDragEndDay(null);
    setTempSelectedDates(new Set());
    setDragStartDayWasSelected(false);
  };

  // Handle mouse leave - cancel drag
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStartDay(null);
      setDragEndDay(null);
      setTempSelectedDates(new Set());
      setDragStartDayWasSelected(false);
    }
  };

  return (
    <div className={"min-h-screen bg-gray-50 " + (className || "")}>
      {/* Top Section - Title and Instructions */}
      {showInstructions && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Absence Calendar
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    George Ashford
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Banner */}
      {showInstructions && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="text-sm text-gray-700 space-y-1">
              <p>• We reserve the right to make any further recalculations or re-assessment of the balance.</p>
              <p>• To see more details about the Time Off types available for your country and to determine which Time Off is applicable for your request, you can visit the dedicated <a href="#" className="text-blue-600 hover:underline">Inside Bridgepoint Financial Page</a></p>
              <p>• We know that giving back to your communities is important to you. Starting Jan 1, 2022, all eligible Bridgepoint Financial employees will receive 40 hours of paid <a href="#" className="text-blue-600 hover:underline">Volunteer Time Off (VTO)</a> per calendar year.</p>
              <p>• Currently, it is not possible to request Personal Leaves (long leaves) and Parental Leaves in Workday. To submit such requests, please use <a href="#" className="text-blue-600 hover:underline">AskPeople</a>, our digital assistant.</p>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Click and drag on the calendar or select date range</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* Main Calendar Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Balances */}
          {showBalance && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Balances</h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">Balance as of</p>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      value="08/04/2025" 
                      className="text-sm border border-gray-300 rounded px-2 py-1 w-24"
                      readOnly
                    />
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Per Plan</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      <span className="block">Volunteering</span>
                      <span className="text-gray-600">{balance.volunteering} Days</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="block">PTO (Vacation)</span>
                      <span className="text-gray-600">{balance.statutoryPTO} Days</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="text-sm font-medium text-gray-900">
                    <span className="block">Total</span>
                    <span className="text-gray-600">{balance.statutoryPTO + balance.volunteering} Days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Calendar */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button 
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  onClick={() => onNavigateMonth('prev')}
                >
                  <span className="text-gray-600 text-lg">‹</span>
                </button>
                <h3 className="text-lg font-medium text-gray-900">
                  {getMonthName(viewingMonth)} {viewingYear}
                </h3>
                <button 
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  onClick={() => onNavigateMonth('next')}
                >
                  <span className="text-gray-600 text-lg">›</span>
                </button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {daysOfWeek.map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-100 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div 
                className="grid grid-cols-7"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {calendarDays.map((date, index) => {
                  const day = date.getDate();
                  const month = date.getMonth();
                  const year = date.getFullYear();
                  const isCurrentMonth = month === viewingMonth;
                  const isToday = day === 4 && month === 7 && year === 2025; // August 4th, 2025
                  const isSelected = isDateSelected ? isDateSelected(day) && isCurrentMonth : false;
                  const isTempSelected = isDragging && tempSelectedDates.has(day) && isCurrentMonth;
                  const isAlreadyRequested = isDateRequested ? isDateRequested(day, month, year) : false;
                  const isClickable = isInteractive && isCurrentMonth && !isAlreadyRequested;
                  const dayEvents = getEventsForDay(day, month, year);

                  return (
                    <div 
                      key={index} 
                      className="min-h-24 p-2 border-r border-b border-gray-100 last:border-r-0 relative"
                    >
                      <div className="flex flex-col h-full">
                        <button
                          className={
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all " +
                            (isAlreadyRequested
                              ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-60'
                              : !isCurrentMonth 
                                ? 'text-gray-300 cursor-default' 
                                : isTempSelected
                                  ? 'bg-blue-300 text-white'
                                  : isSelected
                                    ? 'bg-blue-500 text-white'
                                    : isToday
                                      ? 'bg-blue-100 text-blue-600'
                                      : isClickable
                                        ? 'hover:bg-blue-50 text-gray-900 cursor-pointer'
                                        : 'text-gray-900')
                          }
                          onMouseDown={() => handleMouseDown(day, month, year)}
                          onMouseMove={() => handleMouseMove(day, month, year)}
                          onClick={() => {
                            // Only handle click if not dragging (single click)
                            if (!isDragging && isClickable && onToggleDate) {
                              onToggleDate(day);
                            }
                          }}
                          disabled={!isClickable}
                          title={isAlreadyRequested ? 'This date is already requested' : ''}
                        >
                          {day}
                        </button>
                        
                        {/* Events and Holidays */}
                        {dayEvents.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {dayEvents.map((event, eventIndex) => (
                              <div key={eventIndex} className={getEventStyle(event)}>
                                {event.title}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Already requested indicator */}
                        {isAlreadyRequested && (
                          <div className="mt-1">
                            <div className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded text-center">
                              Requested
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Change Contact Information View (Edit Form) - Moved outside to prevent re-creation
const ChangeContactInformation = ({ contactInfo, setContactInfo, contactArrays, setContactArrays, setCurrentView, showModalAlert }) => {
  const { addresses, phones, emails } = contactArrays;

  const addAddress = () => {
    const newAddress = {
      id: Date.now(),
      address: '',
      usage: 'Home',
      visibility: 'Private',
      isPrimary: false
    };
    setContactArrays(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress]
    }));
  };

  const addPhone = () => {
    const newPhone = {
      id: Date.now(),
      number: '',
      usage: 'Home',
      visibility: 'Private',
      isPrimary: false
    };
    setContactArrays(prev => ({
      ...prev,
      phones: [...prev.phones, newPhone]
    }));
  };

  const addEmail = () => {
    const newEmail = {
      id: Date.now(),
      email: '',
      usage: 'Home',
      visibility: 'Private',
      isPrimary: false
    };
    setContactArrays(prev => ({
      ...prev,
      emails: [...prev.emails, newEmail]
    }));
  };

  const removeAddress = (id) => {
    setContactArrays(prev => ({
      ...prev,
      addresses: prev.addresses.filter(addr => addr.id !== id)
    }));
  };

  const removePhone = (id) => {
    setContactArrays(prev => ({
      ...prev,
      phones: prev.phones.filter(phone => phone.id !== id)
    }));
  };

  const removeEmail = (id) => {
    setContactArrays(prev => ({
      ...prev,
      emails: prev.emails.filter(email => email.id !== id)
    }));
  };

  const updateAddress = (id, field, value) => {
    setContactArrays(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr => 
        addr.id === id ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const updatePhone = (id, field, value) => {
    setContactArrays(prev => ({
      ...prev,
      phones: prev.phones.map(phone => 
        phone.id === id ? { ...phone, [field]: value } : phone
      )
    }));
  };

  const updateEmail = (id, field, value) => {
    setContactArrays(prev => ({
      ...prev,
      emails: prev.emails.map(email => 
        email.id === id ? { ...email, [field]: value } : email
      )
    }));
  };

  return (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setCurrentView('my-contact-info')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Change My Home Contact Information
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              George Ashford
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-xl font-medium text-gray-900 mb-8 text-center">
        Change Home Contact Information
      </h2>
      
      {/* Address Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Address</h3>
          
          {addresses.map((address, index) => (
            <div key={address.id} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {address.isPrimary ? 'Primary' : `Address ${index + 1}`}
                </span>
                <div className="flex space-x-2">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <span className="text-gray-500">👁</span>
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <span className="text-gray-500">✎</span>
                  </button>
                  {!address.isPrimary && (
                    <button 
                      onClick={() => removeAddress(address.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Remove address"
                    >
                      <span className="text-red-500">🗑</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={address.address}
                    onChange={(e) => {
                      updateAddress(address.id, 'address', e.target.value);
                      if (address.isPrimary) {
                        setContactInfo({...contactInfo, homeAddress: e.target.value});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage</label>
                    <select
                      value={address.usage}
                      onChange={(e) => updateAddress(address.id, 'usage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                    <select
                      value={address.visibility}
                      onChange={(e) => updateAddress(address.id, 'visibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={addAddress}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Add
          </button>
      </div>

      {/* Phone Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Phone</h3>
          
          {phones.map((phone, index) => (
            <div key={phone.id} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {phone.isPrimary ? 'Primary' : `Phone ${index + 1}`}
                </span>
                <div className="flex space-x-2">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <span className="text-gray-500">👁</span>
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <span className="text-gray-500">✎</span>
                  </button>
                  <button 
                    onClick={() => removePhone(phone.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Remove phone"
                  >
                    <span className="text-red-500">🗑</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone.number}
                    onChange={(e) => updatePhone(phone.id, 'number', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage</label>
                    <select
                      value={phone.usage}
                      onChange={(e) => updatePhone(phone.id, 'usage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                    <select
                      value={phone.visibility}
                      onChange={(e) => updatePhone(phone.id, 'visibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={addPhone}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Add
          </button>
      </div>

      {/* Email Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Email</h3>
          
          {emails.map((email, index) => (
            <div key={email.id} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {email.isPrimary ? 'Primary' : `Email ${index + 1}`}
                </span>
                <div className="flex space-x-2">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <span className="text-gray-500">👁</span>
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <span className="text-gray-500">✎</span>
                  </button>
                  {!email.isPrimary && (
                    <button 
                      onClick={() => removeEmail(email.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Remove email"
                    >
                      <span className="text-red-500">🗑</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address {email.isPrimary && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    value={email.email}
                    onChange={(e) => {
                      updateEmail(email.id, 'email', e.target.value);
                      if (email.isPrimary) {
                        setContactInfo({...contactInfo, homeEmail: e.target.value});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage</label>
                    <select
                      value={email.usage}
                      onChange={(e) => updateEmail(email.id, 'usage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                    <select
                      value={email.visibility}
                      onChange={(e) => updateEmail(email.id, 'visibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={addEmail}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Add
          </button>
      </div>

      {/* Comment Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About your comment
        </label>
        <textarea
          placeholder=""
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          rows={4}
        />
      </div>

      {/* Attachments Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <div className="space-y-4">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600">Drop files here</p>
              <p className="text-sm text-gray-500 mb-2">or</p>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Select files
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-start space-x-3">
        <button 
          onClick={() => {
            // Handle form submission
            showModalAlert(
              'Success',
              'Contact information updated successfully!',
              () => setCurrentView('my-contact-info')
            );
          }}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Submit
        </button>
        <button 
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Save for Later
        </button>
        <button 
          onClick={() => setCurrentView('my-contact-info')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
  );
};

const WorkdayApp = () => {
  // State management for the happy path
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedDates, setSelectedDates] = useState(new Set()); // Use Set for easier toggle logic
  const [selectedAbsenceType, setSelectedAbsenceType] = useState('');
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [viewingMonth, setViewingMonth] = useState(7); // August (0-based)
  const [viewingYear, setViewingYear] = useState(2025);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Contact information state
  const [contactInfo, setContactInfo] = useState({
    homeAddress: '123 Main Street, Apt 4B, San Francisco, CA 94102',
    homeEmail: 'george.ashford@gmail.com',
    workAddress: '456 Business Park Drive, Floor 3, San Francisco, CA 94105',
    workEmail: 'george.ashford@bridgepointfinancial.com'
  });

  // Dynamic contact arrays state
  const [contactArrays, setContactArrays] = useState({
    addresses: [
      { 
        id: 1, 
        address: '123 Main Street, Apt 4B, San Francisco, CA 94102', 
        usage: 'Home', 
        visibility: 'Private', 
        isPrimary: true 
      }
    ],
    phones: [],
    emails: [
      { 
        id: 1, 
        email: 'george.ashford@gmail.com', 
        usage: 'Home', 
        visibility: 'Private', 
        isPrimary: true 
      }
    ]
  });

  // Personal information state
  const [personalInfo, setPersonalInfo] = useState({
    gender: 'Male',
    dateOfBirth: '06/07/1975',
    age: '50 years, 3 months, 3 days',
    maritalStatus: '',
    maritalStatusDate: '',
    citizenshipStatus: 'Citizen (United Kingdom)',
    nationality: 'United Kingdom'
  });

  // Legal name modal state
  const [showLegalNameModal, setShowLegalNameModal] = useState(false);

  // Legal name data state
  const [legalNameData, setLegalNameData] = useState({
    effectiveDate: '09/10/2025',
    country: 'Romania',
    givenName: 'Horia',
    familyName: 'Cristescu',
    comment: ''
  });

  // Absence balance state (reduced by 12 days due to pre-existing July and January requests)
  const [availableBalance, setAvailableBalance] = useState({
    statutoryPTO: 16, // 28 - 5 days (July) - 7 days (January) = 16 days remaining
    volunteering: 5
  });

  // Track submitted absence requests (pre-populated with July 27-31 and January 5-11 requests)
  const [submittedRequests, setSubmittedRequests] = useState([
    {
      id: 'REQ-20250720001',
      dates: [
        { day: 27, month: 6, year: 2025 }, // July 27
        { day: 28, month: 6, year: 2025 }, // July 28
        { day: 29, month: 6, year: 2025 }, // July 29
        { day: 30, month: 6, year: 2025 }, // July 30
        { day: 31, month: 6, year: 2025 }  // July 31
      ],
      absenceType: 'PTO (Vacation)',
      daysCount: 5,
      submittedDate: '2025-07-10' // Submitted 2+ weeks before the vacation
    },
    {
      id: 'REQ-20250115001',
      dates: [
        { day: 5, month: 0, year: 2025 },  // January 5
        { day: 6, month: 0, year: 2025 },  // January 6
        { day: 7, month: 0, year: 2025 },  // January 7
        { day: 8, month: 0, year: 2025 },  // January 8
        { day: 9, month: 0, year: 2025 },  // January 9
        { day: 10, month: 0, year: 2025 }, // January 10
        { day: 11, month: 0, year: 2025 }  // January 11
      ],
      absenceType: 'PTO (Vacation)',
      daysCount: 7,
      submittedDate: '2024-12-15' // Submitted well in advance
    }
  ]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    onConfirm: null
  });

  // This useEffect hook will run if 'submittedRequests', 'availableBalance', 'contactArrays', 'personalInfo', or 'legalNameData' change.
  useEffect(() => {
    window.app_state = {
      // A deep copy of the user's submitted vacation/PTO requests
      submittedRequests: JSON.parse(JSON.stringify(submittedRequests)),
      
      // A deep copy of the user's available time off balances
      availableBalance: JSON.parse(JSON.stringify(availableBalance)),
      
      // A deep copy of the user's structured contact info
      contactInformation: JSON.parse(JSON.stringify(contactArrays)),
      
      // A deep copy of the user's personal information
      personalInfo: JSON.parse(JSON.stringify(personalInfo)),
      
      // A deep copy of the user's legal name data
      legalNameData: JSON.parse(JSON.stringify(legalNameData))
    };
    // console.log('Workday state updated on window.app_state');
  }, [submittedRequests, availableBalance, contactArrays, personalInfo, legalNameData]);

  // Modal helper function
  const showModalAlert = (title, message, onConfirm = null) => {
    setModalContent({ title, message, onConfirm });
    setShowModal(true);
  };

  // Check if a date is already requested
  const isDateRequested = (day, month = viewingMonth, year = viewingYear) => {
    return submittedRequests.some(request => 
      request.dates.some(date => 
        date.day === day && date.month === month && date.year === year
      )
    );
  };

  // Get conflicting dates from current selection
  const getConflictingDates = () => {
    return Array.from(selectedDates).filter(day => 
      isDateRequested(day, viewingMonth, viewingYear)
    );
  };

  // Cancel/delete an absence request
  const cancelAbsenceRequest = (requestId) => {
    const requestToCancel = submittedRequests.find(req => req.id === requestId);
    if (!requestToCancel) return;

    // Restore balance based on absence type
    if (requestToCancel.absenceType.includes('PTO') || requestToCancel.absenceType.includes('Vacation')) {
      setAvailableBalance(prev => ({
        ...prev,
        statutoryPTO: prev.statutoryPTO + requestToCancel.daysCount
      }));
    } else if (requestToCancel.absenceType.includes('Volunteer')) {
      setAvailableBalance(prev => ({
        ...prev,
        volunteering: prev.volunteering + requestToCancel.daysCount
      }));
    }

    // Remove request from submitted requests
    setSubmittedRequests(prev => prev.filter(req => req.id !== requestId));

    // Show success modal
    showModalAlert(
      'Request Cancelled',
      `Absence request for ${requestToCancel.daysCount} day${requestToCancel.daysCount > 1 ? 's' : ''} has been cancelled successfully.`,
      null
    );
  };

  // Handle absence request submission
  const submitAbsenceRequest = () => {
    const daysRequested = selectedDates.size;
    const conflictingDates = getConflictingDates();
    
    // Check for date conflicts
    if (conflictingDates.length > 0) {
      showModalAlert(
        'Request Conflict',
        `The following dates are already requested: ${conflictingDates.join(', ')}. Please remove them from your selection.`,
        null
      );
      return;
    }

    // Check if sufficient balance
    const balanceNeeded = selectedAbsenceType.includes('PTO') || selectedAbsenceType.includes('Vacation') 
      ? availableBalance.statutoryPTO 
      : selectedAbsenceType.includes('Volunteer') 
        ? availableBalance.volunteering 
        : 999; // Other types don't check balance

    if (daysRequested > balanceNeeded && balanceNeeded !== 999) {
      showModalAlert(
        'Insufficient Balance',
        `You only have ${balanceNeeded} days available for this absence type. Please select fewer days.`,
        null
      );
      return;
    }
    
    // Create request record
    const newRequest = {
      id: `REQ-${Date.now()}`,
      dates: Array.from(selectedDates).map(day => ({
        day,
        month: viewingMonth,
        year: viewingYear
      })),
      absenceType: selectedAbsenceType,
      daysCount: daysRequested,
      submittedDate: new Date().toISOString().split('T')[0]
    };

    // Format the requested dates for the success message (before clearing state)
    const formatRequestedDates = () => {
      const sortedDates = Array.from(selectedDates).sort((a, b) => a - b);
      const monthName = getMonthName(viewingMonth);
      
      if (sortedDates.length === 1) {
        return `${sortedDates[0]} ${monthName} ${viewingYear}`;
      } else if (sortedDates.length === 2) {
        return `${sortedDates[0]} and ${sortedDates[1]} ${monthName} ${viewingYear}`;
      } else {
        // Check if dates are consecutive
        let isConsecutive = true;
        for (let i = 1; i < sortedDates.length; i++) {
          if (sortedDates[i] !== sortedDates[i-1] + 1) {
            isConsecutive = false;
            break;
          }
        }
        
        if (isConsecutive) {
          // Show as range: "3-5 August 2025"
          return `${sortedDates[0]}-${sortedDates[sortedDates.length - 1]} ${monthName} ${viewingYear}`;
        } else {
          // Show individual dates: "3, 5, 7 August 2025"
          return `${sortedDates.join(', ')} ${monthName} ${viewingYear}`;
        }
      }
    };

    const requestedDatesText = formatRequestedDates();
    const currentAbsenceType = selectedAbsenceType; // Store before clearing

    // Add to submitted requests
    setSubmittedRequests(prev => [...prev, newRequest]);
    
    // Update balance based on absence type
    if (selectedAbsenceType.includes('PTO') || selectedAbsenceType.includes('Vacation')) {
      setAvailableBalance(prev => ({
        ...prev,
        statutoryPTO: Math.max(0, prev.statutoryPTO - daysRequested)
      }));
    } else if (selectedAbsenceType.includes('Volunteer')) {
      setAvailableBalance(prev => ({
        ...prev,
        volunteering: Math.max(0, prev.volunteering - daysRequested)
      }));
    }
    
    // Clear form state
    setSelectedDates(new Set());
    setSelectedAbsenceType('');
    setComment('');
    
    // Show success modal and navigate
    showModalAlert(
      'Request Submitted',
      `Your ${currentAbsenceType} request for ${daysRequested} day${daysRequested > 1 ? 's' : ''} (${requestedDatesText}) has been submitted successfully!`,
      () => setCurrentView('absence-overview')
    );
  };

  // Helper functions for calendar
  const toggleDate = (day) => {
    console.log(`[TOGGLE] Day ${day}, current selectedDates: [${Array.from(selectedDates).join(', ')}]`);
    
    // Prevent selecting already requested dates
    if (isDateRequested(day, viewingMonth, viewingYear)) {
      showModalAlert(
        'Date Unavailable',
        `${day} ${getMonthName(viewingMonth)} ${viewingYear} is already requested and cannot be selected.`,
        null
      );
      return;
    }

    const newSelectedDates = new Set(selectedDates);
    if (newSelectedDates.has(day)) {
      console.log(`[TOGGLE] Removing day ${day}`);
      newSelectedDates.delete(day);
    } else {
      console.log(`[TOGGLE] Adding day ${day}`);
      newSelectedDates.add(day);
    }
    console.log(`[TOGGLE] New selectedDates: [${Array.from(newSelectedDates).join(', ')}]`);
    setSelectedDates(newSelectedDates);
  };

  const isDateSelected = (day) => selectedDates.has(day);

  const getSelectedCount = () => selectedDates.size;

  // Function to set the entire selection at once (for drag operations)
  const setSelection = (newSelection) => {
    console.log(`[SET_SELECTION] Setting selection to: [${Array.from(newSelection).join(', ')}]`);
    setSelectedDates(newSelection);
  };

  // Remove dates from request (for form table)
  const removeDateRange = (fromDate, toDate) => {
    const newSelectedDates = new Set(selectedDates);
    
    // Parse the date strings to get day numbers
    const fromDay = parseInt(fromDate.split('/')[1]);
    const toDay = parseInt(toDate.split('/')[1]);
    
    // Remove all days in the range
    for (let day = fromDay; day <= toDay; day++) {
      newSelectedDates.delete(day);
    }
    
    setSelectedDates(newSelectedDates);
  };

  // Absence types data
  const absenceTypes = [
    'Blood Donation Day',
    'Carer\'s Leave',
    'Child\'s Marriage',
    'Child Medical Check-up',
    'Marriage',
    'Medical Leave',
    'Parental Course',
    'Paternity',
    'PTO (Vacation)',
    'Time Off in Lieu',
    'Volunteer Time Off (VTO)'
  ];

  // Helper functions for modal
  const formatSelectedDates = () => {
    if (selectedDates.size === 0) return '';
    
    const sortedDates = Array.from(selectedDates).sort((a, b) => a - b);
    const dateStrings = sortedDates.map(day => {
      const date = new Date(2025, 7, day); // August 2025
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    });
    
    if (dateStrings.length === 1) {
      return dateStrings[0];
    } else if (dateStrings.length === 2) {
      return `${dateStrings[0]} - ${dateStrings[1]}`;
    } else {
      // For multiple non-consecutive dates, show range with last date separate
      const lastDate = dateStrings.pop();
      return `${dateStrings[0]} - ${dateStrings[dateStrings.length - 1]}\n${lastDate}`;
    }
  };

  const filteredAbsenceTypes = absenceTypes.filter(type =>
    type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Month navigation functions
  const navigateMonth = (direction) => {
    let newMonth = viewingMonth;
    let newYear = viewingYear;
    
    if (direction === 'prev') {
      newMonth -= 1;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
    }
    
    setViewingMonth(newMonth);
    setViewingYear(newYear);
    // Clear selections when changing months for simplicity
    setSelectedDates(new Set());
  };


  // Header Component
  const Header = () => (
    <div className="bg-orange-500 text-white px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold">
          Bridgepoint Financial
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell with count */}
          <div className="relative">
            <Bell className="w-6 h-6 text-white cursor-pointer hover:text-orange-200" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              1
            </span>
          </div>

          {/* Profile Icon */}
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-300">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  // App Tile Component
  const AppTile = ({ title, icon, onClick, disabled = false }) => (
    <div 
      className={`
        bg-white rounded-lg p-6 shadow-sm border border-gray-200 
        ${disabled 
          ? 'cursor-not-allowed opacity-50' 
          : 'cursor-pointer hover:shadow-md hover:border-orange-200 transition-all duration-200'
        }
      `}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${disabled ? 'bg-gray-100' : 'bg-orange-50'}
        `}>
          {icon === 'calendar' && (
            <Calendar className={`w-6 h-6 ${disabled ? 'text-gray-400' : 'text-orange-500'}`} />
          )}
          {icon === 'user' && (
            <User className={`w-6 h-6 ${disabled ? 'text-gray-400' : 'text-orange-500'}`} />
          )}
          {!icon && (
            <div className={`w-6 h-6 rounded ${disabled ? 'bg-gray-300' : 'bg-orange-300'}`} />
          )}
        </div>
        
        {/* Title */}
        <span className={`
          text-sm font-medium
          ${disabled ? 'text-gray-400' : 'text-gray-900'}
        `}>
          {title}
        </span>
      </div>
    </div>
  );

  // Dashboard View
  const Dashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Good Morning, George Ashford
          </h1>
          <p className="text-gray-600">
            It's Monday, August 4, 2025
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Can be expanded later */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Welcome to your workspace
              </h2>
              <p className="text-gray-600">
                Use the apps on the right to manage your work and time.
              </p>
            </div>
          </div>

          {/* Right Column - Your Top Apps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Your Top Apps
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Absence - Only clickable tile */}
                <AppTile 
                  title="Absence" 
                  icon="calendar"
                  onClick={() => setCurrentView('absence-overview')}
                />
                
                {/* Other tiles - disabled for demo */}
                <AppTile 
                  title="Onboarding" 
                  icon="user"
                  disabled={true}
                />
                
                <AppTile 
                  title="Performance" 
                  disabled={true}
                />
                
                <AppTile 
                  title="Personal Information" 
                  icon="user"
                  onClick={() => setCurrentView('personal-info')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Absence Overview View
  const AbsenceOverview = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-900">
              Absence
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Request Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Request
            </h2>
            
            <div className="space-y-3">
              <button 
                onClick={() => setCurrentView('calendar')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                Request Absence
              </button>
              
              <button 
                onClick={() => setCurrentView('correct-absence')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                Correct My Absence
              </button>
            </div>
          </div>

          {/* View Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              View
            </h2>
            
            <div className="space-y-3">
              <button 
                className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-lg text-sm font-medium cursor-not-allowed"
                disabled
              >
                Worker Absence Balance
              </button>
            </div>
          </div>
        </div>

        {/* Available Balance Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Available Balance as of Today
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Does not include future absence requests
          </p>

          {/* Available Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Available
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">
                  {availableBalance.statutoryPTO} Days - Statutory PTO
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">
                  {availableBalance.volunteering} Days - Volunteering
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
            <span>© 2025 Workday, Inc. All rights reserved.</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 max-w-4xl mx-auto">
            System Status: Your system will be unavailable for a maximum of 7 hours during the next Weekly Service Update and Monthly 
            Maintenance, starting on Friday, August 8, 2025 at 11:00 PM PDT (GMT-7) until Saturday, August 9, 2025 at 6:00 AM PDT (GMT-7).
          </p>
        </div>
      </div>
    </div>
  );

  // Absence Calendar View
  const AbsenceCalendar = () => {
    return (
      <div>
        {/* Back Button */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentView('absence-overview')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <CalendarComponent
          viewingMonth={viewingMonth}
          viewingYear={viewingYear}
          onNavigateMonth={navigateMonth}
          onToggleDate={toggleDate}
          onSetSelection={setSelection}
          isDateSelected={isDateSelected}
          isDateRequested={isDateRequested}
          isInteractive={true}
          showBalance={true}
          showInstructions={true}
          availableBalance={availableBalance}
        />

        {/* Bottom Action Button */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-center">
              <button 
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all
                  ${getSelectedCount() > 0 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
                disabled={getSelectedCount() === 0}
                onClick={() => getSelectedCount() > 0 ? setCurrentView('modal') : null}
              >
                {getSelectedCount() > 0 
                  ? `${getSelectedCount()} Days - Request Absence`
                  : 'Request Absence'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Absence Type Selection Modal
  const AbsenceTypeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Absence Type</h2>
          <button 
            onClick={() => setCurrentView('calendar')}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="text-gray-400 text-xl">×</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* When Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">When</label>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {formatSelectedDates()}
            </div>
          </div>

          {/* Type Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            
            <div className="relative">
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full text-left px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex items-center justify-between">
                  <span className={selectedAbsenceType ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedAbsenceType || 'Select absence type...'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">☰</span>
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {/* Search Field */}
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Options List */}
                  <div className="py-1">
                    {filteredAbsenceTypes.length > 0 ? (
                      filteredAbsenceTypes.map((type, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSelectedAbsenceType(type);
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center space-x-3"
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedAbsenceType === type 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {selectedAbsenceType === type && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="text-sm text-gray-700">{type}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No matching types found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button 
            onClick={() => setCurrentView('calendar')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => selectedAbsenceType ? setCurrentView('form') : null}
            disabled={!selectedAbsenceType}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedAbsenceType
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  // Request Absence Form View
  const RequestForm = () => {
    // Generate request rows from selected dates
    const generateRequestRows = () => {
      if (selectedDates.size === 0) return [];
      
      const sortedDates = Array.from(selectedDates).sort((a, b) => a - b);
      const rows = [];
      
      // Group consecutive dates
      let currentGroup = [sortedDates[0]];
      
      for (let i = 1; i < sortedDates.length; i++) {
        if (sortedDates[i] === sortedDates[i-1] + 1) {
          currentGroup.push(sortedDates[i]);
        } else {
          // End current group and start new one
          rows.push(currentGroup);
          currentGroup = [sortedDates[i]];
        }
      }
      rows.push(currentGroup); // Add the last group
      
      return rows.map(group => ({
        fromDate: `08/${group[0].toString().padStart(2, '0')}/2025`,
        toDate: `08/${group[group.length - 1].toString().padStart(2, '0')}/2025`,
        type: selectedAbsenceType,
        quantityPerDay: '1 day',
        total: `${group.length} day${group.length > 1 ? 's' : ''}`
      }));
    };

    const requestRows = generateRequestRows();
    const totalDays = selectedDates.size;

    // If no dates left, redirect back to calendar
    if (totalDays === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No dates selected
            </h2>
            <p className="text-gray-600 mb-4">
              Please select dates to continue with your absence request.
            </p>
            <button 
              onClick={() => setCurrentView('calendar')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Calendar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setCurrentView('modal')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Request Absence
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    George Ashford
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Documentation Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="text-sm text-gray-700 space-y-2">
              <p className="font-medium mb-4">Please note that you need attachments added to your request, for the following Time Off types:</p>
              
              <div className="space-y-1">
                <p><strong>1. Adoption Procedure</strong> - please attach a copy of the "Adoption Documents Proof" to your request.</p>
                <p><strong>2. Bereavement</strong> - please attach a copy of the "Bereavement Certificate" to your request.</p>
                <p><strong>3. Blood Donation</strong> - please attach a copy of the medical document to your request.</p>
                <p><strong>4. Carer's Leave</strong> - Please refer to the following link to determine if you meet the necessary criteria. If you are eligible for this request, please attach "Carer's Leave - Proof of Relation" and "Carer's Leave - Medical Proof" for the family member you are helping.</p>
                <p><strong>5. Child Medical Check-up</strong> - please attach a copy of the "Medical/Sick Certificate" to your request.</p>
                <p><strong>6. IVF</strong> - please attach a copy of the medical document marked as "Maternity Documents Proof" to your request.</p>
                <p><strong>7. Marriage</strong> - please attach a copy of the "Marriage Certificate" to your request.</p>
                <p><strong>8. Maternity Check-up</strong> - please attach a copy of the "Medical/Sick Certificate" to your request.</p>
                <p><strong>9. Medical Leave</strong> - please attach a copy of your "Medical/Sick Certificate" (Dr. Concodu Medical) to your request and send the original document to your Payroll Partner.</p>
                <p><strong>10. Parental Course</strong> - please attach a copy of the "Parental Course Certificate" to your request.</p>
                <p><strong>11. Paternity</strong> - please attach a copy of the "Birth Certificate Proof" to your request.</p>
                <p><strong>12. Volunteering Time Off</strong> - please attach documentation to confirm your volunteering event enrollment, along with the NGO name and a short description in the allocated space.</p>
              </div>
              
              <p className="mt-4 text-xs text-gray-600">
                All these requests and documents will be approved by the People Services team. Your manager will only be notified about your submitted request.
              </p>
            </div>
          </div>

          {/* Request Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Total: {totalDays} days - {selectedAbsenceType}
              </h3>
            </div>

            {/* Request Table */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">
                  Request: {requestRows.length} items
                </div>
                <button
                  onClick={() => setCurrentView('calendar')}
                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  title="Add more dates"
                >
                  <span className="text-gray-500 text-sm">+</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-16">
                        
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        *From
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        *To
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        *Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Quantity per Day
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requestRows.map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeDateRange(row.fromDate, row.toDate)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            title="Remove this date range"
                          >
                            <span className="text-gray-500 text-sm">−</span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.fromDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.toDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.quantityPerDay}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="enter your comment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <div className="space-y-4">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-600">Drop files here</p>
                  <p className="text-sm text-gray-500">or</p>
                  <button className="mt-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Select files
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setCurrentView('modal')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={submitAbsenceRequest}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Personal Information View
  const PersonalInformation = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-900">
              Personal Information
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Change Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Change
            </h2>
            
            <div className="space-y-3">
              <button 
                onClick={() => setCurrentView('my-contact-info')}
                className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Contact Information</span>
              </button>
              
               <button 
                 onClick={() => setCurrentView('personal-info-detail')}
                 className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors"
               >
                 <span className="text-sm font-medium text-gray-700">Personal Information</span>
               </button>
              
              <button className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-700">Photo</span>
              </button>
              
              <button 
                onClick={() => setShowLegalNameModal(true)}
                className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Legal Name</span>
              </button>
              
              <button className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-700">Preferred Name</span>
              </button>
            </div>
          </div>

          {/* View Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              View
            </h2>
            
            <div className="space-y-3">
              <button className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-700">About Me</span>
              </button>
              
              <button className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-700">Addresses</span>
              </button>
              
              <button className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-700">Email Addresses</span>
              </button>
              
              <button className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-700">Address Changes</span>
              </button>
              
              <button className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-700">Name</span>
              </button>
              
              <button className="w-full text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-3 rounded-lg transition-colors">
                <span className="text-sm font-medium">More (2)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
            <span>© 2025 Workday, Inc. All rights reserved.</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 max-w-4xl mx-auto">
            System Status: Your system will be unavailable for a maximum of 7 hours during the next Weekly Service Update and Monthly 
            Maintenance, starting on Friday, August 8, 2025 at 11:00 PM PDT (GMT-7) until Saturday, August 9, 2025 at 6:00 AM PDT (GMT-7).
          </p>
        </div>
      </div>
    </div>
   );

  // Primary Nationality Selector Component
  const PrimaryNationalitySelector = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    selectedValue = "Romania",
    isInModal = false
  }) => {
    const [currentLevel, setCurrentLevel] = useState('main'); // 'main', 'frequentlyUsed', 'all', 'byLetter'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLetter, setSelectedLetter] = useState('');

    const frequentlyUsedCountries = [
      "Canada",
      "United Kingdom", 
      "United States of America"
    ];

    const countries = [
      "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", 
      "Anguilla", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", 
      "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", 
      "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", 
      "Brazil", "British Indian Ocean Territory", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", 
      "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", 
      "Chad", "Chile", "China", "Christmas Island", "Cocos Islands", "Colombia", "Comoros", "Congo", 
      "Cook Islands", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", 
      "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", 
      "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", 
      "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", 
      "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", 
      "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", 
      "Heard Island and McDonald Islands", "Holy See", "Honduras", "Hong Kong", "Hungary", "Iceland", 
      "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", 
      "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", 
      "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", 
      "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", 
      "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", 
      "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", 
      "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", 
      "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", 
      "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", 
      "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", 
      "Romania", "Russian Federation", "Rwanda", "Réunion", "Saint Barthélemy", "Saint Helena", "Saint Kitts and Nevis", 
      "Saint Lucia", "Saint Martin", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", 
      "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", 
      "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
      "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", 
      "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan", 
      "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", 
      "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", 
      "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", 
      "Venezuela", "Viet Nam", "Virgin Islands, British", "Virgin Islands, U.S.", "Wallis and Futuna", 
      "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
    ];

    const letters = ['A', 'Å', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    const handleSelect = (value) => {
      onSelect(value);
      onClose();
    };

    const handleLetterSelect = (letter) => {
      setSelectedLetter(letter);
      setCurrentLevel('byLetter');
    };

    const handleRemove = () => {
      onSelect('');
    };

    const getCountriesByLetter = (letter) => {
      return countries.filter(country => {
        const firstChar = country.charAt(0).toUpperCase();
        return firstChar === letter || (letter === 'Å' && firstChar === 'Å');
      });
    };

    if (!isOpen) return null;

    return (
      <div className={`absolute ${isInModal ? 'top-full left-0 mt-1' : 'bottom-full left-0 mb-1'} bg-white border-2 border-blue-500 rounded-lg shadow-lg z-50 w-80 ${isInModal ? 'max-h-64 overflow-y-auto' : ''}`} data-component="PrimaryNationalitySelector">
        {/* Main Menu */}
        {currentLevel === 'main' && (
          <div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center justify-between"
                     onClick={() => setCurrentLevel('frequentlyUsed')}>
                  <span>Frequently Used</span>
                  <span>›</span>
                </div>
                <div className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center justify-between"
                     onClick={() => setCurrentLevel('all')}>
                  <span>All</span>
                  <span>›</span>
                </div>
                <div className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center justify-between"
                     onClick={() => setCurrentLevel('byLetter')}>
                  <span>By Country Alphabetically</span>
                  <span>›</span>
                </div>
              </div>
              <div className="border-t border-gray-200 my-3"></div>
              <div className="mb-3">
                <input 
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selectedValue && (
                <div className="flex items-center space-x-2">
                  <button onClick={handleRemove} className="text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full">{selectedValue}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Frequently Used Menu */}
        {currentLevel === 'frequentlyUsed' && (
          <div>
            <div className="bg-gray-100 text-gray-700 p-3 flex items-center justify-between">
              <span>Frequently Used</span>
              <button onClick={() => setCurrentLevel('main')} className="text-gray-700 hover:text-gray-900">
                ←
              </button>
            </div>
            <div className="p-4">
              {frequentlyUsedCountries.map((country) => (
                <div key={country} 
                     className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center"
                     onClick={() => handleSelect(country)}>
                  <div className="w-4 h-4 border border-gray-300 rounded-full mr-3"></div>
                  <span>{country}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 my-3"></div>
              <div className="mb-3">
                <input 
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selectedValue && (
                <div className="flex items-center space-x-2">
                  <button onClick={handleRemove} className="text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full">{selectedValue}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Countries Menu */}
        {currentLevel === 'all' && (
          <div>
            <div className="bg-gray-100 text-gray-700 p-3 flex items-center justify-between">
              <span>All</span>
              <button onClick={() => setCurrentLevel('main')} className="text-gray-700 hover:text-gray-900">
                ←
              </button>
            </div>
            <div className="p-4">
              <div className="max-h-60 overflow-y-auto">
                {countries
                  .filter(country => country.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((country) => (
                    <div key={country} 
                         className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center"
                         onClick={() => handleSelect(country)}>
                      <div className={`w-4 h-4 border border-gray-300 rounded-full mr-3 ${selectedValue === country ? 'bg-blue-500 border-blue-500' : ''}`}>
                        {selectedValue === country && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                      </div>
                      <span>{country}</span>
                    </div>
                  ))}
              </div>
              <div className="border-t border-gray-200 my-3"></div>
              <div className="mb-3">
                <input 
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selectedValue && (
                <div className="flex items-center space-x-2">
                  <button onClick={handleRemove} className="text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full">{selectedValue}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* By Letter Menu */}
        {currentLevel === 'byLetter' && !selectedLetter && (
          <div>
            <div className="bg-gray-100 text-gray-700 p-3 flex items-center justify-between">
              <span>By Country Alphabetically</span>
              <button onClick={() => setCurrentLevel('main')} className="text-gray-700 hover:text-gray-900">
                ←
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-1">
                {letters.map((letter) => (
                  <div key={letter} 
                       className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center justify-between"
                       onClick={() => handleLetterSelect(letter)}>
                    <span>{letter}</span>
                    <span>›</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 my-3"></div>
              <div className="mb-3">
                <input 
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selectedValue && (
                <div className="flex items-center space-x-2">
                  <button onClick={handleRemove} className="text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full">{selectedValue}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Countries by Letter */}
        {currentLevel === 'byLetter' && selectedLetter && (
          <div>
            <div className="bg-gray-100 text-gray-700 p-3 flex items-center justify-between">
              <span>{selectedLetter}</span>
              <button onClick={() => setSelectedLetter('')} className="text-gray-700 hover:text-gray-900">
                ←
              </button>
            </div>
            <div className="p-4">
              <div className="max-h-60 overflow-y-auto">
                {getCountriesByLetter(selectedLetter)
                  .filter(country => country.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((country) => (
                    <div key={country} 
                         className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center"
                         onClick={() => handleSelect(country)}>
                      <div className={`w-4 h-4 border border-gray-300 rounded-full mr-3 ${selectedValue === country ? 'bg-blue-500 border-blue-500' : ''}`}>
                        {selectedValue === country && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                      </div>
                      <span>{country}</span>
                    </div>
                  ))}
              </div>
              <div className="border-t border-gray-200 my-3"></div>
              <div className="mb-3">
                <input 
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selectedValue && (
                <div className="flex items-center space-x-2">
                  <button onClick={handleRemove} className="text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full">{selectedValue}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Citizenship Status Selector Component
  const CitizenshipStatusSelector = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    selectedValue = "Citizen (Romania)" 
  }) => {
    const [currentLevel, setCurrentLevel] = useState('main'); // 'main', 'recommended', 'byCountry', 'countryStatus'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');

    const recommendedOptions = [
      "Citizen (Romania)",
      "Permanent Resident",
      "Temporary Resident",
      "Non-Resident"
    ];

    const countries = [
      "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", 
      "Anguilla", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", 
      "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", 
      "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", 
      "Brazil", "British Indian Ocean Territory", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", 
      "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", 
      "Chad", "Chile", "China", "Christmas Island", "Cocos Islands", "Colombia", "Comoros", "Congo", 
      "Cook Islands", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", 
      "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", 
      "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", 
      "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", 
      "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", 
      "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", 
      "Heard Island and McDonald Islands", "Holy See", "Honduras", "Hong Kong", "Hungary", "Iceland", 
      "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", 
      "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", 
      "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", 
      "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", 
      "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", 
      "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", 
      "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", 
      "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", 
      "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", 
      "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", 
      "Romania", "Russian Federation", "Rwanda", "Réunion", "Saint Barthélemy", "Saint Helena", "Saint Kitts and Nevis", 
      "Saint Lucia", "Saint Martin", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", 
      "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", 
      "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
      "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", 
      "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan", 
      "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", 
      "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", 
      "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", 
      "Venezuela", "Viet Nam", "Virgin Islands, British", "Virgin Islands, U.S.", "Wallis and Futuna", 
      "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
    ];

    const getCountryStatusOptions = (country) => [
      `Citizen (${country})`,
      `Non-citizen (${country})`
    ];

    const handleSelect = (value) => {
      onSelect(value);
      onClose();
    };

    const handleCountrySelect = (country) => {
      setSelectedCountry(country);
      setCurrentLevel('countryStatus');
    };

    const handleRemove = () => {
      onSelect('');
    };

    if (!isOpen) return null;

    return (
      <div className="absolute top-full left-0 mt-1 bg-white border-2 border-blue-500 rounded-lg shadow-lg z-50 w-80" data-component="CitizenshipStatusSelector">
        {/* Main Menu */}
        {currentLevel === 'main' && (
          <div>
            <div className="p-4">
              <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-lg mb-2 cursor-pointer hover:bg-blue-700"
                   onClick={() => setCurrentLevel('recommended')}>
                <span>Recommended</span>
                <span>›</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200"
                   onClick={() => setCurrentLevel('byCountry')}>
                <span>By Country</span>
                <span>›</span>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Menu */}
        {currentLevel === 'recommended' && (
          <div>
            <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
              <span>Recommended</span>
              <button onClick={() => setCurrentLevel('main')} className="text-white hover:text-gray-200">
                ←
              </button>
            </div>
            <div className="p-4">
              {recommendedOptions.map((option) => (
                <div key={option} 
                     className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                     onClick={() => handleSelect(option)}>
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Country Menu */}
        {currentLevel === 'byCountry' && (
          <div>
            <div className="bg-gray-100 text-gray-700 p-3 flex items-center justify-between">
              <span>By Country</span>
              <button onClick={() => setCurrentLevel('main')} className="text-gray-700 hover:text-gray-900">
                ←
              </button>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <input 
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {countries
                  .filter(country => country.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((country) => (
                    <div key={country} 
                         className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center justify-between"
                         onClick={() => handleCountrySelect(country)}>
                      <span>{country}</span>
                      <span>›</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Country Status Menu */}
        {currentLevel === 'countryStatus' && (
          <div>
            <div className="bg-gray-100 text-gray-700 p-3 flex items-center justify-between">
              <span>{selectedCountry}</span>
              <button onClick={() => setCurrentLevel('byCountry')} className="text-gray-700 hover:text-gray-900">
                ←
              </button>
            </div>
            <div className="p-4">
              {getCountryStatusOptions(selectedCountry).map((option) => (
                <div key={option} 
                     className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                     onClick={() => handleSelect(option)}>
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Date Picker Component
  const DatePicker = ({ 
    isOpen, 
    onClose, 
    onDateSelect, 
    initialMonth = 5, 
    initialYear = 1975,
    selectedDay = null 
  }) => {
    const [currentMonth, setCurrentMonth] = useState(initialMonth);
    const [currentYear, setCurrentYear] = useState(initialYear);
    const [selectedDate, setSelectedDate] = useState(selectedDay);

    const navigateMonth = (direction) => {
      let newMonth, newYear;
      
      if (direction === 'prev') {
        if (currentMonth === 0) {
          newMonth = 11;
          newYear = currentYear - 1;
        } else {
          newMonth = currentMonth - 1;
          newYear = currentYear;
        }
      } else {
        if (currentMonth === 11) {
          newMonth = 0;
          newYear = currentYear + 1;
        } else {
          newMonth = currentMonth + 1;
          newYear = currentYear;
        }
      }
      
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
      
      // Only restore original selection if returning to the initial month/year
      if (newMonth === initialMonth && newYear === initialYear) {
        setSelectedDate(selectedDay);
      } else {
        setSelectedDate(null);
      }
    };

    const generateDays = (month, year) => {
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      const days = [];
      
      // Add previous month's days (grayed out)
      for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
          day: daysInPrevMonth - i,
          isCurrentMonth: false,
          isPrevMonth: true
        });
      }
      
      // Add current month's days
      for (let day = 1; day <= daysInMonth; day++) {
        days.push({
          day: day,
          isCurrentMonth: true,
          isPrevMonth: false
        });
      }
      
      // Add next month's days to fill the grid (grayed out)
      const remainingCells = 42 - days.length; // 6 rows * 7 days = 42
      for (let day = 1; day <= remainingCells; day++) {
        days.push({
          day: day,
          isCurrentMonth: false,
          isPrevMonth: false
        });
      }
      
      return days;
    };

    const handleDateClick = (day, isCurrentMonth) => {
      if (isCurrentMonth) {
        setSelectedDate(day);
        onDateSelect(day, currentMonth, currentYear);
        onClose();
      }
    };

    if (!isOpen) return null;

    return (
      <div className="absolute top-0 left-[420px] bg-white border-2 border-blue-500 rounded-lg shadow-lg z-50" data-component="DatePicker">
        {/* Calendar Header */}
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-blue-700 rounded-full"
          >
            ←
          </button>
          <span className="font-medium">
            {getMonthName(currentMonth)} {currentYear}
          </span>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-blue-700 rounded-full"
          >
            →
          </button>
        </div>
        
        {/* Days of Week Header */}
        <div className="bg-blue-600 text-white px-4 py-1 text-sm">
          <div className="grid grid-cols-7 gap-1 text-center">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {generateDays(currentMonth, currentYear).map((dayObj, index) => (
              <div key={index} className="text-center">
                <button
                  onClick={() => handleDateClick(dayObj.day, dayObj.isCurrentMonth)}
                  disabled={!dayObj.isCurrentMonth}
                  className={`w-8 h-8 rounded-full text-sm transition-colors ${
                    dayObj.isCurrentMonth
                      ? dayObj.day === selectedDate
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-blue-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {dayObj.day}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Change Legal Name Modal Component
  const ChangeLegalNameModal = ({ isOpen, onClose, legalNameData, setLegalNameData }) => {
    const [formData, setFormData] = useState(legalNameData);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCountrySelector, setShowCountrySelector] = useState(false);
    const [datePickerMonth, setDatePickerMonth] = useState(8); // September (0-indexed)
    const [datePickerYear, setDatePickerYear] = useState(2025);

    // Sync form data when modal opens
    useEffect(() => {
      if (isOpen) {
        setFormData(legalNameData);
      }
    }, [isOpen, legalNameData]);

    const handleInputChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateSelect = (day, month, year) => {
      const monthIndexed = month + 1; // Convert to 1-indexed
      const formattedDate = `${monthIndexed.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
      handleInputChange('effectiveDate', formattedDate);
      setShowDatePicker(false);
    };

    const handleCountrySelect = (value) => {
      handleInputChange('country', value);
      setShowCountrySelector(false);
    };

    const handleSubmit = () => {
      // Update the shared state
      setLegalNameData(formData);
      console.log('Legal name change submitted:', formData);
      onClose();
    };

    const handleSaveForLater = () => {
      // Update the shared state
      setLegalNameData(formData);
      console.log('Legal name change saved for later:', formData);
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Change My Legal Name</h2>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Horia Cristescu</span>
              <button className="text-gray-400 hover:text-gray-600">
                ⋯
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.effectiveDate}
                  onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                >
                  📅
                </button>
                {showDatePicker && (
                  <DatePicker
                    isOpen={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    onDateSelect={handleDateSelect}
                    initialMonth={datePickerMonth}
                    initialYear={datePickerYear}
                    selectedDay={10}
                  />
                )}
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="w-full border border-gray-300 rounded-md p-2 min-h-[40px] flex items-center">
                  {formData.country ? (
                    <div className="flex items-center space-x-2 w-full">
                      <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full flex items-center space-x-2">
                        <button
                          onClick={() => handleCountrySelect('')}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                        <span>{formData.country}</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Search"
                        className="flex-1 border-none outline-none bg-transparent"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Search"
                      className="flex-1 border-none outline-none bg-transparent"
                    />
                  )}
                  <button
                    onClick={() => setShowCountrySelector(!showCountrySelector)}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                    style={{ marginLeft: '-20px' }}
                  >
                    ☰
                  </button>
                </div>
                
                {showCountrySelector && (
                  <PrimaryNationalitySelector
                    isOpen={showCountrySelector}
                    onClose={() => setShowCountrySelector(false)}
                    onSelect={handleCountrySelect}
                    selectedValue={formData.country}
                    isInModal={true}
                  />
                )}
              </div>
            </div>

            {/* Given Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Given Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.givenName}
                onChange={(e) => handleInputChange('givenName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Family Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.familyName}
                onChange={(e) => handleInputChange('familyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Comment */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500">☁️</span>
                <label className="text-sm text-gray-500">enter your comment</label>
              </div>
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your comment here..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveForLater}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Save for Later
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Personal Information Detail View
  const PersonalInformationDetail = ({ personalInfo, setPersonalInfo }) => {

    const [editingField, setEditingField] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showMaritalDatePicker, setShowMaritalDatePicker] = useState(false);
    const [showCitizenshipSelector, setShowCitizenshipSelector] = useState(false);
    const [showNationalitySelector, setShowNationalitySelector] = useState(false);
    const [datePickerMonth, setDatePickerMonth] = useState(5); // June (0-indexed)
    const [datePickerYear, setDatePickerYear] = useState(1975);
    const [maritalDatePickerMonth, setMaritalDatePickerMonth] = useState(new Date().getMonth());
    const [maritalDatePickerYear, setMaritalDatePickerYear] = useState(new Date().getFullYear());

    // Click outside to close dropdowns
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (showDatePicker || showMaritalDatePicker || showCitizenshipSelector || showNationalitySelector) {
          const target = event.target;
          const isDatePicker = target.closest('.date-picker-container') || target.closest('[data-component="DatePicker"]');
          const isCitizenshipSelector = target.closest('.citizenship-selector-container') || target.closest('[data-component="CitizenshipStatusSelector"]');
          const isNationalitySelector = target.closest('.nationality-selector-container') || target.closest('[data-component="PrimaryNationalitySelector"]');
          
          if (!isDatePicker && !isCitizenshipSelector && !isNationalitySelector) {
            setShowDatePicker(false);
            setShowMaritalDatePicker(false);
            setShowCitizenshipSelector(false);
            setShowNationalitySelector(false);
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showDatePicker, showMaritalDatePicker, showCitizenshipSelector, showNationalitySelector]);

    const handleEdit = (field) => {
      setEditingField(field);
      if (field === 'dateOfBirth') {
        setShowDatePicker(true);
      } else if (field === 'maritalStatusDate') {
        setShowMaritalDatePicker(true);
      } else if (field === 'citizenshipStatus') {
        setShowCitizenshipSelector(true);
      }
    };

    const handleSave = () => {
      setEditingField(null);
      setShowDatePicker(false);
      setShowMaritalDatePicker(false);
      setShowCitizenshipSelector(false);
      // Here you would typically save to backend
    };

    const handleCancel = () => {
      setEditingField(null);
      setShowDatePicker(false);
      setShowMaritalDatePicker(false);
      setShowCitizenshipSelector(false);
    };

    const calculateAge = (dateOfBirth) => {
      const [month, day, year] = dateOfBirth.split('/').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();
      
      if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
      }
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      return `${years} years, ${months} months, ${days} days`;
    };

    const handleDateSelect = (day, month, year) => {
      const monthIndexed = month + 1; // Convert to 1-indexed
      const formattedDate = `${monthIndexed.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
      const newAge = calculateAge(formattedDate);
      setPersonalInfo({...personalInfo, dateOfBirth: formattedDate, age: newAge});
      setShowDatePicker(false);
      setEditingField(null);
    };

    const handleMaritalDateSelect = (day, month, year) => {
      const monthIndexed = month + 1; // Convert to 1-indexed
      const formattedDate = `${monthIndexed.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
      setPersonalInfo({...personalInfo, maritalStatusDate: formattedDate});
      setShowMaritalDatePicker(false);
      setEditingField(null);
    };

    const handleCitizenshipSelect = (value) => {
      setPersonalInfo({...personalInfo, citizenshipStatus: value});
      setShowCitizenshipSelector(false);
      setEditingField(null);
    };

    const handleNationalitySelect = (value) => {
      setPersonalInfo({...personalInfo, nationality: value});
      setShowNationalitySelector(false);
      setEditingField(null);
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button 
                onClick={() => setCurrentView('personal-info')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Title */}
              <h1 className="text-2xl font-semibold text-gray-900">
                Change Personal Information
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Gender Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Gender</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                {editingField === 'gender' ? (
                  <div className="flex items-center space-x-4">
                    <select 
                      value={personalInfo.gender}
                      onChange={(e) => setPersonalInfo({...personalInfo, gender: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <button 
                      onClick={handleSave}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      ✓
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      style={{ fontFamily: 'sans-serif' }}
                    >
                      ↩
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{personalInfo.gender}</span>
                    <button 
                      onClick={() => handleEdit('gender')}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date of Birth Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 relative">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Date of Birth</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                {editingField === 'dateOfBirth' ? (
                  <div className="flex items-center space-x-4 relative">
                    <div className="relative">
                      <input 
                        type="text"
                        value={personalInfo.dateOfBirth}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          const newAge = calculateAge(newDate);
                          setPersonalInfo({...personalInfo, dateOfBirth: newDate, age: newAge});
                        }}
                        className="px-3 py-2 pr-10 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="MM/DD/YYYY"
                      />
                      <button 
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                      >
                        📅
                      </button>
                    </div>
                    <button 
                      onClick={handleSave}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      ✓
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      style={{ fontFamily: 'sans-serif' }}
                    >
                      ↩
                    </button>
                    
                    {/* Date Picker Calendar */}
                    <DatePicker
                      isOpen={showDatePicker}
                      onClose={() => setShowDatePicker(false)}
                      onDateSelect={handleDateSelect}
                      initialMonth={datePickerMonth}
                      initialYear={datePickerYear}
                      selectedDay={7} // Day 7 should be pre-selected for 06/07/1975
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{personalInfo.dateOfBirth}</span>
                    <button 
                      onClick={() => handleEdit('dateOfBirth')}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <span className="text-gray-900">{personalInfo.age}</span>
              </div>
            </div>
          </div>

          {/* Marital Status Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Marital Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                {editingField === 'maritalStatus' ? (
                  <div className="flex items-center space-x-4">
                    <select 
                      value={personalInfo.maritalStatus}
                      onChange={(e) => setPersonalInfo({...personalInfo, maritalStatus: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select...</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                    <button 
                      onClick={handleSave}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      ✓
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      style={{ fontFamily: 'sans-serif' }}
                    >
                      ↩
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{personalInfo.maritalStatus || 'Not specified'}</span>
                    <button 
                      onClick={() => handleEdit('maritalStatus')}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status Date</label>
                {editingField === 'maritalStatusDate' ? (
                  <div className="flex items-center space-x-4 relative">
                    <div className="relative">
                      <input 
                        type="text"
                        value={personalInfo.maritalStatusDate}
                        onChange={(e) => setPersonalInfo({...personalInfo, maritalStatusDate: e.target.value})}
                        className="px-3 py-2 pr-10 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="MM/DD/YYYY"
                      />
                      <button 
                        onClick={() => setShowMaritalDatePicker(!showMaritalDatePicker)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                      >
                        📅
                      </button>
                    </div>
                    <button 
                      onClick={handleSave}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      ✓
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      style={{ fontFamily: 'sans-serif' }}
                    >
                      ↩
                    </button>
                    
                    {/* Marital Status Date Picker Calendar */}
                    <DatePicker
                      isOpen={showMaritalDatePicker}
                      onClose={() => setShowMaritalDatePicker(false)}
                      onDateSelect={handleMaritalDateSelect}
                      initialMonth={maritalDatePickerMonth}
                      initialYear={maritalDatePickerYear}
                      selectedDay={null}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{personalInfo.maritalStatusDate || 'Not specified'}</span>
                    <button 
                      onClick={() => handleEdit('maritalStatusDate')}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Citizenship Status Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Citizenship Status</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Citizenship Status <span className="text-red-500">*</span>
              </label>
              {editingField === 'citizenshipStatus' ? (
                <div className="flex items-center space-x-4 relative">
                  <div className="citizenship-selector-container w-96 border-2 border-blue-500 rounded-md p-2 min-h-[40px] flex items-center">
                    {personalInfo.citizenshipStatus ? (
                      <div className="flex items-center space-x-2 w-full">
                        <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full flex items-center space-x-2">
                          <button 
                            onClick={() => handleCitizenshipSelect('')}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                          <span>{personalInfo.citizenshipStatus}</span>
                        </div>
                        <input 
                          type="text"
                          placeholder="Search"
                          className="flex-1 border-none outline-none bg-transparent"
                        />
                      </div>
                    ) : (
                      <input 
                        type="text"
                        placeholder="Search"
                        className="flex-1 border-none outline-none bg-transparent"
                      />
                    )}
                    <button 
                      onClick={() => setShowCitizenshipSelector(!showCitizenshipSelector)}
                      className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                      style={{ marginLeft: '-20px' }}
                    >
                      ☰
                    </button>
                  </div>
                  
                  {/* Citizenship Status Selector */}
                  <CitizenshipStatusSelector
                    isOpen={showCitizenshipSelector}
                    onClose={() => setShowCitizenshipSelector(false)}
                    onSelect={handleCitizenshipSelect}
                    selectedValue={personalInfo.citizenshipStatus}
                  />
                  <button 
                    onClick={handleSave}
                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                  >
                    ✓
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    style={{ fontFamily: 'sans-serif' }}
                  >
                    ↩
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{personalInfo.citizenshipStatus}</span>
                  <button 
                    onClick={() => handleEdit('citizenshipStatus')}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Nationality Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Nationality</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Nationality <span className="text-red-500">*</span>
              </label>
              {editingField === 'nationality' ? (
                <div className="flex items-center space-x-4 relative">
                  <div className="nationality-selector-container w-96 border-2 border-blue-500 rounded-md p-2 min-h-[40px] flex items-center">
                    {personalInfo.nationality ? (
                      <div className="flex items-center space-x-2 w-full">
                        <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full flex items-center space-x-2">
                          <button
                            onClick={() => handleNationalitySelect('')}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                          <span>{personalInfo.nationality}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Search"
                          className="flex-1 border-none outline-none bg-transparent"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Search"
                        className="flex-1 border-none outline-none bg-transparent"
                      />
                    )}
                    <button
                      onClick={() => setShowNationalitySelector(!showNationalitySelector)}
                      className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                      style={{ marginLeft: '-20px' }}
                    >
                      ☰
                    </button>
                  </div>
                  
                  {/* Primary Nationality Selector */}
                  <PrimaryNationalitySelector
                    isOpen={showNationalitySelector}
                    onClose={() => setShowNationalitySelector(false)}
                    onSelect={handleNationalitySelect}
                    selectedValue={personalInfo.nationality}
                  />
                  <button 
                    onClick={handleSave}
                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                  >
                    ✓
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    style={{ fontFamily: 'sans-serif' }}
                  >
                    ↩
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{personalInfo.nationality}</span>
                  <button 
                    onClick={() => handleEdit('nationality')}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // My Contact Information View (View-Only)
  const MyContactInformation = () => {
    const { addresses, phones, emails } = contactArrays;
    
    return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentView('personal-info')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  My Contact Information
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  George Ashford
                </p>
              </div>
            </div>
            <button 
              onClick={() => setCurrentView('change-contact-info')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Home Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Home Contact Information
          </h2>
          
          {/* Addresses Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Addresses</h3>
              <span className="text-xs text-gray-500">{addresses.length} item{addresses.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shared With
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Effective Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {addresses.map((address) => (
                    <tr key={address.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {address.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {address.usage} {address.isPrimary && '(Primary)'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{address.visibility}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                      <td className="px-4 py-3 text-sm text-gray-900">01/01/1980</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Email Addresses Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Email Addresses</h3>
              <span className="text-xs text-gray-500">{emails.length} item{emails.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emails.map((email) => (
                    <tr key={email.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {email.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {email.usage} {email.isPrimary && '(Primary)'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{email.visibility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phones Section */}
          {phones.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Phone Numbers</h3>
                <span className="text-xs text-gray-500">{phones.length} item{phones.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visibility
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {phones.map((phone) => (
                      <tr key={phone.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {phone.number}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {phone.usage} {phone.isPrimary && '(Primary)'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{phone.visibility}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
    );
  };

  // Correct My Absence View
  const CorrectMyAbsence = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button 
              onClick={() => setCurrentView('absence-overview')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-900">
              Correct My Absence
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {submittedRequests.length === 0 ? (
          // No requests state
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              No Absence Requests
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have any submitted absence requests to correct.
            </p>
            <button 
              onClick={() => setCurrentView('calendar')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Request Absence
            </button>
          </div>
        ) : (
          // Requests list
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Your Submitted Requests
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                You can cancel any of your submitted absence requests below. Cancelled requests will restore your available balance.
              </p>

              <div className="space-y-4">
                {submittedRequests.map((request) => {
                  const startDate = request.dates[0];
                  const endDate = request.dates[request.dates.length - 1];
                  const isSingleDay = request.dates.length === 1;
                  
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {request.absenceType}
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {request.daysCount} day{request.daysCount > 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <strong>Dates:</strong> {' '}
                              {isSingleDay ? (
                                `${startDate.day} ${getMonthName(startDate.month)} ${startDate.year}`
                              ) : (
                                `${startDate.day} ${getMonthName(startDate.month)} ${startDate.year} - ${endDate.day} ${getMonthName(endDate.month)} ${endDate.year}`
                              )}
                            </p>
                            <p>
                              <strong>Submitted:</strong> {request.submittedDate}
                            </p>
                            <p>
                              <strong>Request ID:</strong> {request.id}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              showModalAlert(
                                'Cancel Request',
                                `Are you sure you want to cancel this ${request.absenceType} request for ${request.daysCount} day${request.daysCount > 1 ? 's' : ''}? This action cannot be undone.`,
                                () => cancelAbsenceRequest(request.id)
                              );
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar View showing requested dates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Calendar Overview
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Your requested absence dates are highlighted in red.
              </p>
              
              <CalendarComponent
                viewingMonth={viewingMonth}
                viewingYear={viewingYear}
                onNavigateMonth={navigateMonth}
                onToggleDate={null}
                isDateSelected={null}
                isDateRequested={isDateRequested}
                isInteractive={false}
                showBalance={false}
                showInstructions={false}
                className="min-h-0"
                availableBalance={availableBalance}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Success Modal Component
  const SuccessModal = () => (
    showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{modalContent.title}</h2>
            <button 
              onClick={() => setShowModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <p className="text-gray-600">{modalContent.message}</p>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button 
              onClick={() => {
                setShowModal(false);
                if (modalContent.onConfirm) {
                  modalContent.onConfirm();
                }
              }}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render based on current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'absence-overview':
        return <AbsenceOverview />;
      case 'calendar':
        return <AbsenceCalendar />;
      case 'modal':
        return <AbsenceTypeModal />;
      case 'form':
        return <RequestForm />;
      case 'personal-info':
        return <PersonalInformation />;
      case 'personal-info-detail':
        return <PersonalInformationDetail personalInfo={personalInfo} setPersonalInfo={setPersonalInfo} />;
      case 'my-contact-info':
        return <MyContactInformation />;
      case 'change-contact-info':
        return <ChangeContactInformation 
          contactInfo={contactInfo}
          setContactInfo={setContactInfo}
          contactArrays={contactArrays}
          setContactArrays={setContactArrays}
          setCurrentView={setCurrentView}
          showModalAlert={showModalAlert}
        />;
      case 'correct-absence':
        return <CorrectMyAbsence />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {renderCurrentView()}
      <SuccessModal />
      <ChangeLegalNameModal 
        isOpen={showLegalNameModal} 
        onClose={() => setShowLegalNameModal(false)}
        legalNameData={legalNameData}
        setLegalNameData={setLegalNameData}
      />
    </>
  );
};

export default WorkdayApp;