package com.smartcampus.erp.notification;

import com.smartcampus.erp.common.Ids;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public void notifyUser(String userId, String title, String message, String category, String referenceId) {
        if (userId == null || userId.isBlank()) {
            return;
        }
        if (repository.existsRecent(userId, category, referenceId, 5)) {
            return;
        }
        repository.insert(new Notification(
                Ids.newId("notif"),
                userId,
                title,
                message,
                category,
                referenceId,
                false,
                LocalDateTime.now()));
    }

    public List<Notification> forUser(String userId, boolean unreadOnly) {
        return repository.findForUser(userId, unreadOnly);
    }

    public void markRead(String id, String userId) {
        repository.markRead(id, userId);
    }

    public void markAllRead(String userId) {
        repository.markAllRead(userId);
    }

    public long unreadCount(String userId) {
        return repository.countUnread(userId);
    }
}
