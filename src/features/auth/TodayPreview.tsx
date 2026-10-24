import React from 'react';
import { PREVIEW_TIMETABLE_TODAY, PREVIEW_STUDENT_ATTENDANCE } from '../../data';
import { Clock, CheckCircle2 } from 'lucide-react';

export const TodayPreview: React.FC = () => {
  const percentage = PREVIEW_STUDENT_ATTENDANCE.attendancePercentage;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl bg-[#0B1528]/85 backdrop-blur-md border border-[#1E3050] text-slate-200 shadow-2xl shadow-[#040812]/70 space-y-5 select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1A2C49]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            Today at a Glance
          </span>
        </div>
        <span className="text-[11px] font-mono tabular-nums text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
          3 Lecture Sessions
        </span>
      </div>

      {/* Timetable Rows */}
      <div className="space-y-2">
        {PREVIEW_TIMETABLE_TODAY.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#070D1A]/70 border border-[#182741] text-xs transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono tabular-nums text-slate-400 text-[11px] w-24 shrink-0">
                {item.time}
              </span>
              <div>
                <span className="font-semibold text-white tracking-wide mr-2">
                  {item.courseCode}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {item.courseName}
                </span>
              </div>
            </div>
            <span className="text-slate-300 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              {item.room}
            </span>
          </div>
        ))}
      </div>

      {/* Attendance Standing Ring */}
      <div className="pt-3 border-t border-[#1A2C49] flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 68 68">
            <circle
              cx="34"
              cy="34"
              r={radius}
              stroke="#16253D"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="34"
              cy="34"
              r={radius}
              stroke="#6366F1"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute font-mono tabular-nums text-xs font-bold text-white">
            {percentage}%
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Attendance Standing</span>
          </div>
          <div className="text-[12px] text-slate-300">
            {PREVIEW_STUDENT_ATTENDANCE.studentName}{' '}
            <span className="font-mono text-slate-400 text-[11px]">
              ({PREVIEW_STUDENT_ATTENDANCE.registerNumber})
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Cleared for examinations (&ge;75% threshold)
          </div>
        </div>
      </div>
    </div>
  );
};
