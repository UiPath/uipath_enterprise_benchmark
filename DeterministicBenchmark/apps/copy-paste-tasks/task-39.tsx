import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

type Severity = '' | 'P1' | 'P2' | 'P3' | 'P4';

interface IncidentData {
  incidentId: string;
  reportedBy: string;
  description: string;
  severity: Severity;
  escalated: boolean;
}

interface BatchRecord {
  batchReference: string;
  triageDate: string;
  incidents: IncidentData[];
  timestamp: string;
}

// Deterministic batch data for 3 batches (agents must open external Word docs)
const EXPECTED_BATCHES: { [key: string]: IncidentData[] } = {
  'BATCH-2024-408': [
    {
      incidentId: 'INC-2024-1105',
      reportedBy: 'Sarah Martinez',
      description: 'Complete production database outage affecting all users. Customer transactions failing. Revenue impact estimated at $50K per hour. Security team investigating potential breach. System completely unavailable since 08:15 AM.',
      severity: 'P1',
      escalated: true,
    },
    {
      incidentId: 'INC-2024-1106',
      reportedBy: 'James Wilson',
      description: 'Minor cosmetic issue on dashboard where chart legend text slightly overlaps with graph border. Does not affect functionality. Workaround available by expanding browser window. Only occurs on specific screen resolutions.',
      severity: 'P4',
      escalated: false,
    },
  ],
  'BATCH-2024-409': [
    {
      incidentId: 'INC-2024-1113',
      reportedBy: 'Amanda Foster',
      description: 'Customer-facing API experiencing significant performance degradation. Response times increased from 200ms to 3000ms. 30% of API calls timing out. Mobile app users reporting slow loading. Partial service disruption.',
      severity: 'P2',
      escalated: true,
    },
    {
      incidentId: 'INC-2024-1114',
      reportedBy: 'Robert Lee',
      description: 'Search results occasionally return incorrect categories. Affects approximately 5% of queries. Users can refine search to find correct items. Minor bug requiring investigation and fix.',
      severity: 'P3',
      escalated: false,
    },
  ],
  'BATCH-2024-410': [
    {
      incidentId: 'INC-2024-1121',
      reportedBy: 'Elizabeth Wilson',
      description: 'Network infrastructure failure causing complete connectivity loss. All users disconnected. Services completely unavailable. External ISP investigating. Total system outage across all regions.',
      severity: 'P1',
      escalated: true,
    },
    {
      incidentId: 'INC-2024-1122',
      reportedBy: 'Daniel Moore',
      description: 'Feature request for bulk editing capabilities in user management. Would reduce administrative time. Current single-edit workflow available. Enhancement for future development roadmap.',
      severity: 'P4',
      escalated: false,
    },
  ],
};

