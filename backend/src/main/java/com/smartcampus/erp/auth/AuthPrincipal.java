package com.smartcampus.erp.auth;

public record AuthPrincipal(String userId, String role, String loginId, String name) {
}
