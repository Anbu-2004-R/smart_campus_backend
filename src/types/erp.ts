/**
 * Smart Campus ERP - Unified Data Types
 * Closely mapped to the Java Spring Boot & MySQL relational schema specifications.
 */

export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_SETUP';

export interface User {
  id: string;
  loginId: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  registerNumber: string;
  fullName: string;
  departmentId: string;
  courseId: string;
  currentSemester: number;
  academicYear: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  avatarUrl?: string;
  classGroupId: string;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  departmentId: string;
  email: string;
  phone: string;
  designation: string;
  avatarUrl?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hodName: string;
  facultyCount: number;
  studentCount: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  totalSemesters: number;
  degreeType: 'B.Tech' | 'B.E.' | 'M.Tech' | 'MCA' | 'B.Sc';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  courseId: string;
  semester: number;
  credits: number;
  maxMarks: number;
  passMarks: number;
  type: 'THEORY' | 'PRACTICAL' | 'ELECTIVE';
}

export interface ClassGroup {
  id: string;
  name: string; // e.g., "CSE-3A"
  courseId: string;
  semester: number;
  section: string;
  academicYear: string;
  totalStudents: number;
}

// Enrollment Management Types (Section 7.2 student_enrollments)
export type EnrollmentStatus = 'ACTIVE' | 'PROMOTED' | 'GRADUATED' | 'COMPLETED' | 'WITHDRAWN' | 'SUSPENDED';

export interface StudentEnrollment {
  id: string;
  studentId: string;
  registerNumber: string;
  studentName: string;
  courseId: string;
  courseName: string;
  departmentId: string;
  departmentCode: string;
  academicYear: string; // e.g. "2025-2026"
  semester: number;     // e.g. 5
  classGroupId: string;
  classGroupName: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  creditsRegistered: number;
  remarks?: string;
}

export interface StudentPromotionResult {
  enrollment: StudentEnrollment | null;
  graduated: boolean;
  message: string;
}

export interface StudentPromotionInput {
  targetSemester: number;
  academicYear: string;
  targetClassGroupId: string;
  remarks?: string;
}

export interface UserInviteInput {
  role: 'FACULTY' | 'STUDENT';
  email: string;
  name: string;
  registerNumber?: string;
  employeeId?: string;
  departmentId?: string;
  courseId?: string;
  classGroupId?: string;
  semester?: number;
  academicYear?: string;
  phone?: string;
  designation?: string;
}

export type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface AdmissionApplication {
  id: string;
  applicationNumber: string; // e.g. "APP-2026-1042"
  applicantName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  departmentId: string;
  courseId: string;
  appliedSemester: number;
  academicYear: string;
  previousQualification: string;
  percentageOrGpa: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
  assignedClassGroupId?: string;
  generatedRegisterNumber?: string;
}

export interface AdmissionCreateInput {
  applicantName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  departmentId: string;
  courseId: string;
  appliedSemester: number;
  academicYear: string;
  previousQualification: string;
  percentageOrGpa: string;
}

export interface FacultyAssignment {
  id: string;
  facultyId: string;
  subjectId: string;
  classGroupId: string;
  academicYear: string;
  semester: number;
}

// Attendance Types
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY';

