import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nnp_token'));
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: loggedUser } = res.data;
    localStorage.setItem('nnp_token', newToken);
    setToken(newToken);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('nnp_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('nnp_token');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (token) {
      try {
        const res = await api.get('/auth/profile');
        setUser(res.data.user);
        return res.data.user;
      } catch (err) {
        console.error('Error refreshing profile:', err);
      }
    }
  };

  const addAddress = async (addressData) => {
    const res = await api.post('/auth/address', addressData);
    setUser(prev => ({ ...prev, addresses: res.data.addresses }));
    return res.data.addresses;
  };

  const updateAddress = async (addressId, addressData) => {
    const res = await api.put(`/auth/address/${addressId}`, addressData);
    setUser(prev => ({ ...prev, addresses: res.data.addresses }));
    return res.data.addresses;
  };

  const deleteAddress = async (addressId) => {
    const res = await api.delete(`/auth/address/${addressId}`);
    setUser(prev => ({ ...prev, addresses: res.data.addresses }));
    return res.data.addresses;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
        refreshProfile,
        addAddress,
        updateAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
