import React, { useState, useEffect } from 'react';

interface AuditRecord {
  auditReference: string;
  auditorName: string;
  auditDate: string;
  selectedViolations: string[];
  correctViolations: string[];
  falsePositives: number;
  falseNegatives: number;
  accuracy: number;
  timestamp: string;
}

// 15 total violations (7 actual + 8 decoys), 3 per category to make task harder
const VIOLATIONS = [
  // Interactive Elements (3)
  { id: 'icon-no-labels', label: 'Icon buttons with no visible labels', category: 'Interactive Elements' },
  { id: 'non-descriptive-links', label: 'Non-descriptive link text', category: 'Interactive Elements' },
  { id: 'keyboard-trap', label: 'Keyboard navigation traps', category: 'Interactive Elements' },
  
  // Forms (3)
  { id: 'missing-labels', label: 'Missing form labels', category: 'Forms' },
  { id: 'unclear-validation', label: 'Unclear validation messages', category: 'Forms' },
  { id: 'missing-autocomplete', label: 'Missing autocomplete attributes', category: 'Forms' },
  
  // Structure (3)
  { id: 'improper-headings', label: 'Improper heading hierarchy', category: 'Structure' },
  { id: 'missing-landmarks', label: 'Missing semantic landmarks', category: 'Structure' },
  { id: 'invalid-html', label: 'Invalid HTML nesting', category: 'Structure' },
  
  // Layout (3)
  { id: 'elements-touching-edges', label: 'Elements touching container edges', category: 'Layout' },
  { id: 'inconsistent-spacing', label: 'Inconsistent spacing patterns', category: 'Layout' },
  { id: 'overflow-issues', label: 'Content extending beyond boundaries', category: 'Layout' },
  
  // Visual (3)
  { id: 'poor-contrast', label: 'Poor contrast ratios', category: 'Visual' },
  { id: 'text-too-small', label: 'Text too small to read', category: 'Visual' },
  { id: 'color-only-indicators', label: 'Color-only information indicators', category: 'Visual' },
];

// Hardcoded correct violations per audit based on actual screenshots
// Each audit reviews a different screenshot with different violations
const CORRECT_VIOLATIONS_BY_AUDIT: { [key: string]: string[] } = {
  'A11Y-2024-201': [
    // Image 1 only (Ink & Cypress Books)
    'icon-no-labels',          // Icon buttons (heart, share, cart, star, etc.)
    'non-descriptive-links',   // "Click here", "Read more", "Learn more"
  ],
  'A11Y-2024-202': [
    // Image 2 only (Copper Wire Playhouse)
    'missing-labels',          // Three unlabeled input fields
    'improper-headings',       // h2 before h1 (reversed hierarchy)
    'elements-touching-edges', // Button clipped, zero padding
  ],
  'A11Y-2024-203': [
    // Image 3 only (Groove & Static Records)
    'poor-contrast',           // Light gray text on white (#CCCCCC)
    'text-too-small',          // 10px-11px font sizes
  ],
};

