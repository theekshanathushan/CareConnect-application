package ac.nsbm.careconnect.service;

import ac.nsbm.careconnect.model.Donation;
import ac.nsbm.careconnect.model.HelpRequest;
import ac.nsbm.careconnect.model.User;
import ac.nsbm.careconnect.repository.DonationRepository;
import ac.nsbm.careconnect.repository.HelpRequestRepository;
import ac.nsbm.careconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    // --- GOVERNMENT STATS ---
    public Map<String, Object> getGovernmentStats() {
        Map<String, Object> stats = new HashMap<>();
        List<HelpRequest> allRequests = helpRequestRepository.findAll();
        List<User> allUsers = userRepository.findAll();

        // Safe counting using Java Streams
        long activeCases = allRequests.stream()
                .filter(r -> "Pending".equalsIgnoreCase(r.getStatus()))
                .count();

        long peopleServed = allUsers.stream()
                .filter(u -> "displaced".equalsIgnoreCase(u.getRole()))
                .count();

        long resolvedCases = allRequests.stream()
                .filter(r -> "Fulfilled".equalsIgnoreCase(r.getStatus()) || "Approved".equalsIgnoreCase(r.getStatus()))
                .count();

        stats.put("activeCases", activeCases);
        stats.put("peopleServed", peopleServed);
        stats.put("resolvedCases", resolvedCases);

        return stats;
    }

    // --- ADMIN STATS ---
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        List<HelpRequest> allRequests = helpRequestRepository.findAll();

        stats.put("totalUsers", userRepository.count());

        long activeIncidents = allRequests.stream()
                .filter(r -> "Pending".equalsIgnoreCase(r.getStatus()))
                .count();

        stats.put("activeIncidents", activeIncidents);
        stats.put("totalDonations", donationRepository.count());
        stats.put("uptime", "99.9%");

        return stats;
    }

    // --- DONOR STATS ---
    public Map<String, Object> getDonorStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        List<Donation> userDonations;

        if (userId != null) {
            userDonations = donationRepository.findByDonorId(userId);
        } else {
            userDonations = donationRepository.findAll();
        }

        stats.put("totalDonations", userDonations.size());
        stats.put("peopleHelped", userDonations.size() * 2); // 1 Donation helps ~2 people

        long currentRequests = helpRequestRepository.findAll().stream()
                .filter(r -> "Pending".equalsIgnoreCase(r.getStatus()))
                .count();

        stats.put("currentRequests", currentRequests);

        return stats;
    }

    // --- DISPLACED PERSON STATS ---
    public Map<String, Object> getDisplacedStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        if (userId == null) return stats;

        List<HelpRequest> myRequests = helpRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);

        long total = myRequests.size();
        long fulfilled = myRequests.stream()
                .filter(r -> "Fulfilled".equalsIgnoreCase(r.getStatus()) || "Approved".equalsIgnoreCase(r.getStatus()))
                .count();
        long active = total - fulfilled;

        stats.put("activeRequests", active);
        stats.put("requestsFulfilled", fulfilled);
        stats.put("helpersAssigned", fulfilled);

        return stats;
    }


}