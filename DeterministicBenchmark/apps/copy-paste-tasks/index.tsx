import React, { lazy, Suspense } from 'react';
import TaskWrapper from '../../src/TaskWrapper';

// Lazy load task components for better performance
const Task1 = lazy(() => import('./task-1'));
const Task2 = lazy(() => import('./task-2'));
const Task3 = lazy(() => import('./task-3'));
const Task4 = lazy(() => import('./task-4'));
const Task5 = lazy(() => import('./task-5'));
const Task6 = lazy(() => import('./task-6'));
const Task7 = lazy(() => import('./task-7'));
const Task8 = lazy(() => import('./task-8'));
const Task9 = lazy(() => import('./task-9'));
const Task10 = lazy(() => import('./task-10'));
const Task11 = lazy(() => import('./task-11'));
const Task12 = lazy(() => import('./task-12'));
const Task13 = lazy(() => import('./task-13'));
const Task14 = lazy(() => import('./task-14'));
const Task15 = lazy(() => import('./task-15'));
const Task16 = lazy(() => import('./task-16'));
const Task17 = lazy(() => import('./task-17'));
const Task18 = lazy(() => import('./task-18'));
const Task19 = lazy(() => import('./task-19'));
const Task20 = lazy(() => import('./task-20'));
const Task21 = lazy(() => import('./task-21'));
const Task22 = lazy(() => import('./task-22'));
const Task23 = lazy(() => import('./task-23'));
const Task24 = lazy(() => import('./task-24'));
const Task25 = lazy(() => import('./task-25'));
const Task26 = lazy(() => import('./task-26'));
const Task27 = lazy(() => import('./task-27'));
const Task28 = lazy(() => import('./task-28'));
const Task29 = lazy(() => import('./task-29'));
const Task30 = lazy(() => import('./task-30'));
const Task31 = lazy(() => import('./task-31'));
const Task32 = lazy(() => import('./task-32'));
const Task33 = lazy(() => import('./task-33'));
const Task34 = lazy(() => import('./task-34'));
const Task35 = lazy(() => import('./task-35'));
const Task36 = lazy(() => import('./task-36'));
const Task37 = lazy(() => import('./task-37'));
const Task38 = lazy(() => import('./task-38'));
const Task39 = lazy(() => import('./task-39'));
const Task40 = lazy(() => import('./task-40'));

export type UiBenchTask = {
  id: string;
  instructions: string;
  ux: string;
  testFn?: string; // Reference to test function name in tests.ts
  require_result_submission?: boolean;
};

function createTaskComponent(TaskComponent: React.LazyExoticComponent<React.ComponentType>): React.FC {
  const C: React.FC = () => (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-gray-600">Loading task...</div></div>}>
      <TaskComponent />
    </Suspense>
  );
  return C;
}

function createTaskComponentForIndex(index: number): React.FC {
  const components = [Task1, Task2, Task3, Task4, Task5, Task6, Task7, Task8, Task9, Task10, Task11, Task12, Task13, Task14, Task15, Task16, Task17, Task18, Task19, Task20, Task21, Task22, Task23, Task24, Task25, Task26, Task27, Task28, Task29, Task30, Task31, Task32, Task33, Task34, Task35, Task36, Task37, Task38, Task39, Task40];
  const TaskComponent = components[index];
  if (!TaskComponent) {
    throw new Error(`Task component not found for index ${index}`);
  }
  return createTaskComponent(TaskComponent);
}

