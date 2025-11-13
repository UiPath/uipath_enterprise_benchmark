import React, { useState, useEffect } from 'react';

interface ChangeAssessment {
  changeId: string;
  description: string;
  scope: 'UI' | 'Backend' | 'Database' | 'Infrastructure' | '';
  riskLevel: 'Low' | 'Medium' | 'High' | '';
  rollbackComplexity: 'Easy' | 'Moderate' | 'Hard' | '';
}

interface RiskAssessment {
  changelogReference: string;
  assessmentDate: string;
  assessorName: string;
  changes: ChangeAssessment[];
  submittedAssessments: RiskAssessment[];
}

const scopeColors = {
  'UI': 'bg-blue-100 text-blue-800',
  'Backend': 'bg-green-100 text-green-800',
  'Database': 'bg-purple-100 text-purple-800',
  'Infrastructure': 'bg-orange-100 text-orange-800',
  '': 'bg-gray-100 text-gray-800'
};

const riskColors = {
  'Low': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-red-100 text-red-800',
  '': 'bg-gray-100 text-gray-800'
};

const rollbackColors = {
  'Easy': 'bg-green-100 text-green-800',
  'Moderate': 'bg-yellow-100 text-yellow-800',
  'Hard': 'bg-red-100 text-red-800',
  '': 'bg-gray-100 text-gray-800'
};

