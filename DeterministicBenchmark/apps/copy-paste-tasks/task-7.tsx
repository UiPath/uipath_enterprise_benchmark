import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, User, Building } from 'lucide-react';

// Seeded random number generator for deterministic results
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

interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  level: number;
  reports: Employee[];
  isExpanded?: boolean;
}



// Generate realistic org chart data
const generateOrgChart = () => {
  const rng = new SeededRandom(12345); // Fixed seed for deterministic results
  
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Betty',
    'Matthew', 'Helen', 'Anthony', 'Sandra', 'Mark', 'Donna', 'Donald', 'Carol',
    'Steven', 'Ruth', 'Paul', 'Sharon', 'Andrew', 'Michelle', 'Joshua', 'Laura',
    'Kenneth', 'Sarah', 'Kevin', 'Kimberly', 'Brian', 'Deborah', 'George', 'Dorothy',
    'Timothy', 'Lisa', 'Ronald', 'Nancy', 'Jason', 'Karen', 'Edward', 'Betty',
    'Jeffrey', 'Helen', 'Ryan', 'Sandra', 'Jacob', 'Donna', 'Gary', 'Carol',
    'Nicholas', 'Ruth', 'Eric', 'Sharon', 'Jonathan', 'Michelle', 'Stephen', 'Laura'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'
  ];
  

  
  const generateName = () => {
    const first = firstNames[Math.floor(rng.next() * firstNames.length)];
    const last = lastNames[Math.floor(rng.next() * lastNames.length)];
    return `${first} ${last}`;
  };
  
  // CEO at top
  const ceo: Employee = {
    id: 'CEO-001',
    name: generateName(),
    title: 'Chief Executive Officer',
    department: 'Executive',
    level: 1,
    reports: [],
    isExpanded: false
  };
  
  // 4 VPs reporting to CEO
  const vpTitles = ['VP of Engineering', 'VP of Sales & Marketing', 'VP of Operations', 'VP of Finance & HR'];
  const vpDepartments = [['Engineering'], ['Sales', 'Marketing'], ['Operations'], ['Finance', 'HR']];
  
  let employeeCounter = 1;
  let directorCounter = 0;
  
  for (let i = 0; i < 4; i++) {
    const vp: Employee = {
      id: `VP-${String(employeeCounter++).padStart(3, '0')}`,
      name: generateName(),
      title: vpTitles[i],
      department: vpDepartments[i][0], // Primary department
      level: 2,
      reports: [],
      isExpanded: false
    };
    
    // Each VP has 3 Directors (2 VPs) or 3 Directors (2 VPs) = 12 total Directors
    const directorsPerVP = i < 2 ? 3 : 3; // 3+3+3+3 = 12 Directors
    const vpDepts = vpDepartments[i];
    
    for (let j = 0; j < directorsPerVP; j++) {
      directorCounter++;
      const deptIndex = j % vpDepts.length;
      const director: Employee = {
        id: `DIR-${String(employeeCounter++).padStart(3, '0')}`,
        name: generateName(),
        title: `Director of ${vpDepts[deptIndex]}`,
        department: vpDepts[deptIndex],
        level: 3,
        reports: [],
        isExpanded: false
      };
      
      // Each Director has 3-4 Managers
      const managersPerDirector = 3 + Math.floor(rng.next() * 2); // 3-4 managers
      for (let k = 0; k < managersPerDirector; k++) {
        const manager: Employee = {
          id: `MGR-${String(employeeCounter++).padStart(3, '0')}`,
          name: generateName(),
          title: `${vpDepts[deptIndex]} Manager`,
          department: vpDepts[deptIndex],
          level: 4,
          reports: [],
          isExpanded: false
        };
        
        // Each Manager has 3-5 Individual Contributors
        const icsPerManager = 3 + Math.floor(rng.next() * 3); // 3-5 ICs
        for (let l = 0; l < icsPerManager; l++) {
          const ic: Employee = {
            id: `IC-${String(employeeCounter++).padStart(3, '0')}`,
            name: generateName(),
            title: getICTitle(vpDepts[deptIndex], rng),
            department: vpDepts[deptIndex],
            level: 5,
            reports: [],
            isExpanded: false
          };
          manager.reports.push(ic);
        }
        director.reports.push(manager);
      }
      vp.reports.push(director);
    }
    ceo.reports.push(vp);
  }
  
  return ceo;
};

