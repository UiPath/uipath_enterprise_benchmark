import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users } from 'lucide-react';

// Seeded random number generator for deterministic results
class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

interface CalendarEvent {
  id: string;
  title: string;
  type: 'Meeting' | 'Appointment' | 'Call' | 'Deadline';
  date: string;
  time: string;
  duration: number; // in minutes
  attendees: string[];
  color: string;
}

interface PlanningEntry {
  date: string;
  title: string;
  attendees: string;
  duration: string;
}

const Task10: React.FC = () => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [planningEntries, setPlanningEntries] = useState<PlanningEntry[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Generate deterministic calendar data
  useEffect(() => {
    const rng = new SeededRandom(12345);
    const generatedEvents: CalendarEvent[] = [];
    
    // Generate realistic attendee names and emails
    const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Jessica', 'James', 'Ashley', 'Christopher', 'Amanda', 'Daniel', 'Stephanie'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
    const domains = ['company.com', 'corp.com', 'business.com', 'enterprise.com', 'solutions.com'];

    const generateEmail = () => {
      const firstName = firstNames[Math.floor(rng.next() * firstNames.length)];
      const lastName = lastNames[Math.floor(rng.next() * lastNames.length)];
      const domain = domains[Math.floor(rng.next() * domains.length)];
      return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    };

    // Get current date and next 3 months
    const today = new Date();
    const months = [];
    for (let i = 0; i < 3; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push(month);
    }

    // Generate events for 3 months
    let eventId = 1;
    let meetingCount = 0;
    const targetMeetings = 15;

    // First generate the 15 required meetings
    for (let i = 0; i < targetMeetings; i++) {
      const monthIndex = Math.floor(rng.next() * 3);
      const month = months[monthIndex];
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      const day = Math.floor(rng.next() * daysInMonth) + 1;
      
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      
      const hour = Math.floor(rng.next() * 8) + 9; // 9 AM to 4 PM
      const minute = Math.floor(rng.next() * 4) * 15; // 0, 15, 30, 45
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      const duration = (Math.floor(rng.next() * 7) + 2) * 15; // 30-120 minutes in 15-min increments
      const attendeeCount = Math.floor(rng.next() * 7) + 2; // 2-8 attendees
      const attendees = [];
      for (let j = 0; j < attendeeCount; j++) {
        attendees.push(generateEmail());
      }

      const meetingTitles = [
        'Project Planning Meeting', 'Team Standup', 'Client Review', 'Budget Discussion',
        'Strategy Session', 'Product Demo', 'Quarterly Review', 'Design Review',
        'Technical Discussion', 'Sales Meeting', 'Marketing Sync', 'Operations Update',
        'Performance Review', 'Training Session', 'Board Meeting'
      ];
      
      generatedEvents.push({
        id: `event-${eventId++}`,
        title: meetingTitles[meetingCount % meetingTitles.length],
        type: 'Meeting',
        date: dateStr,
        time: timeStr,
        duration,
        attendees,
        color: '#3B82F6' // Blue for meetings
      });
      meetingCount++;
    }

    // Generate other event types to differentiate from meetings
    const otherEventTypes = [
      { type: 'Appointment', color: '#10B981', titles: ['Doctor Appointment', 'Client Appointment', 'Interview', 'Consultation'] },
      { type: 'Call', color: '#F59E0B', titles: ['Conference Call', 'Client Call', 'Vendor Call', 'Support Call'] },
      { type: 'Deadline', color: '#EF4444', titles: ['Project Deadline', 'Report Due', 'Submission Deadline', 'Review Deadline'] }
    ] as const;

    // Generate 25 additional events of other types
    for (let i = 0; i < 25; i++) {
      const monthIndex = Math.floor(rng.next() * 3);
      const month = months[monthIndex];
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      const day = Math.floor(rng.next() * daysInMonth) + 1;
      
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      
      const hour = Math.floor(rng.next() * 8) + 9;
      const minute = Math.floor(rng.next() * 4) * 15;
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      const eventTypeData = otherEventTypes[Math.floor(rng.next() * otherEventTypes.length)];
      const duration = (Math.floor(rng.next() * 7) + 2) * 15;
      const attendeeCount = Math.floor(rng.next() * 4) + 1; // 1-4 attendees for non-meetings
      const attendees = [];
      for (let j = 0; j < attendeeCount; j++) {
        attendees.push(generateEmail());
      }

      generatedEvents.push({
        id: `event-${eventId++}`,
        title: eventTypeData.titles[Math.floor(rng.next() * eventTypeData.titles.length)],
        type: eventTypeData.type,
        date: dateStr,
        time: timeStr,
        duration,
        attendees,
        color: eventTypeData.color
      });
    }

    // Sort events by date for consistent display
    generatedEvents.sort((a, b) => a.date.localeCompare(b.date));
    setEvents(generatedEvents);
  }, []);

  // Expose state for testing
  useEffect(() => {
    const meetingEvents = events.filter(e => e.type === 'Meeting');
    const eligibleMeetings = meetingEvents.filter(e => e.attendees.length >= 5);
    
    (window as any).app_state = {
      events,
      planningEntries,
      currentMonthIndex,
      meetingEvents,
      eligibleMeetings
    };
  }, [events, planningEntries, currentMonthIndex]);

  const getCurrentMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + currentMonthIndex, 1);
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleAddToPlan = () => {
    if (selectedEvent && selectedEvent.type === 'Meeting' && selectedEvent.attendees.length >= 5) {
      const newEntry: PlanningEntry = {
        date: selectedEvent.date,
        title: selectedEvent.title,
        attendees: selectedEvent.attendees.join(', '),
        duration: `${selectedEvent.duration} minutes`
      };
      
      // Check if already added
      const exists = planningEntries.some(entry => 
        entry.date === newEntry.date && entry.title === newEntry.title
      );
      
      if (!exists) {
        setPlanningEntries([...planningEntries, newEntry]);
      }
    }
  };

  const renderCalendar = () => {
    const currentMonth = getCurrentMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-1 border border-gray-200 bg-white" style={{ height: '120px' }}></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = getEventsForDate(dateStr);

      days.push(
        <div key={day} className="p-1 border border-gray-200 bg-white flex flex-col overflow-hidden" style={{ height: '120px' }}>
          <div className="text-sm font-medium text-gray-700 mb-1 flex-shrink-0">{day}</div>
          <div className="flex flex-col gap-1 overflow-hidden flex-1">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                className="text-xs px-1 py-0.5 rounded cursor-pointer hover:opacity-80 truncate flex-shrink-0"
                style={{ backgroundColor: event.color, color: 'white', lineHeight: '1.2', minHeight: '18px' }}
                onClick={() => handleEventClick(event)}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 flex-shrink-0">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Calendar Panel */}
      <div className="flex-1 p-6 flex flex-col min-h-0">
        <div className="bg-white rounded-lg shadow-sm flex flex-col">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Event Calendar
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentMonthIndex(Math.max(0, currentMonthIndex - 1))}
                disabled={currentMonthIndex === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-medium min-w-[200px] text-center">
                {getMonthName(getCurrentMonth())}
              </span>
              <button
                onClick={() => setCurrentMonthIndex(Math.min(2, currentMonthIndex + 1))}
                disabled={currentMonthIndex === 2}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4 flex flex-col">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {renderCalendar()}
            </div>
            
            {/* Legend - positioned right after calendar days */}
            <div className="border-t bg-gray-50 px-2 py-3">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
                  <span>Meetings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981' }}></div>
                  <span>Appointments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                  <span>Calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                  <span>Deadlines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details & Planning Panel */}
      <div className="w-96 p-6 flex flex-col min-h-0 overflow-hidden">
        <div className="space-y-6 overflow-y-auto">
          {/* Event Details */}
          {selectedEvent && (
            <div className="bg-white rounded-lg shadow-sm p-4 flex-shrink-0">
              <h3 className="text-lg font-semibold mb-3">Event Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-sm">{selectedEvent.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-sm">{selectedEvent.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date & Time</label>
                  <p className="text-sm">{selectedEvent.date} at {selectedEvent.time}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedEvent.duration} minutes
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Attendees</label>
                  <div className="text-sm space-y-1">
                    <p className="flex items-center gap-1 mb-2">
                      <Users className="w-4 h-4" />
                      {selectedEvent.attendees.length} attendees
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <p key={index} className="text-xs text-gray-600 ml-5 break-all">{attendee}</p>
                      ))}
                    </div>
                  </div>
                </div>
                {selectedEvent.type === 'Meeting' && (
                  <button
                    onClick={handleAddToPlan}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add to Planning Form
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Planning Form */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex-shrink-0">
            <h3 className="text-lg font-semibold mb-3">Event Planning Form</h3>
            <div className="space-y-3">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b">
                      <th className="text-left py-2 px-1">Date</th>
                      <th className="text-left py-2 px-1">Meeting Title</th>
                      <th className="text-left py-2 px-1">Attendees</th>
                      <th className="text-left py-2 px-1">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planningEntries.map((entry, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-1 text-xs">{entry.date}</td>
                        <td className="py-2 px-1 text-xs">{entry.title}</td>
                        <td className="py-2 px-1 text-xs" title={entry.attendees}>
                          <div className="max-w-24 truncate">
                            {entry.attendees.length > 30 ? entry.attendees.substring(0, 30) + '...' : entry.attendees}
                          </div>
                        </td>
                        <td className="py-2 px-1 text-xs">{entry.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {planningEntries.length === 0 && (
                  <p className="text-gray-500 text-center py-4 text-sm">
                    No meetings added to planning form yet. Click on meeting events in the calendar to add them.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task10;
