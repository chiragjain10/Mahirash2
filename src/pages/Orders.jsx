import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../components/firebase';
import { Link, useLocation } from 'react-router-dom';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal
  const location = useLocation();
  const successState = location.state && location.state.orderId ? location.state : null;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!auth.currentUser) return;
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="orders-container"><div className="orders-loading">Loading orders...</div></div>;

  if (orders.length === 0) {
    return (
      <div className="text-center p-5">
        <h3>No orders found</h3>
        <Link to="/category" className="btn btn-primary mt-3">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">My Orders</h2>

      {successState && (
        <div className="order-success-banner">
          <div className="order-success-icon">✔</div>
          <div className="order-success-content">
            <div className="order-success-heading">Order placed successfully!</div>
            <div className="order-success-sub">
              Order <span className="order-id">#{successState.orderId}</span> — ₹{Number(successState.total).toFixed(2)} — {successState.items} items
            </div>
            <div className="order-success-email">
              Confirmation sent to <strong>{successState.email}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <h4>Order #{order.id}</h4>
              <span className={`order-status ${order.status}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="order-body">
              <p><strong>Date:</strong> {order.createdAt?.toDate().toLocaleString()}</p>
              <p><strong>Total:</strong> ₹{Number(order.total).toFixed(2)}</p>
              <p><strong>Items:</strong> {order.items.length}</p>
              <button
                onClick={() => setSelectedOrder(order)}
                className="order-view-btn"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Popup */}
      {selectedOrder && (
        <div className="orders-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
            <div className="orders-modal-header">
              <h4>Order Details</h4>
              <button className="orders-modal-close" onClick={() => setSelectedOrder(null)}>✖</button>
            </div>

            <div className="orders-modal-body">
              <div className="orders-modal-grid">
                <div>
                  <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Date:</strong> {selectedOrder.createdAt?.toDate().toLocaleString()}</p>
                </div>
                <div className="orders-modal-total">
                  <div>Total</div>
                  <div className="orders-modal-total-value">₹{Number(selectedOrder.total).toFixed(2)}</div>
                </div>
              </div>

              <div className="orders-items">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="orders-item-row">
                    <div className="orders-item-info">
                      <div className="orders-item-name">{item.name}</div>
                      {item.selectedSize?.size && (
                        <div className="orders-item-meta">Size: {item.selectedSize.size}</div>
                      )}
                      <div className="orders-item-meta">Qty: {item.quantity}</div>
                    </div>
                    <div className="orders-item-price">₹{Number(item.selectedSize?.price || item.price).toFixed(2)} × {item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="orders-modal-footer">
              <button
                className="orders-modal-close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