const getICTitle = (department: string, rng: SeededRandom): string => {
  const titles = {
    Engineering: ['Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'QA Engineer'],
    Sales: ['Sales Representative', 'Account Executive', 'Sales Specialist', 'Business Development Rep', 'Account Manager'],
    Marketing: ['Marketing Specialist', 'Content Creator', 'Digital Marketing Analyst', 'Brand Manager', 'Marketing Coordinator'],
    Operations: ['Operations Specialist', 'Process Analyst', 'Operations Coordinator', 'Supply Chain Analyst', 'Project Coordinator'],
    Finance: ['Financial Analyst', 'Accountant', 'Accounts Payable Specialist', 'Budget Analyst', 'Financial Coordinator'],
    HR: ['HR Specialist', 'Recruiter', 'HR Coordinator', 'Compensation Analyst', 'Training Specialist']
  };
  
  const deptTitles = titles[department as keyof typeof titles] || ['Specialist', 'Analyst', 'Coordinator'];
  return deptTitles[Math.floor(rng.next() * deptTitles.length)];
};

// Helper function to collect all directors from org chart
const collectDirectors = (employee: Employee): Employee[] => {
  const directors: Employee[] = [];
  
  if (employee.title.includes('Director')) {
    directors.push(employee);
  }
  
  for (const report of employee.reports) {
    directors.push(...collectDirectors(report));
  }
  
  return directors;
};

// Helper function to count total employees under someone
const countReports = (employee: Employee): number => {
  return employee.reports.reduce((count, report) => count + 1 + countReports(report), 0);
};

const Task7: React.FC = () => {
  const [orgChart] = useState(() => generateOrgChart());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const hasLoggedOnce = useRef(false);
  
  // Collect all directors for testing
  const allDirectors = collectDirectors(orgChart);
  
  // Single-run console logging for human testers
  useEffect(() => {
    if (!hasLoggedOnce.current) {
      console.log('=== EXPECTED JSON (for testers) ===');
      const directorNames = allDirectors.map(director => director.name);
      const expectedJSON = { directors: directorNames };
      console.log(JSON.stringify(expectedJSON, null, 2));
      console.log('=== COPY-PASTEABLE VERSION ===');
      console.log(JSON.stringify(expectedJSON));
      hasLoggedOnce.current = true;
    }
  }, [allDirectors]);
  
  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      orgChart,
      allDirectors,
      expandedNodes: Array.from(expandedNodes),
      totalDirectors: allDirectors.length,
      submission: (window as any).app_state?.submission
    };
  }, [orgChart, allDirectors, expandedNodes]);

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };



  const renderEmployee = (employee: Employee, depth: number = 0) => {
    const isExpanded = expandedNodes.has(employee.id);
    const hasReports = employee.reports.length > 0;
    
    return (
      <div key={employee.id} className="relative">
        {/* Simple connecting line to parent */}
        {depth > 0 && (
          <div 
            className="absolute border-l-2 border-gray-300"
            style={{
              left: `${depth * 40 + 82}px`, // Center of profile photo (adjusted)
              top: '-10px',
              height: '20px'
            }}
          />
        )}
        
        {/* Employee card */}
        <div 
          className="flex items-center py-2 hover:bg-gray-50 rounded"
          style={{ marginLeft: `${depth * 40}px` }}
        >
          {/* Expand/collapse button */}
          {hasReports && (
            <button
              onClick={() => toggleExpanded(employee.id)}
              className="p-1 hover:bg-gray-200 rounded mr-2"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          {!hasReports && <div className="w-6 mr-2" />}
          
          {/* Employee info */}
          <div className="flex items-center bg-white border rounded-lg p-3 shadow-sm flex-1 mr-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{employee.name}</div>
              <div className="text-xs text-gray-600 truncate">{employee.title}</div>
              <div className="text-xs text-blue-600 truncate flex items-center">
                <Building className="w-3 h-3 mr-1" />
                {employee.department}
              </div>
            </div>
            

          </div>
        </div>
        
        {/* Render reports if expanded */}
        {isExpanded && hasReports && (
          <div>
            {employee.reports.map((report) => 
              renderEmployee(report, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-100">
      {/* Full Width - Organization Chart */}
      <div className="w-full p-4 bg-white">
        <h2 className="text-lg font-semibold mb-4">Organization Chart</h2>
        
        <div className="overflow-auto max-h-[calc(100vh-140px)] pr-2">
          {renderEmployee(orgChart)}
        </div>
        
      </div>
    </div>
  );
};

export default Task7;
