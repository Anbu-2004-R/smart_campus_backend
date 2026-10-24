package com.smartcampus.erp.complaint;

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
@RequestMapping("/api/v1/complaints")
public class ComplaintController {
    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public List<Complaint> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority) {
        return complaintService.list(status, category, priority);
    }

    @GetMapping("/{id}")
    public Complaint get(@PathVariable String id) {
        return complaintService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Complaint submit(@Valid @RequestBody ComplaintCreateRequest request) {
        return complaintService.submit(request);
    }

    @PatchMapping("/{id}/status")
    @RequireRole({"ADMIN", "FACULTY"})
    public Complaint updateStatus(@PathVariable String id,
                                  @Valid @RequestBody ComplaintStatusRequest request) {
        return complaintService.updateStatus(id, request);
    }

    @PatchMapping("/{id}/priority")
    @RequireRole("ADMIN")
    public Complaint updatePriority(@PathVariable String id,
                                    @Valid @RequestBody ComplaintPriorityRequest request) {
        return complaintService.updatePriority(id, request);
    }

    @PatchMapping("/{id}/assign")
    @RequireRole("ADMIN")
    public Complaint assign(@PathVariable String id,
                            @Valid @RequestBody ComplaintAssignRequest request) {
        return complaintService.assign(id, request);
    }
}
