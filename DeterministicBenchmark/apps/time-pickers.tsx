import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import TaskWrapper from '../src/TaskWrapper';


// Utility functions for time manipulation
const formatTime = (time: { hour: number; minute: number; period?: string } | null): string => {
  if (!time) return '';
  const { hour, minute, period } = time;
  const formattedMinute = minute.toString().padStart(2, '0');
  return period ? `${hour}:${formattedMinute} ${period}` : `${hour.toString().padStart(2, '0')}:${formattedMinute}`;
};

const convertTo24Hour = (time: { hour: number; minute: number; period: string }): { hour: number; minute: number } => {
  let { hour, minute, period } = time;
  if (period === 'AM' && hour === 12) {
    hour = 0;
  } else if (period === 'PM' && hour !== 12) {
    hour = hour + 12;
  }
  return { hour, minute };
};

const convertTo12Hour = (time: { hour: number; minute: number }): { hour: number; minute: number; period: string } => {
  let { hour, minute } = time;
  let period = 'AM';
  
  if (hour === 0) {
    hour = 12;
  } else if (hour > 12) {
    hour = hour - 12;
    period = 'PM';
  } else if (hour === 12) {
    period = 'PM';
  }
  
  return { hour, minute, period };
};

const timeToMinutes = (time: { hour: number; minute: number; period?: string }): number => {
  if (time.period) {
    const time24 = convertTo24Hour(time as { hour: number; minute: number; period: string });
    return time24.hour * 60 + time24.minute;
  }
  return time.hour * 60 + time.minute;
};

const isSameTime = (time1: { hour: number; minute: number; period?: string } | null, 
                   time2: { hour: number; minute: number; period?: string } | null): boolean => {
  if (!time1 || !time2) return false;
  const minutes1 = timeToMinutes(time1);
  const minutes2 = timeToMinutes(time2);
  return minutes1 === minutes2;
};

