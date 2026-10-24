package com.smartcampus.erp.attendance;

import java.util.List;

public record StudentAttendanceSummary(
        String studentId,
        double overallPercentage,
        int totalClasses,
        int attendedClasses,
        String riskLevel,
        int recentAbsenceCount,
        List<SubjectAttendance> subjectWise) {
}
