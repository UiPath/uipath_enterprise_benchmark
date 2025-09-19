import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, AlertTriangle, Merge } from 'lucide-react';

// Generate 6 customer records to create 5 specific comparisons
const generateCustomerRecords = () => {
  const customers = [
    // Group 1: John Smith (3 variations that map to 1)
    { name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567', address: '123 Main St, Anytown, ST 12345' },
    { name: 'J. Smith', email: 'j.smith@email.com', phone: '(555) 123-4567', address: '123 Main St, Anytown, ST 12345' },
    { name: 'Smith, John', email: 'john.smith@email.com', phone: '(555) 123-4567', address: '123 Main St, Anytown, ST 12345' },
    
    // Group 2: Sarah Johnson (2 variations that map to 1)
    { name: 'Sarah Johnson', email: 'sarah.johnson@company.com', phone: '(555) 234-5678', address: '456 Oak Ave, Cityville, ST 12346' },
    { name: 'S. Johnson', email: 'sarah.j@company.com', phone: '(555) 234-5678', address: '456 Oak Ave, Cityville, ST 12346' },
    
    // Group 3: Joshua Smith (1 variation that maps to 1 - no duplicates, but similar to John Smith for increased difficulty)
    { name: 'Joshua Smith', email: 'joshua.smith@email.com', phone: '(555) 345-6789', address: '789 Pine Rd, Townsville, ST 12347' }
  ];
  
  return customers.map((customer, index) => ({
    id: index + 1,
    ...customer,
    status: 'unprocessed' as const,
    confidence: 0,
    matchedWith: null as number | null,
    isDuplicate: false,
    isMerged: false
  }));
};

// Fuzzy matching algorithm
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  // Check for initials match (e.g., "J. Smith" vs "John Smith")
  const initials1 = s1.split(' ').map(word => word.charAt(0)).join('');
  const initials2 = s2.split(' ').map(word => word.charAt(0)).join('');
  if (initials1 === initials2 && initials1.length > 1) return 0.8;
  
  // Check for reverse order (e.g., "Smith, John" vs "John Smith")
  const words1 = s1.split(' ');
  const words2 = s2.split(' ');
  if (words1.length === 2 && words2.length === 2) {
    if (words1[0] === words2[1] && words1[1] === words2[0]) return 0.9;
  }
  
  // Check for nickname matches
  const nicknames: { [key: string]: string[] } = {
    'john': ['j', 'johnny'],
    'michael': ['mike', 'm'],
    'david': ['dave', 'd'],
    'jessica': ['jess', 'j'],
    'christopher': ['chris', 'c'],
    'ashley': ['ash', 'a'],
    'matthew': ['matt', 'm'],
    'amanda': ['amy', 'a'],
    'joshua': ['josh', 'j'],
    'melissa': ['mel', 'm'],
    'andrew': ['andy', 'a'],
    'stephanie': ['steph', 's'],
    'daniel': ['dan', 'd']
  };
  
  for (const [full, nicks] of Object.entries(nicknames)) {
    if ((s1.includes(full) && nicks.some(nick => s2.includes(nick))) ||
        (s2.includes(full) && nicks.some(nick => s1.includes(nick)))) {
      return 0.85;
    }
  }
  
  // Simple Levenshtein distance
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - (distance / maxLength);
};

