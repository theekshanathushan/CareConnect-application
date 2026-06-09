package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.ActivityLog;
import ac.nsbm.careconnect.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/activities") // <--- Matches the JS URL
@CrossOrigin(origins = "*")              // <--- Allows Frontend access
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public List<ActivityLog> getActivityLogs(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String date
    ) {
        return activityLogService.getFilteredLogs(role, date);
    }
}