import * as fs from 'fs';

const useMonthlyHookStr = `export const useMonthlyColumns = (annualData, viewResolution = "annual") => {
  const [expandedYears, setExpandedYears] = useState({});

  const toggleYear = useCallback((yearIndex) => {
    setExpandedYears((prev) => ({
      ...prev,
      [yearIndex]: !prev[yearIndex],
    }));
  }, []);

  const columns = useMemo(() => {
    if (viewResolution === "annual") return annualData;

    const cols = [];
    annualData.forEach((d, i) => {
      // Always push the annual total column, but we can mark it if expanded
      cols.push({ ...d, _isAnnualTotal: true, isExpanded: expandedYears[i] });

      // If user expanded this year, push 12 monthly columns
      if (expandedYears[i]) {
        // Simple linear interpolation to reconstruct monthly flow for visualization
        // Real engine would need a monthly scale loop, but for visualization approximations:
        let flowKeys;
        if (d.year <= 5) {
          // pre-op mostly fixed per month approximation if no explicit logic exists
          flowKeys = (item) => item.cumulativeCapex || 0;
        } else {
          // operating years - approximate revenues and costs flatly across 12 months
          flowKeys = [
            "ipRevenue",
            "opRevenue",
            "cogs",
            "sgAndA",
            "ebitda",
            "debtService",
            "netCashFlow",
            "maintenanceCapex",
            "tenantRevenue",
            "landLease",
            "dividends",
          ];
        }

        const flow = Array.isArray(flowKeys)
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
                const startBase = d[k] - flow;
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

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// I also have to remove the remainder from App.tsx
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
}
// wait, I also removed the first part earlier `export const useMonthlyColumns = ... };`.
appContent = appContent.replace(/export const useMonthlyColumns =[\s\S]*?\}\;/g, '');
appContent = appContent.replace(/^\s*$(?:\r\n?|\n)/gm, "\n");
fs.writeFileSync('src/App.tsx', appContent);

let uiContent = fs.readFileSync('src/components/UI.tsx', 'utf8');
if (!uiContent.includes('export const useMonthlyColumns')) {
   uiContent += '\n' + useMonthlyHookStr + '\n';
   fs.writeFileSync('src/components/UI.tsx', uiContent);
}

console.log('Restored useMonthlyColumns');
