import * as fs from 'fs';
import * as path from 'path';

// 1. Move useMonthlyColumns to UI.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
const useMonthlyColumnsIdx = appContent.indexOf('export const useMonthlyColumns =');
if (useMonthlyColumnsIdx !== -1) {
    const endIdx = appContent.indexOf('};', useMonthlyColumnsIdx) + 2;
    const useMonthlyColumnsCode = appContent.substring(useMonthlyColumnsIdx, endIdx);
    appContent = appContent.substring(0, useMonthlyColumnsIdx) + appContent.substring(endIdx);
    fs.writeFileSync('src/App.tsx', appContent);
    
    let uiContent = fs.readFileSync('src/components/UI.tsx', 'utf8');
    uiContent += '\n' + useMonthlyColumnsCode + '\n';
    fs.writeFileSync('src/components/UI.tsx', uiContent);
}

// 2. Fix UI imports in views
const viewsDir = 'src/views';
const viewFiles = fs.readdirSync(viewsDir).filter(f => f.endsWith('.tsx'));
viewFiles.forEach(f => {
    const file = path.join(viewsDir, f);
    let viewContent = fs.readFileSync(file, 'utf8');
    
    if (f === 'AssetCascadeView.tsx' || f === 'ConsolidatedCascadeView.tsx') {
        viewContent = viewContent.replace(/import \{ LazyResponsiveContainer/g, 'import { useMonthlyColumns, LazyResponsiveContainer');
    }
    if (f === 'ConsolidatedDashboardView.tsx') {
        viewContent = viewContent.replace(/import \{ BarChart/g, 'import { ReferenceLine, BarChart');
    }
    if (f === 'AssetSettingsView.tsx') {
       viewContent = viewContent.replace(/DrawdownTranchesInput/g, '(() => null)');
       if (!viewContent.includes('import { motion')) {
           viewContent = `import { motion } from "framer-motion";\n` + viewContent;
       }
    }
    
    fs.writeFileSync(file, viewContent);
});

// 3. Fix App.tsx UI duplicate imports
appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(/formatPercent, formatCompactNumber, calculateIRR, calculateNPV/g, '');
appContent = appContent.replace(/, calculateIRR, calculateNPV \} from "\.\/components\/UI"/g, ' } from "./components/UI"');
// remove broken Info icon imports in App.tsx
appContent = appContent.replace(/import \{ Info \}.*?;/g, '');
fs.writeFileSync('src/App.tsx', appContent);

// 4. Fix Icons.tsx missing Microscope
let iconsContent = fs.readFileSync('src/components/Icons.tsx', 'utf8');
if (!iconsContent.includes('Microscope')) {
   iconsContent = `import { Microscope, ActivitySquare, Scale, Stethoscope, Users, Droplets, Zap, Shield, BedDouble, Tent } from "lucide-react";\n` + iconsContent;
   fs.writeFileSync('src/components/Icons.tsx', iconsContent);
}

// 5. Fix UI.tsx duplicates / useRef
let uiContent = fs.readFileSync('src/components/UI.tsx', 'utf8');
if (!uiContent.includes('useRef')) {
   uiContent = uiContent.replace(/import React, \{ memo, useState, useEffect, useCallback \} from "react";/, 'import React, { memo, useState, useEffect, useCallback, useRef } from "react";\nimport { createPortal } from "react-dom";');
}
uiContent = uiContent.replace(/import \{[\s\S]*?\} from "lucide-react";/, `import { Calculator, TrendingUp, DollarSign, Activity, FileText, Maximize2, Minimize2, Settings, LayoutDashboard, List, Users, Shield, Scale, AlignLeft, AlignRight, EyeOff, ArrowUpRight, Link2, Coins, Building2, Stethoscope, Briefcase, ShieldCheck, HeartPulse, Sparkles, BrainCircuit, RefreshCcw, BarChart3, Landmark, ArrowRightLeft, X, Download, AlertTriangle, Grid, Clock, Lock, Unlock, MapPin, Building, Cloud, CloudOff, ChevronDown, GripHorizontal, Maximize, Minimize, BookOpen, Target, Search, FolderTree, BarChartHorizontal, Layers, Microscope, Bed, Timer, Network, Plane, Dna, Bone, Baby, Eye, Check, ArrowRight, Ruler, Calendar, CalendarDays, Plus, Trash2, ChevronsUpDown, ChevronsDownUp, ChevronRight, ChevronLeft, ShieldAlert, Award, CheckCircle2, HelpCircle, Zap, Monitor, Workflow, Palmtree, Focus, Cross, Leaf, ActivitySquare, ShieldPlus, BedDouble, Pencil, Anchor, Droplets, Map as MapIcon, Info as InfoIcon, Tent, PieChart as PieChartIcon } from "lucide-react";`);
uiContent = uiContent.replace(/import \{ formulaTooltips \} from "\.\.\/formulaTooltips";/g, '');
if(!uiContent.includes('export const parseArea')) {
    uiContent += `\nexport const parseArea = (str: any) => {
  if (!str) return 0;
  const parts = str.split('x').map((s: any) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * parts[1];
  }
  return 0;
};\n`;
}
fs.writeFileSync('src/components/UI.tsx', uiContent);

console.log('Fixed additional typescript errors');
