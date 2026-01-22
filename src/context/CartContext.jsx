import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../components/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authInitialized, setAuthInitialized] = useState(false);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Merge guest cart with Firestore cart on login
                const guestCart = localStorage.getItem('cart');
                let mergedCart = [];
                try {
                    const cartRef = doc(db, 'carts', user.uid);
                    const cartDoc = await getDoc(cartRef);
                    const firestoreCart = cartDoc.exists() ? (cartDoc.data().items || []) : [];
                    if (guestCart) {
                        const guestCartArr = JSON.parse(guestCart);
                        // Merge logic: combine, sum quantities for same id+size
                        mergedCart = [...firestoreCart];
                        guestCartArr.forEach(guestItem => {
                            const sizeKey = guestItem.selectedSize && guestItem.selectedSize.size ? guestItem.selectedSize.size : '';
                            const existingIdx = mergedCart.findIndex(item => item.id === guestItem.id && ((item.selectedSize && item.selectedSize.size) === sizeKey));
                            if (existingIdx !== -1) {
                                mergedCart[existingIdx].quantity += guestItem.quantity || 1;
                            } else {
                                mergedCart.push(guestItem);
                            }
                        });
                    } else {
                        mergedCart = firestoreCart;
                    }
                    // Save merged cart to Firestore
                    await setDoc(cartRef, { items: mergedCart });
                    setCartItems(mergedCart);
                    localStorage.removeItem('cart');
                    // console.log('[CartContext] 🔄 Merged guest cart with Firestore cart for userId', user.uid, ':', mergedCart);
                } catch (err) {
                    setCartItems([]);
                    setError('Failed to merge guest cart with Firestore cart.');
                    console.error('[CartContext] ❌ Error merging guest cart with Firestore cart:', err);
                }
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
            setAuthInitialized(true);
            // console.log('[CartContext] Auth state changed. userId:', user?.uid || null);
        });
        return () => unsubscribe();
    }, []);

    // Load cart on userId change, but only after authInitialized
    useEffect(() => {
        if (!authInitialized) return;
        const loadCart = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (userId) {
                    // Logged-in: load from Firestore
                    const cartRef = doc(db, 'carts', userId);
                    const cartDoc = await getDoc(cartRef);
                    if (cartDoc.exists()) {
                        setCartItems(cartDoc.data().items || []);
                        // console.log('[CartContext] 📥 Loaded cart from Firestore for userId', userId, ':', cartDoc.data().items || []);
                    } else {
                        setCartItems([]);
                        // console.log('[CartContext] 📥 No cart in Firestore for userId', userId, ', starting with empty cart.');
                    }
                } else {
                    // Guest: load from localStorage
                    const localCart = localStorage.getItem('cart');
                    if (localCart) {
                        setCartItems(JSON.parse(localCart));
                        // console.log('[CartContext] 📥 Loaded cart from localStorage (guest):', JSON.parse(localCart));
                    } else {
                        setCartItems([]);
                        // console.log('[CartContext] 📥 No cart in localStorage for guest, starting with empty cart.');
                    }
                }
            } catch (err) {
                setCartItems([]);
                setError('Failed to load cart.');
                console.error('[CartContext] ❌ Error loading cart:', err);
            }
            setIsLoading(false);
        };
        loadCart();
    }, [userId, authInitialized]);

    // Save cart on change
    useEffect(() => {
        if (isLoading) return;
        const saveCart = async () => {
            try {
                if (userId) {
                    // Save to Firestore
                    const cartRef = doc(db, 'carts', userId);
                    await setDoc(cartRef, { items: cartItems });
                    // console.log('[CartContext] 📤 Saved cart to Firestore for userId', userId, ':', cartItems);
                } else {
                    // Save to localStorage
                    localStorage.setItem('cart', JSON.stringify(cartItems));
                    // console.log('[CartContext] 📤 Saved cart to localStorage (guest):', cartItems);
                }
            } catch (err) {
                setError('Failed to save cart.');
                // console.error('[CartContext] ❌ Error saving cart:', err);
            }
        };
        saveCart();
    }, [cartItems, userId, isLoading]);

    // Cart functions
    const addToCart = (product) => {
        setCartItems(prevItems => {
            const sizeKey = product.selectedSize && product.selectedSize.size ? product.selectedSize.size : '';
            const existingItem = prevItems.find(item => item.id === product.id && ((item.selectedSize && item.selectedSize.size) === sizeKey));
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id && ((item.selectedSize && item.selectedSize.size) === sizeKey)
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                        : item
                );
            }
            // Assign a unique cartItemId to each new cart entry
            return [...prevItems, { ...product, quantity: product.quantity || 1, cartItemId: uuidv4() }];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId, delta) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.cartItemId === cartItemId
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const clearCart = async () => {
        setCartItems([]);
        if (userId) {
            // Clear cart in Firestore
            try {
                const cartRef = doc(db, 'carts', userId);
                await setDoc(cartRef, { items: [] });
                // console.log('🗑️ Cleared cart in Firestore');
            } catch (err) {
                setError('Failed to clear cart in Firestore.');
                // console.error('❌ Error clearing cart in Firestore:', err);
            }
        } else {
            localStorage.removeItem('cart');
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.selectedSize && item.selectedSize.price ? parseFloat(item.selectedSize.price) : (typeof item.price === 'string' ? parseFloat(item.price) : item.price);
            const safePrice = isNaN(price) ? 0 : price;
            return total + (safePrice * item.quantity);
        }, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount,
            isLoading,
            error
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
