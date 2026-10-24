package com.smartcampus.erp.academic;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClassGroupRequest(
        @NotBlank(message = "Class group name is required.")
        @Size(max = 180, message = "Class group name is too long.") String name,
        @NotBlank(message = "Course is required.") String courseId,
        @Min(value = 1, message = "Semester must be at least 1.")
        @Max(value = 12, message = "Semester must be at most 12.") int semester,
        @NotBlank(message = "Section is required.") String section,
        @NotBlank(message = "Academic year is required.") String academicYear) {
}
