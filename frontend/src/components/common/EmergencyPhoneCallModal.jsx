import React, { useEffect, useState } from "react";
import {
  PhoneCall,
  PhoneOff,
  Radio,
  ShieldAlert,
  Volume2,
  VolumeX,
  FileText,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { playEmergencyRing, speakDispatchDirective } from "../../utils/emergencyAudio";

export function EmergencyPhoneCallModal({
  isOpen,
  onClose,
  incident,
  capXml,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [callActive, setCallActive] = useState(true);

  const title = incident?.title || "Severe Flood Inundation in Phase 8 Mohali";
  const location = incident?.location || "Mohali, Punjab";
  const confidence = Math.round((incident?.confidenceScore || 0.94) * 100);

  const dispatchSpeechText = `Official NDMA Emergency Dispatch Directive. Priority deployment authorized for disaster incident: ${title}, location ${location}. Verified with ${confidence} percent multi-source confidence. NDRF Battalion authorized for immediate rescue mobilization.`;

  useEffect(() => {
    if (isOpen) {
      setCallActive(true);
      // Play two-tone alert ring
      playEmergencyRing();
      setTimeout(playEmergencyRing, 1200);

      // Speak alert directive
      const timer = setTimeout(() => {
        speakDispatchDirective(dispatchSpeechText);
      }, 1000);

      return () => {
        clearTimeout(timer);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      };
    }
  }, [isOpen, incident]);

  if (!isOpen) return null;

  const handleEndCall = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setCallActive(false);
    onClose();
  };

  const handleToggleMute = () => {
    if (window.speechSynthesis) {
      if (isMuted) {
        speakDispatchDirective(dispatchSpeechText);
        setIsMuted(false);
      } else {
        window.speechSynthesis.cancel();
        setIsMuted(true);
      }
    }
  };

  const handleCopyXml = () => {
    if (capXml) {
      navigator.clipboard.writeText(capXml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0F172A] border-2 border-[#EF4444] rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden text-white flex flex-col">
        {/* Top Emergency Beacon Bar */}
        <div className="bg-[#DC2626] px-4 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>NDMA Emergency Automated Voice Dispatch</span>
          </div>
          <span className="bg-black/30 px-2 py-0.5 rounded font-mono text-[10px]">LIVE CALL</span>
        </div>

        {/* Call Display Box */}
        <div className="p-6 text-center space-y-4">
          {/* Animated Call Ring Icon */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-[#EF4444] opacity-25 animate-ping"></span>
            <span className="absolute inset-2 rounded-full bg-[#EF4444] opacity-40 animate-pulse"></span>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#DC2626] to-[#EF4444] border-2 border-white flex items-center justify-center shadow-xl">
              <PhoneCall className="w-8 h-8 text-white animate-bounce" />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono font-bold text-[#F59E0B] uppercase tracking-wider block">
              Direct Emergency Line • NDMA EOC Control
            </span>
            <h3 className="text-lg font-extrabold text-white mt-1">
              +91-11-26701700 (EOC Dispatch)
            </h3>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Protocol: CAP 1.2 Text-to-Speech Gateway
            </p>
          </div>

          {/* Incident Audio Directive Transcript */}
          <div className="bg-[#090D17] border border-[#334155] rounded-xl p-3.5 text-left space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
              <span className="flex items-center gap-1 text-[#10B981] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                TRANSCRIBING CALL DIRECTIVE
              </span>
              <span>CONFIDENCE: {confidence}%</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
              "{dispatchSpeechText}"
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleToggleMute}
              className="p-3 rounded-full bg-[#1E293B] hover:bg-[#334155] text-slate-200 transition-colors border border-[#334155] cursor-pointer"
              title={isMuted ? "Unmute Voice" : "Mute Voice"}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-[#EF4444]" /> : <Volume2 className="w-5 h-5 text-[#10B981]" />}
            </button>

            {capXml && (
              <button
                onClick={handleCopyXml}
                className="px-3.5 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-[#334155] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#38BDF8]" />}
                <span>{copied ? "CAP XML Copied!" : "Copy CAP XML"}</span>
              </button>
            )}

            <button
              onClick={handleEndCall}
              className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-900/50 transition-all cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Acknowledge & End</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-[#090D17] px-4 py-2 border-t border-[#1E293B] text-[10px] text-slate-400 text-center font-mono">
          Speaks directly to the operator room • Live speech synthesizer active
        </div>
      </div>
    </div>
  );
}
