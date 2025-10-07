import React from 'react';
import TaskWrapper from '../src/TaskWrapper';

function createTaskComponent(): React.FC {
  // Lazy load to avoid CSS import issues during export
  const LazyComponent = React.lazy(() => import('./sap'));
  const C: React.FC = () => {
    return React.createElement(React.Suspense, { fallback: React.createElement('div', null, 'Loading...') }, 
      React.createElement(LazyComponent)
    );
  };
  return C;
}

type UiBenchTask = {
  id: string;
  instructions: string;
  test?: () => { success: boolean; message?: string };
  require_result_submission?: boolean;
};

const uiBenchTasks: UiBenchTask[] = [
  {
    id: 'sap-find-material-1287-company',
    instructions: 'What is the company that has material 1287 in vendor consignment, and the quantity. Format JSON response as {"company": str, "quantity": float}, and use the Submit Results button to send it.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      
      // Cheat logging - show once when test runs
      const lastLoggedKey = 'cheat_logged_sap_find_material_1287_company';
      if (!(window as any)[lastLoggedKey]) {
        console.clear();
        console.log(`[Cheat] {"company":"TATA MOTORS","quantity":9000}`);
        (window as any)[lastLoggedKey] = true;
      }
      
      if (!submission) return { success: false, message: 'No submission found in app state.' };
      if (typeof submission !== 'object' || submission === null) return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      if (submission.company !== 'TATA MOTORS') return { success: false, message: `Submission does not have correct company. Expected: TATA MOTORS, Got: ${submission.company || 'missing'}` };
      if (submission.quantity !== 9000) return { success: false, message: `Submission does not have correct quantity. Expected: 9000, Got: ${submission.quantity || 'missing'}` };
      const expectedSubmission = { company: 'TATA MOTORS', quantity: 9000 };
      if (JSON.stringify(submission) !== JSON.stringify(expectedSubmission)) {
        return { success: false, message: `Submission does not match expected value. Expected: ${JSON.stringify(expectedSubmission)}, Got: ${JSON.stringify(submission)}` };
      }
      return { success: true, message: 'Successfully submitted the correct company and quantity for material 1287 in vendor consignment.' };
    },
  },
  {
    id: 'sap-find-plants-material-100-210',
    instructions: 'What are the names of the plants that have material 100-210 in stock. Format JSON response as {"plants": list[str]}, and use the Submit Results button to send it.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      
      // Cheat logging - show once when test runs
      const lastLoggedKey = 'cheat_logged_sap_find_plants_material_100_210';
      if (!(window as any)[lastLoggedKey]) {
        console.clear();
        console.log(`[Cheat] {"plants":["PLANT GURGAON"]}`);
        (window as any)[lastLoggedKey] = true;
      }
      if (!submission) return { success: false, message: 'No submission found in app state.' };
      if (typeof submission !== 'object' || submission === null) return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      if (!submission.plants || !Array.isArray(submission.plants)) return { success: false, message: `Submission does not have correct plants property. Expected: {"plants": ["PLANT GURGAON"]}, Got: ${JSON.stringify(submission)}` };
      const expectedPlants = ['PLANT GURGAON'];
      if (JSON.stringify([...submission.plants].sort()) !== JSON.stringify(expectedPlants.sort())) {
        return { success: false, message: `Submission does not have correct plants. Expected: ${JSON.stringify(expectedPlants)}, Got: ${JSON.stringify(submission.plants)}` };
      }
      return { success: true, message: 'Successfully submitted the correct plant names for material 100-210.' };
    },
  },
  {
    id: 'sap-count-materials-per-company',
    instructions: 'For each material on this list ["1287","100-210","200000054","300-400"] report the number of companies that have it in stock. Format JSON response as {"<material-id>": <count:int>}, and use the Submit Results button to send it.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      
      // Cheat logging - show once when test runs
      const lastLoggedKey = 'cheat_logged_sap_count_materials_per_company';
      if (!(window as any)[lastLoggedKey]) {
        console.clear();
        console.log(`[Cheat] {"1287":2,"100-210":1,"200000054":2,"300-400":0}`);
        (window as any)[lastLoggedKey] = true;
      }
      
      if (!submission) return { success: false, message: 'No submission found in app state.' };
      if (typeof submission !== 'object' || submission === null) return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      
      const expectedCounts = { "1287": 2, "100-210": 1, "200000054": 2, "300-400": 0 };
      const validMaterialIds = ["1287", "100-210", "200000054", "300-400"];
      
      // Check that all keys in submission are valid material IDs
      for (const material of Object.keys(submission)) {
        if (!validMaterialIds.includes(material)) {
          return { success: false, message: `Invalid material ID "${material}" in submission. Valid materials: ${JSON.stringify(validMaterialIds)}, Got: ${JSON.stringify(submission)}` };
        }
      }
      
      // Check required materials with non-zero counts are present and correct
      for (const [material, expectedCount] of Object.entries(expectedCounts)) {
        if (expectedCount > 0) {
          if (!(material in submission)) {
            return { success: false, message: `Missing required material "${material}" in submission. Expected count: ${expectedCount}, Got: ${JSON.stringify(submission)}` };
          }
          if (submission[material] !== expectedCount) {
            return { success: false, message: `Incorrect count for material "${material}". Expected: ${expectedCount}, Got: ${submission[material]}` };
          }
        }
      }
      
      // Check that if zero-count materials are included, they have correct values
      for (const [material, expectedCount] of Object.entries(expectedCounts)) {
        if (expectedCount === 0 && material in submission) {
          if (submission[material] !== 0) {
            return { success: false, message: `Incorrect count for material "${material}". Expected: 0, Got: ${submission[material]}` };
          }
        }
      }
      
      return { success: true, message: 'Successfully submitted the correct company count per material.' };
    },
  },
  {
    id: 'sap-filter-materials-containing-fan',
    instructions: 'Open MMBE form and use Search for material (icon next to material input) to open the Material Number modal. From there use the filters to find out how many materials contain the string "fan". Format JSON response as {"count": <count:int>}, and use the Submit Results button to send it.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      
      // Cheat logging - show once when test runs
      const lastLoggedKey = 'cheat_logged_sap_filter_materials_containing_fan';
      if (!(window as any)[lastLoggedKey]) {
        console.clear();
        console.log(`[Cheat] {"count":3}`);
        (window as any)[lastLoggedKey] = true;
      }
      
      if (!submission) return { success: false, message: 'No submission found in app state.' };
      if (typeof submission !== 'object' || submission === null) return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      if (submission.count !== 3) return { success: false, message: `Submission does not have correct count. Expected: 3, Got: ${submission.count || 'missing'}` };
      const expectedSubmission = { count: 3 };
      if (JSON.stringify(submission) !== JSON.stringify(expectedSubmission)) {
        return { success: false, message: `Submission does not match expected value. Expected: ${JSON.stringify(expectedSubmission)}, Got: ${JSON.stringify(submission)}` };
      }
      return { success: true, message: 'Successfully submitted the correct count of materials containing "fan".' };
    },
  },
  {
    id: 'sap-filter-materials-b-to-g-with-fg',
    instructions: 'Open the Stock Overview (MMBE) form (Logistics -> Materials Management -> Inventory Management). Use the "Search for material" button (the icon next to the material input) to open the Material Number modal. In the modal, use the filters to find materials where the material description is between B and G (alphabetically) AND the Material Number contains "FG". Format JSON response as {"materials": [list of material codes]}, and use the Submit Results button to send it.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      
      // Cheat logging - show once when test runs
      const lastLoggedKey = 'cheat_logged_sap_filter_materials_b_to_g_with_fg';
      if (!(window as any)[lastLoggedKey]) {
        console.clear();
        console.log(`[Cheat] {"materials":["FG1_CP","FG2_CP","FG011","FG233","FG126","FG129","FG130","FG228","FG29-1","FG29","FG6200"]}`);
        (window as any)[lastLoggedKey] = true;
      }
      
      if (!submission) return { success: false, message: 'No submission found in app state.' };
      if (typeof submission !== 'object' || submission === null) return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      if (!submission.materials || !Array.isArray(submission.materials)) return { success: false, message: `Submission does not have correct materials property. Expected: {"materials": [array]}, Got: ${JSON.stringify(submission)}` };
      
      const expectedMaterials = ["FG1_CP", "FG2_CP", "FG011", "FG233", "FG126", "FG129", "FG130", "FG228", "FG29-1", "FG29", "FG6200"];
      const sortedSubmission = [...submission.materials].sort();
      const sortedExpected = [...expectedMaterials].sort();
      
      if (JSON.stringify(sortedSubmission) !== JSON.stringify(sortedExpected)) {
        return { success: false, message: `Submission does not have correct materials. Expected: ${JSON.stringify(expectedMaterials)}, Got: ${JSON.stringify(submission.materials)}` };
      }
      
      return { success: true, message: 'Successfully submitted the correct list of materials with description between B-G and containing "FG".' };
    },
  },
  {
    id: 'sap-find-highest-reserved-stock-sg011',
    instructions: 'Use MMBE (Inventory Stock Overview) form to find out which plant has the highest reserved stock of SG011. Format JSON response as {"plant": "plant_name"}, and use the Submit Results button to send it.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      
      // Cheat logging - show once when test runs
      const lastLoggedKey = 'cheat_logged_sap_find_highest_reserved_stock_sg011';
      if (!(window as any)[lastLoggedKey]) {
        console.clear();
        console.log(`[Cheat] {"plant":"SIEMENS NUREMBERG"}`);
        (window as any)[lastLoggedKey] = true;
      }
      
      if (!submission) return { success: false, message: 'No submission found in app state.' };
      if (typeof submission !== 'object' || submission === null) return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      if (submission.plant !== 'SIEMENS NUREMBERG') return { success: false, message: `Submission does not have correct plant. Expected: SIEMENS NUREMBERG, Got: ${submission.plant || 'missing'}` };
      const expectedSubmission = { plant: 'SIEMENS NUREMBERG' };
      if (JSON.stringify(submission) !== JSON.stringify(expectedSubmission)) {
        return { success: false, message: `Submission does not match expected value. Expected: ${JSON.stringify(expectedSubmission)}, Got: ${JSON.stringify(submission)}` };
      }
      return { success: true, message: 'Successfully submitted the correct plant with highest reserved stock for SG011.' };
    },
  },
  {
    id: 'sap-lookup-material-fg1-cp-description-plants',
    instructions: 'Look up material FG1_CP to see its full description and plants where this material is in stock. Format JSON response as {"description": str, "plants": list[str]}, and use the Submit Results button to send it. You need to use both the stock search and the Search for Materials view.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      
      // Cheat logging - show once when test runs
      const lastLoggedKey = 'cheat_logged_sap_lookup_material_fg1_cp_description_plants';
      if (!(window as any)[lastLoggedKey]) {
        console.clear();
        console.log(`[Cheat] {"description":"FG1_CP, SHAFT WITH ROLLING BEARINGS","plants":["PLANT JAMSHEDPUR","TOYOTA TOYOTA CITY","TOYOTA GEORGETOWN"]}`);
        (window as any)[lastLoggedKey] = true;
      }
      
      if (!submission) return { success: false, message: 'No submission found in app state.' };
      if (typeof submission !== 'object' || submission === null) return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      if (!submission.description || typeof submission.description !== 'string') return { success: false, message: `Submission does not have correct description property. Expected: string, Got: ${typeof submission.description}` };
      if (submission.description !== 'FG1_CP, SHAFT WITH ROLLING BEARINGS') return { success: false, message: `Submission does not have correct description. Expected: "FG1_CP, SHAFT WITH ROLLING BEARINGS", Got: "${submission.description}"` };
      if (!submission.plants || !Array.isArray(submission.plants)) return { success: false, message: `Submission does not have correct plants property. Expected: array, Got: ${typeof submission.plants}` };
      
      const expectedPlants = ["PLANT JAMSHEDPUR", "TOYOTA TOYOTA CITY", "TOYOTA GEORGETOWN"];
      const sortedSubmission = [...submission.plants].sort();
      const sortedExpected = [...expectedPlants].sort();
      
      if (JSON.stringify(sortedSubmission) !== JSON.stringify(sortedExpected)) {
        return { success: false, message: `Submission does not have correct plants. Expected: ${JSON.stringify(expectedPlants)}, Got: ${JSON.stringify(submission.plants)}` };
      }
      
      return { success: true, message: 'Successfully submitted the correct description and plants for material FG1_CP.' };
    },
  },
  {
    id: 'sap-find-storage-locations-fg1-cp-jamshedpur',
    instructions: 'Find the list of storage locations for material FG1_CP and plant PLANT JAMSHEDPUR. Format JSON response as {"storage_locations": [list of storage location names]}, and use the Submit Results button to send it.',
    require_result_submission: true,
    test: () => {
      const submission = (window as any).app_state?.submission;
      
      // Cheat logging - show once when test runs
      const lastLoggedKey = 'cheat_logged_sap_find_storage_locations_fg1_cp_jamshedpur';
      if (!(window as any)[lastLoggedKey]) {
        console.clear();
        console.log(`[Cheat] {"storage_locations":["AUTOMOTIVE PARTS","QUALITY CHECK"]}`);
        (window as any)[lastLoggedKey] = true;
      }
      
      if (!submission) return { success: false, message: 'No submission found in app state.' };
      if (typeof submission !== 'object' || submission === null) return { success: false, message: `Submission is not an object. Got: ${typeof submission}` };
      if (!submission.storage_locations || !Array.isArray(submission.storage_locations)) return { success: false, message: `Submission does not have correct storage_locations property. Expected: array, Got: ${typeof submission.storage_locations}` };
      
      const expectedLocations = ["AUTOMOTIVE PARTS", "QUALITY CHECK"];
      const sortedSubmission = [...submission.storage_locations].sort();
      const sortedExpected = [...expectedLocations].sort();
      
      if (JSON.stringify(sortedSubmission) !== JSON.stringify(sortedExpected)) {
        return { success: false, message: `Submission does not have correct storage locations. Expected: ${JSON.stringify(expectedLocations)}, Got: ${JSON.stringify(submission.storage_locations)}` };
      }
      
      return { success: true, message: 'Successfully submitted the correct storage locations for material FG1_CP at PLANT JAMSHEDPUR.' };
    },
  },
];



const tasks = uiBenchTasks.map((t, index) => ({
  id: index + 1,
  name: t.id,
  component: createTaskComponent(),
  task: t.instructions,
  ux: t.require_result_submission
    ? 'Submit the requested JSON via the Submit Results button'
    : 'Complete the SAP stock interaction to satisfy the instructions',
  test: t.test,
  fullWidth: true,
  requireResultSubmission: !!t.require_result_submission,
}));

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'SAP Stock Overview', appPath: '/sap-stock' };

const SAPTasksApp: React.FC = () => {
  return <TaskWrapper tasks={tasks} appName="SAP Stock Overview" appPath="/sap-stock" />;
};

export default SAPTasksApp;


