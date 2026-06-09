package ac.nsbm.careconnect.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "resource_items")
public class ResourceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    private String type; // e.g., "Food", "Medical", "Shelter"
    private int quantity;
    private String warehouse; // e.g., "Central", "North District"
    private String status;    // e.g., "Available", "Low Stock"
    private String supplier;  // e.g., "Gov", "Donor A"

    @PrePersist
    @PreUpdate
    public void updateStatus() {
        if (quantity <= 0) status = "Depleted";
        else if (quantity < 50) status = "Critical";
        else if (quantity < 200) status = "Limited";
        else status = "Available";
    }
}