// Metadata only - test functions loaded dynamically by TaskWrapper
export const uiBenchTasks: UiBenchTask[] = [
  {
    id: 'copy-paste-excel-to-forms',
    instructions: 'Copy contact details from rows 30, 40, and 50 of the customer table to individual contact forms. Click on table cells to select and copy, then manually enter or paste data into the corresponding form fields. Complete and submit all 3 contact forms with Name, Email, Phone, and Company information.',
    ux: 'Click table cells in rows 30, 40, and 50 to select and copy data, then paste into the 3 form fields using the Paste buttons',
    testFn: 'test_1',
  },
  {
    id: 'copy-paste-file-tree-to-table',
    instructions: 'Expand project folders, find all PDF files, copy their paths, and add them to the summary table using the form above the table. Navigate through the 3-level folder structure, select PDF files, use "Copy Path" button, then paste (Ctrl+V) into the path input field, and click "Add". Find all 10 PDF files scattered across the 2 project folders.',
    ux: 'Expand folders by clicking on them, select PDF files, and use "Add to Table" to build the summary',
    testFn: 'test_2',
  },
  {
    id: 'copy-paste-product-catalog-to-cart',
    instructions: 'Browse through the 2-page product catalog and add qualifying items to your shopping cart. Navigate through all pages using pagination controls and identify products over $50. After adding items to cart, manually adjust quantities in the shopping cart: set quantity to 2 for items between $50-$100, and quantity to 1 for items over $100. Skip items $50 or below. Avoid adding duplicates and ensure items are sourced from both pages.',
    ux: 'Navigate through product catalog pages, add items >$50 to cart, then manually adjust quantities: $50-$100 = qty 2, >$100 = qty 1',
    testFn: 'test_3',
  },
  {
    id: 'copy-paste-quarterly-sales-aggregation',
    instructions: 'Collect quarterly sales data from 4 separate tables and aggregate for North region. Switch between Q1, Q2, Q3, Q4 tabs to view sales data, then manually calculate and enter North region totals in the Summary tab. For each quarter, scan through the table to find all North region entries, sum their sales amounts, and enter the totals in the Q1, Q2, Q3, Q4 columns. The total sales will be calculated automatically.',
    ux: 'Switch between Q1-Q4 tabs to view quarterly data sorted by Product, scan for North region entries, manually calculate totals, and enter them in Summary tab',
    testFn: 'test_4',
  },
  {
    id: 'copy-paste-employee-salary-editing',
    instructions: 'Review the employee table and update salaries for employees hired before 2020. Scroll through all 80 employee records, identify employees with hire dates before 01/01/2020, and increase their salaries by $1000. Double-click salary cells to edit, add $1000 to the current salary (you can use arrow keys to increment by $1000), press Enter to save the value. Make sure to review all employees as the records are not sorted by hire date.',
    ux: 'Scroll through employee table, identify employees hired before 2020, double-click salary cells to edit and increase salaries by $1000',
    testFn: 'test_5',
  },
  {
    id: 'copy-paste-search-to-email',
    instructions: 'Search for "urgent" tasks in the task system and compile a list of all urgent task IDs into an email to management. Send email to: manager@company.com with subject: "Urgent Tasks Report". Search for tasks containing "urgent" in their title or description, then create a numbered list of task IDs in the email body. Format as: "1. TSK-2024-001\\n2. TSK-2024-002" etc. Include all urgent task IDs found in the search results.',
    ux: 'Search for "urgent" tasks, find all matching results, create numbered list of task IDs in email to manager@company.com',
    testFn: 'test_6',
  },
  {
    id: 'copy-paste-org-chart-directors',
    instructions: 'Expand the management hierarchy and identify all Director-level employees. Navigate through the organization chart by clicking expand arrows to reveal subordinates. Find all employees with "Director" in their title across the organization. Format JSON response as {"directors": ["Full Name 1", "Full Name 2", ...]}, and use the Submit Results button to send it.',
    ux: 'Expand org chart nodes to navigate hierarchy, identify all Director-level employees, and submit JSON via Submit Results button',
    testFn: 'test_7',
    require_result_submission: true,
  },
  {
    id: 'copy-paste-invoice-top3-overdue',
    instructions: 'Expand invoice details to view line items and identify the top 3 overdue invoices by total value. Click the expand button (+) next to each invoice to see detailed line items and amounts. Find all invoices with "Overdue" status (red background), compare their total amounts, and add the 3 highest value invoices to the table on the right. Enter invoice numbers in order from highest to lowest value.',
    ux: 'Expand invoice rows to view amounts, identify overdue invoices by red background, find top 3 by value, add to table from highest to lowest',
    testFn: 'test_8',
  },
  {
    id: 'copy-paste-electronics-no-screen',
    instructions: 'Browse through the electronics catalog and identify all products that have no screen. Look through all the products and identify products without screens. Format JSON response as {"products": ["Product Name 1", "Product Name 2", ...]}, and use the Submit Results button to send it.',
    ux: 'Browse electronics products, identify those with no screen, submit JSON list of product names via Submit Results button',
    testFn: 'test_9',
    require_result_submission: true,
  },
  {
    id: 'copy-paste-calendar-meetings',
    instructions: 'Navigate through 3 months of calendar data, find all "Meeting" events with 5 or more attendees, and copy their details to the planning form. Use month navigation arrows to browse through current month and next 2 months. Click on meeting events (blue colored blocks) in calendar cells to view details, then add meetings with minimum 5 participants to the Event Planning Form. Include Date, Meeting Title, Attendees, and Duration for all qualifying meetings found.',
    ux: 'Navigate through 3 months using arrows, click on blue meeting events to view details, add meetings with 5+ attendees to planning form',
    testFn: 'test_10',
  },
  {
    id: 'copy-paste-comment-moderation',
    instructions: 'Expand comment threads to find replies containing spam keywords, then flag them for review. Navigate through the nested comment tree by clicking expand arrows to reveal reply threads. Look for comments containing spam keywords such as promotional language, urgent calls to action, or suspicious marketing phrases. Click the flag button next to comments that appear to be spam to add them to the moderation queue. You must achieve 90% spam detection accuracy with no false positives (flagging non-spam comments).',
    ux: 'Expand comment threads, identify spam comments by keywords, click flag buttons to add to moderation queue',
    testFn: 'test_11',
  },
  {
    id: 'copy-paste-inventory-supplier-analysis',
    instructions: 'Analyze the inventory data to extract the count of Electronics items that need reordering by supplier. Filter the inventory to review items, identify Electronics products with current stock below their reorder point, and count how many low-stock Electronics items each supplier has. Include ALL suppliers in your submission, even those with 0 Electronics items needing reorder. Format JSON response as {"supplier_name": count, "supplier_name": count, ...}, and use the Submit Results button to send it.',
    ux: 'Filter and analyze inventory to count Electronics items needing reorder by supplier, submit JSON via Submit Results button',
    testFn: 'test_12',
    require_result_submission: true,
  },
  {
    id: 'survey-results-analytics',
    instructions: 'Navigate through 3 pages of survey responses and count the "Yes" answers for Question 3: "Are you satisfied with our service?". Use the pagination to browse all pages sequentially and manually count responses using the dashboard counter. Update the dashboard with the correct total count of "Yes" responses across all 30 survey responses.',
    ux: 'Navigate through paginated survey results, manually count Q3 "Yes" responses, update analytics dashboard counter',
    testFn: 'test_13',
  },
  {
    id: 'kanban-ticket-management',
    instructions: 'Find tickets older than 30 days in the "Open" column and move only the high priority ones to the "Review" column. Drag tickets between columns to change their status. Look for tickets with creation dates more than 30 days ago and "High" priority badge (red). Only high priority tickets that are older than 30 days should be moved to Review - leave medium and low priority old tickets in Open.',
    ux: 'Drag high priority tickets older than 30 days from Open column to Review column using drag and drop',
    testFn: 'test_14',
  },
  {
    id: 'project-timeline-resource-conflicts',
    instructions: 'Analyze project timeline to identify resource conflicts by manually comparing task dates and resource assignments. Expand project phases to view all tasks with their start/end dates and assigned resources. Find pairs of tasks where the same resource is assigned to overlapping time periods. Select these conflicting task pairs and add them to the Resource Allocation Table. There are exactly 4 scheduling conflicts to find across the 6 project phases.',
    ux: 'Expand phases, analyze task dates and resources manually, select overlapping task pairs, add conflicts to allocation table',
    testFn: 'test_15',
  },
  {
    id: 'social-media-content-scheduling',
    instructions: 'Browse through the 25 social media posts and identify all high-performing content (posts with more than 100 likes). Each high-performing post has a designated target date shown as "Schedule: Xth". Drag these posts to schedule them on their correct target dates in the calendar grid. Look for posts with golden borders and blue schedule badges. Schedule all 5 high-performing posts by dragging them to their specific assigned dates to complete the content calendar.',
    ux: 'Scroll through social media feed, identify posts with >100 likes (golden border) and blue schedule badges, drag each to its designated target date on calendar',
    testFn: 'test_16',
  },
  {
    id: 'library-catalog-science-fiction',
    instructions: 'Search for "science fiction" books in the library catalog, navigate through the paginated results, and add books published after 2020 (excluding 2020) to your reading list. Use the search interface to find science fiction books, then browse through the results across multiple pages using pagination controls. Select and add books with publication years 2021 or later to build your reading list table.',
    ux: 'Search for "science fiction", navigate through paginated results, identify books published 2021 or later, add them to reading list table',
    testFn: 'test_17',
  },
  {
    id: 'crm-vip-phone-updates',
    instructions: 'Filter contacts by "VIP" status, scroll through results, and update phone numbers using the external phone list. Click the filter checkbox for VIP status, then edit phone fields by clicking on them and entering the new numbers from the external phone list popup. Only VIP contacts should have updated phone numbers that match the external list.',
    ux: 'Filter by VIP status using checkbox, click "Show External Phone List" button to view updates, click phone fields to edit and enter new numbers',
    testFn: 'test_18',
  },
  {
    id: 'hierarchical-menu-navigation',
    instructions: 'Expand menu categories to find the single 4-level deep item in the hierarchical structure. Click expand arrows to reveal the full menu hierarchy and navigate through all levels to locate the one item at depth 4. Format JSON response as {"path": "Category/Subcategory/Page/Subpage"}, and use the Submit Results button to send it.',
    ux: 'Expand menu tree by clicking arrows to find 4-level deep item, then submit path as JSON via Submit Results button',
    testFn: 'test_19',
    require_result_submission: true,
  },
  {
    id: 'document-diff-review',
    instructions: 'Review document changes using the diff viewer to ensure compliance with style guide rules. Compare Draft 1 (original) with Draft 2 (revised) by examining the highlighted differences. Accept changes that follow the rules: acronyms must be explained on first use, dates must be in yyyy-mm-dd format, and no PII (personal names/information). Reject changes that violate these rules. Click on each diff to review and use Accept/Reject buttons to make decisions.',
    ux: 'Compare document drafts side-by-side, click on highlighted diffs to review, accept good changes and reject bad changes based on style guide rules (acronyms, dates, no PII)',
    testFn: 'test_20',
  },
  {
    id: 'medical-lab-results-entry',
    instructions: 'Transfer medical lab test results from external Excel files into the clinical data management system. Open the file "copy-paste-task-21.xlsx" from the Documents folder. For each Excel row, look at the test_category column to determine which tab to use (Hematology/Chemistry/Immunology), then click that tab and add a table row. The test_name column corresponds to the "Test Name" dropdown in the selected tab. Navigate between test category tabs based on each row\'s test_category. Add table rows for each result, use popup name picker to select patients, and popup calculator for range validation. Transfer 3 lab results total across the appropriate category tabs. Use the dropdown menus for test names, number inputs for results, and validation indicators for ranges. Excel files are provided externally - you must operate between Excel application and the web interface.',
    ux: 'Navigate tabs, add table rows, use name picker popup, range calculator popup, dropdown menus, number spinners, validation indicators',
    testFn: 'test_21',
  },
  {
    id: 'medical-appointment-scheduling',
    instructions: 'Use the provided Excel file to fill in patient details. Open the file "copy-paste-task-22.xlsx" from the Documents folder. Select a provider, then click an available time slot on the calendar to schedule the appointment. Schedule all three appointments.',
    ux: 'The user will manually enter data into a form, select a provider from a dropdown, and then click on a calendar grid to place the appointment. No drag-and-drop is involved.',
    testFn: 'test_22',
  },
  {
    id: 'customer-registration-wizard',
    instructions: 'Open external Excel customer data files and transfer business information through a multi-step wizard with progress indicators. Open the file "copy-paste-task-23.xlsx" from the Documents folder. Process all 3 companies through the complete wizard flow: Step 1 - Company info with auto-complete, Step 2 - Contact details with validation, Step 3 - Address via popup lookup, Step 4 - Industry via image card selection, Step 5 - Revenue/size via sliders. Navigate using Tab/Shift+Tab for efficient field entry.',
    ux: 'Multi-step wizard with progress bar, breadcrumb navigation, auto-complete fields, validation badges, address lookup popup, industry image cards, revenue/employee sliders',
    testFn: 'test_23',
  },
  {
    id: 'service-ticket-kanban',
    instructions: 'Transfer IT service ticket information from the Excel file "copy-paste-task-24.xlsx" in the Documents folder into the Kanban-style ticket system. Create tickets by entering all required fields from Excel: ticket reference, customer ID, issue summary, reported by, report date, estimated hours. Use the priority color buttons to select priority level (Critical/High/Medium/Low). Select the category from tag cloud. Select affected systems by clicking multiple system tags (Ctrl+click for multi-select). Use the "Trigger Auto-Assignment" button to automatically assign tickets based on priority. Use "Calculate SLA" to set SLA timer. After creating each ticket, it will appear in the "Open" column of the Kanban board. Create all 3 tickets with exact data matching the Excel source.',
    ux: 'Fill ticket form fields from Excel data, click priority color buttons, click category tags, multi-select system tags, trigger auto-assignment workflow, calculate SLA timer, create tickets',
    testFn: 'test_24',
  },
  {
    id: 'library-cataloging',
    instructions: 'Transfer book information from the Excel file "copy-paste-task-25.xlsx" in the Documents folder into the library cataloging system. For each book: 1) Scan or enter the ISBN barcode number in the scanner field, 2) Navigate the Dewey decimal classification tree on the left to find and select the appropriate subject classification (click arrows to expand, click labels to select, or double-click labels to expand), 3) Fill in book details from Excel: Title, Author, Publication Year, Publisher, Price, 4) Manually enter the Location Code from Excel (e.g., PSY-150.1), 5) Select book condition from dropdown, 6) Click "Add to Catalog" to complete cataloging. The Subject field auto-fills when you click a classification in the Dewey tree. The visual shelf picker on the right is a reference tool showing physical shelf locations. Catalog all 3 books with exact data matching the Excel source.',
    ux: 'Navigate Dewey tree by clicking arrows/labels (or double-click to expand), scan/enter ISBN, fill form fields manually from Excel including location code, select condition dropdown, click Add to Catalog button',
    testFn: 'test_25',
  },
  {
    id: 'student-enrollment-card-based',
    instructions: 'Open external Excel student data files and enroll 3 students into the education system. Open the file "copy-paste-task-26.xlsx" from the Documents folder. For each student: enter student name, date of birth, parent/guardian name, contact email, and home address. Drag a program card from the available programs into the program selection drop zone. Select grade level from dropdown, enter start date, and select special accommodations from checkbox group. Click "Calculate Age" button to verify date of birth. Double-click program cards to view curriculum details. Complete enrollment by clicking "Enroll Student" button for all 3 students.',
    ux: 'Fill student information fields, drag program cards to selection zone, use age calculator, select grade and date, check special accommodations boxes, enroll students',
    testFn: 'test_26',
  },
  {
    id: 'tenant-application-document-upload',
    instructions: 'Open external Excel tenant data files and submit 3 tenant applications. Open the file "copy-paste-task-27.xlsx" from the Documents folder. For each applicant: enter applicant name, phone contact, current address, select employment status from dropdown, enter monthly income, and use the income calculator to verify income. Enter rental history, desired move date, and reference contact information. Click the reference verification button to verify references. Upload required documents by clicking document type buttons in the upload center (Pay Stub, Bank Statement, Tax Return, Business License, Contract Agreement, or References). The credit score visualization will update automatically based on income and rental history. After completing all fields, document uploads, and verifications, click "Submit Application" to submit each tenant application.',
    ux: 'Fill applicant information fields, use income calculator widget, verify references with popup, upload documents to designated zones, view credit score visualization, submit applications',
    testFn: 'test_27',
  },
  {
    id: 'copy-paste-task-28',
    instructions: 'Open the external Excel loan application files and transfer all loan data into the financial system. Open the file "copy-paste-task-28.xlsx" from the Documents folder. For each of the 3 applicants, enter their personal information (full name, SSN, annual income, employment type, monthly obligations, credit score), set the loan amount using the slider or numeric input, select loan purpose from dropdown, and enter collateral description. Complete all four loan calculations (monthly payment, DTI ratio, risk assessment, and payment schedule) before submitting the application. Process all 3 loan applications from the Excel files.',
    ux: 'Single-column form layout with personal info fields at top, loan amount controls (slider + numeric input side-by-side), loan purpose dropdown, collateral description field, followed by four calculator widget sections (Loan Calculator, DTI Calculator, Risk Assessment, Payment Schedule) with individual calculate buttons. Each calculator displays results after button click. Submit button at bottom. Submitted applications shown below with all details.',
    testFn: 'test_28',
  },
  {
    id: 'inventory-receiving-terminal',
    instructions: 'Transfer inventory data from external Excel files into the warehouse receiving terminal system. Open the file "copy-paste-task-29.xlsx" from the Documents folder. Use the barcode scanner to enter PO numbers, fill all required fields including item details, quantities, inspector information, and condition assessments. Capture condition photos for documentation. Process all 3 inventory items from the Excel files.',
    ux: 'Scan/enter barcode for PO number, fill form fields with Excel data, use spinner controls for quantities and prices, select condition status with radio buttons, capture photos, add items to receiving table',
    testFn: 'test_29',
  },
  {
    id: 'legal-contract-management',
    instructions: 'Open the Excel contract files and transfer all contract information into the contract management system. Open the file "copy-paste-task-30.xlsx" from the Documents folder. For each contract, enter the contract reference, parties, type, dates, value, and renewal terms. Select the appropriate key clauses from the clause library. Build the timeline visualization for the contract period and set a renewal reminder. Complete all 3 contracts.',
    ux: 'Enter contract data manually from Excel files, select clauses from the library, build timeline, and set reminders for each contract',
    testFn: 'test_30',
  },
  {
    id: 'compliance-gap-remediation',
    instructions: 'Process audit violation data from the external PDF audit checklist. Open the file "copy-paste-task-31.docx" from the Documents folder. The checklist contains 8 violations across 4 categories (Data Security, Access Control, Documentation, Process Compliance). Enter audit reference AUD-2024-301, then add all 8 violations using the Add Violation button. Select the appropriate category which will reveal category-specific form fields. Complete all fields for each violation and track progress. Submit the complete audit when all 8 violations are processed with exactly 2 violations per category.',
    ux: 'Review external PDF audit checklist file, add violations one by one through modal form, select category to reveal conditional fields, track progress with circular chart (0/8 → 8/8), submit when complete',
    testFn: 'test_31',
  },
  {
    id: 'equipment-calibration-sequencing',
    instructions: 'Process equipment calibration from the external calibration manual. Open the file "copy-paste-task-32.docx" from the Documents folder. Enter batch reference BATCH-2024-105, which contains 6 equipment items in 2 dependency chains (Chain 1: CAL-A → CAL-B → CAL-C, Chain 2: CAL-D → CAL-E → CAL-F). Equipment must be calibrated in dependency order - prerequisites must be completed before dependent equipment can be started. Click "Begin Calibration" for equipment with satisfied dependencies (initially CAL-A and CAL-D have no dependencies), then enter calibration data from the PDF: Technician name, Calibration date (YYYY-MM-DD), and Calibration notes. The system highlights next available equipment in blue. Complete all 6 calibrations with correct data from PDF and submit the batch.',
    ux: 'Enter batch reference, follow dependency chains, click Begin Calibration, manually enter technician/date/notes from PDF for each equipment, next available highlighted in blue, complete all 6',
    testFn: 'test_32',
  },
  {
    id: 'training-module-prerequisites',
    instructions: 'Review 5 employee training course requests from external PDF course catalog and approve or deny each course based on prerequisite validation. Open the file "copy-paste-task-33.docx" from the Documents folder. Open PDF showing employee completed courses and requested courses (3-4 per employee). Click "Review Request" for each employee, enter their employee name, ID, completed courses, and requested courses from PDF. System validates prerequisites automatically. For each requested course, select decision: Approve (if prerequisites met), Deny (if prerequisites not met), or Defer. When denying, select reason "Prerequisites Not Met" if prerequisites are not satisfied. Process all 5 employees and submit all approvals.',
    ux: 'Review PDF employee course requests, click Review Request, enter employee data and courses, system checks prerequisites with ✓/✗ indicators, select Approve/Deny/Defer per course, choose denial reasons, process 5 employees',
    testFn: 'test_33',
  },
  {
    id: 'product-configuration-validator',
    instructions: 'Complete 3 product configurations from external Markdown file by finding valid combinations that satisfy 5 validation rules. Open the file "copy-paste-task-34.docx" from the Documents folder. TASK: For each configuration, (1) Open Markdown to get Product Reference and Customer Name - enter these exactly, (2) Read the 5 validation rules carefully, (3) Select any combination from 8 dropdowns (Base Model, Processor, Memory, Storage, Graphics, Display, Material, Finish) that satisfies ALL 5 rules with zero conflicts. VALIDATION: System validates in real-time showing "X/5 Rules Satisfied". When rules are violated, you see only "Rule N violated" (where N=1-5) - consult Markdown to understand what Rule N requires. MULTIPLE SOLUTIONS: There are many valid combinations for each config - any combination that achieves 5/5 rules is correct. Adjust dropdowns until green "5/5 Rules Satisfied" appears, then submit. Complete all 3 configurations.',
    ux: 'Open Markdown spec, read 5 rules + 3 config names, enter Reference+Customer exactly, select dropdown combinations, watch live validation counter (X/5), see "Rule N violated" errors, adjust dropdowns to satisfy all rules, submit when 5/5 green, repeat for 3 configs',
    testFn: 'test_34',
  },
  {
    id: 'code-review-resolution-tracker',
    instructions: 'Process 3 code review PRs from a single external Markdown document containing 3 review comments each. Open the file "copy-paste-task-35.docx" from the Documents folder. For each PR: (1) Open the Markdown file to view PR reference, repository name, reviewer name, review date, and 3 comments with line numbers, severity levels, and descriptions. (2) Enter PR information in the header fields. (3) For each of the 3 comments, enter line number, select severity (Blocker/Major/Minor), enter comment description, assign status based on comment keywords: "Resolved" if description mentions (refactored, fixed, implemented, corrected, updated), "Wontfix" if mentions (out of scope, not applicable, design decision, intentional), "Needs Discussion" if mentions (clarify, uncertain, question, discuss, debate), and enter a resolution response (minimum 10 characters required for non-Unresolved statuses). (4) Submit the PR review when all 3 comments are addressed. Complete all 3 PR reviews.',
    ux: 'Open single Markdown PR review file, enter PR info, process 3 comments per PR with status dropdowns (Resolved/Wontfix/Needs Discussion) based on description keywords, enter responses (10+ chars), track progress (X/3 resolved), submit each PR, repeat for 3 PRs',
    testFn: 'test_35',
  },
  {
    id: 'accessibility-audit-validator',
    instructions: 'Validate accessibility compliance for 3 audit sessions. Open the files "copy-paste-task-36-sample-app-1.png", "copy-paste-task-36-sample-app-2.png", and "copy-paste-task-36-sample-app-3.png" from the Documents folder. From the 15-item checklist (5 categories with 3 violations each), select ONLY violations you can clearly identify. Avoid false positives - not all violations are present. (1) Picture: copy-paste-task-36-sample-app-1.png, Reference: A11Y-2024-201, Auditor: Marcus Thompson, Date: 2024-02-20. (2) Picture: copy-paste-task-36-sample-app-2.png, Reference: A11Y-2024-202, Auditor: Sarah Chen, Date: 2024-02-21. (3) Pictures: copy-paste-task-36-sample-app-3.png, Reference: A11Y-2024-203, Auditor: David Kim, Date: 2024-02-22.',
    ux: 'Complete 3 audits (each with 1 different PNG screenshot + specific reference/auditor/date), select from 15-item checklist, avoid false positives, see accuracy metrics',
    testFn: 'test_36',
  },
  {
    id: 'service-taxonomy-mapper',
    instructions: 'Classify 10 services from an external PDF file into a hierarchical taxonomy system (2 services from each of 5 main categories). (1) Open the file "copy-paste-task-37.docx" from the Documents folder listing 10 service descriptions with classification guidelines, (2) Enter Catalog ID "CAT-2024-305" and classification date "2024-03-01", (3) For each of the 10 services, enter service name and description from PDF, then analyze keywords in the description to select the correct Primary Category (5 options: Technology Services, Business Services, Creative Services, Professional Services, Support Services) and Subcategory (4 options per primary category, dynamically filtered based on primary selection). Use the keyword-based classification rules provided in the PDF to guide your selections. (4) After classifying all 10 services with correct taxonomy paths, submit complete catalog.',
    ux: 'Open copy-paste-task-37.docx, enter catalog ID/date, classify 10 services using nested dropdowns (Primary → Subcategory), keyword-based classification using PDF guidelines, see distribution stats (2 per category), submit when 10/10 complete',
    testFn: 'test_37',
  },
  {
    id: 'design-annotation-validator',
    instructions: 'Validate design annotations by mapping markers to requirements. Open the file "copy-paste-task-38.png" from the Documents folder showing 5 numbered annotation markers. (1) Enter Mockup Reference (MOCK-2024-550), Designer Name (Sarah Chen), and Validation Date (2024-03-15). (2) For each visible marker (1-5) in the mockup, enter the marker number and select the matching requirement from the dropdown. (3) Click Add to add the marker-requirement pair to the table. Submit validation once all 5 mappings are added.',
    ux: 'Open copy-paste-task-38.png, enter mockup info, use form to map each marker (1-5) to requirement dropdown, add to table, see accuracy metrics (correct/incorrect/missing)',
    testFn: 'test_38',
  },
  {
    id: 'incident-severity-classifier',
    instructions: 'Triage 3 incident batches by classifying severity and escalation requirements. Open the file "copy-paste-task-39.docx" from the Documents folder containing incident reports. For each batch: (1) Enter Batch Reference (BATCH-2024-408, BATCH-2024-409, or BATCH-2024-410). (2) For each of 2 incidents in the batch, copy incident data: Incident ID, Reported By, and Description. (3) Analyze the incident description to determine correct Severity Classification based on keywords: P1 Critical (outage, production down, complete failure, data loss, security breach, all users affected), P2 High (degraded performance, partial outage, customer-facing, significant impact, service disruption), P3 Medium (minor bug, single user, workaround available, non-urgent, moderate impact), P4 Low (feature request, documentation, enhancement, cosmetic, informational). (4) Select appropriate severity from dropdown. Escalation checkbox will automatically check for P1/P2 incidents and uncheck for P3/P4. (5) Click Add to add incident to triage queue. Repeat for both 2 incidents per batch. (6) Submit batch once both 2 incidents are classified. Complete all 3 batches with correct severity classifications matching keyword rules.',
    ux: 'Open copy-paste-task-39.docx with 2 incidents per batch, enter batch reference, fill incident form (ID/Reporter/Description), classify severity (P1/P2/P3/P4 dropdown), see auto-managed escalation checkbox (P1/P2=checked, P3/P4=unchecked), track progress (X/2 incidents), view severity distribution (P1/P2/P3/P4 counts), see progressive [Cheat] showing real-time form validation, submit batch when 2/2 complete, complete 3 batches total',
    testFn: 'test_39',
  },
  {
    id: 'change-request-risk-assessment',
    instructions: 'Complete a risk assessment for 6 software changes by analyzing descriptions from the changelog and classifying each change by Scope, Risk Level, and Rollback Complexity. Open the file "copy-paste-task-40.docx" from the Documents folder to view the complete change descriptions. Enter the Changelog Reference, Assessment Date, and Assessor Name. For each of the 6 changes, analyze the change description and select the appropriate classifications from the dropdowns: Scope (UI/Backend/Database/Infrastructure), Risk Level (Low/Medium/High), Rollback Complexity (Easy/Moderate/Hard). Use the assessment criteria provided in the instructions to understand the classification rules based on keywords in the change descriptions. Complete all 6 change assessments to enable submission.',
    ux: 'Open copy-paste-task-40.docx to read change descriptions, enter assessment header info, analyze each change description using keyword rules, select 3 dropdowns per change (18 total), see progress tracking and risk summary, submit when all 6 assessments complete',
    testFn: 'test_40',
  },
];

export const tasks = (uiBenchTasks as any[]).map((t, index) => ({
  id: index + 1,
  name: t.id,
  component: createTaskComponentForIndex(index),
  task: t.instructions,
  ux: t.ux,
  testFn: t.testFn, // Reference to test function, not the function itself
  fullWidth: true,
  requireResultSubmission: !!t.require_result_submission,
}));

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Copy-Paste & Iteration Tasks', appPath: '/copy-paste-tasks' };

const CopyPasteTasksApp: React.FC = () => {
  return (
    <TaskWrapper tasks={tasks} appName="Copy-Paste & Iteration Tasks" appPath="/copy-paste-tasks" />
  );
};

export default CopyPasteTasksApp;
