package com.smartcampus.erp.attendance;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record SessionView(
        String id,
        String assignmentId,
        String subjectId,
        String subjectCode,
        String subjectName,
        String classGroupId,
        String classGroupName,
        String facultyId,
        String facultyName,
        LocalDate date,
        int period,
        String roomNumber,
        String topicCovered,
        LocalDateTime markedAt,
        List<AttendanceRecordView> records) {

    public SessionView withRecords(List<AttendanceRecordView> newRecords) {
        return new SessionView(id, assignmentId, subjectId, subjectCode, subjectName, classGroupId,
                classGroupName, facultyId, facultyName, date, period, roomNumber, topicCovered,
                markedAt, newRecords);
    }
}
