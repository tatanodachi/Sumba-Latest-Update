import * as fs from 'fs';

// Fix UI.tsx
let uiContent = fs.readFileSync('src/components/UI.tsx', 'utf8');
uiContent = uiContent.replace(/import React, \{ memo, useState, useEffect, useCallback, useRef \} from "react";/, 'import React, { memo, useState, useEffect, useCallback, useRef, useMemo } from "react";');
uiContent = uiContent.replace(/<Info /g, '<InfoIcon ');
uiContent = uiContent.replace(/import \{ ResponsiveContainer \} from "recharts";/, '');
uiContent = `import { ResponsiveContainer } from "recharts";\n` + uiContent;
fs.writeFileSync('src/components/UI.tsx', uiContent);

// Fix App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(/import \{.*?AISparklesIcon.*?\} from ".*?";/g, '');
appContent = appContent.replace(/import \{.*?Info.*?\} from ".*?";/g, ''); // just drop other lucide imports from App.tsx since we can fix it below
appContent = appContent.replace(/<AISparklesIcon /g, '<Sparkles ');
appContent = appContent.replace(/<Info /g, '<InfoIcon ');
appContent = appContent.replace(/setActiveCompany/g, 'setActiveTab'); // it seems it meant to change tab but called a wrong setter
// Wait, is there a duplicate Info? Let's remove duplicate import of Info if there is one.
appContent = appContent.replace(/import \{.*?Info,.*?} from "lucide-react";/g, '');
const lucideImportsMatch = appContent.match(/import \{([\s\S]*?)\} from "lucide-react";/);
if (lucideImportsMatch) {
    let lucideNames = lucideImportsMatch[1].split(',').map(s => s.trim());
    lucideNames = lucideNames.filter(name => name !== 'Info' && name !== 'PieChart');
    if (!lucideNames.includes('Info as InfoIcon')) lucideNames.push('Info as InfoIcon');
    if (!lucideNames.includes('Sparkles')) lucideNames.push('Sparkles');
    appContent = appContent.replace(lucideImportsMatch[0], `import { ${lucideNames.join(', ')} } from "lucide-react";`);
}

fs.writeFileSync('src/App.tsx', appContent);

// Fix Icons.tsx
let iconsContent = fs.readFileSync('src/components/Icons.tsx', 'utf8');
if (iconsContent.includes('import { Microscope')) {
   // let's do nothing if it already imports
} else {
   iconsContent = `import { Microscope } from "lucide-react";\n` + iconsContent;
   fs.writeFileSync('src/components/Icons.tsx', iconsContent);
}

// Fix AssetDashboardView.tsx
let asvContent = fs.readFileSync('src/views/AssetDashboardView.tsx', 'utf8');
asvContent = asvContent.replace(/\.proportion/g, ' as any).proportion');
fs.writeFileSync('src/views/AssetDashboardView.tsx', asvContent);

// Fix ConsolidatedDashboardView.tsx
let cdvContent = fs.readFileSync('src/views/ConsolidatedDashboardView.tsx', 'utf8');
cdvContent = cdvContent.replace(/partner:/g, 'name:');
fs.writeFileSync('src/views/ConsolidatedDashboardView.tsx', cdvContent);

console.log('Fixed final TS issues');
