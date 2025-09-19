import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { 
  type TripSearchCriteria, 
  type Airport, 
  MOCK_AIRPORTS,
  getInitialTravelSearchCriteria 
} from '../data';
import Header from './Header';
import DateRangePicker from './DateRangePicker';

interface TravelSearchProps {
  searchCriteria: TripSearchCriteria;
  onSearchCriteriaChange: (criteria: TripSearchCriteria) => void;
  onSearch: () => void;
  isSearching: boolean;
  setCurrentView: (view: 'dashboard' | 'manage-expenses' | 'report-details' | 'travel-search' | 'travel-results' | 'travel-booking') => void;
}

const TravelSearch: React.FC<TravelSearchProps> = ({
  searchCriteria,
  onSearchCriteriaChange,
  onSearch,
  isSearching,
  setCurrentView
}) => {
  const [showFromAirportDropdown, setShowFromAirportDropdown] = useState(false);
  const [showToAirportDropdown, setShowToAirportDropdown] = useState(false);
  
  const updateSearchCriteria = (updates: Partial<TripSearchCriteria>) => {
    onSearchCriteriaChange({ ...searchCriteria, ...updates });
  };

  const handleAirportSelect = (airport: Airport, field: 'from' | 'to') => {
    if (field === 'from') {
      updateSearchCriteria({ fromAirport: airport });
      setShowFromAirportDropdown(false);
    } else {
      updateSearchCriteria({ toAirport: airport });
      setShowToAirportDropdown(false);
    }
  };

  const filteredFromAirports = MOCK_AIRPORTS.filter(airport => 
    airport.code !== searchCriteria.toAirport?.code
  );
  
  const filteredToAirports = MOCK_AIRPORTS.filter(airport => 
    airport.code !== searchCriteria.fromAirport?.code
  );

  const canSearch = searchCriteria.fromAirport && 
                   searchCriteria.toAirport && 
                   searchCriteria.departureDate &&
                   (searchCriteria.tripType !== 'round-trip' || searchCriteria.returnDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setCurrentView={setCurrentView} />
      
      <div className="bg-white">
        {/* Header with Back Button */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Dashboard</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Book Travel</h1>
            </div>
            <div className="flex space-x-4">
              <button className="border-b-2 border-blue-600 pb-2 text-sm font-medium text-blue-600">
                Flights
              </button>
              <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Hotels
              </button>
              <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Packages
              </button>
            </div>
          </div>
        </div>

      {/* Search Form */}
      <div className="px-6 py-6">
        <div className="mx-auto max-w-4xl">
          {/* Trip Type Selector */}
          <div className="mb-6 flex space-x-6">
            {(['round-trip', 'one-way', 'multi-city'] as const).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="tripType"
                  value={type}
                  checked={searchCriteria.tripType === type}
                  onChange={(e) => updateSearchCriteria({ tripType: e.target.value as any })}
                  className="mr-2 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {type.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>

          {/* Airport and Date Selection */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* From Airport */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFromAirportDropdown(!showFromAirportDropdown)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {searchCriteria.fromAirport ? (
                    <div>
                      <div className="font-medium text-gray-900">
                        {searchCriteria.fromAirport.code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {searchCriteria.fromAirport.city}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select departure city</span>
                  )}
                </button>
                
                {showFromAirportDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                    <div className="max-h-60 overflow-auto rounded-md py-1 shadow-xs">
                      {filteredFromAirports.map((airport) => (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => handleAirportSelect(airport, 'from')}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                        >
                          <div className="font-medium text-gray-900">{airport.code}</div>
                          <div className="text-sm text-gray-600">{airport.name}</div>
                          <div className="text-xs text-gray-500">{airport.distanceFromCity}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* To Airport */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowToAirportDropdown(!showToAirportDropdown)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {searchCriteria.toAirport ? (
                    <div>
                      <div className="font-medium text-gray-900">
                        {searchCriteria.toAirport.code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {searchCriteria.toAirport.city}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select destination city</span>
                  )}
                </button>
                
                {showToAirportDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                    <div className="max-h-60 overflow-auto rounded-md py-1 shadow-xs">
                      {filteredToAirports.map((airport) => (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => handleAirportSelect(airport, 'to')}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                        >
                          <div className="font-medium text-gray-900">{airport.code}</div>
                          <div className="text-sm text-gray-600">{airport.name}</div>
                          <div className="text-xs text-gray-500">{airport.distanceFromCity}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="md:col-span-2">
              <DateRangePicker
                tripType={searchCriteria.tripType}
                departureDate={searchCriteria.departureDate}
                returnDate={searchCriteria.returnDate}
                onDepartureDateChange={(date) => updateSearchCriteria({ departureDate: date })}
                onReturnDateChange={(date) => updateSearchCriteria({ returnDate: date })}
              />
            </div>
          </div>

          {/* Passengers and Class */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Passengers */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Passengers</label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500">Adults</label>
                  <select
                    value={searchCriteria.passengers.adults}
                    onChange={(e) => updateSearchCriteria({
                      passengers: { ...searchCriteria.passengers, adults: parseInt(e.target.value) }
                    })}
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500">Children</label>
                  <select
                    value={searchCriteria.passengers.children}
                    onChange={(e) => updateSearchCriteria({
                      passengers: { ...searchCriteria.passengers, children: parseInt(e.target.value) }
                    })}
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Class */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
              <select
                value={searchCriteria.class}
                onChange={(e) => updateSearchCriteria({ class: e.target.value as any })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </div>

            {/* Time Filters */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Time Preferences</label>
              <div className="grid grid-cols-2 gap-2">
                {/* Departure Time */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Departure</label>
                  <div className="flex space-x-1">
                    <select
                      value={searchCriteria.timeFilters.departureStart}
                      onChange={(e) => updateSearchCriteria({
                        timeFilters: {
                          ...searchCriteria.timeFilters,
                          departureStart: parseInt(e.target.value)
                        }
                      })}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {Array.from({length: 24}, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500 py-1">to</span>
                    <select
                      value={searchCriteria.timeFilters.departureEnd}
                      onChange={(e) => updateSearchCriteria({
                        timeFilters: {
                          ...searchCriteria.timeFilters,
                          departureEnd: parseInt(e.target.value)
                        }
                      })}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {Array.from({length: 24}, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Arrival Time */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Arrival</label>
                  <div className="flex space-x-1">
                    <select
                      value={searchCriteria.timeFilters.arrivalStart}
                      onChange={(e) => updateSearchCriteria({
                        timeFilters: {
                          ...searchCriteria.timeFilters,
                          arrivalStart: parseInt(e.target.value)
                        }
                      })}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {Array.from({length: 24}, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500 py-1">to</span>
                    <select
                      value={searchCriteria.timeFilters.arrivalEnd}
                      onChange={(e) => updateSearchCriteria({
                        timeFilters: {
                          ...searchCriteria.timeFilters,
                          arrivalEnd: parseInt(e.target.value)
                        }
                      })}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {Array.from({length: 24}, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={onSearch}
              disabled={!canSearch || isSearching}
              className={`rounded-md px-8 py-3 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                canSearch && !isSearching
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSearching ? 'Searching...' : 'Search Flights'}
            </button>
          </div>
        </div>
      </div>

      {/* Travel Advisory Notice */}
      <div className="border-t border-gray-200 bg-yellow-50 px-6 py-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400">
              <span className="text-xs font-bold text-yellow-800">!</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>TSA Security Notice:</strong> Secure Flight Passenger Data (SFPD) is required for all domestic and international flights. 
              Please ensure your travel documents are up to date.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TravelSearch;
