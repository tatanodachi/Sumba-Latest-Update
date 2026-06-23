import * as fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const remainderStr = `                const startBase = d[k] - flow;
                monthData[k] = startBase + (flow / 12) * m;
              } else {
                monthData[k] = d[k] / 12;
              }
            }
          });
          cols.push(monthData);
        }
      }
    });
    return cols;
  }, [annualData, expandedYears, viewResolution]);

  return { columns, expandedYears, toggleYear };
};`;

if (appContent.includes(remainderStr)) {
   appContent = appContent.replace(remainderStr, '');
   fs.writeFileSync('src/App.tsx', appContent);
}

// And in UI.tsx we have the incomplete useMonthlyColumns. Let's fix it by appending the remainder string.
let uiContent = fs.readFileSync('src/components/UI.tsx', 'utf8');
const badEndingStr = `        const flow = Array.isArray(flowKeys)
          ? flowKeys.reduce((sum, key) => sum + (d[key] || 0), 0)
          : flowKeys(d);
        for (let m = 1; m <= 12; m++) {
          const monthData = { ...d, _isMonth: true, monthIndex: m };
          Object.keys(d).forEach((k) => {
            if (typeof d[k] === "number" && !k.toLowerCase().includes("year")) {
              if (
                k === "cumulativeFCF" ||
                k === "cumulativeCapex" ||
                k === "cumulativeRevenue"
              ) {
};`;
const idx = uiContent.indexOf(badEndingStr);
if (idx !== -1) {
   uiContent = uiContent.replace(badEndingStr, badEndingStr.replace('};\n', remainderStr));
   fs.writeFileSync('src/components/UI.tsx', uiContent);
   console.log('Fixed useMonthlyColumns truncation in App.tsx and UI.tsx');
} else {
   console.log('Could not find bad ending string in UI.tsx');
}
