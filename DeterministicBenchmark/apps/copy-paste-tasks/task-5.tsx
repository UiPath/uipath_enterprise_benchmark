import React, { useState, useEffect, useRef } from 'react';
import { Users } from 'lucide-react';

// Employee data interface
interface Employee {
  id: number;
  name: string;
  hireDate: string; // MM/DD/YYYY format
  department: string;
  salary: number;
  originalSalary: number; // Track original salary to detect changes
  isEdited: boolean;
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

// Generate deterministic employee data
const generateEmployeeData = (): Employee[] => {
  const rng = new SeededRandom(12345); // Fixed seed for consistent data
  
  const firstNames = [
    'John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Christopher', 'Ashley', 
    'Matthew', 'Amanda', 'Joshua', 'Melissa', 'Andrew', 'Stephanie', 'Daniel', 'Nicole',
    'Ryan', 'Jennifer', 'Kevin', 'Lisa', 'Brandon', 'Michelle', 'Jason', 'Kimberly',
    'Justin', 'Elizabeth', 'Anthony', 'Maria', 'Mark', 'Laura', 'Steven', 'Rebecca',
    'Brian', 'Sharon', 'Patrick', 'Carol', 'Gary', 'Helen', 'Raymond', 'Cynthia',
    'Jeremy', 'Angela', 'Sean', 'Brenda', 'Carl', 'Marie', 'Harold', 'Janet',
    'Arthur', 'Joyce', 'Ronald', 'Frances', 'Louis', 'Diane', 'Philip', 'Alice',
    'Scott', 'Julie', 'Wayne', 'Catherine', 'Ralph', 'Samantha', 'Roy', 'Deborah',
    'Eugene', 'Rachel', 'Louis', 'Carolyn', 'George', 'Virginia', 'Walter', 'Maria',
    'Jack', 'Heather', 'Peter', 'Donna', 'Ernest', 'Ruth', 'Henry', 'Sharon'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Moore', 'Taylor',
    'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia',
    'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall',
    'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott',
    'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez',
    'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins',
    'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell',
    'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward',
    'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly',
    'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman'
  ];
  
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  
  const employees: Employee[] = [];
  
  for (let i = 0; i < 80; i++) {
    const firstName = firstNames[Math.floor(rng.next() * firstNames.length)];
    const lastName = lastNames[Math.floor(rng.next() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    
    // Generate hire date - 10 employees before 2020, 70 employees 2020 or later
    let hireDate: string;
    if (i < 10) {
      // Pre-2020 employees (2015-2019)
      const year = 2015 + Math.floor(rng.next() * 5); // 2015-2019
      const month = 1 + Math.floor(rng.next() * 12);  // 1-12
      const day = 1 + Math.floor(rng.next() * 28);    // 1-28 (safe for all months)
      hireDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    } else {
      // 2020+ employees (2020-2024)
      const year = 2020 + Math.floor(rng.next() * 5); // 2020-2024
      const month = 1 + Math.floor(rng.next() * 12);
      const day = 1 + Math.floor(rng.next() * 28);
      hireDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    }
    
    const department = departments[Math.floor(rng.next() * departments.length)];
    
    // Generate salary between $45K-$120K
    const baseSalary = 45000 + Math.floor(rng.next() * 75000);
    // Round to nearest $1000 for cleaner numbers
    const salary = Math.round(baseSalary / 1000) * 1000;
    
    employees.push({
      id: i + 1,
      name,
      hireDate,
      department,
      salary,
      originalSalary: salary,
      isEdited: false
    });
  }
  
  // Sort by name to scatter pre-2020 and post-2020 employees throughout the list
  employees.sort((a, b) => a.name.localeCompare(b.name));
  
  return employees;
};

const Task5: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => generateEmployeeData());
  const [editingCell, setEditingCell] = useState<{employeeId: number} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const hasLoggedOnce = useRef(false);
  
  // Expose app state for testing
  useEffect(() => {
    // Calculate expected results for testing
    const pre2020Employees = employees.filter(emp => {
      const year = parseInt(emp.hireDate.split('/')[2]);
      return year < 2020;
    });
    
    const editedEmployees = employees.filter(emp => emp.isEdited);
    const correctlyEditedEmployees = editedEmployees.filter(emp => {
      const year = parseInt(emp.hireDate.split('/')[2]);
      const expectedSalary = emp.originalSalary + 1000;
      return year < 2020 && emp.salary === expectedSalary;
    });
    
    // Console log for human testers (single-run)
    if (!hasLoggedOnce.current) {
      console.log('=== EXPECTED TASK 5 RESULTS (for testers) ===');
      console.log(`Total employees: ${employees.length}`);
      console.log(`Pre-2020 employees (should be updated): ${pre2020Employees.length}`);
      console.log('Pre-2020 employee details (sorted by name, scattered in table):');
      pre2020Employees.forEach(emp => {
        const expectedSalary = emp.originalSalary + 1000;
        console.log(`  ID ${emp.id}: ${emp.name}, Hire: ${emp.hireDate}, Current: ${emp.salary}, Expected: ${expectedSalary}`);
      });
      console.log('=== END EXPECTED RESULTS ===');
      hasLoggedOnce.current = true;
    }
    
    (window as any).app_state = {
      employees,
      pre2020Employees: pre2020Employees.map(emp => ({
        ...emp,
        expectedSalary: emp.originalSalary + 1000
      })),
      editedCount: editedEmployees.length,
      correctlyEditedCount: correctlyEditedEmployees.length,
      totalCount: employees.length,
      isCompleted: correctlyEditedEmployees.length === pre2020Employees.length && 
                   correctlyEditedEmployees.length > 0
    };
  }, [employees]);
  
  const handleCellDoubleClick = (employee: Employee) => {
    setEditingCell({ employeeId: employee.id });
    setEditValue(employee.salary.toString());
  };
  
  const handleEditSubmit = () => {
    if (editingCell) {
      const newSalary = parseInt(editValue) || 0;
      if (newSalary > 0) {
        setEmployees(prev => prev.map(emp => 
          emp.id === editingCell.employeeId 
            ? { ...emp, salary: newSalary, isEdited: true }
            : emp
        ));
      }
      setEditingCell(null);
      setEditValue('');
    }
  };
  
  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  };
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  

  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Users size={24} className="text-blue-600" />
          <h1 className="text-xl font-semibold">Employee Salary Management</h1>
        </div>
      </div>
      
