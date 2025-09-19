import React from 'react';
import TaskWrapper from '../src/TaskWrapper';
import WorkdayApp from './workday';

type UiBenchTask = {
  id: string;
  instructions: string;
  ux?: string;
  test?: () => { success: boolean; message?: string };
  require_result_submission?: boolean;
};

function createTaskComponent(): React.FC {
  const C: React.FC = () => <WorkdayApp />;
  return C;
}

const uiBenchTasks: UiBenchTask[] = [
  {
    id: 'workday-add-pto-august-2025',
    instructions: "Add a PTO absence for August 2025 from the 4th to the 8th",
    test: () => {
      const submittedRequests = (window as any).app_state?.submittedRequests;
      if (!submittedRequests) {
        return { success: false, message: 'App state not found.' };
      }
      const targetRequest = submittedRequests.find((request: any) => {
        if (!request.absenceType.includes('PTO')) {
          return false;
        }
        const augustDates = request.dates.filter((date: any) => date.month === 7 && date.year === 2025);
        const requiredDays = [4, 5, 6, 7, 8];
        const requestedDays = augustDates.map((date: any) => date.day);
        return requiredDays.every((day) => requestedDays.includes(day));
      });
      if (!targetRequest) {
        return { success: false, message: 'PTO request for August 4-8, 2025 was not found.' };
      }
      if (!targetRequest.absenceType.includes('PTO')) {
        return { success: false, message: `Request is not a PTO request. Type: ${targetRequest.absenceType}` };
      }
      const augustDates = targetRequest.dates.filter((date: any) => date.month === 7 && date.year === 2025);
      const requestedDays = augustDates.map((date: any) => date.day).sort((a: number, b: number) => a - b);
      const expectedDays = [4, 5, 6, 7, 8];
      if (JSON.stringify(requestedDays) !== JSON.stringify(expectedDays)) {
        return { success: false, message: `Incorrect date range. Expected August 4-8, 2025, got: ${requestedDays.join(', ')}` };
      }
      return { success: true, message: 'PTO absence successfully added for August 4-8, 2025.' };
    },
  },
  {
    id: 'workday-add-phone-number',
    instructions: 'Add a Phone number (555) 123-7654 to the Home Contact Information and set visibility to Public',
    test: () => {
      const contactInformation = (window as any).app_state?.contactInformation;
      if (!contactInformation) {
        return { success: false, message: 'App state not found.' };
      }
      const targetPhone = contactInformation.phones.find((phone: any) => phone.number === '(555) 123-7654');
      if (!targetPhone) {
        return { success: false, message: 'Phone number (555) 123-7654 was not found in contact information.' };
      }
      if (targetPhone.usage !== 'Home') {
        return { success: false, message: `Phone number usage is not Home. Current usage: ${targetPhone.usage}` };
      }
      if (targetPhone.visibility !== 'Public') {
        return { success: false, message: `Phone number visibility is not Public. Current visibility: ${targetPhone.visibility}` };
      }
      if (!targetPhone.id || !targetPhone.number) {
        return { success: false, message: 'Phone number entry is incomplete or invalid.' };
      }
      return { success: true, message: 'Phone number (555) 123-7654 successfully added to Home Contact Information with Public visibility.' };
    },
  },
  {
    id: 'workday-remove-july-request',
    instructions: "Remove the request for '27 July 2025 - 31 July 2025'",
    test: () => {
      const submittedRequests = (window as any).app_state?.submittedRequests;
      if (!submittedRequests) {
        return { success: false, message: 'App state not found.' };
      }
      const targetRequest = submittedRequests.find((request: any) => {
        const julyDates = request.dates.filter((date: any) => date.month === 6 && date.year === 2025);
        const requiredDays = [27, 28, 29, 30, 31];
        const requestedDays = julyDates.map((date: any) => date.day);
        return requiredDays.every((day) => requestedDays.includes(day));
      });
      if (targetRequest) {
        return { success: false, message: 'Request for July 27-31, 2025 is still present and was not removed.' };
      }
      return { success: true, message: 'Request for July 27-31, 2025 has been successfully removed.' };
    },
  },
  {
    id: 'workday-count-pto-days-2025',
    instructions: "Find out how many PTO days I used in 2025. Respond with JSON formatted as {\"pto_days_count\": int}",
    ux: 'Submit the requested JSON via the Submit Results button',
    require_result_submission: true,
    test: () => {
      // Console log cheat message (only once per session)
      const lastLoggedKey = 'workday_pto_count_cheat';
      if (!(window as any)[lastLoggedKey]) {
        console.log(`[Cheat] Target JSON: {"pto_days_count": 12}`);
        (window as any)[lastLoggedKey] = true;
      }
      
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { submittedRequests, submission } = appState;
      
      if (!submittedRequests) {
        return { success: false, message: 'Submitted requests not found in app state.' };
      }
      
      if (!submission) {
        return { success: false, message: 'No submission found. Please submit your answer as JSON via the Submit Results button.' };
      }
      
      // Validate submission structure
      if (typeof submission !== 'object' || submission === null || Array.isArray(submission)) {
        return { success: false, message: 'Invalid submission format. Expected JSON object like {"pto_days_count": int}.' };
      }
      
      if (!('pto_days_count' in submission)) {
        return { success: false, message: 'Missing "pto_days_count" field in submission. Expected format: {"pto_days_count": int}.' };
      }
      
      if (typeof submission.pto_days_count !== 'number') {
        return { success: false, message: 'The "pto_days_count" field must be a number. Expected format: {"pto_days_count": int}.' };
      }
      
      // Expected: 5 days (July 27-31) + 7 days (January 5-11) = 12 days
      const expectedDays = 12;
      
      if (submission.pto_days_count !== expectedDays) {
        return { 
          success: false, 
          message: `Incorrect PTO count for 2025. Expected ${expectedDays} days, got ${submission.pto_days_count} days.` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully found that ${submission.pto_days_count} PTO days were used in 2025.` 
      };
    },
  },
  {
    id: 'workday-set-personal-info',
    instructions: "Set the personal information to Gender: Female, Date of Birth: 01/02/1975, Marital Status: Married, Marital Status Date: 01/17/2025, Citizenship Status: Citizen (Romania), Primary Nationality: Romania",
    ux: 'Navigate to Personal Information and update all the specified fields',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { personalInfo } = appState;
      if (!personalInfo) {
        return { success: false, message: 'Personal information not found in app state.' };
      }
      
      const expectedValues = {
        gender: 'Female',
        dateOfBirth: '01/02/1975',
        maritalStatus: 'Married',
        maritalStatusDate: '01/17/2025',
        citizenshipStatus: 'Citizen (Romania)',
        nationality: 'Romania'
      };
      
      const errors = [];
      for (const [field, expectedValue] of Object.entries(expectedValues)) {
        if (personalInfo[field] !== expectedValue) {
          errors.push(`${field}: expected "${expectedValue}", got "${personalInfo[field]}"`);
        }
      }
      
      if (errors.length > 0) {
        return { 
          success: false, 
          message: `Personal information not set correctly:\n${errors.join('\n')}` 
        };
      }
      
      return { 
        success: true, 
        message: 'Personal information has been successfully set to the specified values.' 
      };
    },
  },
  {
    id: 'workday-find-fourth-m-country',
    instructions: 'Navigate to Personal Information > Legal Name > Country > By Country Alphabetically > M and return the fourth country in the list. Respond with JSON formatted {"country": str}',
    ux: 'Use the country dropdown in Legal Name section, select "By Country Alphabetically", find section M, count to the fourth country, then submit the result',
    require_result_submission: true,
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { submission } = appState;
      
      // Simple one-line cheat
      if (!((window as any).lastCheatLogM4) || Date.now() - (window as any).lastCheatLogM4 > 5000) {
        console.log(`[Cheat] {"country": "Malawi"}`);
        (window as any).lastCheatLogM4 = Date.now();
      }
      
      if (!submission) {
        return { success: false, message: 'No result submitted. Please navigate to the country list and submit the fourth M country.' };
      }
      
      // Check if submission is valid JSON with expected structure
      if (typeof submission !== 'object' || !submission.hasOwnProperty('country')) {
        return { 
          success: false, 
          message: 'Invalid JSON format. Expected: {"country": "CountryName"}' 
        };
      }
      
      // The fourth country starting with M in alphabetical order should be "Malawi"
      // Based on typical country lists: Macedonia, Madagascar, Malawi, Mali...
      const expectedCountry = 'Malawi';
      
      if (submission.country !== expectedCountry) {
        return { 
          success: false, 
          message: `Incorrect country. Expected the fourth M country: "${expectedCountry}", but got: "${submission.country}"` 
        };
      }
      
      return { 
        success: true, 
        message: 'Correct! Successfully found and submitted the fourth M country from the alphabetical list.' 
      };
    },
  },
  {
    id: 'workday-change-legal-name-john-jhonson',
    instructions: "Change the legal name to: Given Name: John, Family Name: Jhonson, Effective Date: 03/02/2025, Country: United States",
    ux: 'Navigate to Personal Information > Legal Name and update all the specified fields',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      const { legalNameData } = appState;
      if (!legalNameData) {
        return { success: false, message: 'Legal name data not found in app state.' };
      }
      
      const expectedValues = {
        effectiveDate: '03/02/2025',
        country: 'United States',
        givenName: 'John',
        familyName: 'Jhonson',
        comment: '' // Comment can be empty
      };
      
      const errors = [];
      for (const [field, expectedValue] of Object.entries(expectedValues)) {
        if (legalNameData[field] !== expectedValue) {
          errors.push(`${field}: expected "${expectedValue}", got "${legalNameData[field]}"`);
        }
      }
      
      if (errors.length > 0) {
        return { 
          success: false, 
          message: `Legal name not set correctly:\n${errors.join('\n')}` 
        };
      }
      
      return { 
        success: true, 
        message: 'Legal name has been successfully changed to John Jhonson.' 
      };
    },
  },
  {
    id: 'workday-lookup-holidays-nov-dec',
    instructions: "Open 'Absence' > 'Request Absence' and look up in the calendar November and December, and report all holidays or special days. Holidays are marked on the calendar. Output format {\"<holiday-name>\": \"mm/dd\"}",
    require_result_submission: true,
    ux: 'Navigate to Absence > Request Absence, then navigate to November and December months to identify holidays marked on the calendar',
    test: () => {
      const appState = (window as any).app_state;
      if (!appState) {
        return { success: false, message: 'App state not found.' };
      }
      
      // Expected holidays based on the companyEvents data in workday.jsx
      const expectedHolidays = {
        "Veterans Day": "11/11",
        "Thanksgiving": "11/27",
        "Black Friday": "11/28", 
        "Christmas Day": "12/25",
        "New Year's Eve": "12/31"
      };
      
      // This is a cheat message for the user
      console.log('[Cheat] Expected holidays:', JSON.stringify(expectedHolidays, null, 2));
      
      // Check if user has submitted JSON
      const submission = appState.submission;
      if (!submission) {
        return { 
          success: false, 
          message: 'No submission found. Please submit your answer as JSON via the Submit Results button.' 
        };
      }
      
      try {
        // The submission is already a JavaScript object, no need to parse it
        const submittedHolidays = submission;
        
        // Validate the submission format and content
        const errors = [];
        
        // Check if it's an object
        if (typeof submittedHolidays !== 'object' || Array.isArray(submittedHolidays)) {
          errors.push('Submission must be a JSON object, not an array or other type');
        } else {
          // Check each expected holiday
          for (const [holidayName, expectedDate] of Object.entries(expectedHolidays)) {
            if (!(holidayName in submittedHolidays)) {
              errors.push(`Missing holiday: ${holidayName}`);
            } else if (submittedHolidays[holidayName] !== expectedDate) {
              errors.push(`${holidayName}: expected "${expectedDate}", got "${submittedHolidays[holidayName]}"`);
            }
          }
          
          // Check for extra holidays that shouldn't be there
          for (const submittedHoliday of Object.keys(submittedHolidays)) {
            if (!(submittedHoliday in expectedHolidays)) {
              errors.push(`Unexpected holiday: ${submittedHoliday}`);
            }
          }
        }
        
        if (errors.length > 0) {
          return { 
            success: false, 
            message: `Holiday lookup incorrect:\n${errors.join('\n')}` 
          };
        }
        
        return { 
          success: true, 
          message: 'Holiday lookup completed successfully. All holidays correctly identified.' 
        };
        
      } catch (error) {
        return { 
          success: false, 
          message: `Error validating submission: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }
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
    : 'Complete the Workday interaction to satisfy the instructions',
  test: t.test,
  fullWidth: true,
  requireResultSubmission: !!t.require_result_submission,
}));

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Workday', appPath: '/workday' };

const WorkdayTasksApp: React.FC = () => {
  return (
    <TaskWrapper tasks={tasks} appName="Workday" appPath="/workday" />
  );
};

export default WorkdayTasksApp;


