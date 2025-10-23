package ovm.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ovm.model.ElectionRequest;
import ovm.model.ActiveElection;
import ovm.model.RequestStatus;
import ovm.repository.ElectionRequestRepository;
import ovm.repository.ActiveElectionRepository;

@Service
public class ElectionRequestServiceImpl implements ElectionRequestService {

    @Autowired
    private ElectionRequestRepository repository;
    
    @Autowired
    private ActiveElectionRepository activeElectionRepository;

    @Override
    public ElectionRequest createRequest(ElectionRequest request) {
        request.setStatus(RequestStatus.PENDING);
        return repository.save(request);
    }

    @Override
    public List<ElectionRequest> getAllRequests() {
        return repository.findAll();
    }

    @Override
    @Transactional
    public ElectionRequest updateStatus(Long id, String status) {
        ElectionRequest req = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        RequestStatus newStatus = RequestStatus.valueOf(status.toUpperCase());
        req.setStatus(newStatus);
        
        ElectionRequest savedRequest = repository.save(req);
        
        // If approved, automatically create an active election
        if (newStatus == RequestStatus.APPROVED) {
            createActiveElectionFromRequest(savedRequest);
        }
        
        return savedRequest;
    }
    
    @Override
    @Transactional
    public ActiveElection approveAndCreateActiveElection(Long requestId) {
        // Update request status to approved
        ElectionRequest request = updateStatus(requestId, "APPROVED");
        
        // Create and return active election
        return createActiveElectionFromRequest(request);
    }
    
    private ActiveElection createActiveElectionFromRequest(ElectionRequest request) {
        // Check if active election already exists for this request
        // to avoid duplicates
        List<ActiveElection> existing = activeElectionRepository.findAll();
        boolean alreadyExists = existing.stream()
                .anyMatch(ae -> ae.getOriginalRequestId() != null && 
                              ae.getOriginalRequestId().equals(request.getId()));
        
        if (!alreadyExists) {
            ActiveElection activeElection = new ActiveElection(request);
            return activeElectionRepository.save(activeElection);
        }
        
        // Return existing one if found
        return existing.stream()
                .filter(ae -> ae.getOriginalRequestId() != null && 
                             ae.getOriginalRequestId().equals(request.getId()))
                .findFirst()
                .orElse(null);
    }
}