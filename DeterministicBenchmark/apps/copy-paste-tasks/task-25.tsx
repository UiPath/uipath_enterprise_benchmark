import React, { useState, useEffect } from 'react';

// Dewey Decimal Classification Tree Structure
interface DeweyNode {
  code: string;
  label: string;
  children?: DeweyNode[];
}

interface CatalogedBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publicationYear: number;
  publisher: string;
  subjectArea: string;
  locationCode: string;
  purchasePrice: number;
  condition: string;
  deweyClassification?: string;
}

export const Task25: React.FC = () => {
  // Initialize app_state immediately to prevent race condition with test runner
  if (!(window as any).app_state) {
    (window as any).app_state = {
      catalogedBooks: [],
      currentFormEntry: {},
      formFieldsCompleted: {},
      totalCatalogedBooks: 0,
    };
  }

  const [catalogedBooks, setCatalogedBooks] = useState<CatalogedBook[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedDeweyCode, setSelectedDeweyCode] = useState<string>('');
  const [showDeweyPicker, setShowDeweyPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for book entry
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    publicationYear: '',
    publisher: '',
    subjectArea: '',
    locationCode: '',
    purchasePrice: '',
    condition: 'New'
  });

  // Dewey Decimal Classification Tree
  const deweyTree: DeweyNode[] = [
    {
      code: '000',
      label: 'Computer Science, Information & General Works',
      children: [
        { code: '000', label: 'Computer Science' },
        { code: '020', label: 'Library & Information Sciences' },
        { code: '030', label: 'General Encyclopedic Works' }
      ]
    },
    {
      code: '100',
      label: 'Philosophy & Psychology',
      children: [
        { code: '100', label: 'Philosophy' },
        { code: '130', label: 'Paranormal Phenomena' },
        { code: '150', label: 'Psychology' },
        { code: '170', label: 'Ethics' }
      ]
    },
    {
      code: '200',
      label: 'Religion',
      children: [
        { code: '200', label: 'Religion (General)' },
        { code: '220', label: 'Bible' },
        { code: '290', label: 'Other Religions' }
      ]
    },
    {
      code: '300',
      label: 'Social Sciences',
      children: [
        { code: '300', label: 'Social Sciences (General)' },
        { code: '320', label: 'Political Science' },
        { code: '330', label: 'Economics' },
        { code: '370', label: 'Education' }
      ]
    },
    {
      code: '400',
      label: 'Language',
      children: [
        { code: '400', label: 'Language (General)' },
        { code: '420', label: 'English' },
        { code: '430', label: 'German' },
        { code: '440', label: 'French' }
      ]
    },
    {
      code: '500',
      label: 'Science',
      children: [
        { code: '500', label: 'Natural Sciences' },
        { code: '510', label: 'Mathematics' },
        { code: '520', label: 'Astronomy' },
        { code: '530', label: 'Physics' },
        { code: '540', label: 'Chemistry' },
        { code: '570', label: 'Life Sciences' }
      ]
    },
    {
      code: '600',
      label: 'Technology',
      children: [
        { code: '600', label: 'Technology (General)' },
        { code: '610', label: 'Medicine & Health' },
        { code: '620', label: 'Engineering' },
        { code: '630', label: 'Agriculture' }
      ]
    },
    {
      code: '700',
      label: 'Arts & Recreation',
      children: [
        { code: '700', label: 'Arts (General)' },
        { code: '740', label: 'Drawing & Decorative Arts' },
        { code: '780', label: 'Music' },
        { code: '790', label: 'Sports & Recreation' }
      ]
    },
    {
      code: '800',
      label: 'Literature',
      children: [
        { code: '800', label: 'Literature (General)' },
        { code: '810', label: 'American Literature' },
        { code: '820', label: 'English Literature' },
        { code: '830', label: 'German Literature' }
      ]
    },
    {
      code: '900',
      label: 'History & Geography',
      children: [
        { code: '900', label: 'History (General)' },
        { code: '920', label: 'Biography' },
        { code: '930', label: 'Ancient History' },
        { code: '940', label: 'History' },
        { code: '970', label: 'North American History' }
      ]
    }
  ];

  // Toggle tree node expansion
  const toggleNode = (code: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedNodes(newExpanded);
  };

  // Select Dewey classification
  const selectDeweyCode = (code: string, label: string) => {
    setSelectedDeweyCode(`${code} - ${label}`);
    setFormData(prev => ({ ...prev, subjectArea: label }));
    setShowDeweyPicker(false);
  };

  // Simulate barcode scan (auto-fill ISBN)
  const simulateBarcodeScan = (isbn: string) => {
    setFormData(prev => ({ ...prev, isbn }));
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add book to catalog
  const addBookToCatalog = () => {
    // Silent validation - require all fields
    if (!formData.isbn.trim() || !formData.title.trim() || !formData.author.trim() ||
        !formData.publicationYear || !formData.publisher.trim() || !formData.subjectArea.trim() ||
        !formData.locationCode.trim() || !formData.purchasePrice || !formData.condition) {
      return; // Silent validation failure
    }

    const newBook: CatalogedBook = {
      id: `book-${Date.now()}`,
      isbn: formData.isbn.trim(),
      title: formData.title.trim(),
      author: formData.author.trim(),
      publicationYear: parseInt(formData.publicationYear),
      publisher: formData.publisher.trim(),
      subjectArea: formData.subjectArea.trim(),
      locationCode: formData.locationCode.trim(),
      purchasePrice: parseFloat(formData.purchasePrice),
      condition: formData.condition,
      deweyClassification: selectedDeweyCode
    };

    setCatalogedBooks(prev => [...prev, newBook]);

    // Reset form
    setFormData({
      isbn: '',
      title: '',
      author: '',
      publicationYear: '',
      publisher: '',
      subjectArea: '',
      locationCode: '',
      purchasePrice: '',
      condition: 'New'
    });
    setSelectedDeweyCode('');
  };

  // Remove book from catalog
  const removeBook = (id: string) => {
    setCatalogedBooks(prev => prev.filter(book => book.id !== id));
  };

  // Filter tree based on search query
  const matchesSearch = (node: DeweyNode, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    const matchesCurrent = node.label.toLowerCase().includes(lowerQuery) || node.code.includes(lowerQuery);
    if (matchesCurrent) return true;
    if (node.children) {
      return node.children.some(child => matchesSearch(child, query));
    }
    return false;
  };

  // Render tree node recursively
  const renderTreeNode = (node: DeweyNode, level: number = 0) => {
    // Filter by search query
    if (searchQuery && !matchesSearch(node, searchQuery)) {
      return null;
    }

    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.code) || (searchQuery && hasChildren);
    const indent = level * 20;

    return (
      <div key={node.code}>
        <div
          style={{
            paddingLeft: `${indent}px`,
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: level === 0 ? '#f9fafb' : 'white',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = level === 0 ? '#f9fafb' : 'white'}
        >
          {hasChildren && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.code);
              }}
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#6b7280',
                width: '16px'
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {!hasChildren && <span style={{ width: '16px' }}></span>}
          <span
            onClick={() => selectDeweyCode(node.code, node.label)}
            onDoubleClick={(e) => {
              if (hasChildren) {
                e.stopPropagation();
                toggleNode(node.code);
              }
            }}
            style={{
              flex: 1,
              fontSize: '14px',
              color: hasChildren ? '#1f2937' : '#4b5563',
              fontWeight: hasChildren ? '600' : '400'
            }}
          >
            {node.code} - {node.label}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!
              .filter(child => matchesSearch(child, searchQuery))
              .map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Expose app_state for testing with incremental field completion tracking
  useEffect(() => {
    const formFieldsCompleted = {
      hasIsbn: !!formData.isbn.trim(),
      hasTitle: !!formData.title.trim(),
      hasAuthor: !!formData.author.trim(),
      hasPublicationYear: !!formData.publicationYear,
      hasPublisher: !!formData.publisher.trim(),
      hasSubjectArea: !!formData.subjectArea.trim(),
      hasLocationCode: !!formData.locationCode.trim(),
      hasPurchasePrice: !!formData.purchasePrice,
      hasCondition: !!formData.condition
    };

    (window as any).app_state = {
      catalogedBooks: JSON.parse(JSON.stringify(catalogedBooks)),
      currentFormEntry: JSON.parse(JSON.stringify(formData)),
      formFieldsCompleted,
      totalCatalogedBooks: catalogedBooks.length,
    };
  }, [catalogedBooks, formData]);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f9fafb' }}>
      {/* Main Panel - Book Entry Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ padding: '24px', borderBottom: '2px solid #e5e7eb', backgroundColor: '#ffffff' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>Library Book Cataloging</h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>Enter book information from Excel files</p>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Barcode Scanner Simulation */}
          <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '2px dashed #9ca3af' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📷</span> ISBN Barcode Scanner
            </div>
            <input
              type="text"
              placeholder="Scan or type ISBN number..."
              value={formData.isbn}
              onChange={(e) => simulateBarcodeScan(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'monospace',
                fontWeight: '600'
              }}
            />
          </div>

          {/* Book Information Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                Title
              </label>
              <input
                type="text"
                placeholder="Book title"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                Author
              </label>
              <input
                type="text"
                placeholder="Author name"
                value={formData.author}
                onChange={(e) => handleFieldChange('author', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                  Publication Year
                </label>
                <input
                  type="number"
                  placeholder="2024"
                  value={formData.publicationYear}
                  onChange={(e) => handleFieldChange('publicationYear', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                  Purchase Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.purchasePrice}
                  onChange={(e) => handleFieldChange('purchasePrice', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                Publisher
              </label>
              <input
                type="text"
                placeholder="Publisher name"
                value={formData.publisher}
                onChange={(e) => handleFieldChange('publisher', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                Subject Area
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Select from Dewey classification"
                  value={formData.subjectArea}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f9fafb',
                    cursor: 'not-allowed'
                  }}
                />
                <button
                  onClick={() => {
                    setShowDeweyPicker(true);
                    setSearchQuery(''); // Clear search when opening
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                  title="Select Dewey Classification"
                >
                  📚
                </button>
              </div>
              {selectedDeweyCode && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
                  Selected: {selectedDeweyCode}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                Location Code (Call Number)
              </label>
              <input
                type="text"
                placeholder="e.g., PSY-150.1, MATH-515.2, HIST-940.5"
                value={formData.locationCode}
                onChange={(e) => handleFieldChange('locationCode', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              />
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
                Enter the library call number from Excel (e.g., PSY-150.1)
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => handleFieldChange('condition', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <button
              onClick={addBookToCatalog}
              style={{
                padding: '14px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              ✓ Add to Catalog
            </button>
          </div>

          {/* Cataloged Books List */}
          {catalogedBooks.length > 0 && (
            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '2px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                Cataloged Books ({catalogedBooks.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {catalogedBooks.map(book => (
                  <div
                    key={book.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                        {book.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>
                        📖 {book.isbn} • {book.author} • {book.publicationYear}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        📍 {book.locationCode} • {book.subjectArea} • {book.condition}
                      </div>
                    </div>
                    <button
                      onClick={() => removeBook(book.id)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dewey Classification Picker Modal */}
      {showDeweyPicker && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowDeweyPicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '600px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ padding: '20px', borderBottom: '2px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  Dewey Decimal Classification
                </h3>
                <button
                  onClick={() => setShowDeweyPicker(false)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    lineHeight: 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  ✕
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Type to search (e.g., psychology, mathematics, history)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    paddingRight: '40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '4px 8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#6b7280'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#1f2937'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {deweyTree.filter(node => matchesSearch(node, searchQuery)).length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No results found</div>
                  <div style={{ fontSize: '14px' }}>Try searching for "psychology", "mathematics", or "history"</div>
                </div>
              ) : (
                deweyTree.map(node => renderTreeNode(node))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task25;