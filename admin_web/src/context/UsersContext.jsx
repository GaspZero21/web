// src/context/UsersContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminUsers } from '../api/api';

const UsersContext = createContext(null);

function extractUsers(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.users)) return res.users;
  if (res.data && Array.isArray(res.data.users)) return res.data.users;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
}

export function UsersProvider({ children }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await adminUsers.getAll(1, 200);
      const list = extractUsers(res);
      setUsers(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const getRole = u => {
    let r;
    if (Array.isArray(u.roles) && u.roles.length > 0) {
      r = u.roles[0];
    } else {
      r = u.role ?? 'USER';
    }
    if (r && typeof r === 'object') r = r.name ?? r.role ?? 'USER';
    return String(r).toUpperCase();
  };

  const getStatus = u => u.status ?? (u.isActive === false ? 'inactive' : 'active');
  const getId     = u => u._id ?? u.id;
  const byRole    = role => users.filter(u => getRole(u) === role);

  // ── createUser ───────────────────────────────────────────────
  // Strategy:
  //   1. POST /api/v1/admin/users  with role included (backend may accept it)
  //   2. POST /api/v1/admin/users/{id}/roles  to assign role
  //      - 409 "already has role" = role was set in step 1 = success, not an error
  //   3. refresh()
  const createUser = async (userData) => {
    const roleValue = (userData.role ?? 'USER').toUpperCase();

    // Step 1: create user — send role directly, backend may honor it
    const createRes = await adminUsers.create({ ...userData, role: roleValue });
    console.log('[createUser] create response:', createRes);

    // Extract ID from any response shape
    const newUser = createRes?.data ?? createRes?.user ?? createRes;
    const id = newUser?._id ?? newUser?.id;
    console.log('[createUser] new user id:', id, '| role:', roleValue);

    if (id && roleValue !== 'USER') {
      // Step 2: assign role — 409 is OK (means role already set by create)
      try {
        const roleRes = await adminUsers.assignRole(id, roleValue);
        console.log('[createUser] assignRole success:', roleRes);
      } catch (e) {
        if (e.message?.includes('409') || e.message?.toLowerCase().includes('already')) {
          // Role was already assigned by the create call — this is fine
          console.log('[createUser] role already set by create (409 = OK)');
        } else {
          console.error('[createUser] assignRole error:', e.message);
          // Don't throw — user exists, role may still be correct after refresh
        }
      }
    }

    // Step 3: re-fetch so all pages update
    await refresh();
  };

  return (
    <UsersContext.Provider value={{
      users, loading, error, refresh,
      getRole, getStatus, getId, byRole,
      createUser,
    }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  return useContext(UsersContext);
}