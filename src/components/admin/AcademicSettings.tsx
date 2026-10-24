import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Settings,
  ShieldAlert,
  Percent,
  Sliders,
  CheckCircle2,
  BookOpen,
  Building,
  GraduationCap,
} from 'lucide-react';
import { AttendanceRiskSettings } from '../../types/erp';

export const AcademicSettings: React.FC = () => {
  const {
    riskSettings,
    updateRiskSettings,
    gradeRules,
    departments,
    courses,
    subjects,
  } = useERP();

  const [highRisk, setHighRisk] = useState(riskSettings.highRiskThreshold);
  const [medRisk, setMedRisk] = useState(riskSettings.mediumRiskThreshold);
  const [trendDays, setTrendDays] = useState(riskSettings.recentAbsenceTrendDays);
  const [consecutive, setConsecutive] = useState(riskSettings.warningConsecutiveAbsences);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveRisk = (e: React.FormEvent) => {
    e.preventDefault();
    updateRiskSettings(
      {
        highRiskThreshold: Number(highRisk),
        mediumRiskThreshold: Number(medRisk),
        recentAbsenceTrendDays: Number(trendDays),
        warningConsecutiveAbsences: Number(consecutive),
      },
      'Dr. A. K. Sundaram (Registrar)'
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">Academic Regulations & Policy Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Autonomous institutional rules governing attendance eligibility thresholds, grade boundaries, and grading points.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Risk Thresholds (Decision D-6) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Attendance Risk Thresholds (D-6)</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Configure the automated alert criteria that trigger warnings and mark candidates ineligible for End Semester Examinations.
          </p>

          {savedSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Threshold parameters saved and audit-logged successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveRisk} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  High Risk Cutoff (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="90"
                    value={highRisk}
                    onChange={(e) => setHighRisk(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Below this = High Risk (Exam Ineligible)</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Medium Risk Boundary (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="60"
                    max="95"
                    value={medRisk}
                    onChange={(e) => setMedRisk(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Between High and this = Medium Risk Warning</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Recent Trend Window (Days)
                </label>
                <input
                  type="number"
                  min="7"
                  max="30"
                  value={trendDays}
                  onChange={(e) => setTrendDays(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Time window for recent absence spike</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Consecutive Absences Trigger
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={consecutive}
                  onChange={(e) => setConsecutive(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Consecutive missed sessions causing escalation</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                Save Threshold Parameters
              </button>
            </div>
          </form>
        </div>

        {/* 10-Point Letter Grading Scale */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">UGC 10-Point Official Grading Scale</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Boundaries for GPA computation: GPA = &sum;(Subject Credits &times; Grade Point) / &sum;(Subject Credits).
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2">Grade</th>
                  <th className="px-3 py-2">Range (%)</th>
                  <th className="px-3 py-2">Point</th>
                  <th className="px-3 py-2">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {gradeRules.map((r) => (
                  <tr key={r.grade} className="hover:bg-slate-50/50">
                    <td className="px-3 py-1.5 font-bold text-slate-900">{r.grade}</td>
                    <td className="px-3 py-1.5 text-slate-600">
                      {r.minPercentage}% – {r.maxPercentage}%
                    </td>
                    <td className="px-3 py-1.5 font-semibold text-indigo-600">{r.gradePoint}</td>
                    <td className="px-3 py-1.5 font-sans text-slate-700">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Academic Master Catalog Summary */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Academic Master Catalog</h3>
        <p className="text-xs text-slate-500 mb-4">Relational entities configured in the MySQL schema</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs mb-1">
              <Building className="w-4 h-4 text-slate-500" />
              <span>Departments ({departments.length})</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 mt-2">
              {departments.map((d) => (
                <li key={d.id} className="flex justify-between">
                  <span>{d.code}</span>
                  <span className="font-mono text-slate-400">{d.studentCount} students</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs mb-1">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Degree Programmes ({courses.length})</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 mt-2">
              {courses.map((c) => (
                <li key={c.id} className="truncate">
                  <span>{c.code} · {c.degreeType}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs mb-1">
              <GraduationCap className="w-4 h-4 text-slate-500" />
              <span>Registered Subjects ({subjects.length})</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 mt-2">
              {subjects.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span className="font-mono">{s.code}</span>
                  <span className="text-slate-400">{s.credits} Credits</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
