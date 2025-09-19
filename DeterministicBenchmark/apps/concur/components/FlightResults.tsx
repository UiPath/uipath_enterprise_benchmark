import React, { useState, useRef, useEffect } from 'react';
import { Filter, Search, ChevronDown, Star, Plane, Leaf, AlertTriangle, Info, CircleDollarSign } from 'lucide-react';
import AllFiltersModal from './AllFiltersModal';
import { TimeFilter, FlexibilityFilter, StopsFilter, PolicyFilter, CarriersFilter } from './FilterDropdowns';
import { type Flight, type TripSearchCriteria, type FareClass } from '../data';

interface FlightResultsProps {
  searchCriteria: TripSearchCriteria;
  searchResults: Flight[];
  onBackToSearch: () => void;
  onEditSearch: () => void;
  onSelectFlight: (flight: Flight, fareClass: FareClass) => void;
  onFilterChange?: (updatedCriteria: Partial<TripSearchCriteria>) => void;
}

const FlightResults: React.FC<FlightResultsProps> = ({
  searchCriteria,
  searchResults,
  onBackToSearch,
  onEditSearch,
  onSelectFlight,
  onFilterChange
}) => {
  const [sortBy, setSortBy] = useState('Recommended');
  const [showDetails, setShowDetails] = useState(false);
  const [flightNumberSearch, setFlightNumberSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // Time filter state - initialized from search criteria
  const [departStart, setDepartStart] = useState(searchCriteria.timeFilters.departureStart);
  const [departEnd, setDepartEnd] = useState(searchCriteria.timeFilters.departureEnd);
  const [arriveStart, setArriveStart] = useState(searchCriteria.timeFilters.arrivalStart);
  const [arriveEnd, setArriveEnd] = useState(searchCriteria.timeFilters.arrivalEnd);
  
  // Update local state when search criteria changes
  // Use a ref to track if this is the initial render
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    if (isInitialMount.current) {
      // On initial mount, just mark that we're no longer in initial mount
      isInitialMount.current = false;
      return;
    }
    
    // After initial mount, only update if values actually changed
    if (departStart !== searchCriteria.timeFilters.departureStart ||
        departEnd !== searchCriteria.timeFilters.departureEnd ||
        arriveStart !== searchCriteria.timeFilters.arrivalStart ||
        arriveEnd !== searchCriteria.timeFilters.arrivalEnd) {
      
      setDepartStart(searchCriteria.timeFilters.departureStart);
      setDepartEnd(searchCriteria.timeFilters.departureEnd);
      setArriveStart(searchCriteria.timeFilters.arrivalStart);
      setArriveEnd(searchCriteria.timeFilters.arrivalEnd);
    }
  }, [searchCriteria.timeFilters, departStart, departEnd, arriveStart, arriveEnd]);
  
  // Wrap setters with console logs and propagate changes to parent
  const loggedSetDepartStart = (value: number) => {
    setDepartStart(value);
    
    // Propagate change to parent
    if (onFilterChange) {
      onFilterChange({
        timeFilters: {
          ...searchCriteria.timeFilters,
          departureStart: value
        }
      });
    }
  };
  
  const loggedSetDepartEnd = (value: number) => {
    setDepartEnd(value);
    
    // Propagate change to parent
    if (onFilterChange) {
      onFilterChange({
        timeFilters: {
          ...searchCriteria.timeFilters,
          departureEnd: value
        }
      });
    }
  };
  
  const loggedSetArriveStart = (value: number) => {
    setArriveStart(value);
    
    // Propagate change to parent
    if (onFilterChange) {
      onFilterChange({
        timeFilters: {
          ...searchCriteria.timeFilters,
          arrivalStart: value
        }
      });
    }
  };
  
  const loggedSetArriveEnd = (value: number) => {
    setArriveEnd(value);
    
    // Propagate change to parent
    if (onFilterChange) {
      onFilterChange({
        timeFilters: {
          ...searchCriteria.timeFilters,
          arrivalEnd: value
        }
      });
    }
  };

  // Emissions filter state (matching Concur design - single handle)
  const [emissionsValue, setEmissionsValue] = useState(2758);
  const emissionsMin = 1087;
  const emissionsMax = 4428;

  // Individual filter dropdown states
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [showFlexibilityFilter, setShowFlexibilityFilter] = useState(false);
  const [showStopsFilter, setShowStopsFilter] = useState(false);
  const [showPolicyFilter, setShowPolicyFilter] = useState(false);
  const [showCarriersFilter, setShowCarriersFilter] = useState(false);

  // Filter values
  const [selectedStops, setSelectedStops] = useState('any');
  const [fullyRefundable, setFullyRefundable] = useState(false);
  const [freeChanges, setFreeChanges] = useState(false);
  const [inPolicyFares, setInPolicyFares] = useState(false);
  const [leastCostLogical, setLeastCostLogical] = useState(false);

  // Carriers filter state (matching the reference design)
  const [carriers, setCarriers] = useState([
    { name: 'Air France', preference: 'Most Preferred', price: '*€ 2,098', selected: false },
    { name: 'Delta', preference: 'Most Preferred', price: '*€ 2,113', selected: false },
    { name: 'KLM', preference: 'Most Preferred', price: '*€ 2,093', selected: false },
    { name: 'American Airlines', preference: 'More Preferred', price: '*€ 2,194', selected: false },
    { name: 'Austrian Airlines', preference: 'More Preferred', price: '€ 4,258', selected: false },
    { name: 'Lufthansa', preference: 'More Preferred', price: '€ 4,242', selected: false },
    { name: 'SWISS', preference: 'More Preferred', price: '€ 4,239', selected: false },
    { name: 'Turkish Airlines', preference: 'More Preferred', price: '€ 2,224', selected: false },
    { name: 'Aer Lingus', preference: '', price: '€ 2,378', selected: false },
    { name: 'Alaska Airlines', preference: '', price: '€ 3,122', selected: false },
    { name: 'British Airways', preference: '', price: '*€ 2,991', selected: false },
    { name: 'Finnair', preference: '', price: '*€ 2,991', selected: false },
    { name: 'Iberia', preference: '', price: '€ 2,991', selected: false },
    { name: 'Icelandair', preference: '', price: '€ 1,064', selected: false },
    { name: 'SAS Scandinavian', preference: '', price: '€ 1,471', selected: false },
    { name: 'United Airlines', preference: '', price: '€ 4,231', selected: false },
    { name: 'Virgin Atlantic', preference: '', price: '*--', selected: false },
    { name: 'WestJet', preference: '', price: '€ 1,754', selected: false }
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Recommended': return 'bg-blue-600 text-white';
      case 'Most Preferred': return 'bg-purple-600 text-white';
      case 'Fastest': return 'bg-green-600 text-white';
      case 'Cheapest': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getFareTypeColor = (fareType: string) => {
    switch (fareType) {
      case 'Economy Light': return 'text-red-600';
      case 'Economy Standard': return 'text-blue-600';
      case 'Economy Flex': return 'text-green-600';
      case 'Economy Full Flex': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  // Filter flights based on selected criteria
  const filterFlights = (flights: Flight[]) => {
    return flights.filter(flight => {
      // Number of stops filter
      if (selectedStops !== 'any') {
        if (selectedStops === 'nonstop' && flight.stops !== 0) return false;
        if (selectedStops === '1-stop' && flight.stops !== 1) return false;
        if (selectedStops === '1-or-fewer' && flight.stops > 1) return false;
        if (selectedStops === '2-stops' && flight.stops !== 2) return false;
        if (selectedStops === '2-or-fewer' && flight.stops > 2) return false;
      }

      // Carriers filter
      const selectedCarrierNames = carriers.filter(c => c.selected).map(c => c.name);
      if (selectedCarrierNames.length > 0 && !selectedCarrierNames.includes(flight.primaryAirline)) {
        return false;
      }

      // Time filter (departure time)
      const departureHour = new Date(flight.departureTime).getHours();
      if (departureHour < departStart || departureHour > departEnd) return false;

      // Time filter (arrival time)
      const arrivalHour = new Date(flight.arrivalTime).getHours();
      if (arrivalHour < arriveStart || arrivalHour > arriveEnd) return false;

      // Flexibility filter
      if (fullyRefundable) {
        const hasRefundableFare = flight.fareClasses.some(fare => 
          fare.flexibility?.refundable === true
        );
        if (!hasRefundableFare) return false;
      }

      if (freeChanges) {
        const hasFreeChanges = flight.fareClasses.some(fare => 
          fare.flexibility?.freeAdvancedChanges === true || 
          (fare.flexibility?.changeFee !== undefined && fare.flexibility?.changeFee === 0)
        );
        if (!hasFreeChanges) return false;
      }

      // Policy filter
      if (inPolicyFares && !flight.policyCompliant) return false;

      return true;
    });
  };

  const filteredFlights = filterFlights(searchResults);
  const bestFlights = filteredFlights.slice(0, 3);
  const allFlights = filteredFlights;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f6f7' }}>
      {/* SAP Concur Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white px-2 py-1 text-sm font-semibold">SAP</div>
                <span className="text-lg font-semibold text-gray-900">Concur</span>
              </div>
              <div className="text-sm text-gray-600">Travel</div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded">
                <Info className="w-4 h-4 text-gray-400" />
              </button>
              <div className="text-sm text-gray-600">HC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Departing Flight Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Departing Flight</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg font-medium text-gray-900">
                  {searchCriteria.fromAirport?.city}, {searchCriteria.fromAirport?.country} ({searchCriteria.fromAirport?.code}) - {searchCriteria.toAirport?.city} ({searchCriteria.toAirport?.code})
                </span>
                <span className="text-sm text-gray-500">
                  Departure Date: {formatDate(searchCriteria.departureDate)}
                </span>
                <button 
                  onClick={onEditSearch}
                  className="text-sm text-blue-600 hover:text-blue-800 ml-4"
                >
                  Edit Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Controls Bar */}
      <div className="bg-white border-b border-gray-200 relative">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 relative">
              <button onClick={() => setShowFilters(true)} className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded" id="all-filters-button">
                <Filter className="w-4 h-4" />
                <span>All Filters</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-2 border border-gray-300 rounded px-2 py-1 text-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Flight Number"
                  value={flightNumberSearch}
                  onChange={(e) => setFlightNumberSearch(e.target.value)}
                  className="border-none outline-none text-sm w-24"
                />
              </div>

              <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                <option>Matrix</option>
              </select>

              <StopsFilter
                isOpen={showStopsFilter}
                onToggle={() => setShowStopsFilter(!showStopsFilter)}
                selectedStops={selectedStops}
                setSelectedStops={setSelectedStops}
              />

              <CarriersFilter
                isOpen={showCarriersFilter}
                onToggle={() => setShowCarriersFilter(!showCarriersFilter)}
                carriers={carriers}
                setCarriers={setCarriers}
              />

              <TimeFilter
                isOpen={showTimeFilter}
                onToggle={() => setShowTimeFilter(!showTimeFilter)}
                departStart={departStart}
                departEnd={departEnd}
                arriveStart={arriveStart}
                arriveEnd={arriveEnd}
                setDepartStart={loggedSetDepartStart}
                setDepartEnd={loggedSetDepartEnd}
                setArriveStart={loggedSetArriveStart}
                setArriveEnd={loggedSetArriveEnd}
              />

              <FlexibilityFilter
                isOpen={showFlexibilityFilter}
                onToggle={() => setShowFlexibilityFilter(!showFlexibilityFilter)}
                fullyRefundable={fullyRefundable}
                freeChanges={freeChanges}
                setFullyRefundable={setFullyRefundable}
                setFreeChanges={setFreeChanges}
              />

              <PolicyFilter
                isOpen={showPolicyFilter}
                onToggle={() => setShowPolicyFilter(!showPolicyFilter)}
                inPolicyFares={inPolicyFares}
                leastCostLogical={leastCostLogical}
                setInPolicyFares={setInPolicyFares}
                setLeastCostLogical={setLeastCostLogical}
              />

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option>Sort by Recommended</option>
              </select>
            </div>

            <label className="flex items-center space-x-2 text-sm">
              <input 
                type="checkbox" 
                checked={showDetails}
                onChange={(e) => setShowDetails(e.target.checked)}
                className="rounded"
              />
              <span>Show Details</span>
            </label>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredFlights.length} of {searchResults.length} Flights
            </div>
            <button 
              onClick={() => {
                // Reset all filter values using wrapped setters
                loggedSetDepartStart(0); 
                loggedSetDepartEnd(23); 
                loggedSetArriveStart(0); 
                loggedSetArriveEnd(23);
                setEmissionsValue(2758);
                setSelectedStops('any');
                setFullyRefundable(false); 
                setFreeChanges(false);
                setInPolicyFares(false); 
                setLeastCostLogical(false);
                setCarriers(prev => prev.map(c => ({ ...c, selected: false })));
                
                // Close all individual filter dropdowns in toolbar
                setShowTimeFilter(false);
                setShowFlexibilityFilter(false);
                setShowStopsFilter(false);
                setShowPolicyFilter(false);
                setShowCarriersFilter(false);
                
                // Close the All Filters modal if it's open
                setShowFilters(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* All Filters Modal - positioned relative to the filters button */}
        {showFilters && (
        <AllFiltersModal
          open={showFilters}
          onClose={() => setShowFilters(false)}
          onClearAll={() => {
            // Reset all filter values
            loggedSetDepartStart(0); 
            loggedSetDepartEnd(23); 
            loggedSetArriveStart(0); 
            loggedSetArriveEnd(23); 
            setEmissionsValue(2758);
            setSelectedStops('any');
            setFullyRefundable(false);
            setFreeChanges(false);
            setInPolicyFares(false);
            setLeastCostLogical(false);
            setCarriers(carriers.map(c => ({ ...c, selected: false })));
            
            // Close all individual filter dropdowns in toolbar
            setShowTimeFilter(false);
            setShowFlexibilityFilter(false);
            setShowStopsFilter(false);
            setShowPolicyFilter(false);
            setShowCarriersFilter(false);
            
            // Close the All Filters modal as well
            setShowFilters(false);
          }}
          departStart={departStart}
          departEnd={departEnd}
          arriveStart={arriveStart}
          arriveEnd={arriveEnd}
          setDepartStart={loggedSetDepartStart}
          setDepartEnd={loggedSetDepartEnd}
          setArriveStart={loggedSetArriveStart}
          setArriveEnd={loggedSetArriveEnd}
          emissionsMin={emissionsMin}
          emissionsMax={emissionsMax}
          emissionsValue={emissionsValue}
          setEmissionsValue={setEmissionsValue}
          selectedStops={selectedStops}
          setSelectedStops={setSelectedStops}
          fullyRefundable={fullyRefundable}
          freeChanges={freeChanges}
          setFullyRefundable={setFullyRefundable}
          setFreeChanges={setFreeChanges}
          inPolicyFares={inPolicyFares}
          leastCostLogical={leastCostLogical}
          setInPolicyFares={setInPolicyFares}
          setLeastCostLogical={setLeastCostLogical}
          carriers={carriers}
          setCarriers={setCarriers}
        />
        )}
      </div>

      {/* Results Summary */}
      <div className="px-4 py-3 text-sm text-gray-600" style={{ backgroundColor: '#f5f6f7' }}>
        Round-trip fares include taxes and fees. Additional fees will be shown at checkout.
      </div>

      <div className="px-4 py-6" style={{ backgroundColor: '#f5f6f7' }}>
        {/* Best flights for you */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Best flights for you</h2>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            {bestFlights.map((flight) => (
              <FlightCard 
                key={flight.id} 
                flight={flight} 
                onSelectFlight={onSelectFlight}
                showDetails={showDetails}
                isBestFlight={true}
              />
            ))}
          </div>
        </div>

        {/* All flights */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All flights</h2>
          <div className="space-y-2">
            {allFlights.map((flight) => (
              <FlightCard 
                key={flight.id} 
                flight={flight} 
                onSelectFlight={onSelectFlight}
                showDetails={showDetails}
                isBestFlight={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FlightCardProps {
  flight: Flight;
  onSelectFlight: (flight: Flight, fareClass: FareClass) => void;
  showDetails: boolean;
  isBestFlight: boolean;
}

const FlightCard: React.FC<FlightCardProps> = ({ 
  flight, 
  onSelectFlight, 
  showDetails,
  isBestFlight 
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`bg-white border ${isBestFlight ? 'border-l-4 border-l-blue-500 border-t border-r border-b border-gray-200' : 'border-gray-200'} overflow-hidden`}>
      <div className="flex items-center">
        {/* Left side: Flight Info - Two rows (header + tokens) */}
        <div className="flex-1 p-4 flex flex-col justify-center h-full">
          {/* Row 1: Logo + Operated by */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <img
              src="https://static.concursolutions.com/travel-media/air/airhex/airlines_KL_200_200_s.png?md5apikey=2ce36a49b6dc7dd91b4ff89c5b73c1b2"
              alt="KLM"
              className="w-6 h-6"
            />
            <span className="text-sm font-medium text-gray-900">{flight.primaryAirline}</span>
            <span className="text-xs text-gray-500">
              Operated by {flight.operatingAirlines[flight.operatingAirlines.length - 1] || flight.primaryAirline}
            </span>
          </div>

          {/* Row 2: Times + Journey Overview */}
          <div className="mt-2 flex items-center gap-8 flex-nowrap">
            <div className="text-lg font-semibold text-gray-900 whitespace-nowrap">
              <time>{formatTime(flight.departureTime)}</time>
              <time className="ml-4">{formatTime(flight.arrivalTime)}</time>
            </div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              <span>{flight.route.from.code} - {flight.route.to.code}</span>
              <span className="text-gray-400 mx-1">•</span>
              <span>{flight.stops} Stop {flight.stopAirports[0]?.code}</span>
              <span className="text-gray-400 mx-1">•</span>
              <span>{flight.totalDuration}</span>
            </div>
          </div>

          {/* Row 3: Tokens */}
          <div className="mt-3 flex items-center gap-4 whitespace-nowrap">
            {flight.badges.includes('Recommended') && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                <Star className="w-3 h-3" />
                Recommended
              </span>
            )}
            {flight.badges.includes('Most Preferred') && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                Most Preferred
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
              <Leaf className="w-4 h-4" />
              <span className="font-medium">{flight.co2Emissions.replace('kg ', 'kg')}</span>
            </span>
          </div>
        </div>

        {/* Right side: Fare Options */}
        <div className="flex divide-x divide-gray-200 ml-auto">
          {flight.fareClasses.map((fareClass) => (
            <div
              key={fareClass.id}
              className="w-56 p-4 text-left hover:bg-blue-50 cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => onSelectFlight(flight, fareClass)}
            >
              <div className="text-sm font-semibold text-gray-800">
                {fareClass.name}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {fareClass.tripType}
              </div>

              <div className="flex items-center gap-3 mt-2">
                {fareClass.name === 'Economy Light' && (
                  <Star className="w-4 h-4 text-purple-600" />
                )}
                {fareClass.name === 'Economy Full Flex' && (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                )}
                <CircleDollarSign className="w-5 h-5 text-teal-600" />
                <div className="text-lg font-bold text-gray-900">
                  € {fareClass.basePrice.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Details (if showDetails is true) */}
      {showDetails && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium mb-2">Flight Segments:</div>
                {flight.segments.map((segment, index) => (
                  <div key={segment.id} className="mb-2">
                    <div>{segment.flightNumber}: {segment.departureAirport.code} → {segment.arrivalAirport.code}</div>
                    <div className="text-xs text-gray-500">
                      {formatTime(segment.departureTime)} - {formatTime(segment.arrivalTime)} ({segment.duration})
                    </div>
                    {segment.layoverDuration && (
                      <div className="text-xs text-gray-500">Layover: {segment.layoverDuration}</div>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <div className="font-medium mb-2">Aircraft:</div>
                {flight.aircraft.map((aircraft, index) => (
                  <div key={index} className="text-sm">{aircraft}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightResults;
