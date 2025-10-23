package ovm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ovm.model.ActiveElection;
import java.util.List;

@Repository
public interface ActiveElectionRepository extends JpaRepository<ActiveElection, Long> {
    
    List<ActiveElection> findByOrganizerName(String organizerName);
    
    List<ActiveElection> findByStatus(ovm.model.ElectionStatus status);
    
    List<ActiveElection> findByOrganizerNameAndStatus(String organizerName, ovm.model.ElectionStatus status);
}