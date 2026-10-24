package com.smartcampus.erp.auth;

import com.smartcampus.erp.common.ApiException;
import com.smartcampus.erp.user.UserAccount;
import com.smartcampus.erp.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthInterceptor(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        AuthContext.clear();
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw ApiException.unauthorized("Authentication is required.");
        }

        AuthPrincipal principal = jwtService.parse(authorization.substring(7).trim());
        UserAccount account = userRepository.findById(principal.userId())
                .orElseThrow(() -> ApiException.unauthorized("Your account no longer exists."));
        if (!"ACTIVE".equals(account.status())) {
            throw ApiException.forbidden("Account is not active. Contact the Office of the Registrar.");
        }
        if (!account.role().equals(principal.role())) {
            throw ApiException.unauthorized("Invalid authentication token.");
        }
        AuthContext.set(principal);

        try {
            RequireRole roleRule = handlerMethod.getMethodAnnotation(RequireRole.class);
            if (roleRule == null) {
                roleRule = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
            }
            if (roleRule != null && Arrays.stream(roleRule.value()).noneMatch(principal.role()::equals)) {
                throw ApiException.forbidden("Your role is not permitted to perform this action.");
            }
            return true;
        } catch (RuntimeException ex) {
            AuthContext.clear();
            throw ex;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        AuthContext.clear();
    }
}
