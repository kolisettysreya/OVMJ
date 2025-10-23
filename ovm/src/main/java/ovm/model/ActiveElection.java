package ovm.model;



import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "active_elections",uniqueConstraints = @UniqueConstraint(columnNames = "original_request_id"))
public class ActiveElection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "election_title")
    private String electionTitle;
    
    @Column(name = "organizer_name")
    private String organizerName;
    
    private String description;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @Column(name = "expected_voters")
    private Integer expectedVoters;
    
    @Column(name = "total_voters")
    private Integer totalVoters;
    
    @Column(name = "voted_count")
    private Integer votedCount = 0;
    
    @Column(name = "election_type")
    private String electionType;
    
    @Enumerated(EnumType.STRING)
    private ElectionStatus status = ElectionStatus.ACTIVE;
    
    @Column(name = "original_request_id")
    private Long originalRequestId; // Reference to the original request
    
    // Constructors
    public ActiveElection() {
        this.createdDate = LocalDateTime.now();
        this.votedCount = 0;
    }
 // In ActiveElection.java
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Add getter and setter
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    // Constructor from ElectionRequest
    public ActiveElection(ElectionRequest request) {
        this();
        this.electionTitle = request.getElectionTitle();
        this.organizerName = request.getOrganizerName();
        this.description = request.getDescription();
        this.startDate = request.getStartDate();
        this.endDate = request.getEndDate();
        this.expectedVoters = request.getExpectedVoters();
        this.totalVoters = request.getExpectedVoters(); // Initially same as expected
        this.electionType = request.getElectionType();
        this.originalRequestId = request.getId();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getElectionTitle() { return electionTitle; }
    public void setElectionTitle(String electionTitle) { this.electionTitle = electionTitle; }
    
    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    
    public Integer getExpectedVoters() { return expectedVoters; }
    public void setExpectedVoters(Integer expectedVoters) { this.expectedVoters = expectedVoters; }
    
    public Integer getTotalVoters() { return totalVoters; }
    public void setTotalVoters(Integer totalVoters) { this.totalVoters = totalVoters; }
    
    public Integer getVotedCount() { return votedCount; }
    public void setVotedCount(Integer votedCount) { this.votedCount = votedCount; }
    
    public String getElectionType() { return electionType; }
    public void setElectionType(String electionType) { this.electionType = electionType; }
    
    public ElectionStatus getStatus() { return status; }
    public void setStatus(ElectionStatus status) { this.status = status; }
    
    public Long getOriginalRequestId() { return originalRequestId; }
    public void setOriginalRequestId(Long originalRequestId) { this.originalRequestId = originalRequestId; }
}