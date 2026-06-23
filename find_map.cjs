const fs = require('fs');

const app = fs.readFileSync('src/App.tsx', 'utf-8');

const mapConstsApp = '// === INTERACTIVE MAP CONSTANTS ===';
const mapConstsAppIdx = app.indexOf(mapConstsApp);

const clinProgramApp = 'const ClinicalProgrammingView = memo(() => {';
const clinProgramAppIdx = app.indexOf(clinProgramApp);

console.log("Map Constants in App:", mapConstsAppIdx);
console.log("Clinical Programming in App:", clinProgramAppIdx);
