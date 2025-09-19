import React, { useState, useEffect } from 'react';
import { Filter, Phone, Building, User, Check, X } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'VIP' | 'Standard' | 'Inactive';
  updated?: boolean;
}

interface ExternalPhoneUpdate {
  name: string;
  phone: string;
}

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

export default function Task18() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [externalPhoneList, setExternalPhoneList] = useState<ExternalPhoneUpdate[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [filters, setFilters] = useState({
    VIP: false,
    Standard: false,
    Inactive: false
  });
  const [showExternalList, setShowExternalList] = useState(false);
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Generate deterministic contact data
  useEffect(() => {
    const rng = new SeededRandom(12345);
    
    const firstNames = [
      'Alexander', 'Sophia', 'William', 'Emma', 'James', 'Olivia', 'Benjamin', 'Ava',
      'Lucas', 'Isabella', 'Henry', 'Mia', 'Theodore', 'Charlotte', 'Samuel', 'Amelia',
      'David', 'Harper', 'Joseph', 'Evelyn', 'John', 'Abigail', 'Owen', 'Emily',
      'Sebastian', 'Elizabeth', 'Jack', 'Sofia', 'Luke', 'Avery', 'Wyatt', 'Ella',
      'Grayson', 'Madison', 'Leo', 'Scarlett', 'Jayden', 'Victoria', 'Gabriel', 'Aria',
      'Julian', 'Grace', 'Mateo', 'Chloe', 'Anthony', 'Camila', 'Jaxon', 'Penelope',
      'Lincoln', 'Riley', 'Joshua', 'Layla', 'Christopher', 'Lillian', 'Andrew', 'Nora',
      'Daniel', 'Zoey', 'Matthew', 'Mila', 'Elijah', 'Aubrey', 'Mason', 'Hannah'
    ];

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
      'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
      'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
      'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
      'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
      'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
      'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy'
    ];

    const companies = [
      'Tech Solutions Inc', 'Global Manufacturing Corp', 'Financial Services Group', 'Healthcare Partners LLC',
      'Marketing Dynamics', 'Construction Associates', 'Retail Excellence Co', 'Transportation Systems',
      'Energy Solutions Ltd', 'Educational Services Inc', 'Consulting Partners', 'Media Productions LLC',
      'Real Estate Holdings', 'Food & Beverage Co', 'Pharmaceutical Research', 'Automotive Solutions',
      'Software Development Inc', 'Insurance Services Group', 'Telecommunications Corp', 'Investment Holdings',
      'Legal Associates LLC', 'Engineering Services', 'Architecture Design Co', 'Security Solutions Inc',
      'Environmental Services', 'Logistics Corporation', 'Agriculture Solutions', 'Entertainment Group LLC',
      'Publishing Associates', 'Research Institute Inc', 'Hospitality Services', 'Fashion Design Co',
      'Sports Management LLC', 'Travel Services Inc', 'Equipment Rental Corp', 'Chemical Solutions',
      'Aerospace Technologies', 'Marine Services LLC', 'Mining Operations Inc', 'Renewable Energy Co'
    ];

    const generatePhone = (rng: SeededRandom, isOutdated: boolean = false) => {
      const area = Math.floor(rng.next() * 900) + 100;
      const exchange = Math.floor(rng.next() * 900) + 100;
      const number = Math.floor(rng.next() * 9000) + 1000;
      
      if (isOutdated) {
        // Make some phone numbers obviously outdated or missing
        const rand = rng.next();
        if (rand < 0.3) return ''; // Missing phone
        if (rand < 0.6) return `(${area}) ${exchange}-XXXX`; // Incomplete
        return `(${area}) ${exchange}-${number}`; // Some valid but will be "outdated"
      }
      
      return `(${area}) ${exchange}-${number}`;
    };

    // Generate 300 contacts
    const generatedContacts: Contact[] = [];
    const statusOptions: Contact['status'][] = ['VIP', 'Standard', 'Inactive'];
    
    // First generate 5 VIP contacts
    for (let i = 0; i < 5; i++) {
      const firstName = firstNames[Math.floor(rng.next() * firstNames.length)];
      const lastName = lastNames[Math.floor(rng.next() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const company = companies[Math.floor(rng.next() * companies.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`;
      
      generatedContacts.push({
        id: `contact-${i + 1}`,
        name,
        company,
        email,
        phone: generatePhone(rng, true), // VIP contacts have outdated phones
        status: 'VIP'
      });
    }

    // Generate remaining 295 contacts (Standard and Inactive)
    for (let i = 5; i < 300; i++) {
      const firstName = firstNames[Math.floor(rng.next() * firstNames.length)];
      const lastName = lastNames[Math.floor(rng.next() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const company = companies[Math.floor(rng.next() * companies.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`;
      const status = rng.next() > 0.7 ? 'Inactive' : 'Standard';
      
      generatedContacts.push({
        id: `contact-${i + 1}`,
        name,
        company,
        email,
        phone: generatePhone(rng, false),
        status
      });
    }

    // Shuffle contacts to mix VIPs throughout the list
    for (let i = generatedContacts.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [generatedContacts[i], generatedContacts[j]] = [generatedContacts[j], generatedContacts[i]];
    }

    // Generate external phone list for 5 VIP contacts (2 VIPs won't have updates)
    const vipContacts = generatedContacts.filter(c => c.status === 'VIP');
    const contactsToUpdate = vipContacts.slice(0, 5); // First 5 VIPs get updates
    
    const externalPhones: ExternalPhoneUpdate[] = contactsToUpdate.map(contact => ({
      name: contact.name,
      phone: generatePhone(rng, false) // Generate new valid phone numbers
    })).sort((a, b) => a.name.localeCompare(b.name));

    setContacts(generatedContacts);
    setFilteredContacts(generatedContacts);
    setExternalPhoneList(externalPhones);
    setIsDataLoaded(true);
  }, []);

  // Handle filter changes
  useEffect(() => {
    const activeFilters = Object.entries(filters).filter(([_, isActive]) => isActive).map(([status, _]) => status);
    
    if (activeFilters.length === 0) {
      setFilteredContacts(contacts);
    } else {
      setFilteredContacts(contacts.filter(contact => activeFilters.includes(contact.status)));
    }
  }, [filters, contacts]);

  // Expose state for testing
  useEffect(() => {
    if (isDataLoaded) {
      (window as any).app_state = {
        contacts: contacts,
        filteredContacts: filteredContacts,
        externalPhoneList: externalPhoneList,
        filters: filters,
        updatedContacts: contacts.filter(c => c.updated),
        vipContacts: contacts.filter(c => c.status === 'VIP'),
        contactsWithUpdates: contacts.filter(c => c.status === 'VIP' && c.updated)
      };
    }
  }, [contacts, filteredContacts, externalPhoneList, filters, isDataLoaded]);

  const handleFilterChange = (status: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const handlePhoneEdit = (contactId: string, newPhone: string) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, phone: newPhone, updated: true }
        : contact
    ));
    setEditingPhone(null);
    setEditingValue('');
  };

  const startEdit = (contactId: string, currentPhone: string) => {
    setEditingPhone(contactId);
    setEditingValue(currentPhone);
  };

  const cancelEdit = () => {
    setEditingPhone(null);
    setEditingValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, contactId: string) => {
    if (e.key === 'Enter') {
      handlePhoneEdit(contactId, editingValue);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const getStatusBadgeColor = (status: Contact['status']) => {
    switch (status) {
      case 'VIP': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Standard': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Filter Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Status</h3>
            <div className="space-y-2">
              {Object.entries(filters).map(([status, isActive]) => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleFilterChange(status as keyof typeof filters)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => setShowExternalList(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Show External Phone List
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <div>Total Contacts: {contacts.length}</div>
          <div>Filtered: {filteredContacts.length}</div>
          <div>VIP Contacts: {contacts.filter(c => c.status === 'VIP').length}</div>
          <div>Updated: {contacts.filter(c => c.updated).length}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">CRM Contact Database</h1>
        </div>

        {/* Contact Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className={`hover:bg-gray-50 ${contact.updated ? 'bg-green-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {contact.name}
                          {contact.updated && (
                            <Check className="w-4 h-4 text-green-600 inline ml-2" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{contact.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        {editingPhone === contact.id ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, contact.id)}
                            onBlur={() => handlePhoneEdit(contact.id, editingValue)}
                            className="text-sm border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => startEdit(contact.id, contact.phone)}
                            className={`text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded ${
                              contact.updated ? 'text-green-700 font-medium' : 'text-gray-900'
                            }`}
                          >
                            {contact.phone || '(No phone)'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* External Phone List Popup */}
      {showExternalList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">External Phone Updates</h3>
                <button
                  onClick={() => setShowExternalList(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Updated phone numbers for VIP contacts
              </p>
            </div>
            <div className="p-6 overflow-y-auto max-h-80">
              <div className="space-y-3">
                {externalPhoneList.map((update, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">{update.name}</div>
                    <div className="text-sm text-gray-600 font-mono">{update.phone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
