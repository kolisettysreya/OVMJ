package ovm.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "election_requests")
public class ElectionRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "organizer_name")
    private String organizerName;
    
    @Column(name = "election_title")
    private String electionTitle;
    
    private String description;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date") 
    private LocalDate endDate;
    
    @Column(name = "submitted_date")
    private LocalDate submittedDate;
    
    @Column(name = "expected_voters")
    private Integer expectedVoters;
    
    @Column(name = "election_type")
    private String electionType;
    
    @Column(name = "additional_requirements")
    private String additionalRequirements;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;
    
    // Constructor
    public ElectionRequest() {
        this.submittedDate = LocalDate.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
    
    public String getElectionTitle() { return electionTitle; }
    public void setElectionTitle(String electionTitle) { this.electionTitle = electionTitle; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public LocalDate getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(LocalDate submittedDate) { this.submittedDate = submittedDate; }
    
    public Integer getExpectedVoters() { return expectedVoters; }
    public void setExpectedVoters(Integer expectedVoters) { this.expectedVoters = expectedVoters; }
    
    public String getElectionType() { return electionType; }
    public void setElectionType(String electionType) { this.electionType = electionType; }
    
    public String getAdditionalRequirements() { return additionalRequirements; }
    public void setAdditionalRequirements(String additionalRequirements) { this.additionalRequirements = additionalRequirements; }
    
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
}