import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Play, Edit2 } from 'lucide-react';

// Reference data for external PDF calibration manuals (for testing purposes)
const CALIBRATION_DATA = {
  'BATCH-2024-105': {
    chain1: [
      { id: 'CAL-A', name: 'Pressure Sensor', dependencies: [], date: '2024-02-10', technician: 'James Wilson', notes: 'Baseline pressure verification completed' },
      { id: 'CAL-B', name: 'Flow Meter', dependencies: ['CAL-A'], date: '2024-02-11', technician: 'Sarah Chen', notes: 'Flow rate accuracy within 0.5% tolerance' },
      { id: 'CAL-C', name: 'Control Valve', dependencies: ['CAL-B'], date: '2024-02-12', technician: 'James Wilson', notes: 'Valve response time verified' },
    ],
    chain2: [
      { id: 'CAL-D', name: 'Temperature Probe', dependencies: [], date: '2024-02-10', technician: 'Maria Rodriguez', notes: 'Temperature accuracy verified across range' },
      { id: 'CAL-E', name: 'pH Sensor', dependencies: ['CAL-D'], date: '2024-02-11', technician: 'Sarah Chen', notes: 'Buffer solution calibration successful' },
      { id: 'CAL-F', name: 'Conductivity Meter', dependencies: ['CAL-E'], date: '2024-02-12', technician: 'Maria Rodriguez', notes: 'Conductivity standards validated' },
    ]
  },
  'BATCH-2024-106': {
    chain1: [
      { id: 'CAL-A', name: 'Pressure Transducer', dependencies: [], date: '2024-02-15', technician: 'David Kim', notes: 'Calibration against reference standard completed' },
      { id: 'CAL-B', name: 'Differential Pressure Meter', dependencies: ['CAL-A'], date: '2024-02-16', technician: 'Emily Carter', notes: 'Differential readings verified with ±2% accuracy' },
      { id: 'CAL-C', name: 'Pressure Relief Valve', dependencies: ['CAL-B'], date: '2024-02-17', technician: 'David Kim', notes: 'Relief pressure set point validated' },
    ],
    chain2: [
      { id: 'CAL-D', name: 'Thermocouple Probe', dependencies: [], date: '2024-02-15', technician: 'Jennifer Park', notes: 'Temperature calibration using ice bath and boiling water' },
      { id: 'CAL-E', name: 'RTD Sensor', dependencies: ['CAL-D'], date: '2024-02-16', technician: 'Emily Carter', notes: 'Resistance-temperature curve verified' },
      { id: 'CAL-F', name: 'Temperature Controller', dependencies: ['CAL-E'], date: '2024-02-17', technician: 'Jennifer Park', notes: 'PID tuning parameters optimized' },
    ]
  },
  'BATCH-2024-107': {
    chain1: [
      { id: 'CAL-A', name: 'Load Cell', dependencies: [], date: '2024-02-20', technician: 'Robert Lee', notes: 'Weight calibration using certified masses' },
      { id: 'CAL-B', name: 'Strain Gauge', dependencies: ['CAL-A'], date: '2024-02-21', technician: 'Angela Martinez', notes: 'Strain measurements validated under load' },
      { id: 'CAL-C', name: 'Force Transducer', dependencies: ['CAL-B'], date: '2024-02-22', technician: 'Robert Lee', notes: 'Force-output linearity confirmed' },
    ],
    chain2: [
      { id: 'CAL-D', name: 'Ultrasonic Sensor', dependencies: [], date: '2024-02-20', technician: 'Lisa Thompson', notes: 'Distance measurement accuracy verified' },
      { id: 'CAL-E', name: 'Proximity Detector', dependencies: ['CAL-D'], date: '2024-02-21', technician: 'Angela Martinez', notes: 'Detection range and sensitivity calibrated' },
      { id: 'CAL-F', name: 'Position Encoder', dependencies: ['CAL-E'], date: '2024-02-22', technician: 'Lisa Thompson', notes: 'Encoder resolution and repeatability tested' },
    ]
  }
};

type EquipmentStatus = 'not-started' | 'in-progress' | 'calibrated';

type Equipment = {
  id: string;
  name: string;
  dependencies: string[];
  status: EquipmentStatus;
  date: string;
  technician: string;
  notes: string;
  calibratedAt?: string;
};

type CalibrationBatch = {
  batchRef: string;
  equipment: Equipment[];
  submittedAt: string;
};

