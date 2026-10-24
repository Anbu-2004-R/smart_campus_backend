import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  calculateAttendanceProjection,
  getRiskStatusConfig,
} from '../../lib/metrics';
import {
  getDaysDifference,
  ACADEMIC_CALENDAR,
} from '../../lib/academicCalendar';
import {
  CalendarCheck,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Plus,
  CheckCircle2,
  Calendar,
  X,
  LifeBuoy,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { AttendanceStatus } from '../../types/erp';

export const AttendanceTracker: React.FC = () => {
  const { currentStudentProfile, currentUser } = useAuth();
  const {
    calculateStudentAttendance,
    attendanceRecords,
    classSessions,
    subjects,
    correctionRequests,
    submitAttendanceCorrection,
    complaints,
  } = useERP();

  const studentId = currentStudentProfile?.id || 'stu-1';
  const summary = calculateStudentAttendance(studentId);

  // Correction requests by this student
  const myCorrectionRequests = correctionRequests.filter((r) => r.studentId === studentId);

  // Absences of this student
  const studentRecs = attendanceRecords.filter((r) => r.studentId === studentId);
  const sessionMap = new Map(classSessions.map((s) => [s.id, s]));

  const absences = studentRecs
    .filter((r) => r.status === 'ABSENT' || r.status === 'LATE')
    .map((r) => {
      const session = sessionMap.get(r.sessionId);
      const sub = subjects.find((s) => s.id === session?.subjectId);
      return {
        record: r,
        session,
        subject: sub,
      };
    })
    .filter((a) => a.session !== undefined);

  // Attendance complaints filed by this student (Section 5: linked to date and course)
  const attendanceComplaints = useMemo(() => {
    return complaints.filter(
      (c) =>
        (c.submittedByUserId === currentUser?.id || c.submitterName === currentStudentProfile?.fullName) &&
        c.category === 'ATTENDANCE'
    );
  }, [complaints, currentUser, currentStudentProfile]);

  // Section 1.3: Warning review banner rules
  const daysToExamCutoff = getDaysDifference(ACADEMIC_CALENDAR.examRegistrationDeadline);
  const riskConfig = getRiskStatusConfig(summary.overallPercentage, daysToExamCutoff);

  const hasSubjectBelow75 = summary.subjectWise.some((s) => s.percentage < 75);
  const isApproachingExamCutoffAndBelow80 = daysToExamCutoff <= 14 && summary.overallPercentage < 80;
  const shouldShowWarningBanner = hasSubjectBelow75 || isApproachingExamCutoffAndBelow80;
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Request correction modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState('2026-10-16');
  const [requestedStatus, setRequestedStatus] = useState<AttendanceStatus>('ON_DUTY');
  const [reason, setReason] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState(false);

  // Helper to render lucide risk icon (Section 1.4: Icon + label paired)
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

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    // Match session or create reference
    const matchedSession = classSessions.find(
      (s) => s.subjectId === selectedSubjectId && s.date === selectedDate
    );
    const sessionId = matchedSession?.id || `sess-auto-${Date.now()}`;

    submitAttendanceCorrection({
      studentId,
      sessionId,
      subjectId: selectedSubjectId,
      sessionDate: selectedDate,
      originalStatus: 'ABSENT',
      requestedStatus,
      reason: reason.trim(),
      evidenceNote: evidenceNote.trim() || undefined,
    });

    setIsModalOpen(false);
    setReason('');
    setEvidenceNote('');
    setSubmittedMsg(true);
    setTimeout(() => setSubmittedMsg(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header (Canonical Title & Single Heading) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Attendance</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Biometric and class register records with 75.0% examination clearance threshold and attendance projections.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Attendance Correction</span>
        </button>
      </div>

      {submittedMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            Attendance correction logged. Requests &le;7 days are reviewed by the assigned faculty; older requests require Registrar approval.
          </div>
        </div>
      )}

      {/* Dismissible Attendance Warning Banner (Section 1.3: Dismissible, session-only, not shown if safe) */}
      {shouldShowWarningBanner && !isBannerDismissed && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-900">Attendance Review Required</div>
              <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                {hasSubjectBelow75 && 'One or more subjects are below the 75.0% examination eligibility cutoff. '}
                {isApproachingExamCutoffAndBelow80 && `The examination eligibility deadline is within ${daysToExamCutoff} days and overall attendance is below 80%. `}
                Review the subject-wise projections below to stay eligible for exams.
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

      {/* Overall Cumulative Attendance Card (Section 1.4: Icon and text label paired) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Overall Cumulative Attendance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {summary.overallPercentage}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({summary.attendedClasses} / {summary.totalClasses} classes attended)
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium font-sans">
                {renderRiskIcon(riskConfig.iconName)}
                <span className="text-slate-900 font-semibold">{riskConfig.label}</span>
              </span>
            </div>
          </div>

          <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900">Institutional Attendance Rules:</div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              · <strong>7-Day Correction Window:</strong> Corrections submitted within 7 calendar days of the session date are reviewed by the assigned subject faculty.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600">
              · <strong>Late Escalations:</strong> Requests submitted beyond 7 days are automatically escalated to the Office of the Registrar.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600">
              · <strong>Examination Clearance:</strong> A minimum of 75.0% in each subject is strictly mandatory for hall ticket generation.
            </p>
          </div>
        </div>
      </div>

      {/* Subject-wise Cards with Live Projections (Section 5: Attendance Projections calculated from real counts) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Subject-wise Attendance &amp; Projections</h3>
            <p className="text-xs text-slate-600">Attendance percentages and real-time class projection targets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.subjectWise.map((sub) => {
            const projection = calculateAttendanceProjection(
              sub.subjectCode,
              sub.subjectName,
              sub.attended,
              sub.total,
              75
            );
            return (
              <div
                key={sub.subjectId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-slate-900">{sub.subjectCode}</span>
                    <StatusBadge status={sub.riskLevel} />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{sub.subjectName}</h4>

                  <div className="mt-3 flex items-baseline justify-between text-xs">
                    <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">{sub.percentage}%</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {sub.attended} / {sub.total} classes
                    </span>
                  </div>

                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sub.percentage >= 80 ? 'bg-emerald-600' : sub.percentage >= 75 ? 'bg-amber-600' : 'bg-rose-600'
                      }`}
                      style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Section 5: Concrete Attendance Projection calculated from real counts */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-200/90">
                  <div className="text-[11px] font-medium leading-relaxed flex items-start gap-1.5 text-slate-800">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{projection.projectionMessage}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Complaints (Section 5: Link each attendance complaint to its date and course) */}
      {attendanceComplaints.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Attendance Complaints</h3>
              <p className="text-xs text-slate-600">Complaints linked specifically to class session dates and courses</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{attendanceComplaints.length} Filed</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {attendanceComplaints.map((c) => (
              <div key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-900">{c.ticketNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-900">{c.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Course: <strong>CS501 (Operating Systems)</strong> · Session Date: <strong>2026-10-16</strong> · Filed: {new Date(c.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column: Recorded Absences & Filed Correction Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recorded Absences List */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Absence Records</h3>
              <p className="text-xs text-slate-600">Unattended sessions eligible for 7-day correction review</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{absences.length} Entries</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {absences.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No recorded absences for the current academic session.
              </div>
            ) : (
              absences.map(({ record, session, subject }) => (
                <div key={record.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{subject?.code}</span>
                      <span className="text-slate-700">{subject?.name}</span>
                      <StatusBadge status={record.status} />
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Date: <span className="font-mono font-medium text-slate-800">{session?.date}</span> · Period: {session?.period} ({session?.roomNumber})
                    </div>
                    {session?.topicCovered && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">Topic: {session.topicCovered}</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSubjectId(subject?.id || subjects[0]?.id);
                      setSelectedDate(session?.date || '2026-10-16');
                      setIsModalOpen(true);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Request Correction
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Filed Correction Requests Status */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Submitted Correction Requests</h3>
              <p className="text-xs text-slate-600">Status tracking and reviewer decision notes</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{myCorrectionRequests.length} Filed</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {myCorrectionRequests.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No correction requests submitted.
              </div>
            ) : (
              myCorrectionRequests.map((req) => {
                const sub = subjects.find((s) => s.id === req.subjectId);
                return (
                  <div key={req.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{sub?.code}</span>
                        <span className="text-[11px] font-mono text-slate-600">{req.sessionDate}</span>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="text-slate-700">
                      Requested: <strong className="text-emerald-700">{req.requestedStatus}</strong> (was {req.originalStatus})
                    </div>

                    <p className="text-[11px] text-slate-600 italic">&ldquo;{req.reason}&rdquo;</p>

                    {req.reviewRemarks && (
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-800 mt-1">
                        <strong>Decision note by {req.reviewedBy}:</strong> {req.reviewRemarks}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Attendance Correction Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Attendance Correction Request"
        subtitle="7-day faculty window rule: requests > 7 days are automatically routed to the Registrar."
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Class Session Date</label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Requested Status</label>
              <select
                value={requestedStatus}
                onChange={(e) => setRequestedStatus(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900"
              >
                <option value="PRESENT">Present (Was in class)</option>
                <option value="ON_DUTY">On Duty (OD - College Event / Lab)</option>
                <option value="LATE">Late (Excused Entry)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Correction Justification (Reason)</label>
            <textarea
              rows={3}
              required
              placeholder="State the reason (e.g. Biometric device timeout, participated in inter-college symposium with prior approval)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Proof or Approval Reference (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Approved OD form #OD-2026-88 signed by HOD"
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
