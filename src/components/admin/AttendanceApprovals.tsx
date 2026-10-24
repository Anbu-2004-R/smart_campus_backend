import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  History,
  Search,
} from 'lucide-react';
import { AttendanceCorrectionRequest } from '../../types/erp';

export const AttendanceApprovals: React.FC = () => {
  const {
    correctionRequests,
    studentProfiles,
    subjects,
    reviewAttendanceCorrection,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'ESCALATED' | 'ALL'>('ESCALATED');
  const [selectedReq, setSelectedReq] = useState<AttendanceCorrectionRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const escalatedList = correctionRequests.filter((r) => r.status === 'PENDING_ADMIN');
  const displayList = activeTab === 'ESCALATED' ? escalatedList : correctionRequests;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !reviewAction) return;

    if (reviewAction === 'REJECTED' && !reviewRemarks.trim()) {
      setErrorMsg('Per university regulations, rejections must include an explanation reason.');
      return;
    }

    reviewAttendanceCorrection(
      selectedReq.id,
      reviewAction,
      reviewRemarks.trim() || 'Approved by Administrator under discretionary late attendance review.',
      'Dr. A. K. Sundaram (Registrar)',
      'ADMIN'
    );

    setSelectedReq(null);
    setReviewAction(null);
    setReviewRemarks('');
    setErrorMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Attendance Correction & Escalations Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervises official attendance updates and evaluates late requests (&gt;7 days from class session date per Decision D-1).
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('ESCALATED')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'ESCALATED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Escalated to Admin ({escalatedList.length})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Requests ({correctionRequests.length})
          </button>
        </div>
      </div>

      {/* Decision D-1 Regulatory Card */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-xl flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-semibold">Academic Policy D-1 (Seven-Day Rule):</strong> The correction window is strictly
          counted 7 days from the <em>class session date</em>, not the student request date. Corrections within this window are
          addressed by assigned faculty. All requests submitted after the 7-day window require Administrator review and approval.
          Approving recalculates student attendance percentage and risk level instantly.
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-4 py-3">Subject & Session Date</th>
                <th className="px-4 py-3">Change Requested</th>
                <th className="px-4 py-3">Eligibility Window</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No attendance correction requests matching this view.
                  </td>
                </tr>
              ) : (
                displayList.map((req) => {
                  const student = studentProfiles.find((s) => s.id === req.studentId);
                  const subject = subjects.find((s) => s.id === req.subjectId);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{student?.fullName || 'Student'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{student?.registerNumber}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{subject?.name || req.subjectId}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Session Date: <span className="text-slate-800 font-semibold">{req.sessionDate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono">
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
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                            &le; 7 Days (Faculty Window)
                          </span>
                        ) : (
                          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            &gt; 7 Days (Admin Review)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={req.status} />
                        {req.reviewedBy && (
                          <div className="text-[10px] text-slate-400 mt-0.5">By: {req.reviewedBy}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.status === 'PENDING_ADMIN' ? (
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setReviewAction('APPROVED');
                              setReviewRemarks('');
                              setErrorMsg('');
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
                          >
                            Review & Decide
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setReviewAction(null);
                            }}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          >
                            Details
                          </button>
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

      {/* Review & Decision Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => {
            setSelectedReq(null);
            setReviewAction(null);
            setErrorMsg('');
          }}
          title={reviewAction ? 'Evaluate Escalated Attendance Request' : 'Attendance Correction Details'}
          subtitle={`Ticket ID: ${selectedReq.id} · Submitted ${new Date(selectedReq.submittedAt).toLocaleDateString()}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Student</span>
                  <span className="font-semibold text-slate-900">
                    {studentProfiles.find((s) => s.id === selectedReq.studentId)?.fullName} (
                    {studentProfiles.find((s) => s.id === selectedReq.studentId)?.registerNumber})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Session Date</span>
                  <span className="font-mono font-medium text-slate-900">{selectedReq.sessionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Original Attendance</span>
                  <span className="font-semibold text-rose-600">{selectedReq.originalStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Requested Attendance</span>
                  <span className="font-semibold text-emerald-600">{selectedReq.requestedStatus}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 block text-[11px]">Student Stated Reason</span>
                <p className="text-slate-800 italic mt-0.5">&ldquo;{selectedReq.reason}&rdquo;</p>
              </div>

              {selectedReq.evidenceNote && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">Submitted Evidence Reference</span>
                  <p className="font-mono text-slate-800 mt-0.5">{selectedReq.evidenceNote}</p>
                </div>
              )}
            </div>

            {selectedReq.reviewRemarks && (
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block mb-1">
                  Recorded Decision by {selectedReq.reviewedBy} ({selectedReq.reviewerRole}):
                </span>
                <p className="text-slate-800">{selectedReq.reviewRemarks}</p>
              </div>
            )}

            {reviewAction && (
              <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">Administrative Decision</label>
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
                      'Reviewer Remarks / Order Note (Optional)'
                    )}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      reviewAction === 'REJECTED'
                        ? 'State the reason for rejection (e.g., medical certificate invalid, unverified OD)...'
                        : 'e.g. Verified with medical centre record. Approved per Registrar order.'
                    }
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errorMsg && <p className="text-rose-600 text-[11px] mt-1">{errorMsg}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReq(null);
                      setReviewAction(null);
                    }}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Record Official Decision
                  </button>
                </div>
              </form>
            )}

            {!reviewAction && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
