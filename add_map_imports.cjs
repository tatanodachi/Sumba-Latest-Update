const fs = require('fs');

const file = 'src/views/InteractiveDemographicMap.tsx';
let content = fs.readFileSync(file, 'utf8');

const mapImports = `import { getGroupColor, getArcPoints, generateFallbackGeoJSON, airportCoordinates, targetRegions, activeRegions, mapLocations, flightRoutes } from "../constants";\n`;

if (!content.includes('import { getGroupColor')) {
   content = mapImports + content;
}

// Ensure the map imports are there
fs.writeFileSync(file, content);
console.log('Added map imports to InteractiveDemographicMap');
