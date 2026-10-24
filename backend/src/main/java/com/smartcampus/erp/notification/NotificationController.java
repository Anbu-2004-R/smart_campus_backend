package com.smartcampus.erp.notification;

import com.smartcampus.erp.auth.AuthContext;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Notification> list(@RequestParam(defaultValue = "false") boolean unreadOnly) {
        return notificationService.forUser(AuthContext.userId(), unreadOnly);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount() {
        return Map.of("count", notificationService.unreadCount(AuthContext.userId()));
    }

    @PatchMapping("/{id}/read")
    public void markRead(@PathVariable String id) {
        notificationService.markRead(id, AuthContext.userId());
    }

    @PatchMapping("/read-all")
    public void markAllRead() {
        notificationService.markAllRead(AuthContext.userId());
    }
}
