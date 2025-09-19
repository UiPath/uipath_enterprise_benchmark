import React, { useRef, useState } from 'react';
import TimeRangeSlider from './TimeRangeSlider';
import SimpleSlider from './SimpleSlider';

interface AllFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onClearAll: () => void;
  // Time filters
  departStart: number;
  departEnd: number;
  arriveStart: number;
  arriveEnd: number;
  setDepartStart: (h: number) => void;
  setDepartEnd: (h: number) => void;
  setArriveStart: (h: number) => void;
  setArriveEnd: (h: number) => void;
  // Emissions filter
  emissionsMin: number;
  emissionsMax: number;
  emissionsValue: number;
  setEmissionsValue: (value: number) => void;
  // Stops filter
  selectedStops: string;
  setSelectedStops: (value: string) => void;
  // Flexibility filters
  fullyRefundable: boolean;
  freeChanges: boolean;
  setFullyRefundable: (value: boolean) => void;
  setFreeChanges: (value: boolean) => void;
  // Policy filters
  inPolicyFares: boolean;
  leastCostLogical: boolean;
  setInPolicyFares: (value: boolean) => void;
  setLeastCostLogical: (value: boolean) => void;
  // Carriers filter
  carriers: Array<{name: string; preference: string; price: string; selected: boolean}>;
  setCarriers: (carriers: Array<{name: string; preference: string; price: string; selected: boolean}>) => void;
}

