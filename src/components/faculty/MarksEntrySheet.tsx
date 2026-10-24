import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  FileSpreadsheet,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  Search,
  ClipboardEdit,
} from 'lucide-react';
import { MarksStatus, StudentMark } from '../../types/erp';

export const MarksEntrySheet: React.FC = () => {
  const { currentFacultyProfile } = useAuth();
  const {
    exams,
    facultyAssignments,
    subjects,
    studentProfiles,
    studentMarks,
    updateStudentMark,
    marksCorrections,
    submitMarksCorrection,
  } = useERP();

  const facId = currentFacultyProfile?.id || 'fac-1';
  const myAssignments = facultyAssignments.filter((fa) => fa.facultyId === facId);

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(myAssignments[0]?.subjectId || subjects[0]?.id || '');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [correctionMark, setCorrectionMark] = useState<StudentMark | null>(null);
  const [correctionStatus, setCorrectionStatus] = useState<
    'MARKS_ENTERED' | 'ABSENT' | 'MEDICAL_ABSENCE' | 'MALPRACTICE'
  >('MARKS_ENTERED');
  const [correctionMarks, setCorrectionMarks] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionError, setCorrectionError] = useState('');
  const [correctionSuccess, setCorrectionSuccess] = useState<string | null>('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const maxMarks = currentSubject?.maxMarks || 100;
  const passMarks = currentSubject?.passMarks || 45;

  const isPublished = currentExam.status === 'PUBLISHED';

  // Find all student marks for this exam and subject
  const relevantMarks = studentMarks.filter(
    (m) => m.examId === selectedExamId && m.subjectId === selectedSubjectId
  );
  const subjectCorrections = marksCorrections
    .filter(
      (correction) =>
        correction.examId === selectedExamId && correction.subjectId === selectedSubjectId
    )
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Local state for edits
  const [editedScores, setEditedScores] = useState<Record<string, number | undefined>>({});
  const [editedStatuses, setEditedStatuses] = useState<Record<string, MarksStatus>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleScoreChange = (markId: string, valStr: string) => {
    if (valStr === '') {
      setEditedScores({ ...editedScores, [markId]: undefined });
      setValidationErrors({ ...validationErrors, [markId]: '' });
      return;
    }

    const val = Number(valStr);
    if (isNaN(val)) return;

    if (val < 0 || val > maxMarks) {
      setValidationErrors({
        ...validationErrors,
        [markId]: `Must be 0–${maxMarks}`,
      });
    } else {
      const errs = { ...validationErrors };
      delete errs[markId];
      setValidationErrors(errs);
    }

    setEditedScores({ ...editedScores, [markId]: val });
    // If entered score, auto set status to MARKS_ENTERED
    setEditedStatuses({ ...editedStatuses, [markId]: 'MARKS_ENTERED' });
  };

  const handleStatusChange = (markId: string, status: MarksStatus) => {
    setEditedStatuses({ ...editedStatuses, [markId]: status });
    if (status === 'ABSENT' || status === 'MEDICAL_ABSENCE' || status === 'MARKS_PENDING') {
      setEditedScores({ ...editedScores, [markId]: undefined });
      const errs = { ...validationErrors };
      delete errs[markId];
      setValidationErrors(errs);
    }
  };

  const handleSaveMarks = (markId: string) => {
    const existing = relevantMarks.find((m) => m.id === markId);
    if (!existing) return;

    const score = editedScores[markId] !== undefined ? editedScores[markId] : existing.marksObtained;
    const status = editedStatuses[markId] || existing.status;

    if (status === 'MARKS_ENTERED' && score === undefined) {
      setValidationErrors({ ...validationErrors, [markId]: 'Numerical score required for Marks Entered' });
      return;
    }

    if (score !== undefined && (score < 0 || score > maxMarks)) {
      setValidationErrors({ ...validationErrors, [markId]: `Score cannot exceed ${maxMarks}` });
      return;
    }

    const res = updateStudentMark(markId, score, status, facId);
    if (res.success) {
      setSaveNotification('Marks entry saved and validated successfully.');
      setTimeout(() => setSaveNotification(null), 3000);
    } else {
      alert(`Error saving mark: ${res.error}`);
    }
  };

  const openCorrectionModal = (mark: StudentMark) => {
    setCorrectionMark(mark);
    setCorrectionStatus(
      mark.status === 'ABSENT' || mark.status === 'MEDICAL_ABSENCE' || mark.status === 'MALPRACTICE'
        ? mark.status
        : 'MARKS_ENTERED'
    );
    setCorrectionMarks(mark.marksObtained !== undefined ? String(mark.marksObtained) : '');
    setCorrectionReason('');
    setCorrectionError('');
  };

  const handleCorrectionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!correctionMark) return;
    setCorrectionError('');

    if (correctionReason.trim().length < 10) {
      setCorrectionError('Provide a justification between 10 and 1000 characters.');
      return;
    }

    const newMarks =
      correctionStatus === 'MARKS_ENTERED' ? Number(correctionMarks) : undefined;
    if (
      correctionStatus === 'MARKS_ENTERED' &&
      (newMarks === undefined || Number.isNaN(newMarks) || newMarks < 0 || newMarks > maxMarks)
    ) {
      setCorrectionError(`Enter a valid score between 0 and ${maxMarks}.`);
      return;
    }

    setIsSubmittingCorrection(true);
    const result = await submitMarksCorrection({
      examId: correctionMark.examId,
      subjectId: correctionMark.subjectId,
      studentId: correctionMark.studentId,
      newStatus: correctionStatus,
      newMarks,
      reason: correctionReason.trim(),
    });
    setIsSubmittingCorrection(false);

    if (!result.success) {
      setCorrectionError(result.error || 'Unable to submit the correction request.');
      return;
    }

    setCorrectionMark(null);
    setCorrectionSuccess('Correction request submitted for administrative review.');
    setTimeout(() => setCorrectionSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Continuous Assessment & Marks Entry Sheet</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty grading terminal. Evaluates range compliance (0–{maxMarks}) and verifies absence codes before publication lock.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
          >
            {subjects
              .filter((s) => s.semester === 5)
              .map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Published Lock Notice */}
      {isPublished && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-950">Examination is Officially Published:</strong> Per institutional regulations,
            direct modifications to published marks are restricted. Any grade or marks revisions now require an official correction
            request submitted to the Administrator with justification and verification records.
          </div>
        </div>
      )}

      {saveNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-medium">{saveNotification}</div>
        </div>
      )}

      {correctionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-medium">{correctionSuccess}</div>
        </div>
      )}

      {/* Marks Entry Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {currentSubject.code} · {currentSubject.name}
            </h3>
            <span className="text-[11px] text-slate-500">
              Maximum Marks: <strong>{maxMarks}</strong> · Passing Minimum: <strong>{passMarks}</strong> · Credits: <strong>{currentSubject.credits}</strong>
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {relevantMarks.length} Candidates Enrolled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Register No. & Student</th>
                <th className="px-4 py-3">Marks Status Code</th>
                <th className="px-4 py-3">Marks Obtained (/ {maxMarks})</th>
                <th className="px-4 py-3">Computed Grade</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {relevantMarks.map((mark) => {
                const student = studentProfiles.find((s) => s.id === mark.studentId);
                const score = editedScores[mark.id] !== undefined ? editedScores[mark.id] : mark.marksObtained;
                const status = editedStatuses[mark.id] || mark.status;
                const hasError = !!validationErrors[mark.id];
                const pendingCorrection = subjectCorrections.find(
                  (correction) =>
                    correction.studentId === mark.studentId && correction.status === 'PENDING'
                );

                return (
                  <tr key={mark.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{student?.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{student?.registerNumber}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <select
                        disabled={isPublished}
                        value={status}
                        onChange={(e) => handleStatusChange(mark.id, e.target.value as any)}
                        className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800 focus:outline-none disabled:opacity-60"
                      >
                        <option value="MARKS_ENTERED">Marks Entered</option>
                        <option value="ABSENT">Absent</option>
                        <option value="MEDICAL_ABSENCE">Medical / Approved Absence</option>
                        <option value="MARKS_PENDING">Marks Pending</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5">
                      {status === 'MARKS_ENTERED' ? (
                        <div className="relative w-28">
                          <input
                            type="number"
                            disabled={isPublished}
                            min="0"
                            max={maxMarks}
                            value={score !== undefined ? score : ''}
                            onChange={(e) => handleScoreChange(mark.id, e.target.value)}
                            className={`w-full text-xs px-2.5 py-1 font-mono font-semibold bg-slate-50 border rounded focus:outline-none disabled:opacity-60 ${
                              hasError ? 'border-rose-500 bg-rose-50/50 text-rose-900' : 'border-slate-200 text-slate-900'
                            }`}
                          />
                          {hasError && (
                            <span className="text-[10px] text-rose-600 block mt-0.5">{validationErrors[mark.id]}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono italic text-[11px]">{status.replace('_', ' ')}</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      {mark.grade ? (
                        <span className="font-bold text-slate-900">{mark.grade} ({mark.gradePoint} pts)</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {mark.status === 'MARKS_PENDING' ? (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Pending
                        </span>
                      ) : mark.isPassed ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Pass
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Fail / Arrear
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {!isPublished ? (
                        <button
                          onClick={() => handleSaveMarks(mark.id)}
                          className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Save
                        </button>
                      ) : pendingCorrection ? (
                        <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                          Correction Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => openCorrectionModal(mark)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <ClipboardEdit className="w-3 h-3" />
                          Request Correction
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {subjectCorrections.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Correction Requests - {currentSubject.code}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Post-publication revisions awaiting or completed administrative review.
            </p>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {subjectCorrections.map((correction) => (
              <div
                key={correction.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    {correction.studentName}{' '}
                    <span className="font-mono text-[11px] text-slate-500">
                      {correction.registerNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    {correction.oldStatus.replace('_', ' ')}
                    {correction.oldMarks !== null && correction.oldMarks !== undefined
                      ? ` (${correction.oldMarks})`
                      : ''}{' '}
                    &rarr; {correction.newStatus.replace('_', ' ')}
                    {correction.newMarks !== null && correction.newMarks !== undefined
                      ? ` (${correction.newMarks})`
                      : ''}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {correction.reason}
                  </div>
                  {correction.reviewNotes && (
                    <div className="text-[11px] text-slate-600 mt-1">
                      Review: {correction.reviewNotes}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      correction.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : correction.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {correction.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(correction.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={!!correctionMark}
        onClose={() => setCorrectionMark(null)}
        title="Request Marks Correction"
        subtitle={
          correctionMark
            ? `${correctionMark.studentId} - ${currentSubject.code}`
            : undefined
        }
      >
        <form onSubmit={handleCorrectionSubmit} className="space-y-4 text-xs">
          {correctionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{correctionError}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Current recorded value</span>
              <span className="font-mono font-semibold text-slate-900">
                {correctionMark?.status.replace('_', ' ')}
                {correctionMark?.marksObtained !== undefined
                  ? ` - ${correctionMark.marksObtained}/${maxMarks}`
                  : ''}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Approved corrections update the official mark, grade, and published results.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Corrected Status</label>
              <select
                value={correctionStatus}
                onChange={(event) =>
                  setCorrectionStatus(
                    event.target.value as
                      | 'MARKS_ENTERED'
                      | 'ABSENT'
                      | 'MEDICAL_ABSENCE'
                      | 'MALPRACTICE'
                  )
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="MARKS_ENTERED">Marks Entered</option>
                <option value="ABSENT">Absent</option>
                <option value="MEDICAL_ABSENCE">Medical / Approved Absence</option>
                <option value="MALPRACTICE">Malpractice</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Corrected Marks {correctionStatus === 'MARKS_ENTERED' && <span className="text-rose-600">*</span>}
              </label>
              <input
                type="number"
                min="0"
                max={maxMarks}
                disabled={correctionStatus !== 'MARKS_ENTERED'}
                value={correctionStatus === 'MARKS_ENTERED' ? correctionMarks : ''}
                onChange={(event) => setCorrectionMarks(event.target.value)}
                placeholder={`0 - ${maxMarks}`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Justification <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              required
              minLength={10}
              maxLength={1000}
              value={correctionReason}
              onChange={(event) => setCorrectionReason(event.target.value)}
              placeholder="Explain the clerical error and reference any supporting records..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCorrectionMark(null)}
              className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingCorrection}
              className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition-colors"
            >
              {isSubmittingCorrection ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
