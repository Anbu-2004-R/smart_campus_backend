package com.smartcampus.erp.complaint;

import java.time.LocalDateTime;
import java.util.List;

public record Complaint(
        String id,
        String ticketNumber,
        String title,
        String description,
        String category,
        String requestedPriority,
        String officialPriority,
        String status,
        String submittedByUserId,
        String submitterName,
        String submitterRole,
        String submitterEmail,
        String assignedToFacultyId,
        String assignedFacultyName,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt,
        String resolutionNotes,
        String rejectionReason,
        List<ComplaintTimeline> timeline) {

    public Complaint withTimeline(List<ComplaintTimeline> newTimeline) {
        return new Complaint(id, ticketNumber, title, description, category, requestedPriority,
                officialPriority, status, submittedByUserId, submitterName, submitterRole, submitterEmail,
                assignedToFacultyId, assignedFacultyName, submittedAt, updatedAt, resolutionNotes,
                rejectionReason, newTimeline);
    }
}
