package ovm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ovm.model.Users;
import java.util.List;

@Repository
public interface UsersRepository extends JpaRepository<Users, String> {
	 Users findByEmail(String email);
    List<Users> findByRole(String role);
   
}