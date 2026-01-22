import React, { useState, useEffect  } from 'react';
import { useCart } from '../context/CartContext';
import { auth, db } from './firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, setDoc, runTransaction, getDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import './Checkout.css';
// Load RazorPay script dynamically
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [giftPackaging, setGiftPackaging] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, []);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Calculate totals
  const subtotal = getCartTotal();
  const shippingCost = subtotal >= 1000 ? 0 : 100;
  const giftCost = giftPackaging ? 100 : 0;
  const total = subtotal + shippingCost + giftCost;

  // Adjust product inventory per-size using a transaction
  const adjustInventoryForOrder = async (items) => {
    for (const item of items) {
      const productId = item.id;
      const sizeKey = item.selectedSize && item.selectedSize.size ? item.selectedSize.size : '';
      const qty = Number(item.quantity || 1);
      if (!productId || !sizeKey || qty <= 0) continue;

      const productRef = doc(db, 'products', productId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(productRef);
        if (!snap.exists()) return;
        const data = snap.data();
        const sizes = Array.isArray(data.sizes) ? [...data.sizes] : [];
        const idx = sizes.findIndex(s => (s?.size || '') === sizeKey);
        if (idx === -1) return;
        const currentStock = Number(sizes[idx]?.stock || 0);
        const newStock = Math.max(0, currentStock - qty);
        sizes[idx] = {
          ...sizes[idx],
          stock: newStock,
          isOutOfStock: !!sizes[idx].isOutOfStock || newStock <= 0,
        };
        const productOut = (sizes.length > 0 && sizes.every(sz => (!!sz.isOutOfStock || Number(sz.stock || 0) <= 0)));
        transaction.update(productRef, { sizes, isOutOfStock: productOut });
      });
    }
  };

  // Save order to Firebase
  const saveOrderToFirebase = async (paymentId = 'pending', status = 'pending') => {
    const orderData = {
      customerInfo: formData,
      items: cartItems,
      subtotal,
      shippingCost,
      giftCost,
      total,
      paymentMethod: 'razorpay',
      paymentId,
      status,
      createdAt: serverTimestamp(),
      userId: auth.currentUser ? auth.currentUser.uid : null,
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return docRef.id;
  };

  // Update order status after payment with retry and merge write
  const updateOrderStatus = async (orderId, paymentId, status) => {
    const orderRef = doc(db, 'orders', orderId);

    const performWrite = async () => {
      await setDoc(
        orderRef,
        { paymentId, status, updatedAt: serverTimestamp() },
        { merge: true }
      );
    };

    const maxAttempts = 3;
    let attempt = 0;
    let lastError = null;
    while (attempt < maxAttempts) {
      try {
        await performWrite();
        return;
      } catch (err) {
        lastError = err;
        const backoffMs = 300 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoffMs));
        attempt += 1;
      }
    }
    throw lastError;
  };

  // Send confirmation email (simulation)
  const sendConfirmationEmail = async (orderId, customerEmail) => {
    console.log(`Simulating confirmation email for order ${orderId} sent to ${customerEmail}`);
    return Promise.resolve();
  };

  // Handle RazorPay payment
  const handleRazorPayPayment = async () => {
    try {
      const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

      if (!res) {
        alert('Failed to load Razorpay SDK. Please check your connection.');
        return;
      }

      // Step 1: Create order in Firestore with pending status
      const orderId = await saveOrderToFirebase();

      // Step 2: Open Razorpay checkout
      const options = {
        key: 'rzp_test_RGG6VGd5HyFl0E', // Replace with your Razorpay Key
        amount: total * 100,
        currency: 'INR',
        name: 'Mahirash',
        description: 'Order Payment',
        handler: async function (response) {
          try {
            const paymentId = response.razorpay_payment_id;

            // Update order with payment ID & status
            try {
              await updateOrderStatus(orderId, paymentId, 'paid');
            } catch (err) {
              // Persist a best-effort record locally for later reconciliation
              try {
                const queue = JSON.parse(localStorage.getItem('orderUpdateQueue') || '[]');
                queue.push({ orderId, paymentId, status: 'paid', ts: Date.now() });
                localStorage.setItem('orderUpdateQueue', JSON.stringify(queue));
              } catch (_) {}
              console.warn('Payment captured, but deferred order update will retry later.', err);
            }

            // Record payment document
            try {
              await addDoc(collection(db, 'payments'), {
                orderId,
                paymentId,
                amount: total,
                currency: 'INR',
                method: 'razorpay',
                status: 'captured',
                createdAt: serverTimestamp(),
                userId: auth.currentUser ? auth.currentUser.uid : null,
              });
            } catch (_) {}

            // Decrement stock per size
            try {
              await adjustInventoryForOrder(cartItems);
            } catch (err) {
              console.warn('Payment captured, but failed to update stock immediately. Will require manual reconciliation.', err);
            }

            // Simulate sending confirmation email
            await sendConfirmationEmail(orderId, formData.email);

            // Best-effort backend sync (non-blocking)
            try {
              const payload = {
                orderId,
                paymentId,
                status: 'paid',
                totals: { subtotal, shippingCost, giftCost, total },
                customer: formData,
                items: cartItems,
                userId: auth.currentUser ? auth.currentUser.uid : null,
              };
              fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true,
              }).catch(() => {});
            } catch (_) {}

            // Clear cart & redirect
            clearCart();
            navigate('/orders', {
              state: {
                orderId,
                total,
                items: cartItems.length,
                email: formData.email,
              },
            });
          } catch (error) {
            console.error('Error updating order:', error);
            alert('Payment captured. Syncing your order may take a moment.');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: async () => {
            try {
              await updateOrderStatus(orderId, 'cancelled', 'cancelled');
            } catch (err) {
              console.warn('Failed to mark order as cancelled immediately; will retry later.', err);
            }
            alert('Payment was cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('RazorPay error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleRazorPayPayment();
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛒</div>
          <div className="checkout-empty-text">Your cart is empty</div>
          <Link to="/category" className="checkout-empty-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-uppercase">Checkout</h2>
        <div
          className="mx-auto mt-3"
          style={{
            width: '60px',
            height: '4px',
            backgroundColor: 'black',
            borderRadius: '2px',
          }}
        ></div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="checkout-content">
          {/* Left column - Customer Info */}
          <div className="checkout-info">
            {/* Contact Information */}
            <div className="checkout-section">
              <h3 className="checkout-section-title">Contact Information</h3>
              <div className="checkout-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="checkout-section">
              <h3 className="checkout-section-title">Shipping Address</h3>
              {/* Name */}
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="checkout-form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="checkout-form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* City / State */}
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="checkout-form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Zip / Country */}
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="checkout-form-group">
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div className="checkout-form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Payment Method (Only Razorpay now) */}
            <div className="checkout-section">
              <h3 className="checkout-section-title">Payment Method</h3>
              <div className="checkout-payment-methods">
                <div className="checkout-payment-method active">
                  <div className="checkout-payment-header">
                    <input type="radio" checked readOnly />
                    <span>Pay with RazorPay</span>
                    <img
                      src="/images/payment/razorpay.svg"
                      alt="RazorPay"
                      className="checkout-method-icon"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Order Summary */}
          <div className="checkout-summary">
            <h3 className="checkout-summary-title">Order Summary</h3>

            <div className="checkout-order-items">
              {cartItems.map((item) => {
                const price =
                  item.selectedSize && item.selectedSize.price
                    ? item.selectedSize.price
                    : item.price;
                const sizeLabel =
                  item.selectedSize && item.selectedSize.size
                    ? item.selectedSize.size
                    : '';
                const displayImage = (() => {
                  if (
                    item.selectedSize &&
                    Array.isArray(item.selectedSize.images) &&
                    item.selectedSize.images[0]
                  )
                    return item.selectedSize.images[0];
                  if (
                    Array.isArray(item.sizes) &&
                    item.sizes[0] &&
                    Array.isArray(item.sizes[0].images) &&
                    item.sizes[0].images[0]
                  )
                    return item.sizes[0].images[0];
                  return item.image;
                })();

                return (
                  <div key={item.cartItemId} className="checkout-order-item">
                    <img
                      src={displayImage}
                      alt={item.name}
                      className="checkout-item-image"
                    />
                    <div className="checkout-item-details">
                      <div className="checkout-item-name">{item.name}</div>
                      {sizeLabel && (
                        <div className="checkout-item-size">
                          Size: {sizeLabel}
                        </div>
                      )}
                      <div className="checkout-item-quantity">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="checkout-item-price">
                      ₹{(price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="checkout-summary-details">
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}
                </span>
              </div>
              {giftPackaging && (
                <div className="checkout-summary-row">
                  <span>Gift Packaging</span>
                  <span>₹100.00</span>
                </div>
              )}
              <div className="checkout-summary-row checkout-summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout-gift-option">
              <div className="checkout-checkbox">
                <input
                  id="checkout-gift"
                  type="checkbox"
                  checked={giftPackaging}
                  onChange={() => setGiftPackaging(!giftPackaging)}
                />
                <label htmlFor="checkout-gift">
                  Add gift packaging (₹100.00)
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="tf-btn btn-fill animate-btn type-large text-uppercase text-decoration-none checkout-submit-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
            </button>

            <div className="checkout-security">
              <div className="checkout-security-icon">🔒</div>
              <div className="checkout-security-text">
                Your payment details are securely encrypted and processed. We do
                not store your credit card information.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
