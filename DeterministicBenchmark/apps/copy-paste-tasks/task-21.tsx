import React, { useState, useEffect, useRef } from 'react';
import { Calendar, User, Calculator, Plus, Minus, X } from 'lucide-react';


interface LabResult {
  patientId: string;
  fullName: string;
  testCategory: string;
  testName: string;
  resultValue: number;
  units: string;
  normalRange: string;
  collectionDate: string;
  labTech: string;
  patientPhone: string;
}

interface FormEntry {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  testCode: string;
  result: number;
  units: string;
  rangeStatus: 'normal' | 'abnormal' | 'critical' | 'pending';
  date: string;
  techId: string;
  status: 'active' | 'completed';
}

const Task21: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('hematology');
  const [showNamePicker, setShowNamePicker] = useState<string | null>(null);
  const [showRangeCalculator, setShowRangeCalculator] = useState<string | null>(null);
  
  // Form data for each tab
  const [hematologyEntries, setHematologyEntries] = useState<FormEntry[]>([]);
  const [chemistryEntries, setChemistryEntries] = useState<FormEntry[]>([]);
  const [immunologyEntries, setImmunologyEntries] = useState<FormEntry[]>([]);
  
  const [sourceData, setSourceData] = useState<LabResult[]>([]);
  const [expectedResults, setExpectedResults] = useState<any[]>([]);
  
  const hasLoggedRef = useRef(false);


  // Generate deterministic lab data
  useEffect(() => {
    
    const patients = [
      { id: 'P12345', name: 'Sarah Johnson', phone: '2065551234' },
      { id: 'P67890', name: 'Michael Chen', phone: '4155559876' },
      { id: 'P24681', name: 'Elena Rodriguez', phone: '7135552468' }
    ];
    
    const testCategories = {
      'Hematology': [
        { name: 'Complete Blood Count', range: '4.0-11.0', units: '10^6/μL' },
        { name: 'Hemoglobin', range: '12.0-16.0', units: 'g/dL' },
        { name: 'Hematocrit', range: '36-46', units: '%' }
      ],
      'Chemistry': [
        { name: 'Lipid Panel', range: '<200', units: 'mg/dL' },
        { name: 'Hemoglobin A1c', range: '<5.7', units: '%' },
        { name: 'Glucose', range: '70-100', units: 'mg/dL' }
      ],
      'Immunology': [
        { name: 'C-Reactive Protein', range: '<3.0', units: 'mg/L' },
        { name: 'Rheumatoid Factor', range: '<14', units: 'IU/mL' },
        { name: 'ANA Screen', range: 'Negative', units: 'titer' }
      ]
    };
    
    const labData: LabResult[] = [];
    const expectedData: any[] = [];
    
    // Generate exactly 3 lab results - one for each category
    patients.forEach((patient, index) => {
      const categories = Object.keys(testCategories);
      const category = categories[index];
      const tests = testCategories[category as keyof typeof testCategories];
      const test = tests[0]; // Use first test for each category
      
      const resultValue = category === 'Hematology' ? 4.5 : 
                         category === 'Chemistry' ? 185 : 2.1;
      
      const result: LabResult = {
        patientId: patient.id,
        fullName: patient.name,
        testCategory: category,
        testName: test.name,
        resultValue,
        units: test.units,
        normalRange: test.range,
        collectionDate: `2024-01-${15 + index}`,
        labTech: `MT-00${index + 1}`,
        patientPhone: patient.phone
      };
      
      labData.push(result);
      
      // Create expected form entry
      expectedData.push({
        category: category.toLowerCase(),
        patientId: patient.id,
        patientName: patient.name,
        phone: patient.phone,
        testCode: test.name,
        result: resultValue,
        units: test.units,
        date: result.collectionDate,
        techId: result.labTech,
        rangeStatus: 'normal'
      });
    });
    
    setSourceData(labData);
    setExpectedResults(expectedData);
    
      // Console log for testers (single run)
      if (!hasLoggedRef.current) {
        console.log('=== EXPECTED FORM ENTRIES (for testers) ===');
        console.log('NOTE: Excel source data will be provided as external files');
        expectedData.forEach((entry, index) => {
          console.log(`${index + 1}. Tab: ${entry.category}, Patient: ${entry.patientName} (${entry.patientId}), Test: ${entry.testCode}, Result: ${entry.result} ${entry.units}, Date: ${entry.date}, Tech: ${entry.techId}`);
        });
        
        hasLoggedRef.current = true;
      }
  }, []);

  // Expose state for testing - only include data needed for test() and [Cheat] system
  useEffect(() => {
    const allEntries = [...hematologyEntries, ...chemistryEntries, ...immunologyEntries];
    
    (window as any).app_state = {
      // Core data for test validation
      sourceData,
      expectedResults,
      allEntries,
      // Category-specific entries for test logic
      hematologyEntries,
      chemistryEntries, 
      immunologyEntries
    };
  }, [sourceData, expectedResults, hematologyEntries, chemistryEntries, immunologyEntries]);

  const addNewRow = (category: string) => {
    const newEntry: FormEntry = {
      id: `${category}-${Date.now()}`,
      patientId: '',
      patientName: '',
      phone: '',
      testCode: '',
      result: 0,
      units: '',
      rangeStatus: 'pending',
      date: '',
      techId: '',
      status: 'active'
    };
    
    if (category === 'hematology') {
      setHematologyEntries(prev => [...prev, newEntry]);
    } else if (category === 'chemistry') {
      setChemistryEntries(prev => [...prev, newEntry]);
    } else if (category === 'immunology') {
      setImmunologyEntries(prev => [...prev, newEntry]);
    }
  };

  const removeRow = (category: string, entryId: string) => {
    if (category === 'hematology') {
      setHematologyEntries(prev => prev.filter(entry => entry.id !== entryId));
    } else if (category === 'chemistry') {
      setChemistryEntries(prev => prev.filter(entry => entry.id !== entryId));
    } else if (category === 'immunology') {
      setImmunologyEntries(prev => prev.filter(entry => entry.id !== entryId));
    }
  };

  const updateEntry = (category: string, entryId: string, field: string, value: any) => {
    const updateFn = (entries: FormEntry[]) => 
      entries.map(entry => 
        entry.id === entryId ? { ...entry, [field]: value } : entry
      );
    
    if (category === 'hematology') {
      setHematologyEntries(updateFn);
    } else if (category === 'chemistry') {
      setChemistryEntries(updateFn);
    } else if (category === 'immunology') {
      setImmunologyEntries(updateFn);
    }
  };

  const getCurrentEntries = () => {
    switch (activeTab) {
      case 'hematology': return hematologyEntries;
      case 'chemistry': return chemistryEntries;
      case 'immunology': return immunologyEntries;
      default: return [];
    }
  };

  const getTestCodes = (category: string) => {
    const codes = {
      'hematology': [
        'Complete Blood Count', 
        'Hemoglobin', 
        'Hematocrit',
        'White Blood Cell Count',
        'Platelet Count',
        'Red Blood Cell Count'
      ],
      'chemistry': [
        'Lipid Panel', 
        'Hemoglobin A1c', 
        'Glucose',
        'Basic Metabolic Panel',
        'Liver Function Tests',
        'Kidney Function Tests'
      ],
      'immunology': [
        'C-Reactive Protein', 
        'Rheumatoid Factor', 
        'ANA Screen',
        'Immunoglobulin Panel',
        'Hepatitis Panel',
        'HIV Antibody'
      ]
    };
    return codes[category as keyof typeof codes] || [];
  };

  const getUnitsForTest = (testCode: string) => {
    const unitsMap: Record<string, string> = {
      // Hematology
      'Complete Blood Count': '10^6/μL',
      'Hemoglobin': 'g/dL',
      'Hematocrit': '%',
      'White Blood Cell Count': '10^3/μL',
      'Platelet Count': '10^3/μL',
      'Red Blood Cell Count': '10^6/μL',
      
      // Chemistry
      'Lipid Panel': 'mg/dL',
      'Hemoglobin A1c': '%',
      'Glucose': 'mg/dL',
      'Basic Metabolic Panel': 'mg/dL',
      'Liver Function Tests': 'U/L',
      'Kidney Function Tests': 'mg/dL',
      
      // Immunology
      'C-Reactive Protein': 'mg/L',
      'Rheumatoid Factor': 'IU/mL',
      'ANA Screen': 'titer',
      'Immunoglobulin Panel': 'mg/dL',
      'Hepatitis Panel': 'ratio',
      'HIV Antibody': 'ratio'
    };
    return unitsMap[testCode] || '';
  };


  const NamePickerModal = ({ entryId, category, onClose }: { entryId: string, category: string, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Patient</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2">
          {sourceData.map((patient) => (
            <button
              key={patient.patientId}
              onClick={() => {
                updateEntry(category, entryId, 'patientName', patient.fullName);
                updateEntry(category, entryId, 'patientId', patient.patientId);
                updateEntry(category, entryId, 'phone', patient.patientPhone);
                onClose();
              }}
              className="w-full text-left p-3 border rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <User size={16} className="text-blue-500" />
              <div>
                <div className="font-medium">{patient.fullName}</div>
                <div className="text-sm text-gray-500">{patient.patientId} • {patient.patientPhone}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const RangeCalculatorModal = ({ entryId, category, onClose }: { entryId: string, category: string, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Range Calculator</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">Reference Ranges</h4>
            <div className="text-sm text-blue-600 mt-2 space-y-1">
              <div>• Normal: Within expected range</div>
              <div>• Abnormal: Outside normal range</div>
              <div>• Critical: Requires immediate attention</div>
            </div>
          </div>
          <button
            onClick={() => {
              updateEntry(category, entryId, 'rangeStatus', 'normal');
              onClose();
            }}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Apply Normal Range
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    const entries = getCurrentEntries();
    const testCodes = getTestCodes(activeTab);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold capitalize">{activeTab} Lab Results</h3>
          <button
            onClick={() => addNewRow(activeTab)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-20">Patient ID</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-32">Name</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-28">Phone</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-40">Test Name</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-16">Result</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-28">Units</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-28">Range</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-28">Date</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-20">Tech ID</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-20">Status</th>
                <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 text-sm">
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="text"
                      value={entry.patientId}
                      onChange={(e) => updateEntry(activeTab, entry.id, 'patientId', e.target.value)}
                      className="w-full px-1 py-1 border rounded text-xs"
                      placeholder="P12345"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={entry.patientName}
                        onChange={(e) => updateEntry(activeTab, entry.id, 'patientName', e.target.value)}
                        className="flex-1 px-1 py-1 border rounded text-xs"
                        placeholder="Patient Name"
                      />
                      <button
                        onClick={() => setShowNamePicker(entry.id)}
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 flex-shrink-0"
                        title="Pick from list"
                      >
                        <User size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="text"
                      value={entry.phone}
                      onChange={(e) => updateEntry(activeTab, entry.id, 'phone', e.target.value)}
                      className="w-full px-1 py-1 border rounded text-xs"
                      placeholder="(555) 123-4567"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <select
                      value={entry.testCode}
                      onChange={(e) => {
                        updateEntry(activeTab, entry.id, 'testCode', e.target.value);
                        updateEntry(activeTab, entry.id, 'units', getUnitsForTest(e.target.value));
                      }}
                      className="w-full px-1 py-1 border rounded text-xs"
                    >
                      <option value="">Select Test Name</option>
                      {testCodes.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="number"
                      value={entry.result || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty input or valid numeric input (including partial decimals)
                        if (value === '') {
                          updateEntry(activeTab, entry.id, 'result', 0);
                        } else {
                          const numValue = parseFloat(value);
                          // Only update if it's a valid number or if user is typing a decimal
                          if (!isNaN(numValue) || value.endsWith('.')) {
                            updateEntry(activeTab, entry.id, 'result', isNaN(numValue) ? 0 : numValue);
                          }
                        }
                      }}
                      className="w-full px-1 py-1 border rounded text-xs"
                      step="0.1"
                      min="0"
                      placeholder="Enter value"
                      lang="en-US"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <select
                      value={entry.units}
                      onChange={(e) => updateEntry(activeTab, entry.id, 'units', e.target.value)}
                      className="w-full px-1 py-1 border rounded text-xs"
                    >
                      <option value="">Select units</option>
                      <option value="10^6/μL">10^6/μL</option>
                      <option value="g/dL">g/dL</option>
                      <option value="%">%</option>
                      <option value="mg/dL">mg/dL</option>
                      <option value="mg/L">mg/L</option>
                      <option value="IU/mL">IU/mL</option>
                      <option value="titer">titer</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <div className="flex items-center gap-1">
                      <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                        entry.rangeStatus === 'normal' ? 'bg-green-100 text-green-800' :
                        entry.rangeStatus === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                        entry.rangeStatus === 'critical' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.rangeStatus}
                      </span>
                      <button
                        onClick={() => setShowRangeCalculator(entry.id)}
                        className="bg-purple-500 text-white p-1 rounded hover:bg-purple-600 flex-shrink-0"
                        title="Range Calculator"
                      >
                        <Calculator size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateEntry(activeTab, entry.id, 'date', e.target.value)}
                        className="flex-1 px-1 py-1 border rounded text-xs"
                      />
                      <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="text"
                      value={entry.techId}
                      onChange={(e) => updateEntry(activeTab, entry.id, 'techId', e.target.value)}
                      className="w-full px-1 py-1 border rounded text-xs"
                      placeholder="MT-001"
                      list="techIds"
                    />
                    <datalist id="techIds">
                      <option value="MT-001" />
                      <option value="MT-002" />
                      <option value="MT-003" />
                    </datalist>
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entry.status === 'completed'}
                        onChange={(e) => updateEntry(activeTab, entry.id, 'status', e.target.checked ? 'completed' : 'active')}
                        className="rounded"
                      />
                      <span className="text-xs">{entry.status}</span>
                    </label>
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <button
                      onClick={() => removeRow(activeTab, entry.id)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      title="Remove row"
                    >
                      <Minus size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={11} className="border border-gray-300 px-3 py-8 text-center text-gray-500">
                    No entries yet. Click "Add Row" to start entering lab results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Medical Lab Results Entry</h1>
        <p className="text-gray-600">
          Transfer lab test results from external Excel files into the clinical system. Open the Excel files provided, 
          then use the tabs below to navigate between test categories, add table rows for each result, and use the popup 
          tools for patient selection and range validation. Excel files contain patient information, test details, and results 
          that need to be entered into the appropriate category tabs.
        </p>
      </div>

      {/* Tabbed Interface */}
      <div className="border border-gray-300 rounded-lg">
        <div className="flex border-b border-gray-300">
          {['hematology', 'chemistry', 'immunology'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize ${
                activeTab === tab
                  ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      {showNamePicker && (
        <NamePickerModal
          entryId={showNamePicker}
          category={activeTab}
          onClose={() => setShowNamePicker(null)}
        />
      )}

      {showRangeCalculator && (
        <RangeCalculatorModal
          entryId={showRangeCalculator}
          category={activeTab}
          onClose={() => setShowRangeCalculator(null)}
        />
      )}
    </div>
  );
};

export default Task21;
