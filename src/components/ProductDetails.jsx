import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { usePreloader } from '../context/PreloaderContext';
import WishlistButton from './WishlistButton';
import './ProductDetails.css';
import './WishlistButton.css';

// Add these icons at the top of the file if needed
const PremiumIcons = {
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ),
  Truck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM19.5 9.5H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.11.89-2 2-2h14v4h3z"/>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
    </svg>
  ),
  Package: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15z"/>
    </svg>
  )
};

function ProductDetails() {
  // Context hooks
  const { id } = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { showPreloader, hidePreloader } = usePreloader();
  
  // State hooks
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [accordionOpen, setAccordionOpen] = useState('description');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Refs
  const contentRef = useRef(null);
  const infoRef = useRef(null);

  // Memoized callbacks
  const handleQuantityChange = useCallback((delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  }, []);

  const handleQuantityInput = useCallback((e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  }, []);

  const getProductPrimaryImage = useCallback((p) => {
    if (!p) return '';
    if (Array.isArray(p.sizes)) {
      const size50 = p.sizes.find(sz => sz && typeof sz === 'object' && sz.size === '50ml');
      if (size50 && Array.isArray(size50.images) && size50.images[0]) return size50.images[0];
      for (const sz of p.sizes) {
        if (sz && Array.isArray(sz.images) && sz.images[0]) return sz.images[0];
      }
    }
    return p.image || p.hoverImage || p.image3 || p.image4 || '';
  }, []);

  const formatPrice = useCallback((price) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Memoized values
  const sizesArr = useMemo(() => {
    const p = product || {};
    const baseSizes = Array.isArray(p.sizes) && p.sizes.length > 0 
      ? p.sizes 
      : [{
          size: p.size || '',
          price: p.price || 0,
          oldPrice: p.oldPrice || '',
          images: [p.image, p.hoverImage, p.image3, p.image4].filter(Boolean),
          isOutOfStock: !!p.isOutOfStock
        }];
    
    return baseSizes.map(sz => ({
      ...sz,
      isOutOfStock: !!sz.isOutOfStock
    }));
  }, [product]);
  
  const finalDefaultIdx = useMemo(() => {
    if (location.state?.fromBannerFresh) {
      const defaultIdx = sizesArr.findIndex(s => (s && s.size) === '10ml');
      const fallbackIdx = sizesArr.findIndex(s => (s && s.size) === '50ml');
      return defaultIdx >= 0 ? defaultIdx : (fallbackIdx >= 0 ? fallbackIdx : 0);
    } else {
      const defaultIdx = sizesArr.findIndex(s => (s && s.size) === '50ml');
      return defaultIdx >= 0 ? defaultIdx : 0;
    }
  }, [sizesArr, location.state?.fromBannerFresh]);
  
  const preferredSizeIndex = useMemo(() => {
    const preferredIdx = finalDefaultIdx ?? 0;
    if (sizesArr[preferredIdx] && !sizesArr[preferredIdx].isOutOfStock) {
      return preferredIdx;
    }
    const firstAvailable = sizesArr.findIndex(sz => !sz.isOutOfStock);
    return firstAvailable !== -1 ? firstAvailable : preferredIdx;
  }, [sizesArr, finalDefaultIdx]);
  
  const productImages = useMemo(() => {
    const selected = sizesArr[selectedSizeIdx] || sizesArr[preferredSizeIndex] || sizesArr[0];
    return Array.isArray(selected?.images) && selected.images.length > 0
      ? selected.images
      : (product
        ? [product.image,
          (product.hoverImage && product.hoverImage !== product.image) ? product.hoverImage : null,
          product.image3,
          product.image4
        ].filter(Boolean)
        : []);
  }, [sizesArr, selectedSizeIdx, preferredSizeIndex, product]);

  const selectedSize = sizesArr[selectedSizeIdx] || sizesArr[preferredSizeIndex] || sizesArr[0];
  const isSelectedSizeOut = !!selectedSize?.isOutOfStock;

  const getWhatsAppNotifyUrl = useCallback(() => {
    const phoneNumber = '919584826112';
    const productName = product?.name || 'product';
    const sizeLabel = selectedSize?.size ? ` (${selectedSize.size})` : '';
    const message = `Hi! I'm interested in "${productName}${sizeLabel}". Please notify me when it's back in stock.`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }, [product?.name, selectedSize?.size]);
  
  const handleAddToCart = useCallback(async () => {
    if (isSelectedSizeOut) return;
    setButtonLoading(true);
    await new Promise(res => setTimeout(res, 600));
    addToCart({ ...product, quantity, selectedSize });
    showToast('Product added to cart', 'success');
    setButtonLoading(false);
    const offcanvas = document.getElementById('shoppingCart');
    if (offcanvas) {
      const bsOffcanvas = new window.bootstrap.Offcanvas(offcanvas);
      bsOffcanvas.show();
    }
  }, [addToCart, isSelectedSizeOut, product, quantity, selectedSize, showToast]);

  // Scroll handling
  const handleScroll = useCallback(() => {
    if (!contentRef.current || !infoRef.current) return;

    const content = contentRef.current;
    const info = infoRef.current;
    const contentRect = content.getBoundingClientRect();
    const infoRect = info.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate when to stop sticking
    const contentBottom = contentRect.top + content.offsetHeight;
    const infoBottom = infoRect.top + info.offsetHeight;
    
    // If bottom of info section is below the viewport bottom
    if (infoBottom > windowHeight) {
      content.classList.add('sticky-bottom');
    } else {
      content.classList.remove('sticky-bottom');
    }
    
    // Update scroll state for any additional styling if needed
    setIsScrolled(window.scrollY > 100);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setRelatedLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const products = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== id)
          .slice(0, 8); // Limit to 8 related products for premium look
        setRelatedProducts(products);
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
      setRelatedLoading(false);
    };
    fetchRelatedProducts();
  }, [id]);

  // Effects
  useEffect(() => {
    setSelectedSizeIdx(preferredSizeIndex);
  }, [preferredSizeIndex]);
  
  useEffect(() => {
    setSelectedImage(productImages[0] || '');
  }, [productImages]);

  // Scroll effect
  useEffect(() => {
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Premium Features List
  const premiumFeatures = useMemo(() => [
    { icon: <PremiumIcons.Shield />, text: '100% Authentic Products' },
    { icon: <PremiumIcons.Truck />, text: 'Free Shipping' },
    { icon: <PremiumIcons.Star />, text: 'Premium Quality' },
    { icon: <PremiumIcons.Package />, text: 'Secure Packaging' }
  ], []);

  if (loading) {
    return (
      <div className="pd-premium-loader">
        <div className="pd-premium-spinner">
          <div className="pd-premium-spinner-ring"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-premium-empty">
        <div className="pd-premium-empty-icon">!</div>
        <h3>Product Not Found</h3>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="pd-premium-back-btn">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pd-premium-main">
      {/* Minimal Breadcrumb */}
      <div className="pd-premium-breadcrumb">
        <Link to="/" className="pd-premium-breadcrumb-link">Home</Link>
        <span className="pd-premium-breadcrumb-separator">/</span>
        <Link to="/category" className="pd-premium-breadcrumb-link">Shop</Link>
        <span className="pd-premium-breadcrumb-separator">/</span>
        <span className="pd-premium-breadcrumb-current">{product.name}</span>
      </div>

      {/* Main Product Section - Luxury Layout */}
      <div className="pd-premium-content" ref={contentRef}>
        {/* Gallery Section - Left */}
        <div className="pd-premium-gallery">
          <div className="pd-premium-main-image-container">
            <div className="pd-premium-image-frame">
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="pd-premium-main-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600/f9f9f7/666?text=Perfume';
                }}
              />
              {product.badge && (
                <div className="pd-premium-badge">
                  <span className={`pd-premium-badge-text ${product.badge.includes('NEW') ? 'new' : 'sale'}`}>
                    {product.badge}
                  </span>
                </div>
              )}
            </div>
          </div>

          {productImages.length > 1 && (
            <div className="pd-premium-thumbnails">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`pd-premium-thumbnail ${selectedImage === img ? 'active' : ''}`}
                >
                  <div className="pd-premium-thumbnail-frame">
                    <img 
                      src={img} 
                      alt={`${product.name} view ${idx + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100/f9f9f7/666?text=View';
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info - Right */}
        <div className="pd-premium-info" ref={infoRef}>
          {/* Brand & Name */}
          <div className="pd-premium-header">
            <div className="pd-premium-brand">{product.brand}</div>
            <h1 className="pd-premium-title">{product.name}</h1>
            <div className="pd-premium-price-section">
              <span className="pd-premium-current-price">₹{formatPrice(selectedSize.price)}</span>
              {selectedSize.oldPrice && (
                <>
                  <span className="pd-premium-old-price">₹{formatPrice(selectedSize.oldPrice)}</span>
                  <span className="pd-premium-discount">
                    {Math.round((1 - selectedSize.price/selectedSize.oldPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Size Selection - Premium */}
          {sizesArr.length > 1 && (
            <div className="pd-premium-sizes">
              <div className="pd-premium-sizes-header">
                <h3>Select Size</h3>
                <div className="pd-premium-sizes-hint">Choose your preferred variant</div>
              </div>
              <div className="pd-premium-size-grid">
                {sizesArr.map((sz, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSizeIdx(idx)}
                    className={`pd-premium-size-btn ${selectedSizeIdx === idx ? 'active' : ''} ${sz.isOutOfStock ? 'disabled' : ''}`}
                    disabled={sz.isOutOfStock}
                  >
                    <div className="pd-premium-size-content">
                      <span className="pd-premium-size-name">{sz.size}</span>
                      <span className="pd-premium-size-price">₹{formatPrice(sz.price)}</span>
                      {sz.oldPrice && (
                        <span className="pd-premium-size-old">₹{formatPrice(sz.oldPrice)}</span>
                      )}
                    </div>
                    {sz.isOutOfStock && (
                      <div className="pd-premium-size-status">
                        <span>Out of Stock</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Premium Features */}
          <div className="pd-premium-features-grid">
            {premiumFeatures.map((feature, idx) => (
              <div key={idx} className="pd-premium-feature-item">
                <div className="pd-premium-feature-icon">{feature.icon}</div>
                <span className="pd-premium-feature-text">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Quantity & Actions */}
          <div className="pd-premium-actions">
            <div className="pd-premium-quantity">
              <div className="pd-premium-quantity-label">Quantity</div>
              <div className="pd-premium-quantity-controls">
                <button
                  className="pd-premium-qty-btn minus"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <svg width="14" height="2" viewBox="0 0 14 2" fill="currentColor">
                    <path d="M0 1C0 0.447715 0.447715 0 1 0H13C13.5523 0 14 0.447715 14 1C14 1.55228 13.5523 2 13 2H1C0.447715 2 0 1.55228 0 1Z"/>
                  </svg>
                </button>
                <div className="pd-premium-qty-value">{quantity}</div>
                <button
                  className="pd-premium-qty-btn plus"
                  onClick={() => handleQuantityChange(1)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M6 6V0H8V6H14V8H8V14H6V8H0V6H6Z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="pd-premium-action-buttons">
              <button
                className={`pd-premium-cart-btn ${isSelectedSizeOut ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={product.isOutOfStock || isSelectedSizeOut || buttonLoading}
              >
                {buttonLoading ? (
                  <span className="pd-premium-btn-spinner"></span>
                ) : null}
                {product.isOutOfStock || isSelectedSizeOut ? 'Out of Stock' : buttonLoading ? 'Adding...' : 'Add to Cart'}
              </button>
              
              <WishlistButton
                product={product}
                size="large"
                showText={true}
                showIcon={true}
                className="pd-premium-wishlist-btn"
              />

              {(product.isOutOfStock || isSelectedSizeOut) && (
                <a
                  href={getWhatsAppNotifyUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pd-premium-notify-btn"
                >
                  Notify When Available
                </a>
              )}
            </div>
          </div>

          {/* Accordion Details */}
          <div className="pd-premium-details">
            <div className="pd-premium-accordion">
              <div className="pd-premium-accordion-item">
                <button
                  className={`pd-premium-accordion-header ${accordionOpen === 'description' ? 'active' : ''}`}
                  onClick={() => setAccordionOpen(accordionOpen === 'description' ? '' : 'description')}
                >
                  <span>Product Description</span>
                  <svg className="pd-premium-accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className={`pd-premium-accordion-content ${accordionOpen === 'description' ? 'active' : ''}`}>
                  <div className="pd-premium-description">
                    <p>{product.data || 'No description available.'}</p>
                    {product.sizes && (
                      <div className="pd-premium-sizes-info">
                        <div className="pd-premium-sizes-info-title">Available Variants</div>
                        <div className="pd-premium-sizes-info-list">
                          {Array.isArray(product.sizes) && product.sizes.length > 0
                            ? product.sizes
                                .map(sz => typeof sz === 'string' ? sz : (sz && sz.size ? sz.size : null))
                                .filter(Boolean)
                                .join(' • ')
                            : 'One size'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pd-premium-accordion-item">
                <button
                  className={`pd-premium-accordion-header ${accordionOpen === 'faq' ? 'active' : ''}`}
                  onClick={() => setAccordionOpen(accordionOpen === 'faq' ? '' : 'faq')}
                >
                  <span>Frequently Asked Questions</span>
                  <svg className="pd-premium-accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className={`pd-premium-accordion-content ${accordionOpen === 'faq' ? 'active' : ''}`}>
                  <div className="pd-premium-faq">
                    <div className="pd-premium-faq-item">
                      <div className="pd-premium-faq-question">Are the products genuine?</div>
                      <div className="pd-premium-faq-answer">All our products are sourced from the brand or the distributors of the brand. Also the average expiry date of all our products would be between 2 to 3 years.</div>
                    </div>
                    <div className="pd-premium-faq-item">
                      <div className="pd-premium-faq-question">Can the products be returned?</div>
                      <div className="pd-premium-faq-answer">No returns are allowed. For issues with the product, please contact us within 24 hours of receiving the product.</div>
                    </div>
                    <div className="pd-premium-faq-item">
                      <div className="pd-premium-faq-question">Is Cash On Delivery available?</div>
                      <div className="pd-premium-faq-answer">Yes we have COD (Cash On Delivery) service to most pin codes in India. For all COD orders there is a verification of pin code done before shipping the product.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products - Premium Grid */}
      <div className="pd-premium-related">
        <div className="pd-premium-related-header">
          <h3>You May Also Like</h3>
          <p>Discover more premium fragrances</p>
        </div>
        
        {relatedLoading ? (
          <div className="pd-premium-related-loading">
            <div className="pd-premium-related-spinner"></div>
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="pd-premium-related-grid">
            {relatedProducts.map((relatedProduct) => {
              const getProductPrice = (product) => {
                if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
                  return product.sizes[0].price || product.price;
                }
                return product.price;
              };

              const getProductOldPrice = (product) => {
                if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
                  return product.sizes[0].oldPrice || product.oldPrice;
                }
                return product.oldPrice;
              };

              return (
                <Link
                  to={`/product/${relatedProduct.id}`}
                  key={relatedProduct.id}
                  className="pd-premium-related-card"
                >
                  <div className="pd-premium-related-image-container">
                    <img
                      src={getProductPrimaryImage(relatedProduct)}
                      alt={relatedProduct.name}
                      className="pd-premium-related-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/f9f9f7/666?text=Perfume';
                      }}
                    />
                    {relatedProduct.badge && (
                      <div className="pd-premium-related-badge">
                        <span className={`pd-premium-related-badge-text ${relatedProduct.badge.includes('NEW') ? 'new' : 'sale'}`}>
                          {relatedProduct.badge}
                        </span>
                      </div>
                    )}
                    <div className="pd-premium-related-overlay">
                      <button className="pd-premium-related-view-btn">
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="pd-premium-related-info">
                    <div className="pd-premium-related-brand">{relatedProduct.brand}</div>
                    <h4 className="pd-premium-related-name">{relatedProduct.name}</h4>
                    <div className="pd-premium-related-price">
                      <span className="pd-premium-related-current">₹{formatPrice(getProductPrice(relatedProduct))}</span>
                      {getProductOldPrice(relatedProduct) && (
                        <span className="pd-premium-related-old">₹{formatPrice(getProductOldPrice(relatedProduct))}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="pd-premium-related-empty">
            <p>No related products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;