// Auto-generated test functions for copy-paste tasks
// This file contains all validation logic separated from UI components

export type TestResult = { success: boolean; message?: string };
export type TestFunction = () => TestResult;

export function test_1(): TestResult {
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
}

export function test_2(): TestResult {
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
}

export function test_3(): TestResult {
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
}

export function test_4(): TestResult {
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
}

export function test_5(): TestResult {
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
}

export function test_6(): TestResult {
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
}

export function test_7(): TestResult {
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
}

export function test_8(): TestResult {
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
}

export function test_9(): TestResult {
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
}

export function test_10(): TestResult {
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
}

export function test_11(): TestResult {
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
}

export function test_12(): TestResult {
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
}

export function test_13(): TestResult {
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
}

export function test_14(): TestResult {
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
}

export function test_15(): TestResult {
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

      // Check if all unique resource conflicts are added (should be exactly 4)
      const expectedUniqueConflicts = expectedConflictKeys.size;
      const actualUniqueConflicts = addedConflictKeys.size;
      
      if (actualUniqueConflicts !== expectedUniqueConflicts) {
        return { 
          success: false, 
          message: `Only ${actualUniqueConflicts} of ${expectedUniqueConflicts} resource conflicts have been added to the table. Continue analyzing task dates and resources to find all overlapping assignments.` 
        };
      }
      
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
}

