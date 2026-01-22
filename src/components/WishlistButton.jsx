import React, { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './WishlistButton.css';

function WishlistButton({ product, className = '', size = 'medium', showText = false, showIcon = true }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Show login prompt or redirect to login
      alert('Please login to add items to wishlist');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        showToast('Removed from wishlist', 'info');
      } else {
        const result = await addToWishlist(product);
        if (!result.success) {
          alert(result.message);
        }
        showToast('Product added to wishlist', 'success');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlistState = isInWishlist(product.id);

  const sizeClasses = {
    small: 'wishlist-btn-small',
    medium: 'wishlist-btn-medium',
    large: 'wishlist-btn-large'
  };

  const buttonClass = `wishlist-btn ${sizeClasses[size]} ${className} ${isInWishlistState ? 'in-wishlist' : ''}`;

  return (
    <button
      className={buttonClass}
      onClick={handleWishlistToggle}
      disabled={isLoading}
      title={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading ? (
        <div className="wishlist-btn-spinner"></div>
      ) : (
        <>
          {showIcon && (
            <svg 
              width={size === 'small' ? '14' : size === 'large' ? '24' : '16'} 
              height={size === 'small' ? '14' : size === 'large' ? '24' : '16'} 
              viewBox="0 0 24 24" 
              fill={isInWishlistState ? 'currentColor' : 'none'}
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
          {showText && (
            <span className="wishlist-btn-text">
              {isInWishlistState ? 'Remove' : 'Wishlist'}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default WishlistButton; 