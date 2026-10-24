package com.smartcampus.erp.dashboard;

import com.smartcampus.erp.academic.TimetableEntry;
import com.smartcampus.erp.announcement.Announcement;
import com.smartcampus.erp.attendance.StudentAttendanceSummary;
import com.smartcampus.erp.enrollment.StudentEnrollment;
import com.smartcampus.erp.exam.SemesterResult;
import com.smartcampus.erp.user.StudentProfile;
import java.util.List;

public record StudentDashboard(
        StudentProfile profile,
        StudentAttendanceSummary attendance,
        StudentEnrollment activeEnrollment,
        SemesterResult latestResult,
        List<TimetableEntry> todayClasses,
        long openComplaints,
        long pendingCorrections,
        List<Announcement> latestAnnouncements,
        long unreadNotifications) {
}
