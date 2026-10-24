package com.smartcampus.erp.user;

import com.smartcampus.erp.auth.RequireRole;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequireRole("ADMIN")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> list(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q) {
        return userService.list(role, status, q);
    }

    @GetMapping("/{id}")
    public User get(@PathVariable String id) {
        return userService.requireById(id);
    }

    @PatchMapping("/{id}/status")
    public User setStatus(@PathVariable String id, @Valid @RequestBody UpdateStatusRequest request) {
        return userService.setStatus(id, request.status());
    }

    @PostMapping("/invite")
    public InviteResponse invite(@Valid @RequestBody InviteRequest request) {
        return userService.invite(request);
    }
}
