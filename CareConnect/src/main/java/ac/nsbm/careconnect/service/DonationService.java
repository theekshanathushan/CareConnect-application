package ac.nsbm.careconnect.service;

import ac.nsbm.careconnect.model.Donation;
import ac.nsbm.careconnect.model.HelpRequest;
import ac.nsbm.careconnect.repository.DonationRepository;
import ac.nsbm.careconnect.repository.HelpRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public Donation createDonation(Donation donation) {
        // 1. Save the Donation
        Donation savedDonation = donationRepository.save(donation);

        // 2. Log the Activity (Fixes Activity Log Page)
        activityLogService.logActivity(
                savedDonation.getDonorName(),
                "DONOR",
                "DONATION_MADE",
                "Donated " + savedDonation.getAmount() + " (" + savedDonation.getDonationType() + ") for " + savedDonation.getCause()
        );

        // 3. Distribution Logic: Automatically update the linked Request
        if (donation.getRequestId() != null) {
            Optional<HelpRequest> requestOpt = helpRequestRepository.findById(donation.getRequestId());
            if (requestOpt.isPresent()) {
                HelpRequest request = requestOpt.get();
                // Update status to indicate distribution/funding
                request.setStatus("Funded");
                helpRequestRepository.save(request);

                // Log the Distribution
                activityLogService.logActivity(
                        "System",
                        "SYSTEM",
                        "DISTRIBUTION",
                        "Allocated donation to Request ID: " + request.getId()
                );
            }
        }

        return savedDonation;
    }

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    public List<Donation> getDonationsByDonor(Long donorId) {
        return donationRepository.findByDonorId(donorId);
    }
}