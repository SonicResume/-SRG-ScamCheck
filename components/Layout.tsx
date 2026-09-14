import React, { useState } from 'react';
import { Shield, LayoutDashboard, Scan, Search, Building2, Settings, LogOut, ShieldCheck, Bell, History, HelpCircle, Search as SearchIcon, Globe, Activity, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  user?: { name: string; email: string; role: string; isVerified: boolean; avatar?: string; };
  notifications: any[];
  setNotifications: (n: any[]) => void;
  onSignOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, user, notifications, setNotifications, onSignOut }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Digital Forensic Intelligence', icon: LayoutDashboard, color: 'text-indigo-700 bg-indigo-100/70 border-indigo-200' },
    { id: 'scanner', label: 'Threat Intellegence', icon: Scan, color: 'text-teal-700 bg-teal-100/70 border-teal-200' },
    { id: 'website', label: 'Domain', icon: Globe, color: 'text-emerald-700 bg-emerald-100/70 border-emerald-200' },
    { id: 'upi', label: 'Payee', icon: Search, color: 'text-sky-700 bg-sky-100/70 border-sky-200' },
    { id: 'ghostfirm', label: 'Ghost-Firm', icon: Building2, color: 'text-violet-700 bg-violet-100/70 border-violet-200' },
    { id: 'history', label: 'Archives', icon: History, color: 'text-amber-800 bg-amber-100/70 border-amber-200' },
  ];

  const bottomItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'scanner', icon: Scan, label: 'Scan' },
    { id: 'upi', icon: Search, label: 'Pay' },
    { id: 'profile', icon: ShieldCheck, label: 'Me' },
  ];

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#faf8f5] via-[#f4f1ea] to-[#efece4] text-slate-900 overflow-hidden flex-col md:flex-row font-sans">
      
      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex w-72 bg-[#f5f2e9]/90 backdrop-blur-md border-r border-[#e2ddd0] flex-col shrink-0 shadow-sm">
        <div className="p-8 mb-2">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-11 h-11 bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-md">
              <img
                src="/logo.png"
                alt="SRG ScamCheck"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-950 uppercase italic leading-none">
                  SRG <span className="text-indigo-800">ScamCheck</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <p className="text-[9px] font-mono text-slate-700 font-extrabold tracking-widest uppercase">Multi-Spectral Shield</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black uppercase text-slate-500 tracking-[0.25em] mb-3">Intelligence_Modules</p>
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group border ${
                  isActive 
                    ? 'bg-indigo-50/90 text-indigo-950 font-black border-l-4 border-l-indigo-700 border-indigo-200/80 shadow-xs' 
                    : 'bg-[#f0ece1]/60 hover:bg-[#eae5d7] text-slate-800 border-[#e0d9c8] font-semibold'
                }`}
              >
                <div className="flex items-center gap-3.5">
                   <div className={`p-1.5 rounded-xl border ${isActive ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/30 ring-2 ring-indigo-200' : item.color} shadow-2xs transition-all`}>
                     <item.icon size={16} />
                   </div>
                   <span className="text-[13px] tracking-tight">{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-700 shadow-sm shadow-indigo-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#e2ddd0] bg-[#ebe7dc]/60">
          <button 
            onClick={onSignOut} 
            className="w-full flex items-center justify-center gap-2.5 p-3.5 bg-rose-100 hover:bg-rose-200 text-rose-950 border border-rose-300 rounded-xl transition-all font-black text-xs uppercase tracking-wider shadow-2xs cursor-pointer"
          >
            <LogOut size={16} className="text-rose-800" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto relative pb-20 md:pb-0 bg-gradient-to-br from-[#faf8f5] via-[#f4f1ea] to-[#efece4]">
        <header className="sticky top-0 z-50 h-16 md:h-20 px-6 md:px-10 flex items-center justify-between border-b border-[#e2ddd0] bg-[#f5f2e9]/95 backdrop-blur-xl shadow-xs">
          <div className="flex md:hidden items-center gap-3" onClick={() => onNavigate('dashboard')}>
            <div className="w-9 h-9 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-xs">
                <img
                  src="/logo.png"
                  alt="SRG ScamCheck"
                  className="w-full h-full object-contain"
                />
             </div>
             <span className="text-sm font-black italic tracking-tighter text-slate-950">SRG<span className="text-indigo-800">ScamCheck</span></span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md items-center gap-2">
             <div className="relative group flex-1">
                <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-800 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Quick search threat records..."
                  className="w-full bg-[#f0ece1] border border-[#dcd7c8] rounded-xl py-2 pl-10 pr-3 text-xs text-slate-950 focus:outline-none focus:border-indigo-700 focus:bg-[#ffffff] transition-all placeholder:text-slate-500 font-semibold shadow-inner"
                />
             </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 relative">
            {/* Notification Bell Button with Ringing Pulse */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-[#f0ece1] hover:bg-[#eae5d7] border border-[#dcd7c8] rounded-xl text-slate-800 transition-all hover:scale-105 shadow-2xs cursor-pointer group"
              title="View Alerts & Notifications"
            >
              <Bell size={18} className="text-indigo-800 group-hover:rotate-12 transition-transform duration-200" />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 text-[8px] font-black text-white items-center justify-center">!</span>
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 md:w-96 bg-white border border-[#dad4c5] rounded-3xl shadow-2xl z-[500] p-4 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-indigo-800" />
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-950">System Notifications</h3>
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 font-medium py-6 text-center italic">No active notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          n.type === 'proximity' || n.type === 'alert'
                            ? 'bg-rose-50 border-rose-200 text-rose-950'
                            : 'bg-[#f8f6f0] border-[#e2ddd0] text-slate-900'
                        } ${!n.read ? 'ring-2 ring-indigo-500/30' : 'opacity-80'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            n.type === 'proximity' ? 'bg-rose-200 text-rose-950' : 'bg-indigo-100 text-indigo-950'
                          }`}>
                            {n.type === 'proximity' ? '🚨 AREA ALERT' : 'SYSTEM LOG'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Just now</span>
                        </div>
                        <h4 className="text-xs font-black uppercase text-slate-950 leading-snug">{n.title}</h4>
                        <p className="text-[11px] font-semibold text-slate-700 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <button onClick={() => onNavigate('profile')} className="flex items-center gap-3 p-1.5 bg-[#f0ece1] hover:bg-[#eae5d7] border border-[#dcd7c8] rounded-2xl pr-3.5 transition-all shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#e0dad0] border border-[#d0ca9c] overflow-hidden shrink-0">
                 <img src={user?.avatar || `/avatar.png`} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[12px] font-bold text-slate-950 italic tracking-tight leading-none">{user?.name || 'Agent Specialist'}</p>
              </div>
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 pb-24 md:pb-24">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#f5f2e9]/95 backdrop-blur-xl border-t border-[#e2ddd0] flex items-center justify-around py-2 pb-safe z-[100] px-4 shadow-lg">
         {bottomItems.map((item) => (
           <button
             key={item.id}
             onClick={() => onNavigate(item.id)}
             className={`flex flex-col items-center gap-1 transition-all ${
               activePage === item.id ? 'text-indigo-900 font-extrabold' : 'text-slate-700'
             }`}
           >
             <div className={`p-1.5 rounded-xl transition-all ${activePage === item.id ? 'bg-[#e8e3d5] border border-[#dad4c5]' : ''}`}>
                <item.icon size={20} />
             </div>
             <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
           </button>
         ))}
         <button 
           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
           className="flex flex-col items-center gap-1 text-slate-700"
         >
           <div className="p-1.5 rounded-xl">
              <Menu size={20} />
           </div>
           <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
         </button>
      </nav>

      {/* Fullscreen Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[200] bg-gradient-to-br from-[#faf8f5] via-[#f4f1ea] to-[#efece4] animate-in fade-in duration-300 flex flex-col p-8">
           <div className="flex justify-between items-center mb-10">
              <span className="text-xl font-extrabold italic tracking-tighter text-slate-950 uppercase">SCAM<span className="text-indigo-800">SHIELD</span></span>
              <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 bg-[#f0ece1] border border-[#dcd7c8] rounded-full flex items-center justify-center text-slate-900">
                 <X size={20} />
              </button>
           </div>
           <div className="grid grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-[#ffffff] border border-[#e2ddd0] rounded-2xl hover:bg-[#f5f2e9] transition-colors shadow-2xs"
                >
                  <item.icon size={22} className="text-indigo-800" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-950">{item.label}</span>
                </button>
              ))}
           </div>
           <div className="mt-auto space-y-3">
              <button onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }} className="w-full p-4 bg-[#ffffff] border border-[#e2ddd0] rounded-xl flex items-center gap-3 text-slate-900 font-bold shadow-2xs">
                 <ShieldCheck size={18} className="text-indigo-800" />
                 <span className="text-xs uppercase tracking-wider">My Profile</span>
              </button>
              <button onClick={() => { onNavigate('settings'); setMobileMenuOpen(false); }} className="w-full p-4 bg-[#ffffff] border border-[#e2ddd0] rounded-xl flex items-center gap-3 text-slate-900 font-bold shadow-2xs">
                 <Settings size={18} className="text-teal-800" />
                 <span className="text-xs uppercase tracking-wider">System Settings</span>
              </button>
              {onSignOut && (
                <button onClick={() => { onSignOut(); setMobileMenuOpen(false); }} className="w-full p-4 bg-rose-100 border border-rose-300 rounded-xl flex items-center gap-3 text-rose-950 font-black shadow-2xs">
                   <LogOut size={18} className="text-rose-800" />
                   <span className="text-xs uppercase tracking-wider">Log Out</span>
                </button>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
