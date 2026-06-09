package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.Donation;
import ac.nsbm.careconnect.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donations") // Matches the URL in your dashboard.js
@CrossOrigin(origins = "*")
public class DonationController {

    @Autowired
    private DonationRepository donationRepository;

    // 1. Get Donations (Filter by Status or All)
    // Frontend calls: /api/donations?status=PENDING
    @GetMapping
    public List<Donation> getDonations(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            // Fetch all and filter (or add a custom method in Repository)
            return donationRepository.findAll().stream()
                    .filter(d -> status.equalsIgnoreCase(d.getStatus()))
                    .collect(Collectors.toList());
        }
        return donationRepository.findAll();
    }

    // 2. Update Donation Status (Approve/Reject)
    // Frontend calls: /api/donations/{id}/status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");

        return donationRepository.findById(id).map(donation -> {
            donation.setStatus(newStatus);
            donationRepository.save(donation);
            return ResponseEntity.ok().body("Status updated to " + newStatus);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 3. Create Donation (Used by Donors)
    @PostMapping
    public Donation createDonation(@RequestBody Donation donation) {
        if (donation.getStatus() == null) {
            donation.setStatus("PENDING"); // Default status
        }
        return donationRepository.save(donation);
    }
}