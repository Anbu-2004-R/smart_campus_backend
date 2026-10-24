package com.smartcampus.erp.complaint;

import jakarta.validation.constraints.NotBlank;

public record ComplaintAssignRequest(
        @NotBlank(message = "Faculty ID is required.") String facultyId,
        String notes) {
}
