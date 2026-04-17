import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Add item — merges quantity if same item+vendor already in cart
  const addToCart = (item, vendorId, vendorName) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.itemId === item._id && i.vendorId === vendorId
      );
      if (existing) {
        return prev.map((i) =>
          i.itemId === item._id && i.vendorId === vendorId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          vendorId,
          vendorName,
        },
      ];
    });
  };

  // Remove item entirely
  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  // Set specific quantity — removes item if quantity drops to 0
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, quantity } : i))
    );
  };

  // Wipe the whole cart
  const clearCart = () => setCartItems([]);

  // Group cart items by vendor — returns array of vendor buckets
  const getCartByVendor = () => {
    const map = {};
    cartItems.forEach((item) => {
      if (!map[item.vendorId]) {
        map[item.vendorId] = {
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          items: [],
          subtotal: 0,
        };
      }
      map[item.vendorId].items.push(item);
      map[item.vendorId].subtotal += item.price * item.quantity;
    });
    return Object.values(map);
  };

  // Derived values
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );
  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartByVendor,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);