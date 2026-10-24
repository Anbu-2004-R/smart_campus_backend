import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  GraduationCap,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Send,
  Lock,
  Unlock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Exam, MarksCorrection } from '../../types/erp';

export const ExamPublication: React.FC = () => {
  const {
    exams,
    studentMarks,
    subjects,
    studentProfiles,
    marksCorrections,
    reviewMarksCorrection,
    checkExamPublicationEligibility,
    publishExamResults,
  } = useERP();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [integrityReport, setIntegrityReport] = useState<{
    eligible: boolean;
    pendingCount: number;
    issues: string[];
    totalRecords: number;
  } | null>(null);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<MarksCorrection | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const marksForExam = studentMarks.filter((m) => m.examId === selectedExamId);

  // Run integrity check
  const handleRunIntegrityCheck = () => {
    const report = checkExamPublicationEligibility(selectedExamId);
    setIntegrityReport(report);
  };

  const handlePublish = async () => {
    const res = await publishExamResults(selectedExamId, 'Dr. A. K. Sundaram (Registrar)');
    if (res.success) {
      setPublishSuccessMessage(`Official results for "${selectedExam.name}" have been verified, calculated, and published to student portals.`);
      setIntegrityReport(null);
      setIsConfirmModalOpen(false);
    } else {
      alert(`Publication blocked: ${res.error}`);
    }
  };

  const handleReviewCorrection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reviewTarget) return;
    setReviewError('');

    if (reviewDecision === 'REJECTED' && !reviewNotes.trim()) {
      setReviewError('Review notes are required when rejecting a correction.');
      return;
    }

    setIsReviewing(true);
    const result = await reviewMarksCorrection(
      reviewTarget.id,
      reviewDecision,
      reviewNotes.trim() || undefined
    );
    setIsReviewing(false);

    if (!result.success) {
      setReviewError(result.error || 'Unable to review the marks correction.');
      return;
    }

    setReviewTarget(null);
    setReviewNotes('');
    setReviewSuccess(
      reviewDecision === 'APPROVED'
        ? 'Correction approved. The official mark and any published results were recalculated.'
        : 'Correction rejected. The faculty member has been notified.'
    );
    setTimeout(() => setReviewSuccess(''), 6000);
  };

  const pendingCorrections = marksCorrections
    .filter((correction) => correction.status === 'PENDING')
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  const reviewedCorrections = marksCorrections
    .filter((correction) => correction.status !== 'PENDING')
    .sort((a, b) => new Date(b.reviewedAt || b.submittedAt).getTime() - new Date(a.reviewedAt || a.submittedAt).getTime())
    .slice(0, 8);

  // Group marks by student
  const studentRows = studentProfiles.map((stu) => {
    const records = marksForExam.filter((m) => m.studentId === stu.id);
    const hasPending = records.some((m) => m.status === 'MARKS_PENDING');
    const absentCount = records.filter((m) => m.status === 'ABSENT' || m.status === 'MEDICAL_ABSENCE').length;

    return {
      student: stu,
      records,
      hasPending,
      absentCount,
      totalEntered: records.filter((m) => m.status === 'MARKS_ENTERED').length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Examination Marks & Result Publication Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-publication validation gatekeeper. Enforces the strict rule that unresolved pending marks cannot be published or zeroed out.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setIntegrityReport(null);
              setPublishSuccessMessage(null);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name} ({exam.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Banner if published */}
      {publishSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 font-medium">{publishSuccessMessage}</div>
        </div>
      )}

      {reviewSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 font-medium">{reviewSuccess}</div>
        </div>
      )}

      {/* Exam Status & Publication Gate Controller */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{selectedExam.name}</span>
              <StatusBadge status={selectedExam.status} />
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Code: {selectedExam.code} · AY {selectedExam.academicYear} · Semester {selectedExam.semester}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunIntegrityCheck}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-slate-500" />
              <span>Run Integrity Check</span>
            </button>

            {selectedExam.status !== 'PUBLISHED' && (
              <button
                onClick={() => {
                  const report = checkExamPublicationEligibility(selectedExamId);
                  setIntegrityReport(report);
                  if (report.eligible) {
                    setIsConfirmModalOpen(true);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Publish Official Results</span>
              </button>
            )}
          </div>
        </div>

        {/* Integrity Check Results Box */}
        {integrityReport && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${
              integrityReport.eligible
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {integrityReport.eligible ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Validation Passed: All {integrityReport.totalRecords} records resolved. Publication is permitted.</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Publication Blocked: Unresolved records detected.</span>
                </>
              )}
            </div>

            {!integrityReport.eligible && (
              <ul className="list-disc list-inside mt-2 space-y-1 text-rose-800 text-[11px]">
                {integrityReport.issues.map((iss, i) => (
                  <li key={i}>{iss}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Students cannot view results until official publication is executed by Registrar.</span>
          </div>
          <span className="font-mono text-slate-400">Institutional Governance Enforced</span>
        </div>
      </div>

      {/* Marks Sheet Table by Student */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Enrolled Student Marks Verification Matrix
            </h3>
            <p className="text-[11px] text-slate-500">Subject-wise marks and status entries</p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {marksForExam.length} Total Marks Records Loaded
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Register No. & Student</th>
                <th className="px-4 py-3">CS501 (OS)</th>
                <th className="px-4 py-3">CS502 (DBMS)</th>
                <th className="px-4 py-3">CS503 (CN)</th>
                <th className="px-4 py-3">CS504 (DAA)</th>
                <th className="px-4 py-3">CS505 (Lab)</th>
                <th className="px-4 py-3 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {studentRows.map(({ student, records, hasPending }) => {
                const getMarkForSubject = (subId: string) => {
                  const m = records.find((r) => r.subjectId === subId);
                  if (!m) return <span className="text-slate-300 font-mono">-</span>;
                  if (m.status === 'MARKS_PENDING') {
                    return <span className="text-amber-600 font-semibold font-mono">Pending</span>;
                  }
                  if (m.status === 'ABSENT') {
                    return <span className="text-rose-600 font-medium font-mono">Absent</span>;
                  }
                  if (m.status === 'MEDICAL_ABSENCE') {
                    return <span className="text-sky-600 font-medium font-mono">Med. Abs</span>;
                  }
                  return (
                    <div className="font-mono">
                      <span className="font-semibold text-slate-900">{m.marksObtained}</span>
                      <span className="text-slate-400 text-[10px] ml-1">({m.grade})</span>
                    </div>
                  );
                };

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{student.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{student.registerNumber}</div>
                    </td>
                    <td className="px-4 py-3.5">{getMarkForSubject('sub-cs501')}</td>
                    <td className="px-4 py-3.5">{getMarkForSubject('sub-cs502')}</td>
                    <td className="px-4 py-3.5">{getMarkForSubject('sub-cs503')}</td>
                    <td className="px-4 py-3.5">{getMarkForSubject('sub-cs504')}</td>
                    <td className="px-4 py-3.5">{getMarkForSubject('sub-cs505')}</td>
                    <td className="px-4 py-3.5 text-right">
                      {hasPending ? (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Pending Resolution
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Resolved & Valid
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marks Correction Review Queue */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Post-Publication Marks Corrections
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Faculty-submitted revisions require administrative approval before affecting transcripts.
            </p>
          </div>
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border self-start ${
              pendingCorrections.length > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {pendingCorrections.length} pending review
          </span>
        </div>

        {pendingCorrections.length === 0 && reviewedCorrections.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No marks correction requests have been submitted.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingCorrections.map((correction) => (
              <div
                key={correction.id}
                className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 text-xs">
                      {correction.studentName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {correction.registerNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                      {correction.subjectCode}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      PENDING
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    {correction.oldStatus.replace('_', ' ')}
                    {correction.oldMarks !== null && correction.oldMarks !== undefined
                      ? ` (${correction.oldMarks})`
                      : ''}{' '}
                    &rarr; <strong>{correction.newStatus.replace('_', ' ')}</strong>
                    {correction.newMarks !== null && correction.newMarks !== undefined
                      ? ` (${correction.newMarks})`
                      : ''}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 max-w-3xl">
                    {correction.reason}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Submitted by {correction.facultyName} on{' '}
                    {new Date(correction.submittedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setReviewTarget(correction);
                    setReviewDecision('APPROVED');
                    setReviewNotes('');
                    setReviewError('');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                >
                  Review Request
                </button>
              </div>
            ))}

            {reviewedCorrections.map((correction) => (
              <div
                key={correction.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="font-medium text-slate-800">{correction.studentName}</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {correction.registerNumber}
                  </span>
                  <span className="text-[11px] text-slate-500">{correction.subjectCode}</span>
                  <span className="text-[11px] text-slate-400">
                    {correction.oldStatus.replace('_', ' ')} &rarr;{' '}
                    {correction.newStatus.replace('_', ' ')}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border self-start sm:self-auto ${
                    correction.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {correction.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        title="Review Marks Correction"
        subtitle={
          reviewTarget
            ? `${reviewTarget.studentName} (${reviewTarget.registerNumber}) - ${reviewTarget.subjectCode}`
            : undefined
        }
      >
        <form onSubmit={handleReviewCorrection} className="space-y-4 text-xs">
          {reviewError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
              {reviewError}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Recorded mark</span>
              <span className="font-mono font-semibold text-slate-900">
                {reviewTarget?.oldStatus.replace('_', ' ')}
                {reviewTarget?.oldMarks !== null && reviewTarget?.oldMarks !== undefined
                  ? ` (${reviewTarget.oldMarks})`
                  : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Requested mark</span>
              <span className="font-mono font-semibold text-indigo-700">
                {reviewTarget?.newStatus.replace('_', ' ')}
                {reviewTarget?.newMarks !== null && reviewTarget?.newMarks !== undefined
                  ? ` (${reviewTarget.newMarks})`
                  : ''}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500">Faculty justification</span>
              <p className="text-slate-700 mt-1 leading-relaxed">{reviewTarget?.reason}</p>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Decision</label>
            <select
              value={reviewDecision}
              onChange={(event) =>
                setReviewDecision(event.target.value as 'APPROVED' | 'REJECTED')
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="APPROVED">Approve correction</option>
              <option value="REJECTED">Reject correction</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Review Notes {reviewDecision === 'REJECTED' && <span className="text-rose-600">*</span>}
            </label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(event) => setReviewNotes(event.target.value)}
              placeholder={
                reviewDecision === 'REJECTED'
                  ? 'State the reason for rejection...'
                  : 'Optional administrative note...'
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-900">
            Approving updates the official mark, grade, and recalculates the published result where
            applicable. Both outcomes notify the requesting faculty member.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setReviewTarget(null)}
              className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReviewing}
              className={`px-4 py-2 font-semibold text-white rounded-lg transition-colors disabled:opacity-50 ${
                reviewDecision === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isReviewing
                ? 'Saving...'
                : reviewDecision === 'APPROVED'
                ? 'Approve Correction'
                : 'Reject Correction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Publication Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Official Result Publication"
        subtitle="This action will compute semester GPAs and publish results to all student transcripts."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900">
            <span className="font-semibold block mb-1">Administrative Declaration</span>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              All marks entries have been resolved and cross-validated. Upon publishing:
            </p>
            <ul className="list-disc list-inside mt-2 text-[11px] space-y-1">
              <li>Semester GPA and Cumulative CGPA will be computed for all candidates.</li>
              <li>Official results will become visible on student and faculty portals.</li>
              <li>In-app notifications will be delivered to enrolled students.</li>
              <li>Post-publication mark corrections will require an official administrative approval workflow.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Confirm & Publish Results
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
