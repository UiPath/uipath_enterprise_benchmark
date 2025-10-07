import React, { useState, useEffect } from 'react';

// Seeded random number generator for deterministic data (available for future use)
// class SeededRandom {
//   private seed: number;
//   constructor(seed: number) { this.seed = seed; }
//   next(): number {
//     this.seed = (this.seed * 9301 + 49297) % 233280;
//     return this.seed / 233280;
//   }
// }

interface Appointment {
  id: string;
  patientNumber: string;
  patientName: string;
  doctorName: string;
  appointmentDatetime: string;
  visitReason: string;
  insuranceType: string;
  phone: string;
  durationMinutes: number;
  scheduled?: boolean;
  calendarSlot?: string;
}

interface Provider {
  id: string;
  name: string;
  specialty: string;
  availability: string[];
  color: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

interface CalendarDay {
  date: string;
  dayName: string;
  timeSlots: TimeSlot[];
}

export const Task22: React.FC = () => {
  // Initialize app_state immediately to prevent race condition with test runner
  if (!(window as any).app_state) {
    (window as any).app_state = {
      appointments: [],
      scheduledAppointments: [],
      providers: [],
      calendar: [],
      currentFormEntry: {},
      formFieldsCompleted: {},
      totalCreatedAppointments: 0,
      totalScheduledAppointments: 0,
    };
  }

  // Seeded random for deterministic data (not used in current implementation but available)
  // const rng = useRef(new SeededRandom(12345));
  // const [currentDate, setCurrentDate] = useState(new Date(2024, 1, 10)); // February 10, 2024
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduledAppointments, setScheduledAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<any>(null);
  // const [selectedSlot, setSelectedSlot] = useState<string>(''); // Used in right-click handler
  
  // Form state for appointment entry
  const [formData, setFormData] = useState({
    patientName: '',
    patientNumber: '',
    visitReason: '',
    insuranceType: '',
    phone: '',
    durationMinutes: ''
  });

  // External Excel data - appointments should come from Excel files, not pre-populated
  const generateAppointments = (): Appointment[] => {
    // Return empty array - appointments should come from external Excel files
    return [];
  };

  // Generate providers
  const generateProviders = (): Provider[] => {
    return [
      {
        id: 'dr-martinez',
        name: 'Dr. Rebecca Martinez',
        specialty: 'Internal Medicine',
        availability: ['09:00-17:00'],
        color: '#3B82F6'
      },
      {
        id: 'dr-patterson',
        name: 'Dr. James Patterson',
        specialty: 'Family Medicine',
        availability: ['08:00-16:00'],
        color: '#10B981'
      },
      {
        id: 'dr-sharma',
        name: 'Dr. Priya Sharma',
        specialty: 'Cardiology',
        availability: ['10:00-18:00'],
        color: '#F59E0B'
      }
    ];
  };

  // Generate calendar days
  const generateCalendar = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    
    for (let i = 0; i < 5; i++) {
      // Create date more explicitly to avoid timezone issues
      const dayOfMonth = 10 + i; // 10, 11, 12, 13, 14
      const date = new Date(2024, 1, dayOfMonth, 12, 0, 0, 0); // Feb 10-14, 2024 at noon
      
      const timeSlots: TimeSlot[] = [];
      for (let hour = 8; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          timeSlots.push({
            time,
            available: true
          });
        }
      }
      
      days.push({
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        timeSlots
      });
    }
    
