import React, { useState, useEffect } from 'react';
import { Vote, BarChart3, History, ChevronDown, Check, X, Award } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const VoterDashboard = ({ onLogout, userData }) => {
  const [activeSection, setActiveSection] = useState('available-elections');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const displayname = userData?.fullName || "Voter User";

  const [availableElections, setAvailableElections] = useState([]);
  const [registeredElections, setRegisteredElections] = useState([]);
  const [electionCandidates, setElectionCandidates] = useState([]);
  const [completedElections, setCompletedElections] = useState([]);
  const [votingHistory, setVotingHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.email) return;

      try {
        // Fetch available elections (approved and active)
        const electionsRes = await axios.get(`${API_BASE_URL}/api/elections/available`);
        setAvailableElections(electionsRes.data);

        // Fetch voter's registrations
        const regRes = await axios.get(`${API_BASE_URL}/api/voters/${userData.email}/registrations`);
        // Store the actual election IDs from registrations (these are the active election IDs after start)
        setRegisteredElections(regRes.data.map(r => r.electionId));

        // Fetch voting history
        const historyRes = await axios.get(`${API_BASE_URL}/api/voters/${userData.email}/history`);
        setVotingHistory(historyRes.data);

        // Fetch completed elections with results
        const completedRes = await axios.get(`${API_BASE_URL}/api/elections/completed`);
        setCompletedElections(completedRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [userData]);

  // ========== NEW: Handle election registration ==========
  // ========== COMPLETE: Handle election registration ==========
const handleRegisterForElection = async (electionId, isRequest) => {
  if (!window.confirm('Register for this election?')) return;

  try {
    await axios.post(
      `${API_BASE_URL}/api/elections/${electionId}/register${isRequest ? '?isRequest=true' : ''}`,
      {
        voterEmail: userData.email,
        voterName: userData.fullName,
        voterPhone: userData.phoneNum,
        voterAadhar: userData.aadhar
      }
    );

    alert('Successfully registered for election!');
    
    const regRes = await axios.get(`${API_BASE_URL}/api/voters/${userData.email}/registrations`);
    setRegisteredElections(regRes.data.map(r => r.electionId));
    
    const electionsRes = await axios.get(`${API_BASE_URL}/api/elections/available`);
    setAvailableElections(electionsRes.data);
    
  } catch (error) {
    console.error('Error registering:', error);
    alert(error.response?.data?.message || 'Failed to register for election');
  }
};

  const sidebarItems = [
    { id: 'available-elections', icon: Vote, label: 'Available Elections' },
    { id: 'results', icon: BarChart3, label: 'Results' },
    { id: 'history', icon: History, label: 'History' }
  ];

  // ========== MODIFIED: Handle cast vote - fetch candidates from backend ==========
 const handleCastVote = async (election) => {
  try {
    // ✅ CORRECT: check registration with activeElectionId for ACTIVE elections
    const checkId = election.activeElectionId || election.id;
    if (!registeredElections.includes(checkId)) {
      alert('You must register for this election first!');
      return;
    }

    if (election.status !== 'ACTIVE') {
      alert('This election has not started yet. Please wait for the organizer to start the election.');
      return;
    }

    // ✅ CORRECT: fetch candidates using activeElectionId for ACTIVE elections
    const response = await axios.get(`${API_BASE_URL}/api/elections/${checkId}/candidates`);
    
    if (response.data.length === 0) {
      alert('No candidates have been added to this election yet.');
      return;
    }

    setElectionCandidates(response.data);
    setSelectedElection({ ...election, id: checkId }); // Store the correct ID
    setSelectedCandidates({});
    setShowVoteModal(true);
  } catch (error) {
    console.error('Error loading candidates:', error);
    alert(error.response?.data?.message || 'Failed to load candidates. The election may not have started yet.');
  }
};

  const handleCandidateSelection = (positionId, candidateId) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [positionId]: candidateId
    }));
  };

  // ========== MODIFIED: Submit vote to backend ==========
  const handleSubmitVote = async () => {
    if (Object.keys(selectedCandidates).length === 0) {
      alert('Please select at least one candidate');
      return;
    }

    setVotingInProgress(true);
    
    try {
      await axios.post(`${API_BASE_URL}/api/elections/${selectedElection.id}/vote`, {
        voterEmail: userData.email,
        votes: selectedCandidates
      });

      setShowVoteModal(false);
      setShowSuccessModal(true);
      
      // Refresh data
      const historyRes = await axios.get(`${API_BASE_URL}/api/voters/${userData.email}/history`);
      setVotingHistory(historyRes.data);

      setTimeout(() => {
        setShowSuccessModal(false);
        setActiveSection('history');
      }, 3000);
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert(error.response?.data?.message || 'Failed to submit vote');
    } finally {
      setVotingInProgress(false);
    }
  };

  const StatusBadge = ({ status, children }) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      upcoming: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      registered: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {children}
      </span>
    );
  };

  // ========== MODIFIED: Render available elections with registration ==========
 // Update the renderAvailableElections function
