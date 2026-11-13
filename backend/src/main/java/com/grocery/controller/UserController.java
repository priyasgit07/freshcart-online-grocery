package com.grocery.controller;

import com.grocery.dto.ChangePasswordRequest;
import com.grocery.dto.ProfileUpdateRequest;
import com.grocery.entity.User;
import com.grocery.service.AuthService;
import com.grocery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Profile", description = "User profile view, edit, and password management")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get personal profile details")
    public ResponseEntity<User> getProfile() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(userService.getProfile(user.getId()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update personal profile information (name, email, address, phone)")
    public ResponseEntity<User> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(userService.updateProfile(user.getId(), request));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Securely change current password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        userService.changePassword(user.getId(), request);
        return ResponseEntity.ok().build();
    }
}
