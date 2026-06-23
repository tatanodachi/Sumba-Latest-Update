const fs = require('fs');
let app = fs.readFileSync('src/App_updated.tsx', 'utf-8');

const requiredIcons = [
  "Building", "Map", "Focus", "Activity", "MapPin", "HeartPulse", "Cross", "Leaf", 
  "ActivitySquare", "ShieldPlus", "BedDouble", "CheckCircle2", "Pencil",
  "Plane", "Anchor", "Zap", "Droplets", "ArrowRight", "X", "Maximize2", "Minimize2", 
  "Network", "Palmtree", "Ruler", "Target"
]; // Note: "Map as MapIcon" needs special handling if not there

const requiredRecharts = [
  "PieChart", "Pie", "Cell", "ResponsiveContainer", "BarChart", "CartesianGrid", 
  "XAxis", "YAxis", "Legend", "Bar", "LineChart", "Line", "AreaChart", "Area", "ReferenceLine"
];

// Let's replace the whole recharts and lucide-react imports to be safe
// First, extract current recharts
const rechartsMatch = app.match(/import\s+{([^}]*)}\s+from\s+"recharts";/);
let currentRecharts = [];
if (rechartsMatch) {
  currentRecharts = rechartsMatch[1].split(',').map(s => s.trim()).filter(s => s);
  // add missing
  for (const item of requiredRecharts) {
    if (!currentRecharts.includes(item)) { // Warning: Tooltip as RechartsTooltip might be tricky. Let's just do simple includes.
      currentRecharts.push(item);
    }
  }
  // Ensure Tooltip as RechartsTooltip is there
  if (!currentRecharts.includes("Tooltip as RechartsTooltip")) {
     if (currentRecharts.includes("Tooltip")) {
         // Keep Tooltip if used normally elsewhere, but also add Tooltip as RechartsTooltip
         currentRecharts.push("Tooltip as RechartsTooltip");
     } else {
         currentRecharts.push("Tooltip as RechartsTooltip");
     }
  }
}

// Extract current lucide-react
const lucideMatch = app.match(/import\s+{([^}]*)}\s+from\s+"lucide-react";/);
let currentLucide = [];
if (lucideMatch) {
  currentLucide = lucideMatch[1].split(',').map(s => s.trim()).filter(s => s);
  for (const item of requiredIcons) {
    if (!currentLucide.includes(item)) {
      currentLucide.push(item);
    }
  }
  if (!currentLucide.includes("Map as MapIcon")) {
    currentLucide.push("Map as MapIcon");
  }
}

// Replace
if (rechartsMatch) {
  app = app.replace(rechartsMatch[0], `import {\n  ${currentRecharts.join(',\n  ')}\n} from "recharts";`);
}

if (lucideMatch) {
  app = app.replace(lucideMatch[0], `import {\n  ${currentLucide.join(',\n  ')}\n} from "lucide-react";`);
}

// Fix any dangling closing tags from the splice if necessary
// the map component is InteractiveDemographicMap
// let's check its export or last line
fs.writeFileSync('src/App.tsx', app);
console.log("Updated imports");
