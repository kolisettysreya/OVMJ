package ovm.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ovm.model.ElectionRequest;
import ovm.model.RequestStatus;



@Repository
public interface ElectionRequestRepository extends JpaRepository<ElectionRequest, Long> {
	 List<ElectionRequest> findByStatus(RequestStatus status);
}
