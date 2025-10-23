import React, { useEffect, useState } from "react";
import { Users, FileText, Vote, Archive, Plus, Check, X, Eye, UserCheck, UserX, BarChart3, User, Mail, Phone, CreditCard, Building, Calendar, Activity, Lock, Hash } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
const VotingDashboard = ({ onLogout, userData }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const displayname = userData?.fullName || "Admin User";
  const [showResultDetails, setShowResultDetails] = useState(false);
  const [selectedElectionResult, setSelectedElectionResult] = useState(null);
  
  const [electionRequests, setElectionRequests] = useState([]);
  const [activeElections, setActiveElections] = useState([]);
  const [archivedElections, setArchivedElections] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [voters, setVoters] = useState([]);
  const [activeElectionsLoading, setActiveElectionsLoading] = useState(true);
  const [activeElectionsError, setActiveElectionsError] = useState(null);
  
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [showVoterModal, setShowVoterModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewUserType, setViewUserType] = useState('organizer');
  const [electionResults, setElectionResults] = useState([]);
  
  const [loading, setLoading] = useState(false);
  // At the top of VotingDashboard component
const [organizerFormData, setOrganizerFormData] = useState({
  fullName: '', 
  email: '', 
  password: '',
  phoneNum: '',
  aadhar: ''
});

const [voterFormData, setVoterFormData] = useState({
  fullName: '', 
  email: '', 
  password: '',
  phoneNum: '',
  aadhar: ''
});
// At the top of VotingDashboard component, add this:
const [formKey, setFormKey] = useState(0); // Force form to maintain state

// Update modal open handlers:
const openOrganizerModal = () => {
  setShowOrganizerModal(true);
  setFormKey(prev => prev + 1); // Force new instance
};

const openVoterModal = () => {
  setShowVoterModal(true);
  setFormKey(prev => prev + 1);
};

  const sidebarItems = {
    adminManagement: [
      { id: 'electionrequests', icon: FileText, label: 'Election Requests' },
      { id: 'activeelections', icon: Vote, label: 'Active Elections' },
      { id: 'archivedelections', icon: Archive, label: 'Archived Elections' }
    ],
    userManagement: [
      { id: 'organizerlist', icon: Users, label: 'Organizers' },
      { id: 'voterlist', icon: Users, label: 'Voters' },
    ],
    results: [
      { id: 'resultsdashboard', icon: BarChart3, label: 'Dashboard' },
      { id: 'electionresults', icon: FileText, label: 'Election Results' }
    ]
  };
   const closeOrganizerModal = () => {
    setShowOrganizerModal(false);
    setOrganizerFormData({
      fullName: '', 
      email: '', 
      password: '',
      phoneNum: '',
      aadhar: ''
    });
  };

  const closeVoterModal = () => {
    setShowVoterModal(false);
    setVoterFormData({
      fullName: '', 
      email: '', 
      password: '',
      phoneNum: '',
      aadhar: ''
    });
  };
  useEffect(() => {
  const fetchResults = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/election-results/all`);
      setElectionResults(response.data);
    } catch (error) {
      console.error('Error fetching election results:', error);
      setElectionResults([]);
    }
  };

  if (activeSection === 'electionresults' || activeSection === 'resultsdashboard') {
    fetchResults();
  }
}, [activeSection]);


  // Fetch Election Requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/election-requests`);
        const data = await response.json();
        
        const transformedData = data.map(request => ({
          id: request.id,
          title: request.election_title || request.electionTitle || request.title || 'N/A',
          organizer: request.organizer_name || request.organizerName || request.organizer || 'N/A',
          submittedDate: request.submitted_date || request.submittedDate || new Date().toISOString().split('T')[0],
          startDate: request.start_date || request.startDate || 'N/A',
          endDate: request.end_date || request.endDate || 'N/A', 
          expectedVoters: request.expected_voters || request.expectedVoters || 0,
          status: request.status || 'pending',
          description: request.description || ''
        }));
        setElectionRequests(transformedData);
      } catch (err) {
        console.error("Election Requests API Error:", err);
      }
    };
    
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Organizers
// Fetch Organizers
useEffect(() => {
  const fetchOrganizers = () => {
    axios.get(`${API_BASE_URL}/users/organizers`)
      .then(res => {
        const transformedOrganizers = res.data.map(organizer => ({
          id: organizer.email,
          name: organizer.fullName,
          email: organizer.email,
          phoneNum: organizer.phoneNum,
          aadhar: organizer.aadhar,
          joinDate: organizer.joinDate || 'N/A',
          status: organizer.isActive ? 'active' : 'inactive'
        }));
        setOrganizers(transformedOrganizers);
      })
      .catch(err => console.error("Error fetching organizers:", err));
  };
  fetchOrganizers();
}, []);

