package ovm.repository;

import ovm.model.VoterRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VoterRegistrationRepository extends JpaRepository<VoterRegistration, Long> {
    List<VoterRegistration> findByElectionId(Long electionId);
    List<VoterRegistration> findByVoterEmail(String voterEmail);
    int countByElectionId(Long electionId);
    Optional<VoterRegistration> findByElectionIdAndVoterEmail(Long electionId, String voterEmail);
}
