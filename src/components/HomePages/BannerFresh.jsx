import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import WishlistButton from '../WishlistButton';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import "./Bannerfresh.css";
import '../WishlistButton.css';

function BannerFresh({ onQuickView }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState({}); // Track loading state for each product
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const autoScrollRef = useRef();
  const autoScrollPausedRef = useRef(false);
  const autoScrollTimeoutRef = useRef();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Filter for products with 10ml size
        const filtered = items.filter(product => {
          if (!Array.isArray(product.sizes)) return false;
          return product.sizes.some(sz => {
            const sizeLabel = typeof sz === 'object' ? sz.size : sz;
            const value = getNumericSizeValue(sizeLabel);
            return value !== null && value >= 2 && value <= 10;
          });
        });
        setProducts(filtered);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      pauseAutoScroll();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Drag-to-scroll for desktop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let isDown = false;
    let startX;
    let scrollLeft;
    const onMouseDown = (e) => {
      isDown = true;
      el.classList.add('dragging');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      pauseAutoScroll();
    };
    const onMouseLeave = () => {
      isDown = false;
      el.classList.remove('dragging');
    };
    const onMouseUp = () => {
      isDown = false;
      el.classList.remove('dragging');
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.2;
      el.scrollLeft = scrollLeft - walk;
    };
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Auto-scroll logic
  function pauseAutoScroll() {
    autoScrollPausedRef.current = true;
    clearTimeout(autoScrollTimeoutRef.current);
    autoScrollTimeoutRef.current = setTimeout(() => {
      autoScrollPausedRef.current = false;
    }, 2000);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onUserPause() { pauseAutoScroll(); }
    el.addEventListener('mouseenter', onUserPause);
    el.addEventListener('touchstart', onUserPause);
    return () => {
      el.removeEventListener('mouseenter', onUserPause);
      el.removeEventListener('touchstart', onUserPause);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let started = false;
    let startTimeout = setTimeout(() => {
      started = true;
    }, 2000);
    function autoScroll() {
      if (!started) return;
      if (autoScrollPausedRef.current) return;
      // If at end, scroll back to start
      if (el.scrollLeft + el.offsetWidth >= el.scrollWidth - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollLeft += 1.2; // Adjust speed as needed
      }
    }
    autoScrollRef.current = setInterval(autoScroll, 18);
    return () => {
      clearTimeout(startTimeout);
      clearInterval(autoScrollRef.current);
    };
  }, []);

  // Button scroll controls (match BestSellers)
  function scrollByAmount(direction) {
    const el = scrollRef.current;
    if (!el) return;
    pauseAutoScroll();
    const amount = Math.max(240, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  const handleAddToCart = async (product) => {
    // Set loading state for this specific product
    setLoadingProducts(prev => ({ ...prev, [product.id]: true }));
    
    await new Promise(res => setTimeout(res, 600));
    
    // Get 10ml size since this section displays 10ml prices
    const size10ml = getPreferredMiniSize(product);
    const productWithSize = {
      ...product,
      selectedSize: size10ml || { size: '', price: product.price, oldPrice: product.oldPrice }
    };
    
    addToCart(productWithSize);
    
    // Clear loading state for this product
    setLoadingProducts(prev => ({ ...prev, [product.id]: false }));
    
    const offcanvas = document.getElementById('shoppingCart');
    const bsOffcanvas = new window.bootstrap.Offcanvas(offcanvas);
    bsOffcanvas.show();
  };

  const handleCardClick = (product) => {
    // Pass the BannerFresh flag through navigation state
    navigate(`/product/${product.id}`, { 
      state: { fromBannerFresh: true } 
    });
  };

  const handleQuickView = (product) => {
    // Pass a flag to indicate this product is from BannerFresh section
    onQuickView({ ...product, fromBannerFresh: true });
  };

  function getNumericSizeValue(label) {
    if (!label) return null;
    const match = label.toString().match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  // Helper to get <=10ml size object (prioritize exact 10)
  function getPreferredMiniSize(product) {
    if (!Array.isArray(product.sizes)) return null;
    const exactTen = product.sizes.find(sz => sz && typeof sz === 'object' && sz.size === '10ml');
    if (exactTen) return exactTen;
    return product.sizes.find(sz => {
      if (!sz || typeof sz !== 'object') return false;
      const val = getNumericSizeValue(sz.size);
      return val !== null && val >= 2 && val <= 10;
    }) || null;
  }
  function getPrimaryImage(product) {
    const s10 = getPreferredMiniSize(product);
    if (s10 && Array.isArray(s10.images) && s10.images[0]) return s10.images[0];
    const firstSizeImg = Array.isArray(product.sizes) && product.sizes[0] && Array.isArray(product.sizes[0].images) ? product.sizes[0].images[0] : null;
    return firstSizeImg || product.image;
  }
  function getAvailableSizes(product) {
    if (!Array.isArray(product.sizes)) return [];
    const formatted = product.sizes
      .map(sz => (typeof sz === 'object' ? sz.size : sz))
      .filter(Boolean);
    return formatted
      .map(size => ({ size, value: getNumericSizeValue(size) ?? Infinity }))
      .sort((a, b) => a.value - b.value)
      .map(entry => entry.size);
  }
  function formatPrice(price) {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }

  // Helper function to get category icon and color
  const getCategoryInfo = (badge) => {
    if (!badge) return { icon: 'fa-tag', color: '#fff', bg: 'linear-gradient(135deg, #640d14, #9b7645)' };
    
    const badgeLower = badge.toLowerCase();
    switch (badgeLower) {
      case 'new':
        return { icon: 'fa-star', color: '#fff', bg: 'linear-gradient(135deg, #3FC53A, #4CAF50)' };
      case 'premium':
        return { icon: 'fa-crown', color: '#fff', bg: 'linear-gradient(135deg, #C9B37E, #D4B04C)' };
      case 'budget':
        return { icon: 'fa-tags', color: '#fff', bg: 'linear-gradient(135deg, #2196F3, #1976D2)' };
      case 'clearence':
        return { icon: 'fa-fire', color: '#fff', bg: 'linear-gradient(135deg, #FF6B35, #F7931E)' };
      case 'special edition':
        return { icon: 'fa-gem', color: '#fff', bg: 'linear-gradient(135deg, #A63A27, #D32F2F)' };
      case 'sale':
        return { icon: 'fa-percent', color: '#fff', bg: 'linear-gradient(135deg, #E91E63, #C2185B)' };
      default:
        return { icon: 'fa-tag', color: '#fff', bg: 'linear-gradient(135deg, #640d14, #9b7645)' };
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  }

  return (
    <div>
      <section className="banner-fresh-section pt-5 pb-4">
        <div className="">
          <div className="text-start mb-12" data-aos="fade-up" data-aos-duration="800">
            <h2 className="s-title font-2 text-capitalize">Explore our miniatures<span className=""></span></h2>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              aria-label="Scroll left"
              className="fresh-slider-nav fresh-slider-nav-left"
              onClick={() => scrollByAmount(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              className="fresh-slider-nav fresh-slider-nav-right"
              onClick={() => scrollByAmount(1)}
            >
              ›
            </button>
            <div
              className="fresh-products-slider"
              ref={scrollRef}
              style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '24px',
                scrollBehavior: 'smooth',
                paddingBottom: 8,
                marginTop: 16,
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style>{`
                .fresh-products-slider::-webkit-scrollbar { display: none; }
                .fresh-slider-nav {
                  position: absolute;
                  top: 50%;
                  transform: translateY(-50%);
                  z-index: 2;
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  border: none;
                  background: rgba(255, 255, 255, 0.9);
                  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  color: #333;
                  font-size: 22px;
                  line-height: 1;
                }
                .fresh-slider-nav:hover {
                  background: #ffffff;
                  box-shadow: 0 6px 18px rgba(0,0,0,0.2);
                }
                .fresh-slider-nav-left { left: -8px; }
                .fresh-slider-nav-right { right: -8px; }
                @media (max-width: 576px) { .fresh-slider-nav { display: none; } }
              `}</style>
            {products.map((product, index) => {
              const size10ml = getPreferredMiniSize(product);
              const displayedSize = size10ml?.size
                || (Array.isArray(product.sizes) && product.sizes.find(sz => typeof sz === 'object' && sz.size)?.size)
                || (typeof product.size === 'string' ? product.size : null);
              const availableSizes = getAvailableSizes(product);
              return (
                <div
                  key={product.id}
                  className="fresh-product-card"
                  style={{ width: 308, flex: '0 0 auto' }}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  data-aos-duration="600"
                >
                  <div className="card-wrapper">
                    <div
                      className="product-image-container"
                      onClick={() => handleCardClick(product)}
                    >
                      <img src={getPrimaryImage(product)} alt={product.name} className="product-image" />
                      <img src={getPrimaryImage(product)} alt={product.name} className="product-hover-image" />
                      {product.badge && (() => {
                        const categoryInfo = getCategoryInfo(product.badge);
                        return (
                          <div 
                            className="product-badge"
                            style={{
                              background: categoryInfo.bg,
                              color: categoryInfo.color,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              padding: '6px 14px',
                              borderRadius: '20px',
                              boxShadow: '0 4px 15px rgba(127, 89, 40, 0.3)',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <i className={`fas ${categoryInfo.icon}`} style={{ fontSize: '0.7rem' }}></i>
                            <span>{product.badge}</span>
                          </div>
                        );
                      })()}
                    </div>

                    {!product.isOutOfStock && (
                      <div className="product-actions">
                        <WishlistButton 
                          product={product} 
                          className="action-btn wishlist-btn"
                        />
                        <button
                          className="action-btn cart-btn"
                          onClick={() => handleAddToCart(product)}
                          title="Add to Cart"
                          disabled={loadingProducts[product.id]}
                        >
                          {loadingProducts[product.id] ? (
                            <div className="cart-btn-spinner"></div>
                          ) : (
                            <i className="icon icon-shop-cart"></i>
                          )}
                        </button>
                        <button
                          className="action-btn quickview-btn"
                          onClick={() => handleQuickView(product)}
                          title="Quick View"
                        >
                          <i className="icon icon-view"></i>
                        </button>
                      </div>
                    )}

                    {product.isOutOfStock && (
                      <div className="out-of-stock-overlay">
                        <span>Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="product-info bg-white" onClick={() => handleCardClick(product)}>
                    <h3 className="product-brand">{product.brand}</h3>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">
                      {size10ml ? (
                        <>
                          <span className="current-price">
                            ₹{formatPrice(size10ml.price)}
                          </span>
                          {size10ml.oldPrice && (
                            <>
                              <span className="old-price">
                                ₹{formatPrice(size10ml.oldPrice)}
                              </span>
                              <span className="discount-percentage">
                                {Math.round(((size10ml.oldPrice - size10ml.price) / size10ml.oldPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="current-price">
                            ₹{product.price?.toFixed ? product.price.toFixed(2) : product.price}
                          </span>
                          {product.oldPrice && (
                            <>
                              <span className="old-price">
                                ₹{product.oldPrice?.toFixed ? product.oldPrice.toFixed(2) : product.oldPrice}
                              </span>
                              <span className="discount-percentage">
                                {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    {displayedSize && (
                      <div className="product-size-hint" style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px' }}>
                        Size: {displayedSize}
                      </div>
                    )}
                    {availableSizes.length > 0 && (
                      <div className="product-available-sizes mt-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {availableSizes.map(size => (
                          <span
                            key={size}
                            style={{
                              fontSize: '0.7rem',
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
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default BannerFresh;