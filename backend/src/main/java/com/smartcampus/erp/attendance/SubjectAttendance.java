package com.smartcampus.erp.attendance;

public record SubjectAttendance(
        String subjectId,
        String subjectCode,
        String subjectName,
        int total,
        int attended,
        double percentage,
        String riskLevel) {
}
