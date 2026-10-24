package com.smartcampus.erp.exam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record MarksCorrectionReviewRequest(
        @NotBlank(message = "Decision is required.")
        @Pattern(regexp = "APPROVED|REJECTED", message = "Decision must be APPROVED or REJECTED.") String decision,
        String notes) {
}
