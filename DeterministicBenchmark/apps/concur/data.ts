// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface Expense {
  id: number;
  paymentType: string;
  expenseSource: string;
  expenseType: string;
  vendorDetails: string;
  date: string;
  amount: string;
  selected: boolean;
  receiptImage: string;
  hasReceipt: boolean;
}

export interface Report {
  id: string;
  name: string;
  businessPurpose: string;
  policy: string;
  employeeId: string;
  countryCode: string;
  reportDate: string;
  logicalSystem: string;
  location: string;
  company: string;
  costCenter: string;
  travelRelated: boolean;
  comment: string;
  tripStartDate: string;
  tripEndDate: string;
  psaProject: string;
  psaAssignment: string;
  internalOrder: string;
  expenses: Expense[];
  status: 'Not Submitted' | 'Submitted';
  totalAmount: number;
  created: string;
  modified?: string;
  submittedDate?: string;
  reportNumber: string;
}

export interface FormData {
  reportName: string;
  businessPurpose: string;
  reportDate: string;
  logicalSystem: string;
  location: string;
  company: string;
  policy: string;
  travelRelated: string;
  psaProject: string;
  reportNumber: string;
  employeeId: string;
  countryCode: string;
  comment: string;
  costCenter: string;
  tripStartDate: string;
  tripEndDate: string;
  psaAssignment: string;
  internalOrder: string;
}

export interface AppState {
  availableExpenses: Expense[];
  reports: Report[];
  submittedReports: Report[];
  currentReport: Report | null;
  submission: any; // For task result submission
  // Travel state
  travelState: TravelAppState;
}

// =============================================================================
// TRAVEL BOOKING INTERFACES
// =============================================================================

// Airport and Location Data
export interface Airport {
  code: string;          // IATA code (e.g., "SEA", "LHR")
  name: string;          // Full airport name
  city: string;          // City name
  state?: string;        // State/region (for US airports)
  country: string;       // Country name
  countryFull: string;   // Full country name
  distanceFromCity: string; // Distance to city center
  timezone: string;      // Airport timezone
}

// Flight Segment (for multi-leg flights)
export interface FlightSegment {
  id: string;
  airline: string;
  flightNumber: string;
  operatedBy?: string;    // "Operated by DL"
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string;  // ISO date string
  arrivalTime: string;    // ISO date string
  duration: string;       // Segment duration
  aircraft: string;       // "Boeing 737-900 (Winglets)"
  layoverDuration?: string; // "5h 50m" for connection time
}

// Fare Class Information
export interface FareClass {
  id: string;
  name: string;           // "Economy Light", "Economy Standard", etc.
  type: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  basePrice: number;
  currency: string;
  tripType: 'Round-trip' | 'One-way';
  
  // Baggage policies
  baggage: {
    carryOn: {
      included: boolean;
      count: number;
      fee?: number;
    };
    checked: {
      first: { included: boolean; fee?: number; };
      second: { included: boolean; fee?: number; };
    };
  };
  
  // Seat selection
  seatSelection: {
    included: boolean;
    fee?: number;
    advanceSelection: boolean;
  };
  
  // Change/cancellation policies
  flexibility: {
    refundable: boolean;
    changeFee?: number;
    advanceChangeFee?: number;
    freeAdvancedChanges?: boolean;
  };
  
  // Environmental
  co2Emissions: string;   // "1038kg CO2e"
  
  // Restrictions
  restrictions: string[];
}

// Complete Flight Information
export interface Flight {
  id: string;
  route: {
    from: Airport;
    to: Airport;
    departureDate: string;
  };
  
  // Flight timing
  departureTime: string;
  arrivalTime: string;
  totalDuration: string;  // "19h 5m"
  
  // Route details
  segments: FlightSegment[];
  stops: number;
  stopAirports: Airport[]; // [AMS] for layover airports
  
  // Airline information
  primaryAirline: string; // "KLM"
  operatingAirlines: string[]; // ["KLM", "DL"]
  
  // Fare options
  fareClasses: FareClass[];
  
  // Flight characteristics
  badges: ('Recommended' | 'Most Preferred' | 'Fastest' | 'Cheapest')[];
  
  // Additional info
  co2Emissions: string;   // Overall flight emissions
  aircraft: string[];     // Different aircraft for segments
  
  // Availability
  seatsRemaining?: number;
  
  // Policies
  policyCompliant: boolean;
  policyViolations?: string[];
}

// Trip and Booking Data
export interface TripSearchCriteria {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  fromAirport: Airport | null;
  toAirport: Airport | null;
  departureDate: string;
  returnDate?: string;     // For round-trip
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  class: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  flexibility: {
    dates: boolean;        // Flexible dates
    airports: boolean;     // Nearby airports
  };
  timeFilters: {
    departureStart: number;  // Hour (0-23)
    departureEnd: number;    // Hour (0-23)
    arrivalStart: number;    // Hour (0-23)
    arrivalEnd: number;      // Hour (0-23)
  };
}

// Travel App State
export interface TravelAppState {
  currentView: 'search' | 'results' | 'booking' | 'confirmation' | 'my-trips';
  searchCriteria: TripSearchCriteria;
  searchResults: Flight[];
  selectedFlights: {
    outbound?: Flight;
    return?: Flight;
  };
  isSearching: boolean;
}

export interface ViewState {
  currentView: 'dashboard' | 'manage-expenses' | 'report-details' | 'travel-search' | 'travel-results' | 'travel-booking';
  showCreateReportModal: boolean;
  isEditMode: boolean;
  showCreateDropdown: boolean;
  showOverflowMenu: boolean;
  showAddExpenseModal: boolean;
  showExpenseSourceModal: boolean;
  showSubmitModal: boolean;
  showReportSubmittedModal: boolean;
  showAttachReceiptModal: boolean;
  showErrorModal: boolean;
  // Travel-specific state
  showDatePicker: boolean;
  showAirportSearch: { field: 'from' | 'to' | null };
}

// =============================================================================
// MOCK DATA AND CONSTANTS
// =============================================================================

// Default form values for creating new reports
export const DEFAULT_FORM_VALUES: FormData = {
  reportName: '',
  businessPurpose: '',
  reportDate: '08/08/2025',
  logicalSystem: '(P57CLNT100) SAP SE',
  location: '(A445) NETHERLANDS - AMSTERDAM',
  company: '(2001) TechFlow Innovations BV',
  policy: 'Netherlands Policy - SAP',
  travelRelated: '',
  psaProject: '(8941000000000LUCHAUC) *NA',
  reportNumber: '100153',
  employeeId: '100153',
  countryCode: 'NETHERLANDS (NL)',
  comment: '',
  costCenter: '(C065653031) AI & ML',
  tripStartDate: 'MM/DD/YYYY',
  tripEndDate: 'MM/DD/YYYY',
  psaAssignment: '',
  internalOrder: ''
};

// Available expenses for testing - simulates corporate card and expense data
export const MOCK_AVAILABLE_EXPENSES: Expense[] = [
  {
    id: 1,
    paymentType: 'Personal Debit Card - **** 4922',
    expenseSource: 'Out of Pocket',
    expenseType: 'Office Supplies',
    vendorDetails: 'TARGET\nSchertz (210) 945-9102\n8234 Agora Pkwy\nSelma, Texas 78154',
    date: '05/24/2025',
    amount: 'USD 21.29',
    selected: false,
    receiptImage: '/images/concur/receipt_1.png',
    hasReceipt: false
  },
  {
    id: 2,
    paymentType: 'Corporate Credit Card',
    expenseSource: 'Corporate Card',
    expenseType: 'Professional Subscriptions, Dues, Memberships',
    vendorDetails: 'OPENAI, LLC\n548 Market Street\nPMB 97273\nSan Francisco, California 94104-5401',
    date: '04/26/2024',
    amount: 'USD 20.00',
    selected: false,
    receiptImage: '/images/concur/receipt_2.png',
    hasReceipt: false
  },
  {
    id: 3,
    paymentType: 'Corporate Credit Card',
    expenseSource: 'Corporate Card',
    expenseType: 'Vehicle Maintenance and Repairs',
    vendorDetails: 'EAST REPAIR INC.\n1912 Harvest Lane\nNew York, NY 12210',
    date: '11/02/2019',
    amount: 'USD 154.06',
    selected: false,
    receiptImage: '/images/concur/receipt_3.png',
    hasReceipt: false
  }
];

