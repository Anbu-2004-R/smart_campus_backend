package com.smartcampus.erp.audit;

import com.smartcampus.erp.auth.AuthContext;
import com.smartcampus.erp.auth.AuthPrincipal;
import com.smartcampus.erp.common.Ids;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditService {
    private final AuditRepository repository;

    public AuditService(AuditRepository repository) {
        this.repository = repository;
    }

    public void log(String action, String entityType, String entityId, String details) {
        AuthPrincipal principal = AuthContext.get();
        String actorId = principal == null ? "system" : principal.userId();
        String actorName = principal == null ? "System" : principal.name();
        String actorRole = principal == null ? "SYSTEM" : principal.role();
        write(actorId, actorName, actorRole, action, entityType, entityId, details);
    }

    public void logAs(String actorUserId, String actorName, String actorRole,
                      String action, String entityType, String entityId, String details) {
        write(actorUserId, actorName, actorRole, action, entityType, entityId, details);
    }

    private void write(String actorUserId, String actorName, String actorRole,
                       String action, String entityType, String entityId, String details) {
        repository.insert(new AuditLog(
                Ids.newId("aud"),
                actorUserId,
                actorName,
                actorRole,
                action,
                entityType,
                entityId,
                details,
                LocalDateTime.now(),
                currentIp()));
    }

    public List<AuditLog> list(String actorUserId, String entityType, String action, int limit) {
        return repository.find(actorUserId, entityType, action, limit);
    }

    public List<AuditLog> recent(int limit) {
        return repository.recent(limit);
    }

    private String currentIp() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            HttpServletRequest request = attributes.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return null;
    }
}
