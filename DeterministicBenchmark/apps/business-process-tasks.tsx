import React from 'react';
import TaskWrapper from '../src/TaskWrapper';
import Task1 from './business-process-tasks/task-1';
import Task2 from './business-process-tasks/task-2';
import Task3 from './business-process-tasks/task-3';
import Task4 from './business-process-tasks/task-4';
import Task5 from './business-process-tasks/task-5';
import Task6 from './business-process-tasks/task-6';
import Task7 from './business-process-tasks/task-7';
import Task8 from './business-process-tasks/task-8';
import Task9 from './business-process-tasks/task-9';
import Task10 from './business-process-tasks/task-10';

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
  const components = [Task1, Task2, Task3, Task4, Task5, Task6, Task7, Task8, Task9, Task10];
  const TaskComponent = components[index];
  if (!TaskComponent) {
    throw new Error(`Task component not found for index ${index}`);
  }
  return createTaskComponent(TaskComponent);
}

const uiBenchTasks: UiBenchTask[] = [
  {
    id: 'batch-processing-dashboard',
    instructions: 'Process 25 customer records in batches, handle connection timeouts by reconnecting and resuming from last successful position. Monitor progress indicators, detect timeout errors, click reconnect, verify resume position, and continue processing. All 25 records must be processed successfully with correct resume after timeout simulation.',
    ux: 'Monitor progress indicators, detect timeout errors, click reconnect, verify resume position, continue processing',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { processedRecords, totalRecords, connectionStatus, errorCount } = appState;
      
      if (!processedRecords || !totalRecords) {
        return { success: false, message: 'Processing data not found in app state.' };
      }
      
      // Check if all 25 records are processed (order doesn't matter)
      if (processedRecords.length !== 25) {
        return { 
          success: false, 
          message: `Only ${processedRecords.length} of 25 records processed. Complete all customer record processing.` 
        };
      }
      
      // Check if connection was restored after timeout
      if (connectionStatus !== 'connected') {
        return { 
          success: false, 
          message: `Connection status is ${connectionStatus}. Reconnect and resume processing after timeout.` 
        };
      }
      
      // Check if timeouts were handled (should have 2-3 timeout incidents)
      if (errorCount < 2 || errorCount > 3) {
        return { 
          success: false, 
          message: `Expected 2-3 timeout errors, found ${errorCount}. Timeout simulation may not have occurred properly.` 
        };
      }
      
      // Verify all records are marked as successfully processed
      const failedRecords = processedRecords.filter((record: any) => record.status !== 'success');
      if (failedRecords.length > 0) {
        return { 
          success: false, 
          message: `${failedRecords.length} records failed processing. All records must be successfully processed.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully processed all 25 customer records with correct timeout handling and automatic reconnection.` 
      };
    },
  },
  {
    id: 'vendor-invoice-parser',
    instructions: 'Process 12 invoices with mixed currency formats, normalize all amounts to consistent "1,234.56" decimal format. Parse different currency formats, apply normalization rules, validate converted amounts, and flag conversion errors. All 12 invoices must be normalized correctly with exact decimal formatting and no data loss in conversion.',
    ux: 'Parse different currency formats, apply normalization rules, validate converted amounts, flag conversion errors',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { invoices, totalInvoices, normalizedInvoices, allNormalized } = appState;
      
      if (!invoices || !totalInvoices) {
        return { success: false, message: 'Invoice data not found in app state.' };
      }
      
      // Check if all 12 invoices are processed
      if (normalizedInvoices.length !== 12) {
        // Console log next unfinished normalization and mistakes for human developers (only once per unique set)
        const unfinishedInvoices = invoices.filter((inv: any) => inv.normalizedAmount === '');
        const incorrectInvoices = normalizedInvoices.filter((inv: any) => {
          // Check if normalized amount has incorrect formatting - accept both with and without commas
          return !inv.normalizedAmount.match(/^\d{1,3}(,\d{3})*\.\d{2}$/) && 
                 !inv.normalizedAmount.match(/^\d+\.\d{2}$/);
        });
        
        const allIssues = [...unfinishedInvoices, ...incorrectInvoices];
        if (allIssues.length > 0) {
          const issueIds = allIssues.map((inv: any) => inv.id).sort().join(',');
          const lastLoggedKey = 'task2_issues_' + issueIds;
          
          if (!(window as any)[lastLoggedKey]) {
            console.log(`[Cheat] Next 3 issues to fix:`);
            allIssues.slice(0, 3).forEach((invoice: any, index: number) => {
              if (invoice.normalizedAmount === '') {
                console.log(`[Cheat] ${index + 1}. Invoice ${invoice.invoiceNumber}: "${invoice.originalAmount}" → needs normalization`);
                console.log(`[Cheat]    Target: "${invoice.expectedNormalized}"`);
              } else {
                console.log(`[Cheat] ${index + 1}. Invoice ${invoice.invoiceNumber}: "${invoice.originalAmount}" → "${invoice.normalizedAmount}" (incorrect format)`);
                console.log(`[Cheat]    Target: "${invoice.expectedNormalized}"`);
              }
            });
            if (allIssues.length > 3) {
              console.log(`[Cheat] ... and ${allIssues.length - 3} more issues`);
            }
            (window as any)[lastLoggedKey] = true;
          }
        }
        
        return { 
          success: false, 
          message: `Only ${normalizedInvoices.length} of 20 invoices normalized. Complete all invoice processing.` 
        };
      }
      
      // Check if all invoices have proper decimal formatting - accept both with and without commas
      const formattingErrors = [];
      for (const invoice of normalizedInvoices) {
        if (!invoice.normalizedAmount || 
            (!invoice.normalizedAmount.match(/^\d{1,3}(,\d{3})*\.\d{2}$/) && 
             !invoice.normalizedAmount.match(/^\d+\.\d{2}$/))) {
          formattingErrors.push(invoice);
        }
      }
      
      if (formattingErrors.length > 0) {
        // Console log formatting mistakes for human developers (only once per unique set)
        const errorIds = formattingErrors.map((inv: any) => inv.id).sort().join(',');
        const lastLoggedKey = 'task2_formatting_' + errorIds;
        
        if (!(window as any)[lastLoggedKey]) {
          console.log(`[Cheat] Next 3 formatting errors to fix:`);
          formattingErrors.slice(0, 3).forEach((invoice: any, index: number) => {
            console.log(`[Cheat] ${index + 1}. Invoice ${invoice.invoiceNumber}: "${invoice.originalAmount}" → "${invoice.normalizedAmount}" (incorrect format)`);
            console.log(`[Cheat]    Target: "${invoice.expectedNormalized}"`);
          });
          if (formattingErrors.length > 3) {
            console.log(`[Cheat] ... and ${formattingErrors.length - 3} more formatting errors`);
          }
          (window as any)[lastLoggedKey] = true;
        }
        
        return { 
          success: false, 
          message: `Invoice ${formattingErrors[0].invoiceNumber} has incorrect formatting: "${formattingErrors[0].normalizedAmount}". Use format "1,234.56".` 
        };
      }
      
      // Verify no data loss - check that normalized amounts are reasonable
      for (const invoice of normalizedInvoices) {
        const normalizedValue = parseFloat(invoice.normalizedAmount.replace(/,/g, ''));
        if (normalizedValue <= 0 || normalizedValue > 100000) {
          return { 
            success: false, 
            message: `Invoice ${invoice.invoiceNumber} has suspicious normalized amount: ${invoice.normalizedAmount}. Check conversion logic.` 
          };
        }
      }
      
      // Check completion status
      if (!allNormalized) {
        return { 
          success: false, 
          message: 'Not all invoices have been normalized. Complete processing for all 20 invoices.' 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully normalized all 20 invoices to standard "1,234.56" decimal format with no data loss.` 
      };
    },
  },
  {
    id: 'file-access-system',
    instructions: 'Navigate folder hierarchy to access 5 protected files, use error message hints to find alternative access paths. Click folders, encounter access denied errors, read error messages for retry hints, find alternative paths, and access target files. Successfully access all 5 target files using error message guidance.',
    ux: 'Click folders, encounter access denied errors, read error messages for retry hints, find alternative paths, access target files',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { accessedTargetFiles, totalTargetFiles, deniedPaths } = appState;
      
      
      if (!accessedTargetFiles || !totalTargetFiles) {
        return { success: false, message: 'File access data not found in app state.' };
      }
      
      // Check if all 5 target files are accessed
      if (accessedTargetFiles.length !== 5) {
        return { 
          success: false, 
          message: `Only ${accessedTargetFiles.length} of 5 target files accessed. Use error message hints to find alternative paths for all protected files.` 
        };
      }
      
      // Check if user encountered access denied errors (should have at least 5 attempts)
      if (deniedPaths.length < 5) {
        return { 
          success: false, 
          message: `Expected at least 5 access denied attempts, found ${deniedPaths.length}. Must attempt to access protected files to trigger error messages with hints.` 
        };
      }
      
      // Verify all target files are in the accessed list
      const { targetFiles } = appState;
      if (!targetFiles || targetFiles.length !== 5) {
        return { 
          success: false, 
          message: 'Target files not properly defined in app state.' 
        };
      }
      
      const missingFiles = targetFiles.filter((file: string) => !accessedTargetFiles.includes(file));
      if (missingFiles.length > 0) {
        return { 
          success: false, 
          message: `Missing target files: ${missingFiles.join(', ')}. Access all 5 protected files using alternative paths.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully accessed all 5 protected files using error message guidance and alternative access paths.` 
      };
    },
  },
  {
    id: 'customer-database-merger',
    instructions: 'Make judgment calls on consolidation decisions. Compare customer names, addresses, phone numbers, score similarity matches, select primary record, and merge duplicate data. Correctly identify all duplicate pairs with 100% accuracy and merge records preserving most complete data.',
    ux: 'Compare customer names, addresses, phone numbers, score similarity matches, select primary record, merge duplicate data',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { customers, potentialMatches, mergedCustomers, analysisComplete, totalCustomers } = appState;
      
      if (!customers || !totalCustomers) {
        return { success: false, message: 'Customer data not found in app state.' };
      }
      
      // Check if analysis has been completed
      if (!analysisComplete) {
        return { 
          success: false, 
          message: 'Duplicate analysis not completed. Click "Analyze for Duplicates" to find potential matches.' 
        };
      }
      
      // Check if potential matches were found (should find around 5 comparisons)
      if (potentialMatches.length < 5) {
        return { 
          success: false, 
          message: `Only ${potentialMatches.length} potential matches found. Expected to find around 5 comparisons. Check analysis algorithm.` 
        };
      }
      
      // Check if at least 5 matches have been processed (merged or marked as not match)
      const processedMatches = potentialMatches.filter((match: any) => 
        match.status === 'merged' || match.status === 'not_match'
      );
      
      if (processedMatches.length < 5) {
        // Console log next unprocessed matches for human developers (only once per unique set)
        const unprocessedMatches = potentialMatches.filter((match: any) => match.status === 'pending');
        if (unprocessedMatches.length > 0) {
          const matchIds = unprocessedMatches.map((m: any) => m.id).sort().join(',');
          const lastLoggedKey = 'task4_unprocessed_' + matchIds;
          
          if (!(window as any)[lastLoggedKey]) {
            console.log(`[Cheat] Next 3 unprocessed matches to review:`);
            unprocessedMatches.slice(0, 3).forEach((match: any, index: number) => {
              console.log(`[Cheat] ${index + 1}. Match #${match.id}: "${match.customer1.name}" vs "${match.customer2.name}" (${Math.round(match.confidence * 100)}% confidence)`);
              console.log(`[Cheat]    Phone match: ${match.phoneSimilarity === 1 ? 'YES' : 'NO'}`);
              console.log(`[Cheat]    Email similarity: ${Math.round(match.emailSimilarity * 100)}%`);
            });
            if (unprocessedMatches.length > 3) {
              console.log(`[Cheat] ... and ${unprocessedMatches.length - 3} more unprocessed matches`);
            }
            (window as any)[lastLoggedKey] = true;
          }
        }
        
        return { 
          success: false, 
          message: `Only ${processedMatches.length} of ${potentialMatches.length} matches processed. Review and merge/decline all potential duplicate pairs.` 
        };
      }
      
      // Check if at least 1 record has been merged (should merge the 2 duplicate groups)
      const mergedCount = potentialMatches.filter((match: any) => match.status === 'merged').length;
      if (mergedCount < 1) {
        return { 
          success: false, 
          message: `Only ${mergedCount} duplicate pairs merged. Expected to merge at least 1 of the 2 duplicate groups. Review high-confidence matches.` 
        };
      }
      
      // Check if merged customers were created
      if (mergedCustomers.length < 1) {
        return { 
          success: false, 
          message: `Only ${mergedCustomers.length} merged customer records created. Expected at least 1 merged record from duplicate pairs.` 
        };
      }
      
      // Verify merged customers have proper structure
      const invalidMerges = mergedCustomers.filter((customer: any) => 
        !customer.originalIds || !customer.mergedFrom || customer.originalIds.length !== 2
      );
      
      if (invalidMerges.length > 0) {
        return { 
          success: false, 
          message: `${invalidMerges.length} merged customers have invalid structure. Each merge should preserve original IDs and merged names.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully identified and merged ${mergedCount} duplicate customer pairs with 100% accuracy, preserving complete data in consolidated records.` 
      };
    },
  },
  {
    id: 'customer-record-anonymization',
    instructions: 'Review 30 customer records, identify and redact all PII (SSN, phone, email, addresses) before data export. Scan records for PII patterns, select sensitive fields, apply redaction (XXX-XX-1234), and validate anonymization completeness. All PII must be correctly identified and redacted, export table must contain no sensitive information while preserving business data.',
    ux: 'Scan records for PII patterns, select sensitive fields, apply redaction (XXX-XX-1234), validate anonymization completeness',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { emails, redactedItems, totalEmails } = appState;
      
      if (!emails || !totalEmails) {
        return { success: false, message: 'Email data not found in app state.' };
      }
      
      // Check if emails are present (allow 1 for testing or 5 for full task)
      if (totalEmails !== 5 && totalEmails !== 1) {
        return { 
          success: false, 
          message: `Expected 1 or 5 email documents, found ${totalEmails}. Check data generation.` 
        };
      }
      
      // Check if redaction decisions have been made
      if (!redactedItems || Object.keys(redactedItems).length === 0) {
        return { 
          success: false, 
          message: 'No redaction decisions made. Review email content and classify PII vs business information.' 
        };
      }
      
      // Check if ALL items have been classified by comparing against expected totals
      const totalDecisionsMade = Object.keys(redactedItems).length;
      const unsetDecisions = Object.values(redactedItems).filter(value => value === undefined).length;
      
      // For 1 email, we expect exactly 5 items to be classified
      const expectedTotalItems = totalEmails === 1 ? 5 : 27; // 5 for 1 email, 27 for 5 emails
      
      if (totalDecisionsMade < expectedTotalItems) {
        const remainingItems = expectedTotalItems - totalDecisionsMade;
        return { 
          success: false, 
          message: `${remainingItems} items still need classification. Review all highlighted items and click ✓ Not-PII or ✗ PII for each one. (${totalDecisionsMade}/${expectedTotalItems} completed)` 
        };
      }
      
      if (unsetDecisions > 0) {
        return { 
          success: false, 
          message: `${unsetDecisions} items still need classification. Review all highlighted items and click ✓ Not-PII or ✗ PII for each one.` 
        };
      }
      
      // Check if all PII items have been properly classified
      const redactedCount = Object.values(redactedItems).filter(value => value === true).length;
      const preservedCount = Object.values(redactedItems).filter(value => value === false).length;
      
      if (redactedCount === 0 && preservedCount === 0) {
        return { 
          success: false, 
          message: 'No classification decisions made. Click "✓ Not-PII" or "✗ PII" buttons to classify each item.' 
        };
      }
      
      // Check if the expected number of items have been classified
      const expectedTotal = redactedCount + preservedCount;
      
      // Adjust expectations based on number of emails
      if (totalEmails === 1) {
        // For 1 email: expect 3-5 PII items and 2-4 business items
        if (expectedTotal < 3) {
          return { 
            success: false, 
            message: `Expected at least 3 classification decisions for 1 email, found ${expectedTotal}. Review email content.` 
          };
        }
        const expectedPIIRange = [2, 6];
        const expectedBusinessRange = [1, 5];
        
        if (redactedCount < expectedPIIRange[0] || redactedCount > expectedPIIRange[1]) {
          return { 
            success: false, 
            message: `Expected ${expectedPIIRange[0]}-${expectedPIIRange[1]} PII items for redaction, found ${redactedCount}. Review your classifications.` 
          };
        }
        
        if (preservedCount < expectedBusinessRange[0] || preservedCount > expectedBusinessRange[1]) {
          return { 
            success: false, 
            message: `Expected ${expectedBusinessRange[0]}-${expectedBusinessRange[1]} business items for preservation, found ${preservedCount}. Review your classifications.` 
          };
        }
      } else {
        // For 5 emails: expect 20+ items total
        if (expectedTotal < 20) {
          return { 
            success: false, 
            message: `Expected more classification decisions. Found ${expectedTotal} total decisions. Review all emails for PII and business information.` 
          };
        }
        
        // Validate correctness by checking expected ratios
        // Based on the email content, we expect roughly 10-12 PII items and 15-17 business items
        const expectedPIIRange = [8, 15]; // Allow some flexibility
        const expectedBusinessRange = [12, 20];
        
        if (redactedCount < expectedPIIRange[0] || redactedCount > expectedPIIRange[1]) {
          return { 
            success: false, 
            message: `Expected ${expectedPIIRange[0]}-${expectedPIIRange[1]} PII items for redaction, found ${redactedCount}. Review your classifications.` 
          };
        }
        
        if (preservedCount < expectedBusinessRange[0] || preservedCount > expectedBusinessRange[1]) {
          return { 
            success: false, 
            message: `Expected ${expectedBusinessRange[0]}-${expectedBusinessRange[1]} business items for preservation, found ${preservedCount}. Review your classifications.` 
          };
        }
      }
      
      return { 
        success: true, 
        message: `Successfully classified ${redactedCount} PII items for redaction and ${preservedCount} business items for preservation. Email content anonymization completed.` 
      };
    },
  },
  {
    id: 'student-transcript-validation',
    instructions: 'Review 5 graduate school applications by tagging criteria demonstrated in academic records, interview notes, and faculty recommendations. For each student: 1) Academic Performance: Tag which prerequisites are met (CS101 ≥B+, MATH201 ≥C+, CS201 ≥B) and if GPA ≥3.0, 2) Interview Assessment: Identify demonstrated soft skills (Leadership, Communication, Problem-solving, Teamwork, Professionalism, Preparation, Enthusiasm), 3) Faculty Recommendation: Identify faculty endorsements (Exceptional Student, Strong Analytical Skills, Creative Thinking, Natural Leader, Top Performer, Reliable, Innovative). Read carefully and select only criteria with clear evidence in the text.',
    ux: 'Tag criteria from dropdowns based on evidence found in academic records, interview notes, and recommendation letters',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { transcripts, studentTags, reviewedStudents, totalStudents, criteriaOptions } = appState;
      
      if (!transcripts || !totalStudents) {
        return { success: false, message: 'Transcript data not found in app state.' };
      }
      
      // Check if all 5 students are present
      if (totalStudents !== 5) {
        return { 
          success: false, 
          message: `Expected 5 students, found ${totalStudents}. Check data generation.` 
        };
      }
      
      // Check if tagging has been completed for all students
      if (!studentTags || Object.keys(studentTags).length < 5) {
        const taggedCount = Object.keys(studentTags || {}).length;
        
            // Don't show cheat logs for completion check - only for accuracy errors
        
        return { 
          success: false, 
          message: `Only ${taggedCount} of 5 students have been tagged. Complete tagging for all students using the dropdown criteria.` 
        };
      }
      
      // Validate tagging accuracy - allow at most 1 mistake per candidate per tag set
      let totalErrors = 0;
      let totalTagSets = 0;
      const errorDetails: string[] = [];
      
      for (const student of transcripts as any[]) {
        const studentId = student.id;
        const actualTags = studentTags[studentId] || { academic: [], interview: [], recommendation: [] };
        const expectedTags = student.expectedTags;
        
        // Check each tag set (academic, interview, recommendation)
        for (const tagType of ['academic', 'interview', 'recommendation'] as const) {
          totalTagSets++;
          
          const actual = new Set(actualTags[tagType] || []);
          const expected = new Set(expectedTags[tagType] || []);
          
          // Calculate errors: missing expected tags + incorrect extra tags
          const missing = [...expected].filter(tag => !actual.has(tag));
          const extra = [...actual].filter(tag => !expected.has(tag));
          const errors = missing.length + extra.length;
          
          if (errors > 1) {
            totalErrors++;
            errorDetails.push(`${student.name} ${tagType}: ${errors} errors (missing: ${missing.join(', ') || 'none'}, extra: ${extra.join(', ') || 'none'})`);
            
            // Log for human testers (single-run) - only log first error found to reduce verbosity
            const firstErrorKey = 'task6_first_error_logged';
            if (!(window as any)[firstErrorKey]) {
              console.log(`[Cheat] 🔴 ${student.name} ${tagType} errors:`);
              if (missing.length > 0) {
                console.log(`[Cheat]   🔴 Missing: ${missing.join(', ')}`);
              }
              if (extra.length > 0) {
                console.log(`[Cheat]   🔴 Extra: ${extra.join(', ')}`);
              }
              console.log(`[Cheat]   Expected: ${[...expected].join(', ') || 'None'}`);
              console.log(`[Cheat]   Actual: ${[...actual].join(', ') || 'None'}`);
              (window as any)[firstErrorKey] = true;
            }
          }
        }
      }
      
      if (totalErrors > 0) {
        return { 
          success: false, 
          message: `Tagging accuracy too low: ${totalErrors}/${totalTagSets} tag sets have more than 1 error. Each student's academic, interview, and recommendation tags should have at most 1 mistake. First error: ${errorDetails[0]}` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully tagged all 5 students with acceptable accuracy. All tag sets have at most 1 error per student per category (academic, interview, recommendation).`
      };
    },
  },
  {
    id: 'transport-hub-directory',
    instructions: 'Navigate A-Z company listings in TransportHub directory, focus on companies from letters A-C only. Count buses (excluding shuttles) for each company in their fleet galleries. Only report companies with at least one bus. Navigate through alphabet letters A-C, browse company lists, click company names, navigate to fleet galleries, count bus photos, and record details for companies with buses. Format JSON response as {"company_name": bus_count, "company_name": bus_count, ...}, and use the Submit Results button to send it.',
    ux: 'Click alphabet letters A-C, browse company lists, click company names, navigate to fleet galleries, count buses only (not shuttles), record only companies with buses',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { visitedCompanies, companyFleetCounts, submission } = appState;
      
      // Only validate when submission data is present
      if (!submission || typeof submission !== 'object') {
        return { 
          success: false, 
          message: 'Waiting for JSON submission. Click Submit Results and paste the company data.' 
        };
      }
      
      // Verify submission only contains companies with buses (bus count > 0)
      const submissionCompanies = Object.keys(submission);
      for (const companyName of submissionCompanies) {
        const busCount = submission[companyName];
        
        // Check if it's an A-C company
        if (!/^[A-C]/i.test(companyName)) {
          return { 
            success: false, 
            message: `Company ${companyName} is not in A-C range. Only include A-C companies.` 
          };
        }
        
        // Check if bus count is valid and > 0
        if (typeof busCount !== 'number' || busCount <= 0 || busCount > 20) {
          return { 
            success: false, 
            message: `Company ${companyName} has invalid bus count: ${busCount}. Only include companies with at least one bus.` 
          };
        }
      }
      
      // Check that we have a reasonable number of A-C companies with buses
      if (submissionCompanies.length < 5) {
        return { 
          success: false, 
          message: `Only ${submissionCompanies.length} companies found with buses. Visit more A-C companies to find those with bus fleets.` 
        };
      }
      
      // Validate against expected bus counts from precomputed data
      // This is the critical validation - check if submitted counts match expected counts
      const expectedCounts: Record<string, number> = {
        "Atlas Transit": 4,
        "Andean Express": 5,
        "Aurora Lines": 3,
        "Brighton Express": 4,
        "Bordeaux Transit": 3,
        "Cambridge Express": 3,
        "Carpathian Express": 3,
        "Castilian Lines": 4,
        "Atlas Mountain Lines": 6,
        "Archipelago Express": 3,
        "Andalusian Sun Lines": 5,
        "Chianti Valley Express": 4,
        "Cossack Express": 4,
        "Balkan Express": 4
      };
      
      for (const companyName of submissionCompanies) {
        const submittedCount = submission[companyName];
        const expectedCount = expectedCounts[companyName];
        
        if (expectedCount === undefined) {
          return {
            success: false,
            message: `Company ${companyName} is not a valid A-C company with buses. Check the expected companies list.`
          };
        }
        
        if (submittedCount !== expectedCount) {
          return {
            success: false,
            message: `Company ${companyName} has incorrect bus count. Expected: ${expectedCount}, Submitted: ${submittedCount}.`
          };
        }
      }
      
      // Verify fleet counts match submission data (for companies that were actually visited)
      if (companyFleetCounts) {
        for (const companyName of submissionCompanies) {
          const fleetData = Object.values(companyFleetCounts).find((data: any) => data.name === companyName);
          if (fleetData && (fleetData as any).bus_count !== submission[companyName]) {
            return { 
              success: false, 
              message: `Company ${companyName} bus count mismatch between fleet data and submission.` 
            };
          }
        }
      }
      
      return { 
        success: true, 
        message: `Successfully found ${submissionCompanies.length} A-C companies with buses. JSON submission ready with company names and bus counts.` 
      };
    },
  },
  {
    id: 'accordion-form-management',
    instructions: 'Fill the form for "Primary delivery contact" with the following data: Name: "James Alpha", Email: "james.alpha@epic.com", Phone: "+1-565-3990", Extension: "900", Country: "USA", City: "Roslyn", BillingAddressLine1: "17 Main St", BillingAddressLine2: "Apt 4B", BillingCity: "New York", BillingState: "NY", BillingZipCode: "12001", ShippingAddressLine1: "456 Resurection St", ShippingAddressLine2: "Suite 12", ShippingCity: "Los Angeles", ShippingState: "CA", ShippingZipCode: "98579". After the form has been correctly completed press the "Save" button.',
    ux: 'Navigate accordion sections, expand/collapse panels, fill form fields with exact specified data, save primary form',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { primaryFormSaved, primaryFormData } = appState;
      
      // Expected data from the instructions
      const expectedData = {
        name: 'James Alpha',
        email: 'james.alpha@epic.com',
        phone: '+1-565-3990',
        extension: '900',
        country: 'USA',
        cityProvince: 'Roslyn',
        billingAddress1: '17 Main St',
        billingAddress2: 'Apt 4B',
        billingCity: 'New York',
        billingState: 'NY',
        billingZipCode: '12001',
        shippingAddress1: '456 Resurection St',
        shippingAddress2: 'Suite 12',
        shippingCity: 'Los Angeles',
        shippingState: 'CA',
        shippingZipCode: '98579'
      };
      
      // Check if primary form is saved
      if (!primaryFormSaved) {
        // [Cheat] console log for human testers - show progress and next steps
        if (primaryFormData) {
          const filledFields = Object.entries(primaryFormData).filter(([_, value]) => value && typeof value === 'string' && value.trim() !== '');
          const emptyFields = Object.entries(expectedData).filter(([key, _]) => !primaryFormData[key] || primaryFormData[key].trim() === '');
          const incorrectFields = Object.entries(expectedData).filter(([key, expected]) => primaryFormData[key] && primaryFormData[key] !== expected);
          
          const allIssues = [...emptyFields.map(([key, expected]) => ({ key, expected, actual: '', type: 'missing' })), 
                            ...incorrectFields.map(([key, expected]) => ({ key, expected, actual: primaryFormData[key], type: 'incorrect' }))];
          
          if (allIssues.length > 0) {
            const issueIds = allIssues.map(issue => `${issue.key}_${issue.type}`).sort().join(',');
            const lastLoggedKey = 'task8_issues_' + issueIds;
            
            if (!(window as any)[lastLoggedKey]) {
              console.log(`[Cheat] Form progress: ${filledFields.length}/${Object.keys(expectedData).length} fields filled`);
              console.log(`[Cheat] Next 3 issues to fix:`);
              allIssues.slice(0, 3).forEach((issue, index) => {
                if (issue.type === 'missing') {
                  console.log(`[Cheat] ${index + 1}. ${issue.key}: empty → needs "${issue.expected}"`);
                } else {
                  console.log(`[Cheat] ${index + 1}. ${issue.key}: "${issue.actual}" → should be "${issue.expected}"`);
                }
              });
              if (allIssues.length > 3) {
                console.log(`[Cheat] ... and ${allIssues.length - 3} more issues`);
              }
              console.log(`[Cheat] Remember to click Save button after filling all fields correctly`);
              (window as any)[lastLoggedKey] = true;
            }
          }
        } else {
          // No form data yet - show initial guidance
          const lastLoggedKey = 'task8_start_guidance';
          if (!(window as any)[lastLoggedKey]) {
            console.log(`[Cheat] Start by filling the Personal Information section:`);
            console.log(`[Cheat] Name: "James Alpha"`);
            console.log(`[Cheat] Email: "james.alpha@epic.com"`);
            console.log(`[Cheat] Then expand Billing Address and Shipping Address sections`);
            (window as any)[lastLoggedKey] = true;
          }
        }
        
        return { 
          success: false, 
          message: 'Primary delivery contact form not saved. Complete the form and click Save button.' 
        };
      }
      
      // Validate primary form data exists
      if (!primaryFormData) {
        return { 
          success: false, 
          message: 'Primary form data not found. Fill out the form completely before saving.' 
        };
      }
      
      // Check all fields match expected values exactly
      const allFields = Object.keys(expectedData);
      const incorrectFields = [];
      
      for (const field of allFields) {
        const expected = expectedData[field as keyof typeof expectedData];
        const actual = primaryFormData[field];
        if (actual !== expected) {
          incorrectFields.push({ field, expected, actual });
        }
      }
      
      // If there are errors, show them in console for human testers
      if (incorrectFields.length > 0) {
        const errorIds = incorrectFields.map(err => err.field).sort().join(',');
        const lastLoggedKey = 'task8_errors_' + errorIds;
        
        if (!(window as any)[lastLoggedKey]) {
          console.log(`[Cheat] 🔴 Form saved but has ${incorrectFields.length} incorrect values:`);
          incorrectFields.slice(0, 3).forEach((error, index) => {
            console.log(`[Cheat] ${index + 1}. ${error.field}: "${error.actual}" → should be "${error.expected}"`);
          });
          if (incorrectFields.length > 3) {
            console.log(`[Cheat] ... and ${incorrectFields.length - 3} more errors`);
          }
          console.log(`[Cheat] Fix the values and save again`);
          (window as any)[lastLoggedKey] = true;
        }
        
        const firstError = incorrectFields[0];
        return { 
          success: false, 
          message: `Incorrect value for ${firstError.field}. Expected: "${firstError.expected}", Got: "${firstError.actual}". Please use the exact values specified in the instructions.` 
        };
      }
      
      // Success! Log completion for human testers
      const successKey = 'task8_success_logged';
      if (!(window as any)[successKey]) {
        console.log(`[Cheat] ✅ SUCCESS: All fields correctly filled and form saved!`);
        console.log(`[Cheat] Personal: ${primaryFormData.name} (${primaryFormData.email})`);
        console.log(`[Cheat] Billing: ${primaryFormData.billingAddress1}, ${primaryFormData.billingCity}, ${primaryFormData.billingState}`);
        console.log(`[Cheat] Shipping: ${primaryFormData.shippingAddress1}, ${primaryFormData.shippingCity}, ${primaryFormData.shippingState}`);
        (window as any)[successKey] = true;
      }
      
      return { 
        success: true, 
        message: `Successfully completed Primary delivery contact form with exact specified data: ${primaryFormData.name} (${primaryFormData.email}) with all address details correctly filled.` 
      };
    },
  },
  {
    id: 'multi-step-transport-form',
    instructions: 'Fill the Request Transport Offer form step by step with the following data: Full Name: "Greg Barkley", Email: "gregory.barkley.1976@example.com", Phone: "+1 555-163-6543", Company: "Greg\'s Bakery", Country: "USA", Origin: "New York", Destination: "Sacramento", Weight: "10", Length: "50", Width: "40", Height: "30", Service Type: "express", Comments: "Handle with care.". Click Next after completing each step, and Submit at the final step. After submitting wait for the confirmation popup to appear and close it.',
    ux: 'Navigate through multi-step form, fill required fields, validate each step, proceed with Next buttons, submit form, handle confirmation popup',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { currentStep, completedSteps, isSubmitted, showConfirmation, formData } = appState;
      
      // Expected data from the instructions
      const expectedData = {
        fullName: 'Greg Barkley',
        email: 'gregory.barkley.1976@example.com',
        phone: '+1 555-163-6543',
        company: "Greg's Bakery",
        country: 'USA',
        origin: 'New York',
        destination: 'Sacramento',
        weight: '10',
        length: '50',
        width: '40',
        height: '30',
        serviceType: 'express',
        comments: 'Handle with care.'
      };
      
      // Check if all steps are completed
      if (completedSteps.length < 3) {
        // [Cheat] console log for human testers - show progress and next steps
        if (formData) {
          const step1Fields = ['fullName', 'email', 'phone', 'country'];
          const step2Fields = ['origin', 'destination', 'weight', 'length', 'width', 'height'];
          const step3Fields = ['serviceType'];
          
          const getStepProgress = (fields: string[]) => {
            const filled = fields.filter(field => formData[field] && formData[field].trim() !== '');
            const incorrect = fields.filter(field => formData[field] && formData[field] !== expectedData[field as keyof typeof expectedData]);
            return { filled: filled.length, total: fields.length, incorrect };
          };
          
          const step1Progress = getStepProgress(step1Fields);
          const step2Progress = getStepProgress(step2Fields);
          const step3Progress = getStepProgress(step3Fields);
          
          const progressKey = `task9_progress_${currentStep}_${completedSteps.length}`;
          if (!(window as any)[progressKey]) {
            console.log(`[Cheat] Multi-step form progress: Step ${currentStep}/3`);
            console.log(`[Cheat] Step 1 (Contact): ${step1Progress.filled}/${step1Progress.total} fields filled ${completedSteps.includes(1) ? '✅' : '⏳'}`);
            console.log(`[Cheat] Step 2 (Package): ${step2Progress.filled}/${step2Progress.total} fields filled ${completedSteps.includes(2) ? '✅' : '⏳'}`);
            console.log(`[Cheat] Step 3 (Review): ${step3Progress.filled}/${step3Progress.total} fields filled ${completedSteps.includes(3) ? '✅' : '⏳'}`);
            
            if (currentStep === 1 && step1Progress.filled < step1Progress.total) {
              const missing = step1Fields.filter(field => !formData[field] || formData[field].trim() === '');
              console.log(`[Cheat] Next required fields: ${missing.slice(0, 3).join(', ')}`);
            } else if (currentStep === 2 && step2Progress.filled < step2Progress.total) {
              const missing = step2Fields.filter(field => !formData[field] || formData[field].trim() === '');
              console.log(`[Cheat] Next required fields: ${missing.slice(0, 3).join(', ')}`);
            } else if (currentStep === 3 && !formData.serviceType) {
              console.log(`[Cheat] Select service type: "express"`);
            }
            
            (window as any)[progressKey] = true;
          }
        }
        
        return { 
          success: false, 
          message: `Only ${completedSteps.length} of 3 steps completed. Complete all steps: Contact Information, Package Details, and Review & Submit.` 
        };
      }
      
      // Check if form is submitted
      if (!isSubmitted) {
        return { 
          success: false, 
          message: 'Form not submitted. Click Submit at the final step after completing all required fields.' 
        };
      }
      
      // Check if confirmation popup appeared and was closed
      if (showConfirmation) {
        return { 
          success: false, 
          message: 'Confirmation popup is still open. Close the confirmation popup to complete the task.' 
        };
      }
      
      // Validate the specific data was entered correctly
      const criticalFields = ['fullName', 'email', 'phone', 'company', 'country', 'origin', 'destination', 'weight', 'length', 'width', 'height', 'serviceType'];
      const incorrectFields = [];
      
      for (const field of criticalFields) {
        const expected = expectedData[field as keyof typeof expectedData];
        const actual = formData[field];
        if (actual !== expected) {
          incorrectFields.push({ field, expected, actual });
        }
      }
      
      // If there are errors, show them in console for human testers
      if (incorrectFields.length > 0) {
        const errorIds = incorrectFields.map(err => err.field).sort().join(',');
        const lastLoggedKey = 'task9_errors_' + errorIds;
        
        if (!(window as any)[lastLoggedKey]) {
          console.log(`[Cheat] 🔴 Form submitted but has ${incorrectFields.length} incorrect values:`);
          incorrectFields.slice(0, 3).forEach((error, index) => {
            console.log(`[Cheat] ${index + 1}. ${error.field}: "${error.actual}" → should be "${error.expected}"`);
          });
          if (incorrectFields.length > 3) {
            console.log(`[Cheat] ... and ${incorrectFields.length - 3} more errors`);
          }
          (window as any)[lastLoggedKey] = true;
        }
        
        const firstError = incorrectFields[0];
        return { 
          success: false, 
          message: `Incorrect value for ${firstError.field}. Expected: "${firstError.expected}", Got: "${firstError.actual}". Please use the exact values specified in the instructions.` 
        };
      }
      
      // Success! Log completion for human testers
      const successKey = 'task9_success_logged';
      if (!(window as any)[successKey]) {
        console.log(`[Cheat] ✅ SUCCESS: Transport form completed and submitted!`);
        console.log(`[Cheat] Contact: ${formData.fullName} (${formData.email})`);
        console.log(`[Cheat] Transport: ${formData.origin} → ${formData.destination}`);
        console.log(`[Cheat] Package: ${formData.weight}kg, ${formData.length}x${formData.width}x${formData.height}cm`);
        console.log(`[Cheat] Service: ${formData.serviceType}`);
        (window as any)[successKey] = true;
      }
      
      return { 
        success: true, 
        message: `Successfully completed transport offer request form with correct data. Form submitted and confirmation popup closed.` 
      };
    },
  },
  {
    id: 'paginated-table-extraction',
    instructions: 'Extract all the data from the "Multipage table". Navigate through all pages using the "Next page" button, extract data from each page, then output the result in the following JSON format: [{"VIN": str, "Make": str, "Model": str, "Year": str}], and use the Submit Results button to send it.',
    ux: 'Navigate through paginated table, extract data from each page, compile complete dataset, submit JSON results',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      
      // ========================
      // CHEAT SYSTEM - Full JSON answer (single-run logging)
      // ========================
      const expectedData = [
        {"VIN": "2F2DE48C8N4309374", "Make": "Ford", "Model": "F150", "Year": "2019"},
        {"VIN": "2L3ED45V3D4030403", "Make": "Lexus", "Model": "ES350", "Year": "2019"},
        {"VIN": "7G90G567894589047", "Make": "VW", "Model": "Corrado", "Year": "2015"},
        {"VIN": "3F4F587F84DJ73847", "Make": "Toyota", "Model": "Highlander", "Year": "2019"},
        {"VIN": "34FG678956T435678", "Make": "Ford", "Model": "Focus", "Year": "2015"},
        {"VIN": "1F34GH4V83D345698", "Make": "Toyota", "Model": "Highlander", "Year": "2020"},
        {"VIN": "7Y569K09856785657", "Make": "Honda", "Model": "Pilot", "Year": "2020"},
        {"VIN": "45R6789456787658I", "Make": "Lexus", "Model": "ES350", "Year": "2020"},
        {"VIN": "2T2XS93J9S3829399", "Make": "Toyota", "Model": "Prius", "Year": "2018"},
        {"VIN": "7Y569K09856785658", "Make": "Ford", "Model": "Pilot", "Year": "2022"},
        {"VIN": "45R6789436787658I", "Make": "VW", "Model": "ES350", "Year": "2021"},
        {"VIN": "2T2XS93J9S3829399", "Make": "VW", "Model": "Prius", "Year": "2013"},
        {"VIN": "7Y569K09853785657", "Make": "Honda", "Model": "F150", "Year": "2024"},
        {"VIN": "45R6789426787658I", "Make": "Lexus", "Model": "Highlander", "Year": "2025"},
        {"VIN": "2T2XS93J9S3129399", "Make": "Toyota", "Model": "Corrado", "Year": "2026"}
      ];
      
      const cheatKey = 'task10_cheat_logged';
      if (!(window as any)[cheatKey]) {
        console.log(`[Cheat] Expected: ${JSON.stringify(expectedData)}`);
        (window as any)[cheatKey] = true;
      }
      
      if (!submission) {
        return { success: false, message: 'No submission found. Navigate through all pages, extract data, then use Submit Results button.' };
      }
      
      if (!Array.isArray(submission)) {
        return { success: false, message: `Submission is not an array. Got: ${typeof submission}` };
      }
      
      if (submission.length !== expectedData.length) {
        return { 
          success: false, 
          message: `Expected ${expectedData.length} vehicle records, got ${submission.length}. Navigate through all 5 pages and extract all data.` 
        };
      }
      
      // Validate required properties for each record
      const requiredProperties = ['VIN', 'Make', 'Model', 'Year'];
      for (let i = 0; i < submission.length; i++) {
        const record = submission[i];
        for (const prop of requiredProperties) {
          if (!(prop in record)) {
            return { 
              success: false, 
              message: `Record ${i + 1} is missing property '${prop}'. Each record must have: ${requiredProperties.join(', ')}` 
            };
          }
          if (typeof record[prop] !== 'string') {
            return { 
              success: false, 
              message: `Record ${i + 1} property '${prop}' should be a string. Got: ${typeof record[prop]}` 
            };
          }
        }
      }
      
      // Check data accuracy (sample key records)
      const keyRecords = [0, 7, 14]; // First, middle, last records
      for (const index of keyRecords) {
        const expected = expectedData[index];
        const actual = submission[index];
        
        if (actual.VIN !== expected.VIN || actual.Make !== expected.Make || 
            actual.Model !== expected.Model || actual.Year !== expected.Year) {
          return { 
            success: false, 
            message: `Data accuracy error in record ${index + 1}. Expected VIN: ${expected.VIN}, Got: ${actual.VIN}. Ensure all data is extracted correctly from each page.` 
          };
        }
      }
      
      return { 
        success: true, 
        message: `Successfully extracted all ${expectedData.length} vehicle records from the multipage table and submitted in correct JSON format.` 
      };
    },
  },
];

const tasks = (uiBenchTasks as UiBenchTask[]).map((t, index) => ({
  id: index + 1, // Start from 1 for business process task numbering
  name: t.id,
  component: createTaskComponentForIndex(index),
  task: t.instructions,
  ux: t.ux,
  test: t.test,
  fullWidth: true,
  requireResultSubmission: !!t.require_result_submission,
}));

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Business Process Tasks', appPath: '/business-process-tasks' };

const BusinessProcessTasksApp: React.FC = () => {
  return (
    <TaskWrapper tasks={tasks} appName="Business Process Tasks" appPath="/business-process-tasks" />
  );
};

export default BusinessProcessTasksApp;
