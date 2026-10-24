package com.smartcampus.erp.enrollment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EnrollmentStatusRequest(
        @NotBlank(message = "Status is required.")
        @Pattern(regexp = "ACTIVE|COMPLETED|WITHDRAWN|SUSPENDED",
                message = "Status must be ACTIVE, COMPLETED, WITHDRAWN or SUSPENDED.")
        String status,
        String remarks) {
}
