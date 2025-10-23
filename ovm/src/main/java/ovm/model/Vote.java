// Vote.java
package ovm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "votes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "election_id")
    private Long electionId;
    
    @Column(name = "voter_email")
    private String voterEmail;
    
    @Column(name = "candidate_id")
    private Long candidateId;
    
    @Column(name = "position")
    private String position;
    
    @Column(name = "voted_at")
    private LocalDateTime votedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public Long getCandidateId() {
		return candidateId;
	}

	public void setCandidateId(Long candidateId) {
		this.candidateId = candidateId;
	}

	public String getPosition() {
		return position;
	}

	public void setPosition(String position) {
		this.position = position;
	}

	public LocalDateTime getVotedAt() {
		return votedAt;
	}

	public void setVotedAt(LocalDateTime votedAt) {
		this.votedAt = votedAt;
	}
    
    
}