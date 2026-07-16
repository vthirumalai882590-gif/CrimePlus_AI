import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useFilterStore } from '../store/filterStore';
import { useLanguageStore } from '../store/languageStore';
import { useUiPrefsStore } from '../store/uiPrefsStore';
import { useRole } from './RoleProvider';
import { routes } from './routes';

const IconHelper: React.FC<{ name: string; size?: number; className?: string; style?: React.CSSProperties }> = ({ name, size = 18, className, style }) => {
  const Icon = (Icons as any)[name];
  if (!Icon) return <Icons.HelpCircle size={size} className={className} style={style} />;
  return <Icon size={size} className={className} style={style} />;
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    role, 
    logout, 
    updateCredentials, 
    spUsername, 
    spPassword,
    shoUsername,
    shoPassword,
    constableUsername,
    constablePassword
  } = useRole();
  const { t, language, setLanguage } = useLanguageStore();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadCount,
    setLastRoute,
    cachedApiUrl,
    setCachedApiUrl,
    theme,
    toggleTheme,
  } = useUiPrefsStore();

  // Modals & toast states for Quick Actions
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = React.useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [settingsTab, setSettingsTab] = React.useState<'config' | 'credentials'>('config');

  // Input states for SP
  const [newSpUser, setNewSpUser] = React.useState('');
  const [newSpPass, setNewSpPass] = React.useState('');
  const [spSuccessMsg, setSpSuccessMsg] = React.useState('');

  // Input states for SHO
  const [newShoUser, setNewShoUser] = React.useState('');
  const [newShoPass, setNewShoPass] = React.useState('');
  const [shoSuccessMsg, setShoSuccessMsg] = React.useState('');

  // Input states for Constable
  const [newConstableUser, setNewConstableUser] = React.useState('');
  const [newConstablePass, setNewConstablePass] = React.useState('');
  const [constableSuccessMsg, setConstableSuccessMsg] = React.useState('');

  React.useEffect(() => {
    if (showSettingsModal) {
      setSettingsTab('config');
      setNewSpUser(spUsername);
      setNewSpPass(spPassword);
      setSpSuccessMsg('');

      setNewShoUser(shoUsername);
      setNewShoPass(shoPassword);
      setShoSuccessMsg('');

      setNewConstableUser(constableUsername);
      setNewConstablePass(constablePassword);
      setConstableSuccessMsg('');
    }
  }, [showSettingsModal, spUsername, spPassword, shoUsername, shoPassword, constableUsername, constablePassword]);

  // Track current route in persistent store
  React.useEffect(() => {
    setLastRoute(location.pathname);
  }, [location.pathname, setLastRoute]);
  
  const [generatingReport, setGeneratingReport] = React.useState(false);
  const [reportStep, setReportStep] = React.useState('');
  const [reportReady, setReportReady] = React.useState(false);
  const [reportType, setReportType] = React.useState('statewide');
  const [reportFormat, setReportFormat] = React.useState('pdf');

  const [broadcasting, setBroadcasting] = React.useState(false);
  const [broadcastMessage, setBroadcastMessage] = React.useState('');
  const [broadcastLevel, setBroadcastLevel] = React.useState('ALERT');
  const [broadcastChannel, setBroadcastChannel] = React.useState('mdt');
  
  const [toasts, setToasts] = React.useState<any[]>([]);

  const {
    district,
    station,
    dateRange,
    severity,
    setDistrict,
    setStation,
    setDateRange,
    setSeverity,
    resetFilters
  } = useFilterStore();

  // District to Station mock data mapping
  const stationMapping: Record<string, string[]> = {
    ALL: [],
    'BENGALURU_CITY': ['Vidhana Soudha PS', 'Cubbon Park PS', 'Indiranagar PS', 'Koramangala PS', 'Whitefield PS'],
    'MYSURU': ['Devaraja PS', 'Lashkar PS', 'Mandi PS', 'K.R. Puram PS'],
    'HUBBALLI_DHARWAD': ['Hubballi Town PS', 'Dharwad Suburban PS', 'Vidyanagar PS'],
    'MANGALURU': ['Mangaluru Town PS', 'Pandeshwar PS', 'Ullal PS'],
    'BELAGAVI': ['Khade Bazar PS', 'Market PS', 'Camp PS']
  };

  const activeStations = stationMapping[district] || [];

  // Filter routes based on active role
  const visibleRoutes = routes.filter(route => route.roles.includes(role));

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setReportReady(false);
    
    const steps = [
      'Querying SQLite active incidents...',
      'Synthesizing spatiotemporal hotspot density...',
      'Mapping criminological link networks...',
      'Compiling Pearson sociological correlations...',
      'Finalizing executive brief...'
    ];
    
    let currentStepIndex = 0;
    setReportStep(steps[0]);
    
    const interval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setReportStep(steps[currentStepIndex]);
      } else {
        clearInterval(interval);
        setGeneratingReport(false);
        setReportReady(true);
      }
    }, 450);
  };

  const handleDownloadReport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const dateStr = new Date().toLocaleString();
    reportWindow.document.write(`
      <html>
        <head>
          <title>KSP Executive Analytical Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between; }
            .title { font-size: 24px; font-weight: 800; color: #1e3a8a; margin: 0; }
            .meta { font-size: 11px; color: #64748b; margin-top: 5px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: 700; color: #0f172a; border-left: 4px solid #3b82f6; padding-left: 10px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            th { background: #f8fafc; font-weight: 700; color: #475569; }
            .recommendation { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px; margin-top: 15px; font-size: 13.5px; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; }
            .badge-high { background: #fee2e2; color: #991b1b; }
            .badge-medium { background: #fef3c7; color: #92400e; }
            .badge-low { background: #dcfce7; color: #166534; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
            <div>
              <div class="title">KARNATAKA STATE CRIME RECORDS BUREAU (SCRB)</div>
              <div class="meta">EXECUTIVE STATISTICAL ANALYTICS REPORT · GENERATED ON ${dateStr}</div>
            </div>
            <div style="font-size: 11px; font-weight: 700; border: 1px solid #1e3a8a; padding: 5px 10px; border-radius: 4px;">KSP CONFIDENTIAL</div>
          </div>
          
          <div class="section">
            <div class="section-title">1. Report Overview</div>
            <p>This document compiles real-time incident reports, suspect patterns, and spatiotemporal threat forecasts generated by the CrimePulse AI platform. It provides high-level administrative insights for SP and SHO deployment decisions.</p>
            <table>
              <tr>
                <td><strong>Scope</strong></td>
                <td>${reportType === 'statewide' ? 'State-Wide Command' : 'District Beat level'}</td>
                <td><strong>Format</strong></td>
                <td>${reportFormat.toUpperCase()} Document</td>
              </tr>
              <tr>
                <td><strong>System Version</strong></td>
                <td>CrimePulse AI Command 1.0.1</td>
                <td><strong>Authentication Status</strong></td>
                <td>Validated Command Officer System</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">2. Aggregate Crime Head Distribution</div>
            <table>
              <thead>
                <tr>
                  <th>Crime head category</th>
                  <th>Active catalog logs</th>
                  <th>Severity level</th>
                  <th>Risk prognosis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>THEFT & BURGLARY</strong></td>
                  <td>14 active cases</td>
                  <td><span class="badge badge-medium">MEDIUM</span></td>
                  <td>High spatiotemporal repeatability at night</td>
                </tr>
                <tr>
                  <td><strong>ASSAULT & VIOLENCE</strong></td>
                  <td>8 active cases</td>
                  <td><span class="badge badge-high">HIGH</span></td>
                  <td>Transit hubs (Metro/Railways) night beat alert</td>
                </tr>
                <tr>
                  <td><strong>CYBER & FRAUD</strong></td>
                  <td>6 active cases</td>
                  <td><span class="badge badge-medium">MEDIUM</span></td>
                  <td>Phishing/OTP campaigns targeting urban centers</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">3. AI Smart Dispatch Patrol Recommendations</div>
            <div class="recommendation">
              <strong>Directive 1: Burglary beat adjustment (Bengaluru/Dharwad)</strong><br/>
              Increase motorized beat patrol coverage (Cheetahs/Hoysalas) between 22:00 and 04:00 hours in transit corridors showing lower average illumination ratings (&lt; 4.0). Special target beats: Malleshwaram suburban links, Dharwad transit hub.
            </div>
            <div class="recommendation">
              <strong>Directive 2: Gang network tracking</strong><br/>
              Co-arrest maps connect suspect Nodes around suspect Ramesh Kumar. Shifting beat patrols to check known associates' residences in Ullal is recommended.
            </div>
          </div>
          
          <div style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center;">
            End of Report · Karnataka Police Intelligence Analytics Wing
          </div>
        </body>
      </html>
    `);
    reportWindow.document.close();
    setShowReportModal(false);
    setReportReady(false);
  };

  const handleDispatchBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    setBroadcasting(true);
    
    setTimeout(() => {
      setBroadcasting(false);
      setShowBroadcastModal(false);
      
      const newToast = {
        id: 'toast-' + Date.now(),
        level: broadcastLevel,
        channel: broadcastChannel,
        message: broadcastMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setToasts(prev => [newToast, ...prev]);
      setBroadcastMessage('');
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 7000);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', overflow: 'hidden', transition: 'background-color 0.2s ease, color 0.2s ease' }}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-sidebar)', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0, zIndex: 100, transition: 'background-color 0.2s ease, border-color 0.2s ease' }}>

        {/* ── System Header ── */}
        <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border-sidebar)', transition: 'border-color 0.2s ease' }}>
          {/* Logo + Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <img src="./karnataka_police_emblem.png" alt="KSP Logo" style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.06em', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                Karnataka Police
              </span>
              <span style={{ fontSize: '9.5px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                Active Command Environment
              </span>
            </div>
          </div>

          {/* System Online status and Settings Gear */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-normal)', display: 'inline-block', flexShrink: 0, animation: 'pulse 1.5s infinite alternate' }} />
              <span style={{ fontSize: '10px', color: 'var(--status-normal)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>System Online</span>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--status-normal)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '4px',
                transition: 'color 0.2s, background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--status-normal)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="System Settings"
            >
              <Icons.Settings size={13} />
            </button>
          </div>
        </div>

        {/* ── Language Toggle ── */}
        <div style={{ padding: '7px 14px', borderBottom: '1px solid var(--border-sidebar)', display: 'flex', justifyContent: 'flex-end', transition: 'border-color 0.2s ease' }}>
          <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-sidebar-hover)', padding: '2px 3px', borderRadius: '4px', transition: 'background-color 0.2s ease' }}>
            <button
              onClick={() => setLanguage('en')}
              style={{ padding: '2px 8px', fontSize: '10.5px', fontWeight: 700, height: 'auto', minWidth: '28px', background: language === 'en' ? 'rgba(56,189,248,0.15)' : 'transparent', border: language === 'en' ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent', borderRadius: '3px', color: language === 'en' ? '#38BDF8' : 'var(--text-muted)', cursor: 'pointer', letterSpacing: '0.04em' }}
            >EN</button>
            <button
              onClick={() => setLanguage('kn')}
              style={{ padding: '2px 8px', fontSize: '10.5px', fontWeight: 700, height: 'auto', minWidth: '28px', background: language === 'kn' ? 'rgba(56,189,248,0.15)' : 'transparent', border: language === 'kn' ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent', borderRadius: '3px', color: language === 'kn' ? '#38BDF8' : 'var(--text-muted)', cursor: 'pointer' }}
            >ಕನ್ನಡ</button>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingTop: '10px' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', padding: '0 14px 6px', textTransform: 'uppercase' }}>
            Nav Navigation
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0px' }}>
            {visibleRoutes.filter(r => r.path !== '/ai-command').map((route) => {
              const isActive = location.pathname === route.path;
              return (
                <li key={route.path}>
                  <button
                    onClick={() => navigate(route.path)}
                    className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                  >
                    <IconHelper name={route.iconName} size={18} style={{ marginRight: '9px', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.02em', fontSize: '13.5px' }}>{t(route.translationKey)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Quick Actions ── */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-sidebar)', backgroundColor: 'var(--bg-sidebar)', transition: 'border-color 0.2s ease, background-color 0.2s ease' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '7px', textTransform: 'uppercase' }}>
            Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            <button onClick={() => navigate('/add-record')} title="New Incident"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 2px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '4px', cursor: 'pointer', color: 'var(--status-normal)', minHeight: '46px', gap: '3px', boxShadow: 'none' }}>
              <Icons.Plus size={14} />
              <span style={{ fontSize: '8.5px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.1', whiteSpace: 'nowrap' }}>New Incident</span>
            </button>
            <button onClick={() => { setShowReportModal(true); setReportReady(false); }} title="Generate Report"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 2px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '4px', cursor: 'pointer', color: 'var(--status-watch)', minHeight: '46px', gap: '3px', boxShadow: 'none' }}>
              <Icons.FileText size={14} />
              <span style={{ fontSize: '8.5px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.1', whiteSpace: 'nowrap' }}>Generate Report</span>
            </button>
            <button onClick={() => setShowBroadcastModal(true)} title="Emergency Broadcast"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 2px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '4px', cursor: 'pointer', color: 'var(--status-urgent)', minHeight: '46px', gap: '3px', boxShadow: 'none' }}>
              <Icons.Radio size={14} />
              <span style={{ fontSize: '8.5px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.1', whiteSpace: 'nowrap' }}>Emergency Broadcast</span>
            </button>
            <button onClick={() => navigate('/ai-command')} title="AI Assist"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 2px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '4px', cursor: 'pointer', color: '#8B5CF6', minHeight: '46px', gap: '3px', boxShadow: 'none' }}>
              <Icons.Sparkles size={14} />
              <span style={{ fontSize: '8.5px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.1', whiteSpace: 'nowrap' }}>AI Assist</span>
            </button>
          </div>
        </div>

        {/* ── Operator Identity ── */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-sidebar)', backgroundColor: 'var(--bg-sidebar)', transition: 'border-color 0.2s ease, background-color 0.2s ease' }}>
          <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
            Operator Identity
          </div>

          {/* Profile card */}
          <div className="profile-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.User size={15} style={{ color: '#38BDF8' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t('role.' + role.toLowerCase())}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {language === 'kn' ? 'ಎಸ್‌ಸಿಆರ್‌ಬಿ ಕಮಾಂಡ್ ಯುನಿಟ್' : 'Active Command Unit'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--status-normal)', display: 'inline-block' }} />
                <span style={{ fontSize: '9.5px', color: 'var(--status-normal)', fontWeight: 600 }}>Online</span>
              </div>
            </div>
          </div>

          {/* Last Login */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', paddingLeft: '1px' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Last Login: 09:42 AM – 11 May 2025</span>
            <button 
              onClick={() => {
                logout();
                navigate('/');
              }}
              title="Sign Out of Command Session"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '9.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                lineHeight: '1.2',
                boxShadow: 'none'
              }}
            >
              <Icons.LogOut size={10} />
              SIGN OUT
            </button>
          </div>

          {/* Notifications */}
          <button
            onClick={() => alert('7 notifications pending. 2 require immediate acknowledgment.')}
            style={{ width: '100%', padding: '5px 10px', fontSize: '11.5px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: 'none', transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease' }}
          >
            <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>Notifications</span>
            <span style={{ backgroundColor: 'var(--status-urgent)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, lineHeight: '1.4' }}>7</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
        
        {/* Top Control Filter Bar */}
        <header style={{ height: 'var(--filterbar-height)', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-4)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderRight: '1px solid var(--border-subtle)', paddingRight: '12px', flexShrink: 0 }}>
              <Icons.SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'var(--font-sans)' }}>
                {t('filter.title')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'nowrap', minWidth: 0 }}>
              {/* District Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t('filter.district')}:</span>
                <select 
                  value={district} 
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{ fontSize: '11px', padding: '3px 6px', height: '24px', width: '100px' }}
                >
                  <option value="ALL">{t('filter.all')}</option>
                  <option value="BENGALURU_CITY">Bengaluru City</option>
                  <option value="MYSURU">Mysuru</option>
                  <option value="HUBBALLI_DHARWAD">Hubballi-Dharwad</option>
                  <option value="MANGALURU">Mangaluru</option>
                  <option value="BELAGAVI">Belagavi</option>
                </select>
              </div>

              {/* Station Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t('filter.station')}:</span>
                <select 
                  value={station} 
                  onChange={(e) => setStation(e.target.value)}
                  disabled={district === 'ALL'}
                  style={{ fontSize: '11px', padding: '3px 6px', height: '24px', width: '120px', opacity: district === 'ALL' ? 0.5 : 1 }}
                >
                  <option value="ALL">{t('filter.all')}</option>
                  {activeStations.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Temporal Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t('filter.date')}:</span>
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  style={{ fontSize: '11px', padding: '3px 6px', height: '24px', width: '110px' }}
                >
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                  <option value="ALL">All History</option>
                </select>
              </div>

              {/* Severity Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t('filter.severity')}:</span>
                <select 
                  value={severity} 
                  onChange={(e) => setSeverity(e.target.value)}
                  style={{ fontSize: '11px', padding: '3px 6px', height: '24px', width: '100px' }}
                >
                  <option value="ALL">{t('filter.all')}</option>
                  <option value="LOW">Low Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="HIGH">High Risk</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <button 
              onClick={resetFilters} 
              className="secondary" 
              style={{ padding: '3px 10px', fontSize: '10px', height: '24px' }}
            >
              <Icons.RotateCcw size={10} />
              {t('filter.reset')}
            </button>
            <button 
              onClick={() => {
                const current = localStorage.getItem('CRIMEPULSE_API_URL') || '';
                const url = prompt("Configure AppSail API URL:\n\nIf you deployed this app under a different Zoho account or project, paste your AppSail URL (e.g. https://crimepulse-api-XXXX.development.catalystappsail.in) here:", current);
                if (url !== null) {
                  if (url.trim() === '') {
                    localStorage.removeItem('CRIMEPULSE_API_URL');
                  } else {
                    localStorage.setItem('CRIMEPULSE_API_URL', url.trim());
                  }
                  window.location.reload();
                }
              }} 
              className="secondary" 
              title="Configure API Gateway"
              style={{ padding: '3px var(--space-2)', fontSize: '10px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icons.Link size={12} />
            </button>

            {/* Separator line */}
            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

            {/* 🟢 System Online Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              color: 'var(--status-normal)',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap'
            }}>
              <span className="sync-pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--status-normal)', display: 'inline-block' }} />
              ONLINE
            </div>

            {/* 🔔 Notification Icon with persisted unread count */}
            <div 
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)' }}
            >
              <Icons.Bell size={12} style={{ color: 'var(--text-secondary)' }} />
              {unreadCount() > 0 && (
                <span style={{ position: 'absolute', top: '1px', right: '1px', width: '5px', height: '5px', backgroundColor: 'var(--status-urgent)', borderRadius: '50%' }} />
              )}
              
              {showNotificationDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  right: '0',
                  width: '290px',
                  backgroundColor: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  padding: '10px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>Active Notifications</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {unreadCount() > 0 && (
                        <span style={{ fontSize: '9px', color: 'var(--status-urgent)', fontWeight: 700 }}>{unreadCount()} UNREAD</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); markAllNotificationsRead(); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '8px', color: 'var(--text-muted)', textDecoration: 'underline', padding: 0 }}
                      >Mark all read</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '4px',
                          backgroundColor: n.read
                            ? 'rgba(255,255,255,0.01)'
                            : n.type === 'urgent' ? 'rgba(239,68,68,0.06)' : n.type === 'watch' ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
                          border: n.read
                            ? '1px solid transparent'
                            : `1px solid ${n.type === 'urgent' ? 'rgba(239,68,68,0.15)' : n.type === 'watch' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)'}`,
                          fontSize: '10px',
                          textAlign: 'left',
                          cursor: n.read ? 'default' : 'pointer',
                          opacity: n.read ? 0.55 : 1,
                          transition: 'opacity 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 700, color: n.read ? 'var(--text-muted)' : n.type === 'urgent' ? 'var(--status-urgent)' : n.type === 'watch' ? 'var(--status-watch)' : 'var(--text-muted)', textTransform: 'uppercase', fontSize: '8px' }}>
                            {n.read ? '✓ ' : ''}{n.type}
                          </span>
                          <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{n.time}</span>
                        </div>
                        <div style={{ color: 'var(--text-primary)', lineHeight: '1.2' }}>{n.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 🌓 Theme Toggle (Light / Dark) */}
            <div
              onClick={toggleTheme}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', transition: 'background-color 0.2s ease, border-color 0.2s ease' }}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? (
                <Icons.Sun size={12} style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <Icons.Moon size={12} style={{ color: 'var(--text-secondary)' }} />
              )}
            </div>

            {/* ⚙️ Settings Gear Icon */}
            <div
              onClick={() => setShowSettingsModal(true)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', transition: 'background-color 0.2s ease, border-color 0.2s ease' }}
              title="Settings"
            >
              <Icons.Settings size={12} style={{ color: 'var(--text-secondary)' }} />
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="content-body">
          {children}
        </main>

        {/* Footer disclaimer */}
        <footer style={{ height: '24px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.05em', flexShrink: 0 }}>
          <Icons.ShieldAlert size={10} style={{ marginRight: 'var(--space-1)', color: 'var(--status-watch)' }} />
          {t('ui.disclaimer')}
        </footer>
      </div>

      {/* ── 3. REPORT GENERATOR MODAL OVERLAY ── */}
      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '420px', padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12.5px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.04em' }}>
                <Icons.FileText size={16} style={{ color: 'var(--status-watch)' }} />
                EXECUTIVE REPORT GENERATOR
              </h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Icons.X size={16} />
              </button>
            </div>

            {!generatingReport && !reportReady && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>REPORT HEAD TYPE</label>
                  <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontSize: '12px' }}>
                    <option value="statewide">State-Wide Intelligence (Karnataka SCRB)</option>
                    <option value="district">Local District Level Beat Analysis</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>EXPORT FORMAT</label>
                  <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontSize: '12px' }}>
                    <option value="pdf">Adobe PDF (.pdf)</option>
                    <option value="html">HTML Print Layout Brief (.html)</option>
                  </select>
                </div>
                <button onClick={handleGenerateReport} style={{ marginTop: '10px', width: '100%', padding: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '12px', letterSpacing: '0.04em' }}>
                  COMPILE REPORT ANALYSIS
                </button>
              </div>
            )}

            {generatingReport && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '6px' }}>Generating Report...</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{reportStep}</div>
              </div>
            )}

            {reportReady && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px' }}>Report Compiled Successfully!</div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.4 }}>Your executive summary is compiled. Click below to view and trigger print dialogue.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setReportReady(false)} style={{ flex: 1, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Back</button>
                  <button onClick={handleDownloadReport} style={{ flex: 2, padding: '8px', background: '#10b981', border: 'none', color: '#fff', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.04em' }}>Download & Print</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4. EMERGENCY BROADCAST DISPATCHER MODAL ── */}
      {showBroadcastModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '440px', padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12.5px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.04em' }}>
                <Icons.Radio size={16} style={{ color: 'var(--status-urgent)' }} />
                EMERGENCY BROADCAST DISPATCHER
              </h3>
              <button onClick={() => setShowBroadcastModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Icons.X size={16} />
              </button>
            </div>

            {!broadcasting ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>ALERT URGENCY LEVEL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['NORMAL', 'ALERT', 'CRITICAL'].map(level => (
                      <button key={level} type="button" onClick={() => setBroadcastLevel(level)} style={{ flex: 1, padding: '6px', background: broadcastLevel === level ? (level === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : level === 'ALERT' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)') : 'var(--bg-base)', border: `1px solid ${broadcastLevel === level ? (level === 'CRITICAL' ? '#ef4444' : level === 'ALERT' ? '#f59e0b' : '#10b981') : 'var(--border-subtle)'}`, borderRadius: '6px', color: broadcastLevel === level ? (level === 'CRITICAL' ? '#ef4444' : level === 'ALERT' ? '#f59e0b' : '#10b981') : 'var(--text-muted)', fontWeight: 700, fontSize: '10px', cursor: 'pointer' }}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>TARGET CHANNEL</label>
                  <select value={broadcastChannel} onChange={(e) => setBroadcastChannel(e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontSize: '12px' }}>
                    <option value="mdt">Mobile Beat Terminals (MDT)</option>
                    <option value="siren">Station Sirens & Local Beats</option>
                    <option value="sms">SMS Alert Broadcast (Public warning)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>ALERT BROADCAST MESSAGE</label>
                  <textarea rows={3} value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Type the official emergency broadcast message here..." style={{ width: '100%', boxSizing: 'border-box', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontSize: '12px', resize: 'none' }} />
                </div>
                <button onClick={handleDispatchBroadcast} disabled={!broadcastMessage.trim()} style={{ marginTop: '10px', width: '100%', padding: '10px', background: !broadcastMessage.trim() ? 'var(--border-subtle)' : 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700, cursor: !broadcastMessage.trim() ? 'not-allowed' : 'pointer', fontSize: '12px', letterSpacing: '0.04em' }}>
                  DISPATCH BROADCAST SIGNAL
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 16px' }}>
                  <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.2)', border: '2px solid #ef4444', animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                  <div style={{ position: 'absolute', top: '15px', left: '15px', width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Icons.Radio size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '4px' }}>TRANSMITTING SIGNAL...</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Broadcasting encrypted warning to station nodes...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. FLOATING BROADCAST TOAST ALERTS ── */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 9999 }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', width: '320px', background: 'rgba(8,14,30,0.92)', backdropFilter: 'blur(8px)', border: `1px solid ${toast.level === 'CRITICAL' ? '#ef4444' : toast.level === 'ALERT' ? '#f59e0b' : '#10b981'}`, borderLeft: `6px solid ${toast.level === 'CRITICAL' ? '#ef4444' : toast.level === 'ALERT' ? '#f59e0b' : '#10b981'}`, borderRadius: '6px', padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, color: toast.level === 'CRITICAL' ? '#ef4444' : toast.level === 'ALERT' ? '#f59e0b' : '#10b981', letterSpacing: '0.08em' }}>
                  🚨 {toast.level} BROADCAST ACTIVE
                </span>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{toast.timestamp}</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.4, wordBreak: 'break-word' }}>{toast.message}</p>
              <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>CHANNEL: {toast.channel.toUpperCase()}</div>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
              <Icons.X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* ── SETTINGS MODAL ── */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '460px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-raised)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Settings size={14} style={{ color: 'var(--accent-interactive)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>SYSTEM SETTINGS</span>
              </div>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '2px' }}>
                <Icons.X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Dynamic Slides / Tabs for SP */}
              {role === 'SP' && (
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                  <button
                    onClick={() => setSettingsTab('config')}
                    style={{
                      flex: 1, padding: '10px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: settingsTab === 'config' ? 'rgba(59,130,246,0.08)' : 'transparent',
                      boxShadow: 'none',
                      color: settingsTab === 'config' ? 'var(--accent-interactive)' : 'var(--text-muted)',
                      borderBottom: settingsTab === 'config' ? '2px solid var(--accent-interactive)' : '2px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    API & SYSTEM CONFIG
                  </button>
                  <button
                    onClick={() => setSettingsTab('credentials')}
                    style={{
                      flex: 1, padding: '10px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: settingsTab === 'credentials' ? 'rgba(59,130,246,0.08)' : 'transparent',
                      boxShadow: 'none',
                      color: settingsTab === 'credentials' ? 'var(--accent-interactive)' : 'var(--text-muted)',
                      borderBottom: settingsTab === 'credentials' ? '2px solid var(--accent-interactive)' : '2px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    CREDENTIALS CONTROL
                  </button>
                </div>
              )}

              {/* SLIDE 1: API & SYSTEM CONFIG */}
              {(role !== 'SP' || settingsTab === 'config') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Language Setting */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Interface Language</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(['en', 'kn'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          style={{
                            flex: 1, padding: '7px 12px', borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${language === lang ? 'var(--accent-interactive)' : 'var(--border-subtle)'}`,
                            background: language === lang ? 'rgba(59,130,246,0.12)' : 'var(--bg-surface-raised)',
                            boxShadow: 'none',
                            color: language === lang ? 'var(--accent-interactive)' : 'var(--text-secondary)',
                            fontSize: '11px', fontWeight: language === lang ? 700 : 400, cursor: 'pointer'
                          }}
                        >
                          {lang === 'en' ? '🇬🇧  English' : '🇮🇳  ಕನ್ನಡ'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* API Gateway URL */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>AppSail API Gateway URL</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="settings-api-url"
                        type="text"
                        defaultValue={cachedApiUrl}
                        placeholder="https://crimepulse-api-XXXX.catalystappsail.in"
                        style={{ flex: 1, fontSize: '11px', padding: '6px 10px', height: '30px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('settings-api-url') as HTMLInputElement;
                          const val = input?.value?.trim() || '';
                          setCachedApiUrl(val);
                          setShowSettingsModal(false);
                          window.location.reload();
                        }}
                        style={{ padding: '6px 14px', height: '30px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-interactive)', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Save
                      </button>
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>Leave blank to use the default development endpoint.</div>
                  </div>

                  {/* Filters Quick Reset */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Global Filters</div>
                    <button
                      onClick={() => { resetFilters(); setShowSettingsModal(false); }}
                      className="secondary"
                      style={{ width: '100%', padding: '7px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '30px' }}
                    >
                      <Icons.RotateCcw size={11} />
                      Reset All Active Filters
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 2: CREDENTIALS CONTROL */}
              {role === 'SP' && settingsTab === 'credentials' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* SP Credentials Section */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Superintendent (SP) Login Credentials
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '3px' }}>BADGE ID / USERNAME</div>
                          <input
                            type="text"
                            value={newSpUser}
                            onChange={(e) => setNewSpUser(e.target.value)}
                            placeholder="sp.ksp"
                            style={{ width: '100%', fontSize: '11px', padding: '6px 10px', height: '30px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '3px' }}>SECURE PASSPHRASE</div>
                          <input
                            type="password"
                            value={newSpPass}
                            onChange={(e) => setNewSpPass(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: '100%', fontSize: '11px', padding: '6px 10px', height: '30px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (!newSpUser.trim() || !newSpPass.trim()) {
                            setSpSuccessMsg('Error: Fields cannot be empty.');
                            return;
                          }
                          updateCredentials('SP', newSpUser.trim(), newSpPass.trim());
                          setSpSuccessMsg('SP credentials updated successfully.');
                          setTimeout(() => setSpSuccessMsg(''), 4000);
                        }}
                        style={{ 
                          padding: '6px 14px', 
                          height: '30px', 
                          borderRadius: 'var(--radius-sm)', 
                          background: 'var(--accent-interactive)', 
                          border: 'none', 
                          color: '#fff', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Icons.Save size={12} />
                        Update SP Credentials
                      </button>
                      {spSuccessMsg && (
                        <div style={{ fontSize: '10px', color: spSuccessMsg.startsWith('Error') ? '#EF4444' : '#10B981', fontWeight: 600, marginTop: '2px', textAlign: 'center' }}>
                          {spSuccessMsg}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SHO Credentials Section */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Station House Officer (SHO) Login Credentials
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '3px' }}>BADGE ID / USERNAME</div>
                          <input
                            type="text"
                            value={newShoUser}
                            onChange={(e) => setNewShoUser(e.target.value)}
                            placeholder="sho.ksp"
                            style={{ width: '100%', fontSize: '11px', padding: '6px 10px', height: '30px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '3px' }}>SECURE PASSPHRASE</div>
                          <input
                            type="password"
                            value={newShoPass}
                            onChange={(e) => setNewShoPass(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: '100%', fontSize: '11px', padding: '6px 10px', height: '30px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (!newShoUser.trim() || !newShoPass.trim()) {
                            setShoSuccessMsg('Error: Fields cannot be empty.');
                            return;
                          }
                          updateCredentials('SHO', newShoUser.trim(), newShoPass.trim());
                          setShoSuccessMsg('SHO credentials updated successfully.');
                          setTimeout(() => setShoSuccessMsg(''), 4000);
                        }}
                        style={{ 
                          padding: '6px 14px', 
                          height: '30px', 
                          borderRadius: 'var(--radius-sm)', 
                          background: 'var(--accent-interactive)', 
                          border: 'none', 
                          color: '#fff', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Icons.Save size={12} />
                        Update SHO Credentials
                      </button>
                      {shoSuccessMsg && (
                        <div style={{ fontSize: '10px', color: shoSuccessMsg.startsWith('Error') ? '#EF4444' : '#10B981', fontWeight: 600, marginTop: '2px', textAlign: 'center' }}>
                          {shoSuccessMsg}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Constable Credentials Section */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Beat Constable Login Credentials
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '3px' }}>BADGE ID / USERNAME</div>
                          <input
                            type="text"
                            value={newConstableUser}
                            onChange={(e) => setNewConstableUser(e.target.value)}
                            placeholder="constable.ksp"
                            style={{ width: '100%', fontSize: '11px', padding: '6px 10px', height: '30px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '3px' }}>SECURE PASSPHRASE</div>
                          <input
                            type="password"
                            value={newConstablePass}
                            onChange={(e) => setNewConstablePass(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: '100%', fontSize: '11px', padding: '6px 10px', height: '30px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (!newConstableUser.trim() || !newConstablePass.trim()) {
                            setConstableSuccessMsg('Error: Fields cannot be empty.');
                            return;
                          }
                          updateCredentials('CONSTABLE', newConstableUser.trim(), newConstablePass.trim());
                          setConstableSuccessMsg('Constable credentials updated successfully.');
                          setTimeout(() => setConstableSuccessMsg(''), 4000);
                        }}
                        style={{ 
                          padding: '6px 14px', 
                          height: '30px', 
                          borderRadius: 'var(--radius-sm)', 
                          background: 'var(--accent-interactive)', 
                          border: 'none', 
                          color: '#fff', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Icons.Save size={12} />
                        Update Constable Credentials
                      </button>
                      {constableSuccessMsg && (
                        <div style={{ fontSize: '10px', color: constableSuccessMsg.startsWith('Error') ? '#EF4444' : '#10B981', fontWeight: 600, marginTop: '2px', textAlign: 'center' }}>
                          {constableSuccessMsg}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* About */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>CrimePulse AI</span> · Karnataka SCRB Platform
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--status-normal)', fontWeight: 700 }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--status-normal)', display: 'inline-block' }} />
                  SYSTEM ONLINE
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Animations */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
