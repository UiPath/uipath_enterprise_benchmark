import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import task adapters that expose tasksForExport and appInfo
import * as ComboBox from '../apps/combo-box-tasks';
import * as DatePickers from '../apps/date-pickers';
import * as TimePickers from '../apps/time-pickers';
import * as InputBoxes from '../apps/input-boxes';
import * as NavListsTables from '../apps/navigation-lists-tables';
import * as NavHierarchical from '../apps/navigation-hierarchical-spatial';
import * as NavSearch from '../apps/navigation-search-interaction';
import * as Kanban from '../apps/kanban-tasks';
import * as Workday from '../apps/workday-tasks';
import * as SAP from '../apps/sap-stock-overview-tasks';
import * as Concur from '../apps/concur-tasks';
import * as Salesforce from '../apps/salesforce-tasks';
import * as CopyPasteTasks from '../apps/copy-paste-tasks';
import * as BusinessProcessTasks from '../apps/business-process-tasks';

type AppModule = {
  tasksForExport: { id: number; task: string; ux: string }[];
  appInfo: { appName: string; appPath: string };
};

const modules: [string, AppModule][] = [
  ['combo-box-tasks.tsx', ComboBox as unknown as AppModule],
  ['date-pickers.tsx', DatePickers as unknown as AppModule],
  ['time-pickers.tsx', TimePickers as unknown as AppModule],
  ['input-boxes.tsx', InputBoxes as unknown as AppModule],
  ['navigation-lists-tables.tsx', NavListsTables as unknown as AppModule],
  ['navigation-hierarchical-spatial.tsx', NavHierarchical as unknown as AppModule],
  ['navigation-search-interaction.tsx', NavSearch as unknown as AppModule],
  ['kanban-tasks.tsx', Kanban as unknown as AppModule],
  ['workday-tasks.tsx', Workday as unknown as AppModule],
  ['sap-stock-overview-tasks.tsx', SAP as unknown as AppModule],
  ['concur-tasks.tsx', Concur as unknown as AppModule],
  ['salesforce-tasks.tsx', Salesforce as unknown as AppModule],
  ['copy-paste-tasks.tsx', CopyPasteTasks as unknown as AppModule],
  ['business-process-tasks.tsx', BusinessProcessTasks as unknown as AppModule],
];

function main() {
  const webVoyagerTasks: any[] = [];
  const perFileCounts: { file: string; count: number; name: string }[] = [];

  for (const [file, mod] of modules) {
    if (!mod?.tasksForExport || !mod?.appInfo) {
      console.log(`✗ Missing programmatic exports in ${file}`);
      continue;
    }
    perFileCounts.push({ file, count: mod.tasksForExport.length, name: mod.appInfo.appName });
    const webName = mod.appInfo.appPath.replace('/', '');
    for (const t of mod.tasksForExport) {
      webVoyagerTasks.push({
        web_name: webName,
        id: `${webName}--${t.id}`,
        ques: t.task,
        ux_hint: t.ux,
        web: `http://74.234.189.120:3001${mod.appInfo.appPath}/${t.id}?mode=test`,
      });
    }
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = path.join(__dirname, '..', 'deterministic_bench.json');
  fs.writeFileSync(outputPath, JSON.stringify(webVoyagerTasks, null, 2));

  const total = webVoyagerTasks.length;
  console.log(`Exported ${total} tasks to ${outputPath}`);
  console.log('\nPer-file counts:');
  for (const r of perFileCounts) {
    console.log(`- ${r.file}: ${r.count} (${r.name})`);
  }
}

main();


