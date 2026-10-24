package com.smartcampus.erp.complaint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ComplaintStatusRequest(
        @NotBlank(message = "Status is required.")
        @Pattern(regexp = "SUBMITTED|UNDER_REVIEW|IN_PROGRESS|RESOLVED|REJECTED", message = "Invalid complaint status.")
        String status,
        String notes,
        String rejectionReason) {
}
