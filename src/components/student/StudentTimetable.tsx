import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { Clock, Building, Calendar, User, BookOpen } from 'lucide-react';
import { TimetableEntry } from '../../types/erp';
import { getAcademicSessionLabel, ACADEMIC_CALENDAR } from '../../lib/academicCalendar';

export const StudentTimetable: React.FC = () => {
  const { currentStudentProfile } = useAuth();
  const { timetable, subjects, classGroups, classrooms, facultyProfiles, exams } = useERP();

  const classGroupId = currentStudentProfile?.classGroupId || 'cg-cse-5a';
  const mySlots = timetable.filter((t) => t.classGroupId === classGroupId);

  const days: TimetableEntry['dayOfWeek'][] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
  ];
  const periods = [1, 2, 3, 4, 5, 6];

  const periodTimes: Record<number, { start: string; end: string }> = {
    1: { start: '09:00', end: '09:50' },
    2: { start: '09:55', end: '10:45' },
    3: { start: '11:00', end: '11:50' },
    4: { start: '11:55', end: '12:45' },
    5: { start: '01:45', end: '02:35' },
    6: { start: '02:40', end: '03:30' },
  };

  return (
    <div className="space-y-6">
      {/* Header (Canonical Title & Single Heading) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Timetable</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official class schedule for {classGroupId.toUpperCase()} (Semester 5). Maintained by Office of the Registrar.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{getAcademicSessionLabel()}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-3 text-left w-24">Day</th>
                {periods.map((p) => (
                  <th key={p} className="p-3 text-center border-l border-slate-200 min-w-[150px]">
                    <div>Period {p}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">
                      {periodTimes[p].start} – {periodTimes[p].end}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map((day) => (
                <tr key={day} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-3 font-bold text-slate-800 text-[11px] uppercase tracking-wide bg-slate-50/50">
                    {day.substring(0, 3)}
                  </td>
                  {periods.map((p) => {
                    const entry = mySlots.find((t) => t.dayOfWeek === day && t.period === p);

                    if (!entry) {
                      return (
                        <td
                          key={p}
                          className="p-3 border-l border-slate-200/60 text-center text-slate-300 text-[11px]"
                        >
                          -
                        </td>
                      );
                    }

                    const sub = subjects.find((s) => s.id === entry.subjectId);
                    const faculty = facultyProfiles.find((f) => f.id === entry.facultyId);
                    const room = classrooms.find((r) => r.id === entry.classroomId);

                    return (
                      <td key={p} className="p-2 border-l border-slate-200/60">
                        <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-indigo-950">
                          <div className="font-bold text-xs">{sub?.code}</div>
                          <div className="text-[11px] text-slate-700 font-medium truncate">{sub?.name}</div>
                          <div className="mt-1 pt-1 border-t border-indigo-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span className="truncate max-w-[80px]">{faculty?.fullName.split(' ')[1] || 'Faculty'}</span>
                            <span className="font-bold text-indigo-800">{room?.roomNumber}</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Exam Dates Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Upcoming Semester Examination Schedule</h3>
        <p className="text-xs text-slate-500 mb-4">Official dates confirmed by the Controller of Examinations</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-mono text-indigo-700 font-bold">CS501 · Operating Systems</div>
            <div className="font-semibold text-slate-900 mt-1">Monday, Nov 16, 2026 · 09:30 AM – 12:30 PM</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Venue: LH-101 · Max Marks: 100</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-mono text-indigo-700 font-bold">CS502 · Database Systems</div>
            <div className="font-semibold text-slate-900 mt-1">Thursday, Nov 19, 2026 · 09:30 AM – 12:30 PM</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Venue: LH-101 · Max Marks: 100</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-mono text-indigo-700 font-bold">CS503 · Computer Networks</div>
            <div className="font-semibold text-slate-900 mt-1">Monday, Nov 23, 2026 · 09:30 AM – 12:30 PM</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Venue: LH-102 · Max Marks: 100</div>
          </div>
        </div>
      </div>
    </div>
  );
};
