package com.smartcampus.erp.dashboard;

import com.smartcampus.erp.academic.TimetableEntry;
import com.smartcampus.erp.user.FacultyProfile;
import java.util.List;

public record FacultyDashboard(
        FacultyProfile profile,
        int subjectCount,
        int assignedClassCount,
        long pendingCorrections,
        long assignedOpenComplaints,
        int pendingMarkEntries,
        List<TimetableEntry> todayClasses,
        long sessionsMarkedToday) {
}
