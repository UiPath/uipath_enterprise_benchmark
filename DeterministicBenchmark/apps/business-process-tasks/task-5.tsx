import React, { useState, useEffect } from 'react';

// Generate 5 realistic email records with mixed personal/business content
const generateEmailRecords = () => {
  const emails = [
    {
      id: 1,
      subject: "Meeting Follow-up and Personal Update",
      from: "sarah.johnson@techcorp.com",
      date: "2024-01-15",
        content: `Hi Team,

Thanks for the great meeting yesterday. I wanted to follow up on the project timeline we discussed.

On a personal note, I'll be moving to a new apartment next month. My new address will be {{1234 Oak Street, Springfield, IL 62701|PII}}. You can reach me at my personal cell {{(555) 987-6543|PII}} if needed.

For business matters, please continue using my work phone {{(555) 123-4567|Not-PII}} or the main office line {{1-800-TECH-CORP|Not-PII}}.

Also, I've updated my emergency contact info - my husband's number is {{(555) 876-5432|PII}}.

Best regards,
Sarah Johnson
Senior Developer
TechCorp Solutions`
    },
    {
      id: 2,
      subject: "URGENT: Security Incident Report",
      from: "security@techcorp.com",
      date: "2024-01-16",
        content: `SECURITY ALERT - CONFIDENTIAL

Incident ID: SEC-2024-0016
Time: 14:30 PST
Location: Corporate Headquarters

We detected unauthorized access to employee records. The breach may have exposed personal information including SSNs and addresses.

Affected employees should monitor their credit reports. Contact our security team at {{(555) 911-SECURITY|Not-PII}} or email {{security@techcorp.com|Not-PII}}.

Personal data potentially compromised:
- Employee SSNs (format: XXX-XX-XXXX)
- Home addresses
- Personal phone numbers

Business systems remain secure. Continue using standard business contacts:
- IT Helpdesk: {{(555) 123-HELP|Not-PII}}
- Main Office: {{1-800-TECH-CORP|Not-PII}}
- Emergency Line: {{(555) 911-HELP|Not-PII}}

This is a confidential security matter. Do not forward this email.

Security Team
TechCorp Solutions`
    },
    {
      id: 3,
      subject: "Project Update and Family News",
      from: "emily.davis@startup.io",
      date: "2024-01-17",
        content: `Team Update & Personal News

Hey everyone! Hope you're all doing well. I wanted to share some updates with you.

PROJECT STATUS:
The new feature rollout is going smoothly. We've hit all our milestones and the beta testing feedback has been overwhelmingly positive. Great job team!

PERSONAL NEWS:
I have some exciting personal news to share - I'm getting married in March! 🎉 My fiancé and I found our dream house at {{456 Sunset Boulevard, Riverside, CA 92501|PII}} and we're moving in next week.

For any wedding-related questions or if you want to send congratulations, you can reach me at my personal number {{(555) 234-5678|PII}} or email {{emily.wedding2024@gmail.com|PII}}.

WORK CONTACTS:
For all work-related matters, please continue using:
- Office: {{1-800-STARTUP-1|Not-PII}}
- My work mobile: {{(555) 345-6789|Not-PII}}
- Business email: {{emily.davis@startup.io|Not-PII}}

I'll be taking a few days off for the move, but I'll be back and ready to tackle Q2 goals!

Cheers,
Emily
Product Manager & Soon-to-be Bride 💍`
    },
    {
      id: 4,
      subject: "Invoice #INV-2024-0018 - Payment Due",
      from: "billing@enterprise.com",
      date: "2024-01-18",
        content: `BUSINESS INVOICE NOTICE

Invoice Number: INV-2024-0018
Amount Due: $15,750.00
Due Date: February 18, 2024

This invoice is for professional services rendered to your company.

Billing Address:
{{789 Business Plaza, Suite 200, Corporate Center, NY 10001|Not-PII}}

Payment Methods:
- Wire Transfer: Contact our business line {{(555) 678-9012|Not-PII}}
- Credit Card: Call our business payment line {{(555) 789-0123|Not-PII}}
- Online: {{billing@enterprise.com|Not-PII}}

For business billing questions, contact:
David Wilson, VP of Operations
Business Direct: {{(555) 678-9012|Not-PII}}
Personal (for urgent matters only): {{david.wilson.personal@outlook.com|PII}}

Late payment fees may apply after due date.

Enterprise Solutions Inc.
Business Billing Department`
    },
    {
      id: 5,
      subject: "Re: Your Application Status",
      from: "hr@company.org",
      date: "2024-01-19",
        content: `Dear Applicant,

Thank you for your interest in the Software Engineer position at Company Solutions.

We have reviewed your application and would like to schedule an interview. Please confirm your availability for next week.

Your application details:
- Name: Lisa Anderson
- Address: {{987 Family Lane, Suburbia, TX 75001|PII}}
- Phone: {{(555) 890-1234|PII}}
- Email: {{lisa.anderson.mom@gmail.com|PII}}

Interview Details:
- Date: January 25, 2024
- Time: 2:00 PM CST
- Location: Company Solutions HQ
- Contact: {{(555) 901-2345|Not-PII}}

Please bring:
- Government-issued ID
- Resume
- References

We look forward to meeting you!

HR Department
Company Solutions
{{hr@company.org|Not-PII}}`
    }
  ];
  
  return emails.map((email) => ({
    ...email,
    status: 'pending' as const,
    redactedFields: [] as string[],
    isAnonymized: false,
    hasPII: false
  }));
};

