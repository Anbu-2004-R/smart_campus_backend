import React, { useEffect, useMemo, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Copy,
} from 'lucide-react';
import { UserRole, AccountStatus } from '../../types/erp';

export const AccountManagement: React.FC = () => {
  const { users, studentProfiles, facultyProfiles, departments, courses, classGroups, toggleUserStatus, inviteUser } = useERP();

  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRegisterNumber, setInviteRegisterNumber] = useState('');
  const [inviteEmployeeId, setInviteEmployeeId] = useState('');
  const [inviteDepartmentId, setInviteDepartmentId] = useState('');
  const [inviteCourseId, setInviteCourseId] = useState('');
  const [inviteClassGroupId, setInviteClassGroupId] = useState('');
  const [inviteSemester, setInviteSemester] = useState(1);
  const [inviteAcademicYear, setInviteAcademicYear] = useState('');
  const [inviteDesignation, setInviteDesignation] = useState('Assistant Professor');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [generatedLoginId, setGeneratedLoginId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState('');

  // User details modal state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const inviteCourseOptions = useMemo(
    () => courses.filter((course) => course.departmentId === inviteDepartmentId),
    [courses, inviteDepartmentId]
  );

  const inviteGroupOptions = useMemo(
    () =>
      classGroups.filter(
        (group) =>
          group.courseId === inviteCourseId &&
          group.semester === inviteSemester &&
          group.academicYear === inviteAcademicYear
      ),
    [classGroups, inviteCourseId, inviteSemester, inviteAcademicYear]
  );

  useEffect(() => {
    if (!isInviteOpen) return;
    const departmentId =
      inviteDepartmentId || courses[0]?.departmentId || departments[0]?.id || '';
    const courseId =
      inviteCourseId ||
      courses.find((course) => course.departmentId === departmentId)?.id ||
      '';
    const group =
      classGroups.find(
        (value) =>
          value.courseId === courseId &&
          value.semester === inviteSemester &&
          value.academicYear === inviteAcademicYear
      ) || classGroups.find((value) => value.courseId === courseId);
    if (!inviteDepartmentId && departmentId) setInviteDepartmentId(departmentId);
    if (!inviteCourseId && courseId) setInviteCourseId(courseId);
    if (!inviteAcademicYear && group?.academicYear) setInviteAcademicYear(group.academicYear);
    if (group && !inviteClassGroupId) {
      setInviteSemester(group.semester);
      setInviteClassGroupId(group.id);
    }
  }, [
    isInviteOpen,
    departments,
    courses,
    classGroups,
    inviteDepartmentId,
    inviteCourseId,
    inviteAcademicYear,
    inviteSemester,
    inviteClassGroupId,
  ]);

  useEffect(() => {
    if (!isInviteOpen) return;
    if (!inviteGroupOptions.some((group) => group.id === inviteClassGroupId)) {
      setInviteClassGroupId(inviteGroupOptions[0]?.id || '');
    }
  }, [isInviteOpen, inviteGroupOptions, inviteClassGroupId]);

  const activationLink = generatedToken
    ? `${window.location.origin}${window.location.pathname}#/activate?token=${encodeURIComponent(generatedToken)}`
    : '';

  // Combine user info with profile info
  const combinedAccounts = users.map((u) => {
    const student = studentProfiles.find((s) => s.userId === u.id);
    const faculty = facultyProfiles.find((f) => f.userId === u.id);
    const deptId = student?.departmentId || faculty?.departmentId;
    const department = departments.find((d) => d.id === deptId);

    return {
      user: u,
      student,
      faculty,
      displayName: student?.fullName || faculty?.fullName || (u.role === 'ADMIN' ? 'System Administrator' : u.loginId),
      idNumber: student?.registerNumber || faculty?.employeeId || 'ADMIN-ROOT',
      phone: student?.phone || faculty?.phone || 'N/A',
      departmentName: department?.name || 'General Administration',
      semester: student?.currentSemester,
      designation: faculty?.designation,
    };
  });

  const filtered = combinedAccounts.filter((acc) => {
    if (roleFilter !== 'ALL' && acc.user.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && acc.user.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = acc.displayName.toLowerCase().includes(q);
      const matchId = acc.idNumber.toLowerCase().includes(q);
      const matchEmail = acc.user.email.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchEmail) return false;
    }
    return true;
  });

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    setInviteError('');
    const res = await inviteUser(
      {
        role: inviteRole,
        email: inviteEmail,
        name: inviteName,
        phone: invitePhone || undefined,
        departmentId: inviteDepartmentId || undefined,
        ...(inviteRole === 'STUDENT'
          ? {
              registerNumber: inviteRegisterNumber || undefined,
              courseId: inviteCourseId || undefined,
              classGroupId: inviteClassGroupId || undefined,
              semester: inviteSemester,
              academicYear: inviteAcademicYear || undefined,
            }
          : {
              employeeId: inviteEmployeeId || undefined,
              designation: inviteDesignation || undefined,
            }),
      },
      'Dr. A. K. Sundaram (Registrar)'
    );
    if (res.error) {
      setInviteError(res.error);
      return;
    }
    setGeneratedToken(res.token || null);
    setGeneratedLoginId(res.loginId || null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Student & Faculty Account Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create profiles, send secure account invitations, and manage lifecycle status. Historical records are preserved upon deactivation.
          </p>
        </div>
        <button
          onClick={() => {
            setGeneratedToken(null);
            setGeneratedLoginId(null);
            setInviteError('');
            setInviteName('');
            setInviteEmail('');
            setInvitePhone('');
            setInviteRegisterNumber('');
            setInviteEmployeeId('');
            setInviteRole('STUDENT');
            setInviteDepartmentId(courses[0]?.departmentId || departments[0]?.id || '');
            setInviteCourseId(courses[0]?.id || '');
            setInviteClassGroupId('');
            setInviteAcademicYear('');
            setIsInviteOpen(true);
          }}
          className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="FACULTY">Faculty</option>
              <option value="ADMIN">Administrators</option>
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Deactivated</option>
              <option value="PENDING_SETUP">Pending Setup</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">User & Academic Profile</th>
                <th className="px-4 py-3">Register / Employee ID</th>
                <th className="px-4 py-3">Role & Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-5 py-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((acc) => (
                <tr key={acc.user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {acc.user.avatarUrl ? (
                        <img
                          src={acc.user.avatarUrl}
                          alt={acc.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                          {acc.displayName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{acc.displayName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{acc.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">{acc.idNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{acc.user.role}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{acc.departmentName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={acc.user.status} />
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-slate-500">
                    {acc.user.lastLogin ? new Date(acc.user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      onClick={() => setSelectedUser(acc)}
                      className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors text-xs font-medium"
                    >
                      View Profile
                    </button>
                    {acc.user.role !== 'ADMIN' && (
                      <button
                        onClick={() => toggleUserStatus(acc.user.id, 'Dr. A. K. Sundaram')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          acc.user.status === 'ACTIVE'
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {acc.user.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Send Secure Account Setup Invitation"
        subtitle="Generates an expiring single-use token sent to the user's official college email."
      >
        {generatedToken ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Account Setup Token Generated</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                A secure, single-use activation invitation has been dispatched to <strong>{inviteEmail}</strong>.
              </p>
            </div>

            {generatedLoginId && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] text-slate-500 font-medium mb-1">Sign-in ID:</div>
                <div className="flex items-center justify-between text-xs font-mono bg-white p-2 border border-slate-200 rounded">
                  <span className="truncate">{generatedLoginId}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedLoginId)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                    title="Copy sign-in ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[11px] text-slate-500 font-medium mb-1">Single-use activation link:</div>
              <div className="flex items-center justify-between text-xs font-mono bg-white p-2 border border-slate-200 rounded">
                <span className="truncate">{activationLink}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(activationLink)}
                  className="p-1 text-slate-500 hover:text-slate-800"
                  title="Copy link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsInviteOpen(false)}
              className="w-full py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendInvite} className="space-y-4">
            {inviteError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {inviteError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Swarna Lakshmi"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Official College Email</label>
              <input
                type="email"
                required
                placeholder="name@smartcampus.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Account Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty Member</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <select
                required
                value={inviteDepartmentId}
                onChange={(e) => {
                  const departmentId = e.target.value;
                  const firstCourse = courses.find((course) => course.departmentId === departmentId);
                  setInviteDepartmentId(departmentId);
                  setInviteCourseId(firstCourse?.id || '');
                  setInviteClassGroupId('');
                }}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            {inviteRole === 'STUDENT' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Register Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22CS101"
                    value={inviteRegisterNumber}
                    onChange={(e) => setInviteRegisterNumber(e.target.value.toUpperCase())}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Course</label>
                    <select
                      required
                      value={inviteCourseId}
                      onChange={(e) => {
                        setInviteCourseId(e.target.value);
                        setInviteClassGroupId('');
                      }}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="">Select course</option>
                      {inviteCourseOptions.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Semester</label>
                    <select
                      required
                      value={inviteSemester}
                      onChange={(e) => {
                        setInviteSemester(Number(e.target.value));
                        setInviteClassGroupId('');
                      }}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      {Array.from({ length: 8 }, (_, index) => index + 1).map((semester) => (
                        <option key={semester} value={semester}>
                          Semester {semester}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Academic Year</label>
                    <select
                      required
                      value={inviteAcademicYear}
                      onChange={(e) => {
                        setInviteAcademicYear(e.target.value);
                        setInviteClassGroupId('');
                      }}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="">Select academic year</option>
                      {Array.from(new Set(classGroups.map((group) => group.academicYear))).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Class Group</label>
                    <select
                      required
                      value={inviteClassGroupId}
                      onChange={(e) => setInviteClassGroupId(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="">Select class group</option>
                      {inviteGroupOptions.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {inviteCourseId && !inviteGroupOptions.length && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    No matching class group exists for this course, semester, and academic year. Create the class group first.
                  </p>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-CSE-025"
                    value={inviteEmployeeId}
                    onChange={(e) => setInviteEmployeeId(e.target.value.toUpperCase())}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assistant Professor"
                    value={inviteDesignation}
                    onChange={(e) => setInviteDesignation(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <p className="text-[11px] text-slate-500 leading-relaxed">
              * Setup links are cryptographically signed, expire in 24 hours, and can only be used once.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Issue Setup Invitation
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Account Profile: ${selectedUser.displayName}`}
          subtitle={`${selectedUser.user.role} · ${selectedUser.idNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Email</span>
                <span className="font-mono text-slate-900">{selectedUser.user.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                <span className="font-mono text-slate-900">{selectedUser.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="text-slate-900">{selectedUser.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status</span>
                <StatusBadge status={selectedUser.user.status} />
              </div>
              {selectedUser.semester && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Current Semester</span>
                  <span className="text-slate-900">Semester {selectedUser.semester}</span>
                </div>
              )}
              {selectedUser.designation && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Academic Title</span>
                  <span className="text-slate-900">{selectedUser.designation}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <span className="font-semibold block mb-0.5">Historical Record Protection Policy</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Even if deactivated, student attendance, submitted marks, arrear records, and published results are never erased from the relational schema.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
