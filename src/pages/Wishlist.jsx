import React, { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QuickView from '../components/QuickView';
import './wishlist.css';

function Wishlist() {
  const { wishlistItems, removeFromWishlist, clearWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatPrice = (price) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Helpers for size, image and pricing
  function get10mlSize(product) {
    if (!Array.isArray(product.sizes)) return null;
    return product.sizes.find(sz => (typeof sz === 'object' && sz.size === '10ml')) || null;
  }
  function getPrimaryImage(product) {
    const s10 = get10mlSize(product);
    if (s10 && Array.isArray(s10.images) && s10.images[0]) return s10.images[0];
    const firstSizeImg = Array.isArray(product.sizes) && product.sizes[0] && Array.isArray(product.sizes[0].images) ? product.sizes[0].images[0] : null;
    return firstSizeImg || product.image;
  }

  const handleAddToCart = async (product) => {
    setLoadingProducts(prev => ({ ...prev, [product.id]: true }));
    
    await new Promise(res => setTimeout(res, 600));
    
    // Default to 50ml for cart, if present, else fallback
    const size50ml = Array.isArray(product.sizes) ? product.sizes.find(sz => (typeof sz === 'object' && sz.size === '50ml')) : null;
    const productWithSize = {
      ...product,
      selectedSize: size50ml || { size: '', price: product.price, oldPrice: product.oldPrice }
    };
    
    addToCart(productWithSize);
    
    setLoadingProducts(prev => ({ ...prev, [product.id]: false }));
    
    const offcanvas = document.getElementById('shoppingCart');
    if (offcanvas && window.bootstrap) {
      const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
      bsOffcanvas.show();
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlist(productId);
  };

  const handleCardClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  const handleClearWishlist = async () => {
    await clearWishlist();
    setShowClearConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-loading">
          <div className="wishlist-spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-login-prompt">
          <div className="wishlist-login-icon">💝</div>
          <h2>Sign in to view your wishlist</h2>
          <p>Create an account or sign in to save your favorite products</p>
          <button 
            className="wishlist-login-btn"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      {/* Header Section */}
      <div className="wishlist-header">
        <div className="wishlist-header-content">
          <div className="wishlist-title-section">
            <h1 className="wishlist-title">My Wishlist</h1>
            <p className="wishlist-subtitle">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
            </p>
          </div>
          
          {wishlistItems.length > 0 && (
            <div className="wishlist-actions">
              <button 
                className="wishlist-clear-btn"
                onClick={() => setShowClearConfirm(true)}
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Wishlist Content */}
      <div className="wishlist-content">
        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">💝</div>
            <h2>Your wishlist is empty</h2>
            <p>Start adding products to your wishlist to see them here</p>
            <button 
              className="wishlist-browse-btn"
              onClick={() => navigate('/category')}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="wishlist-list">
            {wishlistItems.map((product) => (
              <div className="wishlist-item" key={product.id}>
                <div className="wishlist-item-image">
                  <img 
                    src={getPrimaryImage(product)} 
                    alt={product.name} 
                    className="wishlist-product-image"
                    onClick={() => handleCardClick(product)}
                  />
                  {product.badge && (
                    <div className="wishlist-badge">
                      {product.badge}
                    </div>
                  )}
                </div>

                <div className="wishlist-item-details">
                  <div className="wishlist-item-info">
                    <h3 className="wishlist-product-name" onClick={() => handleCardClick(product)}>
                      {product.name}
                    </h3>
                    <div className="wishlist-product-category">
                      {product.category || 'Fragrance'}
                    </div>
                    {/* <div className="wishlist-product-price">
                      {(() => {
                        const size10ml = get10mlSize(product);
                        if (size10ml) {
                          return (
                            <>
                              <span className="current-price">₹{formatPrice(size10ml.price)}</span>
                              {size10ml.oldPrice && (
                                <span className="old-price">₹{formatPrice(size10ml.oldPrice)}</span>
                              )}
                            </>
                          );
                        } else {
                          return (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>
                              Price not available
                            </span>
                          );
                        }
                      })()}
                    </div> */}
                  </div>

                  <div className="wishlist-item-actions">
                    
                    
                    <button 
                      className="wishlist-add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={loadingProducts[product.id]}
                    >
                      {loadingProducts[product.id] ? (
                        <div className="wishlist-cart-spinner"></div>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 22V12h6v10M3 7h18l-2 12H5L3 7z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button 
                      className="wishlist-add-to-cart-btn"
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      title="Remove from wishlist"
                    >
                      {loadingProducts[product.id] ? (
                        <div className="wishlist-cart-spinner"></div>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 22V12h6v10M3 7h18l-2 12H5L3 7z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          remove
                        </>
                      )}
                    </button>
                    
                   
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="wishlist-modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="wishlist-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wishlist-modal-header">
              <h3>Clear Wishlist</h3>
              <button 
                className="wishlist-modal-close"
                onClick={() => setShowClearConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="wishlist-modal-body">
              <p>Are you sure you want to remove all items from your wishlist? This action cannot be undone.</p>
            </div>
            <div className="wishlist-modal-actions">
              <button 
                className="wishlist-modal-cancel"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="wishlist-modal-confirm"
                onClick={handleClearWishlist}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickView
          product={selectedProduct}
          onClose={handleCloseQuickView}
        />
      )}
    </div>
  );
}

export default Wishlist; 