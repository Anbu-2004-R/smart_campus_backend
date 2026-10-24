package com.smartcampus.erp.academic;

public record TimetableEntry(
        String id,
        String dayOfWeek,
        int period,
        String startTime,
        String endTime,
        String classGroupId,
        String subjectId,
        String facultyId,
        String classroomId) {
}
