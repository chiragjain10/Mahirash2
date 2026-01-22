import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

function MiniCart() {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, isLoading } = useCart();
    const navigate = useNavigate();

    // Helper function to safely format price
    const formatPrice = (price) => {
        if (!price) return '0.00';
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    const handleViewCart = () => {
        // Close the offcanvas first
        const offcanvas = document.getElementById('shoppingCart');
        if (offcanvas) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        }
        // Navigate to chart page
        navigate('/chart');
    };

    const handleContinueShopping = () => {
        // Close the offcanvas first
        const offcanvas = document.getElementById('shoppingCart');
        if (offcanvas) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        }
        // Navigate to shop page
        navigate('/category');
    };

    if (isLoading) {
        return <div className="text-center my-5"><div className="spinner-border text-main" role="status"><span className="visually-hidden">Loading...</span></div></div>;
    }
    if (!cartItems) {
        return <div className="text-center my-5 text-danger">Error loading cart. Please try again.</div>;
    }

    return (
        <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="shoppingCart"
            aria-labelledby="shoppingCartLabel"
            style={{ width: '400px' }}
        >
            <div className="offcanvas-header border-bottom">
                <h5 className="offcanvas-title fw-medium" id="shoppingCartLabel">
                    <i className="icon icon-cart me-2"></i>
                    Shopping Cart
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>

            <div className="offcanvas-body d-flex flex-column p-0">
                {cartItems.length === 0 ? (
                    <div className="empty-cart text-center my-auto py-5 px-3">
                        <div className="mb-4">
                            <i className="icon icon-cart fs-1 text-main-5"></i>
                        </div>
                        <h6 className="text-main-3 mb-2">Your cart is empty</h6>
                        <p className="text-main-5 mb-4">Add some beautiful pieces to your collection</p>
                        <button 
                            onClick={handleContinueShopping}
                            className="tf-btn tf-btn-line"
                        >
                            <span className="text-caption lh-28">Start Shopping</span>
                            <i className="icon-arrow-top-right-2 fs-10"></i>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-grow-1 overflow-auto" style={{ padding: '20px' }}>
                            <div className="d-flex flex-column gap-3">
                                {cartItems.map((item) => {
                                    const price = item.selectedSize && item.selectedSize.price ? item.selectedSize.price : item.price;
                                    const sizeLabel = item.selectedSize && item.selectedSize.size ? item.selectedSize.size : '';
                                    return (
                                        <div key={item.cartItemId} className="d-flex align-items-start gap-3 border-bottom pb-3">
                                            <div style={{ width: '80px', flexShrink: 0 }}>
                                                <img
                                                    src={(item.selectedSize && Array.isArray(item.selectedSize.images) && item.selectedSize.images[0]) || (Array.isArray(item.sizes) && item.sizes[0] && Array.isArray(item.sizes[0].images) && item.sizes[0].images[0]) || item.image}
                                                    alt={item.name}
                                                    className="img-fluid rounded"
                                                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="fw-normal text-main mb-0" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                                        {item.name}
                                                        {sizeLabel && (
                                                            <span style={{ fontSize: '12px', color: '#640d14', marginLeft: 8 }}>
                                                                ({sizeLabel})
                                                            </span>
                                                        )}
                                                    </h6>
                                                    <button
                                                        className="btn btn-link text-danger p-0 ms-2"
                                                        onClick={() => removeFromCart(item.cartItemId)}
                                                        title="Remove"
                                                        style={{ fontSize: '12px', textDecoration: 'none', flexShrink: 0 }}
                                                    >
                                                        <i className="icon icon-trash"></i>
                                                    </button>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <button
                                                            className="btn btn-sm border-0 p-1"
                                                            onClick={() => updateQuantity(item.cartItemId, -1)}
                                                            style={{ background: 'transparent', color: 'var(--main-4)', fontSize: '16px', lineHeight: '1', padding: '2px 6px' }}
                                                        >
                                                            −
                                                        </button>
                                                        <span className="fw-medium text-main px-2" style={{ fontSize: '14px' }}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="btn btn-sm border-0 p-1"
                                                            onClick={() => updateQuantity(item.cartItemId, 1)}
                                                            style={{ background: 'transparent', color: 'var(--main-4)', fontSize: '16px', lineHeight: '1', padding: '2px 6px' }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <span className="text-dark fw-semibold" style={{ fontSize: '16px' }}>
                                                        ₹{formatPrice(price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-top p-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-main-3 fw-medium">Subtotal:</span>
                                <span className="text-dark fw-semibold h5 mb-0">
                                    ₹{formatPrice(cartItems.reduce((total, item) => {
                                        const price = item.selectedSize && item.selectedSize.price ? item.selectedSize.price : item.price;
                                        const safePrice = isNaN(parseFloat(price)) ? 0 : parseFloat(price);
                                        return total + (safePrice * item.quantity);
                                    }, 0))}
                                </span>
                            </div>
                            <div className="d-grid gap-2">
                                <button
                                    onClick={handleViewCart}
                                    className="tf-btn btn-fill animate-btn type-large text-uppercase text-decoration-none"
                                >
                                    <span className="text-caption lh-28">View Full Cart</span>
                                    <i className="icon-arrow-top-right-2 fs-10"></i>
                                </button>
                                <button
                                    onClick={handleContinueShopping}
                                    className="tf-btn btn-fill animate-btn type-large text-uppercase text-decoration-none"
                                >
                                    <span className="text-caption lh-28">Continue Shopping</span>
                                    <i className="icon-arrow-top-right-2 fs-10"></i>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Responsive styles */}
            <style jsx>{`
                @media (max-width: 576px) {
                    .offcanvas {
                        width: 100% !important;
                    }
                }
                @media (max-width: 768px) {
                    .offcanvas {
                        width: 350px !important;
                    }
                }
                @media (max-width: 480px) {
                    .offcanvas {
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default MiniCart;