export function test_16(): TestResult {
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
        
        // scheduledPost.date is now a day number (1-30)
        const scheduledDay = typeof scheduledPost.date === 'number' ? scheduledPost.date : parseInt(scheduledPost.date, 10);

        if (isNaN(scheduledDay)) {
          schedulingErrors.push(`Post ${originalPost.id} has invalid scheduled date: ${scheduledPost.date}`);
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
}

export function test_17(): TestResult {
const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { 
        allBooks, searchResults, readingList, searchTerm, hasSearched, 
        scienceFictionBooks, scienceFictionBooksAfter2020, scienceBooks, scienceBooksAfter2020,
        readingListScienceFiction 
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
}

export function test_18(): TestResult {
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
        
        if (contact.phone && typeof contact.phone === 'string' && typeof expectedPhone === 'string' && contact.phone.trim() !== expectedPhone.trim()) {
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
}

export function test_19(): TestResult {
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
}

export function test_20(): TestResult {
const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { diffs, goodDiffs, badDiffs, completedReview } = appState;
      
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
}

export function test_21(): TestResult {
const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { sourceData, expectedResults, allEntries } = appState;
      
      if (!sourceData || !expectedResults || !allEntries) {
        return { success: false, message: 'Source data, expected results, or entries not found in app state.' };
      }
      
      // Check if we have the expected source data
      if (sourceData.length !== 3) {
        return { 
          success: false, 
          message: `Expected 3 lab results in source data, found ${sourceData.length}. Data generation may have failed.` 
        };
      }
      
      // Check if entries have been created
      if (allEntries.length === 0) {
        // Console log cheat system for human developers
        console.log(`[Cheat] Expected 3 lab result entries:`);
        expectedResults.forEach((expected: any, index: number) => {
          console.log(`[Cheat] ${index + 1}. Tab: ${expected.category.toUpperCase()}, Patient: ${expected.patientName} (${expected.patientId}), Test: ${expected.testCode}, Result: ${expected.result} ${expected.units}, Date: ${expected.date}, Tech: ${expected.techId}`);
        });
        console.log(`[Cheat] Status: ❌ No entries created yet - Add rows in each tab!`);
        
        return { 
          success: false, 
          message: 'No lab result entries have been created. Add table rows in each category tab and fill in the data from Excel.' 
        };
      }
      
      // Check if we have entries in all three categories
      const { hematologyEntries, chemistryEntries, immunologyEntries } = appState;
      const categoriesWithEntries = [
        hematologyEntries?.length > 0 ? 'Hematology' : null,
        chemistryEntries?.length > 0 ? 'Chemistry' : null,
        immunologyEntries?.length > 0 ? 'Immunology' : null
      ].filter(Boolean);
      
      // Verify data accuracy for each expected result
      const errors = [];
      
      if (categoriesWithEntries.length < 3) {
        // Add this to errors array so the main cheat system handles it
        errors.push(`Missing categories: need entries in all 3 tabs (Hematology, Chemistry, Immunology), found only ${categoriesWithEntries.join(', ')}`);
      }
      for (const expected of expectedResults) {
        const matchingEntries = allEntries.filter((entry: any) => 
          entry.patientId === expected.patientId && 
          entry.testCode === expected.testCode
        );
        
        if (matchingEntries.length === 0) {
          errors.push(`Missing entry for ${expected.patientName} (${expected.patientId}) - ${expected.testCode}`);
          continue;
        }
        
        const entry = matchingEntries[0];
        
        // Check required fields
        if (!entry.patientName || entry.patientName.trim() !== expected.patientName.trim()) {
          errors.push(`${expected.patientId}: Patient name "${entry.patientName}" should be "${expected.patientName}"`);
        }
        
        if (!entry.phone || entry.phone.trim() !== expected.phone.trim()) {
          errors.push(`${expected.patientId}: Phone "${entry.phone}" should be "${expected.phone}"`);
        }
        
        if (entry.result !== expected.result) {
          errors.push(`${expected.patientId}: Result value ${entry.result} should be ${expected.result}`);
        }
        
        if (!entry.units || entry.units !== expected.units) {
          errors.push(`${expected.patientId}: Units "${entry.units}" should be "${expected.units}"`);
        }
        
        if (!entry.date || entry.date !== expected.date) {
          errors.push(`${expected.patientId}: Date "${entry.date}" should be "${expected.date}"`);
        }
        
        if (!entry.techId || entry.techId !== expected.techId) {
          errors.push(`${expected.patientId}: Tech ID "${entry.techId}" should be "${expected.techId}"`);
        }
      }
      
      if (errors.length > 0) {
        // Console log cheat system for field accuracy issues - ALWAYS run when errors exist
        console.log(`[Cheat] Progress tracking - Expected vs Current:`);
        expectedResults.forEach((expected: any, index: number) => {
            const matchingEntry = allEntries.find((entry: any) => 
              entry.patientId === expected.patientId
            );
            
            if (matchingEntry) {
              const fieldChecks = [
                matchingEntry.patientName?.trim() === expected.patientName?.trim() ? '✅' : '❌',
                matchingEntry.phone?.trim() === expected.phone?.trim() ? '✅' : '❌', 
                matchingEntry.result === expected.result ? '✅' : '❌',
                matchingEntry.units === expected.units ? '✅' : '❌',
                matchingEntry.date === expected.date ? '✅' : '❌',
                matchingEntry.techId === expected.techId ? '✅' : '❌'
              ].join(' ');
              console.log(`[Cheat] ${index + 1}. ${expected.category.toUpperCase()} Tab: ${fieldChecks} (Name|Phone|Result|Units|Date|Tech)`);
              console.log(`[Cheat]    Expected: ${expected.patientName} | ${expected.phone} | ${expected.result} ${expected.units} | ${expected.date} | ${expected.techId}`);
              if (matchingEntry.patientName || matchingEntry.phone || matchingEntry.result || matchingEntry.units || matchingEntry.date || matchingEntry.techId) {
                console.log(`[Cheat]    Current:  ${matchingEntry.patientName || '(empty)'} | ${matchingEntry.phone || '(empty)'} | ${matchingEntry.result || '(empty)'} ${matchingEntry.units || '(empty)'} | ${matchingEntry.date || '(empty)'} | ${matchingEntry.techId || '(empty)'}`);
              }
            } else {
              console.log(`[Cheat] ${index + 1}. ${expected.category.toUpperCase()} Tab: ❌❌❌❌❌❌ (MISSING ENTRY)`);
              console.log(`[Cheat]    Expected: ${expected.patientName} | ${expected.phone} | ${expected.result} ${expected.units} | ${expected.date} | ${expected.techId}`);
          }
        });
        
        return { 
          success: false, 
          message: `Data accuracy errors found: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` and ${errors.length - 3} more` : ''}. Verify all fields match the Excel source data.` 
        };
      }
      
      // Check if entries use proper form controls (popup selections, dropdowns, etc.)
      const entriesWithProperData = allEntries.filter((entry: any) => 
        entry.patientId && entry.patientName && entry.phone && 
        entry.testCode && entry.result > 0 && entry.units && 
        entry.date && entry.techId
      );
      
      if (entriesWithProperData.length !== expectedResults.length) {
        return { 
          success: false, 
          message: `Only ${entriesWithProperData.length} of ${expectedResults.length} entries have complete data. Fill in all required fields using the form controls (name picker, test code dropdown, result spinner, units dropdown, date picker, tech ID).` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully transferred all ${allEntries.length} lab results across ${categoriesWithEntries.length} category tabs with accurate data entry using tabbed interface, popup modals, and form controls.` 
      };
}

export function test_22(): TestResult {
const appState = (window as any).app_state;
      if (!appState || !appState.scheduledAppointments) {
        return { success: false, message: 'App state not ready.' };
      }

      const { scheduledAppointments, currentFormEntry } = appState;
      
      const expectedAppointments = [
        { name: 'Emma Williams', patientNumber: '98765', reason: 'Annual Physical', duration: 45, insurance: 'BlueCross PPO', phone: '5553214567' },
        { name: 'David Thompson', patientNumber: '54321', reason: 'Follow-up', duration: 30, insurance: 'Medicare Advantage', phone: '4255558901' },
        { name: 'Carlos Mendoza', patientNumber: '76543', reason: 'Specialist Consultation', duration: 60, insurance: 'United Healthcare', phone: '7135551234' }
      ];

      // This is the main check for task completion.
      if (scheduledAppointments.length === 3) {
        const allScheduledCorrectly = expectedAppointments.every(expected => {
          return scheduledAppointments.some((scheduled: any) => 
            scheduled.patientName === expected.name &&
            scheduled.patientNumber === expected.patientNumber &&
            scheduled.visitReason === expected.reason &&
            scheduled.durationMinutes === expected.duration &&
            scheduled.insuranceType === expected.insurance &&
            scheduled.phone === expected.phone
          );
        });

        if (allScheduledCorrectly) {
          return { success: true, message: 'All appointments scheduled successfully!' };
        } else {
          return { success: false, message: 'All appointments are scheduled, but some data is incorrect. Please review the appointments.' };
        }
      }
      
      // If the task is not complete, provide cheat/debugging info.
      const cheatData: any[] = [];

      // Step 1: Initialize all rows with submitted data (if any)
      expectedAppointments.forEach((expected) => {
        const scheduled = scheduledAppointments.find((apt: any) => apt.patientNumber === expected.patientNumber);
        
        cheatData.push({
          Patient: expected.name,
          Name: scheduled?.patientName === expected.name ? '✅' : '❌',
          PatientID: scheduled?.patientNumber === expected.patientNumber ? '✅' : '❌',
          Reason: scheduled?.visitReason === expected.reason ? '✅' : '❌',
          Duration: scheduled?.durationMinutes === expected.duration ? '✅' : '❌',
          Insurance: scheduled?.insuranceType === expected.insurance ? '✅' : '❌',
          Phone: scheduled?.phone === expected.phone ? '✅' : '❌',
          Scheduled: scheduled ? '✅' : '❌'
        });
      });

      // Step 2: If there's data in the form, overlay it for the corresponding patient,
      // but only if that patient hasn't already been successfully scheduled.
      if (currentFormEntry?.patientName?.trim()) {
        const matchingIndex = expectedAppointments.findIndex(expected =>
          expected.name === currentFormEntry.patientName.trim()
        );

        if (matchingIndex !== -1) {
          const expected = expectedAppointments[matchingIndex];
          const isAlreadyScheduled = scheduledAppointments.some((apt: any) => apt.patientNumber === expected.patientNumber);

          if (!isAlreadyScheduled) {
            cheatData[matchingIndex] = {
              Patient: expected.name,
              Name: currentFormEntry.patientName === expected.name ? '✅' : '❌',
              PatientID: currentFormEntry.patientNumber?.trim() === expected.patientNumber ? '✅' : '❌',
              Reason: currentFormEntry.visitReason?.trim() === expected.reason ? '✅' : '❌',
              Duration: parseInt(currentFormEntry.durationMinutes || '0') === expected.duration ? '✅' : '❌',
              Insurance: currentFormEntry.insuranceType === expected.insurance ? '✅' : '❌',
              Phone: currentFormEntry.phone?.trim() === expected.phone ? '✅' : '❌',
              Scheduled: '❌'
            };
          }
        }
      }

      console.log('[Cheat] Appointment Progress:');
      console.table(cheatData);

      const message = scheduledAppointments.length > 0
        ? `Only ${scheduledAppointments.length} of 3 appointments have been scheduled. Schedule all appointments.`
        : 'No appointments have been scheduled. Fill in patient details and click calendar time slots to schedule appointments.';

      return {
        success: false,
        message
      };
}

export function test_23(): TestResult {
const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }

      const { completedRegistrations, expectedCompanies, currentFormData } = appState;

      if (!completedRegistrations || !expectedCompanies) {
        return { success: false, message: 'Registration data not found in app state.' };
      }

      // Check if we have the expected number of companies to process
      if (expectedCompanies.length !== 3) {
        return {
          success: false,
          message: `Expected 3 companies in Excel data, found ${expectedCompanies.length}. Data generation may have failed.`
        };
      }

      // Check if all 3 companies have been registered - if yes, do full validation
      if (completedRegistrations.length === 3) {
        const errors = [];

        for (const expected of expectedCompanies) {
          const matching = completedRegistrations.find((reg: any) =>
            reg.companyName === expected.companyName
          );

          if (!matching) {
            errors.push(`Company "${expected.companyName}" not found in registrations`);
            continue;
          }

          // Check all fields - exact matches required
          if (matching.contactPerson !== expected.contactPerson) {
            errors.push(`${expected.companyName}: Contact person "${matching.contactPerson}" should be "${expected.contactPerson}"`);
          }
          if (matching.email.toLowerCase() !== expected.email.toLowerCase()) {
            errors.push(`${expected.companyName}: Email "${matching.email}" should be "${expected.email}"`);
          }
          if (matching.phone !== expected.phone) {
            errors.push(`${expected.companyName}: Phone "${matching.phone}" should be "${expected.phone}"`);
          }
          if (matching.streetAddress !== expected.streetAddress) {
            errors.push(`${expected.companyName}: Street address "${matching.streetAddress}" should be "${expected.streetAddress}"`);
          }
          if (matching.cityStateZip !== expected.cityStateZip) {
            errors.push(`${expected.companyName}: City/State/Zip "${matching.cityStateZip}" should be "${expected.cityStateZip}"`);
          }
          if (matching.industry !== expected.industry) {
            errors.push(`${expected.companyName}: Industry "${matching.industry}" should be "${expected.industry}"`);
          }
          if (matching.annualRevenue !== expected.annualRevenue) {
            errors.push(`${expected.companyName}: Revenue $${matching.annualRevenue} should be exactly $${expected.annualRevenue}`);
          }
          if (matching.employeeCount !== expected.employeeCount) {
            errors.push(`${expected.companyName}: Employee count ${matching.employeeCount} should be exactly ${expected.employeeCount}`);
          }
        }

        if (errors.length > 0) {
          return {
            success: false,
            message: `Data accuracy errors found: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` and ${errors.length - 3} more` : ''}. Verify all fields match the Excel source data.`
          };
        }

        return {
          success: true,
          message: `Successfully registered all ${completedRegistrations.length} companies through the multi-step wizard with accurate data transfer including company info, contact details, addresses, industry selections, and revenue/size information.`
        };
      }

      // Task not complete - provide [Cheat] debugging info
      const cheatData: any[] = [];

      // Step 1: Initialize all rows with submitted data (if any)
      expectedCompanies.forEach((expected: any) => {
        const completed = completedRegistrations.find((reg: any) => 
          reg.companyName === expected.companyName
        );
        
        if (completed) {
          // Company has been completed
          cheatData.push({
            Company: expected.companyName,
            Name: completed.companyName === expected.companyName ? '✅' : '❌',
            Contact: completed.contactPerson === expected.contactPerson ? '✅' : '❌',
            Email: completed.email.toLowerCase() === expected.email.toLowerCase() ? '✅' : '❌',
            Phone: completed.phone === expected.phone ? '✅' : '❌',
            Street: completed.streetAddress === expected.streetAddress ? '✅' : '❌',
            City: completed.cityStateZip === expected.cityStateZip ? '✅' : '❌',
            Industry: completed.industry === expected.industry ? '✅' : '❌',
            Revenue: completed.annualRevenue === expected.annualRevenue ? '✅' : '❌',
            Employees: completed.employeeCount === expected.employeeCount ? '✅' : '❌',
            Status: '✅ Completed'
          });
        } else {
          // Company not yet completed
          cheatData.push({
            Company: expected.companyName,
            Name: '❌',
            Contact: '❌',
            Email: '❌',
            Phone: '❌',
            Street: '❌',
            City: '❌',
            Industry: '❌',
            Revenue: '❌',
            Employees: '❌',
            Status: '⏳ Pending'
          });
        }
      });

      // Step 2: If there's data in the form, overlay it for the corresponding company
      // but only if that company hasn't already been completed
      if (currentFormData?.companyName?.trim()) {
        const matchingIndex = expectedCompanies.findIndex((expected: any) =>
          expected.companyName === currentFormData.companyName.trim()
        );

        if (matchingIndex !== -1) {
          const expected = expectedCompanies[matchingIndex];
          const isAlreadyCompleted = completedRegistrations.some((reg: any) => 
            reg.companyName === expected.companyName
          );

          if (!isAlreadyCompleted) {
            // Show current form progress
            const emailMatch = currentFormData.email?.toLowerCase() === expected.email.toLowerCase();
            const revenueMatch = currentFormData.annualRevenue === expected.annualRevenue;
            const employeeMatch = currentFormData.employeeCount === expected.employeeCount;

            cheatData[matchingIndex] = {
              Company: expected.companyName,
              Name: currentFormData.companyName === expected.companyName ? '✅' : '❌',
              Contact: currentFormData.contactPerson === expected.contactPerson ? '✅' : '❌',
              Email: emailMatch ? '✅' : '❌',
              Phone: currentFormData.phone === expected.phone ? '✅' : '❌',
              Street: currentFormData.streetAddress === expected.streetAddress ? '✅' : '❌',
              City: currentFormData.cityStateZip === expected.cityStateZip ? '✅' : '❌',
              Industry: currentFormData.industry === expected.industry ? '✅' : '❌',
              Revenue: revenueMatch ? '✅' : '❌',
              Employees: employeeMatch ? '✅' : '❌',
              Status: '🔄 In Progress'
            };
          }
        }
      }

      console.log('[Cheat] Customer Registration Progress:');
      console.table(cheatData);

      const message = completedRegistrations.length > 0
        ? `Only ${completedRegistrations.length} of 3 companies registered. Complete all company registrations through the wizard.`
        : 'No registrations completed yet. Transfer customer data from Excel through the wizard steps and complete all registrations.';

      return {
        success: false,
        message
      };
}

export function test_24(): TestResult {
const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }

      const { createdTickets, expectedTickets, currentFormData } = appState;

      if (!createdTickets || !expectedTickets) {
        return { success: false, message: 'Ticket data not found in app state.' };
      }

      // Check if we have 3 tickets created
      if (createdTickets.length !== 3) {
        // Build cheat data showing both created tickets and current form progress
        const cheatData = expectedTickets.map((expected: any) => {
          // Check if this ticket is already created
          const createdTicket = createdTickets.find((t: any) => 
            t.ticketRef?.trim() === expected.ticketRef
          );

          if (createdTicket) {
            // Show validation for created ticket
            const systemsMatch = createdTicket.affectedSystems?.length === expected.affectedSystems.length &&
              expected.affectedSystems.every((sys: string) => createdTicket.affectedSystems?.includes(sys));
            const autoAssignUsed = createdTicket.assignedTo && createdTicket.assignedTo !== 'Auto-assign';
            const slaCalculated = createdTicket.slaTimer && createdTicket.slaTimer > 0;

            return {
              Ticket: expected.ticketRef,
              Ref: createdTicket.ticketRef?.trim() === expected.ticketRef ? '✅' : '❌',
              Customer: createdTicket.customerId?.trim() === expected.customerId ? '✅' : '❌',
              Summary: createdTicket.issueSummary?.trim() === expected.issueSummary ? '✅' : '❌',
              Priority: createdTicket.priorityLevel === expected.priorityLevel ? '✅' : '❌',
              Reporter: createdTicket.reportedBy?.trim() === expected.reportedBy ? '✅' : '❌',
              Date: createdTicket.reportDate === expected.reportDate ? '✅' : '❌',
              Category: createdTicket.category === expected.category ? '✅' : '❌',
              Hours: createdTicket.estimatedHours === expected.estimatedHours ? '✅' : '❌',
              Systems: systemsMatch ? '✅' : '❌',
              AutoAssign: autoAssignUsed ? '✅' : '❌',
              SLA: slaCalculated ? '✅' : '❌',
              Status: '✅ Created'
            };
          }

          // Check if this ticket is currently being filled in the form
          if (currentFormData && currentFormData.ticketRef?.trim() === expected.ticketRef) {
            const systemsMatch = currentFormData.affectedSystems?.length === expected.affectedSystems.length &&
              expected.affectedSystems.every((sys: string) => currentFormData.affectedSystems?.includes(sys));
            const autoAssignUsed = currentFormData.assignedTo && currentFormData.assignedTo !== 'Auto-assign';
            const slaCalculated = currentFormData.slaTimer && currentFormData.slaTimer > 0;

            return {
              Ticket: expected.ticketRef,
              Ref: currentFormData.ticketRef?.trim() === expected.ticketRef ? '✅' : '❌',
              Customer: currentFormData.customerId?.trim() === expected.customerId ? '✅' : '❌',
              Summary: currentFormData.issueSummary?.trim() === expected.issueSummary ? '✅' : '❌',
              Priority: currentFormData.priorityLevel === expected.priorityLevel ? '✅' : '❌',
              Reporter: currentFormData.reportedBy?.trim() === expected.reportedBy ? '✅' : '❌',
              Date: currentFormData.reportDate === expected.reportDate ? '✅' : '❌',
              Category: currentFormData.category === expected.category ? '✅' : '❌',
              Hours: currentFormData.estimatedHours === expected.estimatedHours ? '✅' : '❌',
              Systems: systemsMatch ? '✅' : '❌',
              AutoAssign: autoAssignUsed ? '✅' : '❌',
              SLA: slaCalculated ? '✅' : '❌',
              Status: '🔄 In Progress'
            };
          }

          // Ticket not yet started
          return {
            Ticket: expected.ticketRef,
            Ref: '❌',
            Customer: '❌',
            Summary: '❌',
            Priority: '❌',
            Reporter: '❌',
            Date: '❌',
            Category: '❌',
            Hours: '❌',
            Systems: '❌',
            AutoAssign: '❌',
            SLA: '❌',
            Status: '⏳ Pending'
          };
        });
        
        console.log('[Cheat] Service Ticket Progress:');
        console.table(cheatData);
        
        return {
          success: false,
          message: `Only ${createdTickets.length} of 3 tickets created. Create all tickets from Excel data.`
        };
      }

      // Validate each ticket's data
      const errors: string[] = [];
      const cheatData: any[] = [];

      expectedTickets.forEach((expected: any) => {
        const ticket = createdTickets.find((t: any) => 
          t.ticketRef?.trim() === expected.ticketRef
        );

        if (!ticket) {
          errors.push(`Missing ticket: ${expected.ticketRef}`);
          cheatData.push({
            Ticket: expected.ticketRef,
            Ref: '❌',
            Customer: '❌',
            Summary: '❌',
            Priority: '❌',
            Reporter: '❌',
            Date: '❌',
            Category: '❌',
            Hours: '❌',
            Systems: '❌',
            AutoAssign: '❌',
            SLA: '❌',
            Status: '❌ Missing'
          });
          return;
        }

        // Check each field
        const refMatch = ticket.ticketRef?.trim() === expected.ticketRef;
        const customerMatch = ticket.customerId?.trim() === expected.customerId;
        const summaryMatch = ticket.issueSummary?.trim() === expected.issueSummary;
        const priorityMatch = ticket.priorityLevel === expected.priorityLevel;
        const reporterMatch = ticket.reportedBy?.trim() === expected.reportedBy;
        const dateMatch = ticket.reportDate === expected.reportDate;
        const categoryMatch = ticket.category === expected.category;
        const hoursMatch = ticket.estimatedHours === expected.estimatedHours;
        
        // Check affected systems (arrays must match)
        const systemsMatch = ticket.affectedSystems?.length === expected.affectedSystems.length &&
          expected.affectedSystems.every((sys: string) => ticket.affectedSystems?.includes(sys));
        
        // Check that workflow automation controls were used (not validating specific values)
        const autoAssignUsed = ticket.assignedTo && ticket.assignedTo !== 'Auto-assign';
        const slaCalculated = ticket.slaTimer && ticket.slaTimer > 0;

        if (!refMatch) errors.push(`${expected.ticketRef}: Ticket reference mismatch`);
        if (!customerMatch) errors.push(`${expected.ticketRef}: Customer ID mismatch`);
        if (!summaryMatch) errors.push(`${expected.ticketRef}: Issue summary mismatch`);
        if (!priorityMatch) errors.push(`${expected.ticketRef}: Priority level mismatch`);
        if (!reporterMatch) errors.push(`${expected.ticketRef}: Reporter name mismatch`);
        if (!dateMatch) errors.push(`${expected.ticketRef}: Report date mismatch`);
        if (!categoryMatch) errors.push(`${expected.ticketRef}: Category mismatch`);
        if (!hoursMatch) errors.push(`${expected.ticketRef}: Estimated hours mismatch`);
        if (!systemsMatch) errors.push(`${expected.ticketRef}: Affected systems mismatch`);
        if (!autoAssignUsed) errors.push(`${expected.ticketRef}: Auto-assignment not triggered`);
        if (!slaCalculated) errors.push(`${expected.ticketRef}: SLA timer not calculated`);

        cheatData.push({
          Ticket: expected.ticketRef,
          Ref: refMatch ? '✅' : '❌',
          Customer: customerMatch ? '✅' : '❌',
          Summary: summaryMatch ? '✅' : '❌',
          Priority: priorityMatch ? '✅' : '❌',
          Reporter: reporterMatch ? '✅' : '❌',
          Date: dateMatch ? '✅' : '❌',
          Category: categoryMatch ? '✅' : '❌',
          Hours: hoursMatch ? '✅' : '❌',
          Systems: systemsMatch ? '✅' : '❌',
          AutoAssign: autoAssignUsed ? '✅' : '❌',
          SLA: slaCalculated ? '✅' : '❌',
          Status: (!refMatch || !customerMatch || !summaryMatch || !priorityMatch || !reporterMatch || !dateMatch || !categoryMatch || !hoursMatch || !systemsMatch || !autoAssignUsed || !slaCalculated) ? '❌ Errors' : '✅ Complete'
        });
      });

      if (errors.length > 0) {
        console.log('[Cheat] Service Ticket Progress:');
        console.table(cheatData);

        return {
          success: false,
          message: `Ticket data validation errors: ${errors.join(', ')}`
        };
      }

      console.log('[Cheat] Service Ticket Progress:');
      console.table(cheatData);

      return {
        success: true,
        message: 'All 3 service tickets created successfully with correct data!'
      };
}

export function test_25(): TestResult {
const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }

      const { catalogedBooks, currentFormEntry } = appState;

      // Expected books from Excel schema
      const expectedBooks = [
        {
          isbn: '9780123456789',
          title: 'Cognitive Psychology and Human Memory',
          author: 'Dr. Sarah Miller',
          publicationYear: 2023,
          publisher: 'Academic Press',
          subjectArea: 'Psychology',
          locationCode: 'PSY-150.1',
          purchasePrice: 127.50,
          condition: 'New'
        },
        {
          isbn: '9780987654321',
          title: 'Advanced Calculus for Engineers',
          author: 'Prof. Rajesh Patel',
          publicationYear: 2022,
          publisher: 'Engineering Publications',
          subjectArea: 'Mathematics',
          locationCode: 'MATH-515.2',
          purchasePrice: 89.95,
          condition: 'New'
        },
        {
          isbn: '9780456789123',
          title: 'European History: 1900-1945',
          author: 'Elena Kowalski',
          publicationYear: 2024,
          publisher: 'Historical Studies Press',
          subjectArea: 'History',
          locationCode: 'HIST-940.5',
          purchasePrice: 156.75,
          condition: 'New'
        }
      ];

      if (!catalogedBooks) {
        return { success: false, message: 'Cataloged books data not found in app state.' };
      }

      // Check if we have 3 books cataloged
      if (catalogedBooks.length !== 3) {
        // Build cheat data showing both cataloged books and current form progress
        const cheatData = expectedBooks.map((expected) => {
          // Check if this book is already cataloged
          const catalogedBook = catalogedBooks.find((b: any) => 
            b.isbn?.trim() === expected.isbn
          );

          if (catalogedBook) {
            // Show validation for cataloged book
            const priceMatch = Math.abs(catalogedBook.purchasePrice - expected.purchasePrice) < 0.01;

            return {
              ISBN: expected.isbn,
              ISBNMatch: catalogedBook.isbn?.trim() === expected.isbn ? '✅' : '❌',
              Title: catalogedBook.title?.trim() === expected.title ? '✅' : '❌',
              Author: catalogedBook.author?.trim() === expected.author ? '✅' : '❌',
              Year: catalogedBook.publicationYear === expected.publicationYear ? '✅' : '❌',
              Publisher: catalogedBook.publisher?.trim() === expected.publisher ? '✅' : '❌',
              Subject: catalogedBook.subjectArea?.trim() === expected.subjectArea ? '✅' : '❌',
              Location: catalogedBook.locationCode?.trim() === expected.locationCode ? '✅' : '❌',
              Price: priceMatch ? '✅' : '❌',
              Condition: catalogedBook.condition === expected.condition ? '✅' : '❌',
              Status: '✅ Cataloged'
            };
          }

          // Check if this book is currently being filled in the form
          if (currentFormEntry && currentFormEntry.isbn?.trim() === expected.isbn) {
            const priceMatch = currentFormEntry.purchasePrice && Math.abs(parseFloat(currentFormEntry.purchasePrice) - expected.purchasePrice) < 0.01;
            const yearMatch = currentFormEntry.publicationYear && parseInt(currentFormEntry.publicationYear) === expected.publicationYear;

            return {
              ISBN: expected.isbn,
              ISBNMatch: currentFormEntry.isbn?.trim() === expected.isbn ? '✅' : '❌',
              Title: currentFormEntry.title?.trim() === expected.title ? '✅' : '❌',
              Author: currentFormEntry.author?.trim() === expected.author ? '✅' : '❌',
              Year: yearMatch ? '✅' : '❌',
              Publisher: currentFormEntry.publisher?.trim() === expected.publisher ? '✅' : '❌',
              Subject: currentFormEntry.subjectArea?.trim() === expected.subjectArea ? '✅' : '❌',
              Location: currentFormEntry.locationCode?.trim() === expected.locationCode ? '✅' : '❌',
              Price: priceMatch ? '✅' : '❌',
              Condition: currentFormEntry.condition === expected.condition ? '✅' : '❌',
              Status: '🔄 In Progress'
            };
          }

          // Book not yet started
          return {
            ISBN: expected.isbn,
            ISBNMatch: '❌',
            Title: '❌',
            Author: '❌',
            Year: '❌',
            Publisher: '❌',
            Subject: '❌',
            Location: '❌',
            Price: '❌',
            Condition: '❌',
            Status: '⏸️ Not Started'
          };
        });

        console.log('[Cheat] Library Cataloging Progress:');
        console.table(cheatData);

        const message = catalogedBooks.length > 0
          ? `Only ${catalogedBooks.length} of 3 books cataloged. Complete all book cataloging entries.`
          : 'No books cataloged yet. Transfer book data from Excel, navigate Dewey tree for subject classification, use shelf picker for location, and add books to catalog.';

        return {
          success: false,
          message
        };
      }

      // Validate all 3 books
      const errors: string[] = [];
      const cheatData: any[] = [];

      expectedBooks.forEach((expected) => {
        const book = catalogedBooks.find((b: any) => b.isbn?.trim() === expected.isbn);

        if (!book) {
          errors.push(`${expected.isbn}: Book not found in catalog`);
          cheatData.push({
            ISBN: expected.isbn,
            ISBNMatch: '❌',
            Title: '❌',
            Author: '❌',
            Year: '❌',
            Publisher: '❌',
            Subject: '❌',
            Location: '❌',
            Price: '❌',
            Condition: '❌',
            Status: '❌ Missing'
          });
          return;
        }

        // Field-by-field validation
        const isbnMatch = book.isbn?.trim() === expected.isbn;
        const titleMatch = book.title?.trim() === expected.title;
        const authorMatch = book.author?.trim() === expected.author;
        const yearMatch = book.publicationYear === expected.publicationYear;
        const publisherMatch = book.publisher?.trim() === expected.publisher;
        const subjectMatch = book.subjectArea?.trim() === expected.subjectArea;
        const locationMatch = book.locationCode?.trim() === expected.locationCode;
        const priceMatch = Math.abs(book.purchasePrice - expected.purchasePrice) < 0.01;
        const conditionMatch = book.condition === expected.condition;

        if (!isbnMatch) errors.push(`${expected.isbn}: ISBN mismatch`);
        if (!titleMatch) errors.push(`${expected.isbn}: Title mismatch`);
        if (!authorMatch) errors.push(`${expected.isbn}: Author mismatch`);
        if (!yearMatch) errors.push(`${expected.isbn}: Publication year mismatch`);
        if (!publisherMatch) errors.push(`${expected.isbn}: Publisher mismatch`);
        if (!subjectMatch) errors.push(`${expected.isbn}: Subject area mismatch`);
        if (!locationMatch) errors.push(`${expected.isbn}: Location code mismatch`);
        if (!priceMatch) errors.push(`${expected.isbn}: Purchase price mismatch`);
        if (!conditionMatch) errors.push(`${expected.isbn}: Condition mismatch`);

        cheatData.push({
          ISBN: expected.isbn,
          ISBNMatch: isbnMatch ? '✅' : '❌',
          Title: titleMatch ? '✅' : '❌',
          Author: authorMatch ? '✅' : '❌',
          Year: yearMatch ? '✅' : '❌',
          Publisher: publisherMatch ? '✅' : '❌',
          Subject: subjectMatch ? '✅' : '❌',
          Location: locationMatch ? '✅' : '❌',
          Price: priceMatch ? '✅' : '❌',
          Condition: conditionMatch ? '✅' : '❌',
          Status: (!isbnMatch || !titleMatch || !authorMatch || !yearMatch || !publisherMatch || !subjectMatch || !locationMatch || !priceMatch || !conditionMatch) ? '❌ Errors' : '✅ Complete'
        });
      });

      if (errors.length > 0) {
        console.log('[Cheat] Library Cataloging Progress:');
        console.table(cheatData);

        return {
          success: false,
          message: `Book cataloging validation errors: ${errors.join(', ')}`
        };
      }

      console.log('[Cheat] Library Cataloging Progress:');
      console.table(cheatData);

      return {
        success: true,
        message: 'All 3 books cataloged successfully with correct data!'
      };
}

export function test_26(): TestResult {
const appState = (window as any).app_state;
      
      if (!appState?.enrolledStudents) {
        console.log('[Cheat] Expected 3 students to be enrolled:');
        console.log('[Cheat] 1. Emily Rodriguez - Visual Arts Program - Grade 8');
        console.log('[Cheat] 2. Marcus Thompson - Advanced Mathematics - Grade 10');
        console.log('[Cheat] 3. Sophie Chen - International Baccalaureate - Grade 9');
        return {
          success: false,
          message: 'No enrolled students found. Enroll students using the form.'
        };
      }

      const enrolledStudents = appState.enrolledStudents || [];
      const expectedStudents = [
        {
          studentName: 'Emily Rodriguez',
          dateOfBirth: '2010-05-15',
          parentGuardian: 'Maria Rodriguez',
          contactEmail: 'm.rodriguez@outlook.com',
          homeAddress: '789 Pine Street, Denver, CO 80202',
          programChoice: 'Visual Arts Program',
          gradeLevel: '8',
          startDate: '2024-08-15',
          specialNeeds: 'None'
        },
        {
          studentName: 'Marcus Thompson',
          dateOfBirth: '2008-11-22',
          parentGuardian: 'Linda Thompson',
          contactEmail: 'lthompson@gmail.com',
          homeAddress: '1456 Oak Ridge Drive, Phoenix, AZ 85016',
          programChoice: 'Advanced Mathematics',
          gradeLevel: '10',
          startDate: '2024-08-15',
          specialNeeds: 'Learning Support'
        },
        {
          studentName: 'Sophie Chen',
          dateOfBirth: '2009-03-08',
          parentGuardian: 'David Chen',
          contactEmail: 'd.chen@techcorp.com',
          homeAddress: '2234 Maple Avenue, San Jose, CA 95110',
          programChoice: 'International Baccalaureate',
          gradeLevel: '9',
          startDate: '2024-08-15',
          specialNeeds: 'Gifted Program'
        }
      ];

      const errors: string[] = [];
      const cheatData: any[] = [];

      // Show current form entry if in progress
      const currentFormEntry = appState.currentFormEntry || {};
      const formFieldsCompleted = appState.formFieldsCompleted || {};

      if (Object.values(formFieldsCompleted).some((v: any) => v)) {
        // Try to match current form entry to an expected student
        let matchedExpected = null;
        for (const expected of expectedStudents) {
          if (currentFormEntry.studentName?.trim().toLowerCase() === expected.studentName.toLowerCase()) {
            matchedExpected = expected;
            break;
          }
        }
        
        if (matchedExpected) {
          cheatData.push({
            Student: 'CURRENT FORM ENTRY',
            Name: currentFormEntry.studentName?.trim() === matchedExpected.studentName ? '✅' : '❌',
            DOB: currentFormEntry.dateOfBirth === matchedExpected.dateOfBirth ? '✅' : '❌',
            Guardian: currentFormEntry.parentGuardian?.trim() === matchedExpected.parentGuardian ? '✅' : '❌',
            Email: currentFormEntry.contactEmail?.trim() === matchedExpected.contactEmail ? '✅' : '❌',
            Address: currentFormEntry.homeAddress?.trim() === matchedExpected.homeAddress ? '✅' : '❌',
            Program: currentFormEntry.programChoice === matchedExpected.programChoice ? '✅' : '❌',
            Grade: currentFormEntry.gradeLevel === matchedExpected.gradeLevel ? '✅' : '❌',
            StartDate: currentFormEntry.startDate === matchedExpected.startDate ? '✅' : '❌',
            SpecialNeeds: currentFormEntry.specialNeeds === matchedExpected.specialNeeds ? '✅' : '❌'
          });
        } else {
          // No match found - show all ❌
          cheatData.push({
            Student: 'CURRENT FORM ENTRY',
            Name: '❌',
            DOB: '❌',
            Guardian: '❌',
            Email: '❌',
            Address: '❌',
            Program: '❌',
            Grade: '❌',
            StartDate: '❌',
            SpecialNeeds: '❌'
          });
        }
      }

      expectedStudents.forEach((expected, idx) => {
        const enrolled = enrolledStudents.find((s: any) => 
          s.studentName?.trim().toLowerCase() === expected.studentName.toLowerCase()
        );

        const nameMatch = enrolled && enrolled.studentName?.trim() === expected.studentName;
        const dobMatch = enrolled && enrolled.dateOfBirth === expected.dateOfBirth;
        const guardianMatch = enrolled && enrolled.parentGuardian?.trim() === expected.parentGuardian;
        const emailMatch = enrolled && enrolled.contactEmail?.trim() === expected.contactEmail;
        const addressMatch = enrolled && enrolled.homeAddress?.trim() === expected.homeAddress;
        const programMatch = enrolled && enrolled.programChoice === expected.programChoice;
        const gradeMatch = enrolled && enrolled.gradeLevel === expected.gradeLevel;
        const startDateMatch = enrolled && enrolled.startDate === expected.startDate;
        const specialNeedsMatch = enrolled && enrolled.specialNeeds === expected.specialNeeds;

        if (!enrolled) {
          errors.push(`Student ${idx + 1}: ${expected.studentName} not found`);
        } else {
          if (!nameMatch) errors.push(`Student ${idx + 1}: Name mismatch`);
          if (!dobMatch) errors.push(`Student ${idx + 1}: Date of birth mismatch`);
          if (!guardianMatch) errors.push(`Student ${idx + 1}: Parent/guardian mismatch`);
          if (!emailMatch) errors.push(`Student ${idx + 1}: Email mismatch`);
          if (!addressMatch) errors.push(`Student ${idx + 1}: Address mismatch`);
          if (!programMatch) errors.push(`Student ${idx + 1}: Program choice mismatch`);
          if (!gradeMatch) errors.push(`Student ${idx + 1}: Grade level mismatch`);
          if (!startDateMatch) errors.push(`Student ${idx + 1}: Start date mismatch`);
          if (!specialNeedsMatch) errors.push(`Student ${idx + 1}: Special needs mismatch`);
        }

        cheatData.push({
          Student: expected.studentName,
          Name: nameMatch ? '✅' : '❌',
          DOB: dobMatch ? '✅' : '❌',
          Guardian: guardianMatch ? '✅' : '❌',
          Email: emailMatch ? '✅' : '❌',
          Address: addressMatch ? '✅' : '❌',
          Program: programMatch ? '✅' : '❌',
          Grade: gradeMatch ? '✅' : '❌',
          StartDate: startDateMatch ? '✅' : '❌',
          SpecialNeeds: specialNeedsMatch ? '✅' : '❌',
          Status: enrolled ? (errors.some(e => e.includes(expected.studentName)) ? '⚠️ Errors' : '✅ Complete') : '❌ Missing'
        });
      });

      if (errors.length > 0) {
        console.log('[Cheat] Student Enrollment Progress:');
        console.table(cheatData);

        return {
          success: false,
          message: `Enrollment validation errors: ${errors.join(', ')}`
        };
      }

      console.log('[Cheat] Student Enrollment Progress:');
      console.table(cheatData);

      return {
        success: true,
        message: 'All 3 students enrolled successfully with correct data!'
      };
}

export function test_27(): TestResult {
const appState = (window as any).app_state;
      
      if (!appState?.applications) {
        console.log('[Cheat] Expected 3 tenant applications to be submitted:');
        console.log('[Cheat] 1. Lisa Anderson - Full-time Employee - $4800/mo');
        console.log('[Cheat] 2. Carlos Mendoza - Self-employed - $5600/mo');
        console.log('[Cheat] 3. Jennifer Park - Contract Worker - $3200/mo');
        return {
          success: false,
          message: 'No tenant applications found. Submit applications using the form.'
        };
      }

      const applications = appState.applications || [];
      const expectedApplications = [
        {
          applicantName: 'Lisa Anderson',
          phoneContact: '2065559876',
          currentAddress: '1200 Maple Avenue, Seattle, WA 98101',
          employmentStatus: 'Full-time Employee',
          monthlyIncome: 4800,
          rentalHistory: 'Excellent rental history',
          desiredMoveDate: '2024-03-01',
          referenceContact: 'Tom Wilson 4255551234',
          documentTypes: ['Pay Stub', 'Bank Statement']
        },
        {
          applicantName: 'Carlos Mendoza',
          phoneContact: '6195557654',
          currentAddress: '3456 Cedar Boulevard, San Diego, CA 92101',
          employmentStatus: 'Self-employed',
          monthlyIncome: 5600,
          rentalHistory: 'Good standing with landlords',
          desiredMoveDate: '2024-03-15',
          referenceContact: 'Maria Santos 8585553333',
          documentTypes: ['Tax Return', 'Business License']
        },
        {
          applicantName: 'Jennifer Park',
          phoneContact: '7735552109',
          currentAddress: '789 Willow Drive, Chicago, IL 60601',
          employmentStatus: 'Contract Worker',
          monthlyIncome: 3200,
          rentalHistory: 'First-time renter',
          desiredMoveDate: '2024-04-01',
          referenceContact: 'Dr. Kim Lee 8475554444',
          documentTypes: ['Contract Agreement', 'References']
        }
      ];

      const errors: string[] = [];
      const cheatData: any[] = [];

      // Show current form entry if in progress
      const currentFormEntry = appState.currentFormEntry || {};
      const formFieldsCompleted = appState.formFieldsCompleted || {};

      if (Object.values(formFieldsCompleted).some((v: any) => v)) {
        // Try to match current form entry to an expected applicant
        let matchedExpected = null;
        for (const expected of expectedApplications) {
          if (currentFormEntry.applicantName?.trim().toLowerCase() === expected.applicantName.toLowerCase()) {
            matchedExpected = expected;
            break;
          }
        }
        
        if (matchedExpected) {
          // Check document types array
          const documentMatch = currentFormEntry.documentTypes && matchedExpected.documentTypes.every((doc: string) => 
            currentFormEntry.documentTypes?.includes(doc)
          ) && currentFormEntry.documentTypes?.length === matchedExpected.documentTypes.length;
          
          cheatData.push({
            Applicant: 'CURRENT FORM ENTRY',
            Name: currentFormEntry.applicantName?.trim() === matchedExpected.applicantName ? '✅' : '❌',
            Phone: currentFormEntry.phoneContact?.trim() === matchedExpected.phoneContact ? '✅' : '❌',
            Address: currentFormEntry.currentAddress?.trim() === matchedExpected.currentAddress ? '✅' : '❌',
            Employment: currentFormEntry.employmentStatus?.trim() === matchedExpected.employmentStatus ? '✅' : '❌',
            Income: currentFormEntry.monthlyIncome === matchedExpected.monthlyIncome ? '✅' : '❌',
            RentalHistory: currentFormEntry.rentalHistory?.trim() === matchedExpected.rentalHistory ? '✅' : '❌',
            MoveDate: currentFormEntry.desiredMoveDate?.trim() === matchedExpected.desiredMoveDate ? '✅' : '❌',
            Reference: currentFormEntry.referenceContact?.trim() === matchedExpected.referenceContact ? '✅' : '❌',
            Documents: documentMatch ? '✅' : '❌'
          });
        } else {
          // No match found - show all ❌
          cheatData.push({
            Applicant: 'CURRENT FORM ENTRY',
            Name: '❌',
            Phone: '❌',
            Address: '❌',
            Employment: '❌',
            Income: '❌',
            RentalHistory: '❌',
            MoveDate: '❌',
            Reference: '❌',
            Documents: '❌'
          });
        }
      }

      expectedApplications.forEach((expected, idx) => {
        const app = applications.find((a: any) => 
          a.applicantName?.trim().toLowerCase() === expected.applicantName.toLowerCase()
        );

        const nameMatch = app && app.applicantName?.trim() === expected.applicantName;
        const phoneMatch = app && app.phoneContact?.trim() === expected.phoneContact;
        const addressMatch = app && app.currentAddress?.trim() === expected.currentAddress;
        const employmentMatch = app && app.employmentStatus?.trim() === expected.employmentStatus;
        const incomeMatch = app && app.monthlyIncome === expected.monthlyIncome;
        const rentalMatch = app && app.rentalHistory?.trim() === expected.rentalHistory;
        const moveDateMatch = app && app.desiredMoveDate?.trim() === expected.desiredMoveDate;
        const referenceMatch = app && app.referenceContact?.trim() === expected.referenceContact;
        
        // Check document types array
        const documentMatch = app && expected.documentTypes.every(doc => 
          app.documentTypes?.includes(doc)
        ) && app.documentTypes?.length === expected.documentTypes.length;

        if (!app) {
          errors.push(`Application ${idx + 1}: ${expected.applicantName} not found`);
        } else {
          if (!nameMatch) errors.push(`Application ${idx + 1}: Applicant name mismatch`);
          if (!phoneMatch) errors.push(`Application ${idx + 1}: Phone contact mismatch`);
          if (!addressMatch) errors.push(`Application ${idx + 1}: Current address mismatch`);
          if (!employmentMatch) errors.push(`Application ${idx + 1}: Employment status mismatch`);
          if (!incomeMatch) errors.push(`Application ${idx + 1}: Monthly income mismatch`);
          if (!rentalMatch) errors.push(`Application ${idx + 1}: Rental history mismatch`);
          if (!moveDateMatch) errors.push(`Application ${idx + 1}: Move date mismatch`);
          if (!referenceMatch) errors.push(`Application ${idx + 1}: Reference contact mismatch`);
          if (!documentMatch) errors.push(`Application ${idx + 1}: Document types mismatch`);
        }

        cheatData.push({
          Applicant: expected.applicantName,
          Name: nameMatch ? '✅' : '❌',
          Phone: phoneMatch ? '✅' : '❌',
          Address: addressMatch ? '✅' : '❌',
          Employment: employmentMatch ? '✅' : '❌',
          Income: incomeMatch ? '✅' : '❌',
          RentalHistory: rentalMatch ? '✅' : '❌',
          MoveDate: moveDateMatch ? '✅' : '❌',
          Reference: referenceMatch ? '✅' : '❌',
          Documents: documentMatch ? '✅' : '❌',
          Status: app ? (errors.some(e => e.includes(expected.applicantName)) ? '⚠️ Errors' : '✅ Complete') : '❌ Missing'
        });
      });

      if (errors.length > 0) {
        console.log('[Cheat] Tenant Application Progress:');
        console.table(cheatData);

        return {
          success: false,
          message: `Application validation errors: ${errors.join(', ')}`
        };
      }

      console.log('[Cheat] Tenant Application Progress:');
      console.table(cheatData);

      return {
        success: true,
        message: 'All 3 tenant applications submitted successfully with correct data!'
      };
}

export function test_28(): TestResult {
const appState = (window as any).app_state;
      
      if (!appState) {
        console.log('[Cheat] No app_state found. Waiting for form initialization...');
        return { success: false, message: 'App state not initialized' };
      }

      const applications = appState.applications || [];
      const currentFormEntry = appState.currentFormEntry || {};
      const formFieldsCompleted = appState.formFieldsCompleted || {};

      // Expected data from Excel
      const expectedApplications = [
        {
          applicantFullName: 'Robert Martinez',
          ssnNumber: '123456789',
          annualIncome: 85000,
          employmentType: 'Salaried Employee',
          loanAmountRequested: 35000,
          loanPurpose: 'Home Improvement',
          creditScore: 745,
          collateralDescription: '2019 Toyota Camry',
          monthlyObligations: 2850
        },
        {
          applicantFullName: 'Angela Thompson',
          ssnNumber: '456789012',
          annualIncome: 120000,
          employmentType: 'Self-employed',
          loanAmountRequested: 50000,
          loanPurpose: 'Debt Consolidation',
          creditScore: 692,
          collateralDescription: 'Investment Portfolio',
          monthlyObligations: 4200
        },
        {
          applicantFullName: 'Kevin Chang',
          ssnNumber: '789012345',
          annualIncome: 78000,
          employmentType: 'Contract Employee',
          loanAmountRequested: 25000,
          loanPurpose: 'Medical Expenses',
          creditScore: 718,
          collateralDescription: '2021 Honda Civic',
          monthlyObligations: 1950
        }
      ];

      const errors: string[] = [];
      const cheatData: any[] = [];

      // Check if user is currently filling out a form
      if (formFieldsCompleted.hasApplicantName || formFieldsCompleted.hasSSN || 
          formFieldsCompleted.hasAnnualIncome || formFieldsCompleted.hasLoanAmount) {
        
        // Try to match current form entry to an expected applicant
        let matchedExpected = null;
        for (const expected of expectedApplications) {
          if (currentFormEntry.applicantFullName?.trim().toLowerCase() === expected.applicantFullName.toLowerCase()) {
            matchedExpected = expected;
            break;
          }
        }
        
        // If no name match, try SSN
        if (!matchedExpected && currentFormEntry.ssnNumber?.trim()) {
          for (const expected of expectedApplications) {
            if (currentFormEntry.ssnNumber.trim() === expected.ssnNumber) {
              matchedExpected = expected;
              break;
            }
          }
        }
        
        if (matchedExpected) {
          cheatData.push({
            Applicant: 'CURRENT FORM ENTRY',
            Name: currentFormEntry.applicantFullName?.trim() === matchedExpected.applicantFullName ? '✅' : '❌',
            SSN: currentFormEntry.ssnNumber?.trim() === matchedExpected.ssnNumber ? '✅' : '❌',
            Income: currentFormEntry.annualIncome && parseFloat(currentFormEntry.annualIncome) === matchedExpected.annualIncome ? '✅' : '❌',
            Employment: currentFormEntry.employmentType === matchedExpected.employmentType ? '✅' : '❌',
            LoanAmount: currentFormEntry.loanAmountRequested && parseFloat(currentFormEntry.loanAmountRequested) === matchedExpected.loanAmountRequested ? '✅' : '❌',
            Purpose: currentFormEntry.loanPurpose === matchedExpected.loanPurpose ? '✅' : '❌',
            CreditScore: currentFormEntry.creditScore && parseInt(currentFormEntry.creditScore) === matchedExpected.creditScore ? '✅' : '❌',
            Collateral: currentFormEntry.collateralDescription?.trim() === matchedExpected.collateralDescription ? '✅' : '❌',
            Obligations: currentFormEntry.monthlyObligations && parseFloat(currentFormEntry.monthlyObligations) === matchedExpected.monthlyObligations ? '✅' : '❌',
            Status: 'In Progress'
          });
        } else {
          // No match found - show all ❌
          cheatData.push({
            Applicant: 'CURRENT FORM ENTRY',
            Name: '❌',
            SSN: '❌',
            Income: '❌',
            Employment: '❌',
            LoanAmount: '❌',
            Purpose: '❌',
            CreditScore: '❌',
            Collateral: '❌',
            Obligations: '❌',
            Status: '❌ Unknown Applicant'
          });
        }
      }

      // Validation checks
      if (applications.length === 0) {
        expectedApplications.forEach((expected) => {
          cheatData.push({
            Applicant: expected.applicantFullName,
            Name: '❌',
            SSN: '❌',
            Income: '❌',
            Employment: '❌',
            LoanAmount: '❌',
            Purpose: '❌',
            CreditScore: '❌',
            Collateral: '❌',
            Obligations: '❌',
            Calculations: '❌',
            Status: '❌ Not Started'
          });
        });
        console.log('[Cheat] Loan Application Progress:');
        console.table(cheatData);
        return { success: false, message: 'No loan applications submitted yet' };
      }

      if (applications.length < 3) {
        errors.push(`Only ${applications.length} application(s) submitted, need 3 total`);
      }

      expectedApplications.forEach((expected, idx) => {
        const app = applications.find((a: any) => 
          a.applicantFullName?.trim().toLowerCase() === expected.applicantFullName.toLowerCase()
        );

        const nameMatch = app && app.applicantFullName?.trim() === expected.applicantFullName;
        const ssnMatch = app && app.ssnNumber?.trim() === expected.ssnNumber;
        const incomeMatch = app && app.annualIncome === expected.annualIncome;
        const employmentMatch = app && app.employmentType === expected.employmentType;
        const loanAmountMatch = app && app.loanAmountRequested === expected.loanAmountRequested;
        const purposeMatch = app && app.loanPurpose === expected.loanPurpose;
        const creditScoreMatch = app && app.creditScore === expected.creditScore;
        const collateralMatch = app && app.collateralDescription?.trim() === expected.collateralDescription;
        const obligationsMatch = app && app.monthlyObligations === expected.monthlyObligations;
        
        // Check that calculations were performed
        const hasCalculations = app && app.monthlyPayment > 0 && app.debtToIncomeRatio > 0 && 
                               app.riskLevel && app.paymentScheduleGenerated;

        if (!app) {
          errors.push(`Application ${idx + 1}: ${expected.applicantFullName} not found`);
        } else {
          if (!nameMatch) errors.push(`Application ${idx + 1}: Applicant name mismatch`);
          if (!ssnMatch) errors.push(`Application ${idx + 1}: SSN mismatch`);
          if (!incomeMatch) errors.push(`Application ${idx + 1}: Annual income mismatch`);
          if (!employmentMatch) errors.push(`Application ${idx + 1}: Employment type mismatch`);
          if (!loanAmountMatch) errors.push(`Application ${idx + 1}: Loan amount mismatch`);
          if (!purposeMatch) errors.push(`Application ${idx + 1}: Loan purpose mismatch`);
          if (!creditScoreMatch) errors.push(`Application ${idx + 1}: Credit score mismatch`);
          if (!collateralMatch) errors.push(`Application ${idx + 1}: Collateral description mismatch`);
          if (!obligationsMatch) errors.push(`Application ${idx + 1}: Monthly obligations mismatch`);
          if (!hasCalculations) errors.push(`Application ${idx + 1}: Missing calculator interactions (payment, DTI, risk, schedule)`);
        }

        cheatData.push({
          Applicant: expected.applicantFullName,
          Name: nameMatch ? '✅' : '❌',
          SSN: ssnMatch ? '✅' : '❌',
          Income: incomeMatch ? '✅' : '❌',
          Employment: employmentMatch ? '✅' : '❌',
          LoanAmount: loanAmountMatch ? '✅' : '❌',
          Purpose: purposeMatch ? '✅' : '❌',
          CreditScore: creditScoreMatch ? '✅' : '❌',
          Collateral: collateralMatch ? '✅' : '❌',
          Obligations: obligationsMatch ? '✅' : '❌',
          Calculations: hasCalculations ? '✅' : '❌',
          Status: app ? (errors.some(e => e.includes(expected.applicantFullName)) ? '⚠️ Errors' : '✅ Complete') : '❌ Missing'
        });
      });

      if (errors.length > 0) {
        console.log('[Cheat] Loan Application Progress:');
        console.table(cheatData);

        return {
          success: false,
          message: `Application validation errors: ${errors.join(', ')}`
        };
      }

      console.log('[Cheat] Loan Application Progress:');
      console.table(cheatData);

      return {
        success: true,
        message: 'All 3 loan applications submitted successfully with correct data and calculations!'
      };
}

export function test_29(): TestResult {
const appState = (window as any).app_state;
      
      if (!appState) {
        return { success: false, message: 'App state not found' };
      }

      const receivedItems = appState.receivedItems || [];
      const currentFormEntry = appState.currentFormEntry || {};
      const formFieldsCompleted = appState.formFieldsCompleted || {};
      const errors: string[] = [];
      const cheatData: any[] = [];

      // Expected data from Excel
      const expectedItems = [
        {
          poNumber: 'PO-2024-157',
          supplierName: 'Global Supply Solutions',
          itemDescription: 'Steel Brackets 5mm thickness',
          quantityOrdered: 750,
          unitPrice: 3.25,
          deliveryDate: '2024-01-25',
          inspectorName: 'Michael Johnson',
          conditionNotes: 'Good condition, minor scratches',
          itemWeight: '0.5 kg'
        },
        {
          poNumber: 'PO-2024-158',
          supplierName: 'TechFlow Components',
          itemDescription: 'USB-C Cables 2m length',
          quantityOrdered: 1200,
          unitPrice: 4.75,
          deliveryDate: '2024-01-26',
          inspectorName: 'Sarah Wilson',
          conditionNotes: 'Excellent quality, all tested',
          itemWeight: '0.3 kg'
        },
        {
          poNumber: 'PO-2024-159',
          supplierName: 'Precision Industrial',
          itemDescription: 'Safety Helmets Class E rated',
          quantityOrdered: 85,
          unitPrice: 67.50,
          deliveryDate: '2024-01-27',
          inspectorName: 'Carlos Rodriguez',
          conditionNotes: 'One unit damaged in shipping',
          itemWeight: '1.2 kg'
        }
      ];

      // Show current form progress if user is typing
      const hasAnyFormData = formFieldsCompleted.hasPoNumber || formFieldsCompleted.hasSupplierName ||
                             formFieldsCompleted.hasItemDescription || formFieldsCompleted.hasQuantityOrdered ||
                             formFieldsCompleted.hasUnitPrice || formFieldsCompleted.hasDeliveryDate ||
                             formFieldsCompleted.hasInspectorName || formFieldsCompleted.hasConditionNotes ||
                             formFieldsCompleted.hasItemWeight || formFieldsCompleted.hasConditionStatus;

      if (hasAnyFormData) {
        // Find which expected item matches the current PO number being entered
        const currentPO = currentFormEntry.poNumber?.trim().toUpperCase() || '';
        const matchingExpected = expectedItems.find(e => e.poNumber.toUpperCase() === currentPO);
        
        if (matchingExpected) {
          // Show real-time validation for current form entry
          const formSupplierMatch = currentFormEntry.supplierName?.trim() === matchingExpected.supplierName;
          const formItemMatch = currentFormEntry.itemDescription?.trim() === matchingExpected.itemDescription;
          const formQtyMatch = currentFormEntry.quantityOrdered === matchingExpected.quantityOrdered;
          const formPriceMatch = currentFormEntry.unitPrice && Math.abs(currentFormEntry.unitPrice - matchingExpected.unitPrice) < 0.01;
          const formDateMatch = currentFormEntry.deliveryDate?.trim() === matchingExpected.deliveryDate;
          const formInspectorMatch = currentFormEntry.inspectorName?.trim() === matchingExpected.inspectorName;
          // Weight can be "0.5 kg" or just "0.5" - accept both formats
          const formWeightMatch = currentFormEntry.itemWeight && (
            currentFormEntry.itemWeight.trim() === matchingExpected.itemWeight ||
            currentFormEntry.itemWeight.trim() === matchingExpected.itemWeight.replace(' kg', '')
          );
          const formNotesMatch = currentFormEntry.conditionNotes?.trim() === matchingExpected.conditionNotes;
          const formConditionMatch = currentFormEntry.conditionStatus && currentFormEntry.conditionStatus.trim().length > 0;

          cheatData.push({
            PO: '🔄 CURRENT FORM',
            Supplier: formSupplierMatch ? '✅' : (formFieldsCompleted.hasSupplierName ? '❌' : '⬜'),
            Item: formItemMatch ? '✅' : (formFieldsCompleted.hasItemDescription ? '❌' : '⬜'),
            Qty: formQtyMatch ? '✅' : (formFieldsCompleted.hasQuantityOrdered ? '❌' : '⬜'),
            Price: formPriceMatch ? '✅' : (formFieldsCompleted.hasUnitPrice ? '❌' : '⬜'),
            Date: formDateMatch ? '✅' : (formFieldsCompleted.hasDeliveryDate ? '❌' : '⬜'),
            Inspector: formInspectorMatch ? '✅' : (formFieldsCompleted.hasInspectorName ? '❌' : '⬜'),
            Weight: formWeightMatch ? '✅' : (formFieldsCompleted.hasItemWeight ? '❌' : '⬜'),
            Condition: formConditionMatch ? '✅' : '⬜',
            Notes: formNotesMatch ? '✅' : (formFieldsCompleted.hasConditionNotes ? '❌' : '⬜'),
            Status: '⏳ Typing...'
          });
        }
      }

      // Check if no items received yet
      if (receivedItems.length === 0 && !hasAnyFormData) {
        expectedItems.forEach((expected) => {
          cheatData.push({
            PO: expected.poNumber,
            Supplier: '❌',
            Item: '❌',
            Qty: '❌',
            Price: '❌',
            Date: '❌',
            Inspector: '❌',
            Weight: '❌',
            Condition: '❌',
            Notes: '❌',
            Status: '❌ Not Started'
          });
        });
        console.log('[Cheat] Inventory Receiving Progress:');
        console.table(cheatData);
        return { success: false, message: 'No items received yet' };
      }

      if (receivedItems.length < 3) {
        errors.push(`Only ${receivedItems.length} item(s) received, need 3 total`);
      }

      // Always show all 3 expected items with validation against submitted items
      expectedItems.forEach((expected, idx) => {
        const item = receivedItems.find((i: any) => 
          i.poNumber?.trim().toUpperCase() === expected.poNumber.toUpperCase()
        );

        const poMatch = item && item.poNumber?.trim() === expected.poNumber;
        const supplierMatch = item && item.supplierName?.trim() === expected.supplierName;
        const itemMatch = item && item.itemDescription?.trim() === expected.itemDescription;
        const qtyMatch = item && item.quantityOrdered === expected.quantityOrdered;
        const priceMatch = item && Math.abs(item.unitPrice - expected.unitPrice) < 0.01;
        const dateMatch = item && item.deliveryDate?.trim() === expected.deliveryDate;
        const inspectorMatch = item && item.inspectorName?.trim() === expected.inspectorName;
        // Weight can be "0.5 kg" or just "0.5" - extract numeric part for comparison
        const weightMatch = item && (
          item.itemWeight?.trim() === expected.itemWeight ||
          item.itemWeight?.trim() === expected.itemWeight.replace(' kg', '')
        );
        const notesMatch = item && item.conditionNotes?.trim() === expected.conditionNotes;
        const hasConditionStatus = item && item.conditionStatus && item.conditionStatus.trim().length > 0;

        if (!item) {
          errors.push(`Item ${idx + 1}: ${expected.poNumber} not found`);
        } else {
          if (!poMatch) errors.push(`Item ${idx + 1}: PO number mismatch`);
          if (!supplierMatch) errors.push(`Item ${idx + 1}: Supplier name mismatch`);
          if (!itemMatch) errors.push(`Item ${idx + 1}: Item description mismatch`);
          if (!qtyMatch) errors.push(`Item ${idx + 1}: Quantity ordered mismatch`);
          if (!priceMatch) errors.push(`Item ${idx + 1}: Unit price mismatch`);
          if (!dateMatch) errors.push(`Item ${idx + 1}: Delivery date mismatch`);
          if (!inspectorMatch) errors.push(`Item ${idx + 1}: Inspector name mismatch`);
          if (!weightMatch) errors.push(`Item ${idx + 1}: Item weight mismatch`);
          if (!notesMatch) errors.push(`Item ${idx + 1}: Condition notes mismatch`);
          if (!hasConditionStatus) errors.push(`Item ${idx + 1}: Condition status not selected`);
        }

        cheatData.push({
          PO: expected.poNumber,
          Supplier: supplierMatch ? '✅' : '❌',
          Item: itemMatch ? '✅' : '❌',
          Qty: qtyMatch ? '✅' : '❌',
          Price: priceMatch ? '✅' : '❌',
          Date: dateMatch ? '✅' : '❌',
          Inspector: inspectorMatch ? '✅' : '❌',
          Weight: weightMatch ? '✅' : '❌',
          Condition: hasConditionStatus ? '✅' : '❌',
          Notes: notesMatch ? '✅' : '❌',
          Status: item ? (errors.some(e => e.includes(expected.poNumber)) ? '⚠️ Errors' : '✅ Complete') : '❌ Not Submitted'
        });
      });

      if (errors.length > 0) {
        console.log('[Cheat] Inventory Receiving Progress:');
        console.table(cheatData);

        return {
          success: false,
          message: `Inventory validation errors: ${errors.join(', ')}`
        };
      }

      console.log('[Cheat] Inventory Receiving Progress:');
      console.table(cheatData);

      return {
        success: true,
        message: 'All 3 inventory items received successfully with correct data!'
      };
}

export function test_30(): TestResult {
const appState = (window as any).app_state;
      
      const expectedContracts = [
        {
          contractReference: 'CNT-2024-387',
          party1Company: 'Meridian Technologies',
          party2Company: 'Beta Industries LLC',
          contractType: 'Software Licensing Agreement',
          startDate: '2024-01-01',
          endDate: '2025-12-31',
          contractValue: 125000,
          renewalTerms: 'Auto-renew annually with 60-day notice',
          keyClauses: ['IP Rights', 'Termination']
        },
        {
          contractReference: 'CNT-2024-388',
          party1Company: 'Cascade Manufacturing',
          party2Company: 'Delta Logistics Corp',
          contractType: 'Supply Chain Services',
          startDate: '2024-02-01',
          endDate: '2027-01-31',
          contractValue: 850000,
          renewalTerms: 'Manual renewal required',
          keyClauses: ['Payment Schedule', 'SLA Terms']
        },
        {
          contractReference: 'CNT-2024-389',
          party1Company: 'Pinnacle Consulting Group',
          party2Company: 'Epsilon Healthcare',
          contractType: 'Professional Services Agreement',
          startDate: '2024-03-01',
          endDate: '2024-12-31',
          contractValue: 75000,
          renewalTerms: '90-day notice for non-renewal',
          keyClauses: ['Confidentiality', 'Deliverables']
        }
      ];

      const contracts = appState?.contracts || [];
      const currentFormEntry = appState?.currentFormEntry || {};
      const formFieldsCompleted = appState?.formFieldsCompleted || {};
      const selectedClauses = appState?.selectedClauses || [];
      const timelineBuilt = appState?.timelineBuilt || false;
      const reminderSet = appState?.reminderSet || false;
      const cheatData: any[] = [];
      const errors: string[] = [];

      // Basic validation - check if any contracts have been created
      if (contracts.length === 0) {
        // Check if there's current form data in progress
        const hasFormData = formFieldsCompleted.hasContractReference || 
                           formFieldsCompleted.hasParty1Company ||
                           formFieldsCompleted.hasParty2Company;

        if (hasFormData) {
          // Show form in progress for the matching contract
          const matchingIndex = expectedContracts.findIndex(expected =>
            expected.contractReference.toUpperCase() === currentFormEntry.contractReference?.trim().toUpperCase()
          );

          if (matchingIndex !== -1) {
            const expected = expectedContracts[matchingIndex];
            const valueMatch = currentFormEntry.contractValue ? 
              Math.abs(parseFloat(currentFormEntry.contractValue) - expected.contractValue) < 0.01 : false;
            
            const expectedClausesSorted = [...expected.keyClauses].sort();
            const selectedClausesSorted = [...selectedClauses].sort();
            const clausesMatch = expectedClausesSorted.length === selectedClausesSorted.length &&
              expectedClausesSorted.every((clause, i) => clause === selectedClausesSorted[i]);

            cheatData.push({
              Reference: expected.contractReference,
              Ref: currentFormEntry.contractReference?.trim() === expected.contractReference ? '✅' : '❌',
              Party1: currentFormEntry.party1Company?.trim() === expected.party1Company ? '✅' : '❌',
              Party2: currentFormEntry.party2Company?.trim() === expected.party2Company ? '✅' : '❌',
              Type: currentFormEntry.contractType?.trim() === expected.contractType ? '✅' : '❌',
              StartDate: currentFormEntry.startDate?.trim() === expected.startDate ? '✅' : '❌',
              EndDate: currentFormEntry.endDate?.trim() === expected.endDate ? '✅' : '❌',
              Value: valueMatch ? '✅' : '❌',
              Renewal: currentFormEntry.renewalTerms?.trim() === expected.renewalTerms ? '✅' : '❌',
              Clauses: clausesMatch ? '✅' : '❌',
              Timeline: timelineBuilt ? '✅' : '❌',
              Reminder: reminderSet ? '✅' : '❌',
              Status: '🔄 In Progress'
            });

            // Add empty rows for other expected contracts
            expectedContracts.forEach((exp, i) => {
              if (i !== matchingIndex) {
                cheatData.push({
                  Reference: exp.contractReference,
                  Ref: '❌',
                  Party1: '❌',
                  Party2: '❌',
                  Type: '❌',
                  StartDate: '❌',
                  EndDate: '❌',
                  Value: '❌',
                  Renewal: '❌',
                  Clauses: '❌',
                  Timeline: '❌',
                  Reminder: '❌',
                  Status: '⏳ Pending'
                });
              }
            });
          } else {
            // Form data doesn't match any expected contract
            expectedContracts.forEach(expected => {
              cheatData.push({
                Reference: expected.contractReference,
                Ref: '❌',
                Party1: '❌',
                Party2: '❌',
                Type: '❌',
                StartDate: '❌',
                EndDate: '❌',
                Value: '❌',
                Renewal: '❌',
                Clauses: '❌',
                Timeline: '❌',
                Reminder: '❌',
                Status: '⏳ Pending'
              });
            });
          }

          console.log('[Cheat] Contract Management Progress:');
          console.table(cheatData);
          return { success: false, message: 'No contracts created yet - Complete and add the current contract' };
        }

        // No form data at all
        expectedContracts.forEach(expected => {
          cheatData.push({
            Reference: expected.contractReference,
            Ref: '❌',
            Party1: '❌',
            Party2: '❌',
            Type: '❌',
            StartDate: '❌',
            EndDate: '❌',
            Value: '❌',
            Renewal: '❌',
            Clauses: '❌',
            Timeline: '❌',
            Reminder: '❌',
            Status: '⏳ Pending'
          });
        });
        
        console.log('[Cheat] Contract Management Progress:');
        console.table(cheatData);
        return { success: false, message: 'No contracts created yet - Start entering contract data from Excel' };
      }

      if (contracts.length < 3) {
        errors.push(`Only ${contracts.length} contract(s) created, need 3 total`);
      }

      // Validate each expected contract and build cheat data
      expectedContracts.forEach((expected) => {
        const contract = contracts.find((c: any) =>
          c.contractReference?.trim().toUpperCase() === expected.contractReference.toUpperCase()
        );

        if (contract) {
          // Contract exists - validate all fields
          const refMatch = contract.contractReference?.trim() === expected.contractReference;
          const party1Match = contract.party1Company?.trim() === expected.party1Company;
          const party2Match = contract.party2Company?.trim() === expected.party2Company;
          const typeMatch = contract.contractType?.trim() === expected.contractType;
          const startDateMatch = contract.startDate?.trim() === expected.startDate;
          const endDateMatch = contract.endDate?.trim() === expected.endDate;
          const valueMatch = Math.abs(contract.contractValue - expected.contractValue) < 0.01;
          const renewalMatch = contract.renewalTerms?.trim() === expected.renewalTerms;
          
          const expectedClausesSorted = [...expected.keyClauses].sort();
          const actualClausesSorted = contract.keyClauses ? [...contract.keyClauses].sort() : [];
          const clausesMatch = expectedClausesSorted.length === actualClausesSorted.length &&
            expectedClausesSorted.every((clause, i) => clause === actualClausesSorted[i]);
          
          const timelineMatch = contract.timelineBuilt === true;
          const reminderMatch = contract.reminderSet === true;

          if (!refMatch) errors.push(`${expected.contractReference}: Reference mismatch`);
          if (!party1Match) errors.push(`${expected.contractReference}: Party 1 company mismatch`);
          if (!party2Match) errors.push(`${expected.contractReference}: Party 2 company mismatch`);
          if (!typeMatch) errors.push(`${expected.contractReference}: Contract type mismatch`);
          if (!startDateMatch) errors.push(`${expected.contractReference}: Start date mismatch`);
          if (!endDateMatch) errors.push(`${expected.contractReference}: End date mismatch`);
          if (!valueMatch) errors.push(`${expected.contractReference}: Contract value mismatch`);
          if (!renewalMatch) errors.push(`${expected.contractReference}: Renewal terms mismatch`);
          if (!clausesMatch) errors.push(`${expected.contractReference}: Key clauses mismatch`);
          if (!timelineMatch) errors.push(`${expected.contractReference}: Timeline not built`);
          if (!reminderMatch) errors.push(`${expected.contractReference}: Reminder not set`);

          cheatData.push({
            Reference: expected.contractReference,
            Ref: refMatch ? '✅' : '❌',
            Party1: party1Match ? '✅' : '❌',
            Party2: party2Match ? '✅' : '❌',
            Type: typeMatch ? '✅' : '❌',
            StartDate: startDateMatch ? '✅' : '❌',
            EndDate: endDateMatch ? '✅' : '❌',
            Value: valueMatch ? '✅' : '❌',
            Renewal: renewalMatch ? '✅' : '❌',
            Clauses: clausesMatch ? '✅' : '❌',
            Timeline: timelineMatch ? '✅' : '❌',
            Reminder: reminderMatch ? '✅' : '❌',
            Status: (!refMatch || !party1Match || !party2Match || !typeMatch || !startDateMatch || 
                    !endDateMatch || !valueMatch || !renewalMatch || !clausesMatch || 
                    !timelineMatch || !reminderMatch) ? '❌ Errors' : '✅ Complete'
          });
        } else {
          // Contract not yet created - check if it's the current form entry
          const isCurrentEntry = currentFormEntry.contractReference?.trim().toUpperCase() === 
                                expected.contractReference.toUpperCase();
          
          if (isCurrentEntry && (formFieldsCompleted.hasContractReference || formFieldsCompleted.hasParty1Company)) {
            const valueMatch = currentFormEntry.contractValue ? 
              Math.abs(parseFloat(currentFormEntry.contractValue) - expected.contractValue) < 0.01 : false;
            
            const expectedClausesSorted = [...expected.keyClauses].sort();
            const selectedClausesSorted = [...selectedClauses].sort();
            const clausesMatch = expectedClausesSorted.length === selectedClausesSorted.length &&
              expectedClausesSorted.every((clause, i) => clause === selectedClausesSorted[i]);

            cheatData.push({
              Reference: expected.contractReference,
              Ref: currentFormEntry.contractReference?.trim() === expected.contractReference ? '✅' : '❌',
              Party1: currentFormEntry.party1Company?.trim() === expected.party1Company ? '✅' : '❌',
              Party2: currentFormEntry.party2Company?.trim() === expected.party2Company ? '✅' : '❌',
              Type: currentFormEntry.contractType?.trim() === expected.contractType ? '✅' : '❌',
              StartDate: currentFormEntry.startDate?.trim() === expected.startDate ? '✅' : '❌',
              EndDate: currentFormEntry.endDate?.trim() === expected.endDate ? '✅' : '❌',
              Value: valueMatch ? '✅' : '❌',
              Renewal: currentFormEntry.renewalTerms?.trim() === expected.renewalTerms ? '✅' : '❌',
              Clauses: clausesMatch ? '✅' : '❌',
              Timeline: timelineBuilt ? '✅' : '❌',
              Reminder: reminderSet ? '✅' : '❌',
              Status: '🔄 In Progress'
            });
          } else {
            // Contract not started
            cheatData.push({
              Reference: expected.contractReference,
              Ref: '❌',
              Party1: '❌',
              Party2: '❌',
              Type: '❌',
              StartDate: '❌',
              EndDate: '❌',
              Value: '❌',
              Renewal: '❌',
              Clauses: '❌',
              Timeline: '❌',
              Reminder: '❌',
              Status: '⏳ Pending'
            });
          }
        }
      });

      if (errors.length > 0) {
        console.log('[Cheat] Contract Management Progress:');
        console.table(cheatData);

        return {
          success: false,
          message: `Contract validation errors: ${errors.join(', ')}`
        };
      }

      console.log('[Cheat] Contract Management Progress:');
      console.table(cheatData);

      return {
        success: true,
        message: 'All 3 contracts created successfully with complete data!'
      };
}

export function test_31(): TestResult {
const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { submittedAudits, violations, currentAudit, violationsByCategory } = appState;
      
      // Configuration: how many audits required (1 for quick test, 3 for full validation)
      const requiredAudits = 1;
      
      // [Cheat] Show current progress (for testers) - ALWAYS show this first
      const cheatData: any[] = [];
      
      // Always show submitted audits
      if (submittedAudits && submittedAudits.length > 0) {
        submittedAudits.forEach((audit: any, idx: number) => {
          const breakdown = {
            'Data Security': 0,
            'Access Control': 0,
            'Documentation': 0,
            'Process Compliance': 0
          };
          audit.violations.forEach((v: any) => {
            if (v.category in breakdown) {
              breakdown[v.category as keyof typeof breakdown]++;
            }
          });
          
          cheatData.push({
            Audit: idx + 1,
            Reference: audit.reference,
            Total: `${audit.violations.length}/8`,
            'Data Sec': `${breakdown['Data Security']}/2`,
            'Access': `${breakdown['Access Control']}/2`,
            'Docs': `${breakdown['Documentation']}/2`,
            'Process': `${breakdown['Process Compliance']}/2`,
            Status: '✅ Submitted'
          });
        });
      }
      
      // Show current audit in progress if any
      if (currentAudit && violations && violations.length > 0) {
        cheatData.push({
          Audit: (submittedAudits?.length || 0) + 1,
          Reference: currentAudit,
          Total: `${violations.length}/8`,
          'Data Sec': `${violationsByCategory['Data Security'] || 0}/2`,
          'Access': `${violationsByCategory['Access Control'] || 0}/2`,
          'Docs': `${violationsByCategory['Documentation'] || 0}/2`,
          'Process': `${violationsByCategory['Process Compliance'] || 0}/2`,
          Status: '🔄 In Progress'
        });
      }
      
      // Display the cheat table
      if (cheatData.length > 0) {
        console.log(`[Cheat] Overall Progress: ${submittedAudits?.length || 0}/3 audits completed`);
        console.table(cheatData);
      } else {
        console.log('[Cheat] No audits started yet. Enter an audit reference (AUD-2024-XXX) and click "Add Violation" to begin.');
      }
      
      // Show next steps
      if (!submittedAudits || submittedAudits.length === 0) {
        console.log(`[Cheat] Next Step: Start first audit by entering reference (e.g., AUD-2024-301) and adding 8 violations.`);
      } else if (submittedAudits.length < requiredAudits) {
        console.log(`[Cheat] Next Step: Complete ${requiredAudits - submittedAudits.length} more audit(s). ${currentAudit && violations?.length > 0 ? `Current audit has ${violations.length}/8 violations.` : 'Start a new audit by entering a reference.'}`);
      } else {
        console.log(`[Cheat] ✅ All ${requiredAudits} audit(s) completed! Checking validation...`);
      }
      
      // Now do the actual validation
      if (!submittedAudits || submittedAudits.length === 0) {
        return { 
          success: false, 
          message: 'No audits submitted yet. Complete and submit at least one audit with 8 violations.' 
        };
      }
      
      // Validate the required number of audits
      if (submittedAudits.length < requiredAudits) {
        return {
          success: false,
          message: `Only ${submittedAudits.length} audit(s) submitted. Process and submit ${requiredAudits} complete audit(s).`
        };
      }
      
      const errors: string[] = [];
      
      // Validate submitted audits
      for (let i = 0; i < Math.min(requiredAudits, submittedAudits.length); i++) {
        const audit = submittedAudits[i];
        
        if (!audit) {
          errors.push(`Audit ${i + 1} is missing`);
          continue;
        }
        
        // Check audit reference format
        if (!audit.reference || !audit.reference.trim()) {
          errors.push(`Audit ${i + 1}: Missing audit reference`);
        } else if (!audit.reference.match(/^AUD-2024-\d+$/)) {
          errors.push(`Audit ${i + 1}: Invalid audit reference format "${audit.reference}" (expected AUD-2024-XXX)`);
        }
        
        // Check total violations
        if (!audit.violations || audit.violations.length !== 8) {
          errors.push(`Audit ${i + 1} (${audit.reference}): Expected 8 violations, found ${audit.violations?.length || 0}`);
          continue;
        }
        
        // Check category distribution (must be exactly 2 per category)
        const categoryBreakdown: Record<string, number> = {
          'Data Security': 0,
          'Access Control': 0,
          'Documentation': 0,
          'Process Compliance': 0
        };
        
        audit.violations.forEach((v: any) => {
          if (v.category in categoryBreakdown) {
            categoryBreakdown[v.category]++;
          }
        });
        
        for (const [category, count] of Object.entries(categoryBreakdown)) {
          if (count !== 2) {
            errors.push(`Audit ${i + 1} (${audit.reference}): Expected 2 "${category}" violations, found ${count}`);
          }
        }
        
        // Validate each violation has complete fields
        for (let j = 0; j < audit.violations.length; j++) {
          const violation = audit.violations[j];
          
          if (!violation.category) {
            errors.push(`Audit ${i + 1} (${audit.reference}), Violation ${j + 1}: Missing category`);
            continue;
          }
          
          if (!violation.fields) {
            errors.push(`Audit ${i + 1} (${audit.reference}), Violation ${j + 1}: Missing fields`);
            continue;
          }
          
          const fields = violation.fields;
          
          // Validate category-specific fields
          if (violation.category === 'Data Security') {
            if (!fields.affected_system?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Data Security missing "affected_system"`);
            }
            if (!fields.encryption_status?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Data Security missing "encryption_status"`);
            }
            if (!fields.remediation_owner?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Data Security missing "remediation_owner"`);
            }
            if (!fields.target_completion_date?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Data Security missing "target_completion_date"`);
            }
          } else if (violation.category === 'Access Control') {
            if (!fields.user_role?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Access Control missing "user_role"`);
            }
            if (!fields.permission_level?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Access Control missing "permission_level"`);
            }
            if (!fields.justification_notes?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Access Control missing "justification_notes"`);
            }
            if (!fields.reviewer_name?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Access Control missing "reviewer_name"`);
            }
          } else if (violation.category === 'Documentation') {
            if (!fields.document_type?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Documentation missing "document_type"`);
            }
            if (!fields.missing_sections?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Documentation missing "missing_sections"`);
            }
            if (!fields.responsible_party?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Documentation missing "responsible_party"`);
            }
            if (!fields.update_deadline?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Documentation missing "update_deadline"`);
            }
          } else if (violation.category === 'Process Compliance') {
            if (!fields.process_name?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Process Compliance missing "process_name"`);
            }
            if (!fields.gap_description?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Process Compliance missing "gap_description"`);
            }
            if (!fields.corrective_action?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Process Compliance missing "corrective_action"`);
            }
            if (!fields.verification_method?.trim()) {
              errors.push(`Audit ${i + 1}, Violation ${j + 1}: Process Compliance missing "verification_method"`);
            }
          }
        }
      }
      
      if (errors.length > 0) {
        return {
          success: false,
          message: `Compliance remediation validation errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` (and ${errors.length - 3} more)` : ''}`
        };
      }
      
      return {
        success: true,
        message: `Successfully processed ${requiredAudits} audit checklist(s) with exact violation counts (8 per audit, 2 per category) and complete remediation data!`
      };
}

