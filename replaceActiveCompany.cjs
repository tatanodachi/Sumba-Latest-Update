const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace standard states
content = content.replace(/const \[activeCompany, setActiveCompany\] = useState\("opco"\);\n/g, '');

// Replace s.company === activeCompany
content = content.replace(/s\.company === activeCompany/g, 's.company === clusterFilter');

// Nav header activeCompany labels
content = content.replace(/activeCompany === "opco" \? \([\s\S]*?<Activity className="text-\[#1C6048\]" \/>[\s\S]*?\) : activeCompany === "propco" \? \([\s\S]*?<Building2 className="text-\[#9B8B70\]" \/>[\s\S]*?\) : \(/gm, 
'clusterFilter !== "consolidated" ? (\n                  <Activity className="text-[#1C6048]" />\n                ) : (');

content = content.replace(/activeCompany === "opco"\s*\n\s*\? "OpCo Model"\s*\n\s*: activeCompany === "propco"\s*\n\s*\? "PropCo Model"\s*\n\s*: "HoldCo VG"/gm, 
'clusterFilter !== "consolidated"\n                              ? ((assetAssumptions?.clusters || INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters)[clusterFilter]?.name || "Asset Model")\n                              : "HoldCo VG"');

// disabled={activeCompany === "consolidated"}
content = content.replace(/activeCompany === "consolidated"/g, 'clusterFilter === "consolidated"');

// isLocked={activeCompany === "opco" ? isLockedOpCo : isLockedPropCo}
content = content.replace(/activeCompany === "opco" \? isLockedOpCo : isLockedPropCo/g, 'isLockedOpCo');

// (activeCompany === "opco" || activeCompany === "propco")
content = content.replace(/\(activeCompany === "opco" \|\| activeCompany === "propco"\)/g, 'clusterFilter !== "consolidated"');

// activeCompany={activeCompany}
content = content.replace(/activeCompany=\{activeCompany\}/g, 'activeCompany={clusterFilter}');

fs.writeFileSync('src/App.tsx', content, 'utf-8');
