const { Project } = require("ts-morph");
const fs = require("fs");

async function main() {
  const project = new Project();
  project.addSourceFilesAtPaths("src/**/*.tsx");
  project.addSourceFilesAtPaths("src/**/*.ts");

  const appFile = project.getSourceFileOrThrow("src/App.tsx");
  
  if (!fs.existsSync("src/views")) {
      fs.mkdirSync("src/views");
  }

  const viewNames = [
    "ProjectOverviewView",
    "CollaborationStrategyView",
    "InteractiveDemographicMap",
    "ResortProgrammingView",
    "StudyView",
    "AssetDashboardView",
    "AssetCascadeView",
    "ConsolidatedDashboardView",
    "ConsolidatedCascadeView",
    "AssetSettingsView",
    "AssetSensitivityView",
    "MasterTimelineView",
    "SettingsPasswordGate"
  ];
  
  // All exported stuff from UI.tsx
  const uiFileOrig = project.getSourceFileOrThrow("src/components/UI.tsx");
  const uiExports = Array.from(uiFileOrig.getExportedDeclarations().keys());

  // All exported stuff from Icons.tsx
  const iconsFileOrig = project.getSourceFileOrThrow("src/components/Icons.tsx");
  const iconExports = Array.from(iconsFileOrig.getExportedDeclarations().keys());

  // Common Imports
  const reactImports = {
      defaultImport: "React",
      namedImports: ["memo", "useState", "useEffect", "useCallback", "useMemo", "useRef"],
      moduleSpecifier: "react"
  };
  const rechartsImports = {
      namedImports: ["BarChart", "Bar", "XAxis", "YAxis", "CartesianGrid", "Tooltip", "Legend", "ResponsiveContainer", "LineChart", "Line", "PieChart", "Pie", "Cell", "AreaChart", "Area", "ComposedChart"],
      moduleSpecifier: "recharts"
  };
  const motionImports = {
      namedImports: ["motion", "AnimatePresence"],
      moduleSpecifier: "framer-motion"
  };
  const tooltipImports = {
      namedImports: ["formulaTooltips"],
      moduleSpecifier: "../formulaTooltips"
  };
  
  const lucideImportsDecl = appFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === "lucide-react");
  const lucideImports = lucideImportsDecl ? {
      namedImports: lucideImportsDecl.getNamedImports().map(ni => ni.getName()),
      moduleSpecifier: "lucide-react"
  } : null;

  for (const viewName of viewNames) {
      const funcDecl = appFile.getVariableStatement(decl => {
          const devs = decl.getDeclarations();
          return devs.length > 0 && devs[0].getName() === viewName;
      });
      if (funcDecl) {
          const viewFile = project.createSourceFile("src/views/" + viewName + ".tsx", "", { overwrite: true });
          
          viewFile.addImportDeclaration(reactImports);
          viewFile.addImportDeclaration(rechartsImports);
          viewFile.addImportDeclaration(motionImports);
          viewFile.addImportDeclaration(tooltipImports);
          if (lucideImports) viewFile.addImportDeclaration(lucideImports);
          
          viewFile.addImportDeclaration({
              namedImports: uiExports,
              moduleSpecifier: "../components/UI"
          });
          
          viewFile.addImportDeclaration({
              namedImports: iconExports,
              moduleSpecifier: "../components/Icons"
          });
          
          viewFile.addImportDeclaration({
              namedImports: ["calculatePMT", "calculatePayback", "calculateIRR", "calculateNPV", "runOpCoEngine", "runPropCoEngine", "runConsolidatedEngine", "DEFAULT_OPCO_ASSUMPTIONS", "DEFAULT_PROPCO_ASSUMPTIONS", "CANCER_DATA", "INSURANCE_DATA", "callGemini", "INITIAL_ASSET_CLUSTERS_ASSUMPTIONS", "runConsolidatedAssetEngine"],
              moduleSpecifier: "../financialEngine"
          });

          viewFile.addImportDeclaration({
              namedImports: ["db", "auth", "signInWithGoogle", "signOutUser"],
              moduleSpecifier: "../firebase"
          });
          
          viewFile.addImportDeclaration({
              namedImports: ["onAuthStateChanged"],
              moduleSpecifier: "firebase/auth"
          });

          viewFile.addImportDeclaration({
              namedImports: ["doc", "getDoc", "setDoc", "serverTimestamp"],
              moduleSpecifier: "firebase/firestore"
          });

          viewFile.addImportDeclaration({
              namedImports: ["ExecutiveSummaryView"],
              moduleSpecifier: "../ExecutiveSummaryView"
          });
          
          viewFile.addStatements([funcDecl.getText()]);
          
          const newVarDecl = viewFile.getVariableStatement(decl => {
             const devs = decl.getDeclarations();
             return devs.length > 0 && devs[0].getName() === viewName;
          });
          if(newVarDecl) {
              newVarDecl.setIsExported(true);
          }
          
          funcDecl.remove();
          
          // And add this view import to App.tsx
          appFile.addImportDeclaration({
              namedImports: [viewName],
              moduleSpecifier: "./views/" + viewName
          });
      }
  }

  await project.save();
  console.log("Views extraction complete!");
}

main().catch(console.error);
