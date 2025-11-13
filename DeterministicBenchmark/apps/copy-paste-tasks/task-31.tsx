import React, { useState, useEffect } from 'react';
import { Plus, X, CheckCircle, AlertTriangle, FileText, Shield, Lock, BookOpen, GitBranch } from 'lucide-react';

// Reference data for cheat helper (simulates external PDF)
const AUDIT_DATA = {
  'AUD-2024-301': [
    { category: 'Data Security', affected_system: 'Customer Database', encryption_status: 'None', remediation_owner: 'IT Security Team', target_completion_date: '2024-03-15' },
    { category: 'Data Security', affected_system: 'Payment API', encryption_status: 'TLS 1.2', remediation_owner: 'DevOps Team', target_completion_date: '2024-03-10' },
    { category: 'Access Control', user_role: 'External Contractor', permission_level: 'Administrator', justification_notes: 'Temporary elevated access for migration project', reviewer_name: 'Security Manager' },
    { category: 'Access Control', user_role: 'Service Account', permission_level: 'Write Access', justification_notes: 'Legacy application requirement', reviewer_name: 'Access Control Team' },
    { category: 'Documentation', document_type: 'Disaster Recovery Plan', missing_sections: 'Recovery Time Objectives, Contact Lists', responsible_party: 'IT Operations', update_deadline: '2024-03-20' },
    { category: 'Documentation', document_type: 'Information Security Policy', missing_sections: 'Cloud Security, Remote Work Guidelines', responsible_party: 'Compliance Officer', update_deadline: '2024-03-25' },
    { category: 'Process Compliance', process_name: 'Change Management', gap_description: 'Production deployment without CAB approval', corrective_action: 'Implement pre-deployment checklist automation', verification_method: 'Audit log review' },
    { category: 'Process Compliance', process_name: 'Backup and Recovery', gap_description: 'Monthly backup restoration tests skipped for 3 months', corrective_action: 'Schedule automated restore tests with alerts', verification_method: 'Test execution reports' }
  ],
  'AUD-2024-302': [
    { category: 'Data Security', affected_system: 'Document Storage Server', encryption_status: 'None', remediation_owner: 'Infrastructure Team', target_completion_date: '2024-04-01' },
    { category: 'Data Security', affected_system: 'Web Application Gateway', encryption_status: 'TLS 1.2', remediation_owner: 'Network Security', target_completion_date: '2024-03-28' },
    { category: 'Access Control', user_role: 'Network Administrator', permission_level: 'Super Admin', justification_notes: 'Emergency access during incident response', reviewer_name: 'CISO' },
    { category: 'Access Control', user_role: 'Former Employee', permission_level: 'Read Only', justification_notes: 'Account deactivation process not followed', reviewer_name: 'HR Manager' },
    { category: 'Documentation', document_type: 'Incident Response Plan', missing_sections: 'Escalation Procedures, Communication Templates', responsible_party: 'Security Operations', update_deadline: '2024-04-05' },
    { category: 'Documentation', document_type: 'Data Retention Policy', missing_sections: 'Retention Periods, Deletion Procedures', responsible_party: 'Legal Department', update_deadline: '2024-04-10' },
    { category: 'Process Compliance', process_name: 'Vulnerability Management', gap_description: 'Critical patches not applied within SLA timeframe', corrective_action: 'Establish automated patching for critical systems', verification_method: 'Patch compliance reports' },
    { category: 'Process Compliance', process_name: 'Access Review', gap_description: 'Quarterly access reviews missed for 2 quarters', corrective_action: 'Automated access review workflow with reminders', verification_method: 'Access review completion logs' }
  ],
  'AUD-2024-303': [
    { category: 'Data Security', affected_system: 'Backup Storage System', encryption_status: 'None', remediation_owner: 'Database Administration', target_completion_date: '2024-03-18' },
    { category: 'Data Security', affected_system: 'Email Security Gateway', encryption_status: 'TLS 1.3', remediation_owner: 'Email Operations', target_completion_date: '2024-04-15' },
    { category: 'Access Control', user_role: 'Remote Worker', permission_level: 'Write Access', justification_notes: 'Phased rollout in progress', reviewer_name: 'IT Director' },
    { category: 'Access Control', user_role: 'System Administrator', permission_level: 'Administrator', justification_notes: 'PAM solution not yet implemented', reviewer_name: 'Security Architect' },
    { category: 'Documentation', document_type: 'Business Continuity Plan', missing_sections: 'Recovery Strategies, Testing Results', responsible_party: 'Business Continuity Manager', update_deadline: '2024-03-30' },
    { category: 'Documentation', document_type: 'Acceptable Use Policy', missing_sections: 'Social Media Guidelines, BYOD Policies', responsible_party: 'HR Department', update_deadline: '2024-04-20' },
    { category: 'Process Compliance', process_name: 'Security Training', gap_description: 'Annual security training completion rate only 65%', corrective_action: 'Implement mandatory training with tracking and escalation', verification_method: 'Training completion reports' },
    { category: 'Process Compliance', process_name: 'Third-Party Risk Management', gap_description: 'Annual vendor assessments not completed for 8 vendors', corrective_action: 'Establish vendor assessment schedule with automated reminders', verification_method: 'Vendor assessment tracking database' }
  ]
};

