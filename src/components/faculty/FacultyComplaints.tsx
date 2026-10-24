import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  LifeBuoy,
  Plus,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../types/erp';

export const FacultyComplaints: React.FC = () => {
  const { currentFacultyProfile, currentUser } = useAuth();
  const {
    complaints,
    submitComplaint,
    updateComplaintStatus,
  } = useERP();

  const facId = currentFacultyProfile?.id || 'fac-1';
  const myUserId = currentUser?.id || 'usr-fac-1';

  // 1. Complaints assigned to this faculty by Admin
  const assignedComplaints = complaints.filter((c) => c.assignedToFacultyId === facId);

  // 2. Personal complaints submitted by this faculty
  const mySubmittedComplaints = complaints.filter((c) => c.submittedByUserId === myUserId);

  const [activeTab, setActiveTab] = useState<'ASSIGNED' | 'MY_SUBMITTED'>('ASSIGNED');

  // Submit modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('INFRASTRUCTURE');
  const [requestedPriority, setRequestedPriority] = useState<ComplaintPriority>('HIGH');

  // Handle assigned complaint update modal
  const [selectedAssigned, setSelectedAssigned] = useState<Complaint | null>(null);
  const [updateStatusVal, setUpdateStatusVal] = useState<ComplaintStatus>('IN_PROGRESS');
  const [updateNotes, setUpdateNotes] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    submitComplaint({
      title,
      description,
      category,
      requestedPriority,
      submittedByUserId: myUserId,
      submitterName: currentFacultyProfile?.fullName || 'Faculty Member',
      submitterRole: 'FACULTY',
      submitterEmail: currentUser?.email || 'faculty@smartcampus.edu',
    });

    setIsSubmitOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssigned) return;

    updateComplaintStatus(
      selectedAssigned.id,
      updateStatusVal,
      currentFacultyProfile?.fullName || 'Faculty Member',
      updateNotes.trim() || undefined
    );

    setSelectedAssigned(null);
    setUpdateNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header (Canonical Title & Single Heading) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Complaints</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve tickets assigned to your department / laboratory and submit campus service requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('ASSIGNED')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'ASSIGNED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Assigned Tickets ({assignedComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('MY_SUBMITTED')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'MY_SUBMITTED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              My Filings ({mySubmittedComplaints.length})
            </button>
          </div>

          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>File New Complaint</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Ticket & Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date Filed</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(activeTab === 'ASSIGNED' ? assignedComplaints : mySubmittedComplaints).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No tickets found in this queue.
                  </td>
                </tr>
              ) : (
                (activeTab === 'ASSIGNED' ? assignedComplaints : mySubmittedComplaints).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-[11px] text-slate-500">{item.ticketNumber}</div>
                      <div className="font-semibold text-slate-900 line-clamp-1 max-w-[280px]">{item.title}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium">{item.category}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.officialPriority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {activeTab === 'ASSIGNED' ? (
                        <button
                          onClick={() => {
                            setSelectedAssigned(item);
                            setUpdateStatusVal(item.status);
                            setUpdateNotes('');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Update Progress
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Read Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit New Complaint Modal */}
      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title="Submit Faculty Campus Service Request"
        subtitle="Will be dispatched to Estate / IT Maintenance or Academic Administration."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Issue Headline</label>
            <input
              type="text"
              required
              placeholder="e.g. CS Lab 2 workstation network port failure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="ACADEMIC">Academic</option>
                <option value="HOSTEL">Hostel</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Requested Urgency</label>
              <select
                value={requestedPriority}
                onChange={(e) => setRequestedPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              required
              placeholder="Provide exact room number, equipment tags, and symptoms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsSubmitOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Assigned Ticket Modal */}
      {selectedAssigned && (
        <Modal
          isOpen={!!selectedAssigned}
          onClose={() => setSelectedAssigned(null)}
          title={`Update Ticket: ${selectedAssigned.ticketNumber}`}
          subtitle={selectedAssigned.title}
        >
          <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Description</span>
              <p className="text-slate-800 mt-0.5">{selectedAssigned.description}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ticket Status</label>
              <select
                value={updateStatusVal}
                onChange={(e) => setUpdateStatusVal(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="UNDER_REVIEW">Under Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Progress / Resolution Notes
              </label>
              <textarea
                rows={3}
                placeholder="State the resolution action or next steps taken..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAssigned(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Save Progress
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
