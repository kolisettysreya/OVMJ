package ovm.model;

import lombok.NoArgsConstructor;


@NoArgsConstructor
public class VoterWithElectionDTO {
    private Long id;
    private String voterAadhar;  // Must match!
    private String name;
    private String email;
    private Long electionId;
    private String electionName;
    private String registeredDate;
    
	public VoterWithElectionDTO(Long id, String voterAadhar, String name, String email, Long electionId,
			String electionName, String registeredDate) {
		super();
		this.id = id;
		this.voterAadhar = voterAadhar;
		this.name = name;
		this.email = email;
		this.electionId = electionId;
		this.electionName = electionName;
		this.registeredDate = registeredDate;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getVoterAadhar() {
		return voterAadhar;
	}
	public void setVoterAadhar(String voterAadhar) {
		this.voterAadhar = voterAadhar;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public Long getElectionId() {
		return electionId;
	}
	public void setElectionId(Long electionId) {
		this.electionId = electionId;
	}
	public String getElectionName() {
		return electionName;
	}
	public void setElectionName(String electionName) {
		this.electionName = electionName;
	}
	public String getRegisteredDate() {
		return registeredDate;
	}
	public void setRegisteredDate(String registeredDate) {
		this.registeredDate = registeredDate;
	}
    
}