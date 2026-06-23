const fs = require('fs');
let code = fs.readFileSync('src/components/UI.tsx', 'utf8');

const oldCode = `const monthData = { ...d, _isMonth: true, monthIndex: m, colType: "month", defaultLabel: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1], yearKey };`;

const newCode = `const monthLabel = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
          const label = isMonthlyGlobal ? monthLabel + " " + (d.year ? String(d.year).replace("Year ", "Y") : "") : monthLabel;
          const monthData = { ...d, _isMonth: true, monthIndex: m, colType: "month", defaultLabel: label, yearKey };`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/UI.tsx', code);
