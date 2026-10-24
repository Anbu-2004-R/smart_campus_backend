package com.smartcampus.erp.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AttendanceMarkRequest(
        @NotBlank(message = "Student ID is required.") String studentId,
        @NotBlank(message = "Attendance status is required.")
        @Pattern(regexp = "PRESENT|ABSENT|LATE|ON_DUTY", message = "Invalid attendance status.") String status,
        String remarks) {
}
