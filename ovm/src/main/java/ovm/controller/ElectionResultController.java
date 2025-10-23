package ovm.controller;

import ovm.services.ElectionResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/election-results")
@CrossOrigin(origins = "http://localhost:3000")
public class ElectionResultController {
    
    @Autowired
    private ElectionResultService resultService;
    
    /**
     * Get results for a specific organizer
     * GET /api/election-results/organizer/{organizerName}
     */
    @GetMapping("/organizer/{organizerName}")
    public ResponseEntity<List<Map<String, Object>>> getOrganizerResults(
            @PathVariable String organizerName) {
        try {
            List<Map<String, Object>> results = resultService.getOrganizerResults(organizerName);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get all election results (admin only)
     * GET /api/election-results/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllResults() {
        try {
            List<Map<String, Object>> results = resultService.getAllResults();
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get results for a specific election
     * GET /api/election-results/election/{electionId}
     */
    @GetMapping("/election/{electionId}")
    public ResponseEntity<Map<String, Object>> getElectionResults(
            @PathVariable Long electionId) {
        try {
            Map<String, Object> results = resultService.getElectionResults(electionId);
            if (results == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Manually trigger result calculation (admin only)
     * POST /api/election-results/calculate/{electionId}
     */
    @PostMapping("/calculate/{electionId}")
    public ResponseEntity<String> calculateResults(@PathVariable Long electionId) {
        try {
            resultService.calculateAndSaveResults(electionId);
            return ResponseEntity.ok("Results calculated and saved successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Failed to calculate results: " + e.getMessage());
        }
    }
}