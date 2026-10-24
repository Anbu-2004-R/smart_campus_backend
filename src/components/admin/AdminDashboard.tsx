import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  LifeBuoy,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  onNavigate: (viewId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    studentProfiles,
    facultyProfiles,
    attendanceRecords,
    correctionRequests,
    complaints,
    exams,
    auditLogs,
    riskSettings,
    calculateStudentAttendance,
    enrollments,
    admissionApplications,
  } = useERP();

  // Compute student & faculty totals
  const totalStudents = studentProfiles.length;
  const totalFaculty = facultyProfiles.length;

  // Enrollment & Admission stats
  const activeEnrollmentsCount = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const pendingApps = admissionApplications.filter(
    (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW'
  );
  const admittedApps = admissionApplications.filter((a) => a.status === 'APPROVED');
  const rejectedApps = admissionApplications.filter((a) => a.status === 'REJECTED');

  // Compute institutional attendance
  let totalAttended = 0;
  attendanceRecords.forEach((r) => {
    if (r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'ON_DUTY') totalAttended++;
  });
  const institutionalAttendance =
    attendanceRecords.length > 0
      ? Math.round((totalAttended / attendanceRecords.length) * 1000) / 10
      : 88.5;

  // Risk distribution
  let lowRiskCount = 0;
  let mediumRiskCount = 0;
  let highRiskCount = 0;

  studentProfiles.forEach((s) => {
    const summary = calculateStudentAttendance(s.id);
    if (summary.riskLevel === 'HIGH') highRiskCount++;
    else if (summary.riskLevel === 'MEDIUM') mediumRiskCount++;
    else lowRiskCount++;
  });

  const pendingAdminApprovals = correctionRequests.filter((r) => r.status === 'PENDING_ADMIN');
  const openComplaints = complaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'IN_PROGRESS'
  );
  const criticalComplaints = complaints.filter(
    (c) => c.officialPriority === 'CRITICAL' || c.officialPriority === 'HIGH'
  );

  const activeExams = exams.filter((e) => e.status !== 'PUBLISHED');

  const departmentData = [
    { name: 'CSE', attendance: 84.5, students: 480 },
    { name: 'ECE', attendance: 86.2, students: 420 },
    { name: 'MECH', attendance: 79.8, students: 360 },
    { name: 'CIVIL', attendance: 82.1, students: 310 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Academic Operations Portal */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 font-mono">
              Academic Operations Portal
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">Autonomous College Administration</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time admissions, compliance monitoring, exam readiness, and complaint resolution metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('admin-enrollment')}
            className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs flex items-center gap-2"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Admissions &amp; Enrolment</span>
            {pendingApps.length > 0 && (
              <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full font-mono text-[10px]">
                {pendingApps.length}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate('admin-exams')}
            className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Manage Examinations</span>
          </button>
          <button
            onClick={() => onNavigate('admin-attendance')}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-2"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Review Corrections</span>
          </button>
        </div>
      </div>

      {/* Actionable Alerts Banner Strip */}
      {(pendingApps.length > 0 || pendingAdminApprovals.length > 0 || highRiskCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pendingApps.length > 0 && (
            <div
              onClick={() => onNavigate('admin-enrollment')}
              className="cursor-pointer p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/90 text-indigo-950 flex items-start gap-3 hover:bg-indigo-50 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Admissions Pipeline Queue</span>
                  <span className="font-mono text-[10px] bg-indigo-200/70 text-indigo-800 px-1.5 py-0.2 rounded font-bold">
                    {pendingApps.length} Action Needed
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800/90 mt-0.5 line-clamp-1">
                  Candidate credential verification and section allocation pending.
                </p>
              </div>
            </div>
          )}

          {pendingAdminApprovals.length > 0 && (
            <div
              onClick={() => onNavigate('admin-attendance')}
              className="cursor-pointer p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex items-start gap-3 hover:bg-amber-50 transition-colors"
            >
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Late Attendance Escalations (D-1)</span>
                  <span className="font-mono text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    {pendingAdminApprovals.length} Escalated
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/90 mt-0.5 line-clamp-1">
                  Requests submitted older than 7-day window require Registrar decision.
                </p>
              </div>
            </div>
          )}

          {highRiskCount > 0 && (
            <div
              onClick={() => onNavigate('admin-attendance')}
              className="cursor-pointer p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/90 text-rose-950 flex items-start gap-3 hover:bg-rose-50 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Exam Clearance Debarment</span>
                  <span className="font-mono text-[10px] bg-rose-200/70 text-rose-900 px-1.5 py-0.2 rounded font-bold">
                    {highRiskCount} High Risk
                  </span>
                </div>
                <p className="text-[11px] text-rose-800/90 mt-0.5 line-clamp-1">
                  Students below the 75.0% threshold facing hall ticket withholding.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Enrolled Students"
          value={activeEnrollmentsCount}
          subValue={`${totalStudents} Registered Profiles`}
          trend={{ value: '+4.2% YoY Enrolment', isPositive: true }}
          icon={Users}
          accentColor="slate"
          onClick={() => onNavigate('admin-enrollment')}
        />
        <StatCard
          label="Admissions Pipeline"
          value={admissionApplications.length}
          subValue={`${pendingApps.length} In Review · ${admittedApps.length} Admitted`}
          trend={{
            value: pendingApps.length > 0 ? `${pendingApps.length} Pending Review` : 'All Reviewed',
            isNeutral: pendingApps.length === 0,
            isPositive: pendingApps.length === 0,
          }}
          icon={UserCheck}
          accentColor="indigo"
          onClick={() => onNavigate('admin-enrollment')}
        />
        <StatCard
          label="Overall Attendance"
          value={`${institutionalAttendance}%`}
          subValue={`Min Threshold: ${riskSettings.highRiskThreshold}%`}
          trend={{
            value: institutionalAttendance >= riskSettings.highRiskThreshold ? 'Compliant' : 'Warning',
            isPositive: institutionalAttendance >= riskSettings.highRiskThreshold,
          }}
          icon={CalendarCheck}
          accentColor="emerald"
          onClick={() => onNavigate('admin-attendance')}
        />
        <StatCard
          label="Actionable Approvals"
          value={pendingAdminApprovals.length + openComplaints.length + pendingApps.length}
          subValue={`${pendingAdminApprovals.length} Attn · ${openComplaints.length} Complaints · ${pendingApps.length} Apps`}
          trend={{ value: 'Action Required', isNeutral: true }}
          icon={LifeBuoy}
          accentColor="amber"
          onClick={() => onNavigate('admin-attendance')}
        />
      </div>

      {/* Institutional Enrolment & Admissions Pipeline Section */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
                Pipeline
              </span>
              <span className="text-slate-300">·</span>
              <h3 className="text-sm font-bold text-slate-900">
                Student Enrolment &amp; Admissions Pipeline Overview
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Administer admissions intake, active semester enrolments, and term promotions with historical record preservation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('admin-enrollment')}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Manage Admissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pipeline Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-100">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Total Applications</span>
            <span className="text-lg font-bold font-mono text-slate-900">{admissionApplications.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">AY 2025–2026</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/70">
            <span className="text-[11px] text-amber-800 font-medium block">In Review / Queue</span>
            <span className="text-lg font-bold font-mono text-amber-900">{pendingApps.length}</span>
            <span className="text-[10px] text-amber-700 block mt-0.5">Awaiting Decision</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/70">
            <span className="text-[11px] text-emerald-800 font-medium block">Admitted &amp; Active</span>
            <span className="text-lg font-bold font-mono text-emerald-900">{admittedApps.length}</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Registered in Group</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200/70">
            <span className="text-[11px] text-rose-800 font-medium block">Rejected Applications</span>
            <span className="text-lg font-bold font-mono text-rose-900">{rejectedApps.length}</span>
            <span className="text-[10px] text-rose-700 block mt-0.5">Reason Recorded</span>
          </div>
        </div>

        {/* Recent Applications Snapshot Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Candidate Name &amp; App ID</th>
                <th className="px-4 py-2.5">Degree &amp; Department</th>
                <th className="px-4 py-2.5">Prior Qualification</th>
                <th className="px-4 py-2.5">Academic Score</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {admissionApplications.slice(0, 3).map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-900">{app.applicantName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{app.applicationNumber}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-800 font-sans">{app.academicYear}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Sem {app.appliedSemester}</div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 truncate max-w-[200px]">
                    {app.previousQualification}
                  </td>
                  <td className="px-4 py-2.5 font-mono font-bold text-indigo-700">
                    {app.percentageOrGpa}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => onNavigate('admin-enrollment')}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      {app.status === 'SUBMITTED' ? 'Review & Decide' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column Split: Attendance Trend by Department & Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance by Department Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Departmental Attendance Distribution</h3>
              <p className="text-xs text-slate-500">Average student presence rate for Autumn 2025</p>
            </div>
            <div className="text-xs text-slate-400 font-mono">Target: &ge; 75.0%</div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Avg Attendance']}
                />
                <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                  {departmentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.attendance >= 80 ? '#10b981' : entry.attendance >= 75 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span>Good (&ge; 80%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                <span>Moderate (75–80%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                <span>At Risk (&lt; 75%)</span>
              </span>
            </div>
            <button
              onClick={() => onNavigate('admin-attendance')}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span>View full register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Risk & Publication Summary Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Academic Regulation Status</h3>
            <p className="text-xs text-slate-500 mb-4">Official college thresholds &amp; publication checks</p>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700">7-Day Attendance Rule (D-1)</span>
                  <span className="text-xs font-mono font-medium text-emerald-600">Active</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Corrections &le; 7 days handled by faculty. Requests exceeding 7 days are escalated to the Registrar.
                </p>
                <div className="mt-2 text-xs font-mono text-slate-700">
                  Pending Admin: <span className="font-bold text-amber-600">{pendingAdminApprovals.length}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700">Result Publication Gate</span>
                  <span className="text-xs font-mono font-medium text-indigo-600">Strict Lock</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Publication is blocked until all required marks have valid final statuses. Pending marks are never converted to zero.
                </p>
                <div className="mt-2 text-xs font-mono text-slate-700">
                  Upcoming Exam: <span className="font-bold">Autumn 2025 ESE</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700">Complaint Redressal (D-2/D-5)</span>
                  <span className="text-xs font-mono font-medium text-slate-600">
                    {criticalComplaints.length} High Priority
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Submitters request priority; Administrator confirms or revises. Rejections require recorded reason.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Autonomous Ruleset v2.0</span>
            <button
              onClick={() => onNavigate('admin-settings')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Configure Rules &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 2-Column: Recent Escalated Requests & Security Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Escalated Attendance Approvals */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Escalated Late Attendance Corrections</h3>
              <p className="text-xs text-slate-500">Submissions older than the 7-day faculty window</p>
            </div>
            <button
              onClick={() => onNavigate('admin-attendance')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              View all ({correctionRequests.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingAdminApprovals.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No escalated late correction requests awaiting administrative action.
              </div>
            ) : (
              pendingAdminApprovals.map((req) => (
                <div key={req.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {studentProfiles.find((s) => s.id === req.studentId)?.fullName || 'Student'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {studentProfiles.find((s) => s.id === req.studentId)?.registerNumber}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Session date: <span className="font-mono font-medium">{req.sessionDate}</span> · Requested:{' '}
                      <span className="font-semibold text-slate-800">{req.requestedStatus}</span>
                    </div>
                    <p className="text-xs text-slate-500 italic mt-0.5">&ldquo;{req.reason}&rdquo;</p>
                  </div>
                  <button
                    onClick={() => onNavigate('admin-attendance')}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Audit Feed */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Administrative Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable record of high-privilege operations</p>
            </div>
            <button
              onClick={() => onNavigate('admin-audit')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Full Trail &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                <div className="p-1.5 rounded bg-white border border-slate-200 text-slate-700 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 truncate">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{log.details}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>By: {log.actorName}</span>
                    <span>·</span>
                    <span className="font-mono">{log.entityType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