const AllFiltersModal: React.FC<AllFiltersModalProps> = ({
  open,
  onClose,
  onClearAll,
  departStart,
  departEnd,
  arriveStart,
  arriveEnd,
  setDepartStart,
  setDepartEnd,
  setArriveStart,
  setArriveEnd,
  emissionsMin,
  emissionsMax,
  emissionsValue,
  setEmissionsValue,
  selectedStops,
  setSelectedStops,
  fullyRefundable,
  freeChanges,
  setFullyRefundable,
  setFreeChanges,
  inPolicyFares,
  leastCostLogical,
  setInPolicyFares,
  setLeastCostLogical,
  carriers,
  setCarriers
}) => {
  if (!open) return null;

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </section>
  );

  const Divider: React.FC = () => (
    <hr
      className="w-full"
      style={{
        border: 0,
        borderTop: '1px solid var(--cnqrColors_GreyLighter, var(--sapList_BorderColor, #e5e7eb))',
        marginTop: 18,
        marginBottom: 18
      }}
    />
  );

  // Lists
  const connectingAirports: string[] = [
    'Amsterdam Airport Schiphol (AMS)',
    'Athens International Airport (ATH)',
    'Boston Logan International Airport (BOS)',
    "Chicago O'Hare International Airport (ORD)",
    'Denver International Airport (DEN)',
    'Frankfurt Airport (FRA)',
    'Hartsfield-Jackson Atlanta International Airport (ATL)',
    'Istanbul Airport (IST)',
    'John F. Kennedy International Airport (JFK)',
    'London Heathrow Airport (LHR)',
    'Los Angeles International Airport (LAX)',
    'Minneapolis-St. Paul International Airport (MSP)',
    'Montreal-Pierre Elliott Trudeau International Airport (YUL)',
    'Munich International Airport (MUC)',
    'Newark Liberty International Airport (EWR)',
    'Paris-Charles De Gaulle Airport (CDG)',
    'Pearson International Airport (YYZ)',
    'Portland International Airport (PDX)',
    'Salt Lake City International Airport (SLC)',
    'San Francisco International Airport (SFO)',
    'Vancouver International Airport (YVR)',
    'Vienna International Airport (VIE)',
    'Warsaw Chopin Airport (WAW)',
    'Washington Dulles International Airport (IAD)',
    'Zurich Airport (ZRH)'
  ];


  const seatTypes: string[] = [
    'Above Average Legroom',
    'Cradle Recliner',
    'Full Flat Pod',
    'Full Flat Seat',
    'Private Suite',
    'Standard Legroom'
  ];

  const [showAllAirports, setShowAllAirports] = useState(false);
  const [showAllCarriers, setShowAllCarriers] = useState(false);
  const [showAllSeatTypes, setShowAllSeatTypes] = useState(false);

  // Preserve scroll position when expanding lists
  const panelRef = useRef<HTMLDivElement>(null);
  const preserveScrollThen = (toggle: () => void) => () => {
    const top = panelRef.current?.scrollTop ?? 0;
    toggle();
    requestAnimationFrame(() => {
      if (panelRef.current) panelRef.current.scrollTop = top;
    });
  };

  return (
    <>
      {/* Backdrop for click outside detection */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Modal positioned relative to button */}
      <div className="absolute z-50 top-full left-0 mt-2">
        {/* Panel positioned under the All Filters button */}
        <div
          ref={panelRef}
          className="w-[400px] max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200"
        >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Filters</h2>
          <button onClick={onClearAll} className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">Clear All</button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {/* Number of stops */}
          <Section title="Number of Stops">
            <div className="flex flex-col gap-3 text-sm">
              {[
                { value: 'any', label: 'Any stops' },
                { value: 'nonstop', label: 'Nonstop' },
                { value: '1-stop', label: '1 stop' },
                { value: '1-or-fewer', label: '1 stop or fewer' },
                { value: '2-stops', label: '2 stops' },
                { value: '2-or-fewer', label: '2 stops or fewer' }
              ].map((option) => (
                <label key={option.value} className="inline-flex items-center gap-2 text-gray-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="stops" 
                    value={option.value}
                    checked={selectedStops === option.value}
                    onChange={(e) => preserveScrollThen(() => setSelectedStops(e.target.value))()}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </Section>
          <Divider />
          {/* Time */}
          <Section title="Time">
            <div className="space-y-6">
              <TimeRangeSlider
                label="Departing"
                startHour={departStart}
                endHour={departEnd}
                onStartChange={(value) => {
                  setDepartStart(value);
                }}
                onEndChange={(value) => {
                  setDepartEnd(value);
                }}
                showDropdown={false}
                showTimeInLabel={true}
                anytimeText="anytime"
              />
              <TimeRangeSlider
                label="Arriving"
                startHour={arriveStart}
                endHour={arriveEnd}
                onStartChange={(value) => {
                  setArriveStart(value);
                }}
                onEndChange={(value) => {
                  setArriveEnd(value);
                }}
                showDropdown={false}
                showTimeInLabel={true}
                anytimeText="anytime"
              />
            </div>
          </Section>
          <Divider />
          {/* Connecting Airport */}
          <Section title="Connecting Airport">
            <div className="flex flex-col gap-3 text-sm text-gray-800">
              {(showAllAirports ? connectingAirports : connectingAirports.slice(0, 5)).map((airport) => (
                <label key={airport} className="inline-flex items-center gap-2">
                  <input type="checkbox" />
                  {airport}
                </label>
              ))}
            </div>
            {!showAllAirports && connectingAirports.length > 5 && (
              <button onClick={preserveScrollThen(() => setShowAllAirports(true))} className="mt-3 text-sm text-blue-600 hover:underline">View All</button>
            )}
          </Section>
          <Divider />
          {/* Carriers */}
          <Section title="Carriers">
            <p className="text-sm text-gray-600 mb-3">*Some fares are excluded due to your policy settings.</p>
            <div className="space-y-3 text-sm">
              {(showAllCarriers ? carriers : carriers.slice(0, 5)).map((c, index) => (
                <label key={c.name} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={c.selected}
                    onChange={() => preserveScrollThen(() => {
                      const updated = [...carriers];
                      updated[index].selected = !updated[index].selected;
                      setCarriers(updated);
                    })()}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="flex-1 text-gray-800">{c.name}</span>
                  {c.preference && (
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">{c.preference}</span>
                  )}
                  <span className="text-gray-800">{c.price}</span>
                </label>
              ))}
            </div>
            {!showAllCarriers && carriers.length > 5 && (
              <button onClick={preserveScrollThen(() => setShowAllCarriers(true))} className="mt-3 text-sm text-blue-600 hover:underline">View All</button>
            )}
          </Section>
          <Divider />
          {/* Alliance */}
          <Section title="Alliance">
            <div className="flex flex-col gap-3 text-sm text-gray-800">
              {['Oneworld','Sky Team','Star Alliance'].map((a) => (
                <label key={a} className="inline-flex items-center gap-2">
                  <input type="checkbox" />
                  {a}
                </label>
              ))}
            </div>
          </Section>
          <Divider />
          {/* Class of Service */}
          <Section title="Class of Service">
            <div className="flex flex-col gap-3 text-sm text-gray-800">
              {['Economy','Premium Economy','Business','First'].map((s) => (
                <label key={s} className="inline-flex items-center gap-2">
                  <input type="checkbox" />
                  {s}
                </label>
              ))}
            </div>
          </Section>
          <Divider />
          {/* Seat Type */}
          <Section title="Seat Type">
            <div className="flex flex-col gap-3 text-sm text-gray-800">
              {(showAllSeatTypes ? seatTypes : seatTypes.slice(0, 5)).map((s) => (
                <label key={s} className="inline-flex items-center gap-2">
                  <input type="checkbox" />
                  {s}
                </label>
              ))}
            </div>
            {!showAllSeatTypes && seatTypes.length > 5 && (
              <button onClick={preserveScrollThen(() => setShowAllSeatTypes(true))} className="mt-3 text-sm text-blue-600 hover:underline">View All</button>
            )}
          </Section>
          <Divider />
          {/* Policy */}
          <Section title="Policy">
            <div className="flex flex-col gap-3 text-sm text-gray-800">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={inPolicyFares}
                  onChange={(e) => preserveScrollThen(() => setInPolicyFares(e.target.checked))()}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                In-policy Fares
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={leastCostLogical}
                  onChange={(e) => preserveScrollThen(() => setLeastCostLogical(e.target.checked))()}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Least Cost Logical Fares
              </label>
            </div>
          </Section>
          <Divider />
          {/* Flexibility */}
          <Section title="Flexibility">
            <div className="flex flex-col gap-3 text-sm text-gray-800">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={fullyRefundable}
                  onChange={(e) => preserveScrollThen(() => setFullyRefundable(e.target.checked))()}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Fully Refundable
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={freeChanges}
                  onChange={(e) => preserveScrollThen(() => setFreeChanges(e.target.checked))()}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Free Changes
              </label>
            </div>
          </Section>
          <hr className="border-t border-gray-200 my-4" />
          {/* Emissions */}
          <SimpleSlider
            label="Emissions"
            value={emissionsValue}
            min={emissionsMin}
            max={emissionsMax}
            onChange={setEmissionsValue}
            unit="kg"
            className="mb-6"
          />

          <hr className="border-t border-gray-200 my-4" />
          {/* Flight Number */}
          <Section title="Flight Number">
            <input type="text" placeholder="Flight Number" className="w-64 border border-gray-300 rounded px-3 py-2 text-sm" />
          </Section>
        </div>
      </div>
    </div>
    </>
  );
};

export default AllFiltersModal;


