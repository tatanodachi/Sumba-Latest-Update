const fs = require('fs');
['src/views/ConsolidatedCascadeView.tsx', 'src/views/AssetCascadeView.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\{expandedYears\[col\.yearKey\] \? "-" \: "\+"\}/g, '{col.isExpanded ? "-" : "+"}');
  fs.writeFileSync(file, content);
});
