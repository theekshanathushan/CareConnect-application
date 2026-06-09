package ac.nsbm.careconnect.repository;

import ac.nsbm.careconnect.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    // 1. Get ALL logs (Newest first)
    List<ActivityLog> findAllByOrderByTimestampDesc();

    // 2. Filter by Role
    List<ActivityLog> findByRoleOrderByTimestampDesc(String role);

    // 3. Filter by Date Range
    List<ActivityLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);

    // 4. Filter by BOTH Role and Date
    List<ActivityLog> findByRoleAndTimestampBetweenOrderByTimestampDesc(String role, LocalDateTime start, LocalDateTime end);
}