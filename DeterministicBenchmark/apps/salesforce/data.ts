// Salesforce Leads Clone - Data Model and Sample Data
// ============================================================================

export interface Lead {
  // Primary Key
  id: string
  
  // Required Fields (marked with * in Salesforce)
  lastName: string
  company: string
  status: LeadStatus
  
  // Basic Information
  salutation?: 'Mr.' | 'Ms.' | 'Mrs.' | 'Dr.' | 'Prof.'
  firstName?: string
  title?: string
  
  // Contact Information
  phone?: string
  mobile?: string
  fax?: string
  email?: string
  website?: string
  
  // Classification & Qualification
  leadSource?: 'Web' | 'Phone Inquiry' | 'Partner Referral' | 'Purchased List' | 'Trade Show' | 'Other'
  industry?: 'Agriculture' | 'Apparel' | 'Banking' | 'Biotechnology' | 'Chemicals' | 'Communications' | 'Construction' | 'Consulting' | 'Education' | 'Electronics' | 'Energy' | 'Engineering' | 'Entertainment' | 'Environmental' | 'Finance' | 'Food & Beverage' | 'Government' | 'Healthcare' | 'Hospitality' | 'Insurance' | 'Machinery' | 'Manufacturing' | 'Media' | 'Not For Profit' | 'Recreation' | 'Retail' | 'Shipping' | 'Technology' | 'Telecommunications' | 'Transportation' | 'Utilities' | 'Other'
  rating?: 'Hot' | 'Warm' | 'Cold'
  
  // Business Information
  annualRevenue?: string
  numberOfEmployees?: string
  
  // Address Information
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  
  // Additional Information
  productInterest?: string
  currentGenerators?: string
  sicCode?: string
  primary?: 'Yes' | 'No'
  numberOfLocations?: string
  description?: string
  
  // System Fields
  ownerId: string
  ownerName: string
  createdAt: Date
  updatedAt: Date
  lastModifiedBy: string
}

export type LeadStatus = 
  | 'Open - Not Contacted'
  | 'Working - Contacted' 
  | 'Closed - Converted'
  | 'Closed - Not Converted'

export interface Task {
  id: string
  subject: string
  description?: string
  status: TaskStatus
  priority: 'High' | 'Normal' | 'Low'
  dueDate?: Date
  
  // Relationships
  nameId?: string // Lead ID for Name field
  name?: string // Lead Name for Name field
  relatedToId: string // Account or Lead ID
  relatedToName: string // Account or Lead Name for display
  relatedToType: 'Lead' | 'Account'
  assignedToId: string
  assignedToName: string
  
  // System Fields
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export type TaskStatus = 
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Waiting on someone else'
  | 'Deferred'

export interface Call {
  id: string
  subject: string
  comments?: string
  
  // Relationships
  nameId: string // Contact/Lead ID for Name field
  name: string // Contact/Lead Name for Name field
  relatedToId: string // Account or Lead ID
  relatedToName: string // Account or Lead Name for display
  relatedToType: 'Lead' | 'Account'
  assignedToId: string
  assignedToName: string
  
