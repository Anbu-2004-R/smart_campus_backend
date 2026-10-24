package com.smartcampus.erp.enrollment;

import com.smartcampus.erp.auth.RequireRole;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/enrollments")
    public List<StudentEnrollment> enrollments(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) Integer semester) {
        return enrollmentService.enrollments(studentId, status, academicYear, semester);
    }

    @GetMapping("/enrollments/me")
    @RequireRole("STUDENT")
    public List<StudentEnrollment> myEnrollments() {
        return enrollmentService.myEnrollments();
    }

    @PostMapping("/enrollments/promote")
    @RequireRole("ADMIN")
    public PromotionResult promote(@Valid @RequestBody PromotionRequest request) {
        return enrollmentService.promote(request);
    }

    @PatchMapping("/enrollments/{id}/status")
    @RequireRole("ADMIN")
    public StudentEnrollment updateStatus(@PathVariable String id,
                                          @Valid @RequestBody EnrollmentStatusRequest request) {
        return enrollmentService.updateEnrollmentStatus(id, request);
    }

    @PostMapping("/enrollments/students/{studentId}/promote")
    @RequireRole("ADMIN")
    public StudentPromotionResult promoteStudent(@PathVariable String studentId,
                                                 @Valid @RequestBody StudentPromotionRequest request) {
        return enrollmentService.promoteStudent(studentId, request);
    }

    @PostMapping("/admissions")
    @RequireRole("ADMIN")
    @ResponseStatus(HttpStatus.CREATED)
    public AdmissionApplication submitAdmission(@Valid @RequestBody AdmissionCreateRequest request) {
        return enrollmentService.submitAdmission(request);
    }

    @GetMapping("/admissions")
    @RequireRole("ADMIN")
    public List<AdmissionApplication> admissions(@RequestParam(required = false) String status) {
        return enrollmentService.admissions(status);
    }

    @GetMapping("/admissions/{id}")
    @RequireRole("ADMIN")
    public AdmissionApplication admission(@PathVariable String id) {
        return enrollmentService.admission(id);
    }

    @PostMapping("/admissions/{id}/decision")
    @RequireRole("ADMIN")
    public AdmissionDecisionResponse decide(@PathVariable String id,
                                            @Valid @RequestBody AdmissionDecisionRequest request) {
        return enrollmentService.decide(id, request);
    }
}