const Task4: React.FC = () => {
  const [customers] = useState(() => generateCustomerRecords());
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [mergedCustomers, setMergedCustomers] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      customers,
      potentialMatches,
      mergedCustomers,
      analysisComplete,
      totalCustomers: customers.length,
      totalMatches: potentialMatches.length,
      totalMerged: mergedCustomers.length
    };
  }, [customers, potentialMatches, mergedCustomers, analysisComplete]);

  // Find potential matches
  const findPotentialMatches = () => {
    // Hardcoded matches for CU testing - mixed order for natural flow
    const matches = [
      {
        id: 1,
        customer1: { ...customers[0], index: 0 }, // John Smith
        customer2: { ...customers[1], index: 1 }, // J. Smith
        confidence: 0.89,
        nameSimilarity: 0.9,
        emailSimilarity: 0.8,
        phoneSimilarity: 1.0,
        addressSimilarity: 1.0,
        status: 'pending'
      },
      {
        id: 2,
        customer1: { ...customers[0], index: 0 }, // John Smith
        customer2: { ...customers[5], index: 5 }, // Joshua Smith
        confidence: 0.61,
        nameSimilarity: 0.7,
        emailSimilarity: 0.8,
        phoneSimilarity: 0.0,
        addressSimilarity: 0.0,
        status: 'pending'
      },
      {
        id: 3,
        customer1: { ...customers[3], index: 3 }, // Sarah Johnson
        customer2: { ...customers[4], index: 4 }, // S. Johnson
        confidence: 0.89,
        nameSimilarity: 0.9,
        emailSimilarity: 0.8,
        phoneSimilarity: 1.0,
        addressSimilarity: 1.0,
        status: 'pending'
      },
      {
        id: 4,
        customer1: { ...customers[0], index: 0 }, // John Smith
        customer2: { ...customers[2], index: 2 }, // Smith, John
        confidence: 0.94,
        nameSimilarity: 0.95,
        emailSimilarity: 1.0,
        phoneSimilarity: 1.0,
        addressSimilarity: 1.0,
        status: 'pending'
      },
      {
        id: 5,
        customer1: { ...customers[3], index: 3 }, // Sarah Johnson
        customer2: { ...customers[5], index: 5 }, // Joshua Smith
        confidence: 0.45,
        nameSimilarity: 0.3,
        emailSimilarity: 0.4,
        phoneSimilarity: 0.0,
        addressSimilarity: 0.0,
        status: 'pending'
      }
    ];
    
    setPotentialMatches(matches);
    setAnalysisComplete(true);
    
    // Console log next 3 potential matches for human developers (only once)
    if (matches.length > 0) {
      const lastLoggedKey = 'task4_matches_' + matches.length;
      if (!(window as any)[lastLoggedKey]) {
        console.log(`[Cheat] Next 3 potential matches to review:`);
        matches.slice(0, 3).forEach((match: any, index: number) => {
          console.log(`[Cheat] ${index + 1}. "${match.customer1.name}" vs "${match.customer2.name}" (${Math.round(match.confidence * 100)}% confidence)`);
          console.log(`[Cheat]    Phone: ${match.customer1.phone} vs ${match.customer2.phone} (${match.phoneSimilarity === 1 ? 'MATCH' : 'DIFFERENT'})`);
          console.log(`[Cheat]    Email: ${match.customer1.email} vs ${match.customer2.email}`);
        });
        if (matches.length > 3) {
          console.log(`[Cheat] ... and ${matches.length - 3} more potential matches`);
        }
        (window as any)[lastLoggedKey] = true;
      }
    }
  };

  const selectMatch = (match: any) => {
    setSelectedMatch(match);
    setShowComparison(true);
  };

  const mergeCustomers = (match: any, primaryIndex: number) => {
    const primary = primaryIndex === 1 ? match.customer1 : match.customer2;
    const secondary = primaryIndex === 1 ? match.customer2 : match.customer1;
    
    const mergedCustomer = {
      ...primary,
      id: mergedCustomers.length + 1,
      originalIds: [primary.id, secondary.id],
      mergedFrom: [primary.name, secondary.name],
      status: 'merged' as const,
      mergedAt: new Date().toISOString()
    };
    
    setMergedCustomers(prev => [...prev, mergedCustomer]);
    
    // Update match status
    setPotentialMatches(prev => 
      prev.map(m => 
        m.id === match.id ? { ...m, status: 'merged', primaryIndex } : m
      )
    );
    
    setShowComparison(false);
    setSelectedMatch(null);
    
    // Console log merge confirmation for human developers
    const lastLoggedKey = `task4_merge_${match.id}_${Date.now()}`;
    if (!(window as any)[lastLoggedKey]) {
      console.log(`[Cheat] Merge SUCCESS: "${primary.name}" (primary) + "${secondary.name}" → merged customer`);
      console.log(`[Cheat] Primary: ${primary.name} (${primary.email}, ${primary.phone})`);
      console.log(`[Cheat] Secondary: ${secondary.name} (${secondary.email}, ${secondary.phone})`);
      (window as any)[lastLoggedKey] = true;
    }
  };

  const markAsNotMatch = (match: any) => {
    setPotentialMatches(prev => 
      prev.map(m => 
        m.id === match.id ? { ...m, status: 'not_match' } : m
      )
    );
    
    setShowComparison(false);
    setSelectedMatch(null);
    
    // Console log not-match confirmation for human developers
    const lastLoggedKey = `task4_notmatch_${match.id}_${Date.now()}`;
    if (!(window as any)[lastLoggedKey]) {
      console.log(`[Cheat] Not Match: "${match.customer1.name}" vs "${match.customer2.name}" marked as different people`);
      (window as any)[lastLoggedKey] = true;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'merged':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'not_match':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <div className="h-4 w-4 border border-gray-300 rounded" />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">Customer Database - Duplicate Detection</h1>
        <p className="text-gray-600 mt-1">Identify and merge duplicate customer records with name variations</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Customer List */}
        <div className="w-1/3 bg-white border-r p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Customer Records</h3>
              <span className="text-sm text-gray-500">{customers.length} total</span>
            </div>
            
            {!analysisComplete && (
              <button
                onClick={findPotentialMatches}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Users className="h-4 w-4" />
                Analyze for Duplicates
              </button>
            )}
            
            {analysisComplete && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Analysis Results</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Potential Matches:</span>
                    <span className="font-medium">{potentialMatches.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Merged Records:</span>
                    <span className="font-medium text-green-600">{mergedCustomers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Not Matches:</span>
                    <span className="font-medium text-red-600">
                      {potentialMatches.filter(m => m.status === 'not_match').length}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {customers.map((customer) => (
                <div key={customer.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="font-medium text-sm">{customer.name}</div>
                  <div className="text-xs text-gray-500">{customer.email}</div>
                  <div className="text-xs text-gray-500">{customer.phone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Potential Matches */}
        <div className="w-1/3 bg-white border-r p-6">
          <h3 className="text-lg font-semibold mb-4">Potential Matches</h3>
          
          {!analysisComplete ? (
            <div className="text-center text-gray-500 py-8">
              Click "Analyze for Duplicates" to find potential matches
            </div>
          ) : potentialMatches.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No potential matches found
            </div>
          ) : (
            <div className="space-y-3">
              {potentialMatches.map((match) => (
                <div 
                  key={match.id} 
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    match.status === 'merged' ? 'bg-green-50 border-green-200' :
                    match.status === 'not_match' ? 'bg-red-50 border-red-200' : 'border-gray-200'
                  }`}
                  onClick={() => match.status === 'pending' && selectMatch(match)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(match.status)}
                      <span className="font-medium text-sm">Match #{match.id}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(match.confidence)}`}>
                      {Math.round(match.confidence * 100)}%
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{match.customer1.name}</div>
                    <div className="font-medium">{match.customer2.name}</div>
                    <div className="text-xs text-gray-500">
                      Phone: {match.phoneSimilarity === 1 ? '✓ Match' : '✗ Different'} | 
                      Email: {match.emailSimilarity > 0.8 ? '✓ Similar' : '✗ Different'}
                    </div>
                  </div>
                  
                  {match.status === 'pending' && (
                    <div className="mt-2 text-xs text-blue-600">
                      Click to review and merge
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Comparison & Actions */}
        <div className="w-1/3 bg-white p-6">
          {!showComparison ? (
            <div className="text-center text-gray-500 py-8">
              Select a potential match to review
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Match Comparison</h3>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(selectedMatch.confidence)}`}>
                    {Math.round(selectedMatch.confidence * 100)}% Confidence
                  </span>
                </div>
                
                <div className="space-y-4">
                  {/* Customer 1 */}
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="radio" 
                        name="primary" 
                        value="1" 
                        defaultChecked
                        className="text-blue-600"
                      />
                      <span className="font-medium text-sm">Customer 1</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Name:</strong> {selectedMatch.customer1.name}</div>
                      <div><strong>Email:</strong> {selectedMatch.customer1.email}</div>
                      <div><strong>Phone:</strong> {selectedMatch.customer1.phone}</div>
                      <div><strong>Address:</strong> {selectedMatch.customer1.address}</div>
                    </div>
                  </div>
                  
                  {/* Customer 2 */}
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="radio" 
                        name="primary" 
                        value="2"
                        className="text-blue-600"
                      />
                      <span className="font-medium text-sm">Customer 2</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Name:</strong> {selectedMatch.customer2.name}</div>
                      <div><strong>Email:</strong> {selectedMatch.customer2.email}</div>
                      <div><strong>Phone:</strong> {selectedMatch.customer2.phone}</div>
                      <div><strong>Address:</strong> {selectedMatch.customer2.address}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const primary = (document.querySelector('input[name="primary"]:checked') as HTMLInputElement)?.value;
                    mergeCustomers(selectedMatch, parseInt(primary || '1'));
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  <Merge className="h-4 w-4" />
                  Merge Records
                </button>
                
                <button
                  onClick={() => markAsNotMatch(selectedMatch)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  <XCircle className="h-4 w-4" />
                  Not a Match
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Task4;
