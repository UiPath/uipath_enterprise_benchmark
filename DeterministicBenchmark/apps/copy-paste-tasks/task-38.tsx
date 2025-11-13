import React, { useState, useEffect } from 'react';

interface MarkerMapping {
  marker: number;
  requirement: string;
}

interface ValidationRecord {
  mockupReference: string;
  designerName: string;
  validationDate: string;
  mappings: MarkerMapping[];
  correctMappings: { [key: number]: string };
  correctCount: number;
  incorrectCount: number;
  missingCount: number;
  accuracy: number;
  timestamp: string;
}

// 10 total requirements (5 correct + 5 decoys) - sorted alphabetically
const ALL_REQUIREMENTS = [
  { value: 'button-padding', label: 'Add More Button Padding', description: 'Internal button padding values (top, right, bottom, left)', correct: false },
  { value: 'primary-color', label: 'Change Primary Brand Color', description: 'Primary brand color specification with hex code', correct: true },
  { value: 'image-loading', label: 'Enable Image Lazy Loading', description: 'Image lazy loading behavior annotation', correct: false },
  { value: 'card-width', label: 'Extend Card Width', description: 'Content card width specification in pixels or percentage', correct: true },
  { value: 'text-overflow', label: 'Fix Text Overflow Inside Card', description: 'Text overflow behavior annotation (ellipsis, truncation)', correct: true },
  { value: 'content-overflow', label: 'Fix Vertical Page Overflow', description: 'Content area overflow handling annotation (scroll, hidden)', correct: true },
  { value: 'line-height', label: 'Increase Body Text Line Height', description: 'Text line height spacing specification', correct: false },
  { value: 'sidebar-width', label: 'Make Sidebar Less Wide', description: 'Left sidebar width measurement in pixels', correct: true },
  { value: 'header-height', label: 'Reduce Main Header Height', description: 'Top navigation bar height specification', correct: false },
  { value: 'secondary-color', label: 'Update Secondary Accent Color', description: 'Secondary accent color specification with hex code', correct: false },
];

// Correct marker-to-requirement mappings for the mockup
const CORRECT_MAPPINGS: { [key: number]: string } = {
  1: 'primary-color',
  2: 'sidebar-width',
  3: 'text-overflow',
  4: 'card-width',
  5: 'content-overflow',
};

