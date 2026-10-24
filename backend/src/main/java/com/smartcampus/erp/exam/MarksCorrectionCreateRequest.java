package com.smartcampus.erp.exam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record MarksCorrectionCreateRequest(
        @NotBlank(message = "Exam is required.") String examId,
        @NotBlank(message = "Subject is required.") String subjectId,
        @NotBlank(message = "Student is required.") String studentId,
        @NotBlank(message = "New status is required.")
        @Pattern(regexp = "MARKS_ENTERED|ABSENT|MEDICAL_ABSENCE|MALPRACTICE", message = "Invalid mark status.")
        String newStatus,
        BigDecimal newMarks,
        @NotBlank(message = "Reason is required.")
        @Size(min = 10, max = 1000, message = "Reason must be between 10 and 1000 characters.") String reason) {
}
