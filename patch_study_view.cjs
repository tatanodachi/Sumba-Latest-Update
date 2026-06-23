const fs = require('fs');

const file = 'src/views/StudyView.tsx';
let content = fs.readFileSync(file, 'utf8');
content = "import { InteractiveDemographicMap } from './InteractiveDemographicMap';\n" + content;
fs.writeFileSync(file, content);
