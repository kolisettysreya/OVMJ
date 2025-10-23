import React, { useState } from "react";
import Dashboard from "./Admin";
import Organizer from "./Organizer";
import Voter from "./Voter";
import { API_BASE_URL } from '../config/api';

const Homepage = ({ onLoginSuccess }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  

  const handleLoginSuccess = (role, userInfo) => {
  console.log("handleLoginSuccess called with:", role, userInfo);
  
  setUserRole(role);
  setUserData(userInfo); // Store user data
  
  const normalizedRole = role.toLowerCase().trim();
  
  if (normalizedRole === "admin") {
    setCurrentPage("dashboard");
  } else if (normalizedRole === "organizer") {
    setCurrentPage("organizer");
  } else if (normalizedRole === "voter") {
    setCurrentPage("voter");
  }
};

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentPage("home");
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Professional Login Component
  const LoginComponent = ({onLogin}) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Sign up specific fields
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [aadharNumber, setAadharNumber] = useState('');
    const [role, setRole] = useState('voter'); 

    const handleSubmit = async (e) => {
  e.preventDefault();

  const url = isSignUp
    ? `${API_BASE_URL}/users/signup`
    : `${API_BASE_URL}/users/signin`;

  const payload = isSignUp
    ? { 
        fullName: fullName, 
        email, 
        password, 
        phoneNum: phoneNumber, 
        aadhar: aadharNumber, 
        role 
      }
    : { 
        email, 
        password, 
        role 
      };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Handle account inactive error
    if (response.status === 403 && data.error === 'ACCOUNT_INACTIVE') {
      alert('⚠️ Account Inactive\n\nYour account has been deactivated by the administrator. Please contact support for activation.');
      return;
    }

    // Handle invalid credentials
    if (response.status === 401) {
      alert(data.message || 'Invalid email or password');
      return;
    }

    // Handle user already exists (signup)
    if (response.status === 409) {
      alert(data.message || 'User with this email already exists');
      return;
    }

    // Handle success
    if (data.success) {
      if (isSignUp) {
        alert('✅ Signup Successful!\n\nYour account has been created. Please wait for administrator approval before logging in.');
        setIsSignUp(false); // Switch to login view
        return;
      }

      // Login successful
      alert('Login successful!');
      
      const userInfo = {
        fullName: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
        department: data.user.department,
        phoneNum: data.user.phoneNum
      };

      setTimeout(() => {
        handleLoginSuccess(data.user.role, userInfo);
      }, 100);
    } else {
      alert(data.message || 'Operation failed');
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Network Error\n\nUnable to connect to the server. Please check if the backend is running on port 7075.");
  }
};


    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Professional background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(167,243,208,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(59,130,246,0.1)_25%,transparent_25%,transparent_50%,rgba(59,130,246,0.1)_50%,rgba(59,130,246,0.1)_75%,transparent_75%)] bg-[length:60px_60px]"></div>
        </div>

        {/* Floating security icons */}
        <div className="absolute top-20 left-20 text-blue-300/30 text-6xl animate-pulse">🔐</div>
        <div className="absolute bottom-20 right-20 text-green-300/30 text-5xl animate-bounce">🛡️</div>
        <div className="absolute top-40 right-40 text-purple-300/30 text-4xl animate-pulse">⚡</div>
        <div className="absolute bottom-40 left-40 text-cyan-300/30 text-5xl animate-bounce">🔒</div>

        {/* Main login container */}
        <div className="w-full max-w-6xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            
            {/* Left side - Professional branding */}
            <div className="bg-gradient-to-br from-blue-600/90 to-indigo-700/90 backdrop-blur-sm p-12 flex flex-col justify-center text-white relative overflow-hidden">
              
              {/* Security badge */}
              <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm rounded-full p-4">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
              </div>

              {/* Main content */}
              <div className="relative z-10">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-3xl">🗳️</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    Secure Digital Voting Platform
                  </h1>
                  <p className="text-xl opacity-90 leading-relaxed mb-8">
                    {isSignUp 
                      ? "Join thousands of organizations using our enterprise-grade voting infrastructure for transparent, secure elections."
                      : "Access your secure voting dashboard and participate in democratic processes with complete confidence and transparency."
                    }
                  </p>
                </div>

                {/* Security features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm font-medium">256-bit End-to-End Encryption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm font-medium">Blockchain-Verified Results</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm font-medium">Multi-Factor Authentication</span>
                  </div>
                </div>
              </div>

              {/* Bottom gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-700/50 to-transparent"></div>
            </div>
            
            {/* Right side - Professional login form */}
            <div className="bg-white p-12 flex flex-col justify-center">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </h2>
                <p className="text-gray-600">
                  {isSignUp ? 'Register for secure access' : 'Access your voting dashboard'}
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mt-4 rounded-full"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhar Number</label>
                      <input
                        type="text"
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value)}
                        placeholder="12-digit Aadhar number"
                        maxLength="12"
                        pattern="[0-9]{12}"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                  >
                    <option value="voter">Voter</option>
                    <option value="organizer">Election Organizer</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
                
                {!isSignUp && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">Forgot Password?</a>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                >
                  {isSignUp ? 'Create Account' : 'Sign In Securely'}
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600 mb-4">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {isSignUp ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
                
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 font-medium transition-all duration-200"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If user clicks login, show the login component
  if (currentPage === 'login') {
    return <LoginComponent onLogin={handleLoginSuccess} />;
  }

  if (currentPage === 'dashboard') {
  return <Dashboard onLogout={handleLogout} userData={userData} />;
}
if (currentPage === 'organizer') {
  return <Organizer onLogout={handleLogout} userData={userData} />;
}
if (currentPage === 'voter') {
  return <Voter onLogout={handleLogout} userData={userData} />;
}

  return (
    <div className="w-screen min-h-screen font-sans m-0 p-0 overflow-auto box-border bg-gray-50">
      
      {/* Professional Navigation */}
      <nav className="w-full px-8 py-4 flex justify-between items-center fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-lg z-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div className="font-bold text-2xl text-gray-800">SecureVote</div>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a>
          <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
          <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Solutions</a>
          <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
          <button
            onClick={handleLoginClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            Access Portal
          </button>
        </div>
      </nav>

      {/* Professional Hero Section */}
      <section
        id="home"
        className="flex flex-col justify-center items-center w-screen h-screen px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white text-center box-border relative overflow-hidden"
      >
        {/* Professional background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(30,58,138,0.5)_25%,transparent_25%,transparent_50%,rgba(30,58,138,0.5)_50%,rgba(30,58,138,0.5)_75%,transparent_75%)] bg-[length:100px_100px] opacity-20"></div>
        </div>

        {/* Floating security elements */}
        <div className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-2xl">🔐</span>
        </div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-xl">🛡️</span>
        </div>
        <div className="absolute top-1/3 right-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-lg">⚡</span>
        </div>

        <div className="relative z-10 max-w-6xl w-full">
        
          
          <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-tight">
            Smart and Secure<br/>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              Digital Elections
            </span>
          </h1>
          <p className="text-xl lg:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed opacity-90 font-light">
           Empowering organizations to conduct transparent and tamper-proof elections with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-10 py-5 rounded-xl text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl min-w-[200px]"
              onClick={() => scrollToSection('services')}
            >
              Start Voting
            </button>
            <button 
              className="border-2 border-white/50 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold px-10 py-5 rounded-xl text-lg transition-all duration-300 transform hover:-translate-y-1 min-w-[200px]"
              onClick={() => scrollToSection('contact')}
            >
              Schedule Demo
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
              <div className="text-sm opacity-80">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">500K+</div>
              <div className="text-sm opacity-80">Votes Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-sm opacity-80">Expert Support</div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce"
          onClick={() => scrollToSection('services')}
        >
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Professional Services Section */}
      <section
        id="services"
        className="w-full min-h-screen py-24 px-8 bg-white flex flex-col justify-center items-center"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">Enterprise Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive voting infrastructure designed for organizations that demand the highest levels of security and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                title: "Smart Election Management",
                description: "Plan, configure, and control your elections effortlessly. Manage candidates, schedule events, and monitor participation — all from one unified dashboard.",
                icon: "⚙️",
                color: "from-blue-500 to-indigo-600"
              },
              {
                title: "Advanced Analytics Dashboard",
                description: "Real-time insights with comprehensive reporting tools, voter engagement metrics, and detailed audit trails for complete oversight.",
                icon: "📊",
                color: "from-purple-500 to-pink-600"
              },
              {
                title: "Secure Validation System",
                description: "Ensure every vote counts and no duplicates exist.Our validation module verifies voter eligibility, session authenticity, and voting timestamps to maintain complete election integrity.",
                icon: "✅",
                color: "from-green-500 to-emerald-600"
              }
            ].map((service, index) => (
              <div 
                key={index} 
                className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{service.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center space-x-2 group-hover:translate-x-2 transition-transform duration-300">
                    <span>Learn More</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Professional */}
      <section
        id="about"
        className="w-full min-h-screen py-24 px-8 bg-gray-50 flex flex-col justify-center items-center"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">
             Trusted by Institutions and Communities
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our Online Voting System is designed for universities, organizations, and communities that demand a secure, transparent, and efficient way to conduct elections.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {[
              { number: "100K+", label: "Verified Votes", icon: "✓" },
              { number: "99.99%", label: "System Uptime", icon: "⚡" },
              { number: "15+", label: "Organizations", icon: "🏢" },
              { number: "24/7", label: "Security Monitoring", icon: "👁️" }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">{stat.icon}</span>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Why Choose SecureVote?</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Role-Based Access Control</h4>
                      <p className="text-gray-600">Each user has a dedicated dashboard designed for their specific tasks and privileges.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Compliance Ready</h4>
                      <p className="text-gray-600">Meets all major regulatory requirements including GDPR, CCPA, and election standards.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">24/7 Expert Support</h4>
                      <p className="text-gray-600">Dedicated support team ensures your elections run smoothly from start to finish.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
                                <div className="text-6xl mb-4">🏆</div>
                <h4 className="text-2xl font-bold text-gray-800 mb-4">Industry Leader</h4>
                <p className="text-gray-600 mb-6">
                  Recognized as the global leader in secure digital elections, 
                  delivering trusted solutions for governments, corporations, 
                  and institutions worldwide.
                </p>
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      {/* About Us Section */}
<section
  id="about"
  className="w-full min-h-screen py-24 px-8 bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col justify-center items-center"
>
  <div className="max-w-6xl mx-auto">
    {/* Header */}
    <div className="text-center mb-16">
      <h2 className="text-5xl font-bold text-gray-800 mb-6">About Us</h2>
      <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-6 rounded-full"></div>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Empowering democratic processes through cutting-edge technology and unwavering commitment to security and transparency.
      </p>
    </div>

    {/* Mission & Vision */}
    <div className="grid lg:grid-cols-2 gap-8 mb-16">
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
          <span className="text-3xl">🎯</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
        <p className="text-gray-600 leading-relaxed">
          To revolutionize the voting experience by providing a secure, accessible, and transparent platform that empowers every voice to be heard. We believe in making democracy more inclusive and efficient through innovative technology.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
          <span className="text-3xl">🔮</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
        <p className="text-gray-600 leading-relaxed">
          To become the global standard for digital voting systems, trusted by organizations worldwide for conducting fair, secure, and transparent elections. We envision a future where every vote counts and democracy thrives in the digital age.
        </p>
      </div>
    </div>

    

    {/* Team Info */}
    <div className="bg-gradient-to-r from-blue-700 to-blue-400 rounded-3xl p-12 text-black text-center mb-16">
      <div className="text-5xl mb-6">👥</div>
      <h3 className="text-3xl font-bold mb-4">Built with Commitment, Trusted by Many</h3>
      <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
        Our team of developers, and democracy advocates work tirelessly to ensure SecureVote remains the most reliable and secure voting platform available.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div>
          <div className="text-3xl font-bold mb-2">5+</div>
          <div className="text-sm opacity-80">Developers</div>
        </div>
        <div>
          <div className="text-3xl font-bold mb-2">10+</div>
          <div className="text-sm opacity-80">Successful Elections</div>
        </div>
        <div>
          <div className="text-3xl font-bold mb-2">99.9%</div>
          <div className="text-sm opacity-80">Client Satisfaction</div>
        </div>
      </div>
    </div>

    {/* Copyright Footer */}
    <div className="text-center py-12 mt-16 border-t border-gray-200">
      <p className="text-gray-600 font-medium text-lg">
        © 2023 TeamPNS. All rights reserved.
      </p>
      <p className="text-gray-500 text-sm mt-2">
        Secured by industry-leading encryption and compliance standards
      </p>
    </div>
  </div>
</section>
    </div>
  );
};

export default Homepage;
