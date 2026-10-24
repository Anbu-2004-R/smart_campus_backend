package com.smartcampus.erp.complaint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ComplaintPriorityRequest(
        @NotBlank(message = "Priority is required.")
        @Pattern(regexp = "LOW|MEDIUM|HIGH|URGENT", message = "Invalid priority.") String priority,
        String notes) {
}
