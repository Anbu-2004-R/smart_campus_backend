package com.smartcampus.erp.enrollment;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record PromotionRequest(
        @NotBlank(message = "Source academic year is required.") String fromAcademicYear,
        @Min(value = 1, message = "Source semester must be at least 1.")
        @Max(value = 12, message = "Source semester must be at most 12.") int fromSemester,
        @NotBlank(message = "Target academic year is required.") String toAcademicYear,
        @Min(value = 1, message = "Target semester must be at least 1.")
        @Max(value = 12, message = "Target semester must be at most 12.") int toSemester,
        String targetClassGroupId,
        String remarks) {
}
