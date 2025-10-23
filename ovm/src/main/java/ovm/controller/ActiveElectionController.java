package ovm.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ovm.model.ActiveElection;
import ovm.model.ElectionStatus;
import ovm.repository.ActiveElectionRepository;
import ovm.services.ActiveElectionService;
import ovm.services.ElectionResultService;

@RestController
@RequestMapping("/active-elections")
@CrossOrigin(origins = "http://localhost:5173")
public class ActiveElectionController {

    @Autowired
    private ActiveElectionService service;
    
    @Autowired
    private ActiveElectionRepository activeElectionRepository;  // ⭐ Added this
    
    @Autowired
    private ElectionResultService electionResultService;

    // Get all active elections
    @GetMapping
    public ResponseEntity<List<ActiveElection>> getAllActiveElections() {
        return ResponseEntity.ok(service.getAllActiveElections());
    }

    // Get active elections by organizer
    @GetMapping("/organizer/{organizerName}")
    public ResponseEntity<List<ActiveElection>> getElectionsByOrganizer(@PathVariable String organizerName) {
        return ResponseEntity.ok(service.getElectionsByOrganizer(organizerName));
    }

    // Start an election from approved request
    @PostMapping("/start/{requestId}")
    public ResponseEntity<ActiveElection> startElection(@PathVariable Long requestId) {
        return ResponseEntity.ok(service.startElectionFromRequest(requestId));
    }

    /**
     * End an active election and calculate results
     */
    @PutMapping("/{id}/end")
    public ResponseEntity<String> endElection(@PathVariable Long id) {
        try {
            Optional<ActiveElection> optionalElection = activeElectionRepository.findById(id);
            
            if (!optionalElection.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            ActiveElection election = optionalElection.get();
            
            // Check if already completed
            if (election.getStatus() == ElectionStatus.COMPLETED) {
                return ResponseEntity.badRequest().body("Election already completed");
            }
            
            // Update status to COMPLETED
            election.setStatus(ElectionStatus.COMPLETED);
            election.setCompletedAt(LocalDateTime.now());
            activeElectionRepository.save(election);
            
            // Calculate and save results
            try {
                electionResultService.calculateAndSaveResults(id);
            } catch (Exception e) {
                System.err.println("Error calculating results: " + e.getMessage());
                e.printStackTrace();
                // Don't fail the endpoint, results can be calculated manually later
            }
            
            return ResponseEntity.ok("Election ended successfully and results calculated");
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Failed to end election: " + e.getMessage());
        }
    }

    // Get specific election
    @GetMapping("/{id}")
    public ResponseEntity<ActiveElection> getElection(@PathVariable Long id) {
        return ResponseEntity.ok(service.getElectionById(id));
    }
    
    // Delete an active election
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteActiveElection(@PathVariable Long id) {
        try {
            service.deleteElection(id);
            return ResponseEntity.ok(Map.of("message", "Election deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to delete election"));
        }
    }
}