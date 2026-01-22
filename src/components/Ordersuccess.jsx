// OrderSuccess.js
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './OrderSuccess.css';

function OrderSuccess() {
  const location = useLocation();
  const { orderId, total, items, email } = location.state || {};

  useEffect(() => {
    // You could send a confirmation email here if not already sent
  }, []);

  if (!orderId) {
    return (
      <div className="order-success-container">
        <div className="order-error">
          <h2>Order Not Found</h2>
          <p>We couldn't find your order details.</p>
          <Link to="/" className="btn-primary">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="order-success">
        <div className="success-icon">✓</div>
        <h2>Order Confirmed!</h2>
        <p>Your order has been successfully placed.</p>
        
        <div className="order-details">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> #{orderId}</p>
          <p><strong>Total Amount:</strong> ₹{total?.toFixed(2)}</p>
          <p><strong>Items:</strong> {items}</p>
          <p><strong>Confirmation sent to:</strong> {email}</p>
        </div>

        <div className="order-actions">
          <Link to="/" className="btn-primary">Continue Shopping</Link>
          <Link to="/orders" className="btn-secondary">View Orders</Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;