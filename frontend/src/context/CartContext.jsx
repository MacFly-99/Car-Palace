import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (piece) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === piece.id);
      if (existing) {
        return prev.map((item) =>
          item.id === piece.id ? { ...item, quantite: item.quantite + 1 } : item
        );
      }
      return [...prev, { ...piece, quantite: 1 }];
    });
  };

  const removeFromCart = (pieceId) => {
    setCart((prev) => prev.filter((item) => item.id !== pieceId));
  };

  const updateQuantity = (pieceId, quantite) => {
    if (quantite <= 0) {
      removeFromCart(pieceId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === pieceId ? { ...item, quantite } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.prix) * item.quantite, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé dans un CartProvider");
  return context;
};