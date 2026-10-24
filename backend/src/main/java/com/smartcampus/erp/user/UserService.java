package com.smartcampus.erp.user;

import com.smartcampus.erp.academic.AcademicRepository;
import com.smartcampus.erp.academic.ClassGroup;
import com.smartcampus.erp.academic.Course;
import com.smartcampus.erp.audit.AuditService;
import com.smartcampus.erp.auth.AccountToken;
import com.smartcampus.erp.auth.AccountTokenRepository;
import com.smartcampus.erp.auth.AuthContext;
import com.smartcampus.erp.auth.PasswordHasher;
import com.smartcampus.erp.common.ApiException;
import com.smartcampus.erp.common.Ids;
import com.smartcampus.erp.enrollment.EnrollmentRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final AccountTokenRepository accountTokenRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AcademicRepository academicRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AuditService auditService;

    public UserService(UserRepository userRepository,
                       PasswordHasher passwordHasher,
                       AccountTokenRepository accountTokenRepository,
                       StudentRepository studentRepository,
                       FacultyRepository facultyRepository,
                       AcademicRepository academicRepository,
                       EnrollmentRepository enrollmentRepository,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.accountTokenRepository = accountTokenRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.academicRepository = academicRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.auditService = auditService;
    }

    public List<User> list(String role, String status, String query) {
        return userRepository.findAll(role, status, query);
    }

    @Transactional
    public User setStatus(String userId, String status) {
        UserAccount account = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User account not found."));
        if (account.id().equals(AuthContext.userId()) && "INACTIVE".equals(status)) {
            throw ApiException.badRequest("You cannot deactivate your own signed-in account.");
        }
        if ("ADMIN".equals(account.role()) && "INACTIVE".equals(status)) {
            throw ApiException.badRequest("Administrator accounts cannot be deactivated from this endpoint.");
        }
        userRepository.updateStatus(userId, status);
        auditService.log("TOGGLE_USER_STATUS", "USER_ACCOUNT", userId,
                "Changed account status to " + status + ". Academic records preserved.");
        return User.from(new UserAccount(account.id(), account.loginId(), account.email(),
                account.passwordHash(), account.role(), status, account.createdAt(),
                account.lastLogin(), account.avatarUrl()));
    }

    @Transactional
    public InviteResponse invite(InviteRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("An account already exists with this email address.");
        }
        String loginBase = "STUDENT".equals(request.role())
                ? required(request.registerNumber(), "Register number is required for students.")
                        .trim().toLowerCase(Locale.ROOT)
                : email.substring(0, email.indexOf('@'));
        String candidate = loginBase;
        int suffix = 1;
        while (userRepository.existsByLoginId(candidate)) {
            candidate = loginBase + suffix++;
        }
        if ("STUDENT".equals(request.role())) {
            validateStudentInvite(request);
        } else {
            validateFacultyInvite(request);
        }

        String userId = Ids.newId("usr");
        LocalDateTime now = LocalDateTime.now();
        String temporaryPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        UserAccount account = new UserAccount(
                userId,
                candidate,
                email,
                passwordHasher.hash(temporaryPassword),
                request.role(),
                "PENDING_SETUP",
                now,
                null,
                null);
        userRepository.insert(account);

        String profileId;
        if ("STUDENT".equals(request.role())) {
            profileId = createStudentProfile(userId, email, request);
        } else {
            profileId = createFacultyProfile(userId, email, request);
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = now.plusHours(24);
        accountTokenRepository.insert(new AccountToken(
                Ids.newId("tok"), userId, token, "INVITE", expiresAt, null));

        auditService.log("INVITE_USER", "USER_ACCOUNT", userId,
                "Created " + request.role() + " invitation for " + email
                        + " with profile " + profileId + ".");

        return new InviteResponse(User.from(account), token, expiresAt);
    }

    public User requireById(String id) {
        UserAccount account = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User account not found."));
        return User.from(account);
    }

    private String createStudentProfile(String userId, String email, InviteRequest request) {
        String registerNumber = required(request.registerNumber(), "Register number is required for students.")
                .toUpperCase(Locale.ROOT);
        if (studentRepository.findByRegisterNumber(registerNumber).isPresent()) {
            throw ApiException.conflict("Register number " + registerNumber + " is already in use.");
        }
        String departmentId = required(request.departmentId(), "Department is required for students.");
        Course course = academicRepository.courses().stream()
                .filter(value -> value.id().equals(request.courseId()))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("Select a valid course for the student."));
        if (!course.departmentId().equals(departmentId)) {
            throw ApiException.badRequest("The selected course does not belong to the selected department.");
        }
        if (request.semester() == null) {
            throw ApiException.badRequest("Current semester is required for students.");
        }
        if (request.semester() > course.totalSemesters()) {
            throw ApiException.badRequest("The selected semester exceeds the duration of the course.");
        }
        String academicYear = required(request.academicYear(), "Academic year is required for students.");
        ClassGroup group = academicRepository.classGroupById(request.classGroupId())
                .orElseThrow(() -> ApiException.badRequest("Select a valid class group for the student."));
        if (!group.courseId().equals(course.id())
                || group.semester() != request.semester()
                || !group.academicYear().equals(academicYear)) {
            throw ApiException.badRequest("The class group does not match the selected course, semester, and academic year.");
        }
        String profileId = Ids.newId("stu");
        studentRepository.insert(new StudentProfile(
                profileId,
                userId,
                registerNumber,
                request.name().trim(),
                departmentId,
                course.id(),
                request.semester(),
                academicYear,
                email,
                normalize(request.phone()),
                null,
                null,
                group.id()));
        enrollmentRepository.incrementClassGroup(group.id(), 1);
        return profileId;
    }

    private String createFacultyProfile(String userId, String email, InviteRequest request) {
        String employeeId = required(request.employeeId(), "Employee ID is required for faculty.")
                .toUpperCase(Locale.ROOT);
        if (facultyRepository.existsByEmployeeId(employeeId)) {
            throw ApiException.conflict("Employee ID " + employeeId + " is already in use.");
        }
        String departmentId = required(request.departmentId(), "Department is required for faculty.");
        boolean departmentExists = academicRepository.departments().stream()
                .anyMatch(department -> department.id().equals(departmentId));
        if (!departmentExists) {
            throw ApiException.badRequest("Select a valid department for the faculty member.");
        }
        String designation = required(request.designation(), "Designation is required for faculty.");
        String profileId = Ids.newId("fac");
        facultyRepository.insert(new FacultyProfile(
                profileId,
                userId,
                employeeId,
                request.name().trim(),
                departmentId,
                email,
                normalize(request.phone()),
                designation,
                null));
        return profileId;
    }

    private void validateStudentInvite(InviteRequest request) {
        required(request.registerNumber(), "Register number is required for students.");
        required(request.departmentId(), "Department is required for students.");
        required(request.courseId(), "Course is required for students.");
        required(request.classGroupId(), "Class group is required for students.");
        required(request.academicYear(), "Academic year is required for students.");
        if (request.semester() == null || request.semester() < 1) {
            throw ApiException.badRequest("Current semester is required for students.");
        }
    }

    private void validateFacultyInvite(InviteRequest request) {
        required(request.employeeId(), "Employee ID is required for faculty.");
        required(request.departmentId(), "Department is required for faculty.");
        required(request.designation(), "Designation is required for faculty.");
    }

    private String required(String value, String message) {
        if (value == null || value.isBlank()) {
            throw ApiException.badRequest(message);
        }
        return value.trim();
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
