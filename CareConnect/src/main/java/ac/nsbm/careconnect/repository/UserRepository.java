package ac.nsbm.careconnect.repository;

import ac.nsbm.careconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    long countByRole(String role);
    Optional<User> findByEmailAndPassword(String email, String password);

    // --- ADD THIS METHOD ---
    List<User> findByRole(String role);
}