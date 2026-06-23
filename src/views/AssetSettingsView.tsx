// @ts-nocheck
import { motion } from "framer-motion";
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
export const AssetSettingsView = memo(
  ({
    data,
    assumptions,
    onChange,
    isLocked,
    onExpandLock,
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
      const infraQtyFallback = ((activeAssumptionsRaw.landArea || 0) - (activeAssumptionsRaw.sharingArea || 0)) * 0.5;
      const infraPriceFallback = 0.45;
      return {
        ...assumptions.global,
        ...activeAssumptionsRaw,
        capexSharingDevQty:
          activeAssumptionsRaw.sharingArea || (assumptions.global?.capexSharingDevQty || 0) * clusterRatio,
        capexInfraQty:
          activeAssumptionsRaw.capexInfraQty !== undefined && activeAssumptionsRaw.capexInfraQty !== null
            ? activeAssumptionsRaw.capexInfraQty
            : infraQtyFallback,
        capexInfraPrice:
          activeAssumptionsRaw.capexInfraPrice !== undefined && activeAssumptionsRaw.capexInfraPrice !== null
            ? activeAssumptionsRaw.capexInfraPrice
            : infraPriceFallback,
      };
    }, [
      activeAssumptionsRaw,
      assumptions.global,
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
            )
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
              sum + (item.qty || 0) * (item.ffeCost || item.interiorCost || item.interior || 0),
            0,
          )
        : (activeAssumptions.capexFFEQty && activeAssumptions.capexFFEPrice
            ? (activeAssumptions.capexFFEQty * activeAssumptions.capexFFEPrice) / 1000
            : buildCostForUi * 0.15);
    const averageFfeCostPerUnit =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? Math.round(((ffeCostForUi * 1000) / (totalGUnits || 1)) * 10) / 10
        : (activeAssumptions.capexFFEPrice || 0);

    const civilMepCostForUi =
      activeAssumptions.type === "glamping"
        ? (() => {
            const civilMepMixCost = activeAssumptions.glampingMix
              ? activeAssumptions.glampingMix.reduce(
                  (sum: number, item: any) => sum + (item.qty || 0) * (item.civilMepCost || 0),
                  0,
                )
              : 0;
            return civilMepMixCost > 0
              ? civilMepMixCost
              : (activeRoomUnits * (activeAssumptions.civilMepCostPerUnit || 150)) / 1000;
          })()
        : buildCostForUi * 0.20;
    const infraCostForUi =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? (() => {
            const infraMixCost = activeAssumptions.glampingMix.reduce(
              (sum: number, item: any) => sum + (item.qty || 0) * (item.infraCost || 0),
              0,
            );
            return infraMixCost > 0
              ? infraMixCost
              : (activeAssumptions.capexInfraQty && activeAssumptions.capexInfraPrice
                  ? (activeAssumptions.capexInfraQty * activeAssumptions.capexInfraPrice) / 1000
                  : buildCostForUi * 0.10);
          })()
        : (activeAssumptions.capexInfraQty && activeAssumptions.capexInfraPrice
            ? (activeAssumptions.capexInfraQty * activeAssumptions.capexInfraPrice) / 1000
            : buildCostForUi * 0.10);
    const sharingDevCostForUi =
      ((activeAssumptions.sharingArea || activeAssumptions.capexSharingDevQty || 0) * (activeAssumptions.capexSharingDevPrice || 0)) /
      1000;
    const coreCostForPctUi =
      buildCostForUi + civilMepCostForUi + ffeCostForUi + infraCostForUi + sharingDevCostForUi;
    const consultantCostUi =
      coreCostForPctUi * (((activeAssumptions.capexConsultantPct !== undefined && activeAssumptions.capexConsultantPct !== null) ? activeAssumptions.capexConsultantPct : 2.5) / 100);
    const licenseCostUi =
      coreCostForPctUi * (((activeAssumptions.capexLicensePct !== undefined && activeAssumptions.capexLicensePct !== null) ? activeAssumptions.capexLicensePct : 1.5) / 100);
    const vatBaseUi =
      consultantCostUi +
      buildCostForUi +
      civilMepCostForUi +
      ffeCostForUi +
      infraCostForUi +
      sharingDevCostForUi;
    const vatCostUi = vatBaseUi * (((activeAssumptions.capexVat !== undefined && activeAssumptions.capexVat !== null) ? activeAssumptions.capexVat : 11) / 100);
    const contingencyBaseUi =
      licenseCostUi +
      consultantCostUi +
      buildCostForUi +
      civilMepCostForUi +
      ffeCostForUi +
      infraCostForUi +
      sharingDevCostForUi +
      vatCostUi;
    const contingencyCostUi =
      contingencyBaseUi * (((activeAssumptions.capexContingencyPct !== undefined && activeAssumptions.capexContingencyPct !== null) ? activeAssumptions.capexContingencyPct : 5) / 100);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] p-5 lg:p-8 mb-12 text-xs">
        <SettingsHeader
          title="Asset Configuration"
          icon={<Settings className="text-[#9B8B70]" />}
          onExpandLock={onExpandLock}
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
                label="Year 1 (2026) Capex Draw"
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
                pctVal={activeAssumptions.capexConsultantPct !== undefined && activeAssumptions.capexConsultantPct !== null ? activeAssumptions.capexConsultantPct : 2.5}
                setPct={(v) => handleKeyChange("capexConsultantPct", v)}
                calculatedVal={consultantCostUi}
                isLocked={isLocked}
              />
              <AssumptionRowCalculated
                label="Licensing & Registrations"
                pctVal={activeAssumptions.capexLicensePct !== undefined && activeAssumptions.capexLicensePct !== null ? activeAssumptions.capexLicensePct : 1.5}
                setPct={(v) => handleKeyChange("capexLicensePct", v)}
                calculatedVal={licenseCostUi}
                isLocked={isLocked}
              />
              <AssumptionRowCalculated
                label="Capitalized VAT"
                pctVal={activeAssumptions.capexVat !== undefined && activeAssumptions.capexVat !== null ? activeAssumptions.capexVat : 11}
                setPct={(v) => handleKeyChange("capexVat", v)}
                calculatedVal={vatCostUi}
                isLocked={isLocked}
              />
              <AssumptionRowCalculated
                label="Development Contingency"
                pctVal={activeAssumptions.capexContingencyPct !== undefined && activeAssumptions.capexContingencyPct !== null ? activeAssumptions.capexContingencyPct : 5}
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
                    val={activeAssumptions.initialOccupancy}
                    set={(v) => handleKeyChange("initialOccupancy", v)}
                    unit="%"
                    isLocked={isLocked}
                  />
                  <AssumptionRow
                    label="Stabilized Occupancy"
                    val={activeAssumptions.stabilizedOccupancy}
                    set={(v) => handleKeyChange("stabilizedOccupancy", v)}
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
                      val={activeAssumptions.directLaborPct !== undefined ? activeAssumptions.directLaborPct : 15}
                      set={(v) => handleKeyChange("directLaborPct", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Direct Repairs"
                      val={activeAssumptions.directRepairsPct !== undefined ? activeAssumptions.directRepairsPct : 7}
                      set={(v) => handleKeyChange("directRepairsPct", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Direct Utilities"
                      val={activeAssumptions.directUtilitiesPct !== undefined ? activeAssumptions.directUtilitiesPct : 5}
                      set={(v) => handleKeyChange("directUtilitiesPct", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Admin Labor"
                      val={activeAssumptions.adminLaborPct !== undefined ? activeAssumptions.adminLaborPct : 10}
                      set={(v) => handleKeyChange("adminLaborPct", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Marketing"
                      val={activeAssumptions.marketingPct !== undefined ? activeAssumptions.marketingPct : 3}
                      set={(v) => handleKeyChange("marketingPct", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Admin General"
                      val={activeAssumptions.adminGeneralPct !== undefined ? activeAssumptions.adminGeneralPct : 2}
                      set={(v) => handleKeyChange("adminGeneralPct", v)}
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

            {/* Sub-group 2: Operating & Resort Phase Expenses */}
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
                administrative overheads during active resort operations.
              </p>
              <div className="space-y-0">
                <AssumptionRow
                  label="Op. Overhead / G&A"
                  val={activeAssumptions.opOverheadMonthly}
                  set={(v) => handleKeyChange("opOverheadMonthly", v)}
                  unit="B/Mo"
                  isLocked={isLocked}
                  tooltip="Fixed operating overhead and hospitality administration expenses."
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
                          {null}
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
                  <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded transition-colors min-h-[28px] gap-2">
                    <label className="text-[10px] text-[#4C4A4B] font-bold">
                      Target Exit Strategy
                    </label>
                    <select
                      className="bg-transparent border border-[#D8D8D8] text-[10px] font-mono text-[#1E2F31] font-bold p-0.5 rounded focus:outline-none w-24 text-right shrink-0 disabled:opacity-50"
                      value={activeAssumptions.clusterExitStrategy || "yr10"}
                      onChange={(e) => handleKeyChange("clusterExitStrategy", e.target.value)}
                      disabled={isLocked}
                    >
                      <option value="yr10">Exit Yr 10</option>
                      <option value="breakeven">Breakeven</option>
                      <option value="debt_free">Post-Debt</option>
                      <option value="none">No Exit</option>
                    </select>
                  </div>
                  <ToggleRow
                    label="Calculate Terminal Value"
                    desc="Enable terminal valuation models on exit."
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
