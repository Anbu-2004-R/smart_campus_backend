package com.smartcampus.erp.academic;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TimetableRequest(
        @NotBlank(message = "Day of week is required.")
        @Pattern(regexp = "MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY",
                message = "Invalid day of week.") String dayOfWeek,
        @Min(value = 1, message = "Period must be between 1 and 6.")
        @Max(value = 6, message = "Period must be between 1 and 6.") int period,
        @NotBlank(message = "Start time is required.") String startTime,
        @NotBlank(message = "End time is required.") String endTime,
        @NotBlank(message = "Class group is required.") String classGroupId,
        @NotBlank(message = "Subject is required.") String subjectId,
        @NotBlank(message = "Faculty is required.") String facultyId,
        @NotBlank(message = "Classroom is required.") String classroomId) {
}
