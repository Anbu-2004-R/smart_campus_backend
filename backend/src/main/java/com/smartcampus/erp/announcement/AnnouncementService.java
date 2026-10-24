package com.smartcampus.erp.announcement;

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
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnnouncementService {
    private final AnnouncementRepository repository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final AcademicClock clock;

    public AnnouncementService(AnnouncementRepository repository,
                               StudentRepository studentRepository,
                               FacultyRepository facultyRepository,
                               UserRepository userRepository,
                               NotificationService notificationService,
                               AuditService auditService,
                               AcademicClock clock) {
        this.repository = repository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.clock = clock;
    }

    public List<Announcement> list() {
        AuthPrincipal principal = AuthContext.require();
        if ("ADMIN".equals(principal.role())) {
            return repository.list(true, null, null, null, clock.today());
        }
        if ("STUDENT".equals(principal.role())) {
            StudentProfile student = studentRepository.findByUserId(principal.userId())
                    .orElseThrow(() -> ApiException.notFound("Student profile not found."));
            return repository.list(false, student.departmentId(), student.courseId(),
                    student.currentSemester(), clock.today());
        }
        FacultyProfile faculty = facultyRepository.findByUserId(principal.userId())
                .orElseThrow(() -> ApiException.notFound("Faculty profile not found."));
        return repository.list(false, faculty.departmentId(), null, null, clock.today());
    }

    @Transactional
    public Announcement publish(AnnouncementCreateRequest request) {
        AuthContext.requireRole("ADMIN");
        validateTargets(request);
        if (request.expiryDate() != null && request.expiryDate().isBefore(clock.today())) {
            throw ApiException.badRequest("The expiry date cannot be in the past.");
        }
        AuthPrincipal principal = AuthContext.require();
        Announcement announcement = new Announcement(
                Ids.newId("anc"),
                request.title(),
                request.content(),
                principal.userId(),
                principal.name(),
                request.scope(),
                "DEPARTMENT".equals(request.scope()) ? request.targetDepartmentId() : null,
                "COURSE".equals(request.scope()) ? request.targetCourseId() : null,
                "SEMESTER".equals(request.scope()) ? request.targetSemester() : null,
                request.priority(),
                clock.now(),
                request.expiryDate());
        repository.insert(announcement);

        String preview = request.content().length() > 120
                ? request.content().substring(0, 120) + "..." : request.content();
        for (User user : userRepository.findAll(null, "ACTIVE", null)) {
            notificationService.notifyUser(user.id(), "New Announcement: " + request.title(),
                    preview, "GENERAL_ANNOUNCEMENT", announcement.id());
        }
        auditService.log("PUBLISH_ANNOUNCEMENT", "ANNOUNCEMENT", announcement.id(),
                "Published " + request.scope() + " announcement: " + request.title() + ".");
        return announcement;
    }

    @Transactional
    public void delete(String id) {
        AuthContext.requireRole("ADMIN");
        Announcement announcement = repository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Announcement not found."));
        repository.delete(id);
        auditService.log("DELETE_ANNOUNCEMENT", "ANNOUNCEMENT", id,
                "Deleted announcement: " + announcement.title() + ".");
    }

    private void validateTargets(AnnouncementCreateRequest request) {
        switch (request.scope()) {
            case "DEPARTMENT" -> {
                if (request.targetDepartmentId() == null || request.targetDepartmentId().isBlank()) {
                    throw ApiException.badRequest("A target department is required for department announcements.");
                }
            }
            case "COURSE" -> {
                if (request.targetCourseId() == null || request.targetCourseId().isBlank()) {
                    throw ApiException.badRequest("A target course is required for course announcements.");
                }
            }
            case "SEMESTER" -> {
                if (request.targetSemester() == null || request.targetSemester() < 1) {
                    throw ApiException.badRequest("A target semester is required for semester announcements.");
                }
            }
            default -> {
            }
        }
    }
}
