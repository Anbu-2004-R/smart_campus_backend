package com.smartcampus.erp.attendance;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ClassSession(
        String id,
        String assignmentId,
        String subjectId,
        String classGroupId,
        String facultyId,
        LocalDate date,
        int period,
        String roomNumber,
        String topicCovered,
        LocalDateTime markedAt) {
}
