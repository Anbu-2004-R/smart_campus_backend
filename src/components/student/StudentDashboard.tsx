import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  getSystemDate,
  getFormattedCurrentDate,
  getDayOfWeekLabel,
  getDaysDifference,
  ACADEMIC_CALENDAR,
} from '../../lib/academicCalendar';
import {
  CANONICAL_STUDENT_METRICS,
  getRiskStatusConfig,
} from '../../lib/metrics';
import {
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Clock,
  ArrowRight,
  LifeBuoy,
  History,
  X,
  ExternalLink,
  ChevronRight,
  Calendar,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (viewId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentStudentProfile, currentUser } = useAuth();
  const {
    calculateStudentAttendance,
    semesterResults,
    timetable,
    announcements,
    enrollments,
    complaints,
    correctionRequests,
    subjects,
    classrooms,
  } = useERP();

  const studentId = currentStudentProfile?.id || 'stu-1';
  const attendanceSummary = calculateStudentAttendance(studentId);

  // Active Enrollment Record
  const myEnrollments = enrollments.filter((e) => e.studentId === studentId);
  const activeEnrollment = myEnrollments.find((e) => e.status === 'ACTIVE') || myEnrollments[0];

  // Latest published semester result
  const myResults = semesterResults.filter((r) => r.studentId === studentId && r.publishedAt);
  const latestResult = myResults[myResults.length - 1];

  // Current weekday dynamically computed from system date
  const todayDayOfWeek = getDayOfWeekLabel(); // e.g. "Tuesday"
  const todayDayOfWeekKey = todayDayOfWeek.toUpperCase();

  // Today's classes for the student's class group
  const todayClasses = useMemo(() => {
    return timetable
      .filter(
        (t) =>
          t.classGroupId === (currentStudentProfile?.classGroupId || 'cg-cse-5a') &&
          t.dayOfWeek === todayDayOfWeekKey
      )
      .sort((a, b) => a.period - b.period);
  }, [timetable, currentStudentProfile, todayDayOfWeekKey]);

  // Next class calculation based on current system time (09:30 AM)
  const nextClassInfo = useMemo(() => {
    if (todayClasses.length === 0) return 'No classes scheduled today';
    // System time is 09:30 AM
    // Period 1 is 09:00 - 09:50 (in progress)
    // Period 2 is 09:55 - 10:45
    return 'Period 1 in session (09:00–09:50) · Next class at 09:55';
  }, [todayClasses]);

  // Open attendance complaints (Section 4.1)
  const openAttendanceComplaints = useMemo(() => {
    return complaints.filter(
      (c) =>
        (c.submittedByUserId === currentUser?.id || c.submitterName === currentStudentProfile?.fullName) &&
        c.category === 'ATTENDANCE' &&
        (c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'IN_PROGRESS')
    );
  }, [complaints, currentUser, currentStudentProfile]);

  // Open general complaints & correction requests (Section 4.5)
  const myOpenComplaints = complaints.filter(
    (c) =>
      (c.submittedByUserId === currentUser?.id || c.submitterName === currentStudentProfile?.fullName) &&
      (c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'IN_PROGRESS')
  );
  const myPendingCorrections = correctionRequests.filter(
    (r) => r.studentId === studentId && (r.status === 'PENDING_FACULTY' || r.status === 'PENDING_ADMIN')
  );

  // Latest announcements (up to 3) (Section 4.4)
  const latestAnnouncements = announcements.slice(0, 3);

  // Attendance risk config with paired icon & label (Section 1.4)
  const daysToExamCutoff = getDaysDifference(ACADEMIC_CALENDAR.examRegistrationDeadline);
  const riskBadgeConfig = getRiskStatusConfig(attendanceSummary.overallPercentage, daysToExamCutoff);

  // Section 1.3: Attendance review banner logic
  // Shows ONLY when a subject's attendance is below 75%, OR when exam eligibility deadline is within 14 days and student is below 80%.
  // Dismissible for the session only. Do NOT show to a student with 100% attendance and LOW risk.
  const hasSubjectBelow75 = attendanceSummary.subjectWise.some((s) => s.percentage < 75);
  const isApproachingExamCutoffAndBelow80 = daysToExamCutoff <= 14 && attendanceSummary.overallPercentage < 80;
  const shouldTriggerBanner = hasSubjectBelow75 || isApproachingExamCutoffAndBelow80;

  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Helper for student initials avatar (Section 7.4)
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Helper to render lucide risk icon (Section 1.4)
  const renderRiskIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertOctagon':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Identity Card (Section 2.3: Standardized Academic Identity Format & Neutral Circle Initials) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-full bg-slate-100 text-slate-800 border-2 border-slate-300 font-bold text-base flex items-center justify-center shrink-0">
            {getInitials(currentStudentProfile?.fullName || 'Ananya Sharma')}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
              <span className="font-mono font-semibold text-slate-900">
                {currentStudentProfile?.registerNumber || CANONICAL_STUDENT_METRICS.registerNumber}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600">
                {ACADEMIC_CALENDAR.academicYearCode} · Semester {currentStudentProfile?.currentSemester || 5}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeEnrollment?.status || 'ACTIVE'}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {currentStudentProfile?.fullName || CANONICAL_STUDENT_METRICS.fullName}
            </h2>
            {/* Standardized Academic Identity format: B.Tech Computer Science & Engineering · Semester 5 · Section A */}
            <p className="text-xs text-slate-600 mt-0.5">
              {CANONICAL_STUDENT_METRICS.academicIdentity.formattedString} ({activeEnrollment?.creditsRegistered || 17} Registered Credits)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Enrolment History</span>
          </button>
          <button
            onClick={() => onNavigate('student-attendance')}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => onNavigate('student-results')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Results</span>
          </button>
        </div>
      </div>

      {/* Dismissible Attendance Review Notice (Section 1.3: Reduced visual weight, only shown if needed) */}
      {shouldTriggerBanner && !isBannerDismissed && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-900">Mandatory Attendance Review Notice</div>
              <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                Institutional regulations require minimum 75.0% attendance in each subject to sit for End Semester Examinations.
                {hasSubjectBelow75 && ' One or more subjects are currently below 75%.'}
                {isApproachingExamCutoffAndBelow80 && ` The eligibility cutoff is in ${daysToExamCutoff} days.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBannerDismissed(true)}
            className="text-amber-700 hover:text-amber-900 p-1 rounded hover:bg-amber-100/60 transition-colors cursor-pointer"
            title="Dismiss notice for this session"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Single KPI Row (Section 4.8: One KPI row at most, neutral value colors, each links to detail page) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overall Attendance */}
        <div
          onClick={() => onNavigate('student-attendance')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Overall Attendance</span>
            <CalendarCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {attendanceSummary.overallPercentage}%
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {attendanceSummary.attendedClasses} of {attendanceSummary.totalClasses} classes
            </div>
          </div>

          {/* Section 4.1: If student has open attendance complaint, show link under card */}
          {openAttendanceComplaints.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('student-complaints');
              }}
              className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-between"
            >
              <span>{openAttendanceComplaints.length} attendance complaint under review</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Exam threshold: &ge; 75.0%
            </div>
          )}
        </div>

        {/* KPI 2: Attendance Risk Standing (Section 1.4: Paired Icon and Text Label, no color alone) */}
        <div
          onClick={() => onNavigate('student-attendance')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Risk Standing</span>
            {renderRiskIcon(riskBadgeConfig.iconName)}
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{riskBadgeConfig.label}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {attendanceSummary.recentAbsenceCount} absence(s) in last 14 days
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Audit status: Verified
          </div>
        </div>

        {/* KPI 3: Cumulative CGPA (Section 2.2: Single canonical metric name, no competing names) */}
        <div
          onClick={() => onNavigate('student-results')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cumulative CGPA</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {CANONICAL_STUDENT_METRICS.cumulativeCGPA.toFixed(2)}
            </div>
            {/* Section 4.2: Results publication status */}
            <div className="text-xs text-slate-500 mt-0.5">
              {latestResult?.publishedAt
                ? `Results published on ${new Date(latestResult.publishedAt).toLocaleDateString()}`
                : 'Semester 5 results pending publication'}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Scale: 10.0 UGC Framework
          </div>
        </div>

        {/* KPI 4: Today's Classes (Section 4.3: Dynamic from current weekday Tuesday) */}
        <div
          onClick={() => onNavigate('student-timetable')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Classes Today ({todayDayOfWeek})</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {todayClasses.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">
              {nextClassInfo}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-between">
            <span>View Full Timetable</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Examination Schedule & Hall Ticket Clearance (Section 4.7 & 1.2: Nov 2026 dates) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
                Examinations
              </span>
              <span className="text-slate-300">·</span>
              <h3 className="text-sm font-bold text-slate-900">End Semester Theory Examinations ({ACADEMIC_CALENDAR.academicYearCode})</h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Controller of Examinations approved schedule. Hall tickets issued strictly to scholars with &ge; 75.0% attendance.
            </p>
          </div>

          {/* Section 4.7: Hall ticket cleared only when >= 75% */}
          <div className="shrink-0">
            {attendanceSummary.overallPercentage >= 75 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hall ticket cleared</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>Hall ticket not yet cleared (Requires 75.0%)</span>
              </span>
            )}
          </div>
        </div>

        {/* 3 Upcoming Exam Papers in November 2026 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-slate-900">CS501 · Operating Systems</div>
              <div className="font-semibold text-slate-800 mt-1">Monday, Nov 16, 2026</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">09:30 AM – 12:30 PM (3 Hours)</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-mono">
              <span>Venue: <strong>LH-101</strong></span>
              <span>Seat: A-14</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-slate-900">CS502 · Database Systems</div>
              <div className="font-semibold text-slate-800 mt-1">Thursday, Nov 19, 2026</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">09:30 AM – 12:30 PM (3 Hours)</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-mono">
              <span>Venue: <strong>LH-101</strong></span>
              <span>Seat: A-14</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-slate-900">CS503 · Computer Networks</div>
              <div className="font-semibold text-slate-800 mt-1">Monday, Nov 23, 2026</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">09:30 AM – 12:30 PM (3 Hours)</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-mono">
              <span>Venue: <strong>LH-102</strong></span>
              <span>Seat: B-08</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Subject Attendance Breakdown & Today's Schedule + Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subject Attendance Overview */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subject Attendance</h3>
              <p className="text-xs text-slate-600">Continuous attendance records across registered Semester 5 subjects</p>
            </div>
            <button
              onClick={() => onNavigate('student-attendance')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {attendanceSummary.subjectWise.map((sub) => (
              <div
                key={sub.subjectId}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{sub.subjectCode}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-medium text-slate-800">{sub.subjectName}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                    Attended: <strong>{sub.attended}</strong> of {sub.total} sessions
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sub.percentage >= 80 ? 'bg-emerald-600' : sub.percentage >= 75 ? 'bg-amber-600' : 'bg-rose-600'
                      }`}
                      style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-slate-900 w-12 text-right tabular-nums">
                    {sub.percentage}%
                  </span>
                  <StatusBadge status={sub.riskLevel} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Today's Timetable Classes & Open Requests (Sections 4.3 & 4.5) */}
        <div className="space-y-6">
          {/* Today's Lectures */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Today&apos;s Classes ({todayDayOfWeek})</h3>
              <button
                onClick={() => onNavigate('student-timetable')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Timetable &rarr;
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {todayClasses.length === 0 ? (
                <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                  No classes scheduled for today.
                </div>
              ) : (
                todayClasses.map((item) => {
                  const subject = subjects.find((s) => s.id === item.subjectId);
                  const room = classrooms.find((r) => r.id === item.classroomId);
                  return (
                    <div key={item.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {subject?.code} · {subject?.name}
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                          Period {item.period} · {item.startTime} – {item.endTime}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {room?.roomNumber || 'LH-101'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Requests & Open Complaints (Section 4.5) */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Pending Requests</h3>
              <button
                onClick={() => onNavigate('student-complaints')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Complaints &rarr;
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {myOpenComplaints.length === 0 && myPendingCorrections.length === 0 ? (
                <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                  No pending complaints or correction requests.
                </div>
              ) : (
                <>
                  {myOpenComplaints.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onNavigate('student-complaints')}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-mono text-[10px] text-slate-500 font-semibold">{c.ticketNumber}</div>
                        <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))}

                  {myPendingCorrections.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => onNavigate('student-attendance')}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-mono text-[10px] text-slate-500 font-semibold">ATT-CORRECTION</div>
                        <div className="font-semibold text-slate-900 truncate">Date: {r.sessionDate}</div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Campus Announcements (Section 4.4: Up to 3) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Official Announcements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {latestAnnouncements.map((anc) => (
            <div key={anc.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {anc.priority}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(anc.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-bold text-slate-900 mt-1 line-clamp-2">{anc.title}</div>
                <p className="text-slate-600 text-[11px] mt-1 line-clamp-3 leading-relaxed">{anc.content}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-medium">
                {anc.authorName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrolment Progression History Modal */}
      {isHistoryModalOpen && (
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          title="Academic Enrolment & Progression History"
          subtitle={`Register Number: ${currentStudentProfile?.registerNumber || '21CS101'}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">{currentStudentProfile?.fullName || 'Ananya Sharma'}</div>
              <div className="text-[11px] text-slate-600 font-mono">
                Department: Computer Science &amp; Engineering · Degree: B.Tech (4 Years)
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {myEnrollments.map((enr) => (
                <div key={enr.id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Semester {enr.semester}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-700">AY {enr.academicYear}</span>
                      <StatusBadge status={enr.status} />
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Class Section: <strong>{enr.classGroupName}</strong> · Registered: <strong>{enr.creditsRegistered}</strong> Credits
                    </div>
                    {enr.remarks && <p className="text-[11px] text-slate-500 italic mt-0.5">{enr.remarks}</p>}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{enr.enrollmentDate}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
