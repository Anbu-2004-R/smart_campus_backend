package com.smartcampus.erp.announcement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record AnnouncementCreateRequest(
        @NotBlank(message = "Title is required.")
        @Size(min = 5, max = 180, message = "Title must be between 5 and 180 characters.") String title,
        @NotBlank(message = "Content is required.")
        @Size(min = 10, max = 8000, message = "Content must be between 10 and 8000 characters.") String content,
        @NotBlank(message = "Scope is required.")
        @Pattern(regexp = "COLLEGE_WIDE|DEPARTMENT|COURSE|SEMESTER", message = "Invalid announcement scope.")
        String scope,
        String targetDepartmentId,
        String targetCourseId,
        Integer targetSemester,
        @NotBlank(message = "Priority is required.")
        @Pattern(regexp = "NORMAL|URGENT", message = "Priority must be NORMAL or URGENT.") String priority,
        LocalDate expiryDate) {
}