  // System Fields
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Event {
  id: string
  subject: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  allDayEvent: boolean
  location?: string
  
  // Relationships
  nameId: string // Contact/Lead ID for Name field
  name: string // Contact/Lead Name for Name field
  relatedToId: string // Account or Lead ID
  relatedToName: string // Account or Lead Name for display
  relatedToType: 'Lead' | 'Account'
  assignedToId: string
  assignedToName: string
  
  // System Fields
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Email {
  id: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  
  // Relationships
  nameId: string // Contact/Lead ID for Name field
  name: string // Contact/Lead Name for Name field
  relatedToId: string // Account or Lead ID
  relatedToName: string // Account or Lead Name for display
  relatedToType: 'Lead' | 'Account'
  assignedToId: string
  assignedToName: string
  
  // System Fields
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// User Directory - Internal team members for "Assigned To" field
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  title: string
  department: string
  profilePicture?: string
  isActive: boolean
}

// Business Objects for "Related To" field
export interface Account {
  id: string
  name: string
  type: 'Customer' | 'Prospect' | 'Partner'
  industry?: string
  website?: string
  phone?: string
  employees?: number
  revenue?: number
}

export interface Opportunity {
  id: string
  name: string
  accountId: string
  accountName: string
  amount: number
  stage: string
  closeDate: Date
  probability: number
}

export interface Case {
  id: string
  subject: string
  description?: string
  status: 'New' | 'In Progress' | 'Closed'
  priority: 'High' | 'Medium' | 'Low'
  accountId: string
  accountName: string
}

// Validation Rules
export const VALIDATION_RULES = {
  lead: {
    lastName: { required: true, maxLength: 80 },
    company: { required: true, maxLength: 255 },
    status: { required: true },
    email: { format: 'email' },
    phone: { format: 'phone' },
    website: { format: 'url' }
  },
  task: {
    subject: { required: true, maxLength: 255 },
    relatedToId: { required: true },
    assignedToId: { required: true }
  }
}

// Dropdown Options
export const DROPDOWN_OPTIONS = {
  salutation: [
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Dr.', label: 'Dr.' },
    { value: 'Prof.', label: 'Prof.' }
  ],
  leadSource: [
    { value: 'Web', label: 'Web' },
    { value: 'Phone Inquiry', label: 'Phone Inquiry' },
    { value: 'Partner Referral', label: 'Partner Referral' },
    { value: 'Purchased List', label: 'Purchased List' },
    { value: 'Trade Show', label: 'Trade Show' },
    { value: 'Other', label: 'Other' }
  ],
  industry: [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Education', label: 'Education' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Other', label: 'Other' }
  ],
  rating: [
    { value: 'Hot', label: 'Hot' },
    { value: 'Warm', label: 'Warm' },
    { value: 'Cold', label: 'Cold' }
  ],
  leadStatus: [
    { value: 'Open - Not Contacted', label: 'Open - Not Contacted' },
    { value: 'Working - Contacted', label: 'Working - Contacted' },
    { value: 'Closed - Converted', label: 'Closed - Converted' },
    { value: 'Closed - Not Converted', label: 'Closed - Not Converted' }
  ],
  taskStatus: [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Waiting on someone else', label: 'Waiting on someone else' },
    { value: 'Deferred', label: 'Deferred' }
  ],
  priority: [
    { value: 'High', label: 'High' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Low', label: 'Low' }
  ]
}

// Sample Leads Data (matching screenshots and docs)
export const SAMPLE_LEADS: Lead[] = [
  {
    id: 'lead_001',
    salutation: 'Mrs.',
    firstName: 'Parvathi',
    lastName: 'Sreenivasan',
    company: 'UiPath',
    title: '',
    email: 'p.sree@gmail.com',
    phone: '08861143445',
    status: 'Working - Contacted',
    leadSource: 'Web',
    industry: 'Technology',
    rating: 'Warm',
    ownerId: 'user_001',
    ownerName: 'UiPath Labs',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-15'),
    lastModifiedBy: 'UiPath Labs'
  },
  {
    id: 'lead_002',
    salutation: 'Mr.',
    firstName: 'Andy',
    lastName: 'Young',
    company: 'Dickenson plc',
    title: 'SVP, Operations',
    email: 'a_young@dickenson.com',
    phone: '(620) 241-6200',
    status: 'Closed - Converted',
    leadSource: 'Phone Inquiry',
    industry: 'Manufacturing',
    rating: 'Hot',
    ownerId: 'user_001',
    ownerName: 'UiPath Labs',
    createdAt: new Date('2025-07-15'),
    updatedAt: new Date('2025-08-01'),
    lastModifiedBy: 'UiPath Labs'
  },
  {
    id: 'lead_003',
    salutation: 'Dr.',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    company: 'HealthTech Innovations',
    title: 'Chief Technology Officer',
    email: 'm.rodriguez@healthtech.com',
    phone: '(415) 555-0123',
    mobile: '(415) 555-0124',
    status: 'Open - Not Contacted',
    leadSource: 'Trade Show',
    industry: 'Healthcare',
    rating: 'Hot',
    annualRevenue: '$50M - $100M',
    street: '123 Innovation Drive',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
    website: 'www.healthtech-innovations.com',
    productInterest: 'Healthcare RPA Solutions',
    ownerId: 'user_003',
    ownerName: 'Jessica Thompson',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
    lastModifiedBy: 'Jessica Thompson'
  },
  {
    id: 'lead_004',
    salutation: 'Mr.',
    firstName: 'James',
    lastName: 'Thompson',
    company: 'Atlantic Financial Services',
    title: 'Director of Operations',
    email: 'j.thompson@atlanticfs.com',
    phone: '(212) 555-0456',
    status: 'Working - Contacted',
    leadSource: 'Partner Referral',
    industry: 'Finance',
    rating: 'Warm',
    annualRevenue: '$100M - $500M',
    numberOfEmployees: '1000-5000',
    street: '555 Wall Street',
    city: 'New York',
    state: 'NY',
    postalCode: '10005',
    country: 'United States',
    website: 'www.atlanticfs.com',
    productInterest: 'Document Processing Automation',
    description: 'Large financial services firm looking to automate loan processing workflows',
    ownerId: 'user_002',
    ownerName: 'Marcus Rodriguez',
    createdAt: new Date('2025-01-18'),
    updatedAt: new Date('2025-01-22'),
    lastModifiedBy: 'Marcus Rodriguez'
  },
  {
    id: 'lead_005',
    salutation: 'Ms.',
    firstName: 'Lisa',
    lastName: 'Chen',
    company: 'EduTech Solutions',
    title: 'VP of Technology',
    email: 'l.chen@edutech.edu',
    phone: '(312) 555-0789',
    mobile: '(312) 555-0790',
    status: 'Closed - Not Converted',
    leadSource: 'Web',
    industry: 'Education',
    rating: 'Cold',
    annualRevenue: '$10M - $50M',
    street: '200 Education Boulevard',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60601',
    country: 'United States',
    website: 'www.edutech-solutions.edu',
    productInterest: 'Student Information Systems Integration',
    description: 'University technology department seeking automation for administrative processes',
    ownerId: 'user_004',
    ownerName: 'David Kim',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2025-01-05'),
    lastModifiedBy: 'David Kim'
  },
  {
    id: 'lead_006',
    salutation: 'Mr.',
    firstName: 'Robert',
    lastName: 'Wilson',
    company: 'Pacific Manufacturing',
    title: 'Plant Manager',
    email: 'r.wilson@pacificmfg.com',
    phone: '(503) 555-0321',
    status: 'Working - Contacted',
    leadSource: 'Phone Inquiry',
    industry: 'Manufacturing',
    rating: 'Hot',
    annualRevenue: '$500M+',
    numberOfEmployees: '5000+',
    street: '888 Industrial Way',
    city: 'Portland',
    state: 'OR',
    postalCode: '97201',
    country: 'United States',
    website: 'www.pacificmanufacturing.com',
    productInterest: 'Supply Chain Automation',
    currentGenerators: 'Legacy ERP Integration',
    description: 'Large manufacturing operation interested in automating inventory management and procurement processes',
    ownerId: 'user_001',
    ownerName: 'Sarah Chen',
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-19'),
    lastModifiedBy: 'Sarah Chen'
  },
  {
    id: 'lead_007',
    salutation: 'Mrs.',
    firstName: 'Jennifer',
    lastName: 'Davis',
    company: 'RetailMax Corporation',
    title: 'IT Director',
    email: 'j.davis@retailmax.com',
    phone: '(214) 555-0654',
    mobile: '(214) 555-0655',
    status: 'Open - Not Contacted',
    leadSource: 'Purchased List',
    industry: 'Retail',
    rating: 'Warm',
    annualRevenue: '$100M - $500M',
    street: '1000 Commerce Street',
    city: 'Dallas',
    state: 'TX',
    postalCode: '75201',
    country: 'United States',
    website: 'www.retailmax.com',
    productInterest: 'E-commerce Integration',
    numberOfLocations: '150',
    description: 'Multi-location retailer exploring automation for order processing and customer service',
    ownerId: 'user_005',
    ownerName: 'Emily Foster',
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-01-25'),
    lastModifiedBy: 'Emily Foster'
  },
  {
    id: 'lead_008',
    salutation: 'Dr.',
    firstName: 'Michael',
    lastName: 'Brown',
    company: 'BioResearch Labs',
    title: 'Research Director',
    email: 'm.brown@bioresearch.com',
    phone: '(858) 555-0987',
    status: 'Closed - Converted',
    leadSource: 'Trade Show',
    industry: 'Biotechnology',
    rating: 'Hot',
    annualRevenue: '$50M - $100M',
    street: '456 Research Park Drive',
    city: 'San Diego',
    state: 'CA',
    postalCode: '92121',
    country: 'United States',
    website: 'www.bioresearch-labs.com',
    productInterest: 'Laboratory Data Management',
    sicCode: '8731',
    primary: 'Yes',
    description: 'Biotechnology research facility implementing automated data collection and analysis workflows',
    ownerId: 'user_006',
    ownerName: 'Alex Patel',
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-12-15'),
    lastModifiedBy: 'Alex Patel'
  },
  {
    id: 'lead_009',
    salutation: 'Ms.',
    firstName: 'Sarah',
    lastName: 'Johnson',
    company: 'GreenEnergy Solutions',
    title: 'Operations Manager',
    email: 's.johnson@greenenergy.com',
    phone: '(303) 555-0147',
    mobile: '(303) 555-0148',
    status: 'Working - Contacted',
    leadSource: 'Web',
    industry: 'Energy',
    rating: 'Warm',
    annualRevenue: '$10M - $50M',
    numberOfEmployees: '200-500',
    street: '789 Renewable Way',
    city: 'Denver',
    state: 'CO',
    postalCode: '80202',
    country: 'United States',
    website: 'www.greenenergy-solutions.com',
    productInterest: 'Grid Management Automation',
    currentGenerators: 'Solar and Wind Integration',
    numberOfLocations: '25',
    description: 'Clean energy provider seeking automation for grid monitoring and maintenance scheduling',
    ownerId: 'user_003',
    ownerName: 'Jessica Thompson',
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-16'),
    lastModifiedBy: 'Jessica Thompson'
  },
  {
    id: 'lead_010',
    salutation: 'Mr.',
    firstName: 'David',
    lastName: 'Martinez',
    company: 'TechStartup Inc',
    title: 'CTO',
    email: 'd.martinez@techstartup.com',
    phone: '(512) 555-0258',
    status: 'Open - Not Contacted',
    leadSource: 'Other',
    industry: 'Technology',
    rating: 'Cold',
    annualRevenue: '$1M - $10M',
    numberOfEmployees: '50-200',
    street: '321 Startup Lane',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    country: 'United States',
    website: 'www.techstartup.com',
    productInterest: 'Development Process Automation',
    description: 'Growing technology startup interested in automating development and deployment workflows',
    ownerId: 'user_004',
    ownerName: 'David Kim',
    createdAt: new Date('2025-01-28'),
    updatedAt: new Date('2025-01-28'),
    lastModifiedBy: 'David Kim'
  }
]

// Sample Tasks Data
export const SAMPLE_TASKS: Task[] = [
  {
    id: 'task_001',
    subject: 'Send RPA implementation proposal',
    description: 'Prepare detailed proposal outlining RPA solution benefits, timeline, and pricing for UiPath automation platform',
    status: 'Not Started',
    priority: 'High',
    dueDate: new Date('2025-01-25'),
    nameId: 'lead_001',
    name: 'Parvathi Sreenivasan',
    relatedToId: 'acc_002',
    relatedToName: 'TechFlow Solutions',
    relatedToType: 'Account',
    assignedToId: 'user_001',
    assignedToName: 'Sarah Chen',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    createdBy: 'Sarah Chen'
  },
  {
    id: 'task_002',
    subject: 'Review generator purchase requirements',
    description: 'Analyze current generator infrastructure and determine optimal GC5000 series configuration for manufacturing operations',
    status: 'In Progress',
    priority: 'Normal',
    dueDate: new Date('2025-08-23'),
    nameId: 'lead_002',
    name: 'Andy Young',
    relatedToId: 'acc_001',
    relatedToName: 'Dickenson plc',
    relatedToType: 'Account',
    assignedToId: 'user_002',
    assignedToName: 'Marcus Rodriguez',
    createdAt: new Date('2025-08-20'),
    updatedAt: new Date('2025-08-21'),
    createdBy: 'Marcus Rodriguez'
  },
  {
    id: 'task_003',
    subject: 'Follow up on technical demo feedback',
    description: 'Contact Andy to discuss technical demo outcomes and next steps for implementation',
    status: 'Completed',
    priority: 'Normal',
    dueDate: new Date('2025-08-20'),
    nameId: 'lead_002',
    name: 'Andy Young',
    relatedToId: 'acc_001',
    relatedToName: 'Dickenson plc',
    relatedToType: 'Account',
    assignedToId: 'user_002',
    assignedToName: 'Marcus Rodriguez',
    createdAt: new Date('2025-08-18'),
    updatedAt: new Date('2025-08-25'), // Completion date
    createdBy: 'Marcus Rodriguez'
  }
]

// Sample Calls Data
export const SAMPLE_CALLS: Call[] = [
  {
    id: 'call_001',
    subject: 'Discovery call - Manufacturing automation needs',
    comments: 'Discussed current manual processes in Operations department. Andy expressed interest in automating invoice processing and inventory management. Next step: schedule technical demo.',
    nameId: 'lead_002',
    name: 'Andy Young',
    relatedToId: 'acc_001',
    relatedToName: 'Dickenson plc',
    relatedToType: 'Account',
    assignedToId: 'user_002',
    assignedToName: 'Marcus Rodriguez',
    createdAt: new Date('2025-08-25'),
    updatedAt: new Date('2025-08-25'),
    createdBy: 'Marcus Rodriguez'
  },
  {
    id: 'call_002',
    subject: 'Initial outreach - RPA interest',
    comments: 'Reached out to Parvathi regarding her interest in RPA solutions for tech operations. She mentioned current challenges with manual data processing. Scheduled follow-up demo.',
    nameId: 'lead_001',
    name: 'Parvathi Sreenivasan',
    relatedToId: 'acc_002',
    relatedToName: 'TechFlow Solutions',
    relatedToType: 'Account',
    assignedToId: 'user_002',
    assignedToName: 'Marcus Rodriguez',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
    createdBy: 'Marcus Rodriguez'
  }
]

// Sample Events Data
export const SAMPLE_EVENTS: Event[] = [
  {
    id: 'event_001',
    subject: 'Technical Demo - RPA Platform Overview',
    startDate: new Date('2025-09-15'),
    endDate: new Date('2025-09-15'),
    startTime: '14:00',
    endTime: '15:00',
    allDayEvent: false,
    location: 'Online - Zoom Meeting',
    nameId: 'lead_002',
    name: 'Andy Young',
    relatedToId: 'acc_001',
    relatedToName: 'Dickenson plc',
    relatedToType: 'Account',
    assignedToId: 'user_003',
    assignedToName: 'Jessica Thompson',
    createdAt: new Date('2025-08-26'),
    updatedAt: new Date('2025-08-26'),
    createdBy: 'Jessica Thompson'
  },
  {
    id: 'event_002',
    subject: 'Solution Architecture Review',
    startDate: new Date('2025-02-10'),
    endDate: new Date('2025-02-10'),
    startTime: '10:00',
    endTime: '11:30',
    allDayEvent: false,
    location: 'TechFlow Solutions Office',
    nameId: 'lead_001',
    name: 'Parvathi Sreenivasan',
    relatedToId: 'acc_002',
    relatedToName: 'TechFlow Solutions',
    relatedToType: 'Account',
    assignedToId: 'user_004',
    assignedToName: 'David Kim',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
    createdBy: 'David Kim'
  }
]

// Sample Emails Data
export const SAMPLE_EMAILS: Email[] = [
  {
    id: 'email_001',
    subject: 'RPA Implementation Timeline & Next Steps',
    body: 'Hi Andy,\n\nThank you for the great discussion during our technical demo yesterday. As discussed, I\'m sending over the implementation timeline and next steps for your RPA project.\n\nKey next steps:\n1. Technical architecture review (scheduled for next week)\n2. Stakeholder alignment meeting\n3. Pilot project definition\n\nPlease let me know if you have any questions.\n\nBest regards,\nMarcus Rodriguez',
    from: 'marcus.rodriguez@uipath.com',
    to: ['a_young@dickenson.com'],
    cc: [],
    bcc: [],
    nameId: 'lead_002',
    name: 'Andy Young',
    relatedToId: 'acc_001',
    relatedToName: 'Dickenson plc',
    relatedToType: 'Account',
    assignedToId: 'user_002',
    assignedToName: 'Marcus Rodriguez',
    createdAt: new Date('2025-08-26'),
    updatedAt: new Date('2025-08-26'),
    createdBy: 'Marcus Rodriguez'
  },
  {
    id: 'email_002',
    subject: 'RPA Solution Proposal - TechFlow Solutions',
    body: 'Dear Parvathi,\n\nI hope this email finds you well. Following our productive conversation about automation opportunities at TechFlow Solutions, I\'m excited to share our comprehensive RPA proposal.\n\nThe proposal includes:\n• Process automation assessment\n• ROI projections for your current workflows\n• Implementation timeline\n• Training and support details\n\nI\'d love to schedule a follow-up call to discuss any questions you might have.\n\nBest regards,\nMarcus Rodriguez\nAccount Executive, UiPath',
    from: 'marcus.rodriguez@uipath.com',
    to: ['p.sree@gmail.com'],
    cc: [],
    bcc: [],
    nameId: 'lead_001',
    name: 'Parvathi Sreenivasan',
    relatedToId: 'acc_002',
    relatedToName: 'TechFlow Solutions',
    relatedToType: 'Account',
    assignedToId: 'user_002',
    assignedToName: 'Marcus Rodriguez',
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16'),
    createdBy: 'Marcus Rodriguez'
  }
]

// SLDS Classes for consistent styling
export const SLDS_CLASSES = {
  // Layout
  container: 'slds-container_fluid',
  grid: 'slds-grid',
  col: 'slds-col',
  
  // Buttons
  button: 'slds-button',
  buttonBrand: 'slds-button slds-button_brand',
  buttonNeutral: 'slds-button slds-button_neutral',
  
  // Forms
  formElement: 'slds-form-element',
  input: 'slds-input',
  select: 'slds-select',
  textarea: 'slds-textarea',
  
  // Tables
  table: 'slds-table slds-table_bordered slds-table_cell-buffer',
  tableHeader: 'slds-text-title_caps',
  
  // Modals
  modal: 'slds-modal slds-fade-in-open',
  modalContainer: 'slds-modal__container',
  backdrop: 'slds-backdrop slds-backdrop_open',
  
  // Navigation
  tabs: 'slds-tabs_default',
  tabsNav: 'slds-tabs__nav',
  tabsContent: 'slds-tabs__content',
  
  // Cards
  card: 'slds-card',
  cardHeader: 'slds-card__header',
  cardBody: 'slds-card__body',
  
  // Icons
  icon: 'slds-icon',
  iconContainer: 'slds-icon_container'
}

// Initial App Data - No Persistence (fresh state every reload)
export interface AppData {
  leads: Lead[]
  tasks: Task[]
  calls: Call[]
  events: Event[]
  emails: Email[]
  users: User[]
  accounts: Account[]
  opportunities: Opportunity[]
  cases: Case[]
  metadata: { lastUpdated: number }
}

// Sample Users - Internal team members for "Assigned To"
export const SAMPLE_USERS: User[] = [
  {
    id: 'user_001',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@uipath.com',
    title: 'Sales Manager',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user_002', 
    firstName: 'Marcus',
    lastName: 'Rodriguez',
    email: 'marcus.rodriguez@uipath.com',
    title: 'Account Executive',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user_003',
    firstName: 'Jessica',
    lastName: 'Thompson',
    email: 'jessica.thompson@uipath.com', 
    title: 'Business Development Rep',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'user_004',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@uipath.com',
    title: 'Solutions Consultant', 
    department: 'Presales',
    isActive: true
  },
  {
    id: 'user_005',
    firstName: 'Emily',
    lastName: 'Foster',
    email: 'emily.foster@uipath.com',
    title: 'Customer Success Manager',
    department: 'Customer Success',
    isActive: true
  },
  {
    id: 'user_006',
    firstName: 'Alex',
    lastName: 'Patel',
    email: 'alex.patel@uipath.com',
    title: 'Technical Specialist',
    department: 'Engineering',
    isActive: true
  }
]

// Sample Accounts - Business objects for "Related To" 
export const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: 'acc_001',
    name: 'Dickenson plc',
    type: 'Customer',
    industry: 'Financial Services',
    website: 'www.dickenson.com',
    phone: '+1 (555) 123-4567',
    employees: 2500,
    revenue: 1200000000
  },
  {
    id: 'acc_002', 
    name: 'TechFlow Solutions',
    type: 'Prospect',
    industry: 'Technology',
    website: 'www.techflow.com',
    phone: '+1 (555) 234-5678',
    employees: 850,
    revenue: 450000000
  },
  {
    id: 'acc_003',
    name: 'MedCore Healthcare',
    type: 'Customer', 
    industry: 'Healthcare',
    website: 'www.medcore.com',
    phone: '+1 (555) 345-6789',
    employees: 5200,
    revenue: 2100000000
  },
  {
    id: 'acc_004',
    name: 'Global Manufacturing Corp',
    type: 'Customer',
    industry: 'Manufacturing',
    website: 'www.globalmanufacturing.com', 
    phone: '+1 (555) 456-7890',
    employees: 12000,
    revenue: 5600000000
  },
  {
    id: 'acc_005',
    name: 'Premier Financial Group',
    type: 'Prospect',
    industry: 'Financial Services',
    website: 'www.premierfinancial.com',
    phone: '+1 (555) 567-8901',
    employees: 3200,
    revenue: 1800000000
  },
  {
    id: 'acc_006',
    name: 'NextGen Retail',
    type: 'Partner',
    industry: 'Retail',
    website: 'www.nextgenretail.com',
    phone: '+1 (555) 678-9012', 
    employees: 8500,
    revenue: 3200000000
  }
]

// Sample Opportunities for "Related To"
export const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_001',
    name: 'Dickenson Process Automation',
    accountId: 'acc_001', 
    accountName: 'Dickenson plc',
    amount: 250000,
    stage: 'Proposal/Price Quote',
    closeDate: new Date('2025-12-15'),
    probability: 75
  },
  {
    id: 'opp_002',
    name: 'TechFlow Digital Transformation',
    accountId: 'acc_002',
    accountName: 'TechFlow Solutions', 
    amount: 180000,
    stage: 'Needs Analysis',
    closeDate: new Date('2026-02-20'),
    probability: 40
  },
  {
    id: 'opp_003',
    name: 'MedCore RPA Implementation',
    accountId: 'acc_003',
    accountName: 'MedCore Healthcare',
    amount: 420000,
    stage: 'Negotiation/Review',
    closeDate: new Date('2025-10-30'),
    probability: 85
  }
]