      {/* Data Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium">Employee Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {employees.length} employees. Find employees hired before 2020 and add $1000 to their salaries.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Employee ID</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Name</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Hire Date</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Department</th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-semibold">Current Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => {
                  const isEditing = editingCell?.employeeId === employee.id;
                  
                  return (
                    <tr key={employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2 font-mono">
                        EMP-{employee.id.toString().padStart(3, '0')}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 font-medium">
                        {employee.name}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 font-mono">
                        {employee.hireDate}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {employee.department}
                      </td>
                      <td 
                        className={`border border-gray-300 px-3 py-2 text-right font-mono cursor-pointer hover:bg-blue-50 ${
                          employee.isEdited ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        } ${isEditing ? 'bg-blue-100' : ''}`}
                        onDoubleClick={() => !isEditing && handleCellDoubleClick(employee)}
                        title="Double-click to edit"
                      >
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleEditCancel}
                            className="w-full text-right bg-white border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            min="0"
                            step="1000"
                          />
                        ) : (
                          <span className={employee.isEdited ? 'font-semibold text-blue-600' : ''}>
                            {formatCurrency(employee.salary)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Employees:</span> {employees.length}
              </div>
              <div>
                <span className="font-medium">Edited Salaries:</span> {employees.filter(emp => emp.isEdited).length}
              </div>
              <div>
                <span className="font-medium">Instructions:</span> Double-click salary cells to edit values
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend/Help */}
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <h3 className="font-medium mb-2">Visual Indicators:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 ring-2 ring-blue-500 rounded"></div>
              <span>Edited cells (blue border)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span>Currently editing</span>
            </div>
            <div className="text-gray-600">
              <strong>Tip:</strong> Find employees hired before 2020, double-click their salary cell, add $1000 to current amount. Press Enter to save, Escape to cancel.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task5;
