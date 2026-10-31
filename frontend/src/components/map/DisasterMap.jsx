import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Globe,
  Map as MapIcon,
  Compass,
} from "lucide-react";
import { DISASTER_COLORS } from "../../data/mockDisasters";

/**
 * Satellite Aerial Basemaps
 * High-resolution Esri World Imagery (Exact look as in reference screenshot)
 */

// 1. Primary Default: Esri Satellite Aerial Imagery Reconnaissance
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

// 2. Esri World Dark Gray Canvas
const ESRI_DARK_STYLE = {
  version: 8,
  sources: {
    "esri-dark-base": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "&copy; Esri, DeLorme, NAVTEQ",
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

// 3. OpenStreetMap
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
  satellite: { name: "Satellite", icon: Globe, style: ESRI_SATELLITE_STYLE },
  dark: { name: "Dark GIS", icon: Layers, style: ESRI_DARK_STYLE },
  osm: { name: "Streets", icon: MapIcon, style: OSM_STYLE },
};

export function DisasterMap({
  incidents = [],
  selectedIncident,
  onSelectIncident,
  className = "",
  fullHeight = true,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeStyleKey, setActiveStyleKey] = useState("satellite");
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on Northern & Central India / active coordinates
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: ESRI_SATELLITE_STYLE,
      center: [76.85, 30.72], // Tri-City / Punjab / Himachal hills region
      zoom: 6.8,
      minZoom: 3.5,
      maxZoom: 19,
      attributionControl: false,
    });

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

  const handleStyleChange = (styleKey) => {
    if (!mapRef.current || styleKey === activeStyleKey) return;
    setActiveStyleKey(styleKey);
    const chosen = MAP_STYLES[styleKey];
    if (chosen) {
      mapRef.current.setStyle(chosen.style);
    }
    setShowLayerMenu(false);
  };

  const zoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const zoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 300);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [fullHeight]);

  // Update incident markers on the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    incidents.forEach((item) => {
      const lng = Number(item.longitude);
      const lat = Number(item.latitude);
      if (isNaN(lng) || isNaN(lat) || (lng === 0 && lat === 0)) return;

      const isSelected = selectedIncident && selectedIncident.id === item.id;
      const isCritical = item.severity === "critical";

      // Marker letter and color matching reference screenshot:
      // F (Flood - Red/Orange), F (Fire - Red), M (Medical - Amber), L (Landslide - Brown/Orange), A (Accident - Yellow), C (Cyclone - Blue)
      let letter = "F";
      let pinColor = "#EF4444"; // red default

      const type = (item.disasterType || "").toLowerCase();
      if (type.includes("flood")) {
        letter = "F";
        pinColor = isCritical ? "#EF4444" : "#3B82F6";
      } else if (type.includes("fire")) {
        letter = "F";
        pinColor = "#EF4444";
      } else if (type.includes("landslide")) {
        letter = "L";
        pinColor = "#F97316";
      } else if (type.includes("cyclone")) {
        letter = "C";
        pinColor = "#06B6D4";
      } else if (type.includes("rain")) {
        letter = "R";
        pinColor = "#3B82F6";
      } else if (type.includes("earthquake")) {
        letter = "E";
        pinColor = "#EF4444";
      } else {
        letter = "!";
        pinColor = "#10B981";
      }

      const el = document.createElement("div");
      el.className = "cursor-pointer transition-transform duration-150 hover:scale-125 z-10";

      // Exact Circular Pins from Reference Screenshot:
      // Solid white outer border, vibrant inner color with bold letter
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${
            isCritical
              ? `<span class="absolute -inset-1 rounded-full animate-ping opacity-75" style="background-color: ${pinColor};"></span>`
              : ""
          }
          <div class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-bold text-[10px] text-white shadow-lg"
               style="background-color: ${pinColor}; ${
        isSelected ? "box-shadow: 0 0 16px #38BDF8; transform: scale(1.2);" : ""
      }">
            ${letter}
          </div>
        </div>
      `;

      // Popup
      const popupHtml = `
        <div class="p-2.5 max-w-[220px] text-xs font-sans bg-[#0F172A] text-white border border-[#334155] rounded-lg shadow-xl">
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="font-bold uppercase tracking-wider text-[10px]" style="color: ${pinColor}">${item.disasterType}</span>
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#1E293B] text-slate-300 font-bold">${item.severity?.toUpperCase()}</span>
          </div>
          <div class="font-semibold text-slate-100 leading-tight mb-1 text-xs">${item.title}</div>
          <div class="text-[11px] text-slate-400">📍 ${item.location}</div>
          <div class="mt-1.5 pt-1.5 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono">
            <span class="text-[#38BDF8] font-bold">Confidence: ${Math.round((item.confidenceScore || 0.85) * 100)}%</span>
            <span class="text-[#10B981]">2 Units</span>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 12,
        closeButton: false,
        className: "crisis-map-popup",
      }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());
      el.addEventListener("click", () => {
        if (onSelectIncident) onSelectIncident(item);
        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), 8.5),
          speed: 1.2,
          essential: true,
        });
      });

      markersRef.current.push(marker);
    });
  }, [incidents, mapLoaded, selectedIncident, onSelectIncident, activeStyleKey]);

  // Center on selected incident externally
  useEffect(() => {
    if (!selectedIncident || !mapRef.current) return;
    const lng = Number(selectedIncident.longitude);
    const lat = Number(selectedIncident.latitude);
    if (!isNaN(lng) && !isNaN(lat) && (lng !== 0 || lat !== 0)) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 9.0,
        speed: 1.3,
        essential: true,
      });
    }
  }, [selectedIncident]);

  return (
    <div className={`relative w-full h-full min-h-[480px] bg-[#0A0F1D] overflow-hidden ${className}`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left Floating LIVE Pill (From Reference Screenshot) */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#0B1220]/90 backdrop-blur-md border border-[#1E293B] px-2.5 py-1 rounded-full shadow-lg">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
        <span className="text-[11px] font-bold tracking-wider uppercase text-white font-mono">LIVE</span>
      </div>

      {/* Top Right: Layers and Zoom Controls (From Reference Screenshot) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-1.5 bg-[#0B1220]/90 backdrop-blur-md border border-[#1E293B] hover:border-[#38BDF8] px-2.5 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Layers</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-[#0B1220] border border-[#1E293B] rounded-lg shadow-xl overflow-hidden text-xs py-1 z-30">
              {Object.entries(MAP_STYLES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handleStyleChange(key)}
                  className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#1E293B] transition-colors ${
                    activeStyleKey === key ? "text-[#38BDF8] font-bold bg-[#131D31]" : "text-slate-300"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Controls + / - (From Reference Screenshot) */}
        <div className="flex flex-col bg-[#0B1220]/90 backdrop-blur-md border border-[#1E293B] rounded-lg overflow-hidden shadow-lg">
          <button
            onClick={zoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors border-b border-[#1E293B] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
