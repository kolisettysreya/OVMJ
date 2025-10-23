package ovm.services;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ovm.model.Users;
import ovm.repository.UsersRepository;


@Service
public class UsersService {
    
    @Autowired
    private UsersRepository usersRepository;

    public String signUp(Users user) {
        if (usersRepository.findByEmail(user.getEmail()) != null) {
            return "401::Email already exists";
        }
        usersRepository.save(user);
        return "200::User Registered Successfully";
    }

    public String signIn(String email, String password) {
        Users user = usersRepository.findByEmail(email);
        if (user == null) {
            return "401::User not found";
        }
        if (!user.getPassword().equals(password)) {
            return "401::Incorrect password";
        }
        return "200::Login successful::" + user.getRole();
    }
}
