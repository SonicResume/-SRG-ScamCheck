import React, { useState } from 'react';
import { Search, History as HistoryIcon, ShieldAlert, CheckCircle2, Download, Trash2, Filter, Database, Terminal } from 'lucide-react';

interface HistoryProps {
  history: any[];
}

const History: React.FC<HistoryProps> = ({ history = [] }) => {
  const [filter, setFilter] = useState('all');

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.type?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">Scam Evidence <span className="text-indigo-800">Archive</span></h2>
          <p className="text-slate-700 text-sm mt-2 font-bold">Cloud-synced forensic database of all analyzed nodes.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-[#f0ece1] border border-[#dcd7c8] rounded-xl shadow-2xs">
             <Database size={14} className="text-indigo-900" />
             <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Storage: Live_Sync</span>
           </div>
           <div className="flex items-center gap-3">
              <Filter size={16} className="text-slate-700" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="bg-[#f0ece1] border border-[#dcd7c8] text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-700 transition-all cursor-pointer shadow-2xs"
              >
                <option value="all">All Logs</option>
                <option value="scam">Forensic Scan</option>
                <option value="upi">Financial </option>
                <option value="voice">Spectral </option>
                <option value="url">Domain </option>
                <option value="firm">Entity </option>
              </select>
           </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] rounded-[2.5rem] overflow-hidden shadow-xs relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0ece1] border-b border-[#dcd7c8]">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-900 tracking-[0.25em]">Temporal_ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-900 tracking-[0.25em]">Audit_Target</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-900 tracking-[0.25em]">Node_Protocol</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-900 tracking-[0.25em]">Verdict</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-900 tracking-[0.25em]">Data_Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2ddd0]">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-28 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <Terminal size={48} className="text-indigo-900" />
                       <p className="text-slate-700 text-sm font-bold">Awaiting first forensic handshake. No records in primary buffer.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, idx) => (
                  <tr key={`hist_${item.id || idx}_${idx}`} className="hover:bg-[#f0ece1]/50 transition-all group">
                    <td className="px-8 py-5">
                      <p className="text-[10px] font-mono font-black text-slate-700 uppercase">
                        {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                        <br />
                        <span className="text-[8px] opacity-70">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-950 truncate max-w-[240px] italic">{item.target || 'Encrypted Payload'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-950 bg-[#f0ece1] px-3 py-1.5 rounded-lg border border-[#dcd7c8]">
                        {item.type || 'System'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {item.isScam || item.isDeepfake || item.isPhishing || item.isGhostFirm || item.isSuspicious ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-100 border border-rose-300">
                             <ShieldAlert size={14} className="text-rose-900 animate-pulse" />
                             <span className="text-[10px] font-black text-rose-950 uppercase tracking-widest">DANGER</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300">
                             <CheckCircle2 size={14} className="text-emerald-900" />
                             <span className="text-[10px] font-black text-emerald-950 uppercase tracking-widest">SAFE</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                         <button className="text-slate-700 hover:text-indigo-900 transition-all transform hover:scale-110 active:scale-90" title="Download Audit Pack">
                            <Download size={18} />
                         </button>
                         <button className="text-slate-700 hover:text-rose-800 transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110 active:scale-90" title="Purge Record">
                            <Trash2 size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-8 bg-gradient-to-r from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] rounded-[2rem] flex items-center gap-6 shadow-xs">
         <div className="w-14 h-14 bg-[#f0ece1] rounded-2xl flex items-center justify-center text-indigo-950 border border-[#dcd7c8] shrink-0 shadow-2xs">
            <HistoryIcon size={28} />
         </div>
         <div className="space-y-1">
            <p className="text-xs text-slate-950 font-black uppercase tracking-widest">Distributed Archive Storage</p>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              Forensic records are synced across all authorized nodes. Archive integrity is verified via 
              <span className="text-indigo-950 font-black"> SRG ScamCheck Real-time Sync (v2.4)</span>.
            </p>
         </div>
      </div>
    </div>
  );
};

export default History;
