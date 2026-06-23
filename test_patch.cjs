const fs = require('fs');

const app = fs.readFileSync('src/App.tsx', 'utf-8');
const strategic = fs.readFileSync('StrategicFoundationTransition.tsx', 'utf-8');
const siteMap = fs.readFileSync('SiteMapTransition.tsx', 'utf-8');

// STRATEGIC FOUNDATION (BENTO UI) start and end
const bentoStartStr = 'const BentoBox = memo(';
const customMapStartStr = '// === INTERACTIVE MAP CONSTANTS ==='; // This is in src/App.tsx below CollaborationStrategyView? Let's check!

let appBentoIdx = app.indexOf(bentoStartStr);
let appMapConstantsIdx = app.indexOf(customMapStartStr);

console.log("Bento Start:", appBentoIdx);
console.log("Map Constants:", appMapConstantsIdx);

if (appBentoIdx !== -1 && appMapConstantsIdx !== -1) {
  // We need to check what is in between
  // It should be BentoBox, BentoIcon, LAND_ZONING, getZoningItem, ProjectInfoFieldComp, ProjectOverviewView, CollaborationStrategyView
} else {
  // try to find where CollaborationStrategyView ends
  let collabEndIdx = app.indexOf('// === END INTERACTIVE MAP ==='); // let's see
  console.log("collab end", collabEndIdx);
}

