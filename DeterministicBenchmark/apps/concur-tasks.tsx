import React from 'react';
import TaskWrapper from '../src/TaskWrapper';
import ConcurApp from './concur';

type UiBenchTask = {
  id: string;
  instructions: string;
  test?: () => { success: boolean; message?: string };
  require_result_submission?: boolean;
  ux?: string;
};

function createTaskComponent(): React.FC {
  const C: React.FC = () => <ConcurApp />;
  return C;
}

const uiBenchTasks: UiBenchTask[] = [
  {
    id: 'concur-work-expenses-with-receipts',
    instructions: 'Create a report "Work Expenses" with business purpose "materials and repair costs", not travel related. Add expenses from the Target and East Repair. Attach their images and submit the report.',
    ux: 'Go to Create > Start a report > fill the fields > click Create Report > click Add Expense > add all expenses > click Attach Receipt for each expense > find the correct receipt and assign it > then Submit Report',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      // ========================
      // CHEAT SYSTEM - Real-time task progress feedback
      // ========================
      
      const reports = appState.reports || [];
      const submittedReports = appState.submittedReports || [];
      const allReports = [...reports, ...submittedReports];
      
      // Find Work Expenses report (either in progress or submitted)
      const workExpensesReport = allReports.find((report: any) => 
        report.name === 'Work Expenses' && 
        report.businessPurpose === 'materials and repair costs'
      );
      
      // Check for expenses in the report
      const targetExpenseInReport = workExpensesReport?.expenses?.find((expense: any) => 
        expense.vendorDetails.indexOf('TARGET') !== -1
      );
      const eastRepairExpenseInReport = workExpensesReport?.expenses?.find((expense: any) => 
        expense.vendorDetails.indexOf('EAST REPAIR') !== -1
      );
      
      // Enhanced receipt attachment tracking - use app state modal tracking for live cheat feedback
      const modalState = appState.modalState || {
        isOpen: false,
        selectedTab: 'select',
        selectedReceipt: null,
        selectedExpenseForReceipt: null
      };
      
      // Build modal context from app state instead of DOM observation
      let modalContext = {
        isOpen: modalState.isOpen,
        hasSelectTab: modalState.selectedTab === 'select',
        hasUploadTab: modalState.selectedTab === 'upload',
        selectedReceiptVisible: modalState.selectedReceipt !== null,
        attachButtonEnabled: modalState.selectedReceipt !== null,
        whichExpenseBeingAttached: null as 'target' | 'eastRepair' | null
      };
      
      // Determine which expense is being attached to based on the selected expense
      if (modalState.selectedExpenseForReceipt) {
        const vendorDetails = modalState.selectedExpenseForReceipt.vendorDetails || '';
        if (vendorDetails.indexOf('TARGET') !== -1) {
          modalContext.whichExpenseBeingAttached = 'target';
        } else if (vendorDetails.indexOf('EAST REPAIR') !== -1) {
          modalContext.whichExpenseBeingAttached = 'eastRepair';
        }
      }
      
      // Calculate progress state for cheat system
      const progressState = {
        reportCreated: !!workExpensesReport,
        reportName: workExpensesReport?.name === 'Work Expenses',
        businessPurpose: workExpensesReport?.businessPurpose === 'materials and repair costs',
        travelRelated: workExpensesReport?.travelRelated === false,
        targetAdded: !!targetExpenseInReport,
        eastRepairAdded: !!eastRepairExpenseInReport,
        targetReceiptAttached: targetExpenseInReport?.hasReceipt === true,
        eastRepairReceiptAttached: eastRepairExpenseInReport?.hasReceipt === true,
        modalContext: modalContext,
        reportSubmitted: submittedReports.some((report: any) => 
          report.name === 'Work Expenses' && report.businessPurpose === 'materials and repair costs'
        )
      };
      
      // Count completed steps
      const completedSteps = [
        progressState.reportCreated && progressState.reportName && progressState.businessPurpose,
        progressState.travelRelated,
        progressState.targetAdded,
        progressState.eastRepairAdded,
        progressState.targetReceiptAttached,
        progressState.eastRepairReceiptAttached,
        progressState.reportSubmitted
      ].filter(Boolean).length;
      
      const totalSteps = 7;
      
      // Create state string for anti-spam detection (including modal state)
      const currentState = JSON.stringify({
        completed: completedSteps,
        total: totalSteps,
        progress: progressState,
        modalState: modalState,
        currentReportId: workExpensesReport?.id || null,
        reportStatus: workExpensesReport?.status || null
      });
      
      // State-based cheat output (anti-spam)
      if (!((window as any).lastCheatState) || (window as any).lastCheatState !== currentState) {
        console.log(`[Cheat] Work Expenses Report Progress: ${completedSteps}/${totalSteps} steps completed`);
        
        // Step-by-step progress feedback
        if (!progressState.reportCreated) {
          console.log(`[Cheat] ❌ Step 1: Create a new expense report named "Work Expenses"`);
          console.log(`[Cheat]     - Click "Create" > "Expense Report"`);
          console.log(`[Cheat]     - Set Report Name: "Work Expenses"`);
          console.log(`[Cheat]     - Set Business Purpose: "materials and repair costs"`);
        } else if (!progressState.reportName || !progressState.businessPurpose) {
          console.log(`[Cheat] ⚠️  Step 1: Report created but needs correct details`);
          if (!progressState.reportName) console.log(`[Cheat]     - Report name should be "Work Expenses"`);
          if (!progressState.businessPurpose) console.log(`[Cheat]     - Business purpose should be "materials and repair costs"`);
        } else {
          console.log(`[Cheat] ✅ Step 1: Report "Work Expenses" created with correct business purpose`);
        }
        
        if (progressState.reportCreated && progressState.reportName && progressState.businessPurpose) {
          if (!progressState.travelRelated) {
            console.log(`[Cheat] ❌ Step 2: Set Travel Related to "No"`);
            console.log(`[Cheat]     - In report form, set "Travel related" dropdown to "No"`);
          } else {
            console.log(`[Cheat] ✅ Step 2: Travel Related set to "No"`);
          }
        }
        
        if (progressState.travelRelated) {
          if (!progressState.targetAdded) {
            console.log(`[Cheat] ❌ Step 3: Add Target expense to report`);
            console.log(`[Cheat]     - Click "Add Expense" and select Target expense (USD 21.29, Office Supplies)`);
          } else {
            console.log(`[Cheat] ✅ Step 3: Target expense added to report`);
          }
          
          if (!progressState.eastRepairAdded) {
            console.log(`[Cheat] ❌ Step 4: Add East Repair expense to report`);
            console.log(`[Cheat]     - Click "Add Expense" and select East Repair expense (USD 154.06, Vehicle Maintenance)`);
          } else {
            console.log(`[Cheat] ✅ Step 4: East Repair expense added to report`);
          }
        }
        
        if (progressState.targetAdded) {
          if (!progressState.targetReceiptAttached) {
            console.log(`[Cheat] ❌ Step 5: Attach receipt to Target expense`);
            if (modalContext.isOpen && modalContext.whichExpenseBeingAttached === 'target') {
              // Live guidance during Target receipt attachment
              console.log(`[Cheat]     📱 Receipt Modal Open - Attaching to Target expense:`);
              if (modalContext.hasSelectTab && !modalContext.selectedReceiptVisible) {
                console.log(`[Cheat]       - Click on Target receipt image to select it`);
              } else if (modalContext.selectedReceiptVisible && !modalContext.attachButtonEnabled) {
                console.log(`[Cheat]       - Receipt selected! Verifying selection...`);
              } else if (modalContext.attachButtonEnabled) {
                console.log(`[Cheat]       - Click "Attach Selected Receipt" button to confirm`);
              } else {
                console.log(`[Cheat]       - Choose a receipt from the available options`);
              }
            } else {
              console.log(`[Cheat]     - Click on Target expense and select "Attach Receipt"`);
            }
          } else {
            console.log(`[Cheat] ✅ Step 5: Target expense receipt attached`);
          }
        }
        
        if (progressState.eastRepairAdded) {
          if (!progressState.eastRepairReceiptAttached) {
            console.log(`[Cheat] ❌ Step 6: Attach receipt to East Repair expense`);
            if (modalContext.isOpen && modalContext.whichExpenseBeingAttached === 'eastRepair') {
              // Live guidance during East Repair receipt attachment
              console.log(`[Cheat]     📱 Receipt Modal Open - Attaching to East Repair expense:`);
              if (modalContext.hasSelectTab && !modalContext.selectedReceiptVisible) {
                console.log(`[Cheat]       - Click on East Repair receipt image to select it`);
              } else if (modalContext.selectedReceiptVisible && !modalContext.attachButtonEnabled) {
                console.log(`[Cheat]       - Receipt selected! Verifying selection...`);
              } else if (modalContext.attachButtonEnabled) {
                console.log(`[Cheat]       - Click "Attach Selected Receipt" button to confirm`);
              } else {
                console.log(`[Cheat]       - Choose a receipt from the available options`);
              }
            } else {
              console.log(`[Cheat]     - Click on East Repair expense and select "Attach Receipt"`);
            }
          } else {
            console.log(`[Cheat] ✅ Step 6: East Repair expense receipt attached`);
          }
        }
        
        if (progressState.targetReceiptAttached && progressState.eastRepairReceiptAttached) {
          if (!progressState.reportSubmitted) {
            console.log(`[Cheat] ❌ Step 7: Submit the report`);
            console.log(`[Cheat]     - Click "Submit Report" button to submit for approval`);
          } else {
            console.log(`[Cheat] ✅ Step 7: Report submitted successfully!`);
          }
        }
        
        // Show what's still needed
        const remainingSteps = [];
        if (!progressState.reportCreated || !progressState.reportName || !progressState.businessPurpose) {
          remainingSteps.push('Create "Work Expenses" report with correct details');
        }
        if (progressState.reportCreated && !progressState.travelRelated) {
          remainingSteps.push('Set Travel Related to "No"');
        }
        if (!progressState.targetAdded) {
          remainingSteps.push('Add Target expense');
        }
        if (!progressState.eastRepairAdded) {
          remainingSteps.push('Add East Repair expense');
        }
        if (progressState.targetAdded && !progressState.targetReceiptAttached) {
          if (modalContext.isOpen && modalContext.whichExpenseBeingAttached === 'target') {
            remainingSteps.push('Complete Target receipt attachment (modal open)');
          } else {
            remainingSteps.push('Attach Target receipt');
          }
        }
        if (progressState.eastRepairAdded && !progressState.eastRepairReceiptAttached) {
          if (modalContext.isOpen && modalContext.whichExpenseBeingAttached === 'eastRepair') {
            remainingSteps.push('Complete East Repair receipt attachment (modal open)');
          } else {
            remainingSteps.push('Attach East Repair receipt');
          }
        }
        if (progressState.targetReceiptAttached && progressState.eastRepairReceiptAttached && !progressState.reportSubmitted) {
          remainingSteps.push('Submit the report');
        }
        
        if (remainingSteps.length > 0 && completedSteps > 0) {
          console.log(`[Cheat] Still needed: ${remainingSteps.join(', ')}`);
        }
        
        // Special guidance for sequential receipt attachment
        if (progressState.targetReceiptAttached && !progressState.eastRepairReceiptAttached && !modalContext.isOpen) {
          console.log(`[Cheat] 👍 Target receipt attached! Now attach East Repair receipt to continue.`);
        }
        if (!progressState.targetReceiptAttached && progressState.eastRepairReceiptAttached && !modalContext.isOpen) {
          console.log(`[Cheat] 👍 East Repair receipt attached! Now attach Target receipt to continue.`);
        }
        
        if (completedSteps === totalSteps) {
          console.log(`[Cheat] 🎉 Task completed! Work Expenses report successfully created and submitted.`);
        }
        
        (window as any).lastCheatState = currentState;
      }
      
      // ========================
      // VALIDATION LOGIC (enhanced error messages)
      // ========================
      
      const submittedReportsOnly = appState.submittedReports || [];
      const allReportsForValidation = [...(appState.reports || []), ...submittedReportsOnly];
      
      // Look for Work Expenses report in submitted reports first
      const targetReport = submittedReportsOnly.find((report: any) => 
        report.name === 'Work Expenses' && 
        report.businessPurpose === 'materials and repair costs'
      );
      
      if (!targetReport) {
        // Check if there's a report with correct name but wrong business purpose
        const reportWithCorrectName = allReportsForValidation.find((report: any) => report.name === 'Work Expenses');
        if (reportWithCorrectName) {
          let isSubmitted = false;
          for (let i = 0; i < submittedReportsOnly.length; i++) {
            if (submittedReportsOnly[i] === reportWithCorrectName) {
              isSubmitted = true;
              break;
            }
          }
          const statusText = isSubmitted ? 'submitted' : 'draft';
          return { 
            success: false, 
            message: `Found ${statusText} report named "Work Expenses" but business purpose is "${reportWithCorrectName.businessPurpose}" instead of "materials and repair costs". Please edit the report to fix the business purpose and submit it.` 
          };
        }
        
        // Check if there's a report with correct business purpose but wrong name
        const reportWithCorrectPurpose = allReportsForValidation.find((report: any) => 
          report.businessPurpose === 'materials and repair costs'
        );
        if (reportWithCorrectPurpose) {
          let isSubmitted = false;
          for (let i = 0; i < submittedReportsOnly.length; i++) {
            if (submittedReportsOnly[i] === reportWithCorrectPurpose) {
              isSubmitted = true;
              break;
            }
          }
          const statusText = isSubmitted ? 'submitted' : 'draft';
          return { 
            success: false, 
            message: `Found ${statusText} report with business purpose "materials and repair costs" but name is "${reportWithCorrectPurpose.name}" instead of "Work Expenses". Please edit the report to fix the name and submit it.` 
          };
        }
        
        // Check if there's any draft report that matches
        const draftReport = (appState.reports || []).find((report: any) => 
          report.name === 'Work Expenses' && 
          report.businessPurpose === 'materials and repair costs'
        );
        if (draftReport) {
          return { 
            success: false, 
            message: `Found draft report "Work Expenses" with correct business purpose but it has not been submitted yet. Current status: ${draftReport.status}. Please submit the report to complete the task.` 
          };
        }
        
        // No matching report found at all
        const submittedCount = submittedReportsOnly.length;
        const draftCount = (appState.reports || []).length;
        return { 
          success: false, 
          message: `No report found with name "Work Expenses" and business purpose "materials and repair costs". Found ${submittedCount} submitted reports and ${draftCount} draft reports. Please create a new expense report with the correct name and business purpose, then submit it.` 
        };
      }
      
      if (targetReport.status !== 'Submitted') {
        return { 
          success: false, 
          message: `Report "Work Expenses" found but status is "${targetReport.status}" instead of "Submitted". Please submit the report to complete the task.` 
        };
      }
      
      // Check that it's not travel related (travelRelated is stored as boolean)
      if (targetReport.travelRelated === true) {
        return { 
          success: false, 
          message: `Report "Work Expenses" is marked as travel related, but it should not be. Please edit the report to set "Travel related" to "No" and resubmit.` 
        };
      }
      
      // Check for Target expense
      const targetExpense = targetReport.expenses.find((expense: any) => 
        expense.vendorDetails.indexOf('TARGET') !== -1
      );
      
      if (!targetExpense) {
        const expenseCount = targetReport.expenses.length;
        const expenseList = targetReport.expenses.map((exp: any) => exp.vendorDetails.split('\n')[0]).join(', ');
        return { 
          success: false, 
          message: `Target expense missing from submitted report. Report contains ${expenseCount} expenses: [${expenseList}]. Please add the Target expense (USD 21.29, Office Supplies) to the report.` 
        };
      }
      
      // Check for East Repair expense
      const eastRepairExpense = targetReport.expenses.find((expense: any) => 
        expense.vendorDetails.indexOf('EAST REPAIR') !== -1
      );
      
      if (!eastRepairExpense) {
        const expenseCount = targetReport.expenses.length;
        const expenseList = targetReport.expenses.map((exp: any) => exp.vendorDetails.split('\n')[0]).join(', ');
        return { 
          success: false, 
          message: `East Repair expense missing from submitted report. Report contains ${expenseCount} expenses: [${expenseList}]. Please add the East Repair expense (USD 154.06, Vehicle Maintenance and Repairs) to the report.` 
        };
      }
      
      // Check that both expenses have receipts attached
      if (!targetExpense.hasReceipt) {
        return { 
          success: false, 
          message: `Target expense (${targetExpense.amount}) is in the report but no receipt is attached. Please attach the Target receipt image to complete the expense documentation.` 
        };
      }
      
      if (!eastRepairExpense.hasReceipt) {
        return { 
          success: false, 
          message: `East Repair expense (${eastRepairExpense.amount}) is in the report but no receipt is attached. Please attach the East Repair receipt image to complete the expense documentation.` 
        };
      }
      
      // Verify expected amounts and types
      if (targetExpense.amount !== 'USD 21.29') {
        return { 
          success: false, 
          message: `Target expense amount mismatch. Expected USD 21.29 but found ${targetExpense.amount}. Please verify you selected the correct Target expense or check if the expense data was modified incorrectly.` 
        };
      }
      
      if (eastRepairExpense.amount !== 'USD 154.06') {
        return { 
          success: false, 
          message: `East Repair expense amount mismatch. Expected USD 154.06 but found ${eastRepairExpense.amount}. Please verify you selected the correct East Repair expense or check if the expense data was modified incorrectly.` 
        };
      }
      
      if (targetExpense.expenseType !== 'Office Supplies') {
        return { 
          success: false, 
          message: `Target expense type incorrect. Expected 'Office Supplies' but found '${targetExpense.expenseType}'. The Target expense should be categorized as Office Supplies.` 
        };
      }
      
      if (eastRepairExpense.expenseType !== 'Vehicle Maintenance and Repairs') {
        return { 
          success: false, 
          message: `East Repair expense type incorrect. Expected 'Vehicle Maintenance and Repairs' but found '${eastRepairExpense.expenseType}'. The East Repair expense should be categorized as Vehicle Maintenance and Repairs.` 
        };
      }
      
      return { 
        success: true, 
        message: `✅ Task completed successfully! Work Expenses report created with correct business purpose "materials and repair costs", marked as non-travel related, containing Target expense (USD 21.29) and East Repair expense (USD 154.06) both with receipts attached, and submitted for approval.` 
      };
    },
  },
  {
    id: 'concur-find-target-zip-code',
    instructions: 'What is the vendor zip code for the Target expense? Format as { "vendor_zip": number}',
    ux: 'In "Available Expenses" click "See All" and read from the "Vendor Details" column on the specific row',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      // ========================
      // CHEAT SYSTEM - Target zip code lookup guidance
      // ========================
      
      // Show guidance every 3 seconds or when submission state changes
      const hasSubmission = !!appState.submission;
      const submissionState = hasSubmission ? JSON.stringify(appState.submission) : 'none';
      const currentCheatState = JSON.stringify({
        hasSubmission,
        submissionState
      });
      
      if (!((window as any).lastCheatStateTask2) || (window as any).lastCheatStateTask2 !== currentCheatState || 
          (!((window as any).lastCheatLogTask2) || Date.now() - (window as any).lastCheatLogTask2 > 3000)) {
        
        console.log(`[Cheat] Expected: {"vendor_zip": 78154}`);
        
        if (!hasSubmission) {
          console.log(`[Cheat] Navigate to "Manage Expenses" and find the Target expense to verify this zip code`);
        } else {
          try {
            const sub = appState.submission;
            if (typeof sub === 'object' && sub !== null && !Array.isArray(sub)) {
              if ('vendor_zip' in sub) {
                const zipType = typeof sub.vendor_zip;
                const zipValue = sub.vendor_zip;
                const zipValueOk = zipValue === 78154;
                
                console.log(`[Cheat] Submission received: { "vendor_zip": ${zipValue} }`);
                console.log(`[Cheat] Zip code: ${zipValue} ${zipType === 'number' && zipValueOk ? '✅' : zipType === 'number' ? '❌ (wrong value)' : '❌ (should be number)'}`);
                
                if (zipType === 'number') {
                  if (zipValueOk) {
                    console.log(`[Cheat] Correct! ✅`);
                  } else {
                    console.log(`[Cheat] Type is correct but value is wrong - check against expected answer above`);
                  }
                }
              } else {
                console.log(`[Cheat] ❌ Submission missing "vendor_zip" field`);
                console.log(`[Cheat] Current submission: ${JSON.stringify(sub)}`);
              }
            } else {
              console.log(`[Cheat] ❌ Submission should be an object, got: ${typeof sub}`);
            }
          } catch (e) {
            console.log(`[Cheat] ❌ Error parsing submission`);
          }
        }
        
        (window as any).lastCheatStateTask2 = currentCheatState;
        (window as any).lastCheatLogTask2 = Date.now();
      }
      
      // ========================
      // VALIDATION LOGIC
      // ========================
      
      // Check if submission exists
      if (!appState.submission) {
        return { success: false, message: 'No submission found. Please submit your answer via window.app_state.submission.' };
      }
      
      const submission = appState.submission;
      
      // The correct zip code for Target expense is 78154 (as number)
      const expectedZipCode = 78154;
      
      // Validate the specific JSON format: { "vendor_zip": number }
      if (typeof submission !== 'object' || submission === null || Array.isArray(submission)) {
        return { success: false, message: 'Invalid submission format. Expected JSON object like { "vendor_zip": number }.' };
      }
      
      if (!('vendor_zip' in submission)) {
        return { success: false, message: 'Missing "vendor_zip" field in submission. Expected format: { "vendor_zip": number }.' };
      }
      
      const submittedZipCode = submission.vendor_zip;
      
      // Check if vendor_zip is a number
      if (typeof submittedZipCode !== 'number') {
        return { success: false, message: `"vendor_zip" must be a number. Got ${typeof submittedZipCode}: ${submittedZipCode}` };
      }
      
      // Check if it's the correct zip code
      if (submittedZipCode !== expectedZipCode) {
        return { success: false, message: `Incorrect zip code. Expected ${expectedZipCode}, but got: ${submittedZipCode}` };
      }
      
      return { success: true, message: `Correct! The Target vendor zip code is ${expectedZipCode}.` };
    },
  },
  {
    id: 'concur-find-largest-expense',
    instructions: 'What is the largest available expense? Format as {"vendor_name": str, "date": str, "total": number}',
    ux: 'In "Available Expenses" click "See All" and read from the "Vendor Details" table the task result',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      // ========================
      // CHEAT SYSTEM - Largest expense lookup guidance
      // ========================
      
      // Show guidance every 3 seconds or when submission state changes
      const hasSubmission = !!appState.submission;
      const submissionState = hasSubmission ? JSON.stringify(appState.submission) : 'none';
      const currentCheatState = JSON.stringify({
        hasSubmission,
        submissionState
      });
      
      if (!((window as any).lastCheatStateTask3) || (window as any).lastCheatStateTask3 !== currentCheatState || 
          (!((window as any).lastCheatLogTask3) || Date.now() - (window as any).lastCheatLogTask3 > 3000)) {
        
        console.log(`[Cheat] Expected: {"vendor_name": "EAST REPAIR INC.", "date": "11/02/2019", "total": 154.06}`);
        
        if (!hasSubmission) {
          console.log(`[Cheat] Navigate to "Manage Expenses" and compare all expense amounts to find the largest`);
        } else {
          try {
            const sub = appState.submission;
            if (typeof sub === 'object' && sub !== null && !Array.isArray(sub)) {
              const requiredFields = ['vendor_name', 'date', 'total'];
              const hasAllFields = requiredFields.every(field => field in sub);
              
              if (hasAllFields) {
                const { vendor_name, date, total } = sub;
                console.log(`[Cheat] Submission received:`);
                
                // Check vendor_name
                const vendorTypeOk = typeof vendor_name === 'string';
                const vendorValueOk = vendor_name === 'EAST REPAIR INC.';
                console.log(`[Cheat]   vendor_name: "${vendor_name}" ${vendorTypeOk && vendorValueOk ? '✅' : vendorTypeOk ? '❌ (wrong value)' : '❌ (should be string)'}`);
                
                // Check date
                const dateTypeOk = typeof date === 'string';
                const dateValueOk = date === '11/02/2019';
                console.log(`[Cheat]   date: "${date}" ${dateTypeOk && dateValueOk ? '✅' : dateTypeOk ? '❌ (wrong value)' : '❌ (should be string)'}`);
                
                // Check total
                const totalTypeOk = typeof total === 'number';
                const totalValueOk = total === 154.06;
                console.log(`[Cheat]   total: ${total} ${totalTypeOk && totalValueOk ? '✅' : totalTypeOk ? '❌ (wrong value)' : '❌ (should be number)'}`);
                
                if (vendorTypeOk && dateTypeOk && totalTypeOk) {
                  if (vendorValueOk && dateValueOk && totalValueOk) {
                    console.log(`[Cheat] All values are correct! ✅`);
                  } else {
                    console.log(`[Cheat] Format is correct but some values are wrong - check against expected answer above`);
                  }
                }
              } else {
                const missing = requiredFields.filter(field => !(field in sub));
                console.log(`[Cheat] ❌ Missing fields: ${missing.join(', ')}`);
                console.log(`[Cheat] Current submission: ${JSON.stringify(sub)}`);
              }
            } else {
              console.log(`[Cheat] ❌ Submission should be an object, got: ${typeof sub}`);
            }
          } catch (e) {
            console.log(`[Cheat] ❌ Error parsing submission`);
          }
        }
        
        (window as any).lastCheatStateTask3 = currentCheatState;
        (window as any).lastCheatLogTask3 = Date.now();
      }
      
      // ========================
      // VALIDATION LOGIC
      // ========================
      
      // Check if submission exists
      if (!appState.submission) {
        return { success: false, message: 'No submission found. Please submit your answer via window.app_state.submission.' };
      }
      
      const submission = appState.submission;
      
      // The largest expense is EAST REPAIR INC. with USD 154.06
      const expectedResponse = {
        vendor_name: 'EAST REPAIR INC.',
        date: '11/02/2019',
        total: 154.06
      };
      
      // Validate the specific JSON format: {"vendor_name": str, "date": str, "total": number}
      if (typeof submission !== 'object' || submission === null || Array.isArray(submission)) {
        return { success: false, message: 'Invalid submission format. Expected JSON object like {"vendor_name": str, "date": str, "total": number}.' };
      }
      
      // Check required fields
      const requiredFields = ['vendor_name', 'date', 'total'];
      for (const field of requiredFields) {
        if (!(field in submission)) {
          return { success: false, message: `Missing "${field}" field in submission. Expected format: {"vendor_name": str, "date": str, "total": number}.` };
        }
      }
      
      // Validate field types and values
      const { vendor_name, date, total } = submission;
      
      // Check vendor_name type and value
      if (typeof vendor_name !== 'string') {
        return { success: false, message: `"vendor_name" must be a string. Got ${typeof vendor_name}: ${vendor_name}` };
      }
      
      if (vendor_name !== expectedResponse.vendor_name) {
        return { success: false, message: `Incorrect vendor name. Expected "${expectedResponse.vendor_name}", but got: "${vendor_name}"` };
      }
      
      // Check date type and value
      if (typeof date !== 'string') {
        return { success: false, message: `"date" must be a string. Got ${typeof date}: ${date}` };
      }
      
      if (date !== expectedResponse.date) {
        return { success: false, message: `Incorrect date. Expected "${expectedResponse.date}", but got: "${date}"` };
      }
      
      // Check total type and value
      if (typeof total !== 'number') {
        return { success: false, message: `"total" must be a number. Got ${typeof total}: ${total}` };
      }
      
      if (total !== expectedResponse.total) {
        return { success: false, message: `Incorrect total amount. Expected ${expectedResponse.total}, but got: ${total}` };
      }
      
      return { success: true, message: `Correct! The largest available expense is ${expectedResponse.vendor_name} with $${expectedResponse.total} on ${expectedResponse.date}.` };
    },
  },
  {
    id: 'concur-create-ai-expense-report',
    instructions: 'Create an expense report that includes all the AI related expenses, call it "AI expenses"',
    ux: 'Go to Create > Start a report > fill the fields > click Create Report > click Add Expense > add AI expenses > click Attach Receipt for each expense > find the correct receipt and assign it > then Submit Report',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const reports = appState.reports || [];
      const submittedReports = appState.submittedReports || [];
      const allReportsAI = [...reports, ...submittedReports];
      
      // Look for a report named "AI expenses" that contains AI-related expenses
      // AI-related expense: OPENAI, LLC (id: 2)
      const aiExpenseId = 2;
      const expectedReportName = 'AI expenses';
      
      const reportWithAiExpenses = allReportsAI.find((report: any) => {
        return report.name === expectedReportName &&
               report.expenses && report.expenses.some((expense: any) => 
          expense.id === aiExpenseId || 
          (expense.vendorDetails && expense.vendorDetails.indexOf('OPENAI') !== -1) ||
          (expense.vendorDetails && expense.vendorDetails.toLowerCase().indexOf('ai') !== -1) ||
          (expense.expenseType && expense.expenseType.toLowerCase().indexOf('ai') !== -1) ||
          (expense.vendorDetails && expense.vendorDetails.toLowerCase().indexOf('artificial') !== -1 && expense.vendorDetails.toLowerCase().indexOf('intelligence') !== -1)
        );
      });
      
      if (!reportWithAiExpenses) {
        // Check if there's a report with the right name but no AI expenses
        const reportWithCorrectName = allReportsAI.find((report: any) => report.name === expectedReportName);
        if (reportWithCorrectName) {
          return { success: false, message: `Found report named "${expectedReportName}" but it does not contain AI-related expenses. Please add the OPENAI expense to the report.` };
        }
        
        // Check if there's a report with AI expenses but wrong name
        const reportWithAiButWrongName = allReportsAI.find((report: any) => {
          return report.expenses && report.expenses.some((expense: any) => 
            expense.id === aiExpenseId || (expense.vendorDetails && expense.vendorDetails.indexOf('OPENAI') !== -1)
          );
        });
        if (reportWithAiButWrongName) {
          return { success: false, message: `Found report with AI expenses but incorrect name. Expected report name: "${expectedReportName}", but found: "${reportWithAiButWrongName.name}"` };
        }
        
        return { success: false, message: `No expense report found named "${expectedReportName}" containing AI-related expenses. Please create a report called "${expectedReportName}" and add the OPENAI expense.` };
      }
      
      // Check if the report contains the OPENAI expense specifically
      const hasOpenAiExpense = reportWithAiExpenses.expenses.some((expense: any) => 
        expense.id === aiExpenseId || (expense.vendorDetails && expense.vendorDetails.indexOf('OPENAI') !== -1)
      );
      
      if (!hasOpenAiExpense) {
        return { success: false, message: 'Report found but does not contain the OPENAI expense. Please add the OPENAI, LLC expense to your report.' };
      }
      
      // Verify the OPENAI expense details
      const openAiExpense = reportWithAiExpenses.expenses.find((expense: any) => 
        expense.id === aiExpenseId || (expense.vendorDetails && expense.vendorDetails.indexOf('OPENAI') !== -1)
      );
      
      if (openAiExpense.amount !== 'USD 20.00') {
        return { success: false, message: `OPENAI expense amount mismatch. Expected USD 20.00, but found: ${openAiExpense.amount}` };
      }
      
      if (openAiExpense.expenseType !== 'Professional Subscriptions, Dues, Memberships') {
        return { success: false, message: `OPENAI expense type mismatch. Expected 'Professional Subscriptions, Dues, Memberships', but found: ${openAiExpense.expenseType}` };
      }
      
      // Check if the receipt/image is attached
      if (!openAiExpense.hasReceipt) {
        return { success: false, message: 'OPENAI expense does not have a receipt attached. Please attach the receipt image to the OPENAI expense.' };
      }
      
      // Check that the report is not travel related (travelRelated is stored as boolean)
      if (reportWithAiExpenses.travelRelated === true) {
        return { success: false, message: 'AI expenses report should not be travel related. Please set travel related to "No".' };
      }
      
      return { 
        success: true, 
        message: `Successfully created expense report "AI expenses" with AI-related expenses. Found OPENAI, LLC expense for USD 20.00 with receipt attached.` 
      };
    },
  },
  {
    id: 'concur-flight-duration-delta',
    instructions: 'Use the plane booking form, select Seattle (SEA) to London (LHR), on 8..12 Sep 2025, filter by carrier Delta, and return the duration of the flight. Format JSON as {"flight_duration_hours": int, "flight_duration_minutes": int}',
    ux: 'In the flight search form, select From: and pick the SEA option, in To: select LHR after scrolling down, in Dates: click the calendar icon, then click on start and end days. Search, and then apply filter on Carriers to Delta, and you have the result. Paste it into the Submit Results box in JSON with the requested format.',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { submission } = appState;
      
      // Simple one-line cheat
      if (!((window as any).lastCheatLogFlight) || Date.now() - (window as any).lastCheatLogFlight > 5000) {
        console.log(`[Cheat] {"flight_duration_hours": 11, "flight_duration_minutes": 15}`);
        (window as any).lastCheatLogFlight = Date.now();
      }
      
      if (!submission) {
        return { success: false, message: 'No result submitted. Please search for flights and submit the Delta flight duration.' };
      }
      
      // Check if submission is valid JSON with expected structure
      if (typeof submission !== 'object' || 
          !submission.hasOwnProperty('flight_duration_hours') || 
          !submission.hasOwnProperty('flight_duration_minutes')) {
        return { 
          success: false, 
          message: 'Invalid JSON format. Expected: {"flight_duration_hours": int, "flight_duration_minutes": int}' 
        };
      }
      
      // Validate data types
      if (!Number.isInteger(submission.flight_duration_hours) || !Number.isInteger(submission.flight_duration_minutes)) {
        return { 
          success: false, 
          message: 'Duration values must be integers. Got hours: ' + typeof submission.flight_duration_hours + ', minutes: ' + typeof submission.flight_duration_minutes 
        };
      }
      
      // The Delta flight SEA->LHR has total duration of "11h 15m"
      const expectedHours = 11;
      const expectedMinutes = 15;
      
      if (submission.flight_duration_hours !== expectedHours || submission.flight_duration_minutes !== expectedMinutes) {
        return { 
          success: false, 
          message: `Incorrect flight duration. Expected Delta flight duration: ${expectedHours}h ${expectedMinutes}m, but got: ${submission.flight_duration_hours}h ${submission.flight_duration_minutes}m` 
        };
      }
      
      return { 
        success: true, 
        message: 'Correct! Successfully found and submitted the Delta flight duration from Seattle to London.' 
      };
    },
  },
  {
    id: 'concur-flight-stops-analysis',
    instructions: 'Use the plane booking form, select Seattle (SEA) to London (LHR), on 8..12 Sep 2025, filter by carrier Air France, and return how many nonstop, 1 stop and 2 stop flights you have in results. Format JSON as {"nonstop": int, "one_stop": int, "two_stop": int}',
    ux: 'In the flight search form, select From and pick the SEA option, in To: select LHR after scrolling down, in Dates: click the calendar icon, then click on start and end days. On flight results page, use All Filters to apply stops filters and count the results for each category',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { submission } = appState;
      
      // Simple one-line cheat
      if (!((window as any).lastCheatLogStops) || Date.now() - (window as any).lastCheatLogStops > 5000) {
        console.log(`[Cheat] {"nonstop": 1, "one_stop": 2, "two_stop": 0}`);
        (window as any).lastCheatLogStops = Date.now();
      }
      
      if (!submission) {
        return { success: false, message: 'No result submitted. Please search for Air France flights and analyze the stop counts.' };
      }
      
      // Check if submission is valid JSON with expected structure
      if (typeof submission !== 'object' || 
          !submission.hasOwnProperty('nonstop') || 
          !submission.hasOwnProperty('one_stop') || 
          !submission.hasOwnProperty('two_stop')) {
        return { 
          success: false, 
          message: 'Invalid JSON format. Expected: {"nonstop": int, "one_stop": int, "two_stop": int}' 
        };
      }
      
      // Validate data types
      if (!Number.isInteger(submission.nonstop) || !Number.isInteger(submission.one_stop) || !Number.isInteger(submission.two_stop)) {
        return { 
          success: false, 
          message: 'Stop counts must be integers. Got nonstop: ' + typeof submission.nonstop + ', one_stop: ' + typeof submission.one_stop + ', two_stop: ' + typeof submission.two_stop 
        };
      }
      
      // Expected counts based on Air France SEA->LHR flights
      const expectedNonstop = 1;  // 1 nonstop flight
      const expectedOneStop = 2;  // 2 flights with 1 stop
      const expectedTwoStop = 0;  // 0 flights with 2 stops
      
      if (submission.nonstop !== expectedNonstop || submission.one_stop !== expectedOneStop || submission.two_stop !== expectedTwoStop) {
        return { 
          success: false, 
          message: `Incorrect stop counts. Expected nonstop: ${expectedNonstop}, 1 stop: ${expectedOneStop}, 2+ stops: ${expectedTwoStop}, but got nonstop: ${submission.nonstop}, 1 stop: ${submission.one_stop}, 2+ stops: ${submission.two_stop}` 
        };
      }
      
      return { 
        success: true, 
        message: 'Correct! Successfully analyzed Air France flight stop counts from Seattle to London.' 
      };
    },
  },
  {
    id: 'concur-flight-airlines-time-filtered',
    instructions: 'Use the plane booking form, select Seattle (SEA) to London (LHR), on 8..12 Sep 2025, departing time range 12:00 PM - 4:00 PM. Report the list of airlines in results. Response is JSON with format {"airlines": list[str]}',
    ux: 'In the flight search form, select From: SEA, To: LHR, set dates Sep 8-12, set departure time range 12:00 PM - 4:00 PM, search, then list all unique airlines from the results',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { submission } = appState;
      
      // Simple one-line cheat
      if (!((window as any).lastCheatLogAirlines) || Date.now() - (window as any).lastCheatLogAirlines > 5000) {
        console.log(`[Cheat] {"airlines": ["Air France", "Delta"]}`);
        (window as any).lastCheatLogAirlines = Date.now();
      }
      
      if (!submission) {
        return { success: false, message: 'No result submitted. Please search for flights with time constraints and list the airlines.' };
      }
      
      // Check if submission is valid JSON with expected structure
      if (typeof submission !== 'object' || !submission.hasOwnProperty('airlines')) {
        return { 
          success: false, 
          message: 'Invalid JSON format. Expected: {"airlines": ["airline1", "airline2", ...]}' 
        };
      }
      
      // Validate airlines is an array
      if (!Array.isArray(submission.airlines)) {
        return { 
          success: false, 
          message: 'Airlines must be an array. Got: ' + typeof submission.airlines 
        };
      }
      
      // Validate all elements are strings
      if (!submission.airlines.every((airline: any) => typeof airline === 'string')) {
        return { 
          success: false, 
          message: 'All airline names must be strings.' 
        };
      }
      
      // Expected airlines for SEA->LHR flights departing 12:00 PM - 4:00 PM (hours 12-16)
      // AF-2180: 2:30 PM, DL-0268: 12:20 PM
      const expectedAirlines = ['Air France', 'Delta'].sort();
      const submittedAirlines = [...new Set(submission.airlines)].sort(); // Remove duplicates and sort
      
      // Check if submitted airlines match expected ones
      const airlinesMatch = JSON.stringify(submittedAirlines) === JSON.stringify(expectedAirlines);
      
      if (!airlinesMatch) {
        return { 
          success: false, 
          message: `Incorrect airlines list. Expected: ${JSON.stringify(expectedAirlines)}, but got: ${JSON.stringify(submittedAirlines)}. Make sure to filter flights by departure time 12:00 PM - 4:00 PM.` 
        };
      }
      
      return { 
        success: true, 
        message: 'Correct! Successfully found airlines for SEA->LHR flights departing 12:00 PM - 4:00 PM.' 
      };
    },
  },
  {
    id: 'concur-flight-aircraft-details',
    instructions: 'Use the plane booking form, select Seattle (SEA) to London (LHR), on 8..12 Sep 2025. In search results filter by 0 stops and use Show Details and report on the aircraft manufacturer and model for the first flight. Format JSON as {"manufacturer": str, "model": str}',
    ux: 'In the flight search form, select SEA to LHR, pick any date in 8..12 Sep range. Search flights, then filter by "Nonstop" in the stops filter, check the "Show Details" checkbox to see flight details including aircraft information for the first flight listed. Submit the manufacturer and model as JSON.',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { submission } = appState;
      
      // Cheat system - show expected answer every 5 seconds
      if (!((window as any).lastCheatLogAircraft) || Date.now() - (window as any).lastCheatLogAircraft > 5000) {
        console.log(`[Cheat] {"manufacturer": "Boeing", "model": "787-9"}`);
        (window as any).lastCheatLogAircraft = Date.now();
      }
      
      if (!submission) {
        return { success: false, message: 'No result submitted. Please search for flights and submit the aircraft manufacturer and model.' };
      }
      
      // Check if submission is valid JSON with expected structure
      if (typeof submission !== 'object' || 
          !submission.hasOwnProperty('manufacturer') || 
          !submission.hasOwnProperty('model')) {
        return { 
          success: false, 
          message: 'Invalid JSON format. Expected: {"manufacturer": str, "model": str}' 
        };
      }
      
      // Validate data types
      if (typeof submission.manufacturer !== 'string') {
        return { 
          success: false, 
          message: 'Manufacturer must be a string.' 
        };
      }
      
      if (typeof submission.model !== 'string') {
        return { 
          success: false, 
          message: 'Model must be a string.' 
        };
      }
      
      // Expected aircraft details for the first SEA->LHR flight
      const expectedManufacturer = 'Boeing';
      const expectedModel = '787-9';
      
      // Check if submitted details match expected ones
      const manufacturerMatch = submission.manufacturer === expectedManufacturer;
      const modelMatch = submission.model === expectedModel;
      
      if (!manufacturerMatch || !modelMatch) {
        return { 
          success: false, 
          message: `Incorrect aircraft details. Expected: {"manufacturer": "${expectedManufacturer}", "model": "${expectedModel}"}, but got: {"manufacturer": "${submission.manufacturer}", "model": "${submission.model}"}. Make sure to check the "Show Details" box and look at the first flight listed.` 
        };
      }
      
      return { 
        success: true, 
        message: 'Correct! Successfully found aircraft details for the first SEA->LHR flight.' 
      };
    },
  },
];

const tasks = (uiBenchTasks as UiBenchTask[]).map((t, index) => ({
  id: index + 1,
  name: t.id,
  component: createTaskComponent(),
  task: t.instructions,
  ux: t.ux || (t.require_result_submission
    ? 'Submit the requested JSON via the Submit Results button'
    : 'Complete the Concur expense management interaction to satisfy the instructions'),
  test: t.test,
  fullWidth: true,
  requireResultSubmission: !!t.require_result_submission,
}));

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Concur', appPath: '/concur' };

const ConcurTasksApp: React.FC = () => {
  return (
    <TaskWrapper tasks={tasks} appName="Concur" appPath="/concur" />
  );
};

export default ConcurTasksApp;