import React, { useState } from 'react';
import {
  ShieldX,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Download,
  UserSearch,
} from 'lucide-react';
import { checkUPI } from '../services/geminiService';
import { UPIAnalysisResult } from '../types';
import jsPDF from 'jspdf';

interface UPICheckerProps {
  onResult?: (item: any) => void;
}

const UPIChecker: React.FC<UPICheckerProps> = ({
  onResult
}) => {
  const [upi, setUpi] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] =
    useState<UPIAnalysisResult | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!upi.includes('@')) {
      alert(
        'Please enter a valid UPI ID (e.g., username@bank)'
      );
      return;
    }

    setIsChecking(true);

    try {
      const audit = await checkUPI(upi);

      const isSuspicious =
        audit.classification !== 'SAFE' ||
        audit.riskScore >= 35;

      const threatLevel =
        audit.riskScore >= 75
          ? 'Critical'
          : audit.riskScore >= 50
            ? 'High'
            : audit.riskScore >= 35
              ? 'Medium'
              : 'Low';

      const patternsIdentified =
        audit.indicators?.length
          ? audit.indicators
          : ['No specific suspicious patterns identified.'];

      const upiResult: UPIAnalysisResult = {
        isSuspicious,
        threatLevel,
        patternsIdentified,
        recommendation:
          audit.recommendation ||
          audit.summary ||
          'Verify the recipient independently before sending money.'
      };

      setResult(upiResult);

      if (onResult) {
        onResult({
          type: 'upi',
          target: upi,
          isSuspicious:
            upiResult.isSuspicious,
          threatLevel:
            upiResult.threatLevel
        });
      }
    } catch (error) {
      console.error(
        'UPI audit failed:',
        error
      );
      alert('Audit failed.');
    } finally {
      setIsChecking(false);
    }
  };

  const exportPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFillColor(213, 228, 240);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(2, 132, 199);
    doc.setFontSize(22);
    doc.text(
      'UPI SECURITY AUDIT REPORT',
      10,
      20
    );

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);

    doc.text(
      `Target UPI ID: ${upi}`,
      10,
      40
    );

    doc.text(
      `Verification Status: ${
        result.isSuspicious
          ? 'SUSPICIOUS_THREAT'
          : 'TRUSTED_PAYEE'
      }`,
      10,
      50
    );

    doc.text(
      `Threat Index: ${result.threatLevel}`,
      10,
      60
    );

    doc.text(
      'Financial Analysis:',
      10,
      80
    );

    result.patternsIdentified.forEach(
      (pattern, i) => {
        doc.text(
          `- ${pattern}`,
          10,
          90 + i * 10
        );
      }
    );

    doc.text(
      'Auditor Recommendation:',
      10,
      150
    );

    doc.text(
      doc.splitTextToSize(
        result.recommendation,
        180
      ),
      10,
      160
    );

    doc.save(
      `SafePay_Audit_${upi}.pdf`
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 font-sans">

      <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] p-8 md:p-10 rounded-3xl text-center space-y-6 relative overflow-hidden shadow-xs">

        <div className="w-16 h-16 bg-[#f0ece1] rounded-2xl flex items-center justify-center mx-auto border border-[#dcd7c8] text-indigo-900 shadow-2xs">
          <UserSearch size={32} />
        </div>

        <div>
          <h3 className="text-3xl font-black text-slate-950 italic tracking-tight uppercase">
            SAFE-PAY{' '}
            <span className="text-indigo-800">
              UPI
            </span>
          </h3>

          <p className="text-slate-700 max-w-md mx-auto mt-2 text-sm font-bold">
            Pre-verify payees before committing funds. Our Financial Lock engine detects suspicious payment ID structures and scam indicators.
          </p>
        </div>

        <form
          onSubmit={handleCheck}
          className="relative max-w-lg mx-auto group"
        >
          <input
            type="text"
            placeholder="e.g. merchant.pay@icici"
            value={upi}
            onChange={(e) =>
              setUpi(e.target.value)
            }
            className="w-full bg-[#f0ece1] border border-[#dcd7c8] rounded-2xl px-5 py-4 pr-36 text-base font-mono text-slate-950 focus:border-indigo-700 focus:outline-none transition-all placeholder:text-slate-500 font-semibold shadow-inner"
          />

          <button
            type="submit"
            disabled={
              isChecking || !upi
            }
            className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-indigo-800 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
          >
            {isChecking ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                AUDIT ID
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] rounded-[2rem] overflow-hidden animate-in zoom-in duration-300 shadow-xs">

          <div
            className={`px-6 py-4 flex items-center justify-between border-b ${
              result.isSuspicious
                ? 'bg-rose-100/90 border-rose-300'
                : 'bg-sky-100/90 border-sky-300'
            }`}
          >

            <div className="flex items-center gap-3">

              {result.isSuspicious ? (
                <ShieldX className="text-rose-800" />
              ) : (
                <ShieldCheck className="text-sky-800" />
              )}

              <span
                className={`font-black uppercase tracking-wider text-xs ${
                  result.isSuspicious
                    ? 'text-rose-950'
                    : 'text-sky-950'
                }`}
              >
                {result.isSuspicious
                  ? 'FINANCIAL THREAT DETECTED'
                  : 'TRUSTED PAYEE IDENTITY'}
              </span>

            </div>

            <button
              onClick={exportPDF}
              className="p-2 hover:bg-[#f0ece1] rounded-lg text-slate-950"
              title="Download Report"
            >
              <Download size={18} />
            </button>

          </div>

          <div className="p-8 grid md:grid-cols-2 gap-8">

            <div className="space-y-6">

              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                  Threat Index Verdict
                </p>

                <div className="inline-block px-5 py-2.5 rounded-xl bg-[#f0ece1] border border-[#dcd7c8]">

                  <span
                    className={`text-xl font-black italic ${
                      result.threatLevel === 'Critical'
                        ? 'text-rose-800'
                        : result.threatLevel === 'High'
                          ? 'text-amber-800'
                          : result.threatLevel === 'Medium'
                            ? 'text-indigo-900'
                            : 'text-sky-800'
                    }`}
                  >
                    {result.threatLevel}
                  </span>

                </div>
              </div>

              <div>

                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">
                  Pattern Audit Breakdown
                </p>

                <div className="space-y-2">

                  {result.patternsIdentified.map(
                    (pattern, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 text-xs text-slate-950 bg-[#f0ece1] p-2.5 rounded-xl border border-[#dcd7c8] font-extrabold"
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-700" />
                        {pattern}
                      </div>
                    )
                  )}

                </div>
              </div>

            </div>

            <div className="bg-[#f0ece1] p-6 rounded-2xl border border-[#dcd7c8] flex flex-col justify-between space-y-4">

              <div>

                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">
                  Analyst Recommendation
                </p>

                <p className="text-slate-950 text-xs leading-relaxed italic font-bold">
                  "{result.recommendation}"
                </p>

              </div>

              <div className="p-4 bg-amber-100/90 border border-amber-300 rounded-xl">

                <p className="text-[10px] font-black text-amber-950 uppercase tracking-wider mb-1">
                  Financial Safety Advisory
                </p>

                <p className="text-xs text-amber-950 font-bold leading-tight">
                  Safe-UPI Checker helps identify suspicious payment patterns. Always verify unfamiliar IDs independently before transferring funds.
                </p>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UPIChecker;
