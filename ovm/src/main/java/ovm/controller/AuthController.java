package ovm.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ovm.model.Users;
import ovm.repository.UsersRepository;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    
    @Autowired
    private UsersRepository usersRepository;
    
    @PostMapping("/signin")
    public ResponseEntity<Map<String, Object>> signIn(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // Find user by email
        Users user = usersRepository.findByEmail(request.getEmail());
        
        if (user == null) {
            response.put("success", false);
            response.put("error", "INVALID_CREDENTIALS");
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Verify password (you should use BCrypt in production!)
        if (!user.getPassword().equals(request.getPassword())) {
            response.put("success", false);
            response.put("error", "INVALID_CREDENTIALS");
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Check if account is active
     // Check if account is active
        if (Boolean.FALSE.equals(user.getIsActive())) {   // ✅ safe null check
            response.put("success", false);
            response.put("error", "ACCOUNT_INACTIVE");
            response.put("message", "Your account has been deactivated by the administrator. Please contact support for activation.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        
        // Check role matches
        if (!user.getRole().equalsIgnoreCase(request.getRole())) {
            response.put("success", false);
            response.put("error", "INVALID_ROLE");
            response.put("message", "Invalid account type selected");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Success
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("user", Map.of(
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "role", user.getRole(),
            "phoneNum", user.getPhoneNum() != null ? user.getPhoneNum() : ""
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signUp(@RequestBody Users newUser) {
        Map<String, Object> response = new HashMap<>();
        
        // Check if user already exists
        if (usersRepository.findByEmail(newUser.getEmail()) != null) {
            response.put("success", false);
            response.put("error", "USER_EXISTS");
            response.put("message", "User with this email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        
        // Set default status to pending for new signups
        newUser.setIsActive(false);
        
        Users savedUser = usersRepository.save(newUser);
        
        response.put("success", true);
        response.put("message", "Signup successful! Please wait for administrator approval.");
        response.put("user", Map.of(
            "email", savedUser.getEmail(),
            "fullName", savedUser.getFullName(),
            "role", savedUser.getRole()
        ));
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // Inner class for login request
    public static class LoginRequest {
        private String email;
        private String password;
        private String role;
        
        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}