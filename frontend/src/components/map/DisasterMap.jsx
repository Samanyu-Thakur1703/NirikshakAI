import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import {
  Layers,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Filter,
  Eye,
  Activity,
  Waves,
  Mountain,
  Wind,
  CloudRain,
  Flame,
  Globe,
  Map as MapIcon,
} from "lucide-react";
import { DISASTER_COLORS, SEVERITY_CONFIG } from "../../data/mockDisasters";

/**
 * Robust, 100% Free, Public GIS Basemaps
 * Zero API keys required — Zero "API KEY REQUIRED" watermarks
 */

// 1. Primary: Esri World Dark Gray Canvas (Standard for dark enterprise GIS command centers)
const ESRI_DARK_STYLE = {
  version: 8,
  sources: {
    "esri-dark-base": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "&copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    },
    "esri-dark-reference": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "esri-dark-base-layer",
      type: "raster",
      source: "esri-dark-base",
      minzoom: 0,
      maxzoom: 18,
    },
    {
      id: "esri-dark-reference-layer",
      type: "raster",
      source: "esri-dark-reference",
      minzoom: 0,
      maxzoom: 18,
    },
  ],
};

// 2. Esri Satellite Imagery Reconnaissance (Real aerial imagery for disaster damage verification)
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

// 3. OpenStreetMap Standard (Public street level topology)
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
  dark: { name: "Dark GIS", icon: Layers, style: ESRI_DARK_STYLE },
  satellite: { name: "Satellite", icon: Globe, style: ESRI_SATELLITE_STYLE },
  osm: { name: "Streets", icon: MapIcon, style: OSM_STYLE },
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
  const [activeStyleKey, setActiveStyleKey] = useState("dark");
  const [selectedRegion, setSelectedRegion] = useState("india");

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: ESRI_DARK_STYLE,
      center: REGION_BOUNDS.india.center,
      zoom: REGION_BOUNDS.india.zoom,
      minZoom: 3.5,
      maxZoom: 18,
      attributionControl: true,
    });

    // Add navigation controls (Zoom + Compass)
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

  // Handle map style switching (Dark GIS, Satellite Recon, OSM Streets)
  const handleStyleChange = (styleKey) => {
    if (!mapRef.current || styleKey === activeStyleKey) return;
    setActiveStyleKey(styleKey);
    const chosen = MAP_STYLES[styleKey];
    if (chosen) {
      mapRef.current.setStyle(chosen.style);
    }
  };

  // Resize listener to prevent gray tiles or clipped canvas
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

  // Update incident markers whenever incidents, activeFilter, or mapLoaded changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Remove previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const visibleIncidents = incidents.filter((item) => {
      if (activeFilter === "all") return true;
      return item.disasterType === activeFilter;
    });

    visibleIncidents.forEach((item) => {
      // Defensive coordinate validation: ensure longitude and latitude are valid numbers
      const lng = Number(item.longitude);
      const lat = Number(item.latitude);
      if (isNaN(lng) || isNaN(lat) || (lng === 0 && lat === 0)) return;

      const isSelected = selectedIncident && selectedIncident.id === item.id;
      const config = DISASTER_COLORS[item.disasterType] || { hex: "#38bdf8", label: item.disasterType };
      const isCritical = item.severity === "critical";
      const isHigh = item.severity === "high";

      // Marker element
      const el = document.createElement("div");
      el.className = "cursor-pointer transition-transform duration-200 hover:scale-125 z-10";

      // Calculate size based on severity
      const sizePx = isCritical ? 34 : isHigh ? 28 : 22;
      const markerColor = isCritical ? "#ff5f1f" : (item.verdict === "verified" || item.confidenceScore >= 0.9) ? "#d4af37" : config.hex;

      const pulseHtml = isCritical
        ? `<span class="absolute -inset-2 rounded-full animate-ping opacity-75" style="background-color: #ff5f1f;"></span>`
        : isHigh
        ? `<span class="absolute -inset-1 rounded-full animate-pulse opacity-50" style="background-color: ${markerColor};"></span>`
        : "";

      el.innerHTML = `
        <div class="relative flex items-center justify-center" style="width: ${sizePx}px; height: ${sizePx}px;">
          ${pulseHtml}
          <div class="relative flex items-center justify-center rounded-full shadow-xl border-2"
               style="width: ${sizePx}px; height: ${sizePx}px; background-color: ${markerColor}28; border-color: ${
        isSelected ? "#ffffff" : markerColor
      }; box-shadow: 0 0 ${isSelected ? "20px #2dd4bf" : isCritical ? "14px #ff5f1f" : "10px " + markerColor + "aa"};">
            <span class="rounded-full" style="width: ${sizePx * 0.45}px; height: ${
        sizePx * 0.45
      }px; background-color: ${markerColor};"></span>
          </div>
        </div>
      `;

      // Source meta
      const srcName = item.sourceMeta?.name || (item.source?.platform ? item.source.platform.toUpperCase() : "Multi-Feed");
      const srcIcon = item.sourceMeta?.icon || "📍";

      // Popup preview on hover
      const popupHtml = `
        <div class="p-3 max-w-[250px] text-xs font-sans">
          <div class="flex items-center gap-1.5 mb-1.5">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${markerColor}"></span>
            <span class="font-bold uppercase tracking-wider text-[10px]" style="color: ${markerColor}">${
        item.disasterType
      }</span>
            <span class="ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              isCritical ? "bg-[#ff5f1f]/20 text-orange-200 border border-orange-500/40" : "bg-slate-800 text-slate-300"
            }">${item.severity.toUpperCase()}</span>
          </div>
          <div class="font-bold text-white leading-snug mb-1 text-xs">${item.title}</div>
          <div class="text-[11px] text-slate-300 flex items-center gap-1">📍 ${item.location || item.district || "Coordinates Marked"}</div>

          <div class="flex items-center justify-between text-[10px] font-mono mt-2 pt-2 border-t border-teal-900/40">
            <span class="text-amber-300 font-bold">Confidence: ${Math.round((item.confidenceScore || 0.85) * 100)}%</span>
            <span class="text-teal-400 font-semibold flex items-center gap-1">${srcIcon} ${srcName}</span>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 16,
        closeButton: false,
        className: "disaster-map-popup",
      }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      // Event listeners
      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());
      el.addEventListener("click", () => {
        if (onSelectIncident) {
          onSelectIncident(item);
        }
        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), 8.5),
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      });

      markersRef.current.push(marker);
    });
  }, [incidents, mapLoaded, activeFilter, selectedIncident, onSelectIncident, activeStyleKey]);

  // Center on selected incident if triggered externally
  useEffect(() => {
    if (!selectedIncident || !mapRef.current) return;
    const lng = Number(selectedIncident.longitude);
    const lat = Number(selectedIncident.latitude);
    if (!isNaN(lng) && !isNaN(lat) && (lng !== 0 || lat !== 0)) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 9.0,
        speed: 1.4,
        essential: true,
      });
    }
  }, [selectedIncident]);

  // Region pan helper
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
      className={`relative w-full rounded-xl overflow-hidden border border-slate-800/90 bg-[#070B12] shadow-xl ${
        fullHeight ? "h-full min-h-[580px]" : "h-[460px] sm:h-[520px]"
      } ${className}`}
    >
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left Floating Bar: Disaster Filter Pills */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-80px)]">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1 flex items-center gap-1 shadow-lg overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                : "text-slate-400 hover:text-slate-200"
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
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  activeFilter === type
                    ? `${cfg.bg} ${cfg.text} border ${cfg.border}`
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.hex }} />
                <span className="capitalize">{cfg.label}</span>
                <span className="font-mono text-[10px] text-slate-400">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Right: Basemap Style Selector */}
      <div className="absolute top-3 right-14 z-20 hidden sm:flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-lg">
        {Object.entries(MAP_STYLES).map(([key, item]) => {
          const Icon = item.icon;
          const isActive = activeStyleKey === key;
          return (
            <button
              key={key}
              onClick={() => handleStyleChange(key)}
              title={`Switch to ${item.name} basemap`}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3 h-3 text-cyan-400" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Region Presets Toolbar (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-lg text-[11px]">
        <span className="px-2 py-1 text-slate-400 font-medium">GIS Focus:</span>
        {Object.keys(REGION_BOUNDS).map((key) => (
          <button
            key={key}
            onClick={() => handleRegionChange(key)}
            className={`px-2 py-0.5 rounded capitalize font-medium transition-colors cursor-pointer ${
              selectedRegion === key
                ? "bg-slate-800 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {key}
          </button>
        ))}
        <button
          onClick={resetView}
          title="Reset to All India"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 ml-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Interactive Legend (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-lg p-3 shadow-xl max-w-[210px] hidden sm:block text-[11px]">
        <div className="flex items-center justify-between font-semibold text-slate-200 mb-2 border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            GIS Legend
          </span>
          <span className="text-[10px] font-mono text-emerald-400">Esri Dark GIS</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Flood
            </span>
            <span className="font-mono text-slate-400">
              {incidents.filter((i) => i.disasterType === "flood").length}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Landslide
            </span>
            <span className="font-mono text-slate-400">
              {incidents.filter((i) => i.disasterType === "landslide").length}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Cyclone
            </span>
            <span className="font-mono text-slate-400">
              {incidents.filter((i) => i.disasterType === "cyclone").length}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Heavy Rain
            </span>
            <span className="font-mono text-slate-400">
              {incidents.filter((i) => i.disasterType === "heavy_rainfall").length}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Earthquake
            </span>
            <span className="font-mono text-slate-400">
              {incidents.filter((i) => i.disasterType === "earthquake").length}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              Extreme Temp
            </span>
            <span className="font-mono text-slate-400">
              {incidents.filter((i) => i.disasterType === "extreme_temperature").length}
            </span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-rose-500 bg-rose-500/30" />
            <span>Critical (Pulsing marker)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border border-slate-400 bg-slate-400/30" />
            <span>Standard marker size</span>
          </div>
        </div>
      </div>
    </div>
  );
}
