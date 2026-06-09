package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.User;
import ac.nsbm.careconnect.repository.DonationRepository;
import ac.nsbm.careconnect.repository.HelpRequestRepository;
import ac.nsbm.careconnect.repository.UserRepository;
import ac.nsbm.careconnect.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    // --- User Management ---

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/users/{id}/suspend")
    public User suspendUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setStatus("Suspended");
            activityLogService.logActivity("Admin", "Administrator", "Suspend User", "Suspended user: " + user.getEmail());
            return userRepository.save(user);
        }).orElse(null);
    }

    @PostMapping("/users/{id}/activate")
    public User activateUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setStatus("Active");
            activityLogService.logActivity("Admin", "Administrator", "Activate User", "Activated user: " + user.getEmail());
            return userRepository.save(user);
        }).orElse(null);
    }

    // --- System Stats ---
    @GetMapping("/stats")
    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", String.valueOf(userRepository.count()));
        stats.put("totalDonations", String.valueOf(donationRepository.count()));
        stats.put("activeIncidents", String.valueOf(helpRequestRepository.count()));
        stats.put("uptime", "99.9%");
        return stats;
    }

    // REMOVED: getActivities() method to fix the Ambiguous Mapping error
}