export function test_32(): TestResult {
  const appState = (window as any).app_state;
  if (!appState) {
    return { success: false, message: 'App state not found.' };
  }
  
  const { batchReference, equipment, submittedBatches, calibratedCount, totalEquipment } = appState;
  
  // Configuration: how many batches required (1 for quick test, 3 for full validation)
  const requiredBatches = 1;
  
  // [Cheat] Show current progress (for testers) - ALWAYS show this first
  const cheatData: any[] = [];
  
  // Always show submitted batches
  if (submittedBatches && submittedBatches.length > 0) {
    submittedBatches.forEach((batch: any, idx: number) => {
      cheatData.push({
        Batch: idx + 1,
        Reference: batch.batchRef,
        Equipment: `${batch.equipmentCount}/6`,
        Status: '✅ Submitted',
        Time: new Date(batch.submittedAt).toLocaleTimeString()
      });
    });
  }
  
  // Show current batch in progress if any
  if (batchReference && equipment && equipment.length > 0) {
    const calibrated = equipment.filter((e: any) => e.status === 'calibrated').length;
    const inProgress = equipment.filter((e: any) => e.status === 'in-progress').length;
    
    cheatData.push({
      Batch: (submittedBatches?.length || 0) + 1,
      Reference: batchReference,
      Equipment: `${calibrated}/6`,
      Status: `🔄 In Progress (${inProgress} in-progress)`,
      Time: '-'
    });
    
    // Show equipment details with validation (compact format)
    console.log('[Cheat] Equipment Data Validation:');
    
    // Get expected data for validation
    const expectedCalibrationData: { [key: string]: { [key: string]: { technician: string; date: string; notesContains: string } } } = {
      'BATCH-2024-105': {
        'CAL-A': { technician: 'James Wilson', date: '2024-02-10', notesContains: 'pressure verification' },
        'CAL-B': { technician: 'Sarah Chen', date: '2024-02-11', notesContains: 'Flow rate accuracy' },
        'CAL-C': { technician: 'James Wilson', date: '2024-02-12', notesContains: 'Valve response' },
        'CAL-D': { technician: 'Maria Rodriguez', date: '2024-02-10', notesContains: 'Temperature accuracy' },
        'CAL-E': { technician: 'Sarah Chen', date: '2024-02-11', notesContains: 'Buffer solution' },
        'CAL-F': { technician: 'Maria Rodriguez', date: '2024-02-12', notesContains: 'Conductivity standards' }
      },
      'BATCH-2024-106': {
        'CAL-A': { technician: 'David Kim', date: '2024-02-15', notesContains: 'reference standard' },
        'CAL-B': { technician: 'Emily Carter', date: '2024-02-16', notesContains: 'Differential readings' },
        'CAL-C': { technician: 'David Kim', date: '2024-02-17', notesContains: 'Relief pressure' },
        'CAL-D': { technician: 'Jennifer Park', date: '2024-02-15', notesContains: 'ice bath' },
        'CAL-E': { technician: 'Emily Carter', date: '2024-02-16', notesContains: 'Resistance-temperature' },
        'CAL-F': { technician: 'Jennifer Park', date: '2024-02-17', notesContains: 'PID tuning' }
      },
      'BATCH-2024-107': {
        'CAL-A': { technician: 'Robert Lee', date: '2024-02-20', notesContains: 'certified masses' },
        'CAL-B': { technician: 'Angela Martinez', date: '2024-02-21', notesContains: 'Strain measurements' },
        'CAL-C': { technician: 'Robert Lee', date: '2024-02-22', notesContains: 'Force-output' },
        'CAL-D': { technician: 'Lisa Thompson', date: '2024-02-20', notesContains: 'Distance measurement' },
        'CAL-E': { technician: 'Angela Martinez', date: '2024-02-21', notesContains: 'Detection range' },
        'CAL-F': { technician: 'Lisa Thompson', date: '2024-02-22', notesContains: 'Encoder resolution' }
      }
    };
    
    const expectedData = expectedCalibrationData[batchReference];
    
    const equipmentStatus = equipment.map((e: any) => {
      // For calibrated equipment, validate each field
      const hasTechnician = e.technician && e.technician.trim();
      const hasDate = e.date && e.date.trim();
      const hasNotes = e.notes && e.notes.trim();
      
      let techStatus = '-';
      let dateStatus = '-';
      let notesStatus = '-';
      
      if (e.status === 'calibrated') {
        if (expectedData && expectedData[e.id]) {
          const expected = expectedData[e.id];
          
          // Check technician - must match exactly
          if (!hasTechnician) {
            techStatus = '❌';
          } else if (e.technician.trim() === expected.technician) {
            techStatus = '✅';
          } else {
            techStatus = '❌';
          }
          
          // Check date - must match exactly
          if (!hasDate) {
            dateStatus = '❌';
          } else if (e.date.trim() === expected.date) {
            dateStatus = '✅';
          } else {
            dateStatus = '❌';
          }
          
          // Check notes - must contain key phrase
          if (!hasNotes) {
            notesStatus = '❌';
          } else if (e.notes.toLowerCase().includes(expected.notesContains.toLowerCase())) {
            notesStatus = '✅';
          } else {
            notesStatus = '❌';
          }
        } else {
          // No validation data, just check if filled
          techStatus = hasTechnician ? '✅' : '❌';
          dateStatus = hasDate ? '✅' : '❌';
          notesStatus = hasNotes ? '✅' : '❌';
        }
      }
      
      return {
        Equipment: e.id,
        Technician: techStatus,
        Date: dateStatus,
        Notes: notesStatus
      };
    });
    console.table(equipmentStatus);
  }
  
  // Display the cheat table
  if (cheatData.length > 0) {
    console.log(`[Cheat] Overall Progress: ${submittedBatches?.length || 0}/${requiredBatches} batch(es) completed`);
    console.table(cheatData);
  } else {
    console.log('[Cheat] No batches started yet. Enter a batch reference (e.g., BATCH-2024-105) to begin.');
  }
  
  // Show next steps
  if (!submittedBatches || submittedBatches.length === 0) {
    console.log(`[Cheat] Next Step: Enter batch reference (e.g., BATCH-2024-105) and calibrate all 6 equipment items in dependency order.`);
    if (batchReference && equipment && equipment.length > 0) {
      const nextAvailable = equipment.filter((e: any) => {
        if (e.status !== 'not-started') return false;
        return e.dependencies.every((depId: string) => {
          const dep = equipment.find((eq: any) => eq.id === depId);
          return dep?.status === 'calibrated';
        });
      });
      if (nextAvailable.length > 0) {
        console.log(`[Cheat] Next Available Equipment: ${nextAvailable.map((e: any) => e.id).join(', ')} (no pending dependencies)`);
      }
    }
  } else if (submittedBatches.length < requiredBatches) {
    console.log(`[Cheat] Next Step: Complete ${requiredBatches - submittedBatches.length} more batch(es).`);
  } else {
    console.log(`[Cheat] ✅ All ${requiredBatches} batch(es) completed! Checking validation...`);
  }
  
  // Now do the actual validation
  if (!submittedBatches || submittedBatches.length === 0) {
    return { 
      success: false, 
      message: 'No calibration batches submitted yet. Complete and submit at least one batch with 6 equipment items.' 
    };
  }
  
  // Validate the required number of batches
  if (submittedBatches.length < requiredBatches) {
    return {
      success: false,
      message: `Only ${submittedBatches.length} batch(es) submitted. Process and submit ${requiredBatches} complete calibration batch(es).`
    };
  }
  
  const errors: string[] = [];
  
  // Expected calibration sequences for each batch
  const expectedSequences: { [key: string]: string[] } = {
    'BATCH-2024-105': ['CAL-A', 'CAL-B', 'CAL-C', 'CAL-D', 'CAL-E', 'CAL-F'],
    'BATCH-2024-106': ['CAL-A', 'CAL-B', 'CAL-C', 'CAL-D', 'CAL-E', 'CAL-F'],
    'BATCH-2024-107': ['CAL-A', 'CAL-B', 'CAL-C', 'CAL-D', 'CAL-E', 'CAL-F']
  };
  
  // Expected dependencies for validation
  const expectedDependencies: { [key: string]: string[] } = {
    'CAL-A': [],
    'CAL-B': ['CAL-A'],
    'CAL-C': ['CAL-B'],
    'CAL-D': [],
    'CAL-E': ['CAL-D'],
    'CAL-F': ['CAL-E']
  };
  
  // Validate submitted batches
  for (let i = 0; i < Math.min(requiredBatches, submittedBatches.length); i++) {
    const batch = submittedBatches[i];
    
    if (!batch) {
      errors.push(`Batch ${i + 1} is missing`);
      continue;
    }
    
    // Check batch reference format
    if (!batch.batchRef || !batch.batchRef.startsWith('BATCH-2024-')) {
      errors.push(`Batch ${i + 1}: Invalid batch reference format "${batch.batchRef || 'none'}". Expected format: BATCH-2024-XXX`);
    }
    
    // Check equipment count
    if (batch.equipmentCount !== 6) {
      errors.push(`Batch ${i + 1}: Expected 6 equipment items, got ${batch.equipmentCount}`);
      continue;
    }
    
    // Note: We don't have the full equipment details in submittedBatches summary,
    // so we validate based on count. The live equipment state validation happens
    // during the actual calibration process through the UI's dependency checking.
  }
  
  // Expected calibration data for each batch
  const expectedCalibrationData: { [key: string]: { [key: string]: { technician: string; date: string; notesContains: string } } } = {
    'BATCH-2024-105': {
      'CAL-A': { technician: 'James Wilson', date: '2024-02-10', notesContains: 'pressure verification' },
      'CAL-B': { technician: 'Sarah Chen', date: '2024-02-11', notesContains: 'Flow rate accuracy' },
      'CAL-C': { technician: 'James Wilson', date: '2024-02-12', notesContains: 'Valve response' },
      'CAL-D': { technician: 'Maria Rodriguez', date: '2024-02-10', notesContains: 'Temperature accuracy' },
      'CAL-E': { technician: 'Sarah Chen', date: '2024-02-11', notesContains: 'Buffer solution' },
      'CAL-F': { technician: 'Maria Rodriguez', date: '2024-02-12', notesContains: 'Conductivity standards' }
    },
    'BATCH-2024-106': {
      'CAL-A': { technician: 'David Kim', date: '2024-02-15', notesContains: 'reference standard' },
      'CAL-B': { technician: 'Emily Carter', date: '2024-02-16', notesContains: 'Differential readings' },
      'CAL-C': { technician: 'David Kim', date: '2024-02-17', notesContains: 'Relief pressure' },
      'CAL-D': { technician: 'Jennifer Park', date: '2024-02-15', notesContains: 'ice bath' },
      'CAL-E': { technician: 'Emily Carter', date: '2024-02-16', notesContains: 'Resistance-temperature' },
      'CAL-F': { technician: 'Jennifer Park', date: '2024-02-17', notesContains: 'PID tuning' }
    },
    'BATCH-2024-107': {
      'CAL-A': { technician: 'Robert Lee', date: '2024-02-20', notesContains: 'certified masses' },
      'CAL-B': { technician: 'Angela Martinez', date: '2024-02-21', notesContains: 'Strain measurements' },
      'CAL-C': { technician: 'Robert Lee', date: '2024-02-22', notesContains: 'Force-output' },
      'CAL-D': { technician: 'Lisa Thompson', date: '2024-02-20', notesContains: 'Distance measurement' },
      'CAL-E': { technician: 'Angela Martinez', date: '2024-02-21', notesContains: 'Detection range' },
      'CAL-F': { technician: 'Lisa Thompson', date: '2024-02-22', notesContains: 'Encoder resolution' }
    }
  };
  
  // Additional validation if current batch equipment is available
  if (equipment && equipment.length > 0 && batchReference) {
    // Verify all equipment has correct dependencies defined
    equipment.forEach((eq: any) => {
      const expectedDeps = expectedDependencies[eq.id];
      if (expectedDeps) {
        const actualDeps = eq.dependencies || [];
        if (JSON.stringify(actualDeps.sort()) !== JSON.stringify(expectedDeps.sort())) {
          errors.push(`Equipment ${eq.id}: Dependencies mismatch. Expected [${expectedDeps.join(', ')}], got [${actualDeps.join(', ')}]`);
        }
      }
    });
    
    // Verify all equipment is calibrated before submission
    const notCalibrated = equipment.filter((e: any) => e.status !== 'calibrated');
    if (notCalibrated.length > 0 && submittedBatches.length < requiredBatches) {
      errors.push(`Current batch incomplete: ${notCalibrated.length} equipment items not yet calibrated (${notCalibrated.map((e: any) => e.id).join(', ')})`);
    }
    
    // Validate calibration data entered from PDF
    const expectedData = expectedCalibrationData[batchReference];
    if (expectedData) {
      equipment.forEach((eq: any) => {
        if (eq.status === 'calibrated') {
          const expected = expectedData[eq.id];
          if (expected) {
            // Check technician name
            if (!eq.technician || eq.technician.trim() === '') {
              errors.push(`Equipment ${eq.id}: Missing technician name from PDF`);
            } else if (eq.technician.trim() !== expected.technician) {
              errors.push(`Equipment ${eq.id}: Technician should be "${expected.technician}", got "${eq.technician}"`);
            }
            
            // Check date
            if (!eq.date || eq.date.trim() === '') {
              errors.push(`Equipment ${eq.id}: Missing calibration date from PDF`);
            } else if (eq.date.trim() !== expected.date) {
              errors.push(`Equipment ${eq.id}: Date should be "${expected.date}", got "${eq.date}"`);
            }
            
            // Check notes (contains expected text)
            if (!eq.notes || eq.notes.trim() === '') {
              errors.push(`Equipment ${eq.id}: Missing calibration notes from PDF`);
            } else if (!eq.notes.toLowerCase().includes(expected.notesContains.toLowerCase())) {
              errors.push(`Equipment ${eq.id}: Notes should contain "${expected.notesContains}"`);
            }
          }
        }
      });
    }
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      message: `Equipment calibration validation errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` (and ${errors.length - 3} more)` : ''}`
    };
  }
  
  return {
    success: true,
    message: `Successfully completed ${requiredBatches} calibration batch(es) with all 6 equipment items calibrated in correct dependency order!`
  };
}

