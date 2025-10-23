package ovm.model;


import lombok.NoArgsConstructor;

@NoArgsConstructor
public class CandidateWithElectionDTO {
	 private Long id;
	    private String name;
	    private String position;
	    private String party;
	    private Long electionId;
	    private String electionName;
	    
	    // Add this constructor manually
	    public CandidateWithElectionDTO(Long id, String name, String position, 
	                                    String party, Long electionId, String electionName) {
	        this.id = id;
	        this.name = name;
	        this.position = position;
	        this.party = party;
	        this.electionId = electionId;
	        this.electionName = electionName;
	    }
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getPosition() {
		return position;
	}
	public void setPosition(String position) {
		this.position = position;
	}
	public String getParty() {
		return party;
	}
	public void setParty(String party) {
		this.party = party;
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
    
}