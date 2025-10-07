import React, { useState, useEffect } from 'react';

interface LoanApplication {
  applicantFullName: string;
  ssnNumber: string;
  annualIncome: number;
  employmentType: string;
  loanAmountRequested: number;
  loanPurpose: string;
  creditScore: number;
  collateralDescription: string;
  monthlyObligations: number;
  debtToIncomeRatio: number;
  riskLevel: string;
  monthlyPayment: number;
  paymentScheduleGenerated: boolean;
}

interface CurrentFormEntry {
  applicantFullName: string;
  ssnNumber: string;
  annualIncome: string;
  employmentType: string;
  loanAmountRequested: string;
  loanPurpose: string;
  creditScore: string;
  collateralDescription: string;
  monthlyObligations: string;
}

interface FormFieldsCompleted {
  hasApplicantName: boolean;
  hasSSN: boolean;
  hasAnnualIncome: boolean;
  hasEmploymentType: boolean;
  hasLoanAmount: boolean;
  hasLoanPurpose: boolean;
  hasCreditScore: boolean;
  hasCollateral: boolean;
  hasMonthlyObligations: boolean;
}

export default function Task28() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  
  // Current form entry
  const [applicantFullName, setApplicantFullName] = useState('');
  const [ssnNumber, setSsnNumber] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [loanAmountRequested, setLoanAmountRequested] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
  const [monthlyObligations, setMonthlyObligations] = useState('');
  
  // Calculated fields
  const [debtToIncomeRatio, setDebtToIncomeRatio] = useState(0);
  const [riskLevel, setRiskLevel] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [paymentScheduleGenerated, setPaymentScheduleGenerated] = useState(false);

  // Calculate debt-to-income ratio
  const calculateDTI = () => {
    const income = parseFloat(annualIncome);
    const obligations = parseFloat(monthlyObligations);
    const loanPayment = monthlyPayment;
    
    if (income > 0) {
      const monthlyIncome = income / 12;
      const totalMonthlyDebt = obligations + loanPayment;
      const dti = (totalMonthlyDebt / monthlyIncome) * 100;
      setDebtToIncomeRatio(Math.round(dti * 100) / 100);
      return dti;
    }
    return 0;
  };

  // Calculate monthly payment (simple calculation)
  const calculatePayment = () => {
    const principal = parseFloat(loanAmountRequested);
    const rate = 0.065; // 6.5% annual interest
    const years = 5; // 5-year loan term
    
    if (principal > 0) {
      const monthlyRate = rate / 12;
      const numPayments = years * 12;
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      setMonthlyPayment(Math.round(payment * 100) / 100);
      return payment;
    }
    return 0;
  };

  // Assess risk level
  const assessRisk = () => {
    const score = parseInt(creditScore);
    const dti = debtToIncomeRatio;
    
    let risk = '';
    if (score >= 740 && dti < 36) {
      risk = 'Low Risk';
    } else if (score >= 670 && dti < 43) {
      risk = 'Medium Risk';
    } else {
      risk = 'High Risk';
    }
    setRiskLevel(risk);
  };

  // Generate payment schedule
  const generateSchedule = () => {
    if (monthlyPayment > 0) {
      setPaymentScheduleGenerated(true);
    }
  };

  // Check if loan amount is valid
  const isLoanAmountValid = () => {
    if (!loanAmountRequested) return false;
    const numValue = parseFloat(loanAmountRequested);
    return numValue >= 5000 && numValue <= 100000;
  };

  // Submit application
  const handleSubmit = () => {
    // Validation
    if (!applicantFullName.trim() || !ssnNumber.trim() || !annualIncome || !employmentType ||
        !loanAmountRequested || !loanPurpose || !creditScore || !collateralDescription.trim() ||
        !monthlyObligations) {
      return;
    }

    // Check loan amount is valid
    if (!isLoanAmountValid()) {
      return;
    }

    if (!riskLevel || monthlyPayment === 0 || !paymentScheduleGenerated) {
      return;
    }

    const newApplication: LoanApplication = {
      applicantFullName: applicantFullName.trim(),
      ssnNumber: ssnNumber.trim(),
      annualIncome: parseFloat(annualIncome),
      employmentType: employmentType,
      loanAmountRequested: parseFloat(loanAmountRequested),
      loanPurpose: loanPurpose,
      creditScore: parseInt(creditScore),
      collateralDescription: collateralDescription.trim(),
      monthlyObligations: parseFloat(monthlyObligations),
      debtToIncomeRatio: debtToIncomeRatio,
      riskLevel: riskLevel,
      monthlyPayment: monthlyPayment,
      paymentScheduleGenerated: paymentScheduleGenerated
    };

    setApplications([...applications, newApplication]);

    // Reset form
    setApplicantFullName('');
    setSsnNumber('');
    setAnnualIncome('');
    setEmploymentType('');
    setLoanAmountRequested('');
    setLoanPurpose('');
    setCreditScore('');
    setCollateralDescription('');
    setMonthlyObligations('');
    setDebtToIncomeRatio(0);
    setRiskLevel('');
    setMonthlyPayment(0);
    setPaymentScheduleGenerated(false);
  };

  // Remove application
  const removeApplication = (index: number) => {
    setApplications(applications.filter((_, i) => i !== index));
  };

  // Expose app state for testing
  useEffect(() => {
    const currentFormEntry: CurrentFormEntry = {
      applicantFullName,
      ssnNumber,
      annualIncome,
      employmentType,
      loanAmountRequested,
      loanPurpose,
      creditScore,
      collateralDescription,
      monthlyObligations
    };

    const formFieldsCompleted: FormFieldsCompleted = {
      hasApplicantName: applicantFullName.trim().length > 0,
      hasSSN: ssnNumber.trim().length > 0,
      hasAnnualIncome: annualIncome.length > 0,
      hasEmploymentType: employmentType.length > 0,
      hasLoanAmount: loanAmountRequested.length > 0,
      hasLoanPurpose: loanPurpose.length > 0,
      hasCreditScore: creditScore.length > 0,
      hasCollateral: collateralDescription.trim().length > 0,
      hasMonthlyObligations: monthlyObligations.length > 0
    };

    (window as any).app_state = {
      applications,
      currentFormEntry,
      formFieldsCompleted,
      totalApplications: applications.length
    };
  }, [applications, applicantFullName, ssnNumber, annualIncome, employmentType, 
      loanAmountRequested, loanPurpose, creditScore, collateralDescription, monthlyObligations]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Application Form */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <h2 style={{ marginTop: 0, color: '#2c3e50', fontSize: '24px', marginBottom: '25px' }}>Loan Application Form</h2>
        
        {/* Personal Information */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', color: '#495057', marginBottom: '15px', borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>Personal Information</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>Applicant Full Name</label>
            <input
              type="text"
              value={applicantFullName}
              onChange={(e) => setApplicantFullName(e.target.value)}
              placeholder="Full legal name"
              style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>SSN</label>
            <input
              type="text"
              value={ssnNumber}
              onChange={(e) => setSsnNumber(e.target.value)}
              placeholder="Social Security Number"
              style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>Annual Income</label>
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="Yearly income"
                style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
              >
                <option value="">Select type</option>
                <option value="Salaried Employee">Salaried Employee</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Contract Employee">Contract Employee</option>
                <option value="Hourly Employee">Hourly Employee</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>Monthly Obligations</label>
            <input
              type="number"
              value={monthlyObligations}
              onChange={(e) => setMonthlyObligations(e.target.value)}
              placeholder="Current monthly debt payments"
              style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>Credit Score</label>
            <input
              type="number"
              value={creditScore}
              onChange={(e) => setCreditScore(e.target.value)}
              placeholder="300-850"
              min="300"
              max="850"
              style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Loan Details */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', color: '#495057', marginBottom: '15px', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>Loan Details</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>
              Loan Amount Requested
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', alignItems: 'flex-start' }}>
              <div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="1000"
                  value={loanAmountRequested && isLoanAmountValid() ? loanAmountRequested : 5000}
                  onChange={(e) => setLoanAmountRequested(e.target.value)}
                  style={{ width: '100%', height: '8px', borderRadius: '5px', outline: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                  <span>$5,000</span>
                  <span>$100,000</span>
                </div>
              </div>
              <div>
                <input
                  type="number"
                  value={loanAmountRequested}
                  onChange={(e) => setLoanAmountRequested(e.target.value)}
                  placeholder="Amount"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: `2px solid ${loanAmountRequested && !isLoanAmountValid() ? '#dc3545' : '#007bff'}`, 
                    borderRadius: '4px', 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: loanAmountRequested && !isLoanAmountValid() ? '#dc3545' : '#007bff',
                    textAlign: 'right'
                  }}
                />
                <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '3px', textAlign: 'right' }}>USD</div>
                {loanAmountRequested && !isLoanAmountValid() && (
                  <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '5px', textAlign: 'right', fontWeight: 'bold' }}>
                    Must be between $5,000 and $100,000
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>Loan Purpose</label>
            <select
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="">Select purpose</option>
              <option value="Home Improvement">Home Improvement</option>
              <option value="Debt Consolidation">Debt Consolidation</option>
              <option value="Medical Expenses">Medical Expenses</option>
              <option value="Business Investment">Business Investment</option>
              <option value="Education">Education</option>
              <option value="Vehicle Purchase">Vehicle Purchase</option>
            </select>
          </div>
        </div>

        {/* Collateral */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', color: '#495057', marginBottom: '15px', borderBottom: '2px solid #ffc107', paddingBottom: '5px' }}>Collateral Information</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>Collateral Description</label>
            <input
              type="text"
              value={collateralDescription}
              onChange={(e) => setCollateralDescription(e.target.value)}
              placeholder="Describe collateral asset"
              style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Calculator Widgets */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', color: '#495057', marginBottom: '15px', borderBottom: '2px solid #6f42c1', paddingBottom: '5px' }}>Loan Calculations</h3>
          
          {/* Loan Calculator */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0, fontSize: '16px', color: '#2c3e50', marginBottom: '12px' }}>💰 Loan Calculator</h4>
            
            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '5px' }}>Loan Amount</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                ${loanAmountRequested ? parseFloat(loanAmountRequested).toLocaleString() : '0'}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: '#495057', marginBottom: '8px' }}>
                Interest Rate: <span style={{ fontWeight: 'bold' }}>6.5%</span> | 
                Term: <span style={{ fontWeight: 'bold' }}>5 years</span>
              </div>
              <button
                onClick={calculatePayment}
                disabled={!loanAmountRequested || parseFloat(loanAmountRequested) === 0}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: loanAmountRequested && parseFloat(loanAmountRequested) > 0 ? '#007bff' : '#ced4da',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: loanAmountRequested && parseFloat(loanAmountRequested) > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                Calculate Monthly Payment
              </button>
            </div>

            {monthlyPayment > 0 && (
              <div style={{ padding: '12px', backgroundColor: '#d4edda', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
                <div style={{ fontSize: '13px', color: '#155724', marginBottom: '5px' }}>Monthly Payment</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#155724' }}>
                  ${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            )}
          </div>

          {/* Debt-to-Income Calculator */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0, fontSize: '16px', color: '#2c3e50', marginBottom: '12px' }}>📊 Debt-to-Income Ratio</h4>
            
            <button
              onClick={calculateDTI}
              disabled={!annualIncome || !monthlyObligations || monthlyPayment === 0}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: annualIncome && monthlyObligations && monthlyPayment > 0 ? '#17a2b8' : '#ced4da',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: annualIncome && monthlyObligations && monthlyPayment > 0 ? 'pointer' : 'not-allowed',
                marginBottom: '12px'
              }}
            >
              Calculate DTI Ratio
            </button>

            {debtToIncomeRatio > 0 && (
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '5px' }}>DTI Ratio</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: debtToIncomeRatio < 36 ? '#28a745' : debtToIncomeRatio < 43 ? '#ffc107' : '#dc3545' }}>
                  {debtToIncomeRatio.toFixed(2)}%
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                  {debtToIncomeRatio < 36 ? '✓ Excellent' : debtToIncomeRatio < 43 ? '⚠ Acceptable' : '✗ High Risk'}
                </div>
              </div>
            )}
          </div>

          {/* Risk Assessment */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0, fontSize: '16px', color: '#2c3e50', marginBottom: '12px' }}>⚠️ Risk Assessment</h4>
            
            <button
              onClick={assessRisk}
              disabled={!creditScore || debtToIncomeRatio === 0}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: creditScore && debtToIncomeRatio > 0 ? '#ffc107' : '#ced4da',
                color: creditScore && debtToIncomeRatio > 0 ? '#000' : '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: creditScore && debtToIncomeRatio > 0 ? 'pointer' : 'not-allowed',
                marginBottom: '12px'
              }}
            >
              Assess Risk Level
            </button>

            {riskLevel && (
              <div>
                <div style={{ 
                  padding: '18px', 
                  backgroundColor: riskLevel === 'Low Risk' ? '#d4edda' : riskLevel === 'Medium Risk' ? '#fff3cd' : '#f8d7da',
                  borderRadius: '6px',
                  border: `2px solid ${riskLevel === 'Low Risk' ? '#28a745' : riskLevel === 'Medium Risk' ? '#ffc107' : '#dc3545'}`,
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>
                    {riskLevel === 'Low Risk' ? '🟢' : riskLevel === 'Medium Risk' ? '🟡' : '🔴'}
                  </div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    color: riskLevel === 'Low Risk' ? '#155724' : riskLevel === 'Medium Risk' ? '#856404' : '#721c24'
                  }}>
                    {riskLevel}
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.6' }}>
                  <div><strong>Credit Score:</strong> {creditScore}</div>
                  <div><strong>DTI Ratio:</strong> {debtToIncomeRatio.toFixed(2)}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Schedule Generator */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h4 style={{ marginTop: 0, fontSize: '16px', color: '#2c3e50', marginBottom: '12px' }}>📅 Payment Schedule</h4>
            
            <button
              onClick={generateSchedule}
              disabled={monthlyPayment === 0}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: monthlyPayment > 0 ? '#6f42c1' : '#ced4da',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: monthlyPayment > 0 ? 'pointer' : 'not-allowed',
                marginBottom: '12px'
              }}
            >
              Generate Payment Schedule
            </button>

            {paymentScheduleGenerated && (
              <div style={{ padding: '12px', backgroundColor: '#e7e8ff', borderRadius: '6px', border: '1px solid #b8b9ff' }}>
                <div style={{ fontSize: '13px', color: '#4a4a9f', marginBottom: '8px', fontWeight: 'bold' }}>
                  ✓ Schedule Generated
                </div>
                <div style={{ fontSize: '12px', color: '#4a4a9f', lineHeight: '1.6' }}>
                  <div>60 monthly payments of ${monthlyPayment.toFixed(2)}</div>
                  <div>Total amount: ${(monthlyPayment * 60).toFixed(2)}</div>
                  <div>Total interest: ${((monthlyPayment * 60) - parseFloat(loanAmountRequested || '0')).toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ✓ Submit Application
        </button>
      </div>

      {/* Submitted Applications */}
      {applications.length > 0 && (
        <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h2 style={{ marginTop: 0, fontSize: '20px', color: '#2c3e50', marginBottom: '20px' }}>Submitted Applications ({applications.length})</h2>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {applications.map((app, index) => (
              <div key={index} style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>{app.applicantFullName}</div>
                    <div style={{ fontSize: '13px', color: '#6c757d', fontFamily: 'monospace' }}>SSN: {app.ssnNumber}</div>
                  </div>
                  <button
                    onClick={() => removeApplication(index)}
                    style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '20px', padding: '0 8px' }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>Annual Income</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>${app.annualIncome.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>Employment</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>{app.employmentType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>Credit Score</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>{app.creditScore}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>Loan Amount</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>${app.loanAmountRequested.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>Purpose</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>{app.loanPurpose}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>Monthly Obligations</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>${app.monthlyObligations.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>Collateral</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>{app.collateralDescription}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', padding: '15px', backgroundColor: '#fff', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>Monthly Payment</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>${app.monthlyPayment.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>DTI Ratio</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: app.debtToIncomeRatio < 36 ? '#28a745' : app.debtToIncomeRatio < 43 ? '#ffc107' : '#dc3545' }}>
                      {app.debtToIncomeRatio.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>Risk Level</div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      color: app.riskLevel === 'Low Risk' ? '#28a745' : app.riskLevel === 'Medium Risk' ? '#ffc107' : '#dc3545'
                    }}>
                      {app.riskLevel}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '3px' }}>Schedule</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: app.paymentScheduleGenerated ? '#28a745' : '#dc3545' }}>
                      {app.paymentScheduleGenerated ? '✓ Generated' : '✗ Not Generated'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
