const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = appContent.indexOf('const targetRegions = [];');
const endIndexStr = '      { from: "El Tari Airport", to: "Komodo Airport" },\n    ],\n  },\n];\n';
const endIndex = appContent.indexOf(endIndexStr) + endIndexStr.length;

if (startIndex !== -1 && appContent.indexOf(endIndexStr) !== -1) {
    const extractedContent = appContent.substring(startIndex, endIndex);
    
    // Modify extracted content to export them
    let newConstants = extractedContent;
    newConstants = newConstants.replace(/const targetRegions/g, 'export const targetRegions');
    newConstants = newConstants.replace(/const activeRegions/g, 'export const activeRegions');
    newConstants = newConstants.replace(/const mapLocations/g, 'export const mapLocations');
    newConstants = newConstants.replace(/const flightRoutes/g, 'export const flightRoutes');
    
    appContent = appContent.substring(0, startIndex) + appContent.substring(endIndex);
    fs.writeFileSync('src/App.tsx', appContent);
    
    let constantsContent = fs.readFileSync('src/constants.ts', 'utf8');
    constantsContent += '\n' + newConstants;
    fs.writeFileSync('src/constants.ts', constantsContent);
    
    console.log('Moved map constants to src/constants.ts');
} else {
    console.log('Could not find map constants bounds.');
}

// Modify InteractiveDemographicMap.tsx to import them
let viewContent = fs.readFileSync('src/views/InteractiveDemographicMap.tsx', 'utf8');
const mapImports = 'import { targetRegions, activeRegions, mapLocations, flightRoutes } from "../constants";\n';
viewContent = mapImports + viewContent;

// Also add 'window.L' type issue fix bypass
viewContent = viewContent.replace(/window\.L/g, '(window as any).L');

fs.writeFileSync('src/views/InteractiveDemographicMap.tsx', viewContent);
console.log('Fixed InteractiveDemographicMap');

