const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// AssetCascadeView
let target1 = `                      const finalSoftCosts =
                        (data.capexDetails?.totalSoftCosts || 0) +
                        (data.capexDetails?.devGa || 0) +
                        (data.capexDetails?.devCar || 0) +
                        (data.capexDetails?.devPreOpening || 0);`;

let replacement1 = `                      const finalSoftCosts = data.capexDetails?.totalSoftCosts || 0;
                      const finalPreOpCosts = (data.capexDetails?.devGa || 0) +
                        (data.capexDetails?.devCar || 0) +
                        (data.capexDetails?.devPreOpening || 0);`;

content = content.replace(target1, replacement1);

// ConsolidatedCascadeView
let target2 = `                      const finalSoftCosts =
                        (data.capexDetails?.totalSoftCosts || 0) +
                        (data.capexDetails?.devGa || 0) +
                        (data.capexDetails?.devCar || 0) +
                        (data.capexDetails?.devPreOpening || 0);`;

content = content.replace(target2, replacement1);

// Now patch the table for AssetCascadeView
let target3 = `                          {data.capexDetails?.contingencyCost > 0 && (
                            <CapexRow
                              label="Contingency"
                              amount={data.capexDetails?.contingencyCost || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devGa || 0) > 0 && (
                            <CapexRow
                              label="G&A"
                              amount={data.capexDetails?.devGa || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devCar || 0) > 0 && (
                            <CapexRow
                              label="Dev. CAR Insurance"
                              amount={data.capexDetails?.devCar || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devPreOpening || 0) > 0 && (
                            <CapexRow
                              label="Pre-Opening"
                              amount={data.capexDetails?.devPreOpening || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}`;

let replacement3 = `                          {data.capexDetails?.contingencyCost > 0 && (
                            <CapexRow
                              label="Contingency"
                              amount={data.capexDetails?.contingencyCost || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          
                          {finalPreOpCosts > 0 && (
                             <CapexRow
                               label="Total Pre-Operating Costs"
                               amount={finalPreOpCosts}
                               total={finalTotal}
                               isHeader
                             />
                          )}
                          {(data.capexDetails?.devGa || 0) > 0 && (
                            <CapexRow
                              label="G&A"
                              amount={data.capexDetails?.devGa || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devCar || 0) > 0 && (
                            <CapexRow
                              label="Dev. CAR Insurance"
                              amount={data.capexDetails?.devCar || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devPreOpening || 0) > 0 && (
                            <CapexRow
                              label="Pre-Opening"
                              amount={data.capexDetails?.devPreOpening || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}`;

let splits3 = content.split(target3);
if (splits3.length === 2) {
    content = splits3.join(replacement3);
} else {
    // If it is 3 splits, it means we replaced it in both!
    if (splits3.length === 3) {
      content = splits3.join(replacement3);
    } else {
      console.log('Failed to find target3. length:', splits3.length);
    }
}


fs.writeFileSync('src/App.tsx', content);
console.log('Done.');
