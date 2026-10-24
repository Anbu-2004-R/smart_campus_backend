import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  UserCircle,
  Mail,
  Phone,
  Calendar,
  Building,
  GraduationCap,
  Lock,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  History,
  Award,
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { currentStudentProfile, currentUser } = useAuth();
  const { departments, courses, enrollments } = useERP();

  const [phone, setPhone] = useState(currentStudentProfile?.phone || '+91 97890 12345');
  const [isSaved, setIsSaved] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(false);

  const dept = departments.find((d) => d.id === currentStudentProfile?.departmentId);
  const crs = courses.find((c) => c.id === currentStudentProfile?.courseId);

  // Student Enrollment records (Section 7.2 student_enrollments)
  const studentId = currentStudentProfile?.id || 'stu-1';
  const myEnrollments = enrollments.filter((e) => e.studentId === studentId);
  const activeEnrollment = myEnrollments.find((e) => e.status === 'ACTIVE') || myEnrollments[0];

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header (Canonical Title & Single Heading) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Official identity and enrolment credentials. Academic properties remain under administrative governance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs text-center flex flex-col items-center">
          {currentStudentProfile?.avatarUrl ? (
            <img
              src={currentStudentProfile.avatarUrl}
              alt={currentStudentProfile.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-xs mb-3"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-900 text-white font-bold text-2xl flex items-center justify-center mb-3">
              {currentStudentProfile?.fullName.charAt(0)}
            </div>
          )}

          <h3 className="text-sm font-bold text-slate-900">{currentStudentProfile?.fullName}</h3>
          <span className="text-xs font-mono font-semibold text-indigo-600 mt-0.5">
            {currentStudentProfile?.registerNumber}
          </span>
          <span className="text-xs text-slate-500 mt-1">
            Semester {currentStudentProfile?.currentSemester} · Section {activeEnrollment?.classGroupName || 'A'}
          </span>

          <div className="w-full mt-6 pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{currentStudentProfile?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{dept?.name || 'Computer Science & Engineering'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>DOB: {currentStudentProfile?.dateOfBirth}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Protected Master Data & Editable Contact */}
        <div className="lg:col-span-2 space-y-6">
          {/* Official Academic Master Data (Locked) */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Protected Academic Master Information</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Per university policy, register number, department, degree, and semester progress are administered exclusively by the Registrar Office.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Enrolment Status</span>
                <span className="font-bold text-emerald-700">{activeEnrollment?.status || 'ACTIVE'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Academic Period</span>
                <span className="font-bold text-slate-900">AY {activeEnrollment?.academicYear || '2026-2027'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Class Section</span>
                <span className="font-bold text-slate-900 truncate block">Section {activeEnrollment?.classGroupName?.includes('Section') ? activeEnrollment.classGroupName : 'A'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Registered Credits</span>
                <span className="font-bold text-indigo-700">{activeEnrollment?.creditsRegistered || 17} cr</span>
              </div>
            </div>
          </div>

          {/* Academic Progression & Historical Term Enrolments */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Enrolment &amp; Term Progression Trace</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{myEnrollments.length} Recorded Term(s)</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {myEnrollments.map((enr) => (
                <div key={enr.id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Semester {enr.semester}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-600">AY {enr.academicYear}</span>
                      <StatusBadge status={enr.status} />
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Class Section: <strong>{enr.classGroupName}</strong> · Registered: <strong>{enr.creditsRegistered}</strong> Credits
                    </div>
                    {enr.remarks && <p className="text-[11px] text-slate-400 italic mt-0.5">{enr.remarks}</p>}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{enr.enrollmentDate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Editable Contact Details */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Permitted Contact Details (Editable)</h3>
            <p className="text-xs text-slate-500 mb-4">Students may update authorized mobile contact numbers.</p>

            {isSaved && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Contact information successfully updated in profile record.</span>
              </div>
            )}

            <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Contact Number</label>
                <div className="relative max-w-sm">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPwdMsg(true);
                    setTimeout(() => setPwdMsg(false), 3000);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Request Password Reset Link</span>
                </button>
              </div>

              {pwdMsg && (
                <p className="text-xs text-emerald-600 font-medium">
                  Single-use password reset link dispatched to your college email (valid 15 minutes).
                </p>
              )}
            </form>
          </div>

          {/* Privacy Compliance Notice */}
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200/90 flex items-start gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold text-slate-900">Student Data Privacy:</strong> Academic records, attendance records, semester marks, and complaint submissions are strictly sandboxed. Students cannot view other students&apos; private records, nor can they directly modify official marks or timetable master entries.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
