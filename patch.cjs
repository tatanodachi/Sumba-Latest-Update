const fs = require('fs');

const app = fs.readFileSync('src/App.tsx', 'utf-8');
const strategic = fs.readFileSync('StrategicFoundationTransition.tsx', 'utf-8');
const siteMap = fs.readFileSync('SiteMapTransition.tsx', 'utf-8');

// 1. Identify Strategic Foundation Payload
const strategicPayloadStart = strategic.indexOf('const BentoBox = memo(');
if (strategicPayloadStart === -1) throw new Error("Could not find start of strategic payload");
const strategicPayload = strategic.substring(strategicPayloadStart);

// 2. Identify Site Map Payload
const siteMapPayloadStart = siteMap.indexOf('// === INTERACTIVE MAP CONSTANTS ===');
const siteMapPayloadEnd = siteMap.indexOf('export default'); // Might not be there, check if there is an export
let siteMapPayload = '';
if (siteMapPayloadStart === -1) throw new Error("Could not find start of map payload");

// Map payload should be everything until export default or end of file
if (siteMap.indexOf('export default') !== -1) {
  siteMapPayload = siteMap.substring(siteMapPayloadStart, siteMap.indexOf('export default'));
} else {
  siteMapPayload = siteMap.substring(siteMapPayloadStart);
}

// 3. Find boundaries in App.tsx
const appBentoIdx = app.indexOf('const BentoBox = memo(');
const appMapConstsIdx = app.indexOf('// === INTERACTIVE MAP CONSTANTS ===');
const appEndMapIdx = app.indexOf('// === END INTERACTIVE MAP ===');
const appClinProgIdx = app.indexOf('const ClinicalProgrammingView = memo(() => {');

console.log("App Bento Idx", appBentoIdx);
console.log("App Map Consts Idx", appMapConstsIdx);
console.log("App Clin Prog", appClinProgIdx);

if (appBentoIdx !== -1 && appMapConstsIdx !== -1 && appClinProgIdx !== -1) {
  // we will replace from appBentoIdx to appMapConstsIdx with strategicPayload
  // and from appMapConstsIdx to appClinProgIdx with siteMapPayload + `\n// === END INTERACTIVE MAP ===\n\n`
  
  // Wait, let's make sure there isn't any trailing text out of place in strategicPayload
  let strategicCleaned = strategicPayload;
  
  let newApp = app.substring(0, appBentoIdx) + strategicCleaned + '\n\n' + siteMapPayload + '\n\n// === END INTERACTIVE MAP ===\n\n' + app.substring(appClinProgIdx);
  
  // 4. Update imports
  // Need to ensure all lucide-react imports exist
  let importBlockStart = newApp.indexOf('import {');
  
  // Actually, we can just replace the whole lucide-react import
  // Let's find "lucide-react" import block
  const lucideStart = newApp.indexOf('import {', newApp.indexOf('recharts')); // after recharts is lucide?
  const lucideEnd = newApp.indexOf('} from "lucide-react";');
  
  fs.writeFileSync('src/App_updated.tsx', newApp);
  console.log("Wrote to src/App_updated.tsx");
} else {
  console.log("Could not patch.");
}
