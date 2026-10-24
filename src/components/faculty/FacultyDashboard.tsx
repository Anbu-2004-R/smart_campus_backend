import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  LifeBuoy,
  Users,
  Building,
  Check,
  ChevronRight,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface FacultyDashboardProps {
  onNavigate: (viewId: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  const { currentFacultyProfile } = useAuth();
  const {
    facultyAssignments,
    subjects,
    classGroups,
    correctionRequests,
    timetable,
    complaints,
    studentMarks,
    studentProfiles,
    exams,
    calculateStudentAttendance,
    attendanceRecords,
    classSessions,
  } = useERP();

  const facId = currentFacultyProfile?.id || 'fac-1';

  // Find assignments for this faculty
  const myAssignments = facultyAssignments.filter((fa) => fa.facultyId === facId);
  const mySubjects = subjects.filter((s) => myAssignments.some((fa) => fa.subjectId === s.id));

  // Pending 7-day corrections assigned to this faculty's subjects
  const myPendingCorrections = correctionRequests.filter(
    (r) =>
      r.status === 'PENDING_FACULTY' &&
      r.isEligibleForFaculty &&
      myAssignments.some((fa) => fa.subjectId === r.subjectId)
  );

  // Teaching sessions today (e.g. Monday schedule)
  const mySchedule = timetable.filter((t) => t.facultyId === facId && t.dayOfWeek === 'MONDAY');

  // Assigned complaints
  const myComplaints = complaints.filter(
    (c) => c.assignedToFacultyId === facId && c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  );

  // Examination marks pending for this faculty
  const currentExam = exams.find((e) => e.status !== 'PUBLISHED') || exams[0];
  const pendingMarksCount = studentMarks.filter(
    (m) =>
      m.examId === currentExam.id &&
      myAssignments.some((fa) => fa.subjectId === m.subjectId) &&
      m.status === 'MARKS_PENDING'
  ).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 font-mono">
              Faculty Workspace
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">{currentFacultyProfile?.designation}</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome, {currentFacultyProfile?.fullName} · Department of Computer Science &amp; Engineering · Employee ID: <span className="font-mono">{currentFacultyProfile?.employeeId}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('faculty-attendance')}
            className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Mark Today&apos;s Attendance</span>
          </button>
          <button
            onClick={() => onNavigate('faculty-marks')}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-2"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Marks Entry Sheet</span>
            {pendingMarksCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full font-mono text-[10px]">
                {pendingMarksCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Actionable Urgent Alerts Strip */}
      {(myPendingCorrections.length > 0 || pendingMarksCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {myPendingCorrections.length > 0 && (
            <div
              onClick={() => onNavigate('faculty-corrections')}
              className="cursor-pointer p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex items-start gap-3 hover:bg-amber-50 transition-colors"
            >
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>7-Day Attendance Correction Window (D-1)</span>
                  <span className="font-mono text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    {myPendingCorrections.length} Action Needed
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/90 mt-0.5 line-clamp-1">
                  Requests submitted within 7 days of class date. Faculty review authority expires after day 7.
                </p>
              </div>
            </div>
          )}

          {pendingMarksCount > 0 && (
            <div
              onClick={() => onNavigate('faculty-marks')}
              className="cursor-pointer p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/90 text-indigo-950 flex items-start gap-3 hover:bg-indigo-50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Assessment Marks Entry Gate</span>
                  <span className="font-mono text-[10px] bg-indigo-200/80 text-indigo-900 px-1.5 py-0.2 rounded font-bold">
                    {pendingMarksCount} Pending
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800/90 mt-0.5 line-clamp-1">
                  Results publication is blocked until all required marks have valid numerical or absence statuses.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Subjects"
          value={mySubjects.length}
          subValue={`${myAssignments.length} Class Section(s)`}
          icon={BookOpen}
          accentColor="indigo"
          onClick={() => onNavigate('faculty-attendance')}
        />
        <StatCard
          label="Sessions Today (Mon)"
          value={mySchedule.length}
          subValue="Weekly Lectures"
          icon={Clock}
          accentColor="slate"
          onClick={() => onNavigate('faculty-timetable')}
        />
        <StatCard
          label="7-Day Corrections"
          value={myPendingCorrections.length}
          subValue="Action Required (D-1)"
          trend={{
            value: myPendingCorrections.length > 0 ? `${myPendingCorrections.length} pending review` : 'All Reviewed',
            isNeutral: myPendingCorrections.length === 0,
            isPositive: myPendingCorrections.length === 0,
          }}
          icon={CheckCircle2}
          accentColor="amber"
          onClick={() => onNavigate('faculty-corrections')}
        />
        <StatCard
          label="Assigned Complaints"
          value={myComplaints.length}
          subValue="Active Redressal Tasks"
          icon={LifeBuoy}
          accentColor="rose"
          onClick={() => onNavigate('faculty-complaints')}
        />
      </div>

      {/* Today's Teaching Schedule Strip */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600">
                Today&apos;s Lectures
              </span>
              <span className="text-slate-300">·</span>
              <h3 className="text-sm font-bold text-slate-900">Monday Teaching &amp; Classroom Timeline</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review assigned lectures and record biometric/manual class attendance directly.
            </p>
          </div>
          <button
            onClick={() => onNavigate('faculty-timetable')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            <span>Full Week Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mySchedule.map((slot) => {
            const sub = subjects.find((s) => s.id === slot.subjectId);
            const grp = classGroups.find((g) => g.id === slot.classGroupId);

            return (
              <div
                key={slot.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                      Period {slot.period}
                    </span>
                    <span className="text-slate-500 font-semibold">{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <div className="font-bold text-sm text-slate-900 line-clamp-1">{sub?.name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Code: <strong className="text-slate-800">{sub?.code}</strong> · Group: <strong className="text-slate-800">{grp?.name}</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-700">Room: LH-101</span>
                  <button
                    onClick={() => onNavigate('faculty-attendance')}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
                  >
                    Mark Attendance
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split: Assigned Classes & 7-Day Corrections Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Courses & Classes with Class Management */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Teaching Course Management</h3>
              <p className="text-xs text-slate-500">Official teaching assignments for Autumn Term 2025–26</p>
            </div>
            <span className="text-xs font-mono text-slate-400">AY 2025–26</span>
          </div>

          <div className="space-y-3">
            {myAssignments.map((fa) => {
              const sub = subjects.find((s) => s.id === fa.subjectId);
              const group = classGroups.find((g) => g.id === fa.classGroupId);
              const studentsInGroup = studentProfiles.filter((s) => s.classGroupId === fa.classGroupId);

              return (
                <div
                  key={fa.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">{sub?.code}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-800 font-semibold">{sub?.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>Group: <strong className="text-slate-800">{group?.name}</strong></span>
                        <span>·</span>
                        <span>Roster: <strong className="font-mono text-slate-800">{studentsInGroup.length}</strong> students</span>
                        <span>·</span>
                        <span>Credits: <strong className="font-mono">{sub?.credits}</strong></span>
                        <span>·</span>
                        <span className="text-indigo-600 font-medium">{sub?.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('faculty-attendance')}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                      >
                        Register
                      </button>
                      <button
                        onClick={() => onNavigate('faculty-marks')}
                        className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors"
                      >
                        Marks
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending 7-Day Corrections Queue Preview */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attendance Correction Requests</h3>
                <p className="text-xs text-slate-500">Pending review within eligible 7-day window (Decision D-1)</p>
              </div>
              <button
                onClick={() => onNavigate('faculty-corrections')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>View All ({correctionRequests.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {myPendingCorrections.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  All eligible attendance requests have been reviewed.
                </div>
              ) : (
                myPendingCorrections.slice(0, 3).map((req) => (
                  <div key={req.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {studentProfiles.find((s) => s.id === req.studentId)?.fullName || 'Student'}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Session: <span className="font-mono font-medium">{req.sessionDate}</span> · Request:{' '}
                        <span className="font-semibold text-emerald-600">{req.requestedStatus}</span>
                      </div>
                      <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1">&ldquo;{req.reason}&rdquo;</p>
                    </div>

                    <button
                      onClick={() => onNavigate('faculty-corrections')}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                    >
                      Review
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Policy: Faculty authority expires 7 days after class date.</span>
            <span className="font-mono text-slate-400">Decision D-1 Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
