import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../components/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import './Account.css';

function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, getCartTotal, getCartCount } = useCart();
  const { wishlistItems, getWishlistCount } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusBg = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return '#dcfce7';
      case 'pending':
        return '#fef3c7';
      case 'cancelled':
      case 'failed':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  if (!user) {
    return (
      <div className="account-container">
        <div className="account-empty-state">
          <div className="account-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Please log in to view your account</h2>
          <p>Sign in to access your dashboard, orders, and more.</p>
          <Link to="/login" className="account-btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const totalSpent = orders
    .filter(o => o.status === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

  return (
    <div className="account-container">
      <div className="account-wrapper">
        {/* Header Section */}
        <div className="account-header">
          <div className="account-header-content">
            <div className="account-avatar-section">
              <div className="account-avatar">
                {user.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="account-header-info">
                <h1 className="account-name">{user.displayName || 'User'}</h1>
                <p className="account-email">{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="account-logout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="account-stats">
          <div className="account-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #640d14, #9b7645)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>

          <div className="account-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #C9B37E, #D4B04C)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">₹{totalSpent.toFixed(2)}</div>
              <div className="stat-label">Total Spent</div>
            </div>
          </div>

          <Link to="/chart" className="account-stat-card account-stat-link">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6924 15.5583C21.0581 15.264 21.3085 14.8504 21.4 14.39L23 6H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{getCartCount()}</div>
              <div className="stat-label">Cart Items</div>
            </div>
            <div className="stat-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>

          <Link to="/wishlist" className="account-stat-card account-stat-link">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #E91E63, #C2185B)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{getWishlistCount()}</div>
              <div className="stat-label">Wishlist Items</div>
            </div>
            <div className="stat-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* Tabs */}
        <div className="account-tabs">
          <button
            className={`account-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`account-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
          <button
            className={`account-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Account Details
          </button>
        </div>

        {/* Tab Content */}
        <div className="account-content">
          {activeTab === 'overview' && (
            <div className="account-overview">
              <div className="account-section">
                <h2 className="account-section-title">Recent Orders</h2>
                {loading ? (
                  <div className="account-loading">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="account-empty">
                    <p>No orders yet</p>
                    <Link to="/category" className="account-btn-primary">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="account-orders-preview">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="account-order-preview-card">
                        <div className="order-preview-header">
                          <div>
                            <div className="order-preview-id">Order #{order.id.slice(0, 8)}</div>
                            <div className="order-preview-date">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'Unknown date'}
                            </div>
                          </div>
                          <span
                            className="order-preview-status"
                            style={{
                              backgroundColor: getStatusBg(order.status),
                              color: getStatusColor(order.status),
                            }}
                          >
                            {order.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                        <div className="order-preview-body">
                          <div className="order-preview-items">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="order-preview-item">
                                <span>{item.name}</span>
                                <span>×{item.quantity}</span>
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <div className="order-preview-more">
                                +{order.items.length - 2} more items
                              </div>
                            )}
                          </div>
                          <div className="order-preview-total">₹{Number(order.total || 0).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                    {orders.length > 3 && (
                      <button
                        className="account-view-all-btn"
                        onClick={() => setActiveTab('orders')}
                      >
                        View All Orders
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="account-orders">
              {loading ? (
                <div className="account-loading">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="account-empty">
                  <p>No orders found</p>
                  <Link to="/category" className="account-btn-primary">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="account-orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="account-order-card">
                      <div className="account-order-header">
                        <div>
                          <h3 className="account-order-id">Order #{order.id}</h3>
                          <p className="account-order-date">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Unknown date'}
                          </p>
                        </div>
                        <span
                          className="account-order-status"
                          style={{
                            backgroundColor: getStatusBg(order.status),
                            color: getStatusColor(order.status),
                          }}
                        >
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>

                      <div className="account-order-body">
                        <div className="account-order-items">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="account-order-item">
                              <div className="order-item-image">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} />
                                ) : (
                                  <div className="order-item-placeholder">
                                    {item.name?.charAt(0) || '?'}
                                  </div>
                                )}
                              </div>
                              <div className="order-item-details">
                                <div className="order-item-name">{item.name}</div>
                                {item.selectedSize?.size && (
                                  <div className="order-item-meta">Size: {item.selectedSize.size}</div>
                                )}
                                <div className="order-item-meta">Quantity: {item.quantity}</div>
                              </div>
                              <div className="order-item-price">
                                ₹{Number(item.selectedSize?.price || item.price || 0).toFixed(2)} × {item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="account-order-summary">
                          <div className="order-summary-row">
                            <span>Subtotal:</span>
                            <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                          </div>
                          {order.shippingCost > 0 && (
                            <div className="order-summary-row">
                              <span>Shipping:</span>
                              <span>₹{Number(order.shippingCost || 0).toFixed(2)}</span>
                            </div>
                          )}
                          {order.giftCost > 0 && (
                            <div className="order-summary-row">
                              <span>Gift Wrapping:</span>
                              <span>₹{Number(order.giftCost || 0).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="order-summary-row order-summary-total">
                            <span>Total:</span>
                            <span>₹{Number(order.total || 0).toFixed(2)}</span>
                          </div>
                        </div>

                        {order.customerInfo && (
                          <div className="account-order-shipping">
                            <h4>Shipping Address</h4>
                            <p>
                              {order.customerInfo.firstName} {order.customerInfo.lastName}
                              <br />
                              {order.customerInfo.address}
                              <br />
                              {order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zipCode}
                              <br />
                              Phone: {order.customerInfo.phone}
                            </p>
                          </div>
                        )}

                        {order.paymentId && (
                          <div className="account-order-payment">
                            <strong>Payment ID:</strong> {order.paymentId}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="account-details">
              <div className="account-section">
                <h2 className="account-section-title">Personal Information</h2>
                <div className="account-details-grid">
                  <div className="account-detail-item">
                    <label>Display Name</label>
                    <div className="account-detail-value">
                      {user.displayName || 'Not set'}
                    </div>
                  </div>
                  <div className="account-detail-item">
                    <label>Email Address</label>
                    <div className="account-detail-value">{user.email}</div>
                  </div>
                  <div className="account-detail-item">
                    <label>User ID</label>
                    <div className="account-detail-value account-detail-id">{user.uid}</div>
                  </div>
                  <div className="account-detail-item">
                    <label>Account Created</label>
                    <div className="account-detail-value">
                      {user.metadata?.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Unknown'}
                    </div>
                  </div>
                  <div className="account-detail-item">
                    <label>Last Sign-in</label>
                    <div className="account-detail-value">
                      {user.metadata?.lastSignInTime
                        ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Unknown'}
                    </div>
                  </div>
                  <div className="account-detail-item">
                    <label>Email Verified</label>
                    <div className="account-detail-value">
                      {user.emailVerified ? (
                        <span className="account-verified">✓ Verified</span>
                      ) : (
                        <span className="account-unverified">Not verified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="account-section">
                <h2 className="account-section-title">Account Statistics</h2>
                <div className="account-stats-grid">
                  <div className="account-stat-item">
                    <div className="stat-item-label">Total Orders</div>
                    <div className="stat-item-value">{orders.length}</div>
                  </div>
                  <div className="account-stat-item">
                    <div className="stat-item-label">Completed Orders</div>
                    <div className="stat-item-value">
                      {orders.filter(o => o.status === 'paid' || o.status === 'completed').length}
                    </div>
                  </div>
                  <div className="account-stat-item">
                    <div className="stat-item-label">Pending Orders</div>
                    <div className="stat-item-value">
                      {orders.filter(o => o.status === 'pending').length}
                    </div>
                  </div>
                  <div className="account-stat-item">
                    <div className="stat-item-label">Cancelled Orders</div>
                    <div className="stat-item-value">
                      {orders.filter(o => o.status === 'cancelled' || o.status === 'failed').length}
                    </div>
                  </div>
                  <div className="account-stat-item">
                    <div className="stat-item-label">Total Spent</div>
                    <div className="stat-item-value">₹{totalSpent.toFixed(2)}</div>
                  </div>
                  <div className="account-stat-item">
                    <div className="stat-item-label">Cart Items</div>
                    <div className="stat-item-value">{getCartCount()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Account;

