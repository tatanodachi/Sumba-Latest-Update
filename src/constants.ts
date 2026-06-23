
export const START_YEAR = 2026;
export const DEFAULT_END_YEAR = 2028;
export const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
export const INITIAL_GROUPS = [
  { 
    id: "capex", name: "1. Capex Setup (Development Budget)", start: 1, duration: 25, color: "#1E2F31", 
    tasks: [
      { id: "c1", name: "Land Acquisition & Zoning", start: 1, duration: 6 },
      { id: "c3", name: "Design & Planning Consultant", start: 3, duration: 8 },
      { id: "c2", name: "Licensing & Permits", start: 6, duration: 5 },
      { id: "c5", name: "Infrastructure & Enabling Works", start: 9, duration: 18 },
      { id: "c7", name: "Main Hospital Superstructure", start: 11, duration: 16 },
      { id: "c4", name: "FF&E and Interior Fit-Out", start: 20, duration: 6 },
      { id: "c8", name: "Medical Equipment (Asset Lease)", start: 22, duration: 4 },
      { id: "c6", name: "Pre-Opening & Operations Testing", start: 22, duration: 4 }
    ] 
  },
  { 
    id: "ops", name: "2. Commercial Operations", start: 26, duration: 1, color: "#1C6048", 
    tasks: [
      { id: "t13", name: "Commercial Opening", start: 26, duration: 1 }
    ] 
  },
];
export const LAND_ZONING = [
  { zone: "A1", desc: "Main Hospital Building", color: "#1E2F31" },
  { zone: "A2", desc: "Outpatient Clinic & Emergency", color: "#4A6E7D" },
  { zone: "B1", desc: "Diagnostic & Imaging Center", color: "#1C6048" },
  { zone: "B2", desc: "Radiotherapy Bunker", color: "#8B9D90" },
  { zone: "C1", desc: "Patient Wards & Recovery", color: "#9B8B70" },
  { zone: "C2", desc: "Staff Facilities & Admin", color: "#C05640" },
  { zone: "D1", desc: "Central Utilities & MEP", color: "#4C4A4B" },
];
export const getZoningItem = (idx) => {
  return LAND_ZONING[idx % LAND_ZONING.length];
};
export const generateTimelineMonths = (startYear, endYear) => {
  const durationMonths = (endYear - startYear + 1) * 12;
  const result = [];
  for (let i = 0; i < durationMonths; i++) {
    const monthIndex = i % 12;
    const year = startYear + Math.floor(i / 12);
    result.push({
      num: i + 1,
      name: `${MONTH_NAMES_SHORT[monthIndex]} '${year.toString().slice(-2)}`,
      year: year
    });
  }
  return result;
};

export const targetRegions = [];
export const activeRegions = [];

