import * as fs from 'fs';

let uiContent = fs.readFileSync('src/components/UI.tsx', 'utf8');

uiContent = uiContent.replace(/cols\.push\(\{ \.\.\.d, _isAnnualTotal: true, isExpanded: expandedYears\[i\] \}\);/g, 
  'cols.push({ ...d, _isAnnualTotal: true, isExpanded: expandedYears[i], colType: "year", defaultLabel: d.year });');

uiContent = uiContent.replace(/const monthData = \{ \.\.\.d, _isMonth: true, monthIndex: m \};/g,
  'const monthData = { ...d, _isMonth: true, monthIndex: m, colType: "month", defaultLabel: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1] };');

fs.writeFileSync('src/components/UI.tsx', uiContent);
