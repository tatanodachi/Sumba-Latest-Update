import { START_YEAR, DEFAULT_END_YEAR, MONTH_NAMES_SHORT, INITIAL_GROUPS, LAND_ZONING, getZoningItem, generateTimelineMonths } from "../constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from "recharts";
import React, { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Calculator, TrendingUp, DollarSign, Activity, FileText, Maximize2, Minimize2, Settings, LayoutDashboard, List, Users, Shield, Scale, AlignLeft, AlignRight, EyeOff, ArrowUpRight, Link2, Coins, Building2, Stethoscope, Briefcase, ShieldCheck, HeartPulse, Sparkles, BrainCircuit, RefreshCcw, BarChart3, Map, Landmark, ArrowRightLeft, X, Download, AlertTriangle, Grid, Clock, Lock, Unlock, MapPin, Building, Cloud, CloudOff, ChevronDown, GripHorizontal, Maximize, Minimize, BookOpen, Target, Search, FolderTree, BarChartHorizontal, Layers, Microscope, Bed, Timer, Network, Plane, Dna, Bone, Baby, Eye, Check, ArrowRight, Ruler, Calendar, CalendarDays, Plus, Trash2, ChevronsUpDown, ChevronsDownUp, ChevronRight, ChevronLeft, ShieldAlert, Award, CheckCircle2, HelpCircle, Zap, Monitor, Workflow, Palmtree, Focus, Cross, Leaf, ActivitySquare, ShieldPlus, BedDouble, Pencil, Anchor, Droplets, Tent, Info, Map as MapIcon, Info as InfoIcon, PieChart as PieChartIcon } from "lucide-react";
import { useMonthlyColumns, LazyResponsiveContainer, MarkdownRenderer, NavButton, KPITooltipIcon, StatefulTooltipIcon, KPICard, MiniKPICard, DualKPICard, SectionTitle, FormattedInput, AssumptionRow, ToggleRow, AssumptionRowCalculated, AssumptionRowQtyPrice, AssumptionRowQtyPriceWithToggle, SettingsHeader, TableRow, ExpandableDataRowGroup, TableSection, CapexRow, ExpandableCapexRow, PartnerReturnCard, SensitivityTable, SelectionPopupComp, MarketValidationDisplay, BentoBox, BentoIcon, ProjectInfoFieldComp, GlampingMixTable, AssumptionDepreciationGroup, CHART_MARGINS_BAR, CHART_MARGINS_LINE, TOOLTIP_STYLE, CHART_CURSOR_STYLE, LEGEND_STYLE, TICK_STYLE, PREM_MKT_PIE_DATA, LINE_LABEL_STYLE, formatNumber, formatCurrency } from "../components/UI";
import { AIMicroscopeIcon, CustomBedIcon, CustomScaleIcon, CustomKnotIcon, CustomStethoscopeIcon, CustomPhysicianIcon, CustomPopulationIcon, CustomDiagnosticsIcon, CustomLinacIcon, CustomOverseasIcon, CustomPalliativeIcon, CustomClipboardIcon } from "../components/Icons";
import { calculatePMT, calculatePayback, calculateIRR, calculateNPV, runOpCoEngine, runPropCoEngine, runConsolidatedEngine, DEFAULT_OPCO_ASSUMPTIONS, DEFAULT_PROPCO_ASSUMPTIONS, CANCER_DATA, INSURANCE_DATA, callGemini, INITIAL_ASSET_CLUSTERS_ASSUMPTIONS, runConsolidatedAssetEngine } from "../financialEngine";
import { db, auth, loginWithGoogle, logoutUser } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ExecutiveSummaryView } from "../ExecutiveSummaryView";
export const ConsolidatedCascadeView = memo(
  ({ data, onExport, viewResolution, setViewResolution }) => {
    const { columns, expandedYears, toggleYear } = useMonthlyColumns(
      data.annualData || [],
      viewResolution,
    );
    const scrollRef = React.useRef(null);
    const [showDevBudget, setShowDevBudget] = React.useState(true);
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState("all");
    const [isHardCostsExpanded, setIsHardCostsExpanded] = React.useState(true);
    const [isBuildingCostExpanded, setIsBuildingCostExpanded] =
      React.useState(true);
    const [isConsCascadeHardExpanded, setIsConsCascadeHardExpanded] =
      React.useState(true);
    const [isConsCascadeSoftExpanded, setIsConsCascadeSoftExpanded] = React.useState(true);
    const [isConsCascadePreOpCapexExpanded, setIsConsCascadePreOpCapexExpanded] = React.useState(true);
    const [isRevenueExpanded, setIsRevenueExpanded] = React.useState(false);
    const [isDepreciationExpanded, setIsDepreciationExpanded] = React.useState(false);
    const [isOverheadExpanded, setIsOverheadExpanded] = React.useState(false);
    const [isCogsExpanded, setIsCogsExpanded] = React.useState(false);
    const [isPreOpExpanded, setIsPreOpExpanded] = React.useState(false);
    const [isOutflowsExpanded, setIsOutflowsExpanded] = React.useState(false);

    return (
      <div
        className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-[150] bg-[#F9F8F6] p-4 lg:p-6 overflow-hidden flex flex-col" : ""}`}
      >
        <div
          className={`grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500 ${isFullScreen ? "flex-1 overflow-hidden" : ""} ${showDevBudget && !isFullScreen ? "md:grid-cols-3" : "md:grid-cols-1"}`}
        >
          {showDevBudget && !isFullScreen && (
            <div className="md:col-span-1 bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] h-[calc(100vh-180px)] min-h-[550px] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                  <Map size={18} className="text-[#1C6048]" /> Consolidated
                  Development
                </h3>
                <button
                  onClick={() => setShowDevBudget(false)}
                  className="text-[#8A8175] hover:text-[#1E2F31] text-[10px] uppercase font-bold tracking-wider"
                >
                  Hide
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EFEBE7]">
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold rounded-tl">
                        Component
                      </th>
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right">
                        Cost (B)
                      </th>
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right rounded-tr">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const finalTotal =
                        (data.metrics?.totalCapex || 0) +
                        (data.capexDetails?.devGa || 0) +
                        (data.capexDetails?.devCar || 0) +
                        (data.capexDetails?.devPreOpening || 0);
                      const finalSoftCosts = data.capexDetails?.totalSoftCosts || 0;
                      const finalPreOpCosts = (data.capexDetails?.devGa || 0) +
                        (data.capexDetails?.devCar || 0) +
                        (data.capexDetails?.devPreOpening || 0);
                      return (
                        <>
                          <CapexRow
                            label="Land Cost"
                            amount={data.capexDetails?.landCost || 0}
                            total={finalTotal}
                            isHeader
                          />

                          <CapexRow
                            label="Total Hard Costs"
                            amount={data.capexDetails?.totalHardCosts || 0}
                            total={finalTotal}
                            isHeader
                            isExpandable
                            isExpanded={isHardCostsExpanded}
                            onExpand={() =>
                              setIsHardCostsExpanded(!isHardCostsExpanded)
                            }
                          />
                          {isHardCostsExpanded && (
                            <>
                              {(() => {
                                const buildCost =
                                  data.capexDetails?.buildCost || 0;
                                const civilMepCost =
                                  data.capexDetails?.civilMepCost || 0;
                                const buildingCost = buildCost + civilMepCost;
                                return (
                                  <>
                                    <CapexRow
                                      label="Building Cost"
                                      amount={buildingCost}
                                      total={finalTotal}
                                      isIndent
                                      isExpandable
                                      isExpanded={isBuildingCostExpanded}
                                      onExpand={() =>
                                        setIsBuildingCostExpanded(
                                          !isBuildingCostExpanded,
                                        )
                                      }
                                    />
                                    {isBuildingCostExpanded && (
                                      <>
                                        <CapexRow
                                          label="Glamping Tent"
                                          amount={buildCost}
                                          total={finalTotal}
                                          isDoubleIndent
                                        />
                                        {civilMepCost > 0 && (
                                          <CapexRow
                                            label="Glamping Civil & MEP"
                                            amount={civilMepCost}
                                            total={finalTotal}
                                            isDoubleIndent
                                          />
                                        )}
                                      </>
                                    )}
                                  </>
                                );
                              })()}
                              <CapexRow
                                label="Glamping FF&E / Interiors"
                                amount={data.capexDetails?.ffeCost || 0}
                                total={finalTotal}
                                isIndent
                              />
                              <CapexRow
                                label="Infrastructure"
                                amount={data.capexDetails?.infraCost || 0}
                                total={finalTotal}
                                isIndent
                              />
                              {data.capexDetails?.sharingDevCost > 0 && (
                                <CapexRow
                                  label="Sharing Development"
                                  amount={
                                    data.capexDetails?.sharingDevCost || 0
                                  }
                                  total={finalTotal}
                                  isIndent
                                />
                              )}
                              
                            </>
                          )}

                          <CapexRow
                            label="Total Soft Costs"
                            amount={finalSoftCosts}
                            total={finalTotal}
                            isHeader
                          />
                          <CapexRow
                            label="Consultant"
                            amount={data.capexDetails?.consultantCost || 0}
                            total={finalTotal}
                            isIndent
                          />
                          <CapexRow
                            label="License"
                            amount={data.capexDetails?.licenseCost || 0}
                            total={finalTotal}
                            isIndent
                          />
                          {data.capexDetails?.vatCost > 0 && (
                            <CapexRow
                              label="VAT"
                              amount={data.capexDetails?.vatCost || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {data.capexDetails?.contingencyCost > 0 && (
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
                          )}

                          <CapexRow
                            label="TOTAL PROPCO INVESTMENT"
                            amount={finalTotal}
                            total={finalTotal}
                            isSubtotal
                          />
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div
            className={`${showDevBudget && !isFullScreen ? "md:col-span-2" : "md:col-span-1"} bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden ${isFullScreen ? "h-full" : "h-[calc(100vh-180px)] min-h-[550px]"} flex flex-col`}
          >
            <div className="p-4 bg-[#EFEBE7] border-b border-[#D8D8D8] flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E2F31] flex items-center gap-2">
                <List size={14} /> Consolidated P&L & Cash Flow
                {!showDevBudget && (
                  <button
                    onClick={() => setShowDevBudget(true)}
                    className="ml-2 px-2 py-0.5 border border-[#D8D8D8] bg-white rounded text-[#8A8175] hover:text-[#1E2F31] text-[9px] tracking-wider font-bold shadow-sm leading-tight inline-block flex-shrink-0"
                  >
                    Show Dev Budget
                  </button>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewMode("all")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "all" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setViewMode("pl")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "pl" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    P&L
                  </button>
                  <button
                    onClick={() => setViewMode("cf")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "cf" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    CF
                  </button>
                  <button
                    onClick={() => setViewMode("statement")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "statement" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    Statement
                  </button>
                </div>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6] transition-colors"
                  title={isFullScreen ? "Minimize" : "Maximize"}
                >
                  {isFullScreen ? (
                    <Minimize2 size={13} strokeWidth={2.5} />
                  ) : (
                    <Maximize2 size={13} strokeWidth={2.5} />
                  )}
                </button>
                <div className="flex items-center bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewResolution("annual")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "annual" ? "bg-[#1C6048] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setViewResolution("monthly")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "monthly" ? "bg-[#9B8B70] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Monthly
                  </button>
                </div>
                <button
                  onClick={() =>
                    scrollRef.current?.scrollBy({
                      left: -300,
                      behavior: "smooth",
                    })
                  }
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6]"
                >
                  <ChevronLeft size={13} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() =>
                    scrollRef.current?.scrollBy({
                      left: 300,
                      behavior: "smooth",
                    })
                  }
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6]"
                >
                  <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div ref={scrollRef} className="overflow-auto min-h-0 flex-1">
              <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                <thead className="bg-[#EFEBE7] font-bold sticky top-0 z-[50] shadow-md">
                  <tr>
                    <th className="px-4 py-3 border-b-2 border-r border-[#D8D8D8] sticky left-0 top-0 bg-[#EFEBE7] z-[60] w-[260px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-[#1E2F31]">
                      Line Item
                    </th>
                    {columns.map((col, i) => (
                      <th
                        key={i}
                        onClick={
                          col.colType === "year"
                            ? () => toggleYear(col.yearKey)
                            : undefined
                        }
                        className={`px-3 py-3 text-right border-b-2 border-r border-[#D8D8D8] ${col.colType === "year" ? "cursor-pointer hover:bg-white font-black hover:text-[#1C6048] " : "font-medium text-[10px] "} bg-[#EFEBE7] ${!col.isOperating ? "text-[#9B8B70]" : "text-[#1E2F31]"} ${(col.isMonth || col._isMonth || col.colType === 'month') ? "min-w-[65px] whitespace-nowrap" : "min-w-[90px]"}`}
                      >
                        {col.colType === "year" ? (
                          <div className="flex flex-row items-center justify-end gap-1 group">
                            <span className="text-[13px] opacity-60 flex-shrink-0 mb-0.5">{col.isExpanded ? "-" : "+"}</span>
                            {typeof col.defaultLabel === "string" && col.defaultLabel.startsWith("Year ") ? (
                              <div className="flex flex-col items-end justify-center group-hover:underline decoration-dashed underline-offset-2">
                                <span className="leading-tight">{col.defaultLabel}</span>
                                <span className="text-[10px] font-normal opacity-70 leading-none mt-[2px]">
                                  ({2025 + parseInt(col.defaultLabel.replace(/\D/g, "") || "1")})
                                </span>
                              </div>
                            ) : typeof col.year === "string" && col.year.startsWith("Year ") ? (
                               <div className="flex flex-col items-end justify-center group-hover:underline decoration-dashed underline-offset-2">
                                <span className="leading-tight">{col.year}</span>
                                <span className="text-[10px] font-normal opacity-70 leading-none mt-[2px]">
                                  ({2025 + parseInt(col.year.replace(/\D/g, "") || "1")})
                                </span>
                              </div>
                            ) : (
                              <span className="group-hover:underline decoration-dashed underline-offset-4">{col.defaultLabel !== undefined ? String(col.defaultLabel) : String(col.year || col.colType)}</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-center w-full">
                            {col.defaultLabel !== undefined ? String(col.defaultLabel) : String(col.year || col.colType)}
                          </div>
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right bg-[#EFEBE7] text-[#1E2F31] sticky right-0 top-0 z-[60] border-l border-b-2 border-[#D8D8D8] shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(viewMode === "all" || viewMode === "cf") && (
                    <>
                      <TableSection
                        title="A. Project Development Spending"
                        colSpan={columns.length + 2}
                        type="indigo"
                      />
                      <TableRow
                        label="Land Cost"
                        data={columns}
                        dk="landSpend"
                        total={data.totals?.landSpend}
                      />
                      <TableRow
                        label="Total Hard Costs"
                        data={columns}
                        dk="hardSpend"
                        total={data.totals?.hardSpend}
                        isExpandable
                        isExpanded={isConsCascadeHardExpanded}
                        onExpand={() =>
                          setIsConsCascadeHardExpanded(
                            !isConsCascadeHardExpanded,
                          )
                        }
                      />
                      {isConsCascadeHardExpanded && (
                        <>
                          <TableRow
                            label="Building Cost"
                            data={columns}
                            dk="buildSpend"
                            total={data.totals?.buildSpend}
                            isDoubleIndent
                          />
                          
                          <TableRow
                            label="Glamping FF&E / Interiors"
                            data={columns}
                            dk="ffeSpend"
                            total={data.totals?.ffeSpend}
                            isDoubleIndent
                          />
                          <TableRow
                            label="Infrastructure"
                            data={columns}
                            dk="infraSpend"
                            total={data.totals?.infraSpend}
                            isDoubleIndent
                          />
                          {(data.totals?.sharingSpend || 0) > 0 && (
                            <TableRow
                              label="Sharing Development"
                              data={columns}
                              dk="sharingSpend"
                              total={data.totals?.sharingSpend}
                              isDoubleIndent
                            />
                          )}
                        </>
                      )}
                      <TableRow
                        label="Total Soft Costs"
                        data={columns}
                        dk="softSpend"
                        total={data.totals?.softSpend}
                        isExpandable
                        isExpanded={isConsCascadeSoftExpanded}
                        onExpand={() =>
                          setIsConsCascadeSoftExpanded(
                            !isConsCascadeSoftExpanded,
                          )
                        }
                      />
                      {isConsCascadeSoftExpanded && (
                        <>
                          <TableRow
                            label="Consultant"
                            data={columns}
                            dk="consultantSpend"
                            total={data.totals?.consultantSpend}
                            isDoubleIndent
                          />
                          <TableRow
                            label="License"
                            data={columns}
                            dk="licenseSpend"
                            total={data.totals?.licenseSpend}
                            isDoubleIndent
                          />
                          {(data.totals?.vatSpend || 0) > 0 && (
                            <TableRow
                              label="VAT"
                              data={columns}
                              dk="vatSpend"
                              total={data.totals?.vatSpend}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.contingencySpend || 0) > 0 && (
                            <TableRow
                              label="Contingency"
                              data={columns}
                              dk="contingencySpend"
                              total={data.totals?.contingencySpend}
                              isDoubleIndent
                            />
                          )}

                        </>
                      )}
                      {((data.totals?.devGa || 0) + (data.totals?.devCar || 0) + (data.totals?.devPreOpening || 0)) > 0 && (
                        <>
                          <TableRow
                            label="Total Pre-Operating Costs"
                            data={columns}
                            dk="preOpTotal"
                            total={(data.totals?.devGa || 0) + (data.totals?.devCar || 0) + (data.totals?.devPreOpening || 0)}
                            isExpandable
                            isExpanded={isConsCascadePreOpCapexExpanded}
                            onExpand={() => setIsConsCascadePreOpCapexExpanded(!isConsCascadePreOpCapexExpanded)}
                          />
                          {isConsCascadePreOpCapexExpanded && (
                            <>
                              {(data.totals?.devGa || 0) > 0 && (
                                <TableRow
                                  label="G&A"
                                  data={columns}
                                  dk="devGa"
                                  total={data.totals?.devGa}
                                  isDoubleIndent
                                />
                              )}
                              {(data.totals?.devCar || 0) > 0 && (
                                <TableRow
                                  label="Dev. CAR Insurance"
                                  data={columns}
                                  dk="devCar"
                                  total={data.totals?.devCar}
                                  isDoubleIndent
                                />
                              )}
                              {(data.totals?.devPreOpening || 0) > 0 && (
                                <TableRow
                                  label="Pre-Opening"
                                  data={columns}
                                  dk="devPreOpening"
                                  total={data.totals?.devPreOpening}
                                  isDoubleIndent
                                />
                              )}
                            </>
                          )}
                        </>
                      )}
                      <TableRow
                        label="PROJECT DEVELOPMENT SPEND"
                        data={columns}
                        dk="totalSpend"
                        total={data.totals?.totalSpend}
                        highlight
                      />
                      <TableRow
                        label="Debt Drawdown"
                        data={columns}
                        dk="debtDraw"
                        total={data.totals?.debtDraw}
                        isIndent
                      />
                    </>
                  )}

                  {(viewMode === "all" || viewMode === "pl") && (
                    <>
                      <TableSection
                        title="B. Operating Revenue & Expense"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Rental Revenue"
                        highlight
                        data={columns}
                        dk="revenue"
                        total={data.totals?.revenue}
                        isExpandable
                        isExpanded={isRevenueExpanded}
                        onExpand={() => setIsRevenueExpanded(!isRevenueExpanded)}
                      />
                      {isRevenueExpanded && (data.totals?.roomRevenue > 0 || data.totals?.barRevenue > 0) && (
                        <>
                          <TableRow
                            label="Room Revenue"
                            data={columns}
                            dk="roomRevenue"
                            total={data.totals?.roomRevenue}
                            isIndent
                          />
                          <TableRow
                            label="F&B Revenue"
                            data={columns}
                            dk="barRevenue"
                            total={data.totals?.barRevenue}
                            isIndent
                          />
                        </>
                      )}
                      <TableRow
                        label="Cost of Goods Sold"
                        data={columns}
                        dk="cogs"
                        total={data.totals?.cogs}
                        isExpandable
                        isExpanded={isCogsExpanded}
                        onExpand={() => setIsCogsExpanded(!isCogsExpanded)}
                      />
                      {isCogsExpanded && (data.totals?.fbCogs !== 0) && (
                        <TableRow
                          label="F&B COGS"
                          data={columns}
                          dk="fbCogs"
                          total={data.totals?.fbCogs}
                          isIndent
                        />
                      )}
                      <TableRow
                        label="Gross Profit"
                        data={columns}
                        dk="grossProfit"
                        total={data.totals?.grossProfit}
                        highlight
                      />
                      <TableRow
                        label="Maintenance OpEx"
                        data={columns}
                        dk="maintOpex"
                        total={data.totals?.maintOpex}
                      />
                      <TableRow
                        label="Property Taxes"
                        data={columns}
                        dk="taxOpex"
                        total={data.totals?.taxOpex}
                      />
                      <TableRow
                        label="Op. Overhead / G&A"
                        data={columns}
                        dk="overheadOpex"
                        total={data.totals?.overheadOpex}
                        isExpandable
                        isExpanded={isOverheadExpanded}
                        onExpand={() => setIsOverheadExpanded(!isOverheadExpanded)}
                      />
                      {isOverheadExpanded && (data.totals?.overheadOpex !== 0) && (
                        <>
                          <TableRow
                            label="Direct Labor"
                            data={columns}
                            dk="directLabor"
                            total={data.totals?.directLabor}
                            isIndent
                          />
                          <TableRow
                            label="Admin Labor"
                            data={columns}
                            dk="adminLabor"
                            total={data.totals?.adminLabor}
                            isIndent
                          />
                          <TableRow
                            label="Marketing"
                            data={columns}
                            dk="marketing"
                            total={data.totals?.marketing}
                            isIndent
                          />
                          <TableRow
                            label="Admin & General"
                            data={columns}
                            dk="adminGeneral"
                            total={data.totals?.adminGeneral}
                            isIndent
                          />
                          {(data.totals?.fixedOverhead || 0) !== 0 && (
                            <TableRow
                              label="Fixed / Misc OPEX"
                              data={columns}
                              dk="fixedOverhead"
                              total={data.totals?.fixedOverhead}
                              isIndent
                            />
                          )}
                        </>
                      )}
                      <TableRow
                        label="FF&E Reserve"
                        data={columns}
                        dk="ffeReserve"
                        total={data.totals?.ffeReserve}
                      />
                                            <TableRow
                        label="Pre-Operating Expenses"
                        data={columns}
                        dk="preOpTotal"
                        total={(data.totals?.devGa || 0) + (data.totals?.devCar || 0) + (data.totals?.devPreOpening || 0)}
                        isExpandable
                        isExpanded={isPreOpExpanded}
                        onExpand={() => setIsPreOpExpanded(!isPreOpExpanded)}
                      />
                      {isPreOpExpanded && (
                        <>
                          {(data.totals?.devGa || 0) !== 0 && (
                            <TableRow
                              label="G&A"
                              data={columns}
                              dk="devGa"
                              total={data.totals?.devGa}
                              isIndent
                            />
                          )}
                          {(data.totals?.devCar || 0) !== 0 && (
                            <TableRow
                              label="CAR Insurance"
                              data={columns}
                              dk="devCar"
                              total={data.totals?.devCar}
                              isIndent
                            />
                          )}
                          {(data.totals?.devPreOpening || 0) !== 0 && (
                            <TableRow
                              label="Pre-Opening"
                              data={columns}
                              dk="devPreOpening"
                              total={data.totals?.devPreOpening}
                              isIndent
                            />
                          )}
                        </>
                      )}
                      <TableRow
                        label="EBITDA (NOI)"
                        data={columns}
                        dk="ebitda"
                        total={data.totals?.ebitda}
                        highlight
                      />
                    </>
                  )}

                  {viewMode === "cf" && (
                    <>
                      <TableSection
                        title="B. Cash Flows from Operations"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Cash Inflows (Revenues)"
                        data={columns}
                        dk="revenue"
                        total={data.totals?.revenue}
                        highlight
                      />
                      <TableRow
                        label="Cash Outflows (Operating OPEX & Tax)"
                        data={columns}
                        dk="cashOutflows"
                        total={data.totals?.cashOutflows}
                        isExpandable
                        isExpanded={isOutflowsExpanded}
                        onExpand={() => setIsOutflowsExpanded(!isOutflowsExpanded)}
                      />
                      {isOutflowsExpanded && (
                        <>
                          <TableRow
                            label="F&B Cost of Goods"
                            data={columns}
                            dk="fbCogs"
                            total={data.totals?.fbCogs}
                            isDoubleIndent
                          />
                          <TableRow
                            label="Maintenance & Taxes"
                            data={columns}
                            dk="maintOpex"
                            total={(data.totals?.maintOpex || 0) + (data.totals?.taxOpex || 0)}
                            isDoubleIndent
                          />
                          <TableRow
                            label="Staffing Costs"
                            data={columns}
                            dk="directLabor"
                            total={(data.totals?.directLabor || 0) + (data.totals?.adminLabor || 0)}
                            isDoubleIndent
                          />
                          <TableRow
                            label="Admin, Mktg & General OPEX"
                            data={columns}
                            dk="adminGeneral"
                            total={(data.totals?.adminGeneral || 0) + (data.totals?.marketing || 0)}
                            isDoubleIndent
                          />
                          <TableRow
                            label="FF&E Reserve"
                            data={columns}
                            dk="ffeReserve"
                            total={data.totals?.ffeReserve}
                            isDoubleIndent
                          />
                          <TableRow
                            label="Corporate Income Tax"
                            data={columns}
                            dk="corpTax"
                            total={data.totals?.corpTax}
                            isDoubleIndent
                          />
                        </>
                      )}
                      <TableRow
                        label="Operating Cash Flow"
                        data={columns}
                        dk="ebitda"
                        total={data.totals?.ebitda}
                        highlight
                      />
                    </>
                  )}

                  {(viewMode === "all" || viewMode === "statement") && (
                    <>
                      <TableSection
                        title="C. Debt Service & Taxes"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
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
                      )}
                      <TableRow
                        label="Interest Expense"
                        data={columns}
                        dk="interest"
                        total={data.totals?.interest}
                        isIndent
                      />
                      <TableRow
                        label="Principal Repayment"
                        data={columns}
                        dk="principal"
                        total={data.totals?.principal}
                        isIndent
                      />
                      <TableRow
                        label="Earnings Before Tax (EBT)"
                        data={columns}
                        dk="ebt"
                        total={data.totals?.ebt}
                        highlight
                      />
                      <TableRow
                        label="Corporate Tax"
                        data={columns}
                        dk="corpTax"
                        total={data.totals?.corpTax}
                        isIndent
                      />
                      <TableRow
                        label="NET INCOME"
                        data={columns}
                        dk="netIncome"
                        total={data.totals?.netIncome}
                        highlight
                      />
                    </>
                  )}

                  {(viewMode === "all" || viewMode === "statement") && (
                    <>
                      <TableSection
                        title="D. Return Metrics"
                        colSpan={columns.length + 2}
                        type="emerald"
                      />
                      <TableRow
                        label="Net Exit Proceeds"
                        data={columns}
                        dk="netExitProceeds"
                        total={data.totals?.netExitProceeds}
                        highlight
                      />
                      <TableRow
                        label="FCFE (Levered)"
                        data={columns}
                        dk="fcfe"
                        highlight
                        emerald
                        total={data.totals?.fcfe}
                      />
                      <TableRow
                        label="Cumulative FCFE"
                        data={columns}
                        dk="cumFcfe"
                        highlight
                        crossover
                        bold
                        indigo
                      />
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
