package ovm.services;

import java.util.List;
import ovm.model.ElectionRequest;
import ovm.model.ActiveElection;

public interface ElectionRequestService {
    ElectionRequest createRequest(ElectionRequest request);
    List<ElectionRequest> getAllRequests();
    ElectionRequest updateStatus(Long id, String status);
    ActiveElection approveAndCreateActiveElection(Long requestId);
}