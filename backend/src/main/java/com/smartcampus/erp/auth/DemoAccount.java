package com.smartcampus.erp.auth;

public record DemoAccount(
        String role,
        String roleTitle,
        String loginId,
        String passwordHint,
        String description,
        boolean atRisk) {
}
