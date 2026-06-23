const fs = require('fs');

const appRaw = fs.readFileSync('src/App.tsx', 'utf-8');
const strategic = fs.readFileSync('StrategicFoundationTransition.tsx', 'utf-8');
const siteMap = fs.readFileSync('SiteMapTransition.tsx', 'utf-8');

// The file was previously saved with duplicates.
// I will just read from the original App.tsx or use the string boundaries to cut out the duplicate.
// Wait, `appRaw` currently has duplicates. Let's find the first `// === INTERACTIVE MAP CONSTANTS ===` and the second one.
const firstMapConst = appRaw.indexOf('// === INTERACTIVE MAP CONSTANTS ===');
const secondMapConst = appRaw.indexOf('// === INTERACTIVE MAP CONSTANTS ===', firstMapConst + 1);

let newApp = appRaw;

if (firstMapConst !== -1 && secondMapConst !== -1) {
  // We want to delete everything from the first one to just before the second one
  newApp = appRaw.substring(0, firstMapConst) + appRaw.substring(secondMapConst);
  fs.writeFileSync('src/App.tsx', newApp);
  console.log('Removed duplicates!');
} else {
  console.log('Duplicates not found?');
}
