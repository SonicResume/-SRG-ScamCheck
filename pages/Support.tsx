import React from 'react';
import { HelpCircle, MessageSquare, ShieldAlert, BookOpen, ExternalLink, Send, Users } from 'lucide-react';

const Support: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 font-sans">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase">Intelligence <span className="text-indigo-800">Hub</span></h2>
        <p className="text-slate-800 max-w-xl mx-auto font-bold">Get help from community nodes or report new emerging threats to train the Forensic Brain.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Knowledge Base */}
        <div className="bg-gradient-to-br from-[#c5d8e8] to-[#b3cddc] border border-[#9cb6cd] rounded-3xl p-8 space-y-6 shadow-xs">
           <h3 className="text-lg font-black text-slate-950 flex items-center gap-3 uppercase tracking-wider">
              <BookOpen size={20} className="text-indigo-800" /> Security Wiki
           </h3>
           <div className="space-y-3">
              {[
                "How to identify AI Voice cloning artifacts?",
                "Common Job Portal 'Security Deposit' scams",
                "Verifying Bank SMS with Registry IDs",
                "Protecting your UPI from ghost-payee spoofing"
              ].map((q, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-[#b0c8dc] hover:bg-[#a0c0da] rounded-xl border border-[#8baecb] transition-all text-left group">
                  <span className="text-xs font-black text-slate-950">{q}</span>
                  <ExternalLink size={14} className="text-indigo-900 group-hover:scale-110 transition-transform" />
                </button>
              ))}
           </div>
        </div>

        {/* Report Scam Form */}
        <div className="bg-gradient-to-br from-[#c5d8e8] to-[#b3cddc] border border-[#9cb6cd] rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-xs">
           <h3 className="text-lg font-black text-slate-950 flex items-center gap-3 uppercase tracking-wider">
              <ShieldAlert size={20} className="text-rose-800" /> Intelligence Submission
           </h3>
           <p className="text-xs text-slate-800 font-bold">Found a new scam type? Report it to alert the student community.</p>
           <div className="space-y-3 relative z-10">
              <input 
                type="text" 
                placeholder="Scam Subject (e.g. Ameerpet Job Scam)" 
                className="w-full bg-[#b0c8dc] border border-[#8baecb] rounded-xl p-3 text-sm text-slate-950 placeholder:text-slate-600 font-semibold focus:outline-none focus:border-indigo-700" 
              />
              <textarea 
                placeholder="Provide details, phone numbers, or UPI IDs involved..." 
                rows={4} 
                className="w-full bg-[#b0c8dc] border border-[#8baecb] rounded-xl p-3 text-sm text-slate-950 placeholder:text-slate-600 font-semibold focus:outline-none focus:border-indigo-700 resize-none" 
              />
              <button className="w-full py-3.5 bg-rose-800 hover:bg-rose-700 text-white font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs">
                <Send size={16} /> SUBMIT INTEL
              </button>
           </div>
        </div>
      </div>

      {/* Community Channels */}
      <div className="bg-gradient-to-r from-[#c5d8e8] to-[#b3cddc] border border-[#9cb6cd] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
         <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#a0c0da] rounded-2xl flex items-center justify-center text-indigo-950 border border-[#85a9c5] shadow-2xs">
               <Users size={28} />
            </div>
            <div>
               <h4 className="text-lg font-black text-slate-950 uppercase tracking-tight">Join Secure Nodes</h4>
               <p className="text-xs text-slate-800 font-bold">Connect with 12k+ campus security agents in our decentralized intelligence network.</p>
            </div>
         </div>
         <div className="flex items-center gap-2 px-5 py-2.5 bg-[#b0c8dc] border border-[#8baecb] rounded-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
            <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Network_Sync_Active</span>
         </div>
      </div>
    </div>
  );
};

export default Support;
