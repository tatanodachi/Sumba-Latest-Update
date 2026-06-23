import { START_YEAR, DEFAULT_END_YEAR, MONTH_NAMES_SHORT, INITIAL_GROUPS, LAND_ZONING, getZoningItem, generateTimelineMonths } from "../constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from "recharts";
import React, { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Calculator, TrendingUp, DollarSign, Activity, FileText, Maximize2, Minimize2, Settings, LayoutDashboard, List, Users, Shield, Scale, AlignLeft, AlignRight, EyeOff, ArrowUpRight, Link2, Coins, Building2, Stethoscope, Briefcase, ShieldCheck, HeartPulse, Sparkles, BrainCircuit, RefreshCcw, BarChart3, Map, Landmark, ArrowRightLeft, X, Download, AlertTriangle, Grid, Clock, Lock, Unlock, MapPin, Building, Cloud, CloudOff, ChevronDown, GripHorizontal, Maximize, Minimize, BookOpen, Target, Search, FolderTree, BarChartHorizontal, Layers, Microscope, Bed, Timer, Network, Plane, Dna, Bone, Baby, Eye, Check, ArrowRight, Ruler, Calendar, CalendarDays, Plus, Trash2, ChevronsUpDown, ChevronsDownUp, ChevronRight, ChevronLeft, ShieldAlert, Award, CheckCircle2, HelpCircle, Zap, Monitor, Workflow, Palmtree, Focus, Cross, Leaf, ActivitySquare, ShieldPlus, BedDouble, Pencil, Anchor, Droplets, Tent, Info, Map as MapIcon, Info as InfoIcon, PieChart as PieChartIcon } from "lucide-react";
import { LazyResponsiveContainer, MarkdownRenderer, NavButton, KPITooltipIcon, StatefulTooltipIcon, KPICard, MiniKPICard, DualKPICard, SectionTitle, FormattedInput, AssumptionRow, ToggleRow, AssumptionRowCalculated, AssumptionRowQtyPrice, AssumptionRowQtyPriceWithToggle, SettingsHeader, TableRow, ExpandableDataRowGroup, TableSection, CapexRow, ExpandableCapexRow, PartnerReturnCard, SensitivityTable, SelectionPopupComp, MarketValidationDisplay, BentoBox, BentoIcon, ProjectInfoFieldComp, GlampingMixTable, AssumptionDepreciationGroup, CHART_MARGINS_BAR, CHART_MARGINS_LINE, TOOLTIP_STYLE, CHART_CURSOR_STYLE, LEGEND_STYLE, TICK_STYLE, PREM_MKT_PIE_DATA, LINE_LABEL_STYLE, formatNumber, formatCurrency } from "../components/UI";
import { AIMicroscopeIcon, CustomBedIcon, CustomScaleIcon, CustomKnotIcon, CustomStethoscopeIcon, CustomPhysicianIcon, CustomPopulationIcon, CustomDiagnosticsIcon, CustomLinacIcon, CustomOverseasIcon, CustomPalliativeIcon, CustomClipboardIcon } from "../components/Icons";
import { calculatePMT, calculatePayback, calculateIRR, calculateNPV, runOpCoEngine, runPropCoEngine, runConsolidatedEngine, DEFAULT_OPCO_ASSUMPTIONS, DEFAULT_PROPCO_ASSUMPTIONS, CANCER_DATA, INSURANCE_DATA, callGemini, INITIAL_ASSET_CLUSTERS_ASSUMPTIONS, runConsolidatedAssetEngine } from "../financialEngine";
import { db, auth, loginWithGoogle, logoutUser } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ExecutiveSummaryView } from "../ExecutiveSummaryView";
export const AssetDashboardView = memo(
  ({
    data,
    assumptions,
    generateTeaser,
    isTeaserLoading,
    showTeaser,
    setShowTeaser,
    teaserContent,
    setTab,
    isPresenting,
    consolidatedScenario,
    setConsolidatedScenario,
    handleAssetChange,
    clusterId,
  }) => {
    const pieData = useMemo(
      () => [
        { name: "Equity", value: data.metrics.totalEquity },
        { name: "Bank Loan", value: data.metrics.totalDebt },
      ],
      [data.metrics.totalEquity, data.metrics.totalDebt],
    );

    const [chartMode, setChartMode] = useState("full");
    const rawChartData =
      chartMode === "full" ? data.monthlyData : data.operatingData;
      
    const chartData = useMemo(() => {
      if (!rawChartData || rawChartData.length === 0) return [];
      const yearMap = {};
      rawChartData.forEach((row) => {
        if (!yearMap[row.year]) {
          yearMap[row.year] = { year: row.year, ebitda: 0, fcfe: 0, cumFcfe: 0 };
        }
        yearMap[row.year].ebitda += (row.ebitda || 0);
        yearMap[row.year].fcfe += (row.fcfe || 0);
        yearMap[row.year].cumFcfe = row.cumFcfe || 0; // Cumulative takes the last month's value
      });
      return Object.values(yearMap).sort((a: any, b: any) => a.year - b.year);
    }, [rawChartData]);

    const devYears = Math.max(
      1,
      Math.ceil((data.metrics.devMonths || assumptions.devDurationMonths || 12) / 12),
    );

    return (
      <div
        className={
          isPresenting
            ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in"
            : "space-y-6 animate-in fade-in"
        }
      >
        <div className={`space-y-6 ${isPresenting ? "lg:col-span-4" : ""}`}>
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h2 className="text-sm font-bold text-[#1E2F31] ml-2">
              Asset Executive Summary
            </h2>
            <button
              onClick={generateTeaser}
              disabled={isTeaserLoading}
              className="bg-[#9B8B70] hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isTeaserLoading ? (
                <RefreshCcw size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              ✨ Pitch Teaser
            </button>
          </div>

          
          
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#D8D8D8] flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
                <Target size={16} className="text-[#1C6048]" /> Master Exit Strategy (Overlay)
              </h3>
              <p className="text-[9px] text-[#4C4A4B] mt-1 font-medium leading-relaxed">
                Applies globally across all clusters to visualize different holding periods. Select "Manual Settings" to use the cluster-specific configurations below.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-1">
              <button
                onClick={() => setConsolidatedScenario("manual")}
                className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${consolidatedScenario === "manual" ? "bg-white shadow-sm border border-[#D8D8D8] text-[#1E2F31]" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
              >
                Manual Settings
              </button>
              <button
                onClick={() => setConsolidatedScenario("yr10")}
                className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${consolidatedScenario === "yr10" ? "bg-[#1E2F31] shadow-sm border border-[#1E2F31] text-white" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
              >
                Exit in Yr 10
              </button>
              <button
                onClick={() => setConsolidatedScenario("breakeven")}
                className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${consolidatedScenario === "breakeven" ? "bg-[#1C6048] shadow-sm border border-[#1C6048] text-white" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
              >
                Exit at Breakeven
              </button>
              <button
                onClick={() => setConsolidatedScenario("debt_free")}
                disabled={!assumptions?.includeFinancing}
                className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${!assumptions?.includeFinancing ? "opacity-50 cursor-not-allowed bg-[#EFEBE7] text-[#8A8989]" : consolidatedScenario === "debt_free" ? "bg-[#9B8B70] shadow-sm border border-[#9B8B70] text-white" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
              >
                Exit Post-Debt
              </button>
              <button
                onClick={() => setConsolidatedScenario("none")}
                className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${consolidatedScenario === "none" ? "bg-white shadow-sm border border-[#1C6048] text-[#1C6048]" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
              >
                No Exit (Yield)
              </button>
            </div>
            
            <div className="border-t border-[#D8D8D8] my-1"></div>

            <div>
              <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
                <Settings size={16} className="text-[#1C6048]" /> Cluster Strategic Options
              </h3>
              <p className="text-[9px] text-[#4C4A4B] mt-1 font-medium leading-relaxed">
                Independent structural settings for this specific cluster.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 pt-2">
              {handleAssetChange && clusterId && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                      <Landmark size={14} className="text-[#9B8B70]" /> Leverage / Debt Financing
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={assumptions?.includeFinancing || false}
                        onChange={(e) =>
                          handleAssetChange("includeFinancing", e.target.checked, clusterId)
                        }
                      />
                      <div className="w-9 h-5 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C6048]"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                      <Map size={14} className="text-[#9B8B70]" /> Treat Land as Cluster Capex
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={assumptions?.includeLand ?? true}
                        onChange={(e) =>
                          handleAssetChange("includeLand", e.target.checked, clusterId)
                        }
                      />
                      <div className="w-9 h-5 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C6048]"></div>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          {showTeaser && (
            <div className="bg-white p-6 rounded-2xl border-l-4 border-l-[#9B8B70] shadow-sm relative">
              <button
                onClick={() => setShowTeaser(false)}
                className="absolute top-4 right-4 bg-[#EFEBE7] p-1 rounded-full"
              >
                <X size={16} />
              </button>
              <h3 className="font-bold text-[#1E2F31] mb-2 flex items-center gap-2">
                <FileText size={18} /> AI Pitch Teaser
              </h3>
              <MarkdownRenderer content={teaserContent} />
            </div>
          )}

          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${isPresenting ? "lg:grid-cols-2" : "lg:grid-cols-4"} gap-4`}
          >
            <DualKPICard
              title1="Levered IRR"
              value1={`${formatNumber((data.metrics.irr || 0) * 100, 2)}%`}
              color1="indigo"
              title2="Equity NPV"
              value2={formatCurrency(data.metrics.npv)}
              color2="emerald"
              icon={<Activity size={18} />}
            />
            <DualKPICard
              title1="Unlevered IRR"
              value1={`${formatNumber((data.metrics.unleveredIrr || 0) * 100, 2)}%`}
              color1="emerald"
              title2="Project NPV"
              value2={formatCurrency(data.metrics.unleveredNpv)}
              color2="blue"
              icon={<Building2 size={18} />}
            />
            <DualKPICard
              title1="IRR (ex-Land)"
              value1={`${formatNumber((data.metrics.irrExLand || 0) * 100, 2)}%`}
              color1="blue"
              title2="NPV (ex-Land)"
              value2={formatCurrency(data.metrics.npvExLand)}
              color2="teal"
              icon={<TrendingUp size={18} />}
            />
            <DualKPICard
              title1="Avg Cash Yield"
              value1={`${formatNumber(data.metrics.avgYield, 1)}%`}
              color1="teal"
              tooltip1={{
                desc: "The average annual cash distribution yield generated from asset operations, reflecting the stable income generation capacity of the standalone infrastructure.",
                formula:
                  "Average of (Annual Operating FCFE ÷ Total Asset Equity) across operating years",
              }}
              title2="YOC (ex-Land)"
              value2={`${formatNumber((data.metrics.yocExLand || 0) * 100, 1)}%`}
              color2="amber"
              icon={<Coins size={18} />}
            />
          </div>

          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1E2F31] flex items-center gap-2">
                <DollarSign size={20} className="text-[#1C6048]" /> Sources &
                Uses of Funds
              </h3>
              <button
                onClick={() => setTab("assumptions")}
                className="text-[10px] bg-[#EFEBE7] hover:bg-[#D8D8D8] text-[#4C4A4B] font-bold px-2 py-1 rounded transition-colors uppercase"
              >
                Edit Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sources Pie */}
              <div>
                <h4 className="text-center text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-2">
                  Sources
                </h4>
                <div
                  className={`w-full relative flex justify-center ${isPresenting ? "h-40" : "h-36"}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: "none" }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        className="outline-none focus:outline-none"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-src-${index}`}
                            fill={index === 0 ? "#1C6048" : "#D8D8D8"}
                            className="outline-none focus:outline-none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-black text-[#1E2F31]">
                      {formatNumber(data.metrics.totalCapex, 0)}B
                    </span>
                  </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-2 mt-4 text-center">
                  <div className="bg-[#EFEBE7] p-2 rounded border border-[#D8D8D8]">
                    <p className="text-[9px] font-bold uppercase text-[#4C4A4B] mb-1">
                      Equity
                    </p>
                    <p className="font-black text-[#1E2F31]">
                      {formatCurrency(data.metrics.totalEquity)}
                    </p>
                  </div>
                  <div className="bg-[#D8D8D8]/30 p-2 rounded border border-[#D8D8D8]">
                    <p className="text-[9px] font-bold uppercase text-[#4C4A4B] mb-1">
                      Loan
                    </p>
                    <p className="font-black text-[#1E2F31]">
                      {formatCurrency(data.metrics.totalDebt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Uses Expandable Table */}
              <div>
                <h4 className="text-center text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-4">
                  Uses Breakdown
                </h4>
                <div className="bg-[#F9F8F6] p-2 rounded-xl border border-[#D8D8D8]">
                  <ExpandableCapexRow
                    icon={<Map size={16} className="text-[#9B8B70]" />}
                    title="Land Acquisition"
                    amount={data.capexDetails.landCost}
                    totalCapex={data.metrics.totalCapex}
                  />
                  <ExpandableCapexRow
                    icon={<Building2 size={16} className="text-[#1E2F31]" />}
                    title="Hard Costs"
                    amount={
                      data.capexDetails.buildCost +
                      (data.capexDetails.civilMepCost || 0) +
                      data.capexDetails.ffeCost +
                      data.capexDetails.infraCost +
                      (data.capexDetails.sharingDevCost || 0)
                    }
                    totalCapex={data.metrics.totalCapex}
                    details={[
                      {
                        label: "Glamping Tent",
                        amount: data.capexDetails.buildCost,
                      },
                      data.capexDetails.civilMepCost > 0
                        ? {
                            label: "Glamping Civil & MEP",
                            amount: data.capexDetails.civilMepCost,
                          }
                        : null,
                      {
                        label: "Glamping FF&E / Interiors",
                        amount: data.capexDetails.ffeCost,
                      },
                      {
                        label: "Infrastructure",
                        amount: data.capexDetails.infraCost,
                      },
                      data.capexDetails.sharingDevCost > 0
                        ? {
                            label: "Sharing Development",
                            amount: data.capexDetails.sharingDevCost,
                          }
                        : null,
                    ].filter(
                      (d): d is { label: string; amount: number } =>
                        d !== null && d.amount > 0,
                    )}
                  />
                  
                  <ExpandableCapexRow
                    icon={<Briefcase size={16} className="text-[#99B6AA]" />}
                    title="Soft Costs"
                    amount={data.capexDetails.totalSoftCosts}
                    totalCapex={data.metrics.totalCapex}
                    details={[
                      {
                        label: "Consulting & Design",
                        amount: data.capexDetails.consultantCost,
                      },
                      {
                        label: "Licenses & Permits",
                        amount: data.capexDetails.licenseCost,
                      },
                      { label: "VAT", amount: data.capexDetails.vatCost },
                      {
                        label: "Contingency",
                        amount: data.capexDetails.contingencyCost,
                      },
                    ].filter((d) => d.amount > 0)}
                  />
                  <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-[#D8D8D8] px-2">
                    <span className="text-[10px] font-black text-[#1E2F31] uppercase tracking-widest">
                      Total Uses (Capex)
                    </span>
                    <span className="font-mono text-sm font-black text-[#1C6048]">
                      {formatNumber(data.metrics.totalCapex, 1)} B
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`space-y-6 ${isPresenting ? "lg:col-span-8" : ""}`}>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MiniKPICard
              title="Equity Payback"
              value={`${formatNumber(data.metrics.payback > 0 ? Math.max(0, data.metrics.payback - devYears) : 0, 1)} Yrs`}
              subtitle="From Operations"
            />
            <MiniKPICard
              title="Op. Payback"
              value={`${formatNumber(data.metrics.operatingPayback > 0 ? Math.max(0, data.metrics.operatingPayback - devYears) : 0, 1)} Yrs`}
              subtitle="From Operations"
            />
            <MiniKPICard
              title="Avg DSCR"
              value={`${formatNumber(data.metrics.avgDscr, 2)}x`}
              subtitle="Debt Coverage"
            />
            <MiniKPICard
              title="Min DSCR"
              value={`${formatNumber(data.metrics.minDscr, 2)}x`}
              subtitle="Lowest Coverage"
            />
            <MiniKPICard
              title="Cost per Bed"
              value={`${formatCurrency(data.metrics.costPerBed)}`}
              subtitle="Total / Beds"
            />
            <MiniKPICard
              title="Cost per Sqm"
              value={`${formatNumber(data.metrics.costPerSqm, 1)} M`}
              subtitle="Total / Sqm"
            />
          </div>

          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                <BarChart3 size={18} className="text-[#9B8B70]" /> Asset Cash
                Flow Trajectory
              </h3>
              <div className="flex bg-[#EFEBE7] p-1 rounded-lg border border-[#D8D8D8]">
                <button
                  onClick={() => setChartMode("full")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartMode === "full" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                >
                  Full Lifecycle
                </button>
                <button
                  onClick={() => setChartMode("operating")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartMode === "operating" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                >
                  Operating Only
                </button>
              </div>
            </div>
            <div className={isPresenting ? "h-[450px]" : "h-[400px]"}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#D8D8D8"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}B`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#1E2F31" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}B`}
                  />
                  <Tooltip
                    allowEscapeViewBox={{ x: true, y: true }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val) => formatNumber(val, 1) + "B"}
                  />
                  <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                  <Bar
                    yAxisId="left"
                    dataKey="ebitda"
                    name="EBITDA (NOI)"
                    fill="#9B8B70"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="fcfe"
                    name="FCFE"
                    stroke="#1E2F31"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#1E2F31",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumFcfe"
                    name="Cumulative FCFE"
                    stroke="#1C6048"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {data.clustersData && (
            <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
              <h3 className="font-bold text-[#1E2F31] flex items-center gap-2 mb-2 text-sm">
                <Map size={18} className="text-[#9B8B70]" /> Standalone Cluster
                Engines & Consolidation
              </h3>
              <p className="text-[11px] text-[#4C4A4B] mb-4">
                Below are the metrics of each land zoning cluster calculated
                through its standalone financial engine. These individual caches
                consolidated on-the-fly drive the total Asset Master Financial
                model.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#EFEBE7] text-[#1E2F31] font-bold">
                      <th className="px-3 py-2 border border-[#D8D8D8] rounded-tl-lg">
                        Cluster Component
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right">
                        Land Area (Sqm)
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right">
                        Build Area (Sqm)
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right">
                        Capex (B)
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right">
                        Base Rent Y1 (B)
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right">
                        Levered IRR
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right rounded-tr-lg">
                        Equity NPV
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(data.clustersData).map((name) => {
                      const cluster = data.clustersData[name];
                      const zIdx = LAND_ZONING.findIndex(
                        (z) => (z as any).proportion === name
                      );
                      const zItem = getZoningItem(zIdx === -1 ? null : zIdx);
                      const color = zItem?.color || "#4C4A4B";
                      return (
                        <tr
                          key={name}
                          className="hover:bg-[#F9F8F6] transition-colors"
                        >
                          <td className="px-3 py-2.5 border border-[#D8D8D8] font-bold text-[#1E2F31] flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            {name}
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono text-[#1E2F31]">
                            {formatNumber(
                              assumptions.clusters?.[name]?.landArea || 0,
                              0,
                            )}{" "}
                            Sqm
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono text-[#1E2F31]">
                            {formatNumber(
                              assumptions.clusters?.[name]?.buildArea || 0,
                              0,
                            )}{" "}
                            Sqm
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono font-bold text-[#1C6048]">
                            {formatNumber(cluster.metrics.totalCapex, 1)} B
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono text-[#9B8B70] font-bold">
                            {formatNumber(
                              assumptions.clusters?.[name]?.manualBaseRent || 0,
                              1,
                            )}{" "}
                            B
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono font-bold text-[#1E2F31] bg-[#1E2F31]/5">
                            {formatNumber((cluster.metrics.irr || 0) * 100, 2)}%
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono text-emerald-800 font-bold bg-emerald-50">
                            {formatCurrency(cluster.metrics.npv)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
