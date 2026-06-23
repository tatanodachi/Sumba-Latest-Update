const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.tsx'));

const cleanLucideDeps = Array.from(new Set([
  "Calculator", "TrendingUp", "DollarSign", "Activity", "FileText", "Maximize2", "Minimize2", "Settings", 
  "LayoutDashboard", "List", "Users", "Shield", "Scale", "AlignLeft", "AlignRight", "EyeOff", "ArrowUpRight", 
  "Link2", "Coins", "Building2", "Stethoscope", "Briefcase", "ShieldCheck", "HeartPulse", "Sparkles", 
  "BrainCircuit", "RefreshCcw", "BarChart3", "Map", "Landmark", "ArrowRightLeft", "X", "Download", 
  "AlertTriangle", "Grid", "Clock", "Lock", "Unlock", "MapPin", "Building", "Cloud", "CloudOff", "ChevronDown", 
  "GripHorizontal", "Maximize", "Minimize", "BookOpen", "Target", "Search", "FolderTree", "BarChartHorizontal", 
  "Layers", "Microscope", "Bed", "Timer", "Network", "Plane", "Dna", "Bone", "Baby", "Eye", "Check", 
  "ArrowRight", "Ruler", "Calendar", "CalendarDays", "Plus", "Trash2", "ChevronsUpDown", "ChevronsDownUp", 
  "ChevronRight", "ChevronLeft", "ShieldAlert", "Award", "CheckCircle2", "HelpCircle", "Zap", "Monitor", 
  "Workflow", "Palmtree", "Focus", "Cross", "Leaf", "ActivitySquare", "ShieldPlus", "BedDouble", "Pencil", 
  "Anchor", "Droplets", "Tent", "Info"
]));

const cleanLucideStr = `import { ${cleanLucideDeps.join(', ')}, Map as MapIcon, Info as InfoIcon, PieChart as PieChartIcon } from "lucide-react";`;

files.forEach(f => {
  const file = path.join(viewsDir, f);
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix Firebase imports
  content = content.replace(/signInWithGoogle/g, 'loginWithGoogle');
  content = content.replace(/signOutUser/g, 'logoutUser');
  
  // Fix formulaTooltips
  content = content.replace(/import \{ formulaTooltips \} from "\.\.\/formulaTooltips";\n?/g, '');
  
  // Replace the whole lucide-react line
  content = content.replace(/import \{[\s\S]*?\} from "lucide-react";/, cleanLucideStr);
  
  // Fix zoning properties: proportion, area, clusterArea, sharingArea
  content = content.replace(/getZoningItem\(([^)]+)\)\.proportion/g, '(getZoningItem($1) as any).proportion');
  content = content.replace(/getZoningItem\(([^)]+)\)\.ratio/g, '(getZoningItem($1) as any).ratio');
  content = content.replace(/getZoningItem\(([^)]+)\)\.area/g, '(getZoningItem($1) as any).area');
  content = content.replace(/getZoningItem\(([^)]+)\)\.clusterArea/g, '(getZoningItem($1) as any).clusterArea');
  content = content.replace(/getZoningItem\(([^)]+)\)\.sharingArea/g, '(getZoningItem($1) as any).sharingArea');
  // and for map parameter:
  content = content.replace(/syncRegionBorders\(map/g, 'syncRegionBorders(map as any');
  
  fs.writeFileSync(file, content);
});

console.log('Fixed typings & imports in views');
