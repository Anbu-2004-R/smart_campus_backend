package com.smartcampus.erp.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CorrectionReviewRequest(
        @NotBlank(message = "Decision is required.")
        @Pattern(regexp = "APPROVED|REJECTED", message = "Decision must be APPROVED or REJECTED.") String decision,
        String remarks) {
}
