package com.smartcampus.erp.attendance;

import com.smartcampus.erp.auth.RequireRole;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {
    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/summary/{studentId}")
    public StudentAttendanceSummary summary(@PathVariable String studentId) {
        return attendanceService.summary(studentId);
    }

    @GetMapping("/sessions")
    public List<SessionView> sessions(
            @RequestParam(required = false) String facultyId,
            @RequestParam(required = false) String classGroupId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return attendanceService.sessions(facultyId, classGroupId, from, to);
    }

    @GetMapping("/sessions/{id}")
    public SessionView session(@PathVariable String id) {
        return attendanceService.session(id);
    }

    @PostMapping("/sessions")
    @RequireRole({"FACULTY", "ADMIN"})
    @ResponseStatus(HttpStatus.CREATED)
    public SessionView record(@Valid @RequestBody RecordAttendanceRequest request) {
        return attendanceService.record(request);
    }

    @GetMapping("/corrections")
    public List<CorrectionRequest> corrections(@RequestParam(required = false) String status) {
        return attendanceService.corrections(status);
    }

    @PostMapping("/corrections")
    @RequireRole("STUDENT")
    @ResponseStatus(HttpStatus.CREATED)
    public CorrectionRequest submitCorrection(@Valid @RequestBody CorrectionCreateRequest request) {
        return attendanceService.submitCorrection(request);
    }

    @PatchMapping("/corrections/{id}/review")
    @RequireRole({"FACULTY", "ADMIN"})
    public CorrectionRequest review(@PathVariable String id,
                                    @Valid @RequestBody CorrectionReviewRequest request) {
        return attendanceService.review(id, request);
    }

    @GetMapping("/risk-settings")
    public RiskSettings riskSettings() {
        return attendanceService.riskSettings();
    }

    @PutMapping("/risk-settings")
    @RequireRole("ADMIN")
    public RiskSettings updateRiskSettings(@Valid @RequestBody RiskSettingsRequest request) {
        return attendanceService.updateRiskSettings(request);
    }
}
