import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      setCartItems(parsed);
      updateTotals(parsed);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    updateTotals(cartItems);
  }, [cartItems]);

  const updateTotals = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    setCartTotal(total);
    setCartCount(count);
  };

  // Add item to cart
  const addToCart = (item, vendorId, vendorName) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.itemId === item._id);
      
      if (existingItem) {
        return prevItems.map(i =>
          i.itemId === item._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        const newItem = {
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          vendorId: vendorId,
          vendorName: vendorName,
          imageUrl: item.imageUrl || null
        };
        return [...prevItems, newItem];
      }
    });
  };

  // Remove item from cart completely
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.itemId !== itemId));
  };

  // Update quantity of an item
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.itemId === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get cart grouped by vendor
  const getCartByVendor = () => {
    const grouped = {};
    cartItems.forEach(item => {
      if (!grouped[item.vendorId]) {
        grouped[item.vendorId] = {
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          items: [],
          subtotal: 0
        };
      }
      grouped[item.vendorId].items.push(item);
      grouped[item.vendorId].subtotal += item.price * item.quantity;
    });
    return Object.values(grouped);
  };

  const value = {
    cartItems,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartByVendor
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};