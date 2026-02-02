import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../components/firebase';
import { Link, useLocation } from 'react-router-dom';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal
  const [statusFilter, setStatusFilter] = useState('all'); // Filter by status
  const location = useLocation();
  const successState = location.state && location.state.orderId ? location.state : null;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }
        
        // Try with orderBy first, if it fails (no index), fetch without orderBy and sort manually
        let q;
        try {
          q = query(
            collection(db, 'orders'),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc')
          );
        } catch (indexError) {
          // If index doesn't exist, fetch without orderBy
          console.warn('Firestore index may not exist, fetching without orderBy:', indexError);
          q = query(
            collection(db, 'orders'),
            where('userId', '==', auth.currentUser.uid)
          );
        }
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const docData = doc.data();
          // Handle date conversion properly
          let createdAt = null;
          if (docData.createdAt) {
            if (docData.createdAt.toDate && typeof docData.createdAt.toDate === 'function') {
              createdAt = docData.createdAt.toDate();
            } else if (docData.createdAt instanceof Date) {
              createdAt = docData.createdAt;
            } else if (docData.createdAt.seconds) {
              createdAt = new Date(docData.createdAt.seconds * 1000);
            }
          }
          return {
            id: doc.id,
            ...docData,
            createdAt,
          };
        });
        
        // Sort by date if we didn't use orderBy
        if (!data[0]?.createdAt || data.some(o => !o.createdAt)) {
          // If some dates are missing, sort by ID (newer IDs come first in Firestore)
          data.sort((a, b) => b.id.localeCompare(a.id));
        } else {
          data.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt.getTime() - a.createdAt.getTime();
          });
        }
        
        console.log('Orders fetched successfully:', data.length, 'orders');
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Try to fetch without orderBy as fallback
        try {
          if (auth.currentUser) {
            const fallbackQuery = query(
              collection(db, 'orders'),
              where('userId', '==', auth.currentUser.uid)
            );
            const snapshot = await getDocs(fallbackQuery);
            const data = snapshot.docs.map(doc => {
              const docData = doc.data();
              let createdAt = null;
              if (docData.createdAt) {
                if (docData.createdAt.toDate && typeof docData.createdAt.toDate === 'function') {
                  createdAt = docData.createdAt.toDate();
                } else if (docData.createdAt instanceof Date) {
                  createdAt = docData.createdAt;
                } else if (docData.createdAt.seconds) {
                  createdAt = new Date(docData.createdAt.seconds * 1000);
                }
              }
              return {
                id: doc.id,
                ...docData,
                createdAt,
              };
            });
            data.sort((a, b) => {
              if (!a.createdAt && !b.createdAt) return b.id.localeCompare(a.id);
              if (!a.createdAt) return 1;
              if (!b.createdAt) return -1;
              return b.createdAt.getTime() - a.createdAt.getTime();
            });
            setOrders(data);
          }
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="orders-container"><div className="orders-loading">Loading orders...</div></div>;

  // Filter orders by status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => {
        const status = (order.status || 'pending').toLowerCase();
        if (statusFilter === 'confirmed') {
          return status === 'paid' || status === 'completed';
        }
        return status === statusFilter.toLowerCase();
      });

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => (o.status || 'pending').toLowerCase() === 'pending').length,
      confirmed: orders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s === 'paid' || s === 'completed';
      }).length,
      cancelled: orders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s === 'cancelled' || s === 'failed';
      }).length,
    };
  };

  const statusCounts = getStatusCounts();

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

      {/* Status Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setStatusFilter('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid',
            borderColor: statusFilter === 'all' ? '#667eea' : '#e5e7eb',
            background: statusFilter === 'all' ? '#667eea' : 'white',
            color: statusFilter === 'all' ? 'white' : '#6b7280',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid',
            borderColor: statusFilter === 'pending' ? '#f59e0b' : '#e5e7eb',
            background: statusFilter === 'pending' ? '#fef3c7' : 'white',
            color: statusFilter === 'pending' ? '#f59e0b' : '#6b7280',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Pending ({statusCounts.pending})
        </button>
        <button
          onClick={() => setStatusFilter('confirmed')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid',
            borderColor: statusFilter === 'confirmed' ? '#10b981' : '#e5e7eb',
            background: statusFilter === 'confirmed' ? '#dcfce7' : 'white',
            color: statusFilter === 'confirmed' ? '#10b981' : '#6b7280',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Confirmed ({statusCounts.confirmed})
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid',
            borderColor: statusFilter === 'cancelled' ? '#ef4444' : '#e5e7eb',
            background: statusFilter === 'cancelled' ? '#fee2e2' : 'white',
            color: statusFilter === 'cancelled' ? '#ef4444' : '#6b7280',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Cancelled ({statusCounts.cancelled})
        </button>
      </div>

      {loading ? (
        <div className="orders-loading">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center p-5">
          <h3>No {statusFilter !== 'all' ? statusFilter : ''} orders found</h3>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              View All Orders
            </button>
          )}
          {orders.length === 0 && (
            <Link to="/category" className="btn btn-primary mt-3" style={{ display: 'inline-block' }}>
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <h4>Order #{order.id}</h4>
              <span 
                className={`order-status ${order.status || 'pending'}`}
                style={{
                  backgroundColor: order.status === 'paid' || order.status === 'completed' 
                    ? '#dcfce7' 
                    : order.status === 'pending' 
                    ? '#fef3c7' 
                    : order.status === 'cancelled' || order.status === 'failed'
                    ? '#fee2e2'
                    : '#f3f4f6',
                  color: order.status === 'paid' || order.status === 'completed'
                    ? '#10b981'
                    : order.status === 'pending'
                    ? '#f59e0b'
                    : order.status === 'cancelled' || order.status === 'failed'
                    ? '#ef4444'
                    : '#6b7280',
                }}
              >
                {(order.status || 'pending').toUpperCase()}
              </span>
            </div>
            <div className="order-body">
              <p><strong>Date:</strong> {
                order.createdAt
                  ? new Date(order.createdAt).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Unknown date'
              }</p>
              <p><strong>Total:</strong> ₹{Number(order.total || 0).toFixed(2)}</p>
              <p><strong>Items:</strong> {order.items?.length || 0}</p>
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
      )}

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
                  <p><strong>Status:</strong> <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    backgroundColor: selectedOrder.status === 'paid' || selectedOrder.status === 'completed' 
                      ? '#dcfce7' 
                      : selectedOrder.status === 'pending' 
                      ? '#fef3c7' 
                      : selectedOrder.status === 'cancelled' || selectedOrder.status === 'failed'
                      ? '#fee2e2'
                      : '#f3f4f6',
                    color: selectedOrder.status === 'paid' || selectedOrder.status === 'completed'
                      ? '#10b981'
                      : selectedOrder.status === 'pending'
                      ? '#f59e0b'
                      : selectedOrder.status === 'cancelled' || selectedOrder.status === 'failed'
                      ? '#ef4444'
                      : '#6b7280',
                  }}>{selectedOrder.status?.toUpperCase() || 'PENDING'}</span></p>
                  <p><strong>Date:</strong> {
                    selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Unknown date'
                  }</p>
                </div>
                <div className="orders-modal-total">
                  <div>Total</div>
                  <div className="orders-modal-total-value">₹{Number(selectedOrder.total || 0).toFixed(2)}</div>
                </div>
              </div>

              <div className="orders-items">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="orders-item-row">
                    <div className="orders-item-info">
                      <div className="orders-item-name">{item.name || 'Unknown Item'}</div>
                      {item.selectedSize?.size && (
                        <div className="orders-item-meta">Size: {item.selectedSize.size}</div>
                      )}
                      <div className="orders-item-meta">Qty: {item.quantity || 1}</div>
                    </div>
                    <div className="orders-item-price">
                      ₹{Number(item.selectedSize?.price || item.price || 0).toFixed(2)} × {item.quantity || 1}
                    </div>
                  </div>
                )) || <p>No items found</p>}
              </div>
              
              {selectedOrder.customerInfo && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '1rem', fontWeight: '600' }}>Shipping Address</h4>
                  <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6' }}>
                    {selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}
                    <br />
                    {selectedOrder.customerInfo.address}
                    <br />
                    {selectedOrder.customerInfo.city}, {selectedOrder.customerInfo.state} {selectedOrder.customerInfo.zipCode}
                    <br />
                    Phone: {selectedOrder.customerInfo.phone}
                  </p>
                </div>
              )}
              
              {selectedOrder.paymentId && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#fef3c7', borderRadius: '8px', color: '#92400e', fontSize: '0.9rem' }}>
                  <strong>Payment ID:</strong> {selectedOrder.paymentId}
                </div>
              )}
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
