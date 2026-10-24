package com.smartcampus.erp.dashboard;

import com.smartcampus.erp.academic.AcademicRepository;
import com.smartcampus.erp.academic.FacultyAssignment;
import com.smartcampus.erp.academic.TimetableEntry;
import com.smartcampus.erp.announcement.Announcement;
import com.smartcampus.erp.announcement.AnnouncementRepository;
import com.smartcampus.erp.attendance.AttendanceService;
import com.smartcampus.erp.attendance.StudentAttendanceSummary;
import com.smartcampus.erp.auth.AuthContext;
import com.smartcampus.erp.common.ApiException;
import com.smartcampus.erp.config.AcademicClock;
import com.smartcampus.erp.enrollment.EnrollmentRepository;
import com.smartcampus.erp.enrollment.StudentEnrollment;
import com.smartcampus.erp.exam.Exam;
import com.smartcampus.erp.exam.ExamRepository;
import com.smartcampus.erp.exam.ExamSubjectView;
import com.smartcampus.erp.exam.SemesterResult;
import com.smartcampus.erp.notification.NotificationService;
import com.smartcampus.erp.user.FacultyProfile;
import com.smartcampus.erp.user.FacultyRepository;
import com.smartcampus.erp.user.StudentProfile;
import com.smartcampus.erp.user.StudentRepository;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final DashboardRepository dashboardRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamRepository examRepository;
    private final AcademicRepository academicRepository;
    private final AnnouncementRepository announcementRepository;
    private final AttendanceService attendanceService;
    private final NotificationService notificationService;
    private final AcademicClock clock;

    public DashboardService(DashboardRepository dashboardRepository,
                            StudentRepository studentRepository,
                            FacultyRepository facultyRepository,
                            EnrollmentRepository enrollmentRepository,
                            ExamRepository examRepository,
                            AcademicRepository academicRepository,
                            AnnouncementRepository announcementRepository,
                            AttendanceService attendanceService,
                            NotificationService notificationService,
                            AcademicClock clock) {
        this.dashboardRepository = dashboardRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.examRepository = examRepository;
        this.academicRepository = academicRepository;
        this.announcementRepository = announcementRepository;
        this.attendanceService = attendanceService;
        this.notificationService = notificationService;
        this.clock = clock;
    }

    public AdminDashboard admin() {
        AuthContext.requireRole("ADMIN");
        DashboardRepository.AdminStats stats = dashboardRepository.adminStats(clock.today());
        long high = 0;
        long medium = 0;
        long low = 0;
        for (StudentProfile student : studentRepository.findAll()) {
            String risk = attendanceService.summary(student.id()).riskLevel();
            if ("HIGH".equals(risk)) {
                high++;
            } else if ("MEDIUM".equals(risk)) {
                medium++;
            } else {
                low++;
            }
        }
        return new AdminDashboard(
                stats.totalStudents(),
                stats.totalFaculty(),
                stats.institutionalAttendance(),
                high,
                medium,
                low,
                stats.pendingAdminCorrections(),
                stats.openComplaints(),
                stats.criticalComplaints(),
                stats.activeExams(),
                stats.activeEnrollments(),
                stats.pendingAdmissions(),
                stats.admittedApplications(),
                stats.rejectedApplications(),
                stats.activeAnnouncements(),
                dashboardRepository.departmentStats());
    }

    public FacultyDashboard faculty() {
        AuthContext.requireRole("FACULTY");
        FacultyProfile faculty = facultyRepository.findByUserId(AuthContext.userId())
                .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
        List<FacultyAssignment> assignments = academicRepository.assignments(faculty.id(), null);
        Set<String> subjects = assignments.stream()
                .map(FacultyAssignment::subjectId)
                .collect(Collectors.toSet());
        Set<String> classes = assignments.stream()
                .map(FacultyAssignment::classGroupId)
                .collect(Collectors.toSet());
        String today = clock.today().getDayOfWeek().name();
        List<TimetableEntry> todayClasses = academicRepository.timetable(faculty.id(), null).stream()
                .filter(entry -> entry.dayOfWeek().equals(today))
                .toList();
        int pendingMarks = pendingMarkEntries(subjects);
        return new FacultyDashboard(
                faculty,
                subjects.size(),
                classes.size(),
                dashboardRepository.facultyPendingCorrections(faculty.id()),
                dashboardRepository.facultyOpenComplaints(faculty.id()),
                pendingMarks,
                todayClasses,
                attendanceService.sessions(null, null, clock.today(), clock.today()).stream()
                        .filter(session -> session.facultyId().equals(faculty.id()))
                        .count());
    }

    public StudentDashboard student() {
        AuthContext.requireRole("STUDENT");
        StudentProfile student = studentRepository.findByUserId(AuthContext.userId())
                .orElseThrow(() -> ApiException.notFound("Student profile not found."));
        StudentAttendanceSummary attendance = attendanceService.summary(student.id());
        StudentEnrollment activeEnrollment = enrollmentRepository
                .enrollments(student.id(), null, null, null).stream()
                .filter(enrollment -> "ACTIVE".equals(enrollment.status()))
                .findFirst()
                .orElseGet(() -> enrollmentRepository.enrollments(student.id(), null, null, null).stream()
                        .findFirst().orElse(null));
        List<SemesterResult> results = examRepository.resultsForStudent(student.id());
        SemesterResult latest = results.isEmpty() ? null : results.get(results.size() - 1);
        String today = clock.today().getDayOfWeek().name();
        List<TimetableEntry> todayClasses = academicRepository.timetable(null, student.classGroupId()).stream()
                .filter(entry -> entry.dayOfWeek().equals(today))
                .toList();
        List<Announcement> announcements = announcementRepository.list(false,
                student.departmentId(), student.courseId(), student.currentSemester(), clock.today());
        return new StudentDashboard(
                student,
                attendance,
                activeEnrollment,
                latest,
                todayClasses,
                dashboardRepository.studentOpenComplaints(AuthContext.userId()),
                dashboardRepository.studentPendingCorrections(student.id()),
                announcements.stream().limit(3).toList(),
                notificationService.unreadCount(AuthContext.userId()));
    }

    private int pendingMarkEntries(Set<String> assignedSubjects) {
        Exam active = examRepository.exams().stream()
                .filter(exam -> !"PUBLISHED".equals(exam.status()))
                .findFirst().orElse(null);
        if (active == null) {
            return 0;
        }
        List<ExamSubjectView> subjects = active.subjects().stream()
                .filter(subject -> assignedSubjects.contains(subject.subjectId()))
                .toList();
        if (subjects.isEmpty()) {
            return 0;
        }
        int studentCount = studentRepository
                .findActiveForTerm(active.semester(), active.academicYear()).size();
        int pending = 0;
        for (ExamSubjectView subject : subjects) {
            pending += Math.max(0, studentCount - examRepository.countMarks(active.id(), subject.subjectId()));
        }
        return pending;
    }
}
