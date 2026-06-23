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
export const ProjectOverviewView = memo(({ info, setInfo, isLocked }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [planView, setPlanView] = useState("master");

  const zoningPolygons = [
    { idx: 1, points: "36,58 52,61 47,79 28,71" }, // Commercial Hillside
    { idx: 2, points: "26,24 47,37 36,58 19,43" }, // Hillside Villa
    { idx: 3, points: "47,37 63,28 69,43 53,49" }, // Hospitality A
    { idx: 4, points: "58,58 73,55 81,80 56,88 47,79" }, // Hospitality B
    { idx: 0, points: "53,49 69,43 73,55 58,58" }, // Glamping
    { idx: 5, points: "21,15 62,28 47,37 26,24" }, // Adventure
    { idx: 6, points: "47,79 56,88 45,92 28,71" }, // City Dev
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-500 pb-12">
      {/* Main General Info Bento */}
      <BentoBox colSpan="md:col-span-12">
        <div className="flex items-center gap-4 mb-6">
          <BentoIcon
            icon={<Building size={28} />}
            color="blue"
            className="mb-0"
          />
          <div>
            <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight">
              Project Overview
            </h2>
            <p className="text-xs text-[#4C4A4B] font-medium mt-1">
              Integrated Resort & Hospitality Development
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
          <ProjectInfoFieldComp
            label="Project Name"
            value={info.name}
            onChange={(v) => setInfo({ ...info, name: v })}
            isLocked={isLocked}
            icon={<FileText size={14} />}
          />
          <ProjectInfoFieldComp
            label="Location"
            value={info.location}
            onChange={(v) => setInfo({ ...info, location: v })}
            isLocked={isLocked}
            icon={<MapPin size={14} />}
          />
          <ProjectInfoFieldComp
            label="Resort Class"
            value={info.type}
            onChange={(v) => setInfo({ ...info, type: v })}
            isLocked={isLocked}
            icon={<Palmtree size={14} />}
          />
          <ProjectInfoFieldComp
            label="Development Status"
            value={info.status}
            onChange={(v) => setInfo({ ...info, status: v })}
            isLocked={isLocked}
            icon={<Clock size={14} />}
          />
        </div>
      </BentoBox>

      {/* Master Plan Visuals Bento (Left side, large map) */}
      <BentoBox
        colSpan="md:col-span-12 lg:col-span-8"
        className="p-0 overflow-hidden border-[#D8D8D8] min-h-[450px] lg:min-h-[100%] relative rounded-[28px] shadow-sm group select-none"
      >
        {/* Toggle Controls for Map view modes */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-[#D8D8D8] p-1 rounded-2xl flex gap-1 shadow-md">
          <button
            onClick={() => setPlanView("master")}
            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
              planView === "master"
                ? "bg-[#1E2F31] text-white shadow-sm"
                : "text-[#4C4A4B] hover:bg-[#F9F8F6]"
            }`}
          >
            Realistic Concept
          </button>
          <button
            onClick={() => setPlanView("zoning")}
            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
              planView === "zoning"
                ? "bg-[#1E2F31] text-white shadow-sm"
                : "text-[#4C4A4B] hover:bg-[#F9F8F6]"
            }`}
          >
            Land Zoning Map
          </button>
        </div>

        {/* Dynamic Image Overlay */}
        <img
          src={planView === "zoning" ? "/Zoning.jpg" : "/Site.jpg"}
          alt="Site Plan"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
          onError={(e) => {
            // fallback gracefully to base plan if custom file isn't found
            if (e.target.src !== window.location.origin + "/Site.jpg") {
              e.target.src = "/Site.jpg";
            }
          }}
          referrerPolicy="no-referrer"
        />

        {/* Interactive SVG Polygons Layer */}
        <svg
          className="absolute inset-0 w-full h-full z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {zoningPolygons.map((polygon) => {
            const item = (getZoningItem(polygon.idx) as any);
            if (!item) return null;
            const isHovered = hoveredIdx === polygon.idx;
            // set opacity: when in zoning view, show soft colors. When in master/realistic view, show only on hover
            const fillOpacity = isHovered
              ? 0.55
              : planView === "zoning"
                ? 0.28
                : 0;

            const strokeColor = isHovered
              ? "#1E2F31"
              : planView === "zoning"
                ? (item as any).color
                : "none";

            return (
              <polygon
                key={polygon.idx}
                points={polygon.points}
                fill={(item as any).color}
                fillOpacity={fillOpacity}
                stroke={strokeColor}
                strokeWidth={isHovered ? 1.5 : planView === "zoning" ? 0.3 : 0}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: isHovered
                    ? "drop-shadow(0 4px 8px rgba(30, 47, 49, 0.25))"
                    : "none",
                }}
                onMouseEnter={() => setHoveredIdx(polygon.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Active Hover Floating HUD Card */}
        {hoveredIdx !== null && getZoningItem(hoveredIdx) && (
          <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-[#D8D8D8] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[9px] font-bold text-[#9B8B70] uppercase tracking-widest">
              Selected Zone
            </span>
            <span className="text-xs font-black text-[#1E2F31] mt-0.5">
              {(getZoningItem(hoveredIdx) as any)?.proportion}
            </span>
            <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-[#EFEBE7]">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-[#4C4A4B] uppercase tracking-wider">
                  Area
                </span>
                <span className="text-xs font-black text-[#1E2F31] font-mono">
                  {new Intl.NumberFormat("en-US").format(
                    (getZoningItem(hoveredIdx) as any)?.area || 0,
                  )}{" "}
                  Sqm
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-[#4C4A4B] uppercase tracking-wider">
                  Ratio
                </span>
                <span className="text-xs font-black text-[#1C6048]">
                  {(getZoningItem(hoveredIdx) as any)?.ratio}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#1E2F31]/60 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-[#D8D8D8] flex items-center gap-3 z-20">
          <Map size={20} className="text-[#1C6048]" />
          <div>
            <span className="block text-xs font-black text-[#1E2F31] uppercase tracking-widest">
              Master Site Plan
            </span>
            <span className="block text-[9px] font-bold text-[#4C4A4B]">
              Raya Daan Mogot (ROW ±30m)
            </span>
          </div>
        </div>
      </BentoBox>

      {/* Site Specs Bento (Right side, stacked render + cards) */}
      <BentoBox
        colSpan="md:col-span-12 lg:col-span-4"
        className="!bg-[#EFEBE7] border-transparent p-0 overflow-hidden flex flex-col"
      >
        {/* ⚠️ SWAP THIS URL WITH YOUR 3D RENDER IMAGE */}
        <div className="w-full h-48 lg:h-56 relative shrink-0 bg-gray-200">
          <img
            src="/Render.jpg"
            alt="3D Render"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-black uppercase text-[#1E2F31] shadow-sm tracking-widest">
            Proposed Concept
          </div>
        </div>

        <div className="p-6 lg:p-8 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Map size={24} className="text-[#9B8B70]" />
            <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
              Site Specifications
            </h2>
          </div>

          <div className="space-y-3 flex-1">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="p-4 bg-white rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col justify-center text-center hover:-translate-y-1 transition-transform">
                <span className="text-[9px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-1">
                  Total Land
                </span>
                <span className="text-lg font-black text-[#1E2F31] leading-none">
                  {String(info.totalLand)}
                </span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col justify-center text-center hover:-translate-y-1 transition-transform">
                <span className="text-[9px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-1">
                  Building GFA
                </span>
                <span className="text-lg font-black text-[#1E2F31] leading-none">
                  {String(info.totalBuilding)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8D8D8] shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
                <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                  Zoning
                </span>
                <span className="text-xs font-black text-[#1E2F31]">
                  {info.zoning}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
                <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                  Land Title
                </span>
                <span className="text-xs font-black text-[#1E2F31]">
                  {info.landTitle}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
                <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                  BCR / KDB
                </span>
                <span className="text-xs font-black text-[#1E2F31]">
                  {info.bcr}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
                <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                  FAR / KLB
                </span>
                <span className="text-xs font-black text-[#1E2F31]">
                  {info.far}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                  Green Area
                </span>
                <span className="text-xs font-black text-[#1C6048]">
                  {info.greenArea}
                </span>
              </div>
            </div>
          </div>
        </div>
      </BentoBox>

      {/* Land Zoning Breakdown */}
      <BentoBox colSpan="md:col-span-12" className="mt-2">
        <div className="flex flex-col md:flex-row gap-8 items-center col-span-12">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <PieChartIcon size={24} className="text-[#1C6048]" />
                <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                  Land Zoning & Infrastructure Distribution
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-[#1C6048]/10 text-[#1C6048] rounded-xl self-start">
                Pro-Rata Allocation Active
              </span>
            </div>

            <div className="overflow-x-auto border border-[#EFEBE7] rounded-xl shadow-sm">
              <table className="w-full text-left text-xs bg-white text-[#4C4A4B] min-w-[650px]">
                <thead className="bg-[#1E2F31] text-white font-black uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3.5 border-b border-[#D8D8D8]">
                      Zoning Cluster Component
                    </th>
                    <th className="px-4 py-3.5 border-b border-[#D8D8D8] text-right">
                      Gross Cluster Area (Sqm)
                    </th>
                    <th className="px-4 py-3.5 border-b border-[#D8D8D8] text-right text-[#99B6AA]">
                      Sharing Infra Pro-Rata (Sqm)
                    </th>
                    <th className="px-4 py-3.5 border-b border-[#D8D8D8] text-right">
                      Gross Land Area (Sqm)
                    </th>
                    <th className="px-4 py-3.5 border-b border-[#D8D8D8] text-right">
                      Gross Ratio (%)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE7] font-medium">
                  {LAND_ZONING.map((item, idx) => {
                    const isHovered = hoveredIdx === idx;
                    const isSharing = "isSharingInfra" in item ? (item as any).isSharingInfra : false;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors duration-150 cursor-pointer ${
                          isHovered
                            ? "bg-[#1C6048]/10 text-[#1C6048] font-bold"
                            : isSharing
                              ? "bg-[#A95C3E]/5 italic text-[#A95C3E]"
                              : "hover:bg-[#F9F8F6]"
                        }`}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      >
                        <td className="px-4 py-3.5 flex items-center gap-2 font-semibold text-[#1E2F31]">
                          <span
                            className="w-3 h-3 rounded-full inline-block shrink-0 border border-[#D8D8D8] transition-transform duration-150"
                            style={{
                              backgroundColor: (item as any).color,
                              transform: isHovered ? "scale(1.25)" : "scale(1)",
                            }}
                          ></span>
                          <span>{(item as any).proportion}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#4C4A4B]">
                          {isSharing
                            ? "-"
                            : new Intl.NumberFormat("en-US").format(
                                (item as any).clusterArea,
                              )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#9B8B70] font-semibold">
                          {isSharing
                            ? new Intl.NumberFormat("en-US").format(
                                (item as any).sharingArea,
                              )
                            : `+${new Intl.NumberFormat("en-US").format((item as any).sharingArea)}`}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#1E2F31] font-bold">
                          {new Intl.NumberFormat("en-US").format((item as any).area)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-[#1C6048] font-mono">
                          {(item as any).ratio}%
                        </td>
                      </tr>
                    );
                  })}

                  {/* Calculated Math Proof Totals */}
                  <tr className="bg-[#F9F8F6] font-bold text-[#1E2F31] border-t border-[#D8D8D8]">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-[#4C4A4B] rounded-sm"></span>
                      Total Gross Cluster Area
                    </td>
                    <td className="px-4 py-3 text-right font-mono">400,048</td>
                    <td className="px-4 py-3 text-right font-mono text-[#9B8B70]">
                      -
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#1E2F31]">
                      400,048
                    </td>
                    <td className="px-4 py-3 text-right text-[#1C6048] font-mono">
                      95.3%
                    </td>
                  </tr>
                  <tr className="bg-[#A95C3E]/5 font-bold text-[#A95C3E]">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-[#A95C3E] rounded-sm animate-pulse"></span>
                      Sharing Infrastructure Area
                    </td>
                    <td className="px-4 py-3 text-right font-mono">-</td>
                    <td className="px-4 py-3 text-right font-mono">19,463</td>
                    <td className="px-4 py-3 text-right font-mono">19,463</td>
                    <td className="px-4 py-3 text-right text-[#A95C3E] font-mono">
                      4.7%
                    </td>
                  </tr>
                  <tr className="bg-[#1E2F31] font-black text-white border-t-2 border-[#1E2F31]">
                    <td className="px-4 py-3.5 text-xs uppercase tracking-wider">
                      Gross Land Area (Total)
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      400,048
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[#99B6AA]">
                      +19,463
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm tracking-tight text-[#99B6AA]">
                      419,511
                    </td>
                    <td className="px-4 py-3.5 text-right text-[#99B6AA] font-mono">
                      100.0%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-full md:w-80 flex flex-col items-center shrink-0 space-y-4">
            <div className="w-full h-60 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={LAND_ZONING}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="area"
                    stroke="none"
                    onMouseEnter={(_, index) => setHoveredIdx(index)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {LAND_ZONING.map((entry, index) => {
                      const isHovered = hoveredIdx === index;
                      const opacity =
                        hoveredIdx !== null && !isHovered ? 0.4 : 1;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={opacity}
                          stroke={isHovered ? "#1E2F31" : "none"}
                          strokeWidth={isHovered ? 2 : 0}
                          style={{
                            transition:
                              "opacity 0.2s ease, stroke-width 0.2s ease",
                            cursor: "pointer",
                          }}
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
                <span className="text-[9px] uppercase font-bold text-[#4C4A4B] tracking-widest leading-tight mb-1 max-w-[130px] truncate-2-lines">
                  {hoveredIdx !== null
                    ? (getZoningItem(hoveredIdx) as any)?.proportion
                    : "Total Land"}
                </span>
                <span className="text-lg font-black text-[#1E2F31] leading-none">
                  {hoveredIdx !== null
                    ? `${(getZoningItem(hoveredIdx) as any)?.ratio}%`
                    : "419,511"}
                </span>
                {hoveredIdx === null && (
                  <span className="text-[9px] font-bold text-[#4C4A4B] uppercase tracking-widest mt-0.5">
                    Sqm
                  </span>
                )}
              </div>
            </div>

            {/* Bottom HUD Box detailing the current selected chunk without any tooltips overlapping the canvas! */}
            <div className="w-full bg-[#F9F8F6] border border-[#EFEBE7] rounded-2xl p-4 transition-all duration-300">
              {hoveredIdx !== null ? (
                (() => {
                  const hoveredItem = getZoningItem(hoveredIdx);
                  if (!hoveredItem) return null;
                  return (
                    <div className="flex flex-col text-xs space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-black tracking-wider text-[#1E2F31] flex items-center gap-1.5 truncate max-w-[190px]">
                          <span
                            className="w-2 h-2 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: (hoveredItem as any).color }}
                          />
                          {(hoveredItem as any).proportion}
                        </span>
                        <span className="font-mono font-black text-[#1C6048] bg-[#1C6048]/10 px-2 py-0.5 rounded-lg text-[10px]">
                          {(hoveredItem as any).ratio}%
                        </span>
                      </div>
                      <div className="h-px bg-[#EFEBE7] my-1" />
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-[#9B8B70] uppercase">
                            Cluster
                          </span>
                          <span className="font-mono font-bold text-[#1E2F31] mt-0.5">
                            {(hoveredItem as any).clusterArea > 0
                              ? new Intl.NumberFormat("en-US").format(
                                  (hoveredItem as any).clusterArea,
                                )
                              : "-"}
                          </span>
                        </div>
                        <div className="flex flex-col border-x border-[#EFEBE7]">
                          <span className="text-[8px] font-bold text-[#9B8B70] uppercase">
                            Infra Share
                          </span>
                          <span className="font-mono font-bold text-[#9B8B70] mt-0.5">
                            +
                            {new Intl.NumberFormat("en-US").format(
                              (hoveredItem as any).sharingArea,
                            )}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-[#9B8B70] uppercase">
                            Gross Area
                          </span>
                          <span className="font-mono font-bold text-[#1E2F31] mt-0.5">
                            {new Intl.NumberFormat("en-US").format(
                              (hoveredItem as any).area,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#1E2F31] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block shrink-0 bg-[#1E2F31]" />
                      Gross Land Area
                    </span>
                    <span className="font-mono font-black text-[#1E2F31] bg-[#1E2F31]/10 px-2 py-0.5 rounded-lg text-[10px]">
                      100.0%
                    </span>
                  </div>
                  <div className="h-px bg-[#EFEBE7] my-1" />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-[#4C4A4B] uppercase">
                        Total Cluster
                      </span>
                      <span className="font-mono font-bold text-[#1E2F31] mt-0.5">
                        400,048
                      </span>
                    </div>
                    <div className="flex flex-col border-x border-[#EFEBE7]">
                      <span className="text-[8px] font-bold text-[#4C4A4B] uppercase">
                        Total Infra
                      </span>
                      <span className="font-mono font-bold text-[#A95C3E] mt-0.5">
                        19,463
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-[#4C4A4B] uppercase">
                        Total Land
                      </span>
                      <span className="font-mono font-bold text-[#1E2F31] mt-0.5">
                        419,511
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </BentoBox>
    </div>
  );
});
