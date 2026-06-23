const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const useTooltipRegex = /const useTooltip = \(tooltip\) => \{[\s\S]*?return \{ tooltipState, setTooltipState \};\n\};\n/m;
const match = appContent.match(useTooltipRegex);

if (match) {
    const useTooltipCode = match[0];
    appContent = appContent.replace(useTooltipRegex, '');
    fs.writeFileSync('src/App.tsx', appContent);
    
    let uiContent = fs.readFileSync('src/components/UI.tsx', 'utf8');
    const exportCode = useTooltipCode.replace('const useTooltip', 'export const useTooltip');
    
    // prepend it to UI.tsx after imports
    const importEndIndex = uiContent.lastIndexOf('import ');
    const endOfImports = uiContent.indexOf('\n', importEndIndex) + 1;
    uiContent = uiContent.slice(0, endOfImports) + '\n' + exportCode + uiContent.slice(endOfImports);
    
    fs.writeFileSync('src/components/UI.tsx', uiContent);
    console.log('Moved useTooltip to UI.tsx');
} else {
    console.log('Could not find useTooltip in App.tsx');
}
