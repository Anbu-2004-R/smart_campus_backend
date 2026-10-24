import React, { useState } from 'react';
import { School, Layers, Sparkles } from 'lucide-react';
import { TodayPreview } from './TodayPreview';

export const BrandPanel: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative h-full flex flex-col justify-between p-8 lg:p-12 xl:p-14 overflow-hidden bg-[#070D18] text-white">
      {/* Background Architectural Canvas & Graceful Fallback */}
      {!imageError ? (
        <img
          src="/src/assets/images/campus_modern_facade_1792514981626.jpg"
          alt="Smart Campus Modern Academic Center"
          onError={() => setImageError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity filter contrast-125 scale-105"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950"
          aria-hidden="true"
        />
      )}

      {/* Layered Lighting Scrims */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060B14] via-[#070D18]/90 to-[#0A1120]/75" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Identity Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/60 border border-indigo-400/30 shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[19px] font-bold tracking-tight text-white flex items-center gap-2">
                <span>Smart Campus ERP</span>
              </div>
              <div className="text-xs text-indigo-300 font-medium">
                Apex Institute of Technology
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-300 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none" />
            <span>AY 2025–26</span>
          </div>
        </div>

        {/* Heading & Mission */}
        <div className="mt-8 space-y-2 max-w-lg">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            Timetables, attendance, results, and complaints in one place.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Institutional governance platform for scholars, faculty, and administrators with role-authoritative workflows and continuous academic evaluation.
          </p>
        </div>
      </div>

      {/* Center Live Telemetry Preview */}
      <div className="relative z-10 my-6 sm:my-8 max-w-lg">
        <TodayPreview />
      </div>

      {/* Bottom Academic Trust Markers */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Autonomous Academic Framework</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span>Continuous Assessment</span>
          <span>·</span>
          <span>7-Day Audit Review</span>
        </div>
      </div>
    </div>
  );
};
