const fs = require('fs');

// 1. Fix UI.tsx
let uiContent = fs.readFileSync('src/components/UI.tsx', 'utf8');
const badHookIdx = uiContent.indexOf('export const useMonthlyColumns =');
const badParseIdx = uiContent.indexOf('export const parseArea =');
// wait, the bad useMonthlyColumns goes into parseArea!
if (badHookIdx !== -1 && badParseIdx !== -1) {
    uiContent = uiContent.substring(0, badHookIdx) + uiContent.substring(badParseIdx);
}

const useMonthlyHookStr = `
export const useMonthlyColumns = (annualData, viewResolution = "annual") => {
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
      cols.push({ ...d, _isAnnualTotal: true, isExpanded: expandedYears[i] });

      if (expandedYears[i]) {
        let flowKeys;
        if (d.year <= 5) {
          flowKeys = (item) => item.cumulativeCapex || 0;
        } else {
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
};
`;
// Ensure useMonthlyColumns doesn't double append
uiContent = uiContent + useMonthlyHookStr;
fs.writeFileSync('src/components/UI.tsx', uiContent);

// 2. Fix AssetSettingsView.tsx
let asvContent = fs.readFileSync('src/views/AssetSettingsView.tsx', 'utf8');
asvContent = asvContent.replace(/<\(\(\) => null\)[\s\S]*?\/>/g, '{null}');
fs.writeFileSync('src/views/AssetSettingsView.tsx', asvContent);

console.log('Fixed UI.tsx and AssetSettingsView.tsx');
