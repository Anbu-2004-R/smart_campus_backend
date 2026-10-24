package com.smartcampus.erp.academic;

import jakarta.validation.constraints.NotBlank;

public record AssignmentRequest(
        @NotBlank(message = "Faculty is required.") String facultyId,
        @NotBlank(message = "Subject is required.") String subjectId,
        @NotBlank(message = "Class group is required.") String classGroupId,
        @NotBlank(message = "Academic year is required.") String academicYear) {
}
