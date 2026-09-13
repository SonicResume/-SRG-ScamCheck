import React, { useState } from 'react';
import {
  Building2,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Download,
  AlertTriangle,
  FileSearch
} from 'lucide-react';
import { verifyFirm } from '../services/geminiService';
import { FirmAnalysisResult } from '../types';
import jsPDF from 'jspdf';

interface GhostFirmVerifierProps {
  onResult?: (item: any) => void;
}

const GhostFirmVerifier: React.FC<GhostFirmVerifierProps> = ({
  onResult
}) => {
  const [firmName, setFirmName] = useState('');
  const [role, setRole] = useState('');
  const [details, setDetails] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] =
    useState<FirmAnalysisResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firmName || !role) {
      alert('Please enter at least the firm name and role.');
      return;
    }

    setIsVerifying(true);

    try {
      const data = await verifyFirm(
        `${firmName}\nRole: ${role}\nDetails: ${details}`
      );

      const riskRating =
        data.classification === 'SCAM'
          ? 'Dangerous'
          : data.classification === 'SUSPICIOUS'
            ? 'Hazard'
            : data.riskScore >= 20
              ? 'Suspect'
              : 'Safe';

      const isGhostFirm =
        data.classification === 'SCAM' ||
        data.riskScore >= 75;

      const firmResult: FirmAnalysisResult = {
        isGhostFirm,
        riskRating,
        firmRegistryStatus:
          isGhostFirm
            ? 'Potentially suspicious — independent registry verification required.'
            : data.classification === 'SUSPICIOUS'
              ? 'Requires independent registry verification.'
              : 'No obvious registry-related red flags identified from the supplied information.',
        companyBackground:
          data.summary ||
          'Company information was analyzed from the supplied details only.',
        redFlags:
          data.indicators?.length
            ? data.indicators
            : ['No specific red flags identified.'],
        verdict:
          data.recommendation ||
          data.summary ||
          'Verification completed based on the supplied information.'
      };

      setResult(firmResult);

      if (onResult) {
        onResult({
          type: 'firm',
          target: firmName,
          isGhostFirm: firmResult.isGhostFirm,
          riskRating: firmResult.riskRating
        });
      }
    } catch (error) {
      console.error('Firm verification failed:', error);
      alert('Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const exportPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFillColor(213, 228, 240);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(2, 132, 199);
    doc.setFontSize(22);
    doc.text('GHOST-FIRM AUDIT REPORT', 10, 20);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);

    doc.text(`Business: ${firmName}`, 10, 40);
    doc.text(`Position: ${role}`, 10, 50);
    doc.text(`Risk Rating: ${result.riskRating}`, 10, 60);
    doc.text(
      `Registry Status: ${result.firmRegistryStatus}`,
      10,
      70
    );

    doc.text('Red Flags Detected:', 10, 90);

    result.redFlags.forEach((flag, i) => {
      doc.text(`- ${flag}`, 10, 100 + i * 10);
    });

    doc.text('Final Verdict:', 10, 180);

    doc.text(
      doc.splitTextToSize(result.verdict, 180),
      10,
      190
    );

    doc.save(
      `Firm_Audit_${firmName.replace(/\s/g, '_')}.pdf`
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 font-sans">

      <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] p-8 md:p-10 rounded-3xl text-center space-y-6 relative overflow-hidden shadow-xs">

        <div className="w-16 h-16 bg-[#f0ece1] rounded-2xl flex items-center justify-center mx-auto border border-[#dcd7c8] text-indigo-900 shadow-2xs">
          <Building2 size={32} />
        </div>

        <div>
          <h3 className="text-3xl font-black text-slate-950 italic tracking-tight uppercase">
            GHOST-FIRM{' '}
            <span className="text-indigo-800">
              VERIFIER
            </span>
          </h3>

          <p className="text-slate-700 max-w-md mx-auto mt-2 text-sm font-bold">
            Verify offer letters, recruitment notices, or unverified internship providers against corporate registries.
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="space-y-4 max-w-xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Firm / Company Name"
              value={firmName}
              onChange={(e) =>
                setFirmName(e.target.value)
              }
              className="w-full bg-[#f0ece1] border border-[#dcd7c8] rounded-xl px-4 py-3 text-sm text-slate-950 focus:border-indigo-700 focus:outline-none transition-all placeholder:text-slate-500 font-semibold"
            />

            <input
              type="text"
              placeholder="Role (e.g. Software Trainee)"
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="w-full bg-[#f0ece1] border border-[#dcd7c8] rounded-xl px-4 py-3 text-sm text-slate-950 focus:border-indigo-700 focus:outline-none transition-all placeholder:text-slate-500 font-semibold"
            />

          </div>

          <textarea
            placeholder="Paste Offer Details / Job Description / Recruiter Email..."
            value={details}
            onChange={(e) =>
              setDetails(e.target.value)
            }
            rows={4}
            className="w-full bg-[#f0ece1] border border-[#dcd7c8] rounded-xl p-4 text-sm text-slate-950 focus:border-indigo-700 focus:outline-none transition-all resize-none placeholder:text-slate-500 font-semibold"
          />

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 bg-indigo-800 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            {isVerifying ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <FileSearch size={18} />
                AUDIT SUBMISSION
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] rounded-[2rem] overflow-hidden animate-in zoom-in duration-300 shadow-xs">

          <div
            className={`px-6 py-4 flex items-center justify-between border-b ${
              result.isGhostFirm
                ? 'bg-rose-100/90 border-rose-300'
                : 'bg-emerald-100/90 border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-3">

              {result.isGhostFirm ? (
                <ShieldAlert className="text-rose-800" />
              ) : (
                <CheckCircle2 className="text-emerald-800" />
              )}

              <span
                className={`font-black uppercase tracking-wider text-xs ${
                  result.isGhostFirm
                    ? 'text-rose-950'
                    : 'text-emerald-950'
                }`}
              >
                {result.isGhostFirm
                  ? 'GHOST FIRM DETECTED'
                  : 'NO MAJOR RED FLAGS DETECTED'}
              </span>

            </div>

            <button
              onClick={exportPDF}
              className="p-2 hover:bg-[#f0ece1] rounded-lg text-slate-950"
              title="Export PDF"
            >
              <Download size={18} />
            </button>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-8">

            <div className="space-y-6">

              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                  Registry Audit
                </p>

                <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#e2ddd0]">

                  <p className="text-xs text-indigo-950 font-mono font-black mb-1">
                    {result.firmRegistryStatus}
                  </p>

                  <p className="text-xs text-slate-900 italic font-semibold">
                    {result.companyBackground}
                  </p>

                </div>
              </div>

              <div className="space-y-3">

                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Risk Assessment
                </p>

                <div className="flex items-center gap-4">

                  <div
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase ${
                      result.riskRating === 'Dangerous'
                        ? 'bg-rose-200 text-rose-950'
                        : result.riskRating === 'Hazard'
                          ? 'bg-amber-200 text-amber-950'
                          : result.riskRating === 'Suspect'
                            ? 'bg-indigo-100 text-indigo-950'
                            : 'bg-emerald-200 text-emerald-950'
                    }`}
                  >
                    {result.riskRating}
                  </div>

                  <div className="flex-1 h-2.5 bg-[#f0ece1] rounded-full overflow-hidden">

                    <div
                      className={`h-full rounded-full ${
                        result.riskRating === 'Dangerous'
                          ? 'bg-rose-700 w-full'
                          : result.riskRating === 'Hazard'
                            ? 'bg-amber-600 w-[75%]'
                            : result.riskRating === 'Suspect'
                              ? 'bg-indigo-700 w-[40%]'
                              : 'bg-emerald-600 w-[10%]'
                      }`}
                    />

                  </div>

                </div>
              </div>
            </div>

            <div className="space-y-4">

              <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#e2ddd0]">

                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">
                  Red Flags Detected
                </p>

                <div className="space-y-2">

                  {result.redFlags.map((flag, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 bg-[#f0ece1] rounded-xl border border-[#dcd7c8]"
                    >
                      <AlertTriangle
                        size={15}
                        className="text-amber-800 shrink-0 mt-0.5"
                      />

                      <span className="text-xs text-slate-950 font-bold leading-tight">
                        {flag}
                      </span>
                    </div>
                  ))}

                </div>
              </div>

              <div className="p-5 bg-[#f0ece1] border border-[#dcd7c8] rounded-2xl">

                <h5 className="text-[10px] font-black text-indigo-950 uppercase tracking-wider mb-1">
                  Final Verdict
                </h5>

                <p className="text-xs text-slate-950 italic leading-relaxed font-bold">
                  "{result.verdict}"
                </p>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GhostFirmVerifier;
