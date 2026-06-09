package ac.nsbm.careconnect.controller;

import ac.nsbm.careconnect.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*") // Allows requests from frontend
public class ReportController {

    @Autowired
    private ReportService reportService;

    // 1. Download as CSV (Existing logic)
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadReport(@RequestParam String type) {
        byte[] content = reportService.generateCsvReport(type);
        String filename = type + "_report_" + System.currentTimeMillis() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(content);
    }

    // 2. View/Fetch Data as JSON (New Logic for PDF/View)
    @GetMapping("/data")
    public ResponseEntity<List<?>> getReportData(@RequestParam String type) {
        List<?> data = reportService.getReportData(type);
        return ResponseEntity.ok(data);
    }
}