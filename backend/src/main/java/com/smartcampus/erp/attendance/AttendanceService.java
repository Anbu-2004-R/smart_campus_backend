package com.smartcampus.erp.attendance;

import com.smartcampus.erp.academic.AcademicRepository;
import com.smartcampus.erp.academic.FacultyAssignment;
import com.smartcampus.erp.audit.AuditService;
import com.smartcampus.erp.auth.AuthContext;
import com.smartcampus.erp.auth.AuthPrincipal;
import com.smartcampus.erp.common.ApiException;
import com.smartcampus.erp.common.Ids;
import com.smartcampus.erp.config.AcademicClock;
import com.smartcampus.erp.notification.NotificationService;
import com.smartcampus.erp.user.FacultyProfile;
import com.smartcampus.erp.user.FacultyRepository;
import com.smartcampus.erp.user.StudentProfile;
import com.smartcampus.erp.user.StudentRepository;
import com.smartcampus.erp.user.User;
import com.smartcampus.erp.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final AcademicRepository academicRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final AcademicClock clock;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             AcademicRepository academicRepository,
                             StudentRepository studentRepository,
                             FacultyRepository facultyRepository,
                             UserRepository userRepository,
                             NotificationService notificationService,
                             AuditService auditService,
                             AcademicClock clock) {
        this.attendanceRepository = attendanceRepository;
        this.academicRepository = academicRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.clock = clock;
    }

    public StudentAttendanceSummary summary(String studentId) {
        AuthPrincipal principal = AuthContext.require();
        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> ApiException.notFound("Student not found."));
        if ("STUDENT".equals(principal.role()) && !student.userId().equals(principal.userId())) {
            throw ApiException.forbidden("You can only view your own attendance.");
        }
        if ("FACULTY".equals(principal.role())) {
            FacultyProfile faculty = facultyRepository.findByUserId(principal.userId())
                    .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
            if (student.classGroupId() == null
                    || academicRepository.assignments(faculty.id(), student.classGroupId()).isEmpty()) {
                throw ApiException.forbidden("You can only view attendance for your assigned classes.");
            }
        }

        RiskSettings settings = attendanceRepository.riskSettings();
        int[] counts = attendanceRepository.overallCounts(student.id());
        double overall = counts[0] > 0 ? round((counts[1] * 100.0) / counts[0]) : 100.0;
        LocalDate since = clock.today().minusDays(settings.recentAbsenceTrendDays());
        int recentAbsences = attendanceRepository.recentAbsences(student.id(), since);
        String risk = riskLevel(overall, recentAbsences, settings);

        List<SubjectAttendance> subjectWise = attendanceRepository
                .subjectStats(student.id(), student.courseId(), student.classGroupId(), student.currentSemester())
                .stream()
                .map(subject -> new SubjectAttendance(
                        subject.subjectId(),
                        subject.subjectCode(),
                        subject.subjectName(),
                        subject.total(),
                        subject.attended(),
                        subject.percentage(),
                        riskLevel(subject.percentage(), 0, settings)))
                .toList();

        return new StudentAttendanceSummary(student.id(), overall, counts[0], counts[1],
                risk, recentAbsences, subjectWise);
    }

    public List<SessionView> sessions(String facultyId, String classGroupId,
                                      LocalDate from, LocalDate to) {
        String role = AuthContext.role();
        if ("STUDENT".equals(role)) {
            StudentProfile student = studentRepository.findByUserId(AuthContext.userId())
                    .orElseThrow(() -> ApiException.notFound("Student profile not found."));
            return attendanceRepository.sessionViews(null, student.classGroupId(), from, to).stream()
                    .map(session -> session.withRecords(session.records().stream()
                            .filter(record -> record.studentId().equals(student.id()))
                            .toList()))
                    .toList();
        }
        if ("FACULTY".equals(role)) {
            FacultyProfile faculty = facultyRepository.findByUserId(AuthContext.userId())
                    .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
            return attendanceRepository.sessionViews(faculty.id(), classGroupId, from, to);
        }
        return attendanceRepository.sessionViews(facultyId, classGroupId, from, to);
    }

    public SessionView session(String id) {
        SessionView session = attendanceRepository.sessionViewById(id)
                .orElseThrow(() -> ApiException.notFound("Class session not found."));
        String role = AuthContext.role();
        if ("STUDENT".equals(role)) {
            StudentProfile student = studentRepository.findByUserId(AuthContext.userId())
                    .orElseThrow(() -> ApiException.notFound("Student profile not found."));
            if (!student.classGroupId().equals(session.classGroupId())) {
                throw ApiException.forbidden("You can only view sessions for your class.");
            }
            return session.withRecords(session.records().stream()
                    .filter(record -> record.studentId().equals(student.id()))
                    .toList());
        }
        if ("FACULTY".equals(role)) {
            FacultyProfile faculty = facultyRepository.findByUserId(AuthContext.userId())
                    .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
            if (!faculty.id().equals(session.facultyId())) {
                throw ApiException.forbidden("You can only view sessions you conducted.");
            }
        }
        return session;
    }

    @Transactional
    public SessionView record(RecordAttendanceRequest request) {
        AuthPrincipal principal = AuthContext.require();
        if (!"FACULTY".equals(principal.role()) && !"ADMIN".equals(principal.role())) {
            throw ApiException.forbidden("Only faculty and administrators can mark attendance.");
        }
        FacultyAssignment assignment = academicRepository.assignmentById(request.assignmentId())
                .orElseThrow(() -> ApiException.badRequest("Faculty assignment not found."));

        if ("FACULTY".equals(principal.role())) {
            FacultyProfile faculty = facultyRepository.findByUserId(principal.userId())
                    .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
            if (!assignment.facultyId().equals(faculty.id())) {
                throw ApiException.forbidden("You can only mark attendance for your own classes.");
            }
        }

        LocalDate today = clock.today();
        if (request.date().isAfter(today)) {
            throw ApiException.badRequest("Attendance cannot be marked for a future date.");
        }
        if (attendanceRepository.sessionFor(assignment.id(), request.date(), request.period()).isPresent()) {
            throw ApiException.conflict("Attendance is already marked for this class, date and period.");
        }

        List<StudentProfile> classStudents = studentRepository.findByClassGroup(assignment.classGroupId());
        if (classStudents.isEmpty()) {
            throw ApiException.badRequest("No students are enrolled in this class group.");
        }
        Map<String, StudentProfile> byId = new LinkedHashMap<>();
        classStudents.forEach(student -> byId.put(student.id(), student));

        Map<String, AttendanceMarkRequest> marks = new LinkedHashMap<>();
        for (AttendanceMarkRequest mark : request.records()) {
            if (!byId.containsKey(mark.studentId())) {
                throw ApiException.badRequest("Student " + mark.studentId() + " is not in this class group.");
            }
            if (marks.putIfAbsent(mark.studentId(), mark) != null) {
                throw ApiException.badRequest("Duplicate attendance entry for student " + mark.studentId() + ".");
            }
        }

        String sessionId = Ids.newId("sess");
        LocalDateTime markedAt = clock.now();
        attendanceRepository.insertSession(new ClassSession(
                sessionId,
                assignment.id(),
                assignment.subjectId(),
                assignment.classGroupId(),
                assignment.facultyId(),
                request.date(),
                request.period(),
                request.roomNumber(),
                request.topicCovered(),
                markedAt));

        for (AttendanceMarkRequest mark : marks.values()) {
            StudentProfile student = byId.get(mark.studentId());
            attendanceRepository.insertRecord(new AttendanceRecord(
                    Ids.newId("att"),
                    sessionId,
                    student.id(),
                    mark.status(),
                    mark.remarks()));
            if ("ABSENT".equals(mark.status())) {
                notificationService.notifyUser(student.userId(), "Absence Recorded",
                        "You were marked absent for " + request.date() + " (Period " + request.period() + ").",
                        "ATTENDANCE", sessionId);
            }
        }

        auditService.log("MARK_ATTENDANCE", "CLASS_SESSION", sessionId,
                "Marked attendance for " + marks.size() + " students on " + request.date()
                        + " (Period " + request.period() + ").");
        return attendanceRepository.sessionViewById(sessionId).orElseThrow();
    }

    @Transactional
    public CorrectionRequest submitCorrection(CorrectionCreateRequest request) {
        AuthContext.requireRole("STUDENT");
        StudentProfile student = studentRepository.findByUserId(AuthContext.userId())
                .orElseThrow(() -> ApiException.notFound("Student profile not found."));
        SessionView session = attendanceRepository.sessionViewById(request.sessionId())
                .orElseThrow(() -> ApiException.notFound("Class session not found."));
        if (!student.classGroupId().equals(session.classGroupId())) {
            throw ApiException.forbidden("You can only request corrections for your own class sessions.");
        }
        LocalDate today = clock.today();
        if (session.date().isAfter(today)) {
            throw ApiException.badRequest("Future sessions cannot be corrected.");
        }
        AttendanceRecord record = attendanceRepository.recordFor(session.id(), student.id())
                .orElseThrow(() -> ApiException.badRequest("No attendance record exists for this session."));
        if (record.status().equals(request.requestedStatus())) {
            throw ApiException.badRequest("The requested status matches the recorded status.");
        }
        if (attendanceRepository.hasPendingCorrection(student.id(), session.id())) {
            throw ApiException.conflict("A correction request for this session is already pending.");
        }

        boolean eligibleForFaculty = !session.date().isBefore(today.minusDays(7));
        String status = eligibleForFaculty ? "PENDING_FACULTY" : "PENDING_ADMIN";
        CorrectionRequest correction = new CorrectionRequest(
                Ids.newId("corr"),
                student.id(),
                student.fullName(),
                student.registerNumber(),
                session.id(),
                session.subjectId(),
                session.subjectCode(),
                session.subjectName(),
                session.date(),
                record.status(),
                request.requestedStatus(),
                request.reason(),
                request.evidenceNote(),
                status,
                eligibleForFaculty,
                clock.now(),
                null,
                null,
                null,
                null);

        attendanceRepository.insertCorrection(correction);

        if (eligibleForFaculty) {
            academicRepository.assignmentFor(session.facultyId(), session.subjectId(), session.classGroupId())
                    .flatMap(assignment -> facultyRepository.findById(assignment.facultyId()))
                    .ifPresentOrElse(
                            faculty -> notificationService.notifyUser(faculty.userId(),
                                    "Attendance Correction Request",
                                    student.fullName() + " requested a correction for " + session.subjectCode()
                                            + " on " + session.date() + ".",
                                    "ATTENDANCE_CORRECTION", correction.id()),
                            () -> notifyAdmins("Attendance Correction Request",
                                    student.fullName() + " requested a correction for " + session.subjectCode()
                                            + " on " + session.date() + ".", correction.id()));
        } else {
            notifyAdmins("Late Attendance Correction Request",
                    student.fullName() + " requested a correction outside the 7-day faculty window for "
                            + session.subjectCode() + " on " + session.date() + ".",
                    correction.id());
        }

        auditService.log("REQUEST_ATTENDANCE_CORRECTION", "ATTENDANCE_CORRECTION", correction.id(),
                "Requested " + request.requestedStatus() + " for session " + session.id()
                        + " (routed to " + status.replace("PENDING_", "") + ").");
        return attendanceRepository.correctionById(correction.id()).orElse(correction);
    }

    public List<CorrectionRequest> corrections(String status) {
        AuthPrincipal principal = AuthContext.require();
        return attendanceRepository.corrections(principal.role(), principal.userId(), status);
    }

    @Transactional
    public CorrectionRequest review(String id, CorrectionReviewRequest request) {
        AuthPrincipal principal = AuthContext.require();
        if (!"FACULTY".equals(principal.role()) && !"ADMIN".equals(principal.role())) {
            throw ApiException.forbidden("Only faculty and administrators can review corrections.");
        }
        CorrectionRequest correction = attendanceRepository.correctionById(id)
                .orElseThrow(() -> ApiException.notFound("Correction request not found."));
        if (!"PENDING_FACULTY".equals(correction.status()) && !"PENDING_ADMIN".equals(correction.status())) {
            throw ApiException.conflict("This correction request has already been reviewed.");
        }
        if ("REJECTED".equals(request.decision())
                && (request.remarks() == null || request.remarks().isBlank())) {
            throw ApiException.badRequest("Review remarks are required when rejecting a request.");
        }
        if ("FACULTY".equals(principal.role())) {
            FacultyProfile faculty = facultyRepository.findByUserId(principal.userId())
                    .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
            if (!"PENDING_FACULTY".equals(correction.status())) {
                throw ApiException.forbidden("This request is outside the 7-day window and must be reviewed by an administrator.");
            }
            ClassSession session = attendanceRepository.sessionById(correction.sessionId())
                    .orElseThrow(() -> ApiException.notFound("Class session not found."));
            if (!academicRepository.existsAssignment(faculty.id(), correction.subjectId(), session.classGroupId())) {
                throw ApiException.forbidden("You can only review corrections for your assigned classes.");
            }
        }

        attendanceRepository.reviewCorrection(correction.id(), request.decision(), principal.userId(),
                principal.role(), clock.now(), request.remarks());
        if ("APPROVED".equals(request.decision())) {
            attendanceRepository.updateRecordStatus(correction.sessionId(), correction.studentId(),
                    correction.requestedStatus(), request.remarks());
        }

        studentRepository.findById(correction.studentId()).ifPresent(student ->
                notificationService.notifyUser(student.userId(),
                        "Attendance Correction " + request.decision(),
                        "Your correction request for " + correction.subjectCode() + " on "
                                + correction.sessionDate() + " was " + request.decision().toLowerCase() + ".",
                        "ATTENDANCE_CORRECTION", correction.id()));

        auditService.log("REVIEW_ATTENDANCE_CORRECTION", "ATTENDANCE_CORRECTION", correction.id(),
                request.decision() + " correction request for " + correction.studentName() + ".");
        return attendanceRepository.correctionById(correction.id()).orElseThrow();
    }

    public RiskSettings riskSettings() {
        return attendanceRepository.riskSettings();
    }

    @Transactional
    public RiskSettings updateRiskSettings(RiskSettingsRequest request) {
        AuthContext.requireRole("ADMIN");
        BigDecimal high = request.highRiskThreshold().setScale(2, RoundingMode.HALF_UP);
        BigDecimal medium = request.mediumRiskThreshold().setScale(2, RoundingMode.HALF_UP);
        if (high.compareTo(medium) >= 0) {
            throw ApiException.badRequest("The high risk threshold must be lower than the medium risk threshold.");
        }
        RiskSettings settings = new RiskSettings("default", high, medium,
                request.recentAbsenceTrendDays(), request.warningConsecutiveAbsences());
        attendanceRepository.updateRiskSettings(settings);
        auditService.log("UPDATE_RISK_SETTINGS", "ATTENDANCE_RISK_SETTINGS", "default",
                "Updated attendance risk thresholds and trend window.");
        return attendanceRepository.riskSettings();
    }

    private void notifyAdmins(String title, String message, String referenceId) {
        for (User admin : userRepository.findAll("ADMIN", "ACTIVE", null)) {
            notificationService.notifyUser(admin.id(), title, message, "ATTENDANCE_CORRECTION", referenceId);
        }
    }

    private String riskLevel(double percentage, int recentAbsences, RiskSettings settings) {
        if (percentage < settings.highRiskThreshold().doubleValue()
                || recentAbsences >= settings.warningConsecutiveAbsences()) {
            return "HIGH";
        }
        if (percentage < settings.mediumRiskThreshold().doubleValue() || recentAbsences >= 2) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
