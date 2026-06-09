package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.HelpRequest;
import ac.nsbm.careconnect.model.User;
import ac.nsbm.careconnect.repository.HelpRequestRepository;
import ac.nsbm.careconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(origins = "*")
public class MapController {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/data")
    public List<Map<String, Object>> getMapData() {
        List<Map<String, Object>> mapData = new ArrayList<>();

        // 1. Displaced Persons (Help Requests)
        List<HelpRequest> requests = helpRequestRepository.findAll();
        for (HelpRequest req : requests) {
            if (req.getLatitude() != null && req.getLongitude() != null) {
                Map<String, Object> point = new HashMap<>();
                point.put("type", "request");
                point.put("lat", req.getLatitude());
                point.put("lng", req.getLongitude());
                point.put("title", req.getRequestType());
                // [FIX] Show Location/Town instead of generic description
                point.put("description", req.getLocation() != null ? req.getLocation() : "Unknown Location");
                point.put("urgency", req.getUrgency());
                mapData.add(point);
            }
        }

        // 2. Donors
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if ("donator".equalsIgnoreCase(user.getRole()) && user.getLatitude() != null && user.getLongitude() != null) {
                Map<String, Object> point = new HashMap<>();
                point.put("type", "donor");
                point.put("lat", user.getLatitude());
                point.put("lng", user.getLongitude());
                point.put("title", user.getFirstName() + " " + user.getLastName());
                // [FIX] Show User Address instead of "Registered Donor"
                point.put("description", user.getAddress() != null ? user.getAddress() : "Donor Location");
                mapData.add(point);
            }
        }
        return mapData;
    }
}