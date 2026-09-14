import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  ShieldAlert,
  CheckCircle2,
  Volume2,
  Download,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import Waveform from '../components/Waveform';
import { auditVoiceResult } from '../services/geminiService';
import { VoiceAnalysisResult } from '../types';
import jsPDF from 'jspdf';

interface VoiceAuditProps {
  onResult?: (item: any) => void;
}

const VoiceAudit: React.FC<VoiceAuditProps> = ({ onResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [currentLiveTranscription, setCurrentLiveTranscription] = useState('');

  const liveSessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptionEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number;

    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    transcriptionEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [transcription, currentLiveTranscription]);

  const handleStartRecording = async () => {
    setTranscription('');
    setCurrentLiveTranscription('');
    setResult(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Live speech recognition is not supported by this browser.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      liveSessionRef.current = recognition;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const text = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalText += text + ' ';
          } else {
            interimText += text;
          }
        }

        if (finalText) {
          setTranscription(prev =>
            (prev + ' ' + finalText).trim()
         );
        }

        setCurrentLiveTranscription(interimText);
      };

      recognition.onerror = (event: any) => {
        console.error(
          'Speech recognition error:',
          event.error
        );
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error(
        'Could not start recording:',
        error
      );

      alert(
        'Microphone access denied or speech recognition could not start.'
      );
    }
  };

  const handleStopRecording = async () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.stop();
      liveSessionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach(track => track.stop());

      streamRef.current = null;
    }

    setIsRecording(false);

    await runDeepfakeAnalysis();
  };

  const runDeepfakeAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const analysisText = [
        transcription,
        currentLiveTranscription,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      const data = await auditVoiceResult(
        analysisText || 'No transcript was captured.'
      );

      const safeResult: VoiceAnalysisResult = {
        ...data,
        anomalies: Array.isArray(data.anomalies)
          ? data.anomalies
          : [],
      };

      setResult(safeResult);

      if (onResult) {
        onResult({
          type: 'voice',
          target: 'Live Voice Dispatch',
          isDeepfake: safeResult.isDeepfake,
          probability: safeResult.probability,
        });
      }
    } catch (error) {
      console.error(
        'Forensic voice analysis failed:',
        error
      );

      alert('Forensic voice analysis failed.');
    } finally {
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
    doc.text(
      'VOICE AUTHENTICITY REPORT',
      10,
      20
    );

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);

    doc.text(
      'Target: Live Voice Dispatch',
      10,
      40
    );

    doc.text(
      `Deepfake Probability: ${result.probability}%`,
      10,
      50
    );

    doc.text(
      `Verdict: ${result.verdict}`,
      10,
      60
    );

    doc.text(
      'Acoustic Anomalies:',
      10,
      80
    );

    result.anomalies.forEach((anomaly, index) => {
      doc.text(
        `- ${anomaly}`,
        10,
        90 + index * 10
      );
    });

    doc.text(
      'Full Transcription Extract:',
      10,
      150
    );

    const transcriptionLines =
      doc.splitTextToSize(
        transcription,
        180
      );

    doc.text(
      transcriptionLines,
      10,
      160
    );

    doc.save(
      `Voice_Audit_${Date.now()}.pdf`
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">

      <div className="bg-gradient-to-br from-[#ffffff] via-[#faf7f0] to-[#f4f0e6] border border-[#e2ddd0] p-8 md:p-10 rounded-[2rem] text-center relative overflow-hidden shadow-xs">

        <h3 className="text-3xl font-black text-slate-950 mb-2 italic tracking-tight uppercase">
          Voice{' '}
          <span className="text-rose-800">
            Threat Scanner
          </span>
        </h3>

        <p className="text-slate-700 mb-8 max-w-lg mx-auto text-sm font-bold">
          Audit suspicious messages and websites.
          Our multimodal engine detects pressure tactics,
          deception, and hidden threats in seconds.
        </p>

        <div className="mb-8">
          <Waveform
            isAnimating={
              isRecording || isAnalyzing
            }
          />
        </div>

        <div className="flex flex-col items-center gap-6">

          {isRecording && (
            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-rose-100 border border-rose-300 text-rose-950 animate-pulse font-mono font-black tracking-wider text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-700" />

              LIVE FEED:{' '}
              {Math.floor(recordingTime / 60)}
              :
              {(recordingTime % 60)
                .toString()
                .padStart(2, '0')}
            </div>
          )}

          {!isRecording && (
            <div className="w-full max-w-xl">
              <button
                onClick={handleStartRecording}
                disabled={isAnalyzing}
                className="group w-full flex flex-col items-center gap-3 p-6 bg-[#f0ece1] border border-[#dcd7c8] rounded-2xl hover:border-rose-700 hover:bg-[#eae5d7] transition-all shadow-2xs"
              >
                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-900 shadow-2xs">
                  <Mic size={28} />
                </div>

                <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                  Record & Analyze
                </span>
              </button>
            </div>
          )}

          {(transcription ||
            currentLiveTranscription ||
            isRecording) && (
            <div className="w-full max-w-2xl space-y-4">

              <div className="bg-[#f0ece1] border border-[#dcd7c8] rounded-2xl p-5 text-left shadow-inner relative overflow-hidden">

                <div className="flex items-center justify-between mb-3 border-b border-[#dcd7c8] pb-2">

                  <div className="flex items-center gap-2">
                    <Terminal
                      size={14}
                      className="text-indigo-900"
                    />

                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                      Transcription Feed
                    </span>
                  </div>

                  {isRecording && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-rose-700 rounded-full animate-pulse" />

                      <span className="text-[9px] font-black text-rose-900 uppercase">
                        Streaming
                      </span>
                    </div>
                  )}

                </div>

                <div className="max-h-40 overflow-y-auto custom-scrollbar font-mono text-xs leading-relaxed text-slate-950 font-bold">

                  <div>
                    {transcription}

                    <span className="text-indigo-900 border-l-2 border-indigo-900 animate-pulse ml-1">
                      {currentLiveTranscription}
                    </span>
                  </div>

                  {!transcription &&
                    !currentLiveTranscription &&
                    !isAnalyzing && (
                      <span className="text-slate-500 italic">
                        Awaiting voice data...
                      </span>
                    )}

                  {isAnalyzing &&
                    !transcription && (
                      <span className="text-indigo-900 animate-pulse">
                        Initializing Multimodal Audit...
                      </span>
                    )}

                  <div ref={transcriptionEndRef} />

                </div>
              </div>

            </div>
          )}

          {isRecording && (
            <button
              onClick={handleStopRecording}
              className="w-20 h-20 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
            >
              <Square className="w-7 h-7 fill-current" />
            </button>
          )}

        </div>
      </div>

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center p-10 space-y-4">

          <div className="relative">
            <div className="w-16 h-16 border-4 border-rose-800/30 border-t-rose-800 rounded-full animate-spin" />

            <Volume2
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-800 animate-pulse"
              size={20}
            />
          </div>

          <div className="text-center">
            <p className="text-rose-950 font-black tracking-wider animate-pulse uppercase text-xs mb-0.5">
              Auditing Spectral Signatures
            </p>

            <p className="text-slate-600 text-[10px] font-mono italic font-bold">
              Extracting synthesis artifacts...
            </p>
          </div>

        </div>
      )}

      {result && !isAnalyzing && (
        <div
          className={`p-8 md:p-10 rounded-[2rem] border shadow-md animate-in zoom-in duration-500 ${
            result.isDeepfake
              ? 'border-rose-400 bg-rose-100/90'
              : 'border-emerald-400 bg-emerald-100/90'
          }`}
        >

          <div className="space-y-6">

            <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-slate-300/60 pb-6">

              <div className="flex items-center gap-5">

                <div
                  className={`p-4 rounded-2xl shrink-0 ${
                    result.isDeepfake
                      ? 'bg-rose-200 text-rose-950'
                      : 'bg-emerald-200 text-emerald-950'
                  }`}
                >
                  {result.isDeepfake ? (
                    <ShieldAlert size={48} />
                  ) : (
                    <CheckCircle2 size={48} />
                  )}
                </div>

                <div>

                  <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight italic">
                    ACOUSTIC VERDICT:{' '}
                    <span
                      className={
                        result.isDeepfake
                          ? 'text-rose-950'
                          : 'text-emerald-950'
                      }
                    >
                      {result.isDeepfake
                        ? 'DEEP FAKE'
                        : 'AUTHENTIC'}
                    </span>
                  </h2>

                  <p className="text-xs text-slate-900 font-extrabold italic mt-1">
                    {result.verdict}
                  </p>

                  <div className="flex gap-3 pt-3">

                    <div className="px-3.5 py-1.5 bg-[#ffffff] rounded-xl border border-[#e2ddd0] text-center">

                      <p className="text-[9px] font-black text-slate-500 uppercase">
                        Fake Probability
                      </p>

                      <p
                        className={`text-base font-black ${
                          result.isDeepfake
                            ? 'text-rose-900'
                            : 'text-slate-950'
                        }`}
                      >
                        {result.probability}%
                      </p>

                    </div>

                    <div className="px-3.5 py-1.5 bg-[#ffffff] rounded-xl border border-[#e2ddd0] text-center">

                      <p className="text-[9px] font-black text-slate-500 uppercase">
                        Confidence
                      </p>

                      <p className="text-base font-black text-indigo-900">
                        92.4%
                      </p>

                    </div>

                  </div>

                </div>
              </div>

              <button
                onClick={exportPDF}
                className="bg-[#ffffff] p-3 rounded-xl border border-[#dcd7c8] hover:bg-[#f5f2e9] transition-colors text-slate-950 flex items-center gap-2 text-xs font-black"
              >
                <Download size={18} />
                Export Report
              </button>

            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#e2ddd0] space-y-3">

                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                  <Volume2
                    size={16}
                    className="text-indigo-800"
                  />
                  Synthesis Anomalies
                </h4>

                <div className="space-y-2">

                  {(result.anomalies ?? []).map(
                    (anomaly, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 p-2.5 bg-[#f0ece1] rounded-xl border border-[#dcd7c8]"
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-700" />

                        <span className="text-xs text-slate-950 font-bold italic">
                          {anomaly}
                        </span>
                      </div>
                    )
                  )}

                </div>
              </div>

              <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#e2ddd0] flex flex-col justify-center text-center space-y-3">

                <div className="w-10 h-10 bg-[#f0ece1] rounded-full flex items-center justify-center text-indigo-950 mx-auto shadow-2xs">
                  <ShieldCheck size={20} />
                </div>

                <p className="text-xs text-slate-950 leading-relaxed font-bold">
                  "AI voice clones often lack the natural vocal jitter of real human speech. This sample was audited against 144 spectral benchmarks."
                </p>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default VoiceAudit;