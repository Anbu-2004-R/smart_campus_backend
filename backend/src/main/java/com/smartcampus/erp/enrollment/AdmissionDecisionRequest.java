package com.smartcampus.erp.enrollment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AdmissionDecisionRequest(
        @NotBlank(message = "Decision is required.")
        @Pattern(regexp = "APPROVED|REJECTED|UNDER_REVIEW", message = "Decision must be APPROVED, REJECTED or UNDER_REVIEW.")
        String decision,
        String assignedClassGroupId,
        String registerNumber,
        String remarks) {
}
