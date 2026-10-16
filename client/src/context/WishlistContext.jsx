import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('nnp_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (isAuthenticated && user?.wishlist) {
      const ids = user.wishlist.map(item => (typeof item === 'object' ? item._id : item));
      setWishlistIds(ids);
      localStorage.setItem('nnp_wishlist', JSON.stringify(ids));
    }
  }, [user, isAuthenticated]);

  const toggleWishlist = async (plantId) => {
    // Optimistic local update
    const isAdded = !wishlistIds.includes(plantId);
    const updated = isAdded
      ? [...wishlistIds, plantId]
      : wishlistIds.filter(id => id !== plantId);

    setWishlistIds(updated);
    localStorage.setItem('nnp_wishlist', JSON.stringify(updated));

    if (isAuthenticated) {
      try {
        await api.post('/auth/wishlist/toggle', { plantId });
      } catch (err) {
        console.error('Failed to sync wishlist on server:', err);
      }
    }
    return isAdded;
  };

  const isWishlisted = (plantId) => wishlistIds.includes(plantId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        toggleWishlist,
        isWishlisted
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
