package ovm.repository;

import ovm.model.ElectionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElectionResultRepository extends JpaRepository<ElectionResult, Long> {
    
    // Find all results for a specific election
    List<ElectionResult> findByElectionIdOrderByPositionAscVotesReceivedDesc(Long electionId);
    
    // Find all results for a specific organizer
    List<ElectionResult> findByOrganizerNameOrderByCompletedAtDesc(String organizerName);
    
    // Find all results ordered by completion date
    List<ElectionResult> findAllByOrderByCompletedAtDesc();
    
    // Get distinct election IDs for an organizer
    @Query("SELECT DISTINCT r.electionId FROM ElectionResult r WHERE r.organizerName = :organizerName")
    List<Long> findDistinctElectionIdsByOrganizerName(@Param("organizerName") String organizerName);
    
    // Get distinct election IDs (all)
    @Query("SELECT DISTINCT r.electionId FROM ElectionResult r")
    List<Long> findDistinctElectionIds();
    
    // Check if results exist for an election
    boolean existsByElectionId(Long electionId);
    
    // Delete results by election ID
    void deleteByElectionId(Long electionId);
}
