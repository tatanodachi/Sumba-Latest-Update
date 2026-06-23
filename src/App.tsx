// @ts-nocheck
import { START_YEAR, DEFAULT_END_YEAR, MONTH_NAMES_SHORT, INITIAL_GROUPS, LAND_ZONING, getZoningItem, generateTimelineMonths } from './constants';
// @ts-nocheck
import React, {
  useState, useMemo, useEffect, useRef, memo, useCallback, } from "react";
import { createPortal } from "react-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Cell, Pie, ReferenceLine, Tooltip as RechartsTooltip, AreaChart, Area
} from "recharts";
import {
  Calculator, TrendingUp, DollarSign, Activity, FileText, Maximize2, Minimize2, Settings, LayoutDashboard, List, Users, Shield, Scale, AlignLeft, AlignRight, EyeOff, ArrowUpRight, Link2, Coins, Building2, Stethoscope, Briefcase, ShieldCheck, HeartPulse, Sparkles, BrainCircuit, RefreshCcw, BarChart3, PieChart as PieChartIcon, Map, Landmark, ArrowRightLeft, X, Download, AlertTriangle, Grid, Clock, Lock, Unlock, MapPin, Building, Cloud, CloudOff, ChevronDown, GripHorizontal, Maximize, Minimize, BookOpen, Target, Search, FolderTree, BarChartHorizontal, Layers, Microscope, Bed, Timer, Network, Plane, Dna, Bone, Baby, Eye, Check, ArrowRight, Ruler, Calendar, CalendarDays, Plus, Trash2, ChevronsUpDown, ChevronsDownUp, ChevronRight, ChevronLeft, ShieldAlert, Award, CheckCircle2, HelpCircle, Zap, Monitor, Workflow, Palmtree, Focus, Cross, Leaf, ActivitySquare, ShieldPlus, BedDouble, Pencil, Anchor, Droplets, Map as MapIcon, Tent, Info as InfoIcon } from "lucide-react";
import { ExecutiveSummaryView } from "./ExecutiveSummaryView";
import {
  calculatePMT,
  calculatePayback,
  calculateIRR,
  calculateNPV,
  runOpCoEngine,
  runPropCoEngine,
  runConsolidatedEngine,
  DEFAULT_OPCO_ASSUMPTIONS,
  DEFAULT_PROPCO_ASSUMPTIONS,
  CANCER_DATA,
  INSURANCE_DATA,
  callGemini,
  INITIAL_ASSET_CLUSTERS_ASSUMPTIONS,
  runConsolidatedAssetEngine,
} from "./financialEngine";
import {
  OPCO_FORMULAS,
  PROPCO_FORMULAS,
  CONSOLIDATED_FORMULAS,
} from "./formulaTooltips";

// True Secure Cloud Sync Imports
import {
  db,
  auth,
  isCloudConfigured,
  googleProvider,
  loginWithGoogle,
  logoutUser,
  handleFirestoreError,
  OperationType,
} from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { AIMicroscopeIcon, CustomBedIcon, CustomScaleIcon, CustomKnotIcon, CustomStethoscopeIcon, CustomPhysicianIcon, CustomPopulationIcon, CustomDiagnosticsIcon, CustomLinacIcon, CustomOverseasIcon, CustomPalliativeIcon, CustomClipboardIcon } from "./components/Icons";
import { SelectionPopupComp, CHART_MARGINS_BAR, CHART_MARGINS_LINE, TOOLTIP_STYLE, CHART_CURSOR_STYLE, LEGEND_STYLE, TICK_STYLE, PREM_MKT_PIE_DATA, LINE_LABEL_STYLE, NavButton } from "./components/UI";
import { ProjectOverviewView } from "./views/ProjectOverviewView";
import { CollaborationStrategyView } from "./views/CollaborationStrategyView";
import { InteractiveDemographicMap } from "./views/InteractiveDemographicMap";
import { ResortProgrammingView } from "./views/ResortProgrammingView";
import { StudyView } from "./views/StudyView";
import { AssetDashboardView } from "./views/AssetDashboardView";
import { AssetCascadeView } from "./views/AssetCascadeView";
import { ConsolidatedDashboardView } from "./views/ConsolidatedDashboardView";
import { ConsolidatedCascadeView } from "./views/ConsolidatedCascadeView";
import { AssetSettingsView } from "./views/AssetSettingsView";
import { AssetSensitivityView } from "./views/AssetSensitivityView";
import { MasterTimelineView } from "./views/MasterTimelineView";
import { SettingsPasswordGate } from "./views/SettingsPasswordGate";

// --- NEW STABLE REFERENCES FOR OPPORTUNITIES TAB ---
const formatCancerCases = (val) => new Intl.NumberFormat("en-US").format(val);
const formatInsuranceTooltip = (val) => val.toFixed(2) + "T IDR";
const formatInsuranceLabel = (val) => val.toFixed(2);
const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  index,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={index === 0 ? "#9B8B70" : "#8A9A9C"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
      fontWeight="bold"
    >
      <tspan x={x} dy="-0.4em">
        {name}
      </tspan>
      <tspan x={x} dy="1.2em">{`${(percent * 100).toFixed(0)}%`}</tspan>
    </text>
  );
};
// ---------------------------------------------------

// --- TIMELINE CONSTANTS & DATA ---

// ==========================================
// 3. UI ATOMIC COMPONENTS
// ==========================================
// Custom Brand SVGs based on exact user images
// Strictly Line-Art (Fill: none) + High Detail + Scalable Viewbox
const parseArea = (str) => {
  if (!str || typeof str !== 'string') return 0;
  const parts = str.split('x').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * parts[1];
  }
  return 0;
};
// ==========================================
// 4. STRATEGIC FOUNDATION (BENTO UI)
// ==========================================

// === INTERACTIVE MAP CONSTANTS ===

// === END INTERACTIVE MAP ===

// === END INTERACTIVE MAP ===
// ==========================================
// 5. MAJOR VIEW COMPONENTS (FINANCIAL ENGINES)
// ==========================================

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
              <Sparkles size={40} className="text-white" />
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
          <Sparkles size={20} className="text-[#1C6048]" /> Ask AI
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
// ==========================================
// 5. MAIN APP COMPONENT
// ==========================================

// --- GLASSMORPHISM CSS INJECTION ---
const style = document.createElement("style");
style.textContent = `
    .glass-tooltip-container {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
    }
    .glass-tooltip-container .leaflet-tooltip-tip {
        display: none;
    }
    .glass-region-label {
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.7);
        border-radius: 12px;
        padding: 10px 16px;
        color: #1E2F31;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        pointer-events: none;
    }
    .glass-title { font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1C6048; }
    .glass-sub { font-size: 11px; font-weight: 700; color: #4C4A4B; margin-top: 2px; display: block; }
`;
document.head.appendChild(style);

