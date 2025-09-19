import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Grid, List, Trash2, Heart, Share, Plus, Minus } from 'lucide-react';
import TaskWrapper from '../src/TaskWrapper';


// 1. Numbered Page Strips
const NumberedPageStrips = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 8;

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      currentPage,
      totalPages
    };
  }, [currentPage, totalPages]);

  const renderPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div>
      <div className="flex items-center justify-center space-x-1">
        {renderPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === 'number' && setCurrentPage(page)}
            className={`px-3 py-2 rounded-md text-sm ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : typeof page === 'number'
                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-white text-gray-400 cursor-default'
            }`}
            disabled={typeof page !== 'number'}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

// 2. Next/Previous Controls
const NextPreviousControls = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6;

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      currentPage,
      totalPages
    };
  }, [currentPage, totalPages]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>
        
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// 3. Load More Appenders
const LoadMoreAppenders = () => {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4']);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      items: items.length,
      loading
    };
  }, [items.length, loading]);

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      const newItems = Array.from({ length: 4 }, (_, i) => 
        `Item ${items.length + i + 1}`
      );
      setItems(prev => [...prev, ...newItems]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (!loading && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [items, loading]);

  return (
    <div>
      <div ref={listRef} className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
        {items.map((item) => (
          <div key={item} className="p-2 bg-gray-50 rounded">
            {item}
          </div>
        ))}
      </div>
      {items.length < 16 && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

// 4. Infinite Scroll with Sentinel
const InfiniteScrollSentinel = () => {
  const [items, setItems] = useState(Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`));
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      items: items.length,
      loading
    };
  }, [items.length, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && items.length < 50) {
          setLoading(true);
          setTimeout(() => {
            const newItems = Array.from({ length: 10 }, (_, i) => 
              `Item ${items.length + i + 1}`
            );
            setItems(prev => [...prev, ...newItems]);
            setLoading(false);
          }, 800);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [items.length, loading]);

  return (
    <div>
      <div className="h-60 overflow-y-auto border rounded-md p-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="p-3 bg-gray-50 rounded">
            {item}
          </div>
        ))}
        {items.length < 50 && (
          <div ref={sentinelRef} className="py-4 text-center">
            {loading ? 'Loading more items...' : 'Scroll to load more'}
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Windowed Lists with Recycling
const WindowedRecyclingList = () => {
  const [items] = useState(Array.from({ length: 25 }, (_, i) => `Large Dataset Item ${i + 1}`));
  const [scrollTop, setScrollTop] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [visibleCount, setVisibleCount] = useState(10);
  const itemHeight = 40;
  const containerHeight = 400;

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedIndex,
      visibleCount,
      scrollTop
    };
  }, [selectedIndex, visibleCount, scrollTop]);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  const visibleItems = items.slice(startIndex, endIndex);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPos = e.currentTarget.scrollTop;
    setScrollTop(scrollPos);
    // If scrolled to bottom, load 5 more items (up to 25)
    if (
      e.currentTarget.scrollHeight - scrollPos - containerHeight < 5 &&
      visibleCount < 25
    ) {
      setVisibleCount((prev) => Math.min(prev + 5, 25));
    }
  };

  return (
    <div>
      <div 
        className="border rounded-md overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: items.length * itemHeight, position: 'relative' }}>
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <div
                key={actualIndex}
                style={{
                  position: 'absolute',
                  top: actualIndex * itemHeight,
                  left: 0,
                  right: 0,
                  height: itemHeight,
                }}
                className={`flex items-center px-3 cursor-pointer hover:bg-gray-50 ${
                  selectedIndex === actualIndex ? 'bg-blue-100' : ''
                }`}
                onClick={() => setSelectedIndex(actualIndex)}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 6. Reverse Chat Stream  
const ReverseChatStream = () => {
  const [messages, setMessages] = useState([
    { id: 5, text: 'Latest message', time: '10:35 AM' },
    { id: 4, text: 'Previous message', time: '10:32 AM' },
    { id: 3, text: 'Earlier message', time: '10:30 AM' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      messages: messages.length,
      loading
    };
  }, [messages.length, loading]);

  const loadOlderMessages = () => {
    setLoading(true);
    setTimeout(() => {
      const oldestId = Math.min(...messages.map(m => m.id));
      const newMessages = Array.from({ length: 3 }, (_, i) => ({
        id: oldestId - i - 1,
        text: `Older message ${oldestId - i - 1}`,
        time: `10:${25 - (oldestId - i - 1)}AM`
      }));
      setMessages(prev => [...prev, ...newMessages]);
      setLoading(false);
    }, 800);
  };

  return (
    <div>
      <div className="h-48 overflow-y-auto border rounded-md p-3 space-y-2">
        {loading && (
          <div className="text-center py-2 text-gray-500">Loading older messages...</div>
        )}
        {messages.length < 15 && !loading && (
          <button
            onClick={loadOlderMessages}
            className="w-full py-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            Load older messages
          </button>
        )}
        {[...messages].reverse().map((message) => (
          <div key={message.id} className="bg-gray-100 rounded p-2 text-sm">
            <div className="font-medium">{message.text}</div>
            <div className="text-gray-500 text-xs">{message.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. Mixed Height Virtualization
const MixedHeightVirtual = () => {
  const [selectedId, setSelectedId] = useState(-1);
  const items = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
    content: i % 3 === 0 ? 'Short' : i % 3 === 1 ? 'Medium length content here' : 'Very long content\n\n\nthat demonstrates\n\n\nvariable height\n\n\nwith extensive text'
  }));

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedId
    };
  }, [selectedId]);

  return (
    <div>
      <div className="h-60 overflow-y-auto border rounded-md p-2 space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3 cursor-pointer hover:bg-gray-50 border rounded ${
              selectedId === item.id ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
            }`}
            onClick={() => setSelectedId(item.id)}
          >
            <div className="font-medium text-sm">{item.title}</div>
            <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 8. Sticky Sentinels
const StickySentinels = () => {
  const [sections, setSections] = useState([
    { id: 'A', title: 'Section A', items: ['A1', 'A2'], hasMore: true },
    { id: 'B', title: 'Section B', items: ['B1', 'B2'], hasMore: true }
  ]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      sections: sections.map(s => ({ id: s.id, itemCount: s.items.length })),
      loading
    };
  }, [sections, loading]);

  const loadMore = (sectionId: string) => {
    setLoading(prev => ({ ...prev, [sectionId]: true }));
    setTimeout(() => {
      setSections(prev => prev.map(section => {
        if (section.id === sectionId) {
          const newItems = [`${sectionId}${section.items.length + 1}`, `${sectionId}${section.items.length + 2}`];
          return { ...section, items: [...section.items, ...newItems] };
        }
        return section;
      }));
      setLoading(prev => ({ ...prev, [sectionId]: false }));
    }, 800);
  };

  return (
    <div>
      <div className="h-48 overflow-y-auto border rounded-md">
        {sections.map((section) => (
          <div key={section.id}>
            <div className="sticky top-0 bg-gray-200 px-3 py-2 text-sm font-medium">
              {section.title}
            </div>
            <div className="p-3 space-y-1">
              {section.items.map((item) => (
                <div key={item} className="p-2 bg-gray-50 rounded text-sm">{item}</div>
              ))}
              <button
                onClick={() => loadMore(section.id)}
                disabled={loading[section.id]}
                className="w-full py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
              >
                {loading[section.id] ? 'Loading...' : 'Load more'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 9. Sortable Table Headers
const SortableTable = () => {
  const [data, setData] = useState([
    { id: 1, name: 'Alice', age: 30, dept: 'Engineering' },
    { id: 2, name: 'Bob', age: 25, dept: 'Sales' },
    { id: 3, name: 'Charlie', age: 35, dept: 'Marketing' },
    { id: 4, name: 'Diana', age: 28, dept: 'Engineering' }
  ]);
  const [sortBy, setSortBy] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      sortBy,
      sortDesc
    };
  }, [sortBy, sortDesc]);

  const sort = (column: 'name' | 'age' | 'dept') => {
    // Calculate what the new sort state will be
    const newSortBy = column;
    const newSortDesc = sortBy === column ? !sortDesc : false;
    
    // Update state
    setSortBy(newSortBy);
    setSortDesc(newSortDesc);
    
    // Sort using the new values (not old state)
    setData(prev => [...prev].sort((a, b) => {
      const aVal = a[column as keyof typeof a] as number | string;
      const bVal = b[column as keyof typeof b] as number | string;
      const modifier = newSortDesc ? -1 : 1;
      return aVal > bVal ? modifier : -modifier;
    }));
  };

  return (
    <div>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
                {(['name', 'age', 'dept'] as const).map(col => (
                <th
                  key={col}
                  onClick={() => sort(col)}
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 font-medium text-sm capitalize"
                >
                  {col} {sortBy === col && (sortDesc ? '↓' : '↑')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{row.name}</td>
                <td className="px-4 py-2 text-sm">{row.age}</td>
                <td className="px-4 py-2 text-sm">{row.dept}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 10. Inline Filter Cells
const InlineFilterTable = () => {
  const allData = [
    { id: 1, name: 'Apple', category: 'Fruit', price: 1.50 },
    { id: 2, name: 'Banana', category: 'Fruit', price: 0.80 },
    { id: 3, name: 'Carrot', category: 'Vegetable', price: 1.20 },
    { id: 4, name: 'Spinach', category: 'Vegetable', price: 2.00 }
  ];
  const [filters, setFilters] = useState({ name: '', category: '', price: '' });

  const filteredData = allData.filter(item =>
    item.name.toLowerCase().includes(filters.name.toLowerCase()) &&
    item.category.toLowerCase().includes(filters.category.toLowerCase()) &&
    item.price.toString().includes(filters.price)
  );

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      filters,
      filteredData: filteredData.map(item => ({ id: item.id, category: item.category }))
    };
  }, [filters, filteredData]);

  return (
    <div>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-sm">
                Name
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full px-2 py-1 text-xs border rounded"
                  placeholder="Filter..."
                />
              </th>
              <th className="px-4 py-2 text-left font-medium text-sm">
                Category
                <input
                  type="text"
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full px-2 py-1 text-xs border rounded"
                  placeholder="Filter..."
                />
              </th>
              <th className="px-4 py-2 text-left font-medium text-sm">
                Price
                <input
                  type="text"
                  value={filters.price}
                  onChange={(e) => setFilters(prev => ({ ...prev, price: e.target.value }))}
                  className="mt-1 w-full px-2 py-1 text-xs border rounded"
                  placeholder="Filter..."
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(row => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{row.name}</td>
                <td className="px-4 py-2 text-sm">{row.category}</td>
                <td className="px-4 py-2 text-sm">${row.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 11. Frozen Header Table
const FrozenHeaderTable = () => {
  const data = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    product: `Product ${i + 1}`,
    sales: Math.floor(Math.random() * 1000),
    region: ['North', 'South', 'East', 'West'][i % 4]
  })), []);
  const [selectedId, setSelectedId] = useState(-1);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedId
    };
  }, [selectedId]);

  return (
    <div>
      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-50 border-b">
          <div className="flex">
            <div className="w-24 px-4 py-2 text-left font-medium text-sm">ID</div>
            <div className="flex-1 px-4 py-2 text-left font-medium text-sm">Product</div>
            <div className="w-20 px-4 py-2 text-left font-medium text-sm">Sales</div>
            <div className="w-20 px-4 py-2 text-left font-medium text-sm">Region</div>
          </div>
        </div>
        <div className="h-48 overflow-y-auto">
          {data.map(row => (
            <div
              key={row.id}
              onClick={() => setSelectedId(row.id)}
              className={`flex border-b hover:bg-gray-50 cursor-pointer ${
                selectedId === row.id ? 'bg-blue-100' : ''
              }`}
            >
              <div className="w-24 px-4 py-2 text-sm">{row.id}</div>
              <div className="flex-1 px-4 py-2 text-sm">{row.product}</div>
              <div className="w-20 px-4 py-2 text-sm">{row.sales}</div>
              <div className="w-20 px-4 py-2 text-sm">{row.region}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 12. Collapsible Group Rows
const CollapsibleGroupRows = () => {
  const [expanded, setExpanded] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedItem,
      expanded: Array.from(expanded)
    };
  }, [selectedItem, expanded]);

  const groups: Record<string, string[]> = {
    'Engineering': ['Frontend Developer', 'Backend Developer', 'DevOps Engineer'],
    'Design': ['UI Designer', 'UX Researcher', 'Graphic Designer'],
    'Marketing': ['Content Writer', 'SEO Specialist', 'Social Media Manager']
  };

  const toggle = (group: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpanded(newExpanded);
  };

  return (
    <div>
      <div className="border rounded-md overflow-hidden">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <div
              onClick={() => toggle(group)}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b cursor-pointer hover:bg-gray-100"
            >
              <span className="font-medium text-sm">{group} ({items.length})</span>
              {expanded.has(group) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
            {expanded.has(group) && (
              <div>
                {items.map(item => (
                  <div
                    key={item}
                    onClick={() => setSelectedItem(item)}
                    className={`px-8 py-2 border-b cursor-pointer hover:bg-gray-50 text-sm ${
                      selectedItem === item ? 'bg-blue-100' : ''
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 13. Grouped Lists with Sticky Headers
const GroupedStickyLists = () => {
  const [selectedLetter, setSelectedLetter] = useState('');

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedLetter
    };
  }, [selectedLetter]);

  const contacts: Record<string, string[]> = {
    'A': ['Alice', 'Andrew', 'Anna'],
    'B': ['Bob', 'Betty', 'Brian'],
    'C': ['Charlie', 'Catherine', 'Chris'],
    'D': ['Diana', 'David', 'Daniel'],
    'M': ['Michael', 'Maria', 'Mark']
  };

  return (
    <div>
      <div className="h-48 overflow-y-auto border rounded-md">
        {Object.entries(contacts).map(([letter, names]) => (
          <div key={letter}>
            <div
              onClick={() => setSelectedLetter(letter)}
              className={`sticky top-0 px-4 py-2 text-sm font-bold cursor-pointer ${
                selectedLetter === letter ? 'bg-blue-200' : 'bg-gray-200'
              }`}
            >
              {letter}
            </div>
            {names.map(name => (
              <div key={name} className="px-6 py-2 hover:bg-gray-50 text-sm border-b">
                {name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// 14. Collapsible List Sections
const CollapsibleListSections = () => {
  const sections = [
    { title: 'Personal Tasks', items: ['Task 1.1', 'Task 1.2', 'Task 1.3'] },
    { title: 'Work Tasks', items: ['Task 2.1', 'Task 2.2', 'Task 2.3'] },
    { title: 'Shopping', items: ['Task 3.1', 'Task 3.2'] }
  ];
  const [collapsed, setCollapsed] = useState(new Set(sections.map(s => s.title)));
  const [checkedItems, setCheckedItems] = useState(new Set());

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      checkedItems: Array.from(checkedItems),
      collapsed: Array.from(collapsed)
    };
  }, [checkedItems, collapsed]);

  const toggleSection = (title: string) => {
    const newCollapsed = new Set(collapsed);
    if (newCollapsed.has(title)) {
      newCollapsed.delete(title);
    } else {
      newCollapsed.add(title);
    }
    setCollapsed(newCollapsed);
  };

  const toggleItem = (item: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedItems(newChecked);
  };

  return (
    <div>
      <div className="border rounded-md overflow-hidden">
        {sections.map(section => (
          <div key={section.title}>
            <div
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b cursor-pointer hover:bg-gray-100"
            >
              <span className="font-medium text-sm">{section.title}</span>
              {collapsed.has(section.title) ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            </div>
            {!collapsed.has(section.title) && (
              <div>
                {section.items.map(item => (
                  <div key={item} className="flex items-center px-6 py-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={checkedItems.has(item)}
                      onChange={() => toggleItem(item)}
                      className="mr-3"
                    />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 15. Checklist Multi-Selection
const ChecklistMultiSelection = () => {
  const [selected, setSelected] = useState(new Set());
  const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selected: Array.from(selected),
      selectedCount: selected.size
    };
  }, [selected]);

  const toggle = (item: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(item)) {
      newSelected.delete(item);
    } else {
      newSelected.add(item);
    }
    setSelected(newSelected);
  };

  return (
    <div>
      <div className="space-y-2">
        {items.map(item => (
          <label key={item} className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.has(item)}
              onChange={() => toggle(item)}
              className="mr-3"
            />
            <span className="text-sm">{item}</span>
          </label>
        ))}
      </div>
      <div className="mt-3 text-sm text-gray-600">
        Selected: {selected.size} items
      </div>
    </div>
  );
};

// 16. Swipe Reveal Actions
const SwipeRevealActions = () => {
  const [revealed, setRevealed] = useState(-1);
  const [items, setItems] = useState([
    { id: 1, text: 'Email client meeting notes', liked: false },
    { id: 2, text: 'Review quarterly budget', liked: false },
    { id: 3, text: 'Update project timeline', liked: false }
  ]);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      items: items.map(item => ({ id: item.id, liked: item.liked })),
      revealed
    };
  }, [items, revealed]);

  const toggleLike = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, liked: !item.liked } : item
    ));
    setRevealed(-1);
  };

  const deleteItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setRevealed(-1);
  };

  return (
    <div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="relative border rounded-md overflow-hidden">
            <div
              onClick={() => setRevealed(revealed === item.id ? -1 : item.id)}
              className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-gray-50"
            >
              <span className="text-sm">{item.text}</span>
              <span className="text-xs text-gray-500">
                {revealed === item.id ? 'Hide' : 'Actions'}
              </span>
            </div>
            {revealed === item.id && (
              <div className="flex bg-gray-50 border-t">
                <button
                  onClick={() => toggleLike(item.id)}
                  className={`flex-1 p-2 text-center hover:bg-gray-100 ${
                    item.liked ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  <Heart className={`h-4 w-4 mx-auto ${item.liked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="flex-1 p-2 text-center hover:bg-gray-100 text-gray-600"
                >
                  <Trash2 className="h-4 w-4 mx-auto" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 17. Responsive Card Grid
const ResponsiveCardGrid = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCard, setSelectedCard] = useState(-1);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      viewMode,
      selectedCard
    };
  }, [viewMode, selectedCard]);

  const cards = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
    content: `Content for card ${i + 1}`
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm">View mode:</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' 
        : 'space-y-2'
      }>
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => setSelectedCard(card.id)}
            className={`p-4 border rounded-md cursor-pointer hover:shadow-md ${
              selectedCard === card.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            } ${viewMode === 'list' ? 'flex items-center space-x-4' : ''}`}
          >
            <div className={viewMode === 'list' ? 'flex-1' : ''}>
              <h3 className="font-medium text-sm">{card.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{card.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 18. Masonry Waterfall Layout
const MasonryWaterfallLayout = () => {
  const [selectedCard, setSelectedCard] = useState(-1);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedCard
    };
  }, [selectedCard]);

  const cards = [
    { id: 1, title: 'Short Card', height: 'h-24', content: 'Brief content' },
    { id: 2, title: 'Medium Card', height: 'h-32', content: 'Some longer content that takes up more space' },
    { id: 3, title: 'Tall Card', height: 'h-40', content: 'Very long content that demonstrates the masonry layout with variable heights' },
    { id: 4, title: 'Another Short', height: 'h-20', content: 'Small' },
    { id: 5, title: 'Regular Card', height: 'h-28', content: 'Normal sized content' },
    { id: 6, title: 'Big Card', height: 'h-36', content: 'Larger content area for more information' }
  ];

  return (
    <div>
      <div className="columns-2 sm:columns-3 gap-4 space-y-4">
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => setSelectedCard(card.id)}
            className={`${card.height} p-4 border rounded-md cursor-pointer hover:shadow-md break-inside-avoid ${
              selectedCard === card.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <h3 className="font-medium text-sm mb-2">{card.title}</h3>
            <p className="text-xs text-gray-600">{card.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 19. Card Hover Reveals
const CardHoverReveals = () => {
  const [hoveredCard, setHoveredCard] = useState(-1);
  const [likedCards, setLikedCards] = useState(new Set());

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      likedCards: Array.from(likedCards),
      hoveredCard
    };
  }, [likedCards, hoveredCard]);

  const cards = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Product ${i + 1}`,
    price: `$${(20 + i * 5).toFixed(2)}`,
    image: `🎁`
  }));

  const toggleLike = (id: number) => {
    const newLiked = new Set(likedCards);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedCards(newLiked);
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map(card => (
          <div
            key={card.id}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(-1)}
            className="relative p-4 border rounded-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-2xl mb-2">{card.image}</div>
            <h3 className="font-medium text-sm">{card.title}</h3>
            <p className="text-sm text-gray-600">{card.price}</p>
            
            {hoveredCard === card.id && (
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => toggleLike(card.id)}
                  className={`p-1 rounded-full hover:bg-gray-100 ${
                    likedCards.has(card.id) ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${likedCards.has(card.id) ? 'fill-current' : ''}`} />
                </button>
                <button className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                  <Share className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 20. Lazy Tile Batch Loading
const LazyTileBatchLoading = () => {
  const [tiles, setTiles] = useState(Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `Tile ${i + 1}`,
    loaded: true
  })));
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      tiles: tiles.length,
      loading
    };
  }, [tiles.length, loading]);

  const loadMoreTiles = () => {
    setLoading(true);
    setTimeout(() => {
      const newTiles = Array.from({ length: 6 }, (_, i) => ({
        id: tiles.length + i + 1,
        title: `Tile ${tiles.length + i + 1}`,
        loaded: true
      }));
      setTiles(prev => [...prev, ...newTiles]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 200 && !loading && tiles.length < 30) {
          loadMoreTiles();
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loading, tiles.length]);

  return (
    <div>
      <div 
        ref={containerRef}
        className="h-64 overflow-y-auto border rounded-md p-4"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tiles.map(tile => (
            <div key={tile.id} className="aspect-square p-4 border rounded-md bg-gray-50 flex items-center justify-center">
              <span className="text-sm font-medium">{tile.title}</span>
            </div>
          ))}
          {loading && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Loading more tiles...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Task data
const tasks = [
  { 
    id: 1, 
    name: 'Numbered Page Strips', 
    component: NumberedPageStrips,
    task: 'Navigate to page 5',
    ux: 'Click page numbers with ellipsis truncation',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.currentPage === 5;
      return { success };
    }
  },
  { 
    id: 2, 
    name: 'Next/Previous Controls', 
    component: NextPreviousControls,
    task: 'Navigate to the last page using Next/Previous',
    ux: 'Buttons disabled at boundaries',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.currentPage === 6;
      return { success };
    }
  },
  { 
    id: 3, 
    name: 'Load More Appenders', 
    component: LoadMoreAppenders,
    task: 'Load at least 12 items total',
    ux: '"Load more" button adds items with loading state',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.items >= 12;
      return { success };
    }
  },
  { 
    id: 4, 
    name: 'Infinite Scroll Sentinel', 
    component: InfiniteScrollSentinel,
    task: 'Scroll to trigger loading of 30+ items',
    ux: 'Automatic loading when sentinel enters viewport',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.items >= 30;
      return { success };
    }
  },
  { 
    id: 5, 
    name: 'Windowed Recycling List', 
    component: WindowedRecyclingList,
    task: 'Select "Large Dataset Item 19"',
    ux: 'Efficient rendering of 25 items with virtualization',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedIndex === 18; // 0-based index for item 19
      return { success };
    }
  },
  { 
    id: 6, 
    name: 'Reverse Chat Stream', 
    component: ReverseChatStream,
    task: 'Load older messages 3 times (to get exactly 12 total messages)',
    ux: 'Reverse chronological order, load upward',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.messages === 12;
      return { success };
    }
  },
  { 
    id: 7, 
    name: 'Mixed Height Virtual', 
    component: MixedHeightVirtual,
    task: 'Select "Item 26"',
    ux: 'Variable height items',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedId === 25; // 0-based index for item 26
      return { success };
    }
  },
  { 
    id: 8, 
    name: 'Sticky Sentinels', 
    component: StickySentinels,
    task: 'Load until each section has 4+ items',
    ux: 'Sticky headers with per-section loading',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.sections?.every((s: any) => s.itemCount >= 4);
      return { success };
    }
  },
  { 
    id: 9, 
    name: 'Sortable Table', 
    component: SortableTable,
    task: 'Sort by Age (descending)',
    ux: 'Click headers to sort, click again to reverse',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.sortBy === 'age' && appState?.sortDesc === true;
      return { success };
    }
  },
  { 
    id: 10, 
    name: 'Inline Filter Table', 
    component: InlineFilterTable,
    task: 'Filter to show only "Fruit" category',
    ux: 'Inline filter inputs in table headers',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.filteredData?.length > 0 && 
        appState?.filteredData?.every((item: any) => item.category === 'Fruit');
      return { success };
    }
  },
  { 
    id: 11, 
    name: 'Frozen Header Table', 
    component: FrozenHeaderTable,
    task: 'Select "Product 15"',
    ux: 'Fixed header while scrolling table body',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedId === 15;
      return { success };
    }
  },
  { 
    id: 12, 
    name: 'Collapsible Group Rows', 
    component: CollapsibleGroupRows,
    task: 'Select "Backend Developer"',
    ux: 'Expandable group headers with roll-up views',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedItem === 'Backend Developer';
      return { success };
    }
  },
  { 
    id: 13, 
    name: 'Grouped Sticky Lists', 
    component: GroupedStickyLists,
    task: 'Scroll to and click the "M" group header',
    ux: 'Sticky group headers while scrolling',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedLetter === 'M';
      return { success };
    }
  },
  { 
    id: 14, 
    name: 'Collapsible List Sections', 
    component: CollapsibleListSections,
    task: 'Check "Task 2.2"',
    ux: 'Expandable sections with checkable items',
    test: () => {
      const appState = (window as any).app_state;
      const checkedItems = appState?.checkedItems || [];
      const success = checkedItems.length === 1 && checkedItems.includes('Task 2.2');
      return { success };
    }
  },
  { 
    id: 15, 
    name: 'Checklist Multi-Selection', 
    component: ChecklistMultiSelection,
    task: 'Select exactly Apple, Cherry, and Date',
    ux: 'Multi-selection state preservation',
    test: () => {
      const appState = (window as any).app_state;
      const selected = appState?.selected || [];
      const success = selected.length === 3 && 
        selected.includes('Apple') && 
        selected.includes('Cherry') && 
        selected.includes('Date');
      return { success };
    }
  },
  { 
    id: 16, 
    name: 'Swipe Reveal Actions', 
    component: SwipeRevealActions,
    task: 'Like "Review quarterly budget"',
    ux: 'Click to reveal actions, then click heart',
    test: () => {
      const appState = (window as any).app_state;
      const item2 = appState?.items?.find((item: any) => item.id === 2);
      const success = item2?.liked === true;
      return { success };
    }
  },
  { 
    id: 17, 
    name: 'Responsive Card Grid', 
    component: ResponsiveCardGrid,
    task: 'Switch to list view and select Card 4',
    ux: 'Responsive breakpoint-driven layout changes',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedCard === 4 && appState?.viewMode === 'list';
      return { success };
    }
  },
  { 
    id: 18, 
    name: 'Masonry Waterfall Layout', 
    component: MasonryWaterfallLayout,
    task: 'Select the "Tall Card"',
    ux: 'Variable height tiling in masonry layout',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.selectedCard === 3; // Tall Card is id 3
      return { success };
    }
  },
  { 
    id: 19, 
    name: 'Card Hover Reveals', 
    component: CardHoverReveals,
    task: 'Hover over Product 2 and click the heart',
    ux: 'Actions revealed on hover with inline buttons',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.likedCards?.includes(2);
      return { success };
    }
  },
  { 
    id: 20, 
    name: 'Lazy Tile Batch Loading', 
    component: LazyTileBatchLoading,
    task: 'Scroll to load 20+ tiles',
    ux: 'Batch loading triggered near viewport bottom',
    test: () => {
      const appState = (window as any).app_state;
      const success = appState?.tiles >= 20;
      return { success };
    }
  }
];

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Navigation Patterns: Lists & Tables', appPath: '/navigation-lists-tables' };

// Main App using TaskWrapper
export default function App() {
  return (
    <TaskWrapper 
      tasks={tasks}
      appName="Navigation Patterns: Lists & Tables"
      appPath="/navigation-lists-tables"
    />
  );
} 