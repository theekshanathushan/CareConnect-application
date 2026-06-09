package ac.nsbm.careconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "help_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String requestType;
    private String urgency;
    private int quantity;
    private String timeframe;

    @Column(length = 1000)
    private String description;

    // --- DISPLACED PERSON DETAILS ---
    private String identityNumber;
    private String homeNumber;
    private String district;
    private String town;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String evidenceImage;

    // --- NEW LOCATION DATA ---
    private String location; // Text address
    private Double latitude; // GPS Lat
    private Double longitude; // GPS Lng
    // -------------------------

    private String contactName;
    private String contactPhone;
    private String status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "Pending";
    }
}