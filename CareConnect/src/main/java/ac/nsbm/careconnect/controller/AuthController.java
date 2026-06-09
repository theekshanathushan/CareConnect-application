package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.model.User;
import ac.nsbm.careconnect.service.ActivityLogService;
import ac.nsbm.careconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User newUser = userService.registerUser(user);

            // Log Registration
            activityLogService.logActivity(
                    newUser.getEmail(),
                    newUser.getRole(),
                    "REGISTER",
                    "New user registered: " + newUser.getFirstName()
            );

            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        Optional<User> userOpt = userService.login(loginData.getEmail(), loginData.getPassword());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Log Login Success
            activityLogService.logActivity(
                    user.getEmail(),
                    user.getRole(),
                    "LOGIN",
                    "User logged in successfully"
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("role", user.getRole());
            response.put("name", user.getFirstName() + " " + user.getLastName());
            response.put("id", user.getId());

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}