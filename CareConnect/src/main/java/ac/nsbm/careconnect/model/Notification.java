package ac.nsbm.careconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // The user receiving the notification
    private String title;
    private String message;
    private String type; // e.g., "success", "info", "warning"
    private boolean isRead;
    private LocalDateTime date;

    @PrePersist
    protected void onCreate() {
        date = LocalDateTime.now();
        isRead = false;
    }
}