package ac.nsbm.careconnect.repository;

import ac.nsbm.careconnect.model.HelpRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HelpRequestRepository extends JpaRepository<HelpRequest, Long> {

    // Find requests by urgency (High, Medium, Low)
    List<HelpRequest> findByUrgency(String urgency);

    // Find requests by status (Pending, Approved, Rejected)
    List<HelpRequest> findByStatus(String status);

    // For Displaced Person: View their own history, newest first
    List<HelpRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    // --- Statistics ---
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, String status);
    long countByStatus(String status);
}