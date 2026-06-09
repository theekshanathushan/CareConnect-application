package ac.nsbm.careconnect.service;

import ac.nsbm.careconnect.model.HelpRequest;
import ac.nsbm.careconnect.model.ResourceItem;
import ac.nsbm.careconnect.repository.HelpRequestRepository;
import ac.nsbm.careconnect.repository.ResourceItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private ResourceItemRepository resourceItemRepository;

    // EXISTING: Generate CSV (for Excel/Raw Data export)
    public byte[] generateCsvReport(String type) {
        StringBuilder csvContent = new StringBuilder();

        if ("resource".equalsIgnoreCase(type)) {
            csvContent.append("ID,Title,Type,Quantity,Location,Description\n");
            List<ResourceItem> resources = resourceItemRepository.findAll();
            for (ResourceItem item : resources) {
                csvContent.append(item.getId()).append(",")
                        .append(escapeCsv(item.getTitle())).append(",")
                        .append(escapeCsv(item.getType())).append(",")
                        .append(item.getQuantity()).append(",")
                        .append(escapeCsv(item.getWarehouse())).append(",")
                        .append(escapeCsv(item.getDescription())).append("\n");
            }
        } else {
            // Default to Help Request Report
            csvContent.append("ID,Type,Applicant,NIC,District,Status,Date\n");
            List<HelpRequest> requests = helpRequestRepository.findAll();
            for (HelpRequest req : requests) {
                csvContent.append(req.getId()).append(",")
                        .append(escapeCsv(req.getRequestType())).append(",")
                        .append(escapeCsv(req.getContactName())).append(",")
                        .append(escapeCsv(req.getIdentityNumber())).append(",")
                        .append(escapeCsv(req.getDistrict())).append(",")
                        .append(req.getStatus()).append(",")
                        .append(req.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)).append("\n");
            }
        }
        return csvContent.toString().getBytes();
    }

    // NEW: Get Raw Data (For Frontend "View" and "PDF Generation")
    public List<?> getReportData(String type) {
        if ("resource".equalsIgnoreCase(type)) {
            return resourceItemRepository.findAll();
        } else {
            return helpRequestRepository.findAll();
        }
    }

    private String escapeCsv(String data) {
        if (data == null) return "";
        return "\"" + data.replace("\"", "\"\"") + "\"";
    }
}