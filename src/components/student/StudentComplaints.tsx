import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { formatSLADueNotice } from '../../lib/academicCalendar';
import {
  Plus,
  Clock,
  Search,
  ArrowUpDown,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../types/erp';

export const StudentComplaints: React.FC = () => {
  const { currentStudentProfile, currentUser } = useAuth();
  const { complaints, submitComplaint } = useERP();

  const studentUserId = currentUser?.id || 'usr-stu-1';
  const myComplaints = useMemo(
    () => complaints.filter((c) => c.submittedByUserId === studentUserId),
    [complaints, studentUserId]
  );

  // Filters, search & sorting
  const [statusFilter, setStatusFilter] = useState<'ALL' | ComplaintStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ComplaintCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'submittedAt' | 'status' | 'due'>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('ACADEMIC');
  const [requestedPriority, setRequestedPriority] = useState<ComplaintPriority>('MEDIUM');
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);

  // Compute SLA target dates based on priority (Critical: 2 days, High: 4 days, Medium: 7 days, Low: 10 days)
  const getTicketDueDate = (complaint: Complaint): string => {
    const filed = new Date(complaint.submittedAt);
    const daysToAdd =
      complaint.officialPriority === 'CRITICAL'
        ? 2
        : complaint.officialPriority === 'HIGH'
        ? 4
        : complaint.officialPriority === 'MEDIUM'
        ? 7
        : 10;
    const due = new Date(filed.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return due.toISOString().split('T')[0];
  };

  // Status counts for the status summary tabs row
  const statusCounts = useMemo(() => {
    return {
      all: myComplaints.length,
      submitted: myComplaints.filter((c) => c.status === 'SUBMITTED').length,
      underReview: myComplaints.filter((c) => c.status === 'UNDER_REVIEW').length,
      inProgress: myComplaints.filter((c) => c.status === 'IN_PROGRESS').length,
      resolved: myComplaints.filter((c) => c.status === 'RESOLVED').length,
      rejected: myComplaints.filter((c) => c.status === 'REJECTED').length,
    };
  }, [myComplaints]);

  // Filtered & sorted complaints
  const filteredComplaints = useMemo(() => {
    let result = myComplaints.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = c.ticketNumber.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesDesc) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortField === 'submittedAt') {
        const timeA = new Date(a.submittedAt).getTime();
        const timeB = new Date(b.submittedAt).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortField === 'status') {
        return sortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
      }
      if (sortField === 'due') {
        const dueA = getTicketDueDate(a);
        const dueB = getTicketDueDate(b);
        return sortOrder === 'asc' ? dueA.localeCompare(dueB) : dueB.localeCompare(dueA);
      }
      return 0;
    });

    return result;
  }, [myComplaints, statusFilter, categoryFilter, searchQuery, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    submitComplaint({
      title: title.trim(),
      description: description.trim(),
      category,
      requestedPriority,
      submittedByUserId: studentUserId,
      submitterName: currentStudentProfile?.fullName || 'Student',
      submitterRole: 'STUDENT',
      submitterEmail: currentUser?.email || 'student@smartcampus.edu',
    });

    setIsSubmitOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header (Canonical Title & Single Heading) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Complaints</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            File and track academic, attendance, hostel, and infrastructure complaints with SLA resolution timelines.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>File New Complaint</span>
        </button>
      </div>

      {/* Status Summary Tabs Row (Section 3.8: Replaces empty spaces) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => {
            setStatusFilter('ALL');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => {
            setStatusFilter('SUBMITTED');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            statusFilter === 'SUBMITTED'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Submitted ({statusCounts.submitted})
        </button>
        <button
          onClick={() => {
            setStatusFilter('UNDER_REVIEW');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            statusFilter === 'UNDER_REVIEW'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Under Review ({statusCounts.underReview})
        </button>
        <button
          onClick={() => {
            setStatusFilter('IN_PROGRESS');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          In Progress ({statusCounts.inProgress})
        </button>
        <button
          onClick={() => {
            setStatusFilter('RESOLVED');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            statusFilter === 'RESOLVED'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Resolved ({statusCounts.resolved})
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ticket ID (e.g. CMP-2026-0102) or subject..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="ACADEMIC">Academic</option>
            <option value="ATTENDANCE">Attendance</option>
            <option value="HOSTEL">Hostel</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="GENERAL">General</option>
          </select>

          <select
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('-') as [any, any];
              setSortField(f);
              setSortOrder(o);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
          >
            <option value="submittedAt-desc">Filed: Newest first</option>
            <option value="submittedAt-asc">Filed: Oldest first</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="due-asc">Due Date (Earliest first)</option>
          </select>
        </div>
      </div>

      {/* Complaints Display: Stacked cards below 640px, Table on desktop */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        {/* Mobile View: Stacked interactive cards */}
        <div className="sm:hidden divide-y divide-slate-100">
          {paginatedComplaints.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No complaints filed. If something in your academic record needs review, file a complaint.
            </div>
          ) : (
            paginatedComplaints.map((item) => {
              const sla = formatSLADueNotice(getTicketDueDate(item));
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedTicket(item)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedTicket(item)}
                  className="p-4 space-y-2.5 hover:bg-slate-50/80 transition-colors cursor-pointer focus:outline-none focus:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-900">{item.ticketNumber}</span>
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Subject wrapping to 2 lines without truncating mid-word */}
                  <div className="text-xs font-bold text-slate-900 leading-snug break-words line-clamp-2">
                    {item.title}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 pt-1">
                    <div>Category: <span className="font-medium text-slate-800">{item.category}</span></div>
                    <div className={sla.isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                      {sla.label}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <div className="text-slate-600">
                      Assigned: <span className="text-slate-900 font-medium">{item.assignedFacultyName || 'Not yet assigned'}</span>
                    </div>
                    <span className="text-indigo-600 font-semibold">View Details &rarr;</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Comprehensive Data Grid */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Ticket ID &amp; Subject</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Assigned Faculty</th>
                <th className="px-4 py-3.5">Resolution SLA</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-xs">
                    No complaints filed. If something in your academic record needs review, file a complaint.
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map((item) => {
                  const sla = formatSLADueNotice(getTicketDueDate(item));
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedTicket(item)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedTicket(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer focus:outline-none focus:bg-slate-50"
                    >
                      <td className="px-5 py-3.5 max-w-[280px]">
                        <div className="font-mono text-[11px] text-slate-500 font-semibold">{item.ticketNumber}</div>
                        {/* Subject wraps to two lines without mid-word truncation */}
                        <div className="font-bold text-slate-900 break-words line-clamp-2 leading-snug mt-0.5">
                          {item.title}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        {item.category}
                      </td>

                      {/* Section 3.2: Show two values clearly: Requested: High and Confirmed: Medium with line break */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 leading-tight">
                          <div className="text-[11px] text-slate-700">
                            Requested: <strong className="text-slate-900">{item.requestedPriority}</strong>
                          </div>
                          <div className="text-[11px] text-slate-700">
                            Confirmed: <strong className="text-slate-900">{item.officialPriority}</strong>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Section 3.1: Show faculty name when assigned. When unassigned, show "Not yet assigned" in neutral text (not italics/grey). Never status value. */}
                      <td className="px-4 py-3.5 text-slate-900 font-medium">
                        {item.assignedFacultyName ? (
                          item.assignedFacultyName
                        ) : (
                          <span className="text-slate-700">Not yet assigned</span>
                        )}
                      </td>

                      {/* Section 3.4: SLA information */}
                      <td className="px-4 py-3.5">
                        <div className={`text-xs ${sla.isOverdue ? 'text-rose-700 font-semibold' : 'text-slate-700'}`}>
                          {sla.label}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(item);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls when more than 10 items */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File Complaint Modal */}
      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title="File New Complaint"
        subtitle="Submit academic, attendance, hostel, or infrastructure issues for administrative redressal."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Issue Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Attendance discrepancy after attending tech symposium with OD"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="ATTENDANCE">Attendance</option>
                <option value="HOSTEL">Hostel</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Requested Priority
              </label>
              <select
                value={requestedPriority}
                onChange={(e) => setRequestedPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900"
              >
                <option value="LOW">Low (General Query)</option>
                <option value="MEDIUM">Medium (Standard)</option>
                <option value="HIGH">High (Urgent)</option>
                <option value="CRITICAL">Critical (Immediate Block)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              required
              placeholder="Describe the problem, dates, locations, and any prior communications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-slate-900"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">Priority Review Procedure:</div>
            <div>Submitters specify a requested priority. The Administrator reviews and confirms or adjusts official priority based on institutional urgency rules.</div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsSubmitOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              File Complaint
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Details & Comprehensive Timeline Modal (Section 3.4) */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketNumber}`}
          subtitle="Complete Complaint Details & Resolution Audit Timeline"
        >
          <div className="space-y-4 text-xs">
            {/* Full Subject Header (Section 3.3) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Full Subject</span>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{selectedTicket.title}</h3>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Submitted Description</span>
              <p className="text-slate-800 leading-relaxed text-xs">{selectedTicket.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Category</span>
                <span className="font-semibold text-slate-900">{selectedTicket.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Status</span>
                <StatusBadge status={selectedTicket.status} />
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Priority</span>
                <div className="font-semibold text-slate-900">
                  Requested: {selectedTicket.requestedPriority} · Confirmed: {selectedTicket.officialPriority}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Assigned Staff</span>
                <span className="font-semibold text-slate-900">
                  {selectedTicket.assignedFacultyName || 'Not yet assigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">SLA Target</span>
                {(() => {
                  const sla = formatSLADueNotice(getTicketDueDate(selectedTicket));
                  return (
                    <span className={`font-semibold ${sla.isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                      {sla.label}
                    </span>
                  );
                })()}
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Filing Date</span>
                <span className="font-mono text-slate-700">
                  {new Date(selectedTicket.submittedAt).toLocaleDateString()} ·{' '}
                  {new Date(selectedTicket.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {selectedTicket.resolutionNotes && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <span className="font-bold block text-xs text-emerald-900">Official Resolution Note</span>
                <p className="text-xs leading-relaxed text-emerald-800">{selectedTicket.resolutionNotes}</p>
              </div>
            )}

            {selectedTicket.rejectionReason && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                <span className="font-bold block text-xs text-rose-900">Rejection Explanation</span>
                <p className="text-xs leading-relaxed text-rose-800">{selectedTicket.rejectionReason}</p>
              </div>
            )}

            {/* Complete Timeline with Actor, Timestamp, Status & Notes (Section 3.4) */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
                Resolution Timeline &amp; Activity Log
              </span>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 pl-8">
                {selectedTicket.timeline.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white shadow-xs" />
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-xs">{step.status.replace('_', ' ')}</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {new Date(step.timestamp).toLocaleDateString()} ·{' '}
                          {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Updated by: <strong>{step.changedBy}</strong>
                      </div>
                      {step.notes && (
                        <p className="text-[11px] text-slate-600 mt-1 bg-white p-2 rounded border border-slate-100">
                          {step.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close Ticket View
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
