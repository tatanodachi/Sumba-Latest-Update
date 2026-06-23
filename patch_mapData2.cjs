const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const arcIdx = appContent.indexOf('const getArcPoints =');
const endArcIdx = appContent.indexOf('};', arcIdx) + 2;
const getArcPointsCode = appContent.substring(arcIdx, endArcIdx).replace('const getArcPoints', 'export const getArcPoints');

appContent = appContent.substring(0, arcIdx) + appContent.substring(endArcIdx);
fs.writeFileSync('src/App.tsx', appContent);

let constantsContent = fs.readFileSync('src/constants.ts', 'utf8');
constantsContent += '\n' + getArcPointsCode + '\n';
constantsContent = constantsContent.replace(/const generateFallbackGeoJSON/g, 'export const generateFallbackGeoJSON');
constantsContent = constantsContent.replace(/const airportCoordinates/g, 'export const airportCoordinates');
constantsContent = constantsContent.replace(/const getGroupColor/g, 'export const getGroupColor');
fs.writeFileSync('src/constants.ts', constantsContent);

let viewContent = fs.readFileSync('src/views/InteractiveDemographicMap.tsx', 'utf8');
viewContent = viewContent.replace(/import \{ targetRegions/g, 'import { getGroupColor, getArcPoints, generateFallbackGeoJSON, airportCoordinates, targetRegions');
fs.writeFileSync('src/views/InteractiveDemographicMap.tsx', viewContent);

console.log('Fixed extra map constants');
