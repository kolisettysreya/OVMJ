package ovm.services;

import java.util.List;
import ovm.model.ActiveElection;

public interface ActiveElectionService {
    List<ActiveElection> getAllActiveElections();
    List<ActiveElection> getElectionsByOrganizer(String organizerName);
    ActiveElection startElectionFromRequest(Long requestId);
    ActiveElection endElection(Long electionId);
    ActiveElection getElectionById(Long id);
    void deleteElection(Long id);
}