    return days;
  };

  useEffect(() => {
    const generatedAppointments = generateAppointments();
    const generatedProviders = generateProviders();
    const generatedCalendar = generateCalendar();
    
    setAppointments(generatedAppointments);
    setProviders(generatedProviders);
    setCalendar(generatedCalendar);
  }, []);

  // Helper function for testing - fill form with patient data
  const fillPatientForm = (patientIndex: number) => {
    const patients = [
      { name: 'Emma Williams', patientNumber: '98765', reason: 'Annual Physical', duration: '45', insurance: 'BlueCross PPO', phone: '5553214567', providerId: 'dr-martinez' },
      { name: 'David Thompson', patientNumber: '54321', reason: 'Follow-up', duration: '30', insurance: 'Medicare Advantage', phone: '4255558901', providerId: 'dr-patterson' },
      { name: 'Carlos Mendoza', patientNumber: '76543', reason: 'Specialist Consultation', duration: '60', insurance: 'United Healthcare', phone: '7135551234', providerId: 'dr-sharma' }
    ];
    
    if (patientIndex >= 0 && patientIndex < patients.length) {
      const patient = patients[patientIndex];
      setFormData({
        patientName: patient.name,
        patientNumber: patient.patientNumber,
        visitReason: patient.reason,
        insuranceType: patient.insurance,
        phone: patient.phone,
        durationMinutes: patient.duration
      });
      setSelectedProvider(patient.providerId); // Set appropriate provider
      
      // Force immediate update of app_state after React state updates
      if ((window as any).app_state) {
        (window as any).app_state._timestamp = Date.now();
        (window as any).app_state._updateCounter = Math.random();
      }
    }
  };

  // Expose app state for testing - includes incremental form data for field-by-field testing
  useEffect(() => {
    // Expose helper function globally for testing
    (window as any).task22_fill_row = fillPatientForm;
    
    (window as any).app_state = {
      appointments,
      scheduledAppointments,
      providers,
      calendar,
      // Incremental form state for testing each field entry
      currentFormEntry: {
        patientName: formData.patientName,
        patientNumber: formData.patientNumber,
        visitReason: formData.visitReason,
        insuranceType: formData.insuranceType,
        phone: formData.phone,
        durationMinutes: formData.durationMinutes
      },
      // Form completion status for incremental testing
      formFieldsCompleted: {
        hasPatientName: !!formData.patientName.trim(),
        hasPatientNumber: !!formData.patientNumber.trim(),
        hasVisitReason: !!formData.visitReason.trim(),
        hasInsuranceType: !!formData.insuranceType,
        hasPhone: !!formData.phone.trim(),
        hasDuration: !!formData.durationMinutes
      },
      totalCreatedAppointments: appointments.length,
      totalScheduledAppointments: scheduledAppointments.length,
      // Add timestamp to ensure app_state changes are detected
      _timestamp: Date.now(),
      // Force update counter to ensure changes are detected
      _updateCounter: Math.random()
    };
  }, [appointments, scheduledAppointments, providers, calendar, formData, selectedProvider]);


  const scheduleAppointment = (appointment: Appointment, date: string, time: string) => {
    const provider = providers.find(p => p.id === selectedProvider);
    if (!provider) return;

    const scheduledAppointment = {
      ...appointment,
      scheduled: true,
      calendarSlot: `${date} ${time}`,
      doctorName: provider.name
    };

    // Update calendar
    setCalendar(prev => prev.map(day => {
      if (day.date === date) {
        return {
          ...day,
          timeSlots: day.timeSlots.map(slot => {
            if (slot.time === time) {
              return {
                ...slot,
                available: false,
                appointment: scheduledAppointment
              };
            }
            return slot;
          })
        };
      }
      return day;
    }));

    // Add to scheduled appointments
    setScheduledAppointments(prev => [...prev, scheduledAppointment]);

    // Remove from unscheduled appointments
    setAppointments(prev => prev.filter(apt => apt.id !== appointment.id));
  };

  const handleConflictResolve = (overwrite: boolean) => {
    if (!conflictDetails) return;

    if (overwrite) {
      const [date, time] = conflictDetails.slot.split(' ');
      
      // Remove existing appointment
      setScheduledAppointments(prev => 
        prev.filter(apt => apt.calendarSlot !== conflictDetails.slot)
      );

      // Add it back to unscheduled
      setAppointments(prev => [...prev, {
        ...conflictDetails.existing,
        scheduled: false,
        calendarSlot: undefined
      }]);

      // Schedule new appointment
      scheduleAppointment(conflictDetails.new, date, time);
    }

    setShowConflictDialog(false);
    setConflictDetails(null);
  };


  const handleRemoveAppointment = (appointment: Appointment) => {
    // Remove from calendar
    setCalendar(prev => prev.map(day => ({
      ...day,
      timeSlots: day.timeSlots.map(slot => {
        if (slot.appointment?.id === appointment.id) {
          return {
            ...slot,
            available: true,
            appointment: undefined
          };
        }
        return slot;
      })
    })));

    // Remove from scheduled appointments
    setScheduledAppointments(prev => prev.filter(apt => apt.id !== appointment.id));

    // Clear form if it matches the removed appointment
    if (formData.patientNumber === appointment.patientNumber) {
      setFormData({
        patientName: '',
        patientNumber: '',
        visitReason: '',
        insuranceType: '',
        phone: '',
        durationMinutes: ''
      });
      setSelectedProvider(''); // Also clear provider selection
    }

    // Don't add back to unscheduled appointments - completely remove the appointment
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to check if form is complete and ready for scheduling
  const isFormComplete = () => {
    return formData.patientName.trim() && 
           formData.patientNumber.trim() && 
           formData.visitReason.trim() && 
           formData.insuranceType && 
           formData.phone.trim() && 
           formData.durationMinutes && 
           selectedProvider;
  };

  const handleTimeSlotClick = (day: any, timeStr: string) => {
    // Check if form is complete
    if (!isFormComplete()) {
      return;
    }

    // Check if slot is already occupied
    const slot = day.timeSlots.find((s: any) => s.time === timeStr);
    if (slot?.appointment) {
      return;
    }

    const provider = providers.find(p => p.id === selectedProvider);
    if (!provider) return;

    const newAppointment = {
      id: `apt-${Date.now()}`,
      patientNumber: formData.patientNumber,
      patientName: formData.patientName,
      visitReason: formData.visitReason,
      insuranceType: formData.insuranceType,
      phone: formData.phone,
      durationMinutes: parseInt(formData.durationMinutes),
      doctorId: selectedProvider,
      doctorName: provider.name,
      calendarSlot: `${day.date} ${timeStr}`,
      appointmentDatetime: `${day.date} ${timeStr}`,
      scheduled: true
    };

    // Update calendar state to show the appointment
    setCalendar(prev => prev.map(calDay => {
      if (calDay.date === day.date) {
        return {
          ...calDay,
          timeSlots: calDay.timeSlots.map(slot => {
            if (slot.time === timeStr) {
              return {
                ...slot,
                available: false,
                appointment: newAppointment
              };
            }
            return slot;
          })
        };
      }
      return calDay;
    }));

    // Also update scheduledAppointments for tracking
    setScheduledAppointments([...scheduledAppointments, newAppointment]);
    
    // Clear form
    setFormData({
      patientName: '',
      patientNumber: '',
      visitReason: '',
      insuranceType: '',
      phone: '',
      durationMinutes: ''
    });
    setSelectedProvider('');
  };

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Medical Appointment Scheduling System
        </h1>

        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
          {/* Appointment Entry Panel */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Appointment Entry
            </h2>
            

            {/* Manual appointment entry form */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => handleFormChange('patientName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Patient Name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={formData.patientNumber}
                    onChange={(e) => handleFormChange('patientNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Patient ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => handleFormChange('durationMinutes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minutes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Reason
                </label>
                <input
                  type="text"
                  value={formData.visitReason}
                  onChange={(e) => handleFormChange('visitReason', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Visit Reason"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Type
                </label>
                <select 
                  value={formData.insuranceType}
                  onChange={(e) => handleFormChange('insuranceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select insurance type</option>
                  <option value="BlueCross PPO">BlueCross PPO</option>
                  <option value="Medicare Advantage">Medicare Advantage</option>
                  <option value="United Healthcare">United Healthcare</option>
                  <option value="Aetna">Aetna</option>
                  <option value="Cigna">Cigna</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone Number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Provider
                </label>
                <select 
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose provider for scheduling</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} - {provider.specialty}
                    </option>
                  ))}
                </select>
                {selectedProvider && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    ✓ {providers.find(p => p.id === selectedProvider)?.name} selected
                  </div>
                )}
                {isFormComplete() && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="text-sm text-blue-700 font-medium">
                      Select desired time slot on calendar
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>


          {/* Calendar Grid */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Schedule Calendar
            </h2>
            
            <div className="border border-gray-400">
              {/* Calendar Header */}
              <div className="grid grid-cols-6 gap-0 border-b border-gray-400">
                <div className="p-2 text-sm font-semibold text-gray-600 border-r border-gray-400 bg-gray-50">Time</div>
                {calendar.map(day => (
                  <div key={day.date} className="p-2 text-sm font-semibold text-center bg-gray-100 border-r border-gray-400 last:border-r-0">
                    {day.dayName}
                  </div>
                ))}
              </div>

              {/* Time Slots Grid */}
              <div>
                  {Array.from({ length: 20 }, (_, i) => {
                    const hour = Math.floor(i / 2) + 8;
                    const minute = (i % 2) * 30;
                    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    
                    return (
                      <div key={timeStr} className="grid grid-cols-6 gap-0 border-b border-gray-300">
                        <div className="p-2 text-xs text-gray-500 border-r border-gray-400 bg-gray-50 flex items-center">
                          {timeStr}
                        </div>
                        {calendar.map(day => {
                          const slot = day.timeSlots.find(s => s.time === timeStr);
                          const hasAppointment = slot?.appointment;
                          const slotKey = `${day.date}-${timeStr}`;
                          
                          return (
                            <div
                              key={slotKey}
                              className={`p-1 min-h-10 border-r border-gray-300 last:border-r-0 text-xs transition-all ${
                                hasAppointment
                                  ? 'bg-blue-100 border-blue-400'
                                  : isFormComplete()
                                  ? 'bg-white hover:bg-blue-100 cursor-pointer'
                                  : 'bg-white cursor-not-allowed opacity-75'
                              }`}
                              onClick={() => !hasAppointment && handleTimeSlotClick(day, timeStr)}
                            >
                              {hasAppointment && (
                                <div className="truncate relative group">
                                  <div className="font-semibold text-blue-900 text-xs">
                                    {hasAppointment.patientName}
                                  </div>
                                  <div className="text-green-700 text-xs font-medium">
                                    {hasAppointment.doctorName}
                                  </div>
                                  <div className="text-gray-600 text-xs">
                                    {hasAppointment.durationMinutes}min
                                  </div>
                                  <button
                                    onClick={() => handleRemoveAppointment(hasAppointment)}
                                    className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    title="Remove appointment"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          {/* Scheduled Appointments Column */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Scheduled Appointments ({scheduledAppointments.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scheduledAppointments.map(appointment => (
                <div key={appointment.id} className="bg-green-50 border border-green-200 rounded-lg p-3 relative group">
                  <div className="font-semibold text-green-900 text-sm">
                    {appointment.patientName}
                  </div>
                  <div className="text-xs text-gray-600">
                    Provider: {appointment.doctorName}
                  </div>
                  <div className="text-xs text-gray-600">
                    Scheduled: {appointment.calendarSlot ? 
                      `${new Date(appointment.calendarSlot.split(' ')[0]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${appointment.calendarSlot.split(' ')[1]}` 
                      : 'Not scheduled'}
                  </div>
                  <div className="text-xs text-gray-600">
                    Duration: {appointment.durationMinutes} min
                  </div>
                  <div className="text-xs text-gray-600">
                    Insurance: {appointment.insuranceType}
                  </div>
                  <button
                    onClick={() => handleRemoveAppointment(appointment)}
                    className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                    title="Remove appointment"
                  >
                    ×
                  </button>
                </div>
              ))}
              {scheduledAppointments.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  No appointments scheduled yet.<br/>
                  Complete the form and click calendar slots to schedule.
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Conflict Resolution Dialog */}
        {showConflictDialog && conflictDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-red-600">
                Scheduling Conflict Detected
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Time slot already occupied by:
                </p>
                <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                  <div className="font-semibold">{conflictDetails.existing.patientName}</div>
                  <div className="text-sm">{conflictDetails.existing.visitReason}</div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  New appointment:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="font-semibold">{conflictDetails.new.patientName}</div>
                  <div className="text-sm">{conflictDetails.new.visitReason}</div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleConflictResolve(true)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                >
                  Overwrite Existing
                </button>
                <button
                  onClick={() => handleConflictResolve(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
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

export default Task22;
