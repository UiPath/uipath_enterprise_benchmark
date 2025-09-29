import React from 'react';
import TaskWrapper from '../src/TaskWrapper';
import Task1 from './copy-paste-tasks/task-1';
import Task2 from './copy-paste-tasks/task-2';
import Task3 from './copy-paste-tasks/task-3';
import Task4 from './copy-paste-tasks/task-4';
import Task5 from './copy-paste-tasks/task-5';
import Task6 from './copy-paste-tasks/task-6';
import Task7 from './copy-paste-tasks/task-7';
import Task8 from './copy-paste-tasks/task-8';
import Task9 from './copy-paste-tasks/task-9';
import Task10 from './copy-paste-tasks/task-10';
import Task11 from './copy-paste-tasks/task-11';
import Task12 from './copy-paste-tasks/task-12';
import Task13 from './copy-paste-tasks/task-13';
import Task14 from './copy-paste-tasks/task-14';
import Task15 from './copy-paste-tasks/task-15';
import Task16 from './copy-paste-tasks/task-16';
import Task17 from './copy-paste-tasks/task-17';
import Task18 from './copy-paste-tasks/task-18';
import Task19 from './copy-paste-tasks/task-19';
import Task20 from './copy-paste-tasks/task-20';

type UiBenchTask = {
  id: string;
  instructions: string;
  ux: string;
  test?: () => { success: boolean; message?: string };
  require_result_submission?: boolean;
};

function createTaskComponent(TaskComponent: React.ComponentType): React.FC {
  const C: React.FC = () => <TaskComponent />;
  return C;
}

function createTaskComponentForIndex(index: number): React.FC {
  const components = [Task1, Task2, Task3, Task4, Task5, Task6, Task7, Task8, Task9, Task10, Task11, Task12, Task13, Task14, Task15, Task16, Task17, Task18, Task19, Task20];
  const TaskComponent = components[index];
  if (!TaskComponent) {
    throw new Error(`Task component not found for index ${index}`);
  }
  return createTaskComponent(TaskComponent);
}

