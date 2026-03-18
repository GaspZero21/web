// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, isLoggedIn, removeTokens } from '../api/api';

const AuthContext = createContext(null);

// Safe localStorage helpers — prevents the "undefined" is not valid JSON crash
function saveUser(u) {
  if (u && typeof u === 'object') {
    localStorage.setItem('madad_user', JSON.stringify(u));
  }
}
function loadUser() {
  try {
    const cached = localStorage.getItem('madad_user');
    if (!cached || cached === 'undefined' || cached === 'null') return null;
    return JSON.parse(cached);
  } catch {
    localStorage.removeItem('madad_user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);  // rehydrate immediately, safely

  // On mount: if a token exists but no cached user, fetch real profile from /auth/me
  useEffect(() => {
    if (isLoggedIn() && !user) {
      auth.me()
        .then(data => {
          const u = data?.data ?? data;
          saveUser(u);
          setUser(u);
        })
        .catch(() => {
          removeTokens();
          localStorage.removeItem('madad_user');
          setUser(null);
        });
    }
  }, []);

  // Called in Login.jsx right after auth.login() succeeds
  async function loginUser() {
    const data = await auth.me();
    const u = data?.data ?? data;
    saveUser(u);
    setUser(u);
  }

  function logoutUser() {
    auth.logout();
    localStorage.removeItem('madad_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}