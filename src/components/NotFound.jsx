import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      className="w-100 min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{
        background: 'linear-gradient(135deg, #f8f5f2, #e0c68a)',
        overflow: 'hidden',
      }}
    >
      {/* Overlay decorative blurred circle */}
      <div
        className="position-absolute rounded-circle"
        style={{
          width: '400px',
          height: '400px',
          top: '-100px',
          left: '-100px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(50px)',
          zIndex: 1,
        }}
      ></div>

      <div className="container position-relative z-2">
        <div className="row align-items-center justify-content-center g-5 py-5">
          {/* Image */}
          <div className="col-md-6 text-center">
            <img
              src="https://img.freepik.com/free-photo/fresh-scent-purple-flower-glass-bottle-generative-ai_188544-9642.jpg"
              alt="Not Found"
              className="img-fluid rounded-4 shadow"
              style={{ maxWidth: '350px' }}
            />
          </div>

          {/* Content */}
          <div className="col-md-6">
            <div
              className="p-4 p-md-5 rounded-4 shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <h1 className="display-1 fw-bold text-warning mb-2">404</h1>
              <h2 className="h4 fw-semibold text-dark mb-3">Oops! Page Not Found</h2>
              <p className="text-muted mb-4 fs-5">
                The page you’re looking for doesn’t exist or has been moved.
                Try exploring our latest collection of fragrances instead.
              </p>
              <Link
                to="/"
                className="tf-btn btn-fill animate-btn type-large text-uppercase text-decoration-none"
               
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
