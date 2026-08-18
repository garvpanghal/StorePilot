import React, { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../api/api';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';

export default function Login({ initialMode = 'login' }) {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [businessType, setBusinessType] = useState('Retail');
  const [businessAddress, setBusinessAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [theme] = useState(() => localStorage.getItem('storepilot-theme') || 'dark');

  // Sync mode with route pathname transitions
  useEffect(() => {
    setIsSignUp(location.pathname === '/register' || initialMode === 'signup');
    setStep(1);
    setError('');
  }, [location.pathname, initialMode]);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleNextStep = () => {
    setError('');
    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedShop = shopName.trim();

    if (step === 1) {
      if (!trimmedName) {
        setError('Full name is required');
        return;
      }
      if (!trimmedEmail) {
        setError('Email address is required');
        return;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmedEmail)) {
        setError('Please enter a valid email address');
        return;
      }
      if (!trimmedPhone) {
        setError('Phone number is required');
        return;
      }
      const phonePattern = /^(?:\+91|91|0)?[6-9]\d{9}$/;
      if (!phonePattern.test(trimmedPhone)) {
        setError('Please enter a valid Indian mobile number');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!trimmedShop) {
        setError('Shop / Business name is required');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isSignUp && step < 3) {
      handleNextStep();
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedShop = shopName.trim();

    if (isSignUp) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await authAPI.register(
          trimmedEmail,
          trimmedName,
          trimmedPhone,
          trimmedShop,
          businessType,
          businessAddress.trim() || null,
          password,
          confirmPassword
        );
        showToast('Account created successfully! Please sign in.', 'success');
        setIsSignUp(false);
        setStep(1);
        setPassword('');
        setConfirmPassword('');
      } else {
        await login(trimmedEmail, password);
      }
    } catch (err) {
      setError(err.message || (isSignUp ? 'Registration failed' : 'Login failed'));
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

      {/* Right Panel: Form Panel */}
      <div className="loginFormPanel">
        <div className="loginCard">
          <div className="loginFormHeader">
            <img src={logoSrc} alt="StorePilot Logo" className="formLogo" />
            <h1>{isSignUp ? 'Create an account' : 'Welcome back'}</h1>
            <p>{isSignUp ? 'Get started with StorePilot by registering your details' : 'Sign in to your account to manage store pilot metrics'}</p>
          </div>

          {isSignUp && (
            <div className="stepProgressBar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'var(--border)', zIndex: 1 }}>
                <div style={{ width: `${((step - 1) / 2) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
              </div>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: step >= s ? 'var(--primary)' : 'var(--bg-card)',
                    color: step >= s ? '#fff' : 'var(--text-muted)',
                    border: `2px solid ${step >= s ? 'var(--primary)' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    transition: 'all 0.3s'
                  }}>
                    {s}
                  </div>
                  <span style={{ fontSize: '0.75rem', marginTop: '4px', color: step >= s ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: step === s ? 700 : 500 }}>
                    {s === 1 ? 'Owner' : s === 2 ? 'Business' : 'Security'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {error && <div className="loginError">{error}</div>}
            
            {/* SIGN UP STEP 1: Personal Details */}
            {isSignUp && step === 1 && (
              <>
                <div className="inputField">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    autoFocus
                  />
                </div>

                <div className="inputField">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="inputField">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                    autoComplete="tel"
                  />
                </div>
              </>
            )}

            {/* SIGN UP STEP 2: Business Profile */}
            {isSignUp && step === 2 && (
              <>
                <div className="inputField">
                  <label htmlFor="shopName">Shop / Business Name</label>
                  <input
                    id="shopName"
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Apex Supermarket"
                    required
                    autoFocus
                  />
                </div>

                <div className="inputField">
                  <label htmlFor="businessType">Business Type</label>
                  <select
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      marginTop: '6px'
                    }}
                  >
                    <option value="Retail">Retail</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="inputField">
                  <label htmlFor="businessAddress">Business Address (Optional)</label>
                  <textarea
                    id="businessAddress"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="e.g. 123, Main Street, Bengaluru"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      marginTop: '6px'
                    }}
                  />
                </div>
              </>
            )}

            {/* SIGN UP STEP 3: Security credentials */}
            {isSignUp && step === 3 && (
              <>
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
                      placeholder="At least 6 characters"
                      required
                      autoFocus
                      autoComplete="new-password"
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

                <div className="inputField">
                  <div className="pwdLabelRow">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                  </div>
                  <div className="pwdInputWrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPwd ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      autoComplete="new-password"
                    />
                    <button 
                       type="button" 
                       className="pwdToggle" 
                       onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                       aria-label={showConfirmPwd ? "Hide password" : "Show password"}
                    >
                      {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* SIGN IN: Email / Password Fields */}
            {!isSignUp && (
              <>
                <div className="inputField">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
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
              </>
            )}

            {/* Form Actions (Buttons) */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              {isSignUp && step > 1 && (
                <button 
                  type="button" 
                  className="secondary" 
                  onClick={handlePrevStep}
                  disabled={loading}
                  style={{ flex: 1, padding: '12px' }}
                >
                  Back
                </button>
              )}
              
              <button 
                type="submit" 
                className="primary loginBtn" 
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading 
                  ? (isSignUp ? (step === 3 ? 'Registering...' : 'Next...') : 'Signing in...') 
                  : (isSignUp ? (step === 3 ? 'Sign Up' : 'Continue') : 'Sign In')
                }
                {!loading && <ArrowRight size={15} style={{ marginLeft: 8 }} />}
              </button>
            </div>
          </form>

          {/* Mode Switch Toggle Footer */}
          <div className="loginHint" style={{ marginTop: '20px' }}>
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <Link to="/login" className="accentText" style={{ fontWeight: 700, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <Link to="/register" className="accentText" style={{ fontWeight: 700, textDecoration: 'none' }}>
                  Sign Up
                </Link>
              </span>
            )}
          </div>

          {!isSignUp && (
            <div className="loginHint">
              <span>Demo Credentials:</span>
              <div className="demoCreds">
                <code>admin@storepilot.com</code>
                <code>storepilot123</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
