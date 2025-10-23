package ovm.services;

import ovm.model.*;
import ovm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ElectionResultService {
    
    @Autowired
    private ElectionResultRepository resultRepository;
    
    @Autowired
    private VoteRepository voteRepository;
    
    @Autowired
    private CandidateRepository candidateRepository;
    
    @Autowired
    private ActiveElectionRepository activeElectionRepository;
    
    @Autowired
    private VoterRegistrationRepository voterRegistrationRepository;
    
    /**
     * Calculate and save results when an election is completed
     */
    @Transactional
    public void calculateAndSaveResults(Long electionId) {
        // Get the active election
        ActiveElection election = activeElectionRepository.findById(electionId)
            .orElseThrow(() -> new RuntimeException("Election not found"));
        
        // Check if results already exist
        if (resultRepository.existsByElectionId(electionId)) {
            System.out.println("Results already exist for election: " + electionId);
            return;
        }
        
        // Get all votes for this election
        List<Vote> votes = voteRepository.findByElectionId(electionId);
        
        // Get all candidates for this election
        List<Candidate> candidates = candidateRepository.findByElectionId(electionId);
        
        // Get total eligible voters
        int totalEligibleVoters = voterRegistrationRepository.countByElectionId(electionId);
        int totalVotesCast = votes.size();
        
        // Group votes by position
        Map<String, List<Vote>> votesByPosition = votes.stream()
            .collect(Collectors.groupingBy(Vote::getPosition));
        
        // Group candidates by position
        Map<String, List<Candidate>> candidatesByPosition = candidates.stream()
            .collect(Collectors.groupingBy(Candidate::getPosition));
        
        List<ElectionResult> results = new ArrayList<>();
        
        // Calculate results for each position
        for (String position : candidatesByPosition.keySet()) {
            List<Vote> positionVotes = votesByPosition.getOrDefault(position, new ArrayList<>());
            List<Candidate> positionCandidates = candidatesByPosition.get(position);
            
            // Count votes for each candidate
            Map<Long, Long> voteCounts = positionVotes.stream()
                .collect(Collectors.groupingBy(Vote::getCandidateId, Collectors.counting()));
            
            // Find max votes for winner determination
            long maxVotes = voteCounts.values().stream()
                .max(Long::compareTo)
                .orElse(0L);
            
            // Create result entry for each candidate
            for (Candidate candidate : positionCandidates) {
                ElectionResult result = new ElectionResult();
                result.setElectionId(electionId);
                result.setElectionTitle(election.getElectionTitle());
                result.setOrganizerName(election.getOrganizerName());
                result.setPosition(position);
                result.setCandidateName(candidate.getName());
                result.setCandidateParty(candidate.getParty());
                
                int candidateVotes = voteCounts.getOrDefault(candidate.getId(), 0L).intValue();
                result.setVotesReceived(candidateVotes);
                
                // Calculate percentage
                double percentage = positionVotes.isEmpty() ? 0.0 : 
                    (candidateVotes * 100.0) / positionVotes.size();
                result.setVotePercentage(Math.round(percentage * 100.0) / 100.0);
                
                // Mark winner
                result.setIsWinner(candidateVotes == maxVotes && maxVotes > 0);
                
                result.setTotalVotesCast(totalVotesCast);
                result.setTotalEligibleVoters(totalEligibleVoters);
                result.setCompletedAt(LocalDateTime.now());
                
                results.add(result);
            }
        }
        
        // Save all results
        resultRepository.saveAll(results);
        System.out.println("Saved " + results.size() + " result entries for election: " + electionId);
    }
    
    /**
     * Get results grouped by election for an organizer
     */
    public List<Map<String, Object>> getOrganizerResults(String organizerName) {
        List<ElectionResult> allResults = resultRepository.findByOrganizerNameOrderByCompletedAtDesc(organizerName);
        return groupResultsByElection(allResults);
    }
    
    /**
     * Get all results grouped by election (for admin)
     */
    public List<Map<String, Object>> getAllResults() {
        List<ElectionResult> allResults = resultRepository.findAllByOrderByCompletedAtDesc();
        return groupResultsByElection(allResults);
    }
    
    /**
     * Get results for a specific election
     */
    public Map<String, Object> getElectionResults(Long electionId) {
        List<ElectionResult> results = resultRepository.findByElectionIdOrderByPositionAscVotesReceivedDesc(electionId);
        
        if (results.isEmpty()) {
            return null;
        }
        
        ElectionResult firstResult = results.get(0);
        
        // Group by position
        Map<String, List<Map<String, Object>>> positionResults = new LinkedHashMap<>();
        
        for (ElectionResult result : results) {
            String position = result.getPosition();
            
            if (!positionResults.containsKey(position)) {
                positionResults.put(position, new ArrayList<>());
            }
            
            Map<String, Object> candidateData = new HashMap<>();
            candidateData.put("name", result.getCandidateName());
            candidateData.put("party", result.getCandidateParty());
            candidateData.put("votes", result.getVotesReceived());
            candidateData.put("percentage", result.getVotePercentage());
            candidateData.put("isWinner", result.getIsWinner());
            
            positionResults.get(position).add(candidateData);
        }
        
        Map<String, Object> electionData = new HashMap<>();
        electionData.put("electionId", electionId);
        electionData.put("electionTitle", firstResult.getElectionTitle());
        electionData.put("organizerName", firstResult.getOrganizerName());
        electionData.put("totalVotesCast", firstResult.getTotalVotesCast());
        electionData.put("totalEligibleVoters", firstResult.getTotalEligibleVoters());
        electionData.put("completedAt", firstResult.getCompletedAt());
        electionData.put("positions", positionResults);
        
        return electionData;
    }
    
    /**
     * Helper method to group results by election
     */
    private List<Map<String, Object>> groupResultsByElection(List<ElectionResult> results) {
        Map<Long, List<ElectionResult>> groupedResults = results.stream()
            .collect(Collectors.groupingBy(ElectionResult::getElectionId));
        
        List<Map<String, Object>> electionsList = new ArrayList<>();
        
        for (Map.Entry<Long, List<ElectionResult>> entry : groupedResults.entrySet()) {
            List<ElectionResult> electionResults = entry.getValue();
            ElectionResult firstResult = electionResults.get(0);
            
            // Group by position
            Map<String, List<Map<String, Object>>> positionResults = new LinkedHashMap<>();
            
            for (ElectionResult result : electionResults) {
                String position = result.getPosition();
                
                if (!positionResults.containsKey(position)) {
                    positionResults.put(position, new ArrayList<>());
                }
                
                Map<String, Object> candidateData = new HashMap<>();
                candidateData.put("name", result.getCandidateName());
                candidateData.put("party", result.getCandidateParty());
                candidateData.put("votes", result.getVotesReceived());
                candidateData.put("percentage", result.getVotePercentage());
                candidateData.put("isWinner", result.getIsWinner());
                
                positionResults.get(position).add(candidateData);
            }
            
            Map<String, Object> electionData = new HashMap<>();
            electionData.put("electionId", entry.getKey());
            electionData.put("electionTitle", firstResult.getElectionTitle());
            electionData.put("organizerName", firstResult.getOrganizerName());
            electionData.put("totalVotesCast", firstResult.getTotalVotesCast());
            electionData.put("totalEligibleVoters", firstResult.getTotalEligibleVoters());
            electionData.put("turnoutPercentage", 
                Math.round((firstResult.getTotalVotesCast() * 100.0 / firstResult.getTotalEligibleVoters()) * 100.0) / 100.0);
            electionData.put("completedAt", firstResult.getCompletedAt());
            electionData.put("positions", positionResults);
            
            electionsList.add(electionData);
        }
        
        return electionsList;
    }
}