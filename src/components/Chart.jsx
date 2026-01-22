import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { auth } from './firebase';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Chart.css';

function Chart() {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, isLoading } = useCart();
    const navigate = useNavigate();
    const [giftPackaging, setGiftPackaging] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    // console.log("Current User UID:", auth.currentUser?.uid);
    const handleQuantityChange = (id, delta, sizeLabel) => {
        updateQuantity(id, delta, sizeLabel);
    };

    const handleRemove = (id, sizeLabel) => {
        removeFromCart(id, sizeLabel);
    };

    const handleRemoveAll = () => {
        cartItems.forEach(item => {
            removeFromCart(item.cartItemId);
        });
    };

    const handleGiftChange = () => {
        setGiftPackaging(!giftPackaging);
    };
    const handleTermsChange = (e) => {
        setAgreeTerms(e.target.checked);
    };

    const handleCheckout = () => {
        if (!agreeTerms) {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000); // hide after 3s
            return;
        }
        navigate('/checkout');
    };

    if (isLoading) {
        return <div className="chart-container"><div className="chart-loading">Loading...</div></div>;
    }
    if (!cartItems) {
        return <div className="chart-container"><div className="chart-error">Error loading cart. Please try again.</div></div>;
    }

    if (cartItems.length === 0) {
        return (
            <div className="chart-container">
                <div className="chart-empty">
                    <div className="chart-empty-icon">🛒</div>
                    <div className="chart-empty-text">Your cart is empty</div>
                    <Link to="/category" className="chart-empty-btn">Continue Shopping</Link>
                </div>
            </div>
        );
    }

    // Helper function to safely format price
    const formatPrice = (price) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    const getSubtotal = (price, quantity) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return (isNaN(numPrice) ? 0 : numPrice) * quantity;
    };

    const totalPrice = getCartTotal() + (giftPackaging ? 100 : 0);

    return (
        <div className="chart-container">
            <div className="text-center mb-5 ">
                <h2 className="fw-bold text-uppercase">Shopping Cart</h2>
                <div className="mx-auto mt-3" style={{ width: '60px', height: '4px', backgroundColor: 'black', borderRadius: '2px' }}></div>
            </div>

            <div className="chart-content">
                {/* Cart Table */}
                <div className="chart-table">
                    <div className="chart-table-header">
                        <h3>Cart Items ({cartItems.length})</h3>
                        {cartItems.length > 0 && (
                            <button
                                className="chart-remove-all-btn"
                                onClick={handleRemoveAll}
                            >
                                Remove All
                            </button>
                        )}
                    </div>
                    <div className="chart-table-content">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map(item => {
                                    const price = item.selectedSize && item.selectedSize.price ? item.selectedSize.price : item.price;
                                    const sizeLabel = item.selectedSize && item.selectedSize.size ? item.selectedSize.size : '';
                                    const displayImage = (() => {
                                        if (item.selectedSize && Array.isArray(item.selectedSize.images) && item.selectedSize.images[0]) return item.selectedSize.images[0];
                                        if (Array.isArray(item.sizes) && item.sizes[0] && Array.isArray(item.sizes[0].images) && item.sizes[0].images[0]) return item.sizes[0].images[0];
                                        return item.image;
                                    })();
                                    return (
                                        <tr key={item.cartItemId}>
                                            <td>
                                                <div className="chart-product">
                                                    <img
                                                        src={displayImage}
                                                        alt={item.name}
                                                        className="chart-product-image"
                                                    />
                                                    <div className="chart-product-info">
                                                        <span className="chart-product-name">
                                                            {item.name}
                                                            {sizeLabel && (
                                                                <span className="chart-product-size">
                                                                    ({sizeLabel})
                                                                </span>
                                                            )}
                                                        </span>
                                                        <p className="chart-product-type">{item.type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="chart-price">₹{formatPrice(price)}</td>
                                            <td>
                                                <div className="cart-quantity-wrapper">
  <div className="cart-quantity-box">
    <button
      className="cart-btn"
      onClick={() => updateQuantity(item.cartItemId, -1)}
      aria-label="Decrease quantity"
    >
      −
    </button>
    <input
      className="cart-input"
      type="text"
      value={item.quantity}
      readOnly
      aria-label="Item quantity"
    />
    <button
      className="cart-btn"
      onClick={() => updateQuantity(item.cartItemId, 1)}
      aria-label="Increase quantity"
    >
      +
    </button>

    {/* Remove button placed here for mobile positioning */}
    <button
      className="cart-remove-btn cart-remove-btn-mobile"
      onClick={() => removeFromCart(item.cartItemId)}
    >
      ✕
    </button>
  </div>

  {/* Desktop version of Remove button */}
  <button
    className="cart-remove-btn cart-remove-btn-desktop"
    onClick={() => removeFromCart(item.cartItemId)}
  >
    Remove
  </button>
</div>

                                            </td>
                                            <td className="chart-subtotal">
                                                ₹{formatPrice(price * item.quantity)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="chart-sidebar">
                    <div className="chart-summary">
                        <h3 className="chart-summary-title">Order Summary</h3>

                        <div className="chart-summary-row">
                            <span className="chart-summary-label">Subtotal</span>
                            <span className="chart-summary-value">₹{formatPrice(getCartTotal())}</span>
                        </div>

                        {giftPackaging && (
                            <div className="chart-summary-row">
                                <span className="chart-summary-label">Gift Packaging</span>
                                <span className="chart-summary-value">₹100.00</span>
                            </div>
                        )}

                        <div className="chart-summary-row">
                            <span className="chart-summary-label">Total</span>
                            <span className="chart-summary-value">₹{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Gift Option */}
                    <div className="chart-term">
                        <div className="chart-checkbox">
                            <input
                                id="gift-packaging"
                                type="checkbox"
                                checked={giftPackaging}
                                onChange={handleGiftChange}
                            />
                            <label htmlFor="gift-packaging">Add gift packaging (₹100.00)</label>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="chart-terms">
                        <div className="chart-checkbox">
                            <input
                                id="agree-terms"
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={handleTermsChange}
                            />
                            <label htmlFor="agree-terms">I agree to the Terms and Conditions</label>
                        </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                        className="tf-btn btn-fill animate-btn type-large text-uppercase text-decoration-none"
                        onClick={handleCheckout}
                        disabled={!agreeTerms}
                    >
                        Proceed to Checkout
                    </button>

                    {showWarning && (
                        <div className="chart-warning">
                            Please agree to the Terms and Conditions before proceeding.
                        </div>
                    )}

                    {/* Payment Methods */}
                    <div className="chart-payment">
                        <p className="chart-payment-title">We accept</p>
                        <div className="chart-payment-methods">
                            <img src="/images/payment/visa-2.svg" alt="Visa" className="chart-payment-method" />
                            <img src="/images/payment/dinner-2.svg" alt="Diners Club" className="chart-payment-method" />
                            <img src="/images/payment/master-3.svg" alt="Mastercard" className="chart-payment-method" />
                            <img src="/images/payment/stripe.svg" alt="Stripe" className="chart-payment-method" />
                            <img src="/images/payment/paypal.svg" alt="PayPal" className="chart-payment-method" />
                            <img src="/images/payment/gg-pay-2.svg" alt="Google Pay" className="chart-payment-method" />
                            <img src="/images/payment/apple-pay-2.svg" alt="Apple Pay" className="chart-payment-method" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chart;