const uiBenchTasks: UiBenchTask[] = [
  {
    id: 'copy-paste-excel-to-forms',
    instructions: 'Copy contact details from rows 30, 40, and 50 of the customer table to individual contact forms. Click on table cells to select and copy, then manually enter or paste data into the corresponding form fields. Complete and submit all 3 contact forms with Name, Email, Phone, and Company information.',
    ux: 'Click table cells in rows 30, 40, and 50 to select and copy data, then paste into the 3 form fields using the Paste buttons',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { contactForms, customerData, submittedForms } = appState;
      
      if (!contactForms || !customerData) {
        return { success: false, message: 'Contact forms or customer data not found in app state.' };
      }
      
      // Check if all forms are submitted
      if (!submittedForms || submittedForms.length !== 3) {
        return { 
          success: false, 
          message: `Only ${submittedForms ? submittedForms.length : 0} of 3 forms are submitted. Submit all forms after filling them.` 
        };
      }
      
      // Verify we have 3 forms
      if (contactForms.length !== 3) {
        return { success: false, message: `Expected 3 contact forms, found ${contactForms.length}.` };
      }
      
      // Check if all forms are completed (have all required fields)
      const fullyCompletedForms = contactForms.filter((form: any) => 
        form.name && form.email && form.phone && form.company &&
        form.name.trim() !== '' && form.email.trim() !== '' && 
        form.phone.trim() !== '' && form.company.trim() !== ''
      );
      
      if (fullyCompletedForms.length !== 3) {
        return { 
          success: false, 
          message: `Only ${fullyCompletedForms.length} out of 3 forms are fully completed. Each form needs Name, Email, Phone, and Company fields filled.` 
        };
      }
      
      // Verify the data matches the source rows (30, 40, 50, which are indices 29, 39, 49)
      const sourceRows = [customerData[29], customerData[39], customerData[49]]; // rows 30, 40, 50 (0-indexed as 29, 39, 49)
      
      const expectedRowNumbers = [30, 40, 50];
      
      for (let i = 0; i < fullyCompletedForms.length; i++) {
        const form = fullyCompletedForms[i];
        const sourceRow = sourceRows[i];
        const expectedRowNumber = expectedRowNumbers[i];
        
        // Check if form data matches source data (trim whitespace for comparison)
        if (form.name.trim() !== sourceRow.name.trim()) {
          return { 
            success: false, 
            message: `Form ${i + 1} name "${form.name.trim()}" does not match source row ${expectedRowNumber} name "${sourceRow.name.trim()}".` 
          };
        }
        
        if (form.email.trim() !== sourceRow.email.trim()) {
          return { 
            success: false, 
            message: `Form ${i + 1} email "${form.email.trim()}" does not match source row ${expectedRowNumber} email "${sourceRow.email.trim()}".` 
          };
        }
        
        if (form.phone.trim() !== sourceRow.phone.trim()) {
          return { 
            success: false, 
            message: `Form ${i + 1} phone "${form.phone.trim()}" does not match source row ${expectedRowNumber} phone "${sourceRow.phone.trim()}".` 
          };
        }
        
        if (form.company.trim() !== sourceRow.company.trim()) {
          return { 
            success: false, 
            message: `Form ${i + 1} company "${form.company.trim()}" does not match source row ${expectedRowNumber} company "${sourceRow.company.trim()}".` 
          };
        }
      }
      
      return { 
        success: true, 
        message: 'Successfully copied contact details from rows 30, 40, and 50 to all 3 contact forms with correct data mapping and submitted all forms.' 
      };
    },
  },
  {
    id: 'copy-paste-file-tree-to-table',
    instructions: 'Expand project folders, find all PDF files, copy their paths, and add them to the summary table using the form above the table. Navigate through the 3-level folder structure, select PDF files, use "Copy Path" button, then paste (Ctrl+V) into the path input field, and click "Add". Find all 10 PDF files scattered across the 2 project folders.',
    ux: 'Expand folders by clicking on them, select PDF files, and use "Add to Table" to build the summary',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { pdfTable, fileStructure } = appState;
      
      if (!pdfTable || !fileStructure) {
        return { success: false, message: 'PDF table or file structure not found in app state.' };
      }
      
      // Verify all PDFs are found
      if (pdfTable.length !== 10) {
        return { 
          success: false, 
          message: `Expected 10 PDF files in table, found ${pdfTable.length}. Make sure to explore all folders and add all PDF files.` 
        };
      }
      
      // Verify no duplicates
      const uniquePaths = new Set(pdfTable.map((row: any) => row.fullPath));
      if (uniquePaths.size !== pdfTable.length) {
        return { 
          success: false, 
          message: `Found duplicate entries in table. Each PDF should only be added once.` 
        };
      }
      
      // Verify all entries are actually PDF files
      const nonPdfs = pdfTable.filter((row: any) => !row.filename.endsWith('.pdf'));
      if (nonPdfs.length > 0) {
        return { 
          success: false, 
          message: `Found non-PDF files in table: ${nonPdfs.map((r: any) => r.filename).join(', ')}. Only PDF files should be added.` 
        };
      }
      
      // Verify all entries have required columns
      for (let i = 0; i < pdfTable.length; i++) {
        const row = pdfTable[i];
        if (!row.filename || !row.fullPath || !row.size) {
          return { 
            success: false, 
            message: `Row ${i + 1} is missing required fields. All rows need Filename, Full Path, and Size.` 
          };
        }
        
        if (!row.filename.trim() || !row.fullPath.trim() || !row.size.trim()) {
          return { 
            success: false, 
            message: `Row ${i + 1} has empty fields. All fields must contain valid data.` 
          };
        }
      }
      
      return { 
        success: true, 
        message: 'Successfully found and catalogued all 10 PDF files with correct filename, path, and size information.' 
      };
    },
  },
  {
    id: 'copy-paste-product-catalog-to-cart',
    instructions: 'Browse through the 2-page product catalog and add qualifying items to your shopping cart. Navigate through all pages using pagination controls and identify products over $50. After adding items to cart, manually adjust quantities in the shopping cart: set quantity to 2 for items between $50-$100, and quantity to 1 for items over $100. Skip items $50 or below. Avoid adding duplicates and ensure items are sourced from both pages.',
    ux: 'Navigate through product catalog pages, add items >$50 to cart, then manually adjust quantities: $50-$100 = qty 2, >$100 = qty 1',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { cart, products } = appState;
      
      if (!cart || !products) {
        return { success: false, message: 'Shopping cart or product catalog not found in app state.' };
      }

      
      // Check if cart has items
      if (cart.length === 0) {
        return { 
          success: false, 
          message: 'Shopping cart is empty. Add products over $50 to the cart.' 
        };
      }
      
      // Verify all cart items are over $50
      const itemsUnder50 = cart.filter((item: any) => item.price <= 50);
      if (itemsUnder50.length > 0) {
        return { 
          success: false, 
          message: `Found ${itemsUnder50.length} items in cart with price $50 or below. Only add items over $50. Items: ${itemsUnder50.map((i: any) => `${i.name} ($${i.price})`).join(', ')}` 
        };
      }

      // Verify correct quantities based on price ranges
      const quantityErrors = [];
      for (const item of cart) {
        const expectedQuantity = item.price > 50 && item.price <= 100 ? 2 : 1;
        if (item.quantity !== expectedQuantity) {
          quantityErrors.push(`${item.name} ($${item.price}) has quantity ${item.quantity}, expected ${expectedQuantity}`);
        }
      }
      if (quantityErrors.length > 0) {
        return { 
          success: false, 
          message: `Incorrect quantities found. Items $50-$100 should have quantity 2, items over $100 should have quantity 1. Errors: ${quantityErrors.join(', ')}` 
        };
      }
      
      // Check for duplicates in cart
      const uniqueIds = new Set(cart.map((item: any) => item.id));
      if (uniqueIds.size !== cart.length) {
        return { 
          success: false, 
          message: 'Found duplicate items in cart. Each product should only be added once.' 
        };
      }
      
      // Verify items are sourced from multiple pages (both pages)
      const productsOver50 = products.filter((p: any) => p.price > 50);
      const cartProductIds = new Set(cart.map((item: any) => item.id));
      const pagesWithAddedItems = new Set();
      
      const ITEMS_PER_PAGE = 12;
      for (let page = 1; page <= 2; page++) {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageProducts = products.slice(startIndex, endIndex);
        
        const hasItemFromThisPage = pageProducts.some((p: any) => cartProductIds.has(p.id));
        if (hasItemFromThisPage) {
          pagesWithAddedItems.add(page);
        }
      }
      
      if (pagesWithAddedItems.size < 2) {
        return { 
          success: false, 
          message: `Items added from only ${pagesWithAddedItems.size} page(s). Add items from both pages to show comprehensive browsing. Current pages with items: ${Array.from(pagesWithAddedItems).join(', ')}` 
        };
      }
      
      // Verify minimum number of items (should add at least 4-6 items over $50)
      if (cart.length < 4) {
        return { 
          success: false, 
          message: `Only ${cart.length} items in cart. Add at least 4 items over $50 to demonstrate thorough catalog browsing.` 
        };
      }
      
      // Check if user has navigated through multiple pages
      const availableProductsOver50 = productsOver50.length;
      const addedCount = cart.length;
      const addedPercentage = (addedCount / availableProductsOver50) * 100;
      
      if (addedPercentage < 30) {
        return { 
          success: false, 
          message: `Added only ${addedCount} out of ${availableProductsOver50} available items over $50 (${addedPercentage.toFixed(1)}%). Add at least 30% of qualifying items to show comprehensive browsing.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully added ${cart.length} items over $50 from ${pagesWithAddedItems.size} pages with correct quantities (items $50-$100: qty 2, items >$100: qty 1). Total cart value: $${cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)}.` 
      };
    },
  },
  {
    id: 'copy-paste-quarterly-sales-aggregation',
    instructions: 'Collect quarterly sales data from 4 separate tables and aggregate for North region. Switch between Q1, Q2, Q3, Q4 tabs to view sales data, then manually calculate and enter North region totals in the Summary tab. For each quarter, scan through the table to find all North region entries, sum their sales amounts, and enter the totals in the Q1, Q2, Q3, Q4 columns. The total sales will be calculated automatically.',
    ux: 'Switch between Q1-Q4 tabs to view quarterly data sorted by Product, scan for North region entries, manually calculate totals, and enter them in Summary tab',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { summaryData, northTotals } = appState;
      
      if (!summaryData || !northTotals) {
        return { success: false, message: 'Summary data or North totals not found in app state.' };
      }
      
      // Check if North region data exists
      if (summaryData.length === 0 || summaryData[0].region !== 'North') {
        return { 
          success: false, 
          message: 'North region not found in summary table.' 
        };
      }
      
      // Check if quarterly data has been filled out (not all zeros) - don't check total as it's auto-calculated
      const northRecord = summaryData[0];
      if (!northRecord || northRecord.q1 <= 0 || northRecord.q2 <= 0 || northRecord.q3 <= 0 || northRecord.q4 <= 0) {
        return { 
          success: false, 
          message: 'Summary table is incomplete. Switch between quarterly tabs, find North region entries, calculate totals, and enter them in the Summary tab.' 
        };
      }
      
      // Verify accuracy of entered quarterly data (exact matches required)
      // Don't check total as it's auto-calculated
      const errors = [];
      
      // Check quarterly totals only - must be exact
      const quarters = ['q1', 'q2', 'q3', 'q4'];
      for (const quarter of quarters) {
        const summaryAmount = northRecord[quarter];
        const actualAmount = northTotals[quarter];
        
        if (summaryAmount !== actualAmount) {
          errors.push(`North ${quarter.toUpperCase()}: entered ${summaryAmount}, expected ${actualAmount}`);
        }
      }
      
      if (errors.length > 0) {
        return { 
          success: false, 
          message: `Data accuracy errors found: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` and ${errors.length - 3} more` : ''}. Verify calculations against quarterly data.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully aggregated North region sales data across 4 quarters. Quarterly values entered correctly with auto-calculated total: $${northRecord.totalSales.toLocaleString()}.` 
      };
    },
  },
  {
    id: 'copy-paste-employee-salary-editing',
    instructions: 'Review the employee table and update salaries for employees hired before 2020. Scroll through all 80 employee records, identify employees with hire dates before 01/01/2020, and increase their salaries by $1000. Double-click salary cells to edit, add $1000 to the current salary (you can use arrow keys to increment by $1000), press Enter to save the value. Make sure to review all employees as the records are not sorted by hire date.',
    ux: 'Scroll through employee table, identify employees hired before 2020, double-click salary cells to edit and increase salaries by $1000',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { employees, pre2020Employees } = appState;
      
      if (!employees || !pre2020Employees) {
        return { success: false, message: 'Employee data or pre-2020 employee list not found in app state.' };
      }
      
      // Check that we have the expected number of employees
      if (employees.length !== 80) {
        return { success: false, message: `Expected 80 employees, found ${employees.length}.` };
      }
      
      if (pre2020Employees.length !== 10) {
        return { success: false, message: `Expected 10 pre-2020 employees, found ${pre2020Employees.length}.` };
      }
      
      // Check that all pre-2020 employees have been updated
      const editedPre2020Employees = employees.filter((emp: any) => {
        const year = parseInt(emp.hireDate.split('/')[2]);
        return year < 2020 && emp.isEdited;
      });
      
      if (editedPre2020Employees.length === 0) {
        return { 
          success: false, 
          message: 'No pre-2020 employees have been updated. Find employees hired before 2020 and increase their salaries by 5%.' 
        };
      }
      
      if (editedPre2020Employees.length < pre2020Employees.length) {
        return { 
          success: false, 
          message: `Only ${editedPre2020Employees.length} of ${pre2020Employees.length} pre-2020 employees have been updated. Make sure to update all employees hired before 2020.` 
        };
      }
      
      // Verify accuracy of salary calculations (exact matches required)
      const errors = [];
      for (const emp of editedPre2020Employees) {
        const expectedSalary = emp.originalSalary + 1000;
        if (emp.salary !== expectedSalary) {
          errors.push(`${emp.name} (ID: ${emp.id}): current salary ${emp.salary}, expected ${expectedSalary}`);
        }
      }
      
      if (errors.length > 0) {
        return { 
          success: false, 
          message: `Salary calculation errors found: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` and ${errors.length - 3} more` : ''}. Salaries should be increased by exactly $1000 (original + 1000).` 
        };
      }
      
      // Check that no post-2019 employees were incorrectly updated
      const incorrectlyEditedEmployees = employees.filter((emp: any) => {
        const year = parseInt(emp.hireDate.split('/')[2]);
        return year >= 2020 && emp.isEdited;
      });
      
      if (incorrectlyEditedEmployees.length > 0) {
        return { 
          success: false, 
          message: `${incorrectlyEditedEmployees.length} employees hired in 2020 or later were incorrectly updated. Only update employees hired before 2020.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully updated salaries for all ${editedPre2020Employees.length} employees hired before 2020 with accurate $1000 increases. No post-2019 employees were incorrectly modified.` 
      };
    },
  },
  {
    id: 'copy-paste-search-to-email',
    instructions: 'Search for "urgent" tasks in the task system and compile a list of all urgent task IDs into an email to management. Send email to: manager@company.com with subject: "Urgent Tasks Report". Search for tasks containing "urgent" in their title or description, then create a numbered list of task IDs in the email body. Format as: "1. TSK-2024-001\\n2. TSK-2024-002" etc. Include all urgent task IDs found in the search results.',
    ux: 'Search for "urgent" tasks, find all matching results, create numbered list of task IDs in email to manager@company.com',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { emailForm, urgentTasks, emailSent } = appState;
      
      if (!emailForm || !urgentTasks) {
        return { success: false, message: 'Email form or urgent tasks not found in app state.' };
      }
      
      // Check if email was sent
      if (!emailSent) {
        return { 
          success: false, 
          message: 'Email has not been sent yet. Complete the email form and click Send Email.' 
        };
      }
      
      // Check if correct recipient and subject were used
      if (emailForm.to.trim().toLowerCase() !== 'manager@company.com') {
        return { 
          success: false, 
          message: `Email sent to "${emailForm.to.trim()}". Should be sent to "manager@company.com".` 
        };
      }
      
      if (emailForm.subject.trim().toLowerCase() !== 'urgent tasks report') {
        return { 
          success: false, 
          message: `Email subject is "${emailForm.subject.trim()}". Should be "Urgent Tasks Report".` 
        };
      }
      
      // Verify email contains all urgent task IDs in numbered list format
      const emailBody = emailForm.body;
      const urgentTaskIds = urgentTasks.map((task: any) => task.id);
      
      // Check if all urgent task IDs are mentioned in email
      const missingTaskIds = urgentTaskIds.filter((id: string) => 
        !emailBody.includes(id)
      );
      
      if (missingTaskIds.length > 0) {
        return { 
          success: false, 
          message: `Email is missing ${missingTaskIds.length} urgent task ID(s): ${missingTaskIds.slice(0, 3).join(', ')}${missingTaskIds.length > 3 ? ` and ${missingTaskIds.length - 3} more` : ''}. Include all urgent task IDs in a numbered list.` 
        };
      }
      
      // Check if task IDs are formatted as a numbered list
      const hasNumberedListFormat = urgentTaskIds.some((id: string) => {
        const patterns = [
          new RegExp(`\\d+\\.\\s*${id}`, 'i'),  // "1. TSK-2024-001"
          new RegExp(`\\d+\\)\\s*${id}`, 'i'),  // "1) TSK-2024-001"  
          new RegExp(`^\\s*${id}`, 'm'),        // Task ID at start of line
        ];
        return patterns.some(pattern => pattern.test(emailBody));
      });
      
      if (!hasNumberedListFormat) {
        return { 
          success: false, 
          message: 'Email body should contain urgent task IDs in a numbered list format (e.g., "1. TSK-2024-001\\n2. TSK-2024-002").' 
        };
      }
      
      // Verify minimum content length (task IDs should provide sufficient length)
      if (emailForm.body.trim().length < 50) {
        return { 
          success: false, 
          message: `Email body is too brief (${emailForm.body.trim().length} characters). Include all urgent task IDs in numbered list format.` 
        };
      }
      
      // Check if expected number of urgent tasks are referenced
      const expectedUrgentCount = urgentTasks.length;
      if (expectedUrgentCount !== 12) {
        return { 
          success: false, 
          message: `Expected exactly 12 urgent tasks in system, found ${expectedUrgentCount}. Task generation may have failed.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully sent email to manager@company.com with subject "Urgent Tasks Report" containing all ${urgentTaskIds.length} urgent task IDs in numbered list format.` 
      };
    },
  },
  {
    id: 'copy-paste-org-chart-directors',
    instructions: 'Expand the management hierarchy and identify all Director-level employees. Navigate through the organization chart by clicking expand arrows to reveal subordinates. Find all employees with "Director" in their title across the organization. Format JSON response as {"directors": ["Full Name 1", "Full Name 2", ...]}, and use the Submit Results button to send it.',
    ux: 'Expand org chart nodes to navigate hierarchy, identify all Director-level employees, and submit JSON via Submit Results button',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { allDirectors, submission } = appState;
      
      if (!allDirectors) {
        return { success: false, message: 'All directors list not found in app state.' };
      }
      
      if (!submission) {
        return { success: false, message: 'No submission found. Please submit your answer as JSON via the Submit Results button.' };
      }
      
      // Validate submission structure
      if (typeof submission !== 'object' || submission === null || Array.isArray(submission)) {
        return { success: false, message: 'Invalid submission format. Expected JSON object like {"directors": ["Name 1", "Name 2", ...]}.' };
      }
      
      if (!('directors' in submission)) {
        return { success: false, message: 'Missing "directors" field in submission. Expected format: {"directors": ["Name 1", "Name 2", ...]}.' };
      }
      
      if (!Array.isArray(submission.directors)) {
        return { success: false, message: 'The "directors" field must be an array of names. Expected format: {"directors": ["Name 1", "Name 2", ...]}.' };
      }
      
      // Check if we have exactly 12 directors in the system
      if (allDirectors.length !== 12) {
        return { 
          success: false, 
          message: `Expected exactly 12 directors in organization chart, found ${allDirectors.length}. Data generation may have failed.` 
        };
      }
      
      // Get expected director names
      const expectedNames = allDirectors.map((dir: any) => dir.name);
      const submittedNames = submission.directors;
      
      // Check if all names are strings
      if (!submittedNames.every((name: any) => typeof name === 'string')) {
        return { success: false, message: 'All director names must be strings. Expected format: {"directors": ["Name 1", "Name 2", ...]}.' };
      }
      
      // Check if we have the right number of directors
      if (submittedNames.length !== 12) {
        return { 
          success: false, 
          message: `Expected exactly 12 director names, received ${submittedNames.length}. Find all Director-level employees in the organization chart.` 
        };
      }
      
      // Check for duplicates in submission
      const uniqueSubmitted = new Set(submittedNames.map((name: string) => name.trim().toLowerCase()));
      if (uniqueSubmitted.size !== submittedNames.length) {
        return { success: false, message: 'Found duplicate names in submission. Each director should only be listed once.' };
      }
      
      // Check if all expected names are present (case insensitive, trimmed)
      const expectedNamesLower = expectedNames.map((name: string) => name.trim().toLowerCase());
      const submittedNamesLower = submittedNames.map((name: string) => name.trim().toLowerCase());
      
      const missingNames = expectedNamesLower.filter((name: string) => !submittedNamesLower.includes(name));
      const extraNames = submittedNamesLower.filter((name: string) => !expectedNamesLower.includes(name));
      
      if (missingNames.length > 0) {
        const originalMissing = expectedNames.filter((name: string) => 
          missingNames.includes(name.trim().toLowerCase())
        );
        return { 
          success: false, 
          message: `Missing ${missingNames.length} director name(s): ${originalMissing.slice(0, 3).join(', ')}${originalMissing.length > 3 ? ` and ${originalMissing.length - 3} more` : ''}. Expand the org chart to find all Directors.` 
        };
      }
      
      if (extraNames.length > 0) {
        const originalExtra = submittedNames.filter((name: string) => 
          extraNames.includes(name.trim().toLowerCase())
        );
        return { 
          success: false, 
          message: `Found ${extraNames.length} invalid name(s): ${originalExtra.slice(0, 3).join(', ')}${originalExtra.length > 3 ? ` and ${originalExtra.length - 3} more` : ''}. Only include employees with "Director" in their title.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully identified all ${submittedNames.length} Director-level employees from the organization chart.` 
      };
    },
  },
  {
    id: 'copy-paste-invoice-top3-overdue',
    instructions: 'Expand invoice details to view line items and identify the top 3 overdue invoices by total value. Click the expand button (+) next to each invoice to see detailed line items and amounts. Find all invoices with "Overdue" status (red background), compare their total amounts, and add the 3 highest value invoices to the table on the right. Enter invoice numbers in order from highest to lowest value.',
    ux: 'Expand invoice rows to view amounts, identify overdue invoices by red background, find top 3 by value, add to table from highest to lowest',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { submittedInvoices, top3OverdueInvoices, overdueInvoices } = appState;
      
      if (!submittedInvoices || !top3OverdueInvoices || !overdueInvoices) {
        return { success: false, message: 'Submitted invoices or top 3 overdue invoices not found in app state.' };
      }
      
      // Check if exactly 3 invoices have been submitted
      if (submittedInvoices.length !== 3) {
        return { 
          success: false, 
          message: `Expected exactly 3 invoices to be submitted, found ${submittedInvoices.length}. Add the top 3 overdue invoices by value.` 
        };
      }
      
      // Verify we have exactly 8 overdue invoices in the system (data consistency check)
      if (overdueInvoices.length !== 8) {
        return { 
          success: false, 
          message: `Expected exactly 8 overdue invoices in system, found ${overdueInvoices.length}. Data generation may have failed.` 
        };
      }
      
      // Check that all submitted invoices are actually overdue
      const submittedNumbers = submittedInvoices.map((sub: any) => sub.invoiceNumber);
      const overdueNumbers = overdueInvoices.map((inv: any) => inv.invoiceNumber);
      
      const nonOverdueSubmitted = submittedNumbers.filter((num: string) => !overdueNumbers.includes(num));
      if (nonOverdueSubmitted.length > 0) {
        return { 
          success: false, 
          message: `Found non-overdue invoices in submission: ${nonOverdueSubmitted.join(', ')}. Only submit invoices with "Overdue" status (red background).` 
        };
      }
      
      // Check if submitted invoices match the expected top 3 (exact order and content)
      const expectedNumbers = top3OverdueInvoices.map((inv: any) => inv.invoiceNumber);
      
      for (let i = 0; i < 3; i++) {
        if (submittedInvoices[i].invoiceNumber !== expectedNumbers[i]) {
          const expectedInv = top3OverdueInvoices[i];
          const submittedInv = submittedInvoices[i];
          return { 
            success: false, 
            message: `Incorrect invoice at position ${i + 1}. Submitted: ${submittedInv?.invoiceNumber || 'missing'} ($${submittedInv?.amount?.toFixed(2) || '0.00'}), Expected: ${expectedInv.invoiceNumber} ($${expectedInv.amount.toFixed(2)}). Check order from highest to lowest value.` 
          };
        }
      }
      
      // Verify the amounts are correctly captured
      for (let i = 0; i < 3; i++) {
        const submitted = submittedInvoices[i];
        const expected = top3OverdueInvoices[i];
        
        if (Math.abs(submitted.amount - expected.amount) > 0.01) {
          return { 
            success: false, 
            message: `Amount mismatch for ${submitted.invoiceNumber}. Submitted: $${submitted.amount.toFixed(2)}, Expected: $${expected.amount.toFixed(2)}.` 
          };
        }
      }
      
      // Verify descending order by amount
      for (let i = 0; i < 2; i++) {
        if (submittedInvoices[i].amount < submittedInvoices[i + 1].amount) {
          return { 
            success: false, 
            message: `Invoices not in descending order by value. ${submittedInvoices[i].invoiceNumber} ($${submittedInvoices[i].amount.toFixed(2)}) should be higher than ${submittedInvoices[i + 1].invoiceNumber} ($${submittedInvoices[i + 1].amount.toFixed(2)}).` 
          };
        }
      }
      
      return { 
        success: true, 
        message: `Successfully identified the top 3 overdue invoices by value: ${submittedNumbers.join(', ')} with amounts ${submittedInvoices.map((s: any) => `$${s.amount.toFixed(2)}`).join(', ')}.` 
      };
    },
  },
  {
    id: 'copy-paste-electronics-no-screen',
    instructions: 'Browse through the electronics catalog and identify all products that have no screen. Look through all the products and identify products without screens. Format JSON response as {"products": ["Product Name 1", "Product Name 2", ...]}, and use the Submit Results button to send it.',
    ux: 'Browse electronics products, identify those with no screen, submit JSON list of product names via Submit Results button',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { submission, expectedProductNames, productsWithoutScreens } = appState;
      
      if (!expectedProductNames || !productsWithoutScreens) {
        return { success: false, message: 'Expected product names or products without screens not found in app state.' };
      }
      
      if (!submission) {
        return { success: false, message: 'No submission found. Please submit your answer as JSON via the Submit Results button.' };
      }
      
      // Validate submission structure
      if (typeof submission !== 'object' || submission === null || Array.isArray(submission)) {
        return { success: false, message: 'Invalid submission format. Expected JSON object like {"products": ["Name 1", "Name 2", ...]}.' };
      }
      
      if (!('products' in submission)) {
        return { success: false, message: 'Missing "products" field in submission. Expected format: {"products": ["Name 1", "Name 2", ...]}.' };
      }
      
      if (!Array.isArray(submission.products)) {
        return { success: false, message: 'The "products" field must be an array of product names. Expected format: {"products": ["Name 1", "Name 2", ...]}.' };
      }
      
      // Check if we have the expected number of products without screens
      if (expectedProductNames.length !== 15) {
        return { 
          success: false, 
          message: `Expected exactly 15 products without screens, found ${expectedProductNames.length}. Data generation may have failed.` 
        };
      }
      
      const submittedNames = submission.products;
      
      // Check if all names are strings
      if (!submittedNames.every((name: any) => typeof name === 'string')) {
        return { success: false, message: 'All product names must be strings. Expected format: {"products": ["Name 1", "Name 2", ...]}.' };
      }
      
      // Check if we have the right number of products
      if (submittedNames.length !== expectedProductNames.length) {
        return { 
          success: false, 
          message: `Expected exactly ${expectedProductNames.length} product names, received ${submittedNames.length}. Find all electronics products with no screen.` 
        };
      }
      
      // Check for duplicates in submission
      const uniqueSubmitted = new Set(submittedNames.map((name: string) => name.trim()));
      if (uniqueSubmitted.size !== submittedNames.length) {
        return { success: false, message: 'Found duplicate names in submission. Each product should only be listed once.' };
      }
      
      // Check if all expected names are present (case sensitive, exact match)
      const expectedNamesSet = new Set(expectedProductNames);
      const submittedNamesSet = new Set(submittedNames.map((name: string) => name.trim()));
      
      const missingNames = expectedProductNames.filter((name: string) => !submittedNamesSet.has(name));
      const extraNames = submittedNames.filter((name: string) => !expectedNamesSet.has(name.trim()));
      
      if (missingNames.length > 0) {
        return { 
          success: false, 
          message: `Missing ${missingNames.length} product name(s): ${missingNames.slice(0, 3).join(', ')}${missingNames.length > 3 ? ` and ${missingNames.length - 3} more` : ''}. Check the catalog for products without screens.` 
        };
      }
      
      if (extraNames.length > 0) {
        return { 
          success: false, 
          message: `Found ${extraNames.length} invalid product name(s): ${extraNames.slice(0, 3).join(', ')}${extraNames.length > 3 ? ` and ${extraNames.length - 3} more` : ''}. Only include products without screens.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully identified all ${submittedNames.length} electronics products without screens. Products include headphones, gaming consoles, cables, and accessories.` 
      };
    },
  },
  {
    id: 'copy-paste-calendar-meetings',
    instructions: 'Navigate through 3 months of calendar data, find all "Meeting" events with 5 or more attendees, and copy their details to the planning form. Use month navigation arrows to browse through current month and next 2 months. Click on meeting events (blue colored blocks) in calendar cells to view details, then add meetings with minimum 5 participants to the Event Planning Form. Include Date, Meeting Title, Attendees, and Duration for all qualifying meetings found.',
    ux: 'Navigate through 3 months using arrows, click on blue meeting events to view details, add meetings with 5+ attendees to planning form',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { planningEntries, meetingEvents, eligibleMeetings } = appState;
      
      if (!planningEntries || !meetingEvents || !eligibleMeetings) {
        return { success: false, message: 'Planning entries, meeting events, or eligible meetings not found in app state.' };
      }
      
      // Check if we have the expected number of meetings in the system
      if (meetingEvents.length !== 15) {
        return { 
          success: false, 
          message: `Expected exactly 15 meeting events in calendar, found ${meetingEvents.length}. Data generation may have failed.` 
        };
      }
      
      // Check if planning form has entries
      if (planningEntries.length === 0) {
        return { 
          success: false, 
          message: 'No meetings added to planning form yet. Navigate through calendar months, click on meeting events (blue blocks) with 5+ attendees, and add them to the form.' 
        };
      }
      
      // Check if all eligible meetings are collected
      if (planningEntries.length !== eligibleMeetings.length) {
        return { 
          success: false, 
          message: `Planning form contains only ${planningEntries.length} of ${eligibleMeetings.length} eligible meetings (5+ attendees). Find all qualifying meeting events across the 3 months and add them to the planning form.` 
        };
      }
      
      // Verify all planning entries match eligible meeting events
      const eligibleMeetingsByKey = new Map();
      eligibleMeetings.forEach((meeting: any) => {
        const key = `${meeting.date}_${meeting.title}`;
        eligibleMeetingsByKey.set(key, meeting);
      });
      
      const errors = [];
      for (let i = 0; i < planningEntries.length; i++) {
        const entry = planningEntries[i];
        const key = `${entry.date}_${entry.title}`;
        const matchingMeeting = eligibleMeetingsByKey.get(key);
        
        if (!matchingMeeting) {
          errors.push(`Entry ${i + 1}: "${entry.title}" on ${entry.date} does not match any eligible meeting event (5+ attendees)`);
          continue;
        }
        
        // Verify attendees match
        const expectedAttendees = matchingMeeting.attendees.join(', ');
        if (entry.attendees.trim() !== expectedAttendees) {
          errors.push(`Entry ${i + 1}: Attendees mismatch for "${entry.title}" - expected "${expectedAttendees}", got "${entry.attendees.trim()}"`);
        }
        
        // Verify duration format
        const expectedDuration = `${matchingMeeting.duration} minutes`;
        if (entry.duration.trim() !== expectedDuration) {
          errors.push(`Entry ${i + 1}: Duration mismatch for "${entry.title}" - expected "${expectedDuration}", got "${entry.duration.trim()}"`);
        }
        
        // Verify meeting has 5+ attendees
        if (matchingMeeting.attendees.length < 5) {
          errors.push(`Entry ${i + 1}: "${entry.title}" has only ${matchingMeeting.attendees.length} attendees, needs minimum 5`);
        }
      }
      
      if (errors.length > 0) {
        return { 
          success: false, 
          message: `Data accuracy errors found: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` and ${errors.length - 3} more` : ''}. Verify meeting details match calendar events.` 
        };
      }
      
      // Check for duplicates
      const uniqueEntries = new Set();
      const duplicates = [];
      for (const entry of planningEntries) {
        const key = `${entry.date}_${entry.title}`;
        if (uniqueEntries.has(key)) {
          duplicates.push(`${entry.title} on ${entry.date}`);
        } else {
          uniqueEntries.add(key);
        }
      }
      
      if (duplicates.length > 0) {
        return { 
          success: false, 
          message: `Found duplicate meetings in planning form: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? ` and ${duplicates.length - 3} more` : ''}. Each meeting should only be added once.` 
        };
      }
      
      // Verify meetings are from across 3 months (should have variety in dates)
      const uniqueMonths = new Set();
      planningEntries.forEach((entry: any) => {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        uniqueMonths.add(monthKey);
      });
      
      if (uniqueMonths.size < 2) {
        return { 
          success: false, 
          message: `Meetings found in only ${uniqueMonths.size} month(s). Navigate through all 3 months using the calendar navigation arrows to find eligible meetings (5+ attendees) across different months.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully collected all ${planningEntries.length} eligible meeting events (5+ attendees) from ${uniqueMonths.size} months with accurate details including dates, titles, attendees, and durations.` 
      };
    },
  },
  {
    id: 'copy-paste-comment-moderation',
    instructions: 'Expand comment threads to find replies containing spam keywords, then flag them for review. Navigate through the nested comment tree by clicking expand arrows to reveal reply threads. Look for comments containing spam keywords such as promotional language, urgent calls to action, or suspicious marketing phrases. Click the flag button next to comments that appear to be spam to add them to the moderation queue. You must achieve 90% spam detection accuracy with no false positives (flagging non-spam comments).',
    ux: 'Expand comment threads, identify spam comments by keywords, click flag buttons to add to moderation queue',
    test: () => {
      const appState = (window as any).app_state;
      
      if (!appState || !appState.comments || !appState.moderationQueue) {
        return { 
          success: false, 
          message: 'App state not properly initialized. Expected comments and moderationQueue arrays.' 
        };
      }

      const { comments, moderationQueue, spamComments } = appState;

      // 1. Structure validation
      if (!Array.isArray(moderationQueue)) {
        return { 
          success: false, 
          message: 'Moderation queue must be an array' 
        };
      }

      // 2. Check if any spam comments are flagged
      if (moderationQueue.length === 0) {
        return { 
          success: false, 
          message: 'No comments have been flagged for review. Expand comment threads and flag comments that appear to contain spam or promotional content.' 
        };
      }

      // 3. Validate that flagged comments are actually spam
      const errors = [];
      for (const entry of moderationQueue) {
        // Find the corresponding comment
        const comment = comments.find((c: any) => c.id === entry.commentId);
        if (!comment) {
          errors.push(`Comment ${entry.commentId} not found in comments list`);
          continue;
        }

        // Check if it's actually spam
        if (!comment.isSpam) {
          errors.push(`Comment ${entry.commentId} is not spam but was flagged`);
          continue;
        }

        // Check if spam keywords are present
        if (!entry.spamKeywords || entry.spamKeywords.length === 0) {
          errors.push(`Comment ${entry.commentId} missing spam keywords in moderation entry`);
          continue;
        }

        // Validate thread context is present
        if (!entry.threadContext || entry.threadContext.trim() === '') {
          errors.push(`Comment ${entry.commentId} missing thread context`);
          continue;
        }

        // Validate other required fields
        if (!entry.author || !entry.contentPreview) {
          errors.push(`Comment ${entry.commentId} missing required fields (author, contentPreview)`);
          continue;
        }
      }

      if (errors.length > 0) {
        return { 
          success: false, 
          message: `Moderation queue validation errors: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` and ${errors.length - 3} more` : ''}` 
        };
      }

      // 4. Check completeness - ensure all flagged comments are actually spam
      const flaggedSpamComments = moderationQueue.length;
      const expectedSpamComments = spamComments ? spamComments.length : 0;
      
      // Require 90% spam detection (7 out of 8 spam comments)
      const requiredSpamDetection = Math.floor(expectedSpamComments * 0.9);
      if (flaggedSpamComments < requiredSpamDetection) {
        // Find which spam comments are missing from moderation queue
        const flaggedCommentIds = new Set(moderationQueue.map((entry: any) => entry.commentId));
        const missingSpamComments = spamComments ? spamComments.filter((spam: any) => !flaggedCommentIds.has(spam.id)) : [];
        
        // Console log missing comments for human developers (only once per unique set)
        if (missingSpamComments.length > 0) {
          const missingIds = missingSpamComments.map((c: any) => c.id).sort().join(',');
          const lastLoggedKey = 'task11_missing_' + missingIds;
          
          if (!(window as any)[lastLoggedKey]) {
            console.log(`[Cheat] Missing spam comments:`);
            missingSpamComments.slice(0, 5).forEach((comment: any, index: number) => {
              console.log(`[Cheat] ${index + 1}. "${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}"`);
            });
            if (missingSpamComments.length > 5) {
              console.log(`[Cheat] ... and ${missingSpamComments.length - 5} more`);
            }
            (window as any)[lastLoggedKey] = true;
          }
        }
        
        return { 
          success: false, 
          message: `Only ${flaggedSpamComments} spam comments flagged. Expected to flag at least ${requiredSpamDetection} out of ${expectedSpamComments} spam comments (90% detection rate). Look for promotional language, urgent calls to action, or suspicious marketing phrases.`
        };
      }

      // 5. Validate no false positives - check that only spam comments are flagged
      const nonSpamInQueue = moderationQueue.filter((entry: any) => {
        const comment = comments.find((c: any) => c.id === entry.commentId);
        return comment && !comment.isSpam;
      });

      if (nonSpamInQueue.length > 0) {
        // Console log incorrectly flagged comments for human developers (only once per unique set)
        const incorrectIds = nonSpamInQueue.map((entry: any) => entry.commentId).sort().join(',');
        const lastLoggedKey = 'task11_incorrect_' + incorrectIds;
        
        if (!(window as any)[lastLoggedKey]) {
          console.log(`[Cheat] Incorrectly flagged comments:`);
          nonSpamInQueue.slice(0, 5).forEach((entry: any, index: number) => {
            const comment = comments.find((c: any) => c.id === entry.commentId);
            if (comment) {
              console.log(`[Cheat] ${index + 1}. "${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}"`);
            }
          });
          if (nonSpamInQueue.length > 5) {
            console.log(`[Cheat] ... and ${nonSpamInQueue.length - 5} more`);
          }
          (window as any)[lastLoggedKey] = true;
        }
        
        return { 
          success: false, 
          message: `TASK FAILED: ${nonSpamInQueue.length} false positive(s) detected. You flagged non-spam comments. Remove flags from legitimate comments to achieve zero false positives.`
        };
      }

      return { 
        success: true, 
        message: `SUCCESS: Achieved ${((flaggedSpamComments / expectedSpamComments) * 100).toFixed(0)}% spam detection rate (${flaggedSpamComments}/${expectedSpamComments}) with zero false positives.` 
      };
    },
  },
  {
    id: 'copy-paste-inventory-supplier-analysis',
    instructions: 'Analyze the inventory data to extract the count of Electronics items that need reordering by supplier. Filter the inventory to review items, identify Electronics products with current stock below their reorder point, and count how many low-stock Electronics items each supplier has. Include ALL suppliers in your submission, even those with 0 Electronics items needing reorder. Format JSON response as {"supplier_name": count, "supplier_name": count, ...}, and use the Submit Results button to send it.',
    ux: 'Filter and analyze inventory to count Electronics items needing reorder by supplier, submit JSON via Submit Results button',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { inventoryItems, submission, supplierCounts, electronicsLowStock, allSuppliers } = appState;
      
      if (!inventoryItems || !supplierCounts || !allSuppliers) {
        return { success: false, message: 'Inventory items, supplier counts, or all suppliers list not found in app state.' };
      }
      
      if (!submission) {
        return { success: false, message: 'No submission found. Please submit your answer as JSON via the Submit Results button.' };
      }
      
      // Check if we have the expected number of inventory items
      if (inventoryItems.length !== 200) {
        return { 
          success: false, 
          message: `Expected exactly 200 inventory items, found ${inventoryItems.length}. Data generation may have failed.` 
        };
      }
      
      // Validate submission structure
      if (typeof submission !== 'object' || submission === null || Array.isArray(submission)) {
        return { success: false, message: 'Invalid submission format. Expected JSON object like {"supplier_name": count, ...}.' };
      }
      
      // Check if all values are numbers
      const submissionEntries = Object.entries(submission);
      if (!submissionEntries.every(([key, value]) => typeof key === 'string' && typeof value === 'number')) {
        return { success: false, message: 'All submission values must be numbers. Expected format: {"supplier_name": count, ...}.' };
      }
      
      // Check if submission matches expected supplier counts
      const expectedEntries = Object.entries(supplierCounts);
      const submittedEntries = Object.entries(submission);
      
      // Check if all suppliers are included (including those with zero counts)
      if (submittedEntries.length !== allSuppliers.length) {
        return { 
          success: false, 
          message: `Expected all ${allSuppliers.length} suppliers, received ${submittedEntries.length}. Include ALL suppliers (even those with 0 Electronics items needing reorder).` 
        };
      }
      
      // Check for missing or extra suppliers
      const expectedSuppliers = new Set(allSuppliers as string[]);
      const submittedSuppliers = new Set(submittedEntries.map(([supplier]) => supplier));
      
      const missingSuppliers = (allSuppliers as string[]).filter((s: string) => !submittedSuppliers.has(s));
      const extraSuppliers = submittedEntries.map(([supplier]) => supplier).filter((s: string) => !expectedSuppliers.has(s));
      
      if (missingSuppliers.length > 0) {
        return { 
          success: false, 
          message: `Missing supplier(s) in submission: ${missingSuppliers.join(', ')}. Include ALL suppliers, even those with 0 Electronics items needing reorder.` 
        };
      }
      
      if (extraSuppliers.length > 0) {
        return { 
          success: false, 
          message: `Extra supplier(s) in submission: ${extraSuppliers.join(', ')}. Only include suppliers that exist in the inventory.` 
        };
      }
      
      // Check if counts match exactly
      const countErrors = [];
      for (const [supplier, expectedCount] of expectedEntries) {
        const submittedCount = submission[supplier];
        if (submittedCount !== expectedCount) {
          countErrors.push(`${supplier}: submitted ${submittedCount}, expected ${expectedCount}`);
        }
      }
      
      if (countErrors.length > 0) {
        return { 
          success: false, 
          message: `Count errors found: ${countErrors.slice(0, 3).join(', ')}${countErrors.length > 3 ? ` and ${countErrors.length - 3} more` : ''}. Verify counts for Electronics items with current stock below reorder point.` 
        };
      }
      
      // Verify we have Electronics low stock items (data consistency check)
      if (!electronicsLowStock || electronicsLowStock.length === 0) {
        return { 
          success: false, 
          message: 'No Electronics items found needing reorder. Data generation may have failed.' 
        };
      }
      
      const totalExpectedCount = Object.values(supplierCounts as Record<string, number>).reduce((sum: number, count: number) => sum + count, 0);
      const totalSubmittedCount = Object.values(submission as Record<string, number>).reduce((sum: number, count: number) => sum + count, 0);
      
      if (totalSubmittedCount !== totalExpectedCount) {
        return { 
          success: false, 
          message: `Total count mismatch: submitted ${totalSubmittedCount}, expected ${totalExpectedCount}. Count all Electronics items needing reorder.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully identified ${totalSubmittedCount} Electronics items needing reorder across ${Object.keys(submission).length} suppliers with correct counts per supplier.` 
      };
    },
  },
  {
    id: 'survey-results-analytics',
    instructions: 'Navigate through 3 pages of survey responses and count the "Yes" answers for Question 3: "Are you satisfied with our service?". Use the pagination to browse all pages sequentially and manually count responses using the dashboard counter. Update the dashboard with the correct total count of "Yes" responses across all 30 survey responses.',
    ux: 'Navigate through paginated survey results, manually count Q3 "Yes" responses, update analytics dashboard counter',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { dashboardCounts, correctCounts } = appState;
      
      if (!dashboardCounts || !correctCounts) {
        return { success: false, message: 'Dashboard counts or correct counts not found in app state.' };
      }
      
      // Check if the correct count of "Yes" responses is recorded
      if (dashboardCounts.q3Yes !== correctCounts.q3Yes) {
        return { 
          success: false, 
          message: `Incorrect count of "Yes" responses for Question 3. Expected ${correctCounts.q3Yes}, found ${dashboardCounts.q3Yes}. Navigate through all pages and count all "Yes" answers.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully counted ${dashboardCounts.q3Yes} "Yes" responses for Question 3 across all 3 pages of survey results.` 
      };
    },
  },
  {
    id: 'kanban-ticket-management',
    instructions: 'Find tickets older than 30 days in the "Open" column and move only the high priority ones to the "Review" column. Drag tickets between columns to change their status. Look for tickets with creation dates more than 30 days ago and "High" priority badge (red). Only high priority tickets that are older than 30 days should be moved to Review - leave medium and low priority old tickets in Open.',
    ux: 'Drag high priority tickets older than 30 days from Open column to Review column using drag and drop',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { tickets, ticketsOlderThan30Days, highPriorityOldTickets, reviewColumnTickets, expectedReviewTickets } = appState;
      
      if (!tickets || !ticketsOlderThan30Days || !highPriorityOldTickets || !reviewColumnTickets) {
        return { success: false, message: 'Ticket data not found in app state.' };
      }
      
      // Check if we have the expected data structure
      if (tickets.length !== 45) {
        return { 
          success: false, 
          message: `Expected 45 tickets, found ${tickets.length}. Data generation may have failed.` 
        };
      }
      
      if (ticketsOlderThan30Days.length !== 12) {
        return { 
          success: false, 
          message: `Expected 12 tickets older than 30 days, found ${ticketsOlderThan30Days.length}. Data generation may have failed.` 
        };
      }
      
      if (highPriorityOldTickets.length !== 5) {
        return { 
          success: false, 
          message: `Expected 5 high priority old tickets, found ${highPriorityOldTickets.length}. Data generation may have failed.` 
        };
      }
      
      // Check if any tickets have been moved to Review
      if (reviewColumnTickets.length === 0) {
        return { 
          success: false, 
          message: 'No tickets have been moved to Review column yet. Find tickets older than 30 days with High priority in the Open column and drag them to Review.' 
        };
      }
      
      // Check if only high priority old tickets are in Review
      const nonHighPriorityInReview = reviewColumnTickets.filter((ticket: any) => 
        ticket.priority !== 'High' || ticket.daysSinceCreation <= 30
      );
      
      if (nonHighPriorityInReview.length > 0) {
        return { 
          success: false, 
          message: `Found ${nonHighPriorityInReview.length} incorrect ticket(s) in Review column. Only move High priority tickets that are older than 30 days to Review. Incorrect tickets: ${nonHighPriorityInReview.map((t: any) => `${t.id} (${t.priority}, ${t.daysSinceCreation} days)`).join(', ')}` 
        };
      }
      
      // Check if all high priority old tickets are in Review
      const reviewTicketIds = new Set(reviewColumnTickets.map((ticket: any) => ticket.id));
      const missingHighPriorityOldTickets = highPriorityOldTickets.filter((ticket: any) => 
        !reviewTicketIds.has(ticket.id)
      );
      
      if (missingHighPriorityOldTickets.length > 0) {
        return { 
          success: false, 
          message: `Missing ${missingHighPriorityOldTickets.length} high priority old ticket(s) in Review column: ${missingHighPriorityOldTickets.map((t: any) => `${t.id} (${t.daysSinceCreation} days old)`).join(', ')}. Move all High priority tickets older than 30 days to Review column.` 
        };
      }
      
      // Verify exact match of expected review tickets
      if (reviewColumnTickets.length !== expectedReviewTickets.length) {
        return { 
          success: false, 
          message: `Review column contains ${reviewColumnTickets.length} tickets, expected exactly ${expectedReviewTickets.length}. Only move High priority tickets older than 30 days.` 
        };
      }
      
      // Check that review tickets match expected exactly
      const reviewIds = reviewColumnTickets.map((t: any) => t.id).sort();
      const expectedIds = expectedReviewTickets.sort();
      
      if (JSON.stringify(reviewIds) !== JSON.stringify(expectedIds)) {
        return { 
          success: false, 
          message: `Review column tickets don't match expected. Found: ${reviewIds.join(', ')}, Expected: ${expectedIds.join(', ')}` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully moved all ${reviewColumnTickets.length} high priority tickets older than 30 days to Review column. No incorrect tickets were moved.` 
      };
    },
  },
  {
    id: 'project-timeline-resource-conflicts',
    instructions: 'Analyze project timeline to identify resource conflicts by manually comparing task dates and resource assignments. Expand project phases to view all tasks with their start/end dates and assigned resources. Find pairs of tasks where the same resource is assigned to overlapping time periods. Select these conflicting task pairs and add them to the Resource Allocation Table. There are exactly 4 scheduling conflicts to find across the 6 project phases.',
    ux: 'Expand phases, analyze task dates and resources manually, select overlapping task pairs, add conflicts to allocation table',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { phases, resourceConflicts, addedConflicts, allTasks } = appState;
      
      if (!phases || !resourceConflicts || !addedConflicts || !allTasks) {
        return { success: false, message: 'Project data not found in app state.' };
      }
      
      // Check if we have the expected data structure
      if (phases.length !== 6) {
        return { 
          success: false, 
          message: `Expected 6 project phases, found ${phases.length}. Data generation may have failed.` 
        };
      }
      
      if (allTasks.length !== 35) {
        return { 
          success: false, 
          message: `Expected 35 total tasks, found ${allTasks.length}. Data generation may have failed.` 
        };
      }
      
      if (resourceConflicts.length !== 4) {
        return { 
          success: false, 
          message: `Expected exactly 4 resource conflicts, found ${resourceConflicts.length}. Data generation may have failed.` 
        };
      }
      
      // Check if any conflicts have been added to the table
      if (addedConflicts.length === 0) {
        // Console log all expected conflicts for human developers (only once)
        const lastLoggedKey = 'task15_no_conflicts';
        
        if (!(window as any)[lastLoggedKey]) {
          console.log(`[Cheat] Expected resource conflicts to find:`);
          resourceConflicts.forEach((conflict: any, index: number) => {
            console.log(`[Cheat] ${index + 1}. ${conflict.resource}: "${conflict.task1}" overlaps "${conflict.task2}" (${conflict.overlapDays} days, ${conflict.overlapPeriod})`);
          });
          (window as any)[lastLoggedKey] = true;
        }
        
        return { 
          success: false, 
          message: 'No conflicts have been added to the allocation table yet. Expand project phases, analyze task dates and resources, and select overlapping task pairs to identify conflicts.' 
        };
      }
      
      // Check if all unique resource conflicts are added (should be exactly 4)
      const expectedUniqueConflicts = expectedConflictKeys.size;
      const actualUniqueConflicts = addedConflictKeys.size;
      
      if (actualUniqueConflicts !== expectedUniqueConflicts) {
        return { 
          success: false, 
          message: `Only ${actualUniqueConflicts} of ${expectedUniqueConflicts} resource conflicts have been added to the table. Continue analyzing task dates and resources to find all overlapping assignments.` 
        };
      }
      
      // Verify that added conflicts match the actual conflicts
      // Create normalized keys that handle bidirectional conflicts (A↔B same as B↔A)
      const normalizeConflictKey = (resource: string, task1: string, task2: string) => {
        const tasks = [task1, task2].sort(); // Sort tasks alphabetically for consistent keys
        return `${resource}_${tasks[0]}_${tasks[1]}`;
      };
      
      const addedConflictKeys = new Set(
        addedConflicts.map((c: any) => normalizeConflictKey(c.resource, c.task1, c.task2))
      );
      
      const expectedConflictKeys = new Set(
        resourceConflicts.map((c: any) => normalizeConflictKey(c.resource, c.task1, c.task2))
      );
      
      const missingConflicts = resourceConflicts.filter((conflict: any) => {
        const key = normalizeConflictKey(conflict.resource, conflict.task1, conflict.task2);
        return !addedConflictKeys.has(key);
      });
      
      if (missingConflicts.length > 0) {
        // Console log missing conflicts for human developers (only once per unique set)
        const missingIds = missingConflicts.map((c: any) => `${c.resource}_${c.task1}_${c.task2}`).sort().join(',');
        const lastLoggedKey = 'task15_missing_' + missingIds;
        
        if (!(window as any)[lastLoggedKey]) {
          console.log(`[Cheat] Missing resource conflicts:`);
          missingConflicts.slice(0, 5).forEach((conflict: any, index: number) => {
            console.log(`[Cheat] ${index + 1}. ${conflict.resource}: "${conflict.task1}" overlaps "${conflict.task2}" (${conflict.overlapDays} days)`);
          });
          if (missingConflicts.length > 5) {
            console.log(`[Cheat] ... and ${missingConflicts.length - 5} more conflicts`);
          }
          (window as any)[lastLoggedKey] = true;
        }
        
        return { 
          success: false, 
          message: `Missing ${missingConflicts.length} resource conflict(s) in table. Missing conflicts involve: ${missingConflicts.map((c: any) => c.resource).slice(0, 3).join(', ')}${missingConflicts.length > 3 ? ` and ${missingConflicts.length - 3} more` : ''}. Continue analyzing task schedules to identify all overlapping assignments.` 
        };
      }
      
      // Verify that conflicts have proper overlap periods
      const invalidOverlaps = addedConflicts.filter((conflict: any) => 
        !conflict.overlapDays || conflict.overlapDays < 1 || conflict.overlapDays > 10
      );
      
      if (invalidOverlaps.length > 0) {
        return { 
          success: false, 
          message: `Found ${invalidOverlaps.length} conflict(s) with invalid overlap periods. Overlaps should be between 1-10 days.` 
        };
      }
      
      // Check if user has expanded phases (interaction requirement)
      const expandedPhases = phases.filter((phase: any) => phase.isExpanded).length;
      if (expandedPhases < 3) {
        return { 
          success: false, 
          message: `Only ${expandedPhases} phase(s) have been expanded. Expand more project phases to discover all resource conflicts. You need to explore multiple phases to find all 4 conflicts.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully identified and added all ${actualUniqueConflicts} unique resource conflicts to the allocation table. Conflicts range from ${Math.min(...addedConflicts.map((c: any) => c.overlapDays))}-${Math.max(...addedConflicts.map((c: any) => c.overlapDays))} day overlaps across ${expandedPhases} expanded phases.` 
      };
    },
  },
  {
    id: 'social-media-content-scheduling',
    instructions: 'Browse through the 25 social media posts and identify all high-performing content (posts with more than 100 likes). Each high-performing post has a designated target date shown as "Schedule: Xth". Drag these posts to schedule them on their correct target dates in the calendar grid. Look for posts with golden borders and blue schedule badges. Schedule all 5 high-performing posts by dragging them to their specific assigned dates to complete the content calendar.',
    ux: 'Scroll through social media feed, identify posts with >100 likes (golden border) and blue schedule badges, drag each to its designated target date on calendar',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { posts, scheduledPosts, highPerformingPosts, calendar } = appState;
      
      if (!posts || !scheduledPosts || !highPerformingPosts || !calendar) {
        return { success: false, message: 'Social media data not found in app state.' };
      }
      
      // Check if we have the expected number of posts
      if (posts.length !== 25) {
        return { 
          success: false, 
          message: `Expected 25 social media posts, found ${posts.length}. Data generation may have failed.` 
        };
      }
      
      // Check if we have the expected number of high-performing posts
      if (highPerformingPosts.length !== 5) {
        return { 
          success: false, 
          message: `Expected 5 high-performing posts (>100 likes), found ${highPerformingPosts.length}. Data generation may have failed.` 
        };
      }
      
      // Check if any posts have been scheduled
      if (scheduledPosts.length === 0) {
        return { 
          success: false, 
          message: 'No posts have been scheduled yet. Drag high-performing posts (with golden borders) from the feed to calendar dates to schedule them.' 
        };
      }
      
      // Check if scheduled posts are high-performing (>100 likes)
      const nonHighPerformingScheduled = scheduledPosts.filter((sp: any) => {
        const post = posts.find((p: any) => p.id === sp.postId);
        return post && post.likes <= 100;
      });
      
      if (nonHighPerformingScheduled.length > 0) {
        return { 
          success: false, 
          message: `Found ${nonHighPerformingScheduled.length} scheduled post(s) with ≤100 likes. Only schedule high-performing posts (>100 likes, shown with golden borders).` 
        };
      }
      
      // Check for proper calendar scheduling on correct target dates
      const schedulingErrors = [];
      for (const scheduledPost of scheduledPosts) {
        const originalPost = posts.find((p: any) => p.id === scheduledPost.postId);
        if (!originalPost) {
          schedulingErrors.push(`Post ${scheduledPost.postId} not found in original posts`);
          continue;
        }
        
        if (!originalPost.targetDate) {
          schedulingErrors.push(`Post ${scheduledPost.postId} has no target date assigned`);
          continue;
        }
        
        // Extract day from scheduled date (handle DD/MM/YYYY format)
        const dateParts = scheduledPost.date.split('/');
        const scheduledDay = dateParts.length >= 3 ? parseInt(dateParts[0], 10) : NaN;
        
        if (isNaN(scheduledDay)) {
          schedulingErrors.push(`Post ${originalPost.id} has invalid scheduled date format: ${scheduledPost.date}`);
        } else if (scheduledDay !== originalPost.targetDate) {
          schedulingErrors.push(`Post ${originalPost.id} scheduled on ${scheduledDay}th, should be on ${originalPost.targetDate}th`);
        }
      }
      
      if (schedulingErrors.length > 0) {
        return { 
          success: false, 
          message: `Incorrect scheduling found: ${schedulingErrors.slice(0, 3).join(', ')}${schedulingErrors.length > 3 ? ` and ${schedulingErrors.length - 3} more` : ''}. Schedule each post on its designated target date.` 
        };
      }
      
      // Verify exactly 5 scheduled posts (all high-performing posts)
      if (scheduledPosts.length !== 5) {
        return { 
          success: false, 
          message: `Expected exactly 5 scheduled posts, found ${scheduledPosts.length}. Schedule all 5 high-performing posts with golden borders.` 
        };
      }
      
      // Verify all scheduled posts are high-performing
      const scheduledLikes = scheduledPosts.map((sp: any) => {
        const post = posts.find((p: any) => p.id === sp.postId);
        return post ? post.likes : 0;
      });
      
      const avgLikes = scheduledLikes.reduce((sum: number, likes: number) => sum + likes, 0) / scheduledLikes.length;
      
      // Allow users to schedule posts on any dates they choose
      
      // Verify data integrity
      const validScheduledPosts = scheduledPosts.filter((sp: any) => {
        const post = posts.find((p: any) => p.id === sp.postId);
        return post && sp.content && sp.likes && sp.username;
      });
      
      if (validScheduledPosts.length !== scheduledPosts.length) {
        return { 
          success: false, 
          message: 'Some scheduled posts have missing or invalid data. Ensure all posts are properly scheduled with complete information.' 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully scheduled all ${scheduledPosts.length} high-performing posts (avg ${avgLikes.toFixed(0)} likes) for next month's content calendar.` 
      };
    },
  },
  {
    id: 'library-catalog-science-fiction',
    instructions: 'Search for "science fiction" books in the library catalog, navigate through the paginated results, and add books published after 2020 (excluding 2020) to your reading list. Use the search interface to find science fiction books, then browse through the results across multiple pages using pagination controls. Select and add books with publication years 2021 or later to build your reading list table.',
    ux: 'Search for "science fiction", navigate through paginated results, identify books published 2021 or later, add them to reading list table',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { 
        allBooks, searchResults, readingList, searchTerm, hasSearched, 
        scienceFictionBooks, scienceFictionBooksAfter2020, scienceBooks, scienceBooksAfter2020,
        readingListAfter2020, readingListScienceFiction 
      } = appState;
      
      if (!allBooks || !readingList) {
        return { success: false, message: 'Books data or reading list not found in app state.' };
      }
      
      // Check if we have the expected number of total books
      if (allBooks.length !== 240) {
        return { 
          success: false, 
          message: `Expected exactly 240 books in catalog, found ${allBooks.length}. Data generation may have failed.` 
        };
      }
      
      // Check if we have the expected number of science fiction books
      if (!scienceFictionBooks || scienceFictionBooks.length !== 190) {
        return { 
          success: false, 
          message: `Expected exactly 190 science fiction books, found ${scienceFictionBooks ? scienceFictionBooks.length : 0}. Data generation may have failed.` 
        };
      }
      
      // Check if we have the expected number of science books  
      if (!scienceBooks || scienceBooks.length !== 50) {
        return { 
          success: false, 
          message: `Expected exactly 50 science books, found ${scienceBooks ? scienceBooks.length : 0}. Data generation may have failed.` 
        };
      }
      
      // Check if we have the expected number of science fiction books after 2020
      if (!scienceFictionBooksAfter2020 || scienceFictionBooksAfter2020.length !== 45) {
        return { 
          success: false, 
          message: `Expected exactly 45 science fiction books published after 2020, found ${scienceFictionBooksAfter2020 ? scienceFictionBooksAfter2020.length : 0}. Data generation may have failed.` 
        };
      }
      
      // Check if we have some science books after 2020 (should be 10)
      if (!scienceBooksAfter2020 || scienceBooksAfter2020.length !== 10) {
        return { 
          success: false, 
          message: `Expected exactly 10 science books published after 2020, found ${scienceBooksAfter2020 ? scienceBooksAfter2020.length : 0}. Data generation may have failed.` 
        };
      }
      
      // Check if user has searched for science fiction
      if (!hasSearched || !searchTerm.toLowerCase().includes('science fiction')) {
        return { 
          success: false, 
          message: 'Search for "science fiction" books using the search interface to find relevant books in the catalog.' 
        };
      }
      
      // Check if search results contain science fiction books
      if (!searchResults || searchResults.length === 0) {
        return { 
          success: false, 
          message: 'No search results found. Make sure to search for "science fiction" to find books in the catalog.' 
        };
      }
      
      // Check if reading list has any books
      if (readingList.length === 0) {
        return { 
          success: false, 
          message: 'Reading list is empty. Add books published after 2020 from the search results to your reading list.' 
        };
      }
      
      // Check if all books in reading list are science fiction books (not science books)
      if (!readingListScienceFiction || readingListScienceFiction.length !== readingList.length) {
        const nonSciFiBooksInList = readingList.filter((book: any) => 
          book.genre !== 'Hard Science Fiction' && 
          book.genre !== 'Space Opera' && 
          book.genre !== 'Cyberpunk' && 
          book.genre !== 'Dystopian Fiction'
        );
        
        return { 
          success: false, 
          message: `Found ${nonSciFiBooksInList.length} non-science fiction book(s) in reading list. Only add science fiction books (Hard Science Fiction, Space Opera, Cyberpunk, Dystopian Fiction), not science textbooks. Books with incorrect genres: ${nonSciFiBooksInList.map((b: any) => `"${b.title}" (${b.genre})`).slice(0, 3).join(', ')}${nonSciFiBooksInList.length > 3 ? ` and ${nonSciFiBooksInList.length - 3} more` : ''}` 
        };
      }
      
      // Check if all books in reading list are from search results (science fiction)
      const searchResultIds = new Set(searchResults.map((book: any) => book.id));
      const booksNotFromSearch = readingList.filter((book: any) => !searchResultIds.has(book.id));
      
      if (booksNotFromSearch.length > 0) {
        return { 
          success: false, 
          message: `Found ${booksNotFromSearch.length} book(s) in reading list that are not from search results. Only add books from your "science fiction" search results.` 
        };
      }
      
      // Check if all books in reading list are published after 2020 (excluding 2020)
      const booksNotAfter2020 = readingList.filter((book: any) => book.year <= 2020);
      if (booksNotAfter2020.length > 0) {
        return { 
          success: false, 
          message: `Found ${booksNotAfter2020.length} book(s) in reading list published in 2020 or earlier. Only add books published after 2020 (2021 or later). Books with incorrect years: ${booksNotAfter2020.map((b: any) => `"${b.title}" (${b.year})`).slice(0, 3).join(', ')}${booksNotAfter2020.length > 3 ? ` and ${booksNotAfter2020.length - 3} more` : ''}` 
        };
      }
      
      // Check if reading list contains a reasonable number of books (at least 5)
      if (readingList.length < 5) {
        return { 
          success: false, 
          message: `Only ${readingList.length} book(s) in reading list. Add more science fiction books published after 2020 to demonstrate thorough catalog browsing across multiple pages.` 
        };
      }
      
      // Verify books in reading list have all required fields
      const incompleteBooks = readingList.filter((book: any) => 
        !book.title || !book.author || !book.year || !book.genre
      );
      
      if (incompleteBooks.length > 0) {
        return { 
          success: false, 
          message: `Found ${incompleteBooks.length} book(s) with missing data in reading list. All books should have title, author, year, and genre.` 
        };
      }
      
      // Check for duplicates in reading list
      const uniqueBookIds = new Set(readingList.map((book: any) => book.id));
      if (uniqueBookIds.size !== readingList.length) {
        return { 
          success: false, 
          message: 'Found duplicate books in reading list. Each book should only be added once.' 
        };
      }
      
      // Verify books span multiple pages (should have variety in original positions)
      // Since we shuffle books, check if reading list contains books from different parts of search results
      const searchResultPositions = readingList.map((book: any) => {
        return searchResults.findIndex((result: any) => result.id === book.id);
      });
      
      const maxPosition = Math.max(...searchResultPositions);
      const minPosition = Math.min(...searchResultPositions);
      
      // Should have books from at least 2 different pages (20 books per page)
      if (maxPosition - minPosition < 20) {
        return { 
          success: false, 
          message: `Books appear to be from a limited range of search results. Navigate through multiple pages using pagination to find books published after 2020 across different pages.` 
        };
      }
      
      // Validate reading list format and content
      const averageYear = readingList.reduce((sum: number, book: any) => sum + book.year, 0) / readingList.length;
      
      return { 
        success: true, 
        message: `Successfully added ${readingList.length} science fiction books published after 2020 (excluding 2020) to reading list (average year: ${averageYear.toFixed(1)}). All books are science fiction genre, not science textbooks, sourced from search results spanning multiple pages.` 
      };
    },
  },
  {
    id: 'crm-vip-phone-updates',
    instructions: 'Filter contacts by "VIP" status, scroll through results, and update phone numbers using the external phone list. Click the filter checkbox for VIP status, then edit phone fields by clicking on them and entering the new numbers from the external phone list popup. Only VIP contacts should have updated phone numbers that match the external list.',
    ux: 'Filter by VIP status using checkbox, click "Show External Phone List" button to view updates, click phone fields to edit and enter new numbers',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found. Data may still be loading.' };
      }
      
      const { contacts, externalPhoneList, updatedContacts, vipContacts, contactsWithUpdates } = appState;
      
      if (!contacts || !externalPhoneList) {
        return { success: false, message: 'Contacts or external phone list not found in app state. Data may still be loading.' };
      }
      
      // Check if data is fully loaded
      if (contacts.length === 0) {
        return { success: false, message: 'Contact data is still loading. Please wait for the component to initialize.' };
      }
      
      // Verify we have the expected number of contacts
      if (contacts.length !== 300) {
        return { success: false, message: `Expected 300 total contacts, found ${contacts.length}.` };
      }
      
      // Verify we have the expected number of VIP contacts
      if (vipContacts.length !== 5) {
        return { success: false, message: `Expected 5 VIP contacts, found ${vipContacts.length}.` };
      }
      
      // Verify we have the expected number of external phone updates
      if (externalPhoneList.length !== 5) {
        return { success: false, message: `Expected 5 external phone updates, found ${externalPhoneList.length}.` };
      }
      
      // Check if any contacts have been updated
      if (!updatedContacts || updatedContacts.length === 0) {
        return { success: false, message: 'No contacts have been updated. Click on phone fields to edit them with new numbers from the external list.' };
      }
      
      // Verify only VIP contacts have been updated
      const nonVipUpdates = updatedContacts.filter((contact: any) => contact.status !== 'VIP');
      if (nonVipUpdates.length > 0) {
        return { 
          success: false, 
          message: `Found ${nonVipUpdates.length} non-VIP contact(s) with updates. Only VIP contacts should have updated phone numbers.` 
        };
      }
      
      // Verify all updated contacts are VIP and have matching phone numbers from external list
      const externalPhoneMap = new Map(externalPhoneList.map((update: any) => [update.name, update.phone]));
      
      // Use contactsWithUpdates if available, otherwise fall back to updatedContacts
      const contactsToCheck = contactsWithUpdates || updatedContacts || [];
      
      // Check if all available updates have been completed (require all 5 VIP contacts)
      if (contactsToCheck.length < externalPhoneList.length) {
        return { 
          success: false, 
          message: `Only ${contactsToCheck.length} out of ${externalPhoneList.length} VIP contacts updated. All VIP contacts must be updated with their new phone numbers from the external list.` 
        };
      }
      
      for (const contact of contactsToCheck) {
        const expectedPhone = externalPhoneMap.get(contact.name);
        
        if (!expectedPhone) {
          return { 
            success: false, 
            message: `Contact "${contact.name}" has been updated but is not in the external phone list.` 
          };
        }
        
        if (contact.phone && typeof contact.phone === 'string' && contact.phone.trim() !== expectedPhone.trim()) {
          return { 
            success: false, 
            message: `Contact "${contact.name}" phone number "${contact.phone}" does not match external list value "${expectedPhone}".` 
          };
        }
      }
      
      return { 
        success: true, 
        message: `Successfully updated ${contactsToCheck.length} VIP contacts with correct phone numbers from the external list. All updates match external data and only VIP contacts were modified.` 
      };
    },
  },
  {
    id: 'hierarchical-menu-navigation',
    instructions: 'Expand menu categories to find the single 4-level deep item in the hierarchical structure. Click expand arrows to reveal the full menu hierarchy and navigate through all levels to locate the one item at depth 4. Format JSON response as {"path": "Category/Subcategory/Page/Subpage"}, and use the Submit Results button to send it.',
    ux: 'Expand menu tree by clicking arrows to find 4-level deep item, then submit path as JSON via Submit Results button',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { menuStructure, categories, subcategories, pages, subpages, level4Path, submission } = appState;
      
      if (!menuStructure || !categories || !subcategories || !pages) {
        return { success: false, message: 'Menu structure not found in app state.' };
      }
      
      // Check if we have the expected structure counts
      if (categories.length !== 8) {
        return { 
          success: false, 
          message: `Expected exactly 8 main categories, found ${categories.length}. Data generation may have failed.` 
        };
      }
      
      if (!subpages || subpages.length !== 1) {
        return { 
          success: false, 
          message: `Expected exactly 1 subpage (4th level item), found ${subpages ? subpages.length : 0}. Data generation may have failed.` 
        };
      }
      
      if (!level4Path) {
        return { 
          success: false, 
          message: 'No 4th level path found in menu structure. Data generation may have failed.' 
        };
      }
      
      if (!submission) {
        return { success: false, message: 'No submission found. Please submit your answer as JSON via the Submit Results button.' };
      }
      
      // Validate submission structure
      if (typeof submission !== 'object' || submission === null || Array.isArray(submission)) {
        return { success: false, message: 'Invalid submission format. Expected JSON object like {"path": "Category/Subcategory/Page/Subpage"}.' };
      }
      
      if (!('path' in submission)) {
        return { success: false, message: 'Missing "path" field in submission. Expected format: {"path": "Category/Subcategory/Page/Subpage"}.' };
      }
      
      if (typeof submission.path !== 'string') {
        return { success: false, message: 'The "path" field must be a string. Expected format: {"path": "Category/Subcategory/Page/Subpage"}.' };
      }
      
      // Check if submitted path matches the expected path
      if (submission.path.trim() !== level4Path.trim()) {
        return { 
          success: false, 
          message: `Incorrect path submitted. Expected: "${level4Path}", received: "${submission.path}". Navigate through the menu hierarchy to find the single 4th level item.` 
        };
      }
      
      // Verify the path contains all 4 levels (should have 3 slashes: /)
      const pathParts = submission.path.split('/');
      if (pathParts.length !== 4) {
        return { 
          success: false, 
          message: `Path should contain exactly 4 levels (Category/Subcategory/Page/Subpage), found ${pathParts.length} levels in "${submission.path}".` 
        };
      }
      
      // Verify path format and slash usage
      if (!submission.path.includes('/')) {
        return { 
          success: false, 
          message: 'Path must use "/" slashes to separate levels. Expected format: "Category/Subcategory/Page/Subpage".' 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully found and submitted the 4th level path: "${submission.path}". The path correctly traces through all hierarchical levels to the single depth-4 item.` 
      };
    },
  },
  {
    id: 'document-diff-review',
    instructions: 'Review document changes using the diff viewer to ensure compliance with style guide rules. Compare Draft 1 (original) with Draft 2 (revised) by examining the highlighted differences. Accept changes that follow the rules: acronyms must be explained on first use, dates must be in yyyy-mm-dd format, and no PII (personal names/information). Reject changes that violate these rules. Click on each diff to review and use Accept/Reject buttons to make decisions.',
    ux: 'Compare document drafts side-by-side, click on highlighted diffs to review, accept good changes and reject bad changes based on style guide rules (acronyms, dates, no PII)',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { diffs, goodDiffs, badDiffs, acceptedDiffs, rejectedDiffs, completedReview } = appState;
      
      if (!diffs) {
        return { success: false, message: 'Diffs not found in app state.' };
      }
      
      // Check if we have the expected number of diffs
      if (diffs.length !== 6) {
        return { 
          success: false, 
          message: `Expected exactly 6 diffs, found ${diffs.length}. Data generation may have failed.` 
        };
      }
      
      // Check if we have expected good/bad diff counts
      if (goodDiffs.length !== 3 || badDiffs.length !== 3) {
        return { 
          success: false, 
          message: `Expected 3 good diffs and 3 bad diffs, found ${goodDiffs.length} good and ${badDiffs.length} bad. Data generation may have failed.` 
        };
      }
      
      // Check if review is completed
      if (!completedReview) {
        return { 
          success: false, 
          message: 'Document review not completed. Review all 6 diffs and accept/reject each one based on style guide rules.' 
        };
      }
      
      // Check if all good diffs were accepted and bad diffs were rejected
      const correctlyAcceptedGood = goodDiffs.filter((diff: any) => diff.status === 'accepted');
      const correctlyRejectedBad = badDiffs.filter((diff: any) => diff.status === 'rejected');
      const incorrectlyRejectedGood = goodDiffs.filter((diff: any) => diff.status === 'rejected');
      const incorrectlyAcceptedBad = badDiffs.filter((diff: any) => diff.status === 'accepted');
      
      const errors = [];
      
      if (incorrectlyRejectedGood.length > 0) {
        errors.push(`${incorrectlyRejectedGood.length} good change(s) incorrectly rejected (should follow style guide rules)`);
      }
      
      if (incorrectlyAcceptedBad.length > 0) {
        errors.push(`${incorrectlyAcceptedBad.length} bad change(s) incorrectly accepted (violate style guide rules)`);
      }
      
      if (errors.length > 0) {
        return { 
          success: false, 
          message: `Review errors found: ${errors.join(', ')}. Accept changes that follow the rules (acronyms explained, dates in yyyy-mm-dd format, no PII) and reject those that don't.` 
        };
      }
      
      if (correctlyAcceptedGood.length !== 3 || correctlyRejectedBad.length !== 3) {
        return { 
          success: false, 
          message: `Incorrect review decisions. Expected 3 accepts and 3 rejects, got ${correctlyAcceptedGood.length} correct accepts and ${correctlyRejectedBad.length} correct rejects.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully reviewed all ${diffs.length} document changes with correct accept/reject decisions based on style guide rules (${correctlyAcceptedGood.length} accepted, ${correctlyRejectedBad.length} rejected).` 
      };
    },
  },
];

const tasks = (uiBenchTasks as UiBenchTask[]).map((t, index) => ({
  id: index + 1,
  name: t.id,
  component: createTaskComponentForIndex(index),
  task: t.instructions,
  ux: t.ux,
  test: t.test,
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
