package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.Notification;
import ac.nsbm.careconnect.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationRepository.findByUserIdOrderByDateDesc(userId);
    }

    // Helper to create dummy notifications for testing if empty
    @PostMapping("/generate/{userId}")
    public Notification generateTestNotification(@PathVariable Long userId) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle("Welcome to CareConnect");
        n.setMessage("Thank you for joining our community!");
        n.setType("info");
        return notificationRepository.save(n);
    }
}