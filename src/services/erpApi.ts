import {
  Announcement,
  ArrearRecord,
  AttendanceCorrectionRequest,
  AttendanceRecord,
  AttendanceRiskSettings,
  AuditLog,
  ClassGroup,
  ClassSession,
  Classroom,
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  Course,
  Department,
  Exam,
  FacultyAssignment,
  FacultyProfile,
  GradeRule,
  InAppNotification,
  MarksCorrection,
  MarksCorrectionInput,
  NotificationCategory,
  SemesterResult,
  StudentEnrollment,
  StudentMark,
  StudentProfile,
  StudentPromotionInput,
  StudentPromotionResult,
  Subject,
  TimetableEntry,
  User,
  UserInviteInput,
  AdmissionApplication,
  AdmissionCreateInput,
} from '../types/erp';
import { apiRequest, AuthSession } from './api';

export interface ErpSnapshot {
  users: User[];
  studentProfiles: StudentProfile[];
  facultyProfiles: FacultyProfile[];
  departments: Department[];
  courses: Course[];
  classGroups: ClassGroup[];
  subjects: Subject[];
  facultyAssignments: FacultyAssignment[];
  classrooms: Classroom[];
  timetable: TimetableEntry[];
  classSessions: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  correctionRequests: AttendanceCorrectionRequest[];
  riskSettings: AttendanceRiskSettings;
  exams: Exam[];
  studentMarks: StudentMark[];
  gradeRules: GradeRule[];
  marksCorrections: MarksCorrection[];
  semesterResults: SemesterResult[];
  arrearRecords: ArrearRecord[];
  complaints: Complaint[];
  announcements: Announcement[];
  notifications: InAppNotification[];
  auditLogs: AuditLog[];
  enrollments: StudentEnrollment[];
  admissionApplications: AdmissionApplication[];
}

export interface AdmissionDecisionResponse {
  application: AdmissionApplication;
  activationToken?: string;
}

export interface InviteResponse {
  user: User;
  activationToken: string;
  expiresAt: string;
}

type ApiSession = ClassSession & { records?: ApiAttendanceRecord[] };

interface ApiAttendanceRecord {
  id: string;
  studentId: string;
  status: AttendanceRecord['status'];
  remarks?: string;
}

interface ApiMark extends Omit<StudentMark, 'isPassed'> {
  passed?: boolean;
}

interface ApiResultSubject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  maxMarks: number;
  marksObtained?: number;
  status: StudentMark['status'];
  grade?: string;
  gradePoint?: number;
  passed?: boolean;
}

interface ApiResult {
  studentId: string;
  examId: string;
  semester: number;
  academicYear: string;
  subjects: ApiResultSubject[];
  totalCredits: number;
  earnedCredits: number;
  semesterGpa: number;
  overallCgpa: number;
  overallResult: SemesterResult['overallResult'];
  publishedAt?: string;
}

interface ApiCorrection extends Omit<AttendanceCorrectionRequest, 'isEligibleForFaculty'> {
  eligibleForFaculty: boolean;
}

interface ApiNotification extends Omit<InAppNotification, 'isRead'> {
  read: boolean;
}

interface ApiComplaint extends Omit<Complaint, 'category' | 'requestedPriority' | 'officialPriority'> {
  category: string;
  requestedPriority: string;
  officialPriority: string;
}

const COMPLAINT_CATEGORY: Record<string, ComplaintCategory> = {
  ACADEMIC: 'ACADEMIC',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  HOSTEL: 'HOSTEL',
  EXAMINATION: 'EXAMINATION',
  ATTENDANCE: 'ATTENDANCE',
  GENERAL: 'GENERAL',
  OTHER: 'GENERAL',
  TRANSPORT: 'GENERAL',
};

