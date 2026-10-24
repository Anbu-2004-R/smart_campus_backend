import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { Modal } from '../common/Modal';
import {
  AlertCircle,
  BookOpen,
  Building,
  Calendar,
  CheckCircle2,
  Megaphone,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import { Announcement, AnnouncementScope } from '../../types/erp';

const scopeLabel = (scope: AnnouncementScope) =>
  ({
    COLLEGE_WIDE: 'College Wide',
    DEPARTMENT: 'Department',
    COURSE: 'Course',
    SEMESTER: 'Semester',
  }[scope] || scope);

export const AnnouncementManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    announcements,
    departments,
    courses,
    publishAnnouncement,
    deleteAnnouncement,
  } = useERP();

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scope, setScope] = useState<AnnouncementScope>('COLLEGE_WIDE');
  const [targetDepartmentId, setTargetDepartmentId] = useState(departments[0]?.id || '');
  const [targetCourseId, setTargetCourseId] = useState(courses[0]?.id || '');
  const [targetSemester, setTargetSemester] = useState(5);
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [expiryDate, setExpiryDate] = useState('');
  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | AnnouncementScope>('ALL');

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((announcement) => scopeFilter === 'ALL' || announcement.scope === scopeFilter)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [announcements, scopeFilter]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setScope('COLLEGE_WIDE');
    setTargetDepartmentId(departments[0]?.id || '');
    setTargetCourseId(courses[0]?.id || '');
    setTargetSemester(5);
    setPriority('NORMAL');
    setExpiryDate('');
    setError('');
  };

  const handlePublish = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (title.trim().length < 5) {
      setError('Title must contain at least 5 characters.');
      return;
    }
    if (content.trim().length < 10) {
      setError('Announcement content must contain at least 10 characters.');
      return;
    }
    if (scope === 'DEPARTMENT' && !targetDepartmentId) {
      setError('Select a target department.');
      return;
    }
    if (scope === 'COURSE' && !targetCourseId) {
      setError('Select a target course.');
      return;
    }

    setIsPublishing(true);
    const result = await publishAnnouncement({
      title: title.trim(),
      content: content.trim(),
      authorId: currentUser?.id || 'usr-admin-1',
      authorName: 'Office of the Registrar',
      scope,
      targetDepartmentId: scope === 'DEPARTMENT' ? targetDepartmentId : undefined,
      targetCourseId: scope === 'COURSE' ? targetCourseId : undefined,
      targetSemester: scope === 'SEMESTER' ? targetSemester : undefined,
      priority,
      expiryDate: expiryDate || undefined,
    });
    setIsPublishing(false);

    if (!result.success) {
      setError(result.error || 'Unable to publish the announcement.');
      return;
    }

    setIsComposeOpen(false);
    resetForm();
    setSuccessMessage('Announcement published and delivered to the target audience.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    const result = await deleteAnnouncement(
      deleteTarget.id,
      'Dr. A. K. Sundaram (Registrar)'
    );
    if (!result.success) {
      setDeleteError(result.error || 'Unable to delete the announcement.');
      return;
    }
    setDeleteTarget(null);
    setSuccessMessage('Announcement removed.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Campus Announcements</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish targeted notices, urgent updates, and academic circulars to students and faculty.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsComposeOpen(true);
          }}
          className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          New Announcement
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Megaphone className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">
            {filteredAnnouncements.length} published notice
            {filteredAnnouncements.length === 1 ? '' : 's'}
          </span>
        </div>
        <select
          value={scopeFilter}
          onChange={(event) => setScopeFilter(event.target.value as 'ALL' | AnnouncementScope)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
        >
          <option value="ALL">All scopes</option>
          <option value="COLLEGE_WIDE">College wide</option>
          <option value="DEPARTMENT">Department</option>
          <option value="COURSE">Course</option>
          <option value="SEMESTER">Semester</option>
        </select>
      </div>

      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-xs text-slate-500">
          No announcements have been published for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAnnouncements.map((announcement) => (
            <article
              key={announcement.id}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        announcement.priority === 'URGENT'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {announcement.priority}
                    </span>
                    <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {scopeLabel(announcement.scope)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteTarget(announcement);
                      setDeleteError('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{announcement.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {announcement.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {announcement.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(announcement.publishedAt).toLocaleDateString()}
                </span>
                {announcement.expiryDate && (
                  <span>Expires {new Date(announcement.expiryDate).toLocaleDateString()}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Publish Campus Announcement"
        subtitle="Notices are immediately visible to the selected audience."
      >
        <form onSubmit={handlePublish} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={180}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Autumn 2026 examination timetable released"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Announcement Content</label>
            <textarea
              rows={5}
              required
              minLength={10}
              maxLength={8000}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write the complete official notice..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Audience Scope</label>
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value as AnnouncementScope)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="COLLEGE_WIDE">College wide</option>
                <option value="DEPARTMENT">Department</option>
                <option value="COURSE">Course</option>
                <option value="SEMESTER">Semester</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as 'NORMAL' | 'URGENT')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {scope === 'DEPARTMENT' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Department</label>
              <select
                value={targetDepartmentId}
                onChange={(event) => setTargetDepartmentId(event.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {scope === 'COURSE' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Course</label>
              <select
                value={targetCourseId}
                onChange={(event) => setTargetCourseId(event.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {scope === 'SEMESTER' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Semester</label>
              <select
                value={targetSemester}
                onChange={(event) => setTargetSemester(Number(event.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                {Array.from({ length: 8 }, (_, index) => index + 1).map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Expiry Date <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <BookOpen className="w-3.5 h-3.5" />
              In-app notifications are created automatically.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPublishing}
                className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {isPublishing ? 'Publishing...' : 'Publish Notice'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Announcement"
        subtitle={deleteTarget?.title}
      >
        <div className="space-y-4 text-xs">
          {deleteError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
              {deleteError}
            </div>
          )}
          <p className="text-slate-600 leading-relaxed">
            This removes the notice from student and faculty portals. Existing audit records are
            preserved.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
            >
              Delete Notice
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnnouncementManagement;
