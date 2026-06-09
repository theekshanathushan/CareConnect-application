package ac.nsbm.careconnect.service;

import ac.nsbm.careconnect.model.ActivityLog;
import ac.nsbm.careconnect.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    // --- 1. LOGGING ACTIVITY (Call this from other services) ---
    public void logActivity(String user, String role, String action, String description) {
        ActivityLog log = new ActivityLog();
        log.setUser(user != null ? user : "Unknown");
        log.setRole(role != null ? role : "SYSTEM");
        log.setAction(action);
        log.setDescription(description);
        log.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(log);
    }

    // --- 2. RETRIEVING LOGS (For Admin Page) ---
    public List<ActivityLog> getFilteredLogs(String role, String dateStr) {
        // Check if filters are provided
        boolean hasRole = (role != null && !role.isEmpty() && !role.equals("null") && !role.equals(""));
        boolean hasDate = (dateStr != null && !dateStr.isEmpty() && !dateStr.equals("null") && !dateStr.equals(""));

        // Case A: Filter by BOTH Role and Date
        if (hasRole && hasDate) {
            LocalDate date = LocalDate.parse(dateStr);
            return activityLogRepository.findByRoleAndTimestampBetweenOrderByTimestampDesc(
                    role,
                    date.atStartOfDay(),
                    date.atTime(LocalTime.MAX)
            );
        }

        // Case B: Filter by Role ONLY
        if (hasRole) {
            return activityLogRepository.findByRoleOrderByTimestampDesc(role);
        }

        // Case C: Filter by Date ONLY
        if (hasDate) {
            LocalDate date = LocalDate.parse(dateStr);
            return activityLogRepository.findByTimestampBetweenOrderByTimestampDesc(
                    date.atStartOfDay(),
                    date.atTime(LocalTime.MAX)
            );
        }

        // Case D: No Filters (Return ALL)
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }
}