export const mapLocations = [
  // --- PROPOSED PROJECT ---
  {
    id: "vasanta",
    name: "Vasanta Eco-City Site",
    group: "Vasanta",
    desc: "Mixed-Use Development",
    lat: -9.475,
    lon: 120.189,
    color: "#1E3A8A",
    polygonCoords: [
      [-9.469879235, 120.185776123],
      [-9.471142029, 120.185421959],
      [-9.472096358, 120.186380387],
      [-9.473159118, 120.186508497],
      [-9.473950349, 120.186822544],
      [-9.474728088, 120.187132697],
      [-9.475358011, 120.18738518],
      [-9.475939528, 120.18761731],
      [-9.476559612, 120.187870875],
      [-9.477212898, 120.188129903],
      [-9.477853064, 120.188375298],
      [-9.478500022, 120.188634016],
      [-9.479197996, 120.189159036],
      [-9.479907771, 120.189679958],
      [-9.479096962, 120.192499978],
      [-9.478283208, 120.192396671],
      [-9.477463655, 120.192279852],
      [-9.476626803, 120.192045057],
      [-9.475869224, 120.191815352],
      [-9.475110238, 120.191579106],
      [-9.474363124, 120.191268511],
      [-9.473586262, 120.190876078],
      [-9.472879508, 120.190359684],
      [-9.472274718, 120.189737543],
      [-9.471549334, 120.188926019],
      [-9.470645474, 120.187568608],
    ],
  },

  // --- GENERAL NODES ---
  {
    id: "Soekarno-Hatta Airport",
    name: "Soekarno-Hatta Airport (CGK)",
    group: "Infrastructure",
    desc: "Primary National Transit Hub",
    query: "Bandar Udara Internasional Soekarno-Hatta",
    color: "#9b8b70", // Slate gray
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -6.1256,
    fallbackLon: 106.6558,
    fallbackRadius: 0.035,
  },
  {
    id: "Umbu Mehang Kunda Airport",
    name: "Umbu Mehang Kunda Airport (WGP)",
    group: "Infrastructure",
    desc: "Key Entry Point & Regional Hub",
    query: "Umbu Mehang Kunda Airport",
    color: "#9b8b70", // Slate gray
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -9.671389,
    fallbackLon: 120.306111,
    fallbackRadius: 0.015,
  },
  {
    id: "Tambolaka Airport",
    name: "Tambolaka Airport (TMC)",
    group: "Infrastructure",
    desc: "Sumba Barat Daya Gateway",
    query: "Tambolaka Airport",
    color: "#9b8b70",
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -9.4097,
    fallbackLon: 119.2443,
    fallbackRadius: 0.015,
  },
  {
    id: "El Tari Airport",
    name: "El Tari Airport (KOE)",
    group: "Infrastructure",
    desc: "NTT Provincial Transit Hub",
    query: "El Tari Airport",
    color: "#9b8b70",
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -10.1717,
    fallbackLon: 123.674,
    fallbackRadius: 0.015,
  },
  {
    id: "Komodo Airport",
    name: "Komodo Airport (LBJ)",
    group: "Infrastructure",
    desc: "Labuan Bajo Tourist Gateway",
    query: "Komodo Airport",
    color: "#9b8b70",
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -8.4869,
    fallbackLon: 119.8883,
    fallbackRadius: 0.015,
  },
  {
    id: "Ngurah Rai Airport",
    name: "Ngurah Rai Airport (DPS)",
    group: "Infrastructure",
    desc: "Bali Gateway & Key Sub-Hub",
    query: "Bandara Internasional Ngurah Rai",
    color: "#9b8b70",
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -8.7481,
    fallbackLon: 115.1672,
    fallbackRadius: 0.015,
  },
];

const regionGroups = {};

export const getGroupColor = (group) => "#9B8B70";

export const generateFallbackGeoJSON = (centerLat, centerLon, radiusDegrees) => {
  const points = 32;
  const coords = [];
  for (let i = 0; i < points; i++) {
    const angle = ((i * 360) / points) * (Math.PI / 180);
    const lat = centerLat + radiusDegrees * Math.cos(angle);
    const lon =
      centerLon +
      (radiusDegrees * Math.sin(angle)) / Math.cos((centerLat * Math.PI) / 180);
    coords.push([lon, lat]);
  }
  coords.push(coords[0]);
  return { type: "Polygon", coordinates: [coords] };
};

// === FLIGHT CONNECTIVITY PATHS ENGINE ===
export const airportCoordinates = {
  "Umbu Mehang Kunda Airport": {
    name: "Umbu Mehang Kunda Airport (WGP)",
    lat: -9.671389,
    lon: 120.306111,
  },
  "Tambolaka Airport": {
    name: "Tambolaka Airport (TMC)",
    lat: -9.4097,
    lon: 119.2443,
  },
  "El Tari Airport": {
    name: "El Tari Airport (KOE)",
    lat: -10.1717,
    lon: 123.674,
  },
  "Soekarno-Hatta Airport": {
    name: "Soekarno-Hatta Airport (CGK)",
    lat: -6.1256,
    lon: 106.6558,
  },
  "Komodo Airport": {
    name: "Komodo Airport (LBJ)",
    lat: -8.4869,
    lon: 119.8883,
  },
  "Ngurah Rai Airport": {
    name: "Ngurah Rai Airport (DPS)",
    lat: -8.7481,
    lon: 115.1672,
  },
};

