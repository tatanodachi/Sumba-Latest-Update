const fs = require('fs');

const constantsContent = `
export const START_YEAR = 2026;
export const DEFAULT_END_YEAR = 2028;
export const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
export const INITIAL_GROUPS = [
  { id: "land", title: "1. Land Acquisition", start: 1, duration: 6, color: "#1C6048", tasks: [] },
  { id: "design", title: "2. Design & Licensing", start: 3, duration: 8, color: "#8B9D90", tasks: [] },
  { id: "constr", title: "3. Construction & Civil", start: 9, duration: 18, color: "#4A6E7D", tasks: [] },
  { id: "ffe", title: "4. FF&E / Medical Equipment", start: 20, duration: 6, color: "#9B8B70", tasks: [] },
  { id: "preop", title: "5. Pre-Operating, Licensing & Testing", start: 22, duration: 4, color: "#C05640", tasks: [] },
  { id: "ops", title: "6. Commercial Opening", start: 26, duration: 60, color: "#1E2F31", tasks: [] },
];
export const LAND_ZONING = [
  { zone: "A1", desc: "Main Hospital Building", color: "#1E2F31" },
  { zone: "A2", desc: "Outpatient Clinic & Emergency", color: "#4A6E7D" },
  { zone: "B1", desc: "Diagnostic & Imaging Center", color: "#1C6048" },
  { zone: "B2", desc: "Radiotherapy Bunker", color: "#8B9D90" },
  { zone: "C1", desc: "Patient Wards & Recovery", color: "#9B8B70" },
  { zone: "C2", desc: "Staff Facilities & Admin", color: "#C05640" },
  { zone: "D1", desc: "Central Utilities & MEP", color: "#4C4A4B" },
];
export const getZoningItem = (idx) => {
  return LAND_ZONING[idx % LAND_ZONING.length];
};
export const generateTimelineMonths = (startYear, durationMonths) => {
  const result = [];
  for (let i = 0; i < durationMonths; i++) {
    const monthIndex = i % 12;
    const year = startYear + Math.floor(i / 12);
    result.push(\`\${MONTH_NAMES_SHORT[monthIndex]} '\${year.toString().slice(-2)}\`);
  }
  return result;
};
`;

fs.writeFileSync('src/constants.ts', constantsContent);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(/const START_YEAR = 2026;/g, '');
appContent = appContent.replace(/const DEFAULT_END_YEAR = 2028;/g, '');
appContent = appContent.replace(/const MONTH_NAMES_SHORT = \[[\s\S]*?\];/g, '');
appContent = appContent.replace(/const INITIAL_GROUPS = \[[\s\S]*?\];/g, '');
appContent = appContent.replace(/const LAND_ZONING = \[[\s\S]*?\n\];/g, '');
// For getZoningItem
const zoningMatcher = /const getZoningItem = \(idx(?:.*)\) => \{[\s\S]*?^};/m;
appContent = appContent.replace(zoningMatcher, '');

const tlMatcher = /const generateTimelineMonths = \((?:.*)\) => \{[\s\S]*?^};/m;
appContent = appContent.replace(tlMatcher, '');

// Prepend import
appContent = "import { START_YEAR, DEFAULT_END_YEAR, MONTH_NAMES_SHORT, INITIAL_GROUPS, LAND_ZONING, getZoningItem, generateTimelineMonths } from './constants';\n" + appContent;

fs.writeFileSync('src/App.tsx', appContent);
console.log('Constants extracted');
