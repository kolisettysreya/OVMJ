package ovm.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "voter_registrations")
@Data  // This generates all getters/setters
@NoArgsConstructor
@AllArgsConstructor
public class VoterRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "election_id")
    private Long electionId;

    // ADD THIS FIELD
    @Column(name = "election_name")
    private String electionName;
    
    
    @Column(name = "voter_email")
    private String voterEmail;
    
    @Column(name = "voter_name")
    private String voterName;
    
    @Column(name = "voter_phone")
    private String voterPhone;
    
    @Column(name = "voter_aadhar")
    private String voterAadhar;
    
    @Column(name = "registered_date")
    private LocalDateTime registeredDate;
    
    @Column(name = "has_voted")
    private boolean hasVoted = false;

	public Long getId() {
		return id;
	}
	 public String getElectionName() {
	        return electionName;
	    }

	public void setId(Long id) {
		this.id = id;
	}

    public void setElectionName(String electionName) {
        this.electionName = electionName;
    }

	public Long getElectionId() {
		return electionId;
	}

	public void setElectionId(Long electionId) {
		this.electionId = electionId;
	}

	public String getVoterEmail() {
		return voterEmail;
	}

	public void setVoterEmail(String voterEmail) {
		this.voterEmail = voterEmail;
	}

	public String getVoterName() {
		return voterName;
	}

	public void setVoterName(String voterName) {
		this.voterName = voterName;
	}

	public String getVoterPhone() {
		return voterPhone;
	}

	public void setVoterPhone(String voterPhone) {
		this.voterPhone = voterPhone;
	}

	public String getVoterAadhar() {
		return voterAadhar;
	}

	public void setVoterAadhar(String voterAadhar) {
		this.voterAadhar = voterAadhar;
	}

	public LocalDateTime getRegisteredDate() {
		return registeredDate;
	}

	public void setRegisteredDate(LocalDateTime registeredDate) {
		this.registeredDate = registeredDate;
	}

	public boolean isHasVoted() {
		return hasVoted;
	}

	public void setHasVoted(boolean hasVoted) {
		this.hasVoted = hasVoted;
	}
}