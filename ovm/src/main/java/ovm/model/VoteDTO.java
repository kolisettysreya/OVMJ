
package ovm.model;

import lombok.Data;
import java.util.Map;

@Data
public class VoteDTO {
    private String voterEmail;
    private Map<String, Long> votes; // positionId -> candidateId
	public String getVoterEmail() {
		return voterEmail;
	}
	public void setVoterEmail(String voterEmail) {
		this.voterEmail = voterEmail;
	}
	public Map<String, Long> getVotes() {
		return votes;
	}
	public void setVotes(Map<String, Long> votes) {
		this.votes = votes;
	}
    
}