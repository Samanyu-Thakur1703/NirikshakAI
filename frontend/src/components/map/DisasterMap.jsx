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
} from "lucide-react";
import { DISASTER_COLORS, SEVERITY_CONFIG } from "../../data/mockDisasters";

// Reliable open-source dark style for MapLibre GL
const CARTODB_DARK_MATTER = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// Fallback raster dark style in case vector style experiences network restrictions
const FALLBACK_DARK_STYLE = {
  version: 8,
  sources: {
    "carto-dark": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap &copy; CARTO",
    },
  },
  layers: [
    {
      id: "carto-dark-layer",
      type: "raster",
      source: "carto-dark",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
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
  const [showRadius, setShowRadius] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("india");

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let initialStyle = CARTODB_DARK_MATTER;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: REGION_BOUNDS.india.center,
      zoom: REGION_BOUNDS.india.zoom,
      minZoom: 3.5,
      maxZoom: 16,
      attributionControl: true,
    });

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    map.on("error", (e) => {
      // Graceful fallback to raster style if style.json fails
      if (map.getStyle() !== FALLBACK_DARK_STYLE) {
        console.warn("Falling back to standard raster dark tiles", e);
        map.setStyle(FALLBACK_DARK_STYLE);
      }
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

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
      const isSelected = selectedIncident && selectedIncident.id === item.id;
      const config = DISASTER_COLORS[item.disasterType] || { hex: "#38bdf8", label: item.disasterType };
      const isCritical = item.severity === "critical";
      const isHigh = item.severity === "high";

      // Marker element
      const el = document.createElement("div");
      el.className = "cursor-pointer transition-transform duration-200 hover:scale-125 z-10";

      // Calculate size based on severity
      const sizePx = isCritical ? 34 : isHigh ? 28 : 22;
      const pulseHtml = isCritical
        ? `<span class="absolute -inset-1.5 rounded-full animate-ping opacity-60" style="background-color: ${config.hex};"></span>`
        : "";

      el.innerHTML = `
        <div class="relative flex items-center justify-center" style="width: ${sizePx}px; height: ${sizePx}px;">
          ${pulseHtml}
          <div class="relative flex items-center justify-center rounded-full shadow-lg border-2" 
               style="width: ${sizePx}px; height: ${sizePx}px; background-color: ${config.hex}22; border-color: ${
        isSelected ? "#ffffff" : config.hex
      }; box-shadow: 0 0 ${isSelected ? "16px #38bdf8" : "8px " + config.hex + "88"};">
            <span class="rounded-full" style="width: ${sizePx * 0.45}px; height: ${
        sizePx * 0.45
      }px; background-color: ${config.hex};"></span>
          </div>
        </div>
      `;

      // Popup preview on hover
      const popupHtml = `
        <div class="p-2.5 max-w-[220px] text-xs">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-2 h-2 rounded-full" style="background-color: ${config.hex}"></span>
            <span class="font-bold uppercase tracking-wider text-[10px]" style="color: ${config.hex}">${
        item.disasterType
      }</span>
            <span class="ml-auto text-[10px] font-mono text-slate-400">${item.severity.toUpperCase()}</span>
          </div>
          <div class="font-semibold text-white leading-tight mb-1">${item.title}</div>
          <div class="text-[11px] text-slate-300">📍 ${item.location}</div>
          <div class="text-[10px] text-emerald-400 font-mono mt-1">Confidence: ${Math.round(
            item.confidenceScore * 100
          )}%</div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 16,
        closeButton: false,
        className: "disaster-map-popup",
      }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([item.longitude, item.latitude])
        .setPopup(popup)
        .addTo(map);

      // Event listeners
      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());
      el.addEventListener("click", () => {
        onSelectIncident(item);
        map.flyTo({
          center: [item.longitude, item.latitude],
          zoom: Math.max(map.getZoom(), 8.5),
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      });

      markersRef.current.push(marker);
    });
  }, [incidents, mapLoaded, activeFilter, selectedIncident, onSelectIncident]);

  // Center on selected incident if triggered externally
  useEffect(() => {
    if (!selectedIncident || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [selectedIncident.longitude, selectedIncident.latitude],
      zoom: 9.0,
      speed: 1.4,
      essential: true,
    });
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
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
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
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
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

      {/* Region Presets Toolbar (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-lg text-[11px]">
        <span className="px-2 py-1 text-slate-400 font-medium">GIS Focus:</span>
        {Object.keys(REGION_BOUNDS).map((key) => (
          <button
            key={key}
            onClick={() => handleRegionChange(key)}
            className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
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
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 ml-1"
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
          <span className="text-[10px] font-mono text-emerald-400">Active Feed</span>
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
