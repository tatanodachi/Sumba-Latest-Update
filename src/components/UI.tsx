import { ResponsiveContainer } from "recharts";
import React, { memo, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calculator, TrendingUp, DollarSign, Activity, FileText, Maximize2, Minimize2, Settings, LayoutDashboard, List, Users, Shield, Scale, AlignLeft, AlignRight, EyeOff, ArrowUpRight, Link2, Coins, Building2, Stethoscope, Briefcase, ShieldCheck, HeartPulse, Sparkles, BrainCircuit, RefreshCcw, BarChart3, Landmark, ArrowRightLeft, X, Download, AlertTriangle, Grid, Clock, Lock, Unlock, MapPin, Building, Cloud, CloudOff, ChevronDown, GripHorizontal, Maximize, Minimize, BookOpen, Target, Search, FolderTree, BarChartHorizontal, Layers, Microscope, Bed, Timer, Network, Plane, Dna, Bone, Baby, Eye, Check, ArrowRight, Ruler, Calendar, CalendarDays, Plus, Trash2, ChevronsUpDown, ChevronsDownUp, ChevronRight, ChevronLeft, ShieldAlert, Award, CheckCircle2, HelpCircle, Zap, Monitor, Workflow, Palmtree, Focus, Cross, Leaf, ActivitySquare, ShieldPlus, BedDouble, Pencil, Anchor, Droplets, Map as MapIcon, Info as InfoIcon, Tent, PieChart as PieChartIcon } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

