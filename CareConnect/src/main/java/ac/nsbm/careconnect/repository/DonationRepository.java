package ac.nsbm.careconnect.repository;

import ac.nsbm.careconnect.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    // Required for Donor Dashboard
    List<Donation> findByDonorId(Long donorId);

    // [FIX] Add this method to resolve the error
    List<Donation> findByStatus(String status);
}