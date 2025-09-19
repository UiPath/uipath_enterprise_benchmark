import React from 'react';
import TaskWrapper from '../src/TaskWrapper';

type UiBenchTask = {
  id: string;
  instructions: string;
  test?: () => { success: boolean; message?: string };
  require_result_submission?: boolean;
};

function createTaskComponent(): React.FC {
  // Lazy load to avoid CSS import issues during export
  const LazyComponent = React.lazy(() => import('./salesforce'));
  const C: React.FC = () => {
    return React.createElement(React.Suspense, { fallback: React.createElement('div', null, 'Loading...') }, 
      React.createElement(LazyComponent)
    );
  };
  return C;
}

const uiBenchTasks: UiBenchTask[] = [
  {
    id: 'salesforce-create-lead',
    instructions: 'Add a new lead with the following details: First Name: "John", Last Name: "Smith", Company: "TechCorp Solutions", Title: "VP of Operations", Phone: "(555) 123-4567", Email: "john.smith@techcorp.com"',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState || !appState.leads) {
        return { success: false, message: 'App state not found or leads data is missing.' };
      }

      // Find the newly created lead with matching details
      const targetLead = appState.leads.find((lead: any) => {
        return (
          lead.firstName === 'John' &&
          lead.lastName === 'Smith' &&
          lead.company === 'TechCorp Solutions' &&
          lead.title === 'VP of Operations' &&
          lead.phone === '(555) 123-4567' &&
          lead.email === 'john.smith@techcorp.com'
        );
      });

      if (!targetLead) {
        return { 
          success: false, 
          message: 'Lead not found with the specified details. Make sure to create a lead with: First Name: John, Last Name: Smith, Company: TechCorp Solutions, Title: VP of Operations, Phone: (555) 123-4567, Email: john.smith@techcorp.com' 
        };
      }

      // Validate that all required fields are present
      if (!targetLead.firstName || targetLead.firstName !== 'John') {
        return { success: false, message: `First Name should be "John", got: ${targetLead.firstName}` };
      }

      if (!targetLead.lastName || targetLead.lastName !== 'Smith') {
        return { success: false, message: `Last Name should be "Smith", got: ${targetLead.lastName}` };
      }

      if (!targetLead.company || targetLead.company !== 'TechCorp Solutions') {
        return { success: false, message: `Company should be "TechCorp Solutions", got: ${targetLead.company}` };
      }

      if (!targetLead.title || targetLead.title !== 'VP of Operations') {
        return { success: false, message: `Title should be "VP of Operations", got: ${targetLead.title}` };
      }

      if (!targetLead.phone || targetLead.phone !== '(555) 123-4567') {
        return { success: false, message: `Phone should be "(555) 123-4567", got: ${targetLead.phone}` };
      }

      if (!targetLead.email || targetLead.email !== 'john.smith@techcorp.com') {
        return { success: false, message: `Email should be "john.smith@techcorp.com", got: ${targetLead.email}` };
      }

      // Verify system fields are properly set
      if (!targetLead.id) {
        return { success: false, message: 'Lead ID is missing - lead may not have been properly created.' };
      }

      return { 
        success: true, 
        message: 'Lead "John Smith" from "TechCorp Solutions" has been successfully created with all specified details.' 
      };
    },
  },
  {
    id: 'salesforce-assign-mobile-phones',
    instructions: 'Several leads are missing mobile phone numbers. Please assign the following mobile phone numbers to these specific leads: Andy Young: (620) 555-9001, David Martinez: (512) 555-9002, James Thompson: (212) 555-9003, Michael Brown: (858) 555-9004, Parvathi Sreenivasan: (886) 555-9005, Robert Wilson: (503) 555-9006. After editing each lead, make sure to navigate away from the edit view (e.g., go to the home page or leads list) to trigger saving the changes.',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState || !appState.leads) {
        return { success: false, message: 'App state not found or leads data is missing.' };
      }

      // Define the expected mobile phone assignments
      const expectedAssignments = [
        { name: 'Andy Young', mobile: '(620) 555-9001' },
        { name: 'David Martinez', mobile: '(512) 555-9002' },
        { name: 'James Thompson', mobile: '(212) 555-9003' },
        { name: 'Michael Brown', mobile: '(858) 555-9004' },
        { name: 'Parvathi Sreenivasan', mobile: '(886) 555-9005' },
        { name: 'Robert Wilson', mobile: '(503) 555-9006' }
      ];

      // Cheat logging - only show when there are actual mobile-related edits happening
      // Use live leads data (includes local changes) instead of stale saved data
      const liveLeads = appState.leads; // This now includes local changes from editing
      
      const completedAssignments = [];
      const missingAssignments = [];
      
      for (const assignment of expectedAssignments) {
        const lead = liveLeads.find((lead: any) => {
          const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
          return fullName === assignment.name;
        });
        
        if (lead && lead.mobile === assignment.mobile) {
          completedAssignments.push(assignment);
        } else {
          missingAssignments.push({
            ...assignment,
            currentMobile: lead ? (lead.mobile || 'none') : 'lead not found'
          });
        }
      }

      // Only show cheat output when there are mobile-related changes happening
      const hasMobileEdits = appState.editing && Object.values(appState.editing.localChanges || {}).some((changes: any) => 
        changes && typeof changes === 'object' && 'mobile' in changes
      );
      
      const hasMobileProgress = completedAssignments.length > 0;
      
      // Track last logged state to avoid spam
      const currentState = JSON.stringify({
        completed: completedAssignments.length,
        editing: hasMobileEdits ? Object.keys(appState.editing?.localChanges || {}).filter(leadId => 
          appState.editing?.localChanges[leadId]?.mobile
        ) : []
      });
      
      if (!((window as any).lastCheatState) || (window as any).lastCheatState !== currentState) {
        if (hasMobileEdits || hasMobileProgress) {
          console.log(`[Cheat] Mobile Phone Assignment Progress: ${completedAssignments.length}/${expectedAssignments.length} completed`);
          
          // Show current editing state for debugging
          if (hasMobileEdits) {
            console.log(`[Cheat] Current editing state:`);
            Object.entries(appState.editing.localChanges).forEach(([leadId, changes]: [string, any]) => {
              const lead = appState.savedLeads?.find((l: any) => l.id === leadId);
              const leadName = lead ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : leadId;
              if (changes.mobile) {
                console.log(`[Cheat]   ${leadName}: mobile being changed to "${changes.mobile}"`);
              }
            });
          }
          
          if (missingAssignments.length > 0) {
            console.log(`[Cheat] Still need to assign mobile phones to:`);
            missingAssignments.forEach((assignment, index) => {
              console.log(`[Cheat]   ${index + 1}. ${assignment.name}: assign "${assignment.mobile}" (current: ${assignment.currentMobile})`);
            });
          }
          
          if (completedAssignments.length > 0) {
            console.log(`[Cheat] ✅ Completed assignments:`);
            completedAssignments.forEach((assignment, index) => {
              console.log(`[Cheat]   ${index + 1}. ${assignment.name}: ${assignment.mobile}`);
            });
          }
          
          (window as any).lastCheatState = currentState;
        }
      }

      // Check each expected assignment (using live leads data)
      for (const assignment of expectedAssignments) {
        const lead = liveLeads.find((lead: any) => {
          const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
          return fullName === assignment.name;
        });

        if (!lead) {
          return { 
            success: false, 
            message: `Lead "${assignment.name}" not found in the system.` 
          };
        }

        if (!lead.mobile || lead.mobile !== assignment.mobile) {
          return { 
            success: false, 
            message: `Mobile phone for "${assignment.name}" should be "${assignment.mobile}", but got: ${lead.mobile || 'none'}` 
          };
        }
      }

      // Verify that no other leads had their mobile numbers changed unexpectedly
      const leadsWithExpectedMobiles = liveLeads.filter((lead: any) => {
        const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
        const wasAssigned = expectedAssignments.some(assignment => assignment.name === fullName);
        
        // If this lead was supposed to get a mobile, we already checked it above
        if (wasAssigned) return false;
        
        // For leads that already had mobiles, check they weren't changed
        if (fullName === 'Jennifer Davis' && lead.mobile !== '(214) 555-0655') {
          return true; // This would be an error - existing mobile was changed
        }
        if (fullName === 'Lisa Chen' && lead.mobile !== '(312) 555-0790') {
          return true; // This would be an error - existing mobile was changed
        }
        if (fullName === 'Maria Rodriguez' && lead.mobile !== '(415) 555-0124') {
          return true; // This would be an error - existing mobile was changed
        }
        if (fullName === 'Sarah Johnson' && lead.mobile !== '(303) 555-0148') {
          return true; // This would be an error - existing mobile was changed
        }
        
        return false;
      });

      if (leadsWithExpectedMobiles.length > 0) {
        return { 
          success: false, 
          message: 'Some existing mobile phone numbers were unexpectedly modified. Only assign mobile numbers to the specified leads.' 
        };
      }

      return { 
        success: true, 
        message: 'All mobile phone numbers have been successfully assigned to the specified leads.' 
      };
    },
  },
  {
    id: 'salesforce-create-initial-outreach-calls',
    instructions: 'Create an "Initial outreach" call for each lead who currently has no call activities associated with them. For each such lead, create a call with the subject "Initial outreach" and comments "First contact, getting to know each other". Make sure to set the Name field to the lead and assign the call to an appropriate user.',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState || !appState.leads || !appState.calls) {
        return { success: false, message: 'App state not found or leads/calls data is missing.' };
      }

      const leads = appState.leads;
      const calls = appState.calls;

      // Find leads that originally had no calls at all - these are the ONLY ones that should get Initial outreach calls
      const leadsWithoutAnyCalls = leads.filter((lead: any) => {
        const hasAnyCall = calls.some((call: any) => 
          call.nameId === lead.id || call.relatedToId === lead.id
        );
        return !hasAnyCall;
      });

      // Among leads without any calls, find those that still need the "Initial outreach" call
      const leadsNeedingInitialOutreachCalls = leadsWithoutAnyCalls.filter((lead: any) => {
        const hasCorrectCall = calls.some((call: any) => 
          (call.nameId === lead.id || call.relatedToId === lead.id) &&
          call.subject === 'Initial outreach' &&
          call.comments === 'First contact, getting to know each other'
        );
        return !hasCorrectCall;
      });

      const leadsNeedingCalls = leadsNeedingInitialOutreachCalls.map((lead: any) => ({
        id: lead.id,
        fullName: `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
      }));

      // Cheat logging - show progress with real-time updates
      const totalOriginalLeadsWithoutCalls = leadsWithoutAnyCalls.length; // Dynamic count based on actual data
      const completedCount = totalOriginalLeadsWithoutCalls - leadsNeedingCalls.length;
      
      // Count initial outreach calls specifically
      const initialOutreachCalls = calls.filter((call: any) => 
        call.subject === 'Initial outreach' && 
        call.comments === 'First contact, getting to know each other'
      );

      // Track current state to avoid spam but show meaningful changes
      const currentState = JSON.stringify({
        leadsNeedingCalls: leadsNeedingCalls.length,
        initialOutreachCallsCount: initialOutreachCalls.length,
        completedCount: completedCount
      });

      if (!((window as any).lastCallCheatState) || (window as any).lastCallCheatState !== currentState) {
        console.log(`[Cheat] Initial Outreach Call Creation Progress: ${completedCount}/${totalOriginalLeadsWithoutCalls} completed`);
        
        if (initialOutreachCalls.length > 0) {
          console.log(`[Cheat] ✅ Created initial outreach calls: ${initialOutreachCalls.length}`);
          initialOutreachCalls.forEach((call, index) => {
            console.log(`[Cheat]   ${index + 1}. ${call.name}: "${call.subject}"`);
          });
        }
        
        if (leadsNeedingCalls.length > 0) {
          console.log(`[Cheat] Still need to create calls for leads with NO existing calls:`);
          leadsNeedingCalls.forEach((lead, index) => {
            console.log(`[Cheat]   ${index + 1}. ${lead.fullName}: create "Initial outreach" call`);
          });
          console.log(`[Cheat] Note: Leads with existing calls (like Parvathi, Andy) should be skipped as per task instructions`);
        } else {
          console.log(`[Cheat] 🎉 All leads without existing calls now have initial outreach calls!`);
        }
        
        (window as any).lastCallCheatState = currentState;
      }

      // Check if all leads without existing calls now have the correct initial outreach calls
      if (leadsNeedingCalls.length > 0) {
        let message = `${leadsNeedingCalls.length} lead(s) without existing calls still need "Initial outreach" calls: ${leadsNeedingCalls.map(l => l.fullName).join(', ')}. `;
        message += `Note: Only create calls for leads that have NO existing call activities.`;
        
        return {
          success: false,
          message: message.trim()
        };
      }

      // Verify that new calls have the correct subject and comments
      // (initialOutreachCalls already defined above in cheat section)

      // Check that we have initial outreach calls for leads that originally had no calls
      const expectedInitialOutreachCallCount = totalOriginalLeadsWithoutCalls;
      if (initialOutreachCalls.length < expectedInitialOutreachCallCount) {
        return {
          success: false,
          message: `Expected ${expectedInitialOutreachCallCount} "Initial outreach" calls for leads without existing calls, but found ${initialOutreachCalls.length}`
        };
      }

      // Verify each initial outreach call has proper relationships
      for (const call of initialOutreachCalls) {
        if (!call.nameId) {
          return {
            success: false,
            message: `Initial outreach call "${call.id}" is missing nameId (Name field)`
          };
        }

        if (!call.name) {
          return {
            success: false,
            message: `Initial outreach call "${call.id}" is missing name field`
          };
        }

        if (!call.assignedToId || !call.assignedToName) {
          return {
            success: false,
            message: `Initial outreach call "${call.id}" is missing assigned user`
          };
        }

        // Verify the lead exists
        const associatedLead = leads.find((lead: any) => lead.id === call.nameId);
        if (!associatedLead) {
          return {
            success: false,
            message: `Initial outreach call "${call.id}" references non-existent lead "${call.nameId}"`
          };
        }
      }

      return {
        success: true,
        message: `Successfully created "Initial outreach" calls for all ${totalOriginalLeadsWithoutCalls} leads that had no existing call activities. Leads with existing calls were correctly excluded as per task instructions.`
      };
    },
  },
  {
    id: 'salesforce-move-activities-parvathi-to-andy',
    instructions: 'Move all activities (tasks, calls, events, emails) that are currently associated with lead "Parvathi Sreenivasan" to lead "Andy Young". For all activity types: change the "Name" field from "Parvathi Sreenivasan" to "Andy Young". This will move the activities to Andy\'s activity feed.',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState || !appState.leads || !appState.tasks || !appState.calls || !appState.events || !appState.emails) {
        return { success: false, message: 'App state not found or activity data is missing.' };
      }

      const leads = appState.leads;
      const tasks = appState.tasks;
      const calls = appState.calls;
      const events = appState.events;
      const emails = appState.emails;

      // Find the lead IDs
      const parvathiLead = leads.find((lead: any) => {
        const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
        return fullName === 'Parvathi Sreenivasan';
      });
      
      const andyLead = leads.find((lead: any) => {
        const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
        return fullName === 'Andy Young';
      });

      if (!parvathiLead || !andyLead) {
        return { 
          success: false, 
          message: 'Could not find Parvathi Sreenivasan or Andy Young in the leads list.' 
        };
      }

      const parvathiId = parvathiLead.id;
      const andyId = andyLead.id;
      const andyFullName = 'Andy Young';
      const parvathiEmail = 'p.sree@gmail.com';
      const andyEmail = 'a_young@dickenson.com';

      // Count activities that need to be moved (all types work the same way now)
      const activitiesToMove = [
        ...tasks.filter((task: any) => task.nameId === parvathiId),
        ...calls.filter((call: any) => call.nameId === parvathiId),
        ...events.filter((event: any) => event.nameId === parvathiId),
        ...emails.filter((email: any) => email.nameId === parvathiId)
      ];

      const activitiesMovedToAndy = [
        ...tasks.filter((task: any) => task.nameId === andyId),
        ...calls.filter((call: any) => call.nameId === andyId),
        ...events.filter((event: any) => event.nameId === andyId),
        ...emails.filter((email: any) => email.nameId === andyId)
      ];

      // Count by activity type for detailed feedback
      const parvathiTasks = tasks.filter((task: any) => task.nameId === parvathiId);
      const parvathiCalls = calls.filter((call: any) => call.nameId === parvathiId);
      const parvathiEvents = events.filter((event: any) => event.nameId === parvathiId);
      const parvathiEmails = emails.filter((email: any) => email.nameId === parvathiId);

      const andyTasks = tasks.filter((task: any) => task.nameId === andyId);
      const andyCalls = calls.filter((call: any) => call.nameId === andyId);
      const andyEvents = events.filter((event: any) => event.nameId === andyId);
      const andyEmails = emails.filter((email: any) => email.nameId === andyId);

      // Expected counts (based on sample data)
      // All activity types can now be fully moved from Parvathi to Andy (nameId changes)
      // Original Parvathi: 1 task, 1 call, 1 event, 1 email = 4 total
      // Original Andy: 2 tasks, 1 call, 1 event, 1 email = 5 total  
      // After move: Andy should have 9 activities (4 moved + 5 original)
      const expectedAndyActivitiesAfterMove = 9; // 4 moved activities + 5 original = 9 total

      // Cheat logging - show progress with real-time updates
      const currentState = JSON.stringify({
        activitiesToMove: activitiesToMove.length,
        andyActivities: activitiesMovedToAndy.length,
        breakdown: {
          parvathiTasks: parvathiTasks.length,
          parvathiCalls: parvathiCalls.length,
          parvathiEvents: parvathiEvents.length,
          parvathiEmails: parvathiEmails.length,
          andyTasks: andyTasks.length,
          andyCalls: andyCalls.length,
          andyEvents: andyEvents.length,
          andyEmails: andyEmails.length
        }
      });

      if (!((window as any).lastMoveActivityCheatState) || (window as any).lastMoveActivityCheatState !== currentState) {
        console.log(`[Cheat] Activity Move Progress: Moving from Parvathi Sreenivasan to Andy Young`);
        console.log(`[Cheat] Current status:`);
        console.log(`[Cheat]   Parvathi still has: ${activitiesToMove.length} activities (should be 0)`);
        console.log(`[Cheat]   Andy now has: ${activitiesMovedToAndy.length} activities (should be ${expectedAndyActivitiesAfterMove})`);
        
        if (activitiesToMove.length > 0) {
          console.log(`[Cheat] ❌ Still need to move from Parvathi:`);
          if (parvathiTasks.length > 0) {
            console.log(`[Cheat]     Tasks: ${parvathiTasks.length} (${parvathiTasks.map((t: any) => t.subject).join(', ')}) - change Name field`);
          }
          if (parvathiCalls.length > 0) {
            console.log(`[Cheat]     Calls: ${parvathiCalls.length} (${parvathiCalls.map((c: any) => c.subject).join(', ')}) - change Name field`);
          }
          if (parvathiEvents.length > 0) {
            console.log(`[Cheat]     Events: ${parvathiEvents.length} (${parvathiEvents.map((e: any) => e.subject).join(', ')}) - change Name field`);
          }
          if (parvathiEmails.length > 0) {
            console.log(`[Cheat]     Emails: ${parvathiEmails.length} (${parvathiEmails.map((e: any) => e.subject).join(', ')}) - change Name field`);
          }
        } else {
          console.log(`[Cheat] ✅ All activities moved from Parvathi!`);
        }
        
        console.log(`[Cheat] Andy's current activities:`);
        console.log(`[Cheat]     Tasks: ${andyTasks.length} (${andyTasks.map((t: any) => t.subject).join(', ')})`);
        console.log(`[Cheat]     Calls: ${andyCalls.length} (${andyCalls.map((c: any) => c.subject).join(', ')})`);
        console.log(`[Cheat]     Events: ${andyEvents.length} (${andyEvents.map((e: any) => e.subject).join(', ')})`);
        console.log(`[Cheat]     Emails: ${andyEmails.length} (${andyEmails.map((e: any) => e.subject).join(', ')})`);
        
        (window as any).lastMoveActivityCheatState = currentState;
      }

      // Validation: Check that activities are properly moved
      if (activitiesToMove.length > 0) {
        const breakdown = [];
        if (parvathiTasks.length > 0) {
          breakdown.push(`${parvathiTasks.length} task(s): ${parvathiTasks.map((t: any) => t.subject).join(', ')}`);
        }
        if (parvathiCalls.length > 0) {
          breakdown.push(`${parvathiCalls.length} call(s): ${parvathiCalls.map((c: any) => c.subject).join(', ')}`);
        }
        if (parvathiEvents.length > 0) {
          breakdown.push(`${parvathiEvents.length} event(s): ${parvathiEvents.map((e: any) => e.subject).join(', ')}`);
        }
        if (parvathiEmails.length > 0) {
          breakdown.push(`${parvathiEmails.length} email(s): ${parvathiEmails.map((e: any) => e.subject).join(', ')}`);
        }
        
        return {
          success: false,
          message: `${activitiesToMove.length} activities still need to be moved. Please change the Name field: ${breakdown.join('; ')}`
        };
      }

      // Validation: Check that activities moved to Andy have correct fields
      const activitiesWithIncorrectFields = [];
      
      for (const task of andyTasks) {
        if (task.name !== andyFullName) {
          activitiesWithIncorrectFields.push(`Task "${task.subject}" has name "${task.name}" (should be "${andyFullName}")`);
        }
      }
      
      for (const call of andyCalls) {
        if (call.name !== andyFullName) {
          activitiesWithIncorrectFields.push(`Call "${call.subject}" has name "${call.name}" (should be "${andyFullName}")`);
        }
      }
      
      for (const event of andyEvents) {
        if (event.name !== andyFullName) {
          activitiesWithIncorrectFields.push(`Event "${event.subject}" has name "${event.name}" (should be "${andyFullName}")`);
        }
      }
      
      for (const email of andyEmails) {
        if (email.name !== andyFullName) {
          activitiesWithIncorrectFields.push(`Email "${email.subject}" has name "${email.name}" (should be "${andyFullName}")`);
        }
      }

      if (activitiesWithIncorrectFields.length > 0) {
        return {
          success: false,
          message: `Some activities have incorrect fields: ${activitiesWithIncorrectFields.join('; ')}`
        };
      }

      // Validation: Check that we have the expected total number of activities for Andy
      if (activitiesMovedToAndy.length !== expectedAndyActivitiesAfterMove) {
        return {
          success: false,
          message: `Andy Young should have ${expectedAndyActivitiesAfterMove} total activities after the move, but has ${activitiesMovedToAndy.length}. Expected: 3 tasks, 2 calls, 2 events, 2 emails.`
        };
      }

      return {
        success: true,
        message: `Successfully moved all activities from Parvathi Sreenivasan to Andy Young. Andy now has ${activitiesMovedToAndy.length} activities (${andyTasks.length} tasks, ${andyCalls.length} calls, ${andyEvents.length} events, ${andyEmails.length} emails).`
      };
    },
  },
  {
    id: 'salesforce-change-parvathi-task',
    instructions: 'Find the task "Send RPA implementation proposal" assigned to Parvathi Sreenivasan and modify it by: 1) Adding "today" to the Subject and 2) Changing the Status from "Not Started" to "In Progress".',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState || !appState.tasks || !appState.leads) {
        return { success: false, message: 'App state not found or tasks/leads data is missing.' };
      }

      const tasks = appState.tasks;
      const leads = appState.leads;

      // Find Parvathi Sreenivasan
      const parvathiLead = leads.find((lead: any) => {
        const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
        return fullName === 'Parvathi Sreenivasan';
      });

      if (!parvathiLead) {
        return { 
          success: false, 
          message: 'Could not find Parvathi Sreenivasan in the leads list.' 
        };
      }

      // Find the specific task for Parvathi
      const targetTask = tasks.find((task: any) => 
        task.nameId === parvathiLead.id && 
        (task.subject === 'Send RPA implementation proposal' || 
         task.subject === 'Send RPA implementation proposal today')
      );

      if (!targetTask) {
        return { 
          success: false, 
          message: 'Could not find the "Send RPA implementation proposal" task for Parvathi Sreenivasan.' 
        };
      }

      // Cheat logging - show current task state and what needs to be changed
      const currentTaskState = {
        subject: targetTask.subject,
        status: targetTask.status,
        assignedTo: targetTask.assignedToName
      };

      const expectedState = {
        subject: 'Send RPA implementation proposal today',
        status: 'In Progress'
      };

      const subjectCorrect = targetTask.subject === expectedState.subject;
      const statusCorrect = targetTask.status === expectedState.status;

      // Track current state to avoid spam
      const currentState = JSON.stringify({
        taskId: targetTask.id,
        subject: targetTask.subject,
        status: targetTask.status,
        subjectCorrect,
        statusCorrect
      });

      if (!((window as any).lastTaskEditCheatState) || (window as any).lastTaskEditCheatState !== currentState) {
        console.log(`[Cheat] Task Edit Progress for Parvathi Sreenivasan:`);
        console.log(`[Cheat] Current task state:`);
        console.log(`[Cheat]   Subject: "${targetTask.subject}" ${subjectCorrect ? '✅' : '❌ (should be "Send RPA implementation proposal today")'}`);
        console.log(`[Cheat]   Status: "${targetTask.status}" ${statusCorrect ? '✅' : '❌ (should be "In Progress")'}`);
        console.log(`[Cheat]   Assigned to: ${targetTask.assignedToName}`);
        
        if (!subjectCorrect || !statusCorrect) {
          console.log(`[Cheat] Still need to:`);
          if (!subjectCorrect) {
            console.log(`[Cheat]   • Change subject to add "today": "${expectedState.subject}"`);
          }
          if (!statusCorrect) {
            console.log(`[Cheat]   • Change status to: "${expectedState.status}"`);
          }
        } else {
          console.log(`[Cheat] 🎉 Task successfully updated!`);
        }
        
        (window as any).lastTaskEditCheatState = currentState;
      }

      // Validation: Check subject is correct
      if (targetTask.subject !== expectedState.subject) {
        return {
          success: false,
          message: `Task subject should be "${expectedState.subject}" but got: "${targetTask.subject}"`
        };
      }

      // Validation: Check status is correct
      if (targetTask.status !== expectedState.status) {
        return {
          success: false,
          message: `Task status should be "${expectedState.status}" but got: "${targetTask.status}"`
        };
      }

      // Validation: Ensure task is still assigned to Parvathi
      if (targetTask.nameId !== parvathiLead.id) {
        return {
          success: false,
          message: 'Task should still be associated with Parvathi Sreenivasan'
        };
      }

      // Validation: Ensure task has proper system fields
      if (!targetTask.id || !targetTask.assignedToId || !targetTask.assignedToName) {
        return {
          success: false,
          message: 'Task is missing required system fields (ID, assigned user)'
        };
      }

      return {
        success: true,
        message: `Successfully updated Parvathi Sreenivasan's task. Subject: "${targetTask.subject}", Status: "${targetTask.status}"`
      };
    },
  },
  {
    id: 'salesforce-update-employee-counts',
    instructions: 'Update the "Number of Employees" field for the following companies to these specific values: RetailMax Corporation → 1000-5000, EduTech Solutions → 200-500, HealthTech Innovations → 500-1000, BioResearch Labs → 500-1000. Find each lead by their company name and change their numberOfEmployees field to the exact value specified.',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState || !appState.leads) {
        return { success: false, message: 'App state not found or leads data is missing.' };
      }

      const leads = appState.leads;

      // Define the expected employee count assignments
      const expectedAssignments = [
        { company: 'RetailMax Corporation', expectedEmployees: '1000-5000' },
        { company: 'EduTech Solutions', expectedEmployees: '200-500' },
        { company: 'HealthTech Innovations', expectedEmployees: '500-1000' },
        { company: 'BioResearch Labs', expectedEmployees: '500-1000' }
      ];

      const completedAssignments = [];
      const missingAssignments = [];

      for (const assignment of expectedAssignments) {
        const lead = leads.find((lead: any) => lead.company === assignment.company);
        
        if (!lead) {
          missingAssignments.push({
            ...assignment,
            issue: 'Lead not found'
          });
          continue;
        }

        const leadName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
        
        if (lead.numberOfEmployees === assignment.expectedEmployees) {
          completedAssignments.push({
            ...assignment,
            leadName,
            currentEmployees: lead.numberOfEmployees
          });
        } else {
          missingAssignments.push({
            ...assignment,
            leadName,
            currentEmployees: lead.numberOfEmployees || 'none',
            issue: 'Incorrect employee count'
          });
        }
      }

      // Cheat logging - show progress with real-time updates
      const currentState = JSON.stringify({
        completed: completedAssignments.length,
        assignments: completedAssignments.map(a => ({ company: a.company, employees: a.currentEmployees }))
      });

      if (!((window as any).lastEmployeeCountCheatState) || (window as any).lastEmployeeCountCheatState !== currentState) {
        console.log(`[Cheat] Employee Count Update Progress: ${completedAssignments.length}/${expectedAssignments.length} completed`);
        
        if (completedAssignments.length > 0) {
          console.log(`[Cheat] ✅ Completed updates:`);
          completedAssignments.forEach((assignment, index) => {
            console.log(`[Cheat]   ${index + 1}. ${assignment.company} (${assignment.leadName}): ${assignment.currentEmployees} employees`);
          });
        }
        
        if (missingAssignments.length > 0) {
          console.log(`[Cheat] Still need to update:`);
          missingAssignments.forEach((assignment, index) => {
            if (assignment.issue === 'Lead not found') {
              console.log(`[Cheat]   ${index + 1}. ${assignment.company}: Lead not found in system`);
            } else {
              console.log(`[Cheat]   ${index + 1}. ${assignment.company} (${assignment.leadName}): change to "${assignment.expectedEmployees}" (current: ${assignment.currentEmployees})`);
            }
          });
        } else {
          console.log(`[Cheat] 🎉 All employee counts updated successfully!`);
        }
        
        (window as any).lastEmployeeCountCheatState = currentState;
      }

      // Validation: Check each expected assignment
      for (const assignment of expectedAssignments) {
        const lead = leads.find((lead: any) => lead.company === assignment.company);

        if (!lead) {
          return { 
            success: false, 
            message: `Lead for company "${assignment.company}" not found in the system.` 
          };
        }

        const leadName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();

        if (!lead.numberOfEmployees || lead.numberOfEmployees !== assignment.expectedEmployees) {
          return { 
            success: false, 
            message: `Number of employees for "${assignment.company}" (${leadName}) should be "${assignment.expectedEmployees}", but got: ${lead.numberOfEmployees || 'none'}` 
          };
        }
      }

      // Verify that no other leads had their employee counts changed unexpectedly
      const otherLeads = leads.filter((lead: any) => {
        return !expectedAssignments.some(assignment => assignment.company === lead.company);
      });

      // Check that other leads still have their original employee counts (this is more for data integrity)
      const expectedOriginalCounts = {
        'UiPath': undefined, // Parvathi - originally had no numberOfEmployees
        'Dickenson plc': undefined, // Andy - originally had no numberOfEmployees  
        'Atlantic Financial Services': '1000-5000', // James Thompson
        'Pacific Manufacturing': '5000+', // Robert Wilson
        'GreenEnergy Solutions': '200-500', // Sarah Johnson
        'TechStartup Inc': '50-200' // David Martinez
      };

      for (const lead of otherLeads) {
        const expectedCount = expectedOriginalCounts[lead.company as keyof typeof expectedOriginalCounts];
        if (expectedCount !== undefined && lead.numberOfEmployees !== expectedCount) {
          const leadName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
          return {
            success: false,
            message: `Unexpected change: "${lead.company}" (${leadName}) employee count was modified unexpectedly. Should be "${expectedCount}" but got: ${lead.numberOfEmployees || 'none'}`
          };
        }
      }

      return { 
        success: true, 
        message: `Successfully updated number of employees for all 4 companies: ${completedAssignments.map(a => `${a.company} (${a.currentEmployees})`).join(', ')}.` 
      };
    },
  },
  {
    id: 'salesforce-bulk-status-change',
    instructions: 'Use the bulk status change feature to update multiple leads at once. First, select all leads with "Open - Not Contacted" status by checking their checkboxes. Then use the "Change Status" button to change all selected leads to "Working - Contacted" status.',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState || !appState.leads) {
        return { success: false, message: 'App state not found or leads data is missing.' };
      }

      const leads = appState.leads;

      // Find leads that should have been changed from "Open - Not Contacted" to "Working - Contacted"
      const originallyOpenLeads = [
        'Maria Rodriguez', // HealthTech Innovations
        'Jennifer Davis',  // RetailMax Corporation
        'David Martinez'   // TechStartup Inc
      ];

      const completedChanges = [];
      const missingChanges = [];

      for (const expectedLeadName of originallyOpenLeads) {
        const lead = leads.find((lead: any) => {
          const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
          return fullName === expectedLeadName;
        });

        if (!lead) {
          missingChanges.push({
            leadName: expectedLeadName,
            issue: 'Lead not found'
          });
          continue;
        }

        if (lead.status === 'Working - Contacted') {
          completedChanges.push({
            leadName: expectedLeadName,
            company: lead.company,
            newStatus: lead.status
          });
        } else {
          missingChanges.push({
            leadName: expectedLeadName,
            company: lead.company,
            currentStatus: lead.status,
            expectedStatus: 'Working - Contacted'
          });
        }
      }

      // Count total leads with each status for overview
      const statusCounts = {
        'Open - Not Contacted': 0,
        'Working - Contacted': 0,
        'Closed - Converted': 0,
        'Closed - Not Converted': 0
      };

      leads.forEach((lead: any) => {
        if (statusCounts.hasOwnProperty(lead.status)) {
          statusCounts[lead.status as keyof typeof statusCounts]++;
        }
      });

      // Cheat logging - show progress with real-time updates
      const currentState = JSON.stringify({
        completed: completedChanges.length,
        statusCounts,
        completedLeads: completedChanges.map(c => c.leadName)
      });

      if (!((window as any).lastBulkStatusCheatState) || (window as any).lastBulkStatusCheatState !== currentState) {
        console.log(`[Cheat] Bulk Status Change Progress: ${completedChanges.length}/${originallyOpenLeads.length} leads changed`);
        console.log(`[Cheat] Current status distribution:`);
        console.log(`[Cheat]   Open - Not Contacted: ${statusCounts['Open - Not Contacted']}`);
        console.log(`[Cheat]   Working - Contacted: ${statusCounts['Working - Contacted']}`);
        console.log(`[Cheat]   Closed - Converted: ${statusCounts['Closed - Converted']}`);
        console.log(`[Cheat]   Closed - Not Converted: ${statusCounts['Closed - Not Converted']}`);
        
        if (completedChanges.length > 0) {
          console.log(`[Cheat] ✅ Successfully changed to "Working - Contacted":`);
          completedChanges.forEach((change, index) => {
            console.log(`[Cheat]   ${index + 1}. ${change.leadName} (${change.company})`);
          });
        }
        
        if (missingChanges.length > 0) {
          console.log(`[Cheat] Still need to change these leads:`);
          missingChanges.forEach((change, index) => {
            if (change.issue === 'Lead not found') {
              console.log(`[Cheat]   ${index + 1}. ${change.leadName}: Lead not found`);
            } else {
              console.log(`[Cheat]   ${index + 1}. ${change.leadName} (${change.company}): change from "${change.currentStatus}" to "${change.expectedStatus}"`);
            }
          });
        } else {
          console.log(`[Cheat] 🎉 All target leads successfully changed to "Working - Contacted"!`);
        }

        console.log(`[Cheat] Instructions: Select leads with checkboxes, then click "Change Status" button`);
        
        (window as any).lastBulkStatusCheatState = currentState;
      }

      // Validation: Check each expected lead was changed
      for (const change of missingChanges) {
        if (change.issue === 'Lead not found') {
          return {
            success: false,
            message: `Lead "${change.leadName}" not found in the system.`
          };
        } else {
          return {
            success: false,
            message: `Lead "${change.leadName}" (${change.company}) should have status "Working - Contacted", but has: "${change.currentStatus}"`
          };
        }
      }

      // Verify that we have the expected number of changes
      if (completedChanges.length !== originallyOpenLeads.length) {
        return {
          success: false,
          message: `Expected ${originallyOpenLeads.length} leads to be changed to "Working - Contacted", but only ${completedChanges.length} were changed.`
        };
      }

      // Verify that no unexpected leads were changed to "Working - Contacted"
      const workingContactedLeads = leads.filter((lead: any) => lead.status === 'Working - Contacted');
      
      // Expected leads that should now be "Working - Contacted":
      // Original "Working - Contacted": Parvathi Sreenivasan, Sarah Johnson, James Thompson, Robert Wilson
      // Plus the 3 we just changed: Maria Rodriguez, Jennifer Davis, David Martinez
      const expectedWorkingContactedCount = 7; // 4 original + 3 changed

      if (workingContactedLeads.length !== expectedWorkingContactedCount) {
        const extraLeads = workingContactedLeads.filter((lead: any) => {
          const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
          const expectedNames = [
            'Parvathi Sreenivasan', 'Sarah Johnson', 'James Thompson', 'Robert Wilson', // Original
            'Maria Rodriguez', 'Jennifer Davis', 'David Martinez' // Changed
          ];
          return !expectedNames.includes(fullName);
        });

        if (extraLeads.length > 0) {
          const extraNames = extraLeads.map((lead: any) => `${lead.firstName || ''} ${lead.lastName || ''}`.trim());
          return {
            success: false,
            message: `Unexpected leads were changed to "Working - Contacted": ${extraNames.join(', ')}`
          };
        }
      }

      return {
        success: true,
        message: `Successfully changed ${completedChanges.length} leads from "Open - Not Contacted" to "Working - Contacted" using bulk status change: ${completedChanges.map(c => c.leadName).join(', ')}.`
      };
    },
  },
  {
    id: 'salesforce-search-sort-and-create-event',
    instructions: 'Use the search and sorting tools to find the lead that is first in alphabetical order among leads that have "555" in their phone number. First, search for "555" to filter the leads. Then sort by Name column to find the alphabetically first lead. Finally, navigate to that lead\'s detail page and create an event with subject "Say hello" for that lead.',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState || !appState.leads || !appState.events) {
        return { success: false, message: 'App state not found or leads/events data is missing.' };
      }

      const leads = appState.leads;
      const events = appState.events;

      // Find leads with "555" in phone number
      const leadsWith555 = leads.filter((lead: any) => 
        lead.phone && lead.phone.includes('555')
      );

      // Sort alphabetically by first name (since that's how the name column sorts)
      const sortedLeads = leadsWith555.sort((a: any, b: any) => {
        const aName = `${a.firstName || ''} ${a.lastName || ''}`.trim();
        const bName = `${b.firstName || ''} ${b.lastName || ''}`.trim();
        return aName.localeCompare(bName);
      });

      // The first lead alphabetically should be David Martinez
      const expectedLead = leads.find((lead: any) => {
        const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
        return fullName === 'David Martinez';
      });

      if (!expectedLead) {
        return {
          success: false,
          message: 'Could not find David Martinez in the leads list.'
        };
      }

      // Check if the "Say hello" event was created for David Martinez
      const sayHelloEvent = events.find((event: any) => 
        event.nameId === expectedLead.id && 
        event.subject === 'Say hello'
      );

      // Debug logging to help troubleshoot
      const allEventsForDavid = events.filter((event: any) => event.nameId === expectedLead.id);
      const allSayHelloEvents = events.filter((event: any) => event.subject === 'Say hello');

      // Find all leads with 555 for cheat logging
      const leadsWithPhone555Names = leadsWith555.map((lead: any) => 
        `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
      ).sort();

      // Cheat logging - show search and sorting progress
      const currentState = JSON.stringify({
        leadsWithPhone555Count: leadsWith555.length,
        sortedLeadsNames: leadsWithPhone555Names,
        eventCreated: !!sayHelloEvent,
        expectedLead: expectedLead.id
      });

      if (!((window as any).lastSearchSortEventCheatState) || (window as any).lastSearchSortEventCheatState !== currentState) {
        console.log(`[Cheat] Search, Sort & Event Creation Task Progress:`);
        console.log(`[Cheat] Step 1: Search for "555" in phone numbers`);
        console.log(`[Cheat]   Found ${leadsWith555.length} leads with "555" in phone:`);
        leadsWithPhone555Names.forEach((name, index) => {
          console.log(`[Cheat]     ${index + 1}. ${name}`);
        });
        
        console.log(`[Cheat] Step 2: Sort by Name column (alphabetically)`);
        console.log(`[Cheat]   First lead alphabetically: ${leadsWithPhone555Names[0]} ← TARGET`);
        
        console.log(`[Cheat] Step 3: Create "Say hello" event for ${leadsWithPhone555Names[0]}`);
        if (sayHelloEvent) {
          console.log(`[Cheat]   ✅ Event created successfully!`);
          console.log(`[Cheat]     Subject: "${sayHelloEvent.subject}"`);
          console.log(`[Cheat]     For: ${sayHelloEvent.name}`);
          console.log(`[Cheat]     Event ID: ${sayHelloEvent.id}`);
        } else {
          console.log(`[Cheat]   ❌ Event not found yet`);
          console.log(`[Cheat]   Need to: Navigate to ${leadsWithPhone555Names[0]} → Activity tab → New Event → Subject: "Say hello"`);
          
          // Debug info
          console.log(`[Cheat] DEBUG: David Martinez ID: ${expectedLead.id}`);
          console.log(`[Cheat] DEBUG: Total events: ${events.length}`);
          console.log(`[Cheat] DEBUG: Events for David Martinez (nameId=${expectedLead.id}): ${allEventsForDavid.length}`);
          allEventsForDavid.forEach((event: any, index: number) => {
            console.log(`[Cheat] DEBUG:   ${index + 1}. "${event.subject}" (Event ID: ${event.id})`);
          });
          console.log(`[Cheat] DEBUG: All "Say hello" events: ${allSayHelloEvents.length}`);
          allSayHelloEvents.forEach((event: any, index: number) => {
            console.log(`[Cheat] DEBUG:   ${index + 1}. nameId: ${event.nameId}, name: "${event.name}"`);
          });
        }
        
        console.log(`[Cheat] Instructions:`);
        console.log(`[Cheat]   1. Use search box: type "555" to filter leads`);
        console.log(`[Cheat]   2. Click Name column header to sort alphabetically`);
        console.log(`[Cheat]   3. Click on first lead (${leadsWithPhone555Names[0]}) to open detail page`);
        console.log(`[Cheat]   4. Go to Activity tab → New Event → Subject: "Say hello"`);
        
        (window as any).lastSearchSortEventCheatState = currentState;
      }

      // Validation: Check if event was created
      if (!sayHelloEvent) {
        return {
          success: false,
          message: `Event "Say hello" not found for David Martinez. Please create an event with subject "Say hello" for the lead that is first alphabetically among leads with "555" in phone number.`
        };
      }

      // Validation: Check event properties
      if (sayHelloEvent.subject !== 'Say hello') {
        return {
          success: false,
          message: `Event subject should be "Say hello", but got: "${sayHelloEvent.subject}"`
        };
      }

      if (sayHelloEvent.nameId !== expectedLead.id) {
        return {
          success: false,
          message: `Event should be associated with David Martinez, but is associated with: ${sayHelloEvent.name}`
        };
      }

      // Validation: Check that event has proper system fields
      if (!sayHelloEvent.id || !sayHelloEvent.assignedToId || !sayHelloEvent.assignedToName) {
        return {
          success: false,
          message: 'Event is missing required system fields (ID, assigned user)'
        };
      }

      // Verify the search and sort logic worked correctly
      if (sortedLeads.length === 0) {
        return {
          success: false,
          message: 'No leads found with "555" in phone number. Check search functionality.'
        };
      }

      const firstLeadName = `${sortedLeads[0].firstName || ''} ${sortedLeads[0].lastName || ''}`.trim();
      if (firstLeadName !== 'David Martinez') {
        return {
          success: false,
          message: `Expected David Martinez to be first alphabetically among leads with "555" in phone, but got: ${firstLeadName}`
        };
      }

      return {
        success: true,
        message: `Successfully used search and sorting to find David Martinez (first alphabetically among leads with "555" in phone) and created "Say hello" event. Found ${leadsWith555.length} leads with "555" in phone number.`
      };
    },
  },
];

const tasks = (uiBenchTasks as UiBenchTask[]).map((t, index) => ({
  id: index + 1,
  name: t.id,
  component: createTaskComponent(),
  task: t.instructions,
  ux: t.require_result_submission
    ? 'Submit the requested JSON via the Submit Results button'
    : 'Complete the Salesforce interaction to satisfy the instructions',
  test: t.test,
  fullWidth: true,
  requireResultSubmission: !!t.require_result_submission,
}));

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Salesforce', appPath: '/salesforce' };

const SalesforceTasksApp: React.FC = () => {
  return (
    <TaskWrapper tasks={tasks} appName="Salesforce" appPath="/salesforce" />
  );
};

export default SalesforceTasksApp;