export default function Task38() {
  const [mockupReference, setMockupReference] = useState('');
  const [designerName, setDesignerName] = useState('');
  const [validationDate, setValidationDate] = useState('');
  const [currentMarker, setCurrentMarker] = useState('');
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [mappings, setMappings] = useState<MarkerMapping[]>([]);
  const [validationRecords, setValidationRecords] = useState<ValidationRecord[]>([]);

  const canAddMapping = currentMarker.trim() !== '' && 
                        currentRequirement.trim() !== '' &&
                        !isNaN(parseInt(currentMarker)) &&
                        parseInt(currentMarker) >= 1 &&
                        parseInt(currentMarker) <= 5;

  const canSubmit = mockupReference.trim() !== '' &&
                    designerName.trim() !== '' &&
                    validationDate.trim() !== '' &&
                    mappings.length === 5;

  const handleAddMapping = () => {
    if (!canAddMapping) return;

    const markerNum = parseInt(currentMarker);
    
    // Check if marker already used
    if (mappings.find(m => m.marker === markerNum)) {
      return; // Silent validation - don't add duplicate markers
    }

    setMappings([...mappings, {
      marker: markerNum,
      requirement: currentRequirement,
    }]);

    // Reset form inputs
    setCurrentMarker('');
    setCurrentRequirement('');
  };

  const handleRemoveMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const calculateAccuracy = (userMappings: MarkerMapping[], correctMappings: { [key: number]: string }) => {
    let correctCount = 0;
    let incorrectCount = 0;
    
    // Check each user mapping
    userMappings.forEach(mapping => {
      if (correctMappings[mapping.marker] === mapping.requirement) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });
    
    // Count missing markers
    const mappedMarkers = new Set(userMappings.map(m => m.marker));
    const missingCount = Object.keys(correctMappings).length - 
                        Object.keys(correctMappings).filter(k => mappedMarkers.has(parseInt(k))).length;
    
    const accuracy = correctCount / Object.keys(correctMappings).length * 100;
    
    return {
      correctCount,
      incorrectCount,
      missingCount,
      accuracy,
    };
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Get correct mappings for validation
    const metrics = calculateAccuracy(mappings, CORRECT_MAPPINGS);

    const newRecord: ValidationRecord = {
      mockupReference,
      designerName,
      validationDate,
      mappings: [...mappings].sort((a, b) => a.marker - b.marker),
      correctMappings: CORRECT_MAPPINGS,
      correctCount: metrics.correctCount,
      incorrectCount: metrics.incorrectCount,
      missingCount: metrics.missingCount,
      accuracy: metrics.accuracy,
      timestamp: new Date().toISOString(),
    };

    setValidationRecords([...validationRecords, newRecord]);

    // Reset form
    setMockupReference('');
    setDesignerName('');
    setValidationDate('');
    setMappings([]);
  };

  const handleRemoveRecord = (index: number) => {
    setValidationRecords(validationRecords.filter((_, i) => i !== index));
  };

  // Expose state for testing (incremental validation)
  useEffect(() => {
    (window as any).app_state = {
      // Current form state (for incremental testing)
      currentValidation: {
        mockupReference,
        designerName,
        validationDate,
        mappings,
      },
      formFieldsCompleted: {
        hasMockupReference: mockupReference.trim() !== '',
        hasDesignerName: designerName.trim() !== '',
        hasValidationDate: validationDate.trim() !== '',
        hasMappings: mappings.length > 0,
      },
      // Submitted validations
      validationRecords,
      totalValidations: validationRecords.length,
    };
  }, [mockupReference, designerName, validationDate, mappings, validationRecords]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#212529' }}>
          Design Annotation Validator
        </h2>
        
        {/* Mockup Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Mockup Reference
            </label>
            <input
              type="text"
              value={mockupReference}
              onChange={(e) => setMockupReference(e.target.value)}
              placeholder="MOCK-2024-XXX"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontFamily: 'monospace',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Designer Name
            </label>
            <input
              type="text"
              value={designerName}
              onChange={(e) => setDesignerName(e.target.value)}
              placeholder="Designer Name"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Validation Date
            </label>
            <input
              type="text"
              value={validationDate}
              onChange={(e) => setValidationDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      </div>

      {/* External Mockup Reference */}
      <div style={{
        background: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>
          📄 External Mockup File
        </div>
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          Open mockup PNG file in image viewer to examine annotations (5 markers total)
        </div>
      </div>

      {/* Marker-Requirement Mapping Form */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#212529' }}>
          Map Markers to Requirements
        </h3>

        {/* Add Mapping Form */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '120px 1fr 100px',
          gap: '15px',
          marginBottom: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '6px',
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
              Marker
            </label>
            <input
              type="text"
              value={currentMarker}
              onChange={(e) => setCurrentMarker(e.target.value)}
              placeholder="1-5"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
              Requirement
            </label>
            <select
              value={currentRequirement}
              onChange={(e) => setCurrentRequirement(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="">Select requirement...</option>
              {ALL_REQUIREMENTS.map((req) => (
                <option key={req.value} value={req.value}>
                  {req.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleAddMapping}
              disabled={!canAddMapping}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#ffffff',
                background: canAddMapping ? '#0d6efd' : '#6c757d',
                border: 'none',
                borderRadius: '4px',
                cursor: canAddMapping ? 'pointer' : 'not-allowed',
              }}
            >
              + Add
            </button>
          </div>
        </div>

        {/* Mappings Table */}
        <div style={{ 
          fontSize: '13px',
          color: '#6c757d',
          marginBottom: '10px',
        }}>
          Mappings: {mappings.length} / 5 Required
        </div>

        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #dee2e6',
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ 
                padding: '12px',
                textAlign: 'left',
                borderBottom: '2px solid #dee2e6',
                fontWeight: 'bold',
                fontSize: '14px',
              }}>
                Marker
              </th>
              <th style={{ 
                padding: '12px',
                textAlign: 'left',
                borderBottom: '2px solid #dee2e6',
                fontWeight: 'bold',
                fontSize: '14px',
              }}>
                Requirement
              </th>
              <th style={{ 
                padding: '12px',
                textAlign: 'center',
                borderBottom: '2px solid #dee2e6',
                fontWeight: 'bold',
                fontSize: '14px',
                width: '80px',
              }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {mappings.length === 0 ? (
              <tr>
                <td colSpan={3} style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#6c757d',
                  fontSize: '14px',
                }}>
                  No mappings added yet. Add marker-requirement pairs above.
                </td>
              </tr>
            ) : (
              mappings.sort((a, b) => a.marker - b.marker).map((mapping, idx) => {
                const requirement = ALL_REQUIREMENTS.find(r => r.value === mapping.requirement);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ 
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#0d6efd',
                    }}>
                      {mapping.marker}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {requirement?.label || mapping.requirement}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveMapping(idx)}
                        style={{
                          background: '#dc3545',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '3px',
                          width: '24px',
                          height: '24px',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                        title="Remove mapping"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff',
            background: canSubmit ? '#28a745' : '#6c757d',
            border: 'none',
            borderRadius: '6px',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          ✓ Submit Validation
        </button>
      </div>

      {/* Validation Records */}
      {validationRecords.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#212529' }}>
            Validation Records ({validationRecords.length})
          </h3>
          
          {validationRecords.map((record, idx) => {
            const isPerfect = record.accuracy === 100 && record.falsePositives === 0;
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  padding: '15px',
                  marginBottom: '15px',
                  background: '#f8f9fa',
                  position: 'relative',
                }}
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveRecord(idx)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#6c757d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '3px',
                    width: '24px',
                    height: '24px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: '1',
                  }}
                  title="Remove this record"
                >
                  ✕
                </button>

                {/* Record Header */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px',
                  marginBottom: '15px',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #dee2e6',
                  paddingRight: '40px',
                }}>
                  <div>
                    <strong style={{ fontSize: '12px', color: '#6c757d' }}>Mockup:</strong>
                    <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                      {record.mockupReference}
                    </div>
                  </div>
                  <div>
                    <strong style={{ fontSize: '12px', color: '#6c757d' }}>Designer:</strong>
                    <div style={{ fontSize: '14px' }}>{record.designerName}</div>
                  </div>
                  <div>
                    <strong style={{ fontSize: '12px', color: '#6c757d' }}>Date:</strong>
                    <div style={{ fontSize: '14px' }}>{record.validationDate}</div>
                  </div>
                </div>

              {/* Accuracy Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '15px',
                marginBottom: '15px',
              }}>
                <div style={{
                  padding: '12px',
                  background: isPerfect ? '#d1e7dd' : '#fff3cd',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: isPerfect ? '#0f5132' : '#997404' }}>
                    {record.accuracy.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                    Accuracy
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  background: record.correctCount === 5 ? '#d1e7dd' : '#ffffff',
                  border: `1px solid ${record.correctCount === 5 ? '#28a745' : '#dee2e6'}`,
                  borderRadius: '6px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: record.correctCount === 5 ? '#28a745' : '#0d6efd' }}>
                    {record.correctCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                    Correct
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  background: record.incorrectCount > 0 ? '#f8d7da' : '#ffffff',
                  border: `1px solid ${record.incorrectCount > 0 ? '#dc3545' : '#dee2e6'}`,
                  borderRadius: '6px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: record.incorrectCount > 0 ? '#dc3545' : '#28a745' }}>
                    {record.incorrectCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                    Incorrect
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  background: record.missingCount > 0 ? '#f8d7da' : '#ffffff',
                  border: `1px solid ${record.missingCount > 0 ? '#dc3545' : '#dee2e6'}`,
                  borderRadius: '6px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: record.missingCount > 0 ? '#dc3545' : '#28a745' }}>
                    {record.missingCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                    Missing
                  </div>
                </div>
              </div>

              {/* Pass/Fail Status */}
              <div style={{
                padding: '12px',
                background: isPerfect ? '#d1e7dd' : '#f8d7da',
                border: `2px solid ${isPerfect ? '#28a745' : '#dc3545'}`,
                borderRadius: '6px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: isPerfect ? '#0f5132' : '#842029',
              }}>
                {isPerfect ? '✓ PASS' : '✗ FAIL'} - {isPerfect ? 'Perfect mapping (5/5 correct)' : `Accuracy: ${record.accuracy.toFixed(0)}% (${record.correctCount} correct, ${record.incorrectCount} incorrect, ${record.missingCount} missing)`}
              </div>

              {/* Mappings Table */}
              <div style={{ marginTop: '15px' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>
                  Submitted Mappings:
                </div>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #dee2e6',
                  fontSize: '13px',
                }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Marker</th>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Requirement</th>
                      <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #dee2e6', width: '60px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.mappings.map((mapping, i) => {
                      const isCorrect = record.correctMappings[mapping.marker] === mapping.requirement;
                      const requirement = ALL_REQUIREMENTS.find(r => r.value === mapping.requirement);
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: 'bold', color: '#0d6efd' }}>
                            {mapping.marker}
                          </td>
                          <td style={{ padding: '8px' }}>
                            {requirement?.label || mapping.requirement}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center', fontSize: '16px' }}>
                            {isCorrect ? '✅' : '❌'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