// Sample Cases for "Related To"  
export const SAMPLE_CASES: Case[] = [
  {
    id: 'case_001',
    subject: 'Bot Performance Issues',
    description: 'Automation workflows running slower than expected',
    status: 'In Progress',
    priority: 'High',
    accountId: 'acc_001',
    accountName: 'Dickenson plc'
  },
  {
    id: 'case_002', 
    subject: 'License Renewal Question',
    description: 'Customer needs guidance on license upgrade options',
    status: 'New',
    priority: 'Medium',
    accountId: 'acc_003',
    accountName: 'MedCore Healthcare' 
  }
]

export const getInitialAppData = (): AppData => ({
  leads: SAMPLE_LEADS,
  tasks: SAMPLE_TASKS,
  calls: SAMPLE_CALLS,
  events: SAMPLE_EVENTS,
  emails: SAMPLE_EMAILS,
  users: SAMPLE_USERS,
  accounts: SAMPLE_ACCOUNTS,
  opportunities: SAMPLE_OPPORTUNITIES,
  cases: SAMPLE_CASES,
  metadata: { lastUpdated: Date.now() }
})

// View State Interface
export interface ViewState {
  currentTab: 'home' | 'leads'
  currentView: 'dashboard' | 'leads-list' | 'lead-detail'
  selectedLeadId: string | null
  showAppLauncher: boolean
  showNewLeadForm: boolean
  showNewTaskModal: boolean
  showNewCallModal: boolean
  showNewEventModal: boolean
  showNewEmailModal: boolean
}
