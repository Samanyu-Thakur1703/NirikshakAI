import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import {
  Layers,
  Globe,
  Map as MapIcon,
  RotateCcw,
  Compass,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";
import { DISASTER_COLORS, SEVERITY_CONFIG } from "../../data/mockDisasters";

/**
 * Enterprise GIS Basemap Configurations
 * Tokenless, 100% public, high-reliability Esri & OSM service endpoints
 */

// 1. Primary Default: Esri World Light Gray Canvas (matches #F3F4F0 neutral operational background)
const ESRI_LIGHT_GRAY_STYLE = {
  version: 8,
  sources: {
    "esri-light-base": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
    },
    "esri-light-reference": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "esri-light-base-layer",
      type: "raster",
      source: "esri-light-base",
      minzoom: 0,
      maxzoom: 18,
    },
    {
      id: "esri-light-reference-layer",
      type: "raster",
      source: "esri-light-reference",
      minzoom: 0,
      maxzoom: 18,
    },
  ],
};

// 2. Esri World Topographic Map
const ESRI_TOPO_STYLE = {
  version: 8,
  sources: {
    "esri-topo": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "&copy; Esri, DeLorme, USGS, NPS",
    },
  },
  layers: [
    {
      id: "esri-topo-layer",
      type: "raster",
      source: "esri-topo",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// 3. Esri Satellite Imagery with Country Boundaries & Major Places
const ESRI_SATELLITE_STYLE = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "&copy; Esri, Maxar, Earthstar Geographics",
    },
    "esri-boundaries": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esri-satellite",
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: "esri-boundaries-layer",
      type: "raster",
      source: "esri-boundaries",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// 4. OpenStreetMap Standard
const OSM_STYLE = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const MAP_STYLES = {
  light: { name: "Light GIS", icon: Layers, style: ESRI_LIGHT_GRAY_STYLE },
  topo: { name: "Topographic", icon: MapIcon, style: ESRI_TOPO_STYLE },
  satellite: { name: "Satellite", icon: Globe, style: ESRI_SATELLITE_STYLE },
  osm: { name: "OSM", icon: Compass, style: OSM_STYLE },
};

const REGION_BOUNDS = {
  india: { center: [79.2, 22.8], zoom: 4.4 },
  north: { center: [77.2, 31.5], zoom: 6.2 },
  south: { center: [77.5, 12.8], zoom: 6.0 },
  east: { center: [88.5, 23.5], zoom: 6.0 },
  west: { center: [73.5, 20.0], zoom: 6.0 },
  northeast: { center: [93.5, 26.2], zoom: 6.2 },
};

export function DisasterMap({
  incidents = [],
  selectedIncident,
  onSelectIncident,
  className = "",
  fullHeight = false,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeStyleKey, setActiveStyleKey] = useState("light");
  const [selectedRegion, setSelectedRegion] = useState("india");

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: ESRI_LIGHT_GRAY_STYLE,
      center: REGION_BOUNDS.india.center,
      zoom: REGION_BOUNDS.india.zoom,
      minZoom: 3.5,
      maxZoom: 18,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  // Handle map style switching
  const handleStyleChange = (styleKey) => {
    if (!mapRef.current || styleKey === activeStyleKey) return;
    setActiveStyleKey(styleKey);
    const chosen = MAP_STYLES[styleKey];
    if (chosen) {
      mapRef.current.setStyle(chosen.style);
    }
  };

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 350);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [fullHeight]);

  // Update incident markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const visibleIncidents = incidents.filter((item) => {
      if (activeFilter === "all") return true;
      return item.disasterType === activeFilter;
    });

    visibleIncidents.forEach((item) => {
      const lng = Number(item.longitude);
      const lat = Number(item.latitude);
      if (isNaN(lng) || isNaN(lat) || (lng === 0 && lat === 0)) return;

      const isSelected = selectedIncident && selectedIncident.id === item.id;
      const isCritical = item.severity === "critical";
      const isHigh = item.severity === "high";

      // Color mapping aligned with Enterprise Palette:
      // Critical -> #C94C4C, Warning/High -> #D98236, Verified/Standard -> #183D35
      let markerColor = "#183D35";
      if (isCritical) {
        markerColor = "#C94C4C";
      } else if (isHigh || item.verdict === "pending_review") {
        markerColor = "#D98236";
      } else if (item.verdict === "rejected") {
        markerColor = "#737D78";
      }

      const sizePx = isCritical ? 30 : isHigh ? 24 : 18;

      const el = document.createElement("div");
      el.className = "cursor-pointer transition-transform duration-150 hover:scale-125 z-10";

      // Enterprise clean marker (no neon glow, solid high-contrast borders)
      const pulseHtml = isCritical
        ? `<span class="absolute -inset-1.5 rounded-full animate-ping opacity-60" style="background-color: #C94C4C;"></span>`
        : "";

      el.innerHTML = `
        <div class="relative flex items-center justify-center" style="width: ${sizePx}px; height: ${sizePx}px;">
          ${pulseHtml}
          <div class="relative flex items-center justify-center rounded-full border-2 bg-white shadow-sm" 
               style="width: ${sizePx}px; height: ${sizePx}px; border-color: ${isSelected ? "#183D35" : markerColor};">
            <span class="rounded-full" style="width: ${sizePx * 0.55}px; height: ${
        sizePx * 0.55
      }px; background-color: ${markerColor};"></span>
          </div>
        </div>
      `;

      // Source meta
      const srcName = item.sourceMeta?.name || (item.source?.platform ? item.source.platform.toUpperCase() : "Multi-Feed");

      // Popup preview on hover
      const popupHtml = `
        <div class="p-3 max-w-[260px] text-xs font-sans bg-white border border-[#E1E5E0] shadow-md rounded">
          <div class="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-[#E1E5E0]">
            <span class="w-2 h-2 rounded-full" style="background-color: ${markerColor}"></span>
            <span class="font-bold uppercase tracking-wider text-[10px] text-[#252C2A]">${item.disasterType?.replace("_", " ")}</span>
            <span class="ml-auto text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
              isCritical
                ? "bg-[#C94C4C]/10 text-[#C94C4C] border border-[#C94C4C]/30"
                : "bg-[#F3F4F0] text-[#737D78] border border-[#E1E5E0]"
            }">${item.severity?.toUpperCase()}</span>
          </div>
          <div class="font-semibold text-[#252C2A] leading-snug mb-1 text-xs">${item.title}</div>
          <div class="text-[11px] text-[#737D78] flex items-center gap-1">📍 ${item.location || item.district || "Coordinates Marked"}</div>
          
          <div class="flex items-center justify-between text-[10px] font-mono mt-2 pt-1.5 border-t border-[#E1E5E0]">
            <span class="text-[#183D35] font-bold">Confidence: ${Math.round((item.confidenceScore || 0.85) * 100)}%</span>
            <span class="text-[#737D78]">${srcName}</span>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 14,
        closeButton: false,
        className: "disaster-map-popup",
      }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());
      el.addEventListener("click", () => {
        if (onSelectIncident) {
          onSelectIncident(item);
        }
        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), 8.0),
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      });

      markersRef.current.push(marker);
    });
  }, [incidents, mapLoaded, activeFilter, selectedIncident, onSelectIncident, activeStyleKey]);

  // Center on selected incident
  useEffect(() => {
    if (!selectedIncident || !mapRef.current) return;
    const lng = Number(selectedIncident.longitude);
    const lat = Number(selectedIncident.latitude);
    if (!isNaN(lng) && !isNaN(lat) && (lng !== 0 || lat !== 0)) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 8.5,
        speed: 1.3,
        essential: true,
      });
    }
  }, [selectedIncident]);

  const handleRegionChange = (regionKey) => {
    setSelectedRegion(regionKey);
    const region = REGION_BOUNDS[regionKey];
    if (region && mapRef.current) {
      mapRef.current.flyTo({
        center: region.center,
        zoom: region.zoom,
        speed: 1.2,
        essential: true,
      });
    }
  };

  const resetView = () => {
    handleRegionChange("india");
  };

  return (
    <div
      className={`relative w-full rounded border border-[#E1E5E0] bg-[#FFFFFF] overflow-hidden ${
        fullHeight ? "h-full min-h-[560px]" : "h-[460px] sm:h-[500px]"
      } ${className}`}
    >
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left: Filter Pills */}
      <div className="absolute top-2.5 left-2.5 z-20 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-90px)]">
        <div className="bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#E1E5E0] rounded p-1 flex items-center gap-1 shadow-xs overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#183D35] text-white"
                : "text-[#737D78] hover:text-[#252C2A] hover:bg-[#F3F4F0]"
            }`}
          >
            All Hazards ({incidents.length})
          </button>

          {Object.entries(DISASTER_COLORS).map(([type, cfg]) => {
            const count = incidents.filter((i) => i.disasterType === type).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeFilter === type
                    ? "bg-[#183D35] text-white"
                    : "text-[#737D78] hover:text-[#252C2A] hover:bg-[#F3F4F0]"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.hex }} />
                <span className="capitalize">{cfg.label}</span>
                <span className="font-mono text-[11px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Right: Basemap Selector */}
      <div className="absolute top-2.5 right-14 z-20 hidden sm:flex items-center bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#E1E5E0] rounded p-1 shadow-xs">
        {Object.entries(MAP_STYLES).map(([key, item]) => {
          const Icon = item.icon;
          const isActive = activeStyleKey === key;
          return (
            <button
              key={key}
              onClick={() => handleStyleChange(key)}
              title={`Switch to ${item.name} basemap`}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#183D35] text-white"
                  : "text-[#737D78] hover:text-[#252C2A] hover:bg-[#F3F4F0]"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Region Presets Toolbar (Bottom Left) */}
      <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1 bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#E1E5E0] rounded p-1 shadow-xs text-xs">
        <span className="px-1.5 py-0.5 text-[#737D78] font-medium text-[11px]">GIS Focus:</span>
        {Object.keys(REGION_BOUNDS).map((key) => (
          <button
            key={key}
            onClick={() => handleRegionChange(key)}
            className={`px-2 py-0.5 rounded capitalize font-medium transition-colors cursor-pointer text-xs ${
              selectedRegion === key
                ? "bg-[#183D35] text-white"
                : "text-[#737D78] hover:text-[#252C2A] hover:bg-[#F3F4F0]"
            }`}
          >
            {key}
          </button>
        ))}
        <button
          onClick={resetView}
          title="Reset to All India"
          className="p-1 rounded text-[#737D78] hover:text-[#252C2A] hover:bg-[#F3F4F0] ml-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* GIS Legend (Bottom Right) */}
      <div className="absolute bottom-2.5 right-2.5 z-20 bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#E1E5E0] rounded p-2.5 shadow-xs max-w-[210px] hidden sm:block text-xs">
        <div className="flex items-center justify-between font-semibold text-[#252C2A] mb-1.5 pb-1 border-b border-[#E1E5E0]">
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#183D35]" />
            GIS Legend
          </span>
          <span className="text-[10px] font-mono text-[#737D78]">Esri Light</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[#252C2A]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#183D35]" />
              Flood
            </span>
            <span className="font-mono text-[#737D78]">
              {incidents.filter((i) => i.disasterType === "flood").length}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#252C2A]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D98236]" />
              Landslide
            </span>
            <span className="font-mono text-[#737D78]">
              {incidents.filter((i) => i.disasterType === "landslide").length}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#252C2A]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#397568]" />
              Cyclone
            </span>
            <span className="font-mono text-[#737D78]">
              {incidents.filter((i) => i.disasterType === "cyclone").length}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#252C2A]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#252C2A]" />
              Earthquake
            </span>
            <span className="font-mono text-[#737D78]">
              {incidents.filter((i) => i.disasterType === "earthquake").length}
            </span>
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-[#E1E5E0] text-[10px] text-[#737D78] space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-[#C94C4C] bg-[#C94C4C]/20" />
            <span>Critical Severity (Pulsing)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#183D35]" />
            <span>Verified / Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
