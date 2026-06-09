package ac.nsbm.careconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;
    private Long receiverId; // Can be 0 or null for system/group messages
    private String senderName; // For display purposes

    @Column(length = 1000)
    private String content;

    private LocalDateTime timestamp;

    // Field to track if the message has been read
    private boolean isRead = false;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}