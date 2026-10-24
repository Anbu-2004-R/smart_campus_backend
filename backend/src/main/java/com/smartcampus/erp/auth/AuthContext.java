package com.smartcampus.erp.auth;

import com.smartcampus.erp.common.ApiException;
import java.util.Arrays;

public final class AuthContext {
    private static final ThreadLocal<AuthPrincipal> CURRENT = new ThreadLocal<>();

    private AuthContext() {
    }

    public static void set(AuthPrincipal principal) {
        CURRENT.set(principal);
    }

    public static AuthPrincipal get() {
        return CURRENT.get();
    }

    public static AuthPrincipal require() {
        AuthPrincipal principal = CURRENT.get();
        if (principal == null) {
            throw ApiException.unauthorized("Authentication is required.");
        }
        return principal;
    }

    public static String userId() {
        return require().userId();
    }

    public static String role() {
        return require().role();
    }

    public static void requireRole(String... roles) {
        String current = require().role();
        if (Arrays.stream(roles).noneMatch(current::equals)) {
            throw ApiException.forbidden("Your role is not permitted to perform this action.");
        }
    }

    public static void clear() {
        CURRENT.remove();
    }
}
