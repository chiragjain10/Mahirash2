import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from './firebase';

const Login = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      
      // Wait for auth state to update - check currentUser
      let attempts = 0;
      while (!auth.currentUser && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (auth.currentUser) {
        navigate('/');
      } else {
        setError('Login successful but user state not updated. Please refresh the page.');
        setLoading(false);
      }
    } catch (err) {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      
      // Wait for auth state to update - check currentUser
      let attempts = 0;
      while (!auth.currentUser && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (auth.currentUser) {
        navigate('/');
      } else {
        setError('Google login successful but user state not updated. Please refresh the page.');
        setGoogleLoading(false);
      }
    } catch (err) {
      if (err?.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is disabled in Firebase. Enable the provider under Authentication > Sign-in method.');
      } else {
        setError('Unable to sign in with Google right now. Please try again.');
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8F5F2 0%, #EFE8DC 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="auth-card" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(59, 47, 47, 0.15)',
        padding: '48px 40px',
        maxWidth: '480px',
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
          background: 'linear-gradient(45deg, #C9B37E, #D4B04C)',
          borderRadius: '50%',
          opacity: '0.1'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, #3B2F2F, #65000B)',
          borderRadius: '50%',
          opacity: '0.08'
        }}></div>

        {/* Logo/Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #C9B37E, #D4B04C)',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(201, 179, 126, 0.3)'
          }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              stroke="#3B2F2F"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M9 7h6v3H9z" />
              <path d="M8 10h8l2 8a2 2 0 01-2 2H8a2 2 0 01-2-2l2-8z" />
              <circle cx="12" cy="4" r="2" />
            </svg>

          </div>
          <h2 style={{
            color: '#3B2F2F',
            fontSize: '32px',
            fontWeight: '600',
            marginBottom: '8px',
            letterSpacing: '1px'
          }}>Welcome Back</h2>
          <p style={{
            color: '#818181',
            fontSize: '16px',
            margin: '0'
          }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(240, 62, 62, 0.1)',
            border: '1px solid rgba(240, 62, 62, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: '#f03e3e',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#3B2F2F',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #EFE8DC',
                borderRadius: '12px',
                fontSize: '16px',
                background: '#FFFFFF',
                color: '#3B2F2F',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C9B37E';
                e.target.style.boxShadow = '0 0 0 3px rgba(201, 179, 126, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#EFE8DC';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              color: '#3B2F2F',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #EFE8DC',
                borderRadius: '12px',
                fontSize: '16px',
                background: '#FFFFFF',
                color: '#3B2F2F',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C9B37E';
                e.target.style.boxShadow = '0 0 0 3px rgba(201, 179, 126, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#EFE8DC';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className='tf-btn btn-fill fw-medium animate-btn w-100 text-decoration-none py-2'
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(59, 47, 47, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #FFFFFF',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: '#EFE8DC' }}></div>
          <span style={{ color: '#818181', fontSize: '14px', fontWeight: '500' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#EFE8DC' }}></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '2px solid #EFE8DC',
            background: '#fff',
            color: '#3B2F2F',
            fontWeight: '600',
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!googleLoading) {
              e.currentTarget.style.borderColor = '#C9B37E';
              e.currentTarget.style.background = '#FDF9F2';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#EFE8DC';
            e.currentTarget.style.background = '#fff';
          }}
        >
          {googleLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(59,47,47,0.2)',
                borderTop: '2px solid #3B2F2F',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Connecting to Google...
            </span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M255.68 133.49c0-10.78-.88-18.67-2.78-26.83H130.55v48.56h71.89c-1.45 12.13-9.3 30.36-26.78 42.62l-.24 1.6 38.87 30.11 2.69.27c24.68-22.74 38.71-56.22 38.71-96.33" />
                <path fill="#34A853" d="M130.55 261.1c35.19 0 64.8-11.59 86.4-31.5l-41.15-31.85c-11 7.64-25.82 12.99-45.25 12.99-34.55 0-63.87-22.74-74.32-54.25l-1.53.13-40.27 31.14-.53 1.47C36.49 231.02 79.19 261.1 130.55 261.1" />
                <path fill="#FBBC05" d="M56.23 156.5c-2.78-8.16-4.38-16.89-4.38-26.05 0-9.16 1.6-17.89 4.24-26.05l-.07-1.75-40.79-31.66-1.33.62C4.91 90.25 0 109.3 0 130.45s4.91 40.2 13.9 58.84l42.33-32.79" />
                <path fill="#EB4335" d="M130.55 50.48c24.45 0 40.9 10.57 50.3 19.39l36.74-35.8C195.31 12.83 165.74 0 130.55 0 79.19 0 36.49 30.08 13.9 71.61l42.22 32.79c10.58-31.51 39.9-53.92 74.43-53.92" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #EFE8DC'
        }}>
          <p style={{
            color: '#818181',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{
              color: '#C9B37E',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.3s ease'
            }}
              onMouseEnter={(e) => e.target.style.color = '#3B2F2F'}
              onMouseLeave={(e) => e.target.style.color = '#C9B37E'}
            >
              Create Account
            </Link>
          </p>

          <p style={{
            color: '#818181',
            fontSize: '14px',
            margin: '0'
          }}>
            Admin access?{' '}
            <Link to="/admin" style={{
              color: '#C9B37E',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.3s ease'
            }}
              onMouseEnter={(e) => e.target.style.color = '#3B2F2F'}
              onMouseLeave={(e) => e.target.style.color = '#C9B37E'}
            >
              Admin Login
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login; 