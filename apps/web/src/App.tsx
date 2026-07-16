import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './app/RoleProvider';
import { AppShell } from './app/AppShell';
import { routes } from './app/routes';
import { Shield, Lock, User, KeyRound, Eye, EyeOff } from 'lucide-react';

const LoginView: React.FC = () => {
  const { login, spUsername, spPassword, shoUsername, shoPassword, constableUsername, constablePassword } = useRole();
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, passcode);
    if (!success) {
      setError('INVALID BADGE ID OR SECURE PASSPHRASE');
    }
  };

  const prefill = (user: string, pass: string) => {
    setUsername(user);
    setPasscode(pass);
    setError('');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#070B19',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#F8FAFC',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        /* Override Chrome Autofill yellow/light-blue background styling */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #070B19 inset !important;
          -webkit-text-fill-color: #F8FAFC !important;
          caret-color: #F8FAFC !important;
        }
        /* Focus styles for the tactical inputs */
        input:focus {
          border-color: #38BDF8 !important;
          outline: none !important;
          box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.25) !important;
        }
      `}</style>
      
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#0E1626',
        border: '1px solid #1E293B',
        borderRadius: '2px',
        padding: '32px 24px',
        boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#38BDF8',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            <Shield size={14} />
            KARNATAKA STATE POLICE
          </div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 800,
            margin: 0,
            letterSpacing: '0.5px',
            color: '#F8FAFC'
          }}>
            CRIMEPULSE AI
          </h2>
          <div style={{ fontSize: '10px', color: '#38BDF8', marginTop: '6px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            AI-Powered Analytics Platform
          </div>
          <div style={{ fontSize: '9px', color: '#64748B', marginTop: '4px', fontWeight: 500, lineHeight: '1.4', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Transforming Fragmented Records Into Actionable Intelligence
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
              <User size={12} style={{ color: '#64748B' }} />
              Duty Badge ID / Username
            </label>
            <input 
              type="text" 
              placeholder="e.g. sp.ksp" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#070B19',
                border: '1px solid #1E293B',
                borderRadius: '2px',
                color: '#F8FAFC',
                fontSize: '13px',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
              <Lock size={12} style={{ color: '#64748B' }} />
              Secure Passphrase
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 14px',
                  background: '#070B19',
                  border: '1px solid #1E293B',
                  borderRadius: '2px',
                  color: '#F8FAFC',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 'auto',
                  height: 'auto'
                }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              fontSize: '11px',
              color: '#EF4444',
              fontWeight: 700,
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '10px',
              textAlign: 'center',
              borderRadius: '2px',
              letterSpacing: '0.5px'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            style={{
              width: '100%',
              padding: '12px',
              background: '#38BDF8',
              color: '#070B19',
              fontWeight: 700,
              border: 'none',
              borderRadius: '2px',
              fontSize: '13px',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              transition: 'background 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#7DD3FC'}
            onMouseOut={(e) => e.currentTarget.style.background = '#38BDF8'}
          >
            AUTHENTICATE COMMAND PORTAL
          </button>
        </form>

        {/* Demo Accounts Prefill Quick Actions */}
        <div style={{ marginTop: '28px', borderTop: '1px solid #1E293B', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '4px', fontSize: '10px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            <KeyRound size={12} />
            Quick Demo Authenticate (Click to Prefill)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
             <button 
              type="button" 
              onClick={() => prefill(spUsername, spPassword)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#172033',
                border: '1px solid #1E293B',
                color: '#94A3B8',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'left',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#38BDF8'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#1E293B'}
            >
              <span>Superintendent (SP) view</span>
              <span style={{ color: '#64748B', fontSize: '9.5px', fontFamily: 'monospace' }}>{spUsername} / {spPassword}</span>
            </button>
             <button 
              type="button" 
              onClick={() => prefill(shoUsername, shoPassword)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#172033',
                border: '1px solid #1E293B',
                color: '#94A3B8',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'left',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#38BDF8'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#1E293B'}
            >
              <span>Station House Officer (SHO) view</span>
              <span style={{ color: '#64748B', fontSize: '9.5px', fontFamily: 'monospace' }}>{shoUsername} / {shoPassword}</span>
            </button>
            <button 
              type="button" 
              onClick={() => prefill(constableUsername, constablePassword)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#172033',
                border: '1px solid #1E293B',
                color: '#94A3B8',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'left',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#38BDF8'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#1E293B'}
            >
              <span>Beat Constable view</span>
              <span style={{ color: '#64748B', fontSize: '9.5px', fontFamily: 'monospace' }}>{constableUsername} / {constablePassword}</span>
            </button>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div style={{ fontSize: '9px', color: '#64748B', marginTop: '24px', textAlign: 'center', lineHeight: '1.4' }}>
          CONFIDENTIAL // SECURE SCRB DEMONSTRATION ENVIRONMENT ONLY.
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { role, isAuthenticated } = useRole();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <AppShell>
      <Routes>
        {routes.map((route) => {
          const hasAccess = route.roles.includes(role);
          return (
            <Route
              key={route.path}
              path={route.path}
              element={hasAccess ? route.element : <Navigate to="/" replace />}
            />
          );
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
};

function App() {
  return (
    <HashRouter>
      <RoleProvider>
        <AppContent />
      </RoleProvider>
    </HashRouter>
  );
}

export default App;
