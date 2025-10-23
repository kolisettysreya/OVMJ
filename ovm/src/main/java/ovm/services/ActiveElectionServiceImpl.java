package ovm.services;

import java.util.List;
import java.util.Optional;
import ovm.repository.VoterRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ovm.model.ActiveElection;
import ovm.model.ElectionRequest;
import ovm.model.ElectionStatus;
import ovm.model.RequestStatus;
import ovm.model.VoterRegistration;
import ovm.repository.ActiveElectionRepository;
import ovm.repository.ElectionRequestRepository;

@Service
public class ActiveElectionServiceImpl implements ActiveElectionService {
	@Override
	public void deleteElection(Long id) {
	    activeElectionRepository.deleteById(id);
	}
	@Autowired
	private VoterRegistrationRepository voterRegistrationRepository;

    @Autowired
    private ActiveElectionRepository activeElectionRepository;
    
    @Autowired
    private ElectionRequestRepository electionRequestRepository;

    @Override
    public List<ActiveElection> getAllActiveElections() {
        return activeElectionRepository.findAll();
    }

    @Override
    public List<ActiveElection> getElectionsByOrganizer(String organizerName) {
        return activeElectionRepository.findByOrganizerName(organizerName);
    }

    
    @Override
    @Transactional
    public ActiveElection startElectionFromRequest(Long requestId) {
        ElectionRequest request = electionRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Election request not found"));
        
        // Check 1: Must be approved
        if (request.getStatus() != RequestStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED elections can be started. Current status: " + request.getStatus());
        }
        
        // Check 2: Handle existing active elections for this request
        Optional<ActiveElection> existingActive = activeElectionRepository.findAll().stream()
            .filter(ae -> ae.getOriginalRequestId() != null && 
                         ae.getOriginalRequestId().equals(requestId))
            .findFirst();
        
        if (existingActive.isPresent()) {
            ActiveElection existing = existingActive.get();
            
            // If it's already ACTIVE, just return it (idempotent operation)
            if (existing.getStatus() == ElectionStatus.ACTIVE) {
                return existing;
            }
            
            // If it's COMPLETED or CANCELLED, this is a new start attempt - delete the old one
            activeElectionRepository.delete(existing);
        }
        
        // Create new active election
        ActiveElection activeElection = new ActiveElection(request);
        activeElection.setStatus(ElectionStatus.ACTIVE);
        ActiveElection saved = activeElectionRepository.save(activeElection);
        
        // Update voter registrations
        List<VoterRegistration> registrations = voterRegistrationRepository
            .findByElectionId(requestId);
        
        for (VoterRegistration reg : registrations) {
            reg.setElectionId(saved.getId());
            reg.setElectionName(saved.getElectionTitle());
            voterRegistrationRepository.save(reg);
        }
        
        saved.setTotalVoters(registrations.size());
        activeElectionRepository.save(saved);
        
        // Mark request as STARTED
        request.setStatus(RequestStatus.STARTED);
        electionRequestRepository.save(request);
        
        return saved;
    }
    @Override
    @Transactional
    public ActiveElection endElection(Long electionId) {
        ActiveElection election = activeElectionRepository.findById(electionId)
                .orElseThrow(() -> new RuntimeException("Active election not found"));

        election.setStatus(ElectionStatus.COMPLETED);
        return activeElectionRepository.save(election);
        
    }
    

    @Override
    public ActiveElection getElectionById(Long id) {
        return activeElectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Active election not found"));
    }
}