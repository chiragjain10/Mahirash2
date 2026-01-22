import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { adminUser, adminLoading } = useAdminAuth();
  const location = useLocation();

  if (adminLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #F8F5F2 0%, #EFE8DC 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(123, 84, 33, 0.15)',
            border: '1px solid rgba(201, 179, 126, 0.2)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #640d14, #9b7645)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }}
          >
            <i className="fas fa-shield-alt" style={{ color: '#fff', fontSize: '24px' }}></i>
          </div>
          <h3 style={{ color: '#3B2F2F', marginBottom: '10px' }}>Verifying Access</h3>
          <p style={{ color: '#640d14', fontSize: '14px', margin: 0 }}>Checking admin privileges...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

export default AdminProtectedRoute;

