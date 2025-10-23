package ovm.repository;

import ovm.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    List<Vote> findByElectionId(Long electionId);
    List<Vote> findByVoterEmail(String voterEmail);
    boolean existsByElectionIdAndVoterEmail(Long electionId, String voterEmail);
}