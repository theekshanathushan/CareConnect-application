package ac.nsbm.careconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long donorId;
    private String donorName;
    private String cause; // e.g., "Flood Relief" or "Request #123"
    private String donationType; // Money, Food, etc.
    private double amount;
    private String contactNumber;
    private String description;

    // --- LINK TO REQUEST ---
    private Long requestId;

    // --- NEW STATUS FIELD (Required for Approval System) ---
    private String status; // "PENDING", "APPROVED", "REJECTED"
    // -------------------------------------------------------

    private LocalDateTime donationDate;

    @PrePersist
    protected void onCreate() {
        this.donationDate = LocalDateTime.now();
        // Set default status if missing
        if (this.status == null || this.status.isEmpty()) {
            this.status = "PENDING";
        }
    }
}