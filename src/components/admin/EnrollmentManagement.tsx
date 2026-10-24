import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  GraduationCap,
  Users,
  Search,
  Filter,
  UserCheck,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  BookOpen,
  Calendar,
  AlertCircle,
  Award,
  ChevronRight,
  ShieldCheck,
  History,
  Copy,
} from 'lucide-react';
import {
  StudentEnrollment,
  AdmissionApplication,
  EnrollmentStatus,
  ApplicationStatus,
} from '../../types/erp';

const activationLinkFor = (token: string) =>
  `${window.location.origin}${window.location.pathname}#/activate?token=${encodeURIComponent(token)}`;

export const EnrollmentManagement: React.FC = () => {
  const {
    enrollments,
    admissionApplications,
    studentProfiles,
    departments,
    courses,
    classGroups,
    submitAdmissionApplication,
    reviewAdmissionApplication,
    promoteStudent,
    updateEnrollmentStatus,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'ENROLMENTS' | 'APPLICATIONS' | 'PROMOTION' | 'NEW_APP'>('ENROLMENTS');

  // Tab 1: Enrolment Registry filters
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab 2: Applications filter
  const [appStatusFilter, setAppStatusFilter] = useState<string>('ALL');

  // Modals state
  const [selectedEnrollmentHistoryStudentId, setSelectedEnrollmentHistoryStudentId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<ApplicationStatus>('APPROVED');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [assignedClassGroupId, setAssignedClassGroupId] = useState(classGroups[0]?.id || '');
  const [reviewAcademicYear, setReviewAcademicYear] = useState('2025-2026');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewActivationToken, setReviewActivationToken] = useState<string | null>(null);

  // Promotion Tab state
  const [promotionClassGroupId, setPromotionClassGroupId] = useState(classGroups[0]?.id || '');
  const [targetAcademicYear, setTargetAcademicYear] = useState('2026-2027');
  const [promotionSuccessMsg, setPromotionSuccessMsg] = useState('');
  const [promotionError, setPromotionError] = useState('');

  // Enrollment status modal state
  const [statusEnrollment, setStatusEnrollment] = useState<StudentEnrollment | null>(null);
  const [newEnrollmentStatus, setNewEnrollmentStatus] = useState<
    'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' | 'SUSPENDED'
  >('SUSPENDED');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [statusError, setStatusError] = useState('');
  const [statusSuccessMsg, setStatusSuccessMsg] = useState('');
  const [isStatusSaving, setIsStatusSaving] = useState(false);

  // New Application Form state
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidateDob, setCandidateDob] = useState('2005-05-15');
  const [candidateDeptId, setCandidateDeptId] = useState(departments[0]?.id || '');
  const [candidateCourseId, setCandidateCourseId] = useState(courses[0]?.id || '');
  const [candidateSemester, setCandidateSemester] = useState(1);
  const [candidateYear, setCandidateYear] = useState('2026-2027');
  const [candidateQual, setCandidateQual] = useState('Higher Secondary (PCM) - 12th Standard');
  const [candidateScore, setCandidateScore] = useState('92.5%');
  const [appSubmittedMsg, setAppSubmittedMsg] = useState('');
  const [appError, setAppError] = useState('');

  // Filtered Enrollments
  const filteredEnrollments = enrollments.filter((enr) => {
    if (deptFilter !== 'ALL' && enr.departmentId !== deptFilter) return false;
    if (semesterFilter !== 'ALL' && enr.semester.toString() !== semesterFilter) return false;
    if (statusFilter !== 'ALL' && enr.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = enr.studentName.toLowerCase().includes(q);
      const matchReg = enr.registerNumber.toLowerCase().includes(q);
      const matchCourse = enr.courseName.toLowerCase().includes(q);
      if (!matchName && !matchReg && !matchCourse) return false;
    }
    return true;
  });

  // Filtered Applications
  const filteredApplications = admissionApplications.filter((app) => {
    if (appStatusFilter !== 'ALL' && app.status !== appStatusFilter) return false;
    return true;
  });

  // Handle Review application submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    setReviewError('');

    if (reviewAction === 'REJECTED' && !reviewRemarks.trim()) {
      setReviewError('Mandatory institutional rule: Rejection must include a recorded reason.');
      return;
    }

    const res = await reviewAdmissionApplication(
      selectedApplication.id,
      reviewAction,
      reviewRemarks.trim() || 'Approved after candidate document and credentials verification.',
      'Dr. A. K. Sundaram (Registrar)',
      reviewAction === 'APPROVED' ? assignedClassGroupId : undefined,
      reviewAcademicYear
    );

    if (res.success) {
      setReviewActivationToken(res.activationToken || null);
      setReviewSuccessMsg(
        reviewAction === 'APPROVED'
          ? `Candidate ${selectedApplication.applicantName} admitted successfully! Student profile, credentials, and active enrolment generated.`
          : `Application status updated to ${reviewAction}.`
      );
      setSelectedApplication(null);
      setReviewRemarks('');
      setTimeout(() => setReviewSuccessMsg(''), 6000);
    } else {
      setReviewError(res.error || 'Failed to review application');
    }
  };

  // Handle Promotion
  const handlePromoteBatch = async (studentId: string, currentSem: number) => {
    const nextSem = currentSem + 1;
    setPromotionError('');
    const res = await promoteStudent(
      studentId,
      nextSem,
      promotionClassGroupId,
      targetAcademicYear,
      'Dr. A. K. Sundaram (Registrar)'
    );

    if (res.success) {
      setPromotionSuccessMsg(
        res.graduated
          ? 'Student completed the final semester and was marked as graduated.'
          : `Student promoted to Semester ${nextSem}. Historical enrolment preserved.`
      );
      setTimeout(() => setPromotionSuccessMsg(''), 4000);
    } else {
      setPromotionError(res.error || 'Unable to promote the student.');
    }
  };

  // Handle Enrollment Status Change
  const handleEnrollmentStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusEnrollment) return;
    setStatusError('');

    if (
      (newEnrollmentStatus === 'SUSPENDED' || newEnrollmentStatus === 'WITHDRAWN') &&
      statusRemarks.trim().length < 5
    ) {
      setStatusError('A clear reason is required when suspending or withdrawing an enrollment.');
      return;
    }

    setIsStatusSaving(true);
    const res = await updateEnrollmentStatus(
      statusEnrollment.id,
      newEnrollmentStatus,
      statusRemarks.trim(),
      'Dr. A. K. Sundaram (Registrar)'
    );
    setIsStatusSaving(false);

    if (res.success) {
      setStatusSuccessMsg(
        `${statusEnrollment.studentName} (${statusEnrollment.registerNumber}) is now ${newEnrollmentStatus.toLowerCase()}.`
      );
      setStatusEnrollment(null);
      setStatusRemarks('');
      setTimeout(() => setStatusSuccessMsg(''), 5000);
    } else {
      setStatusError(res.error || 'Unable to update the enrollment status.');
    }
  };

  // Handle New Manual Application
  const handleNewAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName || !candidateEmail) return;
    setAppError('');

    const res = await submitAdmissionApplication({
      applicantName: candidateName,
      email: candidateEmail,
      phone: candidatePhone,
      dateOfBirth: candidateDob,
      departmentId: candidateDeptId,
      courseId: candidateCourseId,
      appliedSemester: candidateSemester,
      academicYear: candidateYear,
      previousQualification: candidateQual,
      percentageOrGpa: candidateScore,
    });

    if (!res.success) {
      setAppError(res.error || 'Unable to register the application.');
      return;
    }

    setAppSubmittedMsg(
      `Application ${res.application?.applicationNumber || ''} for ${candidateName} registered. Ready for administrative review.`
    );
    setCandidateName('');
    setCandidateEmail('');
    setCandidatePhone('');
    setTimeout(() => {
      setAppSubmittedMsg('');
      setActiveTab('APPLICATIONS');
    }, 2000);
  };

  // Compute stats
  const activeEnrolmentsCount = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const pendingAppsCount = admissionApplications.filter(
    (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW'
  ).length;
  const approvedAppsCount = admissionApplications.filter((a) => a.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 font-mono">
              Academic Enrolment Architecture
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">Institutional Registrar Records</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Enrollment Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer admissions, student registrations, class section memberships, and semester progressions with historical record preservation.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('ENROLMENTS')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'ENROLMENTS' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Enrolment Registry ({activeEnrolmentsCount})
          </button>
          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'APPLICATIONS' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admissions Queue
            {pendingAppsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px]">
                {pendingAppsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('PROMOTION')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'PROMOTION' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semester Progression
          </button>
          <button
            onClick={() => setActiveTab('NEW_APP')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'NEW_APP' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Registration
          </button>
        </div>
      </div>

      {reviewSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-medium">{reviewSuccessMsg}</div>
        </div>
      )}

      {reviewActivationToken && (
        <div className="p-4 bg-white border border-indigo-200 rounded-xl text-xs text-slate-700 space-y-2">
          <div className="font-semibold text-slate-900">Student account activation link</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-[11px]">
              {activationLinkFor(reviewActivationToken)}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(activationLinkFor(reviewActivationToken))}
              className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Share this single-use link with the student so they can set their password and sign in.
          </p>
        </div>
      )}

      {promotionSuccessMsg && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="font-medium">{promotionSuccessMsg}</div>
        </div>
      )}

      {statusSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-medium">{statusSuccessMsg}</div>
        </div>
      )}

      {promotionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="font-medium">{promotionError}</div>
        </div>
      )}

      {/* TAB 1: ENROLMENT REGISTRY */}
      {activeTab === 'ENROLMENTS' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student, register no, programme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Dept:</span>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Sem:</span>
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Semesters</option>
                  <option value="1">Sem 1</option>
                  <option value="2">Sem 2</option>
                  <option value="3">Sem 3</option>
                  <option value="4">Sem 4</option>
                  <option value="5">Sem 5</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PROMOTED">Promoted (Historical)</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Register No. & Candidate</th>
                    <th className="px-4 py-3">Programme & Department</th>
                    <th className="px-4 py-3">Academic Period</th>
                    <th className="px-4 py-3">Class Section</th>
                    <th className="px-4 py-3">Credits</th>
                    <th className="px-4 py-3">Enrolment Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                        No enrolment records matching selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900">{enr.studentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono font-medium">{enr.registerNumber}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-800">{enr.courseName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{enr.departmentCode}</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          <div className="font-medium text-slate-800">AY {enr.academicYear}</div>
                          <div className="text-[11px] text-slate-500">Semester {enr.semester}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-slate-800">{enr.classGroupName}</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-700">
                          {enr.creditsRegistered} cr
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={enr.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedEnrollmentHistoryStudentId(enr.studentId)}
                            className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
                          >
                            Progression History
                          </button>
                          {enr.status !== 'PROMOTED' && enr.status !== 'GRADUATED' && (
                            <button
                              onClick={() => {
                                setStatusEnrollment(enr);
                                setNewEnrollmentStatus(
                                  enr.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                                );
                                setStatusRemarks('');
                                setStatusError('');
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors"
                            >
                              Change Status
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADMISSIONS QUEUE */}
      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Admission Application Review Pipeline
              </h3>
              <p className="text-[11px] text-slate-500">
                Verify credentials, assign academic degree &amp; section, and approve registration.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Status Filter:</span>
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Applications</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved &amp; Admitted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">App ID & Candidate</th>
                    <th className="px-4 py-3">Applied Course & Term</th>
                    <th className="px-4 py-3">Previous Qualification</th>
                    <th className="px-4 py-3">Academic Score</th>
                    <th className="px-4 py-3">Review Status</th>
                    <th className="px-5 py-3 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                        No applications matching selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900">{app.applicantName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{app.applicationNumber}</div>
                          <div className="text-[10px] text-slate-400">{app.email}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-800">
                            {courses.find((c) => c.id === app.courseId)?.name || 'Degree Course'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            AY {app.academicYear} · Semester {app.appliedSemester}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 text-xs">
                          {app.previousQualification}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-indigo-700">
                          {app.percentageOrGpa}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={app.status} />
                          {app.generatedRegisterNumber && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Reg: <strong className="text-slate-800">{app.generatedRegisterNumber}</strong>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW' ? (
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                setReviewActivationToken(null);
                                setReviewAction('APPROVED');
                                setReviewRemarks('');
                                setReviewError('');
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
                            >
                              Review &amp; Decide
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                setReviewActivationToken(null);
                                setReviewAction(app.status);
                                setReviewRemarks(app.reviewRemarks || '');
                              }}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            >
                              View Decision
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEMESTER PROGRESSION & PROMOTION */}
      {activeTab === 'PROMOTION' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-start gap-3 text-xs text-indigo-900">
            <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Term Progression Architecture:</strong>
              When students advance between academic semesters, the system transitions existing records to <em>PROMOTED</em> status and generates a new active enrolment record. All historical marks, attendance percentages, and examination outcomes from previous semesters remain permanently accessible and unmodified.
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Class Group Promotion Terminal</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select student group to review progression eligibility
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Group:</span>
                  <select
                    value={promotionClassGroupId}
                    onChange={(e) => setPromotionClassGroupId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-semibold focus:outline-none"
                  >
                    {classGroups.map((cg) => (
                      <option key={cg.id} value={cg.id}>
                        {cg.name} (Semester {cg.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Target AY:</span>
                  <input
                    type="text"
                    value={targetAcademicYear}
                    onChange={(e) => setTargetAcademicYear(e.target.value)}
                    className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Students in this group */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Register No. & Student</th>
                    <th className="px-4 py-3">Current Term</th>
                    <th className="px-4 py-3">Academic Standing</th>
                    <th className="px-4 py-3">Enrolment State</th>
                    <th className="px-4 py-3 text-right">Progression Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {studentProfiles
                    .filter((s) => s.classGroupId === promotionClassGroupId)
                    .map((stu) => {
                      const activeEnr = enrollments.find(
                        (e) => e.studentId === stu.id && e.status === 'ACTIVE'
                      );

                      return (
                        <tr key={stu.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900">{stu.fullName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{stu.registerNumber}</div>
                          </td>
                          <td className="px-4 py-3.5 font-mono">Semester {stu.currentSemester}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-emerald-700 font-semibold text-xs">Eligible for Promotion</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={activeEnr?.status || 'ACTIVE'} />
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => handlePromoteBatch(stu.id, stu.currentSemester)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                            >
                              Advance to Semester {stu.currentSemester + 1} &rarr;
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NEW ADMISSION FORM */}
      {activeTab === 'NEW_APP' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs max-w-3xl">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Direct Student Admission Registration</h3>
          <p className="text-xs text-slate-500 mb-6">
            Register a new candidate into the collegiate admissions database. Upon review and approval, student profile and enrolment will be instantiated automatically.
          </p>

          {appSubmittedMsg && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{appSubmittedMsg}</span>
            </div>
          )}

          {appError && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{appError}</span>
            </div>
          )}

          <form onSubmit={handleNewAppSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swarna Lakshmi"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98401 23456"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={candidateDob}
                  onChange={(e) => setCandidateDob(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Academic Department</label>
                <select
                  value={candidateDeptId}
                  onChange={(e) => setCandidateDeptId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Course / Programme</label>
                <select
                  value={candidateCourseId}
                  onChange={(e) => setCandidateCourseId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Applied Term</label>
                <select
                  value={candidateSemester}
                  onChange={(e) => setCandidateSemester(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value={1}>Semester 1 (Fresh Entry)</option>
                  <option value={3}>Semester 3 (Lateral Entry)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Qualifying Examination</label>
                <input
                  type="text"
                  value={candidateQual}
                  onChange={(e) => setCandidateQual(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Score / Percentage</label>
                <input
                  type="text"
                  value={candidateScore}
                  onChange={(e) => setCandidateScore(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                Register Application
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Application Review & Approval Modal */}
      {selectedApplication && (
        <Modal
          isOpen={!!selectedApplication}
          onClose={() => setSelectedApplication(null)}
          title={`Admissions Review: ${selectedApplication.applicationNumber}`}
          subtitle={`Candidate: ${selectedApplication.applicantName}`}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            {reviewError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs">
                {reviewError}
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Email</span>
                  <span className="font-mono text-slate-900">{selectedApplication.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone</span>
                  <span className="font-mono text-slate-900">{selectedApplication.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Qualifying Exam</span>
                  <span className="text-slate-800">{selectedApplication.previousQualification}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Marks / GPA</span>
                  <span className="font-bold text-indigo-700 font-mono">{selectedApplication.percentageOrGpa}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">Administrative Decision</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction('APPROVED')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                    reviewAction === 'APPROVED'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Approve &amp; Admit
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('UNDER_REVIEW')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                    reviewAction === 'UNDER_REVIEW'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Mark Under Review
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('REJECTED')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                    reviewAction === 'REJECTED'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Reject
                </button>
              </div>
            </div>

            {reviewAction === 'APPROVED' && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-3">
                <span className="font-semibold text-emerald-950 block">Class Section &amp; Enrolment Allocation</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-emerald-900 font-medium mb-1">Assign Class Section</label>
                    <select
                      value={assignedClassGroupId}
                      onChange={(e) => setAssignedClassGroupId(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-emerald-300 rounded font-medium focus:outline-none"
                    >
                      {classGroups.map((cg) => (
                        <option key={cg.id} value={cg.id}>
                          {cg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-emerald-900 font-medium mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={reviewAcademicYear}
                      onChange={(e) => setReviewAcademicYear(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-emerald-300 rounded font-mono focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  * Approving will automatically generate candidate login credentials, register number, and active semester enrolment record.
                </p>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {reviewAction === 'REJECTED' ? (
                  <span className="text-rose-600 font-semibold">Mandatory Rejection Explanation *</span>
                ) : (
                  'Review Remarks / Admission Order'
                )}
              </label>
              <textarea
                rows={3}
                required={reviewAction === 'REJECTED'}
                placeholder={
                  reviewAction === 'REJECTED'
                    ? 'State eligibility reason for rejection (e.g. Cutoff criteria not met)...'
                    : 'e.g. Verified original higher secondary mark sheet and caste certificate.'
                }
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Save Decision &amp; Update Records
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Enrollment Status Modal */}
      {statusEnrollment && (
        <Modal
          isOpen={!!statusEnrollment}
          onClose={() => setStatusEnrollment(null)}
          title="Update Enrollment Status"
          subtitle={`${statusEnrollment.studentName} (${statusEnrollment.registerNumber})`}
        >
          <form onSubmit={handleEnrollmentStatusSubmit} className="space-y-4 text-xs">
            {statusError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
                {statusError}
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current status</span>
                <StatusBadge status={statusEnrollment.status} />
              </div>
              <div className="text-slate-500">
                Semester {statusEnrollment.semester} · AY {statusEnrollment.academicYear} ·{' '}
                {statusEnrollment.classGroupName}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">New Status</label>
              <select
                value={newEnrollmentStatus}
                onChange={(event) =>
                  setNewEnrollmentStatus(
                    event.target.value as 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' | 'SUSPENDED'
                  )
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ACTIVE">Active / Reinstate</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {(newEnrollmentStatus === 'SUSPENDED' || newEnrollmentStatus === 'WITHDRAWN') && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                Suspending or withdrawing preserves all academic history, but the student cannot
                access active enrollment workflows until reinstated.
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Reason / Administrative Remarks
                {(newEnrollmentStatus === 'SUSPENDED' ||
                  newEnrollmentStatus === 'WITHDRAWN') && (
                  <span className="text-rose-600"> *</span>
                )}
              </label>
              <textarea
                rows={3}
                value={statusRemarks}
                onChange={(event) => setStatusRemarks(event.target.value)}
                placeholder="Record the reason for this status change..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusEnrollment(null)}
                className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isStatusSaving}
                className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 rounded-lg transition-colors"
              >
                {isStatusSaving ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Progression History Modal */}
      {selectedEnrollmentHistoryStudentId && (
        <Modal
          isOpen={!!selectedEnrollmentHistoryStudentId}
          onClose={() => setSelectedEnrollmentHistoryStudentId(null)}
          title="Student Academic Enrolment History"
          subtitle="Continuous semester records & historical progression trace"
        >
          <div className="space-y-4 text-xs">
            <div className="divide-y divide-slate-100">
              {enrollments
                .filter((e) => e.studentId === selectedEnrollmentHistoryStudentId)
                .map((enr) => (
                  <div key={enr.id} className="py-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Semester {enr.semester}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-slate-600">AY {enr.academicYear}</span>
                        <StatusBadge status={enr.status} />
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Group: {enr.classGroupName} · Registered: {enr.creditsRegistered} Credits
                      </div>
                      {enr.remarks && <p className="text-[11px] text-slate-400 italic mt-0.5">{enr.remarks}</p>}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{enr.enrollmentDate}</span>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedEnrollmentHistoryStudentId(null)}
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
