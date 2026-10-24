package com.smartcampus.erp.dashboard;

import java.util.List;

public record AdminDashboard(
        long totalStudents,
        long totalFaculty,
        double institutionalAttendance,
        long highRiskStudents,
        long mediumRiskStudents,
        long lowRiskStudents,
        long pendingAdminCorrections,
        long openComplaints,
        long criticalComplaints,
        long activeExams,
        long activeEnrollments,
        long pendingAdmissions,
        long admittedApplications,
        long rejectedApplications,
        long activeAnnouncements,
        List<DepartmentStat> departments) {
}
