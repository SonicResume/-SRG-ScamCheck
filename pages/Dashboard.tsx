import React, { useEffect, useState } from 'react';
import Gauge from '../components/Gauge';
import RealMap from '../components/RealMap';
import { Map as MapIcon, Activity, Radio, Plus, X, AlertTriangle, ShieldAlert, Send, CheckCircle2, Megaphone, MapPin, Users, Clock, Zap, ShieldCheck, Flame } from 'lucide-react';
import { ScamAlert } from '../types';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

interface DashboardProps {
  auditCount: number;
  onAddNotification?: (notification: any) => void;
}

const DEMO_ALERTS: ScamAlert[] = [];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const Dashboard: React.FC<DashboardProps> = ({ auditCount, onAddNotification }) => {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [systemLoad, setSystemLoad] = useState(12);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Proximity alert state
  const [activeProximityAlert, setActiveProximityAlert] = useState<{ alert: ScamAlert; distance: number; userArea: string } | null>(null);

  // New alert form state
  const [formArea, setFormArea] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string; address?: any }>>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('UPI QR Impersonation');
  const [customFormType, setCustomFormType] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSeverity, setFormSeverity] = useState<'Medium' | 'High' | 'Critical'>('Critical');
  const [formLat, setFormLat] = useState<number>(17.4483);
  const [formLng, setFormLng] = useState<number>(78.3915);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle location update and calculate distance to all reported scam areas within 1km radius
  const handleUserLocationUpdate = (lat: number, lng: number, areaName: string) => {
    setFormLat(lat);
    setFormLng(lng);
    if (areaName && areaName.trim()) {
      setFormArea(areaName);
    }

    const nearby = alerts
      .map(a => ({
        alert: a,
        distance: getDistanceKm(lat, lng, a.lat, a.lng)
      }))
      .filter(item => item.distance <= 1.0) // Strictly within 1 km radius
      .sort((a, b) => a.distance - b.distance);

    if (nearby.length > 0) {
      const closest = nearby[0];
      setActiveProximityAlert({
        alert: closest.alert,
        distance: closest.distance,
        userArea: areaName
      });

      // Play Voice Alert if browser speech is available
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(
          `Security Alert! You are within 1 kilometer of an active scam zone near ${closest.alert.areaName}. Threat: ${closest.alert.title}`
        );
        speech.rate = 1.0;
        window.speechSynthesis.speak(speech);
      }

      // Add to Header Notifications Dropdown
      if (onAddNotification) {
        onAddNotification({
          id: Date.now(),
          title: `🚨 1KM SCAM ZONE DETECTED: ${closest.alert.areaName}`,
          message: `Distance: ${closest.distance} km away. Threat type: ${closest.alert.scamType}. ${closest.alert.description}`,
          type: 'proximity',
          read: false
        });
      }
    } else {
      setActiveProximityAlert(null);
    }
  };

  // Firestore Realtime Subscription for Area Scam Alerts
  useEffect(() => {
    try {
      const q = query(collection(db, 'scam_alerts'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const rawAlerts: ScamAlert[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ScamAlert));

          const seen = new Set<string>();
          const loadedAlerts = rawAlerts.filter(a => {
            if (!a.id || seen.has(a.id)) return false;
            seen.add(a.id);
            return true;
          });

          setAlerts(loadedAlerts);
        } else {
          setAlerts([]);
        }
      }, (err) => {
        console.warn("Firestore subscription note:", err);
        setAlerts([]);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error(e);
      setAlerts([]);
    }
  }, []);

  // Live street-level address suggestions handler
  useEffect(() => {
    if (!formArea || formArea.trim().length < 3) {
      setAddressSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        let query = formArea.trim();
        if (!query.toLowerCase().includes('india') && !query.toLowerCase().includes('telangana')) {
          query += ', Telangana, India';
        }
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setAddressSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn("Address autocomplete note:", err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formArea]);

  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
    handleFetchCurrentLocationForForm();
  };

  const handleSelectLocation = (lat: number, lng: number, areaName?: string) => {
    setFormLat(lat);
    setFormLng(lng);
    if (areaName) {
      setFormArea(areaName);
    }
    setIsReportModalOpen(true);
  };

  const formatAddress = (data: any, lat: number, lng: number): string => {
    if (data) {
      if (data.address) {
        const addr = data.address;
        const parts: string[] = [];

        const building = addr.house_number 
          ? `Door No. ${addr.house_number}`
          : (addr.building || addr.office || addr.amenity || addr.shop || addr.tourism || addr.historic || addr.hospital || addr.bank);
        if (building) parts.push(building);

        const road = addr.road || addr.pedestrian || addr.footway || addr.path || addr.highway;
        if (road && road !== building) parts.push(road);

        const colony = addr.suburb || addr.neighbourhood || addr.colony || addr.residential || addr.commercial || addr.industrial || addr.quarter;
        if (colony && !parts.includes(colony)) parts.push(colony);

        const subDistrict = addr.city_district || addr.subdistrict;
        if (subDistrict && !parts.includes(subDistrict) && !parts.includes(colony)) parts.push(subDistrict);

        const city = addr.city || addr.town || addr.village || addr.municipality;
        if (city && !parts.includes(city)) parts.push(city);

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

  const handleFetchCurrentLocationForForm = () => {
    if (!navigator.geolocation) return;
    setIsDetectingLocation(true);

    const processPosition = async (lat: number, lng: number) => {
      setFormLat(lat);
      setFormLng(lng);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const address = formatAddress(data, lat, lng);
        setFormArea(address);
      } catch (e) {
        console.warn("Form reverse geocode error:", e);
      } finally {
        setIsDetectingLocation(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => processPosition(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        console.warn("High accuracy GPS note, trying coarse position...", err);
        navigator.geolocation.getCurrentPosition(
          (pos) => processPosition(pos.coords.latitude, pos.coords.longitude),
          (err2) => {
            console.warn("Fallback geolocation note:", err2);
            setIsDetectingLocation(false);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    setIsSubmitting(true);

    let targetLat = formLat;
    let targetLng = formLng;

    // Dynamically geocode formArea if entered by user so lat/lng match the exact landmark/area
    if (formArea.trim()) {
      try {
        let query = formArea.trim();
        if (!query.toLowerCase().includes('telangana') && !query.toLowerCase().includes('india')) {
          query += ', Telangana, India';
        }
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          targetLat = parseFloat(geoData[0].lat);
          targetLng = parseFloat(geoData[0].lon);
        }
      } catch (err) {
        console.warn("Geocoding form area note:", err);
      }
    }

    const finalScamType = formType === 'Other' ? (customFormType.trim() || 'Custom Fraud') : formType;

    const newAlertData = {
      title: formTitle,
      scamType: finalScamType,
      description: formDescription,
      areaName: formArea,
      lat: targetLat,
      lng: targetLng,
      severity: formSeverity,
      reportedBy: 'Verified Sentinel',
      createdAt: new Date().toISOString(),
      upvotes: 1
    };

    try {
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'scam_alerts'), {
        ...newAlertData,
        createdAt: serverTimestamp()
      });

      const createdAlert: ScamAlert = {
        id: docRef.id,
        ...newAlertData
      };

      setAlerts(prev => {
        if (prev.some(a => a.id === createdAlert.id)) return prev;
        return [createdAlert, ...prev];
      });
      setIsReportModalOpen(false);
      
      // Reset form
      setFormTitle('');
      setFormDescription('');
      
      // Trigger notification toast
      setToastMessage(`🚨 ALERT BROADCASTED ACROSS ${formArea.toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error("Error broadcasting alert:", err);
      // Fallback local update
      const localAlert: ScamAlert = {
        id: 'alert_' + Date.now(),
        ...newAlertData
      };
      setAlerts(prev => [localAlert, ...prev]);
      setIsReportModalOpen(false);
      setToastMessage(`🚨 ALERT BROADCASTED ACROSS ${formArea.toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvoteAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, upvotes: (a.upvotes || 1) + 1 } : a));
    try {
      const alertRef = doc(db, 'scam_alerts', alertId);
      await updateDoc(alertRef, { upvotes: increment(1) });
    } catch (err) {
      console.error("Upvote error:", err);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-rose-800 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top border-2 border-rose-400">
          <div className="flex items-center gap-3">
            <Megaphone size={20} className="animate-bounce text-amber-300" />
            <span className="font-black text-xs md:text-sm tracking-wider uppercase">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:text-slate-200 font-bold">✕</button>
        </div>
      )}

      {/* Proximity Scam Warning Banner */}
      {activeProximityAlert && (
        <div className="bg-rose-950 text-white border-2 border-rose-500 p-5 md:p-6 rounded-[2rem] shadow-2xl animate-pulse space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-rose-600 rounded-2xl text-white shrink-0 animate-bounce">
                <ShieldAlert size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider">
                    🚨 ENTERED SCAM ZONE ({activeProximityAlert.distance} KM AWAY)
                  </span>
                  <span className="text-[10px] text-rose-300 font-bold uppercase">{activeProximityAlert.alert.scamType}</span>
                </div>
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white mt-1">
                  WARNING: Active Scam Reported in {activeProximityAlert.alert.areaName}
                </h3>
              </div>
            </div>
            <button 
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setActiveProximityAlert(null);
              }}
              className="bg-white text-rose-950 hover:bg-slate-100 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shrink-0 cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </div>
          <p className="text-xs font-semibold text-rose-100 bg-rose-900/60 p-3 rounded-xl border border-rose-700/60 leading-relaxed">
            {activeProximityAlert.alert.description}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
        <div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic leading-none mb-2 text-slate-950">
            Digital Forensic <span className="text-indigo-800">Intelligence</span>
          </h2>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-3 md:gap-4 items-center">
           <button 
             onClick={handleOpenReportModal}
             className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-800 hover:to-red-700 text-white px-7 py-4 rounded-2xl shadow-2xl shadow-rose-900/30 font-black text-sm uppercase tracking-wider flex items-center gap-3 border-2 border-rose-400 ring-4 ring-rose-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer group animate-pulse"
           >
             <Radio size={20} className="text-amber-300 group-hover:scale-125 transition-transform" />
             <span>📢 Broadcast Scam Intelligence Alert</span>
           </button>
        </div>
      </div>

      {/* Dynamic Summary Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#dcd7c8] p-4 rounded-2xl shadow-xs hover:border-rose-300 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-800 flex items-center justify-center shrink-0">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Scams Reported</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-950 italic">{alerts.length}</span>
              <span className="text-[9px] font-bold text-rose-700">
                {alerts.filter(a => a.severity === 'Critical' || a.severity === 'High').length} High Risk
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#dcd7c8] p-4 rounded-2xl shadow-xs hover:border-indigo-300 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-800 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Active Alerts</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-950 italic">{alerts.length}</span>
              <span className="text-[9px] font-bold text-indigo-700">
                {alerts.filter(a => a.severity === 'Critical').length} Critical
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#dcd7c8] p-4 rounded-2xl shadow-xs hover:border-amber-300 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <MapPin size={20} className="animate-bounce" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Nearby Active Alerts</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-950 italic">{alerts.length}</span>
              <span className="text-[9px] font-bold text-amber-800">In Neighborhood</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#dcd7c8] p-4 rounded-2xl shadow-xs hover:border-emerald-300 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Community Confirms</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-950 italic">
                {alerts.reduce((sum, a) => sum + (a.upvotes || 1), 0)}
              </span>
              <span className="text-[9px] font-bold text-emerald-800">Verified Votes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        {/* Real Map Section */}
        <div className="lg:col-span-8 bg-white border border-[#dcd7c8] p-6 md:p-8 rounded-[2rem] flex flex-col shadow-xs h-full min-h-[550px]">
           <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#f0ece1] flex items-center justify-center text-indigo-900 border border-[#dcd7c8] shadow-2xs">
                    <MapIcon size={22} />
                 </div>
                 <div>
                    <h3 className="text-lg md:text-xl font-black uppercase italic leading-none text-slate-950">
                      Live <span className="text-rose-800">Scam Intelligence Map</span>
                    </h3>
                    <p className="text-xs text-slate-700 font-extrabold mt-1">Interactive map showing reported scam alerts broadcasted across neighborhoods</p>
                 </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                 <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span> AREA BROADCAST LIVE
              </span>
           </div>

           <div className="flex-1 w-full h-full min-h-[500px] flex flex-col rounded-2xl md:rounded-3xl overflow-hidden border border-[#e2ddd0] shadow-inner isolate z-0 relative">
              <RealMap 
                alerts={alerts}
                onSelectLocation={handleSelectLocation}
                onUpvoteAlert={handleUpvoteAlert}
                onOpenReportModal={handleOpenReportModal}
                onUserLocationUpdate={handleUserLocationUpdate}
              />
           </div>
        </div>

        {/* Sidebar Stream & Protection Widgets */}
        <div className="lg:col-span-4 space-y-6">
           {/* Safety Gauge Card */}
           <div className="bg-white border border-[#dcd7c8] p-4 md:p-5 rounded-[2rem] flex flex-col items-center shadow-xs">
              <Gauge score={Math.max(15, Math.min(100, 100 - (alerts.length * 12)))} />
              
              {/* Additional Protection Widgets inside Right Panel */}
              <div className="mt-3 pt-3 border-t border-[#e2ddd0] w-full space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Network Threat Level</span>
                    <span className="text-[9px] font-black text-rose-800 uppercase px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md flex items-center gap-1">
                      <span>Risk {Math.min(95, Math.max(10, alerts.length * 14))}%</span>
                      <span className="text-[8px] font-bold text-rose-600">↑ Dynamic</span>
                    </span>
                 </div>
                 <div className="h-2 bg-[#f0ece1] rounded-full overflow-hidden p-0.5 border border-[#dcd7c8]">
                    <div className="h-full bg-rose-700 transition-all duration-1000 rounded-full" style={{ width: `${Math.min(95, Math.max(10, alerts.length * 14))}%` }} />
                 </div>

                 {/* Compact Quick Telemetry Row */}
                 <div className="grid grid-cols-2 gap-2 pt-1">
                   <div className="p-2 bg-[#f8f6f0] border border-[#e2ddd0] rounded-xl text-center">
                     <p className="text-[8px] font-black text-slate-500 uppercase">Total Scams</p>
                     <p className="text-xs font-black text-rose-800">{alerts.length} Active</p>
                   </div>
                   <div className="p-2 bg-[#f8f6f0] border border-[#e2ddd0] rounded-xl text-center">
                     <p className="text-[8px] font-black text-slate-500 uppercase">High Risk Alerts</p>
                     <p className="text-xs font-black text-amber-800">
                       {alerts.filter(a => a.severity === 'Critical' || a.severity === 'High').length} Tracked
                     </p>
                   </div>
                 </div>
              </div>
           </div>

           {/* User-Reported Incidents Feed List */}
           <div className="bg-white border border-[#dcd7c8] p-6 md:p-8 rounded-[2rem] space-y-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <Radio size={18} className="text-rose-700 animate-pulse" />
                    <h3 className="text-base font-black uppercase italic text-slate-950">User-Reported <span className="text-indigo-800">Incidents</span></h3>
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Community Feed</span>
              </div>

              {/* Realtime User Incidents Ticker */}
              <div className="bg-slate-950 text-slate-200 p-2.5 rounded-xl text-[10px] font-mono font-bold space-y-1 overflow-hidden border border-slate-800 shadow-inner">
                <div className="text-[8px] text-indigo-400 font-black uppercase tracking-widest border-b border-slate-800 pb-1 mb-1 flex items-center justify-between">
                  <span>👤 USER-REPORTED INCIDENTS</span>
                  <span className="text-emerald-400 animate-pulse">● LIVE VERIFIED</span>
                </div>
                {alerts.length > 0 ? (
                  alerts.slice(0, 3).map((a, idx) => (
                    <p key={`ticker_${a.id || idx}_${idx}`} className={`${idx === 0 ? 'text-rose-400 font-extrabold animate-pulse' : 'text-amber-200'} truncate`}>
                      User report: {a.scamType} in {a.areaName ? a.areaName.split(',')[0] : 'Area'}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400 font-normal italic">No user-reported incidents yet. Reports entered manually by users will appear here.</p>
                )}
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                 {alerts.length > 0 ? (
                   alerts.map((a, idx) => (
                     <div key={`incident_${a.id || idx}_${idx}`} className="p-3.5 bg-[#f8f6f0] rounded-2xl border border-[#e2ddd0] hover:border-indigo-400 transition-all space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-950 border border-rose-300">
                             {a.scamType}
                          </span>
                          <span className="text-[9px] font-mono font-extrabold text-slate-500">
                             📍 {a.areaName ? a.areaName.split(',')[0] : 'Area'}
                          </span>
                        </div>
                        <p className="text-xs font-black text-slate-950 leading-tight uppercase">{a.title}</p>
                        <p className="text-[10px] font-semibold text-slate-700 line-clamp-2">{a.description}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-[#d5cfbe] text-[9px] font-bold text-slate-600">
                           <span>User report in {a.areaName}</span>
                           <button 
                             onClick={() => handleUpvoteAlert(a.id)}
                             className="text-indigo-900 hover:text-indigo-700 font-extrabold flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-[#c8c2b0] hover:bg-indigo-50 transition-colors cursor-pointer"
                           >
                              👍 {a.upvotes || 1} Confirm
                           </button>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="p-6 text-center text-slate-500 bg-[#f8f6f0] rounded-2xl border border-[#e2ddd0]">
                     <Radio size={28} className="mx-auto mb-2 text-slate-400" />
                     <p className="font-extrabold text-xs uppercase text-slate-700">No User Incidents Reported</p>
                     <p className="text-[11px] text-slate-500 mt-1">Only manually submitted scam reports from community users will be listed here.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Area Scam Broadcast Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f6f4ee] border-2 border-indigo-900 rounded-[2.5rem] p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-[#dad4c5] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center border border-rose-300">
                  <Radio size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic text-slate-950 leading-none">Broadcast Area Alert</h3>
                  <p className="text-xs font-extrabold text-slate-600 mt-1">Warn everyone in this vicinity immediately</p>
                </div>
              </div>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#e2ddd0] hover:bg-[#d5cfbe] flex items-center justify-center text-slate-900 font-bold"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBroadcastAlert} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-black uppercase text-slate-700">Specific Location / Landmark / Suburb</label>
                  <button
                    type="button"
                    onClick={handleFetchCurrentLocationForForm}
                    disabled={isDetectingLocation}
                    className="text-[10px] font-extrabold text-indigo-900 hover:text-indigo-700 underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {isDetectingLocation ? '📡 Detecting Location...' : '📍 Detect Live Address'}
                  </button>
                </div>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-slate-500 z-10" />
                  <input
                    type="text"
                    required
                    value={formArea}
                    onChange={(e) => {
                      setFormArea(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={isDetectingLocation ? "Detecting exact live GPS location..." : "e.g. Door No. 12, Main Road, KPHB Phase 1, Kukatpally, Hyderabad"}
                    className="w-full bg-white border border-[#dad4c5] rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-800"
                  />

                  {/* Street & Landmark Autocomplete Dropdown */}
                  {showSuggestions && (addressSuggestions.length > 0 || isSearchingSuggestions) && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#dad4c5] rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-150">
                      {isSearchingSuggestions && addressSuggestions.length === 0 && (
                        <div className="p-3 text-[11px] font-bold text-slate-500 flex items-center gap-2">
                          <span className="animate-spin text-indigo-800">📡</span> Searching street & landmark suggestions...
                        </div>
                      )}

                      {addressSuggestions.map((item, idx) => {
                        const formatted = formatAddress(item, parseFloat(item.lat), parseFloat(item.lon));
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormArea(formatted);
                              setFormLat(parseFloat(item.lat));
                              setFormLng(parseFloat(item.lon));
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left p-2.5 hover:bg-indigo-50 transition-colors flex items-start gap-2 cursor-pointer group"
                          >
                            <MapPin size={14} className="text-indigo-800 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <div>
                              <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
                                {formatted}
                              </div>
                              <div className="text-[9px] font-semibold text-slate-500 line-clamp-1 mt-0.5">
                                {item.display_name}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-[9px] font-semibold text-slate-500 mt-1">
                  Tip: Enter exact landmark, metro station, pillar, road or colony name for maximum precision.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Scam Category</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-white border border-[#dad4c5] rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-800"
                  >
                    <option value="UPI QR Impersonation">UPI QR Impersonation</option>
                    <option value="Job Portal Scam">Job Placement Fraud</option>
                    <option value="Fake Police Call">Fake Police / Digital Arrest</option>
                    <option value="Rental Advance Scam">Rental Advance Fraud</option>
                    <option value="Lottery/Scholarship Fraud">Scholarship/Lottery Phishing</option>
                    <option value="OTP Hijack">OTP Hijack / SIM Swap</option>
                    <option value="Other">Other (Custom Scam)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full bg-white border border-[#dad4c5] rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-800"
                  >
                    <option value="Critical">Critical Threat</option>
                    <option value="High">High Warning</option>
                    <option value="Medium">Medium Precaution</option>
                  </select>
                </div>
              </div>

              {/* Custom Scam Category Input when 'Other' is selected */}
              {formType === 'Other' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Specify Custom Scam Category</label>
                  <input
                    type="text"
                    required
                    value={customFormType}
                    onChange={(e) => setCustomFormType(e.target.value)}
                    placeholder="e.g. Electricity Bill Threat, Crypto Task Fraud, KYC Update"
                    className="w-full bg-white border border-indigo-300 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-800 shadow-2xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Scam Headline / Warning Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Scammers near Metro asking for ₹2000 registration fee"
                  className="w-full bg-white border border-[#dad4c5] rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Detailed Scam Message (Shared Across Area)</label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe how the scam occurs, phone numbers or links used, so people in this neighborhood stay safe..."
                  className="w-full bg-white border border-[#dad4c5] rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-800 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#dad4c5] bg-white text-slate-900 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Broadcasting...' : 'Broadcast Alert Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