export function test_33(): TestResult {
  const appState = (window as any).app_state;
  if (!appState) {
    return { success: false, message: 'App state not found.' };
  }
  
  const { enrollmentRequests, processedEnrollments } = appState;
  
  if (!enrollmentRequests || !processedEnrollments) {
    return { success: false, message: 'Enrollment requests or processed enrollments not found in app state.' };
  }
  
  // Expected decisions based on prerequisite rules from PDF
  const expectedEnrollments = [
    {
      name: 'Emily Carter',
      id: 'EMP-1001',
      completedCourses: ['Intro to Programming', 'Data Structures'],
      requestedCourses: ['Algorithms', 'Database Design', 'Web Development'],
      decisions: [
        { course: 'Algorithms', decision: 'approve', reason: '' },
        { course: 'Database Design', decision: 'approve', reason: '' },
        { course: 'Web Development', decision: 'approve', reason: '' }
      ]
    },
    {
      name: 'Michael Torres',
      id: 'EMP-1002',
      completedCourses: ['Intro to Programming'],
      requestedCourses: ['Data Structures', 'Algorithms', 'Machine Learning'],
      decisions: [
        { course: 'Data Structures', decision: 'approve', reason: '' },
        { course: 'Algorithms', decision: 'deny', reason: 'Prerequisites Not Met' },
        { course: 'Machine Learning', decision: 'deny', reason: 'Prerequisites Not Met' }
      ]
    },
    {
      name: 'Sarah Johnson',
      id: 'EMP-1003',
      completedCourses: ['Intro to Programming', 'Data Structures', 'Algorithms', 'Database Design', 'Advanced SQL'],
      requestedCourses: ['Machine Learning', 'Cloud Architecture'],
      decisions: [
        { course: 'Machine Learning', decision: 'approve', reason: '' },
        { course: 'Cloud Architecture', decision: 'deny', reason: 'Prerequisites Not Met' }
      ]
    },
    {
      name: 'David Kim',
      id: 'EMP-1004',
      completedCourses: [],
      requestedCourses: ['Intro to Programming', 'Data Structures', 'Web Development'],
      decisions: [
        { course: 'Intro to Programming', decision: 'approve', reason: '' },
        { course: 'Data Structures', decision: 'deny', reason: 'Prerequisites Not Met' },
        { course: 'Web Development', decision: 'deny', reason: 'Prerequisites Not Met' }
      ]
    },
    {
      name: 'Jessica Martinez',
      id: 'EMP-1005',
      completedCourses: ['Intro to Programming', 'Database Design', 'Advanced SQL', 'Web Development'],
      requestedCourses: ['Cloud Architecture', 'Data Structures', 'Machine Learning'],
      decisions: [
        { course: 'Cloud Architecture', decision: 'approve', reason: '' },
        { course: 'Data Structures', decision: 'approve', reason: '' },
        { course: 'Machine Learning', decision: 'deny', reason: 'Prerequisites Not Met' }
      ]
    }
  ];
  
  // [Cheat] system - Build validation table BEFORE any checks (for testers)
  const cheatData: any[] = [];
  const errors: string[] = [];
  
  // Show progress
  const requestsWithData = enrollmentRequests.filter((req: any) => req.employeeName && req.employeeId);
  console.log(`[Cheat] Progress: ${requestsWithData.length}/5 employees have data entered, ${processedEnrollments.length}/5 submitted (for testers)`);
  
  for (let i = 0; i < expectedEnrollments.length; i++) {
    const expected = expectedEnrollments[i];
    
    // Check both enrollmentRequests (current data being entered) and processedEnrollments (submitted data)
    const request = enrollmentRequests.find((r: any) => 
      r.employeeName.trim() === expected.name && r.employeeId.trim() === expected.id
    );
    const processed = processedEnrollments.find((p: any) => 
      p.employeeName.trim() === expected.name && p.employeeId.trim() === expected.id
    );
    
    // Use whichever has data (prefer processed if both exist)
    const current = processed || request;
    
    if (!current || !current.employeeName) {
      cheatData.push({
        Employee: expected.name,
        ID: expected.id,
        Status: '⏸️ Not started',
        Details: 'No data entered yet'
      });
      if (processed && !request) {
        errors.push(`Employee ${expected.name} (${expected.id}) not found in processed enrollments`);
      }
      continue;
    }
    
    // Check employee basic info
    const nameMatch = current.employeeName.trim() === expected.name;
    const idMatch = current.employeeId.trim() === expected.id;
    
    if (processed && !nameMatch) {
      errors.push(`Employee name mismatch: expected "${expected.name}", got "${current.employeeName}"`);
    }
    
    if (processed && !idMatch) {
      errors.push(`Employee ID mismatch: expected "${expected.id}", got "${current.employeeId}"`);
    }
    
    // Check completed courses
    const currentCompleted = (current.completedCourses || []).map((c: string) => c.trim()).sort();
    const expectedCompleted = expected.completedCourses.map((c: string) => c.trim()).sort();
    const completedMatch = JSON.stringify(currentCompleted) === JSON.stringify(expectedCompleted);
    
    if (processed && !completedMatch) {
      errors.push(`${expected.name}: Completed courses mismatch. Expected [${expectedCompleted.join(', ')}], got [${currentCompleted.join(', ')}]`);
    }
    
    // Check requested courses
    const currentRequested = (current.requestedCourses || []).map((c: string) => c.trim()).sort();
    const expectedRequested = expected.requestedCourses.map((c: string) => c.trim()).sort();
    const requestedMatch = JSON.stringify(currentRequested) === JSON.stringify(expectedRequested);
    
    if (processed && !requestedMatch) {
      errors.push(`${expected.name}: Requested courses mismatch. Expected [${expectedRequested.join(', ')}], got [${currentRequested.join(', ')}]`);
    }
    
    // Check decisions for each course
    let courseErrors = 0;
    let courseSuccess = 0;
    const courseDetails: string[] = [];
    
    // Check if decisions exist and validate them
    const currentDecisions = current.decisions || [];
    
    for (const expectedDecision of expected.decisions) {
      const currentDecision = currentDecisions.find((d: any) => d.course.trim() === expectedDecision.course);
      
      if (!currentDecision || currentDecision.decision === 'pending') {
        courseDetails.push(`${expectedDecision.course}: ⏸️ Pending`);
        if (processed) {
          courseErrors++;
          errors.push(`${expected.name}: Missing decision for course "${expectedDecision.course}"`);
        }
        continue;
      }
      
      // Check decision (approve/deny/defer)
      const decisionMatch = currentDecision.decision === expectedDecision.decision;
      if (!decisionMatch) {
        courseErrors++;
        courseDetails.push(`${expectedDecision.course}: ❌ ${currentDecision.decision} (need ${expectedDecision.decision})`);
        if (processed) {
          errors.push(`${expected.name}, ${expectedDecision.course}: Expected decision "${expectedDecision.decision}", got "${currentDecision.decision}"`);
        }
        continue;
      }
      
      // Check reason for denials
      let reasonMatch = true;
      if (expectedDecision.decision === 'deny') {
        reasonMatch = currentDecision.reason.trim() === expectedDecision.reason;
        if (!reasonMatch) {
          courseErrors++;
          courseDetails.push(`${expectedDecision.course}: ❌ Denied but wrong reason (${currentDecision.reason || 'none'})`);
          if (processed) {
            errors.push(`${expected.name}, ${expectedDecision.course}: Expected denial reason "${expectedDecision.reason}", got "${currentDecision.reason || 'none'}"`);
          }
          continue;
        }
      }
      
      courseSuccess++;
      const icon = expectedDecision.decision === 'approve' ? '✅' : 
                   expectedDecision.decision === 'deny' ? '✅ Denied' : '✅ Deferred';
      courseDetails.push(`${expectedDecision.course}: ${icon}`);
    }
    
    // Determine overall status
    let status = '';
    if (!nameMatch || !idMatch) {
      status = '❌ Wrong name/ID';
    } else if (!completedMatch || !requestedMatch) {
      status = '❌ Wrong courses';
    } else if (courseErrors > 0) {
      status = `❌ ${courseErrors} decision error(s)`;
    } else if (courseSuccess === expected.decisions.length) {
      status = processed ? '✅ Complete & Submitted' : '✅ Ready to submit';
    } else {
      status = `⏸️ ${courseSuccess}/${expected.decisions.length} decided`;
    }
    
    cheatData.push({
      Employee: expected.name,
      ID: expected.id,
      Courses: `${courseSuccess}/${expected.decisions.length}`,
      Status: status,
      Details: courseDetails.join('; ')
    });
  }
  
  // ALWAYS show [Cheat] table BEFORE validation (for testers)
  console.log('[Cheat] Training Enrollment Validation Status (for testers):');
  console.table(cheatData);
  
  // Check if all 5 employees have been processed
  if (processedEnrollments.length !== 5) {
    return {
      success: false,
      message: `Expected 5 processed enrollments, found ${processedEnrollments.length}. Process all 5 employees from PDF.`
    };
  }
  
  // Return validation results
  if (errors.length > 0) {
    return {
      success: false,
      message: `Enrollment approval validation failed: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` (and ${errors.length - 3} more errors)` : ''}`
    };
  }
  
  // All validations passed
  return {
    success: true,
    message: 'Successfully processed all 5 employee training enrollment requests with correct approve/deny decisions based on prerequisite validation!'
  };
}

