import React, { useState, useEffect } from 'react';
import { ChevronDown, Package } from 'lucide-react';

// Deterministic random number generator
class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

interface InventoryItem {
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  supplier: string;
  isLowStock: boolean;
}



const Task12: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [filters, setFilters] = useState({
    category: 'All',
    supplier: 'All',
    stockLevel: 'All'
  });

  // Generate deterministic inventory data
  useEffect(() => {
    const rng = new SeededRandom(12345);
    
    const categories = ['Electronics', 'Office Supplies', 'Manufacturing Parts'];
    const suppliers = ['TechCorp', 'OfficeMax', 'Industrial Solutions', 'Global Supply', 'Premier Parts'];
    
    const items: InventoryItem[] = [];
    let lowStockCount = 0;
    
    // Generate 200 inventory items
    for (let i = 0; i < 200; i++) {
      const category = categories[Math.floor(rng.next() * categories.length)];
      const supplier = suppliers[Math.floor(rng.next() * suppliers.length)];
      
      // Generate realistic product names based on category
      let productName = '';
      if (category === 'Electronics') {
        const electronicItems = ['Circuit Board', 'Resistor Pack', 'LED Strip', 'Power Adapter', 'USB Cable', 'Memory Card', 'Sensor Module', 'Display Panel'];
        productName = electronicItems[Math.floor(rng.next() * electronicItems.length)] + ` Model ${String.fromCharCode(65 + Math.floor(rng.next() * 26))}${Math.floor(rng.next() * 999)}`;
      } else if (category === 'Office Supplies') {
        const officeItems = ['Paper Ream', 'Ink Cartridge', 'Stapler', 'Notebook', 'Pen Set', 'Binder', 'Tape Roll', 'Folder Pack'];
        productName = officeItems[Math.floor(rng.next() * officeItems.length)] + ` ${Math.floor(rng.next() * 50) + 1}${String.fromCharCode(65 + Math.floor(rng.next() * 3))}`;
      } else {
        const manufacturingItems = ['Steel Plate', 'Bolt Set', 'Bearing', 'Gasket', 'Valve', 'Pipe Section', 'Motor Component', 'Coupling'];
        productName = manufacturingItems[Math.floor(rng.next() * manufacturingItems.length)] + ` Grade ${Math.floor(rng.next() * 10) + 1}`;
      }
      
      // Set reorder point (10-50 units)
      const reorderPoint = Math.floor(rng.next() * 41) + 10; // 10-50
      
      // Determine if this should be a low stock item (need exactly 28)
      let currentStock: number;
      let isLowStock = false;
      
      if (lowStockCount < 28 && rng.next() > 0.86) { // Create low stock items
        currentStock = Math.floor(rng.next() * reorderPoint); // Below reorder point
        isLowStock = true;
        lowStockCount++;
      } else {
        currentStock = Math.floor(rng.next() * 451) + reorderPoint; // Above reorder point (up to 500)
      }
      
      items.push({
        sku: `SKU-${String(i + 1).padStart(4, '0')}`,
        productName,
        category,
        currentStock,
        reorderPoint,
        supplier,
        isLowStock
      });
    }
    
    // Ensure we have exactly 28 low stock items by forcing some if needed
    if (lowStockCount < 28) {
      const remainingNeeded = 28 - lowStockCount;
      for (let i = 0; i < remainingNeeded; i++) {
        const targetIndex = Math.floor(rng.next() * items.length);
        if (!items[targetIndex].isLowStock) {
          items[targetIndex].currentStock = Math.floor(rng.next() * items[targetIndex].reorderPoint);
          items[targetIndex].isLowStock = true;
        }
      }
    }
    
    setInventoryItems(items);
    setFilteredItems(items);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = inventoryItems;
    
    if (filters.category !== 'All') {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters.supplier !== 'All') {
      filtered = filtered.filter(item => item.supplier === filters.supplier);
    }
    
    if (filters.stockLevel !== 'All') {
      if (filters.stockLevel === 'Low Stock') {
        filtered = filtered.filter(item => item.currentStock < item.reorderPoint);
      } else if (filters.stockLevel === 'Out of Stock') {
        filtered = filtered.filter(item => item.currentStock === 0);
      }
    }
    
    setFilteredItems(filtered);
  }, [filters, inventoryItems]);

  // Expose state for testing
  useEffect(() => {
    const lowStockItems = inventoryItems.filter(item => item.currentStock < item.reorderPoint);
    
    // Calculate supplier counts for Electronics items that need reordering
    // Include ALL suppliers, even those with zero Electronics low stock items
    const electronicsLowStock = lowStockItems.filter(item => item.category === 'Electronics');
    const allSuppliers = [...new Set(inventoryItems.map(item => item.supplier))].sort();
    const supplierCounts: Record<string, number> = {};
    
    // Initialize all suppliers with count 0
    allSuppliers.forEach(supplier => {
      supplierCounts[supplier] = 0;
    });
    
    // Increment counts for suppliers with Electronics low stock items
    electronicsLowStock.forEach(item => {
      supplierCounts[item.supplier]++;
    });
    
    (window as any).app_state = {
      inventoryItems,
      filteredItems,
      filters,
      lowStockItems,
      electronicsLowStock,
      supplierCounts,
      allSuppliers,
      totalItems: inventoryItems.length,
      lowStockCount: lowStockItems.length,
      submission: (window as any).app_state?.submission
    };
  }, [inventoryItems, filteredItems, filters]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };



  const getUniqueValues = (field: 'category' | 'supplier'): string[] => {
    const values = [...new Set(inventoryItems.map(item => item[field] as string))];
    return values.sort();
  };

  // Console logging for result submission task (CRITICAL RULE)
  useEffect(() => {
    if (inventoryItems.length > 0) {
      const lowStockItems = inventoryItems.filter(item => item.currentStock < item.reorderPoint);
      const electronicsLowStock = lowStockItems.filter(item => item.category === 'Electronics');
      
      // Include ALL suppliers, even those with zero Electronics low stock items
      const allSuppliers = [...new Set(inventoryItems.map(item => item.supplier))].sort();
      const supplierCounts: Record<string, number> = {};
      
      // Initialize all suppliers with count 0
      allSuppliers.forEach(supplier => {
        supplierCounts[supplier] = 0;
      });
      
      // Increment counts for suppliers with Electronics low stock items
      electronicsLowStock.forEach(item => {
        supplierCounts[item.supplier]++;
      });

      console.log('=== EXPECTED JSON (for testers) ===');
      console.log(JSON.stringify(supplierCounts, null, 2));
      console.log('=== COPY-PASTEABLE VERSION ===');
      console.log(JSON.stringify(supplierCounts));
    }
  }, [inventoryItems]);

  return (
    <div className="h-screen bg-gray-50">
      {/* Full Width - Inventory Table */}
      <div className="h-full p-6 overflow-hidden flex flex-col">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Inventory Management
            </h2>
            
            {/* Filters */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Categories</option>
                    {getUniqueValues('category').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <div className="relative">
                  <select
                    value={filters.supplier}
                    onChange={(e) => handleFilterChange('supplier', e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Suppliers</option>
                    {getUniqueValues('supplier').map(supplier => (
                      <option key={supplier} value={supplier}>{supplier}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Level</label>
                <div className="relative">
                  <select
                    value={filters.stockLevel}
                    onChange={(e) => handleFilterChange('stockLevel', e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Inventory Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Point</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.sku} 
                    className={`hover:bg-gray-50 ${item.currentStock < item.reorderPoint ? 'bg-orange-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.currentStock}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.reorderPoint}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task12;
