import fs from 'fs';

// Fix MasterTimelineView.tsx
let mtv = fs.readFileSync('src/views/MasterTimelineView.tsx', 'utf8');
mtv = mtv.replace('TIMELINE_MONTHS.map((m) => m.year)', 'TIMELINE_MONTHS.map((m: any) => m.year as number)');
mtv = mtv.replace('return compressedBlocks.reduce((acc, curr) => {', 'return compressedBlocks.reduce((acc: any, curr: any) => {');
fs.writeFileSync('src/views/MasterTimelineView.tsx', mtv);

// Fix ProjectOverviewView.tsx
let pov = fs.readFileSync('src/views/ProjectOverviewView.tsx', 'utf8');
pov = pov.replace(/getZoningItem\(hoveredIdx\)\?/g, '(getZoningItem(hoveredIdx) as any)?');
pov = pov.replace(/getZoningItem\(polygon\.idx\)/g, '(getZoningItem(polygon.idx) as any)');
pov = pov.replace(/hoveredItem\.proportion/g, '(hoveredItem as any).proportion');
pov = pov.replace(/hoveredItem\.ratio/g, '(hoveredItem as any).ratio');
pov = pov.replace(/hoveredItem\.color/g, '(hoveredItem as any).color');
pov = pov.replace(/item\.color/g, '(item as any).color');
pov = pov.replace(/item\.proportion/g, '(item as any).proportion');
pov = pov.replace(/item\.clusterArea/g, '(item as any).clusterArea');
pov = pov.replace(/item\.sharingArea/g, '(item as any).sharingArea');
pov = pov.replace(/item\.area/g, '(item as any).area');
pov = pov.replace(/item\.ratio/g, '(item as any).ratio');
fs.writeFileSync('src/views/ProjectOverviewView.tsx', pov);

// Fix InteractiveDemographicMap.tsx
let idm = fs.readFileSync('src/views/InteractiveDemographicMap.tsx', 'utf8');
idm = idm.replace(/location\.tier/g, '(location as any).tier');
idm = idm.replace(/loc\.tier/g, '(loc as any).tier');
fs.writeFileSync('src/views/InteractiveDemographicMap.tsx', idm);

console.log("Fixes applied.");
