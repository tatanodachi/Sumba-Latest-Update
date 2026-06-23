// @ts-nocheck
import { START_YEAR, DEFAULT_END_YEAR, MONTH_NAMES_SHORT, INITIAL_GROUPS, LAND_ZONING, getZoningItem, generateTimelineMonths } from "../constants";
import { ReferenceLine, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from "recharts";
import React, { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Calculator, TrendingUp, DollarSign, Activity, FileText, Maximize2, Minimize2, Settings, LayoutDashboard, List, Users, Shield, Scale, AlignLeft, AlignRight, EyeOff, ArrowUpRight, Link2, Coins, Building2, Stethoscope, Briefcase, ShieldCheck, HeartPulse, Sparkles, BrainCircuit, RefreshCcw, BarChart3, Map, Landmark, ArrowRightLeft, X, Download, AlertTriangle, Grid, Clock, Lock, Unlock, MapPin, Building, Cloud, CloudOff, ChevronDown, GripHorizontal, Maximize, Minimize, BookOpen, Target, Search, FolderTree, BarChartHorizontal, Layers, Microscope, Bed, Timer, Network, Plane, Dna, Bone, Baby, Eye, Check, ArrowRight, Ruler, Calendar, CalendarDays, Plus, Trash2, ChevronsUpDown, ChevronsDownUp, ChevronRight, ChevronLeft, ShieldAlert, Award, CheckCircle2, HelpCircle, Zap, Monitor, Workflow, Palmtree, Focus, Cross, Leaf, ActivitySquare, ShieldPlus, BedDouble, Pencil, Anchor, Droplets, Tent, Info, Map as MapIcon, Info as InfoIcon, PieChart as PieChartIcon } from "lucide-react";
import { LazyResponsiveContainer, MarkdownRenderer, NavButton, KPITooltipIcon, StatefulTooltipIcon, KPICard, MiniKPICard, DualKPICard, SectionTitle, FormattedInput, AssumptionRow, ToggleRow, AssumptionRowCalculated, AssumptionRowQtyPrice, AssumptionRowQtyPriceWithToggle, SettingsHeader, TableRow, ExpandableDataRowGroup, TableSection, CapexRow, ExpandableCapexRow, PartnerReturnCard, SensitivityTable, SelectionPopupComp, MarketValidationDisplay, BentoBox, BentoIcon, ProjectInfoFieldComp, GlampingMixTable, AssumptionDepreciationGroup, CHART_MARGINS_BAR, CHART_MARGINS_LINE, TOOLTIP_STYLE, CHART_CURSOR_STYLE, LEGEND_STYLE, TICK_STYLE, PREM_MKT_PIE_DATA, LINE_LABEL_STYLE, formatNumber, formatCurrency } from "../components/UI";
import { AIMicroscopeIcon, CustomBedIcon, CustomScaleIcon, CustomKnotIcon, CustomStethoscopeIcon, CustomPhysicianIcon, CustomPopulationIcon, CustomDiagnosticsIcon, CustomLinacIcon, CustomOverseasIcon, CustomPalliativeIcon, CustomClipboardIcon } from "../components/Icons";
import { calculatePMT, calculatePayback, calculateIRR, calculateNPV, runOpCoEngine, runPropCoEngine, runConsolidatedEngine, DEFAULT_OPCO_ASSUMPTIONS, DEFAULT_PROPCO_ASSUMPTIONS, CANCER_DATA, INSURANCE_DATA, callGemini, INITIAL_ASSET_CLUSTERS_ASSUMPTIONS, runConsolidatedAssetEngine } from "../financialEngine";
import { db, auth, loginWithGoogle, logoutUser } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ExecutiveSummaryView } from "../ExecutiveSummaryView";
export const ConsolidatedDashboardView = memo(
  ({
    data,
    assetAssumptions,
    handleAssetChange,
    isPresenting,
    consolidatedScenario,
    setConsolidatedScenario,
    setActiveTab, // Added to props just in case for navigation
    includeFinancingChecked,
    includeFinancingMixed,
    includeLandChecked,
    includeLandMixed,
  }: any) => {
    const pieData = useMemo(
      () => [
        { name: "Equity", value: data.metrics.totalEquity },
        { name: "Bank Loan", value: data.metrics.totalDebt },
      ],
      [data.metrics.totalEquity, data.metrics.totalDebt],
    );

    const annualOperatingData = useMemo(() => {
      if (!data?.operatingData || data.operatingData.length === 0) return [];
      const yearMap = {};
      data.operatingData.forEach((row) => {
        if (!yearMap[row.year]) {
          yearMap[row.year] = { year: row.year, lookThroughRevenue: 0, lookThroughEbitda: 0, lookThroughMargin: 0 };
        }
        yearMap[row.year].lookThroughRevenue += (row.lookThroughRevenue || 0);
        yearMap[row.year].lookThroughEbitda += (row.lookThroughEbitda || 0);
      });
      return Object.values(yearMap).map((yearData: any) => {
          yearData.lookThroughMargin = yearData.lookThroughRevenue > 0 ? (yearData.lookThroughEbitda / yearData.lookThroughRevenue) * 100 : 0;
          return yearData;
      }).sort((a: any, b: any) => a.year - b.year);
    }, [data.operatingData]);

    const annualMonthlyData = useMemo(() => {
      if (!data?.monthlyData || data.monthlyData.length === 0) return [];
      const yearMap = {};
      data.monthlyData.forEach((row) => {
        if (!yearMap[row.year]) {
          yearMap[row.year] = { year: row.year, propCoFlow: 0, opCoOperatingFlow: 0, opCoExitFlow: 0, cumCf: 0 };
        }
        yearMap[row.year].propCoFlow += (row.propCoFlow || 0);
        yearMap[row.year].opCoOperatingFlow += (row.opCoOperatingFlow || 0);
        yearMap[row.year].opCoExitFlow += (row.opCoExitFlow || 0);
        yearMap[row.year].cumCf = row.cumCf || 0;
      });
      return Object.values(yearMap).sort((a: any, b: any) => a.year - b.year);
    }, [data.monthlyData]);

    return (
      <div
        className={
        isPresenting
          ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in"
          : "space-y-6 animate-in fade-in"
      }
    >
      <div className={`space-y-6 ${isPresenting ? "lg:col-span-4" : ""}`}>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#D8D8D8] flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
              <Target size={16} className="text-[#1C6048]" /> Master Exit
              Strategy
            </h3>
            <p className="text-[9px] text-[#4C4A4B] mt-1 font-medium leading-relaxed">
              Override individual entity settings to simulate master portfolio
              exits and visualize long-term holding yields.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <button
              onClick={() => setConsolidatedScenario("manual")}
              className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${consolidatedScenario === "manual" ? "bg-white shadow-sm border border-[#D8D8D8] text-[#1E2F31]" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
            >
              Manual (Settings)
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
              disabled={!includeFinancingChecked && !includeFinancingMixed}
              className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${(!includeFinancingChecked && !includeFinancingMixed) ? "opacity-50 cursor-not-allowed bg-[#EFEBE7] text-[#8A8989]" : consolidatedScenario === "debt_free" ? "bg-[#9B8B70] shadow-sm border border-[#9B8B70] text-white" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
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

          <div className="mt-1 mb-2">
            {consolidatedScenario === "manual" && (
              <div className="bg-[#EFEBE7] p-2 rounded text-[9px] font-medium text-[#4C4A4B] leading-relaxed">
                <strong className="text-[#1E2F31]">Independent Optimization:</strong> Each cluster strictly follows its individual exit settings set from the dashboard. This allows staggered exit timelines across the entire portfolio.
              </div>
            )}
            {consolidatedScenario === "yr10" && (
              <div className="bg-[#1E2F31]/5 p-2 rounded border border-[#1E2F31]/10 text-[9px] font-medium text-[#1E2F31] leading-relaxed">
                <strong className="text-[#1E2F31]">Algorithmic Year 10 Exit:</strong> An independent trigger forcing each cluster to exit specifically at the 10th year of its <strong>own operating timeline</strong>. Real calendar months will stagger based on development durations.
              </div>
            )}
            {consolidatedScenario === "breakeven" && (
              <div className="bg-[#1C6048]/5 p-2 rounded border border-[#1C6048]/10 text-[9px] font-medium text-[#1C6048] leading-relaxed">
                <strong className="text-[#1C6048]">Algorithmic Breakeven Trigger:</strong> Forces each cluster to exit independently on the exact month its cumulative unlevered cash flow turns positive.
              </div>
            )}
            {consolidatedScenario === "debt_free" && (
              <div className="bg-[#9B8B70]/5 p-2 rounded border border-[#9B8B70]/10 text-[9px] font-medium text-[#9B8B70] leading-relaxed">
                <strong className="text-[#9B8B70]">Post-Debt Exits:</strong> Forces clusters to exit individually immediately following their final principal repayment month. Clusters with differing loan tenors will exit asynchronously.
              </div>
            )}
            {consolidatedScenario === "none" && (
              <div className="bg-[#1E2F31]/5 p-2 rounded border border-[#1E2F31]/10 text-[9px] font-medium text-[#1E2F31] leading-relaxed">
                <strong className="text-[#1E2F31]">Yield Optimization:</strong> Entire portfolio is held continuously without Terminal Value calculations, measuring stabilized cash-on-cash yield.
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 pt-3 mt-1 border-t border-[#D8D8D8]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                  <Landmark size={14} className="text-[#9B8B70]" /> Bank Debt Financing (Asset Level)
                </span>
                {includeFinancingMixed && (
                  <span className="text-[9px] text-[#9B8B70] font-bold mt-0.5 flex items-center gap-1"><Layers size={10} /> Mixed settings across clusters</span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={includeFinancingChecked}
                  onChange={(e) =>
                    handleAssetChange("includeFinancing", e.target.checked, "global")
                  }
                />
                <div className={`w-9 h-5 rounded-full transition-all flex items-center shadow-inner relative ${
                  includeFinancingMixed ? "bg-[#9B8B70]" : includeFinancingChecked ? "bg-[#1C6048]" : "bg-[#D8D8D8]"
                }`}>
                  <div className={`absolute top-[2px] bg-white border border-[#D8D8D8] rounded-full h-4 w-4 transition-all flex items-center justify-center ${
                    includeFinancingMixed ? "left-[10px] transform-none" : includeFinancingChecked ? "left-[2px] translate-x-full border-none" : "left-[2px]"
                  }`}>
                    {includeFinancingMixed && <div className="w-1.5 h-0.5 bg-[#9B8B70] rounded-sm" />}
                  </div>
                </div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                  <Map size={14} className="text-[#9B8B70]" /> Include Land Cost (Asset Level)
                </span>
                {includeLandMixed && (
                  <span className="text-[9px] text-[#9B8B70] font-bold mt-0.5 flex items-center gap-1"><Layers size={10} /> Mixed settings across clusters</span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={includeLandChecked}
                  onChange={(e) =>
                    handleAssetChange("includeLand", e.target.checked, "global")
                  }
                />
                 <div className={`w-9 h-5 rounded-full transition-all flex items-center shadow-inner relative ${
                  includeLandMixed ? "bg-[#9B8B70]" : includeLandChecked ? "bg-[#1C6048]" : "bg-[#D8D8D8]"
                }`}>
                  <div className={`absolute top-[2px] bg-white border border-[#D8D8D8] rounded-full h-4 w-4 transition-all flex items-center justify-center ${
                    includeLandMixed ? "left-[10px] transform-none" : includeLandChecked ? "left-[2px] translate-x-full border-none" : "left-[2px]"
                  }`}>
                    {includeLandMixed && <div className="w-1.5 h-0.5 bg-[#9B8B70] rounded-sm" />}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1E2F31] flex items-center gap-2">
              <DollarSign size={20} className="text-[#1C6048]" /> Consolidated Sources &
              Uses of Funds
            </h3>
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

        <div className={`grid grid-cols-2 gap-4`}>
          <KPICard
            title="Blended Equity NPV"
            value={formatCurrency(data.metrics.npv)}
            icon={<TrendingUp size={18} />}
            color="emerald"
            subtitle={`@${String(assetAssumptions?.global?.discountRate || 10)}% Disc Rate`}
          />
          <KPICard
            title="Blended Cash Multiple"
            value={`${formatNumber(data.metrics.moic, 2)}x`}
            icon={<BarChart3 size={18} />}
            color="blue"
            subtitle="Consolidated MOIC"
            tooltip={{
              desc: "Consolidated MOIC representing the aggregate wealth creation for the entire Group. It combines both the Strategic Resort Operator and Financial Partner cash profiles into a single unified multiple.",
              formula:
                "Total Consolidated Distributions ÷ Cumulative Equity Contribution",
            }}
          />
          <KPICard
            title="Blended Equity IRR"
            value={`${formatNumber((data.metrics.irr || 0) * 100, 2)}%`}
            icon={<Activity size={18} />}
            color="emerald"
            subtitle="Compounded Return"
          />
          <KPICard
            title="Blended Payback"
            value={`${formatNumber(data.metrics.payback, 2)} Yrs`}
            icon={<Clock size={18} />}
            color="indigo"
            subtitle="From Year 1 (2026)"
          />
          <KPICard
            title="Project Avg Net Margin"
            value={`${formatNumber(data.totals.lookThroughMargin, 1)}%`}
            icon={<PieChartIcon size={18} />}
            color="blue"
            subtitle="Across 12-Year Lifecycle"
          />
          <KPICard
            title="Consolidated DSCR"
            value={`${formatNumber(data.metrics.avgConsolidatedDscr, 2)}x`}
            icon={<ShieldCheck size={18} />}
            color="amber"
            subtitle="Consolidated Debt Coverage"
          />
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="text-lg font-bold text-[#1E2F31] flex items-center gap-2 mb-1">
            <Layers size={20} className="text-[#1E2F31]" /> Consolidated Group
            Position
          </h3>
          <p className="text-[10px] text-[#4C4A4B] font-medium mb-6">
            Combined position representing 100% of Asset cash flows and 49% of
            Operation operating dividends.
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                Total Combined Equity Outlay
              </span>
              <span className="font-black text-[#1E2F31]">
                {formatCurrency(data.metrics.totalEquity)}
              </span>
            </div>
            <div className="w-full h-px bg-[#D8D8D8]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                Asset Total FCFE (100%)
              </span>
              <span className="font-black text-[#9B8B70]">
                {formatCurrency(data.totals.propCoFlow)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                Operation Total Dividends (49%)
              </span>
              <span className="font-black text-[#1C6048]">
                {formatCurrency(data.totals.opCoFlow)}
              </span>
            </div>
            <div className="w-full h-px bg-[#D8D8D8]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#1E2F31] uppercase tracking-wider">
                Net Combined Return
              </span>
              <span className="font-black text-[#1E2F31]">
                {formatCurrency(data.totals.netFlow)}
              </span>
            </div>
          </div>
        </div>

        {/* Unified Partnership Split */}
        {data.metrics.partnerA && (
          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h3 className="text-lg font-bold text-[#1E2F31] mb-5 flex items-center gap-2">
              <Users size={20} className="text-[#1C6048]" /> Integrated Capital
              Split
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PartnerReturnCard
                partner="Strategic Partner"
                equity={formatCurrency(data.metrics.partnerA.equity)}
                fcf={formatCurrency(data.metrics.partnerA.fcf)}
                irr={`${formatNumber((data.metrics.partnerA.irr || 0) * 100, 1)}%`}
                yield={`${formatNumber(data.metrics.partnerA.avgYield || 0, 1)}%`}
                share={`${data.metrics.partnerA.share}%`}
                color="indigo"
              />
              <PartnerReturnCard
                partner="Vasanta (GP)"
                equity={formatCurrency(data.metrics.partnerB.equity)}
                fcf={formatCurrency(data.metrics.partnerB.fcf)}
                irr={`${formatNumber((data.metrics.partnerB.irr || 0) * 100, 1)}%`}
                yield={`${formatNumber(data.metrics.partnerB.avgYield || 0, 1)}%`}
                share={`${data.metrics.partnerB.share}%`}
                color="emerald"
              />
            </div>
          </div>
        )}
      </div>

      <div className={`space-y-6 ${isPresenting ? "lg:col-span-8" : ""}`}>
        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#99B6AA]" /> Managerial
            Look-Through PnL
          </h3>
          <div className={isPresenting ? "h-[300px]" : "h-72"}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={annualOperatingData}>
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
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  allowEscapeViewBox={{ x: true, y: true }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(val, name) =>
                    formatNumber(val, 1) + (name.includes("Margin") ? "%" : "B")
                  }
                />
                <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                <Bar
                  yAxisId="left"
                  dataKey="lookThroughRevenue"
                  name="Look-Through Revenue"
                  fill="#EFEBE7"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  dataKey="lookThroughEbitda"
                  name="Look-Through EBITDA"
                  fill="#9B8B70"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="lookThroughMargin"
                  name="Net Profit Margin"
                  stroke="#1C6048"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#1C6048",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#1E2F31]" /> Consolidated Cash
            Flow Trajectory
          </h3>
          <div className={isPresenting ? "h-[450px]" : "h-80"}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={annualMonthlyData}>
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
                  stackId="a"
                  dataKey="propCoFlow"
                  name="Asset FCFE"
                  fill="#9B8B70"
                  radius={[0, 0, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  stackId="a"
                  dataKey="opCoOperatingFlow"
                  name="Operation Dividend (49%)"
                  fill="#1C6048"
                  radius={[0, 0, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  stackId="a"
                  dataKey="opCoExitFlow"
                  name="Operation Exit (49%)"
                  fill="#99B6AA"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumCf"
                  name="Cumulative Net Position"
                  stroke="#1E2F31"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#1E2F31",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={0}
                  stroke="#D8D8D8"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
});
