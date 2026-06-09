package ac.nsbm.careconnect.service;

import ac.nsbm.careconnect.model.HelpRequest;
import ac.nsbm.careconnect.model.User;
import ac.nsbm.careconnect.repository.HelpRequestRepository;
import ac.nsbm.careconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class HelpRequestService {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    // 1. Create a new request (Displaced Person)
    public HelpRequest createRequest(HelpRequest helpRequest) {
        if (helpRequest.getStatus() == null || helpRequest.getStatus().isEmpty()) {
            helpRequest.setStatus("Pending");
        }
        HelpRequest savedRequest = helpRequestRepository.save(helpRequest);

        // Log Activity
        String userName = "Unknown User";
        if (helpRequest.getUserId() != null) {
            User u = userRepository.findById(helpRequest.getUserId()).orElse(null);
            if (u != null) userName = u.getFirstName() + " " + u.getLastName();
        }

        activityLogService.logActivity(
                userName,
                "DISPLACED",
                "CREATE_REQUEST",
                "Created request for: " + savedRequest.getRequestType()
        );

        return savedRequest;
    }

    // 2. Get All Requests
    public List<HelpRequest> getAllRequests() {
        return helpRequestRepository.findAll();
    }

    // 3. Get Request by ID
    public Optional<HelpRequest> getRequestById(Long id) {
        return helpRequestRepository.findById(id);
    }

    // 4. Get Requests for a specific User
    public List<HelpRequest> getRequestsByUserId(Long userId) {
        return helpRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 5. Update Status (Government Officer: Approve/Reject)
    public HelpRequest updateRequestStatus(Long id, String status) {
        return helpRequestRepository.findById(id).map(req -> {
            String oldStatus = req.getStatus();
            req.setStatus(status);
            HelpRequest updated = helpRequestRepository.save(req);

            // Log Activity
            activityLogService.logActivity(
                    "Gov Officer", // You might want to pass the actual officer's name if available
                    "GOVERNMENT",
                    "UPDATE_STATUS",
                    "Changed Request #" + id + " status from " + oldStatus + " to " + status
            );

            return updated;
        }).orElse(null);
    }
}