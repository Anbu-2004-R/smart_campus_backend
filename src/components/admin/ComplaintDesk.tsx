import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  UserCheck,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from '../../types/erp';

export const ComplaintDesk: React.FC = () => {
  const {
    complaints,
    facultyProfiles,
    updateComplaintStatus,
    updateComplaintPriority,
    assignComplaint,
  } = useERP();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ComplaintCategory>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ComplaintPriority>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ComplaintStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Workflow action modal states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [newPriority, setNewPriority] = useState<ComplaintPriority>('HIGH');
  const [assignedFacultyId, setAssignedFacultyId] = useState<string>('');
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = complaints.filter((c) => {
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && c.officialPriority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchTicket = c.ticketNumber.toLowerCase().includes(q);
      const matchSubmitter = c.submitterName.toLowerCase().includes(q);
      if (!matchTitle && !matchTicket && !matchSubmitter) return false;
    }
    return true;
  });

  const handleOpenAction = (c: Complaint) => {
    setSelectedComplaint(c);
    setNewStatus(c.status);
    setNewPriority(c.officialPriority);
    setAssignedFacultyId(c.assignedToFacultyId || facultyProfiles[0]?.id || '');
    setActionNotes('');
    setRejectionReason('');
    setErrorMsg('');
    setIsActionModalOpen(true);
  };

  const handleApplyAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      setErrorMsg('Mandatory Rule: Rejections must include an explanation reason.');
      return;
    }

    // 1. Update priority if changed
    if (newPriority !== selectedComplaint.officialPriority) {
      updateComplaintPriority(selectedComplaint.id, newPriority, 'Administrator', 'Confirmed by Admin desk');
    }

    // 2. Assign faculty if changed
    if (assignedFacultyId && assignedFacultyId !== selectedComplaint.assignedToFacultyId) {
      assignComplaint(selectedComplaint.id, assignedFacultyId, 'Administrator');
    }

    // 3. Update status
    if (newStatus !== selectedComplaint.status || actionNotes.trim() || rejectionReason.trim()) {
      updateComplaintStatus(
        selectedComplaint.id,
        newStatus,
        'Administrator',
        actionNotes.trim() || undefined,
        rejectionReason.trim() || undefined
      );
    }

    setIsActionModalOpen(false);
    setSelectedComplaint(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner (Canonical Title & Single Heading) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Complaints</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administers complaints across Academic, Hostel, Infrastructure, and Attendance. Prioritize, assign to staff, and record resolution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            Open: <strong className="text-slate-800">{complaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED').length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ticket, submitter, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="ACADEMIC">Academic</option>
              <option value="INFRASTRUCTURE">Infrastructure</option>
              <option value="HOSTEL">Hostel</option>
              <option value="ATTENDANCE">Attendance</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Ticket & Subject</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Submitter</th>
                <th className="px-4 py-3">Priority (Req / Confirmed)</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3">Assigned Faculty</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-mono text-[11px] text-slate-500">{comp.ticketNumber}</div>
                    <div className="font-semibold text-slate-900 line-clamp-1 max-w-[260px]">{comp.title}</div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{comp.category}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{comp.submitterName}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{comp.submitterRole.toLowerCase()}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={comp.officialPriority} />
                      {comp.requestedPriority !== comp.officialPriority && (
                        <span className="text-[10px] text-slate-400 font-mono">(Req: {comp.requestedPriority})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={comp.status} />
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {comp.assignedFacultyName || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenAction(comp)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action / Resolution Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          title={`Complaint Redressal: ${selectedComplaint.ticketNumber}`}
          subtitle={`${selectedComplaint.title}`}
        >
          <form onSubmit={handleApplyAction} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px] mb-0.5">Submitter Description</span>
              <p className="text-slate-800 leading-relaxed">{selectedComplaint.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Official Priority (D-2/D-5)
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Submitter requested: {selectedComplaint.requestedPriority}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assign to Faculty In-charge
                </label>
                <select
                  value={assignedFacultyId}
                  onChange={(e) => setAssignedFacultyId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="">Select Faculty...</option>
                  {facultyProfiles.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fullName} ({f.designation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Lifecycle Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {newStatus === 'REJECTED' ? (
              <div>
                <label className="block text-xs font-semibold text-rose-600 mb-1">
                  Mandatory Rejection Explanation *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the reason why this complaint cannot be entertained..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                {errorMsg && <p className="text-rose-600 text-[11px] mt-1">{errorMsg}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Resolution / Progress Notes (Delivered to Submitter)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Work order dispatched to maintenance team..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Timeline History */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Timeline History
              </span>
              <div className="space-y-2">
                {selectedComplaint.timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                    <div>
                      <span className="font-semibold text-slate-800">{item.status}</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="text-slate-500">{item.changedBy}</span>
                      <span className="text-slate-400 font-mono mx-1">
                        ({new Date(item.timestamp).toLocaleDateString()})
                      </span>
                      {item.notes && <p className="text-slate-600 mt-0.5">{item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsActionModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Update Complaint & Notify
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
