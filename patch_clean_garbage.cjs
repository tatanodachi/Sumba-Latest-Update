const fs = require('fs');

const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const cleanedLines = [];
let inGarbage = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const isRate = [')) {
        inGarbage = true;
    }
    
    if (!inGarbage) {
        cleanedLines.push(lines[i]);
    }
    
    if (inGarbage && lines[i].includes('const flow = d[flowKey] || 0;')) {
        inGarbage = false;
        // skip the next line if it's empty
        if (i + 1 < lines.length && lines[i+1].trim() === '') {
            i++;
        }
    }
}

fs.writeFileSync('src/App.tsx', cleanedLines.join('\n'));
console.log('Cleaned garbled lines from App.tsx');