export const flightRoutes = [
  {
    id: "WGP-KOE",
    name: "Waingapu (WGP) ↔ Kupang (KOE)",
    desc: "Daily regional route essential for East Sumba referral and administrative transit to the provincial capital.",
    type: "Direct",
    carrier: "Wings Air",
    equipment: "ATR 72-600",
    duration: "45 mins",
    schedule: "Daily at 08:30 WITA",
    color: "#1C6048",
    legs: [{ from: "Umbu Mehang Kunda Airport", to: "El Tari Airport" }],
  },
  {
    id: "WGP-TMC",
    name: "Waingapu (WGP) ↔ Tambolaka (TMC)",
    desc: "Intra-island connecting route bridging East Sumba and West Sumba regional boundaries.",
    type: "Direct",
    carrier: "Wings Air / Trans Sumba",
    equipment: "ATR 72-600 (Seasonal)",
    duration: "30 mins",
    schedule: "Tue, Thu, Sat at 11:15 WITA",
    color: "#99B6AA",
    legs: [{ from: "Umbu Mehang Kunda Airport", to: "Tambolaka Airport" }],
  },
  {
    id: "WGP-KOE-CGK",
    name: "Waingapu (WGP) ↔ Jakarta (CGK) via Kupang",
    desc: "Multi-leg luxury transport and capital commute network linking East Sumba guests directly to national level airports.",
    type: "1-Stop Transit",
    carrier: "Wings Air + Batik Air",
    equipment: "ATR 72-600 + Boeing 737-800",
    duration: "4h 15m total (incl. 1h layover)",
    schedule: "Daily departures matching referral slots",
    color: "#E29A5C",
    legs: [
      { from: "Umbu Mehang Kunda Airport", to: "El Tari Airport" },
      { from: "El Tari Airport", to: "Soekarno-Hatta Airport" },
    ],
  },
  {
    id: "WGP-DPS-CGK",
    name: "Waingapu (WGP) ↔ Jakarta (CGK) via Bali",
    desc: "Major tourist and commercial transit corridor connecting East Sumba to Bali before flying into Jakarta.",
    type: "1-Stop Transit",
    carrier: "Nam Air / Wings Air + Citilink / Garuda",
    equipment: "Boeing 737-500 + Airbus A320",
    duration: "4h 30m total",
    schedule: "Daily departures at 11:45 WITA",
    color: "#A95C3E",
    legs: [
      { from: "Umbu Mehang Kunda Airport", to: "Ngurah Rai Airport" },
      { from: "Ngurah Rai Airport", to: "Soekarno-Hatta Airport" },
    ],
  },
  {
    id: "WGP-KOE-LBJ",
    name: "Waingapu (WGP) ↔ Labuan Bajo (LBJ) via Kupang",
    desc: "Key logistics and emergency guest service channel linking Sumba to Flores resort clusters.",
    type: "1-Stop Transit",
    carrier: "Wings Air + Citilink",
    equipment: "ATR 72-600 + ATR 72-600",
    duration: "3h 45m total",
    schedule: "Mon, Wed, Fri departures",
    color: "#8B5CF6",
    legs: [
      { from: "Umbu Mehang Kunda Airport", to: "El Tari Airport" },
      { from: "El Tari Airport", to: "Komodo Airport" },
    ],
  },
];

export const getArcPoints = (startLat, startLon, endLat, endLon, numPoints = 60) => {
  const points = [];
  const midLat = (startLat + endLat) / 2;
  const midLon = (startLon + endLon) / 2;

  const dLat = endLat - startLat;
  const dLon = endLon - startLon;

  // Calculate perpendicular vector to add elegant curved offset
  const normalLat = -dLon * 0.15;
  const normalLon = dLat * 0.15;

  const controlLat = midLat + normalLat;
  const controlLon = midLon + normalLon;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat =
      (1 - t) * (1 - t) * startLat +
      2 * (1 - t) * t * controlLat +
      t * t * endLat;
    const lon =
      (1 - t) * (1 - t) * startLon +
      2 * (1 - t) * t * controlLon +
      t * t * endLon;
    points.push([lat, lon]);
  }
  return points;
};