// Inline classification pattern: {{value|PII}} or {{value|Not-PII}}
const inlineClassificationPattern = /\{\{([^}]+)\|(PII|Not-PII)\}\}/g;


const Task5: React.FC = () => {
  const [emails] = useState(() => generateEmailRecords());
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  // State for tracking redacted items: true=redacted, false=preserved, undefined=unset
  const [redactedItems, setRedactedItems] = useState<{[key: string]: boolean | undefined}>({});

  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      emails,
      selectedEmail,
      redactedItems,
      totalEmails: emails.length,
      totalRedacted: Object.keys(redactedItems).filter(key => redactedItems[key]).length
    };
  }, [emails, selectedEmail, redactedItems]);

  // Find PII items in email content using inline classification
  const findPIIInContent = (content: string) => {
    const items: any[] = [];
    let match;
    
    while ((match = inlineClassificationPattern.exec(content)) !== null) {
      const value = match[1];
      const classification = match[2];
      const isPersonal = classification === 'PII';
      
      items.push({
        type: isPersonal ? 'personal' : 'business',
        value: value,
        start: match.index,
        end: match.index + match[0].length,
        isPersonal: isPersonal,
        originalMatch: match[0] // Keep the full {{value|classification}} for replacement
      });
    }
    
    // Sort by position in text
    return items.sort((a, b) => a.start - b.start);
  };

  // Redact PII value with data type indication
  const redactValue = (value: string, type: string): string => {
    // Determine the actual data type based on the value pattern
    if (value.match(/\b\d{3}-\d{2}-\d{4}\b/)) {
      return '[SSN: XXX-XX-' + value.slice(-4) + ']';
    } else if (value.match(/\(\d{3}\) \d{3}-\d{4}/)) {
      return type === 'personal' ? '[PERSONAL-PHONE: XXX-XXX-' + value.slice(-4) + ']' : '[BUSINESS-PHONE: XXX-XXX-' + value.slice(-4) + ']';
    } else if (value.match(/1-800-[A-Z0-9-]+/)) {
      return '[BUSINESS-PHONE: 1-800-XXX-XXXX]';
    } else if (value.includes('@')) {
      const [local, domain] = value.split('@');
      return type === 'personal' ? '[PERSONAL-EMAIL: ' + local.slice(0, 2) + '***@' + domain + ']' : '[BUSINESS-EMAIL: ***@' + domain + ']';
    } else if (value.match(/\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Way|Place|Pl|Boulevard|Blvd|Court|Ct|Circle|Cir), [A-Za-z\s]+, [A-Z]{2}\s+\d{5}\b/)) {
      return type === 'personal' ? '[PERSONAL-ADDRESS: XXX ' + value.split(' ').slice(1).join(' ') + ']' : '[BUSINESS-ADDRESS: XXX ' + value.split(' ').slice(1).join(' ') + ']';
    } else if (value.match(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/)) {
      return '[CREDIT-CARD: XXXX-XXXX-XXXX-' + value.slice(-4) + ']';
    } else {
      return '[REDACTED: XXX]';
    }
  };

  // Set redaction state for a specific PII item
  const setPIIRedaction = (emailId: number, itemKey: string, shouldRedact: boolean) => {
    const key = `${emailId}_${itemKey}`;
    
    setRedactedItems(prev => ({
      ...prev,
      [key]: shouldRedact
    }));
    
    // Console log redaction action with correctness feedback for human developers
    const lastLoggedKey = `task5_redaction_${key}_${Date.now()}`;
    if (!(window as any)[lastLoggedKey]) {
      const email = emails.find(e => e.id === emailId);
      const piiItems = findPIIInContent(email?.content || '');
      const item = piiItems.find(i => `${i.type}_${i.start}_${i.end}` === itemKey);
      
      if (item) {
        const action = shouldRedact ? 'REDACTED' : 'PRESERVED';
        const isBusiness = classifyItemByContext(item, email?.content || '');
        const isCorrect = determineCorrectness(item, shouldRedact, email?.content || '');
        const correctness = isCorrect ? '✅ CORRECT' : '❌ INCORRECT';
        const classification = isBusiness ? 'Business' : 'Personal';
        
        console.log(`[Cheat] ${action}: "${item.value}" (${classification}) in email ${emailId} - ${correctness}`);
        
        if (!isCorrect) {
          const expectedAction = shouldRedact ? 'PRESERVE' : 'REDACT';
          console.log(`[Cheat] Expected: ${expectedAction} (${classification} should be ${isBusiness ? 'preserved' : 'redacted'})`);
        }
      }
      
      (window as any)[lastLoggedKey] = true;
    }
  };

  // Simple classification based on inline markers - no more convoluted logic!
  const classifyItemByContext = (item: any, emailContent: string): boolean => {
    // The classification is already determined by the inline {{value|PII}} or {{value|Not-PII}} markers
    return !item.isPersonal; // true = business, false = personal
  };

  // Determine if a redaction decision is correct based on context
  const determineCorrectness = (item: any, isRedacted: boolean, emailContent: string): boolean => {
    const isBusiness = classifyItemByContext(item, emailContent);
    
    // Check if the user's decision matches the context-based classification
    if (isBusiness) {
      return !isRedacted; // Business should be preserved
    } else {
      return isRedacted; // Personal should be redacted
    }
  };

  // Check if a PII item is redacted
  const isPIIRedacted = (emailId: number, itemKey: string): boolean => {
    const key = `${emailId}_${itemKey}`;
    return redactedItems[key] === true;
  };

  // Check if a PII item is preserved
  const isPIIPreserved = (emailId: number, itemKey: string): boolean => {
    const key = `${emailId}_${itemKey}`;
    return redactedItems[key] === false;
  };

  // Check if a PII item is unset
  const isPIIUnset = (emailId: number, itemKey: string): boolean => {
    const key = `${emailId}_${itemKey}`;
    return redactedItems[key] === undefined;
  };

  // Render email content with inline redaction buttons
  const renderEmailContent = (email: any) => {
    const content = email.content;
    const piiItems = findPIIInContent(content);
    
    if (piiItems.length === 0) {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    piiItems.forEach((item, index) => {
      // Add text before the PII item
      if (item.start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {content.slice(lastIndex, item.start)}
          </span>
        );
      }
      
      // Add the PII item with redaction controls
      const itemKey = `${item.type}_${item.start}_${item.end}`;
      const isRedacted = isPIIRedacted(email.id, itemKey);
      const displayValue = isRedacted ? redactValue(item.value, item.type) : item.value;
      
      parts.push(
        <span key={`pii-${index}`} className="inline-flex items-center gap-1">
          <span 
            className="px-1 rounded bg-blue-100 text-blue-800 border border-blue-200"
          >
            {displayValue}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setPIIRedaction(email.id, itemKey, false); // Preserve
              }}
              className={`px-2 py-1 rounded text-xs ${
                isPIIPreserved(email.id, itemKey)
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title="Preserve (keep visible)"
            >
              ✓ Not-PII
            </button>
            <button
              onClick={() => {
                setPIIRedaction(email.id, itemKey, true); // Redact
              }}
              className={`px-2 py-1 rounded text-xs ${
                isPIIRedacted(email.id, itemKey)
                  ? 'bg-red-100 text-red-700 border border-red-300' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title="Redact (hide)"
            >
              ✗ PII
            </button>
          </div>
        </span>
      );
      
      lastIndex = item.end;
    });
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end">
          {content.slice(lastIndex)}
        </span>
      );
    }
    
    return <div className="whitespace-pre-wrap">{parts}</div>;
  };


  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">Email Content Anonymization</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Email List */}
        <div className="w-1/4 bg-white border-r p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Email Documents</h3>
              <span className="text-sm text-gray-500">{emails.length} total</span>
            </div>
            
            <div className="space-y-2">
              {emails.map((email) => {
                const piiItems = findPIIInContent(email.content);
                const personalPII = piiItems.filter(item => item.isPersonal).length;
                const businessInfo = piiItems.filter(item => !item.isPersonal).length;
                
                return (
                  <div 
                    key={email.id} 
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="font-medium text-sm mb-1">{email.subject}</div>
                    <div className="text-xs text-gray-500 mb-2">{email.from}</div>
                    <div className="text-xs text-gray-500">{email.date}</div>
                    {piiItems.length > 0 && (
                      <div className="text-xs mt-2">
                        <div className="text-red-600">🔒 {personalPII} PII items</div>
                        <div className="text-blue-600">🏢 {businessInfo} business items</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Panel - Email Content */}
        <div className="flex-1 bg-white p-6">
          {!selectedEmail ? (
            <div className="text-center text-gray-500 py-8">
              Select an email document to review and redact PII
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h2>
                <div className="text-sm text-gray-600">
                  <div><strong>From:</strong> {selectedEmail.from}</div>
                  <div><strong>Date:</strong> {selectedEmail.date}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Email Content</h3>
                <div className="bg-white p-4 rounded border text-sm leading-relaxed">
                  {renderEmailContent(selectedEmail)}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>• <strong>Blue highlighted items</strong> are suspected PII or business information</div>
                  <div>• <strong>PII items</strong> (personal info) should typically be redacted</div>
                  <div>• <strong>Business items</strong> should typically be preserved</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1">
                <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-300 rounded text-xs">✓ Not-PII</span>
                <span>= Preserve (keep visible)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-300 rounded text-xs">✗ PII</span>
                <span>= Redact (hide)</span>
              </span>
            </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Summary */}
        <div className="w-1/4 bg-white border-l p-4">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Redaction Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>PII Items Found:</span>
                  <span className="font-medium text-red-600">
                    {emails.reduce((total, email) => total + findPIIInContent(email.content).filter(item => item.isPersonal).length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Business Items:</span>
                  <span className="font-medium text-blue-600">
                    {emails.reduce((total, email) => total + findPIIInContent(email.content).filter(item => !item.isPersonal).length, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task5;