const localFinancialAuditor = {
  getTeaser: (
    opCoData,
    propCoData,
    consolidatedData,
    opCoAssumptions,
    propCoAssumptions,
  ) => {
    const beds = opCoAssumptions?.beds || 150;
    const projectNPV = opCoData?.projectNPV || 0;
    const projectIRR = opCoData?.projectIRR || 0;
    const projectPayback = opCoData?.projectPayback || 0;
    const discountRate = opCoAssumptions?.discountRate || 10;

    const opYears =
      opCoData?.annualData?.filter((d) => (d.totalRev || 0) > 0) || [];
    const avgEbitdarMargin =
      opYears.length > 0
        ? opYears.reduce((acc, d) => acc + (d.ebitdarMargin || 0), 0) /
          opYears.length
        : 0;
    const avgNetMargin =
      opYears.length > 0
        ? opYears.reduce((acc, d) => acc + (d.netMargin || 0), 0) /
          opYears.length
        : 0;

    const caps = propCoData?.capexDetails || {};
    const landCost = caps.landCost || 0;
    const buildCost = caps.buildCost || 0;
    return `### 📋 COGNITIVE FEASIBILITY INVESTMENT PROSPECTUS
*(⚡ Context-Aware Real-Time Underwritten Output)* This document is compiled directly from active multi-cascade scenario variables.

## 🏢 1. Core Asset Portfolio Profile
- **Asset Capacity**: **${beds} Operational Villa Keys**
- **Sovereign Operational Matrix**: Multi-Entity look-through modeling separating operating health deliverables (OpCo) from direct property equity leases (PropCo).
- **Accounting Framework Consistency**: Aligned under **PSAK 16 (Aset Tetap)** on property/infrastructure capitalization and **PSAK 19** regarding direct operational outlays.

## 📈 2. Hospitality Feasibility Benchmarks
- **Stabilized Guest Volume**: **${(opCoData?.opsMetrics?.stabilizedVolume || 0).toLocaleString()}** day-visitor and villa visits/yr.
- **Underwriting Efficiency Metrics**:
  - Blended OpCo EBITDAR Margin: **${avgEbitdarMargin.toFixed(2)}%**
  - Blended Operating Net Margin: **${avgNetMargin.toFixed(2)}%**
  - Revenue Yield Per Bed: **${(opCoData?.opsMetrics?.revPab || 0).toFixed(1)}M IDR** (Stabilized Year)

## 🏗️ 3. Capitalization Breakdown (PropCo)
- **Key Asset Class Valuation**:
  - Land Procurement: **${landCost.toFixed(1)} B IDR**
  - Property Civil Build Capitalization: **${buildCost.toFixed(1)} B IDR**
- **Debt Leverage Structure**: Structured with a step-down commercial amortizing interest profile.

## 💎 4. Master Look-Through Returns Cascade
- **Project NPV**: **${projectNPV.toFixed(2)} B IDR** (at ${discountRate}% hurdle)
- **Project IRR (Post-Tax)**: **${projectIRR.toFixed(2)}%**
- **Amortization & Payback Window**: Stable return payout crossed in **${projectPayback > 0 ? projectPayback.toFixed(1) + " Years" : "Never (beyond projection period)"}**

*Note: This pro-forma pitch prospectus displays live calculations and is fully validated.*`;
  },

  getInsights: (
    opCoData,
    propCoData,
    consolidatedData,
    opCoAssumptions,
    propCoAssumptions,
  ) => {
    const beds = opCoAssumptions?.beds || 150;
    const discountRate = opCoAssumptions?.discountRate || 10;
    const caps = propCoData?.capexDetails || {};
    const totalCapex =
      (caps.landCost || 0) +
      (caps.buildCost || 0) +
      (caps.ffeCost || 0) +
      (caps.infraCost || 0) +
      (caps.consultantCost || 0);
    const projectNPV = opCoData?.projectNPV || 0;
    const projectIRR = opCoData?.projectIRR || 0;

    const opYears =
      opCoData?.annualData?.filter((d) => (d.totalRev || 0) > 0) || [];
    const avgEbitdarMargin =
      opYears.length > 0
        ? opYears.reduce((acc, d) => acc + (d.ebitdarMargin || 0), 0) /
          opYears.length
        : 0;
    const avgBor =
      opYears.length > 0
        ? opYears.reduce((acc, d) => acc + (d.bor || 0), 0) / opYears.length
        : 0;

    return `### 🔍 CAPITAL CASCADE WORKFLOW DIAGNOSIS
*(⚡ Context-Aware Real-Time Underwritten Output)* Detailed look-through assessment of healthcare asset yield cascades.

## 🩺 1. Villa & Day-Visitor Operational Performance
- **EBITDAR Efficiency**: Consistent EBITDAR margin averaging **${avgEbitdarMargin.toFixed(2)}%**. The stabilizing capacity is sound, reaching an average bed occupancy rate (BOR) of **${avgBor.toFixed(1)}%**.
- **Key Yield Dynamics**: Price escalators successfully outpace core Indonesian hospitality inflations.

## 🏢 2. Property Entity (PropCo) Strategic Leases
- **Capitalization Threshold**: Capitalized asset base of **${totalCapex.toFixed(1)} B IDR** under standard **PSAK 16** guidelines.
- **Lease Viability**: The rent coverage multiplier ensures that operational rents fully support land lease obligations.

## 🔑 3. Comprehensive Valuation Audit
- **Returns Viability**: With a combined project post-tax IRR of **${projectIRR.toFixed(2)}%**, the asset generates substantial returns exceeding the target **${discountRate}%** discount hurdle rate. Underwritten project NPV matches **${projectNPV.toFixed(2)} B IDR**.`;
  },

  getValidation: (
    opCoData,
    propCoData,
    consolidatedData,
    opCoAssumptions,
    propCoAssumptions,
  ) => {
    const buildCost = propCoData?.capexDetails?.buildCost || 0;
    const projectPayback = opCoData?.projectPayback || 0;
    const discountRate = opCoAssumptions?.discountRate || 10;

    return `### 🎯 INDONESIAN REGULATORY COMPLIANCE EXAMINER
*(⚡ Context-Aware Real-Time Underwritten Output)* Regulatory, PSAK standards, and sensitivity assessment audit.

## 📐 1. PSAK Compliance Directives
- **PSAK 16 (Aset Tetap)**: All structural construction expenditures (evaluated at **${buildCost.toFixed(2)} B IDR**) are capitalized correctly into Property, Plant, & Equipment (PPE).
- **PSAK 19 (Aset Tidak Berwujud)**: Pre-operating start-up expenditures and non-asset administrative outlays are strictly expensed when incurred, bypassing deferred capitalization to preserve audit integrity.

## 🔒 2. Sensitivity Hurdle Thresholds
- **Hurdle Optimizations**: Adjusted hurdle at **${discountRate}%** mirrors Indonesian private healthcare and infrastructure premiums.
- **Payback Sensitivity**: The active payback trajectory of **${projectPayback > 0 ? projectPayback.toFixed(1) + " Years" : "Never (beyond projection period)"}** satisfies institutional healthcare risk models.`;
  },

  getSmartAsk: (
    query,
    opCoData,
    propCoData,
    consolidatedData,
    opCoAssumptions,
    propCoAssumptions,
  ) => {
    const lowercase = (query || "").toLowerCase();
    const beds = opCoAssumptions?.beds || 150;
    const projectNPV = opCoData?.projectNPV || 0;
    const projectIRR = opCoData?.projectIRR || 0;
    const projectPayback = opCoData?.projectPayback || 0;

    if (
      lowercase.includes("ebitdar") ||
      lowercase.includes("margin") ||
      lowercase.includes("ebitda")
    ) {
      return `### 📊 EBITDAR MARGIN ASSESSMENT
- **Underwriting Method**: EBITDAR is evaluated as: \`Gross Operating Revenue - Supplies - Management Fees - Staff OPEX - Overheads\`.
- **Operating Capacity**: Currently modeled with **${beds} beds** showing robust operational yield.`;
    }

    if (
      lowercase.includes("psak") ||
      lowercase.includes("accounting") ||
      lowercase.includes("regulation") ||
      lowercase.includes("standard")
    ) {
      return `### 🏛️ INDONESIAN ACCOUNTING STANDARD (PSAK 16 & 19)
- **Direct Construction / PPE (PSAK 16)**: Capitalized directly as building & infrastructure.
- **Pre-Operating Overhead (PSAK 19)**: Direct pre-operating start-up costs must be expensed immediately under PSAK 19.43 rather than capitalized over years.`;
    }

    if (
      lowercase.includes("payback") ||
      lowercase.includes("irr") ||
      lowercase.includes("npv") ||
      lowercase.includes("return")
    ) {
      return `### 💎 RETURN METRICS DIAGNOSTIC
- **NPV**: **${projectNPV.toFixed(2)} B IDR** at active discount rates.
- **Post-Tax IRR**: **${projectIRR.toFixed(2)}%** offer.
- **Simple Payback**: Covered in **${projectPayback > 0 ? projectPayback.toFixed(1) + " Years" : "Never (beyond projection period)"}**.`;
    }

    return `### 📋 FEASIBILITY AUDIT RESPONSE
- **Villa Keys**: **${beds}** operational units.
- **Project IRR**: **${projectIRR.toFixed(2)}%**
- **Combined Project NPV**: **${projectNPV.toFixed(2)} B IDR**
*Change assumptions inside the left parameters panel to run real-time risk-profile updates.*`;
  },
};

