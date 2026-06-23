import { Microscope } from "lucide-react";
import React, { memo } from "react";
export const AIMicroscopeIcon = memo(({ size = 14, className = "" }) => {
  const badgeFontSize = Math.max(7, size * 0.35);
  const rightOffset = size > 24 ? "-right-3" : "-right-2";
  const topOffset = size > 24 ? "-top-2" : "-top-1";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <Microscope size={size} />
      <span
        className={`absolute ${topOffset} ${rightOffset} bg-gradient-to-br from-[#1C6048] to-[#1E2F31] text-white font-black px-1 rounded-sm shadow-sm leading-none border border-white/50`}
        style={{ fontSize: badgeFontSize }}
      >
        AI
      </span>
    </div>
  );
});
export const CustomBedIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Heartbeat Monitor */}
    <rect x="34" y="10" width="20" height="14" rx="2" />
    <polyline points="36,17 40,17 43,12 46,22 49,17 52,17" />
    {/* Bed Frame & Headboard */}
    <line x1="10" y1="16" x2="10" y2="52" />
    <line x1="10" y1="44" x2="56" y2="44" />
    <line x1="56" y1="44" x2="56" y2="52" />
    {/* Patient Head & Blanket */}
    <circle cx="20" cy="26" r="5" />
    <path d="M 10 34 L 26 34 C 30 26 34 26 38 34 L 56 34 L 56 44" />
  </svg>
));
export const CustomScaleIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Base & Stand */}
    <line x1="16" y1="56" x2="48" y2="56" />
    <line x1="22" y1="50" x2="42" y2="50" />
    <line x1="32" y1="50" x2="32" y2="10" />
    <circle cx="32" cy="10" r="3" />
    {/* Angled Crossbar */}
    <line x1="10" y1="16" x2="54" y2="28" />
    {/* Left Strings & Pan */}
    <path d="M 10 16 L 4 36 L 16 36 Z" />
    <path d="M 4 36 C 4 46 16 46 16 36" />
    {/* Right Strings & Pan */}
    <path d="M 54 28 L 48 48 L 60 48 Z" />
    <path d="M 48 48 C 48 58 60 58 60 48" />
  </svg>
));
export const CustomKnotIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Continuous overlapping path simulating a tangled thread/yarn with a loose end */}
    <path d="M 12 52 C 16 44 24 36 20 28 C 16 16 32 8 44 16 C 56 24 52 44 40 52 C 28 60 12 48 16 32 C 20 16 40 12 52 24 C 64 36 56 56 44 60 C 32 64 20 52 24 40 C 28 28 44 28 48 40 C 52 52 36 60 28 52" />
  </svg>
));
export const CustomStethoscopeIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Earpieces (Y-Split) */}
    <path d="M 10 8 C 10 16 16 20 16 26" />
    <path d="M 22 8 C 22 16 16 20 16 26" />
    <line x1="7" y1="8" x2="13" y2="8" />
    <line x1="19" y1="8" x2="25" y2="8" />
    {/* Left Arm & U-Bend */}
    <line x1="16" y1="26" x2="16" y2="44" />
    <path d="M 16 44 C 16 60 48 60 48 44" />
    {/* Right Arm & Chestpiece */}
    <line x1="48" y1="44" x2="48" y2="26" />
    <circle cx="48" cy="18" r="8" />
    <circle cx="48" cy="18" r="3" />
    {/* Medical Cross Circle (Lowered and Centered) */}
    <circle cx="32" cy="38" r="6" />
    <line x1="32" y1="35" x2="32" y2="41" />
    <line x1="29" y1="38" x2="35" y2="38" />
  </svg>
));
export const CustomPhysicianIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Simple Head */}
    <circle cx="32" cy="16" r="10" />
    {/* Simple Body Outline */}
    <path d="M 12 56 C 12 40 20 32 32 32 C 44 32 52 40 52 56" />

    {/* Asymmetric Stethoscope Drape */}
    {/* Left Side: Earpieces hanging down */}
    <path d="M 25 33.5 C 22 37 22 43 23 48" />
    <path d="M 19 53 L 23 48 L 27 53" />

    {/* Right Side: Chestpiece hanging down */}
    <path d="M 39 33.5 C 42 37 42 43 41 50" />
    <circle cx="41" cy="53" r="3" />
  </svg>
));
export const CustomPopulationIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Row 1 (Top) - 3 people */}
    {[22, 32, 42].map((x) => (
      <g key={`r1-${x}`}>
        <path
          d={`M ${x - 5.5} 27 C ${x - 5.5} 19 ${x + 5.5} 19 ${x + 5.5} 27`}
          fill="#EFEBE7"
        />
        <circle cx={x} cy="14" r="3.5" fill="#EFEBE7" />
      </g>
    ))}
    {/* Row 2 (Middle) - 4 people */}
    {[17, 27, 37, 47].map((x) => (
      <g key={`r2-${x}`}>
        <path
          d={`M ${x - 5.5} 43 C ${x - 5.5} 35 ${x + 5.5} 35 ${x + 5.5} 43`}
          fill="#EFEBE7"
        />
        <circle cx={x} cy="30" r="3.5" fill="#EFEBE7" />
      </g>
    ))}
    {/* Row 3 (Bottom) - 5 people */}
    {[12, 22, 32, 42, 52].map((x) => (
      <g key={`r3-${x}`}>
        <path
          d={`M ${x - 5.5} 59 C ${x - 5.5} 51 ${x + 5.5} 51 ${x + 5.5} 59`}
          fill="#EFEBE7"
        />
        <circle cx={x} cy="46" r="3.5" fill="#EFEBE7" />
      </g>
    ))}
  </svg>
));
export const CustomDiagnosticsIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Floor Base */}
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />
    <rect
      x="18"
      y="56"
      width="28"
      height="4"
      fill="currentColor"
      stroke="none"
    />

    {/* Outer Scanner Body (Tall Pill Shape) */}
    <rect x="10" y="4" width="44" height="52" rx="20" strokeWidth="2.5" />

    {/* High-Tech Ticked Ring Array */}
    <circle
      cx="32"
      cy="26"
      r="16"
      strokeDasharray="1.5 2.5"
      strokeWidth="2"
      opacity="0.6"
    />
    <circle cx="32" cy="26" r="13" />

    {/* Targeting Crosshair */}
    <line x1="12" y1="26" x2="52" y2="26" strokeDasharray="2 3" opacity="0.4" />
    <line x1="32" y1="6" x2="32" y2="46" strokeDasharray="2 3" opacity="0.4" />
    <circle cx="32" cy="26" r="3" />

    {/* Bed Pedestal (Solid silhouette) */}
    <path
      d="M 27.5 40 L 36.5 40 L 40 60 L 24 60 Z"
      fill="currentColor"
      stroke="none"
      opacity="0.9"
    />

    {/* Sliding Patient Bed (Perspective) */}
    <path
      d="M 23 34 L 41 34 L 44 40 L 20 40 Z"
      fill="#F9F8F6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="miter"
    />

    {/* Bed Surface Lines */}
    <line x1="22" y1="36" x2="42" y2="36" strokeWidth="1.5" />
    <line x1="21" y1="38" x2="43" y2="38" strokeWidth="1.5" />

    {/* Base Vents / Indentations */}
    <line
      x1="14"
      y1="42"
      x2="14"
      y2="48"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="50"
      y1="42"
      x2="50"
      y2="48"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
));
export const CustomLinacIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Floor */}
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />
    {/* Base and Pillar */}
    <path d="M 40 60 V 8 C 40 4 44 2 48 2 C 52 2 56 4 56 8 V 60" />
    {/* Thick C-Arm Outline (drawn behind to merge nicely) */}
    <path
      d="M 48 16 C 48 4 34 4 22 4 H 12 V 30 H 26 V 16 C 32 16 36 20 36 28"
      fill="#E8EFEA"
    />
    {/* Rotating Joint */}
    <circle cx="48" cy="28" r="12" fill="#E8EFEA" />
    <circle cx="48" cy="28" r="4" fill="currentColor" />
    <circle cx="48" cy="28" r="8" strokeDasharray="2 4" opacity="0.5" />
    {/* Collimator / Head */}
    <path d="M 12 30 H 26 L 22 42 H 16 Z" fill="#E8EFEA" />
    <path d="M 16 42 L 17 46 H 21 L 22 42" fill="currentColor" />
    {/* Radiation Beams */}
    <path
      d="M 19 46 L 13 54 M 19 46 L 25 54 M 19 46 V 54"
      strokeDasharray="2 3"
      opacity="0.6"
      strokeWidth="1.5"
    />
    {/* Patient Bed */}
    <rect
      x="6"
      y="54"
      width="34"
      height="3"
      rx="1"
      fill="currentColor"
      stroke="none"
    />
    <rect x="18" y="57" width="10" height="3" />
  </svg>
));
export const CustomOverseasIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />
    {/* Bed Pillar */}
    <rect x="8" y="20" width="10" height="40" rx="2" />
    {/* Bed Arm & Surface */}
    <path d="M 18 42 H 28" strokeWidth="3" />
    <circle cx="28" cy="42" r="4" />
    <path d="M 28 46 V 50 H 42" strokeWidth="3" />
    <rect
      x="18"
      y="48"
      width="24"
      height="2"
      fill="currentColor"
      stroke="none"
    />
    {/* Robot Base */}
    <path d="M 42 60 V 46 C 42 38 52 38 52 46 V 60" />
    {/* Robot Arm Joints */}
    <circle cx="47" cy="40" r="5" />
    <path d="M 47 40 L 40 26" strokeWidth="4" />
    <circle cx="40" cy="26" r="4" />
    <path d="M 40 26 L 34 22" strokeWidth="4" />
    {/* Accelerator Head */}
    <polygon
      points="26,14 36,20 32,28 22,22"
      fill="#F9F8F6"
      stroke="currentColor"
      strokeLinejoin="miter"
    />
    <polygon points="22,22 32,28 30,32 20,26" fill="currentColor" />
    {/* Side Cabinet */}
    <rect x="54" y="34" width="8" height="26" rx="2" />
    <line x1="56" y1="42" x2="60" y2="42" strokeWidth="1.5" />
    <line x1="56" y1="46" x2="60" y2="46" strokeWidth="1.5" />
    <line x1="56" y1="50" x2="60" y2="50" strokeWidth="1.5" />
  </svg>
));
export const CustomPalliativeIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Floor */}
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />

    {/* IV Stand Base & Pole */}
    <line x1="48" y1="60" x2="56" y2="60" strokeWidth="3" />
    <circle cx="50" cy="58" r="2" fill="currentColor" stroke="none" />
    <circle cx="54" cy="58" r="2" fill="currentColor" stroke="none" />
    <line x1="52" y1="56" x2="52" y2="10" />
    <line x1="48" y1="10" x2="56" y2="10" />

    {/* IV Bag & Pump */}
    <rect x="50" y="14" width="4" height="6" rx="1" />
    <line x1="52" y1="10" x2="52" y2="14" strokeWidth="1" />
    <rect x="48" y="30" width="8" height="10" rx="1.5" fill="#F9F8F6" />
    <line x1="50" y1="33" x2="54" y2="33" strokeWidth="1" />
    <circle cx="50" cy="37" r="0.5" fill="currentColor" />
    <circle cx="52" cy="37" r="0.5" fill="currentColor" />
    <circle cx="54" cy="37" r="0.5" fill="currentColor" />

    {/* IV Tube */}
    <path d="M 52 20 C 48 26 48 30 52 30" strokeWidth="1.5" opacity="0.6" />
    <path d="M 48 36 C 42 44 38 38 34 36" strokeWidth="1.5" opacity="0.6" />

    {/* Recliner Base */}
    <line x1="22" y1="60" x2="34" y2="60" strokeWidth="3" />
    <circle cx="24" cy="58" r="2" fill="currentColor" stroke="none" />
    <circle cx="32" cy="58" r="2" fill="currentColor" stroke="none" />
    <rect x="24" y="46" width="8" height="10" rx="1" />
    <line x1="20" y1="46" x2="36" y2="46" strokeWidth="3" />

    {/* Recliner Seat & Leg Rest */}
    <path d="M 22 46 L 40 46 L 46 54" strokeWidth="6" strokeLinejoin="round" />
    {/* Recliner Backrest */}
    <path d="M 22 46 L 14 26" strokeWidth="6" strokeLinejoin="round" />

    {/* Armrest */}
    <path d="M 22 36 L 32 36 V 46" strokeWidth="2.5" />

    {/* Pillow / Headrest */}
    <circle cx="12" cy="24" r="3" fill="currentColor" />
  </svg>
));
export const CustomClipboardIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Background shadow/depth */}
    <rect
      x="18"
      y="16"
      width="32"
      height="42"
      rx="3"
      fill="#EFEBE7"
      stroke="none"
    />

    {/* Main Board */}
    <rect x="14" y="12" width="32" height="42" rx="3" fill="#F9F8F6" />

    {/* Top Clip Mechanism */}
    <path d="M 22 12 V 8 C 22 6.5 23.5 5 25 5 H 35 C 36.5 5 38 6.5 38 8 V 12" />
    <rect
      x="24"
      y="9"
      width="12"
      height="6"
      rx="1.5"
      fill="currentColor"
      stroke="none"
    />

    {/* Medical Cross */}
    <path d="M 28 22 H 32 M 30 20 V 24" strokeWidth="2.5" />

    {/* Checklist lines and boxes */}
    <rect x="20" y="30" width="4" height="4" rx="1" />
    <line x1="28" y1="32" x2="40" y2="32" strokeWidth="2" opacity="0.6" />

    <rect x="20" y="38" width="4" height="4" rx="1" />
    <line x1="28" y1="40" x2="40" y2="40" strokeWidth="2" opacity="0.6" />

    {/* Giant checkmark */}
    <path d="M 18 48 L 22 52 L 34 38" strokeWidth="3.5" />
  </svg>
));
