import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../components/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authInitialized, setAuthInitialized] = useState(false);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                await loadWishlistFromFirestore(user.uid);
            } else {
                setUserId(null);
                setWishlistItems([]);
            }
            setAuthInitialized(true);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loadWishlistFromFirestore = async (uid) => {
        try {
            const wishlistRef = doc(db, 'wishlists', uid);
            const wishlistDoc = await getDoc(wishlistRef);
            
            if (wishlistDoc.exists()) {
                const data = wishlistDoc.data();
                setWishlistItems(data.items || []);
            } else {
                // Create new wishlist document
                await setDoc(wishlistRef, { items: [] });
                setWishlistItems([]);
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
            setError('Failed to load wishlist');
        }
    };

    const addToWishlist = async (product) => {
        if (!userId) {
            // Show login prompt or redirect to login
            return { success: false, message: 'Please login to add items to wishlist' };
        }

        try {
            const wishlistRef = doc(db, 'wishlists', userId);
            
            // Check if product already exists in wishlist
            const existingItem = wishlistItems.find(item => item.id === product.id);
            if (existingItem) {
                return { success: false, message: 'Product already in wishlist' };
            }

            // Build a safe product payload with no undefined fields
            const sizesArray = Array.isArray(product.sizes) ? product.sizes : [];
            // Find a size with a valid price (prefer 50ml if present, else lowest numeric)
            const preferredSize = (() => {
                const size50 = sizesArray.find(sz => sz && typeof sz === 'object' && sz.size === '50ml' && sz.price !== undefined);
                if (size50) return size50;
                const validSizes = sizesArray.filter(sz => sz && typeof sz === 'object' && sz.size && sz.price !== undefined);
                if (validSizes.length === 0) return null;
                const sorted = validSizes.sort((a, b) => {
                    const aMatch = a.size.toString().match(/(\d+(?:\.\d+)?)/);
                    const bMatch = b.size.toString().match(/(\d+(?:\.\d+)?)/);
                    if (!aMatch || !bMatch) return 0;
                    return parseFloat(aMatch[1]) - parseFloat(bMatch[1]);
                });
                return sorted[0] || null;
            })();

            // Derive primary image: prefer from preferredSize.images[0], else first size with image, else product.image
            const primaryImage = (() => {
                const fromPreferred = preferredSize && Array.isArray(preferredSize.images) && preferredSize.images[0] ? preferredSize.images[0] : null;
                if (fromPreferred) return fromPreferred;
                for (const sz of sizesArray) {
                    if (sz && Array.isArray(sz.images) && sz.images[0]) return sz.images[0];
                }
                return product.image ?? '';
            })();

            const safePrice = (() => {
                if (preferredSize && preferredSize.price !== undefined && preferredSize.price !== null) return preferredSize.price;
                if (product.price !== undefined && product.price !== null) return product.price;
                return 0;
            })();

            const productToAdd = {
                id: product.id ?? '',
                name: product.name ?? '',
                price: safePrice,
                image: primaryImage ?? '',
                badge: product.badge ?? '',
                category: Array.isArray(product.tags) && product.tags.length > 0 ? (product.tags[0] ?? '') : '',
                addedAt: new Date().toISOString()
            };

            // Try to update existing document first
            try {
                await updateDoc(wishlistRef, {
                    items: arrayUnion(productToAdd)
                });
            } catch (updateError) {
                // If update fails, try to create the document
                if (updateError.code === 'not-found') {
                    await setDoc(wishlistRef, {
                        items: [productToAdd]
                    });
                } else {
                    throw updateError;
                }
            }

            setWishlistItems(prev => [...prev, productToAdd]);
            return { success: true, message: 'Added to wishlist' };
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            setError('Failed to add to wishlist');
            return { success: false, message: 'Failed to add to wishlist' };
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!userId) return;

        try {
            const wishlistRef = doc(db, 'wishlists', userId);
            const itemToRemove = wishlistItems.find(item => item.id === productId);
            
            if (itemToRemove) {
                await updateDoc(wishlistRef, {
                    items: arrayRemove(itemToRemove)
                });

                setWishlistItems(prev => prev.filter(item => item.id !== productId));
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            setError('Failed to remove from wishlist');
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId);
    };

    const clearWishlist = async () => {
        if (!userId) return;

        try {
            const wishlistRef = doc(db, 'wishlists', userId);
            await setDoc(wishlistRef, { items: [] });
            setWishlistItems([]);
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            setError('Failed to clear wishlist');
        }
    };

    const getWishlistCount = () => {
        return wishlistItems.length;
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            isLoading,
            error,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            clearWishlist,
            getWishlistCount,
            userId,
            authInitialized
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext); 