type ViolationCategory = 'Data Security' | 'Access Control' | 'Documentation' | 'Process Compliance';

type DataSecurityFields = {
  affected_system: string;
  encryption_status: string;
  remediation_owner: string;
  target_completion_date: string;
};

type AccessControlFields = {
  user_role: string;
  permission_level: string;
  justification_notes: string;
  reviewer_name: string;
};

type DocumentationFields = {
  document_type: string;
  missing_sections: string;
  responsible_party: string;
  update_deadline: string;
};

type ProcessComplianceFields = {
  process_name: string;
  gap_description: string;
  corrective_action: string;
  verification_method: string;
};

type Violation = {
  id: number;
  category: ViolationCategory;
  fields: DataSecurityFields | AccessControlFields | DocumentationFields | ProcessComplianceFields;
};

type AuditRecord = {
  id: number;
  reference: string;
  violations: Violation[];
  submittedAt: string;
};

const Task31: React.FC = () => {
  const [currentAuditRef, setCurrentAuditRef] = useState('');
  const [violations, setViolations] = useState<Violation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ViolationCategory | ''>('');
  const [submittedAudits, setSubmittedAudits] = useState<AuditRecord[]>([]);
  const [expandedAudit, setExpandedAudit] = useState<number | null>(null);
  
  // Form fields for current violation being added
  const [dataSecurityForm, setDataSecurityForm] = useState<DataSecurityFields>({
    affected_system: '',
    encryption_status: '',
    remediation_owner: '',
    target_completion_date: ''
  });
  
  const [accessControlForm, setAccessControlForm] = useState<AccessControlFields>({
    user_role: '',
    permission_level: '',
    justification_notes: '',
    reviewer_name: ''
  });
  
  const [documentationForm, setDocumentationForm] = useState<DocumentationFields>({
    document_type: '',
    missing_sections: '',
    responsible_party: '',
    update_deadline: ''
  });
  
  const [processComplianceForm, setProcessComplianceForm] = useState<ProcessComplianceFields>({
    process_name: '',
    gap_description: '',
    corrective_action: '',
    verification_method: ''
  });
  
  // Calculate category breakdown
  const getCategoryBreakdown = () => {
    const breakdown = {
      'Data Security': 0,
      'Access Control': 0,
      'Documentation': 0,
      'Process Compliance': 0
    };
    violations.forEach(v => {
      breakdown[v.category]++;
    });
    return breakdown;
  };
  
  // Expose cheat helper function (for testers)
  useEffect(() => {
    (window as any).fill_form = (violationIndex: number) => {
      const auditData = AUDIT_DATA[currentAuditRef as keyof typeof AUDIT_DATA];
      
      if (!auditData) {
        console.log(`[Cheat Helper] No data found for audit reference: ${currentAuditRef}. Available: AUD-2024-301, AUD-2024-302, AUD-2024-303`);
        return;
      }
      
      if (violationIndex < 0 || violationIndex > 7) {
        console.log(`[Cheat Helper] Invalid index ${violationIndex}. Use 0-7 for the 8 violations.`);
        return;
      }
      
      const violation = auditData[violationIndex];
      console.log(`[Cheat Helper] Filling form for violation ${violationIndex} (${violation.category})...`);
      
      // Open modal and set category
      setShowModal(true);
      setSelectedCategory(violation.category as ViolationCategory);
      
      // Fill the appropriate form based on category
      if (violation.category === 'Data Security') {
        setDataSecurityForm({
          affected_system: (violation as any).affected_system || '',
          encryption_status: (violation as any).encryption_status || '',
          remediation_owner: (violation as any).remediation_owner || '',
          target_completion_date: (violation as any).target_completion_date || ''
        });
      } else if (violation.category === 'Access Control') {
        setAccessControlForm({
          user_role: (violation as any).user_role || '',
          permission_level: (violation as any).permission_level || '',
          justification_notes: (violation as any).justification_notes || '',
          reviewer_name: (violation as any).reviewer_name || ''
        });
      } else if (violation.category === 'Documentation') {
        setDocumentationForm({
          document_type: (violation as any).document_type || '',
          missing_sections: (violation as any).missing_sections || '',
          responsible_party: (violation as any).responsible_party || '',
          update_deadline: (violation as any).update_deadline || ''
        });
      } else if (violation.category === 'Process Compliance') {
        setProcessComplianceForm({
          process_name: (violation as any).process_name || '',
          gap_description: (violation as any).gap_description || '',
          corrective_action: (violation as any).corrective_action || '',
          verification_method: (violation as any).verification_method || ''
        });
      }
      
      console.log(`[Cheat Helper] ✅ Form filled! Review the fields and click "Save Violation".`);
    };
    
    // Log available helper on first load
    if (currentAuditRef) {
      console.log(`[Cheat Helper] 🔧 Helper available! Use: window.fill_form(0) through window.fill_form(7) to auto-fill violation forms.`);
    }
    
    // Cleanup function
    return () => {
      delete (window as any).fill_form;
    };
  }, [currentAuditRef]);
  
  // Expose app state for testing and cheat system
  useEffect(() => {
    const breakdown = getCategoryBreakdown();
    (window as any).app_state = {
      currentAudit: currentAuditRef,
      violations: violations,
      violationsByCategory: breakdown,
      totalViolations: violations.length,
      submittedAudits: submittedAudits,
      modalOpen: showModal,
      selectedCategory: selectedCategory,
      // Include current form state for progressive cheat feedback
      currentFormState: {
        category: selectedCategory,
        dataSecurityFields: dataSecurityForm,
        accessControlFields: accessControlForm,
        documentationFields: documentationForm,
        processComplianceFields: processComplianceForm
      }
    };
    
    // [Cheat] system for human testers (for testers)
    // Progressive feedback even for incomplete entries
    const stateKey = JSON.stringify({
      auditRef: currentAuditRef,
      violationCount: violations.length,
      categoryBreakdown: breakdown,
      submittedCount: submittedAudits.length,
      modalOpen: showModal,
      selectedCat: selectedCategory
    });
    
    if (!(window as any)._cheatLoggedStates) {
      (window as any)._cheatLoggedStates = new Set();
    }
    
    if (!(window as any)._cheatLoggedStates.has(stateKey)) {
      (window as any)._cheatLoggedStates.add(stateKey);
      
      // Show modal form progress if open
      if (showModal) {
        if (!selectedCategory) {
          console.log(`[Cheat] 📝 Modal Open: Select a violation category to reveal form fields`);
        } else {
          console.log(`[Cheat] 📝 Modal Open: Category "${selectedCategory}" selected`);
          
          // Check which fields are filled for the selected category
          let fields: any = {};
          let fieldNames: string[] = [];
          
          if (selectedCategory === 'Data Security') {
            fields = dataSecurityForm;
            fieldNames = ['affected_system', 'encryption_status', 'remediation_owner', 'target_completion_date'];
          } else if (selectedCategory === 'Access Control') {
            fields = accessControlForm;
            fieldNames = ['user_role', 'permission_level', 'justification_notes', 'reviewer_name'];
          } else if (selectedCategory === 'Documentation') {
            fields = documentationForm;
            fieldNames = ['document_type', 'missing_sections', 'responsible_party', 'update_deadline'];
          } else if (selectedCategory === 'Process Compliance') {
            fields = processComplianceForm;
            fieldNames = ['process_name', 'gap_description', 'corrective_action', 'verification_method'];
          }
          
          const fieldStatus = fieldNames.map(name => ({
            Field: name,
            Status: fields[name]?.trim() ? '✅' : '❌ Empty'
          }));
          
          console.table(fieldStatus);
          
          const emptyFields = fieldNames.filter(name => !fields[name]?.trim());
          if (emptyFields.length > 0) {
            console.log(`[Cheat] Missing fields: ${emptyFields.join(', ')}`);
          } else {
            console.log(`[Cheat] ✅ All fields complete! Click "Save Violation" to add.`);
          }
        }
      }
      
      // Show progress for current audit
      if (currentAuditRef.trim()) {
        console.log(`[Cheat] Current Audit: ${currentAuditRef} - Violations: ${violations.length}/8`);
        
        if (violations.length > 0) {
          // Show category breakdown
          const categoryStatus: any[] = [];
          (['Data Security', 'Access Control', 'Documentation', 'Process Compliance'] as ViolationCategory[]).forEach(cat => {
            const count = breakdown[cat];
            const status = count === 2 ? '✅ Complete' : count < 2 ? `⚠️ Need ${2 - count} more` : `❌ Too many (${count}/2)`;
            categoryStatus.push({
              Category: cat,
              Count: `${count}/2`,
              Status: status
            });
          });
          console.table(categoryStatus);
          
          // Show next steps
          if (violations.length < 8) {
            const missingCategories = (['Data Security', 'Access Control', 'Documentation', 'Process Compliance'] as ViolationCategory[])
              .filter(cat => breakdown[cat] < 2);
            
            if (missingCategories.length > 0) {
              console.log(`[Cheat] Next: Add ${8 - violations.length} more violations. Focus on: ${missingCategories.slice(0, 2).join(', ')}`);
            }
          } else if (violations.length === 8) {
            const incorrectCategories = (['Data Security', 'Access Control', 'Documentation', 'Process Compliance'] as ViolationCategory[])
              .filter(cat => breakdown[cat] !== 2);
            
            if (incorrectCategories.length > 0) {
              console.log(`[Cheat] ⚠️ Have 8 violations but category distribution incorrect. Should be exactly 2 per category.`);
              console.log(`[Cheat] Fix categories: ${incorrectCategories.map(c => `${c} has ${breakdown[c]}`).join(', ')}`);
            } else {
              console.log(`[Cheat] ✅ All 8 violations with correct distribution! Click "Submit Audit" button.`);
            }
          }
        } else {
          console.log(`[Cheat] No violations added yet. Click "Add Violation" to start.`);
        }
      } else if (violations.length === 0 && submittedAudits.length === 0) {
        console.log(`[Cheat] 👋 Getting started: Enter audit reference (e.g., AUD-2024-301) in the input field above.`);
      }
      
      // Show overall progress across all audits
      if (submittedAudits.length > 0) {
        console.log(`[Cheat] 📊 Audits Completed: ${submittedAudits.length}/3`);
        
        if (submittedAudits.length < 3) {
          console.log(`[Cheat] Next: Complete ${3 - submittedAudits.length} more audit(s)`);
        } else {
          console.log(`[Cheat] 🎉 All 3 audits completed! Task should pass validation.`);
        }
      }
    }
  }, [currentAuditRef, violations, submittedAudits, showModal, selectedCategory, 
      dataSecurityForm, accessControlForm, documentationForm, processComplianceForm]);
  
  const handleAddViolation = () => {
    if (!selectedCategory) return;
    
    let fields: any = {};
    let isComplete = false;
    
    if (selectedCategory === 'Data Security') {
      fields = { ...dataSecurityForm };
      isComplete = Object.values(dataSecurityForm).every(val => val.trim() !== '');
    } else if (selectedCategory === 'Access Control') {
      fields = { ...accessControlForm };
      isComplete = Object.values(accessControlForm).every(val => val.trim() !== '');
    } else if (selectedCategory === 'Documentation') {
      fields = { ...documentationForm };
      isComplete = Object.values(documentationForm).every(val => val.trim() !== '');
    } else if (selectedCategory === 'Process Compliance') {
      fields = { ...processComplianceForm };
      isComplete = Object.values(processComplianceForm).every(val => val.trim() !== '');
    }
    
    if (!isComplete) return;
    
    const newViolation: Violation = {
      id: violations.length + 1,
      category: selectedCategory,
      fields: fields
    };
    
    setViolations([...violations, newViolation]);
    
    // Reset form and modal
    setSelectedCategory('');
    setDataSecurityForm({
      affected_system: '',
      encryption_status: '',
      remediation_owner: '',
      target_completion_date: ''
    });
    setAccessControlForm({
      user_role: '',
      permission_level: '',
      justification_notes: '',
      reviewer_name: ''
    });
    setDocumentationForm({
      document_type: '',
      missing_sections: '',
      responsible_party: '',
      update_deadline: ''
    });
    setProcessComplianceForm({
      process_name: '',
      gap_description: '',
      corrective_action: '',
      verification_method: ''
    });
    setShowModal(false);
  };
  
  const handleRemoveViolation = (id: number) => {
    setViolations(violations.filter(v => v.id !== id));
  };
  
  const handleSubmitAudit = () => {
    if (!currentAuditRef.trim() || violations.length !== 8) return;
    
    const newAudit: AuditRecord = {
      id: submittedAudits.length + 1,
      reference: currentAuditRef.trim(),
      violations: [...violations],
      submittedAt: new Date().toISOString()
    };
    
    setSubmittedAudits([...submittedAudits, newAudit]);
    
    // Reset form
    setCurrentAuditRef('');
    setViolations([]);
  };
  
  const getProgressColor = () => {
    const percentage = (violations.length / 8) * 100;
    if (percentage < 50) return '#ef4444'; // red
    if (percentage < 75) return '#eab308'; // yellow
    return '#22c55e'; // green
  };
  
  const getCategoryColor = (category: ViolationCategory) => {
    switch (category) {
      case 'Data Security': return 'bg-red-100 text-red-800 border-red-300';
      case 'Access Control': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Documentation': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Process Compliance': return 'bg-green-100 text-green-800 border-green-300';
    }
  };
  
  const getCategoryIcon = (category: ViolationCategory) => {
    switch (category) {
      case 'Data Security': return <Shield className="w-4 h-4" />;
      case 'Access Control': return <Lock className="w-4 h-4" />;
      case 'Documentation': return <BookOpen className="w-4 h-4" />;
      case 'Process Compliance': return <GitBranch className="w-4 h-4" />;
    }
  };
  
  const renderCategoryFields = () => {
    if (!selectedCategory) return null;
    
    if (selectedCategory === 'Data Security') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Affected System</label>
            <input
              type="text"
              value={dataSecurityForm.affected_system}
              onChange={(e) => setDataSecurityForm({ ...dataSecurityForm, affected_system: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Customer Database"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Encryption Status</label>
            <select
              value={dataSecurityForm.encryption_status}
              onChange={(e) => setDataSecurityForm({ ...dataSecurityForm, encryption_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select status</option>
              <option value="None">None</option>
              <option value="TLS 1.2">TLS 1.2</option>
              <option value="TLS 1.3">TLS 1.3</option>
              <option value="AES-256">AES-256</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remediation Owner</label>
            <input
              type="text"
              value={dataSecurityForm.remediation_owner}
              onChange={(e) => setDataSecurityForm({ ...dataSecurityForm, remediation_owner: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., IT Security Team"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Completion Date</label>
            <input
              type="date"
              value={dataSecurityForm.target_completion_date}
              onChange={(e) => setDataSecurityForm({ ...dataSecurityForm, target_completion_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );
    }
    
    if (selectedCategory === 'Access Control') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
            <input
              type="text"
              value={accessControlForm.user_role}
              onChange={(e) => setAccessControlForm({ ...accessControlForm, user_role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., External Contractor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permission Level</label>
            <select
              value={accessControlForm.permission_level}
              onChange={(e) => setAccessControlForm({ ...accessControlForm, permission_level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select level</option>
              <option value="Read Only">Read Only</option>
              <option value="Write Access">Write Access</option>
              <option value="Administrator">Administrator</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Justification Notes</label>
            <textarea
              value={accessControlForm.justification_notes}
              onChange={(e) => setAccessControlForm({ ...accessControlForm, justification_notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Temporary elevated access for migration project"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name</label>
            <input
              type="text"
              value={accessControlForm.reviewer_name}
              onChange={(e) => setAccessControlForm({ ...accessControlForm, reviewer_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Security Manager"
            />
          </div>
        </div>
      );
    }
    
    if (selectedCategory === 'Documentation') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <input
              type="text"
              value={documentationForm.document_type}
              onChange={(e) => setDocumentationForm({ ...documentationForm, document_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Disaster Recovery Plan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Missing Sections</label>
            <textarea
              value={documentationForm.missing_sections}
              onChange={(e) => setDocumentationForm({ ...documentationForm, missing_sections: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Recovery Time Objectives, Contact Lists"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsible Party</label>
            <input
              type="text"
              value={documentationForm.responsible_party}
              onChange={(e) => setDocumentationForm({ ...documentationForm, responsible_party: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., IT Operations"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Deadline</label>
            <input
              type="date"
              value={documentationForm.update_deadline}
              onChange={(e) => setDocumentationForm({ ...documentationForm, update_deadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );
    }
    
    if (selectedCategory === 'Process Compliance') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Process Name</label>
            <input
              type="text"
              value={processComplianceForm.process_name}
              onChange={(e) => setProcessComplianceForm({ ...processComplianceForm, process_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Change Management"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gap Description</label>
            <textarea
              value={processComplianceForm.gap_description}
              onChange={(e) => setProcessComplianceForm({ ...processComplianceForm, gap_description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Production deployment without CAB approval"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Corrective Action</label>
            <textarea
              value={processComplianceForm.corrective_action}
              onChange={(e) => setProcessComplianceForm({ ...processComplianceForm, corrective_action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Implement pre-deployment checklist automation"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Method</label>
            <input
              type="text"
              value={processComplianceForm.verification_method}
              onChange={(e) => setProcessComplianceForm({ ...processComplianceForm, verification_method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Audit log review"
            />
          </div>
        </div>
      );
    }
  };
  
  const renderViolationDetails = (violation: Violation) => {
    const fields = violation.fields;
    
    if (violation.category === 'Data Security') {
      const f = fields as DataSecurityFields;
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="font-medium">System:</span> {f.affected_system}</div>
          <div><span className="font-medium">Encryption:</span> {f.encryption_status}</div>
          <div><span className="font-medium">Owner:</span> {f.remediation_owner}</div>
          <div><span className="font-medium">Target:</span> {f.target_completion_date}</div>
        </div>
      );
    }
    
    if (violation.category === 'Access Control') {
      const f = fields as AccessControlFields;
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="font-medium">Role:</span> {f.user_role}</div>
          <div><span className="font-medium">Permission:</span> {f.permission_level}</div>
          <div className="col-span-2"><span className="font-medium">Justification:</span> {f.justification_notes}</div>
          <div><span className="font-medium">Reviewer:</span> {f.reviewer_name}</div>
        </div>
      );
    }
    
    if (violation.category === 'Documentation') {
      const f = fields as DocumentationFields;
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="font-medium">Type:</span> {f.document_type}</div>
          <div><span className="font-medium">Deadline:</span> {f.update_deadline}</div>
          <div className="col-span-2"><span className="font-medium">Missing:</span> {f.missing_sections}</div>
          <div><span className="font-medium">Responsible:</span> {f.responsible_party}</div>
        </div>
      );
    }
    
    if (violation.category === 'Process Compliance') {
      const f = fields as ProcessComplianceFields;
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="font-medium">Process:</span> {f.process_name}</div>
          <div><span className="font-medium">Verification:</span> {f.verification_method}</div>
          <div className="col-span-2"><span className="font-medium">Gap:</span> {f.gap_description}</div>
          <div className="col-span-2"><span className="font-medium">Action:</span> {f.corrective_action}</div>
        </div>
      );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Gap Remediation</h1>
          <p className="text-gray-600">Process audit violations and create remediation plans</p>
        </div>
        
        {/* Current Audit Input and Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Audit Reference</label>
              <input
                type="text"
                value={currentAuditRef}
                onChange={(e) => setCurrentAuditRef(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="AUD-2024-XXX"
              />
            </div>
            
            <div className="flex items-center justify-center" style={{ width: '160px', paddingTop: '4px' }}>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90" style={{ marginTop: '-31px', marginLeft: '26px' }}>
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={getProgressColor()}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(violations.length / 8) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-gray-900">{violations.length}/8</div>
                  <div className="text-xs text-gray-500">Violations</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Violation
            </button>
            
            <button
              onClick={handleSubmitAudit}
              disabled={violations.length !== 8 || !currentAuditRef.trim()}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                violations.length === 8 && currentAuditRef.trim()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Audit
            </button>
          </div>
        </div>
        
        {/* Category Breakdown */}
        {violations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="grid grid-cols-4 gap-4">
              {(['Data Security', 'Access Control', 'Documentation', 'Process Compliance'] as ViolationCategory[]).map(category => {
                const count = getCategoryBreakdown()[category];
                return (
                  <div key={category} className={`p-4 rounded-lg border-2 ${getCategoryColor(category)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium text-sm">{category}</span>
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Remediation Tracking Table */}
        {violations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Violations Tracked</h3>
            <div className="space-y-3">
              {violations.map(violation => (
                <div key={violation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(violation.category)}`}>
                        {getCategoryIcon(violation.category)}
                        {violation.category}
                      </span>
                      <span className="text-sm text-gray-500">Violation #{violation.id}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveViolation(violation.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {renderViolationDetails(violation)}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Submitted Audits */}
        {submittedAudits.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Records</h3>
            <div className="space-y-3">
              {submittedAudits.map(audit => {
                const breakdown = {
                  'Data Security': 0,
                  'Access Control': 0,
                  'Documentation': 0,
                  'Process Compliance': 0
                };
                audit.violations.forEach(v => {
                  breakdown[v.category]++;
                });
                
                return (
                  <div key={audit.id} className="border border-gray-200 rounded-lg">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedAudit(expandedAudit === audit.id ? null : audit.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-mono text-sm font-semibold text-gray-900">{audit.reference}</div>
                            <div className="text-xs text-gray-500">
                              Submitted: {new Date(audit.submittedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{audit.violations.length}</span> violations
                          </div>
                          <div className="flex gap-2">
                            {Object.entries(breakdown).map(([cat, count]) => (
                              count > 0 && (
                                <span key={cat} className={`px-2 py-1 rounded text-xs ${getCategoryColor(cat as ViolationCategory)}`}>
                                  {count}
                                </span>
                              )
                            ))}
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                    
                    {expandedAudit === audit.id && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="space-y-3">
                          {audit.violations.map(violation => (
                            <div key={violation.id} className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(violation.category)}`}>
                                  {getCategoryIcon(violation.category)}
                                  {violation.category}
                                </span>
                              </div>
                              {renderViolationDetails(violation)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Add Violation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add Violation</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCategory('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Violation Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ViolationCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  <option value="Data Security">Data Security</option>
                  <option value="Access Control">Access Control</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Process Compliance">Process Compliance</option>
                </select>
              </div>
              
              {renderCategoryFields()}
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedCategory('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddViolation}
                  disabled={!selectedCategory}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    selectedCategory
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save Violation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task31;

