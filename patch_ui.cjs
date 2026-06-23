const fs = require('fs');
let code = fs.readFileSync('src/components/UI.tsx', 'utf8');

const oldCode = `  const columns = useMemo(() => {
    if (!annualData) return [];

    const isMonthlyGlobal = viewResolution === "monthly";
    const cols = [];
    annualData.forEach((d, i) => {
      const yearKey = typeof d.year !== "undefined" ? String(d.year) : String(i);
      const isExpanded = isMonthlyGlobal || expandedYears[yearKey];
      cols.push({ ...d, _isAnnualTotal: true, isExpanded: isExpanded, colType: "year", defaultLabel: d.year, yearKey });

      if (isExpanded) {`;

const newCode = `  const columns = useMemo(() => {
    if (!annualData) return [];

    const isMonthlyGlobal = viewResolution === "monthly";
    const cols = [];
    annualData.forEach((d, i) => {
      const yearKey = typeof d.year !== "undefined" ? String(d.year) : String(i);
      const isExpanded = isMonthlyGlobal || expandedYears[yearKey];
      
      if (!isMonthlyGlobal) {
        cols.push({ ...d, _isAnnualTotal: true, isExpanded: isExpanded, colType: "year", defaultLabel: d.year, yearKey });
      }

      if (isExpanded) {`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/UI.tsx', code);