export default function Task36() {
  const [auditReference, setAuditReference] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditDate, setAuditDate] = useState('');
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [submittedAudits, setSubmittedAudits] = useState<AuditRecord[]>([]);

  const canSubmit = auditReference.trim() !== '' &&
                    auditorName.trim() !== '' &&
                    auditDate.trim() !== '' &&
                    selectedViolations.length > 0;

  const toggleViolation = (violationId: string) => {
    setSelectedViolations(prev => {
      if (prev.includes(violationId)) {
        return prev.filter(id => id !== violationId);
      } else {
        return [...prev, violationId];
      }
    });
  };

  const calculateAccuracy = (selected: string[], correct: string[]) => {
    const correctSet = new Set(correct);
    const selectedSet = new Set(selected);
    
    const truePositives = selected.filter(id => correctSet.has(id)).length;
    const falsePositives = selected.filter(id => !correctSet.has(id)).length;
    const falseNegatives = correct.filter(id => !selectedSet.has(id)).length;
    
    const accuracy = correct.length > 0 ? (truePositives / correct.length) * 100 : 0;
    
    return {
      accuracy,
      falsePositives,
      falseNegatives,
      truePositives,
    };
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Get correct violations for this audit reference
    const correctViolations = CORRECT_VIOLATIONS_BY_AUDIT[auditReference] || [];
    const metrics = calculateAccuracy(selectedViolations, correctViolations);

    const newAudit: AuditRecord = {
      auditReference,
      auditorName,
      auditDate,
      selectedViolations: [...selectedViolations],
      correctViolations,
      falsePositives: metrics.falsePositives,
      falseNegatives: metrics.falseNegatives,
      accuracy: metrics.accuracy,
      timestamp: new Date().toISOString(),
    };

    setSubmittedAudits([...submittedAudits, newAudit]);

    // Reset form
    setAuditReference('');
    setAuditorName('');
    setAuditDate('');
    setSelectedViolations([]);
  };

  const handleRemoveAudit = (index: number) => {
    setSubmittedAudits(submittedAudits.filter((_, i) => i !== index));
  };

  // Group violations by category
  const violationsByCategory = VIOLATIONS.reduce((acc, violation) => {
    if (!acc[violation.category]) {
      acc[violation.category] = [];
    }
    acc[violation.category].push(violation);
    return acc;
  }, {} as { [key: string]: typeof VIOLATIONS });

  // Expose state for testing (incremental validation)
  useEffect(() => {
    (window as any).app_state = {
      // Current form state (for incremental testing)
      currentAudit: {
        auditReference,
        auditorName,
        auditDate,
        selectedViolations,
      },
      formFieldsCompleted: {
        hasAuditReference: auditReference.trim() !== '',
        hasAuditorName: auditorName.trim() !== '',
        hasAuditDate: auditDate.trim() !== '',
        hasSelectedViolations: selectedViolations.length > 0,
      },
      // Submitted audits
      submittedAudits,
      totalAudits: submittedAudits.length,
    };
  }, [auditReference, auditorName, auditDate, selectedViolations, submittedAudits]);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#212529' }}>
          Accessibility Audit Validator
        </h2>
        
        {/* Audit Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Audit Reference
            </label>
            <input
              type="text"
              value={auditReference}
              onChange={(e) => setAuditReference(e.target.value)}
              placeholder="A11Y-2024-XXX"
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
              Auditor Name
            </label>
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="Your Name"
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
              Audit Date
            </label>
            <input
              type="text"
              value={auditDate}
              onChange={(e) => setAuditDate(e.target.value)}
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

      {/* Violation Checklist */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0', fontSize: '18px', color: '#212529' }}>
            Violation Checklist (15 Total)
          </h3>
          <div style={{ 
            fontSize: '14px', 
            color: '#6c757d',
            fontWeight: 'bold'
          }}>
            Selected: {selectedViolations.length}
          </div>
        </div>

        {/* Violations grouped by WCAG category */}
        {Object.entries(violationsByCategory).map(([category, violations]) => (
          <div key={category} style={{ marginBottom: '25px' }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '16px', 
              color: '#495057',
              borderBottom: '2px solid #dee2e6',
              paddingBottom: '8px'
            }}>
              {category} ({violations.length} violations)
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '10px'
            }}>
              {violations.map((violation) => {
                const isSelected = selectedViolations.includes(violation.id);
                return (
                  <label
                    key={violation.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      border: `2px solid ${isSelected ? '#0d6efd' : '#dee2e6'}`,
                      borderRadius: '6px',
                      background: isSelected ? '#e7f1ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleViolation(violation.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '10px',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#212529' }}>
                      {violation.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
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
          ✓ Submit Audit Validation
        </button>
      </div>

      {/* Submitted Audits */}
      {submittedAudits.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#212529' }}>
            Submitted Audits ({submittedAudits.length})
          </h3>
          
          {submittedAudits.map((audit, idx) => (
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
                onClick={() => handleRemoveAudit(idx)}
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
                title="Remove this audit"
              >
                ✕
              </button>

              {/* Audit Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '10px',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid #dee2e6',
                paddingRight: '40px', // Space for remove button
              }}>
                <div>
                  <strong style={{ fontSize: '12px', color: '#6c757d' }}>Reference:</strong>
                  <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    {audit.auditReference}
                  </div>
                </div>
                <div>
                  <strong style={{ fontSize: '12px', color: '#6c757d' }}>Auditor:</strong>
                  <div style={{ fontSize: '14px' }}>{audit.auditorName}</div>
                </div>
                <div>
                  <strong style={{ fontSize: '12px', color: '#6c757d' }}>Date:</strong>
                  <div style={{ fontSize: '14px' }}>{audit.auditDate}</div>
                </div>
              </div>

              {/* Violations Summary */}
              <div style={{
                padding: '15px',
                background: '#ffffff',
                borderRadius: '4px',
              }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>
                  Selected Violations ({audit.selectedViolations.length})
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '6px'
                }}>
                  {audit.selectedViolations.map((violationId: string) => {
                    const violation = VIOLATIONS.find(v => v.id === violationId);
                    return (
                      <span
                        key={violationId}
                        style={{
                          padding: '4px 8px',
                          background: '#e7f1ff',
                          border: '1px solid #0d6efd',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#0d6efd',
                        }}
                      >
                        {violation?.label || violationId}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

