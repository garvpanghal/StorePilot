import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [theme] = useState(() => localStorage.getItem('storepilot-theme') || 'dark');

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logoSrc = theme === 'dark' ? '/assets/logo-light.png' : '/assets/logo-dark.png';

  return (
    <div className="loginContainer">
      {/* Top Left Navigation Link */}
      <Link to="/" className="backToHome">
        <ArrowLeft size={14} />
        <span>Back to StorePilot</span>
      </Link>

      {/* Left Panel: Visual Storytelling */}
      <div className="loginVisualPanel">
        <div className="visualGlows">
          <div className="glowCyan" />
          <div className="glowPurple" />
        </div>
        
        <div className="visualContent">
          <div className="visualLogo">
            <img src={logoSrc} alt="StorePilot" />
          </div>
          
          <div className="visualHeader">
            <h2>
              SEE YOUR STORE <br />
              <span className="accentText">CLEARLY.</span>
            </h2>
            <div className="visualSubtitle">
              <span>● Inventory</span>
              <span>● Sales</span>
              <span>● Intelligence</span>
            </div>
          </div>

          {/* Animated data visualization */}
          <div className="animatedViz">
            <div className="vizHeader">
              <div className="vizMeta">
                <span className="vizLabel">Sales Performance</span>
                <strong className="vizValue">₹84,240</strong>
              </div>
              <span className="vizTrend positive">
                <TrendingUp size={13} /> +12.4%
              </span>
            </div>
            
            <div className="vizChart">
              <svg viewBox="0 0 300 80" width="100%" height="80">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,60 Q35,30 70,40 T140,25 T210,35 T280,15 L280,80 L0,80 Z" 
                  fill="url(#chartGrad)"
                />
                <path 
                  d="M0,60 Q35,30 70,40 T140,25 T210,35 T280,15" 
                  fill="none" 
                  stroke="var(--primary)" 
                  strokeWidth="2.5"
                  className="animLine"
                />
                <circle cx="280" cy="15" r="4.5" fill="var(--primary)" className="animPulseDot" />
              </svg>
            </div>
          </div>

          {/* Floating micro-cards */}
          <div className="floatingCards">
            <div className="microCard floatCard1">
              <CheckCircle size={13} className="iconGreen" />
              <span>Inventory healthy</span>
            </div>
            <div className="microCard floatCard2">
              <Sparkles size={13} className="iconPurple" />
              <span>3 AI insights ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="loginFormPanel">
        <div className="loginCard">
          <div className="loginFormHeader">
            <img src={logoSrc} alt="StorePilot Logo" className="formLogo" />
            <h1>Welcome back</h1>
            <p>Sign in to your account to manage store pilot metrics</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="loginError">{error}</div>}
            
            <div className="inputField">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@storepilot.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="inputField">
              <div className="pwdLabelRow">
                <label htmlFor="password">Password</label>
              </div>
              <div className="pwdInputWrapper">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  className="pwdToggle" 
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="primary loginBtn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={15} style={{ marginLeft: 8 }} />}
            </button>
          </form>

          <div className="loginHint">
            <span>Demo Credentials:</span>
            <div className="demoCreds">
              <code>admin@storepilot.com</code>
              <code>storepilot123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
