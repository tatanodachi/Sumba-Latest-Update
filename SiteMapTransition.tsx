import React, { useState, useEffect, useRef, memo } from "react";
import { 
  Building, Map, Focus, Activity, 
  MapPin, HeartPulse, Cross, Leaf, 
  ActivitySquare, ShieldPlus, BedDouble, CheckCircle2, Pencil,
  Plane, Anchor, Zap, Droplets, ArrowRight, X, Maximize2, Minimize2, Map as MapIcon
} from "lucide-react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";


// === INTERACTIVE MAP CONSTANTS ===
const targetRegions = [];
const activeRegions = [];

const mapLocations = [
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

const getGroupColor = (group) => "#9B8B70";

const generateFallbackGeoJSON = (centerLat, centerLon, radiusDegrees) => {
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
const airportCoordinates = {
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

const flightRoutes = [
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

const getArcPoints = (startLat, startLon, endLat, endLon, numPoints = 60) => {
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

const InteractiveDemographicMap = memo(() => {
  const [leafletReady, setLeafletReady] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const viewMode = "admin";
  const [regionsSectionExpanded, setRegionsSectionExpanded] = useState(true);
  const [poiSectionExpanded, setPoiSectionExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedPoiGroups, setExpandedPoiGroups] = useState({
    Vasanta: false,
    General: false,
    Infrastructure: false,
  });
  const [expandedSubGroups, setExpandedSubGroups] = useState({
    "Class A": false,
  });
  const [showRegionLabels, setShowRegionLabels] = useState(false);
  const [activePOIs, setActivePOIs] = useState(mapLocations.map((l) => l.id));
  const [loadingStatus, setLoadingStatus] = useState({
    active: true,
    text: "Initializing...",
    isError: false,
  });
  const [regionFetchStatuses, setRegionFetchStatuses] = useState({});
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const mapRef = useRef(null);
  const regionsLayersRef = useRef({});
  const geoJsonCacheRef = useRef({});
  const hoverTooltipRef = useRef(null);
  const poiGroupRef = useRef(null);
  const poiLayersRef = useRef({});
  const poiMarkersRef = useRef({});
  const isHoveringPoi = useRef(false);
  const activeClickedPoiRef = useRef(null);
  const measureStateRef = useRef({
    points: [],
    line: null,
    dynamicLine: null,
    tooltip: null,
    markers: [],
  });

  // --- AIR CONNECTIVITY CONTROL STATES ---
  const [mapTab, setMapTab] = useState("layers"); // "layers" or "flights"
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [isMapSelection, setIsMapSelection] = useState(false);
  const [selectedFlightLatLng, setSelectedFlightLatLng] = useState<any>(null);
  const [showFlightRoutes, setShowFlightRoutes] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1.5); // Default to 1.5x
  const flightLayerGroupRef = useRef(null);

  // Sync route visibility switch with tab active status (Option 3C)
  useEffect(() => {
    if (mapTab === "flights") {
      setShowFlightRoutes(true);
    } else {
      setShowFlightRoutes(false);
    }
  }, [mapTab]);

  // Synchronize dynamic flights overlay and marker tracking animations on the map
  useEffect(() => {
    if (
      !leafletReady ||
      !isMapReady ||
      !mapRef.current ||
      !flightLayerGroupRef.current
    )
      return;
    const L = window.L;
    const map = mapRef.current;
    const group = flightLayerGroupRef.current;

    // 1. Clear any previous polylines/markers
    group.clearLayers();

    if (!showFlightRoutes) {
      return;
    }

    // 2. Determine selected route and coordinates
    const selectedFlight = selectedFlightId
      ? flightRoutes.find((f) => f.id === selectedFlightId)
      : null;

    // Calculate active coords sequence
    const selectedPathCoords = [];
    if (selectedFlight) {
      selectedFlight.legs.forEach((leg) => {
        const fromCoord = airportCoordinates[leg.from];
        const toCoord = airportCoordinates[leg.to];
        if (fromCoord && toCoord) {
          const points = getArcPoints(
            fromCoord.lat,
            fromCoord.lon,
            toCoord.lat,
            toCoord.lon,
            60,
          );
          selectedPathCoords.push(...points);
        }
      });
    }

    // 3. Draw entire flight network with selection prominence
    const hasSelection = !!selectedFlightId;
    flightRoutes.forEach((route) => {
      const isSelected = route.id === selectedFlightId;
      const color = isSelected ? "#1C6048" : "#9B8B70";
      // Prominence styling: active selected route is thick, other routes are faded out when something is selected.
      // If nothing is selected, we render them uniformly at a moderate weight.
      const weight = isSelected ? 3.5 : hasSelection ? 1.2 : 2.0;
      const opacity = isSelected ? 0.95 : hasSelection ? 0.2 : 0.65;

      route.legs.forEach((leg) => {
        const fromCoord = airportCoordinates[leg.from];
        const toCoord = airportCoordinates[leg.to];
        if (fromCoord && toCoord) {
          const arcCoords = getArcPoints(
            fromCoord.lat,
            fromCoord.lon,
            toCoord.lat,
            toCoord.lon,
            45,
          );
          const polyline = L.polyline(arcCoords, {
            color: color,
            weight: weight,
            opacity: opacity,
            dashArray: isSelected ? "3, 6" : undefined,
            pane: "flightsPane",
            className: "cursor-pointer",
          }).addTo(group);

          polyline.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            const isSelectedNow = selectedFlightId === route.id;
            setSelectedFlightId(isSelectedNow ? null : route.id);
            setIsMapSelection(isSelectedNow ? false : true);
            setSelectedFlightLatLng(isSelectedNow ? null : e.latlng);
            if (!isSelectedNow) {
              setShowFlightRoutes(true);
            }
          });
        }
      });
    });

    // 3b. Singular Selected Route Tooltip overlay centered directly at the click coordinates
    if (selectedFlight && selectedFlightLatLng && isMapSelection) {
      L.tooltip({
        className: "custom-tooltip selected-route-tooltip",
        permanent: true,
        direction: "top",
        offset: [0, -10],
      })
        .setLatLng(selectedFlightLatLng)
        .setContent(
          `<div style="font-family: inherit; font-size: 11px; padding: 4px 6px;">
          <b style="color:#1C6048">${selectedFlight.name}</b><br/>
          <span style="color:#666">Carrier: ${selectedFlight.carrier} (${selectedFlight.equipment})</span><br/>
          <span style="color:#888">Duration: ${selectedFlight.duration}</span>
        </div>`,
        )
        .addTo(group);
    }

    // 4. Set map viewport to track bounds dynamically
    const bounds = L.latLngBounds([]);
    if (selectedFlight && selectedPathCoords.length > 0) {
      selectedPathCoords.forEach((c) => bounds.extend(c));
    } else {
      Object.values(airportCoordinates).forEach((c) =>
        bounds.extend([c.lat, c.lon]),
      );
    }

    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [35, 35],
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }

    // 5. Selected Route Progressive Drawing Animation (A1 Hybrid)
    if (selectedFlight && selectedPathCoords.length > 0 && !isMapSelection) {
      const activeLine = L.polyline([selectedPathCoords[0]], {
        color: "#1C6048",
        weight: 4.5,
        opacity: 0.95,
        pane: "flightsPane",
      }).addTo(group);

      activeLine.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; padding: 4px 6px;">
          <b style="color:#1C6048">Active Tracking | FLIGHT ${selectedFlight.id}</b><br/>
          <span style="color:#444">${selectedFlight.carrier} • ${selectedFlight.equipment}</span>
        </div>`,
        { className: "custom-tooltip", direction: "top", offset: [0, -8] },
      );

      // Create a subtle glowing anchor/tip marker to lead the progressive line draw
      const pulseIcon = L.divIcon({
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 14px; height: 14px;">
          <span class="relative flex h-3.5 w-3.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1C6048] opacity-60"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-[#1C6048] border-2 border-[#FAF9F7] shadow-sm"></span>
          </span>
        </div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const leadMarker = L.marker(selectedPathCoords[0], {
        icon: pulseIcon,
        pane: "markersPane",
      }).addTo(group);

      let currentStepIndex = 0;
      let animationIntervalId = null;

      const refreshLineStep = () => {
        const activeCoords = selectedPathCoords.slice(0, currentStepIndex + 1);
        activeLine.setLatLngs(activeCoords);
        if (selectedPathCoords[currentStepIndex]) {
          leadMarker.setLatLng(selectedPathCoords[currentStepIndex]);
        }
      };

      // Perform initial render
      refreshLineStep();

      if (isAnimating) {
        const stepRateMs = Math.round(90 / animationSpeed);
        animationIntervalId = setInterval(() => {
          currentStepIndex = (currentStepIndex + 1) % selectedPathCoords.length;
          refreshLineStep();
        }, stepRateMs);
      }

      return () => {
        if (animationIntervalId) clearInterval(animationIntervalId);
      };
    }
  }, [
    leafletReady,
    isMapReady,
    selectedFlightId,
    isAnimating,
    animationSpeed,
    showFlightRoutes,
    isMapSelection,
    selectedFlightLatLng,
  ]);

  useEffect(() => {
    if (window.L && window.L.GestureHandling) {
      setLeafletReady(true);
      return;
    }

    const loadGestureHandling = () => {
      const ghCSS = document.createElement("link");
      ghCSS.rel = "stylesheet";
      ghCSS.href =
        "https://unpkg.com/leaflet-gesture-handling@1.2.2/dist/leaflet-gesture-handling.min.css";
      document.head.appendChild(ghCSS);

      const ghJS = document.createElement("script");
      ghJS.src =
        "https://unpkg.com/leaflet-gesture-handling@1.2.2/dist/leaflet-gesture-handling.min.js";
      ghJS.onload = () => setLeafletReady(true);
      document.body.appendChild(ghJS);
    };

    if (window.L) {
      loadGestureHandling();
      return;
    }

    const leafletCSS = document.createElement("link");
    leafletCSS.rel = "stylesheet";
    leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(leafletCSS);

    const leafletJS = document.createElement("script");
    leafletJS.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletJS.onload = loadGestureHandling;
    document.body.appendChild(leafletJS);
  }, []);

  useEffect(() => {
    if (!leafletReady || mapRef.current) return;
    const L = window.L;

    // SAFEGUARD: Wipe dead ghost layers so they don't persist across React 18 remounts
    regionsLayersRef.current = {};
    geoJsonCacheRef.current = {};

    // SAFEGUARD: Clear residual map IDs
    const container = document.getElementById("demographics-map");
    if (container && container._leaflet_id) {
      container._leaflet_id = null;
    }

    const map = L.map("demographics-map", {
      zoomControl: false,
      gestureHandling: true,
    }).setView([-9.475, 120.189], 14);
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    map.createPane("labelsPane");
    map.getPane("labelsPane").style.zIndex = 405;
    map.createPane("ringsPane");
    map.getPane("ringsPane").style.zIndex = 410;
    map.createPane("flightsPane");
    map.getPane("flightsPane").style.zIndex = 415;
    map.createPane("markersPane");
    map.getPane("markersPane").style.zIndex = 420;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, attribution: "&copy; CARTO" },
    ).addTo(map);

    hoverTooltipRef.current = L.tooltip({
      className: "custom-tooltip",
      direction: "top",
      offset: [0, -10],
    });
    poiGroupRef.current = L.layerGroup().addTo(map);
    flightLayerGroupRef.current = L.layerGroup().addTo(map);

    map.on("click", () => {
      if (activeClickedPoiRef.current) {
        const prevId = activeClickedPoiRef.current;
        activeClickedPoiRef.current = null;
        handlePoiHover(prevId, false);
      }
      setSelectedFlightId(null);
      setIsMapSelection(false);
      setSelectedFlightLatLng(null);
    });

    mapRef.current = map;
    initPOIs(map);
    setIsMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletReady]);

  const setupLayerInteractions = (layer, region, mapInstance) => {
    let lastLatLng = null;

    if (isHoveringPoi.current) return;
    // 1. Permanently bind the static text to the center of the region
    layer.bindTooltip(`<div class="static-region-name">${region.name}</div>`, {
      permanent: true,
      direction: "center",
      className: "static-region-tooltip",
      interactive: false,
      pane: "labelsPane",
    });

    // 2. Simple hover effect that respects the current View Mode colors
    layer.on("mouseover", (e) => {
      if (isHoveringPoi?.current) return;
      applyLayerStyle(layer, region.id, true, viewMode);
    });

    layer.on("mouseout", () => {
      applyLayerStyle(layer, region.id, false, viewMode);
    });

    // Hide the hover tooltip instantly if the user clicks to open the persistent popup
    layer.on("click", function () {
      clearTimeout(hoverTooltipRef.current._enterTimeout);
      if (mapInstance.hasLayer(hoverTooltipRef.current)) {
        mapInstance.removeLayer(hoverTooltipRef.current);
      }
    });

    layer.bindPopup(getTooltipContent(region, viewMode));
    regionsLayersRef.current[region.id] = layer;
    setRegionFetchStatuses((prev) => ({ ...prev, [region.id]: "success" }));
  };

  const syncRegionBorders = async (mapInstance, activeIds) => {
    const L = window.L;
    const missingIds = activeIds.filter(
      (id) =>
        !regionsLayersRef.current[id] && regionFetchStatuses[id] !== "loading",
    );

    if (missingIds.length === 0) {
      setLoadingStatus((prev) => ({ ...prev, active: false }));
      frameActiveRegions(mapInstance);
      return;
    }

    setRegionFetchStatuses((prev) => {
      const next = { ...prev };
      missingIds.forEach((id) => (next[id] = "loading"));
      return next;
    });

    for (const id of missingIds) {
      const region = targetRegions.find((r) => r.id === id);
      if (!region) continue;

      setLoadingStatus({
        active: true,
        text: `Loading boundary: ${region.name}`,
        isError: false,
      });

      try {
        // Fetch the REAL jagged polygon boundaries from OpenStreetMap
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region.query)}&polygon_geojson=1&format=json`,
        );
        if (!response.ok) throw new Error("API Error");
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("API Limit Reached");
        }

        let geojsonData;
        if (
          data &&
          data.length > 0 &&
          data[0].geojson &&
          data[0].geojson.type !== "Point" &&
          data[0].geojson.type !== "MultiPoint"
        ) {
          geojsonData = data[0].geojson;
        } else {
          geojsonData = generateFallbackGeoJSON(
            region.fallbackLat,
            region.fallbackLon,
            region.fallbackRadius,
          );
        }

        geoJsonCacheRef.current[id] = geojsonData;
        const layer = L.geoJSON(geojsonData, { className: "region-polygon" });

        // CRITICAL: We must save it to the cache and add it to the map physically!
        regionsLayersRef.current[id] = layer;
        layer.addTo(mapInstance);
        if (typeof setupLayerInteractions === "function") {
          setupLayerInteractions(layer, region, mapInstance);
        }
      } catch (error) {
        console.warn(
          `Failed to load real boundary for ${region.name}, using fallback.`,
        );

        // Draw the fallback circle boundary polyline
        const fallbackGeoJSON = generateFallbackGeoJSON(
          region.fallbackLat,
          region.fallbackLon,
          region.fallbackRadius,
        );
        geoJsonCacheRef.current[id] = fallbackGeoJSON;
        const layer = L.geoJSON(fallbackGeoJSON, {
          className: "region-polygon",
        });

        // Cache it and physically add it to the map
        regionsLayersRef.current[id] = layer;
        layer.addTo(mapInstance);
        if (typeof setupLayerInteractions === "function") {
          setupLayerInteractions(layer, region, mapInstance);
        }
      }

      // 300ms delay to keep the API happy without freezing your screen for 15 seconds
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setLoadingStatus((prev) => ({ ...prev, active: false }));
    frameActiveRegions(mapInstance);
  };

  const getTooltipContent = (region, mode) => {
    return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">${region.group}</span>`;
  };

  const applyLayerStyle = (layer, regionId, isHovered, mode) => {
    const region = targetRegions.find((r) => r.id === regionId);
    if (!region) return;

    const groupColor = getGroupColor(region.group);
    layer.setStyle({
      color: groupColor,
      weight: isHovered ? 2.5 : 0.5,
      dashArray: "4, 4",
      fillColor: groupColor,
      fillOpacity: isHovered ? 0.35 : 0.2,
    });
  };

  const initPOIs = (mapInstance) => {
    const L = window.L;
    mapLocations.forEach(async (loc) => {
      const singlePoiGroup = L.layerGroup();

      // Resolve coordinates dynamically (supports standard lat/lon or fallbackLat/fallbackLon)
      const lat = loc.lat !== undefined ? loc.lat : loc.fallbackLat;
      const lon = loc.lon !== undefined ? loc.lon : loc.fallbackLon;

      if (lat === undefined || lon === undefined) return;

      // Draw real polyline/polygon boundaries for locations if coordinates exist
      if (loc.polygonCoords) {
        L.polygon(loc.polygonCoords, {
          color: loc.color,
          weight: 2,
          dashArray: "4, 4",
          fillColor: loc.color,
          fillOpacity: 0.1,
          interactive: false,
          pane: "ringsPane",
        }).addTo(singlePoiGroup);
      } else if (loc.boundaryCoords) {
        L.polyline(loc.boundaryCoords, {
          color: loc.color,
          weight: 2,
          dashArray: "4, 4",
          fillColor: loc.color,
          fillOpacity: loc.fillOpacity !== undefined ? loc.fillOpacity : 0.1,
          interactive: false,
          pane: "ringsPane",
        }).addTo(singlePoiGroup);
      }

      // Draw dynamic boundaries if a query is defined in the location snippet
      if (loc.query) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc.query)}&polygon_geojson=1&format=json`,
          );
          if (!response.ok) throw new Error("API Error");
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            throw new Error("API Limit Reached");
          }

          let geojsonData;
          if (
            data &&
            data.length > 0 &&
            data[0].geojson &&
            data[0].geojson.type !== "Point" &&
            data[0].geojson.type !== "MultiPoint"
          ) {
            geojsonData = data[0].geojson;
          } else {
            geojsonData = generateFallbackGeoJSON(
              loc.fallbackLat,
              loc.fallbackLon,
              loc.fallbackRadius,
            );
          }

          L.geoJSON(geojsonData, {
            color: loc.color,
            weight: 2,
            dashArray: "4, 4",
            fillColor: loc.fillColor || loc.color,
            fillOpacity: loc.fillOpacity !== undefined ? loc.fillOpacity : 0.1,
            interactive: false,
            pane: "ringsPane",
          }).addTo(singlePoiGroup);
        } catch (error) {
          const fallbackGeoJSON = generateFallbackGeoJSON(
            loc.fallbackLat,
            loc.fallbackLon,
            loc.fallbackRadius,
          );
          L.geoJSON(fallbackGeoJSON, {
            color: loc.color,
            weight: 2,
            dashArray: "4, 4",
            fillColor: loc.fillColor || loc.color,
            fillOpacity: loc.fillOpacity !== undefined ? loc.fillOpacity : 0.1,
            interactive: false,
            pane: "ringsPane",
          }).addTo(singlePoiGroup);
        }
      }

      if (loc.radii) {
        loc.radii
          .sort((a, b) => b - a)
          .forEach((radius, index) => {
            const isOuter = index === 0;
            L.circle([lat, lon], {
              radius: radius,
              color: loc.color,
              weight: isOuter ? 2 : 2.5,
              dashArray: isOuter ? "4, 8" : "6, 6",
              fillColor: loc.color,
              fillOpacity: 0.1,
              interactive: false,
              pane: "ringsPane",
              className: isOuter ? "breathe-outer" : "breathe-inner",
            }).addTo(singlePoiGroup);
          });
      }

      let marker;
      const isAirport = [
        "Umbu Mehang Kunda Airport",
        "Soekarno-Hatta Airport",
        "Tambolaka Airport",
        "El Tari Airport",
        "Komodo Airport",
        "Ngurah Rai Airport",
      ].includes(loc.id);
      if (isAirport) {
        const iconHtml = `<div style="background-color: ${loc.color}; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #EFEBE7; color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3.5 3.5-2.5-.5L2 17l4 4 1-.5-.5-2.5 3.5-3.5 5 6 1.2-.7.6-1.1c.4-.2.7-.6.6-1.1Z"/></svg>
        </div>`;
        marker = L.marker([lat, lon], {
          icon: L.divIcon({
            html: iconHtml,
            className: "",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
          pane: "markersPane",
        }).addTo(singlePoiGroup);
      } else {
        marker = L.circleMarker([lat, lon], {
          radius: 8,
          fillColor: loc.color,
          color: "#EFEBE7",
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
          pane: "markersPane",
        }).addTo(singlePoiGroup);
      }

      marker.bindTooltip(
        `<b>${loc.name}</b><br><span style="font-size:11px;color:#777;">${loc.desc || loc.population || ""}</span>`,
        { direction: "top", offset: [0, -10], className: "custom-tooltip" },
      );

      poiLayersRef.current[loc.id] = singlePoiGroup;

      // Immediate sync: Force POIs to render instantly on map load
      if (activePOIs.includes(loc.id)) {
        singlePoiGroup.addTo(poiGroupRef.current);
      }
    });
  };

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;
    const map = mapRef.current;

    // Trigger our lazy-load engine
    syncRegionBorders(map, activeRegions);

    Object.entries(regionsLayersRef.current).forEach(([id, layer]) => {
      const isActive = activeRegions.includes(id);
      if (isActive && !map.hasLayer(layer)) {
        layer.addTo(map);
      } else if (!isActive && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
      if (isActive) {
        applyLayerStyle(layer, id, false, viewMode);
        const newContent = getTooltipContent(
          targetRegions.find((r) => r.id === id),
          viewMode,
        );
        layer.setPopupContent(newContent);
      }
    });

    if (hoverTooltipRef.current && map.hasLayer(hoverTooltipRef.current)) {
      map.removeLayer(hoverTooltipRef.current);
    }
  }, [activeRegions, viewMode, regionFetchStatuses, isMapReady]);

  useEffect(() => {
    if (!poiGroupRef.current) return;
    const group = poiGroupRef.current;
    group.clearLayers();
    activePOIs.forEach((id) => {
      if (poiLayersRef.current[id]) poiLayersRef.current[id].addTo(group);
    });
  }, [activePOIs]);

  const flyToWithOffset = useCallback((bounds, isPoint = false) => {
    if (!mapRef.current || !bounds || !bounds.isValid()) return;

    // Add 360px left padding on desktop to clear the panel, standard 40px on mobile
    const leftPadding = window.innerWidth > 640 ? 360 : 40;

    const options = {
      paddingTopLeft: [leftPadding, 40],
      paddingBottomRight: [40, 40],
      duration: 1.5,
      easeLinearity: 0.25,
    };
    if (isPoint) options.maxZoom = 12;
    mapRef.current.flyToBounds(bounds, options);
  }, []);

  const frameActiveRegions = useCallback(
    (mapInstance) => {
      const L = window.L;
      const activeLayers = activeRegions
        .map((id) => regionsLayersRef.current[id])
        .filter(Boolean);
      if (activeLayers.length > 0) {
        const boundaryGroup = L.featureGroup(activeLayers);
        flyToWithOffset(boundaryGroup.getBounds());
      }
    },
    [activeRegions, flyToWithOffset],
  );

  const handleRegionClick = (regionId) => {
    const layer = regionsLayersRef.current[regionId];
    if (layer && mapRef.current.hasLayer(layer) && layer.getBounds().isValid())
      flyToWithOffset(layer.getBounds());
  };

  const handlePoiClick = (lat, lon, id) => {
    const L = window.L;
    if (!L) return;
    flyToWithOffset(L.latLngBounds([lat, lon], [lat, lon]), true);
    if (id) {
      if (activeClickedPoiRef.current && activeClickedPoiRef.current !== id) {
        const prevId = activeClickedPoiRef.current;
        activeClickedPoiRef.current = id;
        handlePoiHover(prevId, false);
      } else {
        activeClickedPoiRef.current = id;
      }
      handlePoiHover(id, true);
    }
  };
  const handlePoiHover = useCallback((id, isHovering) => {
    if (
      isHovering &&
      activeClickedPoiRef.current &&
      activeClickedPoiRef.current !== id
    ) {
      const prevId = activeClickedPoiRef.current;
      activeClickedPoiRef.current = null;
      const prevLayer = poiLayersRef.current[prevId];
      if (prevLayer) {
        prevLayer.eachLayer((layer) => {
          if (layer.options && layer.options.pane === "markersPane") {
            if (typeof layer.setStyle === "function") {
              layer.setStyle({ className: "" });
            }
            const el =
              typeof layer.getElement === "function"
                ? layer.getElement()
                : null;
            if (el) el.classList.remove("glowing-marker");
          }
        });
      }
    }

    const layerGroup = poiLayersRef.current[id];
    if (layerGroup) {
      layerGroup.eachLayer((layer) => {
        if (layer.options && layer.options.pane === "markersPane") {
          const isGlowing = isHovering || activeClickedPoiRef.current === id;
          if (typeof layer.setStyle === "function") {
            layer.setStyle({
              className: isGlowing ? "glowing-marker" : "",
              radius: 8,
              weight: 2,
              opacity: 1,
            });
          }
          const el =
            typeof layer.getElement === "function" ? layer.getElement() : null;
          if (el) {
            if (isGlowing) el.classList.add("glowing-marker");
            else el.classList.remove("glowing-marker");
          }
          if (isGlowing && typeof layer.bringToFront === "function") {
            layer.bringToFront();
          }
        }
      });
    }
  }, []);

  const handleGroupHover = useCallback(
    (locs, isHovering) => {
      locs.forEach((loc) => handlePoiHover(loc.id, isHovering));
    },
    [handlePoiHover],
  );

  useEffect(() => {
    const handleDocumentClick = (e) => {
      // If we clicked something that is not a location list item and is not on the map itself
      if (
        !e.target.closest(".location-list-item") &&
        !e.target.closest("#demographics-map")
      ) {
        if (activeClickedPoiRef.current) {
          const prevId = activeClickedPoiRef.current;
          activeClickedPoiRef.current = null;
          handlePoiHover(prevId, false);
        }
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [handlePoiHover]);

  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L) return;
    measureStateRef.current.isMeasuring = isMeasuring;

    const clearMeasure = () => {
      const state = measureStateRef.current;
      state.points = [];
      if (state.line) map.removeLayer(state.line);
      if (state.dynamicLine) map.removeLayer(state.dynamicLine);
      if (state.tooltip && map.hasLayer(state.tooltip))
        map.removeLayer(state.tooltip);
      state.markers.forEach((m) => map.removeLayer(m));
      state.markers = [];
      state.line = null;
      state.dynamicLine = null;
    };

    const onMeasureClick = (e) => {
      const state = measureStateRef.current;
      if (state.points.length === 0 || state.points.length === 2) {
        clearMeasure();
        state.points.push(e.latlng);
        const marker = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: "#1C6048",
          color: "#EFEBE7",
          weight: 2,
          fillOpacity: 1,
          pane: "markersPane",
        }).addTo(map);
        state.markers.push(marker);
        state.dynamicLine = L.polyline([e.latlng, e.latlng], {
          color: "#1C6048",
          weight: 2.5,
          dashArray: "6, 8",
          pane: "ringsPane",
        }).addTo(map);
        state.tooltip = L.tooltip({
          permanent: true,
          className: "measure-tooltip",
          direction: "center",
        })
          .setLatLng(e.latlng)
          .setContent("0.00 km")
          .addTo(map);
      } else if (state.points.length === 1) {
        state.points.push(e.latlng);
        const marker = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: "#1C6048",
          color: "#EFEBE7",
          weight: 2,
          fillOpacity: 1,
          pane: "markersPane",
        }).addTo(map);
        state.markers.push(marker);
        if (state.dynamicLine) map.removeLayer(state.dynamicLine);
        state.line = L.polyline(state.points, {
          color: "#1C6048",
          weight: 2.5,
          dashArray: "6, 8",
          pane: "ringsPane",
        }).addTo(map);
        const distance = (
          map.distance(state.points[0], state.points[1]) / 1000
        ).toFixed(2);
        state.tooltip
          .setLatLng([
            (state.points[0].lat + state.points[1].lat) / 2,
            (state.points[0].lng + state.points[1].lng) / 2,
          ])
          .setContent(`${distance} km`);
      }
    };

    const onMeasureMove = (e) => {
      const state = measureStateRef.current;
      if (state.points.length === 1) {
        state.dynamicLine.setLatLngs([state.points[0], e.latlng]);
        const distance = (
          map.distance(state.points[0], e.latlng) / 1000
        ).toFixed(2);
        state.tooltip
          .setLatLng([
            (state.points[0].lat + e.latlng.lat) / 2,
            (state.points[0].lng + e.latlng.lng) / 2,
          ])
          .setContent(`${distance} km`);
      }
    };

    if (isMeasuring) {
      map.getContainer().style.cursor = "crosshair";
      map.getContainer().classList.add("map-measuring");
      map.on("click", onMeasureClick);
      map.on("mousemove", onMeasureMove);
    } else {
      map.getContainer().style.cursor = "";
      map.getContainer().classList.remove("map-measuring");
      map.off("click", onMeasureClick);
      map.off("mousemove", onMeasureMove);
      clearMeasure();
    }
    return () => {
      if (map) {
        map.off("click", onMeasureClick);
        map.off("mousemove", onMeasureMove);
      }
    };
  }, [isMeasuring]);

  const toggleRegion = (id) => {};
  const toggleGroup = (groupName) => {};
  const toggleAllPoi = () =>
    setActivePOIs((prev) =>
      prev.length === mapLocations.length ? [] : mapLocations.map((l) => l.id),
    );

  const legendInfo = true;

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden relative z-10 font-sans border border-[#D8D8D8] shadow-sm">
      <style>{`
                /* --- 1. NEW STATIC REGION LABELS --- */
                .static-region-tooltip { 
                    background: transparent !important; 
                    border: none !important; 
                    box-shadow: none !important; 
                    pointer-events: none !important; 
                    transition: opacity 0.3s ease;
                    ${!showRegionLabels ? "opacity: 0 !important; visibility: hidden !important;" : ""}
                }
                .static-region-tooltip .leaflet-tooltip-tip { display: none; }
                .static-region-name { 
                    font-size: 11px; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 2px; 
                    color: rgba(30, 47, 49, 0.4);
                    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8), -1px -1px 2px rgba(255, 255, 255, 0.8);
                }

                /* --- 2. ORIGINAL ESSENTIAL APP STYLES --- */
                .vignette {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    box-shadow: inset 0 0 200px rgba(30, 47, 49, 0.35);
                    pointer-events: none; z-index: 10;
                }
                
                @keyframes pulseGlow {
                    0% { filter: drop-shadow(0 0 8px rgba(30, 58, 138, 0.9)); fill-opacity: 0.9; }
                    100% { filter: drop-shadow(0 0 24px rgba(30, 58, 138, 1)); fill-opacity: 1; stroke-width: 5px; }
                }
                
                /* Glowing Marker on Hover */
                .glowing-marker {
                    animation: pulseGlow 1s infinite alternate ease-in-out;
                    transition: fill-opacity 0.2s ease, stroke-width 0.2s ease;
                }

                /* Fix the ugly square focus ring on map markers */
                .leaflet-interactive:focus { outline: none !important; }
                
                /* Ultra-Premium Glassmorphism Tooltips */
                .leaflet-tooltip.custom-tooltip, .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.5) !important; 
                    backdrop-filter: blur(16px) saturate(180%) !important; 
                    -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
                    border-radius: 12px !important; 
                    box-shadow: 0 8px 32px rgba(30, 47, 49, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.6) !important;
                    border: none !important; 
                    color: #1E2F31 !important;
                    font-weight: 600 !important; 
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                }
                /* Hide the little map arrows so the glass box floats cleanly */
                .leaflet-tooltip-tip, .leaflet-popup-tip-container { display: none !important; }
                .leaflet-tooltip.custom-tooltip { 
                    padding: 12px 16px; 
                    opacity: 1 !important; 
                    width: max-content !important;
                    min-width: 180px !important;
                    max-width: 250px !important;
                    white-space: normal !important;
                    word-wrap: break-word !important;
                    word-break: break-word !important;
                    box-sizing: border-box !important;
                }
                .leaflet-tooltip.custom-tooltip.selected-route-tooltip {
                    background: rgba(255, 255, 255, 0.8) !important;
                    border: 1px solid rgba(28, 96, 72, 0.3) !important;
                    box-shadow: 0 12px 36px rgba(28, 96, 72, 0.15) !important;
                    z-index: 1200 !important;
                }
                @media (max-width: 640px) {
                    .leaflet-tooltip.custom-tooltip {
                        width: max-content !important;
                        min-width: 130px !important;
                        max-width: 170px !important;
                        padding: 8px 10px !important;
                    }
                }
                .leaflet-popup-content { margin: 12px 16px; line-height: 1.4; }
                
                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 16px 0; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(155, 139, 112, 0.5); border-radius: 8px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(155, 139, 112, 0.8); }
                
                /* UI Switches */
                .switch { position: relative; display: inline-block; flex-shrink: 0; }
                .switch.group { width: 32px; height: 18px; margin-left: 8px; }
                .switch.item { width: 24px; height: 14px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #D8D8D8; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; background-color: #EFEBE7; transition: .4s; border-radius: 50%; }
                .switch.group .slider:before { height: 12px; width: 12px; left: 3px; bottom: 3px; }
                .switch.item .slider:before { height: 10px; width: 10px; left: 2px; bottom: 2px; }
                .switch.group input:checked + .slider { background-color: #9B8B70; }
                .switch.item input:checked + .slider { background-color: #1E2f31; }
                .switch.group input:checked + .slider:before { transform: translateX(14px); }
                .switch.item input:checked + .slider:before { transform: translateX(10px); }
                
                /* Animations */
                @keyframes breathePulse { 0% { opacity: 0.1; } 100% { opacity: 0.5; } }
                .breathe-outer { animation: breathePulse 3s infinite alternate ease-in-out; }
                .breathe-inner { animation: breathePulse 3s infinite alternate-reverse ease-in-out; }
                
                /* Leaflet Controls */
                .leaflet-left .leaflet-control { margin-left: 16px !important; }
                .leaflet-bottom .leaflet-control { margin-bottom: 16px !important; }
                .leaflet-bar {
                    border: 2px solid rgba(0,0,0,0.2) !important;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.65) !important;
                    border-radius: 4px !important;
                    background-clip: padding-box !important;
                    overflow: hidden;
                }
                .leaflet-bar a, .leaflet-touch .leaflet-bar a {
                    background-color: white !important;
                    color: #4C4A4B !important;
                    width: 30px !important;
                    height: 30px !important;
                    line-height: 30px !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    border-bottom: 1px solid rgba(0,0,0,0.1) !important;
                }
                .leaflet-bar a:last-child { border-bottom: none !important; }
                .leaflet-bar a:hover {
                    background-color: #f4f4f4 !important;
                    color: #1C6048 !important;
                }
            `}</style>

      <div className="vignette"></div>
      <div id="demographics-map" className="w-full h-full z-[1]"></div>

      {/* Dynamic Dual Map Legend */}
      {legendInfo && !isLegendOpen && (
        <div
          onClick={() => setIsLegendOpen(true)}
          className={`absolute top-4 right-4 z-[950] bg-white/90 backdrop-blur-md px-2.5 py-2 sm:p-2.5 rounded-xl shadow-md border border-[#D8D8D8] cursor-pointer hover:bg-white text-[#1E2F31] font-bold text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2 transition-all duration-300 flex`}
        >
          <span className="hidden sm:inline">Legend</span>
          <span className="sm:hidden">Legend</span>
          <ChevronRight
            size={14}
            className="text-[#1E2F31] shrink-0 rotate-180"
          />
        </div>
      )}

      {legendInfo && (
        <div
          onWheel={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className={`absolute top-4 right-4 z-[1010] bg-white/95 backdrop-blur-md border border-[#D8D8D8] rounded-xl shadow-lg w-[calc(100%-32px)] sm:w-[180px] max-h-[calc(100%-110px)] overflow-y-auto overscroll-contain custom-scrollbar flex flex-col pointer-events-auto transition-all duration-300 ${isLegendOpen ? "translate-x-0" : "translate-x-[120%]"}`}
        >
          <div className="p-3 border-b border-[#D8D8D8] flex justify-between items-center sticky top-0 bg-white/95 z-10">
            <h4 className="text-[11px] font-extrabold text-[#1E2F31] uppercase tracking-wider">
              Legend
            </h4>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="text-[#4C4A4B] hover:bg-[#EFEBE7] p-1 rounded-lg transition-colors flex items-center justify-center"
              title="Close Panel"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-3 flex flex-col gap-4">
            {/* 1. Infrastructure Section */}
            <div>
              <h4 className="text-[9px] font-bold text-[#9B8B70] uppercase tracking-wider mb-2">
                Locations
              </h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                    <span className="absolute inset-0 rounded-full border border-dashed border-[#1E3A8A] animate-[spin_10s_linear_infinite]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]"></span>
                  </div>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                    Vasanta Hub
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#1E2F31] shadow-sm flex-shrink-0"></span>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                    Class A
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#A95C3E] shadow-sm flex-shrink-0"></span>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                    Class B
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Air Referral Section */}
            <div>
              <h4 className="text-[9px] font-bold text-[#9B8B70] uppercase tracking-wider mb-2">
                Air Referral
              </h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-[3px] rounded bg-[#1C6048] flex-shrink-0 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                    Active Route
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-[2px] rounded bg-[#9B8B70] flex-shrink-0"></span>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                    Other Routes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`absolute bottom-4 right-4 z-[1010] bg-white/70 backdrop-blur-sm border border-[#D8D8D8]/50 py-2 px-4 rounded-lg shadow-md text-xs font-medium text-[#4C4A4B] transition-opacity duration-500 pointer-events-none flex items-center ${loadingStatus.active ? "opacity-100" : "opacity-0"}`}
      >
        <span
          className={`inline-block w-2 h-2 rounded-full mr-2 ${loadingStatus.active ? "bg-[#1C6048] animate-pulse" : "bg-[#1C6048]"}`}
        ></span>
        <span>{loadingStatus.text}</span>
      </div>

      <div
        onWheel={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className={`absolute top-4 left-4 z-[1010] bg-white/95 backdrop-blur-md border border-[#D8D8D8] rounded-xl shadow-lg w-[calc(100%-32px)] sm:w-[320px] max-h-[calc(100%-110px)] overflow-y-auto overscroll-contain custom-scrollbar flex flex-col pointer-events-auto transition-all duration-300 ${isPanelOpen ? "translate-x-0" : "-translate-x-[120%]"}`}
      >
        <div className="p-4 border-b border-[#D8D8D8] flex flex-col gap-3 sticky top-0 bg-white/95 z-10 animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="text-sm font-extrabold text-[#1E2f31] uppercase tracking-wider flex items-center gap-2">
              <Map size={16} className="text-[#1C6048]" />{" "}
              <span>Overview Map</span>
            </div>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-[#9B8B70] hover:text-[#1E2F31]"
            >
              <X size={16} />
            </button>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex bg-[#EFEBE7] p-1 rounded-lg w-full">
            <button
              onClick={() => setMapTab("layers")}
              className={`flex-1 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md transition-all ${
                mapTab === "layers"
                  ? "bg-[#1C6048] text-white shadow-sm"
                  : "text-[#4C4A4B] hover:text-[#1E2F31]"
              }`}
            >
              Layers
            </button>
            <button
              onClick={() => setMapTab("flights")}
              className={`flex-1 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md transition-all ${
                mapTab === "flights"
                  ? "bg-[#1C6048] text-white shadow-sm"
                  : "text-[#4C4A4B] hover:text-[#1E2F31]"
              }`}
            >
              Air Referral
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {mapTab === "flights" ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Show Routes Master Toggle */}
              <div className="flex justify-between items-center text-[11px] font-extrabold text-[#1C6048] uppercase tracking-wider pb-1.5 border-b border-dashed border-[#D8D8D8]">
                <span>Show Air Routes</span>
                <label className="switch group">
                  <input
                    type="checkbox"
                    checked={showFlightRoutes}
                    onChange={(e) => setShowFlightRoutes(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Referral Routes list */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#9B8B70] uppercase tracking-wider text-left">
                  Referral Routes
                </span>
                <div
                  onWheel={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="flex flex-col gap-2 max-h-[180px] overflow-y-auto overscroll-contain custom-scrollbar pr-1"
                >
                  {flightRoutes.map((route) => {
                    const isSelected = route.id === selectedFlightId;
                    const isDirect = route.type === "Direct";
                    return (
                      <div
                        key={route.id}
                        onClick={() => {
                          const newSelection = isSelected ? null : route.id;
                          setSelectedFlightId(newSelection);
                          setIsMapSelection(false);
                          setSelectedFlightLatLng(null);
                          if (newSelection) {
                            setShowFlightRoutes(true);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#1C6048] bg-[#F2F6F4] shadow-sm"
                            : "border-[#D8D8D8] hover:border-[#9B8B70] bg-white/50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-[11px] text-[#1E2F31] leading-snug">
                            {route.name}
                          </span>
                          <span
                            className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                              isDirect
                                ? "bg-[#D1FAE5] text-[#065F46]"
                                : "bg-[#FEF3C7] text-[#92400E]"
                            }`}
                          >
                            {route.type}
                          </span>
                        </div>
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isSelected
                              ? "grid-rows-[1fr] opacity-100 mt-2"
                              : "grid-rows-[0fr] opacity-0 overflow-hidden pointer-events-none"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p className="text-[9px] text-[#4C4A4B] leading-relaxed">
                              {route.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div
                className="flex justify-between items-center text-[11px] font-extrabold text-[#1C6048] uppercase tracking-wider pb-1 border-b border-dashed border-[#d8d8d8] cursor-pointer pr-2"
                onClick={() => setPoiSectionExpanded(!poiSectionExpanded)}
              >
                <div className="flex items-center gap-1.5">
                  <span>Locations</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${!poiSectionExpanded ? "-rotate-90" : ""}`}
                  />
                </div>
                <label
                  className="switch group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={activePOIs.length === mapLocations.length}
                    onChange={toggleAllPoi}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              {poiSectionExpanded && (
                <div className="flex flex-col">
                  {["Vasanta", "General", "Infrastructure"].map((groupName) => {
                    const groupLocs = mapLocations.filter(
                      (loc) => loc.group === groupName,
                    );
                    if (groupLocs.length === 0) return null;

                    return (
                      <div
                        key={groupName}
                        className={`flex flex-col transition-all`}
                      >
                        {/* TIER 1: The Main Group Header */}
                        <div
                          className={`flex justify-between items-center text-[10px] font-bold text-[#9B8B70] uppercase py-1 bg-[#F9F8F6] px-2 rounded cursor-pointer transition-all`}
                          onClick={() =>
                            setExpandedPoiGroups((p) => ({
                              ...p,
                              [groupName]: !p[groupName],
                            }))
                          }
                          onMouseEnter={() => handleGroupHover(groupLocs, true)}
                          onMouseLeave={() =>
                            handleGroupHover(groupLocs, false)
                          }
                        >
                          <div className="flex items-center gap-1.5">
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-300 ${!expandedPoiGroups[groupName] ? "-rotate-90" : ""}`}
                            />
                            <span>{groupName}</span>
                          </div>
                          <label
                            className="switch group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={groupLocs.every((l) =>
                                activePOIs.includes(l.id),
                              )}
                              onChange={() => {
                                const ids = groupLocs.map((l) => l.id);
                                const allActive = ids.every((id) =>
                                  activePOIs.includes(id),
                                );
                                setActivePOIs((prev) =>
                                  allActive
                                    ? prev.filter((id) => !ids.includes(id))
                                    : [...new Set([...prev, ...ids])],
                                );
                              }}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        {expandedPoiGroups[groupName] && (
                          <div className="flex flex-col">
                            {/* Anchor / Base Locations (No SubGroup) */}
                            {groupLocs
                              .filter((l) => !l.subGroup)
                              .map((loc, index) => (
                                <div
                                  key={loc.id}
                                  className="location-list-item flex justify-between items-center py-1.5 pl-7 pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors"
                                  onClick={() =>
                                    handlePoiClick(
                                      loc.lat !== undefined
                                        ? loc.lat
                                        : loc.fallbackLat,
                                      loc.lon !== undefined
                                        ? loc.lon
                                        : loc.fallbackLon,
                                      loc.id,
                                    )
                                  }
                                  onMouseEnter={() =>
                                    handlePoiHover?.(loc.id, true)
                                  }
                                  onMouseLeave={() =>
                                    handlePoiHover?.(loc.id, false)
                                  }
                                >
                                  <div className="truncate flex-1 min-w-0 pr-3">
                                    <span className="text-[#9B8B70] mr-1.5 font-bold">
                                      {index + 1}.
                                    </span>
                                    <span className="font-bold text-[#1E2F31]">
                                      {loc.name}
                                    </span>
                                    <span className="hidden text-[9px] text-[#9B8B70] ml-1.5">
                                      — {loc.desc}
                                    </span>
                                  </div>
                                  <label
                                    className="switch item"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={activePOIs.includes(loc.id)}
                                      onChange={() =>
                                        setActivePOIs((prev) =>
                                          prev.includes(loc.id)
                                            ? prev.filter((i) => i !== loc.id)
                                            : [...prev, loc.id],
                                        )
                                      }
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>
                              ))}

                            {/* TIER 2: Sub-Groups Loop (e.g., '< 5km Radius' or 'Class A') */}
                            {[
                              ...new Set(
                                groupLocs
                                  .filter((l) => l.subGroup)
                                  .map((l) => l.subGroup),
                              ),
                            ].map((subGroupName) => {
                              const subGroupLocs = groupLocs.filter(
                                (l) => l.subGroup === subGroupName,
                              );

                              // Determine if this is a distance folder or a standalone class
                              const isDistanceFolder =
                                subGroupName.includes("km Radius");

                              return (
                                <div
                                  key={subGroupName}
                                  className={`flex flex-col ${isDistanceFolder ? "mt-0.5" : ""}`}
                                >
                                  {isDistanceFolder ? (
                                    // 1. Collapsible Distance Folder with Master Toggle
                                    <div
                                      className="flex justify-between items-center pl-7 pr-2 mt-1.5 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-70 hover:opacity-100 cursor-pointer"
                                      onClick={() =>
                                        setExpandedSubGroups((p) => ({
                                          ...p,
                                          [subGroupName]: !p[subGroupName],
                                        }))
                                      }
                                      onMouseEnter={() =>
                                        handleGroupHover(subGroupLocs, true)
                                      }
                                      onMouseLeave={() =>
                                        handleGroupHover(subGroupLocs, false)
                                      }
                                    >
                                      <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                        <ChevronDown
                                          size={10}
                                          className={`transition-transform duration-300 ${expandedSubGroups[subGroupName] === false ? "-rotate-90" : ""}`}
                                        />
                                        <span>{subGroupName}</span>
                                      </div>
                                      <label
                                        className="switch item scale-75 origin-right"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={subGroupLocs.every((l) =>
                                            activePOIs.includes(l.id),
                                          )}
                                          onChange={() => {
                                            const ids = subGroupLocs.map(
                                              (l) => l.id,
                                            );
                                            const allActive = ids.every((id) =>
                                              activePOIs.includes(id),
                                            );
                                            setActivePOIs((prev) =>
                                              allActive
                                                ? prev.filter(
                                                    (id) => !ids.includes(id),
                                                  )
                                                : [
                                                    ...new Set([
                                                      ...prev,
                                                      ...ids,
                                                    ]),
                                                  ],
                                            );
                                          }}
                                        />
                                        <span className="slider"></span>
                                      </label>
                                    </div>
                                  ) : (
                                    // 2. Standalone Class Header (e.g., Class A) with Toggle
                                    <div
                                      className="flex justify-between items-center pl-7 pr-2 mt-1.5 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-70 hover:opacity-100 cursor-pointer"
                                      onClick={() =>
                                        setExpandedSubGroups((p) => ({
                                          ...p,
                                          [subGroupName]: !p[subGroupName],
                                        }))
                                      }
                                      onMouseEnter={() =>
                                        handleGroupHover(subGroupLocs, true)
                                      }
                                      onMouseLeave={() =>
                                        handleGroupHover(subGroupLocs, false)
                                      }
                                    >
                                      <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                        <ChevronDown
                                          size={10}
                                          className={`transition-transform duration-300 ${expandedSubGroups[subGroupName] === false ? "-rotate-90" : ""}`}
                                        />
                                        <span>{subGroupName}</span>
                                      </div>
                                      <label
                                        className="switch item scale-75 origin-right"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={subGroupLocs.every((l) =>
                                            activePOIs.includes(l.id),
                                          )}
                                          onChange={() => {
                                            const ids = subGroupLocs.map(
                                              (l) => l.id,
                                            );
                                            const allActive = ids.every((id) =>
                                              activePOIs.includes(id),
                                            );
                                            setActivePOIs((prev) =>
                                              allActive
                                                ? prev.filter(
                                                    (id) => !ids.includes(id),
                                                  )
                                                : [
                                                    ...new Set([
                                                      ...prev,
                                                      ...ids,
                                                    ]),
                                                  ],
                                            );
                                          }}
                                        />
                                        <span className="slider"></span>
                                      </label>
                                    </div>
                                  )}

                                  {/* TIER 3: Nested Items & Sub-Sub Headers (Rendered if Tier 2 is expanded) */}
                                  {expandedSubGroups[subGroupName] !==
                                    false && (
                                    <div className="flex flex-col mb-1">
                                      {/* Class A Sub-Header inside Distance Folder */}
                                      {isDistanceFolder &&
                                        subGroupLocs.some(
                                          (l) => l.tier === "Class A",
                                        ) && (
                                          <div
                                            className="flex justify-between items-center pl-9 pr-2 mt-1 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                                            onClick={() =>
                                              setExpandedSubGroups((p) => ({
                                                ...p,
                                                [`${subGroupName}_ClassA`]:
                                                  !p[`${subGroupName}_ClassA`],
                                              }))
                                            }
                                            onMouseEnter={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class A",
                                                ),
                                                true,
                                              )
                                            }
                                            onMouseLeave={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class A",
                                                ),
                                                false,
                                              )
                                            }
                                          >
                                            <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                              <ChevronDown
                                                size={10}
                                                className={`transition-transform duration-300 ${expandedSubGroups[`${subGroupName}_ClassA`] === false ? "-rotate-90" : ""}`}
                                              />
                                              <span>
                                                Class A (Comprehensive)
                                              </span>
                                            </div>
                                            <label
                                              className="switch item scale-75 origin-right"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <input
                                                type="checkbox"
                                                checked={subGroupLocs
                                                  .filter(
                                                    (l) => l.tier === "Class A",
                                                  )
                                                  .every((l) =>
                                                    activePOIs.includes(l.id),
                                                  )}
                                                onChange={() => {
                                                  const ids = subGroupLocs
                                                    .filter(
                                                      (l) =>
                                                        l.tier === "Class A",
                                                    )
                                                    .map((l) => l.id);
                                                  const allActive = ids.every(
                                                    (id) =>
                                                      activePOIs.includes(id),
                                                  );
                                                  setActivePOIs((prev) =>
                                                    allActive
                                                      ? prev.filter(
                                                          (id) =>
                                                            !ids.includes(id),
                                                        )
                                                      : [
                                                          ...new Set([
                                                            ...prev,
                                                            ...ids,
                                                          ]),
                                                        ],
                                                  );
                                                }}
                                              />
                                              <span className="slider"></span>
                                            </label>
                                          </div>
                                        )}

                                      {/* Class A Loop */}
                                      {expandedSubGroups[
                                        `${subGroupName}_ClassA`
                                      ] !== false &&
                                        subGroupLocs
                                          .filter(
                                            (l) =>
                                              l.tier === "Class A" ||
                                              !isDistanceFolder,
                                          )
                                          .map((loc, index) => (
                                            <div
                                              key={loc.id}
                                              className={`location-list-item flex justify-between items-center py-1.5 ${isDistanceFolder ? "pl-12" : "pl-10"} pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors`}
                                              onClick={() =>
                                                handlePoiClick(
                                                  loc.lat,
                                                  loc.lon,
                                                  loc.id,
                                                )
                                              }
                                              onMouseEnter={() =>
                                                handlePoiHover?.(loc.id, true)
                                              }
                                              onMouseLeave={() =>
                                                handlePoiHover?.(loc.id, false)
                                              }
                                            >
                                              <div className="truncate flex-1 min-w-0 pr-3">
                                                <span className="text-[#9B8B70] mr-1.5 font-bold">
                                                  {index + 1}.
                                                </span>
                                                <span className="font-bold text-[#1E2F31]">
                                                  {loc.name}
                                                </span>
                                                <span className="hidden text-[9px] text-[#9B8B70] ml-1.5">
                                                  — {loc.desc}
                                                </span>
                                              </div>
                                              <label
                                                className="switch item"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={activePOIs.includes(
                                                    loc.id,
                                                  )}
                                                  onChange={() =>
                                                    setActivePOIs((prev) =>
                                                      prev.includes(loc.id)
                                                        ? prev.filter(
                                                            (i) => i !== loc.id,
                                                          )
                                                        : [...prev, loc.id],
                                                    )
                                                  }
                                                />
                                                <span className="slider"></span>
                                              </label>
                                            </div>
                                          ))}

                                      {/* Class B Sub-Header inside Distance Folder */}
                                      {isDistanceFolder &&
                                        subGroupLocs.some(
                                          (l) => l.tier === "Class B",
                                        ) && (
                                          <div
                                            className="flex justify-between items-center pl-9 pr-2 mt-1.5 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                                            onClick={() =>
                                              setExpandedSubGroups((p) => ({
                                                ...p,
                                                [`${subGroupName}_ClassB`]:
                                                  !p[`${subGroupName}_ClassB`],
                                              }))
                                            }
                                            onMouseEnter={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class B",
                                                ),
                                                true,
                                              )
                                            }
                                            onMouseLeave={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class B",
                                                ),
                                                false,
                                              )
                                            }
                                          >
                                            <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                              <ChevronDown
                                                size={10}
                                                className={`transition-transform duration-300 ${expandedSubGroups[`${subGroupName}_ClassB`] === false ? "-rotate-90" : ""}`}
                                              />
                                              <span>Class B (Specialized)</span>
                                            </div>
                                            <label
                                              className="switch item scale-75 origin-right"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <input
                                                type="checkbox"
                                                checked={subGroupLocs
                                                  .filter(
                                                    (l) => l.tier === "Class B",
                                                  )
                                                  .every((l) =>
                                                    activePOIs.includes(l.id),
                                                  )}
                                                onChange={() => {
                                                  const ids = subGroupLocs
                                                    .filter(
                                                      (l) =>
                                                        l.tier === "Class B",
                                                    )
                                                    .map((l) => l.id);
                                                  const allActive = ids.every(
                                                    (id) =>
                                                      activePOIs.includes(id),
                                                  );
                                                  setActivePOIs((prev) =>
                                                    allActive
                                                      ? prev.filter(
                                                          (id) =>
                                                            !ids.includes(id),
                                                        )
                                                      : [
                                                          ...new Set([
                                                            ...prev,
                                                            ...ids,
                                                          ]),
                                                        ],
                                                  );
                                                }}
                                              />
                                              <span className="slider"></span>
                                            </label>
                                          </div>
                                        )}

                                      {/* Class B Loop */}
                                      {expandedSubGroups[
                                        `${subGroupName}_ClassB`
                                      ] !== false &&
                                        isDistanceFolder &&
                                        subGroupLocs
                                          .filter((l) => l.tier === "Class B")
                                          .map((loc, index) => (
                                            <div
                                              key={loc.id}
                                              className="location-list-item flex justify-between items-center py-1.5 pl-12 pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors"
                                              onClick={() =>
                                                handlePoiClick(
                                                  loc.lat,
                                                  loc.lon,
                                                  loc.id,
                                                )
                                              }
                                              onMouseEnter={() =>
                                                handlePoiHover?.(loc.id, true)
                                              }
                                              onMouseLeave={() =>
                                                handlePoiHover?.(loc.id, false)
                                              }
                                            >
                                              <div className="truncate flex-1 min-w-0 pr-3">
                                                <span className="text-[#9B8B70] mr-1.5 font-bold">
                                                  {index + 1}.
                                                </span>
                                                <span className="font-bold text-[#1E2F31]">
                                                  {loc.name}
                                                </span>
                                                <span className="hidden text-[9px] text-[#9B8B70] ml-1.5">
                                                  — {loc.desc}
                                                </span>
                                              </div>
                                              <label
                                                className="switch item"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={activePOIs.includes(
                                                    loc.id,
                                                  )}
                                                  onChange={() =>
                                                    setActivePOIs((prev) =>
                                                      prev.includes(loc.id)
                                                        ? prev.filter(
                                                            (i) => i !== loc.id,
                                                          )
                                                        : [...prev, loc.id],
                                                    )
                                                  }
                                                />
                                                <span className="slider"></span>
                                              </label>
                                            </div>
                                          ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isPanelOpen && (
        <div
          onClick={() => setIsPanelOpen(true)}
          className="absolute top-4 left-4 z-[950] bg-white/90 backdrop-blur-md px-2.5 py-2 sm:p-2.5 rounded-xl shadow-md border border-[#D8D8D8] cursor-pointer hover:bg-white text-[#1E2F31] font-bold text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2"
        >
          <Map size={14} className="text-[#1C6048] shrink-0" />
          <span className="hidden sm:inline">Open Map Data</span>
          <span className="sm:hidden">Data</span>
        </div>
      )}
      {/* Combined Toolbar (Target & Ruler) matching Leaflet native style */}
      <div className="leaflet-bar absolute bottom-4 left-[60px] z-[1000] cursor-pointer">
        <a
          onClick={(e) => {
            e.preventDefault();
            frameActiveRegions(mapRef.current);
          }}
          title="Reset View to Active Regions"
          className="hover:!text-[#1C6048]"
        >
          <Target size={16} strokeWidth={2.5} />
        </a>
        <a
          onClick={(e) => {
            e.preventDefault();
            setIsMeasuring(!isMeasuring);
          }}
          title="Measure Distance"
          className={
            isMeasuring
              ? "!bg-[#E8EFEA] !text-[#1C6048]"
              : "hover:!text-[#1C6048]"
          }
        >
          <Ruler size={16} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
});
// === END INTERACTIVE MAP ===

export default InteractiveDemographicMap;