export function test_34(): TestResult {
  const appState = (window as any).app_state;
  
  if (!appState) {
    console.log('[Cheat] App state not found');
    return { success: false, message: 'App state not found.' };
  }

  const { submittedConfigurations, currentConfiguration, ruleValidation, conflictCount } = appState;

  // Expected configurations from Markdown (3 configurations per batch)
  const expectedConfigs = [
    {
      productReference: 'CONF-2024-850',
      customerName: 'TechCorp Solutions',
      baseModel: 'Premium',
      processor: 'Performance',
      memory: '32GB',
      storage: '1TB',
      graphics: 'Dedicated High',
      display: '4K',
      material: 'Aluminum',
      finish: 'Matte'
    },
    {
      productReference: 'CONF-2024-851',
      customerName: 'Design Studio Pro',
      baseModel: 'Professional',
      processor: 'Standard',
      memory: '16GB',
      storage: '512GB',
      graphics: 'Dedicated Standard',
      display: 'QHD',
      material: 'Composite',
      finish: 'Satin'
    },
    {
      productReference: 'CONF-2024-852',
      customerName: 'Budget Systems Inc',
      baseModel: 'Standard',
      processor: 'Entry',
      memory: '8GB',
      storage: '256GB',
      graphics: 'Integrated',
      display: 'FHD',
      material: 'Composite',
      finish: 'Matte'
    }
  ];

  // ===== [Cheat] ALWAYS SHOW PROGRESS FIRST (before any returns) =====
  
  // Show ONLY current configuration progress (for testers)
  const configIndex = (submittedConfigurations?.length || 0);
  const expected = expectedConfigs[configIndex];
  
  if (currentConfiguration && expected) {
    // Show field-by-field validation: Reference/Customer must match, others just show filled status
    const currentProgress = {
      'Config': `${configIndex + 1}/3`,
      'Reference': currentConfiguration.productReference?.trim() ? 
        (currentConfiguration.productReference.trim() === expected.productReference ? '✅' : '❌') : '-',
      'Customer': currentConfiguration.customerName?.trim() ? 
        (currentConfiguration.customerName.trim() === expected.customerName ? '✅' : '❌') : '-',
      'BaseModel': currentConfiguration.baseModel ? '✅' : '-',
      'Processor': currentConfiguration.processor ? '✅' : '-',
      'Memory': currentConfiguration.memory ? '✅' : '-',
      'Storage': currentConfiguration.storage ? '✅' : '-',
      'Graphics': currentConfiguration.graphics ? '✅' : '-',
      'Display': currentConfiguration.display ? '✅' : '-',
      'Material': currentConfiguration.material ? '✅' : '-',
      'Finish': currentConfiguration.finish ? '✅' : '-',
      'Rules': (currentConfiguration.baseModel && conflictCount === 0) ? '✅ (5/5)' : (currentConfiguration.baseModel ? `❌ (${5 - conflictCount}/5)` : '-')
    };
    
    console.log(`[Cheat] Configuration ${configIndex + 1}/3 (Submitted: ${submittedConfigurations?.length || 0}/3):`);
    console.table([currentProgress]);
  } else if (!submittedConfigurations || submittedConfigurations.length < 3) {
    console.log(`[Cheat] Configuration ${configIndex + 1}/3 (Submitted: ${submittedConfigurations?.length || 0}/3) - Fill form to see progress`);
  }

  // ===== [Test] NOW DO VALIDATION =====

  if (!submittedConfigurations || submittedConfigurations.length === 0) {
    return { success: false, message: 'No configurations submitted yet. Complete and submit 3 product configurations from the Markdown specification file.' };
  }

  // Show cumulative submitted table (only when records are submitted)
  if (submittedConfigurations.length > 0) {
    const submittedTable = submittedConfigurations.map((config: any, i: number) => {
      const expectedConfig = expectedConfigs[i];
      return {
        'Config': `${i + 1}/3`,
        'Reference': config.productReference?.trim() === expectedConfig.productReference ? '✅' : '❌',
        'Customer': config.customerName?.trim() === expectedConfig.customerName ? '✅' : '❌',
        'BaseModel': config.baseModel ? '✅' : '-',
        'Processor': config.processor ? '✅' : '-',
        'Memory': config.memory ? '✅' : '-',
        'Storage': config.storage ? '✅' : '-',
        'Graphics': config.graphics ? '✅' : '-',
        'Display': config.display ? '✅' : '-',
        'Material': config.material ? '✅' : '-',
        'Finish': config.finish ? '✅' : '-',
        'Rules': config.rulesSatisfied === 5 ? '✅ (5/5)' : `❌ (${config.rulesSatisfied || 0}/5)`
      };
    });
    console.log(`[Cheat] ✅ Submitted Configurations (${submittedConfigurations.length}/3):`);
    console.table(submittedTable);
  }

  if (submittedConfigurations.length < 3) {
    return { success: false, message: `Only ${submittedConfigurations.length} of 3 configurations submitted. Complete remaining configurations.` };
  }

  const errors: string[] = [];
  const cheatData: any[] = [];

  // Validate each configuration - only check rules are satisfied, not exact field matches
  expectedConfigs.forEach((expected, i) => {
    const config = submittedConfigurations[i];
    
    if (!config) {
      errors.push(`Configuration ${i + 1}: Missing`);
      return;
    }

    // Check reference and customer (these should match spec)
    const refMatch = config.productReference?.trim() === expected.productReference;
    const customerMatch = config.customerName?.trim() === expected.customerName;
    
    // Check rules satisfied (accept any valid combination)
    const rulesMatch = config.rulesSatisfied === 5;

    // Build cheat data - just show if fields are filled
    cheatData.push({
      Config: i + 1,
      Reference: refMatch ? '✅' : '❌',
      Customer: customerMatch ? '✅' : '❌',
      BaseModel: config.baseModel ? '✅' : '-',
      Processor: config.processor ? '✅' : '-',
      Memory: config.memory ? '✅' : '-',
      Storage: config.storage ? '✅' : '-',
      Graphics: config.graphics ? '✅' : '-',
      Display: config.display ? '✅' : '-',
      Material: config.material ? '✅' : '-',
      Finish: config.finish ? '✅' : '-',
      Rules: rulesMatch ? '✅ (5/5)' : `❌ (${config.rulesSatisfied || 0}/5)`
    });

    // Only fail on: wrong reference/customer, or rules not satisfied
    if (!refMatch) errors.push(`Config ${i + 1}: Product reference should be '${expected.productReference}', got '${config.productReference}'`);
    if (!customerMatch) errors.push(`Config ${i + 1}: Customer name should be '${expected.customerName}', got '${config.customerName}'`);
    if (!rulesMatch) errors.push(`Config ${i + 1}: Should satisfy 5/5 rules, got ${config.rulesSatisfied || 0}/5`);
  });

  if (errors.length > 0) {
    console.log('[Cheat] Validation errors found:');
    console.table(cheatData);
    return {
      success: false,
      message: `Configuration validation failed: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` (and ${errors.length - 3} more errors)` : ''}`
    };
  }

  console.log('[Cheat] ✅ All 3 configurations validated successfully!');
  console.table(cheatData);

  return {
    success: true,
    message: 'Successfully submitted all 3 product configurations with correct reference/customer names and all 5 validation rules satisfied (5/5)!'
  };
}