const renderAvailableElections = () => (
  <div className="p-6 bg-gray-50 min-h-screen">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Available Elections</h1>
      <nav className="flex text-sm text-gray-500 mt-2">
        <span className="text-blue-600">🏠 Home</span>
        <span className="mx-2">›</span>
        <span>Available Elections</span>
      </nav>
    </div>

    <div className="space-y-6">
      {availableElections.map(election => {
        const checkRegistrationId = election.activeElectionId || election.id;
        const isRegistered = registeredElections.includes(checkRegistrationId);
        const hasVoted = votingHistory.some(v => v.electionId === checkRegistrationId);
        const isApproved = election.status === 'APPROVED';
        const isActive = election.status === 'ACTIVE';
        const isApprovedNotStarted = election.status === 'APPROVED';

        return (
          <div key={election.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{election.title}</h3>
                <p className="text-gray-600 mb-4">{election.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <StatusBadge status={isActive ? 'active' : 'upcoming'}>
                  {isActive ? '🟢 Active - Voting Open' : '🟡 Approved - Registration Open'}
                </StatusBadge>
                {isRegistered && !hasVoted && (
                  <StatusBadge status="registered">
                    ✓ Registered
                  </StatusBadge>
                )}
                {hasVoted && (
                  <StatusBadge status="completed">
                    ✓ Voted
                  </StatusBadge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
              <span className="flex items-center">
                <span className="mr-2">📅</span>
                {election.startDate} to {election.endDate}
              </span>
              <span className="flex items-center">
                <span className="mr-2">👥</span>
                {election.organizer}
              </span>
            </div>
            <div className="flex gap-3">
              {/* 1. Register button - if not registered yet (for both APPROVED and ACTIVE elections) */}
               {!isRegistered && (isApproved || isActive) && (
                <button
                  className="px-6 py-3 rounded-lg font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700"
                   onClick={() => handleRegisterForElection(
      election.activeElectionId || election.id,  // Use activeElectionId if available
      election.isRequest
    )}
                >
                  Register for Election
                </button>
              )}
              
              {/* 2. Waiting message - if registered but election NOT ACTIVE yet (still APPROVED) */}
              {isRegistered && !hasVoted && isApproved && (
                <button
                  className="px-6 py-3 rounded-lg font-semibold text-sm bg-yellow-500 text-white cursor-not-allowed"
                  disabled
                >
                  ⏳ Waiting for Organizer to Start
                </button>
              )}
              
              {/* 3. Cast Vote button - ONLY if registered, election is ACTIVE, and NOT voted yet */}
              {isRegistered && !hasVoted && isActive && (
                <button
                  className="px-6 py-3 rounded-lg font-semibold text-sm bg-green-600 text-white hover:bg-green-700"
                  onClick={() => handleCastVote(election)}
                >
                  Cast Vote
                </button>
              )}

              {/* 4. Voted status - if already voted */}
              {hasVoted && (
                <button
                  className="px-6 py-3 rounded-lg font-semibold text-sm bg-gray-400 text-white cursor-not-allowed"
                  disabled
                >
                  Vote Submitted
                </button>
              )}
            </div>
          </div>
        );
      })}

      {availableElections.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Vote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No Elections Available</p>
          <p className="text-sm mt-2">Check back later for upcoming elections</p>
        </div>
      )}
    </div>
  </div>
);

  const renderResults = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Election Results</h1>
        <nav className="flex text-sm text-gray-500 mt-2">
          <span className="text-blue-600">🏠 Home</span>
          <span className="mx-2">›</span>
          <span>Results</span>
        </nav>
      </div>

      <div className="space-y-6">
        {completedElections.map(election => (
          <div key={election.id} className="bg-green rounded-2xl shadow-sm border border-green-400">
            <div className="p-6 border-b border-green-400">
              <h3 className="text-xl font-bold text-blue-900">{election.title}</h3>
              <p className="text-gray-800 mt-1">Completed on {election.endDate}</p>
            </div>

            {election.results?.map((result, index) => (
              <div key={index} className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{result.position}</h4>
                
                {result.winner && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-bold">WINNER</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{result.winner}</div>
                          <div className="text-gray-600 text-sm">
                            {result.votes} votes ({result.percentage}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {result.candidates?.map((candidate, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900 min-w-0 flex-1">
                        {candidate.name}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all duration-300"
                              style={{ width: `${candidate.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right min-w-0">
                          <div className="font-bold text-green-600">
                            {candidate.votes}
                          </div>
                          <div className="text-xs text-gray-500">
                            ({candidate.percentage}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {completedElections.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold">No Results Yet</p>
            <p className="text-sm mt-2">Results will appear here after elections are completed</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Voting History</h1>
        <nav className="flex text-sm text-gray-500 mt-2">
          <span className="text-blue-600">🏠 Home</span>
          <span className="mx-2">›</span>
          <span>History</span>
        </nav>
      </div>

      <div className="space-y-4">
        {votingHistory.map(election => (
          <div key={election.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <div className="flex items-center">
                    <span className="mr-2">📅</span>
                    Voted on: {election.dateVoted}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">📊</span>
                    Participated in: {election.participatedPositions?.join(', ')}
                  </div>
                </div>
              </div>
              <StatusBadge status="completed">
                <Check className="w-3 h-3 mr-1" />
                Voted
              </StatusBadge>
            </div>
          </div>
        ))}

        {votingHistory.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold">No Voting History</p>
            <p className="text-sm mt-2">Your voting history will appear here after you cast your first vote</p>
          </div>
        )}
      </div>
    </div>
  );

  // ========== MODIFIED: Group candidates by position ==========
  const candidatesByPosition = electionCandidates.reduce((acc, candidate) => {
    if (!acc[candidate.position]) {
      acc[candidate.position] = {
        id: candidate.position,
        title: candidate.position,
        candidates: []
      };
    }
    acc[candidate.position].candidates.push(candidate);
    return acc;
  }, {});

  const positions = Object.values(candidatesByPosition);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      <header className="bg-green-600 text-white px-6 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold">e-VotingSystem - Voter</div>
        </div>
        <div className="flex items-center space-x-2 relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-green-700 rounded-lg px-3 py-2 transition-colors duration-150"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center">
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
                <span>⚙</span>
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
            <div className="space-y-1">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                      activeSection === item.id 
                        ? 'bg-slate-700 text-white border-r-2 border-green-500 font-medium' 
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

        <main className="flex-1 overflow-auto">
          {activeSection === 'available-elections' && renderAvailableElections()}
          {activeSection === 'results' && renderResults()}
          {activeSection === 'history' && renderHistory()}
        </main>
      </div>

      {/* Vote Modal */}
      {showVoteModal && selectedElection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Cast Your Vote</h2>
                <button 
                  onClick={() => setShowVoteModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <h3 className="text-lg text-gray-600 mt-2">{selectedElection.title}</h3>
            </div>

            <div className="p-6 space-y-6">
              {positions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No candidates available for this election yet.</p>
                </div>
              ) : (
                positions.map(position => (
                  <div key={position.id} className="border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{position.title}</h4>
                    
                    <div className="space-y-3">
                      {position.candidates.map(candidate => (
                        <div
                          key={candidate.id}
                          className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedCandidates[position.id] === candidate.id 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleCandidateSelection(position.id, candidate.id)}
                        >
                          <div className="text-3xl mr-4">{candidate.image || '👤'}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{candidate.name}</div>
                            <div className="text-gray-600 text-sm">{candidate.party}</div>
                          </div>
                          <input
                            type="radio"
                            name={`position_${position.id}`}
                            checked={selectedCandidates[position.id] === candidate.id}
                            onChange={() => {}}
                            className="w-5 h-5 text-green-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 rounded-b-2xl">
              <button
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  votingInProgress 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : Object.keys(selectedCandidates).length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                } text-white`}
                onClick={handleSubmitVote}
                disabled={votingInProgress || Object.keys(selectedCandidates).length === 0}
              >
                {votingInProgress ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Vote...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Check className="w-5 h-5 mr-2" />
                    Submit Vote
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Vote Cast Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for participating in the election. Your vote has been recorded securely.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to history...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterDashboard;