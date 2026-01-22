import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../components/firebase';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import QuickView from '../components/QuickView';
import WishlistButton from '../components/WishlistButton';
import './newarrivals.css';
import '../components/WishlistButton.css';

function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedGender, setSelectedGender] = useState('all');
  const [loadingProducts, setLoadingProducts] = useState({});
  
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all products from Firebase and filter by tags
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      const allProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter for products with "New Arrivals" tag (matching existing logic)
      const newArrivalsProducts = allProducts.filter(product => 
        Array.isArray(product.tags) && product.tags.includes('New Arrivals')
      );
      
      setProducts(newArrivalsProducts);
    } catch (err) {
      console.error('Error fetching new arrivals:', err);
      setError('Failed to load new arrivals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handleAddToCart = async (product) => {
    setLoadingProducts(prev => ({ ...prev, [product.id]: true }));
    
    await new Promise(res => setTimeout(res, 600));
    
    // Get 50ml size since this section displays 50ml prices
    const size50ml = get50mlSize(product);
    const productWithSize = {
      ...product,
      selectedSize: size50ml || { size: '', price: product.price, oldPrice: product.oldPrice }
    };
    
    addToCart(productWithSize);
    
    setLoadingProducts(prev => ({ ...prev, [product.id]: false }));
    
    const offcanvas = document.getElementById('shoppingCart');
    if (offcanvas) {
      const bsOffcanvas = new window.bootstrap.Offcanvas(offcanvas);
      bsOffcanvas.show();
    }
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

  const filteredProducts = (selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory))
    .filter(product => {
      if (selectedGender === 'all') return true;
      const gender = (product.gender || 'unisex').toLowerCase();
      if (selectedGender === 'men') return gender === 'men' || gender === 'unisex';
      if (selectedGender === 'women') return gender === 'women' || gender === 'unisex';
      // if (selectedGender === 'unisex') return gender === 'unisex';
      return true;
    });

  const categories = ['all', 'men', 'women', 'unisex'];
  const genders = ['all', 'men', 'women', 'unisex'];

  // Helpers for 50ml display and cart
  function get50mlSize(product) {
    if (!Array.isArray(product.sizes)) return null;
    return product.sizes.find(sz => (typeof sz === 'object' && sz.size === '50ml')) || null;
  }
  function getProductPrimaryImage(product) {
    const s50 = get50mlSize(product);
    if (s50 && Array.isArray(s50.images) && s50.images[0]) return s50.images[0];
    const firstSizeImg = Array.isArray(product.sizes) && product.sizes[0] && Array.isArray(product.sizes[0].images) ? product.sizes[0].images[0] : null;
    return firstSizeImg || product.image;
  }
  // Keep 20ml helper for add-to-cart behaviour consistency
  function get20mlSize(product) {
    if (!Array.isArray(product.sizes)) return null;
    return product.sizes.find(sz => (typeof sz === 'object' && sz.size === '20ml')) || null;
  }

  function getNumericSizeValue(label) {
    if (!label) return null;
    const match = label.toString().match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  function getAvailableSizes(product) {
    if (!Array.isArray(product.sizes)) return [];
    const unique = new Map();
    product.sizes.forEach(sz => {
      const label = sz && typeof sz === 'object' ? sz.size : sz;
      if (!label) return;
      if (!unique.has(label)) {
        unique.set(label, getNumericSizeValue(label) ?? Infinity);
      }
    });
    return [...unique.entries()]
      .sort((a, b) => a[1] - b[1])
      .map(entry => entry[0]);
  }

  function formatPrice(price) {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }

  if (loading) {
    return (
      <div className="na-container">
        <div className="na-loading">
          <div className="na-spinner"></div>
          <p>Loading new arrivals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="na-container">
        <div className="na-error">
          <div className="na-error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchNewArrivals} className="na-retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="na-container">
      {/* Hero Section */}
      

      {/* Category Filter */}
      <div className="na-filter-section mt-5">
        
        <div className="na-filter-container mt-3">
          {genders.map(g => (
            <button
              key={g}
              className={`na-filter-btn ${selectedGender === g ? 'active' : ''}`}
              onClick={() => setSelectedGender(g)}
            >
              {g === 'all' ? 'All Genders' : g === 'men' ? 'Men' : g === 'women' ? 'Women' : 'Unisex'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="na-products-section">
        {filteredProducts.length === 0 ? (
          <div className="na-empty-state">
            <div className="na-empty-icon">🛍️</div>
            <h3>No products found</h3>
            <p>Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="na-grid">
            {filteredProducts.map(product => {
              const size20ml = get20mlSize(product);
              const availableSizes = getAvailableSizes(product);
              return (
                <div className="na-card" key={product.id}>
                  <div className="na-img-wrapper">
                    <img 
                      src={getProductPrimaryImage(product)} 
                      alt={product.name} 
                      className="na-img"
                      onError={(e) => {
                        e.target.src = '/public/images/products/product-1.jpg';
                      }}
                    />
                    {product.badge && (
                      <span className="na-badge">{product.badge}</span>
                    )}
                    {size20ml?.oldPrice && (
                      <span className="na-discount-badge">
                        -{Math.round(((size20ml.oldPrice - size20ml.price) / size20ml.oldPrice) * 100)}%
                      </span>
                    )}
                    <div className="na-card-overlay">
                      <WishlistButton 
                        product={product}
                        className="na-wishlist-btn"
                      />
                      <button 
                        className="na-quick-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickView(product);
                        }}
                      >
                        Quick View
                      </button>
                      <button 
                        className="na-add-to-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={loadingProducts[product.id]}
                      >
                        {loadingProducts[product.id] ? (
                          <div className="na-cart-spinner"></div>
                        ) : (
                          'Add to Cart'
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="na-info" onClick={() => handleCardClick(product)}>
                    <div className="na-category-tag">
                      {(product.gender || 'unisex').toString().charAt(0).toUpperCase() + (product.gender || 'unisex').toString().slice(1)}
                    </div>
                    <h2 className="na-name">{product.name}</h2>
                    <p className="na-desc">{product.description || 'Premium fragrance for discerning tastes.'}</p>
                    <div className="na-rating">
                      <div className="na-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`na-star ${i < (product.rating || 4) ? 'filled' : ''}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="na-review-count">
                        ({product.reviewCount || Math.floor(Math.random() * 50) + 10} reviews)
                      </span>
                    </div>
                    <div className="na-prices">
                      {(() => {
                        const size50ml = get50mlSize(product);
                        if (size50ml) {
                          return (
                            <>
                              <span className="na-price">₹{formatPrice(size50ml.price)}</span>
                              {size50ml.oldPrice && (
                                <span className="na-old-price">₹{formatPrice(size50ml.oldPrice)}</span>
                              )}
                            </>
                          );
                        }
                        return (
                          <span className="na-price" style={{ color: '#999', fontStyle: 'italic' }}>
                            Price not available
                          </span>
                        );
                      })()}
                    </div>
                    {availableSizes.length > 0 && (
                      <div
                        className="na-available-sizes"
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}
                      >
                        {availableSizes.map(size => (
                          <span
                            key={size}
                            className="na-size-chip"
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              border: '1px solid rgba(0,0,0,0.08)',
                              background: 'rgba(0,0,0,0.03)',
                              color: '#555'
                            }}
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="na-card-actions">
                      <button 
                        className="na-btn na-primary-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(product);
                        }}
                      >
                        View Details
                      </button>
                      <WishlistButton 
                        product={product} 
                        className="na-btn na-secondary-btn"
                        showIcon={false}
                        showText={true}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      

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

export default NewArrivalsPage; 