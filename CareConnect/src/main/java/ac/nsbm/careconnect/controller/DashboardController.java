package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.Donation;
import ac.nsbm.careconnect.model.HelpRequest;
import ac.nsbm.careconnect.repository.DonationRepository;
import ac.nsbm.careconnect.repository.HelpRequestRepository;
import ac.nsbm.careconnect.repository.ResourceItemRepository;
import ac.nsbm.careconnect.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator; // Import Comparator
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private ResourceItemRepository resourceItemRepository;

    // --- 1. Inject WebSocket Template ---
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // --- DONOR ENDPOINTS ---

    @PostMapping("/donate")
    public ResponseEntity<?> createDonation(@RequestBody Donation donation) {
        try {
            // 1. Save the Donation
            Donation savedDonation = donationRepository.save(donation);

            // 2. Update Linked Request if exists
            if (donation.getRequestId() != null) {
                Optional<HelpRequest> requestOpt = helpRequestRepository.findById(donation.getRequestId());
                if (requestOpt.isPresent()) {
                    HelpRequest request = requestOpt.get();
                    request.setStatus("Fulfilled");
                    helpRequestRepository.save(request);

                    // Notify Displaced Person (if logged in)
                    messagingTemplate.convertAndSend("/topic/dashboard/" + request.getUserId(), "REFRESH");
                }
            }

            // --- 3. REAL-TIME NOTIFICATIONS ---

            // Notify the Donor to update their own dashboard
            messagingTemplate.convertAndSend("/topic/dashboard/" + donation.getDonorId(), "REFRESH");

            // Notify Admin Dashboard to update total stats
            messagingTemplate.convertAndSend("/topic/admin/stats", "REFRESH");

            return ResponseEntity.ok(savedDonation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/donor-stats")
    public Map<String, Object> getDonorStats(@RequestParam(required = false) Long userId) {
        return dashboardService.getDonorStats(userId);
    }

    @GetMapping("/recent-activity")
    public List<Donation> getRecentActivity(@RequestParam(required = false) Long userId) {
        if (userId != null) return donationRepository.findByDonorId(userId);
        return donationRepository.findAll();
    }

    // --- DISPLACED PERSON ENDPOINTS ---
    @GetMapping("/displaced-stats")
    public Map<String, Object> getDisplacedStats(@RequestParam(required = false) Long userId) {
        return dashboardService.getDisplacedStats(userId);
    }

    @GetMapping("/displaced-activity")
    public List<HelpRequest> getDisplacedActivity(@RequestParam Long userId) {
        return helpRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // --- GOVERNMENT / ADMIN ENDPOINTS ---
    @GetMapping("/government-stats")
    public Map<String, Object> getGovernmentStats() {
        return dashboardService.getGovernmentStats();
    }

    // [FIXED] Safe Sort to prevent NullPointerException
    @GetMapping("/government-activity")
    public List<HelpRequest> getGovernmentActivity() {
        return helpRequestRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null) // Ignore null dates
                .sorted(Comparator.comparing(HelpRequest::getCreatedAt).reversed()) // Safe sort
                .limit(5)
                .collect(Collectors.toList());
    }

    @GetMapping("/admin-stats")
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = dashboardService.getAdminStats();
        stats.put("resources", resourceItemRepository.count());
        return stats;
    }

    // [FIXED] Safe Sort for Admin Activity too
    @GetMapping("/admin-activity")
    public List<Map<String, Object>> getAdminActivity() {
        List<HelpRequest> recentRequests = helpRequestRepository.findAll();
        return recentRequests.stream()
                .filter(r -> r.getCreatedAt() != null) // Ignore null dates
                .sorted(Comparator.comparing(HelpRequest::getCreatedAt).reversed())
                .limit(5)
                .map(req -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("type", "Request");
                    map.put("description", "New " + req.getRequestType() + " request");
                    map.put("time", req.getCreatedAt());
                    map.put("user", req.getContactName());
                    return map;
                })
                .collect(Collectors.toList());
    }
}