package ovm.model;


import lombok.Data;

@Data
public class VoterRegistrationDTO {
 private String voterEmail;
 private String voterName;
 private String voterPhone;
 private String voterAadhar;
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
 
}

