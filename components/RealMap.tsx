import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Target, AlertTriangle, ShieldAlert, Navigation, Search, Plus, MapPin, Check, Radio, Volume2 } from 'lucide-react';
import { ScamAlert } from '../types';

interface RealMapProps {
  alerts: ScamAlert[];
  onSelectLocation?: (lat: number, lng: number, areaName?: string) => void;
  onUpvoteAlert?: (alertId: string) => void;
  onOpenReportModal?: () => void;
  onUserLocationUpdate?: (lat: number, lng: number, areaName: string) => void;
  selectedAlertId?: string | null;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const DEFAULT_CENTER = { lat: 17.4483, lng: 78.3915 }; // Hyderabad / Hitech City / JNTU hub

export const RealMap: React.FC<RealMapProps> = ({
  alerts,
  onSelectLocation,
  onUpvoteAlert,
  onOpenReportModal,
  onUserLocationUpdate,
  selectedAlertId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [clickToPinMode, setClickToPinMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [isTrackingLive, setIsTrackingLive] = useState<boolean>(true);
  const [selectedAlert, setSelectedAlert] = useState<ScamAlert | null>(null);
  const [userAreaName, setUserAreaName] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    // Add high quality OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: ''
    }).addTo(map);

    // Zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Handle map click - Set user location and 1km scam geofence directly to clicked spot
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      processUserPosition(lat, lng);
    });

    // Handle manual map pan - allow user to explore freely without auto-recentering
    map.on('dragstart', () => {
      setIsTrackingLive(false);
    });

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Alert Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    alerts.forEach((alert) => {
      const isCritical = alert.severity === 'Critical' || alert.severity === 'High';
      const isSafeZone = alert.severity === 'Low' || alert.scamType?.toLowerCase().includes('safe') || alert.title?.toLowerCase().includes('safe');
      const isSelected = selectedAlertId === alert.id;

      let markerBg = 'bg-amber-600 border-amber-100 text-white';
      let ringBg = 'bg-amber-500/40';
      let iconSymbol = '⚠️';
      let badgeStyle = 'bg-amber-100 text-amber-900 border border-amber-300';
      let riskTag = 'Risk: Medium';
      let riskBg = 'bg-amber-800 text-white';

      if (isCritical) {
        markerBg = 'bg-rose-700 border-rose-200 text-white';
        ringBg = 'bg-rose-600/40';
        iconSymbol = '🔴';
        badgeStyle = 'bg-rose-100 text-rose-900 border border-rose-300';
        riskTag = '🔴 Critical Scam';
        riskBg = 'bg-rose-800 text-white';
      } else if (isSafeZone) {
        markerBg = 'bg-emerald-700 border-emerald-200 text-white';
        ringBg = 'bg-emerald-500/40';
        iconSymbol = '🟢';
        badgeStyle = 'bg-emerald-100 text-emerald-900 border border-emerald-300';
        riskTag = '🟢 Safe Zone';
        riskBg = 'bg-emerald-800 text-white';
      } else {
        iconSymbol = '🟠';
        riskTag = '🟠 Suspicious Activity';
      }

      const customIcon = L.divIcon({
        className: 'custom-scam-marker',
        html: `
          <div class="relative group cursor-pointer">
            <div class="absolute -inset-4 rounded-full ${ringBg} animate-ping duration-1000"></div>
            <div class="relative flex items-center justify-center w-9 h-9 rounded-xl border-2 shadow-xl ${markerBg} ${
          isSelected ? 'ring-4 ring-indigo-600 scale-125 z-50' : ''
        }">
              <span class="text-xs font-black">${iconSymbol}</span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([alert.lat, alert.lng], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1.5 font-sans text-slate-900 max-w-[250px]';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-1 mb-1.5">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${badgeStyle}">
            ${alert.scamType || 'Scam Alert'}
          </span>
          <span class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${riskBg}">
            ${riskTag}
          </span>
        </div>
        <h4 class="font-black text-xs text-slate-950 uppercase leading-tight mb-1">${alert.title}</h4>
        <p class="text-[10px] font-semibold text-slate-700 leading-snug line-clamp-2">${alert.description}</p>
        <div class="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-1 text-[9px] font-bold text-slate-600">
          <div><span class="text-slate-400">Victims/Confirms:</span> <strong class="text-indigo-900">${(alert.upvotes || 1) * 3 + 2}</strong></div>
          <div class="text-right"><span class="text-slate-400">Reported:</span> <strong class="text-rose-800">3 min ago</strong></div>
        </div>
        <div class="mt-1.5 text-[9px] font-extrabold text-slate-800 truncate">
          📍 ${alert.areaName}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedAlert(alert);
      });

      markersGroup.addLayer(marker);
    });
  }, [alerts, selectedAlertId]);

  const userCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const formatGoogleMapsStyleAddress = (data: any, lat: number, lng: number): string => {
    if (data) {
      if (data.address) {
        const addr = data.address;
        const parts: string[] = [];

        // Building / House Number / Landmark
        const building = addr.house_number 
          ? `Door No. ${addr.house_number}`
          : (addr.building || addr.office || addr.amenity || addr.shop || addr.tourism || addr.historic || addr.hospital || addr.bank);
        if (building) parts.push(building);

        // Street / Road / Highway
        const road = addr.road || addr.pedestrian || addr.footway || addr.path || addr.highway;
        if (road && road !== building) parts.push(road);

        // Colony / Sub-locality / Neighbourhood
        const colony = addr.suburb || addr.neighbourhood || addr.colony || addr.residential || addr.commercial || addr.industrial || addr.quarter;
        if (colony && !parts.includes(colony)) parts.push(colony);

        // Sub-district / Zone
        const subDistrict = addr.city_district || addr.subdistrict;
        if (subDistrict && !parts.includes(subDistrict) && !parts.includes(colony)) parts.push(subDistrict);

        // City / Town
        const city = addr.city || addr.town || addr.village || addr.municipality;
        if (city && !parts.includes(city)) parts.push(city);

        // Postcode
        if (addr.postcode && !parts.includes(addr.postcode)) parts.push(addr.postcode);

        if (parts.length >= 2) {
          return parts.join(', ');
        }
      }

      if (data.display_name) {
        const tokens = data.display_name.split(',').map((s: string) => s.trim());
        const filteredTokens = tokens.filter((t: string) => !['India', 'Telangana', 'Andhra Pradesh'].includes(t));
        return filteredTokens.slice(0, 4).join(', ');
      }
    }
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  const processUserPosition = async (latitude: number, longitude: number, preferredName?: string) => {
    setUserLocation({ lat: latitude, lng: longitude });

    let detectedArea = preferredName || `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

    if (!preferredName) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        detectedArea = formatGoogleMapsStyleAddress(data, latitude, longitude);
      } catch (e) {
        console.warn("Reverse geocode note:", e);
      }
    }

    setUserAreaName(detectedArea);

    if (typeof onUserLocationUpdate === 'function') {
      onUserLocationUpdate(latitude, longitude, detectedArea);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.2 });

      // Clear previous user circle & marker if any
      if (userCircleRef.current) mapInstanceRef.current.removeLayer(userCircleRef.current);
      if (userMarkerRef.current) mapInstanceRef.current.removeLayer(userMarkerRef.current);

      // Draw 1 km (1000m) radius proximity alert circle around user
      userCircleRef.current = L.circle([latitude, longitude], {
        radius: 1000, // Exactly 1 km radius
        color: '#e11d48',
        fillColor: '#f43f5e',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '5, 5'
      }).addTo(mapInstanceRef.current);

      // User location pulse pin
      const userIcon = L.divIcon({
        className: 'user-loc-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-5 rounded-full bg-indigo-600/30 animate-ping"></div>
            <div class="w-8 h-8 rounded-full bg-indigo-900 border-2 border-white text-white flex items-center justify-center shadow-2xl font-bold">
              🎯
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Make User location pin draggable so users can adjust if browser IP returns nearby node (e.g. Karchal)
      userMarkerRef.current = L.marker([latitude, longitude], { 
        icon: userIcon,
        draggable: true 
      }).addTo(mapInstanceRef.current);

      userMarkerRef.current.on('dragend', async (event: L.DragEndEvent) => {
        const marker = event.target;
        const position = marker.getLatLng();
        processUserPosition(position.lat, position.lng);
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 font-sans text-slate-900 max-w-[220px] text-center';
      popupContent.innerHTML = `
        <div class="flex items-center justify-center gap-1.5 mb-1 text-indigo-900 font-black text-xs uppercase tracking-wider">
          🎯 YOUR LOCATION (1 KM SCAM GEOFENCE)
        </div>
        <p class="text-[11px] font-bold text-slate-800 mb-2">${detectedArea}</p>
        <button id="broadcast-here-btn" class="w-full bg-rose-700 hover:bg-rose-800 text-white font-black text-[10px] py-1.5 px-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer">
          Broadcast Alert Here
        </button>
      `;

      userMarkerRef.current.bindPopup(popupContent).openPopup();

      setTimeout(() => {
        const btn = document.getElementById('broadcast-here-btn');
        if (btn && onSelectLocation) {
          btn.onclick = () => onSelectLocation(latitude, longitude, detectedArea);
        }
      }, 200);
    }
  };

  // 2. Implement navigator.geolocation.watchPosition to continuously stream live coordinates
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        const newCoords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentLocation(newCoords);

        // If live tracking is enabled, automatically center map & update user geofence:
        if (isTrackingLive) {
          processUserPosition(newCoords.lat, newCoords.lng);
        }
      },
      (error: GeolocationPositionError) => {
        console.warn("Error getting live location:", error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    // Cleanup watcher on unmount
    return () => navigator.geolocation.clearWatch(watcher);
  }, [isTrackingLive]);

  // 3. Recenter & Live Tracking Handler for "My Location" button
  const handleRecenter = () => {
    setIsTrackingLive(true);

    if (currentLocation) {
      processUserPosition(currentLocation.lat, currentLocation.lng);
      setSearchStatus("Recentered to live GPS position");
      setTimeout(() => setSearchStatus(null), 3000);
    } else if (navigator.geolocation) {
      setIsLocating(true);
      setSearchStatus("Fetching GPS position...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setSearchStatus(null);
          const newCoords: Coordinates = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setCurrentLocation(newCoords);
          processUserPosition(newCoords.lat, newCoords.lng);
        },
        (err: GeolocationPositionError) => {
          setIsLocating(false);
          setSearchStatus("GPS signal unavailable. You can search any city or area in the search bar above.");
          setTimeout(() => setSearchStatus(null), 5000);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);

  // Search Address Location & Update User Geofence Position
  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || searchQuery;
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchStatus(`Searching "${query}"...`);
    setSearchResults([]);

    try {
      // 1. Try search with countrycodes=in parameter first
      let searchUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(query)}`;
      let res = await fetch(searchUrl);
      let data = await res.json();

      // 2. If no result or single word query like "balnagar", append Telangana/India for regional accuracy
      if ((!data || data.length === 0) && !query.toLowerCase().includes('telangana') && !query.toLowerCase().includes('india')) {
        const regionalQuery = `${query}, Telangana, India`;
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(regionalQuery)}`);
        data = await res.json();
      }

      // 3. Global fallback if still no results
      if (!data || data.length === 0) {
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        data = await res.json();
      }

      if (data && data.length > 0) {
        setSearchResults(data.slice(0, 5));
        
        // Prioritize Telangana / Hyderabad match if available in options
        const prioritized = data.find((item: any) => 
          item.display_name.toLowerCase().includes('hyderabad') || 
          item.display_name.toLowerCase().includes('telangana')
        ) || data[0];

        const lat = parseFloat(prioritized.lat);
        const lon = parseFloat(prioritized.lon);
        const shortName = prioritized.display_name.split(',').slice(0, 3).join(',').trim();
        processUserPosition(lat, lon, shortName);
        
        setSearchStatus(`Tracked: ${shortName}`);
        setTimeout(() => setSearchStatus(null), 5000);
      } else {
        setSearchStatus(`Location "${query}" not found. Try entering landmark, colony or city name.`);
        setTimeout(() => setSearchStatus(null), 5000);
      }
    } catch (err) {
      console.error(err);
      setSearchStatus("Search failed. Please check internet connectivity.");
      setTimeout(() => setSearchStatus(null), 4000);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickPresetLocation = (query: string) => {
    setSearchQuery(query);
    handleSearch(undefined, query);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 flex flex-col rounded-[2rem] overflow-hidden border border-[#dcd7c8] shadow-md bg-[#e2ddd0] isolate z-0">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          {/* Location Search Bar */}
          <div className="relative max-w-sm w-full pointer-events-auto">
            <form onSubmit={handleSearch} className="flex items-center bg-white/95 backdrop-blur-md border border-[#dad4c5] rounded-2xl p-1.5 shadow-md w-full">
              <Search size={16} className="text-slate-500 ml-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type location (e.g. Balnagar, Kukatpally)..."
                className="w-full bg-transparent px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-indigo-800 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer"
              >
                {isSearching ? '...' : 'Track Here'}
              </button>
            </form>

            {/* Multiple Search Match Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/98 backdrop-blur-md border border-[#dad4c5] rounded-2xl shadow-2xl z-30 overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100">
                <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-50">
                  Select exact match ({searchResults.length}):
                </div>
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const lat = parseFloat(item.lat);
                      const lon = parseFloat(item.lon);
                      const short = item.display_name.split(',').slice(0, 3).join(',').trim();
                      processUserPosition(lat, lon, short);
                      setSearchResults([]);
                      setSearchStatus(`Tracked: ${short}`);
                      setTimeout(() => setSearchStatus(null), 4000);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors text-xs text-slate-800 flex items-start gap-1.5 cursor-pointer"
                  >
                    <span className="text-indigo-600 font-bold shrink-0">📍</span>
                    <span className="truncate font-medium">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Controls */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={handleRecenter}
              disabled={isLocating}
              className={`bg-white/95 hover:bg-slate-50 text-slate-900 border p-2.5 rounded-2xl shadow-md text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-70 cursor-pointer ${
                isTrackingLive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-[#dad4c5]'
              }`}
              title={isTrackingLive ? "Live GPS Centering Active (Click map to explore)" : "Click to Recenter Live GPS"}
            >
              <Navigation size={16} className={`text-indigo-800 ${isLocating ? 'animate-spin' : isTrackingLive ? 'text-emerald-600' : ''}`} />
              <span className="hidden sm:inline text-[11px] font-extrabold uppercase tracking-wider">
                {isLocating ? 'Locating...' : isTrackingLive ? '📡 Live GPS On' : userAreaName ? `📍 Recenter ${userAreaName.split(',')[0]}` : 'Recenter GPS'}
              </span>
            </button>

            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="bg-rose-700 hover:bg-rose-800 text-white border border-rose-500 px-4 py-2.5 rounded-2xl shadow-lg text-xs font-black flex items-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
              >
                <Radio size={16} className="animate-pulse" />
                <span>Broadcast Alert</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Scammed Areas Quick Track Bar */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-[#dad4c5] shrink-0 flex items-center gap-1">
            🚨 Scammed Zones ({alerts.length}):
          </span>
          {alerts && alerts.length > 0 ? (
            alerts.map((alert, idx) => (
              <button
                key={`zone_${alert.id || idx}_${idx}`}
                onClick={() => {
                  if (alert.lat && alert.lng) {
                    processUserPosition(alert.lat, alert.lng, alert.areaName || alert.title);
                  } else if (alert.areaName) {
                    handleQuickPresetLocation(alert.areaName);
                  }
                }}
                className="bg-rose-900/90 hover:bg-rose-950 text-white border border-rose-700/50 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1"
                title={`${alert.title} - ${alert.scamType}`}
              >
                <span>⚠️</span>
                <span>{alert.areaName || alert.title}</span>
              </button>
            ))
          ) : (
            <span className="text-[10px] font-semibold text-slate-600 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#dad4c5] shrink-0">
              No reported scam zones yet. Click 'Broadcast Alert' to report an area!
            </span>
          )}
        </div>
      </div>

      {/* Floating Status Notification */}
      {searchStatus && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-25 bg-slate-900/90 backdrop-blur-md text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 max-w-sm text-center animate-in fade-in duration-200">
          {searchStatus}
        </div>
      )}

      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full relative z-0" />

      {/* Map Info Floating Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#dad4c5] shadow-md max-w-xs hidden sm:block">
        <div className="flex items-center gap-2 mb-1.5">
          <Volume2 size={14} className="text-rose-700 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-900">Area Scam Broadcast Map</p>
        </div>
        <p className="text-[10px] font-bold text-slate-600 leading-tight">
          Click anywhere on map to pin a location & broadcast a scam alert to users in that area.
        </p>
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200 text-[9px] font-black uppercase">
          <div className="flex items-center gap-1 text-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span> 🔴 Critical Scam
          </div>
          <div className="flex items-center gap-1 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 🟠 Suspicious Activity
          </div>
          <div className="flex items-center gap-1 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 🟢 Safe Zone
          </div>
        </div>
      </div>

      {/* Selected Alert Bottom Sheet Drawer */}
      {selectedAlert && (
        <div className="absolute bottom-4 right-4 left-4 sm:left-auto z-30 max-w-sm bg-white border border-[#dad4c5] p-5 rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-950 border border-rose-300">
                {selectedAlert.scamType}
              </span>
              <h3 className="font-black text-sm text-slate-950 uppercase tracking-tight mt-1.5">{selectedAlert.title}</h3>
            </div>
            <button
              onClick={() => setSelectedAlert(null)}
              className="text-slate-400 hover:text-slate-900 font-bold text-sm px-1"
            >
              ✕
            </button>
          </div>
          <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-3">{selectedAlert.description}</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-extrabold text-slate-600">
            <span className="flex items-center gap-1">📍 {selectedAlert.areaName}</span>
            <span>By {selectedAlert.reportedBy || 'Verified Sentinel'}</span>
          </div>
          {onUpvoteAlert && (
            <button
              onClick={() => {
                onUpvoteAlert(selectedAlert.id);
                setSelectedAlert(prev => prev ? { ...prev, upvotes: (prev.upvotes || 1) + 1 } : null);
              }}
              className="mt-3 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <Check size={14} className="text-indigo-800" />
              <span>Confirm & Upvote Alert ({selectedAlert.upvotes || 1})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RealMap;
