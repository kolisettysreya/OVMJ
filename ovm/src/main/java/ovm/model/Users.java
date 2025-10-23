package ovm.model;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class Users {
    @Id
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @Column(name = "fullname", nullable = false)
    private String fullName;
    
    @Column(name = "password", nullable = false)
    private String password;
    
    @Column(name = "phonenum", nullable = false)
    private String phoneNum;
    
    @Column(name = "aadhar", nullable = false)
    private String aadhar;
    
    @Column(name = "role", nullable = false)
    private String role; // voter, organizer, admin
    
    @Column(name = "join_date")
    private LocalDate joinDate;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;
    
    public Users() {
        this.joinDate = LocalDate.now();
        this.isActive = false;
    }
    
    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getPhoneNum() { return phoneNum; }
    public void setPhoneNum(String phoneNum) { this.phoneNum = phoneNum; }
    
    public String getAadhar() { return aadhar; }
    public void setAadhar(String aadhar) { this.aadhar = aadhar; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}