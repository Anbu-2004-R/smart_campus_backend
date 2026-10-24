import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Modal } from '../common/Modal';
import {
  CalendarDays,
  Plus,
  Trash2,
  AlertOctagon,
  CheckCircle,
  Building,
  User,
  BookOpen,
  Clock,
} from 'lucide-react';
import { TimetableEntry } from '../../types/erp';

export const TimetableManager: React.FC = () => {
  const {
    timetable,
    classGroups,
    subjects,
    facultyProfiles,
    classrooms,
    saveTimetableEntry,
    deleteTimetableEntry,
    checkTimetableClash,
  } = useERP();

  const [selectedClassGroupId, setSelectedClassGroupId] = useState<string>(classGroups[0]?.id || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [dayOfWeek, setDayOfWeek] = useState<TimetableEntry['dayOfWeek']>('MONDAY');
  const [period, setPeriod] = useState<number>(1);
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [facultyId, setFacultyId] = useState<string>(facultyProfiles[0]?.id || '');
  const [classroomId, setClassroomId] = useState<string>(classrooms[0]?.id || '');

  const [clashError, setClashError] = useState<string | null>(null);

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

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setClashError(null);

    const time = periodTimes[period] || { start: '09:00', end: '09:50' };

    const entryToSave = {
      dayOfWeek,
      period,
      startTime: time.start,
      endTime: time.end,
      classGroupId: selectedClassGroupId,
      subjectId,
      facultyId,
      classroomId,
    };

    const res = saveTimetableEntry(entryToSave);
    if (!res.success) {
      setClashError(res.error || 'Conflict detected');
    } else {
      setIsAddModalOpen(false);
      setClashError(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Institutional Timetable & Classroom Allocation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated conflict engine detects faculty overlaps, room double-bookings, and student group clashes before saving.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClassGroupId}
            onChange={(e) => setSelectedClassGroupId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
          >
            {classGroups.map((cg) => (
              <option key={cg.id} value={cg.id}>
                {cg.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setClashError(null);
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Period Slot</span>
          </button>
        </div>
      </div>

      {/* Timetable Grid View */}
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
                    const entry = timetable.find(
                      (t) =>
                        t.classGroupId === selectedClassGroupId &&
                        t.dayOfWeek === day &&
                        t.period === p
                    );

                    if (!entry) {
                      return (
                        <td
                          key={p}
                          className="p-3 border-l border-slate-200/60 text-center text-slate-300 text-[11px] italic"
                        >
                          Unallocated
                        </td>
                      );
                    }

                    const subject = subjects.find((s) => s.id === entry.subjectId);
                    const faculty = facultyProfiles.find((f) => f.id === entry.facultyId);
                    const room = classrooms.find((r) => r.id === entry.classroomId);

                    return (
                      <td key={p} className="p-2 border-l border-slate-200/60">
                        <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 hover:border-indigo-300 transition-colors relative group">
                          <div className="font-bold text-indigo-950 text-xs truncate">
                            {subject?.code} - {subject?.name}
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{faculty?.fullName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{room?.roomNumber}</span>
                          </div>

                          <button
                            onClick={() => deleteTimetableEntry(entry.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                            title="Remove Slot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
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

      {/* Add Slot Modal with Clash Detection */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Classroom Teaching Period"
        subtitle="Automatic checks prevent overlapping faculty commitments and double-booked rooms."
      >
        <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
          {clashError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Scheduling Conflict Detected</strong>
                <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5">{clashError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                {periods.map((p) => (
                  <option key={p} value={p}>
                    Period {p} ({periodTimes[p].start} - {periodTimes[p].end})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Academic Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.credits} Credits)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Faculty Member</label>
              <select
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                {facultyProfiles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fullName} ({f.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Classroom / Laboratory</label>
              <select
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                {classrooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} ({r.type} · Cap: {r.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Verify Conflict & Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
