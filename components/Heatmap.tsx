import React from 'react';
import { Target, Activity, Users } from 'lucide-react';
import { HeatmapHotspot } from '../types';

const hotspots: HeatmapHotspot[] = [
  { id: '1', name: 'JNTU Cluster', scamCount: 42, recentType: 'Lottery Phishing', coordinates: { x: 30, y: 35 } },
  { id: '2', name: 'Ameerpet Hub', scamCount: 89, recentType: 'Job Portal Scam', coordinates: { x: 55, y: 52 } },
  { id: '3', name: 'Hitech City', scamCount: 24, recentType: 'UPI Spoofing', coordinates: { x: 22, y: 58 } },
  { id: '4', name: 'Secunderabad', scamCount: 15, recentType: 'Bank Impersonation', coordinates: { x: 75, y: 40 } },
  { id: '5', name: 'Gachibowli', scamCount: 31, recentType: 'Crypto Fraud', coordinates: { x: 18, y: 75 } },
  { id: '6', name: 'Kukatpally', scamCount: 56, recentType: 'OTP Hijack Cluster', coordinates: { x: 42, y: 28 } },
];

const Heatmap: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#b8cce0] rounded-2xl overflow-hidden group border border-[#9cb8cf]">
      {/* Map Grid */}
      <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'linear-gradient(#0369a1 1px, transparent 1px), linear-gradient(90deg, #0369a1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Regional Outlines */}
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 100 100">
         <path d="M15,20 Q40,5 65,15 T85,35 Q95,65 75,85 T35,95 Q5,80 15,40 Z" fill="none" stroke="#0369a1" strokeWidth="0.5" strokeDasharray="2,2" />
         <circle cx="50" cy="50" r="35" fill="url(#heatmapGradLight)" />
         <defs>
           <radialGradient id="heatmapGradLight" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
             <stop offset="0%" style={{ stopColor: '#0369a1', stopOpacity: 0.25 }} />
             <stop offset="100%" style={{ stopColor: '#0369a1', stopOpacity: 0 }} />
           </radialGradient>
         </defs>
      </svg>

      {/* Interactive Map Pins */}
      <div className="absolute inset-0 z-10">
        {hotspots.map((spot) => (
          <div 
            key={spot.id} 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 cursor-pointer group/pin"
            style={{ left: `${spot.coordinates.x}%`, top: `${spot.coordinates.y}%` }}
          >
            <div className="relative">
              {/* Pulsing Aura */}
              <div className={`absolute -inset-5 rounded-full animate-ping opacity-30 duration-1000 ${spot.scamCount > 60 ? 'bg-rose-600' : 'bg-sky-700'}`} />
              <div className={`absolute -inset-2.5 rounded-full animate-pulse opacity-45 ${spot.scamCount > 60 ? 'bg-rose-500' : 'bg-sky-600'}`} />
              
              {/* Marker */}
              <div className={`relative flex items-center justify-center w-7 h-7 rounded-xl border shadow-md transition-transform ${
                spot.scamCount > 60 ? 'bg-rose-700 border-rose-300 text-white' : 'bg-[#c5d8e8] border-sky-800 text-sky-950'
              }`}>
                <Target size={14} className={spot.scamCount > 60 ? 'animate-pulse' : ''} />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 p-3.5 bg-[#c5d8e8] border border-[#a2bcd3] rounded-2xl opacity-0 group-hover/pin:opacity-100 transition-all scale-95 group-hover/pin:scale-100 pointer-events-none z-50 shadow-md">
                 <div className="flex justify-between items-start mb-2">
                   <p className="text-xs font-bold text-slate-950 uppercase italic">{spot.name}</p>
                   <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${spot.scamCount > 60 ? 'bg-rose-200 text-rose-900' : 'bg-sky-200 text-sky-950'}`}>
                     Node_{spot.id}
                   </span>
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-700 font-bold uppercase tracking-wider">Reports</span>
                      <span className="text-slate-950 font-mono font-black">{spot.scamCount}</span>
                   </div>
                   <div className="h-1.5 w-full bg-[#b8cce0] rounded-full overflow-hidden">
                     <div className={`h-full ${spot.scamCount > 60 ? 'bg-rose-700' : 'bg-sky-800'}`} style={{ width: `${Math.min(spot.scamCount, 100)}%` }} />
                   </div>
                   <div className="flex items-start gap-1.5 pt-1.5 border-t border-[#a0bbd2]">
                      <Activity size={10} className="text-rose-700 mt-0.5" />
                      <span className="text-[9px] text-slate-800 font-bold italic">Latest: {spot.recentType}</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 p-4 bg-[#c5d8e8] border border-[#a2bcd3] rounded-2xl space-y-3 shadow-md z-20">
         <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Map Legend</p>
         <div className="space-y-2">
           <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-700 shadow-sm" />
              <span className="text-[10px] text-slate-800 font-bold uppercase tracking-wider">Critical (&gt;60)</span>
           </div>
           <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-800 shadow-sm" />
              <span className="text-[10px] text-slate-800 font-bold uppercase tracking-wider">Active Monitoring</span>
           </div>
         </div>
      </div>
    </div>
  );
};

export default Heatmap;
