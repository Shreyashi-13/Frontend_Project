import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check } from 'lucide-react';

export default function Login() {
  const { store, login, register, setActiveTab } = useApp();

  const predefinedAccounts = [
    {
      id: 't1',
      roleLabel: 'Contractor',
      name: 'Vikram Construction Co.',
      city: 'Delhi',
      email: 'contractor@obrix.demo',
      password: 'password123',
      desc: 'Civil contractor bidding & hiring workforce'
    },
    {
      id: 'c1',
      roleLabel: 'Company',
      name: 'Aravalli Infrastructure',
      city: 'Gurgaon',
      email: 'company@obrix.demo',
      password: 'password123',
      desc: 'Developer publishing construction tenders'
    },
    {
      id: 'u1',
      roleLabel: 'Customer',
      name: 'Ananya Deshmukh',
      city: 'Gurgaon',
      email: 'customer@obrix.demo',
      password: 'password123',
      desc: 'Homeowner ordering materials & hiring trades'
    },
    {
      id: 'p1',
      roleLabel: 'Provider',
      name: 'Apex BuildPro & Machinery',
      city: 'Delhi',
      email: 'provider@obrix.demo',
      password: 'password123',
      desc: 'Supplier of cement, steel & JCB rental fleet'
    },
    {
      id: 'w1',
      roleLabel: 'Worker / Craftsman',
      name: 'Ramesh Kumar',
      city: 'Delhi',
      email: 'worker@obrix.demo',
      password: 'password123',
      desc: 'Master Mason accepting site daily wage jobs'
    }
  ];

  const [selectedAccount, setSelectedAccount] = useState(predefinedAccounts[0]);
  const [email, setEmail] = useState(predefinedAccounts[0].email);
  const [password, setPassword] = useState(predefinedAccounts[0].password);

  const [mode, setMode] = useState('PREDEFINED'); // 'PREDEFINED' | 'MANUAL' | 'SIGNUP'

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    city: 'Delhi',
    phone: ''
  });

  const [error, setError] = useState('');

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setEmail(account.email);
    setPassword(account.password);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      register(signupForm);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 84px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '1080px', width: '100%', display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(400px, 1.15fr)', gap: '2.5rem', alignItems: 'stretch' }}>
        
        {/* Left Side: Construction Story Poster */}
        <div style={{
          backgroundColor: '#171e18',
          borderRadius: '16px',
          padding: '2.5rem 2.25rem 2rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)'
        }}>
          <div>
            <span style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 700, color: '#9caa94', textTransform: 'uppercase', display: 'block', marginBottom: '1.25rem' }}>
              BUILD YOUR NEXT CHAPTER
            </span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 3.8vw, 3.2rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', margin: 0 }}>
              Great things <br />
              are built <br />
              <span style={{ color: '#f7c600' }}>together.</span>
            </h1>
          </div>

          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #121713 0%, #0d120e 100%)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #232c24',
            marginTop: '2rem'
          }}>
            <div style={{ fontSize: '9px', letterSpacing: '1.5px', color: '#74806e', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              OBRIX · SITE IN PROGRESS
            </div>
            
            <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <img 
                src="/construction.svg" 
                alt="Construction Crane & Highrise Site" 
                style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '9px', color: '#687462', fontFamily: 'monospace' }}>
              <span>DELHI NCR SECTOR 62</span>
              <span>28.6139° N / 77.2090° E</span>
            </div>
          </div>
        </div>

        {/* Right Side: Entrance & Signup Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '2.5rem',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Top Navigation Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', marginBottom: '1.75rem', border: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => { setMode('PREDEFINED'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: mode === 'PREDEFINED' ? 'var(--bg-card)' : 'transparent',
                  color: mode === 'PREDEFINED' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: mode === 'PREDEFINED' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Predefined Roles
              </button>
              <button
                type="button"
                onClick={() => { setMode('MANUAL'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: mode === 'MANUAL' ? 'var(--bg-card)' : 'transparent',
                  color: mode === 'MANUAL' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: mode === 'MANUAL' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Custom Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('SIGNUP'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: mode === 'SIGNUP' ? 'var(--accent-yellow)' : 'transparent',
                  color: '#111111',
                  boxShadow: mode === 'SIGNUP' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                + Create Account
              </button>
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
              {mode === 'SIGNUP' ? 'Create OBRIX Account' : 'Welcome to OBRIX.'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {mode === 'SIGNUP' 
                ? 'Register your company, contractor firm, or customer profile.' 
                : 'Connected construction ecosystem. Select a role profile or enter credentials.'}
            </p>

            {error && (
              <div style={{ background: '#fff1f0', border: '1px solid #f4ccc9', color: '#b42318', padding: '0.75rem 1rem', borderRadius: '7px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            {/* TAB 1: PREDEFINED ACCOUNTS */}
            {mode === 'PREDEFINED' && (
              <form onSubmit={handleLoginSubmit}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select Predefined Workspace Role
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  {predefinedAccounts.map(acc => {
                    const isSelected = selectedAccount.id === acc.id;
                    return (
                      <div
                        key={acc.id}
                        onClick={() => handleSelectAccount(acc)}
                        style={{
                          border: isSelected ? '2px solid var(--accent-yellow)' : '1px solid var(--border)',
                          background: isSelected ? 'rgba(247, 198, 0, 0.08)' : 'var(--bg-card)',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                              {acc.roleLabel}
                            </span>
                            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{acc.name}</strong>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {acc.desc}
                          </div>
                        </div>
                        {isSelected && (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-yellow)', display: 'grid', placeItems: 'center', color: '#111' }}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Predefined Username / Email:</span>
                    <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Predefined Password:</span>
                    <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{password}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '14px 28px' }}
                >
                  Enter as {selectedAccount.roleLabel} →
                </button>
              </form>
            )}

            {/* TAB 2: MANUAL LOGIN */}
            {mode === 'MANUAL' && (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Username or Email</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="name@obrix.demo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Sign In with Credentials
                </button>
              </form>
            )}

            {/* TAB 3: SIGN UP */}
            {mode === 'SIGNUP' && (
              <form onSubmit={handleSignupSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name / Organisation Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Skyline BuildWorks or Rahul Verma"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Primary Role</label>
                    <select
                      className="form-select"
                      value={signupForm.role}
                      onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
                    >
                      <option value="CUSTOMER">Customer (Homeowner / Buyer)</option>
                      <option value="CONTRACTOR">Contractor (Site Executor)</option>
                      <option value="COMPANY">Company (Real Estate / Infra)</option>
                      <option value="PROVIDER">Provider (Supplies & Machinery)</option>
                      <option value="WORKER">Worker (Trade Craftsman)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Gurgaon or Delhi"
                      value={signupForm.city}
                      onChange={(e) => setSignupForm({ ...signupForm, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="name@domain.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="Create a password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Complete Registration & Enter
                </button>
              </form>
            )}
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>OBRIX Connected Platform · Pure React Simulated</span>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>● Client Store Online</span>
          </div>
        </div>

      </div>
    </div>
  );
}
