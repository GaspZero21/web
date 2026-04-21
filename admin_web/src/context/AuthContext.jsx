// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, isLoggedIn, removeTokens } from '../api/api';

const AuthContext = createContext(null);

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

// Unwrap user from any response shape the API might return
function extractUser(data) {
  if (!data) return null;
  return data?.data?.user ?? data?.user ?? data?.data ?? data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  useEffect(() => {
    if (isLoggedIn() && !user) {
      auth.me()
        .then(data => {
          const u = extractUser(data);
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

  async function loginUser() {
    const data = await auth.me();
    const u = extractUser(data);
    saveUser(u);
    setUser(u);
  }

  // Call this with the API response after any profile update,
  // OR call with no args to re-fetch from /auth/me
  async function refreshUser(responseData) {
    let u;
    if (responseData) {
      // Use the data already returned by the PATCH response
      u = extractUser(responseData);
    } else {
      // Fallback: re-fetch from server
      const data = await auth.me();
      u = extractUser(data);
    }
    if (u && typeof u === 'object') {
      saveUser(u);
      setUser(u);
    }
    return u;
  }

  function logoutUser() {
    auth.logout();
    localStorage.removeItem('madad_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}