export * from '../services/mockData';

export interface TimetablePreviewRow {
  id: string;
  time: string;
  courseCode: string;
  room: string;
  courseName: string;
}

export const PREVIEW_TIMETABLE_TODAY: TimetablePreviewRow[] = [
  {
    id: 'tt-preview-1',
    time: '09:00 – 09:50',
    courseCode: 'CS501',
    room: 'LH-101',
    courseName: 'Operating Systems',
  },
  {
    id: 'tt-preview-2',
    time: '09:55 – 10:45',
    courseCode: 'CS502',
    room: 'LH-101',
    courseName: 'Database Management Systems',
  },
  {
    id: 'tt-preview-3',
    time: '11:00 – 11:50',
    courseCode: 'CS503',
    room: 'LH-101',
    courseName: 'Computer Networks',
  },
];

export const PREVIEW_STUDENT_ATTENDANCE = {
  studentName: 'Ananya Sharma',
  registerNumber: '21CS101',
  attendancePercentage: 89.2,
  label: 'Attendance standing',
};