// =============================================================================
// TRAVEL MOCK DATA
// =============================================================================

// Airport database for search functionality
export const MOCK_AIRPORTS: Airport[] = [
  // US Airports
  {
    code: 'SEA',
    name: 'Seattle-Tacoma International Airport',
    city: 'Seattle',
    state: 'Washington',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '11.3mi → Seattle',
    timezone: 'America/Los_Angeles'
  },
  {
    code: 'BFI',
    name: 'King County International Airport',
    city: 'Seattle',
    state: 'Washington',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '5.4mi → Seattle',
    timezone: 'America/Los_Angeles'
  },
  {
    code: 'PAE',
    name: 'Seattle Paine Field International Airport',
    city: 'Seattle',
    state: 'Washington',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '21.1mi → Seattle',
    timezone: 'America/Los_Angeles'
  },
  
  // UK Airports
  {
    code: 'LHR',
    name: 'London Heathrow Airport',
    city: 'London',
    country: 'UK',
    countryFull: 'United Kingdom',
    distanceFromCity: '14.3mi → London',
    timezone: 'Europe/London'
  },
  {
    code: 'LGW',
    name: 'London Gatwick Airport',
    city: 'London',
    country: 'UK',
    countryFull: 'United Kingdom',
    distanceFromCity: '24.8mi → London',
    timezone: 'Europe/London'
  },
  {
    code: 'STN',
    name: 'London Stansted Airport',
    city: 'London',
    country: 'UK',
    countryFull: 'United Kingdom',
    distanceFromCity: '31.3mi → London',
    timezone: 'Europe/London'
  },
  
  // Romania Airports
  {
    code: 'OTP',
    name: 'Bucharest Henri Coanda International Airport',
    city: 'Bucharest',
    country: 'Romania',
    countryFull: 'Romania',
    distanceFromCity: 'Bucharest, Romania',
    timezone: 'Europe/Bucharest'
  },
  {
    code: 'CLJ',
    name: 'Avram Iancu Cluj International Airport',
    city: 'Cluj-Napoca',
    country: 'Romania',
    countryFull: 'Romania',
    distanceFromCity: 'Cluj-Napoca, Romania',
    timezone: 'Europe/Bucharest'
  },
  {
    code: 'TSR',
    name: 'Timisoara Traian Vuia International Airport',
    city: 'Timisoara',
    country: 'Romania',
    countryFull: 'Romania',
    distanceFromCity: 'Timisoara, Romania',
    timezone: 'Europe/Bucharest'
  },

  // New York Airports
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    state: 'New York',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '12mi → Manhattan',
    timezone: 'America/New_York'
  },
  {
    code: 'LGA',
    name: 'LaGuardia Airport',
    city: 'New York',
    state: 'New York',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '8mi → Manhattan',
    timezone: 'America/New_York'
  },
  {
    code: 'EWR',
    name: 'Newark Liberty International Airport',
    city: 'New York',
    state: 'New Jersey',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '16mi → Manhattan',
    timezone: 'America/New_York'
  },

  // Los Angeles Airports
  {
    code: 'LAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    state: 'California',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '18mi → Downtown LA',
    timezone: 'America/Los_Angeles'
  },
  {
    code: 'BUR',
    name: 'Hollywood Burbank Airport',
    city: 'Los Angeles',
    state: 'California',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '7mi → Hollywood',
    timezone: 'America/Los_Angeles'
  },
  {
    code: 'LGB',
    name: 'Long Beach Airport',
    city: 'Los Angeles',
    state: 'California',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '26mi → Downtown LA',
    timezone: 'America/Los_Angeles'
  },

  // Chicago Airports
  {
    code: 'ORD',
    name: 'O\'Hare International Airport',
    city: 'Chicago',
    state: 'Illinois',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '17mi → Downtown Chicago',
    timezone: 'America/Chicago'
  },
  {
    code: 'MDW',
    name: 'Chicago Midway International Airport',
    city: 'Chicago',
    state: 'Illinois',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '10mi → Downtown Chicago',
    timezone: 'America/Chicago'
  },

  // Paris Airports
  {
    code: 'CDG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    countryFull: 'France',
    distanceFromCity: '25km → Paris',
    timezone: 'Europe/Paris'
  },
  {
    code: 'ORY',
    name: 'Orly Airport',
    city: 'Paris',
    country: 'France',
    countryFull: 'France',
    distanceFromCity: '13km → Paris',
    timezone: 'Europe/Paris'
  },

  // Tokyo Airports
  {
    code: 'NRT',
    name: 'Narita International Airport',
    city: 'Tokyo',
    country: 'Japan',
    countryFull: 'Japan',
    distanceFromCity: '60km → Tokyo',
    timezone: 'Asia/Tokyo'
  },
  {
    code: 'HND',
    name: 'Haneda Airport',
    city: 'Tokyo',
    country: 'Japan',
    countryFull: 'Japan',
    distanceFromCity: '14km → Tokyo',
    timezone: 'Asia/Tokyo'
  },

  // Frankfurt Airports
  {
    code: 'FRA',
    name: 'Frankfurt Airport',
    city: 'Frankfurt',
    country: 'Germany',
    countryFull: 'Germany',
    distanceFromCity: '12km → Frankfurt',
    timezone: 'Europe/Berlin'
  },
  {
    code: 'HHN',
    name: 'Frankfurt-Hahn Airport',
    city: 'Frankfurt',
    country: 'Germany',
    countryFull: 'Germany',
    distanceFromCity: '120km → Frankfurt',
    timezone: 'Europe/Berlin'
  },

  // Amsterdam Airport
  {
    code: 'AMS',
    name: 'Amsterdam Airport Schiphol',
    city: 'Amsterdam',
    country: 'Netherlands',
    countryFull: 'Netherlands',
    distanceFromCity: '17.5km → Amsterdam',
    timezone: 'Europe/Amsterdam'
  },

  // Dubai Airports
  {
    code: 'DXB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'UAE',
    countryFull: 'United Arab Emirates',
    distanceFromCity: '5km → Dubai',
    timezone: 'Asia/Dubai'
  },
  {
    code: 'DWC',
    name: 'Al Maktoum International Airport',
    city: 'Dubai',
    country: 'UAE',
    countryFull: 'United Arab Emirates',
    distanceFromCity: '37km → Dubai',
    timezone: 'Asia/Dubai'
  },

  // Singapore Airport
  {
    code: 'SIN',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    country: 'Singapore',
    countryFull: 'Singapore',
    distanceFromCity: '20km → Singapore',
    timezone: 'Asia/Singapore'
  },

  // Toronto Airports
  {
    code: 'YYZ',
    name: 'Toronto Pearson International Airport',
    city: 'Toronto',
    state: 'Ontario',
    country: 'Canada',
    countryFull: 'Canada',
    distanceFromCity: '27km → Toronto',
    timezone: 'America/Toronto'
  },
  {
    code: 'YTZ',
    name: 'Billy Bishop Toronto City Airport',
    city: 'Toronto',
    state: 'Ontario',
    country: 'Canada',
    countryFull: 'Canada',
    distanceFromCity: '2km → Toronto',
    timezone: 'America/Toronto'
  },

  // Additional European and International Airports for expanded flight data
  {
    code: 'KEF',
    name: 'Keflavik International Airport',
    city: 'Reykjavik',
    country: 'Iceland',
    countryFull: 'Iceland',
    distanceFromCity: '50km → Reykjavik',
    timezone: 'Atlantic/Reykjavik'
  },
  {
    code: 'YVR',
    name: 'Vancouver International Airport',
    city: 'Vancouver',
    state: 'British Columbia',
    country: 'Canada',
    countryFull: 'Canada',
    distanceFromCity: '12km → Vancouver',
    timezone: 'America/Vancouver'
  },
  {
    code: 'DUB',
    name: 'Dublin Airport',
    city: 'Dublin',
    country: 'Ireland',
    countryFull: 'Ireland',
    distanceFromCity: '10km → Dublin',
    timezone: 'Europe/Dublin'
  },
  {
    code: 'PDX',
    name: 'Portland International Airport',
    city: 'Portland',
    state: 'Oregon',
    country: 'USA',
    countryFull: 'United States of America',
    distanceFromCity: '12km → Portland',
    timezone: 'America/Los_Angeles'
  }
];

