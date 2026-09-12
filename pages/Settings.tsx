import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, User, Lock, Globe, Zap, ToggleLeft, ToggleRight } from 'lucide-react';

const Settings: React.FC = () => {
  const [switches, setSwitches] = useState({
    autoScan: true,
    notifications: true,
    biometrics: false,
    communitySync: true,
    stealthMode: false
  });

  const toggle = (key: keyof typeof switches) => {
    setSwitches(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingRow = ({ label, desc, icon: Icon, active, toggleKey }: any) => (
    <div className="flex items-center justify-between p-6 bg-[#b0c8dc] hover:bg-[#a0c0da] transition-colors border-b border-[#8baecb] last:border-0 group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${active ? 'bg-indigo-200 text-indigo-950 border border-indigo-400' : 'bg-[#a0c0da] text-slate-800 border border-[#85a9c5]'}`}>
          <Icon size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight">{label}</h4>
          <p className="text-[10px] text-slate-800 font-bold">{desc}</p>
        </div>
      </div>
      <button onClick={() => toggle(toggleKey)} className="transition-all active:scale-95">
        {active ? <ToggleRight size={32} className="text-indigo-800" /> : <ToggleLeft size={32} className="text-slate-600" />}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 font-sans">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#a0c0da] rounded-2xl flex items-center justify-center text-indigo-900 border border-[#85a9c5] shadow-2xs">
           <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase">Platform <span className="text-indigo-800">Settings</span></h2>
          <p className="text-slate-800 text-sm font-bold">Configure your forensic environment and security protocols.</p>
        </div>
      </div>

      <div className="grid gap-8">
        <section className="bg-gradient-to-br from-[#c5d8e8] to-[#b3cddc] border border-[#9cb6cd] rounded-3xl overflow-hidden shadow-xs">
           <div className="px-6 py-4 bg-[#a0c0da] border-b border-[#85a9c5] flex items-center gap-2">
              <Zap size={14} className="text-indigo-950" />
              <span className="text-[10px] font-black uppercase text-slate-900 tracking-[0.2em]">Forensic Intelligence</span>
           </div>
           <SettingRow 
             label="Real-time Auto-Scan" 
             desc="Automatically intercept and audit suspicious clipboard content." 
             icon={Globe} 
             active={switches.autoScan}
             toggleKey="autoScan"
           />
           <SettingRow 
             label="Community Threat Sync" 
             desc="Sync with active threat nodes for live heatmap updates." 
             icon={Globe} 
             active={switches.communitySync}
             toggleKey="communitySync"
           />
        </section>

        <section className="bg-gradient-to-br from-[#c5d8e8] to-[#b3cddc] border border-[#9cb6cd] rounded-3xl overflow-hidden shadow-xs">
           <div className="px-6 py-4 bg-[#a0c0da] border-b border-[#85a9c5] flex items-center gap-2">
              <Lock size={14} className="text-amber-900" />
              <span className="text-[10px] font-black uppercase text-slate-900 tracking-[0.2em]">Privacy & Access</span>
           </div>
           <SettingRow 
             label="Stealth Reporting" 
             desc="Hide your identity when submitting scam intelligence." 
             icon={Shield} 
             active={switches.stealthMode}
             toggleKey="stealthMode"
           />
           <SettingRow 
             label="Biometric Verification" 
             desc="Require fingerprint or face ID for UPI verifications." 
             icon={Lock} 
             active={switches.biometrics}
             toggleKey="biometrics"
           />
        </section>

        <div className="p-8 bg-gradient-to-r from-[#c5d8e8] to-[#b3cddc] border border-[#9cb6cd] rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
           <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest">Forensic Sensitivity</h4>
              <p className="text-xs text-slate-800 font-bold">Determine how aggressive the Gemini Brain detects anomalies.</p>
           </div>
           <div className="flex items-center gap-2">
              {['Balanced', 'Strict', 'Extreme'].map((level) => (
                <button 
                  key={level} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    level === 'Balanced' ? 'bg-indigo-800 border-indigo-900 text-white shadow-xs' : 'bg-[#b0c8dc] border-[#8baecb] text-slate-950 hover:bg-[#a0c0da]'
                  }`}
                >
                  {level}
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
