import React from 'react';
import { useCart } from './CartContext';

const AddToCart = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <button onClick={() => addToCart(item)}>
      Add to Cart
    </button>
  );
};

export default AddToCart;