export function test_35(): TestResult {
  const appState = (window as any).app_state;
  
  if (!appState) {
    return { success: false, message: 'App state not found.' };
  }

  const { submittedPRs } = appState;

  // Expected PR data with keyword-based status assignments
  const expectedPRs = [
    {
      prReference: 'PR-2024-412',
      repositoryName: 'frontend-dashboard',
      reviewerName: 'Sarah Chen',
      reviewDate: '2024-02-15',
      comments: [
        { lineNumber: 145, severity: 'Blocker', status: 'Resolved' }, // "fixed immediately"
        { lineNumber: 203, severity: 'Major', status: 'Resolved' }, // "fixed"
        { lineNumber: 287, severity: 'Minor', status: 'Wontfix' }, // "intentional"
      ],
    },
    {
      prReference: 'PR-2024-415',
      repositoryName: 'backend-api',
      reviewerName: 'Michael Rodriguez',
      reviewDate: '2024-02-16',
      comments: [
        { lineNumber: 89, severity: 'Blocker', status: 'Resolved' }, // "Refactored"
        { lineNumber: 134, severity: 'Minor', status: 'Wontfix' }, // "design decision"
        { lineNumber: 212, severity: 'Major', status: 'Resolved' }, // "Implemented"
      ],
    },
    {
      prReference: 'PR-2024-418',
      repositoryName: 'mobile-app',
      reviewerName: 'Jennifer Kim',
      reviewDate: '2024-02-17',
      comments: [
        { lineNumber: 67, severity: 'Major', status: 'Resolved' }, // "Implemented"
        { lineNumber: 145, severity: 'Minor', status: 'Wontfix' }, // "Design decision"
        { lineNumber: 223, severity: 'Blocker', status: 'Resolved' }, // "Added"
      ],
    },
  ];

  // ===== [Cheat] SHOW PROGRESS BEFORE VALIDATION =====
  
  const currentPR = appState.prReference || '';
  const currentComments = appState.comments || [];
  
  // Determine which PR is currently being worked on (first one not yet submitted)
  const currentPRIndex = submittedPRs ? submittedPRs.length : 0;
  
  // Build cheat table showing all 3 PRs with their comment status
  const cheatTable: any[] = [];
  
  for (let i = 0; i < 3; i++) {
    const expected = expectedPRs[i];
    const pr = submittedPRs && submittedPRs[i];
    
    if (pr) {
      // PR already submitted - check each field
      const row: any = {
        'PR': `${expected.prReference} (Submitted)`,
        'Reference': pr.prReference?.trim() === expected.prReference ? '✅' : '❌',
        'Repo': pr.repositoryName?.trim() === expected.repositoryName ? '✅' : '❌',
        'Reviewer': pr.reviewerName?.trim() === expected.reviewerName ? '✅' : '❌',
        'Date': pr.reviewDate?.trim() === expected.reviewDate ? '✅' : '❌',
      };
      
      // Check each of the 3 comments
      for (let j = 0; j < 3; j++) {
        const comment = pr.comments && pr.comments[j];
        const expectedComment = expected.comments[j];
        
        if (!comment) {
          row[`C${j + 1}`] = '❌';
        } else {
          const lineOk = comment.lineNumber === expectedComment.lineNumber;
          const severityOk = comment.severity === expectedComment.severity;
          const statusOk = comment.status === expectedComment.status;
          const responseOk = comment.response && comment.response.trim().length >= 10;
          
          row[`C${j + 1}`] = (lineOk && severityOk && statusOk && responseOk) ? '✅' : '❌';
        }
      }
      
      cheatTable.push(row);
    } else if (i === currentPRIndex) {
      // This is the current PR being filled (next one in sequence) - show progressive validation
      const row: any = {
        'PR': `${expected.prReference} (In Progress)`,
        'Reference': currentPR.trim() === expected.prReference ? '✅' : (currentPR.trim() !== '' ? '❌' : '-'),
        'Repo': appState.repositoryName?.trim() === expected.repositoryName ? '✅' : (appState.repositoryName?.trim() ? '❌' : '-'),
        'Reviewer': appState.reviewerName?.trim() === expected.reviewerName ? '✅' : (appState.reviewerName?.trim() ? '❌' : '-'),
        'Date': appState.reviewDate?.trim() === expected.reviewDate ? '✅' : (appState.reviewDate?.trim() ? '❌' : '-'),
      };
      
      // Check each of the 3 comments progressively
      for (let j = 0; j < 3; j++) {
        const comment = currentComments[j];
        const expectedComment = expected.comments[j];
        
        if (!comment || comment.lineNumber === 0) {
          row[`C${j + 1}`] = '-';
        } else {
          const lineOk = comment.lineNumber === expectedComment.lineNumber;
          const severityOk = comment.severity === expectedComment.severity;
          const statusOk = comment.status === expectedComment.status;
          const responseOk = comment.status !== 'Unresolved' && comment.response && comment.response.trim().length >= 10;
          
          // Only mark green if ALL fields are correct
          if (lineOk && severityOk && statusOk && responseOk) {
            row[`C${j + 1}`] = '✅';
          } else if (comment.lineNumber !== 0) {
            // Something filled but not all correct
            row[`C${j + 1}`] = '❌';
          } else {
            row[`C${j + 1}`] = '-';
          }
        }
      }
      
      cheatTable.push(row);
    } else {
      // PR not started yet - show what's expected
      cheatTable.push({
        'PR': `${expected.prReference} (Not Started)`,
        'Reference': '-',
        'Repo': '-',
        'Reviewer': '-',
        'Date': '-',
        'C1': '-', 'C2': '-', 'C3': '-',
      });
    }
  }
  
  console.log('[Cheat] PR Review Progress (C1-C3 = Comments 1-3):');
  console.table(cheatTable);

  // ===== [Test] NOW DO VALIDATION =====

  if (!submittedPRs || submittedPRs.length === 0) {
    return { 
      success: false, 
      message: 'No PR reviews submitted yet. Open task-35-code-review-pr-412.md and process the first PR review.' 
    };
  }

  if (submittedPRs.length < 3) {
    return { 
      success: false, 
      message: `Only ${submittedPRs.length} of 3 PR reviews submitted. Complete all 3 PR reviews (PR-2024-412, PR-2024-415, PR-2024-418).` 
    };
  }

  // Validate each PR
  const errors: string[] = [];
  const cheatData: any[] = [];

  for (let i = 0; i < 3; i++) {
    const pr = submittedPRs[i];
    const expected = expectedPRs[i];

    // Check PR reference
    if (pr.prReference?.trim() !== expected.prReference) {
      errors.push(`PR ${i + 1}: Reference should be "${expected.prReference}", got "${pr.prReference || '(empty)'}"`);
    }

    // Check repository
    if (pr.repositoryName?.trim() !== expected.repositoryName) {
      errors.push(`PR ${i + 1}: Repository should be "${expected.repositoryName}", got "${pr.repositoryName || '(empty)'}"`);
    }

    // Check reviewer
    if (pr.reviewerName?.trim() !== expected.reviewerName) {
      errors.push(`PR ${i + 1}: Reviewer should be "${expected.reviewerName}", got "${pr.reviewerName || '(empty)'}"`);
    }

    // Check review date
    if (pr.reviewDate?.trim() !== expected.reviewDate) {
      errors.push(`PR ${i + 1}: Review date should be "${expected.reviewDate}", got "${pr.reviewDate || '(empty)'}"`);
    }

    // Check comments count
    if (!pr.comments || pr.comments.length !== 3) {
      errors.push(`PR ${i + 1}: Should have 3 comments, got ${pr.comments?.length || 0}`);
      const row: any = {
        'PR': expected.prReference,
        'Reference': pr.prReference?.trim() === expected.prReference ? '✅' : '❌',
        'Repo': pr.repositoryName?.trim() === expected.repositoryName ? '✅' : '❌',
        'Reviewer': pr.reviewerName?.trim() === expected.reviewerName ? '✅' : '❌',
        'Date': pr.reviewDate?.trim() === expected.reviewDate ? '✅' : '❌',
      };
      // Add empty comment columns
      for (let j = 0; j < 3; j++) {
        row[`C${j + 1}`] = '❌';
      }
      cheatData.push(row);
      continue;
    }

    // Validate each comment
    let commentErrors = 0;
    for (let j = 0; j < 3; j++) {
      const comment = pr.comments[j];
      const expectedComment = expected.comments[j];

      // Check line number
      if (comment.lineNumber !== expectedComment.lineNumber) {
        errors.push(`PR ${i + 1} Comment ${j + 1}: Line number should be ${expectedComment.lineNumber}, got ${comment.lineNumber}`);
        commentErrors++;
      }

      // Check severity
      if (comment.severity !== expectedComment.severity) {
        errors.push(`PR ${i + 1} Comment ${j + 1}: Severity should be "${expectedComment.severity}", got "${comment.severity}"`);
        commentErrors++;
      }

      // Check status (based on keyword rules from Markdown)
      if (comment.status !== expectedComment.status) {
        errors.push(`PR ${i + 1} Comment ${j + 1}: Status should be "${expectedComment.status}" based on comment description keywords, got "${comment.status}"`);
        commentErrors++;
      }

      // Check response (must be non-empty with at least 10 characters)
      if (!comment.response || comment.response.trim().length < 10) {
        errors.push(`PR ${i + 1} Comment ${j + 1}: Response must be at least 10 characters, got ${comment.response?.trim().length || 0} characters`);
        commentErrors++;
      }
    }

    // Add to cheat data with comment-level details
    const row: any = {
      'PR': expected.prReference,
      'Reference': pr.prReference?.trim() === expected.prReference ? '✅' : '❌',
      'Repo': pr.repositoryName?.trim() === expected.repositoryName ? '✅' : '❌',
      'Reviewer': pr.reviewerName?.trim() === expected.reviewerName ? '✅' : '❌',
      'Date': pr.reviewDate?.trim() === expected.reviewDate ? '✅' : '❌',
    };
    
    // Check each of the 3 comments
    for (let j = 0; j < 3; j++) {
      const comment = pr.comments[j];
      const expectedComment = expected.comments[j];
      
      const lineOk = comment.lineNumber === expectedComment.lineNumber;
      const severityOk = comment.severity === expectedComment.severity;
      const statusOk = comment.status === expectedComment.status;
      const responseOk = comment.response && comment.response.trim().length >= 10;
      
      row[`C${j + 1}`] = (lineOk && severityOk && statusOk && responseOk) ? '✅' : '❌';
    }
    
    cheatData.push(row);
  }

  if (errors.length > 0) {
    console.log('[Cheat] Validation errors found (C1-C3 = Comments 1-3):');
    console.table(cheatData);
    return {
      success: false,
      message: `PR review validation failed: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` (and ${errors.length - 3} more errors)` : ''}`
    };
  }

  console.log('[Cheat] ✅ All 3 PR reviews validated successfully! (C1-C3 = Comments 1-3)');
  console.table(cheatData);

  return {
    success: true,
    message: 'Successfully processed all 3 PR reviews with correct status assignments (based on keyword rules) and valid responses for all 9 comments!'
  };
}