const Task32: React.FC = () => {
  const [batchReference, setBatchReference] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [submittedBatches, setSubmittedBatches] = useState<CalibrationBatch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  // Form fields for calibration data entry (agent must fill from PDF)
  const [technicianInput, setTechnicianInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // Initialize equipment list when batch reference is entered
  useEffect(() => {
    if (batchReference && CALIBRATION_DATA[batchReference as keyof typeof CALIBRATION_DATA]) {
      const data = CALIBRATION_DATA[batchReference as keyof typeof CALIBRATION_DATA];
      const allEquipment: Equipment[] = [
        ...data.chain1.map(item => ({
          id: item.id,
          name: item.name,
          dependencies: item.dependencies,
          status: 'not-started' as EquipmentStatus,
          // These fields are empty - agent must fill from PDF
          date: '',
          technician: '',
          notes: ''
        })),
        ...data.chain2.map(item => ({
          id: item.id,
          name: item.name,
          dependencies: item.dependencies,
          status: 'not-started' as EquipmentStatus,
          // These fields are empty - agent must fill from PDF
          date: '',
          technician: '',
          notes: ''
        }))
      ];
      setEquipment(allEquipment);
    } else {
      setEquipment([]);
    }
  }, [batchReference]);

  const canCalibrate = (equipmentId: string): boolean => {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item) return false;
    
    // Check if all dependencies are calibrated
    return item.dependencies.every(depId => {
      const dep = equipment.find(e => e.id === depId);
      return dep?.status === 'calibrated';
    });
  };

  const handleBeginCalibration = (equipmentId: string) => {
    if (!canCalibrate(equipmentId)) return;
    
    const item = equipment.find(e => e.id === equipmentId);
    if (!item) return;
    
    setSelectedEquipment(item);
    // Clear form fields - agent must enter data from PDF
    setTechnicianInput('');
    setDateInput('');
    setNotesInput('');
    setShowModal(true);
  };

  const handleEditCalibration = (equipmentId: string) => {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item) return;
    
    setSelectedEquipment(item);
    // Pre-fill with existing data for editing
    setTechnicianInput(item.technician || '');
    setDateInput(item.date || '');
    setNotesInput(item.notes || '');
    setShowModal(true);
  };

  const handleCompleteCalibration = () => {
    if (!selectedEquipment) return;
    
    // Validate that all fields are filled
    if (!technicianInput.trim() || !dateInput.trim() || !notesInput.trim()) {
      alert('Please fill in all calibration fields (Technician, Date, and Notes) from the PDF manual.');
      return;
    }
    
    // Update equipment with entered data and mark as calibrated
    setEquipment(prev => prev.map(e => 
      e.id === selectedEquipment.id 
        ? { 
            ...e, 
            status: 'calibrated',
            technician: technicianInput.trim(),
            date: dateInput.trim(),
            notes: notesInput.trim(),
            calibratedAt: new Date().toISOString()
          }
        : e
    ));
    
    setShowModal(false);
    setSelectedEquipment(null);
    setTechnicianInput('');
    setDateInput('');
    setNotesInput('');
  };

  const handleSetInProgress = (equipmentId: string) => {
    if (!canCalibrate(equipmentId)) return;
    
    setEquipment(prev => prev.map(e => 
      e.id === equipmentId 
        ? { ...e, status: 'in-progress' }
        : e
    ));
  };

  const handleSubmitBatch = () => {
    const allCalibrated = equipment.every(e => e.status === 'calibrated');
    if (!allCalibrated || equipment.length === 0) {
      alert('All equipment must be calibrated before submitting the batch.');
      return;
    }

    const batch: CalibrationBatch = {
      batchRef: batchReference,
      equipment: equipment.map(e => ({ ...e })),
      submittedAt: new Date().toISOString()
    };

    setSubmittedBatches(prev => [...prev, batch]);
    
    // Reset for next batch
    setBatchReference('');
    setEquipment([]);
  };

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'not-started': return 'bg-gray-200 text-gray-700';
      case 'in-progress': return 'bg-yellow-200 text-yellow-800';
      case 'calibrated': return 'bg-green-200 text-green-800';
    }
  };

  const getStatusIcon = (status: EquipmentStatus) => {
    switch (status) {
      case 'not-started': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <Play className="w-4 h-4" />;
      case 'calibrated': return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getNextAvailableEquipment = (): string[] => {
    return equipment
      .filter(e => e.status === 'not-started' && canCalibrate(e.id))
      .map(e => e.id);
  };

  // Expose state for testing
  useEffect(() => {
    const calibratedCount = equipment.filter(e => e.status === 'calibrated').length;
    const inProgressCount = equipment.filter(e => e.status === 'in-progress').length;
    const nextAvailable = getNextAvailableEquipment();
    
    (window as any).app_state = {
      batchReference,
      equipment: equipment.map(e => ({
        id: e.id,
        name: e.name,
        status: e.status,
        dependencies: e.dependencies,
        // Include entered calibration data for validation
        technician: e.technician,
        date: e.date,
        notes: e.notes,
        calibratedAt: e.calibratedAt || null
      })),
      calibratedCount,
      inProgressCount,
      totalEquipment: equipment.length,
      nextAvailableEquipment: nextAvailable,
      submittedBatches: submittedBatches.map(b => ({
        batchRef: b.batchRef,
        equipmentCount: b.equipment.length,
        submittedAt: b.submittedAt
      }))
    };
  }, [batchReference, equipment, submittedBatches]);

  const nextAvailable = getNextAvailableEquipment();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Calibration Sequencing</h1>
        <p className="text-gray-600">
          Enter calibration batch reference from the external PDF manual and complete equipment calibration in dependency order.
        </p>
      </div>

      {/* Batch Reference Input */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calibration Batch Reference
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={batchReference}
            onChange={(e) => setBatchReference(e.target.value)}
            placeholder="e.g., BATCH-2024-105"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">Progress:</span>
            <span className="text-lg font-semibold text-gray-900">
              {equipment.filter(e => e.status === 'calibrated').length}/{equipment.length}
            </span>
          </div>
        </div>
        {equipment.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">Next Available:</span>{' '}
            {nextAvailable.length > 0 ? (
              <span className="text-blue-600 font-medium">{nextAvailable.join(', ')}</span>
            ) : (
              <span className="text-gray-500">None (check dependencies)</span>
            )}
          </div>
        )}
      </div>

      {/* Equipment Grid */}
      {equipment.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment Calibration Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipment.map((eq) => {
              const isNextAvailable = nextAvailable.includes(eq.id);
              const canStart = canCalibrate(eq.id);
              
              return (
                <div
                  key={eq.id}
                  className={`border rounded-lg p-4 ${
                    isNextAvailable ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-semibold text-gray-900">{eq.id}</span>
                        {isNextAvailable && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">
                            NEXT
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{eq.name}</div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(eq.status)}`}>
                      {getStatusIcon(eq.status)}
                      <span className="capitalize">{eq.status.replace('-', ' ')}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Dependencies:</span>{' '}
                      <span className="font-medium">
                        {eq.dependencies.length > 0 ? eq.dependencies.join(', ') : 'None'}
                      </span>
                    </div>
                    {eq.status === 'calibrated' && (
                      <>
                        <div className="text-sm">
                          <span className="text-gray-600">Technician:</span>{' '}
                          <span className="font-medium">{eq.technician || 'Not entered'}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Date:</span>{' '}
                          <span className="font-medium">{eq.date || 'Not entered'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    {eq.status === 'not-started' && (
                      <button
                        onClick={() => handleBeginCalibration(eq.id)}
                        disabled={!canStart}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                          canStart
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canStart ? 'Begin Calibration' : 'Prerequisites Not Met'}
                      </button>
                    )}
                    {eq.status === 'in-progress' && (
                      <button
                        onClick={() => handleBeginCalibration(eq.id)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Complete Calibration
                      </button>
                    )}
                    {eq.status === 'calibrated' && eq.calibratedAt && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800">
                            Calibrated {new Date(eq.calibratedAt).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleEditCalibration(eq.id)}
                          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Calibration Data
                        </button>
                      </div>
                    )}
                  </div>

                  {!canStart && eq.status === 'not-started' && eq.dependencies.length > 0 && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        Waiting for: {eq.dependencies.filter(depId => {
                          const dep = equipment.find(e => e.id === depId);
                          return dep?.status !== 'calibrated';
                        }).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Batch Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmitBatch}
              disabled={equipment.filter(e => e.status === 'calibrated').length !== equipment.length}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                equipment.filter(e => e.status === 'calibrated').length === equipment.length
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Calibration Batch
            </button>
          </div>
        </div>
      )}

      {/* Calibration Modal */}
      {showModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedEquipment.status === 'calibrated' ? 'Edit Calibration Details' : 'Calibration Details'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Equipment: {selectedEquipment.id} - {selectedEquipment.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {selectedEquipment.dependencies.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites (Completed)</label>
                  <div className="space-y-1">
                    {selectedEquipment.dependencies.map(depId => {
                      const dep = equipment.find(e => e.id === depId);
                      return (
                        <div key={depId} className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                          <CheckCircle className="w-4 h-4" />
                          <span>{dep?.id} - {dep?.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Enter calibration details from the external PDF manual for equipment {selectedEquipment.id}:
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technician <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={technicianInput}
                    onChange={(e) => setTechnicianInput(e.target.value)}
                    placeholder="Enter technician name from PDF"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calibration Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    placeholder="YYYY-MM-DD format"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calibration Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Enter calibration notes from PDF"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedEquipment(null);
                  setTechnicianInput('');
                  setDateInput('');
                  setNotesInput('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteCalibration}
                disabled={!technicianInput.trim() || !dateInput.trim() || !notesInput.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  technicianInput.trim() && dateInput.trim() && notesInput.trim()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedEquipment.status === 'calibrated' ? 'Update Calibration' : 'Mark as Calibrated'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Batches History */}
      {submittedBatches.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submitted Calibration Batches</h2>
          <div className="space-y-3">
            {submittedBatches.map((batch, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono font-semibold text-gray-900">{batch.batchRef}</div>
                    <div className="text-sm text-gray-600">
                      {batch.equipment.length} equipment items calibrated
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Submitted</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Submitted: {new Date(batch.submittedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions for external PDF reference */}
      {equipment.length === 0 && !batchReference && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
              <p className="text-sm text-blue-800 mb-2">
                This task requires reading equipment calibration sequences from an external PDF manual.
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Enter the batch reference from the PDF (e.g., BATCH-2024-105)</li>
                <li>Equipment must be calibrated in dependency order</li>
                <li>Dependencies are shown as chains: CAL-A → CAL-B → CAL-C</li>
                <li>Equipment without dependencies can be started first</li>
                <li>Next available equipment is highlighted in blue</li>
                <li>Complete all 6 equipment calibrations before submitting the batch</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task32;

