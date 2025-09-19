import React from 'react';
import TaskWrapper from '../src/TaskWrapper';
import Task1 from './business-process-tasks/task-1';
import Task2 from './business-process-tasks/task-2';
import Task3 from './business-process-tasks/task-3';
import Task4 from './business-process-tasks/task-4';
import Task5 from './business-process-tasks/task-5';
import Task6 from './business-process-tasks/task-6';
import Task7 from './business-process-tasks/task-7';

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
  const components = [Task1, Task2, Task3, Task4, Task5, Task6, Task7];
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
    instructions: 'Navigate A-Z company listings in TransportHub directory, focus on companies from letters A-C only. Count buses (excluding shuttles) for each company in their fleet galleries. Only report companies with at least one bus in JSON format. Navigate through alphabet letters A-C, browse company lists, click company names, navigate to fleet galleries, count bus photos, and record details for companies with buses.',
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
