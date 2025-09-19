// SAP Results Screen Component
// ============================================================================

import React from 'react';
import StockTreeNode from './StockTreeNode';
import { Material, MaterialStockData, STOCK_COLUMNS, COLUMN_HEADERS } from '../data';

interface ResultsScreenProps {
  selectedMaterial: string;
  materialData?: Material;
  stockData: MaterialStockData;
  expandedNodes: { [key: string]: boolean };
  onToggle: (nodeId: string) => void;
  onBack: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ 
  selectedMaterial, 
  materialData, 
  stockData, 
  expandedNodes, 
  onToggle, 
  onBack 
}) => {
  return (
    <div className="p-6 max-w-[1200px]">
      <div className="bg-blue-100 border-b border-gray-300 p-3 mb-4">
        <h1 className="text-lg font-normal italic">Stock Overview: Basic List</h1>
      </div>
      
      <div className="bg-white border border-gray-400 mb-4 shadow-sm">
        <div className="bg-blue-100 px-4 py-2 border-b border-gray-300">
          <h3 className="text-sm font-normal text-gray-800">Selection</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-6 gap-4 text-sm">
            <div>
              <label className="text-gray-800">Material</label>
              <div className="bg-yellow-100 border border-gray-400 px-2 py-1 mt-1">{selectedMaterial}</div>
            </div>
            <div>
              <label className="text-gray-800">Material Type</label>
              <div className="bg-white border border-gray-400 px-2 py-1 mt-1">{materialData?.type}</div>
            </div>
            <div>
              <label className="text-gray-800">Unit of Measure</label>
              <div className="bg-white border border-gray-400 px-2 py-1 mt-1">{materialData?.baseUnit}</div>
            </div>
            <div>
              <span className="text-gray-800">{materialData?.typeDescription}</span>
            </div>
            <div>
              <label className="text-gray-800">Base Unit of Measure</label>
              <span className="ml-2">{materialData?.baseUnit}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-400 shadow-sm">
        <div className="bg-blue-100 px-4 py-2 border-b border-gray-300">
          <h3 className="text-sm font-normal text-gray-800">Stock Overview</h3>
        </div>
        
        <div className="p-2 border-b border-gray-300 bg-gray-50">
          <div className="flex space-x-2">
            <button className="bg-gray-100 hover:bg-gray-200 border border-gray-400 px-2 py-1 text-xs">📊</button>
            <button className="bg-gray-100 hover:bg-gray-200 border border-gray-400 px-2 py-1 text-xs">📈</button>
            <button className="bg-gray-100 hover:bg-gray-200 border border-gray-400 px-2 py-1 text-xs">📋</button>
            <button className="bg-gray-100 hover:bg-gray-200 border border-gray-400 px-2 py-1 text-xs">🖨</button>
            <button className="bg-gray-100 hover:bg-gray-200 border border-gray-400 px-2 py-1 text-xs">📄</button>
            <button className="bg-yellow-200 hover:bg-yellow-300 border border-gray-400 px-3 py-1 text-xs font-medium">
              Detailed Display
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="text-left px-2 py-1 font-normal border-r border-gray-300">Client/Company Code/Plant/Storage Location/Batch/Special Stock</th>
                {COLUMN_HEADERS.map(header => (
                  <th key={header} className="text-right px-2 py-1 font-normal border-r border-gray-300">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <StockTreeNode
                nodeData={{ ...stockData.full, name: 'Full' }}
                level={0}
                nodeId="full"
                expandedNodes={expandedNodes}
                onToggle={onToggle}
                stockColumns={STOCK_COLUMNS}
              />
              
              {expandedNodes.full && Object.entries(stockData.organizations).map(([orgId, orgData]) => (
                <StockTreeNode
                  key={orgId}
                  nodeData={orgData}
                  level={1}
                  nodeId={orgId}
                  expandedNodes={expandedNodes}
                  onToggle={onToggle}
                  stockColumns={STOCK_COLUMNS}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