// 1. Segmented Time Picker
const SegmentedTimePicker = () => {
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: string } | null>(null);
  const [activeSegment, setActiveSegment] = useState<'hour' | 'minute' | null>(null);
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedTime,
      activeSegment
    };
  }, [selectedTime, activeSegment]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 5-minute intervals

  const selectHour = (hour: number) => {
    setSelectedTime(prev => ({
      hour,
      minute: prev?.minute || 0,
      period: prev?.period || 'AM'
    }));
    setActiveSegment('minute');
  };

  const selectMinute = (minute: number) => {
    setSelectedTime(prev => ({
      hour: prev?.hour || 12,
      minute,
      period: prev?.period || 'AM'
    }));
    setActiveSegment(null);
  };

  const togglePeriod = () => {
    setSelectedTime(prev => prev ? {
      ...prev,
      period: prev.period === 'AM' ? 'PM' : 'AM'
    } : null);
  };

  const resetSelection = () => {
    setSelectedTime(null);
    setActiveSegment('hour');
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Current Time Display */}
        <div className="text-center">
          <div className="text-3xl font-mono mb-2">
            {selectedTime ? formatTime(selectedTime) : '--:-- --'}
          </div>
          <div className="space-x-2">
            <button
              onClick={resetSelection}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Reset
            </button>
            {selectedTime && (
              <button
                onClick={togglePeriod}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {selectedTime.period}
              </button>
            )}
          </div>
        </div>

        {/* Hour Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700">Hour:</h3>
            {activeSegment === 'hour' && (
              <span className="text-xs text-blue-600">← Select an hour</span>
            )}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {hours.map(hour => (
              <button
                key={hour}
                onClick={() => selectHour(hour)}
                className={`
                  px-3 py-2 text-sm rounded border transition-colors
                  ${selectedTime?.hour === hour 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                  ${activeSegment === 'hour' ? 'ring-2 ring-blue-200' : ''}
                `}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>

        {/* Minute Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700">Minute:</h3>
            {activeSegment === 'minute' && (
              <span className="text-xs text-blue-600">← Select minutes</span>
            )}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {minutes.map(minute => (
              <button
                key={minute}
                onClick={() => selectMinute(minute)}
                className={`
                  px-3 py-2 text-sm rounded border transition-colors
                  ${selectedTime?.minute === minute 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                  ${activeSegment === 'minute' ? 'ring-2 ring-blue-200' : ''}
                `}
              >
                {minute.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Minute Input */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Or enter exact minute:</h3>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="59"
              placeholder="30"
              className="px-3 py-2 border border-gray-300 rounded w-20 text-sm"
              onChange={(e) => {
                const minute = parseInt(e.target.value);
                if (!isNaN(minute) && minute >= 0 && minute <= 59) {
                  selectMinute(minute);
                }
              }}
            />
            <span className="text-sm text-gray-500 py-2">minutes</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${selectedTime?.hour ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span>Hour</span>
          <div className={`w-2 h-2 rounded-full ${selectedTime?.minute !== undefined ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span>Minute</span>
          <div className={`w-2 h-2 rounded-full ${selectedTime?.period ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span>Period</span>
        </div>
      </div>
      
    </div>
  );
};

// 2. Digital Time Input
const DigitalTimeInput = () => {
  const [timeInput, setTimeInput] = useState('');
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: string } | null>(null);
  const [is24Hour, setIs24Hour] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      timeInput,
      selectedTime,
      is24Hour,
      error
    };
  }, [timeInput, selectedTime, is24Hour, error]);

  const parseTimeInput = (input: string) => {
    setError('');
    
    // 12-hour format patterns
    const time12Pattern = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    // 24-hour format patterns
    const time24Pattern = /^(\d{1,2}):(\d{2})$/;
    
    if (time12Pattern.test(input)) {
      const match = input.match(time12Pattern);
      if (match) {
        const hour = parseInt(match[1]);
        const minute = parseInt(match[2]);
        const period = match[3].toUpperCase();
        
        if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
          setSelectedTime({ hour, minute, period });
        } else {
          setError('Invalid time format');
        }
      }
    } else if (time24Pattern.test(input) && is24Hour) {
      const match = input.match(time24Pattern);
      if (match) {
        const hour = parseInt(match[1]);
        const minute = parseInt(match[2]);
        
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          const time12 = convertTo12Hour({ hour, minute });
          setSelectedTime(time12);
        } else {
          setError('Invalid time format');
        }
      }
    } else {
      setError('Invalid time format');
    }
  };

  const handleInputChange = (value: string) => {
    setTimeInput(value);
    if (value.trim()) {
      parseTimeInput(value.trim());
    } else {
      setSelectedTime(null);
      setError('');
    }
  };

  const handleFormatToggle = () => {
    setIs24Hour(!is24Hour);
    setTimeInput('');
    setSelectedTime(null);
    setError('');
  };

  return (
    <div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={timeInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={is24Hour ? "HH:MM (24-hour)" : "H:MM AM/PM"}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleFormatToggle}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            {is24Hour ? '24H' : '12H'}
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        {selectedTime && (
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-lg font-mono">
              Selected: {formatTime(selectedTime)}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 3. Spinbox Time Picker
const SpinboxTimePicker = () => {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  
  const selectedTime = { hour, minute, period };
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      hour,
      minute,
      period,
      selectedTime
    };
  }, [hour, minute, period, selectedTime]);

  const adjustHour = (delta: number) => {
    let newHour = hour + delta;
    if (newHour > 12) newHour = 1;
    if (newHour < 1) newHour = 12;
    setHour(newHour);
  };

  const adjustMinute = (delta: number) => {
    let newMinute = ((minute + delta) % 60 + 60) % 60;
    setMinute(newMinute);
  };

  const togglePeriod = () => {
    setPeriod(period === 'AM' ? 'PM' : 'AM');
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        {/* Hour Spinbox */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => adjustHour(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <div className="w-16 text-center text-2xl font-mono py-2">
            {hour.toString().padStart(2, '0')}
          </div>
          <button
            onClick={() => adjustHour(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-2xl font-mono">:</div>
        
        {/* Minute Spinbox */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => adjustMinute(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <div className="w-16 text-center text-2xl font-mono py-2">
            {minute.toString().padStart(2, '0')}
          </div>
          <button
            onClick={() => adjustMinute(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        
        {/* Period Toggle */}
        <button
          onClick={togglePeriod}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-lg"
        >
          {period}
        </button>
      </div>
      
      <div className="mt-4 text-xl font-mono text-center">
        {formatTime(selectedTime)}
      </div>
      
    </div>
  );
};

// 4. Dropdown Time Picker
const DropdownTimePicker = () => {
  const [hour, setHour] = useState<number | null>(null);
  const [minute, setMinute] = useState<number | null>(null);
  const [period, setPeriod] = useState<'AM' | 'PM' | null>(null);
  
  const selectedTime = (hour !== null && minute !== null && period !== null) 
    ? { hour, minute, period } 
    : null;
    
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      hour,
      minute,
      period,
      selectedTime
    };
  }, [hour, minute, period, selectedTime]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div>
      <div className="flex items-center gap-3">
        <select
          value={hour || ''}
          onChange={(e) => setHour(e.target.value ? parseInt(e.target.value) : null)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Hour</option>
          {hours.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        
        <span className="text-xl">:</span>
        
        <select
          value={minute !== null ? minute : ''}
          onChange={(e) => setMinute(e.target.value ? parseInt(e.target.value) : null)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Minute</option>
          {minutes.map(m => (
            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
          ))}
        </select>
        
        <select
          value={period || ''}
          onChange={(e) => setPeriod(e.target.value as 'AM' | 'PM' | null)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">AM/PM</option>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      
      {selectedTime && (
        <div className="mt-4 text-xl font-mono text-center">
          {formatTime(selectedTime)}
        </div>
      )}
      
    </div>
  );
};

// 5. Slider Time Picker
const SliderTimePicker = () => {
  const [timeMinutes, setTimeMinutes] = useState(480); // 8:00 AM in minutes
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      timeMinutes
    };
  }, [timeMinutes]);

  const minutesToTime = (minutes: number) => {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return convertTo12Hour({ hour: hour24, minute });
  };

  const selectedTime = minutesToTime(timeMinutes);

  return (
    <div>
      <div className="space-y-4">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="1439" // 24 hours * 60 minutes - 1
            value={timeMinutes}
            onChange={(e) => setTimeMinutes(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>12:00 AM</span>
            <span>6:00 AM</span>
            <span>12:00 PM</span>
            <span>6:00 PM</span>
            <span>11:59 PM</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-mono">
            {formatTime(selectedTime)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {Math.floor(timeMinutes / 60)}:{(timeMinutes % 60).toString().padStart(2, '0')} (24-hour)
          </div>
        </div>
      </div>
      
    </div>
  );
};

// 6. Time Range Picker
const TimeRangePicker = () => {
  const [startTime, setStartTime] = useState<{ hour: number; minute: number; period: string } | null>(null);
  const [endTime, setEndTime] = useState<{ hour: number; minute: number; period: string } | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      startTime,
      endTime,
      selectingEnd
    };
  }, [startTime, endTime, selectingEnd]);

  const generateTimeOptions = () => {
    const times = [];
    
    // Generate AM times: 12:00 AM, 12:30 AM, 1:00 AM, 1:30 AM, ..., 11:30 AM
    for (let hour = 12; hour <= 12; hour++) {
      for (let minute of [0, 30]) {
        times.push({ hour, minute, period: 'AM' });
      }
    }
    for (let hour = 1; hour <= 11; hour++) {
      for (let minute of [0, 30]) {
        times.push({ hour, minute, period: 'AM' });
      }
    }
    
    // Generate PM times: 12:00 PM, 12:30 PM, 1:00 PM, 1:30 PM, ..., 11:30 PM
    for (let hour = 12; hour <= 12; hour++) {
      for (let minute of [0, 30]) {
        times.push({ hour, minute, period: 'PM' });
      }
    }
    for (let hour = 1; hour <= 11; hour++) {
      for (let minute of [0, 30]) {
        times.push({ hour, minute, period: 'PM' });
      }
    }
    
    return times;
  };

  const selectTime = (time: { hour: number; minute: number; period: string }) => {
    if (!startTime || selectingEnd) {
      if (!startTime) {
        setStartTime(time);
        setSelectingEnd(true);
      } else {
        setEndTime(time);
        setSelectingEnd(false);
      }
    } else {
      setStartTime(time);
      setEndTime(null);
      setSelectingEnd(true);
    }
  };

  const getDuration = () => {
    if (!startTime || !endTime) return '';
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const duration = Math.abs(endMinutes - startMinutes);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const isTimeInRange = (time: { hour: number; minute: number; period: string }) => {
    if (!startTime || !endTime) return false;
    const timeMinutes = timeToMinutes(time);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    // If end time is earlier than start time, swap them for range calculation
    const actualStart = Math.min(startMinutes, endMinutes);
    const actualEnd = Math.max(startMinutes, endMinutes);
    
    return timeMinutes >= actualStart && timeMinutes <= actualEnd;
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <div className="p-2 border rounded-md bg-gray-50">
              {startTime ? formatTime(startTime) : 'Select start time'}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">End Time</label>
            <div className="p-2 border rounded-md bg-gray-50">
              {endTime ? formatTime(endTime) : 'Select end time'}
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-blue-50 rounded-md">
          <div className="text-sm font-medium text-blue-800">
            Duration: {startTime && endTime ? getDuration() : '- -'}
          </div>
        </div>
        
        <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
          <div className="text-sm font-medium mb-2">
            {!startTime ? 'Select Start Time:' : 
             selectingEnd ? 'Select End Time:' : 'Select New Start Time:'}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {generateTimeOptions().map((time, index) => {
              const isStartTime = startTime && isSameTime(time, startTime);
              const isEndTime = endTime && isSameTime(time, endTime);
              const inRange = isTimeInRange(time);
              
              let buttonClass = 'p-1 text-xs rounded ';
              if (isStartTime || isEndTime) {
                buttonClass += 'bg-blue-500 text-white border-2 border-blue-700';
              } else if (inRange) {
                buttonClass += 'bg-blue-200 text-blue-800';
              } else {
                buttonClass += 'hover:bg-gray-100';
              }
              
              return (
                <button
                  key={index}
                  onClick={() => selectTime(time)}
                  className={buttonClass}
                >
                  {formatTime(time)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
};

// 7. Duration Picker
const DurationPicker = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [startTime, setStartTime] = useState<{ hour: number; minute: number; period: string }>({ hour: 9, minute: 0, period: 'AM' });
  
  const currentDuration = hours * 60 + minutes;
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      hours,
      minutes,
      startTime,
      currentDuration
    };
  }, [hours, minutes, startTime, currentDuration]);

  const calculateEndTime = () => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + currentDuration;
    const endHour24 = Math.floor(endMinutes / 60) % 24;
    const endMinute = endMinutes % 60;
    return convertTo12Hour({ hour: endHour24, minute: endMinute });
  };

  const endTime = calculateEndTime();

  return (
    <div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <div className="p-2 border rounded-md bg-gray-50">
              {formatTime(startTime)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <div className="p-2 border rounded-md bg-blue-50">
              {formatTime(endTime)}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  max="23"
                  className="w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">hours</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  min="0"
                  max="59"
                  className="w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">minutes</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-lg font-mono">
              Total Duration: {hours}h {minutes}m
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

// 8. Schedule Grid Picker
const ScheduleGridPicker = () => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedSlots
    };
  }, [selectedSlots]);

  const timeSlots = useMemo(() => {
    const slots = [];
    const targetSlots = ['09:00', '09:30', '10:00', '10:30'];
    
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = convertTo12Hour({ hour, minute });
        
        // Ensure target times are always available for deterministic task completion
        const isTargetTime = targetSlots.includes(time24);
        const available = isTargetTime ? true : Math.random() > 0.3;
        
        slots.push({
          time24,
          time12: formatTime(time12),
          available
        });
      }
    }
    return slots;
  }, []);

  const toggleSlot = (time24: string) => {
    setSelectedSlots(prev => 
      prev.includes(time24) 
        ? prev.filter(slot => slot !== time24)
        : [...prev, time24]
    );
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>
        
        <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map(slot => {
              const isSelected = selectedSlots.includes(slot.time24);
              const isAvailable = slot.available;
              
              return (
                <button
                  key={slot.time24}
                  onClick={() => isAvailable && toggleSlot(slot.time24)}
                  disabled={!isAvailable}
                  className={`p-2 text-sm rounded border ${
                    isSelected ? 'bg-blue-500 text-white border-blue-600' :
                    isAvailable ? 'bg-green-50 border-green-200 hover:bg-green-100' :
                    'bg-gray-200 border-gray-300 cursor-not-allowed'
                  }`}
                >
                  {slot.time12}
                </button>
              );
            })}
          </div>
        </div>
        
        {selectedSlots.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-sm font-medium text-blue-800 mb-1">
              Selected Times: {selectedSlots.length}
            </div>
            <div className="text-sm text-blue-600">
              {selectedSlots.map(slot => {
                const [hour, minute] = slot.split(':').map(Number);
                const time12 = convertTo12Hour({ hour, minute });
                return formatTime(time12);
              }).join(', ')}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 9. Quick Time Picker
const QuickTimePicker = () => {
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: string } | null>(null);
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedTime
    };
  }, [selectedTime]);

  const quickTimes = [
    { hour: 9, minute: 0, period: 'AM', label: 'Morning Start' },
    { hour: 12, minute: 0, period: 'PM', label: 'Lunch Time' },
    { hour: 1, minute: 0, period: 'PM', label: 'Afternoon' },
    { hour: 5, minute: 0, period: 'PM', label: 'End of Day' },
    { hour: 6, minute: 30, period: 'PM', label: 'Dinner Time' },
    { hour: 9, minute: 0, period: 'PM', label: 'Evening' }
  ];

  const selectQuickTime = (time: { hour: number; minute: number; period: string }) => {
    setSelectedTime(time);
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {quickTimes.map((time, index) => (
            <button
              key={index}
              onClick={() => selectQuickTime(time)}
              className={`p-3 rounded-lg border text-left ${
                selectedTime && isSameTime(selectedTime, time)
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="font-medium">{time.label}</div>
              <div className="text-sm opacity-75">
                {formatTime(time)}
              </div>
            </button>
          ))}
        </div>
        
        {selectedTime && (
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-lg font-mono">
              Selected: {formatTime(selectedTime)}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 10. Timezone Time Picker
const TimezoneTimePicker = () => {
  const [localTime, setLocalTime] = useState<{ hour: number; minute: number; period: string }>({ hour: 3, minute: 0, period: 'PM' });
  const [selectedTimezone, setSelectedTimezone] = useState('America/New_York');
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      localTime,
      selectedTimezone
    };
  }, [localTime, selectedTimezone]);

  const timezones = [
    { value: 'America/New_York', label: 'New York (EST)', offset: -5 },
    { value: 'Europe/London', label: 'London (GMT)', offset: 0 },
    { value: 'Europe/Paris', label: 'Paris (CET)', offset: 1 },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 11 },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST)', offset: -8 }
  ];

  const convertTimeToTimezone = (time: { hour: number; minute: number; period: string }, fromOffset: number, toOffset: number) => {
    const timeMinutes = timeToMinutes(time);
    const utcMinutes = timeMinutes - (fromOffset * 60);
    const targetMinutes = utcMinutes + (toOffset * 60);
    
    const hour24 = Math.floor(targetMinutes / 60) % 24;
    const minute = targetMinutes % 60;
    
    return convertTo12Hour({ hour: hour24 < 0 ? hour24 + 24 : hour24, minute: minute < 0 ? minute + 60 : minute });
  };

  const adjustTime = (field: 'hour' | 'minute', delta: number) => {
    if (field === 'hour') {
      let newHour = localTime.hour + delta;
      if (newHour > 12) newHour = 1;
      if (newHour < 1) newHour = 12;
      setLocalTime(prev => ({ ...prev, hour: newHour }));
    } else {
      let newMinute = ((localTime.minute + delta) % 60 + 60) % 60;
      setLocalTime(prev => ({ ...prev, minute: newMinute }));
    }
  };

  const togglePeriod = () => {
    setLocalTime(prev => ({ ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' }));
  };

  const currentTimezone = timezones.find(tz => tz.value === selectedTimezone);
  const nyTimezone = timezones.find(tz => tz.value === 'America/New_York');

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustTime('hour', 1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <div className="w-12 text-center text-xl font-mono">{localTime.hour.toString().padStart(2, '0')}</div>
            <button
              onClick={() => adjustTime('hour', -1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-xl font-mono">:</div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustTime('minute', 15)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <div className="w-12 text-center text-xl font-mono">{localTime.minute.toString().padStart(2, '0')}</div>
            <button
              onClick={() => adjustTime('minute', -15)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={togglePeriod}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {localTime.period}
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-sm font-medium text-blue-800">Selected Time</div>
            <div className="text-lg font-mono">
              {formatTime(localTime)}
            </div>
            <div className="text-sm text-blue-600">
              {currentTimezone?.label}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm font-medium text-gray-800">New York Time</div>
            <div className="text-lg font-mono">
              {currentTimezone && nyTimezone ? 
                formatTime(convertTimeToTimezone(localTime, currentTimezone.offset, nyTimezone.offset)) :
                '--:-- --'
              }
            </div>
            <div className="text-sm text-gray-600">
              {nyTimezone?.label}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

// 11. Business Hours Picker
const BusinessHoursPicker = () => {
  const [workStart, setWorkStart] = useState<{ hour: number; minute: number; period: string }>({ hour: 9, minute: 0, period: 'AM' });
  const [workEnd, setWorkEnd] = useState<{ hour: number; minute: number; period: string }>({ hour: 5, minute: 0, period: 'PM' });
  const [lunchStart, setLunchStart] = useState<{ hour: number; minute: number; period: string }>({ hour: 12, minute: 0, period: 'PM' });
  const [lunchEnd, setLunchEnd] = useState<{ hour: number; minute: number; period: string }>({ hour: 1, minute: 0, period: 'PM' });
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      workStart,
      workEnd,
      lunchStart,
      lunchEnd
    };
  }, [workStart, workEnd, lunchStart, lunchEnd]);

  const adjustTime = (timeType: 'workStart' | 'workEnd' | 'lunchStart' | 'lunchEnd', field: 'hour' | 'minute', delta: number) => {
    const setters = {
      workStart: setWorkStart,
      workEnd: setWorkEnd,
      lunchStart: setLunchStart,
      lunchEnd: setLunchEnd
    };
    
    const setter = setters[timeType];
    
    setter(prev => {
      if (field === 'hour') {
        let newHour = prev.hour + delta;
        if (newHour > 12) newHour = 1;
        if (newHour < 1) newHour = 12;
        return { ...prev, hour: newHour };
      } else {
        let newMinute = ((prev.minute + delta) % 60 + 60) % 60;
        return { ...prev, minute: newMinute };
      }
    });
  };

  const togglePeriod = (timeType: 'workStart' | 'workEnd' | 'lunchStart' | 'lunchEnd') => {
    const setters = {
      workStart: setWorkStart,
      workEnd: setWorkEnd,
      lunchStart: setLunchStart,
      lunchEnd: setLunchEnd
    };
    
    setters[timeType](prev => ({ ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' }));
  };

  const getWorkingHours = () => {
    const startMinutes = timeToMinutes(workStart);
    const endMinutes = timeToMinutes(workEnd);
    const lunchStartMinutes = timeToMinutes(lunchStart);
    const lunchEndMinutes = timeToMinutes(lunchEnd);
    
    const totalMinutes = endMinutes - startMinutes;
    const lunchMinutes = lunchEndMinutes - lunchStartMinutes;
    const workingMinutes = totalMinutes - lunchMinutes;
    
    const hours = Math.floor(workingMinutes / 60);
    const minutes = workingMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium">Work Hours</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm w-12">Start:</span>
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    <button onClick={() => adjustTime('workStart', 'hour', 1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <div className="w-8 text-center text-sm font-mono">{workStart.hour}</div>
                    <button onClick={() => adjustTime('workStart', 'hour', -1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span>:</span>
                  <div className="flex items-center">
                    <button onClick={() => adjustTime('workStart', 'minute', 15)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <div className="w-8 text-center text-sm font-mono">{workStart.minute.toString().padStart(2, '0')}</div>
                    <button onClick={() => adjustTime('workStart', 'minute', -15)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => togglePeriod('workStart')} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                    {workStart.period}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm w-12">End:</span>
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    <button onClick={() => adjustTime('workEnd', 'hour', 1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <div className="w-8 text-center text-sm font-mono">{workEnd.hour}</div>
                    <button onClick={() => adjustTime('workEnd', 'hour', -1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span>:</span>
                  <div className="flex items-center">
                    <button onClick={() => adjustTime('workEnd', 'minute', 15)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <div className="w-8 text-center text-sm font-mono">{workEnd.minute.toString().padStart(2, '0')}</div>
                    <button onClick={() => adjustTime('workEnd', 'minute', -15)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => togglePeriod('workEnd')} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                    {workEnd.period}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Lunch Break</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm w-12">Start:</span>
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    <button onClick={() => adjustTime('lunchStart', 'hour', 1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <div className="w-8 text-center text-sm font-mono">{lunchStart.hour}</div>
                    <button onClick={() => adjustTime('lunchStart', 'hour', -1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span>:</span>
                  <div className="flex items-center">
                    <button onClick={() => adjustTime('lunchStart', 'minute', 15)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <div className="w-8 text-center text-sm font-mono">{lunchStart.minute.toString().padStart(2, '0')}</div>
                    <button onClick={() => adjustTime('lunchStart', 'minute', -15)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => togglePeriod('lunchStart')} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                    {lunchStart.period}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm w-12">End:</span>
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    <button onClick={() => adjustTime('lunchEnd', 'hour', 1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <div className="w-8 text-center text-sm font-mono">{lunchEnd.hour}</div>
                    <button onClick={() => adjustTime('lunchEnd', 'hour', -1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span>:</span>
                  <div className="flex items-center">
                    <button onClick={() => adjustTime('lunchEnd', 'minute', 15)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <div className="w-8 text-center text-sm font-mono">{lunchEnd.minute.toString().padStart(2, '0')}</div>
                    <button onClick={() => adjustTime('lunchEnd', 'minute', -15)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => togglePeriod('lunchEnd')} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                    {lunchEnd.period}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-md">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800">Work Schedule</div>
              <div>{formatTime(workStart)} - {formatTime(workEnd)}</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Working Hours</div>
              <div>{getWorkingHours()}</div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

// 12. Mobile Time Picker
const MobileTimePicker = () => {
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: string }>({ hour: 12, minute: 0, period: 'AM' });
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedTime,
      isOpen
    };
  }, [selectedTime, isOpen]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div>
      <div className="space-y-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 text-left border rounded-lg bg-white hover:bg-gray-50 flex items-center justify-between"
        >
          <div>
            <div className="text-sm text-gray-500">Selected Time</div>
            <div className="text-xl font-mono">{formatTime(selectedTime)}</div>
          </div>
          <Clock className="h-6 w-6 text-gray-400" />
        </button>
        
        {isOpen && (
          <div className="border rounded-lg p-4 bg-white">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2 text-center">Hour</div>
                  <div className="max-h-32 overflow-y-auto border rounded">
                    {hours.map(hour => (
                      <button
                        key={hour}
                        onClick={() => setSelectedTime(prev => ({ ...prev, hour }))}
                        className={`w-full p-3 text-center hover:bg-gray-100 ${
                          selectedTime.hour === hour ? 'bg-blue-500 text-white' : ''
                        }`}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2 text-center">Minute</div>
                  <div className="max-h-32 overflow-y-auto border rounded">
                    {minutes.filter(m => m % 5 === 0).map(minute => (
                      <button
                        key={minute}
                        onClick={() => setSelectedTime(prev => ({ ...prev, minute }))}
                        className={`w-full p-3 text-center hover:bg-gray-100 ${
                          selectedTime.minute === minute ? 'bg-blue-500 text-white' : ''
                        }`}
                      >
                        {minute.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2 text-center">Period</div>
                  <div className="space-y-2">
                    {['AM', 'PM'].map(period => (
                      <button
                        key={period}
                        onClick={() => setSelectedTime(prev => ({ ...prev, period }))}
                        className={`w-full p-3 text-center border rounded hover:bg-gray-100 ${
                          selectedTime.period === period ? 'bg-blue-500 text-white border-blue-600' : ''
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Done
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 13. Accessibility Time Picker
const AccessibilityTimePicker = () => {
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: string }>({ hour: 12, minute: 0, period: 'AM' });
  const [focusedField, setFocusedField] = useState<'hour' | 'minute' | 'period'>('hour');
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedTime,
      focusedField
    };
  }, [selectedTime, focusedField]);

  const handleKeyDown = (e: React.KeyboardEvent, field: 'hour' | 'minute' | 'period') => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (field === 'hour') {
          setSelectedTime(prev => ({ ...prev, hour: prev.hour === 12 ? 1 : prev.hour + 1 }));
        } else if (field === 'minute') {
          setSelectedTime(prev => ({ ...prev, minute: prev.minute === 59 ? 0 : prev.minute + 1 }));
        } else {
          setSelectedTime(prev => ({ ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' }));
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (field === 'hour') {
          setSelectedTime(prev => ({ ...prev, hour: prev.hour === 1 ? 12 : prev.hour - 1 }));
        } else if (field === 'minute') {
          setSelectedTime(prev => ({ ...prev, minute: prev.minute === 0 ? 59 : prev.minute - 1 }));
        } else {
          setSelectedTime(prev => ({ ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' }));
        }
        break;
      case 'Tab':
        if (e.shiftKey) {
          if (field === 'period') setFocusedField('minute');
          else if (field === 'minute') setFocusedField('hour');
        } else {
          if (field === 'hour') setFocusedField('minute');
          else if (field === 'minute') setFocusedField('period');
        }
        break;
    }
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Use Tab to navigate, Arrow keys to adjust values, Enter to confirm
        </div>
        
        <div className="flex items-center gap-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center gap-2">
            <label htmlFor="hour-input" className="text-sm font-medium">Hour:</label>
            <input
              id="hour-input"
              type="number"
              min="1"
              max="12"
              value={selectedTime.hour}
              onChange={(e) => setSelectedTime(prev => ({ ...prev, hour: parseInt(e.target.value) || 1 }))}
              onKeyDown={(e) => handleKeyDown(e, 'hour')}
              onFocus={() => setFocusedField('hour')}
              className={`w-16 px-2 py-2 text-center border rounded focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                focusedField === 'hour' ? 'ring-4 ring-blue-300' : ''
              }`}
              aria-label="Hour"
              aria-describedby="hour-help"
            />
            <div id="hour-help" className="sr-only">
              Use arrow keys to adjust hour, 1 to 12
            </div>
          </div>
          
          <span className="text-2xl font-mono">:</span>
          
          <div className="flex items-center gap-2">
            <label htmlFor="minute-input" className="text-sm font-medium">Minute:</label>
            <input
              id="minute-input"
              type="number"
              min="0"
              max="59"
              value={selectedTime.minute}
              onChange={(e) => setSelectedTime(prev => ({ ...prev, minute: parseInt(e.target.value) || 0 }))}
              onKeyDown={(e) => handleKeyDown(e, 'minute')}
              onFocus={() => setFocusedField('minute')}
              className={`w-16 px-2 py-2 text-center border rounded focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                focusedField === 'minute' ? 'ring-4 ring-blue-300' : ''
              }`}
              aria-label="Minute"
              aria-describedby="minute-help"
            />
            <div id="minute-help" className="sr-only">
              Use arrow keys to adjust minute, 0 to 59
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="period-select" className="text-sm font-medium">Period:</label>
            <select
              id="period-select"
              value={selectedTime.period}
              onChange={(e) => setSelectedTime(prev => ({ ...prev, period: e.target.value as 'AM' | 'PM' }))}
              onKeyDown={(e) => handleKeyDown(e, 'period')}
              onFocus={() => setFocusedField('period')}
              className={`px-3 py-2 border rounded focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                focusedField === 'period' ? 'ring-4 ring-blue-300' : ''
              }`}
              aria-label="AM or PM"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-md">
          <div className="text-lg font-mono" role="status" aria-live="polite">
            Selected time: {formatTime(selectedTime)}
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          Current focus: {focusedField} field
        </div>
      </div>
      
    </div>
  );
};

// 14. Inline Time Display
const InlineTimeDisplay = () => {
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: string }>({ hour: 12, minute: 0, period: 'AM' });
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedTime
    };
  }, [selectedTime]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45];

  return (
    <div>
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-mono mb-2">
            {formatTime(selectedTime)}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2 text-center">Hours</h3>
            <div className="grid grid-cols-3 gap-1">
              {hours.map(hour => (
                <button
                  key={hour}
                  onClick={() => setSelectedTime(prev => ({ ...prev, hour }))}
                  className={`p-2 text-sm rounded border ${
                    selectedTime.hour === hour
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2 text-center">Minutes</h3>
            <div className="grid grid-cols-2 gap-1">
              {minutes.map(minute => (
                <button
                  key={minute}
                  onClick={() => setSelectedTime(prev => ({ ...prev, minute }))}
                  className={`p-2 text-sm rounded border ${
                    selectedTime.minute === minute
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {minute.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2 text-center">Period</h3>
            <div className="space-y-1">
              {['AM', 'PM'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedTime(prev => ({ ...prev, period }))}
                  className={`w-full p-2 text-sm rounded border ${
                    selectedTime.period === period
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

// 15. Modal Time Picker
const ModalTimePicker = () => {
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: string } | null>(null);
  const [tempTime, setTempTime] = useState<{ hour: number; minute: number; period: string }>({ hour: 12, minute: 0, period: 'AM' });
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedTime,
      tempTime,
      isOpen
    };
  }, [selectedTime, tempTime, isOpen]);

  const openModal = () => {
    setTempTime(selectedTime || { hour: 12, minute: 0, period: 'AM' });
    setIsOpen(true);
  };

  const confirmTime = () => {
    setSelectedTime(tempTime);
    setIsOpen(false);
  };

  const cancelTime = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        cancelTime();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div>
      <div className="space-y-4">
        <button
          onClick={openModal}
          className="w-full p-3 text-left border rounded-md bg-white hover:bg-gray-50 flex items-center justify-between"
        >
          <div>
            <div className="text-sm text-gray-500">Selected Time</div>
            <div className="text-lg font-mono">
              {selectedTime ? formatTime(selectedTime) : 'Select time...'}
            </div>
          </div>
          <Clock className="h-5 w-5 text-gray-400" />
        </button>
        
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-lg">
              <h2 className="text-lg font-semibold mb-4">Select Time</h2>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-mono mb-4">
                    {formatTime(tempTime)}
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTempTime(prev => ({ ...prev, hour: prev.hour === 12 ? 1 : prev.hour + 1 }))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <div className="w-12 text-center text-xl font-mono">
                      {tempTime.hour.toString().padStart(2, '0')}
                    </div>
                    <button
                      onClick={() => setTempTime(prev => ({ ...prev, hour: prev.hour === 1 ? 12 : prev.hour - 1 }))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="text-xl font-mono">:</div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTempTime(prev => ({ ...prev, minute: prev.minute >= 55 ? (prev.minute + 5) % 60 : prev.minute + 5 }))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <div className="w-12 text-center text-xl font-mono">
                      {tempTime.minute.toString().padStart(2, '0')}
                    </div>
                    <button onClick={() => setTempTime(prev => ({ ...prev, minute: prev.minute < 5 ? prev.minute + 55 : prev.minute - 5 }))} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setTempTime(prev => ({ ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' }))}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {tempTime.period}
                  </button>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={confirmTime}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={cancelTime}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 16. Recurring Time Picker
const RecurringTimePicker = () => {
  const [time, setTime] = useState<{ hour: number; minute: number; period: string }>({ hour: 9, minute: 0, period: 'AM' });
  const [pattern, setPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [days, setDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      time,
      pattern,
      days
    };
  }, [time, pattern, days]);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    setDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const adjustTime = (field: 'hour' | 'minute', delta: number) => {
    if (field === 'hour') {
      let newHour = time.hour + delta;
      if (newHour > 12) newHour = 1;
      if (newHour < 1) newHour = 12;
      setTime(prev => ({ ...prev, hour: newHour }));
    } else {
      let newMinute = ((time.minute + delta) % 60 + 60) % 60;
      setTime(prev => ({ ...prev, minute: newMinute }));
    }
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => adjustTime('hour', 1)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronUp className="h-4 w-4" />
            </button>
            <div className="w-12 text-center text-xl font-mono">{time.hour.toString().padStart(2, '0')}</div>
            <button onClick={() => adjustTime('hour', -1)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-xl font-mono">:</div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => adjustTime('minute', 15)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronUp className="h-4 w-4" />
            </button>
            <div className="w-12 text-center text-xl font-mono">{time.minute.toString().padStart(2, '0')}</div>
            <button onClick={() => adjustTime('minute', -15)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={() => setTime(prev => ({ ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' }))}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {time.period}
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Pattern</label>
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPattern(p)}
                className={`px-4 py-2 rounded border ${
                  pattern === p ? 'bg-blue-500 text-white border-blue-600' : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {pattern === 'weekly' && (
          <div>
            <label className="block text-sm font-medium mb-2">Days of Week</label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 text-sm rounded border ${
                    days.includes(day) ? 'bg-blue-500 text-white border-blue-600' : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-3 bg-blue-50 rounded-md">
          <div className="text-sm font-medium text-blue-800 mb-1">Recurring Schedule</div>
          <div className="text-sm text-blue-600">
            {formatTime(time)} - {pattern}
            {pattern === 'weekly' && days.length > 0 && ` on ${days.join(', ')}`}
          </div>
        </div>
      </div>
      
    </div>
  );
};

// 17. Meeting Time Picker
const MeetingTimePicker = () => {
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: string } | null>(null);
  const [duration, setDuration] = useState(60); // minutes
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedTime,
      duration
    };
  }, [selectedTime, duration]);

  // Mock participant availability
  const participants = [
    { name: 'Alice', available: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { name: 'Bob', available: ['10:00', '11:00', '13:00', '14:00', '16:00'] },
    { name: 'Carol', available: ['09:00', '10:00', '15:00', '16:00'] }
  ];

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 16; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = convertTo12Hour({ hour, minute: 0 });
      
      // Check how many participants are available
      const availableCount = participants.filter(p => p.available.includes(time24)).length;
      
      slots.push({
        time24,
        time12: formatTime(time12),
        availableCount,
        totalParticipants: participants.length,
        isOptimal: availableCount === participants.length
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const selectTime = (slot: any) => {
    const [hour] = slot.time24.split(':').map(Number);
    const time12 = convertTo12Hour({ hour, minute: 0 });
    setSelectedTime(time12);
  };

  const getEndTime = () => {
    if (!selectedTime) return null;
    const startMinutes = timeToMinutes(selectedTime);
    const endMinutes = startMinutes + duration;
    const endHour24 = Math.floor(endMinutes / 60) % 24;
    const endMinute = endMinutes % 60;
    return convertTo12Hour({ hour: endHour24, minute: endMinute });
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              min="15"
              max="240"
              step="15"
              className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Available Time Slots</div>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map(slot => (
              <button
                key={slot.time24}
                onClick={() => selectTime(slot)}
                className={`p-3 text-left border rounded ${
                  selectedTime && isSameTime(selectedTime, convertTo12Hour({ hour: parseInt(slot.time24.split(':')[0]), minute: 0 }))
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="font-medium">{slot.time12}</div>
                <div className="text-xs opacity-75">
                  {slot.availableCount}/{slot.totalParticipants} available
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {selectedTime && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="text-sm font-medium text-blue-800 mb-1">Meeting Details</div>
              <div className="text-sm text-blue-600">
                <div>Time: {formatTime(selectedTime)} - {getEndTime() ? formatTime(getEndTime()!) : ''}</div>
                <div>Duration: {duration} minutes</div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm font-medium mb-2">Participant Availability</div>
              <div className="space-y-1">
                {participants.map(participant => {
                  const timeSlot = selectedTime ? timeToMinutes(selectedTime) : 0;
                  const hour24 = Math.floor(timeSlot / 60);
                  const time24 = `${hour24.toString().padStart(2, '0')}:00`;
                  const isAvailable = participant.available.includes(time24);
                  
                  return (
                    <div key={participant.name} className="flex items-center gap-2 text-sm">
                      <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{participant.name}</span>
                      <span className="text-gray-500">
                        {isAvailable ? 'Available' : 'Conflict'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// 18. Countdown Timer Picker
const CountdownTimerPicker = () => {
  const [duration, setDuration] = useState({ hours: 0, minutes: 10, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedDuration, setStartedDuration] = useState<number | null>(null); // Save duration when started
  
  const currentDuration = duration.hours * 3600 + duration.minutes * 60 + duration.seconds;
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      duration,
      isRunning,
      timeLeft,
      startedDuration,
      currentDuration
    };
  }, [duration, isRunning, timeLeft, startedDuration, currentDuration]);

  useEffect(() => {
    let interval: number;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    const totalSeconds = duration.hours * 3600 + duration.minutes * 60 + duration.seconds;
    setTimeLeft(totalSeconds);
    setIsRunning(true);
    setStartedDuration(totalSeconds); // Save the duration when starting
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setStartedDuration(null); // Clear saved duration on reset
  };

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustDuration = (field: 'hours' | 'minutes' | 'seconds', delta: number) => {
    setDuration(prev => {
      const newValue = Math.max(0, prev[field] + delta);
      const maxValue = field === 'hours' ? 23 : 59;
      return {
        ...prev,
        [field]: Math.min(newValue, maxValue)
      };
    });
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-mono mb-4">
            {isRunning || timeLeft > 0 ? formatTimeLeft(timeLeft) : 
             `${duration.hours}:${duration.minutes.toString().padStart(2, '0')}:${duration.seconds.toString().padStart(2, '0')}`}
          </div>
        </div>
        
        {!isRunning && timeLeft === 0 && (
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-sm font-medium mb-2">Hours</div>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustDuration('hours', 1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <div className="w-12 text-center text-xl font-mono">{duration.hours.toString().padStart(2, '0')}</div>
                <button onClick={() => adjustDuration('hours', -1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium mb-2">Minutes</div>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustDuration('minutes', 1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <div className="w-12 text-center text-xl font-mono">{duration.minutes.toString().padStart(2, '0')}</div>
                <button onClick={() => adjustDuration('minutes', -1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium mb-2">Seconds</div>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustDuration('seconds', 1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <div className="w-12 text-center text-xl font-mono">{duration.seconds.toString().padStart(2, '0')}</div>
                <button onClick={() => adjustDuration('seconds', -1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-3">
          {!isRunning && timeLeft === 0 ? (
            <button
              onClick={startTimer}
              disabled={currentDuration === 0}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Start
            </button>
          ) : (
            <>
              <button
                onClick={isRunning ? stopTimer : startTimer}
                className={`px-6 py-2 text-white rounded ${
                  isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isRunning ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={resetTimer}
                className="px-6 py-2 bg-gray-500 text-gray-700 rounded hover:bg-gray-600"
              >
                Reset
              </button>
            </>
          )}
        </div>
        
        {timeLeft === 0 && !isRunning && currentDuration > 0 && (
          <div className="text-center text-green-600 font-semibold">
            Timer finished!
          </div>
        )}
      </div>
      
    </div>
  );
};

// 19. World Clock Picker
const WorldClockPicker = () => {
  const [selectedTimezone, setSelectedTimezone] = useState('America/New_York');
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: string }>({ hour: 12, minute: 0, period: 'PM' });
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedTimezone,
      selectedTime
    };
  }, [selectedTimezone, selectedTime]);

  const timezones = [
    { value: 'America/New_York', label: 'New York', offset: -5 },
    { value: 'America/Los_Angeles', label: 'Los Angeles', offset: -8 },
    { value: 'Europe/London', label: 'London', offset: 0 },
    { value: 'Europe/Paris', label: 'Paris', offset: 1 },
    { value: 'Asia/Tokyo', label: 'Tokyo', offset: 9 },
    { value: 'Australia/Sydney', label: 'Sydney', offset: 11 }
  ];

  const convertTimeToTimezone = (time: { hour: number; minute: number; period: string }, fromOffset: number, toOffset: number) => {
    const timeMinutes = timeToMinutes(time);
    const utcMinutes = timeMinutes - (fromOffset * 60);
    const targetMinutes = utcMinutes + (toOffset * 60);
    
    const hour24 = Math.floor(targetMinutes / 60) % 24;
    const minute = targetMinutes % 60;
    
    return convertTo12Hour({ hour: hour24 < 0 ? hour24 + 24 : hour24, minute: minute < 0 ? minute + 60 : minute });
  };

  const adjustTime = (field: 'hour' | 'minute', delta: number) => {
    if (field === 'hour') {
      let newHour = selectedTime.hour + delta;
      if (newHour > 12) newHour = 1;
      if (newHour < 1) newHour = 12;
      setSelectedTime(prev => ({ ...prev, hour: newHour }));
    } else {
      let newMinute = ((selectedTime.minute + delta) % 60 + 60) % 60;
      setSelectedTime(prev => ({ ...prev, minute: newMinute }));
    }
  };

     const currentTimezone = timezones.find(tz => tz.value === selectedTimezone)!;

   return (
     <div>
       <div className="space-y-4">
         <div>
           <label className="block text-sm font-medium mb-2">Select Timezone</label>
           <select
             value={selectedTimezone}
             onChange={(e) => setSelectedTimezone(e.target.value)}
             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
           >
             {timezones.map(tz => (
               <option key={tz.value} value={tz.value}>{tz.label}</option>
             ))}
           </select>
         </div>
         
         <div className="flex items-center justify-center gap-4">
           <div className="flex items-center gap-2">
             <button
               onClick={() => adjustTime('hour', 1)}
               className="p-1 hover:bg-gray-100 rounded"
             >
               <ChevronUp className="h-4 w-4" />
             </button>
             <div className="w-12 text-center text-xl font-mono">{selectedTime.hour.toString().padStart(2, '0')}</div>
             <button
               onClick={() => adjustTime('hour', -1)}
               className="p-1 hover:bg-gray-100 rounded"
             >
               <ChevronDown className="h-4 w-4" />
             </button>
           </div>
           
           <div className="text-xl font-mono">:</div>
           
           <div className="flex items-center gap-2">
             <button
               onClick={() => adjustTime('minute', 15)}
               className="p-1 hover:bg-gray-100 rounded"
             >
               <ChevronUp className="h-4 w-4" />
             </button>
             <div className="w-12 text-center text-xl font-mono">{selectedTime.minute.toString().padStart(2, '0')}</div>
             <button onClick={() => adjustTime('minute', -15)} className="p-1 hover:bg-gray-100 rounded">
               <ChevronDown className="h-4 w-4" />
             </button>
           </div>
           
           <button
             onClick={() => setSelectedTime(prev => ({ ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' }))}
             className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
           >
             {selectedTime.period}
           </button>
         </div>
         
         <div className="p-3 bg-blue-50 rounded-md">
           <div className="text-sm font-medium text-blue-800">Selected Time</div>
           <div className="text-lg font-mono">
             {formatTime(selectedTime)}
           </div>
           <div className="text-sm text-blue-600">
             {currentTimezone.label}
           </div>
         </div>
         
         <div className="space-y-2">
           <div className="text-sm font-medium">World Clock</div>
           <div className="grid grid-cols-2 gap-3">
             {timezones.filter(tz => tz.value !== selectedTimezone).map(tz => {
               const convertedTime = convertTimeToTimezone(selectedTime, currentTimezone.offset, tz.offset);
               return (
                 <div key={tz.value} className="p-2 bg-gray-50 rounded border">
                   <div className="text-sm font-medium">{tz.label}</div>
                   <div className="font-mono">{formatTime(convertedTime)}</div>
                 </div>
               );
             })}
           </div>
         </div>
       </div>
      
    </div>
  );
};

// 20. Smart Time Picker
const SmartTimePicker = () => {
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; period: string } | null>(null);
  const [context, setContext] = useState('work meeting');
  
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedTime,
      context
    };
  }, [selectedTime, context]);

  const generateSmartSuggestions = (context: string) => {
    const suggestions: { [key: string]: Array<{ hour: number; minute: number; period: string; reason: string }> } = {
      'work meeting': [
        { hour: 9, minute: 0, period: 'AM', reason: 'Start of workday' },
        { hour: 10, minute: 0, period: 'AM', reason: 'Mid-morning focus time' },
        { hour: 2, minute: 0, period: 'PM', reason: 'Post-lunch productivity' },
        { hour: 3, minute: 0, period: 'PM', reason: 'Afternoon collaboration' }
      ],
      'lunch': [
        { hour: 12, minute: 0, period: 'PM', reason: 'Standard lunch time' },
        { hour: 12, minute: 30, period: 'PM', reason: 'Late lunch' },
        { hour: 1, minute: 0, period: 'PM', reason: 'Extended lunch break' }
      ],
      'exercise': [
        { hour: 6, minute: 30, period: 'AM', reason: 'Morning energy boost' },
        { hour: 12, minute: 0, period: 'PM', reason: 'Lunch break workout' },
        { hour: 6, minute: 0, period: 'PM', reason: 'After work fitness' }
      ],
      'personal': [
        { hour: 7, minute: 0, period: 'PM', reason: 'Evening personal time' },
        { hour: 8, minute: 0, period: 'PM', reason: 'Dinner time' },
        { hour: 9, minute: 0, period: 'PM', reason: 'Wind down period' }
      ]
    };
    
    return suggestions[context] || suggestions['work meeting'];
  };

  const suggestions = generateSmartSuggestions(context);

  const selectSuggestion = (suggestion: { hour: number; minute: number; period: string }) => {
    setSelectedTime(suggestion);
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Context</label>
          <select
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="work meeting">Work Meeting</option>
            <option value="lunch">Lunch</option>
            <option value="exercise">Exercise</option>
            <option value="personal">Personal</option>
          </select>
        </div>
        
        <div>
          <div className="text-sm font-medium mb-2">Smart Suggestions</div>
          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className={`p-3 text-left border rounded-lg ${
                  selectedTime && isSameTime(selectedTime, suggestion)
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{formatTime(suggestion)}</div>
                    <div className="text-sm opacity-75">{suggestion.reason}</div>
                  </div>
                  <div className="text-xs opacity-50">AI suggested</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {selectedTime && (
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-sm font-medium text-blue-800 mb-1">Selected Time</div>
            <div className="text-lg font-mono">{formatTime(selectedTime)}</div>
          </div>
        )}
      </div>
      
    </div>
  );
};

// Task data
const tasks = [
  { 
    id: 1, 
    name: 'Segmented Time Picker', 
    component: SegmentedTimePicker,
    task: 'Set time to 2:30 PM',
    ux: 'Click hour segments, then minute segments, toggle AM/PM',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 2, minute: 30, period: 'PM' };
      const success = !!(appState?.selectedTime && isSameTime(appState.selectedTime, targetTime));
      return { success };
    }
  },
  { 
    id: 2, 
    name: 'Digital Time Input', 
    component: DigitalTimeInput,
    task: 'Enter 9:15 AM',
    ux: 'Type time directly, toggle between 12/24-hour formats',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 9, minute: 15, period: 'AM' };
      const success = !!(appState?.selectedTime && isSameTime(appState.selectedTime, targetTime));
      return { success };
    }
  },
  { 
    id: 3, 
    name: 'Spinbox Time Picker', 
    component: SpinboxTimePicker,
    task: 'Set time to 6:05 PM',
    ux: 'Use up/down arrows to adjust hours and minutes',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 6, minute: 5, period: 'PM' };
      const success = isSameTime(appState?.selectedTime, targetTime);
      return { success };
    }
  },
  { 
    id: 4, 
    name: 'Dropdown Time Picker', 
    component: DropdownTimePicker,
    task: 'Select 11:30 AM',
    ux: 'Use dropdown menus for hour, minute, and AM/PM',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 11, minute: 30, period: 'AM' };
      const success = !!(appState?.selectedTime && isSameTime(appState.selectedTime, targetTime));
      return { success };
    }
  },
  { 
    id: 5, 
    name: 'Slider Time Picker', 
    component: SliderTimePicker,
    task: 'Set time to 2:20 PM',
    ux: 'Use slider to select time continuously',
    test: () => {
      const appState = (window as any).app_state;
      const targetMinutes = 14 * 60 + 20; // 2:20 PM in minutes
      const success = appState?.timeMinutes === targetMinutes;
      return { success };
    }
  },
  { 
    id: 6, 
    name: 'Time Range Picker', 
    component: TimeRangePicker,
    task: 'Select 9:00 AM to 5:30 PM',
    ux: 'Click to select start time, then end time',
    test: () => {
      const appState = (window as any).app_state;
      const targetStart = { hour: 9, minute: 0, period: 'AM' };
      const targetEnd = { hour: 5, minute: 30, period: 'PM' };
      const success = !!(appState?.startTime && appState?.endTime && 
        isSameTime(appState.startTime, targetStart) && 
        isSameTime(appState.endTime, targetEnd));
      return { success };
    }
  },
  { 
    id: 7, 
    name: 'Duration Picker', 
    component: DurationPicker,
    task: 'Set duration to 2 hours 30 minutes',
    ux: 'Adjust duration, see automatic end time calculation',
    test: () => {
      const appState = (window as any).app_state;
      const targetDuration = 2 * 60 + 30; // 2 hours 30 minutes
      const success = appState?.currentDuration === targetDuration;
      return { success };
    }
  },
  { 
    id: 8, 
    name: 'Schedule Grid Picker', 
    component: ScheduleGridPicker,
    task: 'Select 9:00 AM, 9:30 AM, 10:00 AM, and 10:30 AM',
    ux: 'Click time slots to select/deselect, see availability',
    test: () => {
      const appState = (window as any).app_state;
      const targetSlots = ['09:00', '09:30', '10:00', '10:30'];
      const success = targetSlots.every(slot => appState?.selectedSlots?.includes(slot)) && 
                     appState?.selectedSlots?.length === targetSlots.length;
      return { success };
    }
  },
  { 
    id: 9, 
    name: 'Quick Time Picker', 
    component: QuickTimePicker,
    task: 'Select "Lunch Time" (12:00 PM)',
    ux: 'Use preset time buttons for quick selection',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 12, minute: 0, period: 'PM' };
      const success = !!(appState?.selectedTime && isSameTime(appState.selectedTime, targetTime));
      return { success };
    }
  },
  { 
    id: 10, 
    name: 'Timezone Time Picker', 
    component: TimezoneTimePicker,
    task: 'Set 3:00 PM in London timezone',
    ux: 'Adjust time and select timezone, see conversions',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 3, minute: 0, period: 'PM' };
      const targetTimezone = 'Europe/London';
      const success = isSameTime(appState?.localTime, targetTime) && appState?.selectedTimezone === targetTimezone;
      return { success };
    }
  },
  { 
    id: 11, 
    name: 'Business Hours Picker', 
    component: BusinessHoursPicker,
    task: 'Set work hours 8:30 AM to 6:00 PM',
    ux: 'Configure business hours with lunch break',
    test: () => {
      const appState = (window as any).app_state;
      const targetWorkStart = { hour: 8, minute: 30, period: 'AM' };
      const targetWorkEnd = { hour: 6, minute: 0, period: 'PM' };
      const success = isSameTime(appState?.workStart, targetWorkStart) && isSameTime(appState?.workEnd, targetWorkEnd);
      return { success };
    }
  },
  { 
    id: 12, 
    name: 'Mobile Time Picker', 
    component: MobileTimePicker,
    task: 'Click the time field and select 4:45 PM, at the end click Done.',
    ux: 'Touch-optimized interface with large buttons',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 4, minute: 45, period: 'PM' };
      const success = isSameTime(appState?.selectedTime, targetTime);
      return { success };
    }
  },
  { 
    id: 13, 
    name: 'Accessibility Time Picker', 
    component: AccessibilityTimePicker,
    task: 'Set time to 10:05 AM',
    ux: 'Full keyboard navigation, screen reader friendly',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 10, minute: 5, period: 'AM' };
      const success = isSameTime(appState?.selectedTime, targetTime);
      return { success };
    }
  },
  { 
    id: 14, 
    name: 'Inline Time Display', 
    component: InlineTimeDisplay,
    task: 'Select 7:15 AM',
    ux: 'Always-visible time picker, no popups',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 7, minute: 15, period: 'AM' };
      const success = isSameTime(appState?.selectedTime, targetTime);
      return { success };
    }
  },
  { 
    id: 15, 
    name: 'Modal Time Picker', 
    component: ModalTimePicker,
    task: 'Select 8:45 PM',
    ux: 'Modal overlay with confirm/cancel actions',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 8, minute: 45, period: 'PM' };
      const success = !!(appState?.selectedTime && isSameTime(appState.selectedTime, targetTime));
      return { success };
    }
  },
  { 
    id: 16, 
    name: 'Recurring Time Picker', 
    component: RecurringTimePicker,
    task: 'Set daily recurring time at 2:30 PM',
    ux: 'Configure recurring time patterns',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 2, minute: 30, period: 'PM' };
      const targetPattern = 'daily';
      const success = isSameTime(appState?.time, targetTime) && appState?.pattern === targetPattern;
      return { success };
    }
  },
  { 
    id: 17, 
    name: 'Meeting Time Picker', 
    component: MeetingTimePicker,
    task: 'Schedule meeting at 10:00 AM',
    ux: 'See participant availability and conflicts',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 10, minute: 0, period: 'AM' };
      const success = !!(appState?.selectedTime && isSameTime(appState.selectedTime, targetTime));
      return { success };
    }
  },
  { 
    id: 18, 
    name: 'Countdown Timer Picker', 
    component: CountdownTimerPicker,
    task: 'Set timer for 5 minutes',
    ux: 'Duration picker with countdown functionality',
    test: () => {
      const appState = (window as any).app_state;
      const targetDuration = 5 * 60; // 5 minutes in seconds
      // Success if either:
      // - Timer hasn't been started yet and current duration matches target
      // - Timer has been started and the started duration matches target
      const success = appState?.startedDuration !== null 
        ? appState.startedDuration === targetDuration 
        : appState?.currentDuration === targetDuration;
      return { success };
    }
  },
  { 
    id: 19, 
    name: 'World Clock Picker', 
    component: WorldClockPicker,
    task: 'Set 9:30 AM in Tokyo timezone',
    ux: 'Multi-timezone time coordination',
    test: () => {
      const appState = (window as any).app_state;
      const targetTimezone = 'Asia/Tokyo';
      const targetTime = { hour: 9, minute: 30, period: 'AM' };
      const success = appState?.selectedTimezone === targetTimezone && isSameTime(appState?.selectedTime, targetTime);
      return { success };
    }
  },
  { 
    id: 20, 
    name: 'Smart Time Picker', 
    component: SmartTimePicker,
    task: 'Select "Afternoon collaboration" suggestion (3:00 PM)',
    ux: 'AI-powered time suggestions based on context',
    test: () => {
      const appState = (window as any).app_state;
      const targetTime = { hour: 3, minute: 0, period: 'PM' };
      const success = !!(appState?.selectedTime && isSameTime(appState.selectedTime, targetTime));
      return { success };
    }
  }
];

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Time Picker Task Scenarios', appPath: '/time-pickers' };

// Main App using TaskWrapper
export default function App() {
  return (
    <TaskWrapper 
      tasks={tasks}
      appName="Time Picker Task Scenarios"
      appPath="/time-pickers"
    />
  );
} 