// ========================================================================
// FLIGHT GENERATION SYSTEM
// ========================================================================

// Airlines configuration for realistic flight generation
const AIRLINE_CONFIG = {
  'Delta': {
    codes: ['DL'],
    alliance: 'SkyTeam',
    preference: 'Most Preferred',
    operatesFrom: ['LHR', 'CDG', 'AMS'],
    aircraft: ['Airbus A330-300', 'Airbus A350-1000', 'Boeing 767-400'],
    priceMultiplier: 1.1,
    emissionsMultiplier: 1.0
  },
  'Air France': {
    codes: ['AF'],
    alliance: 'SkyTeam', 
    preference: 'Most Preferred',
    operatesFrom: ['LHR', 'CDG'],
    aircraft: ['Airbus A320', 'Boeing 777-300ER', 'Airbus A350-900'],
    priceMultiplier: 1.15,
    emissionsMultiplier: 1.05
  },
  'KLM': {
    codes: ['KL'],
    alliance: 'SkyTeam',
    preference: 'Most Preferred', 
    operatesFrom: ['LHR', 'AMS'],
    aircraft: ['Boeing 737-900', 'Boeing 777-200', 'Airbus A330-200'],
    priceMultiplier: 1.0,
    emissionsMultiplier: 0.95
  },
  'British Airways': {
    codes: ['BA'],
    alliance: 'oneworld',
    preference: 'More Preferred',
    operatesFrom: ['LHR', 'LGW'],
    aircraft: ['Boeing 787-9', 'Airbus A380-800', 'Boeing 777-300ER'],
    priceMultiplier: 1.25,
    emissionsMultiplier: 1.1
  },
  'Lufthansa': {
    codes: ['LH'],
    alliance: 'Star Alliance',
    preference: 'More Preferred',
    operatesFrom: ['LHR', 'FRA', 'MUC'],
    aircraft: ['Boeing 777-300ER', 'Airbus A340-600', 'Boeing 747-8'],
    priceMultiplier: 1.4,
    emissionsMultiplier: 1.2
  },
  'Icelandair': {
    codes: ['FI'],
    alliance: null,
    preference: 'Standard',
    operatesFrom: ['LGW', 'LHR'],
    aircraft: ['Boeing 767-300ER', 'Boeing 757-200'],
    priceMultiplier: 0.6,
    emissionsMultiplier: 0.85,
    requiresStop: ['KEF']
  }
} as const;

// Route configurations
const ROUTE_CONFIG = {
  'LHR-SEA': {
    basePrice: 1800,
    baseDuration: 590, // minutes
    baseEmissions: 2100,
    popularStops: ['KEF', 'YVR', 'CDG', 'AMS']
  }
} as const;

// Fare class templates
const FARE_CLASSES = {
  'Economy Light': {
    priceMultiplier: 0.6,
    baggage: { carryOn: { included: true, count: 1 }, checked: { first: { included: false, fee: 60 }, second: { included: false, fee: 90 } } },
    restrictions: ['No checked bag', 'Change fee applies']
  },
  'Economy Standard': {
    priceMultiplier: 0.8,
    baggage: { carryOn: { included: true, count: 1 }, checked: { first: { included: true, fee: 0 }, second: { included: false, fee: 90 } } },
    restrictions: ['Change fee applies']
  },
  'Economy Flex': {
    priceMultiplier: 1.0,
    baggage: { carryOn: { included: true, count: 1 }, checked: { first: { included: true, fee: 0 }, second: { included: true, fee: 0 } } },
    restrictions: ['Free changes']
  },
  'Delta Comfort': {
    priceMultiplier: 1.15,
    baggage: { carryOn: { included: true, count: 1 }, checked: { first: { included: true, fee: 0 }, second: { included: false, fee: 75 } } },
    restrictions: ['Change fee applies']
  }
} as const;

// Main flight generation function
function generateFlights(): Flight[] {
  const flights: Flight[] = [];
  const baseDate = '2025-09-10';
  
  Object.entries(AIRLINE_CONFIG).forEach(([airlineName, config], index) => {
    const fromAirport = MOCK_AIRPORTS.find(a => a.code === 'LHR')!;
    const toAirport = MOCK_AIRPORTS.find(a => a.code === 'SEA')!;
    const basePrice = 1800 * (config.priceMultiplier || 1);
    
    // Generate departure time based on index
    const timeSlots = ['09:50', '13:25', '15:35', '17:25'];
    const time = timeSlots[index % timeSlots.length];
    const departureTime = `${baseDate}T${time}:00.000Z`;
    const arrivalHour = (parseInt(time.split(':')[0]) + 10) % 24;
    const arrivalTime = `${baseDate}T${arrivalHour.toString().padStart(2, '0')}:${time.split(':')[1]}:00.000Z`;
    
    flights.push({
      id: `${config.codes[0]}-${2000 + index}`,
      route: { from: fromAirport, to: toAirport, departureDate: baseDate },
      departureTime,
      arrivalTime,
      totalDuration: '10h 5m',
      segments: [{
        id: `${config.codes[0]}${100 + index}-LHR-SEA`,
        airline: airlineName,
        flightNumber: `${config.codes[0]} ${100 + index}`,
        operatedBy: config.codes[0],
        departureAirport: fromAirport,
        arrivalAirport: toAirport,
        departureTime,
        arrivalTime,
        duration: '10h 5m',
        aircraft: config.aircraft[0]
      }],
      stops: config.requiresStop ? 1 : 0,
      stopAirports: config.requiresStop ? [MOCK_AIRPORTS.find(a => a.code === 'KEF')!] : [],
      primaryAirline: airlineName,
      operatingAirlines: config.codes,
      fareClasses: [{
        id: `economy-${airlineName.toLowerCase().replace(/\s+/g, '-')}`,
        name: airlineName === 'Delta' ? 'Delta Comfort' : 'Economy Light',
        type: 'Economy',
        basePrice: Math.round(basePrice),
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: { carryOn: { included: true, count: 1 }, checked: { first: { included: true, fee: 0 }, second: { included: false, fee: 75 } } },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 200 },
        co2Emissions: `${Math.round(2100 * (config.emissionsMultiplier || 1))}kg CO2e`,
        restrictions: ['Change fee applies']
      }],
      badges: config.preference === 'Most Preferred' ? ['Most Preferred'] : config.preference === 'More Preferred' ? ['More Preferred'] : [],
      co2Emissions: `${Math.round(2100 * (config.emissionsMultiplier || 1))}kg CO2e`,
      aircraft: config.aircraft,
      seatsRemaining: Math.floor(Math.random() * 30) + 5,
      policyCompliant: true
    });
  });
  
  return flights;
}

