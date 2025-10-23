package ovm.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import ovm.model.Users;
import ovm.repository.UsersRepository;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UsersController {

    @Autowired
    private UsersRepository usersRepository;

    // Get all organizers
    @GetMapping("/organizers")
    public ResponseEntity<List<Users>> getAllOrganizers() {
        List<Users> organizers = usersRepository.findByRole("organizer");
        return ResponseEntity.ok(organizers);
    }

    // Get all voters
    @GetMapping("/voters")
    public ResponseEntity<List<Users>> getAllVoters() {
        List<Users> voters = usersRepository.findByRole("voter");
        return ResponseEntity.ok(voters);
    }

    // Get user by email
    @GetMapping("/{email}")
    public ResponseEntity<Users> getUserByEmail(@PathVariable String email) {
        Users user = usersRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    // Activate/Deactivate user
    @PutMapping("/{email}/toggle-status")
    public ResponseEntity<Users> toggleUserStatus(@PathVariable String email) {
        Users user = usersRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsActive(!user.getIsActive());
        Users updatedUser = usersRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    // Add new organizer by admin
    @PostMapping("/organizers")
    public ResponseEntity<Users> addOrganizer(@RequestBody Users organizer) {
        organizer.setRole("organizer");
        organizer.setIsActive(true); // Admin-added users are active by default
        Users savedOrganizer = usersRepository.save(organizer);
        return ResponseEntity.ok(savedOrganizer);
    }

    // Add new voter by admin
    @PostMapping("/voters")
    public ResponseEntity<Users> addVoter(@RequestBody Users voter) {
        voter.setRole("voter");
        voter.setIsActive(true); // Admin-added users are active by default
        Users savedVoter = usersRepository.save(voter);
        return ResponseEntity.ok(savedVoter);
    }

    // Update user
    @PutMapping("/{email}")
    public ResponseEntity<Users> updateUser(@PathVariable String email, @RequestBody Users userDetails) {
        Users user = usersRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (userDetails.getFullName() != null) user.setFullName(userDetails.getFullName());
        if (userDetails.getPhoneNum() != null) user.setPhoneNum(userDetails.getPhoneNum());
        user.setIsActive(!user.getIsActive());
        Users updatedUser = usersRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }
}