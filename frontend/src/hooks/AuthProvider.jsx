import React, { createContext, useMemo, useState } from 'react';
import client, {
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth
} from '../api/client.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const isAuthenticated = Boolean(auth?.token);
  const role = auth?.user?.role ?? null;

  const login = async (email, password) => {
    const response = await client.post('/auth/login', { email, password });
    const data = response.data;
    const toStore = { token: data.token, user: data.user };
    setStoredAuth(toStore);
    setAuth(toStore);
    return toStore;
  };

  const register = async ({ name, email, password, role: desiredRole }) => {
    const response = await client.post('/auth/register', {
      name,
      email,
      password,
      role: desiredRole
    });
    return response.data;
  };

  const logout = () => {
    clearStoredAuth();
    setAuth(null);
  };

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated,
      role,
      login,
      register,
      logout
    }),
    [auth, isAuthenticated, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

