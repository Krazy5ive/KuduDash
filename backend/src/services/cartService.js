// src/services/cartService.js
require("../models/MenuItem");

const API_URL = "http://localhost:5000/api";

export const addItemToCart = async (studentId, vendorId, item) => {
  const response = await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId,
      vendorId,
      menuItem: item.itemId,
      name: item.name,
      unitPrice: item.price, // frontend stores as "price", backend expects "unitPrice"
      quantity: item.quantity,
      specialNote: item.specialNote,
    }),
  });
  return response.json();
};

export const checkoutCart = async (studentId) => {
  const response = await fetch(`${API_URL}/orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId }),
  });
  return response.json();
};