export default function Task39() {
  const [batchReference, setBatchReference] = useState('');
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [submittedBatches, setSubmittedBatches] = useState<BatchRecord[]>([]);

  // Clear incidents when batch reference changes
  useEffect(() => {
    setIncidents([]);
  }, [batchReference]);

  // Form fields for adding incidents
  const [incidentId, setIncidentId] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('');
  const [escalated, setEscalated] = useState(false);

  // Update escalation when severity changes
  useEffect(() => {
    if (severity === 'P1' || severity === 'P2') {
      setEscalated(true);
    } else if (severity === 'P3' || severity === 'P4') {
      setEscalated(false);
    }
  }, [severity]);

  const canAddIncident = incidentId.trim() !== '' &&
                         reportedBy.trim() !== '' &&
                         description.trim() !== '' &&
                         severity !== '';

  const canSubmitBatch = batchReference.trim() !== '' &&
                         incidents.length === 2;

  const handleAddIncident = () => {
    if (!canAddIncident) return;

    // Check for duplicate incident ID
    if (incidents.find(i => i.incidentId === incidentId.trim())) {
      return; // Silent validation - don't add duplicate
    }

    const newIncident: IncidentData = {
      incidentId: incidentId.trim(),
      reportedBy: reportedBy.trim(),
      description: description.trim(),
      severity,
      escalated,
    };

    setIncidents([...incidents, newIncident]);

    // Reset form
    setIncidentId('');
    setReportedBy('');
    setDescription('');
    setSeverity('');
    setEscalated(false);
  };

  const handleRemoveIncident = (index: number) => {
    setIncidents(incidents.filter((_, i) => i !== index));
  };

  const handleRemoveBatch = (batchIdx: number) => {
    setSubmittedBatches(submittedBatches.filter((_, i) => i !== batchIdx));
  };

  const handleSubmitBatch = () => {
    if (!canSubmitBatch) return;

    const newBatch: BatchRecord = {
      batchReference: batchReference.trim(),
      triageDate: new Date().toISOString().split('T')[0],
      incidents: [...incidents],
      timestamp: new Date().toISOString(),
    };

    setSubmittedBatches([...submittedBatches, newBatch]);

    // Reset form
    setBatchReference('');
    setIncidents([]);
  };

  const getSeverityBadgeClass = (sev: Severity) => {
    switch (sev) {
      case 'P1': return 'bg-red-100 text-red-800 border-red-300';
      case 'P2': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'P3': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'P4': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (sev: Severity) => {
    switch (sev) {
      case 'P1': return <AlertCircle className="w-4 h-4" />;
      case 'P2': return <AlertTriangle className="w-4 h-4" />;
      case 'P3': return <Info className="w-4 h-4" />;
      case 'P4': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getSeverityLabel = (sev: Severity) => {
    switch (sev) {
      case 'P1': return 'Critical';
      case 'P2': return 'High';
      case 'P3': return 'Medium';
      case 'P4': return 'Low';
      default: return '';
    }
  };

  // Count by severity
  const severityCounts = {
    P1: incidents.filter(i => i.severity === 'P1').length,
    P2: incidents.filter(i => i.severity === 'P2').length,
    P3: incidents.filter(i => i.severity === 'P3').length,
    P4: incidents.filter(i => i.severity === 'P4').length,
  };

  const escalationCount = incidents.filter(i => i.escalated).length;

  // Track current form entry for progressive [Cheat]
  const currentFormEntry = {
    incidentId: incidentId.trim(),
    reportedBy: reportedBy.trim(),
    description: description.trim(),
    severity,
    escalated,
  };

  const formFieldsCompleted = {
    hasIncidentId: incidentId.trim() !== '',
    hasReportedBy: reportedBy.trim() !== '',
    hasDescription: description.trim() !== '',
    hasSeverity: severity !== '',
  };

  // Expose state for testing
  useEffect(() => {
    console.log('[COMPONENT] Updating app_state with:', {
      batchReference,
      incidentId: incidentId.trim(),
      reportedBy: reportedBy.trim(),
      description: description.trim(),
      severity,
      escalated,
      formFieldsCompleted,
    });

    // Cheat function for filling incident form
    (window as any).task_39_fill_incident = (batchNr: number, incidentNr: number) => {
      if (batchNr < 0 || batchNr > 2) {
        console.log('[Cheat] Invalid batch number. Use 0, 1, or 2');
        return;
      }
      if (incidentNr < 0 || incidentNr > 1) {
        console.log('[Cheat] Invalid incident number. Use 0 or 1');
        return;
      }

      // Local reference to expected batches data
      const expectedBatches = [
        {
          ref: 'BATCH-2024-408',
          incidents: [
            { id: 'INC-2024-1105', reportedBy: 'Sarah Martinez', severity: 'P1' },
            { id: 'INC-2024-1106', reportedBy: 'James Wilson', severity: 'P4' },
          ],
        },
        {
          ref: 'BATCH-2024-409',
          incidents: [
            { id: 'INC-2024-1113', reportedBy: 'Amanda Foster', severity: 'P2' },
            { id: 'INC-2024-1114', reportedBy: 'Robert Lee', severity: 'P3' },
          ],
        },
        {
          ref: 'BATCH-2024-410',
          incidents: [
            { id: 'INC-2024-1121', reportedBy: 'Elizabeth Wilson', severity: 'P1' },
            { id: 'INC-2024-1122', reportedBy: 'Daniel Moore', severity: 'P4' },
          ],
        },
      ];

      const batchData = expectedBatches[batchNr];
      const incidentData = batchData.incidents[incidentNr];

      // Get description from the original data
      const descriptions = [
        // Batch 0 (BATCH-2024-408)
        'Complete production database outage affecting all users. Customer transactions failing. Revenue impact estimated at $50K per hour. Security team investigating potential breach. System completely unavailable since 08:15 AM.',
        'Minor cosmetic issue on dashboard where chart legend text slightly overlaps with graph border. Does not affect functionality. Workaround available by expanding browser window. Only occurs on specific screen resolutions.',
        // Batch 1 (BATCH-2024-409)
        'Customer-facing API experiencing significant performance degradation. Response times increased from 200ms to 3000ms. 30% of API calls timing out. Mobile app users reporting slow loading. Partial service disruption.',
        'Search results occasionally return incorrect categories. Affects approximately 5% of queries. Users can refine search to find correct items. Minor bug requiring investigation and fix.',
        // Batch 2 (BATCH-2024-410)
        'Network infrastructure failure causing complete connectivity loss. All users disconnected. Services completely unavailable. External ISP investigating. Total system outage across all regions.',
        'Feature request for bulk editing capabilities in user management. Would reduce administrative time. Current single-edit workflow available. Enhancement for future development roadmap.',
      ];

      const descriptionIndex = batchNr * 2 + incidentNr;

      // Check if we need to change batch reference
      const currentBatchRef = batchReference.trim();
      const requestedBatchRef = batchData.ref;

      if (currentBatchRef && currentBatchRef !== requestedBatchRef && incidents.length > 0) {
        console.log(`[Cheat] ERROR: You have ${incidents.length} unsaved incident(s) for batch "${currentBatchRef}".`);
        console.log(`[Cheat] Submit the current batch first before switching to batch "${requestedBatchRef}".`);
        return;
      }

      console.log(`[Cheat] Filling form with Batch ${batchNr} Incident ${incidentNr}:`);
      console.log(`  Batch: ${batchData.ref}`);
      console.log(`  Incident ID: ${incidentData.id}`);
      console.log(`  Reported By: ${incidentData.reportedBy}`);
      console.log(`  Severity: ${incidentData.severity}`);
      console.log(`  Escalation: ${incidentData.escalated ? 'YES' : 'NO'}`);

      // Programmatically fill the form fields
      setBatchReference(batchData.ref);  // Fill batch reference
      setIncidentId(incidentData.id);
      setReportedBy(incidentData.reportedBy);
      setDescription(descriptions[descriptionIndex]);
      setSeverity(incidentData.severity as Severity);
      // Explicitly set escalation based on severity (since useEffect might not run immediately)
      setEscalated(incidentData.severity === 'P1' || incidentData.severity === 'P2');

      console.log('[Cheat] Form filled! Click "Add to Triage Queue" manually.');
    };

    (window as any).app_state = {
      batchReference,
      incidents,
      triagedCount: incidents.length,
      severityDistribution: severityCounts,
      escalationCount,
      submittedBatches,
      currentFormEntry,
      formFieldsCompleted,
    };
  }, [batchReference, incidents, submittedBatches, incidentId, reportedBy, description, severity, escalated]);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Incident Severity Classifier</h2>
          <p className="text-gray-600 mb-4">
            Triage incident reports by classifying severity and escalation requirements
          </p>

          {/* External Data Source Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>External Data Source:</strong> Open Word document files containing incident reports.
              Each batch has 8 incidents with incident IDs, reporters, and descriptions.
            </p>
          </div>

          {/* Batch Reference */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Reference
            </label>
            <input
              type="text"
              value={batchReference}
              onChange={(e) => setBatchReference(e.target.value)}
              placeholder="e.g., BATCH-2024-408"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>

          {/* Progress Indicator */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Triage Progress</span>
              <span className="text-sm font-bold text-gray-900">{incidents.length}/2 Incidents</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(incidents.length / 2) * 100}%` }}
              />
            </div>
            
            {/* Severity Distribution */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{severityCounts.P1}</div>
                <div className="text-xs text-gray-600">P1 Critical</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{severityCounts.P2}</div>
                <div className="text-xs text-gray-600">P2 High</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{severityCounts.P3}</div>
                <div className="text-xs text-gray-600">P3 Medium</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{severityCounts.P4}</div>
                <div className="text-xs text-gray-600">P4 Low</div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-300 text-center">
              <span className="text-sm text-gray-700">
                <span className="font-semibold text-red-600">{escalationCount}</span> incidents require escalation
              </span>
            </div>
          </div>

          {/* Add Incident Form */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Incident Classification</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incident ID
                </label>
                <input
                  type="text"
                  value={incidentId}
                  onChange={(e) => setIncidentId(e.target.value)}
                  placeholder="e.g., INC-2024-1105"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reported By
                </label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  placeholder="Reporter name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Copy incident description from Word document"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity Classification
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select severity...</option>
                  <option value="P1">P1 - Critical</option>
                  <option value="P2">P2 - High</option>
                  <option value="P3">P3 - Medium</option>
                  <option value="P4">P4 - Low</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-md border border-gray-300 w-full">
                  <input
                    type="checkbox"
                    checked={escalated}
                    disabled={true}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Requires Escalation {severity && (severity === 'P1' || severity === 'P2') ? '(Auto)' : ''}
                  </span>
                </label>
              </div>
            </div>

            <button
              onClick={handleAddIncident}
              disabled={!canAddIncident}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                canAddIncident
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add to Triage Queue ({incidents.length}/2)
            </button>
          </div>

          {/* Incident Cards */}
          {incidents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Triaged Incidents</h3>
              <div className="grid grid-cols-1 gap-3">
                {incidents.map((incident, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {incident.incidentId}
                        </span>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityBadgeClass(incident.severity)}`}>
                          {getSeverityIcon(incident.severity)}
                          <span>{getSeverityLabel(incident.severity)}</span>
                        </span>
                        {incident.escalated && (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Escalated</span>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveIncident(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Reported by:</span> {incident.reportedBy}
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-2">
                      {incident.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Batch Button */}
          <button
            onClick={handleSubmitBatch}
            disabled={!canSubmitBatch}
            className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
              canSubmitBatch
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {incidents.length === 2 ? '✓ Submit Batch (2/2 Complete)' : `Submit Batch (${incidents.length}/2 - Need ${2 - incidents.length} more)`}
          </button>
        </div>

        {/* Submitted Batches */}
        {submittedBatches.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Submitted Triage Batches</h3>
            <div className="space-y-6">
              {submittedBatches.map((batch, batchIdx) => {
                const batchSeverityCounts = {
                  P1: batch.incidents.filter(i => i.severity === 'P1').length,
                  P2: batch.incidents.filter(i => i.severity === 'P2').length,
                  P3: batch.incidents.filter(i => i.severity === 'P3').length,
                  P4: batch.incidents.filter(i => i.severity === 'P4').length,
                };
                const batchEscalationCount = batch.incidents.filter(i => i.escalated).length;

                return (
                  <div key={batchIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-mono font-semibold text-gray-900">{batch.batchReference}</div>
                        <div className="text-sm text-gray-600">
                          Triaged: {batch.triageDate} | {batch.incidents.length} incidents
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {batchEscalationCount} Escalated
                          </div>
                          <div className="text-xs text-gray-600">
                            P1:{batchSeverityCounts.P1} P2:{batchSeverityCounts.P2} P3:{batchSeverityCounts.P3} P4:{batchSeverityCounts.P4}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveBatch(batchIdx)}
                          className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                          title="Remove this batch to redo it"
                        >
                          Remove Batch
                        </button>
                      </div>
                    </div>

                    {/* Incident Details Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-gray-300">
                          <tr>
                            <th className="text-left px-3 py-2 font-semibold text-gray-700">Incident ID</th>
                            <th className="text-left px-3 py-2 font-semibold text-gray-700">Reporter</th>
                            <th className="text-left px-3 py-2 font-semibold text-gray-700">Description</th>
                            <th className="text-center px-3 py-2 font-semibold text-gray-700">Severity</th>
                            <th className="text-center px-3 py-2 font-semibold text-gray-700">Escalated</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {batch.incidents.map((incident, incIdx) => (
                            <tr key={incIdx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono text-xs">{incident.incidentId}</td>
                              <td className="px-3 py-2">{incident.reportedBy}</td>
                              <td className="px-3 py-2 max-w-md">
                                <div className="line-clamp-2 text-gray-700">{incident.description}</div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityBadgeClass(incident.severity)}`}>
                                  {getSeverityIcon(incident.severity)}
                                  <span>{getSeverityLabel(incident.severity)}</span>
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {incident.escalated ? (
                                  <span className="inline-flex items-center space-x-1 text-red-700">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">Yes</span>
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">No</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

