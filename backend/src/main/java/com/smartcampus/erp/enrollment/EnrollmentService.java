package com.smartcampus.erp.enrollment;

import com.smartcampus.erp.academic.AcademicRepository;
import com.smartcampus.erp.academic.ClassGroup;
import com.smartcampus.erp.academic.Course;
import com.smartcampus.erp.academic.Subject;
import com.smartcampus.erp.audit.AuditService;
import com.smartcampus.erp.auth.AccountToken;
import com.smartcampus.erp.auth.AccountTokenRepository;
import com.smartcampus.erp.auth.AuthContext;
import com.smartcampus.erp.auth.PasswordHasher;
import com.smartcampus.erp.common.ApiException;
import com.smartcampus.erp.common.Ids;
import com.smartcampus.erp.config.AcademicClock;
import com.smartcampus.erp.user.StudentProfile;
import com.smartcampus.erp.user.StudentRepository;
import com.smartcampus.erp.user.UserAccount;
import com.smartcampus.erp.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final AcademicRepository academicRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AccountTokenRepository accountTokenRepository;
    private final PasswordHasher passwordHasher;
    private final AuditService auditService;
    private final AcademicClock clock;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             AcademicRepository academicRepository,
                             StudentRepository studentRepository,
                             UserRepository userRepository,
                             AccountTokenRepository accountTokenRepository,
                             PasswordHasher passwordHasher,
                             AuditService auditService,
                             AcademicClock clock) {
        this.enrollmentRepository = enrollmentRepository;
        this.academicRepository = academicRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.accountTokenRepository = accountTokenRepository;
        this.passwordHasher = passwordHasher;
        this.auditService = auditService;
        this.clock = clock;
    }

    public List<StudentEnrollment> enrollments(String studentId, String status,
                                               String academicYear, Integer semester) {
        String role = AuthContext.role();
        if ("STUDENT".equals(role)) {
            StudentProfile student = currentStudent();
            return enrollmentRepository.enrollments(student.id(), status, academicYear, semester);
        }
        AuthContext.requireRole("ADMIN");
        return enrollmentRepository.enrollments(studentId, status, academicYear, semester);
    }

    public List<StudentEnrollment> myEnrollments() {
        AuthContext.requireRole("STUDENT");
        return enrollmentRepository.enrollments(currentStudent().id(), null, null, null);
    }

    public List<AdmissionApplication> admissions(String status) {
        AuthContext.requireRole("ADMIN");
        return enrollmentRepository.admissions(status);
    }

    public AdmissionApplication admission(String id) {
        AuthContext.requireRole("ADMIN");
        return enrollmentRepository.admission(id)
                .orElseThrow(() -> ApiException.notFound("Admission application not found."));
    }

    @Transactional
    public AdmissionApplication submitAdmission(AdmissionCreateRequest request) {
        AuthContext.requireRole("ADMIN");
        Course course = academicRepository.courses().stream()
                .filter(value -> value.id().equals(request.courseId()))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("Course not found."));
        if (!course.departmentId().equals(request.departmentId())) {
            throw ApiException.badRequest("The selected course does not belong to the selected department.");
        }
        if (request.appliedSemester() > course.totalSemesters()) {
            throw ApiException.badRequest("The applied semester exceeds the duration of "
                    + course.name() + ".");
        }
        String id = Ids.newId("adm");
        String prefix = "ADM-" + request.academicYear().substring(0, 4) + "-";
        AdmissionApplication application = new AdmissionApplication(
                id,
                enrollmentRepository.nextAdmissionNumber(prefix),
                request.applicantName().trim(),
                request.email().trim().toLowerCase(),
                blankToNull(request.phone()),
                request.dateOfBirth(),
                request.departmentId(),
                null,
                null,
                request.courseId(),
                course.name(),
                request.appliedSemester(),
                request.academicYear(),
                request.previousQualification().trim(),
                request.percentageOrGpa().trim(),
                "SUBMITTED",
                clock.now(),
                null,
                null,
                null,
                null,
                null);
        enrollmentRepository.insertAdmission(application);
        auditService.log("SUBMIT_ADMISSION", "ADMISSION", id,
                "Registered application " + application.applicationNumber() + " for "
                        + application.applicantName() + ".");
        return enrollmentRepository.admission(id).orElse(application);
    }

    @Transactional
    public StudentEnrollment updateEnrollmentStatus(String id, EnrollmentStatusRequest request) {
        AuthContext.requireRole("ADMIN");
        StudentEnrollment enrollment = enrollmentRepository.enrollmentById(id)
                .orElseThrow(() -> ApiException.notFound("Enrollment not found."));
        if (("WITHDRAWN".equals(request.status()) || "SUSPENDED".equals(request.status()))
                && (request.remarks() == null || request.remarks().isBlank())) {
            throw ApiException.badRequest("Remarks are required when withdrawing or suspending an enrollment.");
        }
        String remarks = request.remarks() == null || request.remarks().isBlank()
                ? enrollment.remarks() : request.remarks().trim();
        enrollmentRepository.updateEnrollmentStatus(id, request.status(), remarks);
        auditService.log("UPDATE_ENROLLMENT_STATUS", "ENROLLMENT", id,
                "Changed enrollment " + enrollment.registerNumber() + " (" + enrollment.academicYear()
                        + " semester " + enrollment.semester() + ") to " + request.status() + ".");
        return enrollmentRepository.enrollmentById(id).orElseThrow();
    }

    @Transactional
    public StudentPromotionResult promoteStudent(String studentId, StudentPromotionRequest request) {
        AuthContext.requireRole("ADMIN");
        StudentProfile student = studentRepository.findById(studentId)
                .orElseThrow(() -> ApiException.notFound("Student profile not found."));
        StudentEnrollment current = enrollmentRepository.activeEnrollment(studentId)
                .orElseThrow(() -> ApiException.badRequest("No active enrollment was found for this student."));
        if (request.targetSemester() <= current.semester()) {
            throw ApiException.badRequest("The target semester must be higher than the current semester.");
        }

        Course course = academicRepository.courses().stream()
                .filter(value -> value.id().equals(current.courseId()))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("Course not found."));
        int totalSemesters = course.totalSemesters();
        if (request.targetSemester() > totalSemesters) {
            enrollmentRepository.updateEnrollmentStatus(current.id(), "GRADUATED",
                    request.remarks() == null || request.remarks().isBlank()
                            ? "Completed final semester " + current.semester() + "."
                            : request.remarks().trim());
            auditService.log("GRADUATE_STUDENT", "ENROLLMENT", current.id(),
                    "Graduated " + student.fullName() + " (" + student.registerNumber() + ") after semester "
                            + current.semester() + ".");
            return new StudentPromotionResult(null, true,
                    student.registerNumber() + " graduated after semester " + current.semester() + ".");
        }

        if (request.targetClassGroupId() == null || request.targetClassGroupId().isBlank()) {
            throw ApiException.badRequest("Target class group is required for a semester promotion.");
        }
        ClassGroup group = academicRepository.classGroupById(request.targetClassGroupId())
                .orElseThrow(() -> ApiException.badRequest("Target class group not found."));
        if (!group.courseId().equals(current.courseId())) {
            throw ApiException.badRequest("The target class group does not match the student's course.");
        }
        if (group.semester() != request.targetSemester()) {
            throw ApiException.badRequest("The target class group does not belong to the target semester.");
        }
        if (!group.academicYear().equals(request.academicYear())) {
            throw ApiException.badRequest("The target class group does not belong to the target academic year.");
        }
        if (enrollmentRepository.enrollment(studentId, request.academicYear(),
                request.targetSemester()).isPresent()) {
            throw ApiException.conflict("This student already has an enrollment for the target term.");
        }

        String remarks = request.remarks() == null || request.remarks().isBlank()
                ? "Promoted from semester " + current.semester() + "."
                : request.remarks().trim();
        enrollmentRepository.updateEnrollmentStatus(current.id(), "PROMOTED", remarks);
        StudentEnrollment next = new StudentEnrollment(
                Ids.newId("enr"),
                studentId,
                current.registerNumber(),
                current.studentName(),
                current.courseId(),
                current.courseName(),
                current.departmentId(),
                current.departmentCode(),
                request.academicYear(),
                request.targetSemester(),
                group.id(),
                group.name(),
                clock.today(),
                "ACTIVE",
                registeredCredits(current.courseId(), request.targetSemester()),
                remarks);
        enrollmentRepository.insertEnrollment(next);
        studentRepository.updateProgression(studentId, request.targetSemester(),
                request.academicYear(), group.id());
        enrollmentRepository.incrementClassGroup(group.id(), 1);
        auditService.log("PROMOTE_STUDENT", "ENROLLMENT", next.id(),
                "Promoted " + student.fullName() + " (" + student.registerNumber() + ") to semester "
                        + request.targetSemester() + " in " + group.name() + ".");
        return new StudentPromotionResult(next, false,
                student.registerNumber() + " promoted to semester " + request.targetSemester()
                        + " (" + request.academicYear() + ").");
    }

    @Transactional
    public AdmissionDecisionResponse decide(String id, AdmissionDecisionRequest request) {
        AuthContext.requireRole("ADMIN");
        AdmissionApplication application = admission(id);
        if ("APPROVED".equals(application.status()) || "REJECTED".equals(application.status())) {
            throw ApiException.conflict("This application has already been finalized.");
        }
        if ("REJECTED".equals(request.decision())
                && (request.remarks() == null || request.remarks().isBlank())) {
            throw ApiException.badRequest("Review remarks are required when rejecting an application.");
        }
        LocalDateTime now = clock.now();
        String reviewer = AuthContext.require().name();

        if (!"APPROVED".equals(request.decision())) {
            enrollmentRepository.updateAdmission(id, request.decision(), reviewer, now, request.remarks(),
                    application.assignedClassGroupId(), application.generatedRegisterNumber());
            auditService.log("REVIEW_ADMISSION", "ADMISSION", id,
                    "Marked application " + application.applicationNumber() + " as " + request.decision() + ".");
            return new AdmissionDecisionResponse(admission(id), null);
        }

        ClassGroup group = resolveClassGroup(application, request.assignedClassGroupId());
        String registerNumber = resolveRegisterNumber(application, request.registerNumber());
        String loginId = registerNumber.toLowerCase();
        if (userRepository.existsByLoginIdOrEmail(loginId, application.email())) {
            throw ApiException.conflict("An account already exists with this register number or email address.");
        }

        BigDecimal credits = registeredCredits(application.courseId(), group.semester());
        String userId = Ids.newId("usr");
        String studentId = Ids.newId("stu");
        LocalDateTime createdAt = clock.now();
        userRepository.insert(new UserAccount(
                userId,
                loginId,
                application.email(),
                passwordHasher.hash(UUID.randomUUID().toString()),
                "STUDENT",
                "PENDING_SETUP",
                createdAt,
                null,
                null));
        studentRepository.insert(new StudentProfile(
                studentId,
                userId,
                registerNumber,
                application.applicantName(),
                application.departmentId(),
                application.courseId(),
                group.semester(),
                group.academicYear(),
                application.email(),
                application.phone(),
                application.dateOfBirth(),
                null,
                group.id()));

        enrollmentRepository.insertEnrollment(new StudentEnrollment(
                Ids.newId("enr"),
                studentId,
                registerNumber,
                application.applicantName(),
                application.courseId(),
                application.courseName(),
                application.departmentId(),
                application.departmentCode(),
                group.academicYear(),
                group.semester(),
                group.id(),
                group.name(),
                clock.today(),
                "ACTIVE",
                credits,
                "Admission approved from application " + application.applicationNumber()));
        enrollmentRepository.incrementClassGroup(group.id(), 1);
        enrollmentRepository.updateAdmission(id, "APPROVED", reviewer, now,
                request.remarks(), group.id(), registerNumber);

        String activationToken = UUID.randomUUID().toString().replace("-", "");
        accountTokenRepository.insert(new AccountToken(
                Ids.newId("tok"),
                userId,
                activationToken,
                "ACTIVATION",
                clock.now().plusDays(7),
                null));

        auditService.log("APPROVE_ADMISSION", "ADMISSION", id,
                "Approved " + application.applicantName() + " (" + registerNumber + ") into " + group.name() + ".");
        return new AdmissionDecisionResponse(admission(id), activationToken);
    }

    @Transactional
    public PromotionResult promote(PromotionRequest request) {
        AuthContext.requireRole("ADMIN");
        if (request.fromAcademicYear().equals(request.toAcademicYear())
                && request.fromSemester() == request.toSemester()) {
            throw ApiException.badRequest("The target term must be different from the source term.");
        }
        List<StudentEnrollment> source = enrollmentRepository
                .activeEnrollmentsForTerm(request.fromAcademicYear(), request.fromSemester());
        if (source.isEmpty()) {
            throw ApiException.badRequest("No active enrollments were found for the selected term.");
        }

        Map<String, ClassGroup> targetByCourse = new HashMap<>();
        Map<String, Course> courses = new HashMap<>();
        for (Course course : academicRepository.courses()) {
            courses.put(course.id(), course);
        }

        ClassGroup explicitTarget = null;
        if (request.targetClassGroupId() != null && !request.targetClassGroupId().isBlank()) {
            explicitTarget = academicRepository.classGroupById(request.targetClassGroupId())
                    .orElseThrow(() -> ApiException.badRequest("Target class group not found."));
            if (explicitTarget.semester() != request.toSemester()) {
                throw ApiException.badRequest("The target class group does not belong to the target semester.");
            }
            if (!explicitTarget.academicYear().equals(request.toAcademicYear())) {
                throw ApiException.badRequest("The target class group does not belong to the target academic year.");
            }
        }

        for (StudentEnrollment enrollment : source) {
            if (explicitTarget != null && !explicitTarget.courseId().equals(enrollment.courseId())) {
                throw ApiException.badRequest("The target class group does not match " + enrollment.courseName() + ".");
            }
            if (explicitTarget == null) {
                ClassGroup group = targetByCourse.computeIfAbsent(enrollment.courseId(), courseId ->
                        academicRepository.classGroups(courseId, request.toSemester()).stream()
                                .filter(candidate -> candidate.academicYear().equals(request.toAcademicYear()))
                                .findFirst()
                                .orElseThrow(() -> ApiException.badRequest(
                                        "No class group exists for " + enrollment.courseName()
                                                + " semester " + request.toSemester() + " in "
                                                + request.toAcademicYear() + ". Create one first.")));
                if (group.semester() != request.toSemester()) {
                    throw ApiException.badRequest("Target class group semester mismatch.");
                }
            }
        }

        int promoted = 0;
        int graduated = 0;
        int skipped = 0;
        List<StudentEnrollment> created = new ArrayList<>();
        List<String> messages = new ArrayList<>();
        LocalDateTime now = clock.now();

        for (StudentEnrollment enrollment : source) {
            Course course = courses.get(enrollment.courseId());
            int totalSemesters = course == null ? request.toSemester() : course.totalSemesters();
            if (request.toSemester() > totalSemesters) {
                enrollmentRepository.updateEnrollmentStatus(enrollment.id(), "GRADUATED",
                        "Completed final semester " + request.fromSemester() + ".");
                graduated++;
                messages.add(enrollment.registerNumber() + " graduated.");
                continue;
            }
            if (enrollmentRepository.enrollment(enrollment.studentId(), request.toAcademicYear(),
                    request.toSemester()).isPresent()) {
                skipped++;
                messages.add(enrollment.registerNumber() + " already has an enrollment for the target term.");
                continue;
            }
            ClassGroup group = explicitTarget != null ? explicitTarget
                    : targetByCourse.get(enrollment.courseId());
            BigDecimal credits = registeredCredits(enrollment.courseId(), request.toSemester());
            enrollmentRepository.updateEnrollmentStatus(enrollment.id(), "PROMOTED",
                    "Promoted to semester " + request.toSemester() + " (" + request.toAcademicYear() + ").");
            StudentEnrollment next = new StudentEnrollment(
                    Ids.newId("enr"),
                    enrollment.studentId(),
                    enrollment.registerNumber(),
                    enrollment.studentName(),
                    enrollment.courseId(),
                    enrollment.courseName(),
                    enrollment.departmentId(),
                    enrollment.departmentCode(),
                    request.toAcademicYear(),
                    request.toSemester(),
                    group.id(),
                    group.name(),
                    clock.today(),
                    "ACTIVE",
                    credits,
                    request.remarks() == null || request.remarks().isBlank()
                            ? "Promoted from semester " + request.fromSemester()
                            : request.remarks());
            enrollmentRepository.insertEnrollment(next);
            studentRepository.updateProgression(enrollment.studentId(), request.toSemester(),
                    request.toAcademicYear(), group.id());
            enrollmentRepository.incrementClassGroup(group.id(), 1);
            created.add(next);
            promoted++;
        }
        auditService.log("PROMOTE_STUDENTS", "ENROLLMENT", request.fromAcademicYear() + "-" + request.fromSemester(),
                "Promoted " + promoted + ", graduated " + graduated + ", skipped " + skipped + ".");
        return new PromotionResult(promoted, graduated, skipped, created, messages);
    }

    private ClassGroup resolveClassGroup(AdmissionApplication application, String requestedId) {
        if (requestedId != null && !requestedId.isBlank()) {
            ClassGroup group = academicRepository.classGroupById(requestedId)
                    .orElseThrow(() -> ApiException.badRequest("Assigned class group not found."));
            if (!group.courseId().equals(application.courseId())
                    || group.semester() != application.appliedSemester()) {
                throw ApiException.badRequest("The class group does not match the applied course and semester.");
            }
            return group;
        }
        if (application.assignedClassGroupId() != null) {
            ClassGroup existing = academicRepository.classGroupById(application.assignedClassGroupId()).orElse(null);
            if (existing != null) {
                return existing;
            }
        }
        return academicRepository.classGroups(application.courseId(), application.appliedSemester()).stream()
                .filter(group -> group.academicYear().equals(application.academicYear()))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("No class group exists for "
                        + application.courseName() + " semester " + application.appliedSemester()
                        + " in " + application.academicYear() + ". Create one before approving."));
    }

    private String resolveRegisterNumber(AdmissionApplication application, String requested) {
        if (requested != null && !requested.isBlank()) {
            String value = requested.trim().toUpperCase();
            if (enrollmentRepository.registerNumberExists(value)) {
                throw ApiException.conflict("Register number " + value + " is already in use.");
            }
            return value;
        }
        if (application.generatedRegisterNumber() != null
                && !application.generatedRegisterNumber().isBlank()
                && !enrollmentRepository.registerNumberExists(application.generatedRegisterNumber())) {
            return application.generatedRegisterNumber().toUpperCase();
        }
        String year = application.academicYear().length() >= 2
                ? application.academicYear().substring(0, 2) : "00";
        String department = switch (application.departmentCode().toUpperCase()) {
            case "CSE" -> "CS";
            case "ECE" -> "EC";
            case "MECH" -> "ME";
            case "CIVIL" -> "CV";
            default -> application.departmentCode().toUpperCase().substring(0,
                    Math.min(2, application.departmentCode().length()));
        };
        String prefix = year + department;
        int sequence = enrollmentRepository.nextRegisterSequence(prefix);
        String candidate = prefix + sequence;
        while (enrollmentRepository.registerNumberExists(candidate)) {
            sequence++;
            candidate = prefix + sequence;
        }
        return candidate;
    }

    private BigDecimal registeredCredits(String courseId, int semester) {
        BigDecimal total = BigDecimal.ZERO;
        for (Subject subject : academicRepository.subjects(courseId, semester)) {
            total = total.add(subject.credits());
        }
        return total.setScale(1, RoundingMode.HALF_UP);
    }

    private StudentProfile currentStudent() {
        return studentRepository.findByUserId(AuthContext.userId())
                .orElseThrow(() -> ApiException.notFound("Student profile not found."));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