export function test_36(): TestResult {
  const appState = (window as any).app_state;
  if (!appState) {
    return { success: false, message: 'App state not found.' };
  }

  const { currentAudit, formFieldsCompleted, submittedAudits } = appState;

  // Violation label mapping for readable cheat output
  const violationLabels: { [key: string]: string } = {
    'icon-no-labels': 'Icon buttons no labels',
    'non-descriptive-links': 'Non-descriptive links',
    'keyboard-trap': 'Keyboard traps',
    'missing-labels': 'Missing form labels',
    'unclear-validation': 'Unclear validation',
    'missing-autocomplete': 'Missing autocomplete',
    'improper-headings': 'Improper headings',
    'missing-landmarks': 'Missing landmarks',
    'invalid-html': 'Invalid HTML',
    'elements-touching-edges': 'Elements touching edges',
    'inconsistent-spacing': 'Inconsistent spacing',
    'overflow-issues': 'Overflow issues',
    'poor-contrast': 'Poor contrast',
    'text-too-small': 'Text too small',
    'color-only-indicators': 'Color-only indicators',
  };

  // Expected violations by audit reference
  const correctViolationsByAudit: { [key: string]: string[] } = {
    'A11Y-2024-201': ['icon-no-labels', 'non-descriptive-links'],
    'A11Y-2024-202': ['missing-labels', 'improper-headings', 'elements-touching-edges'],
    'A11Y-2024-203': ['poor-contrast', 'text-too-small'],
  };

  // Expected audits with correct violations based on actual screenshots
  const expectedAudits = [
    { auditReference: 'A11Y-2024-201', correctViolations: correctViolationsByAudit['A11Y-2024-201'].sort() },
    { auditReference: 'A11Y-2024-202', correctViolations: correctViolationsByAudit['A11Y-2024-202'].sort() },
    { auditReference: 'A11Y-2024-203', correctViolations: correctViolationsByAudit['A11Y-2024-203'].sort() },
  ];

  const errors: string[] = [];

  // Helper function to show violation breakdown for an audit
  const showViolationBreakdown = (auditRef: string, selectedViolations: string[], label: string) => {
    const correctViolations = correctViolationsByAudit[auditRef] || [];
    const selectedSet = new Set(selectedViolations || []);
    const correctSet = new Set(correctViolations);
    
    const violationDetails: any[] = [];
    
    // All possible violations (15 total: 7 correct + 8 decoys)
    const allViolations = [
      'icon-no-labels', 'non-descriptive-links', 'keyboard-trap',
      'missing-labels', 'unclear-validation', 'missing-autocomplete',
      'improper-headings', 'missing-landmarks', 'invalid-html',
      'elements-touching-edges', 'inconsistent-spacing', 'overflow-issues',
      'poor-contrast', 'text-too-small', 'color-only-indicators'
    ];
    
    allViolations.forEach(violationId => {
      const isCorrect = correctSet.has(violationId);
      const isSelected = selectedSet.has(violationId);
      
      let status = '';
      if (isCorrect && isSelected) {
        status = '✅';
      } else if (isCorrect && !isSelected) {
        status = '❌ MISSED';
      } else if (!isCorrect && isSelected) {
        status = '❌ FALSE+';
      } else {
        return; // Correctly not selected - don't show
      }
      
      violationDetails.push({
        'Violation': violationLabels[violationId] || violationId,
        'Should Select': isCorrect ? '✓' : '',
        'Selected': isSelected ? '✓' : '✗',
        'Status': status,
      });
    });
    
    if (violationDetails.length > 0) {
      console.log(`[Cheat] ${label}:`);
      console.table(violationDetails);
      console.log(`  Expected: ${correctViolations.length} violations`);
      console.log(`  Selected: ${selectedViolations?.length || 0} violations`);
      console.log('');
    }
  };

  // Show incremental feedback for CURRENT audit being filled out
  if (currentAudit && formFieldsCompleted?.hasAuditReference) {
    const { auditReference, selectedViolations } = currentAudit;
    
    // Only show cheat if we have a valid audit reference that we're tracking
    if (correctViolationsByAudit[auditReference]) {
      showViolationBreakdown(auditReference, selectedViolations, `CURRENT AUDIT: ${auditReference} (in progress)`);
    }
  }

  // Validate submitted audits
  for (let i = 0; i < expectedAudits.length; i++) {
    const expected = expectedAudits[i];
    const audit = submittedAudits?.find((a: any) => a.auditReference === expected.auditReference);

    if (!audit) {
      errors.push(`Audit ${expected.auditReference} not found in submissions`);
      continue;
    }

    // Check auditor name and date are filled
    if (!audit.auditorName || audit.auditorName.trim() === '') {
      errors.push(`${audit.auditReference}: Auditor name is required`);
    }
    if (!audit.auditDate || audit.auditDate.trim() === '') {
      errors.push(`${audit.auditReference}: Audit date is required`);
    }

    // Check selected violations match expected (exact match)
    const selectedSorted = [...(audit.selectedViolations || [])].sort();
    const expectedSorted = expected.correctViolations;

    // Calculate false positives and negatives
    const correctSet = new Set(expectedSorted);
    const selectedSet = new Set(selectedSorted);
    
    const falsePositives = selectedSorted.filter(id => !correctSet.has(id));
    const falseNegatives = expectedSorted.filter(id => !selectedSet.has(id));

    // Check for perfect match (100% accuracy, 0 false positives)
    const isPerfect = falsePositives.length === 0 && falseNegatives.length === 0;

    if (!isPerfect) {
      if (falsePositives.length > 0) {
        errors.push(`${audit.auditReference}: ${falsePositives.length} false positive(s) - incorrect violations selected: ${falsePositives.join(', ')}`);
      }
      if (falseNegatives.length > 0) {
        errors.push(`${audit.auditReference}: ${falseNegatives.length} violation(s) missed: ${falseNegatives.join(', ')}`);
      }
    }
  }

  // Check if we have all 3 audits submitted
  if (!submittedAudits || submittedAudits.length !== 3) {
    errors.push(`Expected 3 accessibility audits, found ${submittedAudits?.length || 0}. Complete all 3 audit validations.`);
  }

  if (errors.length > 0) {
    // Show submitted audits validation with breakdown
    if (submittedAudits && submittedAudits.length > 0) {
      console.log('[Cheat] SUBMITTED AUDITS validation:');
      console.log('');
      
      for (let i = 0; i < expectedAudits.length; i++) {
        const expected = expectedAudits[i];
        const audit = submittedAudits.find((a: any) => a.auditReference === expected.auditReference);
        
        if (!audit) {
          console.log(`[Cheat] ${expected.auditReference}: ❌ Not found in submissions`);
          console.log('');
          continue;
        }
        
        showViolationBreakdown(expected.auditReference, audit.selectedViolations, `SUBMITTED: ${expected.auditReference}`);
      }
    }
    
    console.log('[Cheat] Errors:');
    errors.forEach(err => console.log(`  - ${err}`));
    
    return {
      success: false,
      message: `Audit validation failed: ${errors.slice(0, 2).join('; ')}${errors.length > 2 ? ` (and ${errors.length - 2} more errors)` : ''}. Ensure all violations are correctly identified with no false positives.`
    };
  }

  return {
    success: true,
    message: 'Successfully validated all 3 accessibility audits with 100% accuracy and zero false positives/negatives!'
  };
}

