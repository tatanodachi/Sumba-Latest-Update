const fs = require('fs');
let code = fs.readFileSync('src/components/UI.tsx', 'utf8');

const oldCode = `        for (let m = 1; m <= 12; m++) {
          const monthData = { ...d, _isMonth: true, monthIndex: m, colType: "month", defaultLabel: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1], yearKey };
          Object.keys(d).forEach((k) => {
            if (typeof d[k] === "number" && !k.toLowerCase().includes("year")) {
              if (
                k === "cumulativeFCF" ||
                k === "cumulativeCapex" ||
                k === "cumulativeRevenue"
              ) {
                const startBase = d[k] - flow;
                monthData[k] = startBase + (flow / 12) * m;
              } else {
                monthData[k] = d[k] / 12;
              }
            }
          });
          cols.push(monthData);
        }`;

const newCode = `        for (let m = 1; m <= 12; m++) {
          const monthData = { ...d, _isMonth: true, monthIndex: m, colType: "month", defaultLabel: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1], yearKey };
          Object.keys(d).forEach((k) => {
            if (typeof d[k] === "number" && !k.toLowerCase().includes("year")) {
              if (d.monthly && d.monthly[k] && typeof d.monthly[k][m - 1] === "number") {
                monthData[k] = d.monthly[k][m - 1];
              } else if (
                k === "cumulativeFCF" ||
                k === "cumulativeCapex" ||
                k === "cumulativeRevenue"
              ) {
                const startBase = d[k] - flow;
                monthData[k] = startBase + (flow / 12) * m;
              } else {
                monthData[k] = d[k] / 12;
              }
            }
          });
          cols.push(monthData);
        }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/UI.tsx', code);
