package com.smartcampus.erp.exam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public record MarkEntryRequest(
        @NotBlank(message = "Student ID is required.") String studentId,
        @NotBlank(message = "Mark status is required.")
        @Pattern(regexp = "MARKS_ENTERED|ABSENT|MEDICAL_ABSENCE|MALPRACTICE", message = "Invalid mark status.")
        String status,
        BigDecimal marksObtained) {
}
