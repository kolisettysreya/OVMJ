package ovm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "election_results")
public class ElectionResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "election_id")
    private Long electionId;
    
    @Column(name = "election_title")
    private String electionTitle;
    
    @Column(name = "organizer_name")
    private String organizerName;
    
    @Column(name = "position")
    private String position;
    
    @Column(name = "candidate_name")
    private String candidateName;
    
    @Column(name = "candidate_party")
    private String candidateParty;
    
    @Column(name = "votes_received")
    private Integer votesReceived;
    
    @Column(name = "vote_percentage")
    private Double votePercentage;
    
    @Column(name = "is_winner")
    private Boolean isWinner;
    
    @Column(name = "total_votes_cast")
    private Integer totalVotesCast;
    
    @Column(name = "total_eligible_voters")
    private Integer totalEligibleVoters;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public ElectionResult() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public String getElectionTitle() {
        return electionTitle;
    }

    public void setElectionTitle(String electionTitle) {
        this.electionTitle = electionTitle;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCandidateParty() {
        return candidateParty;
    }

    public void setCandidateParty(String candidateParty) {
        this.candidateParty = candidateParty;
    }

    public Integer getVotesReceived() {
        return votesReceived;
    }

    public void setVotesReceived(Integer votesReceived) {
        this.votesReceived = votesReceived;
    }

    public Double getVotePercentage() {
        return votePercentage;
    }

    public void setVotePercentage(Double votePercentage) {
        this.votePercentage = votePercentage;
    }

    public Boolean getIsWinner() {
        return isWinner;
    }

    public void setIsWinner(Boolean isWinner) {
        this.isWinner = isWinner;
    }

    public Integer getTotalVotesCast() {
        return totalVotesCast;
    }

    public void setTotalVotesCast(Integer totalVotesCast) {
        this.totalVotesCast = totalVotesCast;
    }

    public Integer getTotalEligibleVoters() {
        return totalEligibleVoters;
    }

    public void setTotalEligibleVoters(Integer totalEligibleVoters) {
        this.totalEligibleVoters = totalEligibleVoters;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}