// Legacy static flight data (can be removed once generation is verified)
const LEGACY_MOCK_FLIGHT_RESULTS: Flight[] = [
  {
    id: 'KL-1001',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'OTP')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-08'
    },
    departureTime: '2025-09-08T07:00:00.000Z',
    arrivalTime: '2025-09-08T16:05:00.000Z',
    totalDuration: '19h 5m',
    segments: [
      {
        id: 'KL1001-OTP-AMS',
        airline: 'KLM',
        flightNumber: 'KL 1001',
        operatedBy: 'DL',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'OTP')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'AMS')!,
        departureTime: '2025-09-08T07:00:00.000Z',
        arrivalTime: '2025-09-08T10:15:00.000Z',
        duration: '3h 15m',
        aircraft: 'Boeing 737-900',
        layoverDuration: '5h 50m'
      },
      {
        id: 'DL159-AMS-SEA',
        airline: 'Delta',
        flightNumber: 'DL 159',
        operatedBy: 'DL',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'AMS')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-08T16:05:00.000Z',
        arrivalTime: '2025-09-08T18:05:00.000Z',
        duration: '10h 50m',
        aircraft: 'Boeing 777-200'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'AMS')!],
    primaryAirline: 'KLM',
    operatingAirlines: ['KLM', 'DL'],
    fareClasses: [
      {
        id: 'economy-light-1',
        name: 'Economy Light',
        type: 'Economy',
        basePrice: 1109,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: false, fee: 25 },
            second: { included: false, fee: 50 }
          }
        },
        seatSelection: { included: false, fee: 15, advanceSelection: false },
        flexibility: { refundable: false, changeFee: 150 },
        co2Emissions: '1038kg CO2e',
        restrictions: ['No refunds', 'Change fee applies']
      },
      {
        id: 'economy-standard-1',
        name: 'Economy Standard',
        type: 'Economy',
        basePrice: 1204,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: true, fee: 0 },
            second: { included: false, fee: 50 }
          }
        },
        seatSelection: { included: false, fee: 15, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 100 },
        co2Emissions: '1038kg CO2e',
        restrictions: ['Change fee applies']
      },
      {
        id: 'economy-flex-1',
        name: 'Economy Flex',
        type: 'Economy',
        basePrice: 1392,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: true, fee: 0 },
            second: { included: true, fee: 0 }
          }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 0, freeAdvancedChanges: true },
        co2Emissions: '1038kg CO2e',
        restrictions: ['Free changes']
      },
      {
        id: 'economy-full-flex-1',
        name: 'Economy Full Flex',
        type: 'Economy',
        basePrice: 5212,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: true, fee: 0 },
            second: { included: true, fee: 0 }
          }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: true, changeFee: 0, freeAdvancedChanges: true },
        co2Emissions: '1038kg CO2e',
        restrictions: ['Fully refundable']
      }
    ],
    badges: ['Recommended', 'Most Preferred'],
    co2Emissions: '1038kg CO2e',
    aircraft: ['Boeing 737-900', 'Boeing 777-200'],
    seatsRemaining: 9,
    policyCompliant: true
  },
  {
    id: 'KL-1002',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'OTP')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-08'
    },
    departureTime: '2025-09-08T07:00:00.000Z',
    arrivalTime: '2025-09-08T11:45:00.000Z',
    totalDuration: '14h 45m',
    segments: [
      {
        id: 'KL1002-OTP-AMS',
        airline: 'KLM',
        flightNumber: 'KL 1002',
        operatedBy: 'DL',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'OTP')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'AMS')!,
        departureTime: '2025-09-08T07:00:00.000Z',
        arrivalTime: '2025-09-08T10:15:00.000Z',
        duration: '3h 15m',
        aircraft: 'Boeing 737-900',
        layoverDuration: '1h 30m'
      },
      {
        id: 'DL160-AMS-SEA',
        airline: 'Delta',
        flightNumber: 'DL 160',
        operatedBy: 'DL',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'AMS')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-08T11:45:00.000Z',
        arrivalTime: '2025-09-08T13:45:00.000Z',
        duration: '10h 30m',
        aircraft: 'Airbus A330-300'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'AMS')!],
    primaryAirline: 'KLM',
    operatingAirlines: ['KLM', 'DL'],
    fareClasses: [
      {
        id: 'economy-light-2',
        name: 'Economy Light',
        type: 'Economy',
        basePrice: 1109,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: false, fee: 25 },
            second: { included: false, fee: 50 }
          }
        },
        seatSelection: { included: false, fee: 15, advanceSelection: false },
        flexibility: { refundable: false, changeFee: 150 },
        co2Emissions: '1038kg CO2e',
        restrictions: ['No refunds', 'Change fee applies']
      },
      {
        id: 'economy-standard-2',
        name: 'Economy Standard',
        type: 'Economy',
        basePrice: 1204,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: true, fee: 0 },
            second: { included: false, fee: 50 }
          }
        },
        seatSelection: { included: false, fee: 15, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 100 },
        co2Emissions: '1038kg CO2e',
        restrictions: ['Change fee applies']
      },
      {
        id: 'economy-flex-2',
        name: 'Economy Flex',
        type: 'Economy',
        basePrice: 1392,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: true, fee: 0 },
            second: { included: true, fee: 0 }
          }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 0, freeAdvancedChanges: true },
        co2Emissions: '1038kg CO2e',
        restrictions: ['Free changes']
      },
      {
        id: 'economy-full-flex-2',
        name: 'Economy Full Flex',
        type: 'Economy',
        basePrice: 5212,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: true, fee: 0 },
            second: { included: true, fee: 0 }
          }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: true, changeFee: 0, freeAdvancedChanges: true },
        co2Emissions: '1038kg CO2e',
        restrictions: ['Fully refundable']
      }
    ],
    badges: ['Recommended', 'Most Preferred'],
    co2Emissions: '1038kg CO2e',
    aircraft: ['Boeing 737-900', 'Airbus A330-300'],
    seatsRemaining: 5,
    policyCompliant: true
  },
  {
    id: 'KL-1003',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'OTP')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-08'
    },
    departureTime: '2025-09-08T08:35:00.000Z',
    arrivalTime: '2025-09-08T16:05:00.000Z',
    totalDuration: '17h 30m',
    segments: [
      {
        id: 'RO101-OTP-AMS',
        airline: 'TAROM',
        flightNumber: 'RO 101',
        operatedBy: 'RO',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'OTP')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'AMS')!,
        departureTime: '2025-09-08T08:35:00.000Z',
        arrivalTime: '2025-09-08T11:50:00.000Z',
        duration: '3h 15m',
        aircraft: 'Boeing 737-800',
        layoverDuration: '4h 15m'
      },
      {
        id: 'DL161-AMS-SEA',
        airline: 'Delta',
        flightNumber: 'DL 161',
        operatedBy: 'DL',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'AMS')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-08T16:05:00.000Z',
        arrivalTime: '2025-09-08T18:05:00.000Z',
        duration: '10h 00m',
        aircraft: 'Boeing 767-400'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'AMS')!],
    primaryAirline: 'KLM',
    operatingAirlines: ['RO', 'DL'],
    fareClasses: [
      {
        id: 'economy-light-3',
        name: 'Economy Light',
        type: 'Economy',
        basePrice: 1309,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: false, fee: 25 },
            second: { included: false, fee: 50 }
          }
        },
        seatSelection: { included: false, fee: 15, advanceSelection: false },
        flexibility: { refundable: false, changeFee: 150 },
        co2Emissions: '1266kg CO2e',
        restrictions: ['No refunds', 'Change fee applies']
      },
      {
        id: 'economy-standard-3',
        name: 'Economy Standard',
        type: 'Economy',
        basePrice: 1397,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: true, fee: 0 },
            second: { included: false, fee: 50 }
          }
        },
        seatSelection: { included: false, fee: 15, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 100 },
        co2Emissions: '1266kg CO2e',
        restrictions: ['Change fee applies']
      },
      {
        id: 'economy-flex-3',
        name: 'Economy Flex',
        type: 'Economy',
        basePrice: 1589,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: true, fee: 0 },
            second: { included: true, fee: 0 }
          }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 0, freeAdvancedChanges: true },
        co2Emissions: '1266kg CO2e',
        restrictions: ['Free changes']
      },
      {
        id: 'economy-full-flex-3',
        name: 'Economy Full Flex',
        type: 'Economy',
        basePrice: 5212,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: true, fee: 0 },
            second: { included: true, fee: 0 }
          }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: true, changeFee: 0, freeAdvancedChanges: true },
        co2Emissions: '1266kg CO2e',
        restrictions: ['Fully refundable']
      }
    ],
    badges: ['Recommended'],
    co2Emissions: '1266kg CO2e',
    aircraft: ['Boeing 737-800', 'Boeing 767-400'],
    seatsRemaining: 12,
    policyCompliant: true
  },

  // ========================================================================
  // EXPANDED FLIGHT DATA FOR COMPREHENSIVE FILTER TESTING
  // Based on real Concur flight search results (LHR-SEA route)
  // ========================================================================

  // Delta flight - Most Preferred, Nonstop, operated by Virgin Atlantic
  {
    id: 'DL-502',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T13:25:00.000Z',
    arrivalTime: '2025-09-10T15:30:00.000Z',
    totalDuration: '10h 5m',
    segments: [
      {
        id: 'VS101-LHR-SEA',
        airline: 'Virgin Atlantic',
        flightNumber: 'VS 101',
        operatedBy: 'VS',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-10T13:25:00.000Z',
        arrivalTime: '2025-09-10T15:30:00.000Z',
        duration: '10h 5m',
        aircraft: 'Airbus A350-1000'
      }
    ],
    stops: 0,
    stopAirports: [],
    primaryAirline: 'Delta',
    operatingAirlines: ['VS'],
    fareClasses: [
      {
        id: 'delta-comfort-1',
        name: 'Delta Comfort',
        type: 'Economy+',
        basePrice: 2275,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: true, fee: 0 }, second: { included: false, fee: 75 } }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 200 },
        co2Emissions: '2156kg CO2e',
        restrictions: ['Change fee applies']
      }
    ],
    badges: ['Most Preferred'],
    co2Emissions: '2156kg CO2e',
    aircraft: ['Airbus A350-1000'],
    seatsRemaining: 8,
    policyCompliant: false,
    policyViolations: ['Exceeds maximum fare policy']
  },

  // Delta flight - Second departure time
  {
    id: 'DL-503',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T17:25:00.000Z',
    arrivalTime: '2025-09-10T19:50:00.000Z',
    totalDuration: '10h 25m',
    segments: [
      {
        id: 'DL21-LHR-SEA',
        airline: 'Delta',
        flightNumber: 'DL 21',
        operatedBy: 'DL',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-10T17:25:00.000Z',
        arrivalTime: '2025-09-10T19:50:00.000Z',
        duration: '10h 25m',
        aircraft: 'Airbus A330-300'
      }
    ],
    stops: 0,
    stopAirports: [],
    primaryAirline: 'Delta',
    operatingAirlines: ['DL'],
    fareClasses: [
      {
        id: 'delta-comfort-2',
        name: 'Delta Comfort',
        type: 'Economy+',
        basePrice: 2275,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: true, fee: 0 }, second: { included: false, fee: 75 } }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 200 },
        co2Emissions: '2234kg CO2e',
        restrictions: ['Change fee applies']
      }
    ],
    badges: ['Most Preferred'],
    co2Emissions: '2234kg CO2e',
    aircraft: ['Airbus A330-300'],
    seatsRemaining: 15,
    policyCompliant: true
  },

  // Icelandair - Budget option with stop
  {
    id: 'FI-205',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'LGW')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T15:35:00.000Z',
    arrivalTime: '2025-09-10T20:40:00.000Z',
    totalDuration: '13h 5m',
    segments: [
      {
        id: 'FI205-LGW-KEF',
        airline: 'Icelandair',
        flightNumber: 'FI 205',
        operatedBy: 'FI',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'LGW')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'KEF')!,
        departureTime: '2025-09-10T15:35:00.000Z',
        arrivalTime: '2025-09-10T17:45:00.000Z',
        duration: '3h 10m',
        aircraft: 'Boeing 767-300ER',
        layoverDuration: '2h 15m'
      },
      {
        id: 'FI205-KEF-SEA',
        airline: 'Icelandair',
        flightNumber: 'FI 205',
        operatedBy: 'FI',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'KEF')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-10T20:00:00.000Z',
        arrivalTime: '2025-09-10T20:40:00.000Z',
        duration: '7h 40m',
        aircraft: 'Boeing 767-300ER'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'KEF')!],
    primaryAirline: 'Icelandair',
    operatingAirlines: ['FI'],
    fareClasses: [
      {
        id: 'economy-light-ic1',
        name: 'Economy Light',
        type: 'Economy',
        basePrice: 1064,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: false, fee: 55 }, second: { included: false, fee: 75 } }
        },
        seatSelection: { included: false, fee: 25, advanceSelection: false },
        flexibility: { refundable: false, changeFee: 150 },
        co2Emissions: '1923kg CO2e',
        restrictions: ['No checked bag', 'Change fee applies']
      },
      {
        id: 'economy-standard-ic1',
        name: 'Economy Standard',
        type: 'Economy',
        basePrice: 1179,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: true, fee: 0 }, second: { included: false, fee: 75 } }
        },
        seatSelection: { included: false, fee: 25, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 100 },
        co2Emissions: '1923kg CO2e',
        restrictions: ['Change fee applies']
      }
    ],
    badges: ['Cheapest'],
    co2Emissions: '1923kg CO2e',
    aircraft: ['Boeing 767-300ER'],
    seatsRemaining: 23,
    policyCompliant: true
  },

  // American Airlines - Policy restricted
  {
    id: 'AA-131',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T09:50:00.000Z',
    arrivalTime: '2025-09-10T11:35:00.000Z',
    totalDuration: '9h 45m',
    segments: [
      {
        id: 'BA123-LHR-SEA',
        airline: 'British Airways',
        flightNumber: 'BA 123',
        operatedBy: 'BA',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-10T09:50:00.000Z',
        arrivalTime: '2025-09-10T11:35:00.000Z',
        duration: '9h 45m',
        aircraft: 'Boeing 787-9'
      }
    ],
    stops: 0,
    stopAirports: [],
    primaryAirline: 'American Airlines',
    operatingAirlines: ['BA'],
    fareClasses: [],
    badges: ['More Preferred', 'Fastest'],
    co2Emissions: '2012kg CO2e',
    aircraft: ['Boeing 787-9'],
    seatsRemaining: 0,
    policyCompliant: false,
    policyRestriction: 'All offers for this itinerary are restricted by your company policy'
  },

  // British Airways - Multiple fare classes
  {
    id: 'BA-123',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T09:50:00.000Z',
    arrivalTime: '2025-09-10T11:35:00.000Z',
    totalDuration: '9h 45m',
    segments: [
      {
        id: 'BA123-LHR-SEA',
        airline: 'British Airways',
        flightNumber: 'BA 123',
        operatedBy: 'BA',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-10T09:50:00.000Z',
        arrivalTime: '2025-09-10T11:35:00.000Z',
        duration: '9h 45m',
        aircraft: 'Boeing 787-9'
      }
    ],
    stops: 0,
    stopAirports: [],
    primaryAirline: 'British Airways',
    operatingAirlines: ['BA'],
    fareClasses: [
      {
        id: 'basic-economy-ba1',
        name: 'Basic Economy',
        type: 'Economy',
        basePrice: 2991,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: false, fee: 60 }, second: { included: false, fee: 90 } }
        },
        seatSelection: { included: false, fee: 35, advanceSelection: false },
        flexibility: { refundable: false, changeFee: 250 },
        co2Emissions: '2012kg CO2e',
        restrictions: ['No checked bag', 'No seat selection', 'High change fee']
      },
      {
        id: 'economy-select-pro-ba1',
        name: 'Economy Select Pro',
        type: 'Economy+',
        basePrice: 3348,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: true, fee: 0 }, second: { included: false, fee: 90 } }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 150 },
        co2Emissions: '2012kg CO2e',
        restrictions: ['Change fee applies']
      }
    ],
    badges: ['Fastest'],
    co2Emissions: '2012kg CO2e',
    aircraft: ['Boeing 787-9'],
    seatsRemaining: 18,
    policyCompliant: true
  },

  // Air France - Most Preferred with multiple classes
  {
    id: 'AF-356',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T13:25:00.000Z',
    arrivalTime: '2025-09-10T15:30:00.000Z',
    totalDuration: '10h 5m',
    segments: [
      {
        id: 'VS101-LHR-SEA-2',
        airline: 'Virgin Atlantic',
        flightNumber: 'VS 101',
        operatedBy: 'VS',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-10T13:25:00.000Z',
        arrivalTime: '2025-09-10T15:30:00.000Z',
        duration: '10h 5m',
        aircraft: 'Airbus A350-1000'
      }
    ],
    stops: 0,
    stopAirports: [],
    primaryAirline: 'Air France',
    operatingAirlines: ['VS'],
    fareClasses: [
      {
        id: 'economy-light-af1',
        name: 'Economy Light',
        type: 'Economy',
        basePrice: 3008,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: false, fee: 70 }, second: { included: false, fee: 100 } }
        },
        seatSelection: { included: false, fee: 30, advanceSelection: false },
        flexibility: { refundable: false, changeFee: 200 },
        co2Emissions: '2156kg CO2e',
        restrictions: ['No checked bag', 'Change fee applies']
      },
      {
        id: 'economy-flex-af1',
        name: 'Economy Flex',
        type: 'Economy',
        basePrice: 2350,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: true, fee: 0 }, second: { included: true, fee: 0 } }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 0, freeAdvancedChanges: true },
        co2Emissions: '2156kg CO2e',
        restrictions: ['Free changes']
      }
    ],
    badges: ['Most Preferred'],
    co2Emissions: '2156kg CO2e',
    aircraft: ['Airbus A350-1000'],
    seatsRemaining: 11,
    policyCompliant: true
  },

  // Lufthansa - with stop in Vancouver
  {
    id: 'LH-441',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T14:10:00.000Z',
    arrivalTime: '2025-09-10T18:36:00.000Z',
    totalDuration: '12h 26m',
    segments: [
      {
        id: 'LH441-LHR-YVR',
        airline: 'Lufthansa',
        flightNumber: 'LH 441',
        operatedBy: 'AC',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'YVR')!,
        departureTime: '2025-09-10T14:10:00.000Z',
        arrivalTime: '2025-09-10T15:50:00.000Z',
        duration: '9h 40m',
        aircraft: 'Boeing 777-300ER',
        layoverDuration: '1h 6m'
      },
      {
        id: 'AC1234-YVR-SEA',
        airline: 'Air Canada',
        flightNumber: 'AC 1234',
        operatedBy: 'AC',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'YVR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-10T16:56:00.000Z',
        arrivalTime: '2025-09-10T18:36:00.000Z',
        duration: '1h 40m',
        aircraft: 'Embraer E190'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'YVR')!],
    primaryAirline: 'Lufthansa',
    operatingAirlines: ['AC'],
    fareClasses: [
      {
        id: 'economy-light-lh1',
        name: 'Economy Light',
        type: 'Economy',
        basePrice: 4253,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: false, fee: 80 }, second: { included: false, fee: 120 } }
        },
        seatSelection: { included: false, fee: 40, advanceSelection: false },
        flexibility: { refundable: false, changeFee: 300 },
        co2Emissions: '3456kg CO2e',
        restrictions: ['No checked bag', 'High change fee']
      },
      {
        id: 'economy-flex-lh1',
        name: 'Economy Flex',
        type: 'Economy',
        basePrice: 4611,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: true, fee: 0 }, second: { included: false, fee: 120 } }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 150 },
        co2Emissions: '3456kg CO2e',
        restrictions: ['Change fee applies']
      }
    ],
    badges: ['More Preferred'],
    co2Emissions: '3456kg CO2e',
    aircraft: ['Boeing 777-300ER', 'Embraer E190'],
    seatsRemaining: 7,
    policyCompliant: false,
    policyViolations: ['High CO2 emissions exceed policy']
  },

  // United Airlines - with stop
  {
    id: 'UA-931',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T14:10:00.000Z',
    arrivalTime: '2025-09-10T18:36:00.000Z',
    totalDuration: '12h 26m',
    segments: [
      {
        id: 'UA931-LHR-YVR',
        airline: 'United Airlines',
        flightNumber: 'UA 931',
        operatedBy: 'AC',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'YVR')!,
        departureTime: '2025-09-10T14:10:00.000Z',
        arrivalTime: '2025-09-10T15:50:00.000Z',
        duration: '9h 40m',
        aircraft: 'Boeing 777-200',
        layoverDuration: '1h 6m'
      },
      {
        id: 'AC1234-YVR-SEA-2',
        airline: 'Air Canada',
        flightNumber: 'AC 1234',
        operatedBy: 'AC',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'YVR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-10T16:56:00.000Z',
        arrivalTime: '2025-09-10T18:36:00.000Z',
        duration: '1h 40m',
        aircraft: 'Embraer E190'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'YVR')!],
    primaryAirline: 'United Airlines',
    operatingAirlines: ['AC'],
    fareClasses: [
      {
        id: 'basic-economy-ua1',
        name: 'Basic Economy',
        type: 'Economy',
        basePrice: 4231,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: false, fee: 75 }, second: { included: false, fee: 100 } }
        },
        seatSelection: { included: false, fee: 35, advanceSelection: false },
        flexibility: { refundable: false, changeFee: 300 },
        co2Emissions: '3401kg CO2e',
        restrictions: ['No checked bag', 'No seat selection']
      },
      {
        id: 'economy-ua1',
        name: 'Economy',
        type: 'Economy',
        basePrice: 4358,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: true, fee: 0 }, second: { included: false, fee: 100 } }
        },
        seatSelection: { included: false, fee: 35, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 200 },
        co2Emissions: '3401kg CO2e',
        restrictions: ['Change fee applies']
      }
    ],
    badges: [],
    co2Emissions: '3401kg CO2e',
    aircraft: ['Boeing 777-200', 'Embraer E190'],
    seatsRemaining: 13,
    policyCompliant: true
  },

  // Icelandair - different time
  {
    id: 'FI-206',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T13:05:00.000Z',
    arrivalTime: '2025-09-10T17:50:00.000Z',
    totalDuration: '12h 45m',
    segments: [
      {
        id: 'FI206-LHR-KEF',
        airline: 'Icelandair',
        flightNumber: 'FI 206',
        operatedBy: 'FI',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'KEF')!,
        departureTime: '2025-09-10T13:05:00.000Z',
        arrivalTime: '2025-09-10T15:15:00.000Z',
        duration: '3h 10m',
        aircraft: 'Boeing 757-200',
        layoverDuration: '2h 30m'
      },
      {
        id: 'FI206-KEF-SEA',
        airline: 'Icelandair',
        flightNumber: 'FI 206',
        operatedBy: 'FI',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'KEF')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-10T17:45:00.000Z',
        arrivalTime: '2025-09-10T17:50:00.000Z',
        duration: '7h 5m',
        aircraft: 'Boeing 757-200'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'KEF')!],
    primaryAirline: 'Icelandair',
    operatingAirlines: ['FI'],
    fareClasses: [
      {
        id: 'economy-standard-ic2',
        name: 'Economy Standard',
        type: 'Economy',
        basePrice: 1401,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: true, fee: 0 }, second: { included: false, fee: 75 } }
        },
        seatSelection: { included: false, fee: 25, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 100 },
        co2Emissions: '1879kg CO2e',
        restrictions: ['Change fee applies']
      }
    ],
    badges: [],
    co2Emissions: '1879kg CO2e',
    aircraft: ['Boeing 757-200'],
    seatsRemaining: 31,
    policyCompliant: true
  },

  // Air France with stop in Paris
  {
    id: 'AF-1280',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T06:15:00.000Z',
    arrivalTime: '2025-09-10T11:15:00.000Z',
    totalDuration: '13h 0m',
    segments: [
      {
        id: 'AF1280-LHR-CDG',
        airline: 'Air France',
        flightNumber: 'AF 1280',
        operatedBy: 'AF',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'CDG')!,
        departureTime: '2025-09-10T06:15:00.000Z',
        arrivalTime: '2025-09-10T08:45:00.000Z',
        duration: '1h 30m',
        aircraft: 'Airbus A320',
        layoverDuration: '2h 30m'
      },
      {
        id: 'AF1280-CDG-SEA',
        airline: 'Air France',
        flightNumber: 'AF 55',
        operatedBy: 'AF',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'CDG')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        departureTime: '2025-09-10T11:15:00.000Z',
        arrivalTime: '2025-09-10T11:15:00.000Z',
        duration: '9h 0m',
        aircraft: 'Boeing 777-300ER'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'CDG')!],
    primaryAirline: 'Air France',
    operatingAirlines: ['AF'],
    fareClasses: [
      {
        id: 'economy-light-af2',
        name: 'Economy Light',
        type: 'Economy',
        basePrice: 2098,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: false, fee: 70 }, second: { included: false, fee: 100 } }
        },
        seatSelection: { included: false, fee: 30, advanceSelection: false },
        flexibility: { refundable: false, changeFee: 200 },
        co2Emissions: '2789kg CO2e',
        restrictions: ['No checked bag', 'Change fee applies']
      },
      {
        id: 'economy-flex-af2',
        name: 'Economy Flex',
        type: 'Economy',
        basePrice: 2340,
        currency: 'EUR',
        tripType: 'Round-trip',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: { first: { included: true, fee: 0 }, second: { included: true, fee: 0 } }
        },
        seatSelection: { included: true, fee: 0, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 0, freeAdvancedChanges: true },
        co2Emissions: '2789kg CO2e',
        restrictions: ['Free changes']
      }
    ],
    badges: ['Most Preferred'],
    co2Emissions: '2789kg CO2e',
    aircraft: ['Airbus A320', 'Boeing 777-300ER'],
    seatsRemaining: 9,
    policyCompliant: true
  },

  // ========================================================================
  // SEA to LHR flights for task testing (Sep 8-12, 2025)
  // ========================================================================
  
  // Air France SEA -> LHR with stop in Paris (Sep 10)
  {
    id: 'AF-2180',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      departureDate: '2025-09-10'
    },
    departureTime: '2025-09-10T14:30:00.000Z',
    arrivalTime: '2025-09-10T14:35:00.000Z', // Next day arrival
    totalDuration: '10h 5m',
    segments: [
      {
        id: 'AF2180-SEA-CDG',
        airline: 'Air France',
        flightNumber: 'AF 2180',
        operatedBy: 'AF',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'CDG')!,
        departureTime: '2025-09-10T14:30:00.000Z',
        arrivalTime: '2025-09-10T10:45:00.000Z', // Next day
        duration: '8h 15m',
        aircraft: 'Boeing 777-300ER',
        layoverDuration: '1h 50m'
      },
      {
        id: 'AF2180-CDG-LHR',
        airline: 'Air France',
        flightNumber: 'AF 1180',
        operatedBy: 'AF',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'CDG')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        departureTime: '2025-09-10T12:35:00.000Z', // Next day
        arrivalTime: '2025-09-10T14:35:00.000Z',
        duration: '1h 20m',
        aircraft: 'Airbus A320'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'CDG')!],
    primaryAirline: 'Air France',
    operatingAirlines: ['AF'],
    fareClasses: [
      {
        id: 'economy-af-sea-lhr',
        name: 'Economy Light',
        type: 'Economy',
        basePrice: 1890,
        currency: 'EUR',
        tripType: 'One-way',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: false, fee: 150 },
            second: { included: false, fee: 200 }
          }
        },
        seatSelection: { included: false, fee: 25, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 150 },
        co2Emissions: '2650kg CO2e',
        restrictions: ['Change fee applies', 'No refunds']
      }
    ],
    badges: ['Most Preferred'],
    co2Emissions: '2650kg CO2e',
    aircraft: ['Boeing 777-300ER', 'Airbus A320'],
    seatsRemaining: 12,
    policyCompliant: true
  },

  // Air France direct SEA -> LHR (Sep 11) - NONSTOP
  {
    id: 'AF-2280',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      departureDate: '2025-09-11'
    },
    departureTime: '2025-09-11T16:15:00.000Z',
    arrivalTime: '2025-09-11T09:20:00.000Z', // Next day arrival
    totalDuration: '9h 5m',
    segments: [
      {
        id: 'AF2280-SEA-LHR',
        airline: 'Air France',
        flightNumber: 'AF 2280',
        operatedBy: 'AF',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        departureTime: '2025-09-11T16:15:00.000Z',
        arrivalTime: '2025-09-11T09:20:00.000Z', // Next day
        duration: '9h 5m',
        aircraft: 'Boeing 787-9'
      }
    ],
    stops: 0,
    stopAirports: [],
    primaryAirline: 'Air France',
    operatingAirlines: ['AF'],
    fareClasses: [
      {
        id: 'economy-af-nonstop',
        name: 'Economy Light',
        type: 'Economy',
        basePrice: 2290,
        currency: 'EUR',
        tripType: 'One-way',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: false, fee: 180 },
            second: { included: false, fee: 220 }
          }
        },
        seatSelection: { included: false, fee: 30, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 180 },
        co2Emissions: '2580kg CO2e',
        restrictions: ['Change fee applies', 'No refunds']
      }
    ],
    badges: ['Recommended'],
    co2Emissions: '2580kg CO2e',
    aircraft: ['Boeing 787-9'],
    seatsRemaining: 15,
    policyCompliant: true
  },

  // Air France SEA -> LHR via Amsterdam (Sep 12) - 1 STOP
  {
    id: 'AF-2380',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      departureDate: '2025-09-12'
    },
    departureTime: '2025-09-12T11:45:00.000Z',
    arrivalTime: '2025-09-12T13:10:00.000Z', // Next day arrival
    totalDuration: '11h 25m',
    segments: [
      {
        id: 'AF2380-SEA-AMS',
        airline: 'Air France',
        flightNumber: 'AF 2380',
        operatedBy: 'AF',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'AMS')!,
        departureTime: '2025-09-12T11:45:00.000Z',
        arrivalTime: '2025-09-12T06:30:00.000Z', // Next day
        duration: '8h 45m',
        aircraft: 'Airbus A350-900',
        layoverDuration: '1h 20m'
      },
      {
        id: 'AF2380-AMS-LHR',
        airline: 'Air France',
        flightNumber: 'AF 1381',
        operatedBy: 'AF',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'AMS')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        departureTime: '2025-09-12T07:50:00.000Z', // Next day
        arrivalTime: '2025-09-12T13:10:00.000Z',
        duration: '1h 20m',
        aircraft: 'Airbus A320'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'AMS')!],
    primaryAirline: 'Air France',
    operatingAirlines: ['AF'],
    fareClasses: [
      {
        id: 'economy-af-ams-stop',
        name: 'Economy Light',
        type: 'Economy',
        basePrice: 1950,
        currency: 'EUR',
        tripType: 'One-way',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: false, fee: 160 },
            second: { included: false, fee: 210 }
          }
        },
        seatSelection: { included: false, fee: 28, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 160 },
        co2Emissions: '2780kg CO2e',
        restrictions: ['Change fee applies', 'No refunds']
      }
    ],
    badges: ['Most Preferred'],
    co2Emissions: '2780kg CO2e',
    aircraft: ['Airbus A350-900', 'Airbus A320'],
    seatsRemaining: 18,
    policyCompliant: true
  },

  // British Airways direct SEA -> LHR (Sep 9)
  {
    id: 'BA-2249',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      departureDate: '2025-09-09'
    },
    departureTime: '2025-09-09T16:45:00.000Z',
    arrivalTime: '2025-09-09T10:50:00.000Z', // Next day arrival
    totalDuration: '9h 5m',
    segments: [
      {
        id: 'BA2249-SEA-LHR',
        airline: 'British Airways',
        flightNumber: 'BA 2249',
        operatedBy: 'BA',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        departureTime: '2025-09-09T16:45:00.000Z',
        arrivalTime: '2025-09-09T10:50:00.000Z', // Next day
        duration: '9h 5m',
        aircraft: 'Boeing 787-9'
      }
    ],
    stops: 0,
    stopAirports: [],
    primaryAirline: 'British Airways',
    operatingAirlines: ['BA'],
    fareClasses: [
      {
        id: 'economy-ba-sea-lhr',
        name: 'Economy Basic',
        type: 'Economy',
        basePrice: 2150,
        currency: 'EUR',
        tripType: 'One-way',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: false, fee: 200 },
            second: { included: false, fee: 250 }
          }
        },
        seatSelection: { included: false, fee: 30, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 200 },
        co2Emissions: '2890kg CO2e',
        restrictions: ['Change fee applies', 'No refunds']
      }
    ],
    badges: ['Recommended'],
    co2Emissions: '2890kg CO2e',
    aircraft: ['Boeing 787-9'],
    seatsRemaining: 18,
    policyCompliant: true
  },

  // Delta SEA -> LHR via Amsterdam (Sep 11)
  {
    id: 'DL-0268',
    route: {
      from: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
      to: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
      departureDate: '2025-09-11'
    },
    departureTime: '2025-09-11T12:20:00.000Z',
    arrivalTime: '2025-09-11T15:35:00.000Z', // Next day arrival
    totalDuration: '11h 15m',
    segments: [
      {
        id: 'DL268-SEA-AMS',
        airline: 'Delta',
        flightNumber: 'DL 268',
        operatedBy: 'DL',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'SEA')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'AMS')!,
        departureTime: '2025-09-11T12:20:00.000Z',
        arrivalTime: '2025-09-11T07:45:00.000Z', // Next day
        duration: '8h 25m',
        aircraft: 'Airbus A350-900',
        layoverDuration: '1h 30m'
      },
      {
        id: 'KL1006-AMS-LHR',
        airline: 'KLM',
        flightNumber: 'KL 1006',
        operatedBy: 'KL',
        departureAirport: MOCK_AIRPORTS.find(a => a.code === 'AMS')!,
        arrivalAirport: MOCK_AIRPORTS.find(a => a.code === 'LHR')!,
        departureTime: '2025-09-11T09:15:00.000Z', // Next day
        arrivalTime: '2025-09-11T15:35:00.000Z',
        duration: '1h 20m',
        aircraft: 'Boeing 737-800'
      }
    ],
    stops: 1,
    stopAirports: [MOCK_AIRPORTS.find(a => a.code === 'AMS')!],
    primaryAirline: 'Delta',
    operatingAirlines: ['DL', 'KL'],
    fareClasses: [
      {
        id: 'economy-dl-sea-lhr',
        name: 'Basic Economy',
        type: 'Economy',
        basePrice: 1780,
        currency: 'EUR',
        tripType: 'One-way',
        baggage: {
          carryOn: { included: true, count: 1 },
          checked: {
            first: { included: false, fee: 175 },
            second: { included: false, fee: 225 }
          }
        },
        seatSelection: { included: false, fee: 35, advanceSelection: true },
        flexibility: { refundable: false, changeFee: 175 },
        co2Emissions: '2720kg CO2e',
        restrictions: ['Change fee applies', 'No refunds']
      }
    ],
    badges: ['Fastest'],
    co2Emissions: '2720kg CO2e',
    aircraft: ['Airbus A350-900', 'Boeing 737-800'],
    seatsRemaining: 22,
    policyCompliant: true
  }
];

