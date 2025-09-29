import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';


const Task10: React.FC = () => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Complete dataset (same as in HTML)
  const data = [
    // Page 1
    ['2F2DE48C8N4309374', 'Ford', 'F150', '2019'],
    ['2L3ED45V3D4030403', 'Lexus', 'ES350', '2019'],
    ['7G90G567894589047', 'VW', 'Corrado', '2015'],
    // Page 2
    ['3F4F587F84DJ73847', 'Toyota', 'Highlander', '2019'],
    ['34FG678956T435678', 'Ford', 'Focus', '2015'],
    ['1F34GH4V83D345698', 'Toyota', 'Highlander', '2020'],
    // Page 3
    ['7Y569K09856785657', 'Honda', 'Pilot', '2020'],
    ['45R6789456787658I', 'Lexus', 'ES350', '2020'],
    ['2T2XS93J9S3829399', 'Toyota', 'Prius', '2018'],
    // Page 4
    ['7Y569K09856785658', 'Ford', 'Pilot', '2022'],
    ['45R6789436787658I', 'VW', 'ES350', '2021'],
    ['2T2XS93J9S3829399', 'VW', 'Prius', '2013'],
    // Page 5
    ['7Y569K09853785657', 'Honda', 'F150', '2024'],
    ['45R6789426787658I', 'Lexus', 'Highlander', '2025'],
    ['2T2XS93J9S3129399', 'Toyota', 'Corrado', '2026']
  ];

  const pageRowCount = 3;
  const lastPageIndex = Math.ceil(data.length / pageRowCount);

  // Expose app state for testing - Submit Results button will set submission
  useEffect(() => {
    (window as any).app_state = {
      ...(window as any).app_state, // Preserve any existing submission data
      currentPageIndex,
      lastPageIndex,
      allPagesVisited: currentPageIndex >= lastPageIndex - 1
    };
  }, [currentPageIndex, lastPageIndex]);

  // Get current page data
  const getCurrentPageData = () => {
    const startRowIdx = currentPageIndex * pageRowCount;
    return data.slice(startRowIdx, startRowIdx + pageRowCount).map(row => ({
      VIN: row[0],
      Make: row[1],
      Model: row[2],
      Year: row[3]
    }));
  };

  const loadNextPage = () => {
    if (currentPageIndex >= lastPageIndex - 1) {
      return;
    }
    setCurrentPageIndex(prev => prev + 1);
  };


  // No internal submission - external Submit Results button handles this

  const currentPageData = getCurrentPageData();
  const isLastPage = currentPageIndex >= lastPageIndex - 1;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Multipage Table Data Extraction</h1>
        

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4">
            <h2 className="text-lg font-bold text-center mb-4">Multipage table</h2>
            
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black px-4 py-2 text-left font-semibold">VIN</th>
                  <th className="border border-black px-4 py-2 text-left font-semibold">Make</th>
                  <th className="border border-black px-4 py-2 text-left font-semibold">Model</th>
                  <th className="border border-black px-4 py-2 text-left font-semibold">Year</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((row, index) => (
                  <tr key={`${currentPageIndex}-${index}`} className="hover:bg-gray-50">
                    <td className="border border-black px-4 py-2">
                      <div>
                        <p>{row.VIN}</p>
                      </div>
                    </td>
                    <td className="border border-black px-4 py-2">
                      <p>{row.Make}</p>
                    </td>
                    <td className="border border-black px-4 py-2">
                      <p>{row.Model}</p>
                    </td>
                    <td className="border border-black px-4 py-2">
                      <p>{row.Year}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Page indicator */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Page {currentPageIndex + 1}/{lastPageIndex}
              </p>
              
              {/* Next page button */}
              {!isLastPage && (
                <button
                  onClick={loadNextPage}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Next page
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task10;
