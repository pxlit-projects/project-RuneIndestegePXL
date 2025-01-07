package be.pxl.services.controller;


import be.pxl.services.controller.dto.NotificationDTO;
import be.pxl.services.services.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class.getName());

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(@RequestHeader("User") String user) {
        log.info("Getting all notifications for {}", user);
        return ResponseEntity.ok(notificationService.getNotifications(user));
    }
    @PostMapping
    public ResponseEntity<Void> sendNotification(@RequestBody NotificationDTO dto) {
        log.info("Sending notification");
        notificationService.sendNotification(dto);
        return ResponseEntity.ok().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<Void> markAsRead(@RequestHeader("User") String user, @PathVariable Long id) {
        log.info("mark notification as read for {}", user);
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }
}
