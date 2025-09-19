import React, { useState, useEffect, useRef } from 'react';
import { Calculator } from 'lucide-react';

// Sales data interface
interface SalesRecord {
  region: string;
  product: string;
  salesAmount: number;
}

interface SummaryRecord {
  region: string;
  totalSales: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

// Simple seeded random number generator
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate realistic quarterly sales data
const generateQuarterlySalesData = () => {
  const rng = new SeededRandom(12345); // Fixed seed for consistent data
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const products = [
    'Laptop Pro', 'Desktop Elite', 'Monitor 4K', 'Keyboard Wireless', 'Mouse Gaming',
    'Tablet Ultra', 'Phone Premium', 'Headphones Noise-Cancel', 'Speaker Bluetooth', 'Camera Digital',
    'Printer Laser', 'Scanner Document', 'Router Wifi 6', 'Switch Network', 'Server Rack',
    'Software License', 'Cloud Storage', 'Security Suite', 'Backup Solution', 'Database License',
    'Training Course', 'Consultation Hours', 'Support Package', 'Maintenance Contract', 'Warranty Extended'
  ];

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterlyData: { [key: string]: SalesRecord[] } = {};

  // Pre-calculate regional totals to ensure they sum to ~$2M total
  const targetRegionalTotals = {
    'North': 450000,
    'South': 380000, 
    'East': 420000,
    'West': 350000,
    'Central': 400000
  };

  quarters.forEach((quarter) => {
    const quarterData: SalesRecord[] = [];
    
    regions.forEach(region => {
      const regionTarget = targetRegionalTotals[region as keyof typeof targetRegionalTotals];
      const quarterTarget = regionTarget / 4; // Divide evenly across quarters with some variation
      
      // Add some quarterly variation (±20%)
      const variation = (rng.next() - 0.5) * 0.4; // -20% to +20%
      const adjustedQuarterTarget = quarterTarget * (1 + variation);
      
      // Generate 4-5 products per region per quarter
      const productsPerRegion = 4 + Math.floor(rng.next() * 2);
      const remainingProducts = [...products];
      
      let remainingAmount = adjustedQuarterTarget;
      
      for (let i = 0; i < productsPerRegion; i++) {
        if (remainingProducts.length === 0) break;
        
        const productIndex = Math.floor(rng.next() * remainingProducts.length);
        const product = remainingProducts[productIndex];
        remainingProducts.splice(productIndex, 1);
        
        let salesAmount;
        if (i === productsPerRegion - 1) {
          // Last product gets remaining amount
          salesAmount = Math.max(10000, remainingAmount);
        } else {
          // Random percentage of remaining amount
          const percentage = 0.15 + rng.next() * 0.35; // 15-50%
          salesAmount = remainingAmount * percentage;
          remainingAmount -= salesAmount;
        }
        
        // Round to nearest thousand for cleaner numbers
        salesAmount = Math.round(salesAmount / 1000) * 1000;
        
        quarterData.push({
          region,
          product,
          salesAmount
        });
      }
    });
    
    // Sort by product name to scatter regions throughout the table
    quarterData.sort((a, b) => a.product.localeCompare(b.product));
    
    quarterlyData[quarter] = quarterData;
  });

  return quarterlyData;
};

const Task4: React.FC = () => {
  const [quarterlyData] = useState(() => generateQuarterlySalesData());
  const [activeTab, setActiveTab] = useState('Q1');
  const [summaryData, setSummaryData] = useState<SummaryRecord[]>(() => 
    // Initialize empty summary table for North region only
    [{
      region: 'North',
      totalSales: 0,
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0
    }]
  );
  const hasLoggedOnce = useRef(false);


  // Expose app state for testing
  useEffect(() => {
    // Calculate actual totals for North region only
    const northTotals = { total: 0, q1: 0, q2: 0, q3: 0, q4: 0 };
    
    Object.entries(quarterlyData).forEach(([quarter, records]) => {
      records.forEach(record => {
        if (record.region === 'North') {
          const q = quarter.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4';
          northTotals[q] += record.salesAmount;
          northTotals.total += record.salesAmount;
        }
      });
    });

    // Console log for human testers (secret - CU agent won't see this)
    if (!hasLoggedOnce.current) {
      console.log('=== EXPECTED NORTH REGION TOTALS (for testers) ===');
      console.log('Q1:', northTotals.q1);
      console.log('Q2:', northTotals.q2);
      console.log('Q3:', northTotals.q3);
      console.log('Q4:', northTotals.q4);
      console.log('=== END EXPECTED TOTALS ===');
      hasLoggedOnce.current = true;
    }

    (window as any).app_state = {
      quarterlyData,
      summaryData,
      northTotals,
      activeTab,
      isCompleted: summaryData.length > 0 && 
                   summaryData[0].q1 > 0 && summaryData[0].q2 > 0 && 
                   summaryData[0].q3 > 0 && summaryData[0].q4 > 0
    };
  }, [quarterlyData, summaryData, activeTab]);





  const updateSummaryCell = (regionIndex: number, field: 'q1' | 'q2' | 'q3' | 'q4', value: number) => {
    const updatedSummary = [...summaryData];
    updatedSummary[regionIndex] = {
      ...updatedSummary[regionIndex],
      [field]: value
    };
    
    // Auto-calculate total
    const record = updatedSummary[regionIndex];
    record.totalSales = record.q1 + record.q2 + record.q3 + record.q4;
    
    setSummaryData(updatedSummary);
  };



  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = ['Q1', 'Q2', 'Q3', 'Q4', 'Summary'];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-auto">
        {activeTab === 'Summary' ? (
          <div className="bg-white rounded-lg shadow">
                          <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calculator size={20} />
                North Region Sales Summary
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manually calculate and enter North region quarterly totals from the Q1-Q4 data tables
              </p>
            </div>

            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Region</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Q1</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Q2</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Q3</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Q4</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold bg-blue-50">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.map((record, index) => (
                      <tr key={record.region} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                          {record.region}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <input
                            type="number"
                            value={record.q1 || ''}
                            onChange={(e) => updateSummaryCell(index, 'q1', parseInt(e.target.value) || 0)}
                            className="w-full text-center border-0 bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <input
                            type="number"
                            value={record.q2 || ''}
                            onChange={(e) => updateSummaryCell(index, 'q2', parseInt(e.target.value) || 0)}
                            className="w-full text-center border-0 bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <input
                            type="number"
                            value={record.q3 || ''}
                            onChange={(e) => updateSummaryCell(index, 'q3', parseInt(e.target.value) || 0)}
                            className="w-full text-center border-0 bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <input
                            type="number"
                            value={record.q4 || ''}
                            onChange={(e) => updateSummaryCell(index, 'q4', parseInt(e.target.value) || 0)}
                            className="w-full text-center border-0 bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center bg-blue-50">
                          <div className="text-center font-semibold text-green-600 py-2">
                            {formatCurrency(record.totalSales)}
                          </div>
                          <div className="text-xs text-gray-500">(auto-calculated)</div>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="border border-gray-300 px-3 py-2">TOTAL</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {formatCurrency(summaryData.reduce((sum, record) => sum + record.q1, 0))}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {formatCurrency(summaryData.reduce((sum, record) => sum + record.q2, 0))}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {formatCurrency(summaryData.reduce((sum, record) => sum + record.q3, 0))}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {formatCurrency(summaryData.reduce((sum, record) => sum + record.q4, 0))}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-blue-100">
                        {formatCurrency(summaryData.reduce((sum, record) => sum + record.totalSales, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Instructions: Switch between Q1-Q4 tabs to view quarterly data (sorted by Product name). For each quarter, scan through the table to find all North region entries and sum their sales amounts. Enter the quarterly totals here - the total sales will be calculated automatically.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {activeTab} Sales Data
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Data sorted by Product name. Find all North region entries to calculate quarterly totals
              </p>
            </div>

            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left cursor-pointer hover:bg-gray-100">
                        Region
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left bg-blue-50">
                        Product (sorted A-Z)
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-right cursor-pointer hover:bg-gray-100">
                        Sales Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(quarterlyData[activeTab] || []).map((record, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-3 py-2 font-medium">
                          {record.region}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {record.product}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-mono">
                          {formatCurrency(record.salesAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td colSpan={2} className="border border-gray-300 px-3 py-2 font-semibold">
                        {activeTab} Total
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-semibold font-mono">
                        {formatCurrency((quarterlyData[activeTab] || []).reduce((sum, record) => sum + record.salesAmount, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>


            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default Task4;
