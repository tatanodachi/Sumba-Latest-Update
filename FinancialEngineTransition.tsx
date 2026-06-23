import React, { useState, useMemo, memo } from "react";
import { 
  BarChartHorizontal, Info, Map, Network, Calendar, LayoutGrid, List, TrendingUp, Settings, Bot,
  TrendingDown, TrendingUp as TrendingUpIcon, Activity, PieChart as PieChartIcon, ShieldCheck, Clock,
  Building2, Users2, Landmark, CheckSquare, Layers, Download, Play, Save, CheckCircle2, ChevronRight,
  Database, RefreshCw, Send, MoveDown
} from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Bar, LineChart, Line, ComposedChart, Scatter } from "recharts";

import {
  formatNumber,
  formatCurrency,
} from "./financialEngine";

const AssetDashboardView = memo(
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
                        (z) => z.proportion === name,
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

const AssetCascadeView = memo(
  ({ data, onExport, viewResolution, setViewResolution }) => {
    const { columns, expandedYears, toggleYear } = useMonthlyColumns(
      data.monthlyData || data.annualData || [],
      viewResolution,
    );
    const scrollRef = React.useRef(null);
    const [showDevBudget, setShowDevBudget] = React.useState(true);
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState("all");
    const [isHardCostsExpanded, setIsHardCostsExpanded] = React.useState(true);
    const [isBuildingCostExpanded, setIsBuildingCostExpanded] =
      React.useState(true);
    const [isCascadeHardExpanded, setIsCascadeHardExpanded] =
      React.useState(true);
    const [isCascadeSoftExpanded, setIsCascadeSoftExpanded] =
      React.useState(true);
    const [isRevenueExpanded, setIsRevenueExpanded] = React.useState(false);
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
                  <Map size={18} className="text-[#1C6048]" /> Development
                  Budget
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
                      const finalSoftCosts =
                        (data.capexDetails?.totalSoftCosts || 0) +
                        (data.capexDetails?.devGa || 0) +
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
                            isCollapsible
                            isExpanded={isHardCostsExpanded}
                            onToggle={() =>
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
                                      isCollapsible
                                      isExpanded={isBuildingCostExpanded}
                                      onToggle={() =>
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
                <List size={14} /> Cluster P&L & Cash Flow
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
                            ? () => toggleYear(col.defaultLabel)
                            : undefined
                        }
                        className={`px-3 py-3 text-right border-b-2 border-r border-[#D8D8D8] ${col.colType === "year" ? "cursor-pointer hover:bg-white font-black underline decoration-dashed underline-offset-4 " : "font-medium text-[10px] "} bg-[#EFEBE7] ${!col.isOperating ? "text-[#9B8B70]" : "text-[#1E2F31]"} ${col.isMonth ? "min-w-[65px] whitespace-nowrap" : "min-w-[90px]"}`}
                      >
                        {col.colType === "year" ? (
                          <div className="flex items-center justify-end gap-1">
                            {expandedYears[col.defaultLabel] ? "-" : "+"}
                            {String(col.defaultLabel)}
                          </div>
                        ) : (
                          <div className="text-center w-full">
                            {String(col.defaultLabel)}
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
                        isCollapsible
                        isExpanded={isCascadeHardExpanded}
                        onToggle={() =>
                          setIsCascadeHardExpanded(!isCascadeHardExpanded)
                        }
                      />
                      {isCascadeHardExpanded && (
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
                        isCollapsible
                        isExpanded={isCascadeSoftExpanded}
                        onToggle={() =>
                          setIsCascadeSoftExpanded(!isCascadeSoftExpanded)
                        }
                      />
                      {isCascadeSoftExpanded && (
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
                        isCollapsible
                        isExpanded={isRevenueExpanded}
                        onToggle={() => setIsRevenueExpanded(!isRevenueExpanded)}
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
                        isCollapsible
                        isExpanded={isCogsExpanded}
                        onToggle={() => setIsCogsExpanded(!isCogsExpanded)}
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
                        isCollapsible
                        isExpanded={isOverheadExpanded}
                        onToggle={() => setIsOverheadExpanded(!isOverheadExpanded)}
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
                        isCollapsible
                        isExpanded={isPreOpExpanded}
                        onToggle={() => setIsPreOpExpanded(!isPreOpExpanded)}
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
                        isCollapsible
                        isExpanded={isOutflowsExpanded}
                        onToggle={() => setIsOutflowsExpanded(!isOutflowsExpanded)}
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
                          <TableRow\n                            label="FF&E Reserve"\n                            data={columns}\n                            dk="ffeReserve"\n                            total={data.totals?.ffeReserve}\n                            isDoubleIndent\n                          />
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
                      />
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

const ConsolidatedDashboardView = memo(
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
              desc: "Consolidated MOIC representing the aggregate wealth creation for the entire Group. It combines both the Strategic Hospital Operator and Financial Partner cash profiles into a single unified multiple.",
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
            subtitle="From Year 1"
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

const ConsolidatedCascadeView = memo(
  ({ data, onExport, viewResolution, setViewResolution }) => {
    const { columns, expandedYears, toggleYear } = useMonthlyColumns(
      data.monthlyData || data.annualData || [],
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
    const [isConsCascadeSoftExpanded, setIsConsCascadeSoftExpanded] =
      React.useState(true);
    const [isRevenueExpanded, setIsRevenueExpanded] = React.useState(false);
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
                      const finalSoftCosts =
                        (data.capexDetails?.totalSoftCosts || 0) +
                        (data.capexDetails?.devGa || 0) +
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
                            isCollapsible
                            isExpanded={isHardCostsExpanded}
                            onToggle={() =>
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
                                      isCollapsible
                                      isExpanded={isBuildingCostExpanded}
                                      onToggle={() =>
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
                            ? () => toggleYear(col.defaultLabel)
                            : undefined
                        }
                        className={`px-3 py-3 text-right border-b-2 border-r border-[#D8D8D8] ${col.colType === "year" ? "cursor-pointer hover:bg-white font-black underline decoration-dashed underline-offset-4 " : "font-medium text-[10px] "} bg-[#EFEBE7] ${!col.isOperating ? "text-[#9B8B70]" : "text-[#1E2F31]"} ${col.isMonth ? "min-w-[65px] whitespace-nowrap" : "min-w-[90px]"}`}
                      >
                        {col.colType === "year" ? (
                          <div className="flex items-center justify-end gap-1">
                            {expandedYears[col.defaultLabel] ? "-" : "+"}
                            {String(col.defaultLabel)}
                          </div>
                        ) : (
                          <div className="text-center w-full">
                            {String(col.defaultLabel)}
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
                        isCollapsible
                        isExpanded={isConsCascadeHardExpanded}
                        onToggle={() =>
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
                        isCollapsible
                        isExpanded={isConsCascadeSoftExpanded}
                        onToggle={() =>
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
                        isCollapsible
                        isExpanded={isRevenueExpanded}
                        onToggle={() => setIsRevenueExpanded(!isRevenueExpanded)}
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
                        isCollapsible
                        isExpanded={isCogsExpanded}
                        onToggle={() => setIsCogsExpanded(!isCogsExpanded)}
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
                        isCollapsible
                        isExpanded={isOverheadExpanded}
                        onToggle={() => setIsOverheadExpanded(!isOverheadExpanded)}
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
                        isCollapsible
                        isExpanded={isPreOpExpanded}
                        onToggle={() => setIsPreOpExpanded(!isPreOpExpanded)}
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
                        isCollapsible
                        isExpanded={isOutflowsExpanded}
                        onToggle={() => setIsOutflowsExpanded(!isOutflowsExpanded)}
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
                          <TableRow\n                            label="FF&E Reserve"\n                            data={columns}\n                            dk="ffeReserve"\n                            total={data.totals?.ffeReserve}\n                            isDoubleIndent\n                          />
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
                      />
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

const AssetSettingsView = memo(
  ({
    data,
    assumptions,
    onChange,
    isLocked,
    onToggleLock,
    onSave,
    saveStatus,
    onReset,
    onValidate,
    isCloudSync,
    isPresenting,
    clusterFilter = "consolidated",
    setClusterFilter = () => {},
  }) => {
    const clusterKeys = useMemo(() => {
      return Object.keys(
        assumptions?.clusters || INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters,
      );
    }, [assumptions]);
    const firstClusterKey = clusterKeys[0] || "Glamping";

    const [localActiveSubTab, setLocalActiveSubTab] = useState(
      clusterFilter === "consolidated" ? firstClusterKey : clusterFilter,
    );

    useEffect(() => {
      if (clusterFilter !== "consolidated") {
        setLocalActiveSubTab(clusterFilter);
      }
    }, [clusterFilter]);

    const activeSubTab = localActiveSubTab;
    const setActiveSubTab = (tab) => {
      setLocalActiveSubTab(tab);
      if (clusterFilter !== "consolidated") {
        setClusterFilter(tab);
      }
    };

    const hasClusters = assumptions && !!assumptions.clusters;
    const activeAssumptionsRaw = hasClusters
      ? assumptions.clusters[activeSubTab]
      : assumptions;

    const activeAssumptions = useMemo(() => {
      if (!hasClusters || !assumptions.clusters || !activeAssumptionsRaw)
        return activeAssumptionsRaw;
      const totalLandArea = Object.values(assumptions.clusters).reduce(
        (sum, c: any) => sum + (c.landArea || 0),
        0,
      );
      const clusterRatio =
        totalLandArea > 0
          ? (activeAssumptionsRaw.landArea || 0) / totalLandArea
          : 0;
      return {
        ...activeAssumptionsRaw,
        capexSharingDevQty:
          (assumptions.global?.capexSharingDevQty || 0) * clusterRatio,
      };
    }, [
      activeAssumptionsRaw,
      assumptions.global?.capexSharingDevQty,
      assumptions.clusters,
      hasClusters,
      activeSubTab,
    ]);

    const handleKeyChange = (key, val) => {
      if (hasClusters) {
        onChange(key, val, activeSubTab);
      } else {
        onChange(key, val);
      }
    };

    const [isEditingSeasonality, setIsEditingSeasonality] = useState(false);

    const activeRoomUnits =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? activeAssumptions.glampingMix
            .filter((item: any) => item.isAccommodation)
            .reduce((sum: number, item: any) => sum + (item.qty || 0), 0)
        : activeAssumptions.roomUnits || 15;

    const totalGUnits =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? activeAssumptions.glampingMix.reduce(
            (sum: number, item: any) => sum + (item.qty || 0),
            0,
          )
        : activeAssumptions.roomUnits || 15;

    const buildCostForUi =
      activeAssumptions.type === "glamping"
        ? activeAssumptions.glampingMix
          ? activeAssumptions.glampingMix.reduce(
              (sum: number, item: any) =>
                sum + (item.qty || 0) * (item.villaCost || 0),
              0,
            ) / 1e9
          : ((activeAssumptions.roomUnits || 0) *
              (activeAssumptions.buildCost || 0)) /
            1000
        : ((activeAssumptions.buildArea || 0) *
            (activeAssumptions.buildCost || 0)) /
          1000;

    const averageGlampingCostPerUnit =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? Math.round(((buildCostForUi * 1000) / (totalGUnits || 1)) * 10) / 10
        : activeAssumptions.buildCost;
    const ffeCostForUi =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? activeAssumptions.glampingMix.reduce(
            (sum: number, item: any) =>
              sum + (item.qty || 0) * (item.interiorCost || 0),
            0,
          ) / 1e9
        : (activeAssumptions.capexFFEQty * activeAssumptions.capexFFEPrice) /
          1000;
    const averageFfeCostPerUnit =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? Math.round(((ffeCostForUi * 1000) / (totalGUnits || 1)) * 10) / 10
        : activeAssumptions.capexFFEPrice;
    const infraCostForUi =
      activeAssumptions.type === "glamping"
        ? (activeAssumptions.capexInfraQty * activeAssumptions.capexInfraPrice +
            activeRoomUnits * (activeAssumptions.civilMepCostPerUnit || 150)) /
          1000
        : (activeAssumptions.capexInfraQty *
            activeAssumptions.capexInfraPrice) /
          1000;
    const coreCostForPctUi = buildCostForUi + ffeCostForUi + infraCostForUi;
    const consultantCostUi =
      coreCostForPctUi * ((activeAssumptions.capexConsultantPct || 0) / 100);
    const licenseCostUi =
      coreCostForPctUi * ((activeAssumptions.capexLicensePct || 0) / 100);
    const sharingDevCostForUi =
      (activeAssumptions.capexSharingDevQty *
        activeAssumptions.capexSharingDevPrice) /
      1000;
    const vatBaseUi =
      consultantCostUi +
      buildCostForUi +
      ffeCostForUi +
      infraCostForUi +
      sharingDevCostForUi;
    const vatCostUi = vatBaseUi * ((activeAssumptions.capexVat || 0) / 100);
    const contingencyBaseUi =
      licenseCostUi +
      consultantCostUi +
      buildCostForUi +
      ffeCostForUi +
      infraCostForUi +
      sharingDevCostForUi +
      vatCostUi;
    const contingencyCostUi =
      contingencyBaseUi * ((activeAssumptions.capexContingencyPct || 0) / 100);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] p-5 lg:p-8 mb-12 text-xs">
        <SettingsHeader
          title="Asset Configuration"
          icon={<Settings className="text-[#9B8B70]" />}
          onToggleLock={onToggleLock}
          isLocked={isLocked}
          onSave={onSave}
          saveStatus={saveStatus}
          onReset={onReset}
          onValidate={onValidate}
          isCloudSync={isCloudSync}
        />

        {/* CLUSTER SPECIFIC MANIFEST */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-10">
              {/* Column 1: Development & Capex */}
          <div className="space-y-4">
            <SectionTitle
              title="Development & Capex"
              icon={<Building size={16} />}
              color="rose"
            />
            <div className="space-y-4">
              <ToggleRow
                label="Include Land Cost"
                desc="Amortize land price in Year 0."
                checked={activeAssumptions.includeLand ?? true}
                onChange={(v) => handleKeyChange("includeLand", v)}
                isLocked={isLocked}
              />
              {(activeAssumptions.includeLand ?? true) && (
                <div className="pl-2 border-l border-[#D8D8D8] space-y-0">
                  <AssumptionRow
                    label="Land Price"
                    val={activeAssumptions.landPrice}
                    set={(v) => handleKeyChange("landPrice", v)}
                    unit="M/Sqm"
                    isLocked={isLocked}
                  />
                  <AssumptionRow
                    label="Land Area"
                    val={activeAssumptions.landArea}
                    set={(v) => handleKeyChange("landArea", v)}
                    unit="Sqm"
                    isLocked={isLocked}
                  />
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-[#D8D8D8]/50 space-y-0">
              <AssumptionRow
                label={
                  activeAssumptions.type === "glamping"
                    ? "Est. Build Area"
                    : "Building Area (GFA)"
                }
                val={activeAssumptions.buildArea}
                set={(v) => handleKeyChange("buildArea", v)}
                unit="Sqm"
                isLocked={isLocked}
              />
              <AssumptionRow
                label={
                  activeAssumptions.type === "glamping"
                    ? "Glamping Cost per Unit"
                    : "Construction Cost"
                }
                val={
                  activeAssumptions.type === "glamping"
                    ? averageGlampingCostPerUnit
                    : activeAssumptions.buildCost
                }
                set={(v) => {
                  if (activeAssumptions.type !== "glamping") {
                    handleKeyChange("buildCost", v);
                  }
                }}
                unit={
                  activeAssumptions.type === "glamping" ? "M/Unit" : "M/Sqm"
                }
                isLocked={isLocked || activeAssumptions.type === "glamping"}
                tooltip={
                  activeAssumptions.type === "glamping"
                    ? "Weighted average cost of tent structures and interiors, dynamically derived from the Glamping Mix table below."
                    : undefined
                }
              />
              <AssumptionRow
                label="FF&E Setup"
                val={
                  activeAssumptions.type === "glamping"
                    ? averageFfeCostPerUnit
                    : activeAssumptions.capexFFEPrice
                }
                set={(v) => {
                  if (activeAssumptions.type !== "glamping") {
                    handleKeyChange("capexFFEPrice", v);
                  }
                }}
                unit={activeAssumptions.type === "glamping" ? "M/Unit" : "M"}
                isLocked={isLocked || activeAssumptions.type === "glamping"}
                tooltip={
                  activeAssumptions.type === "glamping"
                    ? "Weighted average interior cost of tents, dynamically derived from the Glamping Mix table below."
                    : undefined
                }
              />
              {activeAssumptions.type === "glamping" && (
                <AssumptionRow
                  label="Civil & MEP / Unit"
                  val={activeAssumptions.civilMepCostPerUnit}
                  set={(v) => handleKeyChange("civilMepCostPerUnit", v)}
                  unit="M/Unit"
                  isLocked={isLocked}
                />
              )}
              <AssumptionRow
                label="Year 1 Capex Draw"
                val={activeAssumptions.equityDrawYear1Pct ?? 100}
                set={(v) =>
                  handleKeyChange(
                    "equityDrawYear1Pct",
                    Math.min(100, Math.max(0, parseFloat(v) || 0)),
                  )
                }
                unit="%"
                isLocked={isLocked || activeAssumptions.devDurationMonths <= 12}
              />
            </div>

            <div className="pt-2 border-t border-[#D8D8D8]/50 space-y-0">
              <AssumptionRowQtyPrice
                label="Cluster Infrastructure"
                qtyVal={activeAssumptions.capexInfraQty}
                priceVal={activeAssumptions.capexInfraPrice}
                setQty={(v) => handleKeyChange("capexInfraQty", v)}
                setPrice={(v) => handleKeyChange("capexInfraPrice", v)}
                isLocked={isLocked}
              />
              <AssumptionRowQtyPrice
                label="Sharing Development"
                qtyVal={activeAssumptions.capexSharingDevQty}
                priceVal={activeAssumptions.capexSharingDevPrice}
                setQty={(v) => handleKeyChange("capexSharingDevQty", v)}
                setPrice={(v) => handleKeyChange("capexSharingDevPrice", v)}
                isLocked={isLocked || activeSubTab !== "global"}
              />
              <AssumptionRowCalculated
                label="Design & Consultant Fees"
                pctVal={activeAssumptions.capexConsultantPct}
                setPct={(v) => handleKeyChange("capexConsultantPct", v)}
                calculatedVal={consultantCostUi}
                isLocked={isLocked}
              />
              <AssumptionRowCalculated
                label="Licensing & Registrations"
                pctVal={activeAssumptions.capexLicensePct}
                setPct={(v) => handleKeyChange("capexLicensePct", v)}
                calculatedVal={licenseCostUi}
                isLocked={isLocked}
              />
              <AssumptionRowCalculated
                label="Capitalized VAT"
                pctVal={activeAssumptions.capexVat}
                setPct={(v) => handleKeyChange("capexVat", v)}
                calculatedVal={vatCostUi}
                isLocked={isLocked}
              />
              <AssumptionRowCalculated
                label="Development Contingency"
                pctVal={activeAssumptions.capexContingencyPct}
                setPct={(v) => handleKeyChange("capexContingencyPct", v)}
                calculatedVal={contingencyCostUi}
                isLocked={isLocked}
              />
            </div>
          </div>

          {/* Column 2: Commercial & Operations */}
          <div className="space-y-4">
            <SectionTitle
              title="Commercial & Operations"
              icon={<Palmtree size={16} />}
              color="indigo"
            />
            {activeAssumptions.type !== "glamping" && (
              <div className="space-y-0">
                <AssumptionRow
                  label="Manual Base Rent Y1"
                  val={activeAssumptions.manualBaseRent}
                  set={(v) => handleKeyChange("manualBaseRent", v)}
                  unit="B"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Rent Escalation / Yr"
                  val={activeAssumptions.manualRentEscalation}
                  set={(v) => handleKeyChange("manualRentEscalation", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </div>
            )}
            {activeAssumptions.type === "glamping" && (
              <div className="space-y-0">
                <AssumptionRow
                  label="Glamping Units"
                  val={activeRoomUnits}
                  set={(v) => {}}
                  unit="Rooms"
                  isLocked={true}
                  tooltip="Calculated dynamically based on active Accommodation structures in the Tent Model Mix table below."
                />
                <AssumptionRow
                  label="Bar Units"
                  val={activeAssumptions.barUnits}
                  set={(v) => handleKeyChange("barUnits", v)}
                  unit="Unit"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Average Daily Rate"
                  val={activeAssumptions.adr}
                  set={(v) => handleKeyChange("adr", v)}
                  unit="IDR"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="ADR Esc. (Yr 1-5)"
                  val={activeAssumptions.adrEscalationYear1to5}
                  set={(v) => handleKeyChange("adrEscalationYear1to5", v)}
                  unit="%/Yr"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="ADR Esc. (Yr 6+)"
                  val={activeAssumptions.adrEscalationAfterYear5}
                  set={(v) => handleKeyChange("adrEscalationAfterYear5", v)}
                  unit="%/Yr"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Bar Revenue"
                  val={activeAssumptions.barRevenuePctOfRoom * 100}
                  set={(v) => handleKeyChange("barRevenuePctOfRoom", v / 100)}
                  unit="% of ADR"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="F&B COGS"
                  val={activeAssumptions.fbCogsPct}
                  set={(v) => handleKeyChange("fbCogsPct", v)}
                  unit="% of F&B"
                  isLocked={isLocked}
                />
                <div className="pt-2">
                  <AssumptionRow
                    label="Initial Occupancy"
                    val={activeAssumptions.initialOccupancy * 100}
                    set={(v) => handleKeyChange("initialOccupancy", v / 100)}
                    unit="%"
                    isLocked={isLocked}
                  />
                  <AssumptionRow
                    label="Stabilized Occupancy"
                    val={activeAssumptions.stabilizedOccupancy * 100}
                    set={(v) => handleKeyChange("stabilizedOccupancy", v / 100)}
                    unit="%"
                    isLocked={isLocked}
                  />
                </div>

                <div className="pt-4 mt-2 border-t border-[#D8D8D8]/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#1E2F31]">
                      Sumba Seasonality Curve
                    </h4>
                    <button
                      onClick={() =>
                        setIsEditingSeasonality(!isEditingSeasonality)
                      }
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full transition-all ${
                        isEditingSeasonality
                          ? "bg-[#1E2F31] text-white"
                          : "bg-[#1C6048]/10 text-[#1C6048] hover:bg-[#1C6048]/20"
                      }`}
                    >
                      {isEditingSeasonality
                        ? "Close Panel"
                        : "Adjust Multipliers"}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#4C4A4B] mb-3 leading-relaxed">
                    Adjusts active ADR and room revenue dynamically based on
                    dry/wet travel months. Peaks during high season in{" "}
                    <span className="font-bold text-[#1C6048]">July</span> and
                    dips during rainy season in{" "}
                    <span className="font-bold text-[#9B8B70]">February</span>.
                  </p>
                  <div className="grid grid-cols-12 gap-1 bg-[#EFEBE7]/40 p-2.5 rounded-xl border border-[#D8D8D8]/30 mb-2">
                    {(() => {
                      const MONTH_LABELS = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ];
                      const currentSeasonality =
                        activeAssumptions.seasonality || [
                          0.8, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2, 1.0, 0.9,
                          0.8,
                        ];
                      const maxVal = Math.max(...currentSeasonality, 1.0);
                      return currentSeasonality.map((val, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center justify-end h-16 group relative"
                        >
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1E2F31] text-white text-[9px] font-bold py-0.5 px-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {Number(val).toFixed(2)}x
                          </div>
                          <div
                            className={`w-full rounded-t-[3px] transition-all duration-300 ${
                              val >= 1.3
                                ? "bg-[#1C6048]"
                                : val <= 0.8
                                  ? "bg-[#9B8B70]"
                                  : "bg-[#99B6AA]"
                            }`}
                            style={{ height: `${(val / maxVal) * 100}%` }}
                          />
                          <div className="text-[9px] font-mono font-bold mt-1 text-[#4C4A4B] text-center w-full">
                            {MONTH_LABELS[idx][0]}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {isEditingSeasonality && (
                    <div className="mt-3 p-3 bg-[#EFEBE7]/20 rounded-xl border border-[#D8D8D8]/40 space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-center pb-1 border-b border-[#D8D8D8]/30">
                        <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-wider">
                          Adjustment Panel
                        </span>
                        <button
                          onClick={() =>
                            handleKeyChange(
                              "seasonality",
                              [
                                0.8, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2,
                                1.0, 0.9, 0.8,
                              ],
                            )
                          }
                          className="text-[10px] text-[#1C6048] hover:underline font-bold font-mono"
                        >
                          Reset to Default
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                        {(() => {
                          const MONTH_LABELS = [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ];
                          const currentSeasonality =
                            activeAssumptions.seasonality || [
                              0.8, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2, 1.0,
                              0.9, 0.8,
                            ];
                          return currentSeasonality.map((val, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <div className="flex justify-between items-center text-[10px] font-semibold text-[#1E2F31]">
                                <span>{MONTH_LABELS[idx]}</span>
                                <span className="font-mono text-[9px] bg-white px-1.5 py-0.5 rounded shadow-sm border border-[#D8D8D8]/40 font-bold text-[#1C6048]">
                                  {Number(val).toFixed(2)}x
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.1"
                                max="3.0"
                                step="0.05"
                                value={val}
                                disabled={isLocked}
                                onChange={(e) => {
                                  const nextSeasonality = [
                                    ...currentSeasonality,
                                  ];
                                  nextSeasonality[idx] = parseFloat(
                                    e.target.value,
                                  );
                                  handleKeyChange(
                                    "seasonality",
                                    nextSeasonality,
                                  );
                                }}
                                className="w-full accent-[#1C6048] h-1 bg-[#D8D8D8]/60 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-2 border-t border-[#D8D8D8]/50">
                  <h4 className="text-xs font-bold text-[#1E2F31] mb-3">
                    Glamping OpEx (% of Revenue)
                  </h4>
                  <div className="space-y-0">
                    <AssumptionRow
                      label="Direct Labor"
                      val={(activeAssumptions.directLaborPct ?? 0.15) * 100}
                      set={(v) => handleKeyChange("directLaborPct", v / 100)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Direct Repairs"
                      val={(activeAssumptions.directRepairsPct ?? 0.07) * 100}
                      set={(v) => handleKeyChange("directRepairsPct", v / 100)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Direct Utilities"
                      val={(activeAssumptions.directUtilitiesPct ?? 0.05) * 100}
                      set={(v) =>
                        handleKeyChange("directUtilitiesPct", v / 100)
                      }
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Admin Labor"
                      val={(activeAssumptions.adminLaborPct ?? 0.1) * 100}
                      set={(v) => handleKeyChange("adminLaborPct", v / 100)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Marketing"
                      val={(activeAssumptions.marketingPct ?? 0.05) * 100}
                      set={(v) => handleKeyChange("marketingPct", v / 100)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Admin General"
                      val={(activeAssumptions.adminGeneralPct ?? 0.05) * 100}
                      set={(v) => handleKeyChange("adminGeneralPct", v / 100)}
                      unit="%"
                      isLocked={isLocked}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
            </div>

            {/* Glamping Mix Table - Relocated to span Col 1+2 (Red Annotation) */}
            {activeAssumptions.type === "glamping" && (
              <div className="pt-2">
                <GlampingMixTable
                  mix={activeAssumptions.glampingMix || []}
                  onChange={(newMix) => handleKeyChange("glampingMix", newMix)}
                  isLocked={isLocked}
                />
              </div>
            )}
          </div>

          {/* Column 3: Financial Framework */}
          <div className="space-y-4">
            <SectionTitle
              title="Financial Framework"
              icon={<Scale size={16} />}
              color="teal"
            />

            {/* Sub-group 1: Pre-Operational & Development Expenses */}
            <div className="flex flex-col gap-2.5 p-3 bg-[#EFEBE7]/20 rounded-xl border border-[#D8D8D8]/40">
              <div className="flex items-center justify-between pb-1 border-b border-[#D8D8D8]/50">
                <span className="text-[10px] text-[#1C6048] font-black uppercase tracking-wider">
                  A. Pre-Operational Phase
                </span>
                <span className="text-[8px] bg-[#1C6048]/10 text-[#1C6048] font-bold px-1.5 py-0.5 rounded uppercase">
                  Expensed
                </span>
              </div>
              <p className="text-[9px] text-[#8a8175] italic leading-tight">
                Direct G&A and CAR insurance are expensed as incurred during
                development (and excluded from capitalized soft cost draws).
              </p>
              <div className="space-y-0">
                <AssumptionRow
                  label="Const. G&A Overhead"
                  val={activeAssumptions.constructionOpexMonthly}
                  set={(v) => handleKeyChange("constructionOpexMonthly", v)}
                  unit="B/Mo"
                  isLocked={isLocked}
                  tooltip="Pre-operating development overhead/G&A expensed monthly during construction."
                />
                <AssumptionRowCalculated
                  label="Const. All Risk (CAR)"
                  pctVal={activeAssumptions.capexCarPct}
                  setPct={(v) => handleKeyChange("capexCarPct", v)}
                  calculatedVal={
                    buildCostForUi *
                    ((activeAssumptions.capexCarPct || 0) / 100)
                  }
                  isLocked={isLocked}
                  tooltip="Construction All Risk insurance premium expensed as incurred during development."
                />
                <AssumptionRow
                  label="Pre-Opening Cost"
                  val={activeAssumptions.preOpeningMonthly}
                  set={(v) => handleKeyChange("preOpeningMonthly", v)}
                  unit="B/Mo"
                  isLocked={isLocked}
                  tooltip="Pre-opening marketing and setup cost expensed monthly."
                />
                <AssumptionRow
                  label="Pre-Opening Duration"
                  val={activeAssumptions.preOpeningDuration}
                  set={(v) => handleKeyChange("preOpeningDuration", v)}
                  unit="Mo"
                  isLocked={isLocked}
                  tooltip="Months prior to Commercial Opening for pre-opening operations."
                />
              </div>
            </div>

            {/* Sub-group 2: Operating & Hospital Phase Expenses */}
            <div className="flex flex-col gap-2.5 p-3 bg-white rounded-xl border border-[#D8D8D8]/40">
              <div className="flex items-center justify-between pb-1 border-b border-[#D8D8D8]/50">
                <span className="text-[10px] text-[#9B8B70] font-black uppercase tracking-wider">
                  B. Operating Phase (OPCO)
                </span>
                <span className="text-[8px] bg-[#9B8B70]/10 text-[#9B8B70] font-bold px-1.5 py-0.5 rounded uppercase">
                  Operating OPEX
                </span>
              </div>
              <p className="text-[9px] text-[#8a8175] italic leading-tight">
                Recurring expenses, property taxes, maintenance, and
                administrative overheads during active clinical operations.
              </p>
              <div className="space-y-0">
                <AssumptionRow
                  label="Op. Overhead / G&A"
                  val={activeAssumptions.opOverheadMonthly}
                  set={(v) => handleKeyChange("opOverheadMonthly", v)}
                  unit="B/Mo"
                  isLocked={isLocked}
                  tooltip="Fixed operating overhead and clinical administration expenses."
                />
                <AssumptionRow
                  label="Overhead Incr. (Inflation)"
                  val={activeAssumptions.opOverheadInc}
                  set={(v) => handleKeyChange("opOverheadInc", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Maintenance Rate"
                  val={activeAssumptions.maintRate}
                  set={(v) => handleKeyChange("maintRate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Property Tax Rate"
                  val={activeAssumptions.propTaxRate}
                  set={(v) => handleKeyChange("propTaxRate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="FF&E Reserve"
                  val={activeAssumptions.ffeReservePct}
                  set={(v) => handleKeyChange("ffeReservePct", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#D8D8D8]/50">
              <SectionTitle
                title="Depreciation (D&A)"
                icon={<Calculator size={16} />}
                color="blue"
              />
              <div className="space-y-0 mt-3">
                <AssumptionDepreciationGroup
                  label="Building"
                  methodVal={activeAssumptions.depMethodBuilding}
                  lifeVal={activeAssumptions.depLifeBuilding}
                  setMethod={(v) => handleKeyChange("depMethodBuilding", v)}
                  setLife={(v) => handleKeyChange("depLifeBuilding", v)}
                  isLocked={isLocked}
                />
                <AssumptionDepreciationGroup
                  label="Infrastructure"
                  methodVal={activeAssumptions.depMethodInfra}
                  lifeVal={activeAssumptions.depLifeInfra}
                  setMethod={(v) => handleKeyChange("depMethodInfra", v)}
                  setLife={(v) => handleKeyChange("depLifeInfra", v)}
                  isLocked={isLocked}
                />
                <AssumptionDepreciationGroup
                  label="FF&E"
                  methodVal={activeAssumptions.depMethodFFE}
                  lifeVal={activeAssumptions.depLifeFFE}
                  setMethod={(v) => handleKeyChange("depMethodFFE", v)}
                  setLife={(v) => handleKeyChange("depLifeFFE", v)}
                  isLocked={isLocked}
                />
              </div>
            </div>
            {/* Cluster Capital Structure & Debt */}
            <div className="pt-4 border-t border-[#D8D8D8]/50 space-y-3">
              <div className="flex items-center gap-2 py-2 border-b border-[#D8D8D8] text-[11px] font-bold text-[#1E2F31] px-1 rounded">
                <Landmark size={14} className="text-[#1C6048]" /> Cluster Capital Structure & Debt
              </div>
              <div className="space-y-3 pt-1">
                  <ToggleRow
                    label="Include Debt Financing"
                    desc="Use bank loan for construction."
                    checked={activeAssumptions.includeFinancing}
                    onChange={(v) => handleKeyChange("includeFinancing", v)}
                    isLocked={isLocked}
                  />
                  
                  {activeAssumptions.includeFinancing && (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#EFEBE7] border border-[#D8D8D8] rounded-xl flex justify-between items-center mt-3">
                        <div>
                          <p className="font-bold text-[#1E2F31] text-[11px] uppercase tracking-wide">Debt Calculation Basis</p>
                          <p className="text-[10px] text-[#4C4A4B]">LTV applies solely to non-land capex</p>
                        </div>
                        <div className="font-mono text-[14px] font-black text-[#1E2F31]">
                          {formatNumber(data?.capexDetails?.totalCapexExLand ?? 0, 1)} B
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-[#D8D8D8] rounded-xl flex justify-between items-center mb-3">
                        <div>
                          <p className="font-bold text-[#1E2F31] text-[11px] uppercase tracking-wide">Drawdown Scenario</p>
                        </div>
                        <div className="flex bg-[#E5E2DE] p-0.5 rounded-lg relative select-none">
                          <button 
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleKeyChange("drawdownScenario", "monthly")}
                            className={`relative px-4 py-1.5 rounded-md text-[10px] font-bold tracking-wide transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-10 min-w-[95px] text-center ${
                              activeAssumptions.drawdownScenario !== "tranches" ? "text-[#1E2F31]" : "text-[#9B8B70] hover:text-[#1E2F31]"
                            }`}
                          >
                            Monthly Basis
                            {activeAssumptions.drawdownScenario !== "tranches" && (
                              <motion.div
                                layoutId="drawdownPillBackground"
                                className="absolute inset-0 bg-white border border-[#D8D8D8] rounded-md shadow-sm -z-10"
                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                              />
                            )}
                          </button>
                          <button 
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleKeyChange("drawdownScenario", "tranches")}
                            className={`relative px-4 py-1.5 rounded-md text-[10px] font-bold tracking-wide transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-10 min-w-[95px] text-center ${
                              activeAssumptions.drawdownScenario === "tranches" ? "text-[#1E2F31]" : "text-[#9B8B70] hover:text-[#1E2F31]"
                            }`}
                          >
                            Tranche-Based
                            {activeAssumptions.drawdownScenario === "tranches" && (
                              <motion.div
                                layoutId="drawdownPillBackground"
                                className="absolute inset-0 bg-white border border-[#D8D8D8] rounded-md shadow-sm -z-10"
                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                              />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {activeAssumptions.drawdownScenario === "tranches" && (
                        <div className="px-1 mb-3">
                          <DrawdownTranchesInput
                            tranches={activeAssumptions.drawdownTranches || [20, 40, 60, 80, 100]}
                            setTranches={(v) => handleKeyChange("drawdownTranches", v)}
                            isLocked={isLocked}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-0">
                    <AssumptionRow
                      label="Loan To Value (LTV)"
                      val={activeAssumptions.ltv}
                      set={(v) => handleKeyChange("ltv", v)}
                      unit="%"
                      isLocked={isLocked || !activeAssumptions.includeFinancing}
                    />
                    <AssumptionRow
                      label="Interest Rate"
                      val={activeAssumptions.interestRate}
                      set={(v) => handleKeyChange("interestRate", v)}
                      unit="%"
                      isLocked={isLocked || !activeAssumptions.includeFinancing}
                    />
                    <AssumptionRow
                      label="Loan Tenor"
                      val={activeAssumptions.loanTenor}
                      set={(v) => handleKeyChange("loanTenor", v)}
                      unit="Yrs"
                      isLocked={isLocked || !activeAssumptions.includeFinancing}
                    />
                    <AssumptionRow
                      label="IO Grace Period"
                      val={activeAssumptions.ioGracePeriodYears}
                      set={(v) => handleKeyChange("ioGracePeriodYears", v)}
                      unit="Yrs"
                      isLocked={isLocked || !activeAssumptions.includeFinancing}
                    />
                    <AssumptionRow
                      label="Discount Rate"
                      val={activeAssumptions.discountRate}
                      set={(v) => handleKeyChange("discountRate", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                  </div>
                </div>
            </div>

            {/* Cluster Exit Strategy & Tax */}
            <div className="pt-4 border-t border-[#D8D8D8]/50 space-y-3">
              <div className="flex items-center gap-2 py-2 border-b border-[#D8D8D8] text-[11px] font-bold text-[#1E2F31] px-1 rounded">
                <DollarSign size={14} className="text-[#9B8B70]" /> Cluster Exit Strategy & Tax
              </div>
              <div className="space-y-3 pt-1">
                  <ToggleRow
                    label="Include Exit in Yr 10"
                    desc="Calculate Terminal Value."
                    checked={activeAssumptions.includeTerminalValue}
                    onChange={(v) => handleKeyChange("includeTerminalValue", v)}
                    isLocked={isLocked}
                  />
                  <div className="space-y-0">
                    {activeAssumptions.includeTerminalValue && (
                      <>
                        <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded transition-colors min-h-[28px] gap-2">
                          <label className="text-[10px] text-[#4C4A4B] font-bold">
                            Valuation Method
                          </label>
                          <div className="flex items-center bg-[#D8D8D8] rounded p-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() =>
                                handleKeyChange("exitMethod", "capRate")
                              }
                              className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeAssumptions.exitMethod !== "multiple" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
                            >
                              Cap Rate
                            </button>
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() =>
                                handleKeyChange("exitMethod", "multiple")
                              }
                              className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeAssumptions.exitMethod === "multiple" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
                            >
                              EV/EBITDA
                            </button>
                          </div>
                        </div>
                        {activeAssumptions.exitMethod === "multiple" ? (
                          <AssumptionRow
                            label="Exit Multiple"
                            val={activeAssumptions.exitMultiple}
                            set={(v) => handleKeyChange("exitMultiple", v)}
                            unit="x"
                            isLocked={isLocked}
                          />
                        ) : (
                          <AssumptionRow
                            label="Exit Cap Rate"
                            val={activeAssumptions.exitCapRate}
                            set={(v) => handleKeyChange("exitCapRate", v)}
                            unit="%"
                            isLocked={isLocked}
                          />
                        )}
                        <AssumptionRow
                          label="Selling Costs"
                          val={activeAssumptions.sellingCosts}
                          set={(v) => handleKeyChange("sellingCosts", v)}
                          unit="%"
                          isLocked={isLocked}
                        />
                      </>
                    )}
                    <AssumptionRow
                      label="Corporate Tax"
                      val={activeAssumptions.corporateTax}
                      set={(v) => handleKeyChange("corporateTax", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const AssetSensitivityView = memo(({ assumptions }) => {
  const costSteps = [9, 10, 11.5, 13, 14];
  const rateSteps = [8, 9, 10.5, 12, 13];
  const paybackMatrix = costSteps.map((bc) =>
    rateSteps.map((ir) => {
      // Build a temporary assumptions state with modified interestRate in global and buildCost under each cluster
      const tempAssumptions = {
        global: {
          ...(assumptions.global || assumptions),
          interestRate: ir,
        },
        clusters: assumptions.clusters
          ? Object.keys(assumptions.clusters).reduce((acc, cName) => {
              acc[cName] = {
                ...assumptions.clusters[cName],
                buildCost: bc,
              };
              return acc;
            }, {})
          : {
              default: {
                ...assumptions,
                buildCost: bc,
              },
            },
      };
      return (
        runConsolidatedAssetEngine(tempAssumptions).metrics.operatingPayback ||
        0
      );
    }),
  );
  return (
    <SensitivityTable
      title="Operating Payback Sensitivity"
      subtitle="Interest Rate vs. Build Cost"
      xLabel="Rate"
      yLabel="Cost"
      xValues={rateSteps}
      yValues={costSteps}
      matrix={paybackMatrix}
      formatFn={(v) => (v === 0 ? "Never" : formatNumber(v, 1) + " Yrs")}
      reverseColors
    />
  );
});

function AIAuditView({
  aiInsights,
  isAiLoading,
  generateAIInsights,
  askQuery,
  setAskQuery,
  handleAskAI,
  isAskLoading,
  askResponse,
}) {
  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6 pb-12">
      <div className="bg-white rounded-2xl shadow-lg border border-[#D8D8D8] overflow-hidden">
        <div
          className={`p-8 bg-gradient-to-br text-white flex flex-col md:flex-row justify-between items-center gap-6 ${"from-[#4C4A4B] to-[#9B8B70]"}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md hidden sm:block">
              <AISparklesIcon size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">✨ Intelligent Audit</h2>
              <p className="text-white/80 text-sm max-w-md">
                Benchmarking Project NPV, MOIC, Yields, and Margin efficiency.
              </p>
            </div>
          </div>
          <button
            onClick={generateAIInsights}
            disabled={isAiLoading}
            className="bg-white px-6 py-3 rounded-xl font-bold text-[#1E2F31] shadow-xl hover:bg-opacity-90 transition-all"
          >
            {isAiLoading ? (
              <RefreshCcw size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}{" "}
            Run Yield Audit
          </button>
        </div>
        <div className="p-8 bg-white min-h-[300px]">
          {aiInsights && (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-[#D8D8D8] border-l-4 border-l-[#1C6048]">
              <MarkdownRenderer content={aiInsights} />
            </div>
          )}
          {!aiInsights && !isAiLoading && (
            <p className="text-center text-gray-500">
              Run the audit to see AI-generated financial insights.
            </p>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-[#D8D8D8] p-8 mt-6">
        <h3 className="text-lg font-bold text-[#1E2F31] mb-2 flex items-center gap-2">
          <AISparklesIcon size={20} className="text-[#1C6048]" /> Ask AI
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <input
            type="text"
            value={askQuery}
            onChange={(e) => setAskQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
            placeholder="Ask anything about the numbers..."
            className="flex-1 p-4 bg-white border border-[#D8D8D8] rounded-xl outline-none"
          />
          <button
            onClick={handleAskAI}
            disabled={isAskLoading || !askQuery.trim()}
            className="bg-[#1E2F31] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-md"
          >
            {isAskLoading ? "Thinking..." : "Ask"}
          </button>
        </div>
        {askResponse && (
          <div className="mt-8 p-6 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
            <MarkdownRenderer content={askResponse} />
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MASTER TIMELINE VIEW (GANTT CHART)
// ==========================================