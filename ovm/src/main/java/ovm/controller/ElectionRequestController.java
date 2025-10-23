package ovm.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ovm.model.ElectionRequest;
import ovm.services.ElectionRequestService;

@RestController
@RequestMapping("/election-requests")
@CrossOrigin(origins = "http://localhost:5173")
public class ElectionRequestController {

    @Autowired
    private ElectionRequestService service;

    // Organizer submits request
    @PostMapping
    public ResponseEntity<ElectionRequest> createRequest(@RequestBody ElectionRequest request) {
        return ResponseEntity.ok(service.createRequest(request));
    }

    // Admin views all requests
    @GetMapping
    public ResponseEntity<List<ElectionRequest>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    // Admin approves request - specific endpoint
    @PutMapping("/{id}/approve")
    public ResponseEntity<ElectionRequest> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(service.updateStatus(id, "APPROVED"));
    }

    // Admin rejects request - specific endpoint  
    @PutMapping("/{id}/reject")
    public ResponseEntity<ElectionRequest> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(service.updateStatus(id, "REJECTED"));
    }

    // Generic status update (keep for flexibility)
    @PutMapping("/{id}/status")
    public ResponseEntity<ElectionRequest> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
}