// Generated mock flight data (includes both generated and legacy flights)
export const MOCK_FLIGHT_RESULTS: Flight[] = [...generateFlights(), ...LEGACY_MOCK_FLIGHT_RESULTS];

// Default travel search criteria
export const getInitialTravelSearchCriteria = (): TripSearchCriteria => ({
  tripType: 'round-trip',
  fromAirport: null,
  toAirport: null,
  departureDate: '',
  returnDate: '',
  passengers: {
    adults: 1,
    children: 0,
    infants: 0
  },
  class: 'Economy',
  flexibility: {
    dates: false,
    airports: false
  },
  timeFilters: {
    departureStart: 0,   // Any time (00:00)
    departureEnd: 23,    // Any time (23:59)
    arrivalStart: 0,     // Any time (00:00)  
    arrivalEnd: 23       // Any time (23:59)
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const getInitialFormData = (): FormData => ({
  ...DEFAULT_FORM_VALUES
});

export const getInitialTravelAppState = (): TravelAppState => ({
  currentView: 'search',
  searchCriteria: getInitialTravelSearchCriteria(),
  searchResults: [],
  selectedFlights: {},
  isSearching: false
});

export const getInitialAppState = (): AppState => ({
  availableExpenses: [...MOCK_AVAILABLE_EXPENSES],
  reports: [],
  submittedReports: [],
  currentReport: null,
  submission: null,
  travelState: getInitialTravelAppState()
});

export const getInitialViewState = (): ViewState => ({
  currentView: 'dashboard',
  showCreateReportModal: false,
  isEditMode: false,
  showCreateDropdown: false,
  showOverflowMenu: false,
  showAddExpenseModal: false,
  showExpenseSourceModal: false,
  showSubmitModal: false,
  showReportSubmittedModal: false,
  showAttachReceiptModal: false,
  showErrorModal: false,
  // Travel-specific state
  showDatePicker: false,
  showAirportSearch: { field: null }
});

// Window type augmentation for task compatibility
declare global {
  interface Window {
    app_state: {
      availableExpenses: Expense[];
      reports: Report[];
      submittedReports: Report[];
      currentReport: Report | null;
      submission: any;
    };
  }
}
