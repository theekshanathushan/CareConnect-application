package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.HelpRequest;
import ac.nsbm.careconnect.repository.HelpRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class RequestController {

    @Autowired
    private HelpRequestRepository requestRepository;

    // 1. Create Request (Displaced Person)
    @PostMapping("/create")
    public HelpRequest createRequest(@RequestBody HelpRequest request) {
        // Ensure status is Pending on creation if not specified
        if (request.getStatus() == null || request.getStatus().isEmpty()) {
            request.setStatus("Pending");
        }
        return requestRepository.save(request);
    }

    // 2. Get All Requests (For Government Officer Dashboard)
    @GetMapping("/all")
    public List<HelpRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    // 3. Get Requests by User ID (For Displaced Person 'My Requests' page)
    @GetMapping("/user/{userId}")
    public List<HelpRequest> getUserRequests(@PathVariable Long userId) {
        // Assuming you have this method in your repository
        // If not, use findByUserId(userId) if order doesn't matter
        return requestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 4. Update Request Status (For Government Officer Accept/Reject)
    // Matches the JS call: apiUtils.put(url, { status: newStatus })
    @PutMapping("/{id}/status")
    public ResponseEntity<HelpRequest> updateRequestStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        return requestRepository.findById(id).map(request -> {
            String newStatus = statusUpdate.get("status");
            if (newStatus != null && !newStatus.isEmpty()) {
                request.setStatus(newStatus);
            }
            return ResponseEntity.ok(requestRepository.save(request));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Optional: Filter functionality (kept from your previous code)
    @GetMapping("/filter")
    public List<HelpRequest> filterRequests(@RequestParam(required = false) String urgency) {
        if (urgency != null && !urgency.isEmpty()) {
            return requestRepository.findByUrgency(urgency);
        }
        return requestRepository.findAll();
    }

    // Optional: General Update (if needed for editing other fields later)
    @PutMapping("/{id}")
    public ResponseEntity<HelpRequest> updateRequest(@PathVariable Long id, @RequestBody HelpRequest requestDetails) {
        return requestRepository.findById(id).map(request -> {
            if (requestDetails.getStatus() != null) request.setStatus(requestDetails.getStatus());
            if (requestDetails.getUrgency() != null) request.setUrgency(requestDetails.getUrgency());
            if (requestDetails.getDescription() != null) request.setDescription(requestDetails.getDescription());
            return ResponseEntity.ok(requestRepository.save(request));
        }).orElse(ResponseEntity.notFound().build());
    }
}