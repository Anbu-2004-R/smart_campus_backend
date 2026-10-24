package com.smartcampus.erp.complaint;

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
import com.smartcampus.erp.user.UserAccount;
import com.smartcampus.erp.user.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ComplaintService {
    private final ComplaintRepository repository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final AcademicClock clock;

    public ComplaintService(ComplaintRepository repository,
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

    public List<Complaint> list(String status, String category, String priority) {
        AuthPrincipal principal = AuthContext.require();
        return repository.list(principal.role(), principal.userId(), status, category, priority);
    }

    public Complaint get(String id) {
        AuthPrincipal principal = AuthContext.require();
        Complaint complaint = repository.complaint(id)
                .orElseThrow(() -> ApiException.notFound("Complaint not found."));
        if ("STUDENT".equals(principal.role())
                && !complaint.submittedByUserId().equals(principal.userId())) {
            throw ApiException.forbidden("You can only view your own complaints.");
        }
        if ("FACULTY".equals(principal.role())) {
            FacultyProfile faculty = facultyRepository.findByUserId(principal.userId()).orElse(null);
            boolean isSubmitter = complaint.submittedByUserId().equals(principal.userId());
            boolean isAssignee = faculty != null && faculty.id().equals(complaint.assignedToFacultyId());
            if (!isSubmitter && !isAssignee) {
                throw ApiException.forbidden("You can only view complaints assigned to you or filed by you.");
            }
        }
        return complaint;
    }

    @Transactional
    public Complaint submit(ComplaintCreateRequest request) {
        AuthPrincipal principal = AuthContext.require();
        String email = switch (principal.role()) {
            case "STUDENT" -> studentRepository.findByUserId(principal.userId())
                    .map(StudentProfile::email).orElse(principal.loginId());
            case "FACULTY" -> facultyRepository.findByUserId(principal.userId())
                    .map(FacultyProfile::email).orElse(principal.loginId());
            default -> userRepository.findById(principal.userId())
                    .map(UserAccount::email).orElse(principal.loginId());
        };
        LocalDateTime now = clock.now();
        String prefix = "CMP-" + clock.today().getYear() + "-";
        Complaint complaint = new Complaint(
                Ids.newId("cmp"),
                repository.nextTicketNumber(prefix),
                request.title(),
                request.description(),
                request.category(),
                request.requestedPriority(),
                request.requestedPriority(),
                "SUBMITTED",
                principal.userId(),
                principal.name(),
                principal.role(),
                email,
                null,
                null,
                now,
                now,
                null,
                null,
                List.of());
        repository.insert(complaint);
        repository.insertTimeline(new ComplaintTimeline(
                Ids.newId("ctl"), complaint.id(), "SUBMITTED", now,
                principal.name(), "Complaint registered in system."));
        notificationService.notifyUser(principal.userId(), "Complaint Registered Successfully",
                "Your ticket " + complaint.ticketNumber() + " (" + complaint.category()
                        + ") has been submitted for administrative review.",
                "COMPLAINT_UPDATE", complaint.id());
        auditService.log("SUBMIT_COMPLAINT", "COMPLAINT", complaint.id(),
                "Filed complaint " + complaint.ticketNumber() + " with priority "
                        + complaint.requestedPriority() + ".");
        return repository.complaint(complaint.id()).orElseThrow();
    }

    @Transactional
    public Complaint updateStatus(String id, ComplaintStatusRequest request) {
        AuthPrincipal principal = AuthContext.require();
        Complaint complaint = repository.complaint(id)
                .orElseThrow(() -> ApiException.notFound("Complaint not found."));
        if ("FACULTY".equals(principal.role())) {
            FacultyProfile faculty = facultyRepository.findByUserId(principal.userId())
                    .orElseThrow(() -> ApiException.forbidden("Faculty profile not found."));
            if (!faculty.id().equals(complaint.assignedToFacultyId())) {
                throw ApiException.forbidden("You can only update complaints assigned to you.");
            }
            if (!List.of("UNDER_REVIEW", "IN_PROGRESS", "RESOLVED").contains(request.status())) {
                throw ApiException.forbidden("Faculty can only move assigned tickets to UNDER_REVIEW, IN_PROGRESS or RESOLVED.");
            }
        } else {
            AuthContext.requireRole("ADMIN");
        }
        if ("REJECTED".equals(request.status())
                && (request.rejectionReason() == null || request.rejectionReason().isBlank())) {
            throw ApiException.badRequest("A rejection reason is required when rejecting a complaint.");
        }
        if ("RESOLVED".equals(request.status())
                && (request.notes() == null || request.notes().isBlank())) {
            throw ApiException.badRequest("Resolution notes are required when resolving a complaint.");
        }
        LocalDateTime now = clock.now();
        String resolutionNotes = "RESOLVED".equals(request.status())
                ? request.notes() : complaint.resolutionNotes();
        String rejectionReason = "REJECTED".equals(request.status())
                ? request.rejectionReason() : complaint.rejectionReason();
        repository.updateStatus(id, request.status(), resolutionNotes, rejectionReason, now);
        repository.insertTimeline(new ComplaintTimeline(
                Ids.newId("ctl"), id, request.status(), now, AuthContext.require().name(),
                "REJECTED".equals(request.status()) ? request.rejectionReason() : request.notes()));
        notificationService.notifyUser(complaint.submittedByUserId(),
                "Complaint " + complaint.ticketNumber() + " Updated: " + request.status().replace('_', ' '),
                "REJECTED".equals(request.status())
                        ? "Reason: " + request.rejectionReason()
                        : (request.notes() == null || request.notes().isBlank()
                                ? "Status changed to " + request.status() : request.notes()),
                "COMPLAINT_UPDATE", id);
        auditService.log("UPDATE_COMPLAINT_STATUS", "COMPLAINT", id,
                "Changed ticket " + complaint.ticketNumber() + " status to " + request.status() + ".");
        return repository.complaint(id).orElseThrow();
    }

    @Transactional
    public Complaint updatePriority(String id, ComplaintPriorityRequest request) {
        AuthContext.requireRole("ADMIN");
        Complaint complaint = repository.complaint(id)
                .orElseThrow(() -> ApiException.notFound("Complaint not found."));
        LocalDateTime now = clock.now();
        repository.updatePriority(id, request.priority(), now);
        repository.insertTimeline(new ComplaintTimeline(
                Ids.newId("ctl"), id, complaint.status(), now, AuthContext.require().name(),
                "Priority adjusted to " + request.priority()
                        + (request.notes() == null || request.notes().isBlank()
                                ? "." : ": " + request.notes())));
        auditService.log("UPDATE_COMPLAINT_PRIORITY", "COMPLAINT", id,
                "Adjusted ticket " + complaint.ticketNumber() + " priority to " + request.priority() + ".");
        return repository.complaint(id).orElseThrow();
    }

    @Transactional
    public Complaint assign(String id, ComplaintAssignRequest request) {
        AuthContext.requireRole("ADMIN");
        Complaint complaint = repository.complaint(id)
                .orElseThrow(() -> ApiException.notFound("Complaint not found."));
        FacultyProfile faculty = facultyRepository.findById(request.facultyId())
                .orElseThrow(() -> ApiException.badRequest("Faculty not found."));
        String status = "SUBMITTED".equals(complaint.status()) ? "UNDER_REVIEW" : complaint.status();
        LocalDateTime now = clock.now();
        repository.assign(id, faculty.id(), faculty.fullName(), status, now);
        repository.insertTimeline(new ComplaintTimeline(
                Ids.newId("ctl"), id, status, now, AuthContext.require().name(),
                "Assigned to " + faculty.fullName() + " (" + faculty.designation() + ")"));
        notificationService.notifyUser(faculty.userId(), "Complaint Ticket Assigned to You",
                "Ticket " + complaint.ticketNumber() + " (" + complaint.title()
                        + ") has been assigned for your investigation.",
                "COMPLAINT_UPDATE", id);
        auditService.log("ASSIGN_COMPLAINT", "COMPLAINT", id,
                "Assigned ticket " + complaint.ticketNumber() + " to " + faculty.fullName() + ".");
        return repository.complaint(id).orElseThrow();
    }
}
