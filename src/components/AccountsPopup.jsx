import React from 'react';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';

function AccountsPopup({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
      navigate('/login');
    } catch (error) {
      // Logout error handled silently
    }
  };

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      style={{
        display: 'block',
        backdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1050,
      }}
      onClick={(e) => e.target.classList.contains('modal') && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-light border-bottom-0">
            <h5 className="modal-title fw-semibold">
              {user ? 'My Account' : 'Account'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body px-4 py-5">
            {user ? (
              <>
                {/* Avatar */}
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow"
                    style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                  >
                    {user.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user.email.charAt(0).toUpperCase()}
                  </div>
                  <h5 className="fw-bold mt-3 mb-1">
                    {user.displayName || 'User'}
                  </h5>
                  <p className="text-muted mb-0">{user.email}</p>
                </div>

                {/* Account Info */}
                <div className="border rounded-3 p-3 mb-4">
                  <h6 className="fw-semibold mb-3">Account Details</h6>
                  <div className="row g-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Name</small>
                      <span>{user.displayName || 'Not set'}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Email</small>
                      <span>{user.email}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Created</small>
                      <span>
                        {user.metadata?.creationTime
                          ? new Date(user.metadata.creationTime).toLocaleDateString()
                          : 'Unknown'}
                      </span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Last Sign-in</small>
                      <span>
                        {user.metadata?.lastSignInTime
                          ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout */}
                <div className="d-grid">
                  <button className="btn btn-danger" onClick={handleLogout}>
                    <i className="icon icon-logout me-2"></i> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <i className="icon icon-user mb-3" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                <h6 className="text-muted mb-3">Not logged in</h6>
                <p className="text-muted mb-4">
                  Please log in to view your account details.
                </p>
                <div className="d-grid">
                  <button
                    className="tf-btn btn-fill fw-medium animate-btn w-100 text-decoration-none py-2"
                    onClick={() => {
                      onClose();
                      navigate('/login');
                    }}
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountsPopup;
