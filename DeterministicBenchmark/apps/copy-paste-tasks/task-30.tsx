import React, { useState, useEffect } from 'react';

interface Contract {
  contractReference: string;
  party1Company: string;
  party2Company: string;
  contractType: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  renewalTerms: string;
  keyClauses: string[];
  timelineBuilt: boolean;
  reminderSet: boolean;
}

interface FormEntry {
  contractReference: string;
  party1Company: string;
  party2Company: string;
  contractType: string;
  startDate: string;
  endDate: string;
  contractValue: string;
  renewalTerms: string;
  keyClauses: string[];
}

const CLAUSE_LIBRARY = [
  'IP Rights',
  'Termination',
  'SLA Terms',
  'Payment Schedule',
  'Confidentiality',
  'Deliverables',
  'Liability',
  'Force Majeure',
  'Dispute Resolution',
  'Warranties',
  'Indemnification',
  'Non-Compete'
];

const CONTRACT_TYPES = [
  'Software Licensing Agreement',
  'Supply Chain Services',
  'Professional Services Agreement',
  'Employment Contract',
  'Partnership Agreement',
  'Service Level Agreement'
];

export default function Task30() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [currentForm, setCurrentForm] = useState<FormEntry>({
    contractReference: '',
    party1Company: '',
    party2Company: '',
    contractType: '',
    startDate: '',
    endDate: '',
    contractValue: '',
    renewalTerms: '',
    keyClauses: []
  });
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [timelineBuilt, setTimelineBuilt] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [clauseSearch, setClauseSearch] = useState('');

  // Expose app state for testing
  useEffect(() => {
    const formFieldsCompleted = {
      hasContractReference: currentForm.contractReference.trim().length > 0,
      hasParty1Company: currentForm.party1Company.trim().length > 0,
      hasParty2Company: currentForm.party2Company.trim().length > 0,
      hasContractType: currentForm.contractType.trim().length > 0,
      hasStartDate: currentForm.startDate.trim().length > 0,
      hasEndDate: currentForm.endDate.trim().length > 0,
      hasContractValue: currentForm.contractValue.trim().length > 0,
      hasRenewalTerms: currentForm.renewalTerms.trim().length > 0,
      hasKeyClauses: selectedClauses.length > 0
    };

    (window as any).app_state = {
      contracts: JSON.parse(JSON.stringify(contracts)),
      currentFormEntry: JSON.parse(JSON.stringify(currentForm)),
      formFieldsCompleted,
      selectedClauses: [...selectedClauses],
      timelineBuilt,
      reminderSet,
      totalContracts: contracts.length
    };
  }, [contracts, currentForm, selectedClauses, timelineBuilt, reminderSet]);

  const handleClauseToggle = (clause: string) => {
    setSelectedClauses(prev => {
      if (prev.includes(clause)) {
        return prev.filter(c => c !== clause);
      } else {
        return [...prev, clause];
      }
    });
  };

  const handleBuildTimeline = () => {
    if (!currentForm.startDate || !currentForm.endDate) {
      return;
    }
    setTimelineBuilt(true);
  };

  const handleSetReminder = () => {
    if (!currentForm.endDate) {
      return;
    }
    setReminderSet(true);
  };

  const handleAddContract = () => {
    // Silent validation
    if (!currentForm.contractReference.trim() ||
        !currentForm.party1Company.trim() ||
        !currentForm.party2Company.trim() ||
        !currentForm.contractType.trim() ||
        !currentForm.startDate.trim() ||
        !currentForm.endDate.trim() ||
        !currentForm.contractValue.trim() ||
        !currentForm.renewalTerms.trim() ||
        selectedClauses.length === 0 ||
        !timelineBuilt ||
        !reminderSet) {
      return;
    }

    const newContract: Contract = {
      contractReference: currentForm.contractReference.trim(),
      party1Company: currentForm.party1Company.trim(),
      party2Company: currentForm.party2Company.trim(),
      contractType: currentForm.contractType.trim(),
      startDate: currentForm.startDate.trim(),
      endDate: currentForm.endDate.trim(),
      contractValue: parseFloat(currentForm.contractValue),
      renewalTerms: currentForm.renewalTerms.trim(),
      keyClauses: [...selectedClauses].sort(),
      timelineBuilt: true,
      reminderSet: true
    };

    setContracts(prev => [...prev, newContract]);

    // Reset form
    setCurrentForm({
      contractReference: '',
      party1Company: '',
      party2Company: '',
      contractType: '',
      startDate: '',
      endDate: '',
      contractValue: '',
      renewalTerms: '',
      keyClauses: []
    });
    setSelectedClauses([]);
    setTimelineBuilt(false);
    setReminderSet(false);
  };

  const handleRemoveContract = (index: number) => {
    setContracts(prev => prev.filter((_, i) => i !== index));
  };

  const filteredClauses = CLAUSE_LIBRARY.filter(clause =>
    clause.toLowerCase().includes(clauseSearch.toLowerCase())
  );

  const calculateDuration = () => {
    if (!currentForm.startDate || !currentForm.endDate) return '';
    const start = new Date(currentForm.startDate);
    const end = new Date(currentForm.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return `${months} months, ${days} days`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Panel - Contract Entry Form */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
            📄 Contract Entry
          </h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              Contract Reference
            </label>
            <input
              type="text"
              value={currentForm.contractReference}
              onChange={(e) => setCurrentForm(prev => ({ ...prev, contractReference: e.target.value }))}
              placeholder="CNT-2024-XXX"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              Party 1 (Company)
            </label>
            <input
              type="text"
              value={currentForm.party1Company}
              onChange={(e) => setCurrentForm(prev => ({ ...prev, party1Company: e.target.value }))}
              placeholder="Company Name"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              Party 2 (Company)
            </label>
            <input
              type="text"
              value={currentForm.party2Company}
              onChange={(e) => setCurrentForm(prev => ({ ...prev, party2Company: e.target.value }))}
              placeholder="Company Name"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              Contract Type
            </label>
            <select
              value={currentForm.contractType}
              onChange={(e) => setCurrentForm(prev => ({ ...prev, contractType: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Select Type</option>
              {CONTRACT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                Start Date
              </label>
              <input
                type="date"
                value={currentForm.startDate}
                onChange={(e) => setCurrentForm(prev => ({ ...prev, startDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                End Date
              </label>
              <input
                type="date"
                value={currentForm.endDate}
                onChange={(e) => setCurrentForm(prev => ({ ...prev, endDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              Contract Value ($)
            </label>
            <input
              type="number"
              value={currentForm.contractValue}
              onChange={(e) => setCurrentForm(prev => ({ ...prev, contractValue: e.target.value }))}
              placeholder="125000"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              Renewal Terms
            </label>
            <textarea
              value={currentForm.renewalTerms}
              onChange={(e) => setCurrentForm(prev => ({ ...prev, renewalTerms: e.target.value }))}
              placeholder="Auto-renew annually with 60-day notice"
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Right Panel - Clause Library & Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Clause Library */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '2px solid #9b59b6', paddingBottom: '10px' }}>
              📚 Clause Library
            </h3>

            <input
              type="text"
              value={clauseSearch}
              onChange={(e) => setClauseSearch(e.target.value)}
              placeholder="🔍 Search clauses..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '15px',
                fontSize: '14px'
              }}
            />

            <div style={{ marginBottom: '10px', fontSize: '12px', color: '#7f8c8d' }}>
              Selected: {selectedClauses.length} clause{selectedClauses.length !== 1 ? 's' : ''}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {filteredClauses.map(clause => {
                const isSelected = selectedClauses.includes(clause);
                return (
                  <button
                    key={clause}
                    onClick={() => handleClauseToggle(clause)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isSelected ? '#9b59b6' : '#ecf0f1',
                      color: isSelected ? 'white' : '#34495e',
                      border: isSelected ? '2px solid #8e44ad' : '1px solid #bdc3c7',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
                  >
                    {isSelected ? '✓ ' : ''}{clause}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline Builder */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '2px solid #e74c3c', paddingBottom: '10px' }}>
              📅 Timeline Visualization
            </h3>

            {currentForm.startDate && currentForm.endDate && (
              <div style={{
                padding: '15px',
                backgroundColor: '#ecf0f1',
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  <strong>Start:</strong> {currentForm.startDate}
                </div>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  <strong>End:</strong> {currentForm.endDate}
                </div>
                <div style={{ fontSize: '14px', color: '#e74c3c', fontWeight: 'bold' }}>
                  <strong>Duration:</strong> {calculateDuration()}
                </div>
              </div>
            )}

            <button
              onClick={handleBuildTimeline}
              disabled={!currentForm.startDate || !currentForm.endDate}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: timelineBuilt ? '#27ae60' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (!currentForm.startDate || !currentForm.endDate) ? 'not-allowed' : 'pointer',
                opacity: (!currentForm.startDate || !currentForm.endDate) ? 0.5 : 1,
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {timelineBuilt ? '✓ Timeline Built' : '🔨 Build Timeline'}
            </button>
          </div>

          {/* Calendar Reminder */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '2px solid #f39c12', paddingBottom: '10px' }}>
              🔔 Renewal Reminder
            </h3>

            {currentForm.endDate && (
              <div style={{
                padding: '15px',
                backgroundColor: '#fff3cd',
                borderRadius: '4px',
                marginBottom: '15px',
                border: '1px solid #f39c12'
              }}>
                <div style={{ fontSize: '14px', color: '#856404' }}>
                  Reminder will be set for: <strong>{currentForm.endDate}</strong>
                </div>
              </div>
            )}

            <button
              onClick={handleSetReminder}
              disabled={!currentForm.endDate}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: reminderSet ? '#27ae60' : '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !currentForm.endDate ? 'not-allowed' : 'pointer',
                opacity: !currentForm.endDate ? 0.5 : 1,
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {reminderSet ? '✓ Reminder Set' : '⏰ Set Renewal Reminder'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Contract Button - Spans Full Width */}
      <button
        onClick={handleAddContract}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '20px'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#229954'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
      >
        ✓ Add Contract to System
      </button>

      {/* Contracts List */}
      {contracts.length > 0 && (
        <div style={{ marginTop: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', borderBottom: '2px solid #16a085', paddingBottom: '10px' }}>
            📋 Contract Management System ({contracts.length} contract{contracts.length !== 1 ? 's' : ''})
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Reference</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Parties</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Period</th>
                  <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Value</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Clauses</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {contract.contractReference}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <div style={{ fontSize: '13px' }}>
                        <div><strong>{contract.party1Company}</strong></div>
                        <div style={{ color: '#7f8c8d' }}>↔ {contract.party2Company}</div>
                      </div>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
                      {contract.contractType}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
                      <div>{contract.startDate}</div>
                      <div>to {contract.endDate}</div>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                      ${contract.contractValue.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {contract.keyClauses.map(clause => (
                          <span
                            key={clause}
                            style={{
                              padding: '2px 6px',
                              backgroundColor: '#9b59b6',
                              color: 'white',
                              borderRadius: '3px',
                              fontSize: '11px'
                            }}
                          >
                            {clause}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px' }}>
                        <div style={{ color: '#27ae60', marginBottom: '2px' }}>✓ Timeline</div>
                        <div style={{ color: '#27ae60' }}>✓ Reminder</div>
                      </div>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveContract(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px', fontSize: '13px' }}>
            <strong>Renewal Terms:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              {contracts.map((contract, index) => (
                <li key={index}>
                  <strong>{contract.contractReference}:</strong> {contract.renewalTerms}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

