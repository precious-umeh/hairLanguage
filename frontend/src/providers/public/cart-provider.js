"use client";

import {
  useState,
  useContext,
  createContext,
  useEffect,
  useCallback,
} from "react";
import server from "@/app/(main)/utils/axiosClient";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";

// 1. Export the context so we can use it in useCart
const CartContext = createContext();

export default function CartProvider({ children }) {
  const router = useRouter();
  const [cartData, setCartData] = useState({
    items: [],
    totalPrice: 0,
    totalItems: 0,
  });
  const [cartSlide, setCartSlide] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * ===== UTILS =====
   * */
  const openCart = () => setCartSlide(true);
  const closeCart = () => setCartSlide(false);

  /**
   * ===== API CALLS =====
   * We use useCallback so getCart doesn't change on every render
   * */
  const getCart = useCallback(async function (sId) {
    const currentSession = sId || localStorage.getItem("hair_language_session");
    if (!currentSession) return;

    try {
      const response = await server.get(
        `/api/cart/get?sessionId=${currentSession}`,
      );
      setCartData(response.data.cart);
    } catch (error) {
      console.error("Fetch Cart Error:", error.message);
    }
  }, []);

  /**
   * ===== INITIALIZATION =====
   * */
  // This guarantees that every user has a session, so if a user is not logged in, they still have a cart.
  const ensureSessionId = useCallback(() => {
    let currentSession = localStorage.getItem("hair_language_session");
    if (!currentSession) {
      currentSession = uuidv4();
      localStorage.setItem("hair_language_session", currentSession);
    }
    if (sessionId !== currentSession) {
      setSessionId(currentSession);
    }
    return currentSession;
  }, [sessionId]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    const storedSessionId = ensureSessionId();
    getCart(storedSessionId);
  }, [ensureSessionId, getCart]);

  // useEffect(() => {
  //   let storedSessionId = localStorage.getItem("hair_language_session");
  //   if (!storedSessionId) {
  //     storedSessionId = uuidv4();
  //     localStorage.setItem("hair_language_session", storedSessionId);
  //   }

  //   setSessionId(storedSessionId);
  //   getCart(storedSessionId);
  // }, [getCart]);

  const addToCart = async function (
    productId,
    quantity = 1,
    selectedLength,
    selectedColor,
    openSidebar = true,
  ) {
    setLoading(true);

    try {
      const currentSession = ensureSessionId();

      const response = await server.post("/api/cart/add", {
        productId,
        quantity,
        // sessionId,
        sessionId: currentSession,
        selectedLength,
        selectedColor,
      });

      await getCart(currentSession);

      setCartData(response.data.cart);

      if (openSidebar) {
        openCart();
      }

      toast.success("Added to cart!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding to cart.");
    } finally {
      setLoading(false);
    }
  };

  const updateCart = async function (
    productId,
    quantity,
    selectedLength,
    selectedColor,
  ) {
    try {
      const currentSession = ensureSessionId();

      const response = await server.patch("/api/cart/update", {
        // sessionId,
        sessionId: currentSession,
        productId,
        quantity,
        selectedLength,
        selectedColor,
      });

      setCartData(response.data.cart);
    } catch (error) {
      console.error("Update Cart Error: ", error.message);
    }
  };

  const removeFromCart = async function (
    productId,
    selectedLength,
    selectedColor,
  ) {
    try {
      const currentSession = ensureSessionId();

      const response = await server.delete("/api/cart/remove", {
        data: {
          sessionId: currentSession,
          productId,
          selectedLength,
          selectedColor,
        },
      });

      setCartData(
        response.data.cart || {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      );
      toast.success("Item removed");
    } catch (error) {
      console.error("Remove Error:", error.message);
    }
  };

  const clearCart = async function () {
    try {
      const currentSession = ensureSessionId();

      const response = await server.delete("/api/cart/clear", {
        data: { sessionId: currentSession },
      });

      await getCart(currentSession);

      setCartData(response.data.cart);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Clear Error:", error.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartData,
        addToCart,
        updateCart,
        removeFromCart,
        clearCart,
        cartSlide,
        openCart,
        closeCart,
        getCart, // Exported so login page can refresh cart
        loading,
      }}
    >
      <Toaster position="top-left" />
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
