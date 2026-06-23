const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                      <TableRow
                        label="Depreciation (D&A)"
                        data={columns}
                        dk="dep"
                        total={data.totals?.dep}
                        isIndent
                        isExpandable
                        isExpanded={isDepreciationExpanded}
                        onExpand={() => setIsDepreciationExpanded(!isDepreciationExpanded)}
                      />
                      {isDepreciationExpanded && (
                        <>
                          {(data.totals?.depBuild || 0) > 0 && (
                            <TableRow
                              label="Building"
                              data={columns}
                              dk="depBuild"
                              total={data.totals?.depBuild}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.depMedEq || 0) > 0 && (
                            <TableRow
                              label="Medical Equipment"
                              data={columns}
                              dk="depMedEq"
                              total={data.totals?.depMedEq}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.depInfra || 0) > 0 && (
                            <TableRow
                              label="Infrastructure"
                              data={columns}
                              dk="depInfra"
                              total={data.totals?.depInfra}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.depFfe || 0) > 0 && (
                            <TableRow
                              label="FF&E"
                              data={columns}
                              dk="depFfe"
                              total={data.totals?.depFfe}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.depSharing || 0) > 0 && (
                            <TableRow
                              label="Sharing Development"
                              data={columns}
                              dk="depSharing"
                              total={data.totals?.depSharing}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.depConsultant || 0) > 0 && (
                            <TableRow
                              label="Consultant & Design"
                              data={columns}
                              dk="depConsultant"
                              total={data.totals?.depConsultant}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.depLicense || 0) > 0 && (
                            <TableRow
                              label="Licenses & Permits"
                              data={columns}
                              dk="depLicense"
                              total={data.totals?.depLicense}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.depVat || 0) > 0 && (
                            <TableRow
                              label="VAT Depreciation"
                              data={columns}
                              dk="depVat"
                              total={data.totals?.depVat}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.depContingency || 0) > 0 && (
                            <TableRow
                              label="Contingency Component"
                              data={columns}
                              dk="depContingency"
                              total={data.totals?.depContingency}
                              isDoubleIndent
                            />
                          )}
                        </>
                      )}`;

const replacementStr = `                      <TableRow
                        label="Depreciation (D&A)"
                        data={columns}
                        dk="dep"
                        total={data.totals?.dep}
                        isIndent
                        isExpandable
                        isExpanded={isDepreciationExpanded}
                        onExpand={() => setIsDepreciationExpanded(!isDepreciationExpanded)}
                        isSubtractor
                      />
                      {isDepreciationExpanded && (
                        <>
                          {(data.totals?.depBuild || 0) > 0 && (
                            <TableRow
                              label="Building"
                              data={columns}
                              dk="depBuild"
                              total={data.totals?.depBuild}
                              isDoubleIndent
                              isSubtractor
                            />
                          )}
                          {(data.totals?.depMedEq || 0) > 0 && (
                            <TableRow
                              label="Medical Equipment"
                              data={columns}
                              dk="depMedEq"
                              total={data.totals?.depMedEq}
                              isDoubleIndent
                              isSubtractor
                            />
                          )}
                          {(data.totals?.depInfra || 0) > 0 && (
                            <TableRow
                              label="Infrastructure"
                              data={columns}
                              dk="depInfra"
                              total={data.totals?.depInfra}
                              isDoubleIndent
                              isSubtractor
                            />
                          )}
                          {(data.totals?.depFfe || 0) > 0 && (
                            <TableRow
                              label="FF&E"
                              data={columns}
                              dk="depFfe"
                              total={data.totals?.depFfe}
                              isDoubleIndent
                              isSubtractor
                            />
                          )}
                          {(data.totals?.depSharing || 0) > 0 && (
                            <TableRow
                              label="Sharing Development"
                              data={columns}
                              dk="depSharing"
                              total={data.totals?.depSharing}
                              isDoubleIndent
                              isSubtractor
                            />
                          )}
                          {(data.totals?.depConsultant || 0) > 0 && (
                            <TableRow
                              label="Consultant & Design"
                              data={columns}
                              dk="depConsultant"
                              total={data.totals?.depConsultant}
                              isDoubleIndent
                              isSubtractor
                            />
                          )}
                          {(data.totals?.depLicense || 0) > 0 && (
                            <TableRow
                              label="Licenses & Permits"
                              data={columns}
                              dk="depLicense"
                              total={data.totals?.depLicense}
                              isDoubleIndent
                              isSubtractor
                            />
                          )}
                          {(data.totals?.depVat || 0) > 0 && (
                            <TableRow
                              label="VAT Depreciation"
                              data={columns}
                              dk="depVat"
                              total={data.totals?.depVat}
                              isDoubleIndent
                              isSubtractor
                            />
                          )}
                          {(data.totals?.depContingency || 0) > 0 && (
                            <TableRow
                              label="Contingency Component"
                              data={columns}
                              dk="depContingency"
                              total={data.totals?.depContingency}
                              isDoubleIndent
                              isSubtractor
                            />
                          )}
                        </>
                      )}`;

const splits = content.split(targetStr);
if (splits.length > 1) {
    fs.writeFileSync('src/App.tsx', splits.join(replacementStr));
    console.log(`Successfully replaced ${splits.length - 1} occurrences.`);
} else {
    console.error('Target string not found.');
}
