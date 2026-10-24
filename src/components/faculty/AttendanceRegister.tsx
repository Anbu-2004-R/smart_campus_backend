import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  Briefcase,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react';
import { AttendanceStatus } from '../../types/erp';

export const AttendanceRegister: React.FC = () => {
  const { currentFacultyProfile } = useAuth();
  const {
    facultyAssignments,
    subjects,
    classGroups,
    studentProfiles,
    recordAttendance,
    classSessions,
    attendanceRecords,
    calculateStudentAttendance,
  } = useERP();

  const facId = currentFacultyProfile?.id || 'fac-1';
  const myAssignments = facultyAssignments.filter((fa) => fa.facultyId === facId);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(myAssignments[0]?.id || '');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<number>(1);
  const [roomNumber, setRoomNumber] = useState('LH-101');
  const [topicCovered, setTopicCovered] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentAssignment = myAssignments.find((fa) => fa.id === selectedAssignmentId) || myAssignments[0];
  const currentSubject = subjects.find((s) => s.id === currentAssignment?.subjectId);
  const currentGroup = classGroups.find((g) => g.id === currentAssignment?.classGroupId);

  // Students in this class group
  const studentsInClass = studentProfiles.filter((s) => s.classGroupId === currentAssignment?.classGroupId);

  // In-memory attendance markings for the form
  const [markings, setMarkings] = useState<Record<string, AttendanceStatus>>(() => {
    const init: Record<string, AttendanceStatus> = {};
    studentsInClass.forEach((s) => {
      init[s.id] = 'PRESENT';
    });
    return init;
  });

  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    studentsInClass.forEach((s) => {
      updated[s.id] = status;
    });
    setMarkings(updated);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setMarkings((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAssignment) return;

    const recordList = studentsInClass.map((s) => ({
      studentId: s.id,
      status: markings[s.id] || 'PRESENT',
      remarks: remarks[s.id] || undefined,
    }));

    recordAttendance(
      {
        assignmentId: currentAssignment.id,
        subjectId: currentAssignment.subjectId,
        classGroupId: currentAssignment.classGroupId,
        facultyId: facId,
        date: sessionDate,
        period,
        roomNumber,
        topicCovered: topicCovered.trim() || undefined,
      },
      recordList,
      currentFacultyProfile?.fullName || 'Faculty Member'
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Recent sessions logged by this faculty
  const recentSessions = classSessions
    .filter((cs) => cs.facultyId === facId)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Interactive Class Attendance Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record official attendance for assigned subjects. Absence warnings and risk recalculations are triggered automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
          >
            {myAssignments.map((fa) => {
              const sub = subjects.find((s) => s.id === fa.subjectId);
              const grp = classGroups.find((g) => g.id === fa.classGroupId);
              return (
                <option key={fa.id} value={fa.id}>
                  {sub?.code} - {grp?.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-medium">
            Attendance for session {sessionDate} (Period {period}) successfully recorded into official database and audit trail!
          </div>
        </div>
      )}

      {/* Session Metadata Form */}
      <form onSubmit={handleSubmitAttendance} className="space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Teaching Session Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Session Date</label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Class Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={1}>Period 1 (09:00 - 09:50)</option>
                <option value={2}>Period 2 (09:55 - 10:45)</option>
                <option value={3}>Period 3 (11:00 - 11:50)</option>
                <option value={4}>Period 4 (11:55 - 12:45)</option>
                <option value={5}>Period 5 (01:45 - 02:35)</option>
                <option value={6}>Period 6 (02:40 - 03:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Classroom / Lab</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. LH-101"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Topic / Syllabus Module</label>
              <input
                type="text"
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                placeholder="e.g. Virtual Memory Paging"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Student Attendance Marking Roster */}
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Student Enrolment Roster ({studentsInClass.length} Students)
              </h3>
              <p className="text-[11px] text-slate-500">
                Mark status individually or use quick bulk presets
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Set All:</span>
              <button
                type="button"
                onClick={() => handleMarkAll('PRESENT')}
                className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('ABSENT')}
                className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
              >
                All Absent
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Register No. & Name</th>
                  <th className="px-4 py-3">Current Attendance</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-5 py-3">Mark Status (Session)</th>
                  <th className="px-4 py-3">Optional Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentsInClass.map((student) => {
                  const summary = calculateStudentAttendance(student.id);
                  const currentStatus = markings[student.id] || 'PRESENT';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{student.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{student.registerNumber}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <span className="font-semibold text-slate-900">{summary.overallPercentage}%</span>
                        <span className="text-slate-400 text-[11px] ml-1">
                          ({summary.attendedClasses}/{summary.totalClasses})
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={summary.riskLevel} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'LATE')}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            L
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ON_DUTY')}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              currentStatus === 'ON_DUTY'
                                ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            OD
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          placeholder="e.g. Uninformed / Late"
                          value={remarks[student.id] || ''}
                          onChange={(e) => setRemarks({ ...remarks, [student.id]: e.target.value })}
                          className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              P = Present · A = Absent · L = Late (&le;10 min) · OD = Approved On-Duty
            </span>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Submit & Save Attendance</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
