package com.grocery.controller;

import com.grocery.entity.Notification;
import com.grocery.entity.User;
import com.grocery.service.AuthService;
import com.grocery.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "In-app alerts and notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get all notifications for logged-in user")
    public ResponseEntity<List<Notification>> getNotifications() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = authService.getCurrentAuthenticatedUser();
        Map<String, Long> result = new HashMap<>();
        result.put("unreadCount", notificationService.getUnreadCount(user.getId()));
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAsRead(user.getId(), id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all user notifications as read")
    public ResponseEntity<Void> markAllAsRead() {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }
}