// Fetch Voters
useEffect(() => {
  const fetchVoters = () => {
    axios.get(`${API_BASE_URL}/users/voters`)
      .then(res => {
        const transformedVoters = res.data.map(voter => ({
          id: voter.email,
          name: voter.fullName,
          email: voter.email,
          phoneNum: voter.phoneNum,
          aadhar: voter.aadhar,
          joinDate: voter.joinDate || 'N/A',
          status: voter.isActive ? 'active' : 'inactive'
        }));
        setVoters(transformedVoters);
      })
      .catch(err => console.error("Error fetching voters:", err));
  };
  fetchVoters();
}, []);

  // Fetch Active Elections
  // Fetch Active Elections
 // In Admin.jsx - Update the Active Elections fetch
useEffect(() => {
  const fetchActiveElections = async () => {
    try {
      setActiveElectionsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/active-elections`);
      
      // Filter to show only ACTIVE elections
      const activeOnly = response.data.filter(election => election.status === 'ACTIVE');
      
      setActiveElections(activeOnly);
      setActiveElectionsError(null);
    } catch (error) {
      console.error('Error fetching active elections:', error);
      setActiveElectionsError('Failed to load active elections');
    } finally {
      setActiveElectionsLoading(false);
    }
  };

  fetchActiveElections();
}, []); // Add dependency array if needed

  // Fetch Archived Elections
  // Fetch Archived Elections when section is active
useEffect(() => {
  if (activeSection === 'archivedelections') {
    fetchArchivedElections();
  }
}, [activeSection]);

// In Admin.jsx - Archived elections should show COMPLETED ones
const fetchArchivedElections = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/active-elections`);
    
    // Filter to show only COMPLETED elections
    const completedOnly = response.data.filter(election => election.status === 'COMPLETED');
    
    setArchivedElections(completedOnly);
  } catch (error) {
    console.error('Error fetching archived elections:', error);
  }
};

  // Election Request Actions
  const handleApproveRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this election request?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/election-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to approve');
      
      setElectionRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'APPROVED' } : req
      ));
      
      alert('Election request approved successfully!');
    } catch (err) {
      console.error("Error approving request:", err);
      alert('Failed to approve request.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = window.prompt('Please provide a reason for rejecting this request (optional):');
    
    if (reason === null) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/election-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) throw new Error('Failed to reject');
      
      setElectionRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'REJECTED' } : req
      ));
      
      alert('Election request rejected successfully!');
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert('Failed to reject request.');
    }
  };

  // Organizer Actions
 const handleToggleOrganizerStatus = async (email) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${email}/toggle-status`);
    setOrganizers(prev => prev.map(org => 
      org.email === email ? {
        ...org,
        status: response.data.isActive ? 'active' : 'inactive'
      } : org
    ));
  } catch (err) {
    console.error("Error toggling organizer status:", err);
    alert('Failed to update status.');
  }
};

const handleAddOrganizer = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/organizers`, formData);

      if (response.status === 200 || response.status === 201) {
        const res = await axios.get(`${API_BASE_URL}/users/organizers`);
        const transformedOrganizers = res.data.map(organizer => ({
          id: organizer.email,
          name: organizer.fullName,
          email: organizer.email,
          phoneNum: organizer.phoneNum,
          aadhar: organizer.aadhar,
          joinDate: organizer.joinDate || "N/A",
          status: organizer.isActive !== undefined ? (organizer.isActive ? 'active' : 'inactive') : 'inactive'
        }));
        setOrganizers(transformedOrganizers);

        alert("Organizer added successfully!");
        closeOrganizerModal(); // Close and clear form
      }
    } catch (error) {
      console.error("Error adding organizer:", error);
      alert(error.response?.data?.message || "Failed to add organizer. Email may already exist.");
      throw error;
    }
  };

  // Voter Actions
  const handleToggleVoterStatus = async (email) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${email}/toggle-status`);
    setVoters(prev => prev.map(voter => 
      voter.email === email ? {
        ...voter,
        status: response.data.isActive ? 'active' : 'inactive'
      } : voter
    ));
  } catch (err) {
    console.error("Error toggling voter status:", err);
    alert('Failed to update status.');
  }
};

 const handleAddVoter = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/voters`, formData);
      
      if (response.status === 200 || response.status === 201) {
        const res = await axios.get(`${API_BASE_URL}/users/voters`);
        const transformedVoters = res.data.map(voter => ({
          id: voter.email,
          name: voter.fullName,
          email: voter.email,
          phoneNum: voter.phoneNum,
          aadhar: voter.aadhar,
          voterId: voter.voterId,
          joinDate: voter.joinDate || 'N/A',
          status: voter.isActive !== undefined ? (voter.isActive ? 'active' : 'inactive') : 'inactive'
        }));
        setVoters(transformedVoters);
        
        alert('Voter added successfully!');
        closeVoterModal(); // Close and clear form
      }
    } catch (error) {
      console.error('Error adding voter:', error);
      alert(error.response?.data?.message || 'Failed to add voter. Email may already exist.');
      throw error;
    }
  };


  // View Details Handler
  const handleViewDetails = async (user, type) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${user.email}`);
    const fetchedUser = {
      ...response.data,
      name: response.data.fullName,
      status: response.data.isActive ? 'active' : 'inactive'
    };
    setViewingUser(fetchedUser);
    setViewUserType(type);
    setShowViewModal(true);
  } catch (err) {
    console.error("Error fetching user details:", err);
    alert('Failed to load user details.');
  }
};

  // Status Badge Component
  const StatusBadge = ({ status, children }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800', 
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {children}
      </span>
    );
  };

  // View Details Modal Component
  const ViewDetailsModal = ({ user, userType, onClose }) => {
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {userType === 'organizer' ? 'Organizer Details' : 'Voter Details'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Full Name</p>
                <p className="text-gray-900">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>
            
            {user.phoneNum && (
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone Number</p>
                  <p className="text-gray-900">{user.phoneNum}</p>
                </div>
              </div>
            )}
            
            {user.aadhar && (
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Aadhar Number</p>
                  <p className="text-gray-900">{user.aadhar}</p>
                </div>
              </div>
            )}
            
            {userType === 'voter' && user.voterId && (
              <div className="flex items-start space-x-3">
                <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Voter ID</p>
                  <p className="text-gray-900">{user.voterId}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Department</p>
                <p className="text-gray-900">{user.department}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Join Date</p>
                <p className="text-gray-900">{user.joinDate}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {userType === 'organizer' ? 'Elections Organized' : 'Elections Participated'}
                </p>
                <p className="text-gray-900">
                  {userType === 'organizer' ? user.electionsCount : user.electionsParticipated}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full mt-1 ${
                user.status === 'active' ? 'bg-green-500' : 
                user.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className={`font-medium ${
                  user.status === 'active' ? 'text-green-600' : 
                  user.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {user.status === 'pending' ? 'Needs Activation' : user.status.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-150"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Organizer Modal Component
  const AddOrganizerModal = ({ formData, setFormData, onClose, onSubmit }) => {
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.phoneNum.trim()) {
        newErrors.phoneNum = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phoneNum)) {
        newErrors.phoneNum = 'Phone number must be 10 digits';
      }
      if (!formData.aadhar.trim()) {
        newErrors.aadhar = 'Aadhar number is required';
      } else if (!/^\d{12}$/.test(formData.aadhar)) {
        newErrors.aadhar = 'Aadhar number must be 12 digits';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (err) {
        // Error handled by parent
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add New Organizer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Full Name
            </label>
            <input 
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address
            </label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline w-4 h-4 mr-1" />
              Password
            </label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline w-4 h-4 mr-1" />
              Phone Number
            </label>
            <input 
              type="tel"
              name="phoneNum"
              value={formData.phoneNum}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phoneNum ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNum && <p className="text-red-500 text-xs mt-1">{errors.phoneNum}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="inline w-4 h-4 mr-1" />
              Aadhar Number
            </label>
            <input 
              type="text"
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
              placeholder="Enter 12-digit Aadhar number"
              maxLength="12"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.aadhar ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.aadhar && <p className="text-red-500 text-xs mt-1">{errors.aadhar}</p>}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>Note:</strong> The organizer will be added with "Inactive" status. 
              Activate them manually to grant portal access.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Organizer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

  // Add Voter Modal Component
  const AddVoterModal = ({ formData, setFormData, onClose, onSubmit }) => {
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.phoneNum.trim()) {
        newErrors.phoneNum = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phoneNum)) {
        newErrors.phoneNum = 'Phone number must be 10 digits';
      }
      if (!formData.aadhar.trim()) {
        newErrors.aadhar = 'Aadhar number is required';
      } else if (!/^\d{12}$/.test(formData.aadhar)) {
        newErrors.aadhar = 'Aadhar number must be 12 digits';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (err) {
        // Error handled by parent
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add New Voter</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Full Name
            </label>
            <input 
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address
            </label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline w-4 h-4 mr-1" />
              Password
            </label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline w-4 h-4 mr-1" />
              Phone Number
            </label>
            <input 
              type="tel"
              name="phoneNum"
              value={formData.phoneNum}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phoneNum ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNum && <p className="text-red-500 text-xs mt-1">{errors.phoneNum}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="inline w-4 h-4 mr-1" />
              Aadhar Number
            </label>
            <input 
              type="text"
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
              placeholder="Enter 12-digit Aadhar number"
              maxLength="12"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.aadhar ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.aadhar && <p className="text-red-500 text-xs mt-1">{errors.aadhar}</p>}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>Note:</strong> The organizer will be added with "Inactive" status. 
              Activate them manually to grant portal access.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Voter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

  // Render Functions
  const renderElectionRequests = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Election Requests</h1>
          <nav className="flex text-sm text-gray-500 mt-1">
            <span className="text-blue-600">🏠 Home</span>
            <span className="mx-2">›</span>
            <span>Admin Management</span>
            <span className="mx-2">›</span>
            <span>Election Requests</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending & Recent Requests ({electionRequests.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Voters</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {electionRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{request.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{request.organizer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{request.submittedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{request.startDate} to {request.endDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{request.expectedVoters}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status}>
                      {request.status.toUpperCase()}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {request.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleApproveRequest(request.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors duration-150"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(request.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors duration-150"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderActiveElections = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active Elections</h1>
        <nav className="flex text-sm text-gray-500 mt-1">
          <span className="text-blue-600">🏠 Home</span>
          <span className="mx-2">›</span>
          <span>Admin Management</span>
          <span className="mx-2">›</span>
          <span>Active Elections</span>
        </nav>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Currently Running Elections ({activeElections.length})
        </h2>
      </div>
      {activeElectionsLoading && (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading active elections...</p>
        </div>
      )}

      {/* Error State */}
      {!activeElectionsLoading && activeElectionsError && (
        <div className="p-12 text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-red-600 font-semibold">Failed to load active elections</p>
          <p className="text-gray-600 text-sm mt-2">{activeElectionsError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!activeElectionsLoading && !activeElectionsError && activeElections.length === 0 && (
        <div className="p-12 text-center">
          <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">No Active Elections</p>
          <p className="text-gray-500 text-sm mt-2">
            There are currently no elections running. Check back later!
          </p>
        </div>
      )}
      {!activeElectionsLoading && !activeElectionsError && activeElections.length > 0 && (

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeElections.map(election => (
                <tr key={election.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{election.electionTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{election.organizerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{election.startDate} to {election.endDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-700">
                      {election.votedCount}/{election.totalVoters} 
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round((election.votedCount/election.totalVoters)*100)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status="active">ACTIVE</StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150">
                        <Eye className="w-3 h-3 mr-1" />
                        Monitor
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );

 const renderArchivedElections = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Archived Elections</h1>
          <nav className="flex text-sm text-gray-500 mt-1">
            <span className="text-blue-600">🏠 Home</span>
            <span className="mx-2">›</span>
            <span>Admin Management</span>
            <span className="mx-2">›</span>
            <span>Archived Elections</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Completed Elections ({archivedElections.length})
          </h2>
        </div>

        {archivedElections.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No archived elections yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ended On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archived At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Winner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {archivedElections.map(election => {
                  const participationRate = election.totalVoters > 0 
                    ? Math.round((election.votedCount / election.totalVoters) * 100) 
                    : 0;

                  return (
                    <tr key={election.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{election.title}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {election.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {election.organizer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {new Date(election.endDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-700">
                          {election.completedAt ? new Date(election.completedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Auto-archived
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-700">
                          {election.votedCount}/{election.totalVoters}
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${participationRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {participationRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">🏆</span>
                          <span className="text-gray-900 font-medium">
                            {election.winner || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewResults(election.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150 shadow-sm"
                        >
                          View Results
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const handleViewResults = (electionId) => {
  // Navigate to results page or show modal with detailed results
  console.log('View results for election:', electionId);
  // You can implement navigation or modal here
};
  const renderOrganizers = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizers Management</h1>
          <nav className="flex text-sm text-gray-500 mt-1">
            <span className="text-blue-600">🏠 Home</span>
            <span className="mx-2">›</span>
            <span>User Management</span>
            <span className="mx-2">›</span>
            <span>Organizers</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Registered Organizers ({organizers.length})</h2>
          <button 
            onClick={() => setShowOrganizerModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-150 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Organizer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhar</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
  </tr>
</thead>
<tbody className="bg-white divide-y divide-gray-200">
  {organizers.map(organizer => (
    <tr key={organizer.id} className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{organizer.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{organizer.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{organizer.phoneNum}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{organizer.aadhar}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{organizer.joinDate}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={organizer.status}>
          {organizer.status.toUpperCase()}
        </StatusBadge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button 
          onClick={() => handleToggleOrganizerStatus(organizer.email)}
          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
            organizer.status === 'active' 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {organizer.status === 'active' ? <UserX className="w-3 h-3 mr-1" /> : <UserCheck className="w-3 h-3 mr-1" />}
          {organizer.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderVoters = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voters Management</h1>
          <nav className="flex text-sm text-gray-500 mt-1">
            <span className="text-blue-600">🏠 Home</span>
            <span className="mx-2">›</span>
            <span>User Management</span>
            <span className="mx-2">›</span>
            <span>Voters</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Registered Voters ({voters.length})</h2>
          <button 
            onClick={() => setShowVoterModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-150 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Voter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhar</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
  </tr>
</thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voters.map(voter => (
                <tr key={voter.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{voter.voterId||'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{voter.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{voter.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{voter.department||'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{voter.electionsParticipated}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={voter.status}>
                      {voter.status.toUpperCase()}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleToggleVoterStatus(voter.email)}
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
                          voter.status === 'active' 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {voter.status === 'active' ? <UserX className="w-3 h-3 mr-1" /> : <UserCheck className="w-3 h-3 mr-1" />}
                        {voter.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleViewDetails(voter, 'voter')}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  const renderResultsDashboard = () => {
    // Calculate statistics from electionResults data
    const totalCompletedElections = electionResults.length;
    
    const totalVotesCast = electionResults.reduce((sum, election) => 
      sum + (election.totalVotesCast || 0), 0
    );
    
    const averageTurnout = electionResults.length > 0 
      ? Math.round(electionResults.reduce((sum, election) => 
          sum + (election.turnoutPercentage || 0), 0) / electionResults.length)
      : 0;
    
    const activeVotersCount = voters.filter(voter => voter.status === 'active').length;

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Results Dashboard</h1>
          <nav className="flex text-sm text-gray-500 mt-2">
            <span className="text-blue-600">🏠 Home</span>
            <span className="mx-2">›</span>
            <span>Results</span>
            <span className="mx-2">›</span>
            <span>Dashboard</span>
          </nav>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">Completed Elections</h3>
                <div className="text-3xl font-bold text-green-600">
                  {totalCompletedElections}
                </div>
                <p className="text-gray-600 text-sm mt-2">Total finished elections</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Total Votes Cast</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {totalVotesCast}
                </div>
                <p className="text-gray-600 text-sm mt-2">Across all elections</p>
              </div>
              <Vote className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-600 mb-2">Average Turnout</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {averageTurnout}%
                </div>
                <p className="text-gray-600 text-sm mt-2">Voter participation rate</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-2">Active Voters</h3>
                <div className="text-3xl font-bold text-orange-600">
                  {activeVotersCount}
                </div>
                <p className="text-gray-600 text-sm mt-2">Eligible to vote</p>
              </div>
              <UserCheck className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Election Results</h3>
          {electionResults.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No election results available yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {electionResults.slice(0, 5).map(election => {
                // Get winner from first position (or find across all positions)
                const firstPosition = Object.keys(election.positions || {})[0];
                const winner = firstPosition 
                  ? election.positions[firstPosition].find(c => c.isWinner)
                  : null;

                return (
                  <div key={election.electionId} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{election.electionTitle}</h4>
                      <p className="text-gray-600 text-sm">
                        Organized by: {election.organizerName}
                      </p>
                      {winner && (
                        <p className="text-gray-600 text-sm">
                          🏆 Winner ({firstPosition}): {winner.name} ({winner.party})
                        </p>
                      )}
                      <p className="text-gray-600 text-sm">
                        Participation: {election.totalVotesCast}/{election.totalEligibleVoters} 
                        ({election.turnoutPercentage}%)
                      </p>
                      {election.completedAt && (
                        <p className="text-gray-500 text-xs">
                          Completed: {new Date(election.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  

// Add this to your Admin.jsx file to replace the renderElectionResults function

const renderElectionResults = () => {

  const handleViewResultDetails = (election) => {
    setSelectedElectionResult(election);
    setShowResultDetails(true);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          <span className="mx-2">›</span>
          <span>Election Results</span>
        </nav>
      </div>

      {electionResults.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No election results available yet</p>
          <p className="text-gray-400 text-sm mt-2">Results will appear here after elections are completed</p>
        </div>
      ) : (
        <div className="space-y-6">
          {electionResults.map((election) => (
            <div key={election.electionId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Election Card Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{election.electionTitle}</h2>
                    <div className="flex items-center gap-2 mt-2 text-red-100">
                      <span className="text-sm">Organized by:</span>
                      <span className="font-medium">{election.organizerName}</span>
                    </div>
                    <div className="flex items-center gap-6 mt-3 text-red-100">
                      <span className="flex items-center gap-2">
                        <span>📊</span>
                        <span className="text-sm">{election.totalVotesCast} votes cast</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span>👥</span>
                        <span className="text-sm">{election.totalEligibleVoters} eligible voters</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span>📈</span>
                        <span className="text-sm">{election.turnoutPercentage}% turnout</span>
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewResultDetails(election)}
                    className="inline-flex items-center px-4 py-2 bg-white text-purple-600 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors duration-150 shadow-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Details
                  </button>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(election.positions || {}).slice(0, 3).map(([position, candidates]) => {
                    const winner = candidates.find(c => c.isWinner);
                    return (
                      <div key={position} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">{position}</h4>
                        {winner ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🏆</span>
                              <span className="font-medium text-gray-900">{winner.name}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{winner.party}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-blue-600 font-bold">{winner.votes} votes</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {winner.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No winner determined</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {Object.keys(election.positions || {}).length > 3 && (
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => handleViewResultDetails(election)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View {Object.keys(election.positions).length - 3} more position(s) →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Election Result Details Modal */}
      {showResultDetails && selectedElectionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-6xl w-full shadow-2xl my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">{selectedElectionResult.electionTitle}</h3>
                  <p className="text-red-100 mt-1">
                    Organized by: {selectedElectionResult.organizerName} | Complete Election Results & Analytics
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowResultDetails(false);
                    setSelectedElectionResult(null);
                  }}
                  className="text-white hover:bg-purple-800 rounded-lg p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium">Total Votes Cast</div>
                  <div className="text-3xl font-bold text-blue-700 mt-2">{selectedElectionResult.totalVotesCast}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-green-600 font-medium">Eligible Voters</div>
                  <div className="text-3xl font-bold text-green-700 mt-2">{selectedElectionResult.totalEligibleVoters}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium">Turnout</div>
                  <div className="text-3xl font-bold text-purple-700 mt-2">{selectedElectionResult.turnoutPercentage}%</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-sm text-orange-600 font-medium">Positions</div>
                  <div className="text-3xl font-bold text-orange-700 mt-2">
                    {Object.keys(selectedElectionResult.positions || {}).length}
                  </div>
                </div>
              </div>

              {/* Detailed Results by Position */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-gray-900 border-b-2 border-red-500 pb-2">
                  Position-wise Results
                </h4>

                {Object.entries(selectedElectionResult.positions || {}).map(([position, candidates]) => {
                  const totalPositionVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
                  const winner = candidates.find(c => c.isWinner);

                  return (
                    <div key={position} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Position Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h5 className="text-lg font-semibold text-gray-900">{position}</h5>
                          <div className="text-sm text-gray-600">
                            Total Votes: <span className="font-bold">{totalPositionVotes}</span>
                          </div>
                        </div>
                        {winner && (
                          <div className="mt-2 text-sm text-green-700 font-medium">
                            🏆 Winner: {winner.name} ({winner.party}) - {winner.votes} votes ({winner.percentage.toFixed(1)}%)
                          </div>
                        )}
                      </div>

                      {/* Candidates Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Votes</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {candidates.map((candidate, idx) => (
                              <tr key={idx} className={candidate.isWinner ? 'bg-green-50' : 'hover:bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className={`text-lg font-bold ${
                                    idx === 0 ? 'text-yellow-600' :
                                    idx === 1 ? 'text-gray-500' :
                                    idx === 2 ? 'text-orange-600' :
                                    'text-gray-400'
                                  }`}>
                                    #{idx + 1}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{candidate.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                  {candidate.party}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-xl font-bold text-blue-600">{candidate.votes}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3" style={{width: '100px'}}>
                                      <div 
                                        className="bg-blue-600 h-2.5 rounded-full" 
                                        style={{width: `${candidate.percentage}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                      {candidate.percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {candidate.isWinner ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
                                      🏆 Winner
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                      Candidate
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion Info */}
              {selectedElectionResult.completedAt && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">Election Completed:</span> {new Date(selectedElectionResult.completedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 bg-gray-50 rounded-b-xl border-t">
              <div className="text-sm text-gray-600">
                Organized by: <span className="font-medium text-gray-900">{selectedElectionResult.organizerName}</span>
              </div>
              <button 
                onClick={() => {
                  setShowResultDetails(false);
                  setSelectedElectionResult(null);
                }}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-150 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
  const renderDashboard = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <nav className="flex text-sm text-gray-500 mt-2">
          <span className="text-blue-600">🏠 Home</span>
          <span className="mx-2">›</span>
          <span>Dashboard</span>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Pending Requests</h3>
              <div className="text-3xl font-bold text-red-600">
                {electionRequests.filter(req => req.status.toLowerCase() === 'pending').length}
              </div>
              <p className="text-gray-600 text-sm mt-2">Elections awaiting approval</p>
            </div>
            <FileText className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">Active Elections</h3>
              <div className="text-3xl font-bold text-green-600">
                {activeElections.length}
              </div>
              <p className="text-gray-600 text-sm mt-2">Currently running</p>
            </div>
            <Vote className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Total Organizers</h3>
              <div className="text-3xl font-bold text-blue-600">
                {organizers.filter(org => org.status === 'active').length}
              </div>
              <p className="text-gray-600 text-sm mt-2">Active organizers</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-yellow-600 mb-2">Total Voters</h3>
              <div className="text-3xl font-bold text-yellow-600">
                {voters.filter(voter => voter.status === 'active').length}
              </div>
              <p className="text-gray-600 text-sm mt-2">Registered voters</p>
            </div>
            <Users className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="text-gray-900"><strong>Pending Election Requests:</strong> {electionRequests.filter(req => req.status.toLowerCase() === 'pending').length} requests awaiting approval</p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="text-gray-900"><strong>Active Elections:</strong> {activeElections.length} elections currently running</p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="text-gray-900"><strong>User Management:</strong> {organizers.length} organizers and {voters.length} voters registered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-3 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold">e-VotingSystem - Admin</div>
        </div>
        <div className="flex items-center space-x-2 relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-red-700 rounded-lg px-3 py-2 transition-colors duration-150"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <span className="font-medium">{displayname}</span>
            <span className="text-xs">▼</span>
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

          <nav className="flex-1 p-4 space-y-6">
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                ADMIN MANAGEMENT
              </div>
              {sidebarItems.adminManagement.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                      activeSection === item.id 
                        ? 'bg-slate-700 text-white border-r-2 border-red-500 font-medium' 
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

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                USER MANAGEMENT
              </div>
              {sidebarItems.userManagement.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                      activeSection === item.id 
                        ? 'bg-slate-700 text-white border-r-2 border-red-500 font-medium' 
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

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                RESULTS
              </div>
              {sidebarItems.results.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                      activeSection === item.id 
                        ? 'bg-slate-700 text-white border-r-2 border-red-500 font-medium' 
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
          {activeSection === 'electionrequests' && renderElectionRequests()}
          {activeSection === 'activeelections' && renderActiveElections()}
          {activeSection === 'archivedelections' && renderArchivedElections()}
          {activeSection === 'organizerlist' && renderOrganizers()}
          {activeSection === 'voterlist' && renderVoters()}
          {activeSection === 'resultsdashboard' && renderResultsDashboard()}
          {activeSection === 'electionresults' && renderElectionResults()}
          {!['dashboard', 'electionrequests', 'activeelections', 'archivedelections', 'organizerlist', 'voterlist', 'resultsdashboard', 'electionresults'].includes(activeSection) && (
            <div className="p-6 bg-gray-50 min-h-screen">
              <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-200">
                <p className="text-lg">This section is under development.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
     {showOrganizerModal && (
        <AddOrganizerModal 
          formData={organizerFormData}
          setFormData={setOrganizerFormData}
          onClose={closeOrganizerModal}
          onSubmit={handleAddOrganizer}
        />
      )}

      {showVoterModal && (
        <AddVoterModal 
          formData={voterFormData}
          setFormData={setVoterFormData}
          onClose={closeVoterModal}
          onSubmit={handleAddVoter}
        />
      )}

      {showViewModal && (
        <ViewDetailsModal 
          user={viewingUser} 
          userType={viewUserType} 
          onClose={() => setShowViewModal(false)} 
        />
      )}
    </div>
  );
};

export default VotingDashboard;