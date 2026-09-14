import React, { useState, useEffect } from 'react';
import { ScanSearch, ShieldAlert, CheckCircle2, Loader2, Download, Search, Link as LinkIcon, AlertTriangle, ShieldCheck, Activity, Terminal, ExternalLink, Fingerprint, Lock, Unlock, Database } from 'lucide-react';
import { analyzeWebsiteURL } from '../services/geminiService';
import { WebsiteAnalysisResult } from '../types';
import jsPDF from 'jspdf';

interface WebsiteVerifierProps {
  onResult?: (item: any) => void;
}

const WebsiteVerifier: React.FC<WebsiteVerifierProps> = ({ onResult }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [result, setResult] = useState<WebsiteAnalysisResult | null>(null);

  const auditSteps = [
    "Resolving DNS Records...",
    "Validating SSL Handshake...",
    "Querying Brand Registries...",
    "Syncing Threat Intelligence Nodes...",
    "Executing Forensic AI Audit..."
  ];

  useEffect(() => {
    let interval: number;
    if (isAnalyzing && auditStep < auditSteps.length - 1) {
      interval = window.setInterval(() => {
        setAuditStep(prev => prev + 1);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, auditStep]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    setIsAnalyzing(true);
    setAuditStep(0);
    setResult(null);

    try {
      const data = await analyzeWebsiteURL(finalUrl);
      setTimeout(() => {
        setResult(data);
        setIsAnalyzing(false);
        if (onResult) {
          onResult({
            type: 'url',
            target: finalUrl,
            isPhishing: data.isPhishing,
            trustScore: data.trustScore
          });
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      alert('Forensic URL audit failed. Check connection.');
      setIsAnalyzing(false);
    }
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFillColor(213, 228, 240);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(2, 132, 199);
    doc.setFontSize(22);
    doc.text('DOMAIN URL AUDIT REPORT', 10, 20);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`Analyzed URL: ${url}`, 10, 40);
    doc.text(`Trust Score: ${result.trustScore}/100`, 10, 50);
    doc.text(`Verdict: ${result.verdict}`, 10, 60);
    doc.text('Threat/Deception Breakdown:', 10, 80);
    result.technicalDiscrepancies.forEach((d, i) => doc.text(`- ${d}`, 10, 90 + i*10));
    doc.save(`URL_Audit_${Date.now()}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* Search Header */}
      <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] p-10 rounded-[3rem] text-center space-y-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 bg-[#f0ece1] rounded-3xl flex items-center justify-center mx-auto border border-[#dcd7c8] text-sky-900 shadow-2xs">
            <ScanSearch className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase">URL <span className="text-sky-800">Forensics</span></h3>
          <p className="text-slate-700 max-w-lg mx-auto font-bold">
            Verify payment portals, login pages, and student links. Our engine detects <span className="text-slate-950 font-black">Homograph Attacks</span> and <span  className="text-slate-950 font-black">Spoofed UI</span> patterns.
          </p>
        </div>

        <form onSubmit={handleVerify} className="relative max-w-2xl mx-auto group z-10">
          <div className="relative">
            <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-sky-900 group-focus-within:text-indigo-800 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Enter suspicious URL (e.g., pαypal.com)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#f0ece1] border-2 border-[#dcd7c8] rounded-[2rem] px-8 py-6 pl-16 pr-44 text-base font-mono text-slate-950 focus:border-indigo-700 focus:outline-none transition-all placeholder:text-slate-500 font-semibold shadow-inner"
            />
          </div>
          <button 
            type="submit"
            disabled={isAnalyzing || !url}
            className="absolute right-3 top-3 bottom-3 px-8 bg-sky-800 hover:bg-sky-700 text-white font-black rounded-2xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-md active:scale-95 text-xs uppercase tracking-wider"
          >
            {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <>WEBSITE AUDIT<Search size={18} /></>}
          </button>
        </form>
      </div>

      {/* Audit Progress UI */}
      {isAnalyzing && (
        <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] p-12 rounded-[3rem] space-y-8 animate-in zoom-in duration-300 shadow-xs text-center relative overflow-hidden">
           <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                 <div className="w-24 h-24 border-4 border-indigo-800/20 border-t-indigo-800 rounded-full animate-spin" />
                 <ScanSearch className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-900" size={32} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-indigo-950 font-black tracking-[0.2em] animate-pulse uppercase text-sm">Intercepting Network Packets</p>
                <div className="flex items-center gap-2 justify-center text-slate-700 font-mono text-xs font-bold">
                   <Terminal size={14} />
                   <span>{auditSteps[auditStep]}</span>
                </div>
              </div>
           </div>
           
           <div className="grid grid-cols-5 gap-2 h-2.5 w-full max-w-md mx-auto">
              {auditSteps.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-500 ${i <= auditStep ? 'bg-indigo-700' : 'bg-[#f0ece1]'}`} />
              ))}
           </div>
        </div>
      )}

      {/* Result UI */}
      {result && !isAnalyzing && (
        <div className={`p-10 rounded-[3rem] border shadow-md animate-in zoom-in duration-500 ${
           result.isPhishing ? 'border-rose-400 bg-rose-100/90' : 'border-sky-400 bg-sky-100/90'
        }`}>
          <div className="space-y-12 relative overflow-hidden">
             {/* Top Banner Verdict */}
             <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                <div className={`p-6 rounded-[2.5rem] shadow-sm shrink-0 ${result.isPhishing ? 'bg-rose-200 text-rose-950 border border-rose-300' : 'bg-sky-200 text-sky-950 border border-sky-300'}`}>
                  {result.isPhishing ? <ShieldAlert size={56} /> : <ShieldCheck size={56} />}
                </div>
                <div className="flex-1 space-y-3">
                   <div className="flex flex-wrap gap-3">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${result.isPhishing ? 'bg-rose-200 border-rose-400 text-rose-950' : 'bg-sky-200 border-sky-400 text-sky-950'}`}>
                        {result.isPhishing ? 'THREAT_DETECTED' : 'SECURE_DOMAIN'}
                      </span>
                      <span className="px-4 py-1 bg-[#ffffff] border border-[#e2ddd0] rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        DOMAIN_ID: {url.split('//')[1]?.split('/')[0] || url}
                      </span>
                   </div>
                   <h2 className="text-3xl md:text-4xl font-black text-slate-950 uppercase tracking-tight italic leading-none">
                     {result.isPhishing ? 'PHISHING ALERT' : 'SAFETY VERIFIED'}
                   </h2>
                   <p className="text-slate-900 font-bold italic text-base leading-relaxed max-w-2xl">
                     {result.verdict}
                   </p>
                </div>
                <button onClick={exportPDF} className="bg-[#ffffff] p-4 rounded-2xl border border-[#dcd7c8] hover:bg-[#f5f2e9] transition-all text-slate-950 flex items-center gap-2 text-xs font-black shadow-2xs" title="Download Audit Pack">
                  <Download size={22} /> Export PDF
                </button>
             </div>

             {/* Deception Breakdown / Trust Indicators */}
             <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div className="bg-[#ffffff] p-8 rounded-[2.5rem] border border-[#e2ddd0] space-y-6">
                   <h4 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-3">
                      <Activity size={18} className="text-indigo-800" /> 
                      {result.isPhishing ? 'Deception Techniques' : 'Trust Indicators'}
                   </h4>
                   <div className="space-y-3">
                      {result.technicalDiscrepancies.map((d, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-[#f0ece1] rounded-2xl border border-[#dcd7c8]">
                           {result.isPhishing ? <AlertTriangle size={18} className="text-amber-800 shrink-0 mt-0.5" /> : <ShieldCheck size={18} className="text-sky-800 shrink-0 mt-0.5" />}
                           <span className="text-sm text-slate-950 font-extrabold italic leading-relaxed">{d}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#ffffff] p-6 rounded-[2rem] border border-[#e2ddd0] text-center space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Trust Index</p>
                       <p className={`text-4xl font-black italic ${result.trustScore < 40 ? 'text-rose-800' : result.trustScore < 75 ? 'text-amber-800' : 'text-indigo-900'}`}>
                         {result.trustScore}%
                       </p>
                    </div>
                    <div className="bg-[#ffffff] p-6 rounded-[2rem] border border-[#e2ddd0] text-center space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Brand Sync</p>
                       <p className={`text-xl font-black uppercase italic ${result.isSpoofed ? 'text-rose-800' : 'text-sky-800'}`}>
                         {result.isSpoofed ? 'Spoofed' : 'Verified'}
                       </p>
                    </div>
                  </div>

                  <div className="bg-[#ffffff] p-8 rounded-[2.5rem] border border-[#e2ddd0] space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                       <Database size={16} /> Registry Intelligence
                    </h4>
                    <div className="p-4 bg-[#f0ece1] rounded-2xl border border-[#dcd7c8]">
                       <p className="text-xs text-slate-950 font-mono font-bold break-all leading-relaxed">{result.domainAgeInfo}</p>
                    </div>
                    
                    {result.officialSiteUrl && (
                      <div className="pt-4 mt-4 border-t border-[#e2ddd0]">
                         <h5 className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShieldCheck size={14} /> Official Reference Node
                         </h5>
                         <a href={result.officialSiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-[#f0ece1] border border-[#dcd7c8] rounded-2xl transition-all group">
                           <span className="text-xs text-indigo-950 underline font-mono font-extrabold truncate mr-4">
                             {result.officialSiteUrl}
                           </span>
                           <ExternalLink size={14} className="text-indigo-900 group-hover:scale-110 transition-transform" />
                         </a>
                      </div>
                    )}
                  </div>
                </div>
             </div>

             {/* Security Recommendation Footer */}
             <div className="p-8 bg-[#ffffff] rounded-[2rem] border border-[#e2ddd0] flex items-center gap-6 relative group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${result.isPhishing ? 'bg-rose-200 text-rose-950 border-rose-300' : 'bg-indigo-100 text-indigo-950 border-indigo-200'}`}>
                   <Fingerprint size={28} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cyber Analyst Recommendation</p>
                   <p className="text-sm text-slate-950 italic font-bold leading-relaxed">
                     {result.isPhishing 
                       ? "Immediately terminate any session with this domain. Do not input credentials or link bank accounts. Report this cluster to the National Cyber Crime portal." 
                       : "This domain matches official digital footprints. However, always ensure the lock icon in your browser is present before transacting."
                     }
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteVerifier;
