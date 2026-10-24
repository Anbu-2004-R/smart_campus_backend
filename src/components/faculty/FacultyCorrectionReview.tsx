import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
} from 'lucide-react';
import { AttendanceCorrectionRequest } from '../../types/erp';

export const FacultyCorrectionReview: React.FC = () => {
  const { currentFacultyProfile } = useAuth();
  const {
    correctionRequests,
    facultyAssignments,
    subjects,
    studentProfiles,
    reviewAttendanceCorrection,
  } = useERP();

  const facId = currentFacultyProfile?.id || 'fac-1';
  const myAssignments = facultyAssignments.filter((fa) => fa.facultyId === facId);
  const mySubjectIds = myAssignments.map((fa) => fa.subjectId);

  // Correction requests for this faculty's subjects
  const myRequests = correctionRequests.filter((r) => mySubjectIds.includes(r.subjectId));

  const [selectedReq, setSelectedReq] = useState<AttendanceCorrectionRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    if (reviewAction === 'REJECTED' && !remarks.trim()) {
      setErrorMsg('Mandatory Rule: Rejections must include an explanation reason.');
      return;
    }

    reviewAttendanceCorrection(
      selectedReq.id,
      reviewAction,
      remarks.trim() || 'Approved by Subject In-charge Faculty within 7-day window.',
      currentFacultyProfile?.fullName || 'Faculty Member',
      'FACULTY'
    );

    setSelectedReq(null);
    setRemarks('');
    setErrorMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">7-Day Attendance Correction Queue</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review student correction requests submitted within 7 days of the class session date (Decision D-1). Late submissions are automatically escalated to Administrator review.
        </p>
      </div>

      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200/90 flex items-start gap-3 text-xs text-slate-700">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-900">Faculty Authority Boundary:</strong> Faculty can only modify attendance within the 7-day window from the session date. If approved, the student&apos;s overall attendance percentage and risk level are instantly recalculated.
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-4 py-3">Subject & Session</th>
                <th className="px-4 py-3">Correction Requested</th>
                <th className="px-4 py-3">Eligibility Status</th>
                <th className="px-4 py-3">Review Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {myRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No attendance correction requests filed for your subjects.
                  </td>
                </tr>
              ) : (
                myRequests.map((req) => {
                  const student = studentProfiles.find((s) => s.id === req.studentId);
                  const sub = subjects.find((s) => s.id === req.subjectId);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{student?.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{student?.registerNumber}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{sub?.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Date: {req.sessionDate}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="text-rose-600 font-medium">{req.originalStatus}</span>
                          <span className="text-slate-400">&rarr;</span>
                          <span className="text-emerald-600 font-bold">{req.requestedStatus}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 italic truncate max-w-[200px]" title={req.reason}>
                          &ldquo;{req.reason}&rdquo;
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {req.isEligibleForFaculty ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Eligible (Within 7 Days)
                          </span>
                        ) : (
                          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            Late (&gt;7 Days · Admin Escalated)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.status === 'PENDING_FACULTY' ? (
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setReviewAction('APPROVED');
                              setRemarks('');
                              setErrorMsg('');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
                          >
                            Review & Decide
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Decision Logged</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title="Review Attendance Correction Request"
          subtitle={`Class Session: ${selectedReq.sessionDate} · Within 7-Day Window`}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div>
                <span className="text-slate-400 block text-[11px]">Student</span>
                <span className="font-semibold text-slate-900">
                  {studentProfiles.find((s) => s.id === selectedReq.studentId)?.fullName} (
                  {studentProfiles.find((s) => s.id === selectedReq.studentId)?.registerNumber})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Requested Change</span>
                <div className="font-mono text-xs mt-0.5">
                  <span className="text-rose-600 font-bold">{selectedReq.originalStatus}</span>
                  <span className="mx-2">&rarr;</span>
                  <span className="text-emerald-600 font-bold">{selectedReq.requestedStatus}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Student Explanation</span>
                <p className="text-slate-800 italic mt-0.5">&ldquo;{selectedReq.reason}&rdquo;</p>
              </div>
              {selectedReq.evidenceNote && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Reference / Proof</span>
                  <p className="font-mono text-slate-800">{selectedReq.evidenceNote}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">Faculty Decision</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewAction('APPROVED')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    reviewAction === 'APPROVED'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Correction</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('REJECTED')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    reviewAction === 'REJECTED'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Request</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {reviewAction === 'REJECTED' ? (
                  <span className="text-rose-600 font-semibold">Mandatory Rejection Explanation *</span>
                ) : (
                  'Faculty Review Remarks (Optional)'
                )}
              </label>
              <textarea
                rows={3}
                required={reviewAction === 'REJECTED'}
                placeholder={
                  reviewAction === 'REJECTED'
                    ? 'Explain reason for rejection...'
                    : 'e.g. Verified with OD approval sheet. Approved.'
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errorMsg && <p className="text-rose-600 text-[11px] mt-1">{errorMsg}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Confirm Decision
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
