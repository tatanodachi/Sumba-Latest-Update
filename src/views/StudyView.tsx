import { InteractiveDemographicMap } from "./InteractiveDemographicMap";
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
export const StudyView = memo(
  ({ isPresenting, info, activeMiniTab, setActiveMiniTab }) => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12 relative">
        {/* Dynamic Content Rendering */}

        {activeMiniTab === "opportunities" && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
            <div>
              <div className="border-b border-[#D8D8D8] pb-4 mb-6">
                <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight">
                  Funnel Validation
                </h2>
                <p className="text-[12px] text-[#4C4A4B] font-medium mt-1">
                  Waitlist capture strategy and high-margin premium catchment
                  sizing.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Concept 4: The Interactive Geographic Spillover (The Leaflet Map) */}
                <BentoBox
                  colSpan="md:col-span-12"
                  className="bg-white border-[#D8D8D8]"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Map size={24} className="text-[#1C6048]" />
                    <div>
                      <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                        Interactive Catchment Boundary
                      </h2>
                      <p className="text-[10px] text-[#4C4A4B] font-medium mt-0.5">
                        Visualizing the West Jakarta structural spillover into
                        our localized Tangerang monopoly.
                      </p>
                    </div>
                  </div>

                  <div className="w-full">
                    <InteractiveDemographicMap />
                  </div>

                  <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-6 bg-[#EFEBE7] p-4 rounded-xl border border-[#D8D8D8]">
                    <strong className="text-[#1E2F31]">Strategic Note:</strong>{" "}
                    Notice how the primary catchment area directly borders the
                    highly affluent West Jakarta corridor. Because our model
                    strictly underwrites using only Tangerang's population, any
                    spillover from the 2.6M West Jakarta residents (who face a
                    much faster commute to Vasanta than to South Jakarta)
                    represents pure, un-modeled upside to our base-case returns.
                  </p>
                </BentoBox>


              </div>
            </div>
          </div>
        )}

        {activeMiniTab === "marketAnalysis" && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
            {/* The Regulatory Baseline and Center of Excellence sections have been removed. */}
          </div>
        )}

      </div>
    );
  },
);