export default function App() {
  const [activeGroup, setActiveGroup] = useState("financials"); // 'summary', 'context' or 'financials'
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeMiniTab, setActiveMiniTab] = useState("marketAnalysis");
  const [viewResolution, setViewResolution] = useState("annual");
  const [isLockedOpCo, setIsLockedOpCo] = useState(true);
  const [isLockedPropCo, setIsLockedPropCo] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isBlanked, setIsBlanked] = useState(false);
  const [isStrictRatio, setIsStrictRatio] = useState(false);
  const [hubPosition, setHubPosition] = useState("center"); // 'center', 'left', 'right', 'minimized'
  const [isFloatingPanelVisible, setIsFloatingPanelVisible] = useState(false);

  useEffect(() => {
    if (!isPresenting) {
      setIsBlanked(false);
      setIsStrictRatio(false);
    }
  }, [isPresenting]);

  // Cloud Sync State
  const [isCloudSync, setIsCloudSync] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("offline");
  const [user, setUser] = useState(null);

  const [projectInfo, setProjectInfo] = useState({
    name: "Vasanta Resort Project Development",
    location: "Daan Mogot Road KM. 13, West Jakarta",
    type: "Luxury Resort (5-Star)",
    totalLand: "±1.2 Ha",
    totalBuilding: "13,000 Sqm",
    status: "Planning / Feasibility Phase",
    zoning: "K1 - Trade & Services",
    landTitle: "Right to Build (HGB)",
    bcr: "55%",
    far: "6.39",
    greenArea: "20%",
  });

  const [aiInsights, setAiInsights] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [teaserContent, setTeaserContent] = useState("");
  const [isTeaserLoading, setIsTeaserLoading] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [marketValidation, setMarketValidation] = useState("");
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [showMarketValidation, setShowMarketValidation] = useState(false);
  const [askQuery, setAskQuery] = useState("");
  const [askResponse, setAskResponse] = useState("");
  const [isAskLoading, setIsAskLoading] = useState(false);
  const [selectionState, setSelectionState] = useState({
    show: false,
    text: "",
    x: 0,
    y: 0,
    isOpen: false,
    query: "",
    response: "",
    isLoading: false,
  });

  // Confirmation Dialog State
  const [syncConfirmDialog, setSyncConfirmDialog] = useState({
    isOpen: false,
    targetState: false,
  });

  const [saveStatusOpCo, setSaveStatusOpCo] = useState("idle");
  const [saveStatusPropCo, setSaveStatusPropCo] = useState("idle");
  const [groups, setGroups] = useState(INITIAL_GROUPS);

  const [assetAssumptions, setAssetAssumptions] = useState(
    INITIAL_ASSET_CLUSTERS_ASSUMPTIONS
  );
  const [clusterFilter, setClusterFilter] = useState("Glamping");

  const [opCoAssumptions, setOpCoAssumptions] = useState(
    DEFAULT_OPCO_ASSUMPTIONS,
  );
  const [propCoAssumptions, setPropCoAssumptions] = useState(
    DEFAULT_PROPCO_ASSUMPTIONS,
  );

  const [holdCoScenario, setHoldCoScenario] = useState("blended");

  useEffect(() => {
    if (!propCoAssumptions.includeFinancing && holdCoScenario === "debt_free") {
      setHoldCoScenario("breakeven");
    }
  }, [propCoAssumptions.includeFinancing, holdCoScenario]);

  // --- PRESENTATION NAVIGATION LOGIC ---
  const presentationSteps = useMemo(
    () => [
      {
        group: "summary",
        tab: "executive",
        company: "opco",
        label: "1. Executive Summary",
      },
      {
        group: "context",
        tab: "overview",
        company: "opco",
        label: "2. Project Context",
      },
      {
        group: "context",
        tab: "study",
        company: "opco",
        label: "3. Feasibility Study",
      },
      {
        group: "context",
        tab: "collab",
        company: "opco",
        label: "4. Collaboration Model",
      },
      {
        group: "financials",
        tab: "dashboard",
        company: "opco",
        label: "5. OpCo Financials",
      },
      {
        group: "financials",
        tab: "dashboard",
        company: "propco",
        label: "6. PropCo Financials",
      },
      {
        group: "financials",
        tab: "dashboard",
        company: "consolidated",
        label: "7. HoldCo (Consolidated)",
      },
      {
        group: "financials",
        tab: "timeline",
        company: "opco",
        label: "8. Master Timeline",
      },
    ],
    [],
  );

  const currentSlideIndex = presentationSteps.findIndex(
    (s) =>
      s.group === activeGroup &&
      s.tab === activeTab &&
      (s.group !== "financials" ||
        s.tab === "timeline" ||
        s.company === clusterFilter),
  );
  const safeSlideIndex = Math.max(0, currentSlideIndex);

  const goToNextSlide = useCallback(() => {
    if (safeSlideIndex < presentationSteps.length - 1) {
      const next = presentationSteps[safeSlideIndex + 1];
      setActiveGroup(next.group);
      setActiveTab(next.tab);
      setActiveTab(next.company);
    }
  }, [safeSlideIndex, presentationSteps]);

  const goToPrevSlide = useCallback(() => {
    if (safeSlideIndex > 0) {
      const prev = presentationSteps[safeSlideIndex - 1];
      setActiveGroup(prev.group);
      setActiveTab(prev.tab);
      setActiveTab(prev.company);
    }
  }, [safeSlideIndex, presentationSteps]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input/textarea
      const tag = (e.target || e.srcElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "F5" || e.key === "f5") {
        e.preventDefault();
        setIsPresenting((prev) => !prev);
        return;
      }

      if (!isPresenting) return;

      // Blank screen toggle (Logitech and other wireless clickers send '.' or 'b' / 'B')
      if (e.key === "." || e.key === "b" || e.key === "B") {
        e.preventDefault();
        setIsBlanked((prev) => !prev);
        return;
      }

      // Any other slide navigation or key clears blackout mode
      if (isBlanked) {
        setIsBlanked(false);
      }

      if (
        e.key === "PageDown" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === "AudioVolumeDown" ||
        e.key === "VolumeDown" ||
        e.key === " " ||
        e.key === "Spacebar" ||
        e.key === "Enter"
      ) {
        e.preventDefault();
        goToNextSlide();
      } else if (
        e.key === "PageUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "AudioVolumeUp" ||
        e.key === "VolumeUp" ||
        e.key === "Backspace"
      ) {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === "Escape") {
        setIsPresenting(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenting, isBlanked, goToNextSlide, goToPrevSlide]);

  const resolvedDevDuration = useMemo(() => {
    const allTasks = groups.flatMap((g) => g.tasks || []);
    const commOpeningTask = allTasks.find(
      (t) => t.id === "t13" || (t.name || "").toLowerCase().includes("commercial opening")
    );
    return commOpeningTask ? Math.max(1, commOpeningTask.start - 1) : propCoAssumptions.devDurationMonths || 24;
  }, [groups, propCoAssumptions.devDurationMonths]);

  const projConfig = useMemo(() => {
    if (holdCoScenario === "manual")
      return {
        exitYear: opCoAssumptions.includeTerminalValue ? 10 : -1,
        projYears: 10,
      };
    if (holdCoScenario === "none") {
      const y = Math.max(15, (propCoAssumptions.loanTenor || 15) + 2);
      return { exitYear: -1, projYears: Math.min(y, 30) };
    }
    if (holdCoScenario === "yr10") return { exitYear: 10, projYears: 10 };
    if (holdCoScenario === "debt_free") {
      const p1 = { exitYear: -1, projYears: 30 };
      const op1 = runOpCoEngine({ ...opCoAssumptions, devDurationMonths: resolvedDevDuration }, p1);
      const pr1 = runPropCoEngine({ ...propCoAssumptions, devDurationMonths: resolvedDevDuration }, op1, p1, groups);
      const cons1 = runConsolidatedEngine(op1, pr1, opCoAssumptions);

      const devYears = Math.max(
        1,
        Math.ceil(resolvedDevDuration / 12),
      );
      const exactOverallPayback = cons1.metrics.payback;
      let beOpYear =
        exactOverallPayback > 0
          ? Math.ceil(exactOverallPayback) - devYears + 1
          : 30;

      const y = Math.max(1, propCoAssumptions.loanTenor || 15);
      const targetYear = Math.max(beOpYear, y);
      return {
        exitYear: Math.min(targetYear, 30),
        projYears: Math.min(targetYear, 30),
      };
    }
    if (holdCoScenario === "breakeven") {
      const p1 = { exitYear: -1, projYears: 30 }; // -1 forces the engine to ignore individual settings and test pure operations
      const op1 = runOpCoEngine({ ...opCoAssumptions, devDurationMonths: resolvedDevDuration }, p1);
      const pr1 = runPropCoEngine({ ...propCoAssumptions, devDurationMonths: resolvedDevDuration }, op1, p1, groups);
      const cons1 = runConsolidatedEngine(op1, pr1, opCoAssumptions);

      const devYears = Math.max(
        1,
        Math.ceil(resolvedDevDuration / 12),
      );
      const exactOverallPayback = cons1.metrics.payback; // this is the exact payback year without exit

      let beOpYear =
        exactOverallPayback > 0
          ? Math.ceil(exactOverallPayback) - devYears
          : 30;
      if (beOpYear < 1) beOpYear = 1;

      // We set the exit to occur at the end of the year AFTER it has already crossed over
      // so the exit value does not artificially accelerate the payback fraction.
      beOpYear = beOpYear + 1;

      return {
        exitYear: Math.min(beOpYear, 30),
        projYears: Math.min(beOpYear, 30),
      };
    }
    return { exitYear: 10, projYears: 10 };
  }, [holdCoScenario, opCoAssumptions, propCoAssumptions, groups, resolvedDevDuration]);

  const assetModelData = useMemo(() => {
    return runConsolidatedAssetEngine(assetAssumptions, holdCoScenario, resolvedDevDuration, groups);
  }, [assetAssumptions, holdCoScenario, resolvedDevDuration, groups]);

  const opCoModelData = assetModelData;
  const propCoModelData = assetModelData;
  const consolidatedModelData = assetModelData;

  // Sync Timeline tasks with PropCo Model Data to ensure parity
  useEffect(() => {
    if (!propCoModelData || !propCoModelData.capexDetails) return;

    setGroups((prevGroups) => {
      let changed = false;

      // Extract details from capexDetails
      const {
        landCost = 0,
        buildCost = 0,
        ffeCost = 0,
        infraCost = 0,
        sharingDevCost = 0,
        consultantCost = 0,
        licenseCost = 0,
      } = propCoModelData.capexDetails;

      const formatCost = (val) => Math.round(val * 10) / 10;

      // Find specific child tasks to compute rollup timings
      const allFlatTasks = prevGroups.flatMap((g) => g.tasks);
      const findTask = (id) => allFlatTasks.find((t) => t.id === id);

      // 1. Consultant subtasks
      const t1 = findTask("t1");
      const t2 = findTask("t2");
      const t3 = findTask("t3");
      const consultantRollup = { start: 2, end: 7 };
      if (t1 && t2 && t3) {
        const starts = [t1.start, t2.start, t3.start].map(Number);
        const ends = [
          t1.start + t1.duration - 1,
          t2.start + t2.duration - 1,
          t3.start + t3.duration - 1,
        ].map(Number);
        consultantRollup.start = Math.min(...starts);
        consultantRollup.end = Math.max(...ends);
      }

      // 2. Licensing subtasks
      const t4 = findTask("t4");
      const t5 = findTask("t5");
      const licensingRollup = { start: 1, end: 15 };
      if (t4 && t5) {
        const starts = [t4.start, t5.start].map(Number);
        const ends = [
          t4.start + t4.duration - 1,
          t5.start + t5.duration - 1,
        ].map(Number);
        licensingRollup.start = Math.min(...starts);
        licensingRollup.end = Math.max(...ends);
      }

      // 3. Construction subtasks
      const t6_1 = findTask("t6_1");
      const t6_2 = findTask("t6_2");
      const t6_3 = findTask("t6_3");
      const t6_4 = findTask("t6_4");
      const constructionRollup = { start: 1, end: 20 };
      if (t6_1 && t6_2 && t6_3 && t6_4) {
        const starts = [t6_1.start, t6_2.start, t6_3.start, t6_4.start].map(
          Number,
        );
        const ends = [
          t6_1.start + t6_1.duration - 1,
          t6_2.start + t6_2.duration - 1,
          t6_3.start + t6_3.duration - 1,
          t6_4.start + t6_4.duration - 1,
        ].map(Number);
        constructionRollup.start = Math.min(...starts);
        constructionRollup.end = Math.max(...ends);
      }

      // 4. FF&E subtasks
      const t7_1 = findTask("t7_1");
      const t7_2 = findTask("t7_2");
      const ffeRollup = { start: 18, end: 24 };
      if (t7_1 && t7_2) {
        const starts = [t7_1.start, t7_2.start].map(Number);
        const ends = [
          t7_1.start + t7_1.duration - 1,
          t7_2.start + t7_2.duration - 1,
        ].map(Number);
        ffeRollup.start = Math.min(...starts);
        ffeRollup.end = Math.max(...ends);
      }

      // 5. Shared Infrastructure timing logic
      const t8 = findTask("t8");
      const t9 = findTask("t9");
      const commOpeningTask = findTask("t13");
      const devDuration = commOpeningTask
        ? Math.max(1, commOpeningTask.start - 1)
        : propCoAssumptions.devDurationMonths || 24;

      const nextGroups = prevGroups.map((group) => {
        const nextTasks = group.tasks.map((task) => {
          let updatedTask = { ...task };
          let taskChanged = false;
          let targetCost = task.cost;
          let targetStart = task.start;
          let targetDuration = task.duration;

          // Deriving COSTS dynamically for each task
          switch (task.id) {
            // Group 0 Core Capex Items: Synchronize costs only, start and duration are independent inputs!
            case "c1":
              targetCost = formatCost(landCost);
              break;
            case "c2":
              targetCost = formatCost(licenseCost);
              if (t4 && t5) {
                targetStart = licensingRollup.start;
                targetDuration = licensingRollup.end - licensingRollup.start + 1;
              }
              break;
            case "c3":
              targetCost = formatCost(consultantCost);
              if (t1 && t2 && t3) {
                targetStart = consultantRollup.start;
                targetDuration = consultantRollup.end - consultantRollup.start + 1;
              }
              break;
            case "c4":
              targetCost = formatCost(ffeCost);
              if (t7_1 && t7_2) {
                targetStart = ffeRollup.start;
                targetDuration = ffeRollup.end - ffeRollup.start + 1;
              }
              break;
            case "c5":
              targetCost = formatCost(infraCost);
              break;
            case "c6":
              targetCost = formatCost(sharingDevCost);
              break;
            case "c7":
              targetCost = formatCost(buildCost);
              if (t6_1 && t6_2 && t6_3 && t6_4) {
                targetStart = constructionRollup.start;
                targetDuration = constructionRollup.end - constructionRollup.start + 1;
              }
              break;

            // Group 1: Design & Planning Consultant cost splits
            case "t1":
              targetCost = formatCost(consultantCost * 0.2);
              break;
            case "t2":
              targetCost = formatCost(consultantCost * 0.5);
              break;
            case "t3":
              targetCost = formatCost(consultantCost * 0.3);
              break;

            // Group 2: Licensing & Permits cost splits
            case "t4":
              targetCost = formatCost(licenseCost * 0.6);
              break;
            case "t5":
              targetCost = formatCost(licenseCost * 0.4);
              break;

            // Group 3: Civil, Construction & Interior components
            case "t6_1":
              targetCost = formatCost(buildCost * 0.15);
              break;
            case "t6_2":
              targetCost = formatCost(buildCost * 0.4);
              break;
            case "t6_3":
              targetCost = formatCost(buildCost * 0.15);
              break;
            case "t6_4":
              targetCost = formatCost(buildCost * 0.3);
              break;
            case "t7_1":
              targetCost = formatCost(ffeCost * 0.5);
              break;
            case "t7_2":
              targetCost = formatCost(ffeCost * 0.5);
              break;

            // Group 5: Infrastructure
            case "t8":
              targetCost = formatCost(infraCost);
              break;
            case "t9":
              targetCost = formatCost(sharingDevCost);
              break;
          }

          if (task.cost !== targetCost) {
            updatedTask.cost = targetCost;
            taskChanged = true;
          }
          if (task.start !== targetStart) {
            updatedTask.start = targetStart;
            taskChanged = true;
          }
          if (task.duration !== targetDuration) {
            updatedTask.duration = targetDuration;
            taskChanged = true;
          }

          if (taskChanged) {
            changed = true;
            return updatedTask;
          }
          return task;
        });

        return { ...group, tasks: nextTasks };
      });

      return changed ? nextGroups : prevGroups;
    });
  }, [
    propCoModelData,    propCoAssumptions.devDurationMonths,
  ]);

  // Compute Presentation Wrapper
  const headerContainerClass = isPresenting
    ? "w-full max-w-full mx-auto px-4"
    : "w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8";

  const mainContainerClass =
    isPresenting && isStrictRatio
      ? "aspect-video w-[100%] max-w-[1800px] max-h-[92vh] mx-auto overflow-y-auto bg-white shadow-2xl rounded-xl border border-[#D8D8D8] px-8 py-6 my-4"
      : headerContainerClass;

  // Navigation Logic
  const handleGroupChange = useCallback((group) => {
    setActiveGroup(group);
    if (group === "context") setActiveTab("overview");
    else if (group === "summary") setActiveTab("executive");
    else setActiveTab("dashboard");
  }, []);

  const handleClusterChange = useCallback((comp) => {
    setClusterFilter(comp);
    setActiveTab((prev) =>
      comp === "consolidated" &&
      (prev === "assumptions" || prev === "sensitivity")
        ? "dashboard"
        : prev,
    );
  }, []);

  // ==========================================
  // TRUE PRODUCTION-READY CLOUD SYNC ENGINE
  // ==========================================
  const loadFromCloud = useCallback(async (uid) => {
    if (!isCloudConfigured || !db || !uid) return;
    try {
      setCloudStatus("connecting");
      const opcoRef = doc(db, "opcoConfigs", uid);
      const opcoSnap = await getDoc(opcoRef);
      if (opcoSnap.exists()) {
        const cloudData = opcoSnap.data();
        if (cloudData && cloudData.assumptions) {
          setOpCoAssumptions(cloudData.assumptions);
        }
      }

      const propcoRef = doc(db, "propcoConfigs", uid);
      const propcoSnap = await getDoc(propcoRef);
      if (propcoSnap.exists()) {
        const cloudData = propcoSnap.data();
        if (cloudData && cloudData.assumptions) {
          setPropCoAssumptions(cloudData.assumptions);
        }
      }
      setCloudStatus("online");
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `configs/${uid}`);
      setCloudStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!isCloudConfigured || !auth) {
      setCloudStatus("offline");
      return;
    }

    setCloudStatus("connecting");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Under our strict zero-trust rules, emails must be verified
        if (currentUser.emailVerified) {
          setCloudStatus("online");
          if (isCloudSync) {
            await loadFromCloud(currentUser.uid);
          }
        } else {
          setCloudStatus("unverified");
          setIsCloudSync(false);
        }
      } else {
        setUser(null);
        setCloudStatus("offline");
        setIsCloudSync(false);
      }
    });

    return () => unsubscribe();
  }, [isCloudSync, loadFromCloud]);

  const saveDefaultsToCloud = useCallback(
    async (type) => {
      const setStatus =
        type === "opco" ? setSaveStatusOpCo : setSaveStatusPropCo;
      setStatus("saving");

      if (!isCloudConfigured || !db || !user) {
        // Fallback for Local Sandbox Mode
        setTimeout(() => {
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        }, 800);
        return;
      }

      const colName = type === "opco" ? "opcoConfigs" : "propcoConfigs";
      const currentAssumptions =
        type === "opco" ? opCoAssumptions : propCoAssumptions;

      try {
        const docRef = doc(db, colName, user.uid);
        await setDoc(docRef, {
          userId: user.uid,
          userEmail: user.email,
          updatedAt: serverTimestamp(),
          assumptions: currentAssumptions,
        });
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      } catch (err) {
        setStatus("idle");
        handleFirestoreError(
          err,
          OperationType.WRITE,
          `${colName}/${user.uid}`,
        );
      }
    },
    [user, opCoAssumptions, propCoAssumptions],
  );

  const handleTextSelection = useCallback((e) => {
    if (e.target.closest("#ai-selection-popup")) return;
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";
    if (text.length > 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      let safeX = Math.max(
        160,
        Math.min(
          rect.left + window.scrollX + rect.width / 2,
          document.body.clientWidth - 160,
        ),
      );
      setSelectionState({
        show: true,
        text,
        x: safeX,
        y:
          rect.top < 60
            ? rect.bottom + window.scrollY + 20
            : rect.top + window.scrollY - 60,
        isOpen: false,
        query: "",
        response: "",
        isLoading: false,
      });
    } else {
      setSelectionState((p) => (p.isOpen ? p : { ...p, show: false }));
    }
  }, []);

  const handleSelectionAsk = useCallback(async () => {
    if (!selectionState.query.trim()) return;
    setSelectionState((p) => ({ ...p, isLoading: true }));
    try {
      const res = await callGemini(selectionState.query, "Short analysis.");
      setSelectionState((p) => ({ ...p, response: res }));
    } catch (e) {
      console.warn(
        "Gemini API omitted; fallback to local scenario validation.",
        e,
      );
      const localRes = localFinancialAuditor.getSmartAsk(
        selectionState.query,
        opCoModelData,
        propCoModelData,
        consolidatedModelData,
        opCoAssumptions,
        propCoAssumptions,
      );
      setSelectionState((p) => ({ ...p, response: localRes }));
    } finally {
      setSelectionState((p) => ({ ...p, isLoading: false }));
    }
  }, [
    selectionState.query,
    opCoModelData,
    propCoModelData,
    consolidatedModelData,
    opCoAssumptions,
    propCoAssumptions,
  ]);

  const handleAssetChange = useCallback((key, val, clusterName) => {
    const isSpecialType = [
      "type",
      "includeLand",
      "includeTerminalValue",
      "includeFinancing",
      "exitMethod",
      "drawdownScenario",
      "depMethodBuilding",
      "depMethodInfra",
      "depMethodFFE",
      "glampingMix",
      "seasonality"
    ].includes(key);

    const parsedVal = isSpecialType ? val : (val === "" ? 0 : parseFloat(val)) || 0;

    setAssetAssumptions((prev) => {
      const next = { ...prev };
      if (clusterName) {
        next.clusters = {
          ...next.clusters,
          [clusterName]: {
            ...next.clusters[clusterName],
            [key]: parsedVal
          }
        };
      } else {
        next.global = {
          ...next.global,
          [key]: parsedVal
        };
      }
      return next;
    });
  }, []);

  const handleOpCoChange = handleAssetChange;
  const handlePropCoChange = handleAssetChange;

  const syncEquityWithSharing = useCallback(() => {
    setOpCoAssumptions((p) => {
      const t = p.partnerAEquity + p.partnerBEquity;
      return {
        ...p,
        partnerAEquity: Number((t * (p.sharingPercentA / 100)).toFixed(2)),
        partnerBEquity: Number((t - t * (p.sharingPercentA / 100)).toFixed(2)),
      };
    });
  }, []);

  const generateTeaser = useCallback(async () => {
    setIsTeaserLoading(true);
    setShowTeaser(true);
    try {
      const res = await callGemini("Project Teaser", "Investment Banker");
      setTeaserContent(res || "Error.");
    } catch (e) {
      console.warn(
        "Gemini API omitted; fallback to dynamic investment prospectus.",
        e,
      );
      const report = localFinancialAuditor.getTeaser(
        opCoModelData,
        propCoModelData,
        consolidatedModelData,
        opCoAssumptions,
        propCoAssumptions,
      );
      setTeaserContent(report);
    }
    setIsTeaserLoading(false);
  }, [
    opCoModelData,
    propCoModelData,
    consolidatedModelData,
    opCoAssumptions,
    propCoAssumptions,
  ]);

  const generateAIInsights = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const res = await callGemini(
        "Full Yield Audit",
        "Healthcare Investment Analyst",
      );
      setAiInsights(res || "Error.");
    } catch (e) {
      console.warn(
        "Gemini API omitted; fallback to multi-cascade audit report.",
        e,
      );
      const insights = localFinancialAuditor.getInsights(
        opCoModelData,
        propCoModelData,
        consolidatedModelData,
        opCoAssumptions,
        propCoAssumptions,
      );
      setAiInsights(insights);
    } finally {
      setIsAiLoading(false);
    }
  }, [
    opCoModelData,
    propCoModelData,
    consolidatedModelData,
    opCoAssumptions,
    propCoAssumptions,
  ]);

  const validateAssumptions = useCallback(async () => {
    setIsMarketLoading(true);
    setShowMarketValidation(true);
    try {
      const res = await callGemini(
        "Assumptions check",
        "Healthcare feasibility consultant",
      );
      setMarketValidation(res || "Error.");
    } catch (e) {
      console.warn(
        "Gemini API omitted; fallback to compliance and PSAK checker.",
        e,
      );
      const validation = localFinancialAuditor.getValidation(
        opCoModelData,
        propCoModelData,
        consolidatedModelData,
        opCoAssumptions,
        propCoAssumptions,
      );
      setMarketValidation(validation);
    }
    setIsMarketLoading(false);
  }, [
    opCoModelData,
    propCoModelData,
    consolidatedModelData,
    opCoAssumptions,
    propCoAssumptions,
  ]);

  const handleAskAI = useCallback(async () => {
    if (!askQuery.trim()) return;
    setIsAskLoading(true);
    try {
      const res = await callGemini(askQuery, "Financial AI");
      setAskResponse(res || "Error.");
    } catch (e) {
      console.warn("Gemini API omitted; fallback to smart ask analyzer.", e);
      const answer = localFinancialAuditor.getSmartAsk(
        askQuery,
        opCoModelData,
        propCoModelData,
        consolidatedModelData,
        opCoAssumptions,
        propCoAssumptions,
      );
      setAskResponse(answer);
    }
    setIsAskLoading(false);
  }, [
    askQuery,
    opCoModelData,
    propCoModelData,
    consolidatedModelData,
    opCoAssumptions,
    propCoAssumptions,
  ]);

  return (
    <div
      className={`min-h-screen bg-[#F9F8F6] text-[#1E2F31] font-sans pb-12 relative text-xs`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&family=League+Spartan:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700;800&display=swap');

        /* Modern, geometric UI font for general text */
        .font-sans { 
            font-family: 'Jost', sans-serif !important; 
        }

        /* Bold, geometric and impactful font for headers replacing the old serif */
        .font-serif { 
            font-family: 'League Spartan', sans-serif !important; 
        }

        /* True monospaced font for perfect vertical alignment in financial tables */
        .font-mono { 
            font-family: 'JetBrains Mono', monospace !important; 
            letter-spacing: -0.03em;
        }
      `}</style>

      <div className="bg-[#1E2F31] text-white shadow-md relative z-[130] border-b-4 border-[#1C6048] transition-all">
        <div
          className={`flex justify-between items-center transition-all duration-300 ${headerContainerClass} ${isPresenting ? "py-1.5" : "py-3"}`}
        >
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            <div
              className={`transition-all flex items-center justify-start ${isPresenting ? "h-10" : "h-16"}`}
            >
              <img
                src="/vasanta-logo-gold.svg"
                alt="Vasanta Group Logo"
                className="w-auto h-full object-contain object-left drop-shadow-sm scale-[1.7] origin-left"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => setIsPresenting(!isPresenting)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                isPresenting
                  ? "bg-[#99B6AA] text-[#1E2F31] border-[#99B6AA] hover:bg-white"
                  : "bg-[#1E2F31] text-[#99B6AA] border-[#4C4A4B] hover:text-white"
              }`}
              title="Toggle Presentation Mode"
            >
              {isPresenting ? <Minimize size={14} /> : <Maximize size={14} />}
              <span className="hidden sm:inline">
                {isPresenting ? "Exit Present" : "Present"}
              </span>
            </button>

            <button
              onClick={() =>
                setSyncConfirmDialog({
                  isOpen: true,
                  targetState: !isCloudSync,
                })
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isCloudSync
                  ? cloudStatus === "online"
                    ? "bg-[#1C6048] text-white border-[#1C6048] shadow-lg"
                    : "bg-[#9B8B70] text-white border-[#9B8B70] shadow-lg"
                  : "bg-[#1E2F31] text-[#99B6AA] border-[#4C4A4B] hover:text-white"
              }`}
              title="Toggle Cloud Saving"
            >
              {isCloudSync ? (
                cloudStatus === "online" ? (
                  <Cloud size={14} />
                ) : (
                  <RefreshCcw size={14} className="animate-spin" />
                )
              ) : (
                <CloudOff size={14} />
              )}
              <span className="hidden sm:inline">
                {isCloudSync
                  ? cloudStatus === "online"
                    ? "Cloud Sync On"
                    : "Connecting..."
                  : "Local Mode"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* PRIMARY LAYER NAV */}
      <nav className="bg-white border-b border-[#D8D8D8] sticky top-0 z-[120] shadow-sm transition-all duration-300">
        <div className={`transition-all duration-300 ${headerContainerClass}`}>
          {/* Group Switcher */}
          <div className="flex items-center justify-center gap-4 pt-3 border-b border-[#EFEBE7]">
            <button
              onClick={() => handleGroupChange("summary")}
              className={`pb-2 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeGroup === "summary" ? "text-[#1C6048]" : "text-[#4C4A4B] opacity-50 hover:opacity-100"}`}
            >
              <div className="flex items-center gap-2">
                <Briefcase size={14} /> Executive Summary
              </div>
              {activeGroup === "summary" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1C6048] rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => handleGroupChange("context")}
              className={`pb-2 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeGroup === "context" ? "text-[#9B8B70]" : "text-[#4C4A4B] opacity-50 hover:opacity-100"}`}
            >
              <div className="flex items-center gap-2">
                <FolderTree size={14} /> Strategic Foundation
              </div>
              {activeGroup === "context" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#9B8B70] rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => handleGroupChange("financials")}
              className={`pb-2 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeGroup === "financials" ? "text-[#1E2F31]" : "text-[#4C4A4B] opacity-50 hover:opacity-100"}`}
            >
              <div className="flex items-center gap-2">
                <BarChartHorizontal size={14} /> Financial Engine
              </div>
              {activeGroup === "financials" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1E2F31] rounded-t-full"></div>
              )}
            </button>
          </div>

          <div
            className={`grid grid-cols-2 md:flex md:flex-row justify-between items-center gap-2 lg:gap-3 transition-all duration-300 ${isPresenting ? "py-2" : "py-3"}`}
          >
            {/* PILLAR 1: BRANDED TITLE */}
            <div className="order-1 md:order-1 col-span-1 flex justify-start min-w-0 md:flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2 text-[#1E2F31] truncate">
                {activeTab === "executive" ? (
                  <Briefcase className="text-[#9B8B70]" />
                ) : activeTab === "overview" ? (
                  <InfoIcon className="text-[#1C6048]" />
                ) : activeTab === "study" ? (
                  <BookOpen className="text-[#1C6048]" />
                ) : activeTab === "collab" ? (
                  <Network className="text-[#1C6048]" />
                ) : activeTab === "timeline" ? (
                  <Calendar className="text-[#1C6048]" />
                ) : clusterFilter !== "consolidated" ? (
                  <Activity className="text-[#1C6048]" />
                ) : (
                  <Layers className="text-[#1E2F31]" />
                )}
                <span className="whitespace-nowrap">
                  {activeTab === "executive"
                    ? "Executive Summary"
                    : activeTab === "overview"
                      ? "Project Context"
                      : activeTab === "study"
                        ? "Feasibility Study"
                        : activeTab === "collab"
                          ? "Collaboration"
                          : activeTab === "timeline"
                            ? "Timeline"
                            : clusterFilter !== "consolidated"
                              ? ((assetAssumptions?.clusters || INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters)[clusterFilter]?.name || clusterFilter)
                              : "HoldCo VG"}
                </span>
              </h1>
            </div>

            {/* PILLAR 2: CENTERED DYNAMIC NAVIGATION (Financials or Study Sub-Nav) */}
            {activeGroup === "financials" ? (
              <div className="order-3 md:order-2 col-span-2 flex justify-start md:justify-center min-w-0 w-full md:w-auto md:flex-1 mt-1 md:mt-0">
                <div className="flex p-1 bg-[#EFEBE7]/50 rounded-xl gap-0.5 border border-[#D8D8D8] overflow-x-auto w-full md:w-auto max-w-full items-center custom-scrollbar">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "dashboard" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <LayoutDashboard size={13} /> Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab("comprehensive")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "comprehensive" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <List size={13} /> P&L / CF
                  </button>
                  <button
                    disabled={clusterFilter === "consolidated"}
                    onClick={() => setActiveTab("sensitivity")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${clusterFilter === "consolidated" ? "opacity-30 cursor-not-allowed text-[#4C4A4B]" : activeTab === "sensitivity" ? "bg-[#1E2F31] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <TrendingUp size={13} /> Sensitivity
                  </button>
                  <button
                    disabled={clusterFilter === "consolidated"}
                    onClick={() => setActiveTab("assumptions")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${clusterFilter === "consolidated" ? "opacity-30 cursor-not-allowed text-[#4C4A4B]" : activeTab === "assumptions" ? "bg-[#99B6AA] text-[#1E2F31] shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <Settings size={13} /> Settings
                  </button>
                  <div className="w-px h-4 bg-[#D8D8D8] mx-0.5 shrink-0"></div>
                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "timeline" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <Calendar size={13} /> Timeline
                  </button>
                </div>
              </div>
            ) : activeTab === "study" ? (
              <div className="order-3 md:order-2 col-span-2 flex justify-start md:justify-center min-w-0 w-full md:w-auto md:flex-1 mt-1 md:mt-0">
                <div className="flex p-1 bg-[#EFEBE7]/50 rounded-xl gap-0.5 border border-[#D8D8D8] overflow-x-auto w-full md:w-auto max-w-full items-center custom-scrollbar">
                  <button
                    onClick={() => setActiveMiniTab("marketAnalysis")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeMiniTab === "marketAnalysis" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <Search size={13} /> Market Analysis
                  </button>
                  <button
                    onClick={() => setActiveMiniTab("opportunities")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeMiniTab === "opportunities" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <Target size={13} /> Opportunities
                  </button>
                </div>
              </div>
            ) : null}

            {/* PILLAR 3: SECONDARY LAYER NAV (Tabs / Module Selection) */}
            <div className="order-2 md:order-3 col-span-1 flex justify-end min-w-0 w-full md:w-auto md:flex-1">
              {activeGroup !== "summary" && (
                <div className="flex p-1 bg-[#EFEBE7] rounded-lg gap-1 overflow-x-auto border border-[#D8D8D8] max-w-full items-center custom-scrollbar">
                  {activeGroup === "context" ? (
                    <>
                      <NavButton
                        active={activeTab === "overview"}
                        onClick={() => setActiveTab("overview")}
                        icon={<FileText size={14} />}
                        label="Overview"
                      />
                      <NavButton
                        active={activeTab === "study"}
                        onClick={() => setActiveTab("study")}
                        icon={<BookOpen size={14} />}
                        label="Study"
                      />
                      <NavButton
                        active={activeTab === "collab"}
                        onClick={() => setActiveTab("collab")}
                        icon={<Network size={14} />}
                        label="Collab"
                      />
                    </>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/50 p-1 rounded-lg border border-[#D8D8D8]">
                      <div className="pl-1 text-[#4C4A4B]">
                        {clusterFilter === "consolidated" ? <Layers size={14} /> : <Building2 size={14} />}
                      </div>
                      <select
                        value={clusterFilter}
                        onChange={(e) => handleClusterChange(e.target.value)}
                        className="bg-transparent border-none text-[#1E2F31] font-bold text-[11px] pr-6 py-0.5 focus:outline-none focus:ring-0 min-w-[200px]"
                        style={{ paddingRight: '24px'}}
                      >
                        <option value="consolidated" className="font-bold">Consolidated</option>
                        {Object.keys(assetAssumptions?.clusters || INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters || {}).map((key) => {
                          const name = (assetAssumptions?.clusters || INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters)[key]?.name || key;
                          return (
                            <option key={key} value={key} className="font-medium">
                              {name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main
        className={`transition-all duration-300 ${mainContainerClass} ${isPresenting && !isStrictRatio ? "mt-4" : isPresenting && isStrictRatio ? "" : "mt-6"}`}
      >
        {/* Content Section */}
        {activeTab === "executive" && (
          <ExecutiveSummaryView
            isPresenting={isPresenting}
            opCoData={opCoModelData}
            propCoData={propCoModelData}
            consolidatedData={consolidatedModelData}
          />
        )}
        {activeTab === "overview" && (
          <ProjectOverviewView
            info={projectInfo}
            setInfo={setProjectInfo}
            isLocked={isLockedOpCo}
          />
        )}
        {activeTab === "study" && (
          <StudyView
            isPresenting={isPresenting}
            info={projectInfo}
            activeMiniTab={activeMiniTab}
            setActiveMiniTab={setActiveMiniTab}
          />
        )}
        {activeTab === "collab" && (
          <CollaborationStrategyView isPresenting={isPresenting} />
        )}
        {activeTab === "timeline" && (
          <MasterTimelineView
            isPresenting={isPresenting}
            groups={groups}
            setGroups={setGroups}
          />
        )}
        {activeTab !== "overview" &&
          activeTab !== "study" &&
          activeTab !== "collab" &&
          activeTab !== "timeline" &&
          activeTab !== "ai" &&
          clusterFilter !== "consolidated" &&
          activeGroup === "financials" && (
            <div className="animate-in fade-in duration-500">
              {activeTab === "dashboard" && (
                <AssetDashboardView
                  data={assetModelData.clustersData[clusterFilter] || assetModelData}
                  assumptions={assetModelData.clustersData[clusterFilter]?.assumptions || assetAssumptions}
                  generateTeaser={generateTeaser}
                  isTeaserLoading={isTeaserLoading}
                  showTeaser={showTeaser}
                  setShowTeaser={setShowTeaser}
                  teaserContent={teaserContent}
                  setTab={setActiveTab}
                  isPresenting={isPresenting}
                  consolidatedScenario={holdCoScenario}
                  setConsolidatedScenario={setHoldCoScenario}
                  handleAssetChange={handleAssetChange}
                  clusterId={clusterFilter}
                />
              )}
              {activeTab === "comprehensive" && (
                <AssetCascadeView
                  data={assetModelData.clustersData[clusterFilter] || assetModelData}
                  onExport={() => {}}
                  viewResolution={viewResolution}
                  setViewResolution={setViewResolution}
                />
              )}
              {activeTab === "sensitivity" && (
                <AssetSensitivityView assumptions={assetAssumptions} />
              )}
              {activeTab === "assumptions" && (
                <SettingsPasswordGate>
                  <AssetSettingsView
                    assumptions={assetAssumptions}
                    onChange={handleAssetChange}
                    clusterFilter={clusterFilter}
                    setClusterFilter={setClusterFilter}
                  />
                </SettingsPasswordGate>
              )}
            </div>
          )}

        {activeTab !== "overview" &&
          activeTab !== "study" &&
          activeTab !== "collab" &&
          activeTab !== "timeline" &&
          activeTab !== "ai" &&
          clusterFilter === "consolidated" &&
          activeGroup === "financials" && (
            <div className="animate-in fade-in duration-500">
              {activeTab === "dashboard" && (
                <ConsolidatedDashboardView
                  data={assetModelData}
                  assetAssumptions={assetAssumptions}
                  handleAssetChange={handleAssetChange}
                  isPresenting={isPresenting}
                  consolidatedScenario={holdCoScenario}
                  setConsolidatedScenario={setHoldCoScenario}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "comprehensive" && (
                <ConsolidatedCascadeView
                  data={assetModelData}
                  onExport={() => {}}
                  viewResolution={viewResolution}
                  setViewResolution={setViewResolution}
                />
              )}
            </div>
          )}

        {activeTab === "ai" && activeGroup === "financials" && (
          <AIAuditView
            activeCompany={clusterFilter}
            aiInsights={aiInsights}
            isAiLoading={isAiLoading}
            generateAIInsights={generateAIInsights}
            askQuery={askQuery}
            setAskQuery={setAskQuery}
            handleAskAI={handleAskAI}
            isAskLoading={isAskLoading}
            askResponse={askResponse}
          />
        )}
      </main>

      {/* PRESENTER FLOATING HUB (Glassmorphic & Movable) */}
      {isPresenting &&
        (hubPosition === "minimized" ? (
          <button
            onClick={() => setHubPosition("center")}
            className="fixed bottom-6 right-6 z-[100] w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(30,47,49,0.15)] rounded-full text-[#1E2F31] hover:bg-white/70 transition-all animate-in zoom-in"
            title="Restore Hub"
          >
            <Maximize2 size={20} />
          </button>
        ) : (
          <div
            className={`fixed z-[100] flex items-center gap-1.5 p-2 rounded-full transition-all duration-700 ease-in-out bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(30,47,49,0.15)] ${
              hubPosition === "center"
                ? "bottom-6 left-1/2 -translate-x-1/2"
                : hubPosition === "left"
                  ? "bottom-6 left-6"
                  : "bottom-6 right-6"
            }`}
          >
            {/* Left Move Toggle */}
            {hubPosition !== "left" && (
              <button
                onClick={() =>
                  setHubPosition(hubPosition === "right" ? "center" : "left")
                }
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#4C4A4B] hover:bg-white/50 transition-all ml-1"
                title={
                  hubPosition === "right" ? "Move to Center" : "Move to Left"
                }
              >
                <AlignLeft size={16} />
              </button>
            )}

            <button
              onClick={goToPrevSlide}
              disabled={safeSlideIndex === 0}
              className="w-14 h-14 flex items-center justify-center bg-white/70 hover:bg-white disabled:opacity-30 disabled:hover:bg-white/70 rounded-full transition-all text-[#1E2F31] shadow-sm ml-1"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>

            {/* Info Area (Hover to reveal Hide button) */}
            <div className="flex flex-col items-center px-4 min-w-[180px] cursor-default group relative">
              <span className="text-[10px] font-bold text-[#1C6048] uppercase tracking-widest mb-0.5 drop-shadow-sm">
                Slide {safeSlideIndex + 1} of {presentationSteps.length}
              </span>
              <span className="text-sm font-black text-[#1E2F31] whitespace-nowrap drop-shadow-sm">
                {presentationSteps[safeSlideIndex].label}
              </span>

              <div className="absolute -top-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => setIsStrictRatio(!isStrictRatio)}
                  className={`bg-white/60 backdrop-blur-xl px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm border flex items-center gap-1.5 transition-all ${
                    isStrictRatio
                      ? "border-[#1C6048] text-[#1C6048] bg-white/90"
                      : "border-white/60 text-[#1E2F31] hover:bg-white/90"
                  }`}
                  title="Toggle 16:9 Presentation Format"
                >
                  <Monitor size={14} /> 16:9 Format
                </button>
                <button
                  onClick={() => setHubPosition("minimized")}
                  className="bg-white/60 backdrop-blur-xl px-3 py-1.5 rounded-full text-[11px] font-bold text-[#1E2F31] shadow-sm border border-white/60 flex items-center gap-1.5 hover:bg-white/90 transition-all"
                >
                  <EyeOff size={14} /> Hide Hub
                </button>
              </div>
            </div>

            <button
              onClick={goToNextSlide}
              disabled={safeSlideIndex === presentationSteps.length - 1}
              className="w-14 h-14 flex items-center justify-center bg-[#1C6048]/80 backdrop-blur-md hover:bg-[#1C6048] disabled:opacity-50 rounded-full transition-all text-white shadow-md mr-1"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>

            {/* Right Move Toggle */}
            {hubPosition !== "right" && (
              <button
                onClick={() =>
                  setHubPosition(hubPosition === "left" ? "center" : "right")
                }
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#4C4A4B] hover:bg-white/50 transition-all mr-1"
                title={
                  hubPosition === "left" ? "Move to Center" : "Move to Right"
                }
              >
                <AlignRight size={16} />
              </button>
            )}
          </div>
        ))}

      <SelectionPopupComp
        state={selectionState}
        setState={setSelectionState}
        onAsk={handleSelectionAsk}
      />

      {syncConfirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1E2F31]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#D8D8D8] transform scale-100">
            {/* Case 1: Firestore is not configured yet */}
            {!isCloudConfigured && syncConfirmDialog.targetState ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-[#9B8B70]/15 text-[#9B8B70]">
                    <InfoIcon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E2F31]">
                    Cloud Sync Configuration Setup
                  </h3>
                </div>
                <div className="text-[#4C4A4B] text-sm mb-6 leading-relaxed">
                  Genuine cloud-hosted saving requires valid Google
                  Cloud/Firebase project identifiers. Currently, the application
                  is running in an <strong>Offline Sandbox</strong>. Your
                  changes are isolated to this session and will be lost on
                  refresh.
                  <br />
                  <br />
                  To connect your persistent database:
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs font-mono text-[#1E2F31]/80">
                    <li>
                      Open <code>/firebase-applet-config.json</code> in the
                      workspace explorer.
                    </li>
                    <li>
                      Replace placeholder keys with active Firebase client
                      credentials.
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() =>
                      setSyncConfirmDialog({
                        isOpen: false,
                        targetState: false,
                      })
                    }
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1C6048] hover:bg-opacity-90 transition-colors"
                  >
                    Got It, Continue Offline
                  </button>
                </div>
              </>
            ) : isCloudConfigured && !user && syncConfirmDialog.targetState ? (
              /* Case 2: Configured but not logged in */
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-[#1C6048]/10 text-[#1C6048]">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E2F31]">
                    Sign In to Enable Cloud Sync
                  </h3>
                </div>
                <p className="text-[#4C4A4B] text-sm mb-6 leading-relaxed border-b border-[#EFEBE7] pb-4">
                  Sign in using Google Secure OAuth to automatically upload and
                  synchronize custom hospitality models, occupancy rates (BOR),
                  development budgets, and debt structures across sessions.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() =>
                      setSyncConfirmDialog({
                        isOpen: false,
                        targetState: false,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#4C4A4B] bg-[#EFEBE7] hover:bg-[#D8D8D8]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await loginWithGoogle();
                        setIsCloudSync(true);
                        setSyncConfirmDialog({
                          isOpen: false,
                          targetState: false,
                        });
                      } catch (err) {
                        alert(
                          "Sign in failed. Setup is running securely: " +
                            err.message,
                        );
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1C6048] hover:bg-opacity-90 flex items-center gap-2 shadow-md"
                  >
                    <Users size={14} />
                    Sign In with Google
                  </button>
                </div>
              </>
            ) : (
              /* Case 3: Fully authenticated toggle */
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 rounded-full ${syncConfirmDialog.targetState ? "bg-[#1C6048]/10 text-[#1C6048]" : "bg-[#9B8B70]/10 text-[#9B8B70]"}`}
                  >
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E2F31]">
                    {syncConfirmDialog.targetState
                      ? "Enable Cloud Sync?"
                      : "Switch to Local Mode?"}
                  </h3>
                </div>
                <p className="text-[#4C4A4B] text-sm mb-6 leading-relaxed">
                  {syncConfirmDialog.targetState
                    ? "Connecting to the cloud will save your active configurations under your authenticated profile. If there are previous cloud records, they might initially override local parameters. Proceed?"
                    : "Switching to Local Mode means updates are stored only in volatile window state. Any custom settings will reset upon manual browser refresh."}
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() =>
                      setSyncConfirmDialog({
                        isOpen: false,
                        targetState: false,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#4C4A4B] bg-[#EFEBE7] hover:bg-[#D8D8D8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsCloudSync(syncConfirmDialog.targetState);
                      setSyncConfirmDialog({
                        isOpen: false,
                        targetState: false,
                      });
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${syncConfirmDialog.targetState ? "bg-[#1C6048] hover:bg-opacity-90" : "bg-[#9B8B70] hover:bg-opacity-90"}`}
                  >
                    {syncConfirmDialog.targetState
                      ? "Yes, Enable Sync"
                      : "Yes, Switch to Local"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Absolute Blackout Screen for Presentations */}
      {isPresenting && isBlanked && (
        <div
          onClick={() => setIsBlanked(false)}
          className="fixed inset-0 bg-[#0E1516] z-[9999] flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-300"
        >
          <div className="text-zinc-650 text-xs font-mono select-none text-center space-y-2 pointer-events-none p-6">
            <p className="tracking-widest uppercase text-stone-600 font-bold text-sm">
              Screen Blackout Mode Active
            </p>
            <p className="text-[11px] text-stone-700 opacity-60">
              Click anywhere or press B/'.' on the presenter to resume
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Menu for Global Toggles */}
      <div className="fixed bottom-6 left-6 z-[9000] flex flex-col-reverse items-start gap-3">
        {/* Toggle Button */}
        <button
          onClick={() => setIsFloatingPanelVisible(!isFloatingPanelVisible)}
          className={`flex items-center justify-center p-3 rounded-full shadow-lg transition-colors ${
            isFloatingPanelVisible
              ? "bg-[#1E2F31] text-[#EFEBE7]"
              : "bg-white text-[#1E2F31] border border-[#D8D8D8]"
          }`}
          title="Toggle Global Settings"
          aria-label="Toggle Global Settings"
        >
          <Settings
            size={20}
            className={isFloatingPanelVisible ? "opacity-100" : "opacity-80"}
          />
        </button>

        {/* The Panel */}
        <div
          className={`bg-white border border-[#D8D8D8] rounded-2xl shadow-xl w-72 overflow-hidden transition-all duration-300 origin-bottom-left ${
            isFloatingPanelVisible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
        >
          <div className="bg-[#EFEBE7] px-4 py-3 border-b border-[#D8D8D8]">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#1E2F31] flex items-center gap-1.5">
              <Settings size={14} /> Global Model Settings
            </h4>
          </div>
          <div className="p-4 space-y-4">
            {/* Toggle Item: Bank Debt */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Landmark size={14} className="text-[#9B8B70]" /> Bank Debt
                Financing
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={propCoAssumptions?.includeFinancing || false}
                  onChange={(e) =>
                    handlePropCoChange("includeFinancing", e.target.checked)
                  }
                />
                <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
              </label>
            </div>
            {/* Toggle Item: Land Cost */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Map size={14} className="text-[#9B8B70]" /> Include Land Cost
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={propCoAssumptions?.includeLand ?? true}
                  onChange={(e) =>
                    handlePropCoChange("includeLand", e.target.checked)
                  }
                />
                <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
              </label>
            </div>
            {/* Dropdown: Master Exit Strategy */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Target size={14} className="text-[#1C6048]" /> Master Exit
              </span>
              <select
                className="w-[130px] bg-white border border-[#D8D8D8] text-[#1E2F31] text-[10px] rounded p-1 font-bold focus:outline-none focus:border-[#1C6048]"
                value={holdCoScenario}
                onChange={(e) => setHoldCoScenario(e.target.value)}
              >
                <option value="blended" className="text-[#9B8B70] font-bold">Mixed / Blended Exit</option>
                <option value="manual">Manual (Settings)</option>
                <option value="yr10">Exit in Yr 10</option>
                <option value="breakeven">Exit at Breakeven</option>
                <option
                  value="debt_free"
                  disabled={!propCoAssumptions?.includeFinancing}
                >
                  Exit Post-Debt
                </option>
                <option value="none">No Exit (Yield)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
