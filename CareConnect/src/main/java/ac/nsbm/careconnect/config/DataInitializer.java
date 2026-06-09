package ac.nsbm.careconnect.config;

import ac.nsbm.careconnect.model.Donation;
import ac.nsbm.careconnect.model.HelpRequest;
import ac.nsbm.careconnect.model.User;
import ac.nsbm.careconnect.repository.DonationRepository;
import ac.nsbm.careconnect.repository.HelpRequestRepository;
import ac.nsbm.careconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only add data if DB is empty
        if (userRepository.count() == 0) {

            // 1. Create Government Officer
            User gov = new User();
            gov.setEmail("gov@careconnect.com");
            gov.setPassword("123");
            gov.setRole("government");
            gov.setFirstName("Officer");
            gov.setLastName("Perera");
            userRepository.save(gov);

            // 2. Create Displaced Person
            User displaced = new User();
            displaced.setEmail("user@careconnect.com");
            displaced.setPassword("123");
            displaced.setRole("displaced");
            displaced.setFirstName("Kamal");
            displaced.setLastName("Silva");
            userRepository.save(displaced);

            // 3. Create Donor [FIXED: Added Address]
            User donor = new User();
            donor.setEmail("donor@careconnect.com");
            donor.setPassword("123");
            donor.setRole("donator");
            donor.setFirstName("Saman");
            donor.setLastName("Kumara");
            donor.setAddress("Colombo 07, Sri Lanka"); // [FIX] Address for Map
            donor.setLatitude(6.9271);
            donor.setLongitude(79.8612);
            userRepository.save(donor);

            // 4. Create Help Request (Red Dot)
            HelpRequest req1 = new HelpRequest();
            req1.setRequestType("Food");
            req1.setDescription("Rice needed");
            req1.setLocation("Gampaha"); // [FIX] Location for Map
            req1.setUrgency("High");
            req1.setStatus("Pending");
            req1.setContactName("Kamal Silva");
            req1.setUserId(displaced.getId());
            req1.setLatitude(7.0840);
            req1.setLongitude(79.9939);
            helpRequestRepository.save(req1);

            // 5. Create Sample Donation [FIXED: Linked to Donor]
            Donation don = new Donation();
            don.setDonorName("Saman Kumara");
            don.setDonorId(donor.getId()); // [FIX] Links to donor@careconnect.com
            don.setDonationType("Money");
            don.setAmount(5000);
            don.setStatus("PENDING");
            don.setDescription("Flood relief fund");
            donationRepository.save(don);

            System.out.println("✅ Sample Data Initialized: Address & Donation Linked.");
        }
    }
}