export interface ClassSession {
  id: string;
  assignmentId: string;
  subjectId: string;
  classGroupId: string;
  facultyId: string;
  date: string; // YYYY-MM-DD
  period: number; // 1 to 6
  roomNumber: string;
  topicCovered?: string;
  markedAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export type CorrectionRequestStatus = 'PENDING_FACULTY' | 'PENDING_ADMIN' | 'APPROVED' | 'REJECTED';

export interface AttendanceCorrectionRequest {
  id: string;
  studentId: string;
  sessionId: string;
  subjectId: string;
  sessionDate: string;
  originalStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason: string;
  evidenceNote?: string;
  status: CorrectionRequestStatus;
  isEligibleForFaculty: boolean; // within 7-day window from class session date (Decision D-1)
  submittedAt: string;
  reviewedBy?: string;
  reviewerRole?: 'FACULTY' | 'ADMIN';
  reviewedAt?: string;
  reviewRemarks?: string;
}

export type AttendanceRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StudentAttendanceSummary {
  studentId: string;
  overallPercentage: number;
  totalClasses: number;
  attendedClasses: number;
  riskLevel: AttendanceRiskLevel;
  recentAbsenceCount: number; // last 14 days
  subjectWise: {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    total: number;
    attended: number;
    percentage: number;
    riskLevel: AttendanceRiskLevel;
  }[];
}

// Examination & Marks Types
export type MarksStatus = 'MARKS_ENTERED' | 'ABSENT' | 'MEDICAL_ABSENCE' | 'MALPRACTICE' | 'MARKS_PENDING';

export interface Exam {
  id: string;
  name: string; // e.g. "End Semester Examinations - Autumn 2025"
  code: string;
  academicYear: string;
  semester: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ONGOING' | 'MARKS_PENDING' | 'READY_TO_PUBLISH' | 'PUBLISHED';
  publishedAt?: string;
  publishedBy?: string;
}

export interface ExamSubject {
  id: string;
  examId: string;
  subjectId: string;
  examDate: string;
  maxMarks: number;
  passMarks: number;
}

export interface StudentMark {
  id: string;
  examId: string;
  subjectId: string;
  studentId: string;
  status: MarksStatus;
  marksObtained?: number; // undefined if pending
  grade?: string;
  gradePoint?: number;
  isPassed?: boolean;
  enteredByFacultyId: string;
  lastUpdated: string;
}

export interface MarksCorrection {
  id: string;
  examId: string;
  subjectId: string;
  subjectCode: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  facultyId: string;
  facultyName: string;
  oldMarks?: number;
  newMarks?: number;
  oldStatus: MarksStatus;
  newStatus: MarksStatus;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface MarksCorrectionInput {
  examId: string;
  subjectId: string;
  studentId: string;
  newStatus: Exclude<MarksStatus, 'MARKS_PENDING'>;
  newMarks?: number;
  reason: string;
}

export interface GradeRule {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;
  description: string;
}

export interface SemesterResult {
  studentId: string;
  examId: string;
  semester: number;
  academicYear: string;
  subjectResults: {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    credits: number;
    maxMarks: number;
    marksObtained?: number;
    status: MarksStatus;
    grade?: string;
    gradePoint?: number;
    isPassed: boolean;
  }[];
  totalCredits: number;
  earnedCredits: number;
  semesterGPA: number;
  overallCGPA: number;
  overallResult: 'PASS' | 'ARREAR' | 'WITHHELD' | 'PENDING';
  publishedAt?: string;
}

export interface ArrearRecord {
  id: string;
  studentId: string;
  subjectId: string;
  originalExamId: string;
  originalGrade: string;
  clearedInExamId?: string;
  clearedGrade?: string;
  status: 'UNCLEARED' | 'REGISTERED' | 'CLEARED';
}

// Timetable Types
export interface Classroom {
  id: string;
  roomNumber: string;
  building: string;
  floor: number;
  capacity: number;
  type: 'LECTURE_HALL' | 'LAB' | 'SEMINAR_ROOM';
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  period: number; // 1 to 6
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "09:50"
  classGroupId: string;
  subjectId: string;
  facultyId: string;
  classroomId: string;
}

export interface ExamSchedule {
  id: string;
  examId: string;
  subjectId: string;
  classGroupId: string;
  date: string;
  startTime: string;
  endTime: string;
  classroomId: string;
  invigilatorFacultyId: string;
}

// Complaints Types
export type ComplaintPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ComplaintStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type ComplaintCategory = 'ACADEMIC' | 'INFRASTRUCTURE' | 'HOSTEL' | 'EXAMINATION' | 'ATTENDANCE' | 'GENERAL';

export interface Complaint {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  requestedPriority: ComplaintPriority;
  officialPriority: ComplaintPriority;
  status: ComplaintStatus;
  submittedByUserId: string;
  submitterName: string;
  submitterRole: UserRole;
  submitterEmail: string;
  assignedToFacultyId?: string;
  assignedFacultyName?: string;
  submittedAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  rejectionReason?: string;
  timeline: {
    status: ComplaintStatus;
    timestamp: string;
    changedBy: string;
    notes?: string;
  }[];
}

// Announcements & Notifications
export type AnnouncementScope = 'COLLEGE_WIDE' | 'DEPARTMENT' | 'COURSE' | 'SEMESTER';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  scope: AnnouncementScope;
  targetDepartmentId?: string;
  targetCourseId?: string;
  targetSemester?: number;
  priority: 'NORMAL' | 'URGENT';
  publishedAt: string;
  expiryDate?: string;
}

export type NotificationCategory = 'ATTENDANCE_WARNING' | 'CORRECTION_STATUS' | 'EXAM_UPDATE' | 'RESULT_PUBLISHED' | 'COMPLAINT_UPDATE' | 'GENERAL_ANNOUNCEMENT';

export interface InAppNotification {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

// Audit Logs
export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'ATTENDANCE' | 'MARKS' | 'EXAM' | 'USER_ACCOUNT' | 'TIMETABLE' | 'COMPLAINT' | 'SETTINGS' | 'ENROLLMENT';
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// Attendance Risk Threshold Settings (D-6)
export interface AttendanceRiskSettings {
  highRiskThreshold: number; // e.g. < 75%
  mediumRiskThreshold: number; // e.g. 75% - 80%
  recentAbsenceTrendDays: number; // e.g. 14 days
  warningConsecutiveAbsences: number; // e.g. 3 sessions
}
