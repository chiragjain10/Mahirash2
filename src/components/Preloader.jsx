import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  const loadingTexts = [
    "Crafting Excellence",
    "Precision Engineering",
    "Quality Assurance",
    "Finalizing Details"
  ];

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 120);

    // Rotate loading texts
    const textInterval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, 800);

    // Hide preloader after loading
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="preloader-overlay light-theme">
      <div className="preloader-container">
        
        {/* Premium header with subtle gradient */}
        <div className="preloader-header">
          <div className="header-line"></div>
          <div className="header-text">MAHIRASH</div>
          <div className="header-line"></div>
        </div>
        
        {/* Centered logo with sophisticated container */}
        <div className="logo-elegant-container">
          <div className="logo-frame">
            <img 
              src="/images/logom.png" 
              alt="Mahirash Logo" 
              className="preloader-logo-elegant"
            />
          </div>
          <div className="logo-shine"></div>
        </div>
        
        {/* Sophisticated loading indicator */}
        <div className="loading-indicator">
          <div className="loading-text-container">
            <h3 className="loading-text">{loadingTexts[textIndex]}</h3>
            <div className="loading-subtext">Premium Experience Loading</div>
          </div>
          
          {/* Minimalist progress indicator */}
          <div className="progress-elegant">
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              >
                <div className="progress-dot"></div>
              </div>
            </div>
            <div className="progress-label">{Math.min(100, Math.round(progress))}%</div>
          </div>
        </div>
        
        {/* Animated geometric elements */}
        <div className="geometric-elements">
          <div className="geometric-shape shape-1"></div>
          <div className="geometric-shape shape-2"></div>
          <div className="geometric-shape shape-3"></div>
          <div className="geometric-shape shape-4"></div>
        </div>
        
        {/* Signature line */}
        <div className="signature-line">
          <span className="signature-text">Excellence in Every Detail</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;