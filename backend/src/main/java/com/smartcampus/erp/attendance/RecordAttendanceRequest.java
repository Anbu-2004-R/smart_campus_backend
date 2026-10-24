package com.smartcampus.erp.attendance;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record RecordAttendanceRequest(
        @NotBlank(message = "Assignment is required.") String assignmentId,
        @NotNull(message = "Session date is required.") LocalDate date,
        @Min(value = 1, message = "Period must be between 1 and 6.")
        @Max(value = 6, message = "Period must be between 1 and 6.") int period,
        String roomNumber,
        String topicCovered,
        @NotEmpty(message = "At least one attendance record is required.")
        @Valid List<AttendanceMarkRequest> records) {
}
