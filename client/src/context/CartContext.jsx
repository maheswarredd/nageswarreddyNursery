import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nnp_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nnp_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (plant, quantity = 1) => {
    if (!plant.isAvailable || plant.stock <= 0) {
      alert(`"${plant.name}" is currently SOLD OUT and cannot be added to cart.`);
      return false;
    }

    let success = true;
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.plant._id === plant._id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > plant.stock) {
          alert(`Cannot add more. Nursery only has ${plant.stock} units of "${plant.name}" in stock.`);
          success = false;
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        if (quantity > plant.stock) {
          alert(`Cannot add ${quantity} units. Only ${plant.stock} units available.`);
          success = false;
          return prev;
        }

        const unitPrice = plant.discountPrice && plant.discountPrice > 0 ? plant.discountPrice : plant.price;
        return [...prev, { plant, quantity, unitPrice }];
      }
    });

    return success;
  };

  const updateQuantity = (plantId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(plantId);
      return;
    }

    setCartItems(prev => {
      return prev.map(item => {
        if (item.plant._id === plantId) {
          if (newQty > item.plant.stock) {
            alert(`Only ${item.plant.stock} units of ${item.plant.name} available in stock.`);
            return { ...item, quantity: item.plant.stock };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (plantId) => {
    setCartItems(prev => prev.filter(item => item.plant._id !== plantId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const cartSubtotal = cartItems.reduce((acc, curr) => {
    const price = curr.plant.discountPrice && curr.plant.discountPrice > 0 ? curr.plant.discountPrice : curr.plant.price;
    return acc + price * curr.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
