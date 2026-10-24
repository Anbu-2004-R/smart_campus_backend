package com.smartcampus.erp.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CorrectionCreateRequest(
        @NotBlank(message = "Session is required.") String sessionId,
        @NotBlank(message = "Requested status is required.")
        @Pattern(regexp = "PRESENT|ABSENT|LATE|ON_DUTY", message = "Invalid requested status.") String requestedStatus,
        @NotBlank(message = "Reason is required.")
        @Size(min = 10, max = 1000, message = "Reason must be between 10 and 1000 characters.") String reason,
        String evidenceNote) {
}
