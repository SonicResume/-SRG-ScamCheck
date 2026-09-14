import React, { useState } from 'react';
import { Mail, ShieldCheck, Activity, Award, Settings, Bell, Lock, LogOut, Camera, Check, Upload, User, Save } from 'lucide-react';

interface ProfileProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    isVerified: boolean;
    role: string;
  };
  historyCount: number;
  onSignOut?: () => void;
  onUpdateUser?: (data: { name?: string; avatar?: string; email?: string }) => void;
}

const PRESET_AVATARS = [
  { id: '1', label: 'My Avatar', url: '/avatar.png' },
  { id: '2', label: 'Analyst', url: '/avatar-analyst.png' },
  { id: '3', label: 'Cyber', url: '/avatar-cyber.png' },
  { id: '4', label: 'Forensics', url: '/avatar-forensics.png' },
  { id: '5', label: 'Investigator', url: '/avatar-investigator.png' },
  { id: '6', label: 'Security', url: '/avatar-security.png' },
];

const Profile: React.FC<ProfileProps> = ({ 
  user,
  historyCount,
  onSignOut,
  onUpdateUser
}) => { 

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatar || '/avatar.png'
  );
  const [customName, setCustomName] = useState(user?.name || "");
  const [customUrl, setCustomUrl] = useState("");
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const currentAvatar =
  selectedAvatar || user?.avatar || '/avatar.png';

  const handleAvatarSelect = (url: string) => {
    setSelectedAvatar(url);
    if (onUpdateUser) {
      onUpdateUser({ avatar: url, name: customName });
    }
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      handleAvatarSelect(customUrl.trim());
      setCustomUrl("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          handleAvatarSelect(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser && customName.trim()) {
      onUpdateUser({ name: customName.trim(), avatar: selectedAvatar });
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 3000);
    }
  };

  const dynamicStats = {
    scansPerformed: historyCount,
    threatsBlocked: Math.floor(historyCount * 0.4),
    statusLabel: user?.isVerified ? "Verified Account" : "Active Member",
    resilienceScore: Math.min(85 + historyCount * 2, 100)
  };

  const securityLogs = [
    { event: "Account Active & Verified", time: "Just now", status: "Secure" },
    { event: "Cloud Sync Connection", time: "Active", status: "Verified" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 font-sans">
      {isSavedNotice && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-950 text-xs font-black flex items-center gap-3 animate-in fade-in duration-300">
          <Check size={18} className="text-emerald-700" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Main Header Profile Section */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] overflow-hidden shadow-xs">
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 relative z-10">
          {/* Enhanced Profile Picture with Avatar Picker Modal / Toggle */}
          <div className="relative group shrink-0">
            <div className="w-36 h-36 rounded-[2.5rem] bg-[#f0ece1] border-4 border-[#e2ddd0] overflow-hidden shadow-sm transition-transform hover:scale-105 duration-300 relative">
               <img src={currentAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
               <button 
                 onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                 className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 font-extrabold text-xs"
               >
                 <Camera size={24} />
                 <span>Change Pic</span>
               </button>
            </div>
            {user?.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-indigo-800 p-2.5 rounded-2xl shadow-md border-2 border-[#ffffff] text-white" title="Verified Member">
                <Award className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-slate-950 italic tracking-tight">{user?.name}</h1>
                <button 
                  onClick={() => setIsEditingAvatar(!isEditingAvatar)} 
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-800 hover:text-indigo-950 bg-[#f0ece1] px-3 py-1.5 rounded-xl border border-[#dcd7c8] w-fit mx-auto md:mx-0 shadow-2xs transition-colors"
                >
                  <Camera size={14} /> Choose Profile Pic
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
               <div className="flex items-center gap-3 text-slate-950 bg-[#f0ece1] px-4 py-2.5 rounded-xl border border-[#dcd7c8] font-bold">
                  <Mail size={16} className="text-indigo-800" />
                  <span className="text-xs truncate">{user?.email}</span>
               </div>
               <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border text-emerald-950 bg-emerald-100/90 border-emerald-300 font-bold">
                  <ShieldCheck size={16} className="text-emerald-800" />
                  <span className="text-xs font-black uppercase tracking-wider">{dynamicStats.statusLabel}</span>
               </div>
            </div>
          </div>

          <div className="bg-[#f0ece1] p-6 rounded-[2rem] border border-[#dcd7c8] min-w-[200px] text-center shadow-2xs">
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Security Score</p>
             <p className="text-3xl font-black text-slate-950 italic">{dynamicStats.resilienceScore}%</p>
             <div className="mt-3 h-2.5 bg-[#e2ddd0] rounded-full overflow-hidden">
                <div className="h-full bg-indigo-800 transition-all duration-1000" style={{ width: `${dynamicStats.resilienceScore}%` }} />
             </div>
             <p className="text-[9px] text-slate-700 font-black mt-2 uppercase">CLOUD_SYNCED</p>
          </div>
        </div>
      </div>

      {/* Profile Picture Selection Gallery */}
      {isEditingAvatar && (
        <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] rounded-[2.5rem] p-8 space-y-6 shadow-xs animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-[#e2ddd0] pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-950 italic">Choose Profile Picture</h3>
              <p className="text-xs text-slate-600 font-semibold">Select a high-resolution avatar or upload your own profile image.</p>
            </div>
            <button 
              onClick={() => setIsEditingAvatar(false)}
              className="text-xs font-extrabold px-3 py-1.5 bg-[#f0ece1] hover:bg-[#eae5d7] rounded-xl border border-[#dcd7c8] text-slate-800"
            >
              Close
            </button>
          </div>

          {/* Preset Avatar Cards Grid */}
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Select Preset Avatar</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {PRESET_AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar.url)}
                    className={`group relative rounded-2xl overflow-hidden border-2 transition-all p-1 flex flex-col items-center ${
                      isSelected ? 'border-indigo-800 bg-indigo-50 ring-2 ring-indigo-800/30' : 'border-[#dcd7c8] hover:border-slate-400 bg-[#f0ece1]'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden relative">
                      <img src={avatar.url} alt="Avatar option" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-900/30 flex items-center justify-center">
                          <Check className="text-white w-6 h-6 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Avatar Upload or URL */}
          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-[#e2ddd0]">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Upload Photo</p>
              <label className="flex items-center justify-center gap-3 p-4 bg-[#f0ece1] hover:bg-[#eae5d7] border-2 border-dashed border-[#dcd7c8] rounded-2xl cursor-pointer transition-colors text-slate-800 font-bold text-xs">
                <Upload size={18} className="text-indigo-800" />
                <span>Choose Image File...</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Or Paste Image URL</p>
              <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="https://example.com/my-photo.jpg" 
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 bg-[#f0ece1] border border-[#dcd7c8] rounded-xl px-4 py-2.5 text-xs text-slate-950 focus:border-indigo-700 focus:outline-none font-semibold placeholder:text-slate-500"
                />
                <button 
                  type="submit" 
                  className="px-4 py-2.5 bg-indigo-800 hover:bg-indigo-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Account Details & Log Out Options */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] rounded-[2rem] p-8 space-y-6 shadow-xs">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-3 uppercase tracking-wider">
                 <User size={20} className="text-indigo-800" /> Update Information
              </h3>

              <form onSubmit={handleSaveName} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Display Name</label>
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-[#f0ece1] border border-[#dcd7c8] rounded-xl px-4 py-3 text-xs text-slate-950 font-bold focus:border-indigo-700 focus:outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-800 hover:bg-indigo-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2"
                >
                  <Save size={14} /> Save Name
                </button>
              </form>

              <div className="pt-4 border-t border-[#e2ddd0] space-y-3">
                 <button className="w-full flex items-center justify-between p-3.5 bg-[#f0ece1] hover:bg-[#eae5d7] rounded-xl border border-[#dcd7c8] transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Bell size={16} className="text-indigo-800" />
                      <span className="text-xs font-extrabold uppercase tracking-tight text-slate-950">Notifications</span>
                    </div>
                 </button>
                 <button className="w-full flex items-center justify-between p-3.5 bg-[#f0ece1] hover:bg-[#eae5d7] rounded-xl border border-[#dcd7c8] transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Lock size={16} className="text-teal-800" />
                      <span className="text-xs font-extrabold uppercase tracking-tight text-slate-950">Security & Privacy</span>
                    </div>
                 </button>
                 <button className="w-full flex items-center justify-between p-3.5 bg-[#f0ece1] hover:bg-[#eae5d7] rounded-xl border border-[#dcd7c8] transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Activity size={16} className="text-sky-800" />
                      <span className="text-xs font-extrabold uppercase tracking-tight text-slate-950">Audit Preferences</span>
                    </div>
                 </button>
                 
                 {/* Sign Out / Log Out Button */}
                 {onSignOut && (
                   <button 
                     onClick={onSignOut}
                     className="w-full flex items-center justify-between p-4 bg-rose-100 hover:bg-rose-200 rounded-xl border border-rose-300 transition-all text-left text-rose-950 shadow-2xs mt-4"
                   >
                      <div className="flex items-center gap-3">
                        <LogOut size={18} className="text-rose-800" />
                        <span className="text-xs font-black uppercase tracking-wider">Log Out</span>
                      </div>
                   </button>
                 )}
              </div>
           </div>
        </div>

        {/* Security Stats & Activity Logs */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] rounded-[2rem] p-8 relative overflow-hidden group shadow-xs">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Personal Audits</p>
                 <p className="text-4xl font-black text-slate-950 italic">{dynamicStats.scansPerformed}</p>
                 <p className="text-xs text-slate-700 mt-2 font-bold">Verified forensic records synced.</p>
              </div>
              <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] rounded-[2rem] p-8 relative overflow-hidden group shadow-xs">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Threats Blocked</p>
                 <p className="text-4xl font-black text-rose-800 italic">{dynamicStats.threatsBlocked}</p>
                 <p className="text-xs text-slate-700 mt-2 font-bold">Risk factors averted.</p>
              </div>
           </div>

           <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] rounded-[2rem] p-8 space-y-6 shadow-xs">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-3 uppercase tracking-wider">
                 <ShieldCheck size={20} className="text-indigo-800" /> Recent Security History
              </h3>
              <div className="bg-[#f0ece1] rounded-2xl border border-[#dcd7c8] divide-y divide-[#dcd7c8] overflow-hidden font-mono shadow-2xs">
                 {securityLogs.map((log, i) => (
                   <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-950">{log.event}</span>
                        <span className="text-[10px] text-slate-600 font-bold">{log.time}</span>
                      </div>
                      <span className="text-[9px] px-2.5 py-1 rounded border uppercase font-black tracking-widest bg-emerald-200 text-emerald-950 border-emerald-300">
                        {log.status}
                      </span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
