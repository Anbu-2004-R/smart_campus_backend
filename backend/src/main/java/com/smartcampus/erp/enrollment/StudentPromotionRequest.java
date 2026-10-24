package com.smartcampus.erp.enrollment;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record StudentPromotionRequest(
        @Min(value = 1, message = "Target semester must be at least 1.")
        @Max(value = 12, message = "Target semester must be at most 12.") int targetSemester,
        @NotBlank(message = "Target academic year is required.")
        @Pattern(regexp = "\\d{4}-\\d{4}", message = "Academic year must use the YYYY-YYYY format.")
        String academicYear,
        String targetClassGroupId,
        String remarks) {
}