export const useTooltip = (tooltip) => {
  const [tooltipState, setTooltipState] = useState(false);
  useEffect(() => {
    if (tooltipState === "hover") {
      const handleScroll = () => setTooltipState(false);
      const closeOthers = () => setTooltipState(false);
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("close-all-tooltips", closeOthers, {
        passive: true,
      });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("close-all-tooltips", closeOthers);
      };
    } else if (tooltipState === "click") {
      const handleGlobalClick = () => setTooltipState(false);
      const timeout = setTimeout(() => {
        window.addEventListener("click", handleGlobalClick, { passive: true });
        window.addEventListener("close-all-tooltips", handleGlobalClick, {
          passive: true,
        });
      }, 0);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener("click", handleGlobalClick);
        window.removeEventListener("close-all-tooltips", handleGlobalClick);
      };
    }
  }, [tooltipState]);
  return { tooltipState, setTooltipState };
};
export const LazyResponsiveContainer = memo(({ children, ...props }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ width: "100%", height: "100%" }} />;
  }

  return <ResponsiveContainer {...props}>{children}</ResponsiveContainer>;
});
export const MarkdownRenderer = memo(({ content, className = "" }) => {
  const createMarkup = (text) => {
    if (!text || typeof text !== "string") return { __html: "" };
    let html = text
      .replace(
        /^###\s+(.*$)/gim,
        '<h3 class="font-bold text-[14px] mt-4 mb-2">$1</h3>',
      )
      .replace(
        /^##\s+(.*$)/gim,
        '<h2 class="font-bold text-[15px] mt-5 mb-2">$1</h2>',
      )
      .replace(
        /^#\s+(.*$)/gim,
        '<h1 class="font-bold text-[16px] mt-6 mb-3">$1</h1>',
      )
      .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-5 list-disc mb-1">$1</li>')
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\n/gim, "<br/>");
    return { __html: html };
  };
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={createMarkup(content)}
    />
  );
});
export const NavButton = memo(({ active, onClick, icon, label, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
      disabled
        ? "opacity-20 cursor-not-allowed text-[#4C4A4B]"
        : active
          ? "bg-white text-[#1E2F31] shadow-md border border-[#D8D8D8]"
          : "text-[#4C4A4B] hover:text-[#1E2F31]"
    }`}
  >
    {icon} <span className="hidden sm:inline">{label}</span>
  </button>
));
export const KPITooltipIcon = memo(
  ({ tooltip, tooltipState, setTooltipState, align = "right" }) => {
    if (!tooltip) return null;
    const buttonRef = useRef(null);
    const showTooltip = tooltipState !== false;

    const tooltipDesc = typeof tooltip === "string" ? tooltip : tooltip.desc;
    const tooltipFormula = typeof tooltip === "string" ? null : tooltip.formula;

    const [coords, setCoords] = useState(null);

    React.useLayoutEffect(() => {
      if (showTooltip && buttonRef.current) {
        const updateCoords = () => {
          const rect = buttonRef.current.getBoundingClientRect();
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        };
        updateCoords();
        window.addEventListener("resize", updateCoords, { passive: true });
        window.addEventListener("scroll", updateCoords, {
          capture: true,
          passive: true,
        });
        return () => {
          window.removeEventListener("resize", updateCoords);
          window.removeEventListener("scroll", updateCoords, { capture: true });
        };
      } else {
        setCoords(null);
      }
    }, [showTooltip]);

    const showAbove = coords ? coords.top > window.innerHeight * 0.65 : false;

    let leftStyle = {};
    let verticalStyle = {};
    let arrowLeft = 145;

    if (coords) {
      let left = coords.left + coords.width / 2 - 145;
      if (left < 12) left = 12;
      if (left + 290 > window.innerWidth - 12) {
        left = window.innerWidth - 290 - 12;
      }
      leftStyle = { left: `${left}px` };

      if (showAbove) {
        verticalStyle = { bottom: `${window.innerHeight - coords.top + 8}px` };
      } else {
        verticalStyle = { top: `${coords.top + coords.height + 8}px` };
      }

      arrowLeft = coords.left + coords.width / 2 - left;
      if (arrowLeft < 12) arrowLeft = 12;
      if (arrowLeft > 278) arrowLeft = 278;
    }

    const tooltipStyle = coords
      ? {
          position: "fixed" as const,
          ...leftStyle,
          ...verticalStyle,
          width: "290px",
          zIndex: 1000,
        }
      : { display: "none" };

    return (
      <div
        className="relative ml-auto shrink-0"
        onMouseEnter={() => {
          if (tooltipState !== "click") {
            window.dispatchEvent(new Event("close-all-tooltips"));
            setTooltipState("hover");
          }
        }}
        onMouseLeave={() => {
          if (tooltipState !== "click") setTooltipState(false);
        }}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (tooltipState === "click") {
              setTooltipState(false);
            } else {
              window.dispatchEvent(new Event("close-all-tooltips"));
              setTooltipState("click");
            }
          }}
          className={`text-[#4C4A4B]/60 hover:text-[#1C6048] transition-colors focus:outline-none p-0.5 ${showTooltip ? "relative z-[80]" : ""}`}
          aria-label="More information"
        >
          <InfoIcon size={11} strokeWidth={2.5} />
        </button>

        {showTooltip &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[9000] sm:hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  setTooltipState(false);
                }}
              />
              <div
                style={tooltipStyle}
                className="p-4 bg-[#1E2F31] text-white rounded-xl shadow-[0_8px_30px_rgba(30,47,49,0.9)] border border-[#1C6048]/50 text-xs font-medium leading-relaxed normal-case tracking-normal animate-in fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {coords && (
                  <div
                    style={{ left: `${arrowLeft}px` }}
                    className={`absolute w-3 h-3 bg-[#1E2F31] rounded-sm transform rotate-45 border-t border-l border-[#1C6048]/50 ${
                      showAbove
                        ? "-bottom-1.5 border-t-0 border-l-0 border-b border-r"
                        : "-top-1.5"
                    }`}
                  />
                )}
                <div className="relative z-10">
                  <div className="font-bold text-white mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#99B6AA]">
                    <InfoIcon size={12} className="text-[#99B6AA]" /> Metric Insight
                  </div>
                  <div className="text-white/90 text-[11px] leading-relaxed mb-3 whitespace-pre-wrap">
                    {tooltipDesc}
                  </div>
                  {tooltipFormula && (
                    <div className="bg-black/20 p-2 rounded-lg border border-white/10 font-mono text-[9px] text-[#48B084] break-words overflow-x-auto custom-scrollbar whitespace-pre-wrap">
                      <span className="text-white/40 block text-[8px] uppercase font-sans font-bold tracking-widest mb-1 shadow-sm">
                        Formula
                      </span>
                      {tooltipFormula}
                    </div>
                  )}
                </div>
              </div>
            </>,
            document.body,
          )}
      </div>
    );
  },
);
export const StatefulTooltipIcon = memo(({ tooltip, align = "right" }) => {
  const { tooltipState, setTooltipState } = useTooltip(tooltip);
  return (
    <KPITooltipIcon
      tooltip={tooltip}
      tooltipState={tooltipState}
      setTooltipState={setTooltipState}
      align={align}
    />
  );
});
export const KPICard = memo(
  ({ title, value, icon, color, subtitle, tooltip, disabled = false }) => {
    const displayTooltip = disabled
      ? "Not applicable because Debt Financing is currently OFF."
      : tooltip;
    const { tooltipState, setTooltipState } = useTooltip(displayTooltip);

    const zClass =
      tooltipState === "click"
        ? "z-[110]"
        : tooltipState === "hover"
          ? "z-[100]"
          : "z-10 hover:z-[60]";

    const textColors = {
      blue: "text-[#1C6048]",
      emerald: "text-[#1E2F31]",
      indigo: "text-[#9B8B70]",
    };

    return (
      <div
        className={`p-4 lg:p-5 rounded-2xl border border-[#D8D8D8] bg-white flex flex-col shadow-sm transition-all focus-within:z-[60] relative group ${zClass} ${disabled ? "opacity-40 grayscale pointer-events-auto" : "md:hover:-translate-y-1"}`}
      >
        <div
          className={`flex items-center justify-between mb-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${textColors[color] || "text-[#1E2F31]"}`}
        >
          <div className="flex items-center gap-1.5 opacity-80">
            {icon} {title}
          </div>
          <KPITooltipIcon
            tooltip={displayTooltip}
            tooltipState={tooltipState}
            setTooltipState={setTooltipState}
          />
        </div>
        <div
          className={`text-lg lg:text-xl font-black mb-1 ${textColors[color] || "text-[#1E2F31]"}`}
        >
          {value}
        </div>
        <div className="text-[8px] lg:text-[9px] font-bold uppercase text-[#4C4A4B] opacity-60 tracking-tighter">
          {subtitle}
        </div>
      </div>
    );
  },
);
export const MiniKPICard = memo(
  ({ title, value, subtitle, tooltip, disabled = false }) => {
    const displayTooltip = disabled
      ? "Not applicable because Debt Financing is currently OFF."
      : tooltip;
    const { tooltipState, setTooltipState } = useTooltip(displayTooltip);
    const zClass =
      tooltipState === "click"
        ? "z-[110]"
        : tooltipState === "hover"
          ? "z-[100]"
          : "z-10 hover:z-[60]";

    return (
      <div
        className={`p-3 bg-[#EFEBE7] rounded-xl border border-[#D8D8D8] relative group ${zClass} ${disabled ? "opacity-40 grayscale pointer-events-auto" : ""}`}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] text-[#4C4A4B] font-bold uppercase">
            {title}
          </p>
          <KPITooltipIcon
            tooltip={displayTooltip}
            tooltipState={tooltipState}
            setTooltipState={setTooltipState}
          />
        </div>
        <p className="text-lg font-black text-[#1E2F31]">{value}</p>
        <p className="text-[8px] text-[#99B6AA] font-bold uppercase mt-1">
          {subtitle}
        </p>
      </div>
    );
  },
);
export const DualKPICard = memo(
  ({
    title1,
    value1,
    color1,
    tooltip1,
    title2,
    value2,
    color2,
    tooltip2,
    icon,
  }) => {
    const { tooltipState: ts1, setTooltipState: setTs1 } = useTooltip(tooltip1);
    const { tooltipState: ts2, setTooltipState: setTs2 } = useTooltip(tooltip2);

    const zClass =
      ts1 === "click" || ts2 === "click"
        ? "z-[110]"
        : ts1 === "hover" || ts2 === "hover"
          ? "z-[100]"
          : "z-10 hover:z-[60]";

    const tColors = {
      blue: "text-[#1C6048]",
      emerald: "text-[#1E2F31]",
      indigo: "text-[#9B8B70]",
      teal: "text-[#1C6048]",
      amber: "text-[#9B8B70]",
      rose: "text-[#4C4A4B]",
    };
    return (
      <div
        className={`p-4 lg:p-5 rounded-2xl border border-[#D8D8D8] bg-white flex flex-col shadow-sm transition-transform hover:-translate-y-1 relative group ${zClass} focus-within:z-[60]`}
      >
        <div
          className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${tColors[color1] || "text-[#1E2F31]"}`}
        >
          <div className="flex items-center gap-1.5 opacity-80">
            {icon} {title1}
          </div>
          <KPITooltipIcon
            tooltip={tooltip1}
            tooltipState={ts1}
            setTooltipState={setTs1}
          />
        </div>
        <div
          className={`text-lg lg:text-xl font-black mb-1 ${tColors[color1] || "text-[#1E2F31]"}`}
        >
          {value1}
        </div>
        <div className="w-full h-px bg-[#D8D8D8] my-3"></div>
        <div
          className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${tColors[color2] || "text-[#1E2F31]"}`}
        >
          <div className="flex items-center gap-1.5 opacity-80">{title2}</div>
          <KPITooltipIcon
            tooltip={tooltip2}
            tooltipState={ts2}
            setTooltipState={setTs2}
          />
        </div>
        <div
          className={`text-lg lg:text-xl font-black ${tColors[color2] || "text-[#1E2F31]"}`}
        >
          {value2}
        </div>
      </div>
    );
  },
);
export const SectionTitle = memo(({ title, icon, color }) => {
  const c = {
    blue: "text-[#1C6048]",
    emerald: "text-[#1C6048]",
    indigo: "text-[#9B8B70]",
    rose: "text-[#4C4A4B]",
    amber: "text-[#9B8B70]",
    teal: "text-[#4C4A4B]",
  };
  return (
    <div
      className={`flex items-center gap-2 pb-2 border-b-2 border-[#D8D8D8] ${c[color] || "text-[#1E2F31]"}`}
    >
      {icon}{" "}
      <h3 className="text-[10px] font-black uppercase tracking-wider">
        {title}
      </h3>
    </div>
  );
});
export const FormattedInput = memo(
  ({ val, set, className, placeholder, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <input
        type={isFocused ? "number" : "text"}
        value={
          isFocused
            ? val || ""
            : new Intl.NumberFormat("en-US", {
                maximumFractionDigits: 4,
              }).format(val || 0)
        }
        onChange={(e) => set(e.target.value)}
        onFocus={(e) => {
          setIsFocused(true);
          setTimeout(() => e.target.select(), 0);
        }}
        onBlur={() => setIsFocused(false)}
        className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  },
);
export const AssumptionRow = memo(({ label, val, set, unit, isLocked, tooltip }) => {
  const { tooltipState, setTooltipState } = useTooltip(tooltip);
  return (
    <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded transition-colors relative">
      <div className="flex items-center gap-1.5">
        <label className="text-[10px] text-[#4C4A4B] font-bold">{label}</label>
        <KPITooltipIcon
          tooltip={tooltip}
          tooltipState={tooltipState}
          setTooltipState={setTooltipState}
          align="left"
        />
      </div>
      <div className="flex items-center gap-1">
        <FormattedInput
          disabled={isLocked}
          val={val}
          set={set}
          className="w-16 p-1 text-right text-[10px] border border-[#D8D8D8] rounded focus:ring-2 focus:ring-[#1C6048] outline-none font-black text-[#1E2F31] bg-white"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-4">
          {unit}
        </span>
      </div>
    </div>
  );
});
export const ToggleRow = memo(({ label, desc, checked, onChange, isLocked }) => (
  <div
    className={`flex items-center justify-between p-3 bg-[#EFEBE7] border border-[#D8D8D8] rounded-xl ${isLocked ? "opacity-70" : ""}`}
  >
    <div>
      <p className="font-bold text-[#1E2F31] text-[11px]">{label}</p>
      <p className="text-[9px] text-[#4C4A4B] font-medium">{desc}</p>
    </div>
    <label
      className={`relative inline-flex items-center ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input
        disabled={isLocked}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-9 h-5 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9B8B70] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
    </label>
  </div>
));
export const AssumptionRowCalculated = memo(
  ({ label, pctVal, setPct, calculatedVal, isLocked }) => (
    <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded">
      <label className="text-[10px] text-[#4C4A4B] font-bold">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#1C6048] font-bold w-12 text-right">
          {formatNumber(calculatedVal, 2)} B
        </span>
        <div className="flex items-center gap-1">
          <FormattedInput
            disabled={isLocked}
            val={pctVal}
            set={setPct}
            className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          />
          <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-4">
            %
          </span>
        </div>
      </div>
    </div>
  ),
);
export const AssumptionRowQtyPrice = memo(
  ({ label, qtyVal, priceVal, setQty, setPrice, isLocked }) => (
    <div className="flex flex-col group py-1.5 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded gap-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-[#4C4A4B] font-bold">{label}</label>
        <span className="text-[10px] text-[#1C6048] font-bold">
          {formatNumber(((qtyVal || 0) * (priceVal || 0)) / 1000, 2)} B
        </span>
      </div>
      <div className="flex justify-end items-center gap-1">
        <FormattedInput
          disabled={isLocked}
          val={qtyVal}
          set={setQty}
          className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          placeholder="Qty"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase mr-1">
          Qty
        </span>
        <span className="text-[8px] text-[#D8D8D8] font-black mx-1">×</span>
        <FormattedInput
          disabled={isLocked}
          val={priceVal}
          set={setPrice}
          className="w-16 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          placeholder="Price"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-8">
          M / ea
        </span>
      </div>
    </div>
  ),
);
export const AssumptionRowQtyPriceWithToggle = memo(
  ({
    label,
    qtyVal,
    priceVal,
    setQty,
    setPrice,
    checked,
    onExpand,
    isLocked,
  }) => (
    <div
      className={`flex flex-col group py-1.5 border-b border-[#D8D8D8] last:border-0 px-1 rounded gap-1 ${!checked ? "opacity-60 bg-[#EFEBE7]/50" : "hover:bg-[#EFEBE7]"}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label
            className={`relative inline-flex items-center ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <input
              disabled={isLocked}
              type="checkbox"
              className="sr-only peer"
              checked={checked}
              onChange={(e) => onExpand(e.target.checked)}
            />
            <div className="w-7 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
          </label>
          <label className="text-[10px] text-[#4C4A4B] font-bold">
            {label}
          </label>
        </div>
        <span className="text-[10px] text-[#1C6048] font-bold">
          {formatNumber(
            checked ? ((qtyVal || 0) * (priceVal || 0)) / 1000 : 0,
            2,
          )}{" "}
          B
        </span>
      </div>
      <div className="flex justify-end items-center gap-1">
        <FormattedInput
          disabled={isLocked || !checked}
          val={qtyVal}
          set={setQty}
          className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white disabled:bg-[#D8D8D8]/30"
          placeholder="Qty"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase mr-1">
          Qty
        </span>
        <span className="text-[8px] text-[#D8D8D8] font-black mx-1">×</span>
        <FormattedInput
          disabled={isLocked || !checked}
          val={priceVal}
          set={setPrice}
          className="w-16 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white disabled:bg-[#D8D8D8]/30"
          placeholder="Price"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-8">
          M / ea
        </span>
      </div>
    </div>
  ),
);
export const SettingsHeader = memo(
  ({
    title,
    icon,
    isLocked,
    onExpandLock,
    onSave,
    saveStatus,
    onReset,
    onValidate,
    isCloudSync,
  }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-[#D8D8D8] pb-4">
      <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight">
        {icon} {title}{" "}
        {isLocked && <Lock size={16} className="text-[#9B8B70] ml-2" />}
      </h2>
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <button
          onClick={onExpandLock}
          className={`flex-1 md:flex-none justify-center text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${isLocked ? "bg-[#9B8B70] hover:bg-[#1E2F31] text-white" : "bg-white border border-[#D8D8D8] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}{" "}
          {isLocked ? "Unlock" : "Lock Inputs"}
        </button>
        <button
          onClick={onValidate}
          disabled={isLocked}
          className="flex-1 md:flex-none justify-center bg-[#1E2F31] hover:opacity-90 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Sparkles size={14} /> ✨ Validate
        </button>
        <div className="h-8 w-px bg-[#D8D8D8] hidden md:block"></div>

        {isCloudSync && (
          <button
            onClick={onSave}
            disabled={saveStatus !== "idle" || isLocked}
            className={`flex-1 md:flex-none justify-center text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50 px-2 py-2 md:py-0 border md:border-0 rounded-lg md:rounded-none border-[#D8D8D8] ${saveStatus === "saved" ? "text-[#1C6048]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
          >
            {saveStatus === "saving" ? (
              <RefreshCcw size={14} className="animate-spin" />
            ) : (
              <ShieldCheck size={14} />
            )}{" "}
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
                ? "Saved!"
                : "Set Defaults"}
          </button>
        )}
        <button
          onClick={onReset}
          disabled={isLocked}
          className="text-xs font-bold text-[#4C4A4B] hover:text-[#1E2F31] flex items-center justify-center gap-1 transition-colors disabled:opacity-50 px-2 py-2 md:py-0 border md:border-0 rounded-lg md:rounded-none border-[#D8D8D8]"
        >
          <RefreshCcw size={14} /> Reset
        </button>
      </div>
    </div>
  ),
);
export const TableRow = memo(
  ({
    label,
    data,
    dk,
    total,
    highlight,
    indigo,
    emerald,
    crossover,
    isIndent,
    isDoubleIndent,
    tooltip,
    isPercent,
    isExpandable,
    isExpanded,
    onExpand,
    isHeader,
    hasConnector,
    hasDoubleConnector,
    isSubtractor,
  }) => {
    let baseColorClass = "bg-white font-medium text-[#4C4A4B]";
    if (highlight || isHeader) {
      if (indigo) baseColorClass = "bg-[#EBEFEE] font-bold text-[#1E2F31]";
      else if (emerald)
        baseColorClass = "bg-[#E8EFEA] font-black text-[#1C6048]";
      else baseColorClass = "bg-[#EFEBE7] font-bold text-[#1E2F31]";
    }

    let firstColClass = `pr-3 py-1.5 sticky left-0 z-[40] border-r border-b border-[#D8D8D8] whitespace-nowrap transition-all shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[360px] min-w-[360px] max-w-[360px] overflow-hidden text-ellipsis ${baseColorClass} ${isDoubleIndent ? "pl-[26px] text-[9.5px]" : isIndent ? "pl-[18px] text-[10px]" : "pl-2 text-[11px]"} ${!highlight && !isHeader ? "group-hover:bg-[#F9F8F6]" : ""}`;
    let totalColClass = `px-2 py-1.5 text-right font-bold font-mono border-l border-b border-[#D8D8D8] sticky right-0 z-[40] shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] ${baseColorClass} ${!highlight && !isHeader ? "group-hover:bg-[#F9F8F6]" : ""}`;

    return (
      <tr
        className={`group transition-all ${isExpandable ? "cursor-pointer select-none" : ""} ${highlight || isHeader ? "" : "hover:bg-[#F9F8F6]"}`}
        onClick={isExpandable ? onExpand : undefined}
      >
        <td
          className={firstColClass}
        >
          <div className="flex items-center justify-between gap-2 overflow-hidden w-full">
            <div 
              className={`flex items-center gap-1.5 overflow-hidden min-w-0 ${isExpandable ? 'cursor-pointer hover:opacity-80 active:scale-95 transition-all' : ''}`}
              onClick={(e) => {
                if (isExpandable && onExpand) {
                  e.stopPropagation();
                  onExpand();
                }
              }}
            >
              {isExpandable ? (
                <div
                  className={`pointer-events-none text-[#9B8B70] flex-shrink-0 flex items-center justify-center w-5 h-5 -ml-1 rounded-md hover:bg-[#1C6048]/15 hover:text-[#1C6048] transition-all duration-200 bg-[#9B8B70]/10 ${isExpanded ? "rotate-90 bg-[#1C6048]/15 text-[#1C6048]" : ""}`}
                >
                  <ChevronRight size={14} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="w-5 h-5 -ml-1 flex-shrink-0" />
              )}

              {hasDoubleConnector && (
                <span className="font-mono select-none text-[9px] tracking-tighter text-[#9B8B70]/80 mr-1 flex-shrink-0 whitespace-nowrap">
                  │  └─
                </span>
              )}
              {hasConnector && !hasDoubleConnector && (
                <span className="font-mono select-none text-[9px] tracking-tighter text-[#9B8B70]/80 mr-1 flex-shrink-0 whitespace-nowrap">
                  └─
                </span>
              )}

              <span className={`truncate ${isHeader ? "font-bold text-[#1E2F31]" : highlight ? "font-bold text-[#1E2F31]" : "text-[#4C4A4B]"}`}>
                {label}
              </span>
            </div>
            {tooltip && <StatefulTooltipIcon tooltip={tooltip} align="right" />}
          </div>
        </td>
        {data.map((d, i) => {
          const rawVal = d[dk] || 0;
          const val = isSubtractor ? -Math.abs(rawVal) : rawVal;
          const isCrossover =
            crossover && val >= 0 && i > 0 && data[i - 1][dk] < 0;
          const cellBg = highlight
            ? indigo
              ? "bg-[#EBEFEE]"
              : emerald
                ? "bg-[#E8EFEA]"
                : "bg-[#EFEBE7]/50"
            : "bg-white group-hover:bg-[#F9F8F6]";

          const formattedVal = formatNumber(val, 1);
          const displayVal =
            isPercent && formattedVal !== "0"
              ? val < 0
                ? `(${formattedVal.replace(/[()]/g, "")}%)`
                : `${formattedVal}%`
              : rawVal === 0 && rawVal >= 0
                ? isPercent
                  ? "0.0%"
                  : "-"
                : formattedVal;

          const hoverBgClass = !highlight && !isHeader
            ? "group-hover:bg-[#F9F8F6]"
            : "";

          return (
            <td
              key={i}
              title={String(d.defaultLabel)}
              className={`px-2 py-1.5 text-right border-r border-b border-[#D8D8D8] font-mono transition-all ${cellBg} ${val < 0 ? "text-[#9B8B70]" : highlight ? "text-[#1E2F31] font-bold" : "text-[#4C4A4B]"} ${isCrossover ? "bg-[#9B8B70]/20 ring-1 ring-inset ring-[#9B8B70] text-[#1E2F31] font-bold" : ""} ${hoverBgClass}`}
            >
              {displayVal}
            </td>
          );
        })}
        {total !== undefined ? (
          <td className={totalColClass}>
            {isPercent
              ? total < 0
                ? `(${formatNumber(total, 1).replace(/[()]/g, "")}%)`
                : `${formatNumber(total, 1)}%`
              : formatNumber(isSubtractor ? -Math.abs(total) : total, 1)}
          </td>
        ) : (
          <td className={totalColClass}></td>
        )}
      </tr>
    );
  },
);
export const ExpandableDataRowGroup = ({
  parentLabel,
  parentDk,
  parentTotal,
  data,
  childrenData,
  parentTooltip,
  isSubtractor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow
        label={parentLabel}
        data={data}
        dk={parentDk}
        total={parentTotal}
        tooltip={parentTooltip}
        isSubtractor={isSubtractor}
        isExpandable
        isExpanded={isExpanded}
        onExpand={() => setIsExpanded(!isExpanded)}
        isIndent
      />
      {isExpanded &&
        childrenData.map((child, i) => (
          <TableRow
            key={i}
            label={child.label}
            data={data}
            dk={child.dk}
            total={child.total}
            isIndent
            tooltip={child.tooltip}
            isSubtractor={isSubtractor}
            hasConnector
          />
        ))}
    </>
  );
};
export const TableSection = memo(({ title, colSpan, type = "default" }) => {
  const bgClass =
    type === "emerald" ? "bg-[#1C6048] text-white" : "bg-[#1E2F31] text-white";
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={`p-0 border-y-2 border-white ${bgClass}`}
      >
        <div
          className={`px-4 py-2.5 font-black uppercase text-[10px] tracking-widest sticky left-0 inline-block whitespace-nowrap ${bgClass}`}
        >
          {title}
        </div>
      </td>
    </tr>
  );
});
export const CapexRow = memo(
  ({ label, amount, total, isHeader, isSubtotal, isIndent }) => (
    <tr
      className={`group ${isSubtotal ? "font-bold text-[#1E2F31]" : "text-[#4C4A4B]"} ${isHeader ? "font-bold text-[#1E2F31]" : ""}`}
    >
      <td
        className={`pr-3 py-1.5 border-r border-b border-[#D8D8D8] transition-colors ${isSubtotal ? "bg-[#EFEBE7]/50" : "bg-white group-hover:bg-[#F9F8F6]"} ${isIndent ? "pl-4 text-[10px]" : "pl-1 text-[11px]"}`}
      >
        {label}
      </td>
      <td
        className={`px-3 py-1.5 text-right border-r border-b border-[#D8D8D8] font-mono transition-colors ${isSubtotal ? "bg-[#EFEBE7]/50" : "bg-white group-hover:bg-[#F9F8F6]"}`}
      >
        {formatNumber(amount, 1)}
      </td>
      <td
        className={`px-3 py-1.5 text-right font-mono border-b border-[#D8D8D8] transition-colors ${isSubtotal ? "bg-[#EFEBE7]/50 text-[#1E2F31]" : "bg-white group-hover:bg-[#F9F8F6] text-[#4C4A4B]"}`}
      >
        {formatNumber(total > 0 ? (amount / total) * 100 : 0, 1)}%
      </td>
    </tr>
  ),
);
export const ExpandableCapexRow = memo(
  ({ icon, title, amount, totalCapex, details }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const pct = totalCapex > 0 ? (amount / totalCapex) * 100 : 0;

    return (
      <div className="border-b border-[#D8D8D8] last:border-0 pb-1 mb-1">
        <div
          className={`flex justify-between items-center py-2 px-2 -mx-2 rounded-lg transition-colors ${details && details.length > 0 ? "cursor-pointer hover:bg-[#EFEBE7]/50" : ""}`}
          onClick={() =>
            details && details.length > 0 && setIsExpanded(!isExpanded)
          }
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EFEBE7] rounded-lg">{icon}</div>
            <div>
              <p className="text-xs text-[#1E2F31] font-bold flex items-center gap-1.5">
                {title}
                {details && details.length > 0 && (
                  <ChevronDown
                    size={14}
                    className={`text-[#9B8B70] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono font-black text-[#1E2F31] text-sm">
              {formatNumber(amount, 1)} B
            </p>
            <p className="text-[9px] text-[#1C6048] font-bold uppercase">
              {formatNumber(pct, 1)}%
            </p>
          </div>
        </div>

        {isExpanded && details && details.length > 0 && (
          <div className="pl-12 pr-2 pb-2 pt-1 space-y-2.5 animate-in slide-in-from-top-2 fade-in duration-200">
            {details.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-[10px] group"
              >
                <span className="text-[#4C4A4B] font-medium flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#D8D8D8] group-hover:bg-[#1C6048] transition-colors"></div>
                  {item.label}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[#1E2F31] font-bold">
                    {formatNumber(item.amount, 1)}
                  </span>
                  <span className="font-mono text-[#9B8B70] w-8 text-right">
                    {formatNumber(
                      totalCapex > 0 ? (item.amount / totalCapex) * 100 : 0,
                      1,
                    )}
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);
export const PartnerReturnCard = ({
  name,
  metrics,
  equity,
  share,
  color,
  isUnifiedCard = false,
}) => {
  const c =
    color === "blue"
      ? {
          text: "text-[#1C6048]",
          bg: "bg-[#EFEBE7]",
          border: "border-[#D8D8D8]",
        }
      : {
          text: "text-[#9B8B70]",
          bg: "bg-[#EFEBE7]",
          border: "border-[#D8D8D8]",
        };
  return (
    <div
      className={
        isUnifiedCard
          ? "relative w-full"
          : "bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] relative transition-all hover:shadow-md"
      }
    >
      <div
        className={`absolute top-0 right-0 py-1 px-2.5 ${c.bg} rounded-bl-xl border-l border-b ${c.border}`}
      >
        <p className="text-[8px] font-bold text-[#4C4A4B] uppercase leading-none mb-0.5 text-right tracking-widest">
          Share
        </p>
        <p className={`text-xs font-black ${c.text} text-right`}>
          {(share || 0).toFixed(0)}%
        </p>
      </div>
      <div className="mb-4 pr-16">
        <h3
          className={`text-lg font-bold text-[#1E2F31] flex items-start gap-2 mb-1`}
        >
          <Users size={20} className={`shrink-0 mt-0.5 ${c.text}`} />
          <span className="leading-tight">{name}</span>
        </h3>
        <p className="text-xs text-[#4C4A4B] font-medium">
          Avg Dividend Yield:{" "}
          <b className={c.text}>{formatNumber(metrics?.avgYield, 1)}%</b>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 text-center">
        <div className="p-3 lg:p-4 bg-[#EFEBE7] rounded-xl border border-[#D8D8D8] hover:bg-white">
          <p className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-wider mb-1">
            Equity IRR
          </p>
          <p className={`text-xl lg:text-2xl font-black ${c.text}`}>
            {formatNumber((metrics?.irr || 0) * 100, 2)}%
          </p>
        </div>
        <div className="p-3 lg:p-4 bg-[#EFEBE7] rounded-xl border border-[#D8D8D8] hover:bg-white">
          <p className="text-[10px] text-[#9B8B70] font-bold uppercase tracking-wider mb-1">
            Payback
          </p>
          <p className="text-xl lg:text-2xl font-black text-[#9B8B70]">
            {metrics?.payback && metrics.payback > 0 ? (
              <>
                {formatNumber(metrics.payback, 1)}{" "}
                <span className="text-xs font-bold text-[#4C4A4B] uppercase">
                  Yrs
                </span>
              </>
            ) : (
              "Never"
            )}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[#4C4A4B] uppercase tracking-tighter flex items-center gap-1">
            <Coins size={12} /> Recovery
          </span>
          <span className="font-black text-[#1E2F31]">
            {equity > 0 && metrics?.totalCash >= equity
              ? "100%"
              : `${equity > 0 ? (((metrics?.totalCash || 0) / equity) * 100).toFixed(1) : "0"}%`}
          </span>
        </div>
        <div className="w-full h-2 bg-[#D8D8D8] rounded-full overflow-hidden">
          <div
            className={`h-full ${color === "blue" ? "bg-[#1C6048]" : "bg-[#9B8B70]"} rounded-full`}
            style={{
              width: `${Math.min(100, equity > 0 ? ((metrics?.totalCash || 0) / equity) * 100 : 0)}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-[#4C4A4B]">
          <span>MOIC: {(metrics?.moic || 0).toFixed(2)}x</span>
          <span>{formatCurrency(metrics?.totalCash)}</span>
        </div>
      </div>
    </div>
  );
};
export const SensitivityTable = memo(
  ({
    title,
    subtitle,
    xLabel,
    yLabel,
    xValues,
    yValues,
    matrix,
    formatFn,
    reverseColors,
  }) => {
    const all = matrix.flat().filter((v) => v !== 0 && !isNaN(v));
    const min = all.length > 0 ? Math.min(...all) : 0;
    const max = all.length > 0 ? Math.max(...all) : 0;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
        <div className="p-4 bg-[#EFEBE7] border-b border-[#D8D8D8]">
          <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
            <Grid size={16} className="text-[#1C6048]" /> {title}
          </h3>
          <p className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        </div>
        <div className="p-6 overflow-x-auto">
          <div className="min-w-[600px]">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 border-r-2 border-[#D8D8D8] text-[10px] p-2 text-right align-bottom">
                    {xLabel} ➔<br />
                    {yLabel} ⬇
                  </th>
                  {xValues.map((x, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-xs font-bold text-[#1E2F31] bg-[#EFEBE7]/50 border-b border-[#D8D8D8]"
                    >
                      {String(x)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yValues.map((y, r) => (
                  <tr key={r}>
                    <th className="px-3 py-3 text-xs font-bold text-[#1E2F31] bg-[#EFEBE7]/50 border-r border-[#D8D8D8] whitespace-nowrap">
                      {String(y)}
                    </th>
                    {matrix[r].map((val, c) => {
                      let color = "";
                      if (val === 0 || isNaN(val)) {
                        color = "bg-[#9B8B70] text-white"; // Never / Bad is always brown
                      } else {
                        let ratio =
                          max === min ? 0.5 : (val - min) / (max - min);
                        if (reverseColors) ratio = 1 - ratio;
                        color =
                          ratio > 0.6
                            ? "bg-[#1C6048] text-white"
                            : ratio > 0.3
                              ? "bg-[#99B6AA]/50 text-[#1E2F31]"
                              : "bg-[#9B8B70] text-white";
                      }
                      return (
                        <td
                          key={c}
                          className={`px-3 py-3 border border-white text-xs font-mono font-bold transition-all hover:opacity-80 ${color}`}
                        >
                          {formatFn(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
);
export const SelectionPopupComp = memo(({ state, setState, onAsk }) => {
  const popupRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0,
  });

  // Reset drag position when the popup spawns at a new text selection
  useEffect(() => {
    if (popupRef.current) {
      dragRef.current.translateX = 0;
      dragRef.current.translateY = 0;
      popupRef.current.style.transform = "translate(-50%, 0px)";
    }
  }, [state.x, state.y]);

  const handlePointerDown = (e) => {
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX - dragRef.current.translateX;
    dragRef.current.startY = e.clientY - dragRef.current.translateY;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging || !popupRef.current) return;
    const x = e.clientX - dragRef.current.startX;
    const y = e.clientY - dragRef.current.startY;
    dragRef.current.translateX = x;
    dragRef.current.translateY = y;
    // Apply CSS transform directly to bypass React render cycle for 60fps smoothness
    popupRef.current.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
  };

  const handlePointerUp = (e) => {
    dragRef.current.isDragging = false;
    e.target.releasePointerCapture(e.pointerId);
  };

  if (!state.show) return null;
  return (
    <div
      id="ai-selection-popup"
      ref={popupRef}
      className="absolute z-[100] flex flex-col items-center animate-in fade-in zoom-in duration-200"
      style={{
        left: state.x,
        top: state.y,
        transform: `translate(calc(-50% + ${dragRef.current.translateX}px), ${dragRef.current.translateY}px)`,
      }}
    >
      {!state.isOpen ? (
        <button
          onClick={() => setState((p) => ({ ...p, isOpen: true }))}
          className="bg-[#1E2F31] text-white p-2.5 rounded-full shadow-xl border border-[#D8D8D8] hover:scale-110 transition-all flex items-center justify-center"
        >
          <Sparkles size={20} className="text-white" />
        </button>
      ) : (
        <div className="bg-white w-72 md:w-80 p-4 lg:p-5 rounded-2xl shadow-2xl border border-[#1E2F31] flex flex-col gap-3 relative mt-2">
          <div
            className="w-full flex justify-center items-center cursor-grab active:cursor-grabbing pb-2 -mt-2 pt-1 opacity-50 hover:opacity-100 touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <GripHorizontal
              size={16}
              className="text-[#4C4A4B] pointer-events-none"
            />
          </div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-black flex items-center gap-1.5 text-[#1E2F31]">
              <Sparkles size={16} className="text-[#1C6048]" /> Selection AI
            </h4>
            <button
              onClick={() =>
                setState((p) => ({ ...p, show: false, isOpen: false }))
              }
              className="text-[#4C4A4B] hover:text-[#1E2F31] bg-[#EFEBE7] rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
          <div className="bg-[#EFEBE7] p-3 rounded-lg text-[11px] text-[#4C4A4B] italic border border-[#D8D8D8] max-h-20 overflow-hidden relative font-medium">
            "{String(state.text)}"
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#EFEBE7] to-transparent pointer-events-none"></div>
          </div>
          <textarea
            value={state.query}
            onChange={(e) => setState((p) => ({ ...p, query: e.target.value }))}
            placeholder="What do you want to know about this?"
            className="w-full text-xs p-3 border border-[#D8D8D8] rounded-xl focus:ring-2 focus:ring-[#1C6048] outline-none resize-none h-20 shadow-inner text-[#1E2F31]"
            autoFocus
          />
          {state.response && (
            <div className="bg-[#EFEBE7] p-4 rounded-xl border border-[#D8D8D8] max-h-48 overflow-y-auto shadow-inner">
              <MarkdownRenderer
                content={state.response}
                className="text-[12px] text-[#4C4A4B] leading-relaxed"
              />
            </div>
          )}
          <button
            onClick={onAsk}
            disabled={state.isLoading || !state.query.trim()}
            className="w-full bg-[#1C6048] hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2"
          >
            {state.isLoading ? (
              <RefreshCcw size={14} className="animate-spin" />
            ) : (
              <BrainCircuit size={14} />
            )}
            {state.isLoading ? "Thinking..." : "Ask Gemini"}
          </button>
        </div>
      )}
    </div>
  );
});
export const MarketValidationDisplay = memo(({ content, loading, onClose, color }) => (
  <div
    className={`mb-8 bg-white p-5 lg:p-6 rounded-2xl border border-[#D8D8D8] border-l-4 relative shadow-sm animate-in slide-in-from-top-4 ${color === "blue" ? "border-l-[#1C6048]" : "border-l-[#9B8B70]"}`}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-[#4C4A4B] hover:text-[#1E2F31] bg-[#EFEBE7] rounded-full p-1"
    >
      <X size={16} />
    </button>
    <h3 className="font-black text-[#1E2F31] mb-3 flex items-center gap-2 text-sm">
      <Scale size={18} /> AI Market Check
    </h3>
    {loading ? (
      <div className="animate-pulse space-y-3">
        <div className="h-2 bg-[#D8D8D8] rounded w-full"></div>
        <div className="h-2 bg-[#D8D8D8] rounded w-5/6"></div>
      </div>
    ) : (
      <MarkdownRenderer
        content={content}
        className="text-[13px] text-[#4C4A4B] font-medium"
      />
    )}
  </div>
));
export const BentoBox = memo(
  ({ children, className = "", colSpan = "col-span-12" }) => (
    <div
      className={`bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-[#D8D8D8] flex flex-col transition-all hover:shadow-md ${colSpan} ${className}`}
    >
      {children}
    </div>
  ),
);
export const BentoIcon = memo(({ icon, color = "blue", className = "" }) => {
  const bgColors = {
    blue: "bg-[#1C6048]/10 text-[#1C6048]",
    emerald: "bg-[#1E2F31]/10 text-[#1E2F31]",
    indigo: "bg-[#9B8B70]/10 text-[#9B8B70]",
    rose: "bg-[#4C4A4B]/10 text-[#4C4A4B]",
    amber: "bg-[#99B6AA]/20 text-[#1E2F31]",
    transparent: "bg-transparent",
  };
  return (
    <div
      className={`flex items-center justify-center mb-5 shrink-0 ${color !== "transparent" ? "w-14 h-14 rounded-[20px]" : ""} ${bgColors[color]} ${className}`}
    >
      {icon}
    </div>
  );
});
export const ProjectInfoFieldComp = memo(
  ({ label, value, onChange, isLocked, icon }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-[#4C4A4B] uppercase flex items-center gap-1.5 ml-1">
        {icon} {label}
      </label>
      <input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLocked}
        className="w-full p-3 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-2 focus:ring-[#1C6048] outline-none disabled:opacity-70 transition-all shadow-inner"
      />
    </div>
  ),
);
export const GlampingMixTable = memo(({ mix, onChange, isLocked }) => {
  const totalQty = mix.reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
  const totalBed = mix.filter(i => i.isAccommodation).reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
  const totalAmenity = mix.filter(i => !i.isAccommodation).reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
  
  const sumUnitSize = mix.reduce((acc, item) => acc + ((parseFloat(item.qty) || 0) * parseArea(item.unitSize)), 0);
  const sumFootprint = mix.reduce((acc, item) => acc + ((parseFloat(item.qty) || 0) * parseArea(item.footprint)), 0);
  
  const sumVilla = mix.reduce((acc, item) => acc + ((parseFloat(item.qty) || 0) * (parseFloat(item.villaCost) || 0)), 0);
  const sumFfe = mix.reduce((acc, item) => acc + ((parseFloat(item.qty) || 0) * (parseFloat(item.ffeCost) || 0)), 0);
  const sumTotal = sumVilla + sumFfe;

  return (
    <div className="bg-[#FAF9F7] border flex flex-col gap-2.5 border-[#D8D8D8] rounded-xl p-3">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-[#1E2F31] flex items-center gap-1.5 uppercase tracking-tight">
            <Tent size={16} className="text-[#1C6048]" /> Glamping Mix
          </h2>
          <p className="text-[10px] font-medium text-[#8A8989]">
            Tent model mix dictating active room counts and capex.
          </p>
        </div>
        <div className="flex gap-1.5">
          <div className="bg-white border text-[10px] border-[#D8D8D8] rounded-full px-2 py-0.5 flex items-center gap-1 font-bold text-[#1E2F31]">
            <span className="text-[#8A8989] text-[9px]">TOTAL:</span> {totalQty}
          </div>
          <div className="bg-[#EAF3EF] border text-[10px] border-[#D8D8D8]/60 rounded-full px-2 py-0.5 flex items-center gap-1 font-bold text-[#1C6048]">
            <BedDouble size={11} /> {totalBed}
          </div>
          <div className="bg-[#F4F1ED] border text-[10px] border-[#D8D8D8]/60 rounded-full px-2 py-0.5 flex items-center gap-1 font-bold text-[#8A8989]">
            <InfoIcon size={11} /> {totalAmenity}
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-[#F2EFEA] rounded-lg border border-[#D8D8D8] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-x-1.5 px-3 py-1.5 bg-[#E8E4DD]/40 border-b border-[#D8D8D8]">
          <div className="col-span-1 text-[9px] font-black text-[#8A8989] text-center uppercase">No.</div>
          <div className="col-span-3 text-[9px] font-black text-[#4C4A4B] uppercase">Type (Structure)</div>
          <div className="col-span-1 text-[9px] font-black text-[#4C4A4B] text-center uppercase leading-none">Unit<br/>Size</div>
          <div className="col-span-1 text-[9px] font-black text-[#4C4A4B] text-center uppercase leading-none">Foot<br/>print</div>
          <div className="col-span-1 text-[9px] font-black text-[#4C4A4B] text-center uppercase">Qty</div>
          <div className="col-span-1 text-[9px] font-black text-[#4C4A4B] text-center uppercase leading-none">Villa<br/>(B)</div>
          <div className="col-span-1 text-[9px] font-black text-[#4C4A4B] text-center uppercase leading-none">FF&E<br/>(B)</div>
          <div className="col-span-1 text-[9px] font-black text-[#4C4A4B] text-center uppercase leading-none">Unit<br/>Cost</div>
          <div className="col-span-1 text-[9px] font-black text-[#4C4A4B] text-center uppercase">Total</div>
          <div className="col-span-1 text-[9px] font-black text-[#4C4A4B] text-center uppercase">Category</div>
        </div>
        
        {/* Table Body */}
        <div className="bg-white divide-y divide-[#D8D8D8]/55">
          {mix.map((item, idx) => {
            const unitTotal = (parseFloat(item.villaCost) || 0) + (parseFloat(item.ffeCost) || 0);
            const lineTotal = ((parseFloat(item.qty) || 0) * unitTotal);
            return (
              <div key={idx} className="grid grid-cols-12 gap-x-1.5 px-3 py-1 items-center hover:bg-[#FAF9F7] transition-colors">
                <div className="col-span-1 text-[10px] font-semibold text-[#8A8989] text-center">{idx + 1}</div>
                <div className="col-span-3">
                  <input
                    disabled={isLocked}
                    type="text"
                    value={item.type || ""}
                    onChange={(e) => {
                      const newMix = [...mix];
                      newMix[idx] = { ...item, type: e.target.value };
                      onChange(newMix);
                    }}
                    className="w-full bg-transparent border-0 text-[10px] font-bold text-[#1E2F31] focus:ring-0 p-0 outline-none hover:bg-black/5 rounded px-1 -mx-1"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    disabled={isLocked}
                    type="text"
                    value={item.unitSize || ""}
                    onChange={(e) => {
                      const newMix = [...mix];
                      newMix[idx] = { ...item, unitSize: e.target.value };
                      onChange(newMix);
                    }}
                    className="w-full bg-transparent text-center border-0 text-[10px] font-medium text-[#4C4A4B] focus:ring-0 p-0 outline-none hover:bg-black/5 rounded"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    disabled={isLocked}
                    type="text"
                    value={item.footprint || ""}
                    onChange={(e) => {
                      const newMix = [...mix];
                      newMix[idx] = { ...item, footprint: e.target.value };
                      onChange(newMix);
                    }}
                    className="w-full bg-transparent text-center border-0 text-[10px] font-medium text-[#4C4A4B] focus:ring-0 p-0 outline-none hover:bg-black/5 rounded"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <FormattedInput
                    disabled={isLocked}
                    val={item.qty}
                    set={(v) => {
                      const newMix = [...mix];
                      newMix[idx] = { ...item, qty: parseFloat(v) || 0 };
                      onChange(newMix);
                    }}
                    className="w-full max-w-[32px] text-center py-0.5 px-1 text-[10px] bg-[#FAF9F7] border border-[#D8D8D8] rounded focus:ring-1 focus:ring-[#1C6048] outline-none font-bold text-[#1E2F31]"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <FormattedInput
                    disabled={isLocked}
                    val={item.villaCost}
                    set={(v) => {
                      const newMix = [...mix];
                      newMix[idx] = { ...item, villaCost: parseFloat(v) || 0 };
                      onChange(newMix);
                    }}
                    className="w-full max-w-[38px] text-center p-0.5 text-[10px] bg-transparent border-none rounded focus:ring-1 focus:ring-[#1E2F31] outline-none font-bold text-[#4C4A4B] hover:bg-black/5"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <FormattedInput
                    disabled={isLocked}
                    val={item.ffeCost}
                    set={(v) => {
                      const newMix = [...mix];
                      newMix[idx] = { ...item, ffeCost: parseFloat(v) || 0 };
                      onChange(newMix);
                    }}
                    className="w-full max-w-[38px] text-center p-0.5 text-[10px] bg-transparent border-none rounded focus:ring-1 focus:ring-[#1E2F31] outline-none font-bold text-[#4C4A4B] hover:bg-black/5"
                  />
                </div>
                <div className="col-span-1 text-[10px] font-bold text-[#4C4A4B] text-center">
                  {formatNumber(unitTotal, 2)}
                </div>
                <div className="col-span-1 text-[10px] font-bold text-[#1E2F31] text-center">
                  {formatNumber(lineTotal, 2)}
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    disabled={isLocked}
                    onClick={() => {
                      const newMix = [...mix];
                      newMix[idx] = { ...item, isAccommodation: !item.isAccommodation };
                      onChange(newMix);
                    }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-extrabold whitespace-nowrap transition-colors border ${item.isAccommodation ? "bg-[#EAF3EF] text-[#1C6048] border-[#A8C7BA]/50" : "bg-[#F4F1ED] text-[#8A8989] border-[#D8D8D8]/50"}`}
                  >
                    {item.isAccommodation ? "ROOM" : "AMENITY"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Table Footer / Sumproducts */}
        <div className="grid grid-cols-12 gap-x-1.5 px-3 py-2 bg-[#F9F8F6] border-t border-[#D8D8D8] items-center">
          <div className="col-span-4 text-[9px] font-black text-[#4C4A4B] uppercase tracking-wider">Totals</div>
          <div className="col-span-1 text-[9px] font-black text-[#1C6048] text-center">{formatNumber(sumUnitSize, 0)} sqm</div>
          <div className="col-span-1 text-[9px] font-black text-[#1C6048] text-center">{formatNumber(sumFootprint, 0)} sqm</div>
          <div className="col-span-1 text-[10px] font-black text-[#4C4A4B] text-center">{totalQty}</div>
          <div className="col-span-1 text-[10px] font-black text-[#4C4A4B] text-center">{formatNumber(sumVilla, 2)}</div>
          <div className="col-span-1 text-[10px] font-black text-[#1C6048] text-center">{formatNumber(sumFfe, 2)}</div>
          <div className="col-span-1 text-[10px] font-black text-[#8A8989] text-center">-</div>
          <div className="col-span-1 text-[11px] font-black text-[#1E2F31] text-center">{formatNumber(sumTotal, 2)}</div>
          <div className="col-span-1"></div>
        </div>
      </div>
    </div>
  );
});
export const AssumptionDepreciationGroup = memo(
  ({ label, methodVal, lifeVal, setMethod, setLife, isLocked }) => (
    <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded">
      <label className="text-[10px] text-[#4C4A4B] font-bold">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#D8D8D8] rounded p-0.5">
          <button
            disabled={isLocked}
            onClick={() => setMethod("SL")}
            className={`px-2 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${methodVal === "SL" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
          >
            SL
          </button>
          <button
            disabled={isLocked}
            onClick={() => setMethod("DDB")}
            className={`px-2 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${methodVal === "DDB" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
          >
            DDB
          </button>
        </div>
        <div className="flex items-center gap-1">
          <FormattedInput
            disabled={isLocked}
            val={lifeVal}
            set={setLife}
            className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          />
          <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-4">
            Yrs
          </span>
        </div>
      </div>
    </div>
  ),
);
export const CHART_MARGINS_BAR = { top: 20, right: 0, left: 0, bottom: 0 };
export const CHART_MARGINS_LINE = { top: 40, right: 35, left: 20, bottom: 0 };
export const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid #D8D8D8",
  fontSize: "12px",
  color: "#1E2F31",
};
export const CHART_CURSOR_STYLE = { fill: "#F9F8F6" };
export const LEGEND_STYLE = { fontSize: "11px", paddingTop: "20px" };
export const TICK_STYLE = { fontSize: 10, fill: "#4C4A4B" };
export const PREM_MKT_PIE_DATA = [
  { name: "SES A & B", value: 18 },
  { name: "General / BPJS", value: 82 },
];
const formatInsuranceLabel = (val: any) => val.toFixed(2);
export const LINE_LABEL_STYLE = {
  position: "top",
  fill: "#4C4A4B",
  fontSize: 10,
  dy: -10,
  formatter: formatInsuranceLabel,
};
export const formatNumber = (val, decimals = 1) => {
  if (val === null || val === undefined) return "0";

  // 1. Clean and parse FIRST
  const num =
    typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);

  // 2. Then check if it's NaN or effectively zero
  if (isNaN(num) || Math.abs(num) < 1e-10) return "0";

  // 3. Format
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(num));
  return num < 0 ? `(${formatted})` : formatted;
};
export const formatCurrency = (val) => {
  if (val === null || val === undefined) return "Rp 0 B";

  const num =
    typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);

  if (isNaN(num) || Math.abs(num) < 1e-10) return "Rp 0 B";

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(num));
  return num < 0 ? `(Rp ${formatted} B)` : `Rp ${formatted} B`;
};

export const parseArea = (str: any) => {
  if (!str || typeof str !== 'string') return 0;
  const parts = str.split('x').map((s: any) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * parts[1];
  }
  return 0;
};

export const useMonthlyColumns = (annualData, viewResolution = "annual") => {
  const [expandedYears, setExpandedYears] = useState({});

  const toggleYear = useCallback((yearIndex) => {
    setExpandedYears((prev) => ({
      ...prev,
      [yearIndex]: !prev[yearIndex],
    }));
  }, []);

  const columns = useMemo(() => {
    if (!annualData) return [];

    const isMonthlyGlobal = viewResolution === "monthly";
    const cols = [];
    annualData.forEach((d, i) => {
      const yearKey = typeof d.year !== "undefined" ? String(d.year) : String(i);
      const isExpanded = isMonthlyGlobal || expandedYears[yearKey];
      
      if (!isMonthlyGlobal) {
        cols.push({ ...d, _isAnnualTotal: true, isExpanded: isExpanded, colType: "year", defaultLabel: d.year, yearKey });
      }

      if (isExpanded) {
        let flowKeys;
        if (i < 5) {
          flowKeys = (item) => item.cumulativeCapex || 0;
        } else {
          flowKeys = [
            "ipRevenue",
            "opRevenue",
            "cogs",
            "sgAndA",
            "ebitda",
            "debtService",
            "netCashFlow",
            "maintenanceCapex",
            "tenantRevenue",
            "landLease",
            "dividends",
          ];
        }

        const flow = Array.isArray(flowKeys)
          ? flowKeys.reduce((sum, key) => sum + (d[key] || 0), 0)
          : flowKeys(d);
        for (let m = 1; m <= 12; m++) {
          const monthLabel = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
          let label = monthLabel;
          if (isMonthlyGlobal && d.year) {
             const trueYear = 2025 + parseInt(String(d.year).replace(/\D/g, "") || "1");
             label = `${monthLabel} ${trueYear.toString().slice(-2)}`;
          }
          const monthData = { ...d, _isMonth: true, monthIndex: m, colType: "month", defaultLabel: label, yearKey };
          Object.keys(d).forEach((k) => {
            if (typeof d[k] === "number" && !k.toLowerCase().includes("year")) {
              if (d.monthly && d.monthly[k] && typeof d.monthly[k][m - 1] === "number") {
                monthData[k] = d.monthly[k][m - 1];
              } else if (
                k === "cumulativeFCF" ||
                k === "cumulativeCapex" ||
                k === "cumulativeRevenue"
              ) {
                const startBase = d[k] - flow;
                monthData[k] = startBase + (flow / 12) * m;
              } else {
                monthData[k] = d[k] / 12;
              }
            }
          });
          cols.push(monthData);
        }
      }
    });
    return cols;
  }, [annualData, expandedYears, viewResolution]);

  return { columns, expandedYears, toggleYear };
};
