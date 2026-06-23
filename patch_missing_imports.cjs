const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.tsx'));

const reactImport = `import React, { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";\n`;
const rechartsImport = `import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from "recharts";\n`;
const constantsImport = `import { START_YEAR, DEFAULT_END_YEAR, MONTH_NAMES_SHORT, INITIAL_GROUPS, LAND_ZONING, getZoningItem, generateTimelineMonths } from "../constants";\n`;

files.forEach(f => {
  const file = path.join(viewsDir, f);
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('import React')) {
    content = reactImport + content;
  }
  if (!content.includes('import { BarChart')) {
    content = rechartsImport + content;
  }
  if (!content.includes('import { START_YEAR')) {
    content = constantsImport + content;
  }
  
  fs.writeFileSync(file, content);
});

console.log('Added generic view imports');
