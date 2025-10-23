package ovm.controller;

import ovm.model.*;
import ovm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ElectionController {

    @Autowired
    private ActiveElectionRepository activeElectionRepository;
    
    @Autowired
    private CandidateRepository candidateRepository;
    
    @Autowired
    private VoterRegistrationRepository voterRegistrationRepository;
    
    @Autowired
    private VoteRepository voteRepository;
    
    @Autowired
    private ElectionRequestRepository electionRequestRepository;

    // 1. Get registered voters for organizer's elections
    @GetMapping("/organizers/{organizerName}/registered-voters")
    public ResponseEntity<List<VoterWithElectionDTO>> getRegisteredVotersForOrganizer(
            @PathVariable String organizerName) {
        
        List<ActiveElection> organizerElections = activeElectionRepository
                .findByOrganizerName(organizerName);
        
        List<VoterWithElectionDTO> allVoters = new ArrayList<>();
        
        for (ActiveElection election : organizerElections) {
            List<VoterRegistration> registrations = voterRegistrationRepository
                    .findByElectionId(election.getId());
            
            for (VoterRegistration reg : registrations) {
                String registeredDate = reg.getRegisteredDate() != null
                        ? reg.getRegisteredDate().toString()
                        : null;
                allVoters.add(new VoterWithElectionDTO(
                    reg.getId(),
                    reg.getVoterAadhar(),
                    reg.getVoterName(),
                    reg.getVoterEmail(),
                    election.getId(),
                    election.getElectionTitle(),
                    registeredDate
                ));
            }
        }
        
        return ResponseEntity.ok(allVoters);
    }

    // 2. Get candidates for organizer's elections
    @GetMapping("/organizers/{organizerName}/candidates")
    public ResponseEntity<List<CandidateWithElectionDTO>> getCandidatesForOrganizer(
            @PathVariable String organizerName) {
        
        List<ActiveElection> organizerElections = activeElectionRepository
                .findByOrganizerName(organizerName);
        
        List<CandidateWithElectionDTO> allCandidates = new ArrayList<>();
        
        for (ActiveElection election : organizerElections) {
            List<Candidate> candidates = candidateRepository.findByElectionId(election.getId());
            
            for (Candidate candidate : candidates) {
                allCandidates.add(new CandidateWithElectionDTO(
                    candidate.getId(),
                    candidate.getName(),
                    candidate.getPosition(),
                    candidate.getParty(),
                    election.getId(),
                    election.getElectionTitle()
                ));
            }
        }
        
        return ResponseEntity.ok(allCandidates);
    }

    // 3. Add candidate to election
    @PostMapping("/elections/{electionId}/candidates")
    public ResponseEntity<?> addCandidate(
            @PathVariable Long electionId,
            @RequestBody CandidateDTO candidateDTO) {
        
        Optional<ActiveElection> electionOpt = activeElectionRepository.findById(electionId);
        if (electionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Election not found"));
        }
        
        Candidate candidate = new Candidate();
        candidate.setName(candidateDTO.getName());
        candidate.setPosition(candidateDTO.getPosition());
        candidate.setParty(candidateDTO.getParty());
        candidate.setElectionId(electionId);
        candidate.setVotes(0);
        
        Candidate saved = candidateRepository.save(candidate);
        return ResponseEntity.ok(saved);
    }

    // 4. Register voter for election
    @PostMapping("/elections/{electionId}/register")
    public ResponseEntity<?> registerVoter(
            @PathVariable Long electionId,
            @RequestParam(required = false) Boolean isRequest,
            @RequestBody VoterRegistrationDTO registrationDTO) {
        
        String electionTitle;
        String organizerName;
        
        if (Boolean.TRUE.equals(isRequest)) {
            Optional<ElectionRequest> requestOpt = electionRequestRepository.findById(electionId);
            if (requestOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Election request not found"));
            }
            
            ElectionRequest request = requestOpt.get();
            if (request.getStatus() != RequestStatus.APPROVED) {
                return ResponseEntity.badRequest().body(Map.of("message", "Election is not approved for registration"));
            }
            
            electionTitle = request.getElectionTitle();
            organizerName = request.getOrganizerName();
        } else {
            Optional<ActiveElection> electionOpt = activeElectionRepository.findById(electionId);
            if (electionOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Election not found"));
            }
            
            ActiveElection election = electionOpt.get();
            if (election.getStatus() != ElectionStatus.ACTIVE) {
                return ResponseEntity.badRequest().body(Map.of("message", "Election is not active for registration"));
            }
            
            electionTitle = election.getElectionTitle();
            organizerName = election.getOrganizerName();
        }
        
        Optional<VoterRegistration> existing = voterRegistrationRepository
                .findByElectionIdAndVoterEmail(electionId, registrationDTO.getVoterEmail());
        
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already registered for this election"));
        }
        
        VoterRegistration registration = new VoterRegistration();
        registration.setElectionId(electionId);
        registration.setElectionName(electionTitle);
        registration.setVoterEmail(registrationDTO.getVoterEmail());
        registration.setVoterName(registrationDTO.getVoterName());
        registration.setVoterPhone(registrationDTO.getVoterPhone());
        registration.setVoterAadhar(registrationDTO.getVoterAadhar());
        registration.setRegisteredDate(LocalDateTime.now());
        registration.setHasVoted(false);
        
        VoterRegistration saved = voterRegistrationRepository.save(registration);
        
        return ResponseEntity.ok(saved);
    }

    // 5. Get available elections
    @GetMapping("/elections/available")
    public ResponseEntity<List<Map<String, Object>>> getAvailableElections() {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<Long, Map<String, Object>> electionMap = new HashMap<>();
        
        // First, get all APPROVED requests
        List<ElectionRequest> approvedRequests = electionRequestRepository.findByStatus(RequestStatus.APPROVED);
        for (ElectionRequest req : approvedRequests) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", req.getId());
            map.put("title", req.getElectionTitle());
            map.put("description", req.getDescription());
            map.put("startDate", req.getStartDate());
            map.put("endDate", req.getEndDate());
            map.put("organizer", req.getOrganizerName());
            map.put("status", "APPROVED");
            map.put("isRequest", true);
            electionMap.put(req.getId(), map);
        }
        
        // Then, update with ACTIVE elections (these override APPROVED status)
        List<ActiveElection> activeElections = activeElectionRepository.findByStatus(ElectionStatus.ACTIVE);
        for (ActiveElection election : activeElections) {
            Long requestId = election.getOriginalRequestId();
            
            if (requestId != null && electionMap.containsKey(requestId)) {
                // Update existing entry
                Map<String, Object> map = electionMap.get(requestId);
                map.put("status", "ACTIVE");
                map.put("activeElectionId", election.getId());
                map.put("isRequest", false);
            } else {
                // Add new entry (orphaned active election)
                Map<String, Object> map = new HashMap<>();
                map.put("id", election.getId());
                map.put("title", election.getElectionTitle());
                map.put("description", election.getDescription());
                map.put("startDate", election.getStartDate());
                map.put("endDate", election.getEndDate());
                map.put("organizer", election.getOrganizerName());
                map.put("status", "ACTIVE");
                map.put("activeElectionId", election.getId());
                map.put("isRequest", false);
                electionMap.put(election.getId(), map);
            }
        }
        
        result.addAll(electionMap.values());
        return ResponseEntity.ok(result);
    }
    // 6. Get voter's registrations
    @GetMapping("/voters/{voterEmail}/registrations")
    public ResponseEntity<List<Map<String, Object>>> getVoterRegistrations(
            @PathVariable String voterEmail) {
        
        List<VoterRegistration> registrations = voterRegistrationRepository.findByVoterEmail(voterEmail);
        
        List<Map<String, Object>> result = registrations.stream()
                .map(reg -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("electionId", reg.getElectionId());
                    map.put("registeredDate", reg.getRegisteredDate() != null ? reg.getRegisteredDate().toString() : null);
                    map.put("hasVoted", reg.isHasVoted());
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    // 7. Cast vote
    @PostMapping("/elections/{electionId}/vote")
    public ResponseEntity<?> castVote(
            @PathVariable Long electionId,
            @RequestBody VoteDTO voteDTO) {
        
        Optional<ActiveElection> electionOpt = activeElectionRepository.findById(electionId);
        if (electionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Election not found or not started yet"));
        }
        
        ActiveElection election = electionOpt.get();
        if (election.getStatus() != ElectionStatus.ACTIVE) {
            return ResponseEntity.badRequest().body(Map.of("message", "Election is not currently active for voting"));
        }
        
        Optional<VoterRegistration> regOpt = voterRegistrationRepository
                .findByElectionIdAndVoterEmail(electionId, voteDTO.getVoterEmail());
        
        if (regOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not registered for this election"));
        }
        
        VoterRegistration registration = regOpt.get();
        
        if (registration.isHasVoted()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already voted in this election"));
        }
        
        for (Map.Entry<String, Long> entry : voteDTO.getVotes().entrySet()) {
            String position = entry.getKey();
            Long candidateId = entry.getValue();
            
            Vote vote = new Vote();
            vote.setElectionId(electionId);
            vote.setVoterEmail(voteDTO.getVoterEmail());
            vote.setCandidateId(candidateId);
            vote.setPosition(position);
            vote.setVotedAt(LocalDateTime.now());
            voteRepository.save(vote);
            
            Optional<Candidate> candidateOpt = candidateRepository.findById(candidateId);
            if (candidateOpt.isPresent()) {
                Candidate candidate = candidateOpt.get();
                candidate.setVotes(candidate.getVotes() + 1);
                candidateRepository.save(candidate);
            }
        }
        
        registration.setHasVoted(true);
        voterRegistrationRepository.save(registration);
        
        election.setVotedCount(election.getVotedCount() + 1);
        activeElectionRepository.save(election);
        
        return ResponseEntity.ok(Map.of("message", "Vote cast successfully"));
    }

    // 8. Get candidates for election
    @GetMapping("/elections/{electionId}/candidates")
    public ResponseEntity<List<Candidate>> getElectionCandidates(@PathVariable Long electionId) {
        List<Candidate> candidates = candidateRepository.findByElectionId(electionId);
        return ResponseEntity.ok(candidates);
    }

    // 9. Get voting history for voter
    @GetMapping("/voters/{voterEmail}/history")
    public ResponseEntity<List<Map<String, Object>>> getVotingHistory(@PathVariable String voterEmail) {
        
        List<VoterRegistration> registrations = voterRegistrationRepository.findByVoterEmail(voterEmail);
        
        List<Map<String, Object>> history = registrations.stream()
                .filter(reg -> reg.isHasVoted())
                .map(reg -> {
                    Optional<ActiveElection> electionOpt = activeElectionRepository.findById(reg.getElectionId());
                    
                    Map<String, Object> map = new HashMap<>();
                    if (electionOpt.isPresent()) {
                        ActiveElection election = electionOpt.get();
                        map.put("id", election.getId());
                        map.put("title", election.getElectionTitle());
                        map.put("electionId", election.getId());
                        map.put("dateVoted", reg.getRegisteredDate() != null ? reg.getRegisteredDate().toString() : null);
                        
                        List<Vote> votes = voteRepository.findByVoterEmail(voterEmail)
                                .stream()
                                .filter(v -> v.getElectionId().equals(reg.getElectionId()))
                                .collect(Collectors.toList());
                        
                        List<String> positions = votes.stream()
                                .map(Vote::getPosition)
                                .distinct()
                                .collect(Collectors.toList());
                        
                        map.put("participatedPositions", positions);
                    }
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(history);
    }

    // 10. Get completed elections with results (UPDATED - ONLY KEEP THIS VERSION)
    @GetMapping("/elections/completed")
    public ResponseEntity<List<Map<String, Object>>> getCompletedElections() {
        List<ActiveElection> completedElections = activeElectionRepository.findByStatus(ElectionStatus.COMPLETED);
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (ActiveElection election : completedElections) {
            Map<String, Object> electionMap = new HashMap<>();
            electionMap.put("id", election.getId());
            electionMap.put("title", election.getElectionTitle());
            electionMap.put("organizer", election.getOrganizerName());
            electionMap.put("startDate", election.getStartDate());
            electionMap.put("endDate", election.getEndDate());
            electionMap.put("completedAt", election.getCompletedAt()); // New field
            electionMap.put("votedCount", election.getVotedCount());
            electionMap.put("totalVoters", election.getTotalVoters());
            
            // Get results by position
            List<Candidate> candidates = candidateRepository.findByElectionId(election.getId());
            Map<String, List<Candidate>> byPosition = candidates.stream()
                    .collect(Collectors.groupingBy(Candidate::getPosition));
            
            List<Map<String, Object>> results = new ArrayList<>();
            String overallWinner = null;
            int maxVotes = 0;
            
            for (Map.Entry<String, List<Candidate>> entry : byPosition.entrySet()) {
                Map<String, Object> positionResult = new HashMap<>();
                positionResult.put("position", entry.getKey());
                
                List<Candidate> positionCandidates = entry.getValue();
                positionCandidates.sort((a, b) -> Integer.compare(b.getVotes(), a.getVotes()));
                
                if (!positionCandidates.isEmpty()) {
                    Candidate winner = positionCandidates.get(0);
                    positionResult.put("winner", winner.getName());
                    positionResult.put("votes", winner.getVotes());
                    
                    // Track overall winner (most votes across all positions)
                    if (winner.getVotes() > maxVotes) {
                        maxVotes = winner.getVotes();
                        overallWinner = winner.getName();
                    }
                    
                    int totalVotes = positionCandidates.stream()
                            .mapToInt(Candidate::getVotes)
                            .sum();
                    positionResult.put("percentage", 
                            totalVotes > 0 ? (winner.getVotes() * 100.0 / totalVotes) : 0);
                }
                
                // Add all candidates
                List<Map<String, Object>> candidatesList = positionCandidates.stream()
                        .map(c -> {
                            Map<String, Object> cMap = new HashMap<>();
                            cMap.put("name", c.getName());
                            cMap.put("votes", c.getVotes());
                            int total = positionCandidates.stream()
                                    .mapToInt(Candidate::getVotes).sum();
                            cMap.put("percentage", 
                                    total > 0 ? (c.getVotes() * 100.0 / total) : 0);
                            return cMap;
                        })
                        .collect(Collectors.toList());
                
                positionResult.put("candidates", candidatesList);
                results.add(positionResult);
            }
            
            electionMap.put("results", results);
            electionMap.put("winner", overallWinner); // Add overall winner
            result.add(electionMap);
        }
        
        return ResponseEntity.ok(result);
    }
 // In your controller on port 7075
    @PutMapping("/active-elections/{electionId}/end")
    public ResponseEntity<?> endElection(@PathVariable Long electionId) {
        Optional<ActiveElection> electionOpt = activeElectionRepository.findById(electionId);
        
        if (electionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ActiveElection election = electionOpt.get();
        
        // Set status to COMPLETED
        election.setStatus(ElectionStatus.COMPLETED);
        
        // Set the completion timestamp
        election.setCompletedAt(LocalDateTime.now());
        
        // Save to database
        activeElectionRepository.save(election);
        
        return ResponseEntity.ok(Map.of("message", "Election ended successfully"));
    }
}