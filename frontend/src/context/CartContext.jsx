import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('bitesync_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('bitesync_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (dish, quantity = 1, specialInstructions = '') => {
    if (!dish.isAvailable || dish.stockQuantity <= 0) {
      toast.error(`Sorry, ${dish.name} is currently sold out.`);
      return;
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.dish._id === dish._id);
      if (existingIndex > -1) {
        const newItems = [...prev];
        const newQty = newItems[existingIndex].quantity + quantity;
        if (newQty > dish.stockQuantity) {
          toast.error(`Only ${dish.stockQuantity} portions remaining in stock.`);
          return prev;
        }
        newItems[existingIndex].quantity = newQty;
        toast.success(`Updated ${dish.name} quantity to ${newQty}`);
        return newItems;
      } else {
        if (quantity > dish.stockQuantity) {
          toast.error(`Only ${dish.stockQuantity} portions remaining in stock.`);
          return prev;
        }
        toast.success(`Added ${dish.name} to cart! 🍽️`);
        return [...prev, { dish, quantity, specialInstructions }];
      }
    });
  };

  const updateQuantity = (dishId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(dishId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.dish._id === dishId) {
          if (newQty > item.dish.stockQuantity) {
            toast.error(`Maximum available stock is ${item.dish.stockQuantity}`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (dishId) => {
    setCartItems((prev) => {
      const removed = prev.find((item) => item.dish._id === dishId);
      if (removed) {
        toast.success(`Removed ${removed.dish.name} from cart`);
      }
      return prev.filter((item) => item.dish._id !== dishId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem('bitesync_cart');
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);

  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'BITESYNC10' || clean === 'WELCOME10') {
      const discount = Math.min(Math.round(subtotal * 0.1), 50);
      setCoupon({ code: clean, discount, percent: 10 });
      toast.success(`Coupon "${clean}" applied! ₹${discount} saved.`);
      return true;
    } else if (clean === 'HOSTEL20') {
      if (subtotal < 150) {
        toast.error('HOSTEL20 requires minimum order of ₹150');
        return false;
      }
      const discount = Math.min(Math.round(subtotal * 0.2), 60);
      setCoupon({ code: clean, discount, percent: 20 });
      toast.success(`Coupon "${clean}" applied! ₹${discount} saved.`);
      return true;
    } else {
      toast.error('Invalid coupon code.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.success('Coupon removed');
  };

  const discountAmount = coupon ? coupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        coupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        finalTotal,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
