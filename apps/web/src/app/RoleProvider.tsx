import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'CONSTABLE' | 'SHO' | 'SP';

const getApiBase = () => {
  const customUrl = localStorage.getItem('CRIMEPULSE_API_URL');
  if (customUrl) {
    const cleanUrl = customUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return 'https://crimepulse-api-50043846482.development.catalystappsail.in/api';
};

const API_BASE = getApiBase();

interface RoleContextType {
  role: UserRole;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  login: (username: string, passcode: string) => boolean;
  logout: () => void;
  getRoleLabel: (role: UserRole) => string;
  updateCredentials: (targetRole: UserRole, newUsername: string, newPasscode: string) => void;
  spUsername: string;
  spPassword: string;
  shoUsername: string;
  shoPassword: string;
  constableUsername: string;
  constablePassword: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('crimepulse_role');
    return (saved as UserRole) || 'SP';
  });

  // Always force authentication on load or page refresh
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Dynamic SP Credentials
  const [spUsername, setSpUsername] = useState<string>(() => {
    return localStorage.getItem('crimepulse_sp_username') || 'sp.ksp';
  });
  const [spPassword, setSpPassword] = useState<string>(() => {
    return localStorage.getItem('crimepulse_sp_password') || 'ksp123';
  });

  // Dynamic SHO Credentials
  const [shoUsername, setShoUsername] = useState<string>(() => {
    return localStorage.getItem('crimepulse_sho_username') || 'sho.ksp';
  });
  const [shoPassword, setShoPassword] = useState<string>(() => {
    return localStorage.getItem('crimepulse_sho_password') || 'ksp123';
  });

  // Dynamic Constable Credentials
  const [constableUsername, setConstableUsername] = useState<string>(() => {
    return localStorage.getItem('crimepulse_constable_username') || 'constable.ksp';
  });
  const [constablePassword, setConstablePassword] = useState<string>(() => {
    return localStorage.getItem('crimepulse_constable_password') || 'ksp123';
  });

  // Load configured credentials from backend DB on boot
  useEffect(() => {
    const fetchCentralCredentials = async () => {
      try {
        const res = await fetch(`${API_BASE}/credentials`);
        if (res.ok) {
          const data = await res.json();
          if (data.credentials && Array.isArray(data.credentials)) {
            data.credentials.forEach((item: any) => {
              const r = item.role;
              const u = item.username;
              const p = item.password;
              if (r === 'SP') {
                setSpUsername(u);
                setSpPassword(p);
              } else if (r === 'SHO') {
                setShoUsername(u);
                setShoPassword(p);
              } else if (r === 'CONSTABLE') {
                setConstableUsername(u);
                setConstablePassword(p);
              }
            });
          }
        }
      } catch (err) {
        console.warn('[Credentials Sync] Failed to fetch credentials from central SQLite database, falling back to local storage', err);
      }
    };
    fetchCentralCredentials();
  }, []);

  const updateCredentials = (targetRole: UserRole, newUsername: string, newPasscode: string) => {
    const normalizedUsername = newUsername.trim();
    const normalizedPassword = newPasscode.trim();
    
    // Update local state and client storage first (instant local feedback)
    if (targetRole === 'SP') {
      setSpUsername(normalizedUsername);
      setSpPassword(normalizedPassword);
      localStorage.setItem('crimepulse_sp_username', normalizedUsername);
      localStorage.setItem('crimepulse_sp_password', normalizedPassword);
    } else if (targetRole === 'SHO') {
      setShoUsername(normalizedUsername);
      setShoPassword(normalizedPassword);
      localStorage.setItem('crimepulse_sho_username', normalizedUsername);
      localStorage.setItem('crimepulse_sho_password', normalizedPassword);
    } else if (targetRole === 'CONSTABLE') {
      setConstableUsername(normalizedUsername);
      setConstablePassword(normalizedPassword);
      localStorage.setItem('crimepulse_constable_username', normalizedUsername);
      localStorage.setItem('crimepulse_constable_password', normalizedPassword);
    }

    // Sync to SQLite database (so other laptops fetch it)
    fetch(`${API_BASE}/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: targetRole, username: normalizedUsername, password: normalizedPassword })
    }).catch(err => {
      console.error('[Credentials Sync] Failed to sync credentials to central SQLite database:', err);
    });
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('crimepulse_role', newRole);
  };

  const login = (username: string, passcode: string): boolean => {
    const u = username.toLowerCase().trim();
    const p = passcode.trim();
    
    let matchedRole: UserRole | null = null;
    if (u === spUsername.toLowerCase().trim() && p === spPassword) {
      matchedRole = 'SP';
    } else if (u === shoUsername.toLowerCase().trim() && p === shoPassword) {
      matchedRole = 'SHO';
    } else if (u === constableUsername.toLowerCase().trim() && p === constablePassword) {
      matchedRole = 'CONSTABLE';
    }

    if (matchedRole) {
      setRoleState(matchedRole);
      setIsAuthenticated(true);
      localStorage.setItem('crimepulse_role', matchedRole);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const getRoleLabel = (r: UserRole): string => {
    switch (r) {
      case 'CONSTABLE':
        return 'Beat Constable';
      case 'SHO':
        return 'Station House Officer (SHO)';
      case 'SP':
        return 'Superintendent (SP)';
      default:
        return 'Unknown';
    }
  };

  return (
    <RoleContext.Provider value={{ 
      role, 
      isAuthenticated, 
      setRole, 
      login, 
      logout, 
      getRoleLabel, 
      updateCredentials, 
      spUsername, 
      spPassword,
      shoUsername,
      shoPassword,
      constableUsername,
      constablePassword
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
