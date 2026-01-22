import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { usePreloader } from '../context/PreloaderContext';
import WishlistButton from './WishlistButton';

function QuickView({ product, onClose }) {
    const { addToCart } = useCart();
    const { showPreloader, hidePreloader } = usePreloader();
    const [selectedImage, setSelectedImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);

    if (!product) return null;
    const MAX_DESCRIPTION_CHARS = 400;
    const truncateDescription = (text) => {
        if (!text) return '';
        const normalized = text.replace(/\s+/g, ' ').trim();
        if (normalized.length <= MAX_DESCRIPTION_CHARS) {
            return normalized;
        }
        const shortened = normalized.slice(0, MAX_DESCRIPTION_CHARS);
        const lastPeriod = shortened.lastIndexOf('.');
        if (lastPeriod > MAX_DESCRIPTION_CHARS - 120) {
            return shortened.slice(0, lastPeriod + 1);
        }
        return `${shortened}…`;
    };
    const truncatedDescription = truncateDescription(product?.data || '');
    const shouldTruncate = !!product?.data && truncatedDescription.length < product.data.replace(/\s+/g, ' ').trim().length;

    const formatPrice = (price) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const getSizesArray = () => Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes
        : [{
            size: product.size || '',
            price: product.price,
            oldPrice: product.oldPrice,
            images: [product.image, product.hoverImage, product.image3, product.image4].filter(Boolean),
            isOutOfStock: !!product.isOutOfStock
        }];
    const sizesArr = getSizesArray().map(sz => ({
        ...sz,
        isOutOfStock: !!sz.isOutOfStock
    }));
    // Only prioritize 10ml if product is from BannerFresh section, otherwise default to 50ml
    let finalDefaultIdx;
    if (product.fromBannerFresh) {
        // For BannerFresh products, prioritize 10ml
        const defaultIdx = sizesArr.findIndex(s => (s && s.size) === '10ml');
        const fallbackIdx = sizesArr.findIndex(s => (s && s.size) === '50ml');
        finalDefaultIdx = defaultIdx >= 0 ? defaultIdx : (fallbackIdx >= 0 ? fallbackIdx : 0);
    } else {
        // For other products, default to 50ml as before
        const defaultIdx = sizesArr.findIndex(s => (s && s.size) === '50ml');
        finalDefaultIdx = defaultIdx >= 0 ? defaultIdx : 0;
    }

    const computePreferredIdx = () => {
        if (sizesArr[finalDefaultIdx] && !sizesArr[finalDefaultIdx].isOutOfStock) return finalDefaultIdx;
        const firstAvailable = sizesArr.findIndex(sz => !sz.isOutOfStock);
        return firstAvailable !== -1 ? firstAvailable : finalDefaultIdx;
    };
    const preferredIdx = computePreferredIdx();

    useEffect(() => {
        setSelectedSizeIdx(preferredIdx);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product?.id, preferredIdx]);
    const selectedSize = sizesArr[selectedSizeIdx] || sizesArr[preferredIdx] || sizesArr[0];
    const isSelectedSizeOut = !!selectedSize?.isOutOfStock;

    // Build current images from the selected size, fallback to legacy
    const currentImages = Array.isArray(selectedSize?.images) && selectedSize.images.length > 0
        ? selectedSize.images
        : [product.image, product.hoverImage, product.image3, product.image4].filter(Boolean);

    useEffect(() => {
        setSelectedImage(currentImages[0] || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSizeIdx]);

    const handleAddToCart = async () => {
        try {
            if (isSelectedSizeOut) return;
            setButtonLoading(true);
            await new Promise(res => setTimeout(res, 600)); // Simulate loading
            addToCart({ ...product, quantity, selectedSize });
            setButtonLoading(false);
            setShowToast(true);
            // Delay modal close so toast can show
            setTimeout(() => {
                setShowToast(false);
                onClose();
            }, 2000); // 2 seconds toast visibility before closing
        } catch (error) {
            setButtonLoading(false);
            console.error('Add to cart error:', error);
        }
    };

    const handleQuantityChange = (delta) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    const handleQuantityInput = (e) => {
        const value = parseInt(e.target.value) || 1;
        setQuantity(Math.max(1, value));
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <>
            {/* Premium Backdrop */}
            <div
                className="qv-backdrop"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="qv-modal">
                <div className="qv-dialog">
                    <div className="qv-content">
                        {/* Close Button */}
                        <button
                            type="button"
                            className="qv-close-btn"
                            onClick={onClose}
                        >
                            ×
                        </button>

                        <div className="qv-body">
                            <div className="qv-layout">
                                {/* Image Section */}
                                <div className="qv-gallery">
                                    <div className="qv-image-container">
                                        {/* Main Image */}
                                        <div className="qv-main-image">
                                            <img
                                                src={selectedImage}
                                                alt={product.name}
                                                className="qv-product-image"
                                            />
                                        </div>

                                        {/* Badge */}
                                        {product.badge && (
                                            <div className="qv-badge">
                                                <span className={`qv-badge-text ${product.badge.includes('NEW') ? 'new' : 'sale'}`}>
                                                    {product.badge}
                                                </span>
                                            </div>
                                        )}

                                        {/* Image Navigation */}
                                        <div className="qv-nav-dots">
                                            {currentImages.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedImage(img)}
                                                    className={`qv-nav-dot ${selectedImage === img ? 'active' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Thumbnails */}
                                    <div className="qv-thumbnails">
                                        {currentImages.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className={`qv-thumbnail ${selectedImage === img ? 'active' : ''}`}
                                            >
                                                <img
                                                    src={img}
                                                    alt="thumb"
                                                    className="qv-thumbnail-img"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="qv-details">
                                    <div className="qv-content-wrapper">
                                        {/* Title */}
                                        <div className="qv-header">
                                            <h1 className="qv-title">{product.brand}</h1>
                                            <h1 className="qv-title">{product.name}</h1>
                                        </div>

                                        {/* Price */}
                                        <div className="qv-price">
                                            <span className="qv-current-price">₹{formatPrice(selectedSize.price)}</span>
                                            {selectedSize.oldPrice && (
                                                <span className="qv-old-price">₹{formatPrice(selectedSize.oldPrice)}</span>
                                            )}
                                        </div>

                                        {/* Sizes */}
                                        {sizesArr.length > 1 && (
                                            <div className="qv-sizes">
                                                <h3 className="qv-sizes-title">Select Size</h3>
                                                <div className="qv-size-grid">
                                                    {sizesArr.map((sz, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setSelectedSizeIdx(idx)}
                                                className={`qv-size-btn ${selectedSizeIdx === idx ? 'active' : ''} ${sz.isOutOfStock ? 'disabled' : ''}`}
                                                disabled={sz.isOutOfStock}
                                                        >
                                                            <span className="qv-size-name">{sz.size}</span>
                                                            {sz.price && (
                                                                <span className="qv-size-price">₹{formatPrice(sz.price)}</span>
                                                            )}
                                                {sz.isOutOfStock && (
                                                    <span className="qv-size-status">Out of Stock</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Quantity */}
                                        <div className="qv-quantity">
                                            <label>Quantity</label>
                                            <div className="qv-quantity-controls">
                                                <button
                                                    onClick={() => handleQuantityChange(-1)}
                                                    className="qv-qty-btn"
                                                    disabled={quantity <= 1}
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={handleQuantityInput}
                                                    min="1"
                                                    className="qv-qty-input"
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(1)}
                                                    className="qv-qty-btn"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {product.data && (
                                            <div className="qv-description">
                                                <h3>Description</h3>
                                                <p style={{ whiteSpace: "pre-line" }}>
                                                    {truncatedDescription || 'No description available.'}
                                                </p>
                                                {shouldTruncate && (
                                                    <button
                                                        type="button"
                                                        className="qv-read-more"
                                                        onClick={() => {
                                                            onClose();
                                                            if (product.id) {
                                                                window.location.href = `/product/${product.id}`;
                                                            }
                                                        }}
                                                    >
                                                        Read More
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Wishlist and Add to Cart */}
                                        <div className="qv-actions">
                                            <WishlistButton
                                                product={product}
                                                size="large"
                                                showText={true}
                                                className="qv-wishlist-btn"
                                            />
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={buttonLoading || isSelectedSizeOut}
                                                className="tf-btn btn-fill animate-btn type-large text-uppercase text-decoration-none"
                                            >
                                                {isSelectedSizeOut ? (
                                                    'Out of Stock'
                                                ) : buttonLoading ? (
                                                    <>
                                                        <span className="qv-spinner"></span>
                                                        Adding...
                                                    </>
                                                ) : (
                                                    `Add to Cart — ₹${formatPrice(selectedSize.price * quantity)}`
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="qv-toast">
                    <div className="qv-toast-content">
                        <div className="qv-toast-body">
                            <div className="qv-toast-icon-wrapper">
                                <svg className="qv-toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="qv-toast-text">
                                <div className="qv-toast-title">Successfully Added!</div>
                                <div className="qv-toast-subtitle">Product has been added to your cart</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="qv-toast-close"
                            onClick={() => setShowToast(false)}
                            aria-label="Close notification"
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Premium CSS Styles */}
            <style jsx>{`
                /* Backdrop */
                .qv-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    z-index: 1040;
                    animation: qvFadeIn 0.3s ease;
                }

                /* Modal */
                .qv-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1050;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .qv-dialog {
                    width: 100%;
                    max-width: 1000px;
                    max-height: 90vh;
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                    animation: qvSlideIn 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .qv-content {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                }

                /* Close Button */
                .qv-close-btn {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    z-index: 1060;
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid #eee;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    color: #333;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .qv-close-btn:hover {
                    background: #fff;
                    transform: scale(1.1);
                }

                /* Body */
                .qv-body {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .qv-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    height: 100%;
                    max-height: 90vh;
                    flex: 1;
                }

                /* Gallery */
                .qv-gallery {
                    display: flex;
                    flex-direction: column;
                    background: #fafafa;
                    position: relative;
                }

                .qv-image-container {
                    flex: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    min-height: 400px;
                }

                .qv-main-image {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 320px;
                }

                .qv-product-image {
                    width: 400px;
                    height: 400px;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .qv-product-image:hover {
                    transform: scale(1.02);
                }

                /* Badge */
                .qv-badge {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    z-index: 10;
                }

                .qv-badge-text {
                    padding: 4px 10px;
                    font-size: 11px;
                    font-weight: 600;
                    border-radius: 3px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .qv-badge-text.new {
                    background: #640d14;
                    color: #fff;
                }

                .qv-badge-text.sale {
                    background: #e74c3c;
                    color: #fff;
                }

                /* Navigation Dots */
                .qv-nav-dots {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 8px;
                }

                .qv-nav-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    background: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .qv-nav-dot.active {
                    background: #640d14;
                    border-color: #640d14;
                }

                /* Thumbnails */
                .qv-thumbnails {
                    display: flex;
                    gap: 8px;
                    padding: 16px;
                    justify-content: center;
                    background: #fff;
                    border-top: 1px solid #eee;
                }

                .qv-thumbnail {
                    width: 60px;
                    height: 60px;
                    border: 1px solid #eee;
                    border-radius: 4px;
                    overflow: hidden;
                    background: #fff;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    padding: 0;
                    flex-shrink: 0;
                }

                .qv-thumbnail-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .qv-thumbnail.active {
                    border-color: #640d14;
                }

                .qv-thumbnail:hover {
                    border-color: #640d14;
                    transform: translateY(-1px);
                }

                /* Details */
                .qv-details {
                    display: flex;
                    flex-direction: column;
                    background: #fff;
                    overflow-y: auto;
                    flex: 1;
                    min-height: 0;
                }

                .qv-content-wrapper {
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    min-height: 100%;
                }

                /* Header */
                .qv-header {
                    margin-bottom: 8px;
                }

                .qv-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                    line-height: 1.2;
                }

                /* Price */
                .qv-price {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .qv-current-price {
                    font-size: 20px;
                    font-weight: 700;
                    color: #640d14;
                }

                .qv-old-price {
                    font-size: 14px;
                    text-decoration: line-through;
                    color: #999;
                }

                /* Sizes */
                .qv-sizes {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .qv-sizes-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .qv-size-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .qv-size-btn {
                    min-width: 80px;
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: #fff;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }

                .qv-size-btn:hover {
                    border-color: #640d14;
                    transform: translateY(-1px);
                }

                .qv-size-btn.active {
                    border-color: #640d14;
                    background: #640d14;
                    color: #fff;
                }

                .qv-size-name {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .qv-size-price {
                    font-size: 10px;
                    opacity: 0.8;
                }

                /* Quantity */
                .qv-quantity {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .qv-quantity label {
                    font-weight: 600;
                    color: #333;
                    font-size: 13px;
                    min-width: 60px;
                }

                .qv-quantity-controls {
                    display: flex;
                    align-items: center;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    overflow: hidden;
                    background: #fff;
                }

                .qv-qty-btn {
                    background: #f8f9fa;
                    border: none;
                    padding: 8px 10px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                    min-width: 36px;
                }

                .qv-qty-btn:hover:not(:disabled) {
                    background: #e9ecef;
                }

                .qv-qty-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .qv-qty-input {
                    width: 45px;
                    text-align: center;
                    border: none;
                    padding: 8px 4px;
                    font-size: 13px;
                    background: #fff;
                }

                .qv-qty-input:focus {
                    outline: none;
                }

                /* Description */
                .qv-description h3 {
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 8px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .qv-description p {
                    color: #555;
                    line-height: 1.5;
                    margin: 0;
                    font-size: 13px;
                }

                /* Actions Container */
                .qv-actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                /* Wishlist Button in QuickView */
                .qv-wishlist-btn {
                    background: transparent;
                    border: 2px solid #640d14;
                    color: #640d14;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    min-width: 120px;
                }

                .qv-wishlist-btn:hover {
                    background: #640d14;
                    color: white;
                    transform: translateY(-2px);
                }

                .qv-wishlist-btn.in-wishlist {
                    background: #640d14;
                    color: white;
                }

                /* Add to Cart Button */
                .qv-cart-btn {
                    background: #640d14;
                    color: #fff;
                    padding: 12px 16px;
                    font-size: 13px;
                    font-weight: 600;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .qv-cart-btn:hover:not(:disabled) {
                    background: #4a0a0f;
                }

                .qv-cart-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }

                .qv-spinner {
                    width: 12px;
                    height: 12px;
                    border: 2px solid transparent;
                    border-top: 2px solid #fff;
                    border-radius: 50%;
                    animation: qvSpin 1s linear infinite;
                }

                /* Toast */
                .qv-toast {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    z-index: 1070;
                    animation: qvToastSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                .qv-toast-content {
                    background: linear-gradient(135deg, #640d14 0%, #9b7645 100%);
                    color: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(100, 13, 20, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    max-width: 400px;
                    min-width: 320px;
                }

                .qv-toast-body {
                    display: flex;
                    align-items: center;
                    padding: 20px;
                    gap: 16px;
                }

                .qv-toast-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .qv-toast-icon {
                    width: 24px;
                    height: 24px;
                    color: white;
                }

                .qv-toast-text {
                    flex: 1;
                    min-width: 0;
                }

                .qv-toast-title {
                    font-weight: 600;
                    font-size: 16px;
                    line-height: 1.4;
                    margin-bottom: 4px;
                }

                .qv-toast-subtitle {
                    font-size: 14px;
                    opacity: 0.9;
                    line-height: 1.3;
                }

                .qv-toast-close {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 8px;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .qv-toast-close svg {
                    width: 16px;
                    height: 16px;
                }

                .qv-toast-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }

                /* Animations */
                @keyframes qvFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes qvSlideIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(-20px) scale(0.98); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }

                @keyframes qvSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes qvToastSlideIn {
                    from { 
                        opacity: 0; 
                        transform: translateX(100%) scale(0.8); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(0) scale(1); 
                    }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .qv-modal {
                        padding: 10px;
                        align-items: flex-start;
                        padding-top: 20px;
                    }

                    .qv-dialog {
                        max-height: 95vh;
                        height: 95vh;
                    }

                    .qv-layout {
                        grid-template-columns: 1fr;
                        height: 100%;
                        max-height: none;
                    }

                    .qv-gallery {
                        height: 40vh;
                        min-height: 300px;
                        flex-shrink: 0;
                    }

                    .qv-image-container {
                        padding: 20px;
                        min-height: 250px;
                    }

                    .qv-main-image {
                        min-height: 200px;
                    }

                    .qv-product-image {
                        width: 200px;
                        height: 200px;
                        object-fit: cover;
                    }

                    .qv-thumbnails {
                        padding: 12px;
                    }

                    .qv-thumbnail {
                        width: 50px;
                        height: 50px;
                    }

                    .qv-details {
                        height: 55vh;
                        overflow-y: auto;
                    }

                    .qv-content-wrapper {
                        padding: 20px;
                        gap: 16px;
                        padding-bottom: 100px;
                    }

                    .qv-title {
                        font-size: 20px;
                    }

                    .qv-current-price {
                        font-size: 18px;
                    }

                    .qv-size-btn {
                        min-width: 70px;
                        padding: 8px 10px;
                    }

                    .qv-cart-btn {
                        position: sticky;
                        bottom: 0;
                        margin-top: auto;
                        border-radius: 0;
                        z-index: 10;
                    }
                }

                @media (max-width: 480px) {
                    .qv-modal {
                        padding: 5px;
                        align-items: flex-start;
                        padding-top: 10px;
                    }

                    .qv-dialog {
                        height: 98vh;
                        max-height: 98vh;
                    }

                    .qv-gallery {
                        height: 35vh;
                        min-height: 250px;
                    }

                    .qv-image-container {
                        padding: 16px;
                        min-height: 200px;
                    }

                    .qv-main-image {
                        min-height: 180px;
                    }

                    .qv-product-image {
                        width: 250px;
                        height: 200px;
                        object-fit: cover;
                    }

                    .qv-details {
                        height: 60vh;
                        overflow-y: auto;
                    }

                    .qv-content-wrapper {
                        padding: 16px;
                        gap: 14px;
                        padding-bottom: 80px;
                    }

                    .qv-title {
                        font-size: 18px;
                    }

                    .qv-current-price {
                        font-size: 16px;
                    }

                    .qv-close-btn {
                        top: 12px;
                        right: 12px;
                        width: 32px;
                        height: 32px;
                        font-size: 16px;
                    }

                    .qv-thumbnail {
                        width: 40px;
                        height: 40px;
                    }

                    .qv-cart-btn {
                        position: sticky;
                        bottom: 0;
                        margin-top: auto;
                        border-radius: 0;
                        z-index: 10;
                        font-size: 12px;
                        padding: 10px 12px;
                    }
                }
            `}</style>
        </>
    );
}

export default QuickView;
