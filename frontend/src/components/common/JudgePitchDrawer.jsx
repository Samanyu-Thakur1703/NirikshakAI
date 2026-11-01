import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Info,
  Scale,
} from "lucide-react";

export function JudgePitchDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl overflow-hidden shadow-md text-slate-200">
      {/* Clickable Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] hover:bg-[#1E293B] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#38BDF8]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              EOC Mission Brief & Evaluation Blueprint
              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[#2563EB] text-white font-bold">
                JUDGES & MENTORS
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <span className="hidden sm:inline font-mono text-[11px]">
            {isOpen ? "Click to collapse" : "Click to view USP & Validation Chain"}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#38BDF8]" /> : <ChevronDown className="w-4 h-4 text-[#38BDF8]" />}
        </div>
      </button>

      {/* Expanded Content Body */}
      {isOpen && (
        <div className="p-4 space-y-4 text-xs border-t border-[#1E293B] bg-[#0A0F1D]">
          {/* 1. The 1-Sentence Pitch & Problem Statement */}
          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38BDF8] block">
              Core USP (In One Sentence)
            </span>
            <p className="text-xs text-white leading-relaxed font-medium">
              "NirikshakAI is an AI co-pilot for Indian disaster operators. When a flood hits, social media explodes with fake and duplicate reports. NirikshakAI ingests all signals — official alerts, news, social posts, sensor data — runs them through 6 independent verification checks, and produces a single explainable verdict: verified, review, or rejected. For verified incidents, it drafts a CAP 1.2 XML alert that can be dispatched directly to NDMA — and even calls the operator’s phone."
            </p>
          </div>

          {/* 2. Before vs After Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#7F1D1D]/20 border border-[#EF4444]/40 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#EF4444] block">
                Before NirikshakAI
              </span>
              <ul className="text-[11px] text-slate-300 space-y-0.5">
                <li>• Operator manually reads 500+ chaotic WhatsApp/Twitter posts</li>
                <li>• 4+ hours wasted cross-referencing weather maps</li>
                <li>• 60% false positives & fake recycled crisis photos deployed</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#064E3B]/20 border border-[#10B981]/40 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#10B981] block">
                After NirikshakAI
              </span>
              <ul className="text-[11px] text-slate-300 space-y-0.5">
                <li>• Autonomous ingestion filters 60 signals to 3 verified incidents</li>
                <li>• 5 minutes from signal intake to NDMA CAP 1.2 alert drafting</li>
                <li>• 92% confidence accuracy with explainable C1–C5 proof trail</li>
              </ul>
            </div>
          </div>

          {/* 3. The Human-in-the-Loop Validation Chain */}
          <div className="p-3 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F59E0B] block">
              Who Validates? The 3-Lane Validation Chain
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#064E3B]/30 border border-[#10B981]/40 space-y-0.5">
                <span className="font-bold text-[#10B981] block">Score ≥ 0.80</span>
                <span className="text-white font-medium block">Auto-Verified</span>
                <span className="text-[10px] text-slate-400">C1 Official + C2 Physical pass</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#78350F]/30 border border-[#F59E0B]/40 space-y-0.5">
                <span className="font-bold text-[#F59E0B] block">Score 0.50 – 0.79</span>
                <span className="text-white font-medium block">Pending Operator Review</span>
                <span className="text-[10px] text-slate-400">Human operator clicks Verify to dispatch</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#7F1D1D]/30 border border-[#EF4444]/40 space-y-0.5">
                <span className="font-bold text-[#EF4444] block">Score &lt; 0.40</span>
                <span className="text-white font-medium block">Auto-Rejected (Hoax)</span>
                <span className="text-[10px] text-slate-400">pHash recycled media or sensor contradiction</span>
              </div>
            </div>
          </div>

          {/* 4. The Royal Enfield Distinction */}
          <div className="p-2.5 rounded-lg bg-[#1E293B]/60 border border-[#334155] text-[11px] text-slate-300 flex items-start gap-2">
            <Scale className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">The Vehicle Tracker Question: </strong>
              "A vehicle app tracks single bikes. NirikshakAI is an emergency disinformation detector that verifies disaster claims across 6 independent audit gates and drafts legally compliant CAP 1.2 XML for NDMA. The map is just our visualization layer."
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