export default function Task40() {
  const [changelogReference, setChangelogReference] = useState('');
  const [assessmentDate, setAssessmentDate] = useState('');
  const [assessorName, setAssessorName] = useState('');

  const [changes, setChanges] = useState<ChangeAssessment[]>([
    { changeId: 'CHNG-2024-1201', description: 'Check source file for details', scope: '', riskLevel: '', rollbackComplexity: '' },
    { changeId: 'CHNG-2024-1202', description: 'Check source file for details', scope: '', riskLevel: '', rollbackComplexity: '' },
    { changeId: 'CHNG-2024-1203', description: 'Check source file for details', scope: '', riskLevel: '', rollbackComplexity: '' },
    { changeId: 'CHNG-2024-1204', description: 'Check source file for details', scope: '', riskLevel: '', rollbackComplexity: '' },
    { changeId: 'CHNG-2024-1205', description: 'Check source file for details', scope: '', riskLevel: '', rollbackComplexity: '' },
    { changeId: 'CHNG-2024-1206', description: 'Check source file for details', scope: '', riskLevel: '', rollbackComplexity: '' },
  ]);

  const [submittedAssessments, setSubmittedAssessments] = useState<RiskAssessment[]>([]);

  // Calculate progress
  const completedChanges = changes.filter(change =>
    change.scope !== '' && change.riskLevel !== '' && change.rollbackComplexity !== ''
  ).length;

  // Count distributions
  const scopeDistribution = changes.reduce((acc, change) => {
    if (change.scope) acc[change.scope] = (acc[change.scope] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskDistribution = changes.reduce((acc, change) => {
    if (change.riskLevel) acc[change.riskLevel] = (acc[change.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const rollbackDistribution = changes.reduce((acc, change) => {
    if (change.rollbackComplexity) acc[change.rollbackComplexity] = (acc[change.rollbackComplexity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate overall risk score (simplified)
  const overallRiskScore = (riskDistribution.High || 0) * 3 + (riskDistribution.Medium || 0) * 2 + (riskDistribution.Low || 0) * 1;

  // Update change assessment
  const updateChange = (index: number, field: keyof ChangeAssessment, value: string) => {
    const updatedChanges = [...changes];
    updatedChanges[index] = { ...updatedChanges[index], [field]: value };
    setChanges(updatedChanges);
  };

  // Submit assessment - allow submission with ANY data (test validates correctness)
  const submitAssessment = () => {
    const assessment: RiskAssessment = {
      changelogReference,
      assessmentDate,
      assessorName,
      changes: [...changes],
      submittedAssessments: []
    };
    setSubmittedAssessments([...submittedAssessments, assessment]);

    // Reset form for next assessment
    setChangelogReference('');
    setAssessmentDate('');
    setAssessorName('');
    setChanges(changes.map(change => ({ ...change, scope: '', riskLevel: '', rollbackComplexity: '' })));
  };

  // Expose state for validation
  useEffect(() => {
    (window as any).app_state = {
      changelogReference,
      assessmentDate,
      assessorName,
      changes: changes.map(change => ({
        changeId: change.changeId,
        scope: change.scope,
        riskLevel: change.riskLevel,
        rollbackComplexity: change.rollbackComplexity,
      })),
      completedChanges,
      scopeDistribution,
      riskDistribution,
      rollbackDistribution,
      overallRiskScore,
      submittedAssessments: submittedAssessments.map(assessment => ({
        changelogReference: assessment.changelogReference,
        assessmentDate: assessment.assessmentDate,
        assessorName: assessment.assessorName,
        changes: assessment.changes,
      })),
    };
  }, [changelogReference, assessmentDate, assessorName, changes, completedChanges, scopeDistribution, riskDistribution, rollbackDistribution, overallRiskScore, submittedAssessments]);

  // Expose cheat helper functions (for testers)
  useEffect(() => {
    // Header field setters - directly update React state
    (window as any).task_40_set_header = () => {
      console.log(`[Cheat Helper] Setting header fields...`);
      setChangelogReference('CL-2024-620');
      setAssessmentDate('2024-02-28');
      setAssessorName('Marcus Thompson');
      console.log(`[Cheat Helper] ✅ Header fields filled!`);
    };

    (window as any).task_40_fill_row = (changeIndex: number) => {
      // Auto-fill header fields if missing
      if (!changelogReference.trim() || !assessmentDate.trim() || !assessorName.trim()) {
        console.log(`[Cheat Helper] Auto-filling missing header fields...`);
        (window as any).task_40_set_header();
      }

      // Expected assessments for each change
      const expectedAssessments = [
        { scope: 'UI', riskLevel: 'Low', rollbackComplexity: 'Easy' },        // Change 0: CHNG-2024-1201
        { scope: 'Database', riskLevel: 'High', rollbackComplexity: 'Hard' }, // Change 1: CHNG-2024-1202
        { scope: 'Backend', riskLevel: 'High', rollbackComplexity: 'Moderate' }, // Change 2: CHNG-2024-1203
        { scope: 'Backend', riskLevel: 'Low', rollbackComplexity: 'Easy' },     // Change 3: CHNG-2024-1204
        { scope: 'Infrastructure', riskLevel: 'High', rollbackComplexity: 'Hard' }, // Change 4: CHNG-2024-1205
        { scope: 'UI', riskLevel: 'Medium', rollbackComplexity: 'Easy' },     // Change 5: CHNG-2024-1206
      ];

      if (changeIndex < 0 || changeIndex > 5) {
        console.log(`[Cheat Helper] Invalid index ${changeIndex}. Use 0-5 for the 6 changes.`);
        return;
      }

      const assessment = expectedAssessments[changeIndex];
      console.log(`[Cheat Helper] Filling assessment for change ${changeIndex} (${changes[changeIndex].changeId})...`);

      // Update the change assessment using DOM manipulation like the header fields
      const tableRows = document.querySelectorAll('tbody tr');
      if (tableRows[changeIndex]) {
        const selects = tableRows[changeIndex].querySelectorAll('select');
        if (selects.length >= 3) {
          // Scope select
          selects[0].value = assessment.scope;
          selects[0].dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`[Cheat Helper] Set Scope: ${assessment.scope}`);

          // Risk select
          selects[1].value = assessment.riskLevel;
          selects[1].dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`[Cheat Helper] Set Risk: ${assessment.riskLevel}`);

          // Rollback select
          selects[2].value = assessment.rollbackComplexity;
          selects[2].dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`[Cheat Helper] Set Rollback: ${assessment.rollbackComplexity}`);
        }
      }

      console.log(`[Cheat Helper] ✅ Assessment filled! ${assessment.scope} + ${assessment.riskLevel} + ${assessment.rollbackComplexity}`);
    };

    // Log available helper on first load
    console.log(`[Cheat Helper] 🔧 Helpers available!`);
    console.log(`  window.task_40_set_header() - fills correct header field values`);
    console.log(`  window.task_40_fill_row(0) through window.task_40_fill_row(5) - auto-fill risk assessments`);
  }, [changelogReference]);

  // [Cheat] system for human testers (for testers)
  useEffect(() => {
    const stateKey = JSON.stringify({
      changelogRef: changelogReference,
      assessmentDate,
      assessorName,
      changes: changes.map(c => ({ id: c.changeId, scope: c.scope, risk: c.riskLevel, rollback: c.rollbackComplexity })),
      submittedCount: submittedAssessments.length
    });

    if (!(window as any)._cheatLoggedStates) {
      (window as any)._cheatLoggedStates = new Set();
    }

    if (!(window as any)._cheatLoggedStates.has(stateKey)) {
      (window as any)._cheatLoggedStates.add(stateKey);

      // Expected correct assessments
      const expectedAssessments = [
        { scope: 'UI', riskLevel: 'Low', rollbackComplexity: 'Easy' },        // Change 0: CHNG-2024-1201
        { scope: 'Database', riskLevel: 'High', rollbackComplexity: 'Hard' }, // Change 1: CHNG-2024-1202
        { scope: 'Backend', riskLevel: 'High', rollbackComplexity: 'Moderate' }, // Change 2: CHNG-2024-1203
        { scope: 'Backend', riskLevel: 'Low', rollbackComplexity: 'Easy' },     // Change 3: CHNG-2024-1204
        { scope: 'Infrastructure', riskLevel: 'High', rollbackComplexity: 'Hard' }, // Change 4: CHNG-2024-1205
        { scope: 'UI', riskLevel: 'Medium', rollbackComplexity: 'Easy' },     // Change 5: CHNG-2024-1206
      ];

      // Show header field status (checking correctness for first changelog)
      const expectedHeader = {
        changelogReference: 'CL-2024-620',
        assessmentDate: '2024-02-28',
        assessorName: 'Marcus Thompson'
      };
      
      const headerFields = [
        { Field: 'Changelog Reference', Expected: expectedHeader.changelogReference, Current: changelogReference || '(empty)', Status: changelogReference === expectedHeader.changelogReference ? '✅' : '❌' },
        { Field: 'Assessment Date', Expected: expectedHeader.assessmentDate, Current: assessmentDate || '(empty)', Status: assessmentDate === expectedHeader.assessmentDate ? '✅' : '❌' },
        { Field: 'Assessor Name', Expected: expectedHeader.assessorName, Current: assessorName || '(empty)', Status: assessorName === expectedHeader.assessorName ? '✅' : '❌' }
      ];
      console.log(`[Cheat] 📋 Header Fields (for CL-2024-620):`);
      console.table(headerFields);

      // Show individual change assessment status - comparing against CORRECT values
      const changeStatusTable = changes.map((change, index) => {
        const expected = expectedAssessments[index];
        return {
          Change: change.changeId,
          Scope: change.scope === expected.scope ? `✅ ${change.scope}` : (change.scope ? `❌ ${change.scope} (expected: ${expected.scope})` : `❌ Empty (expected: ${expected.scope})`),
          Risk: change.riskLevel === expected.riskLevel ? `✅ ${change.riskLevel}` : (change.riskLevel ? `❌ ${change.riskLevel} (expected: ${expected.riskLevel})` : `❌ Empty (expected: ${expected.riskLevel})`),
          Rollback: change.rollbackComplexity === expected.rollbackComplexity ? `✅ ${change.rollbackComplexity}` : (change.rollbackComplexity ? `❌ ${change.rollbackComplexity} (expected: ${expected.rollbackComplexity})` : `❌ Empty (expected: ${expected.rollbackComplexity})`),
          Complete: (change.scope === expected.scope && change.riskLevel === expected.riskLevel && change.rollbackComplexity === expected.rollbackComplexity) ? '✅' : '❌'
        };
      });
      console.log(`[Cheat] 🔍 Change Assessments - Correctness Check:`);
      console.table(changeStatusTable);


      // Show progress and next steps - but not if already submitted
      if (submittedAssessments.length > 0) {
        console.log(`[Cheat] ✅ Assessment submitted successfully!`);
        console.log(`[Cheat] Risk assessment for ${submittedAssessments[0]?.changelogReference} has been validated and completed.`);
      } else if (completedChanges < 6) {
        const incomplete = 6 - completedChanges;
        const incompleteChanges = changes
          .map((change, index) => ({ change, index }))
          .filter(({ change }) => !change.scope || !change.riskLevel || !change.rollbackComplexity)
          .slice(0, 3); // Show first 3 incomplete

        console.log(`[Cheat] 🎯 Next: Complete ${incomplete} more assessments. Focus on:`);
        incompleteChanges.forEach(({ change, index }) => {
          const missing = [];
          if (!change.scope) missing.push('Scope');
          if (!change.riskLevel) missing.push('Risk');
          if (!change.rollbackComplexity) missing.push('Rollback');
          console.log(`  - ${change.changeId}: Missing ${missing.join(', ')}`);
        });
      } else if (!changelogReference.trim() || !assessmentDate.trim() || !assessorName.trim()) {
        const missing = [];
        if (!changelogReference.trim()) missing.push('Changelog Reference');
        if (!assessmentDate.trim()) missing.push('Assessment Date');
        if (!assessorName.trim()) missing.push('Assessor Name');
        console.log(`[Cheat] 📝 Fill header fields: ${missing.join(', ')}`);
      } else {
        console.log(`[Cheat] ✅ All assessments complete! Click "Submit Risk Assessment" to proceed`);
      }


      // Show distributions if any assessments completed and not yet submitted
      if (completedChanges > 0 && submittedAssessments.length === 0) {
        console.log(`[Cheat] 📊 Current Distributions:`);
        const distributionTable = [
          { Category: 'Scope', UI: scopeDistribution.UI || 0, Backend: scopeDistribution.Backend || 0, Database: scopeDistribution.Database || 0, Infrastructure: scopeDistribution.Infrastructure || 0 },
          { Category: 'Risk', Low: riskDistribution.Low || 0, Medium: riskDistribution.Medium || 0, High: riskDistribution.High || 0 },
          { Category: 'Rollback', Easy: rollbackDistribution.Easy || 0, Moderate: rollbackDistribution.Moderate || 0, Hard: rollbackDistribution.Hard || 0 }
        ];
        console.table(distributionTable);
        console.log(`[Cheat] Overall Risk Score: ${overallRiskScore}`);
      }
    }
  }, [changelogReference, assessmentDate, assessorName, changes, completedChanges, scopeDistribution, riskDistribution, rollbackDistribution, overallRiskScore, submittedAssessments.length]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Change Request Risk Assessment</h1>

      {/* Assessment Header */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Assessment Information</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Changelog Reference</label>
            <input
              type="text"
              placeholder="CL-2024-XXX"
              className="w-full px-3 py-2 border border-gray-300 rounded font-mono task-40-changelog-ref"
              value={changelogReference}
              onChange={(e) => setChangelogReference(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assessment Date</label>
            <input
              type="text"
              placeholder="2024-XX-XX"
              className="w-full px-3 py-2 border border-gray-300 rounded task-40-assessment-date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assessor Name</label>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-3 py-2 border border-gray-300 rounded task-40-assessor-name"
              value={assessorName}
              onChange={(e) => setAssessorName(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            <strong>Progress:</strong> {completedChanges}/6 changes assessed
          </p>
        </div>
      </div>



      {/* Risk Matrix Table */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Risk Assessment Matrix</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left font-semibold">Change ID</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
                <th className="px-4 py-3 text-center font-semibold">Scope</th>
                <th className="px-4 py-3 text-center font-semibold">Risk Level</th>
                <th className="px-4 py-3 text-center font-semibold">Rollback Complexity</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change, index) => {
                const isComplete = change.scope && change.riskLevel && change.rollbackComplexity;
                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-3 font-mono text-sm">{change.changeId}</td>
                    <td className="px-4 py-3 text-sm italic text-gray-600">
                      {change.description}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        value={change.scope}
                        onChange={(e) => updateChange(index, 'scope', e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="UI">UI</option>
                        <option value="Backend">Backend</option>
                        <option value="Database">Database</option>
                        <option value="Infrastructure">Infrastructure</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        value={change.riskLevel}
                        onChange={(e) => updateChange(index, 'riskLevel', e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        value={change.rollbackComplexity}
                        onChange={(e) => updateChange(index, 'rollbackComplexity', e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${isComplete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {isComplete ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Summary Panel */}
      {completedChanges > 0 && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Risk Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <h3 className="font-semibold text-blue-700">Scope Distribution</h3>
              <div className="mt-2 space-y-1">
                {Object.entries(scopeDistribution).map(([scope, count]) => (
                  <div key={scope} className="flex justify-between">
                    <span className="text-sm">{scope}:</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-red-700">Risk Distribution</h3>
              <div className="mt-2 space-y-1">
                {Object.entries(riskDistribution).map(([risk, count]) => (
                  <div key={risk} className="flex justify-between">
                    <span className="text-sm">{risk}:</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-orange-700">Rollback Distribution</h3>
              <div className="mt-2 space-y-1">
                {Object.entries(rollbackDistribution).map(([rollback, count]) => (
                  <div key={rollback} className="flex justify-between">
                    <span className="text-sm">{rollback}:</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-purple-700">Overall Risk Score</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold">{overallRiskScore}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button - always enabled (test validates correctness) */}
      <div className="text-center">
        <button
          onClick={submitAssessment}
          className="px-6 py-3 rounded font-semibold bg-blue-600 text-white hover:bg-blue-700"
        >
          Submit Risk Assessment
        </button>
      </div>

      {/* Submitted Assessments */}
      {submittedAssessments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Submitted Assessments</h2>
          {submittedAssessments.map((assessment, idx) => (
            <div key={idx} className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-4">
              <h3 className="font-semibold mb-2">
                {assessment.changelogReference} - {assessment.assessmentDate} by {assessment.assessorName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessment.changes.map((change, changeIdx) => (
                  <div key={changeIdx} className="border rounded p-3">
                    <div className="font-mono text-sm font-semibold">{change.changeId}</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Scope:</span>
                        <span className={`px-2 py-1 rounded text-xs ${scopeColors[change.scope as keyof typeof scopeColors]}`}>
                          {change.scope}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Risk:</span>
                        <span className={`px-2 py-1 rounded text-xs ${riskColors[change.riskLevel as keyof typeof riskColors]}`}>
                          {change.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Rollback:</span>
                        <span className={`px-2 py-1 rounded text-xs ${rollbackColors[change.rollbackComplexity as keyof typeof rollbackColors]}`}>
                          {change.rollbackComplexity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
