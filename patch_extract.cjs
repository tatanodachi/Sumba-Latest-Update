const { Project } = require("ts-morph");

async function main() {
  const project = new Project();
  project.addSourceFilesAtPaths("src/**/*.tsx");
  project.addSourceFilesAtPaths("src/**/*.ts");

  const appFile = project.getSourceFileOrThrow("src/App.tsx");
  
  // 1. Create UI.tsx
  const uiFile = project.createSourceFile("src/components/UI.tsx", "", { overwrite: true });
  // Add necessary imports to UI.tsx (React, lucide-react, recharts)
  uiFile.addImportDeclaration({
    defaultImport: "React",
    namedImports: ["memo", "useState", "useEffect", "useCallback"],
    moduleSpecifier: "react"
  });
  uiFile.addImportDeclaration({
      namedImports: ["BarChart", "Bar", "XAxis", "YAxis", "CartesianGrid", "Tooltip", "Legend", "ResponsiveContainer", "LineChart", "Line", "PieChart", "Pie", "Cell", "Area", "AreaChart", "ComposedChart"],
      moduleSpecifier: "recharts"
  });
  
  // Add lucide icons imports
  const lucideImports = appFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === "lucide-react");
  if (lucideImports) {
      uiFile.addImportDeclaration({
          namedImports: lucideImports.getNamedImports().map(ni => ni.getName()),
          moduleSpecifier: "lucide-react"
      });
  }
  uiFile.addImportDeclaration({
      namedImports: ["formulaTooltips"],
      moduleSpecifier: "../formulaTooltips"
  });
  uiFile.addImportDeclaration({
      namedImports: ["motion", "AnimatePresence"],
      moduleSpecifier: "framer-motion"
  });

  // Define what goes to UI.tsx
  const uiComponentNames = [
    "LazyResponsiveContainer",
    "MarkdownRenderer",
    "NavButton",
    "KPITooltipIcon",
    "StatefulTooltipIcon",
    "KPICard", "MiniKPICard", "DualKPICard",
    "SectionTitle",
    "FormattedInput",
    "AssumptionRow", "ToggleRow", "AssumptionRowCalculated", "AssumptionRowQtyPrice", "AssumptionRowQtyPriceWithToggle",
    "SettingsHeader",
    "TableRow", "ExpandableDataRowGroup", "TableSection", "CapexRow", "ExpandableCapexRow",
    "PartnerReturnCard", "SensitivityTable",
    "SelectionPopupComp",
    "MarketValidationDisplay",
    "BentoBox", "BentoIcon",
    "ProjectInfoFieldComp",
    "GlampingMixTable",
    "AssumptionDepreciationGroup",
    "CHART_MARGINS_BAR", "CHART_MARGINS_LINE", "TOOLTIP_STYLE", "CHART_CURSOR_STYLE", "LEGEND_STYLE", "TICK_STYLE", "PREM_MKT_PIE_DATA", "LINE_LABEL_STYLE"
  ];
  
  // Also we need utils
  const utilsName = ["formatNumber", "formatCurrency", "formatPercent", "formatCompactNumber", "calculateIRR", "calculateNPV"];

  // Move them
  for (const name of [...uiComponentNames, ...utilsName]) {
      const varDecl = appFile.getVariableStatement(decl => {
          const devs = decl.getDeclarations();
          return devs.length > 0 && devs[0].getName() === name;
      });
      if (varDecl) {
          const text = varDecl.getText();
          uiFile.addStatements([text]);
          // Add export to the new statement
          const newVarDecl = uiFile.getVariableStatement(decl => {
             const devs = decl.getDeclarations();
             return devs.length > 0 && devs[0].getName() === name;
          });
          if(newVarDecl) {
              newVarDecl.setIsExported(true);
          }
          varDecl.remove();
      }
      
      const funcDecl = appFile.getFunction(name);
      if (funcDecl) {
          uiFile.addStatements([funcDecl.getText()]);
          const newFuncDecl = uiFile.getFunction(name);
          if(newFuncDecl) newFuncDecl.setIsExported(true);
          funcDecl.remove();
      }
  }

  // 2. Create Icons.tsx
  const iconsFile = project.createSourceFile("src/components/Icons.tsx", "", { overwrite: true });
  iconsFile.addImportDeclaration({
      defaultImport: "React",
      namedImports: ["memo"],
      moduleSpecifier: "react"
  });
  
  const iconNames = [
    "AIMicroscopeIcon", "CustomBedIcon", "CustomScaleIcon", "CustomKnotIcon", "CustomStethoscopeIcon",
    "CustomPhysicianIcon", "CustomPopulationIcon", "CustomDiagnosticsIcon", "CustomLinacIcon",
    "CustomOverseasIcon", "CustomPalliativeIcon", "CustomClipboardIcon"
  ];
  
  for (const name of iconNames) {
      const varDecl = appFile.getVariableStatement(decl => {
          const devs = decl.getDeclarations();
          return devs.length > 0 && devs[0].getName() === name;
      });
      if (varDecl) {
          iconsFile.addStatements([varDecl.getText()]);
          const newVarDecl = iconsFile.getVariableStatement(decl => {
             const devs = decl.getDeclarations();
             return devs.length > 0 && devs[0].getName() === name;
          });
          if(newVarDecl) {
              newVarDecl.setIsExported(true);
          }
          varDecl.remove();
      }
  }

  // In App.tsx, add imports
  appFile.addImportDeclaration({
      namedImports: uiComponentNames.filter(n => n !== "CHART_MARGINS_BAR" && n !== "CHART_MARGINS_LINE" && n !== "TOOLTIP_STYLE" && n !== "CHART_CURSOR_STYLE" && n !== "LEGEND_STYLE" && n !== "TICK_STYLE" && n !== "PREM_MKT_PIE_DATA" && n !== "LINE_LABEL_STYLE").concat(utilsName),
      moduleSpecifier: "./components/UI" // Assuming App.tsx is in src
  });
  
  appFile.addImportDeclaration({
      namedImports: iconNames,
      moduleSpecifier: "./components/Icons"
  });
  // Also import constants if needed
  appFile.addImportDeclaration({
      namedImports: ["CHART_MARGINS_BAR", "CHART_MARGINS_LINE", "TOOLTIP_STYLE", "CHART_CURSOR_STYLE", "LEGEND_STYLE", "TICK_STYLE", "PREM_MKT_PIE_DATA", "LINE_LABEL_STYLE"],
      moduleSpecifier: "./components/UI"
  });

  await project.save();
  console.log("Extraction complete!");
}

main().catch(console.error);
