import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, PlusCircle, Calendar, Plus, MoreHorizontal, Plane, Car, Hotel, X, MapPin } from 'lucide-react';
import { type Expense, type TripSearchCriteria, type Airport, MOCK_AIRPORTS } from '../data';
import Header from './Header';
import DateRangePicker from './DateRangePicker';

interface DashboardProps {
  availableExpenses: Expense[];
  showCreateDropdown: boolean;
  setShowCreateDropdown: (show: boolean) => void;
  showOverflowMenu: boolean;
  setShowOverflowMenu: (show: boolean) => void;
  setCurrentView: (view: 'dashboard' | 'manage-expenses' | 'report-details') => void;
  resetReportForm: () => void;
  setFieldErrors: (errors: Record<string, boolean>) => void;
  setIsEditMode: (editMode: boolean) => void;
  setShowCreateReportModal: (show: boolean) => void;
  // Travel search props
  travelSearchCriteria: TripSearchCriteria;
  onTravelSearchCriteriaChange: (criteria: TripSearchCriteria) => void;
  onTravelSearch: () => void;
  isTravelSearching: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  availableExpenses,
  showCreateDropdown,
  setShowCreateDropdown,
  showOverflowMenu,
  setShowOverflowMenu,
  setCurrentView,
  resetReportForm,
  setFieldErrors,
  setIsEditMode,
  setShowCreateReportModal,
  travelSearchCriteria,
  onTravelSearchCriteriaChange,
  onTravelSearch,
  isTravelSearching
}) => {
  // TripIt banner visibility state
  const [showTripItNotification, setShowTripItNotification] = useState(true);
  const [showTripItFeatureBanner, setShowTripItFeatureBanner] = useState(true);
  
  // Flight search state
  const [showFromAirportDropdown, setShowFromAirportDropdown] = useState(false);
  const [showToAirportDropdown, setShowToAirportDropdown] = useState(false);
  const [fromSearchText, setFromSearchText] = useState('');
  const [toSearchText, setToSearchText] = useState('');
  
  // Helper functions for travel search
  const updateTravelSearchCriteria = (updates: Partial<TripSearchCriteria>) => {
    const newCriteria = { ...travelSearchCriteria, ...updates };
    onTravelSearchCriteriaChange(newCriteria);
  };
  
  // Format time range for display (e.g., "5:00 AM - 9:00 PM" or "Anytime")
  const formatTimeRange = (startHour: number, endHour: number) => {
    // Check if this is the full day range (anytime)
    if (startHour === 0 && endHour === 23) {
      return "Anytime";
    }
    
    // Format individual times
    const formatHour = (hour: number) => {
      const isPM = hour >= 12;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${isPM ? 'PM' : 'AM'}`;
    };
    
    return `${formatHour(startHour)} - ${formatHour(endHour)}`;
  };

  const handleAirportSelect = (airport: Airport, field: 'from' | 'to') => {
    if (field === 'from') {
      updateTravelSearchCriteria({ fromAirport: airport });
      setShowFromAirportDropdown(false);
      setFromSearchText('');
    } else {
      updateTravelSearchCriteria({ toAirport: airport });
      setShowToAirportDropdown(false);
      setToSearchText('');
    }
  };

  // Filter and group airports/cities based on search text
  const getFilteredResults = (searchText: string, excludeAirport?: Airport) => {
    const lowerSearch = searchText.toLowerCase();
    const filteredAirports = MOCK_AIRPORTS.filter(airport => 
      airport.code !== excludeAirport?.code &&
      (airport.code.toLowerCase().includes(lowerSearch) ||
       airport.name.toLowerCase().includes(lowerSearch) ||
       airport.city.toLowerCase().includes(lowerSearch))
    );

    // Group airports by city
    const citiesMap = new Map<string, { city: Airport; airports: Airport[] }>();
    
    filteredAirports.forEach(airport => {
      const cityKey = `${airport.city}, ${airport.state ? airport.state + ', ' : ''}${airport.country}`;
      if (!citiesMap.has(cityKey)) {
        citiesMap.set(cityKey, {
          city: airport, // Use first airport as city representative
          airports: []
        });
      }
      citiesMap.get(cityKey)!.airports.push(airport);
    });

    return Array.from(citiesMap.values());
  };

  const canSearch = travelSearchCriteria.fromAirport && 
                   travelSearchCriteria.toAirport && 
                   travelSearchCriteria.departureDate &&
                   (travelSearchCriteria.tripType !== 'round-trip' || travelSearchCriteria.returnDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setCurrentView={setCurrentView} />
      
      {/* Hero Banner Section */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-4">
        <div className="relative">
          <div 
            className="h-48 rounded-lg"
            style={{
              backgroundImage: 'url(/images/concur/concur-hero-banner.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Action Cards - Below Hero */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-4">
        {/* Action Cards with Overflow Menu */}
        <div className="flex gap-1 mb-6">
          {/* Create Button - Always visible */}
          <div className="relative create-dropdown-container">
            <div 
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="bg-blue-500 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center gap-3 min-w-[120px] h-full"
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0" />
              <div className="text-sm font-medium">Create</div>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </div>
            
            {showCreateDropdown && (
              <div className="absolute top-full left-0 -mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                <div className="py-1">
                  <div 
                    onClick={() => {
                      resetReportForm(); // Initialize form with fresh values
                      setFieldErrors({}); // Clear any previous errors
                      setIsEditMode(false); // Set to create mode
                      setShowCreateReportModal(true);
                      setShowCreateDropdown(false);
                    }}
                    className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                  >
                    <PlusCircle className="w-4 h-4 text-blue-500" />
                    Start a Report
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-green-500" />
                    Start a Request
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
                    <Hotel className="w-4 h-4 text-purple-500" />
                    Enter Reservation
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 1536px+: Show all 5 buttons */}  
          <div className="hidden 2xl:flex gap-1 flex-1">
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <User className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">Required Approvals</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">0</div>
            </div>
            
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">Authorization Requests</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">0</div>
            </div>
            
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">View Trips</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">0</div>
            </div>
            
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">Available Expenses</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">3</div>
            </div>

            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">Expense Reports</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">0</div>
            </div>
          </div>

          {/* 1400px-1600px: Show 3 buttons + overflow menu */}
          <div className="hidden xl:flex 2xl:hidden gap-1 flex-1">
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <User className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">Required Approvals</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">0</div>
            </div>
            
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">Authorization Requests</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">0</div>
            </div>
            
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">Available Expenses</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">3</div>
            </div>
            
            {/* Overflow menu */}
            <div className="relative overflow-menu-container">
              <div 
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center min-h-[48px] min-w-[60px]"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </div>
              
              {showOverflowMenu && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-blue-500" />
                        <span>View Trips</span>
                      </div>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Expense Reports</span>
                      </div>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 1200px-1400px: Show 2 buttons + overflow menu */}
          <div className="hidden lg:flex xl:hidden gap-1 flex-1">
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">Available Expenses</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">3</div>
            </div>
            
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">Authorization Requests</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">0</div>
            </div>
            
            {/* Overflow menu */}
            <div className="relative overflow-menu-container">
              <div 
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center min-h-[48px] min-w-[60px]"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </div>
              
              {showOverflowMenu && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-pink-500" />
                        <span>Required Approvals</span>
                      </div>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-blue-500" />
                        <span>View Trips</span>
                      </div>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Expense Reports</span>
                      </div>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 800px-1200px: Show 1 button + overflow menu */}
          <div className="hidden md:flex lg:hidden gap-1 flex-1">
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center min-h-[48px] min-w-[180px] flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-700">Available Expenses</div>
              </div>
              <div className="text-lg font-bold text-gray-900 ml-8">3</div>
            </div>
            
            {/* Overflow menu */}
            <div className="relative overflow-menu-container">
              <div 
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center min-h-[48px] min-w-[60px]"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </div>
              
              {showOverflowMenu && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-pink-500" />
                        <span>Required Approvals</span>
                      </div>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span>Authorization Requests</span>
                      </div>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-blue-500" />
                        <span>View Trips</span>
                      </div>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Expense Reports</span>
                      </div>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>



          {/* Mobile: Only overflow menu */}
          <div className="relative overflow-menu-container md:hidden flex-1">
            <div 
              onClick={() => setShowOverflowMenu(!showOverflowMenu)}
              className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center min-h-[48px] w-full"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </div>
            
            {showOverflowMenu && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                <div className="py-2">
                  <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-pink-500" />
                      <span>Required Approvals</span>
                    </div>
                    <span className="font-bold text-gray-900">0</span>
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span>Authorization Requests</span>
                    </div>
                    <span className="font-bold text-gray-900">0</span>
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-blue-500" />
                      <span>View Trips</span>
                    </div>
                    <span className="font-bold text-gray-900">0</span>
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-blue-500" />
                      <span>Available Expenses</span>
                    </div>
                    <span className="font-bold text-gray-900">3</span>
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>Expense Reports</span>
                    </div>
                    <span className="font-bold text-gray-900">0</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-10">
          {/* Left Column */}
          <div className="xl:col-span-1">
            {/* TechFlow Logo Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TF</span>
                </div>
                <span className="text-lg font-medium text-gray-900">TechFlow</span>
              </div>
            </div>
              
            {/* Combined Flight Search Card with Transportation Icons and TSA Warning */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              {/* Transportation Icons */}
              <div className="flex">
                <button className="flex-1 flex items-center justify-center py-4 px-6 border-b-2 border-blue-500 text-blue-600">
                  <Plane className="w-5 h-5" />
                </button>
                <button className="flex-1 flex items-center justify-center py-4 px-6 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                  <Car className="w-5 h-5" />
                </button>
                <button className="flex-1 flex items-center justify-center py-4 px-6 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                  <Hotel className="w-5 h-5" />
                </button>
              </div>

              {/* TSA Warning */}
              <div className="p-4 border-b border-gray-200">
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="text-sm font-bold text-red-600 mb-2">
                    The U.S. Transportation Security Administration (TSA) has advised that all passenger reservations containing any U.S. city segment or flying over U.S. airspace or booked on a U.S.-based carrier must contain full Secure Flight Passenger Data (SFPD), including full name as it appears on your travel document, date of birth, and gender. Failure to provide this information will result in your reservation being cancelled.
                  </div>
                  <div className="text-sm text-gray-700">
                    Please remember to book your hotel with all overnight trips. This will drive company savings, improve traveler security, and ensure hotel loyalty points are credited.
                  </div>
                </div>
              </div>

              {/* Flight Search Section */}
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Flight Search</h3>
                  <div className="space-y-3">
                    {/* Trip Type Selector */}
                    <div className="flex space-x-2">
                      {(['round-trip', 'one-way', 'multi-city'] as const).map((type) => (
                        <button 
                          key={type}
                          onClick={() => updateTravelSearchCriteria({ tripType: type })}
                          className={`px-3 py-2 text-sm rounded ${
                            travelSearchCriteria.tripType === type
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type === 'round-trip' ? 'Round-trip' : type === 'one-way' ? 'One-way' : 'Multi-city'}
                        </button>
                      ))}
                    </div>
                    
                    {/* From Airport */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-700 mb-1">From *</label>
                      <input 
                        type="text"
                        placeholder="Enter airport, city, or location"
                        value={travelSearchCriteria.fromAirport ? 
                          `${travelSearchCriteria.fromAirport.code} - ${travelSearchCriteria.fromAirport.name}` : 
                          fromSearchText
                        }
                        onChange={(e) => {
                          setFromSearchText(e.target.value);
                          if (!e.target.value && travelSearchCriteria.fromAirport) {
                            updateTravelSearchCriteria({ fromAirport: null });
                          }
                        }}
                        onFocus={() => setShowFromAirportDropdown(true)}
                        onBlur={() => setTimeout(() => setShowFromAirportDropdown(false), 200)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      
                      {showFromAirportDropdown && (fromSearchText || !travelSearchCriteria.fromAirport) && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {getFilteredResults(fromSearchText, travelSearchCriteria.toAirport).map((cityGroup) => (
                            <div key={`${cityGroup.city.city}-${cityGroup.city.state}-${cityGroup.city.country}`}>
                              {/* City Header */}
                              <button
                                type="button"
                                onClick={() => {
                                  // Select the first/main airport in the city
                                  handleAirportSelect(cityGroup.airports[0], 'from');
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center border-b border-gray-100"
                              >
                                <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                                <div>
                                  <div className="font-medium text-gray-900">{cityGroup.city.city}</div>
                                  <div className="text-sm text-gray-600">
                                    {cityGroup.city.city}, {cityGroup.city.state ? `${cityGroup.city.state}, ` : ''}{cityGroup.city.countryFull}
                                  </div>
                                </div>
                              </button>
                              
                              {/* Airports in this city */}
                              {cityGroup.airports.map((airport) => (
                                <button
                                  key={airport.code}
                                  type="button"
                                  onClick={() => handleAirportSelect(airport, 'from')}
                                  className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center pl-8"
                                >
                                  <Plane className="w-4 h-4 mr-3 text-gray-400" />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {airport.code} - {airport.name}
                                    </div>
                                    <div className="text-sm text-gray-600">{airport.distanceFromCity}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* To Airport */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-700 mb-1">To *</label>
                      <input 
                        type="text"
                        placeholder="Enter airport, city, or location"
                        value={travelSearchCriteria.toAirport ? 
                          `${travelSearchCriteria.toAirport.code} - ${travelSearchCriteria.toAirport.name}` : 
                          toSearchText
                        }
                        onChange={(e) => {
                          setToSearchText(e.target.value);
                          if (!e.target.value && travelSearchCriteria.toAirport) {
                            updateTravelSearchCriteria({ toAirport: null });
                          }
                        }}
                        onFocus={() => setShowToAirportDropdown(true)}
                        onBlur={() => setTimeout(() => setShowToAirportDropdown(false), 200)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      
                      {showToAirportDropdown && (toSearchText || !travelSearchCriteria.toAirport) && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {getFilteredResults(toSearchText, travelSearchCriteria.fromAirport).map((cityGroup) => (
                            <div key={`${cityGroup.city.city}-${cityGroup.city.state}-${cityGroup.city.country}`}>
                              {/* City Header */}
                              <button
                                type="button"
                                onClick={() => {
                                  // Select the first/main airport in the city
                                  handleAirportSelect(cityGroup.airports[0], 'to');
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center border-b border-gray-100"
                              >
                                <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                                <div>
                                  <div className="font-medium text-gray-900">{cityGroup.city.city}</div>
                                  <div className="text-sm text-gray-600">
                                    {cityGroup.city.city}, {cityGroup.city.state ? `${cityGroup.city.state}, ` : ''}{cityGroup.city.countryFull}
                                  </div>
                                </div>
                              </button>
                              
                              {/* Airports in this city */}
                              {cityGroup.airports.map((airport) => (
                                <button
                                  key={airport.code}
                                  type="button"
                                  onClick={() => handleAirportSelect(airport, 'to')}
                                  className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center pl-8"
                                >
                                  <Plane className="w-4 h-4 mr-3 text-gray-400" />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {airport.code} - {airport.name}
                                    </div>
                                    <div className="text-sm text-gray-600">{airport.distanceFromCity}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Dates */}
                    <div className="mb-3">
                      <DateRangePicker
                        tripType={travelSearchCriteria.tripType}
                        departureDate={travelSearchCriteria.departureDate}
                        returnDate={travelSearchCriteria.returnDate}
                        onDepartureDateChange={(date) => updateTravelSearchCriteria({ departureDate: date })}
                        onReturnDateChange={(date) => updateTravelSearchCriteria({ returnDate: date })}
                        onBothDatesChange={(departure, returnDate) => updateTravelSearchCriteria({ departureDate: departure, returnDate })}
                        onTimeRangeChange={(departureStart, departureEnd, arrivalStart, arrivalEnd) => {
                          updateTravelSearchCriteria({
                            timeFilters: {
                              departureStart,
                              departureEnd,
                              arrivalStart,
                              arrivalEnd
                            }
                          });
                        }}
                      />
                      
                      {/* Time Range Display */}
                      {travelSearchCriteria.departureDate && (
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium">Outbound:</span>
                            <span className="ml-1">
                              {formatTimeRange(
                                travelSearchCriteria.timeFilters.departureStart, 
                                travelSearchCriteria.timeFilters.departureEnd
                              )} (Departure Time)
                            </span>
                          </div>
                          
                          {travelSearchCriteria.tripType === 'round-trip' && travelSearchCriteria.returnDate && (
                            <div className="flex items-center mt-1">
                              <span className="font-medium">Return:</span>
                              <span className="ml-1">
                                {formatTimeRange(
                                  travelSearchCriteria.timeFilters.arrivalStart, 
                                  travelSearchCriteria.timeFilters.arrivalEnd
                                )} (Arrival Time)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Cabin Class */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cabin</label>
                      <select 
                        value={travelSearchCriteria.class}
                        onChange={(e) => updateTravelSearchCriteria({ class: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Economy">Economy</option>
                        <option value="Premium Economy">Premium Economy</option>
                        <option value="Business">Business</option>
                        <option value="First">First</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <button 
                  onClick={onTravelSearch}
                  disabled={!canSearch || isTravelSearching}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    canSearch && !isTravelSearching
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isTravelSearching ? 'Searching...' : 'Search Flights'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-2">
            {/* TripIt Promotional Banner */}
            {showTripItNotification && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">You are eligible for a free subscription to TripIt Pro</span>, provided by your employer.{' '}
                        <a href="#" className="underline text-blue-800 hover:text-blue-900">Learn More and Activate</a>
                        <span className="mx-2">|</span>
                        <a href="#" className="underline text-blue-800 hover:text-blue-900">Not right now</a>
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button 
                      onClick={() => setShowTripItNotification(false)}
                      className="text-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TripIt Feature Banner */}
            {showTripItFeatureBanner && (
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-6 rounded-lg mb-6 hidden xl:block">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Don't miss out – activate your free TripIt Pro subscription.
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Get access to this itinerary-organizing app with helpful features like real-time flight alerts, 
                      interactive airport maps, and more.
                    </p>
                    <button className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 transition-colors">
                      Get Started
                    </button>
                  </div>
                  <div className="flex-shrink-0 ml-8">
                    <div className="flex items-center">
                      <div className="text-4xl font-bold text-orange-400 mr-4">TripIt</div>
                      <div className="w-24 h-16 bg-blue-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-8 bg-blue-400 rounded mb-1 mx-auto"></div>
                          <div className="text-xs text-blue-600">Mobile App</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <button 
                      onClick={() => setShowTripItFeatureBanner(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
              {/* Available Expenses */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Available Expenses ({availableExpenses.length})</h3>
                  <div className="text-xs">
                    <button 
                      onClick={() => setCurrentView('manage-expenses')}
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      See All
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {availableExpenses.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-sm">No available expenses</div>
                    </div>
                  ) : (
                    availableExpenses.map((expense, index) => {
                      // Extract vendor name from vendorDetails (first line)
                      const vendorName = expense.vendorDetails.split('\n')[0];
                      
                      return (
                        <div key={expense.id} className={`flex items-center justify-between py-2 ${index < availableExpenses.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <div className="flex-1">
                            <div className="text-base font-semibold text-gray-900">{vendorName}</div>
                            <div className="text-sm text-gray-500">{expense.date}</div>
                          </div>
                          <div className="text-base font-semibold text-blue-600">{expense.amount}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Expense Reports */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Reports</h3>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-2">No Reports</div>
                  <div className="text-xs text-gray-600">When you have reports, you'll see them here.</div>
                </div>
              </div>

              {/* Travel Booking */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Book Travel</h3>
                  <button 
                    onClick={() => setCurrentView('travel-search')}
                    className="text-blue-600 hover:underline font-medium text-sm cursor-pointer"
                  >
                    Search Flights
                  </button>
                </div>
                <div className="space-y-3">
                  <div 
                    onClick={() => setCurrentView('travel-search')}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Plane className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Search Flights</div>
                        <div className="text-xs text-gray-500">Find and book business travel</div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Hotel className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Search Hotels</div>
                        <div className="text-xs text-gray-400">Coming soon</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Rental Cars</div>
                        <div className="text-xs text-gray-400">Coming soon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approvals */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Approvals</h3>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-2">No Approvals</div>
                  <div className="text-xs text-gray-600">When you have approvals, you'll see them here</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
