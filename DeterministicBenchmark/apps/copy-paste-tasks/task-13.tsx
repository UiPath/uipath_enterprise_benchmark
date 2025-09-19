import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp } from 'lucide-react';

class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

interface SurveyResponse {
  id: string;
  respondentName: string;
  date: string;
  q1: string; // Rating 1-5
  q2: string; // Multiple choice
  q3: 'Yes' | 'No' | 'Maybe'; // Our target question
  q4: string; // Text response
  q5: string; // Multiple choice
}

const Task13: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dashboardCounts, setDashboardCounts] = useState({
    q3Yes: 0,
    q3No: 0,
    q3Maybe: 0
  });
  
  const RESPONSES_PER_PAGE = 10;
  const TOTAL_PAGES = 3;
  
  // Generate deterministic survey data
  const generateSurveyData = (): SurveyResponse[] => {
    const rng = new SeededRandom(12345);
    const responses: SurveyResponse[] = [];
    
    // We need exactly 20 "Yes", 8 "No", 2 "Maybe" for question 3
    const q3Responses: ('Yes' | 'No' | 'Maybe')[] = [
      ...Array(20).fill('Yes'),
      ...Array(8).fill('No'), 
      ...Array(2).fill('Maybe')
    ];
    
    // Shuffle the responses to distribute them across pages
    for (let i = q3Responses.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [q3Responses[i], q3Responses[j]] = [q3Responses[j], q3Responses[i]];
    }
    
    const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Jessica', 'James', 'Ashley', 'Christopher', 'Amanda', 'Daniel'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
    
    const q2Options = ['Excellent', 'Good', 'Fair', 'Poor'];
    const q5Options = ['Very Likely', 'Likely', 'Neutral', 'Unlikely', 'Very Unlikely'];
    
    const q4Responses = [
      'Great service overall, very satisfied with the experience.',
      'Customer support was helpful and responsive.',
      'Product quality meets expectations.',
      'Delivery was faster than expected.',
      'Easy to use interface and clear instructions.',
      'Pricing is competitive compared to alternatives.',
      'Had some minor issues but they were resolved quickly.',
      'The team was professional and knowledgeable.',
      'Would definitely use this service again.',
      'Exceeded my expectations in every way.',
      'Simple and straightforward process.',
      'Good value for the money spent.',
      'Staff was friendly and accommodating.',
      'No complaints, everything went smoothly.',
      'Impressed with the attention to detail.'
    ];
    
    for (let i = 0; i < 30; i++) {
      const firstName = firstNames[Math.floor(rng.next() * firstNames.length)];
      const lastName = lastNames[Math.floor(rng.next() * lastNames.length)];
      const date = new Date(2024, Math.floor(rng.next() * 12), Math.floor(rng.next() * 28) + 1);
      
      responses.push({
        id: `R${(i + 1).toString().padStart(3, '0')}`,
        respondentName: `${firstName} ${lastName}`,
        date: date.toLocaleDateString(),
        q1: (Math.floor(rng.next() * 5) + 1).toString(), // Rating 1-5
        q2: q2Options[Math.floor(rng.next() * q2Options.length)],
        q3: q3Responses[i],
        q4: q4Responses[Math.floor(rng.next() * q4Responses.length)],
        q5: q5Options[Math.floor(rng.next() * q5Options.length)]
      });
    }
    
    return responses;
  };
  
  const surveyData = generateSurveyData();
  
  // Get current page responses
  const getCurrentPageResponses = () => {
    const startIndex = (currentPage - 1) * RESPONSES_PER_PAGE;
    const endIndex = startIndex + RESPONSES_PER_PAGE;
    return surveyData.slice(startIndex, endIndex);
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handleCountUpdate = (field: 'q3Yes' | 'q3No' | 'q3Maybe', value: number) => {
    setDashboardCounts(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + value)
    }));
  };
  
  // Expose state for testing
  useEffect(() => {
    (window as any).app_state = {
      currentPage,
      totalPages: TOTAL_PAGES,
      responsesPerPage: RESPONSES_PER_PAGE,
      dashboardCounts,
      surveyData,
      currentPageResponses: getCurrentPageResponses(),
      // For testing - the correct counts
      correctCounts: {
        q3Yes: 20,
        q3No: 8, 
        q3Maybe: 2
      }
    };
  }, [currentPage, dashboardCounts]);
  
  const currentResponses = getCurrentPageResponses();
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Survey Results Panel */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Survey Results</h2>
            <p className="text-gray-600 mt-2">Customer Satisfaction Survey - Page {currentPage} of {TOTAL_PAGES}</p>
          </div>
          
          <div className="p-6">
            <div className="grid gap-4">
              {currentResponses.map((response) => (
                <div key={response.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{response.respondentName}</h3>
                      <p className="text-sm text-gray-500">Response ID: {response.id} • Date: {response.date}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Q1: How would you rate our service? (1-5)</p>
                        <p className="text-lg font-semibold text-blue-600">{response.q1}/5</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Q2: How was your overall experience?</p>
                        <p className="text-lg font-semibold text-green-600">{response.q2}</p>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-sm font-medium text-gray-700">Q3: Are you satisfied with our service?</p>
                      <p className="text-xl font-bold text-yellow-800">{response.q3}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Q4: Additional comments:</p>
                      <p className="text-gray-800 bg-white p-2 rounded border">{response.q4}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Q5: How likely are you to recommend us?</p>
                      <p className="text-lg font-semibold text-purple-600">{response.q5}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === TOTAL_PAGES}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analytics Dashboard Panel */}
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Analytics Dashboard</h3>
        
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-900">Question 3 Responses</h4>
            </div>
            <p className="text-sm text-blue-700 mb-4">"Are you satisfied with our service?"</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Yes Responses:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCountUpdate('q3Yes', -1)}
                    className="w-6 h-6 rounded bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-green-600">{dashboardCounts.q3Yes}</span>
                  <button
                    onClick={() => handleCountUpdate('q3Yes', 1)}
                    className="w-6 h-6 rounded bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">No Responses:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCountUpdate('q3No', -1)}
                    className="w-6 h-6 rounded bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-red-600">{dashboardCounts.q3No}</span>
                  <button
                    onClick={() => handleCountUpdate('q3No', 1)}
                    className="w-6 h-6 rounded bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Maybe Responses:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCountUpdate('q3Maybe', -1)}
                    className="w-6 h-6 rounded bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-yellow-600">{dashboardCounts.q3Maybe}</span>
                  <button
                    onClick={() => handleCountUpdate('q3Maybe', 1)}
                    className="w-6 h-6 rounded bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-900">Progress Tracking</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Current Page:</span>
                <span className="font-semibold">{currentPage} of {TOTAL_PAGES}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Total Counted:</span>
                <span className="font-semibold">{dashboardCounts.q3Yes + dashboardCounts.q3No + dashboardCounts.q3Maybe}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Task13;