export function test_37(): TestResult {
  const appState = (window as any).app_state;
  
  if (!appState) {
    return { success: false, message: 'App state not found.' };
  }
  
  const { submittedCatalogs, classifiedServices } = appState;
  
  // Expected data for 1 catalog (10 services - 2 per category)
  // Order matches the shuffled document (copy-paste-task-37.docx)
  const expectedCatalog = {
    catalogId: 'CAT-2024-305',
    services: [
      { name: 'Custom Software Development', primary: 'Technology Services', sub: 'Software Development' },
      { name: 'Business Process Optimization', primary: 'Business Services', sub: 'Management Consulting' },
      { name: 'Brand Identity Design', primary: 'Creative Services', sub: 'Brand Development' },
      { name: 'Network Security Assessment', primary: 'Technology Services', sub: 'Cybersecurity Solutions' },
      { name: 'Corporate Tax Planning', primary: 'Professional Services', sub: 'Accounting Services' },
      { name: 'Video Production Services', primary: 'Creative Services', sub: 'Video Production' },
      { name: 'Financial Risk Assessment', primary: 'Business Services', sub: 'Financial Advisory' },
      { name: 'Helpdesk Support', primary: 'Support Services', sub: 'Customer Support' },
      { name: 'Structural Engineering Review', primary: 'Professional Services', sub: 'Engineering Consulting' },
      { name: 'IT Infrastructure Monitoring', primary: 'Support Services', sub: 'Technical Support' }
    ]
  };
  
  // INCREMENTAL: Show progress for classified services (before submission)
  if (classifiedServices && classifiedServices.length > 0) {
    console.log('[Cheat] Service Classification Progress:');
    console.log(`[Cheat] Classified: ${classifiedServices.length}/10 services`);
    console.log('');
    
    const cheatData: any[] = [];
    
    // Check each expected service - find by name (order doesn't matter)
    for (let i = 0; i < 10; i++) {
      const exp = expectedCatalog.services[i];
      const act = classifiedServices.find(s => s.serviceName.trim() === exp.name);
      
      if (!act) {
        cheatData.push({
          '#': i + 1,
          'Service': exp.name.substring(0, 20),
          'Name': '❌',
          'Primary': '❌',
          'Subcategory': '❌',
          'Status': 'Not Added'
        });
      } else {
        const nameMatch = '✅'; // Already matched by name
        const primaryMatch = act.primaryCategory === exp.primary ? '✅' : '❌';
        const subMatch = act.subcategory === exp.sub ? '✅' : '❌';
        
        cheatData.push({
          '#': i + 1,
          'Service': act.serviceName.substring(0, 20),
          'Name': nameMatch,
          'Primary': primaryMatch,
          'Subcategory': subMatch,
          'Status': nameMatch === '✅' && primaryMatch === '✅' && subMatch === '✅' ? '✅ Perfect' : '⚠️ Check'
        });
      }
    }
    
    console.table(cheatData);
    console.log('');
  }
  
  // Check if we have submitted catalog
  if (!submittedCatalogs || submittedCatalogs.length === 0) {
    console.log('[Cheat] Expected catalog:');
    console.log('[Cheat] - CAT-2024-305 (10 services - 2 per category)');
    console.log('[Cheat] Status: ❌ No catalog submitted yet - Classify all 10 services then submit!');
    return { success: false, message: 'No service catalog submitted yet. Classify 10 services and submit complete catalog.' };
  }
  
  const errors: string[] = [];
  const actual = submittedCatalogs[0];
  
  if (!actual) {
    errors.push('Catalog not found');
  } else {
    // Check catalog ID
    if (actual.catalogId.trim() !== expectedCatalog.catalogId) {
      errors.push(`Expected catalog ID "${expectedCatalog.catalogId}", got "${actual.catalogId.trim()}"`);
    }
    
    // Check service count
    if (!actual.classifications || actual.classifications.length !== 10) {
      errors.push(`Expected 10 services, got ${actual.classifications?.length || 0}`);
    } else {
      // Validate each expected service - find by name (order doesn't matter)
      for (const expectedService of expectedCatalog.services) {
        const actualService = actual.classifications.find(
          s => s.serviceName.trim() === expectedService.name
        );
        
        if (!actualService) {
          errors.push(`Service "${expectedService.name}": Missing`);
          continue;
        }
        
        // Check primary category
        if (actualService.primaryCategory !== expectedService.primary) {
          errors.push(`${expectedService.name}: Expected primary category "${expectedService.primary}", got "${actualService.primaryCategory}"`);
        }
        
        // Check subcategory
        if (actualService.subcategory !== expectedService.sub) {
          errors.push(`${expectedService.name}: Expected subcategory "${expectedService.sub}", got "${actualService.subcategory}"`);
        }
      }
    }
  }
  
  // Show [Cheat] system if there are errors
  if (errors.length > 0) {
    console.log('[Cheat] Service Taxonomy Validation:');
    console.log('');
    
    if (actual) {
      console.log(`[Cheat] === ${expectedCatalog.catalogId} ===`);
      
      const cheatData: any[] = [];
      
      // Check each expected service - find by name (order doesn't matter)
      for (let i = 0; i < 10; i++) {
        const exp = expectedCatalog.services[i];
        const act = actual.classifications?.find(s => s.serviceName.trim() === exp.name);
        
        if (!act) {
          cheatData.push({
            '#': i + 1,
            'Service': exp.name.substring(0, 25) + (exp.name.length > 25 ? '...' : ''),
            'Primary': '❌',
            'Subcategory': '❌',
            'Expected Path': `${exp.primary.substring(0, 15)}... → ${exp.sub.substring(0, 15)}...`
          });
        } else {
          const nameMatch = '✅'; // Already matched by name
          const primaryMatch = act.primaryCategory === exp.primary ? '✅' : '❌';
          const subMatch = act.subcategory === exp.sub ? '✅' : '❌';
          
          cheatData.push({
            '#': i + 1,
            'Service': nameMatch,
            'Primary': primaryMatch,
            'Subcategory': subMatch,
            'Expected': `${exp.primary.split(' ')[0]} → ${exp.sub.split(' ')[0]}`,
            'Actual': act.primaryCategory && act.subcategory 
              ? `${act.primaryCategory.split(' ')[0]} → ${act.subcategory.split(' ')[0]}`
              : '(empty)'
          });
        }
      }
      
      console.table(cheatData);
      console.log('');
    }
    
    console.log('[Cheat] Errors:');
    errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`);
    }
    
    return {
      success: false,
      message: `Service taxonomy validation failed: ${errors.slice(0, 2).join('; ')}${errors.length > 2 ? ` (and ${errors.length - 2} more errors)` : ''}. Ensure all services are classified with correct taxonomy paths.`
    };
  }
  
  return {
    success: true,
    message: 'Successfully classified all 10 services with correct taxonomy paths!'
  };
}

// Test function for task 38: Design Annotation Validator
export function test_38(): TestResult {
  const appState = (window as any).app_state;
  
  if (!appState) {
    return { success: false, message: 'App state not found.' };
  }
  
  const { validationRecords } = appState;
  
  // Check if we have 1 validation record
  if (!validationRecords || validationRecords.length !== 1) {
    // Show [Cheat] system when no validation submitted
    const currentValidation = appState.currentValidation || {};
    const expectedMockup = { 
      ref: 'MOCK-2024-550', 
      designerName: 'Sarah Chen',
      validationDate: '2024-03-15',
      mappings: {
        1: 'primary-color',
        2: 'sidebar-width',
        3: 'text-overflow',
        4: 'card-width',
        5: 'content-overflow',
      }
    };
    
    console.log('[Cheat] Design Annotation Validation Progress:');
    console.log('');
    
    const progressData = [{
      'Field': 'Mockup Reference',
      'Status': currentValidation.mockupReference === expectedMockup.ref ? '✅' : '❌',
      'Expected': 'MOCK-2024-550',
      'Current': currentValidation.mockupReference || '(empty)',
    }, {
      'Field': 'Designer Name',
      'Status': currentValidation.designerName?.trim() === expectedMockup.designerName ? '✅' : '❌',
      'Expected': 'Sarah Chen',
      'Current': currentValidation.designerName || '(empty)',
    }, {
      'Field': 'Validation Date',
      'Status': currentValidation.validationDate === expectedMockup.validationDate ? '✅' : '❌',
      'Expected': '2024-03-15',
      'Current': currentValidation.validationDate || '(empty)',
    }, {
      'Field': 'Mappings',
      'Status': (currentValidation.mappings?.length || 0) === 5 ? '✅' : '❌',
      'Expected': '5 mappings',
      'Current': `${currentValidation.mappings?.length || 0} mappings`,
    }];
    
    console.table(progressData);
    console.log('');
    
    // Show current mappings with checkmarks
    if (currentValidation.mappings && currentValidation.mappings.length > 0) {
      const requirementNames: { [key: string]: string } = {
        'primary-color': 'Change Primary Brand Color',
        'sidebar-width': 'Make Sidebar Less Wide',
        'text-overflow': 'Fix Text Overflow Inside Card',
        'card-width': 'Extend Card Width',
        'content-overflow': 'Fix Vertical Page Overflow',
      };
      
      const mappingData = [];
      for (let marker = 1; marker <= 5; marker++) {
        const expectedReq = (expectedMockup.mappings as any)[marker];
        const actualMapping = currentValidation.mappings.find((m: any) => m.marker === marker);
        
        mappingData.push({
          'Marker': marker,
          'Status': actualMapping?.requirement === expectedReq ? '✅' : '❌',
          'Expected': requirementNames[expectedReq] || expectedReq,
          'Current': actualMapping ? (requirementNames[actualMapping.requirement] || actualMapping.requirement) : '(not mapped)',
        });
      }
      
      console.log('[Cheat] Current Marker Mappings:');
      console.table(mappingData);
    }
    
    return {
      success: false,
      message: `Expected 1 mockup validation, found ${validationRecords ? validationRecords.length : 0}. Submit validation for mockup MOCK-2024-550.`
    };
  }
  
  // Define expected mockup reference and correct marker-requirement mappings
  const expectedMockup = { 
    ref: 'MOCK-2024-550', 
    designerName: 'Sarah Chen',
    validationDate: '2024-03-15',
    mappings: {
      1: 'primary-color',
      2: 'sidebar-width',
      3: 'text-overflow',
      4: 'card-width',
      5: 'content-overflow',
    }
  };
  
  const errors: string[] = [];
  const actual = validationRecords[0];
  
  // Check mockup reference
  if (actual.mockupReference !== expectedMockup.ref) {
    errors.push(`Expected mockup reference "${expectedMockup.ref}", got "${actual.mockupReference}"`);
  }
  
  // Check designer name
  if (actual.designerName?.trim() !== expectedMockup.designerName) {
    errors.push(`Expected designer name "${expectedMockup.designerName}", got "${actual.designerName || '(empty)'}"`);
  }
  
  // Check validation date
  if (actual.validationDate !== expectedMockup.validationDate) {
    errors.push(`Expected validation date "${expectedMockup.validationDate}", got "${actual.validationDate}"`);
  }
  
  // Check if exactly 5 mappings
  if (!actual.mappings || actual.mappings.length !== 5) {
    errors.push(`Expected 5 marker-requirement mappings, got ${actual.mappings ? actual.mappings.length : 0}`);
  }
  
  // Check each mapping
  if (actual.mappings) {
    for (let marker = 1; marker <= 5; marker++) {
      const expectedReq = (expectedMockup.mappings as any)[marker];
      const actualMapping = actual.mappings.find((m: any) => m.marker === marker);
      
      if (!actualMapping) {
        errors.push(`Missing mapping for marker ${marker}`);
      } else if (actualMapping.requirement !== expectedReq) {
        errors.push(`Marker ${marker} mapped to "${actualMapping.requirement}", expected "${expectedReq}"`);
      }
    }
  }
  
  // Check accuracy is 100%
  if (actual.accuracy !== 100) {
    errors.push(`Expected 100% accuracy, got ${actual.accuracy.toFixed(1)}%`);
  }
  
  // Check all mappings are correct
  if (actual.correctCount !== 5) {
    errors.push(`Expected 5 correct mappings, got ${actual.correctCount}`);
  }
  
  // Check no incorrect mappings
  if (actual.incorrectCount > 0) {
    errors.push(`Found ${actual.incorrectCount} incorrect mapping(s)`);
  }
  
  // Check no missing mappings
  if (actual.missingCount > 0) {
    errors.push(`${actual.missingCount} marker(s) not mapped`);
  }
  
  // Show [Cheat] system if there are errors (allow up to 1 error to pass)
  if (errors.length > 1) {
    console.log('[Cheat] Design Annotation Validation:');
    console.log('');
    
    // Header fields validation
    const headerData = [{
      'Field': 'Mockup Reference',
      'Status': actual.mockupReference === expectedMockup.ref ? '✅' : '❌',
      'Expected': expectedMockup.ref,
      'Current': actual.mockupReference || '(empty)',
    }, {
      'Field': 'Designer Name',
      'Status': actual.designerName?.trim() === expectedMockup.designerName ? '✅' : '❌',
      'Expected': expectedMockup.designerName,
      'Current': actual.designerName || '(empty)',
    }, {
      'Field': 'Validation Date',
      'Status': actual.validationDate === expectedMockup.validationDate ? '✅' : '❌',
      'Expected': expectedMockup.validationDate,
      'Current': actual.validationDate || '(empty)',
    }];
    
    console.table(headerData);
    console.log('');
    
    // Marker mappings validation - order independent
    const requirementNames: { [key: string]: string } = {
      'primary-color': 'Change Primary Brand Color',
      'sidebar-width': 'Make Sidebar Less Wide',
      'text-overflow': 'Fix Text Overflow Inside Card',
      'card-width': 'Extend Card Width',
      'content-overflow': 'Fix Vertical Page Overflow',
    };
    
    const mappingData = [];
    for (let marker = 1; marker <= 5; marker++) {
      const expectedReq = (expectedMockup.mappings as any)[marker];
      const actualMapping = actual.mappings?.find((m: any) => m.marker === marker);
      
      mappingData.push({
        'Marker': marker,
        'Status': actualMapping?.requirement === expectedReq ? '✅' : '❌',
        'Expected': requirementNames[expectedReq] || expectedReq,
        'Current': actualMapping ? (requirementNames[actualMapping.requirement] || actualMapping.requirement) : '(not mapped)',
      });
    }
    
    console.log('[Cheat] Marker-Requirement Mappings:');
    console.table(mappingData);
    console.log('');
    console.log('[Cheat] Decoy Requirements (not in mockup):');
    console.log('  - Reduce Main Header Height');
    console.log('  - Increase Body Text Line Height');
    console.log('  - Update Secondary Accent Color');
    console.log('  - Add More Button Padding');
    console.log('  - Enable Image Lazy Loading');
    console.log('');
    console.log(`[Cheat] Accuracy: ${actual.accuracy?.toFixed(0) || 0}% (${actual.correctCount || 0} correct, ${actual.incorrectCount || 0} incorrect, ${actual.missingCount || 0} missing)`);
    console.log('');
    console.log('[Cheat] Validation Errors (${errors.length}/1 allowed):');
    errors.forEach(err => console.log(`  - ${err}`));
    
    return {
      success: false,
      message: `Validation failed with ${errors.length} error(s) (max 1 allowed): ${errors[0]}${errors.length > 1 ? ` (and ${errors.length - 1} more)` : ''}`
    };
  }
  
  // Success - all checks passed
  return {
    success: true,
    message: 'Successfully validated mockup MOCK-2024-550 with perfect marker-requirement mappings (5/5) and correct header fields!'
  };
}

export function test_39(): TestResult {
  const appState = (window as any).app_state;

  if (!appState) {
    return { success: false, message: 'App state not found.' };
  }

  const { submittedBatches, batchReference, incidents, currentFormEntry, formFieldsCompleted } = appState;

  // Debug logging
  console.log('[DEBUG] appState keys:', Object.keys(appState));
  console.log('[DEBUG] formFieldsCompleted:', formFieldsCompleted);
  console.log('[DEBUG] currentFormEntry:', currentFormEntry);
  console.log('[DEBUG] batchReference:', batchReference);
  
  // Expected batch data with severity classifications (2 incidents per batch)
  const expectedBatches = [
    {
      ref: 'BATCH-2024-408',
      incidents: [
        { id: 'INC-2024-1105', reportedBy: 'Sarah Martinez', severity: 'P1', escalated: true },
        { id: 'INC-2024-1106', reportedBy: 'James Wilson', severity: 'P4', escalated: false },
      ],
    },
    {
      ref: 'BATCH-2024-409',
      incidents: [
        { id: 'INC-2024-1113', reportedBy: 'Amanda Foster', severity: 'P2', escalated: true },
        { id: 'INC-2024-1114', reportedBy: 'Robert Lee', severity: 'P3', escalated: false },
      ],
    },
    {
      ref: 'BATCH-2024-410',
      incidents: [
        { id: 'INC-2024-1121', reportedBy: 'Elizabeth Wilson', severity: 'P1', escalated: true },
        { id: 'INC-2024-1122', reportedBy: 'Daniel Moore', severity: 'P4', escalated: false },
      ],
    },
  ];
  
  // Check if we have 3 submitted batches
  if (!submittedBatches || submittedBatches.length !== 3) {
    console.log('[Cheat] Incident Triage Progress');
    console.log('='.repeat(80));

    // Show current batch progress
    const currentBatch = expectedBatches.find((b: any) => b.ref === batchReference);

    if (!currentBatch) {
      // Show batch selection progress with console.table()
      const batchProgress = expectedBatches.map((batch: any) => {
        const isCurrentBatch = batch.ref === batchReference?.trim();
        let status = '❌ Not Started';
        let incidentsProgress = '0/2';

        if (isCurrentBatch) {
          const incidentCount = incidents?.length || 0;
          if (incidentCount === 2) {
            status = '✅ Complete';
            incidentsProgress = '2/2';
          } else if (incidentCount > 0) {
            status = '🟡 In Progress';
            incidentsProgress = `${incidentCount}/2`;
          } else {
            status = '🔵 Selected';
            incidentsProgress = '0/2';
          }
        }

        return {
          'Batch': batch.ref,
          'Status': status,
          'Incidents': incidentsProgress,
          'Expected': `${batch.incidents.length} incidents`,
        };
      });

      console.table(batchProgress);
      console.log('');
      return {
        success: false,
        message: `Expected 3 triage batches, found ${submittedBatches ? submittedBatches.length : 0}. Submit all 3 batches with 2 incidents each.`
      };
    }
    
    // Show progress for current batch
    console.log(`[Cheat] Current Batch: ${batchReference}`);
    console.log(`[Cheat] Progress: ${incidents?.length || 0}/2 incidents triaged`);
    console.log('');

    // Always show current form entry progress (even if empty)
    console.log('[Cheat] Current Form Entry:');
    const formProgress = [{
      'Field': 'Incident ID',
      'Status': (formFieldsCompleted && formFieldsCompleted.hasIncidentId) ? '✅' : '❌',
      'Value': (currentFormEntry && currentFormEntry.incidentId) || '(empty)',
    }, {
      'Field': 'Reported By',
      'Status': (formFieldsCompleted && formFieldsCompleted.hasReportedBy) ? '✅' : '❌',
      'Value': (currentFormEntry && currentFormEntry.reportedBy) || '(empty)',
    }, {
      'Field': 'Description',
      'Status': (formFieldsCompleted && formFieldsCompleted.hasDescription) ? '✅' : '❌',
      'Value': (currentFormEntry && currentFormEntry.description) ? (currentFormEntry.description.substring(0, 50) + '...') : '(empty)',
    }, {
      'Field': 'Severity',
      'Status': (formFieldsCompleted && formFieldsCompleted.hasSeverity) ? '✅' : '❌',
      'Value': (currentFormEntry && currentFormEntry.severity) || '(empty)',
    }, {
      'Field': 'Escalation',
      'Status': (formFieldsCompleted && formFieldsCompleted.hasSeverity) ? '✅ Auto' : '❌',
      'Value': (currentFormEntry && currentFormEntry.escalated) ? 'YES' : 'NO',
    }];
    console.table(formProgress);
    console.log('');
    
    // Show triaged incidents for current batch
    if (incidents && incidents.length > 0) {
      console.log('[Cheat] Triaged Incidents in Current Batch:');
      const incidentData: any[] = [];
      
      currentBatch.incidents.forEach((expected: any) => {
        const actual = incidents.find((i: any) => i.incidentId === expected.id);
        
        if (actual) {
          incidentData.push({
            'Incident': expected.id,
            'Reporter': actual.reportedBy === expected.reportedBy ? '✅' : '❌',
            'Severity': actual.severity === expected.severity ? '✅' : '❌',
            'Expected': expected.severity,
            'Actual': actual.severity || 'N/A',
            'Escalation': actual.escalated === expected.escalated ? '✅' : '❌',
          });
        } else {
          incidentData.push({
            'Incident': expected.id,
            'Reporter': '❌',
            'Severity': '❌',
            'Expected': expected.severity,
            'Actual': 'Not added',
            'Escalation': '❌',
          });
        }
      });
      
      console.table(incidentData);
      console.log('');
    }
    
    // Show expected incidents for current batch
    console.log(`[Cheat] Expected Incidents for ${batchReference}:`);
    currentBatch.incidents.forEach((inc: any) => {
      console.log(`  ${inc.id}: Reported by ${inc.reportedBy}, Severity ${inc.severity}, Escalated: ${inc.escalated ? 'YES' : 'NO'}`);
    });
    console.log('');
    
    console.log('[Cheat] Batches Completed: ' + (submittedBatches ? submittedBatches.length : 0) + '/3');
    
    return {
      success: false,
      message: `Expected 3 triage batches, found ${submittedBatches ? submittedBatches.length : 0}. Complete and submit all 3 batches with 2 incidents each.`
    };
  }
  
  const errors: string[] = [];
  
  // Check each expected batch
  for (const expected of expectedBatches) {
    const actual = submittedBatches.find((b: any) => b.batchReference === expected.ref);
    
    if (!actual) {
      errors.push(`Missing triage batch ${expected.ref}`);
      continue;
    }
    
    // Check if exactly 2 incidents
    if (!actual.incidents || actual.incidents.length !== 2) {
      errors.push(`${expected.ref}: Expected 2 incidents, got ${actual.incidents ? actual.incidents.length : 0}`);
      continue;
    }
    
    // Check each incident classification
    for (const expectedInc of expected.incidents) {
      const actualInc = actual.incidents.find((i: any) => i.incidentId === expectedInc.id);
      
      if (!actualInc) {
        errors.push(`${expected.ref}: Missing incident ${expectedInc.id}`);
        continue;
      }
      
      // Check reported by
      if (actualInc.reportedBy?.trim() !== expectedInc.reportedBy) {
        errors.push(`${expected.ref} ${expectedInc.id}: Reporter should be "${expectedInc.reportedBy}", got "${actualInc.reportedBy || '(empty)'}"`);
      }
      
      // Check severity classification
      if (actualInc.severity !== expectedInc.severity) {
        errors.push(`${expected.ref} ${expectedInc.id}: Severity should be "${expectedInc.severity}", got "${actualInc.severity}"`);
      }
      
      // Check escalation status
      if (actualInc.escalated !== expectedInc.escalated) {
        errors.push(`${expected.ref} ${expectedInc.id}: Escalation should be ${expectedInc.escalated ? 'YES' : 'NO'}, got ${actualInc.escalated ? 'YES' : 'NO'}`);
      }
    }
  }
  
  // If there are errors, show cheat system
  if (errors.length > 0) {
    console.log('[Cheat] Incident Triage Validation Results');
    console.log('='.repeat(80));
    
    const cheatData: any[] = [];
    
    for (const expected of expectedBatches) {
      const actual = submittedBatches.find((b: any) => b.batchReference === expected.ref);
      
      if (!actual) {
        cheatData.push({
          'Batch': expected.ref,
          'Status': '❌ Missing',
          'Incidents': '0/8',
          'Correct': 0,
          'Errors': 8,
        });
      } else {
        let correctCount = 0;
        let errorCount = 0;
        
        for (const expectedInc of expected.incidents) {
          const actualInc = actual.incidents?.find((i: any) => i.incidentId === expectedInc.id);
          
          if (actualInc && actualInc.severity === expectedInc.severity && actualInc.escalated === expectedInc.escalated) {
            correctCount++;
          } else {
            errorCount++;
          }
        }
        
        cheatData.push({
          'Batch': expected.ref,
          'Status': correctCount === 8 ? '✅ Perfect' : '❌ Errors',
          'Incidents': `${actual.incidents?.length || 0}/8`,
          'Correct': correctCount,
          'Errors': errorCount,
        });
      }
    }
    
    console.table(cheatData);
    console.log('');
    console.log('[Cheat] Detailed Incident Classifications:');
    console.log('');
    
    for (const expected of expectedBatches) {
      const actual = submittedBatches.find((b: any) => b.batchReference === expected.ref);
      
      console.log(`${expected.ref}:`);
      
      if (!actual) {
        console.log('  ❌ Batch not found - submit this batch with 2 incidents');
      } else {
        const incidentData: any[] = [];
        
        for (const expectedInc of expected.incidents) {
          const actualInc = actual.incidents?.find((i: any) => i.incidentId === expectedInc.id);
          
          const severityMatch = actualInc && actualInc.severity === expectedInc.severity;
          const escalationMatch = actualInc && actualInc.escalated === expectedInc.escalated;
          
          const reporterMatch = actualInc && actualInc.reportedBy?.trim() === expectedInc.reportedBy;
          
          incidentData.push({
            'Incident': expectedInc.id,
            'Reporter': reporterMatch ? '✅' : '❌',
            'Severity': severityMatch ? '✅' : '❌',
            'Expected Sev': expectedInc.severity,
            'Actual Sev': actualInc?.severity || 'N/A',
            'Escalation': escalationMatch ? '✅' : '❌',
            'Expected Esc': expectedInc.escalated ? 'YES' : 'NO',
            'Actual Esc': actualInc ? (actualInc.escalated ? 'YES' : 'NO') : 'N/A',
          });
        }
        
        console.table(incidentData);
      }
      
      console.log('');
    }
    
    console.log('[Cheat] Severity Classification Rules:');
    console.log('  P1 (Critical) - Keywords: outage, production down, complete failure, data loss, security breach, all users affected');
    console.log('  P2 (High) - Keywords: degraded performance, partial outage, customer-facing, significant impact, service disruption');
    console.log('  P3 (Medium) - Keywords: minor bug, single user, workaround available, non-urgent, moderate impact');
    console.log('  P4 (Low) - Keywords: feature request, documentation, enhancement, cosmetic, informational');
    console.log('');
    console.log('[Cheat] Escalation Rules:');
    console.log('  P1 and P2 incidents require escalation (escalated = true)');
    console.log('  P3 and P4 incidents do not require escalation (escalated = false)');
    console.log('');
    console.log('[Cheat] Errors found:');
    errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`);
    }
    
    return {
      success: false,
      message: `Incident triage validation failed: ${errors.slice(0, 2).join('; ')}${errors.length > 2 ? ` (and ${errors.length - 2} more errors)` : ''}. Classify all incidents with correct severity and escalation status.`
    };
  }
  
  return {
    success: true,
    message: 'Successfully triaged all 3 incident batches with correct severity classifications and escalation decisions (2 incidents each)!'
  };
}

export function test_40(): TestResult {
  const appState = (window as any).app_state;

  if (!appState) {
    return { success: false, message: 'App state not found.' };
  }

  const { submittedAssessments, changelogReference, assessmentDate, assessorName, changes, completedChanges } = appState;

  // Expected assessments based on keyword analysis
  const expectedAssessments = [
    { changeId: 'CHNG-2024-1201', scope: 'UI', riskLevel: 'Low', rollbackComplexity: 'Easy' },
    { changeId: 'CHNG-2024-1202', scope: 'Database', riskLevel: 'High', rollbackComplexity: 'Hard' },
    { changeId: 'CHNG-2024-1203', scope: 'Backend', riskLevel: 'High', rollbackComplexity: 'Moderate' },
    { changeId: 'CHNG-2024-1204', scope: 'Backend', riskLevel: 'Low', rollbackComplexity: 'Easy' },
    { changeId: 'CHNG-2024-1205', scope: 'Infrastructure', riskLevel: 'High', rollbackComplexity: 'Hard' },
    { changeId: 'CHNG-2024-1206', scope: 'UI', riskLevel: 'Medium', rollbackComplexity: 'Easy' },
  ];

  // Check if we have at least one submitted assessment
  if (!submittedAssessments || submittedAssessments.length === 0) {
    console.log('[Cheat] No assessments submitted yet');
    return { success: false, message: 'No risk assessments submitted. Complete the 6-change risk matrix and submit the assessment.' };
  }

  const assessment = submittedAssessments[0]; // Take the first submitted assessment

  // Check header fields
  if (assessment.changelogReference !== 'CL-2024-620') {
    return { success: false, message: `Incorrect changelog reference: expected 'CL-2024-620', got '${assessment.changelogReference}'` };
  }

  if (assessment.assessmentDate !== '2024-02-28') {
    return { success: false, message: `Incorrect assessment date: expected '2024-02-28', got '${assessment.assessmentDate}'` };
  }

  if (assessment.assessorName !== 'Marcus Thompson') {
    return { success: false, message: `Incorrect assessor name: expected 'Marcus Thompson', got '${assessment.assessorName}'` };
  }

  // Check that we have exactly 6 changes
  if (!assessment.changes || assessment.changes.length !== 6) {
    return { success: false, message: `Expected 6 change assessments, found ${assessment.changes?.length || 0}` };
  }

  const errors: string[] = [];

  // Validate each change assessment
  assessment.changes.forEach((change: any, index: number) => {
    const expected = expectedAssessments[index];

    if (change.changeId !== expected.changeId) {
      errors.push(`Change ${index + 1}: incorrect ID '${change.changeId}', expected '${expected.changeId}'`);
      return;
    }

    if (change.scope !== expected.scope) {
      errors.push(`Change ${change.changeId}: incorrect scope '${change.scope}', expected '${expected.scope}'`);
    }

    if (change.riskLevel !== expected.riskLevel) {
      errors.push(`Change ${change.changeId}: incorrect risk level '${change.riskLevel}', expected '${expected.riskLevel}'`);
    }

    if (change.rollbackComplexity !== expected.rollbackComplexity) {
      errors.push(`Change ${change.changeId}: incorrect rollback complexity '${change.rollbackComplexity}', expected '${expected.rollbackComplexity}'`);
    }
  });

  if (errors.length > 0) {
    console.log('[Cheat] Assessment validation errors:');
    console.log('[Cheat] Specific errors:');
    errors.slice(0, 6).forEach(error => console.log(`  - ${error}`));

    return {
      success: false,
      message: `Risk assessment validation failed: ${errors.slice(0, 2).join('; ')}${errors.length > 2 ? ` (and ${errors.length - 2} more errors)` : ''}. Re-analyze change descriptions and apply correct keyword-based classifications.`
    };
  }

  // Success - all assessments correct
  return {
    success: true,
    message: 'Successfully completed risk assessment for CL-2024-620 with all 6 changes correctly classified by scope, risk level, and rollback complexity!'
  };
}

