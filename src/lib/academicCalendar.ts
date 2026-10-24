/**
 * Single source of truth for Academic Calendar, current system time, and term definitions.
 * Canonical system date: Tuesday, October 20, 2026
 */

export interface AcademicCalendarConfig {
  currentDate: string; // ISO string '2026-10-20'
  currentDayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  academicYear: string; // '2026-2027'
  academicYearCode: string; // 'AY 2026-27'
  semesterType: 'ODD' | 'EVEN';
  semesterNumber: number; // 5
  termWeek: number; // 11
  termStartDate: string;
  termEndDate: string;
  examRegistrationDeadline: string; // '2026-11-03' (14 days from Oct 20)
  examStartDate: string; // '2026-11-16'
  examEndDate: string; // '2026-11-28'
  resultsPublicationDate: string; // '2026-12-15'
}

export const ACADEMIC_CALENDAR: AcademicCalendarConfig = {
  currentDate: '2026-10-20',
  currentDayOfWeek: 'TUESDAY',
  academicYear: '2026-2027',
  academicYearCode: 'AY 2026-27',
  semesterType: 'ODD',
  semesterNumber: 5,
  termWeek: 11,
  termStartDate: '2026-08-03',
  termEndDate: '2026-11-30',
  examRegistrationDeadline: '2026-11-03',
  examStartDate: '2026-11-16',
  examEndDate: '2026-11-28',
  resultsPublicationDate: '2026-12-15',
};

// Current system date object initialized to Tuesday, Oct 20, 2026 09:30:00
export const getSystemDate = (): Date => {
  return new Date('2026-10-20T09:30:00');
};

export const getCurrentDateString = (): string => {
  return ACADEMIC_CALENDAR.currentDate;
};

export const getAcademicSessionLabel = (): string => {
  return `${ACADEMIC_CALENDAR.academicYearCode} · Odd Semester`;
};

export const getFullAcademicTermLabel = (): string => {
  return `${ACADEMIC_CALENDAR.academicYearCode} · Semester ${ACADEMIC_CALENDAR.semesterNumber} (Odd) · Week ${ACADEMIC_CALENDAR.termWeek}`;
};

export const getDayOfWeekLabel = (dateStr: string = ACADEMIC_CALENDAR.currentDate): string => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export const getFormattedCurrentDate = (): string => {
  const date = getSystemDate();
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const isDateInPast = (dateStr: string): boolean => {
  const target = new Date(`${dateStr}T00:00:00`);
  const current = new Date(`${ACADEMIC_CALENDAR.currentDate}T00:00:00`);
  return target < current;
};

export const getDaysDifference = (targetDateStr: string): number => {
  const target = new Date(`${targetDateStr}T00:00:00`);
  const current = new Date(`${ACADEMIC_CALENDAR.currentDate}T00:00:00`);
  const diffTime = target.getTime() - current.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatSLADueNotice = (dueDateStr: string): { label: string; isOverdue: boolean; daysLeft: number } => {
  const daysLeft = getDaysDifference(dueDateStr);
  const formattedDate = new Date(`${dueDateStr}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (daysLeft < 0) {
    return {
      label: `Due ${formattedDate} (Overdue by ${Math.abs(daysLeft)} days)`,
      isOverdue: true,
      daysLeft,
    };
  } else if (daysLeft === 0) {
    return {
      label: `Due today (${formattedDate})`,
      isOverdue: false,
      daysLeft: 0,
    };
  } else {
    return {
      label: `Due ${formattedDate} (${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left)`,
      isOverdue: false,
      daysLeft,
    };
  }
};