const COMPLAINT_PRIORITY: Record<string, ComplaintPriority> = {
  CRITICAL: 'CRITICAL',
  URGENT: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

const NOTIFICATION_CATEGORY: Record<string, NotificationCategory> = {
  ATTENDANCE: 'ATTENDANCE_WARNING',
  ATTENDANCE_WARNING: 'ATTENDANCE_WARNING',
  CORRECTION_STATUS: 'CORRECTION_STATUS',
  ATTENDANCE_CORRECTION: 'CORRECTION_STATUS',
  MARKS_CORRECTION: 'CORRECTION_STATUS',
  EXAM_UPDATE: 'EXAM_UPDATE',
  RESULT_PUBLISHED: 'RESULT_PUBLISHED',
  COMPLAINT_UPDATE: 'COMPLAINT_UPDATE',
  GENERAL_ANNOUNCEMENT: 'GENERAL_ANNOUNCEMENT',
};

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function mapMark(mark: ApiMark): StudentMark {
  return {
    id: mark.id,
    examId: mark.examId,
    subjectId: mark.subjectId,
    studentId: mark.studentId,
    status: mark.status,
    marksObtained: mark.marksObtained,
    grade: mark.grade,
    gradePoint: mark.gradePoint,
    isPassed: mark.passed ?? false,
    enteredByFacultyId: mark.enteredByFacultyId,
    lastUpdated: mark.lastUpdated,
  };
}

function mapResult(result: ApiResult): SemesterResult {
  return {
    studentId: result.studentId,
    examId: result.examId,
    semester: result.semester,
    academicYear: result.academicYear,
    subjectResults: result.subjects.map((subject) => ({
      subjectId: subject.subjectId,
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      credits: subject.credits,
      maxMarks: subject.maxMarks,
      marksObtained: subject.marksObtained,
      status: subject.status,
      grade: subject.grade,
      gradePoint: subject.gradePoint,
      isPassed: subject.passed ?? false,
    })),
    totalCredits: result.totalCredits,
    earnedCredits: result.earnedCredits,
    semesterGPA: result.semesterGpa,
    overallCGPA: result.overallCgpa,
    overallResult: result.overallResult,
    publishedAt: result.publishedAt,
  };
}

async function read<T>(path: string, fallback: T, optional = false): Promise<T> {
  try {
    const value = await apiRequest<T>(path);
    return value ?? fallback;
  } catch (error) {
    if (optional) {
      console.warn(`Optional backend request failed: ${path}`, error);
      return fallback;
    }
    throw new ErpSnapshotRequestError(path, error);
  }
}

export class ErpSnapshotRequestError extends Error {
  readonly path: string;
  readonly status?: number;

  constructor(path: string, cause: unknown) {
    const detail =
      cause instanceof Error ? cause.message : 'The campus server returned an unexpected response.';
    super(`Failed to load ${path}: ${detail}`);
    this.name = 'ErpSnapshotRequestError';
    this.path = path;
    if (typeof cause === 'object' && cause !== null && 'status' in cause) {
      const status = (cause as { status?: unknown }).status;
      if (typeof status === 'number') this.status = status;
    }
  }
}

export async function loadErpSnapshot(session: AuthSession): Promise<ErpSnapshot> {
  const role = session.user.role;
  const isAdmin = role === 'ADMIN';
  const isStudent = role === 'STUDENT';

  const [
    departments,
    courses,
    subjects,
    classGroups,
    classrooms,
    facultyAssignments,
    timetable,
    facultyProfiles,
    studentProfiles,
    users,
    sessions,
    corrections,
    riskSettings,
    exams,
    gradeRules,
    marksCorrections,
    complaints,
    announcements,
    notifications,
    results,
    arrears,
    enrollments,
    admissions,
    auditLogs,
  ] = await Promise.all([
    read<Department[]>('/departments', []),
    read<Course[]>('/courses', []),
    read<Subject[]>('/subjects', []),
    read<ClassGroup[]>('/class-groups', []),
    read<Classroom[]>('/classrooms', []),
    read<FacultyAssignment[]>('/faculty-assignments', []),
    read<TimetableEntry[]>('/timetable', []),
    read<FacultyProfile[]>('/faculty', []),
    isStudent
      ? Promise.resolve(session.studentProfile ? [session.studentProfile] : [])
      : read<StudentProfile[]>('/students', []),
    isAdmin ? read<User[]>('/users', []) : Promise.resolve([]),
    read<ApiSession[]>('/attendance/sessions', []),
    read<ApiCorrection[]>('/attendance/corrections', []),
    read<AttendanceRiskSettings>('/attendance/risk-settings', {
      highRiskThreshold: 75,
      mediumRiskThreshold: 80,
      recentAbsenceTrendDays: 14,
      warningConsecutiveAbsences: 3,
    }),
    read<Exam[]>('/exams', []),
    read<GradeRule[]>('/grade-rules', []),
    isAdmin || role === 'FACULTY'
      ? read<MarksCorrection[]>('/marks-corrections', [])
      : Promise.resolve([]),
    read<ApiComplaint[]>('/complaints', []),
    read<Announcement[]>('/announcements', []),
    read<ApiNotification[]>('/notifications', []),
    isAdmin
      ? read<ApiResult[]>('/results', [])
      : isStudent
      ? read<ApiResult[] | ApiResult>('/results/me', [])
      : Promise.resolve([]),
    isAdmin ? read<ArrearRecord[] | ArrearRecord>('/arrears', []) : isStudent ? read<ArrearRecord[] | ArrearRecord>('/arrears/me', []) : Promise.resolve([]),
    isAdmin
      ? read<StudentEnrollment[]>('/enrollments', [])
      : isStudent
      ? read<StudentEnrollment[]>('/enrollments/me', [])
      : Promise.resolve([]),
    isAdmin ? read<AdmissionApplication[]>('/admissions', []) : Promise.resolve([]),
    isAdmin ? read<AuditLog[]>('/audit-logs', []) : Promise.resolve([]),
  ]);

  const facultySubjectIds = new Set(
    role === 'FACULTY'
      ? facultyAssignments
          .filter((assignment) => assignment.facultyId === session.facultyProfile?.id)
          .map((assignment) => assignment.subjectId)
      : []
  );
  const markRequests = isStudent
    ? []
    : exams.flatMap((exam) =>
        ((exam as Exam & { subjects?: { subjectId: string }[] }).subjects || [])
          .filter((subject) => role !== 'FACULTY' || facultySubjectIds.has(subject.subjectId))
          .map((subject) =>
            read<ApiMark[]>(`/exams/${exam.id}/subjects/${subject.subjectId}/marks`, [])
          )
      );
  const studentMarks = (await Promise.all(markRequests)).flat().map(mapMark);

  const classSessions: ClassSession[] = sessions.map(({ records: _records, ...sessionView }) => sessionView);
  const attendanceRecords: AttendanceRecord[] = sessions.flatMap((session) =>
    (session.records || []).map((record) => ({
      id: record.id,
      sessionId: session.id,
      studentId: record.studentId,
      status: record.status,
      remarks: record.remarks,
    }))
  );

  return {
    users,
    studentProfiles,
    facultyProfiles,
    departments,
    courses,
    classGroups,
    subjects,
    facultyAssignments,
    classrooms,
    timetable,
    classSessions,
    attendanceRecords,
    correctionRequests: corrections.map((correction) => ({
      ...correction,
      isEligibleForFaculty: correction.eligibleForFaculty,
    })),
    riskSettings,
    exams,
    studentMarks,
    gradeRules,
    marksCorrections,
    semesterResults: asArray(results).map(mapResult),
    arrearRecords: asArray(arrears),
    complaints: complaints.map((complaint) => ({
      ...complaint,
      category: COMPLAINT_CATEGORY[complaint.category] || 'GENERAL',
      requestedPriority: COMPLAINT_PRIORITY[complaint.requestedPriority] || 'MEDIUM',
      officialPriority: COMPLAINT_PRIORITY[complaint.officialPriority] || 'MEDIUM',
    })),
    announcements,
    notifications: notifications.map((notification) => ({
      id: notification.id,
      recipientUserId: notification.recipientUserId,
      title: notification.title,
      message: notification.message,
      category: NOTIFICATION_CATEGORY[notification.category] || 'GENERAL_ANNOUNCEMENT',
      referenceId: notification.referenceId,
      isRead: notification.read,
      createdAt: notification.createdAt,
    })),
    auditLogs,
    enrollments,
    admissionApplications: admissions,
  };
}

function toBackendPriority(priority: ComplaintPriority): string {
  return priority === 'CRITICAL' ? 'URGENT' : priority;
}

function toBackendCategory(category: ComplaintCategory): string {
  return category === 'GENERAL' ? 'OTHER' : category;
}

export const erpApi = {
  recordAttendance: (
    session: Omit<ClassSession, 'id' | 'markedAt'>,
    records: { studentId: string; status: AttendanceRecord['status']; remarks?: string }[]
  ) =>
    apiRequest<{ id: string }>('/attendance/sessions', {
      method: 'POST',
      body: {
        assignmentId: session.assignmentId,
        date: session.date,
        period: session.period,
        roomNumber: session.roomNumber,
        topicCovered: session.topicCovered,
        records,
      },
    }),

  submitCorrection: (input: {
    sessionId: string;
    requestedStatus: AttendanceRecord['status'];
    reason: string;
    evidenceNote?: string;
  }) =>
    apiRequest<{ id: string }>('/attendance/corrections', {
      method: 'POST',
      body: input,
    }),

  reviewCorrection: (id: string, decision: 'APPROVED' | 'REJECTED', remarks: string) =>
    apiRequest(`/attendance/corrections/${id}/review`, {
      method: 'PATCH',
      body: { decision, remarks },
    }),

  submitMarksCorrection: (input: MarksCorrectionInput) =>
    apiRequest<MarksCorrection>('/marks-corrections', {
      method: 'POST',
      body: input,
    }),

  reviewMarksCorrection: (
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    notes?: string
  ) =>
    apiRequest<MarksCorrection>(`/marks-corrections/${id}/review`, {
      method: 'PATCH',
      body: { decision, notes },
    }),

  saveMark: (
    mark: StudentMark,
    marksObtained: number | undefined,
    status: StudentMark['status']
  ) =>
    apiRequest('/exams/marks', {
      method: 'POST',
      body: {
        examId: mark.examId,
        subjectId: mark.subjectId,
        marks: [{ studentId: mark.studentId, status, marksObtained }],
      },
    }),

  publishExam: (examId: string) =>
    apiRequest(`/exams/${examId}/publish`, { method: 'POST' }),

  saveTimetable: (entry: Omit<TimetableEntry, 'id'> & { id?: string }) =>
    entry.id
      ? apiRequest<TimetableEntry>(`/timetable/${entry.id}`, { method: 'PUT', body: entry })
      : apiRequest<TimetableEntry>('/timetable', { method: 'POST', body: entry }),

  deleteTimetable: (id: string) => apiRequest(`/timetable/${id}`, { method: 'DELETE' }),

  submitComplaint: (complaint: Pick<Complaint, 'title' | 'description' | 'category' | 'requestedPriority'>) =>
    apiRequest<{ id: string; ticketNumber: string }>('/complaints', {
      method: 'POST',
      body: {
        title: complaint.title,
        description: complaint.description,
        category: toBackendCategory(complaint.category),
        requestedPriority: toBackendPriority(complaint.requestedPriority),
      },
    }),

  updateComplaintStatus: (id: string, status: Complaint['status'], notes?: string, rejectionReason?: string) =>
    apiRequest(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: { status, notes, rejectionReason },
    }),

  updateComplaintPriority: (id: string, priority: ComplaintPriority, notes?: string) =>
    apiRequest(`/complaints/${id}/priority`, {
      method: 'PATCH',
      body: { priority: toBackendPriority(priority), notes },
    }),

  assignComplaint: (id: string, facultyId: string, notes?: string) =>
    apiRequest(`/complaints/${id}/assign`, {
      method: 'PATCH',
      body: { facultyId, notes },
    }),

  setUserStatus: (id: string, status: User['status']) =>
    apiRequest(`/users/${id}/status`, { method: 'PATCH', body: { status } }),

  inviteUser: (input: UserInviteInput) =>
    apiRequest<InviteResponse>('/users/invite', {
      method: 'POST',
      body: input,
    }),

  publishAnnouncement: (announcement: Omit<Announcement, 'id' | 'publishedAt'>) =>
    apiRequest('/announcements', {
      method: 'POST',
      body: {
        title: announcement.title,
        content: announcement.content,
        scope: announcement.scope,
        targetDepartmentId: announcement.targetDepartmentId,
        targetCourseId: announcement.targetCourseId,
        targetSemester: announcement.targetSemester,
        priority: announcement.priority,
        expiryDate: announcement.expiryDate,
      },
    }),

  deleteAnnouncement: (id: string) =>
    apiRequest<void>(`/announcements/${id}`, { method: 'DELETE' }),

  markNotificationRead: (id: string) =>
    apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    apiRequest('/notifications/read-all', { method: 'PATCH' }),

  updateRiskSettings: (settings: AttendanceRiskSettings) =>
    apiRequest('/attendance/risk-settings', { method: 'PUT', body: settings }),

  reviewAdmission: (
    id: string,
    decision: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW',
    assignedClassGroupId?: string,
    registerNumber?: string,
    remarks?: string
  ) =>
    apiRequest<AdmissionDecisionResponse>(`/admissions/${id}/decision`, {
      method: 'POST',
      body: { decision, assignedClassGroupId, registerNumber, remarks },
    }),

  submitAdmission: (application: AdmissionCreateInput) =>
    apiRequest<AdmissionApplication>('/admissions', {
      method: 'POST',
      body: application,
    }),

  updateEnrollmentStatus: (id: string, status: StudentEnrollment['status'], remarks?: string) =>
    apiRequest<StudentEnrollment>(`/enrollments/${id}/status`, {
      method: 'PATCH',
      body: { status, remarks },
    }),

  promoteStudent: (studentId: string, input: StudentPromotionInput) =>
    apiRequest<StudentPromotionResult>(`/enrollments/students/${studentId}/promote`, {
      method: 'POST',
      body: input,
    }),
};
