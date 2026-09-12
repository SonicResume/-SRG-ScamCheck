import React from 'react';

interface GaugeProps {
  score: number; // e.g. 8.2 or 82
  label?: string;
}

const Gauge: React.FC<GaugeProps> = ({ score, label = "Safety Score" }) => {
  // Normalize to 0-100 score
  const displayScore = score > 10 ? Math.round(score) : Math.round(score * 10);
  const percentage = Math.min(Math.max(displayScore, 0), 100);
  const strokeDasharray = 238.76; // 2 * PI * 38
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  const getRiskStatus = (s: number) => {
    if (s < 50) return { text: 'HIGH RISK', color: 'text-rose-700 bg-rose-100 border-rose-300', stroke: '#e11d48' };
    if (s < 75) return { text: 'MEDIUM RISK', color: 'text-amber-800 bg-amber-100 border-amber-300', stroke: '#d97706' };
    return { text: 'LOW RISK', color: 'text-emerald-800 bg-emerald-100 border-emerald-300', stroke: '#059669' };
  };

  const status = getRiskStatus(displayScore);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background glow ring */}
        <div className="absolute inset-1 rounded-full bg-indigo-50/40 animate-pulse" />
        <svg className="w-32 h-32 transform -rotate-90 relative z-10" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r="38"
            fill="transparent"
            stroke="#e2ddd0"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r="38"
            fill="transparent"
            stroke={status.stroke}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-black text-slate-950 italic tracking-tighter tabular-nums">{displayScore}</span>
            <span className="text-xs font-extrabold text-slate-500">/100</span>
          </div>
          <span className="text-[8px] uppercase font-black tracking-wider text-slate-600">Safety Index</span>
        </div>
      </div>

      <div className="mt-1 text-center space-y-1 w-full">
        <div className="flex items-center justify-center gap-2">
          <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${status.color}`}>
            {status.text}
          </span>
          <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Live</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Gauge;
