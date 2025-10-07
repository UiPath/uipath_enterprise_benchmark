import React, { useState, useEffect } from 'react';

// Task 27: Real Estate - Tenant Applications
// External Excel tenant files (source) → Document upload center with income verification widgets (target)

interface TenantApplication {
  applicantName: string;
  phoneContact: string;
  currentAddress: string;
  employmentStatus: string;
  monthlyIncome: number;
  rentalHistory: string;
  desiredMoveDate: string;
  referenceContact: string;
  documentTypes: string[]; // Array of uploaded document types
  incomeVerified: boolean;
  referenceVerified: boolean;
}

const Task27: React.FC = () => {
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  
  // Current form state
  const [applicantName, setApplicantName] = useState('');
  const [phoneContact, setPhoneContact] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [rentalHistory, setRentalHistory] = useState('');
  const [desiredMoveDate, setDesiredMoveDate] = useState('');
  const [referenceContact, setReferenceContact] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [incomeVerified, setIncomeVerified] = useState(false);
  const [referenceVerified, setReferenceVerified] = useState(false);
  
  // UI state
  const [showReferencePopup, setShowReferencePopup] = useState(false);
  const [showIncomeCalculator, setShowIncomeCalculator] = useState(false);
  const [calculatedIncome, setCalculatedIncome] = useState(0);
  
  // Available document types for upload
  const availableDocuments = [
    'Pay Stub',
    'Bank Statement',
    'Tax Return',
    'Business License',
    'Contract Agreement',
    'References',
    'Employment Letter',
    'Credit Report'
  ];

  // Expose app_state for testing
  useEffect(() => {
    const currentFormEntry = {
      applicantName: applicantName.trim(),
      phoneContact: phoneContact.trim(),
      currentAddress: currentAddress.trim(),
      employmentStatus: employmentStatus.trim(),
      monthlyIncome,
      rentalHistory: rentalHistory.trim(),
      desiredMoveDate: desiredMoveDate.trim(),
      referenceContact: referenceContact.trim(),
      documentTypes: uploadedDocuments,
      incomeVerified,
      referenceVerified
    };

    const formFieldsCompleted = {
      hasApplicantName: applicantName.trim().length > 0,
      hasPhoneContact: phoneContact.trim().length > 0,
      hasCurrentAddress: currentAddress.trim().length > 0,
      hasEmploymentStatus: employmentStatus.trim().length > 0,
      hasMonthlyIncome: monthlyIncome > 0,
      hasRentalHistory: rentalHistory.trim().length > 0,
      hasDesiredMoveDate: desiredMoveDate.trim().length > 0,
      hasReferenceContact: referenceContact.trim().length > 0,
      hasDocuments: uploadedDocuments.length > 0,
      hasIncomeVerified: incomeVerified,
      hasReferenceVerified: referenceVerified
    };

    (window as any).app_state = {
      applications,
      totalApplications: applications.length,
      currentFormEntry,
      formFieldsCompleted
    };
  }, [applications, applicantName, phoneContact, currentAddress, employmentStatus, monthlyIncome, rentalHistory, desiredMoveDate, referenceContact, uploadedDocuments, incomeVerified, referenceVerified]);

  const handleDocumentUpload = (docType: string) => {
    if (!uploadedDocuments.includes(docType)) {
      setUploadedDocuments([...uploadedDocuments, docType]);
    }
  };

  const handleRemoveDocument = (docType: string) => {
    setUploadedDocuments(uploadedDocuments.filter(d => d !== docType));
  };

  const handleVerifyIncome = () => {
    if (monthlyIncome > 0 && employmentStatus) {
      setIncomeVerified(true);
      setCalculatedIncome(monthlyIncome);
      setShowIncomeCalculator(false);
    }
  };

  const handleVerifyReference = () => {
    if (referenceContact.trim()) {
      setReferenceVerified(true);
      setShowReferencePopup(false);
    }
  };

  const handleSubmitApplication = () => {
    // Silent validation
    if (!applicantName.trim()) return;
    if (!phoneContact.trim()) return;
    if (!currentAddress.trim()) return;
    if (!employmentStatus.trim()) return;
    if (monthlyIncome <= 0) return;
    if (!rentalHistory.trim()) return;
    if (!desiredMoveDate.trim()) return;
    if (!referenceContact.trim()) return;
    if (uploadedDocuments.length === 0) return;

    const newApplication: TenantApplication = {
      applicantName: applicantName.trim(),
      phoneContact: phoneContact.trim(),
      currentAddress: currentAddress.trim(),
      employmentStatus: employmentStatus.trim(),
      monthlyIncome,
      rentalHistory: rentalHistory.trim(),
      desiredMoveDate: desiredMoveDate.trim(),
      referenceContact: referenceContact.trim(),
      documentTypes: [...uploadedDocuments],
      incomeVerified,
      referenceVerified
    };

    setApplications([...applications, newApplication]);

    // Reset form
    setApplicantName('');
    setPhoneContact('');
    setCurrentAddress('');
    setEmploymentStatus('');
    setMonthlyIncome(0);
    setRentalHistory('');
    setDesiredMoveDate('');
    setReferenceContact('');
    setUploadedDocuments([]);
    setIncomeVerified(false);
    setReferenceVerified(false);
    setCalculatedIncome(0);
  };

  const handleRemoveApplication = (index: number) => {
    setApplications(applications.filter((_, i) => i !== index));
  };

  // Credit score visualization (simplified - based on income and rental history)
  const getCreditScoreEstimate = () => {
    if (monthlyIncome === 0) return 0;
    let score = 600;
    if (monthlyIncome >= 5000) score += 100;
    else if (monthlyIncome >= 4000) score += 50;
    if (rentalHistory.toLowerCase().includes('excellent')) score += 50;
    else if (rentalHistory.toLowerCase().includes('good')) score += 25;
    return Math.min(score, 850);
  };

  const creditScore = getCreditScoreEstimate();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Tenant Application Portal</h2>

      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#34495e' }}>Application Form</h3>

          {/* Applicant Information */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Applicant Name
            </label>
            <input
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="Full name"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Phone Contact
            </label>
            <input
              type="text"
              value={phoneContact}
              onChange={(e) => setPhoneContact(e.target.value)}
              placeholder="Contact number"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Current Address
            </label>
            <input
              type="text"
              value={currentAddress}
              onChange={(e) => setCurrentAddress(e.target.value)}
              placeholder="Street, City, State ZIP"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Employment Status
            </label>
            <select
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Select status</option>
              <option value="Full-time Employee">Full-time Employee</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Contract Worker">Contract Worker</option>
              <option value="Part-time Employee">Part-time Employee</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Monthly Income ($)
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                value={monthlyIncome || ''}
                onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                placeholder="0"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={() => setShowIncomeCalculator(true)}
                style={{
                  padding: '8px 15px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📊 Calculator
              </button>
            </div>
            {incomeVerified && (
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#27ae60' }}>
                ✓ Income verified: ${calculatedIncome.toLocaleString()}/month
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Rental History
            </label>
            <input
              type="text"
              value={rentalHistory}
              onChange={(e) => setRentalHistory(e.target.value)}
              placeholder="Previous rental status"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Desired Move Date
            </label>
            <input
              type="text"
              value={desiredMoveDate}
              onChange={(e) => setDesiredMoveDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Reference Contact
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                value={referenceContact}
                onChange={(e) => setReferenceContact(e.target.value)}
                placeholder="Name and phone"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={() => setShowReferencePopup(true)}
                style={{
                  padding: '8px 15px',
                  background: '#9b59b6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📞 Verify
              </button>
            </div>
            {referenceVerified && (
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#27ae60' }}>
                ✓ Reference verified
              </div>
            )}
          </div>

          {/* Document Upload Center */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#34495e' }}>Document Upload Center</h3>
            
            <div style={{
              border: '2px dashed #bdc3c7',
              borderRadius: '8px',
              padding: '20px',
              background: '#ecf0f1',
              marginBottom: '15px'
            }}>
              <div style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '15px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Select documents to upload</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {availableDocuments.map(doc => (
                  <button
                    key={doc}
                    onClick={() => handleDocumentUpload(doc)}
                    disabled={uploadedDocuments.includes(doc)}
                    style={{
                      padding: '8px 12px',
                      background: uploadedDocuments.includes(doc) ? '#27ae60' : '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: uploadedDocuments.includes(doc) ? 'default' : 'pointer',
                      fontSize: '12px',
                      opacity: uploadedDocuments.includes(doc) ? 0.7 : 1
                    }}
                  >
                    {uploadedDocuments.includes(doc) ? '✓ ' : '+ '}{doc}
                  </button>
                ))}
              </div>
            </div>

            {/* Uploaded Documents List */}
            {uploadedDocuments.length > 0 && (
              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#34495e' }}>
                  Uploaded Documents ({uploadedDocuments.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uploadedDocuments.map(doc => (
                    <div
                      key={doc}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: '#e8f8f5',
                        borderRadius: '4px',
                        border: '1px solid #27ae60'
                      }}
                    >
                      <span style={{ fontSize: '13px', color: '#27ae60' }}>📄 {doc}</span>
                      <button
                        onClick={() => handleRemoveDocument(doc)}
                        style={{
                          padding: '4px 8px',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Credit Score Visualization */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#34495e' }}>Credit Assessment</h3>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '150px',
                height: '150px',
                margin: '0 auto 15px',
                borderRadius: '50%',
                background: `conic-gradient(
                  ${creditScore >= 700 ? '#27ae60' : creditScore >= 600 ? '#f39c12' : '#e74c3c'} ${(creditScore / 850) * 100}%,
                  #ecf0f1 ${(creditScore / 850) * 100}%
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {creditScore}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Estimated</div>
                </div>
              </div>

              <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                Range: 300-850
              </div>
              <div style={{
                marginTop: '10px',
                padding: '8px',
                background: creditScore >= 700 ? '#d5f4e6' : creditScore >= 600 ? '#fef5e7' : '#fadbd8',
                borderRadius: '4px',
                fontSize: '13px',
                color: creditScore >= 700 ? '#27ae60' : creditScore >= 600 ? '#f39c12' : '#e74c3c'
              }}>
                {creditScore >= 700 ? 'Excellent' : creditScore >= 600 ? 'Fair' : 'Poor'}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmitApplication}
            style={{
              width: '100%',
              padding: '12px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '20px'
            }}
          >
            ✓ Submit Application
          </button>
        </div>

      {/* Submitted Applications */}
      {applications.length > 0 && (
        <div style={{ marginTop: '30px', background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#34495e' }}>
            Submitted Applications ({applications.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {applications.map((app, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '15px',
                  background: '#fafafa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                      {app.applicantName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                      📞 {app.phoneContact}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveApplication(index)}
                    style={{
                      padding: '6px 12px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px' }}>
                  <div><strong>Address:</strong> {app.currentAddress}</div>
                  <div><strong>Employment:</strong> {app.employmentStatus}</div>
                  <div><strong>Income:</strong> ${app.monthlyIncome.toLocaleString()}/mo</div>
                  <div><strong>Rental History:</strong> {app.rentalHistory}</div>
                  <div><strong>Move Date:</strong> {app.desiredMoveDate}</div>
                  <div><strong>Reference:</strong> {app.referenceContact}</div>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {app.documentTypes.map(doc => (
                    <span
                      key={doc}
                      style={{
                        padding: '4px 8px',
                        background: '#3498db',
                        color: 'white',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    >
                      {doc}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  {app.incomeVerified && (
                    <span style={{ fontSize: '12px', color: '#27ae60' }}>✓ Income Verified</span>
                  )}
                  {app.referenceVerified && (
                    <span style={{ fontSize: '12px', color: '#27ae60' }}>✓ Reference Verified</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Income Calculator Popup */}
      {showIncomeCalculator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#34495e' }}>Income Verification Calculator</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Employment Type: {employmentStatus || 'Not selected'}
              </label>
              
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Monthly Income</label>
                <input
                  type="number"
                  value={monthlyIncome || ''}
                  onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #3498db',
                    borderRadius: '4px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {employmentStatus === 'Self-employed' && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '4px', fontSize: '13px' }}>
                  ℹ️ Self-employed applicants: Please provide average monthly income from tax returns
                </div>
              )}

              {employmentStatus === 'Contract Worker' && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#cfe2ff', borderRadius: '4px', fontSize: '13px' }}>
                  ℹ️ Contract workers: Please provide average monthly contract earnings
                </div>
              )}

              <div style={{ marginTop: '20px', padding: '15px', background: '#e8f8f5', borderRadius: '4px' }}>
                <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>Calculated Annual Income</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                  ${(monthlyIncome * 12).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleVerifyIncome}
                disabled={monthlyIncome <= 0 || !employmentStatus}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: (monthlyIncome <= 0 || !employmentStatus) ? '#bdc3c7' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (monthlyIncome <= 0 || !employmentStatus) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ✓ Verify Income
              </button>
              <button
                onClick={() => setShowIncomeCalculator(false)}
                style={{
                  padding: '12px 20px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reference Verification Popup */}
      {showReferencePopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#34495e' }}>Reference Verification System</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #dee2e6',
                marginBottom: '15px'
              }}>
                <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>Reference Contact</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>
                  {referenceContact || 'Not provided'}
                </div>
              </div>

              {referenceContact && (
                <div style={{
                  padding: '15px',
                  background: '#d1ecf1',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#0c5460'
                }}>
                  📞 Verification system will contact this reference to confirm rental history and character references.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleVerifyReference}
                disabled={!referenceContact.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: !referenceContact.trim() ? '#bdc3c7' : '#9b59b6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !referenceContact.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ✓ Verify Reference
              </button>
              <button
                onClick={() => setShowReferencePopup(false)}
                style={{
                  padding: '12px 20px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task27;
