package com.smartcampus.erp.exam;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record MarksEntryRequest(
        @NotBlank(message = "Exam is required.") String examId,
        @NotBlank(message = "Subject is required.") String subjectId,
        @NotEmpty(message = "At least one mark is required.")
        @Valid List<MarkEntryRequest> marks) {
}
