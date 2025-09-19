import React, { useState, useEffect, useRef } from 'react';
import { X, Edit2, ChevronDown, Check, Loader2, Globe, ChevronRight, Calendar } from 'lucide-react';
import TaskWrapper from '../src/TaskWrapper';


// 1. Tag-Based Email Recipients
const TagEmailRecipients = () => {
  const [emails, setEmails] = useState(['john@acme.com', 'sarah@acme.com', 'team@acme.com']);
  const [input, setInput] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      emails,
      input
    };
  }, [emails, input]);

  const addEmail = (email: string) => {
    if (email && email.includes('@')) {
      setEmails([...emails, email]);
      setInput('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[50px] bg-white">
        {emails.map((email, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {email}
            <X 
              className="h-3 w-3 cursor-pointer hover:text-blue-900"
              onClick={() => setEmails(emails.filter((_, i) => i !== idx))}
            />
          </span>
        ))}
        <input
          type="email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addEmail(input);
            }
          }}
          className="flex-1 min-w-[200px] outline-none text-sm"
          placeholder="Add email..."
        />
      </div>
    </div>
  );
};

// 2. Validated Username Field
const ValidatedUsername = () => {
  const [username, setUsername] = useState('alex_smith');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      username,
      isValidating,
      isValid
    };
  }, [username, isValidating, isValid]);

  useEffect(() => {
    if (username === 'alex_smith') {
      setIsValid(true);
      return;
    }
    
    setIsValidating(true);
    setIsValid(false);
    
    const timer = setTimeout(() => {
      setIsValidating(false);
      setIsValid(username === 'alexandra_s');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [username]);

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-3 top-2.5">
          {isValidating && <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />}
          {!isValidating && isValid && <Check className="h-5 w-5 text-green-500" />}
        </div>
      </div>
    </div>
  );
};

// 3. Country-City Cascade
const CountryCityCascade = () => {
  const [country, setCountry] = useState('Canada');
  const [city, setCity] = useState('Toronto');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  const cities = {
    'Canada': ['Toronto', 'Vancouver', 'Montreal'],
    'United States': ['New York', 'Los Angeles', 'Chicago'],
    'United Kingdom': ['London', 'Manchester', 'Birmingham']
  };

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      country,
      city,
      showCountryDropdown,
      showCityDropdown
    };
  }, [country, city, showCountryDropdown, showCityDropdown]);

  const selectCountry = (c: string) => {
    setCountry(c);
    setCity(''); // Auto-clear city
    setShowCountryDropdown(false);
  };

  return (
    <div>
      <div className="space-y-3">
        <div className="relative">
          <div 
            className="flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer bg-white"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          >
            <span>{country}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          {showCountryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {Object.keys(cities).map(c => (
                <div
                  key={c}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectCountry(c);
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative">
          <div 
            className={`flex items-center justify-between px-3 py-2 border rounded-md ${
              city ? 'cursor-pointer bg-white' : 'bg-gray-100 cursor-not-allowed'
            }`}
            onClick={() => city === '' && country && setShowCityDropdown(!showCityDropdown)}
          >
            <span className={city ? 'text-black' : 'text-gray-400'}>
              {city || 'Select city'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </div>
          {showCityDropdown && country && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {cities[country as keyof typeof cities].map((c: string) => (
                <div
                  key={c}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCity(c);
                    setShowCityDropdown(false);
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Inline Editable Status
const InlineEditableStatus = () => {
  const [status, setStatus] = useState('In Progress');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold'];

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      status,
      showDropdown
    };
  }, [status, showDropdown]);

  return (
    <div>
      <div className="relative inline-block">
        <div
          className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="text-blue-600">{status}</span>
          {showDropdown && <ChevronDown className="inline h-3 w-3 ml-1" />}
        </div>
        {showDropdown && (
          <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg min-w-[150px]">
            {statuses.map((s: string) => (
              <div
                key={s}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatus(s);
                  setShowDropdown(false);
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Search-Filter Multi-Select
const SearchFilterMultiSelect = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(['Marketing', 'Sales', 'Support', 'Product', 'Legal']);
  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Support', 'Product', 'Legal', 'HR', 'Finance'];
  
  const filtered = departments.filter(d => d.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      search,
      selected
    };
  }, [search, selected]);

  const toggle = (dept: string) => {
    if (selected.includes(dept)) {
      setSelected(selected.filter(d => d !== dept));
    } else {
      setSelected([...selected, dept]);
    }
  };

  return (
    <div>
      <div className="border rounded-md bg-white">
        <div className="p-3 border-b">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="w-full px-3 py-1 border rounded"
          />
          <button
            onClick={() => setSelected([])}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            Clear all
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto p-3 space-y-2">
          {filtered.map((dept: string) => (
            <label key={dept} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(dept)}
                onChange={() => toggle(dept)}
              />
              <span className="text-sm">{dept}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. Fuzzy Command Palette
const FuzzyCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('new');
  const [selected, setSelected] = useState('File: New Document');
  
  const commands = [
    'File: New Document',
    'File: Open File',
    'File: Save',
    'Settings: Toggle Dark Mode',
    'Settings: Change Theme',
    'View: Toggle Sidebar'
  ];
  
  const filtered = search ? commands.filter(cmd => 
    cmd.toLowerCase().includes(search.toLowerCase())
  ) : commands;

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      isOpen,
      search,
      selected
    };
  }, [isOpen, search, selected]);

  const execute = (cmd: string) => {
    setSelected(cmd);
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        Open Command Palette
      </button>
      {selected && !isOpen && (
        <p className="mt-2 text-sm">Last executed: <strong>{selected}</strong></p>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-h-96 overflow-hidden">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearch('');
                  setSelected('');
                }
              }}
              className="w-full px-4 py-3 border-b focus:outline-none"
              placeholder="Type command..."
              autoFocus
            />
            <div className="max-h-64 overflow-y-auto">
              {filtered.map((cmd: string) => (
                <div
                  key={cmd}
                  className={`px-4 py-2 cursor-pointer ${
                    selected === cmd ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => execute(cmd)}
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 7. Date Range Preset
const DateRangePreset = () => {
  const [preset, setPreset] = useState('Last 30 days');
  const [showDropdown, setShowDropdown] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const presets = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Custom Range'];

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      preset,
      showDropdown,
      customStart,
      customEnd
    };
  }, [preset, showDropdown, customStart, customEnd]);

  return (
    <div>
      <div className="space-y-3">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4" />
            <span>{preset}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {showDropdown && (
            <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg">
              {presets.map(p => (
                <div
                  key={p}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                  onClick={() => {
                    setPreset(p);
                    setShowDropdown(false);
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {preset === 'Custom Range' && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-md">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Start date"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="End date"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// 8. Hierarchical Tree Select
const HierarchicalTreeSelect = () => {
  const [path, setPath] = useState(['Furniture', 'Chairs', 'Office Chairs']);
  
  type TreeData = {
    [key: string]: TreeData;
  };

  const tree: TreeData = {
    'Electronics': {
      'Computers': {
        'Laptops': {},
        'Desktops': {},
        'Tablets': {}
      },
      'Audio': {
        'Headphones': {},
        'Speakers': {},
        'Microphones': {}
      }
    },
    'Furniture': {
      'Chairs': {
        'Office Chairs': {},
        'Dining Chairs': {},
        'Lounge Chairs': {}
      },
      'Tables': {
        'Desks': {},
        'Dining Tables': {},
        'Coffee Tables': {}
      }
    }
  };

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      path
    };
  }, [path]);
  

  const selectLevel = (level: number) => {
    if (level === 0) {
      // Going back to root - clear path and show top-level categories
      setPath([]);
    } else {
      // Going back to a specific level - show children of that level
      setPath(path.slice(0, level));
    }
  };

  const selectItem = (item: string) => {
    const newPath = [...path, item];
    setPath(newPath);
  };

  // Helper function to get current node in tree
  const getCurrentNode = (): TreeData => {
    let current = tree;
    for (const segment of path) {
      current = current[segment] || {};
    }
    return current;
  };

  const currentOptions = Object.keys(getCurrentNode());

  return (
    <div>
      <div className="space-y-3">
        <div className="flex items-center gap-1 p-2 bg-gray-100 rounded">
          {/* Root breadcrumb */}
          <span
            className="px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
            onClick={() => selectLevel(0)}
          >
            Categories
          </span>
          {path.length > 0 && <ChevronRight className="h-3 w-3 text-gray-500" />}
          
          {path.map((segment: string, idx: number) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="h-3 w-3 text-gray-500" />}
              <span
                className={`px-2 py-1 rounded cursor-pointer ${
                  idx === path.length - 1 ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                }`}
                onClick={() => selectLevel(idx + 1)}
              >
                {segment}
              </span>
            </React.Fragment>
          ))}
        </div>
        
        <div className="border rounded p-3 space-y-2">
          {currentOptions.map((option: string) => (
            <div
              key={option}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
              onClick={() => selectItem(option)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 9. Token Input with Suggestions
const TokenInputSuggestions = () => {
  const [tags, setTags] = useState(['Python', 'JavaScript']);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const allTags = ['Python', 'JavaScript', 'Ruby', 'Rust', 'Go', 'Java', 'C++', 'TypeScript'];
  const filtered = allTags.filter(tag => 
    !tags.includes(tag) && tag.toLowerCase().includes(input.toLowerCase())
  );

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      tags,
      input,
      showSuggestions
    };
  }, [tags, input, showSuggestions]);
  

  return (
    <div>
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[50px] bg-white">
          {tags.map((tag: string, idx: number) => (
            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-purple-900"
                onClick={() => setTags(tags.filter((_, i) => i !== idx))}
              />
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSuggestions(input.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="flex-1 min-w-[100px] outline-none text-sm"
            placeholder="Type to search..."
          />
        </div>
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            {filtered.map((tag: string) => (
              <div
                key={tag}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setTags([...tags, tag]);
                  setInput('');
                  setShowSuggestions(false);
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 10. Readonly with Edit Button
const ReadonlyWithEdit = () => {
  const [value, setValue] = useState('Default Template');
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const templates = ['Default Template', 'Custom Report Template', 'Monthly Summary', 'Executive Brief'];

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      value,
      isEditing,
      showDropdown
    };
  }, [value, isEditing, showDropdown]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <div className={`px-3 py-2 border rounded-md ${isEditing ? 'bg-white' : 'bg-gray-100'}`}>
            <span className="text-gray-700">{value}</span>
          </div>
          {isEditing && showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {templates.map((template: string) => (
                <div
                  key={template}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setValue(template);
                    setShowDropdown(false);
                    setIsEditing(false);
                  }}
                >
                  {template}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setIsEditing(true);
            setShowDropdown(true);
          }}
          className="p-2 border rounded-md hover:bg-gray-100"
          disabled={isEditing}
        >
          <Edit2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// 11. Type-Through Safety
const TypeThroughSafety = () => {
  const [input, setInput] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [confirmed, setConfirmed] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const options = ['Delete: Test Database', 'Delete: Staging Database', 'Delete: Production Database'];
  const filtered = options.filter(opt => opt.toLowerCase().includes(input.toLowerCase()));

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      input,
      highlightIndex,
      confirmed,
      showDropdown
    };
  }, [input, highlightIndex, confirmed, showDropdown]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && event.target && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setHighlightIndex(-1);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      setConfirmed(filtered[highlightIndex]);
      setInput(filtered[highlightIndex]);
      setHighlightIndex(-1);
      setShowDropdown(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setHighlightIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setHighlightIndex(-1);
    setShowDropdown(value.length > 0 && filtered.length > 0);
  };

  return (
    <div>
      <div className="relative" ref={containerRef}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 border-2 border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Type to confirm deletion..."
        />
        {showDropdown && input && filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-red-500 rounded-md shadow-lg">
            <div className="px-3 py-1 bg-red-50 text-red-700 text-sm font-semibold">
              ⚠️ Use arrow keys to select
            </div>
            {filtered.map((opt: string, idx: number) => (
              <div
                key={opt}
                className={`px-3 py-2 cursor-pointer ${
                  idx === highlightIndex ? 'bg-red-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  setConfirmed(opt);
                  setInput(opt);
                  setHighlightIndex(-1);
                  setShowDropdown(false);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
      {confirmed && (
        <p className="mt-2 text-sm">
          Confirmed: <strong className="text-red-600">{confirmed}</strong>
        </p>
      )}
    </div>
  );
};

// 12. Compact Table Cell
const CompactTableCell = () => {
  const [status, setStatus] = useState('Active');
  const [editing, setEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const statuses = ['Active', 'Pending', 'Archived', 'Deleted'];

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      status,
      editing,
      showDropdown
    };
  }, [status, editing, showDropdown]);

  return (
    <div>
      <table className="w-full border rounded">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-4 py-2 text-sm">Name</th>
            <th className="text-left px-4 py-2 text-sm">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2">Project Alpha</td>
            <td className="px-4 py-2">
              {!editing ? (
                <span
                  className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded cursor-pointer"
                  onClick={() => {
                    setEditing(true);
                    setShowDropdown(true);
                  }}
                >
                  {status}
                </span>
              ) : (
                <div className="relative">
                  <div className="px-2 py-1 bg-white border rounded">
                    {status}
                  </div>
                  {showDropdown && (
                    <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg">
                      {statuses.map((s: string) => (
                        <div
                          key={s}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                          onClick={() => {
                            setStatus(s);
                            setEditing(false);
                            setShowDropdown(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setEditing(false);
                              setShowDropdown(false);
                            }
                          }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// 13. Pills with Overflow
const PillsWithOverflow = () => {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(['Marketing', 'Sales', 'Support']);
  
  const all = ['Marketing', 'Sales', 'Support', 'Engineering', 'Design', 'Product'];

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      expanded,
      selected
    };
  }, [expanded, selected]);

  return (
    <div>
      <div className="relative">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white hover:bg-gray-50"
        >
          <span>{selected.length} selected</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        
        {expanded && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-3 space-y-2">
            {all.map(item => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(item)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected([...selected, item]);
                    } else {
                      setSelected(selected.filter(s => s !== item));
                    }
                  }}
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 14. Ghost Suggestion Terminal
const GhostSuggestionTerminal = () => {
  const [input, setInput] = useState('ls -la');
  const [suggestion, setSuggestion] = useState('');
  const inputRef = useRef(null);
  
  const commands = {
    'git c': 'ommit -m "message"',
    'npm r': 'un build',
    'npm i': 'nstall',
    'docker ': 'compose up'
  };

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      input,
      suggestion
    };
  }, [input, suggestion]);
  

  useEffect(() => {
    const match = Object.entries(commands).find(([prefix]: [string, string]) => 
      input === prefix
    );
    setSuggestion(match ? match[1] : '');
  }, [input]);

  const acceptSuggestion = () => {
    if (suggestion) {
      setInput(input + suggestion);
      setSuggestion('');
    }
  };

  const clearLine = () => {
    setInput('');
    setSuggestion('');
  };

  return (
    <div>
      <div className="bg-black text-white p-4 rounded font-mono">
        <div className="flex items-center">
          <span className="text-green-400">$ </span>
          <div className="flex-1 relative">
            <div className="relative inline-block">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && suggestion) {
                    e.preventDefault();
                    acceptSuggestion();
                  } else if (e.ctrlKey && e.key === 'c') {
                    e.preventDefault();
                    clearLine();
                  }
                }}
                className="bg-transparent outline-none text-white caret-white"
                style={{ 
                  width: `${Math.max(input.length + (suggestion ? suggestion.length : 0), 20)}ch`,
                  minWidth: '20ch'
                }}
              />
              {suggestion && (
                <span 
                  className="absolute top-0 left-0 text-gray-400 pointer-events-none whitespace-pre"
                  style={{ paddingLeft: `${input.length}ch` }}
                >
                  {suggestion}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Ctrl+C: clear line | Type "npm r" to see suggestion | Tab: accept
        </div>
      </div>
    </div>
  );
};

// 15. Grouped with Recent
const GroupedWithRecent = () => {
  const [selected, setSelected] = useState('Dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const recent = ['Dashboard', 'Settings', 'Profile'];
  const all = ['Analytics', 'Dashboard', 'Reports', 'Settings', 'Profile', 'Users', 'Billing'];

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selected,
      showDropdown
    };
  }, [selected, showDropdown]);

  return (
    <div>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-white"
        >
          <span>{selected}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
              Recent
            </div>
            {recent.map(item => (
              <div
                key={`recent-${item}`}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelected(item);
                  setShowDropdown(false);
                }}
              >
                {item}
              </div>
            ))}
            <div className="border-t my-1"></div>
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
              All Pages
            </div>
            {all.sort().map(item => (
              <div
                key={`all-${item}`}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelected(item);
                  setShowDropdown(false);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 16. Async Search Combo
const AsyncSearchCombo = () => {
  const [search, setSearch] = useState('Project Al');
  const [isSearching, setIsSearching] = useState(true);
  const [results, setResults] = useState(['Project Alpha', 'Project Alchemy']);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      search,
      isSearching,
      results,
      selected
    };
  }, [search, isSearching, results, selected]);
  

  useEffect(() => {
    if (!search) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const timer = setTimeout(() => {
      const allProjects = [
        'Project Alpha Redesign 2024',
        'Project Alpha Legacy',
        'Project Beta 2023',
        'Project Alpine Migration'
      ];
      setResults(allProjects.filter(p => 
        p.toLowerCase().includes(search.toLowerCase())
      ));
      setIsSearching(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search projects..."
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 animate-spin" />
        )}
        
        {!isSearching && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            {results.map(result => (
              <div
                key={result}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelected(result);
                  setSearch(result);
                }}
              >
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <p className="mt-2 text-sm">Selected: <strong>{selected}</strong></p>
      )}
    </div>
  );
};

// 17. Required Field with Error
const RequiredFieldWithError = () => {
  const [value, setValue] = useState('Custom');
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('Please select a valid option');
  
  const validOptions = ['Standard', 'Premium', 'Enterprise'];

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      value,
      showDropdown,
      error
    };
  }, [value, showDropdown, error]);

  const selectOption = (option: string) => {
    setValue(option);
    setError('');
    setShowDropdown(false);
  };

  return (
    <div>
      <div className="relative">
        <div 
          className={`flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className={value === 'Custom' ? 'text-red-600' : ''}>{value}</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            {validOptions.map((option: string) => (
              <div
                key={option}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  selectOption(option);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 18. Mobile Modal Picker
const MobileModalPicker = () => {
  const [selected, setSelected] = useState('Large');
  const [showModal, setShowModal] = useState(false);
  const [tempSelected, setTempSelected] = useState('Large');
  
  const sizes = ['Small', 'Medium', 'Large', 'Extra Large'];

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selected,
      showModal,
      tempSelected
    };
  }, [selected, showModal, tempSelected]);

  const handleDone = () => {
    setSelected(tempSelected);
    setShowModal(false);
  };

  return (
    <div>
      <button
        onClick={() => {
          setShowModal(true);
          setTempSelected(selected);
        }}
        className="w-full px-3 py-2 border rounded-md bg-white text-left"
      >
        Size: {selected}
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
              <h3 className="font-semibold">Select Size</h3>
              <button
                onClick={handleDone}
                className="text-blue-600 font-semibold"
              >
                Done
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {sizes.map((size: string) => (
                <label
                  key={size}
                  className="flex items-center justify-between px-4 py-3 border-b cursor-pointer"
                >
                  <span>{size}</span>
                  <input
                    type="radio"
                    checked={tempSelected === size}
                    onChange={() => setTempSelected(size)}
                    className="h-4 w-4"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 19. Frequency-Sorted Tags
const FrequencySortedTags = () => {
  const [tags, setTags] = useState(['Vue', 'Angular']);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const tagFrequency: Record<string, number> = {
    'React': 47,
    'Vue': 23,
    'Angular': 19,
    'Svelte': 8,
    'Ember': 3
  };
  
  const available = Object.keys(tagFrequency)
    .filter(tag => !tags.includes(tag))
    .sort((a: string, b: string) => tagFrequency[b] - tagFrequency[a]);
    
  const filtered = available.filter(tag =>
    tag.toLowerCase().includes(input.toLowerCase())
  );

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      tags,
      input,
      showSuggestions
    };
  }, [tags, input, showSuggestions]);
  

  return (
    <div>
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[50px] bg-white">
          {tags.map((tag: string, idx: number) => (
            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-green-900"
                onClick={() => setTags(tags.filter((_, i) => i !== idx))}
              />
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="flex-1 min-w-[100px] outline-none text-sm"
            placeholder="Add framework..."
          />
        </div>
        
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            {filtered.map((tag: string) => (
              <div
                key={tag}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                onClick={() => {
                  setTags([...tags, tag]);
                  setInput('');
                }}
              >
                <span>{tag}</span>
                <span className="text-xs text-gray-500">
                  used {tagFrequency[tag]} times
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 20. Time Zone Combo
const TimeZoneCombo = () => {
  const [selected, setSelected] = useState('PST (UTC-8)');
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const timezones = [
    { name: 'PST (UTC-8)', city: 'Los Angeles' },
    { name: 'EST (UTC-5)', city: 'New York' },
    { name: 'CST (UTC-6)', city: 'Chicago' },
    { name: 'JST (UTC+9)', city: 'Tokyo' },
    { name: 'GMT (UTC+0)', city: 'London' },
    { name: 'CET (UTC+1)', city: 'Paris' }
  ];
  
  const filtered = timezones.filter(tz =>
    tz.name.toLowerCase().includes(search.toLowerCase()) ||
    tz.city.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selected,
      search,
      showDropdown
    };
  }, [selected, search, showDropdown]);
  

  return (
    <div>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center gap-2 px-3 py-2 border rounded-md bg-white"
        >
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="flex-1 text-left">{selected}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border-b"
              placeholder="Search timezone or city..."
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(tz => (
                <div
                  key={tz.name}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelected(tz.name);
                    setShowDropdown(false);
                    setSearch('');
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span>{tz.name}</span>
                    <span className="text-sm text-gray-500">{tz.city}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Task data
const tasks = [
  { 
    id: 1, 
    name: 'Tag-Based Email Recipients', 
    component: TagEmailRecipients,
    task: 'Replace all emails with just "all-hands@company.com", hit enter to save.',
    ux: 'Click × to remove emails, type and press Enter to add',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.emails?.length === 1 && appState?.emails?.[0] === 'all-hands@company.com';
      return { success };
    }
  },
  { 
    id: 2, 
    name: 'Validated Username Field', 
    component: ValidatedUsername,
    task: 'Change username to "alexandra_s"',
    ux: 'Triple-click to select all, wait for validation to complete',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.username === 'alexandra_s' && appState?.isValid && !appState?.isValidating;
      return { success };
    }
  },
  { 
    id: 3, 
    name: 'Country-City Cascade', 
    component: CountryCityCascade,
    task: 'Change to United States → New York',
    ux: 'Changing country automatically clears city',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.country === 'United States' && appState?.city === 'New York';
      return { success };
    }
  },
  { 
    id: 4, 
    name: 'Inline Editable Status', 
    component: InlineEditableStatus,
    task: 'Change status to "Completed"',
    ux: 'Click text to reveal dropdown, no × button',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.status === 'Completed';
      return { success };
    }
  },
  { 
    id: 5, 
    name: 'Search-Filter Multi-Select', 
    component: SearchFilterMultiSelect,
    task: 'Click "Clear all", then check Engineering and Design',
    ux: 'Use Clear all button, then select specific items',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selected?.length === 2 && 
        appState?.selected?.includes('Engineering') && 
        appState?.selected?.includes('Design');
      return { success };
    }
  },
  { 
    id: 6, 
    name: 'Fuzzy Command Palette', 
    component: FuzzyCommandPalette,
    task: 'Execute "Settings: Toggle Dark Mode"',
    ux: 'Escape clears selection but keeps modal open',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selected === 'Settings: Toggle Dark Mode' && !appState?.isOpen;
      return { success };
    }
  },
  { 
    id: 7, 
    name: 'Date Range Preset', 
    component: DateRangePreset,
    task: 'Set custom range: Jan 1-15, 2024',
    ux: 'Select "Custom Range" to reveal date pickers',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.preset === 'Custom Range' && 
        appState?.customStart === '2024-01-01' && 
        appState?.customEnd === '2024-01-15';
      return { success };
    }
  },
  { 
    id: 8, 
    name: 'Hierarchical Tree Select', 
    component: HierarchicalTreeSelect,
    task: 'Navigate to Electronics → Computers → Laptops',
    ux: 'Click breadcrumb segments to go back',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.path?.join(' > ') === 'Electronics > Computers > Laptops';
      return { success };
    }
  },
  { 
    id: 9, 
    name: 'Token Input with Suggestions', 
    component: TokenInputSuggestions,
    task: 'Keep Python, remove JavaScript, add Ruby and Rust',
    ux: 'Can\'t edit tags directly, only remove with × and add new ones',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.tags?.length === 3 && 
        appState?.tags?.includes('Python') && 
        appState?.tags?.includes('Ruby') && 
        appState?.tags?.includes('Rust') &&
        !appState?.tags?.includes('JavaScript');
      return { success };
    }
  },
  { 
    id: 10, 
    name: 'Readonly with Edit Button', 
    component: ReadonlyWithEdit,
    task: 'Change to "Custom Report Template"',
    ux: 'Click pencil icon to enable dropdown',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.value === 'Custom Report Template' && !appState?.isEditing;
      return { success };
    }
  },
  { 
    id: 11, 
    name: 'Type-Through Safety', 
    component: TypeThroughSafety,
    task: 'Confirm "Delete: Production Database" exactly',
    ux: 'Type to filter, use arrow keys to select, Enter to confirm',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.confirmed === 'Delete: Production Database';
      return { success };
    }
  },
  { 
    id: 12, 
    name: 'Compact Table Cell', 
    component: CompactTableCell,
    task: 'Change status to "Archived"',
    ux: 'Click to edit inline, Escape cancels without saving',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.status === 'Archived';
      return { success };
    }
  },
  { 
    id: 13, 
    name: 'Pills with Overflow', 
    component: PillsWithOverflow,
    task: 'Keep only "Marketing" selected',
    ux: 'Click to expand, uncheck items individually',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selected?.length === 1 && appState?.selected?.[0] === 'Marketing';
      return { success };
    }
  },
  { 
    id: 14, 
    name: 'Ghost Suggestion Terminal', 
    component: GhostSuggestionTerminal,
    task: 'Change to "npm run build"',
    ux: 'Ctrl+C clears line, Tab accepts suggestion',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.input === 'npm run build';
      return { success };
    }
  },
  { 
    id: 15, 
    name: 'Grouped with Recent', 
    component: GroupedWithRecent,
    task: 'Select "Analytics" from the main list',
    ux: 'Recent section at top, then alphabetical list',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selected === 'Analytics';
      return { success };
    }
  },
  { 
    id: 16, 
    name: 'Async Search Combo', 
    component: AsyncSearchCombo,
    task: 'Select "Project Alpha Redesign 2024"',
    ux: 'Wait for search, typing cancels current search',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selected === 'Project Alpha Redesign 2024';
      return { success };
    }
  },
  { 
    id: 17, 
    name: 'Required Field with Error', 
    component: RequiredFieldWithError,
    task: 'Select "Standard" from the dropdown',
    ux: 'Clear invalid entry and select from allowed options',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.value === 'Standard' && !appState?.error;
      return { success };
    }
  },
  { 
    id: 18, 
    name: 'Mobile Modal Picker', 
    component: MobileModalPicker,
    task: 'Change size to "Small"',
    ux: 'Open modal, select, then tap Done to confirm',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selected === 'Small';
      return { success };
    }
  },
  { 
    id: 19, 
    name: 'Frequency-Sorted Tags', 
    component: FrequencySortedTags,
    task: 'Remove all tags, then add only "React"',
    ux: 'Most used tags appear first in suggestions',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.tags?.length === 1 && appState?.tags?.[0] === 'React';
      return { success };
    }
  },
  { 
    id: 20, 
    name: 'Time Zone Combo', 
    component: TimeZoneCombo,
    task: 'Change to JST (UTC+9)',
    ux: 'Type city or timezone to filter',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selected === 'JST (UTC+9)';
      return { success };
    }
  }
];

// Programmatic export metadata
export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Combo Box Task Scenarios', appPath: '/combo-box-tasks' };

// Main App using TaskWrapper
export default function App() {
  return (
    <TaskWrapper 
      tasks={tasks}
      appName="Combo Box Task Scenarios"
      appPath="/combo-box-tasks"
    />
  );
}