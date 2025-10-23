import React, { useState, useEffect } from 'react';
import { Users, FileText, Plus, Eye, Trash2, Menu, ChevronDown, Vote, BarChart3, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Organizer = ({onLogout, userData}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const displayname = userData?.fullName || "Organizer User";
  const [showAddVoter, setShowAddVoter] = useState(false);
  const [newVoter, setNewVoter] = useState({ name: '', email: '', voterID: '' });
  
  // Add these new states to your Organizer component
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [myActiveElections, setMyActiveElections] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedElectionForVoters, setSelectedElectionForVoters] = useState('all');
  const [selectedElectionForCandidates, setSelectedElectionForCandidates] = useState('all');
  const [startingElections, setStartingElections] = useState(new Set());
  const [electionResults, setElectionResults] = useState([]);

  // Add this line with your other state declarations at the top
const [showAddCandidate, setShowAddCandidate] = useState(false);
  
  // Election form states
  const [electionTitle, setElectionTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [expectedVoters, setExpectedVoters] = useState('');
  const [electionType, setElectionType] = useState('General Election');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  useEffect(() => {
  const fetchResults = async () => {
    if (!userData?.fullName) return;
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/election-results/organizer/${userData.fullName}`
      );
      setElectionResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setElectionResults([]);
    }
  };

  if (userData?.fullName && activeSection === 'results') {
    fetchResults();
  }
}, [userData, activeSection]);

  // Voters management states
  const [voters, setVoters] = useState([]);
  useEffect(() => {
  const fetchVotersForMyElections = async () => {
    if (!userData?.fullName) return;
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/organizers/${userData.fullName}/registered-voters`
      );
      setVoters(response.data);
    } catch (error) {
      console.error('Error fetching voters:', error);
      // If endpoint doesn't exist yet, just use empty array
      setVoters([]);
    }
  };

  if (userData?.fullName) {
    fetchVotersForMyElections();
  }
}, [userData]);
 
  // Candidates management states
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({ 
  name: '', 
  position: '', 
  party: '', 
  electionId: '',
  electionName: '' 
});
  useEffect(() => {
  const fetchCandidatesForMyElections = async () => {
    if (!userData?.fullName) return;
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/organizers/${userData.fullName}/candidates`
      );
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // If endpoint doesn't exist yet, just use empty array
      setCandidates([]);
    }
  };

  if (userData?.fullName) {
    fetchCandidatesForMyElections();
  }
}, [userData]);

  // Sample results data
 

  const sidebarItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'approved-requests', icon: FileText, label: 'Approved Requests' },
    { id: 'my-elections', icon: Vote, label: 'My Elections' },
    { id: 'voterslist', icon: Users, label: 'Voters List' },
    { id: 'candidates', icon: Users, label: 'Candidates' },
    { id: 'request-election', icon: FileText, label: 'Request Election' },
    { id: 'results', icon: BarChart3, label: 'Results' },
    { id: 'my-requests', icon: FileText, label: 'My Requests' },
  ];

  // Fetch approved requests for this organizer
  useEffect(() => {
     const fetchMyRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/election-requests`);
      const myReqs = response.data.filter(req => 
        req.organizerName === userData.fullName
      );
      setMyRequests(myReqs);
    } catch (error) {
      console.error('Error fetching my requests:', error);
    }
  };
   const fetchApprovedRequests = async () => {
  const response = await axios.get(`${API_BASE_URL}/election-requests`);
  const approved = response.data.filter(req => 
    req.status === 'APPROVED' && req.organizerName === userData.fullName
  );
  setApprovedRequests(approved);
};

    const fetchMyActiveElections = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/active-elections/organizer/${userData.fullName}`
  );
  setMyActiveElections(response.data);
};

    if (userData?.fullName) {
      fetchApprovedRequests();
      fetchMyActiveElections();
      fetchMyRequests();
    }

   
  }, [userData]);

  // Function to start an election
 const handleStartElection = async (requestId) => {
  if (!window.confirm('Are you sure you want to start this election?')) {
    return;
  }

  setStartingElections(prev => new Set(prev).add(requestId));

  try {
    await axios.post(`${API_BASE_URL}/active-elections/start/${requestId}`);
    alert('Election started successfully!');
    
    // Refresh data
    const [approvedRes, activeRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/election-requests`),
      axios.get(`${API_BASE_URL}/active-elections/organizer/${userData.fullName}`)
    ]);
    
    const approved = approvedRes.data.filter(req => 
      req.status === 'APPROVED' && req.organizerName === userData.fullName
    );
    
    setApprovedRequests(approved);
    setMyActiveElections(activeRes.data);
    
  } catch (error) {
    console.error('Error starting election:', error);
    // Show more specific error message
    const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
    alert(`Failed to start election: ${errorMsg}`);
  } finally {
    setStartingElections(prev => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  }
};
  // Function to end an election
  const handleEndElection = async (electionId) => {
  if (!window.confirm('Are you sure you want to end this election? This action cannot be undone.')) {
    return;
  }

  try {
    // End the election
    await axios.put(`${API_BASE_URL}/active-elections/${electionId}/end`);
    
    alert('Election ended successfully!');
    
    // Refetch from server to get the updated status
    const response = await axios.get(
      `${API_BASE_URL}/active-elections/organizer/${userData.fullName}`
    );
    setMyActiveElections(response.data);
    
  } catch (error) {
    console.error('Error ending election:', error);
    alert('Failed to end election. Please try again.');
  }
};

  const handleSubmitRequest = async () => {
    if (!electionTitle || !startDate || !endDate) {
      alert("Please fill in all required fields.");
      return;
    }

    const requestData = {
      organizerName: userData.fullName,
      electionTitle: electionTitle,
      description: description,
      startDate: startDate,
      endDate: endDate,
      expectedVoters: parseInt(expectedVoters) || 0,
      electionType: electionType,
      additionalRequirements: additionalRequirements
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/election-requests`, requestData);
      alert('Election request submitted successfully!');

      const updatedRequests = await axios.get(`${API_BASE_URL}/election-requests`);
      const myReqs = updatedRequests.data.filter(req => 
      req.organizerName === userData.fullName
      );
      setMyRequests(myReqs);
      
      // Clear form
      setElectionTitle('');
      setStartDate('');
      setEndDate('');
      setDescription('');
      setExpectedVoters('');
      setElectionType('General Election');
      setAdditionalRequirements('');
      setActiveSection('my-requests');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit request');
    }
  };

  const handleAddVoter = () => {
    if (newVoter.name && newVoter.email && newVoter.voterID) {
      setVoters([...voters, { 
        id: voters.length + 1, 
        ...newVoter, 
        status: 'Active' 
      }]);
      setNewVoter({ name: '', email: '', voterID: '' });
      setShowAddVoter(false);
    }
  };

  const handleDeleteVoter = (id) => {
    if (window.confirm('Are you sure you want to delete this voter?')) {
      setVoters(voters.filter(voter => voter.id !== id));
    }
  };

  const handleAddCandidate = async () => {
  if (!newCandidate.name || !newCandidate.position || !newCandidate.party || !newCandidate.electionId) {
    alert('Please fill in all fields including selecting an election');
    return;
  }

  try {
    await axios.post(
      `${API_BASE_URL}/api/elections/${newCandidate.electionId}/candidates`,
      {
        name: newCandidate.name,
        position: newCandidate.position,
        party: newCandidate.party,
        electionId: newCandidate.electionId
      }
    );

    alert('Candidate added successfully!');
    
    // Refresh candidates list
    const response = await axios.get(
      `${API_BASE_URL}/api/organizers/${userData.fullName}/candidates`
    );
    setCandidates(response.data);
    
    setNewCandidate({ name: '', position: '', party: '', electionId: '', electionName: '' });
    setShowAddCandidate(false);
  } catch (error) {
    console.error('Error adding candidate:', error);
    alert('Failed to add candidate');
  }
};

  const handleDeleteCandidate = (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      setCandidates(candidates.filter(candidate => candidate.id !== id));
    }
  };

  const StatusBadge = ({ status, children }) => {
    const colors = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-800',
    Approved: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    PENDING: 'bg-yellow-100 text-yellow-800',  // Add uppercase
    APPROVED: 'bg-green-100 text-green-800',   // Add uppercase
    REJECTED: 'bg-red-100 text-red-800',       // Add uppercase
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {children}
      </span>
    );
  };

  // Render dashboard
  const renderDashboard = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
        <nav className="flex text-sm text-gray-500 mt-2">
          <span className="text-blue-600">🏠 Home</span>
          <span className="mx-2">›</span>
          <span>Dashboard</span>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-green-500">
          <h3 className="text-lg font-semibold text-green-600 mb-2">Approved Requests</h3>
          <div className="text-3xl font-bold text-green-600">{approvedRequests.length}</div>
          <p className="text-gray-600 text-sm mt-2">Ready to start</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">Active Elections</h3>
          <div className="text-3xl font-bold text-blue-600">
            {myActiveElections.filter(e => e.status === 'ACTIVE').length}
          </div>
          <p className="text-gray-600 text-sm mt-2">Currently running</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
          <h3 className="text-lg font-semibold text-purple-600 mb-2">Total Voters</h3>
          <div className="text-3xl font-bold text-purple-600">{voters.length}</div>
          <p className="text-gray-600 text-sm mt-2">Registered voters</p>
        </div>
      </div>
    </div>
  );
  const renderMyRequests = () => (
  <div className="p-6 bg-gray-50 min-h-screen">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
      <nav className="flex text-sm text-gray-500 mt-1">
        <span className="text-blue-600">🏠 Home</span>
        <span className="mx-2">›</span>
        <span>My Requests</span>
      </nav>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">All Submitted Requests ({myRequests.length})</h2>
        <p className="text-sm text-gray-600 mt-1">Track the status of your election requests</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Voters</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {myRequests.map(request => (
              <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{request.electionTitle}</div>
                  <div className="text-sm text-gray-500">{request.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {request.startDate} to {request.endDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{request.expectedVoters}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{request.submittedDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={request.status}>
                    {request.status}
                  </StatusBadge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150">
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {myRequests.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No requests submitted yet</p>
                  <p className="text-sm">Submit your first election request to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

  // Render approved requests that can be started
  const renderApprovedRequests = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Approved Election Requests</h1>
        <nav className="flex text-sm text-gray-500 mt-1">
          <span className="text-blue-600">🏠 Home</span>
          <span className="mx-2">›</span>
          <span>Approved Requests</span>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ready to Start ({approvedRequests.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Voters</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {approvedRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{request.electionTitle}</div>
                    <div className="text-sm text-gray-500">{request.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {request.startDate} to {request.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{request.expectedVoters}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{request.submittedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleStartElection(request.id)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-150"
                    >
                      <Vote className="w-4 h-4 mr-2" />
                      Start Election
                    </button>
                  </td>
                </tr>
              ))}
              {approvedRequests.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No approved requests to start</p>
                    <p className="text-sm">Submit election requests and wait for admin approval</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render active elections managed by this organizer
  const renderMyElections = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Elections</h1>
        <nav className="flex text-sm text-gray-500 mt-1">
          <span className="text-blue-600">🏠 Home</span>
          <span className="mx-2">›</span>
          <span>My Elections</span>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Elections ({myActiveElections.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myActiveElections.map(election => (
                <tr key={election.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{election.electionTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {election.startDate} to {election.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-700">
                      {election.votedCount}/{election.totalVoters}
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round((election.votedCount/election.totalVoters)*100)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={election.status}>
                      {election.status}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {election.status === 'ACTIVE' && (
                        <button 
                          onClick={() => handleEndElection(election.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors duration-150"
                        >
                          <X className="w-3 h-3 mr-1" />
                          End Election
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {myActiveElections.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Vote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active elections</p>
                    <p className="text-sm">Start an approved election to see it here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderVotersList = () => {
  // Filter voters based on selected election
  const filteredVoters = selectedElectionForVoters === 'all' 
    ? voters 
    : voters.filter(v => v.electionId === parseInt(selectedElectionForVoters));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voters List</h1>
          <nav className="flex text-sm text-gray-500 mt-1">
            <span className="text-blue-600">🏠 Home</span>
            <span className="mx-2">›</span>
            <span>Manage</span>
            <span className="mx-2">›</span>
            <span>Voters List</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered Voters ({filteredVoters.length})
            </h2>
            
            {/* ⭐ NEW: Election filter dropdown */}
            <select
              value={selectedElectionForVoters}
              onChange={(e) => setSelectedElectionForVoters(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Elections</option>
              {myActiveElections.map(election => (
                <option key={election.id} value={election.id}>
                  {election.electionTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voter ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Election Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVoters.map(voter => (
                <tr key={voter.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
  <div className="font-medium text-gray-900">{voter.voterAadhar || 'N/A'}</div>
</td>
<td className="px-6 py-4 whitespace-nowrap text-gray-700">{voter.name}</td>
<td className="px-6 py-4 whitespace-nowrap text-gray-700">{voter.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{voter.electionName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {voter.registeredDate || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVoters.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No registered voters yet</p>
                    <p className="text-sm">Voters will appear here after registering for your elections</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

  const renderCandidates = () => {
  // Filter candidates based on selected election
  const filteredCandidates = selectedElectionForCandidates === 'all' 
    ? candidates 
    : candidates.filter(c => c.electionId === parseInt(selectedElectionForCandidates));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <nav className="flex text-sm text-gray-500 mt-1">
            <span className="text-blue-600">🏠 Home</span>
            <span className="mx-2">›</span>
            <span>Manage</span>
            <span className="mx-2">›</span>
            <span>Candidates</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered Candidates ({filteredCandidates.length})
            </h2>
            
            {/* ⭐ NEW: Election filter dropdown */}
            <select
              value={selectedElectionForCandidates}
              onChange={(e) => setSelectedElectionForCandidates(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Elections</option>
              {myActiveElections.map(election => (
                <option key={election.id} value={election.id}>
                  {election.electionTitle}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setShowAddCandidate(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-150 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Election Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{candidate.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{candidate.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{candidate.party}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{candidate.electionName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors duration-150"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No candidates added yet</p>
                    <p className="text-sm">Add candidates for your active elections</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⭐ UPDATED: Add Candidate Modal */}
      {showAddCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Candidate</h3>
            
            <div className="space-y-4">
              {/* ⭐ NEW: Election selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Election *</label>
                <select
                  value={newCandidate.electionId || ''}
                  onChange={(e) => {
                    const selectedElection = myActiveElections.find(el => el.id === parseInt(e.target.value));
                    setNewCandidate({
                      ...newCandidate, 
                      electionId: e.target.value,
                      electionName: selectedElection?.electionTitle || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Election</option>
                  {myActiveElections.map(election => (
                    <option key={election.id} value={election.id}>
                      {election.electionTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                  placeholder="Enter candidate name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <input 
                  type="text"
                  value={newCandidate.position}
                  onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                  placeholder="Enter position (e.g., President)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Party</label>
                <input 
                  type="text"
                  value={newCandidate.party}
                  onChange={(e) => setNewCandidate({...newCandidate, party: e.target.value})}
                  placeholder="Enter party name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => {
                  setShowAddCandidate(false);
                  setNewCandidate({ name: '', position: '', party: '', electionId: '', electionName: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCandidate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
              >
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  const renderRequestElection = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Request Election</h1>
        <nav className="flex text-sm text-gray-500 mt-1">
          <span className="text-blue-600">🏠 Home</span>
          <span className="mx-2">›</span>
          <span>Request Election</span>
        </nav>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit New Election Request</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Election Title *</label>
                <input 
                  type="text" 
                  placeholder="Enter election title" 
                  value={electionTitle}
                  onChange={(e) => setElectionTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  rows="4" 
                  placeholder="Describe the purpose and details of this election..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Voters</label>
                  <input 
                    type="number" 
                    placeholder="Estimated number of voters"
                    value={expectedVoters}
                    onChange={(e) => setExpectedVoters(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Election Type</label>
                  <select 
                    value={electionType}
                    onChange={(e) => setElectionType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option>General Election</option>
                    <option>Student Union</option>
                    <option>Corporate Board</option>
                    <option>Community Council</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Requirements</label>
                <textarea 
                  rows="3" 
                  placeholder="Any special requirements or notes for this election..."
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150">
                  Save as Draft
                </button>
                <button 
                  onClick={handleSubmitRequest}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
            
            <div className="space-y-4">
            {myRequests
            .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
            .slice(0, 3).map((request) => (
              <div key={request.id} className="flex justify-between items-start p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{request.electionTitle}</div>
                  <div className="text-sm text-gray-500">Submitted: {request.submittedDate}</div>
                </div>
                <StatusBadge status={request.status}>
                  {request.status}
                </StatusBadge>
              </div>
            ))}
            
            {myRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No requests yet</p>
                <p className="text-xs mt-1">Submit your first request to see it here</p>
              </div>
            )}
            
            {myRequests.length > 3 && (
              <button 
                onClick={() => setActiveSection('my-requests')}
                className="w-full mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all {myRequests.length} requests →
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );

 const renderResults = () => {
  console.log('📊 Raw election results:', electionResults);
  
  if (!Array.isArray(electionResults) || electionResults.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Election Results</h1>
          <nav className="flex text-sm text-gray-500 mt-1">
            <span className="text-blue-600">🏠 Home</span>
            <span className="mx-2">›</span>
            <span>Results</span>
          </nav>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No election results available yet</p>
          <p className="text-gray-400 text-sm mt-2">Results will appear here after elections are completed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Election Results</h1>
        <nav className="flex text-sm text-gray-500 mt-1">
          <span className="text-blue-600">🏠 Home</span>
          <span className="mx-2">›</span>
          <span>Results</span>
        </nav>
      </div>

      <div className="space-y-8">
        {electionResults.map((election) => (
          <div key={election.electionId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Election Header */}
            <div className="bg-gradient-to-r from-green-400 to-green-400 text-black p-6">
              <h2 className="text-2xl font-bold">{election.electionTitle}</h2>
              <div className="flex items-center gap-6 mt-3 text-black-100">
                <span>📊 {election.totalVotesCast} votes cast</span>
                <span>👥 {election.totalEligibleVoters} eligible voters</span>
                <span>📈 {election.turnoutPercentage}% turnout</span>
              </div>
            </div>

            {/* Positions Grid */}
            <div className="p-6 grid lg:grid-cols-2 gap-6">
              {Object.entries(election.positions || {}).map(([position, candidates]) => (
                <div key={position} className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
                    {position}
                  </h3>
                  
                  <div className="space-y-3">
                    {candidates.map((candidate, idx) => (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-center p-4 border rounded-lg transition-all ${
                          candidate.isWinner 
                            ? 'border-green-500 bg-green-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {candidate.name}
                            {candidate.isWinner && (
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-semibold">
                                🏆 Winner
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{candidate.party}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">{candidate.votes}</div>
                            <div className="text-xs text-gray-500">votes</div>
                          </div>
                          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {candidate.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold">e-VotingSystem</div>
          <button className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2 relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors duration-150"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <span className="font-medium">{displayname}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          
          {showProfileDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center space-x-2">
                <span>👤</span>
                <span>My Profile</span>
              </div>
              <div className="px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center space-x-2">
                <span>⚙️</span>
                <span>Settings</span>
              </div>
              <div 
                className="px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer flex items-center space-x-2"
                onClick={onLogout}
              >
                <span>🚪</span>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-lg">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <span>👤</span>
              </div>
              <div>
                <div className="font-semibold">{displayname}</div>
                <div className="text-sm text-green-400 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Online
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              MANAGE
            </div>
            <div className="space-y-1">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                      activeSection === item.id 
                        ? 'bg-slate-700 text-white border-r-2 border-blue-500 font-medium' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'my-requests' && renderMyRequests()}
          {activeSection === 'approved-requests' && renderApprovedRequests()}
          {activeSection === 'my-elections' && renderMyElections()}
          {activeSection === 'voterslist' && renderVotersList()}
          {activeSection === 'candidates' && renderCandidates()}
          {activeSection === 'request-election' && renderRequestElection()}
          {activeSection === 'results' && renderResults()}
            
          {/* Show under development only for sections that don't exist yet */}
          {!['dashboard', 'approved-requests', 'my-elections', 'voterslist', 'candidates', 'request-election', 'results'].includes(activeSection) && (
          <div className="p-6 bg-gray-50 min-h-screen">
          </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Organizer;