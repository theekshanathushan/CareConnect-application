package ac.nsbm.careconnect.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String email;

    private String password;
    private String phone;
    private String address;
    private String role;
    private String gender;

    // --- NEW LOCATION DATA ---
    private Double latitude;
    private Double longitude;
    // -------------------------

    private String status;

    @PrePersist
    protected void onCreate() {
        if (status == null) status = "Active";
    }
}