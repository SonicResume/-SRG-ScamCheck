import React, { useState } from 'react';
import { Upload, X, ShieldAlert, CheckCircle2, Loader2, Download, Zap, Brain, AlertTriangle, Eye, Info, MessageSquareCode } from 'lucide-react';
import { analyzeScamImage } from '../services/geminiService';
import { analyzeText } from '../services/scamshieldApi';
import { ScamAnalysisResult } from '../types';
import jsPDF from 'jspdf';

interface ScamScannerProps {
  onResult?: (item: any) => void;
}

const ScamScanner: React.FC<ScamScannerProps> = ({ onResult }) => {
  const [scanMode, setScanMode] = useState<'image' | 'text'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scamResult, setScamResult] = useState<ScamAnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setScamResult(null);
    }
  };

  const handleScan = async () => {
    if (scanMode === 'image' && (!preview || !selectedFile)) return;
    if (scanMode === 'text' && !textInput.trim()) return;

    setIsAnalyzing(true);
    setScamResult(null);

    try {
      if (scanMode === 'image') {
        const base64 = preview!.split(',')[1];
        const analysis = await analyzeScamImage(base64);

        setScamResult(analysis);

        if (onResult) {
          onResult({
            type: 'scam',
            target: selectedFile?.name,
            isScam: analysis.isScam,
            riskScore: analysis.riskScore
          });
        }
      } else {
        const apiResult = await analyzeText(textInput);

        const riskScore = Number(
          apiResult.risk_score ?? apiResult.probability ?? 0
        );

        const analysis: ScamAnalysisResult = {
          isScam: apiResult.label === 'Scam',
          riskScore,
          confidence: Number(apiResult.probability ?? riskScore),
          intent: apiResult.category || 'Suspicious message',
          redFlags: Array.isArray(apiResult.insights)
            ? apiResult.insights
            : [],
          summary:
            apiResult.recommended_action ||
            'Analysis complete.',
          forensicBreakdown: {
            psychologicalTriggers: Array.isArray(apiResult.insights)
              ? apiResult.insights
              : [],
            technicalAnomalies: [],
            urgencyLevel:
              riskScore >= 75
                ? 'Extreme'
                : riskScore >= 50
                  ? 'High'
                  : riskScore >= 25
                    ? 'Medium'
                    : 'Low'
          },
          educationalInsight:
            apiResult.recommended_action ||
            'Independently verify suspicious messages before taking action.'
        };

        setScamResult(analysis);

        if (onResult) {
          onResult({
            type: 'scam',
            target: textInput.substring(0, 30) + '...',
            isScam: analysis.isScam,
            riskScore: analysis.riskScore
          });
        }
      }
    } catch (error) {
      console.error(error);
      alert(
        'Forensic analysis failed. Please verify the ScamShield backend is running.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(213, 228, 240);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(2, 132, 199);
    doc.setFontSize(22);
    
    if (scamResult) {
      doc.text('SCAMSHIELD: FORENSIC BRAIN REPORT', 10, 20);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.text(`Result: ${scamResult.isScam ? 'POSITIVE SCAM DETECTION' : 'NEGATIVE / CLEAN'}`, 10, 40);
      doc.text(`Risk Index: ${scamResult.riskScore}/100`, 10, 50);
      doc.text(`Behavioral Intent: ${scamResult.intent}`, 10, 60);
      doc.text(`Urgency Level: ${scamResult.forensicBreakdown.urgencyLevel}`, 10, 70);
      doc.setFontSize(16);
      doc.text('Psychological DNA:', 10, 90);
      scamResult.forensicBreakdown.psychologicalTriggers.forEach((t, i) => doc.text(`- ${t}`, 15, 100 + i*10));
      doc.text('Safety DNA (Educational Insight):', 10, 150);
      doc.text(doc.splitTextToSize(scamResult.educationalInsight, 180), 10, 160);
    }
    
    doc.save(`Forensic_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] p-8 rounded-3xl text-center relative overflow-hidden shadow-xs">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#f0ece1] border border-[#dcd7c8] text-indigo-950 rounded-full text-xs font-mono font-black uppercase tracking-widest mb-4">
             <Zap size={14} className="text-indigo-800" /> BEHAVIORAL INTELLIGENCE
          </div>
          <h3 className="text-3xl font-black text-slate-950 mb-2 italic tracking-tight uppercase">THREAT <span className="text-indigo-800"> INTELLIGENCE </span></h3>
          <p className="text-slate-700 mb-8 max-w-xl mx-auto font-bold">Analyze suspicious messages and websites. Our Multimodal Engine detects pressure tactics, deception, and hidden threats in seconds.</p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button 
              onClick={() => {setScanMode('image'); setScamResult(null);}}
              className={`px-5 py-2.5 rounded-xl border font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${scanMode === 'image' ? 'bg-[#ffffff] border-indigo-700 text-indigo-950 shadow-2xs' : 'bg-[#f0ece1] border-[#dcd7c8] text-slate-800 hover:bg-[#eae5d7]'}`}
            >
              <Eye size={16} className="text-indigo-800" /> SCREENSHOT
            </button>
            <button 
              onClick={() => {setScanMode('text'); setScamResult(null);}}
              className={`px-5 py-2.5 rounded-xl border font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${scanMode === 'text' ? 'bg-[#ffffff] border-indigo-700 text-indigo-950 shadow-2xs' : 'bg-[#f0ece1] border-[#dcd7c8] text-slate-800 hover:bg-[#eae5d7]'}`}
            >
              <MessageSquareCode size={16} className="text-teal-800" /> PASTE TEXT
            </button>
          </div>

          <div className="max-w-2xl mx-auto">
            {scanMode === 'image' ? (
              !preview ? (
                <label className="block">
                  <div className="border-2 border-dashed border-[#dcd7c8] rounded-3xl p-12 hover:border-indigo-700 hover:bg-[#f0ece1] transition-all cursor-pointer group bg-[#f5f2e9]">
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-[#f0ece1] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform border border-[#dcd7c8] shadow-2xs text-indigo-900">
                        <Upload size={28} />
                      </div>
                      <p className="text-lg text-slate-950 font-black mb-1">Upload </p>
                      <p className="text-xs text-slate-600 font-mono tracking-wider uppercase font-extrabold">WhatsApp • Telegram • SMS • Email</p>
                    </div>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="space-y-6 animate-in zoom-in duration-300">
                  <div className="relative inline-block group">
                    <img src={preview} alt="forensic sample" className="max-h-[280px] rounded-2xl border-4 border-[#e2ddd0] shadow-md mx-auto" />
                    <button 
                      onClick={() => {setPreview(null); setSelectedFile(null); setScamResult(null);}}
                      className="absolute -top-3 -right-3 w-9 h-9 bg-rose-700 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                    >
                      <X size={18} className="text-white" />
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                <textarea 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste the suspicious message, SMS, or email here..."
                  className="w-full h-44 bg-[#f0ece1] border border-[#dcd7c8] rounded-2xl p-5 text-slate-950 focus:border-indigo-700 focus:outline-none transition-all resize-none font-semibold text-sm placeholder:text-slate-500"
                />
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button 
                onClick={handleScan}
                disabled={isAnalyzing || (scanMode === 'image' && !preview) || (scanMode === 'text' && !textInput.trim())}
                className="px-10 py-3.5 bg-indigo-800 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-md flex items-center gap-3 disabled:opacity-50 text-xs uppercase tracking-widest"
              >
                {isAnalyzing ? <><Loader2 className="animate-spin" /> RUNNING AUDIT...</> : 'START THREAT AUDIT'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {scamResult && (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          <div className={`p-8 md:p-10 rounded-[2rem] border shadow-md ${
            scamResult.isScam ? 'border-rose-400 bg-rose-100/90' : 'border-emerald-400 bg-emerald-100/90'
          }`}>
            <div className="space-y-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-slate-300/60 pb-6">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl shrink-0 ${scamResult.isScam ? 'bg-rose-200 text-rose-950' : 'bg-emerald-200 text-emerald-950'}`}>
                    {scamResult.isScam ? <ShieldAlert size={48} /> : <CheckCircle2 size={48} />}
                  </div>
                  <div>
                     <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${scamResult.isScam ? 'bg-rose-200 text-rose-950 border-rose-400' : 'bg-emerald-200 text-emerald-950 border-emerald-400'}`}>
                       VERDICT: {scamResult.isScam ? 'SCAM DETECTED' : 'CLEAN / SAFE'}
                     </span>
                     <h2 className="text-2xl md:text-3xl font-black text-slate-950 uppercase tracking-tight italic mt-2">
                       SAFETY DNA REPORT
                     </h2>
                     <p className="text-xs text-slate-800 font-extrabold mt-1">
                       Risk Score: {scamResult.riskScore}/100 • Urgency: {scamResult.forensicBreakdown.urgencyLevel}
                     </p>
                  </div>
                </div>
                <button onClick={exportPDF} className="bg-[#ffffff] p-3 rounded-xl border border-[#dcd7c8] hover:bg-[#f5f2e9] transition-colors text-slate-950 flex items-center gap-2 text-xs font-black" title="Download PDF Report">
                  <Download size={18} /> Download Report
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#e2ddd0] space-y-3">
                    <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                       <Brain size={16} className="text-indigo-800" /> Psychological Triggers
                    </h4>
                    <div className="space-y-2">
                      {scamResult.forensicBreakdown.psychologicalTriggers.map((t, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2.5 bg-[#f0ece1] rounded-xl border border-[#dcd7c8]">
                           <div className="w-2 h-2 rounded-full bg-indigo-700" />
                           <span className="text-xs text-slate-950 font-bold">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#e2ddd0] space-y-3">
                    <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                       <AlertTriangle size={16} className="text-amber-800" /> Behavioral Red Flags
                    </h4>
                    <div className="space-y-2">
                      {scamResult.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-2.5 bg-[#f0ece1] rounded-xl border border-[#dcd7c8]">
                           <Info size={14} className="text-rose-700 shrink-0 mt-0.5" />
                           <span className="text-xs text-slate-950 font-bold">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#e2ddd0] flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-2 mb-3">
                       <Eye size={18} /> WHY THIS IS A THREAT
                    </h4>
                    <p className="text-slate-950 text-sm leading-relaxed font-bold">
                      {scamResult.educationalInsight}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#e2ddd0]">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">KNOWLEDGE IS PROTECTION</p>
                    <p className="text-xs text-slate-900 mt-1 italic font-bold">"Scammers rely on artificial urgency to bypass logic."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScamScanner;
