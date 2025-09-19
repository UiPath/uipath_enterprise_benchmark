// SAP Stock Tree Node Component
// ============================================================================

import React from 'react';
import { ChevronRight, ChevronDown, Building, Package, Warehouse } from 'lucide-react';
import { StockData, Organization, Plant, StorageLocation } from '../data';

interface StockTreeNodeProps {
  nodeData: StockData & { 
    name?: string; 
    plants?: { [key: string]: Plant };
    storageLocations?: { [key: string]: StorageLocation };
    specialStock?: { [key: string]: StockData };
  };
  level?: number;
  nodeId: string;
  expandedNodes: { [key: string]: boolean };
  onToggle: (nodeId: string) => void;
  stockColumns: string[];
}

const StockTreeNode: React.FC<StockTreeNodeProps> = ({ 
  nodeData, 
  level = 0, 
  nodeId, 
  expandedNodes, 
  onToggle, 
  stockColumns 
}) => {
  const isExpanded = expandedNodes[nodeId];
  const hasChildren = nodeData.plants || nodeData.storageLocations || nodeData.specialStock;
  
  const getIcon = () => {
    if (level === 0) return Building;
    if (level === 1) return Package;
    if (level === 2) return Warehouse;
    return null;
  };
  
  const Icon = getIcon();
  const bgColor = level === 0 && nodeId === 'full' ? 'bg-yellow-100' : 'bg-white';
  
  return (
    <>
      <tr className={`${bgColor} border-b border-gray-300`}>
        <td className="px-2 py-1 border-r border-gray-300">
          <div className="flex items-center" style={{ paddingLeft: `${level * 16}px` }}>
            {hasChildren && (
              <button 
                onClick={() => onToggle(nodeId)}
                className="mr-1 text-gray-600"
              >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            )}
            {Icon && <Icon size={12} className="mr-1 text-orange-600" />}
            <span className={level === 0 ? 'font-medium' : ''}>
              {nodeData.name || nodeId}
            </span>
          </div>
        </td>
        {stockColumns.map(col => (
          <td key={col} className="text-right px-2 py-1 border-r border-gray-300">
            {(nodeData as any)[col] ? (nodeData as any)[col].toLocaleString() : ''}
          </td>
        ))}
      </tr>
      
      {isExpanded && nodeData.plants && Object.entries(nodeData.plants).map(([plantId, plantData]) => (
        <StockTreeNode
          key={plantId}
          nodeData={plantData}
          level={level + 1}
          nodeId={`${nodeId}-${plantId}`}
          expandedNodes={expandedNodes}
          onToggle={onToggle}
          stockColumns={stockColumns}
        />
      ))}
      
      {isExpanded && nodeData.storageLocations && Object.entries(nodeData.storageLocations).map(([locId, locData]) => (
        <React.Fragment key={locId}>
          <StockTreeNode
            nodeData={locData}
            level={level + 1}
            nodeId={`${nodeId}-${locId}`}
            expandedNodes={expandedNodes}
            onToggle={onToggle}
            stockColumns={stockColumns}
          />
          {expandedNodes[`${nodeId}-${locId}`] && locData.specialStock && 
            Object.entries(locData.specialStock).map(([specialId, specialData]) => (
              <StockTreeNode
                key={specialId}
                nodeData={specialData}
                level={level + 2}
                nodeId={`${nodeId}-${locId}-${specialId}`}
                expandedNodes={expandedNodes}
                onToggle={onToggle}
                stockColumns={stockColumns}
              />
            ))
          }
        </React.Fragment>
      ))}
    </>
  );
};

export default StockTreeNode;
