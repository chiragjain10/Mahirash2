// src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await adminLogin(formData.email, formData.password);
      
      if (result.success) {
        navigate('/bsgvbgfyhkegy4169dashboard', { replace: true });
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8F5F2 0%, #EFE8DC 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="admin-login-card" style={{
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(123, 84, 33, 0.15)',
        padding: '50px 40px',
        maxWidth: '450px',
        width: '100%',
        border: '1px solid rgba(201, 179, 126, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(45deg, #C9B37E, #640d14)',
          borderRadius: '50%',
          opacity: 0.1
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, #640d14, #C9B37E)',
          borderRadius: '50%',
          opacity: 0.08
        }}></div>

        {/* Header */}
        <div className="text-center mb-5">
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #640d14, #9b7645)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 30px rgba(123, 84, 33, 0.3)'
          }}>
            <i className="fas fa-crown" style={{ color: '#fff', fontSize: '32px' }}></i>
          </div>
          <h2 style={{
            color: '#3B2F2F',
            fontSize: '28px',
            fontWeight: '600',
            marginBottom: '8px',
            fontFamily: 'serif'
          }}>
            Admin Access
          </h2>
          <p style={{
            color: '#640d14',
            fontSize: '14px',
            opacity: 0.8,
            margin: 0
          }}>
            Enter your credentials to access the dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#FFE8E8',
            border: '1px solid #FFB3B3',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#D32F2F',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label style={{
              display: 'block',
              color: '#3B2F2F',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                placeholder="abc@xyz"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  border: '2px solid #E8EBDD',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  background: '#F8F5F2',
                  color: '#3B2F2F'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#640d14';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E8EBDD';
                  e.target.style.background = '#F8F5F2';
                }}
                required
              />
              <div style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#640d14',
                opacity: 0.6
              }}>
                <i className="fas fa-envelope"></i>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label style={{
              display: 'block',
              color: '#3B2F2F',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  border: '2px solid #E8EBDD',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  background: '#F8F5F2',
                  color: '#3B2F2F'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#640d14';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E8EBDD';
                  e.target.style.background = '#F8F5F2';
                }}
                required
              />
              <div style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#640d14',
                opacity: 0.6
              }}>
                <i className="fas fa-lock"></i>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: isLoading ? '#C9B37E' : 'linear-gradient(135deg, #640d14, #9b7645)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(123, 84, 33, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(123, 84, 33, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(123, 84, 33, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <span>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Authenticating...
              </span>
            ) : (
              <span>
                <i className="fas fa-sign-in-alt me-2"></i>
                Access Dashboard
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-4">
          <p style={{
            color: '#640d14',
            fontSize: '12px',
            opacity: 0.7,
            margin: 0
          }}>
            <i className="fas fa-shield-alt me-1"></i>
            Secure admin access
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
