import React, { useState, useEffect } from 'react';
import './BannerSlider.css';
import { Link } from 'react-router-dom';

const sliderData = [
  {
    id: 1,
    img: 'images/01.jpg',
    title: 'Awaken Your Senses',
    subtitle: 'Discover the essence of luxury',
    description: 'Immerse yourself in a world of sophisticated fragrances that tell your unique story',
    btnText: 'Explore Collection',
    btnLink: '/category',
    accentColor: '#2c2c2c',
    textColor: 'light'
  },
  {
    id: 2,
    img: 'images/03.jpg',
    title: 'Fragrance That Defines You',
    subtitle: 'Where elegance meets individuality',
    description: 'Each scent is crafted to reflect your personality and enhance your presence',
    btnText: 'Shop Now',
    btnLink: '/category',
    accentColor: '#640d14',
    textColor: 'dark'
  },
  {
    id: 3,
    img: 'images/04.jpg',
    title: 'Perfumes That Speak',
    subtitle: 'The language of luxury',
    description: 'Let your fragrance communicate sophistication and refinement',
    btnText: 'Discover More',
    btnLink: '/category',
    accentColor: '#2c2c2c',
    textColor: 'light'
  },
];

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setCurrentSlide((prev) => (prev + 1) % sliderData.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleSlideChange = (index) => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handlePrevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev - 1 + sliderData.length) % sliderData.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleNextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <section className="premium-banner-slider">
      <div className="banner-slider-container">
        <div className="banner-slider-wrapper">
          {sliderData.map((slide, index) => (
            <div
              key={slide.id}
              className={`banner-slide ${index === currentSlide ? 'active' : ''} ${slide.textColor === 'dark' ? 'text-dark' : 'text-light'}`}
              style={{ '--accent-color': slide.accentColor }}
            >
              <div className="slide-background">
                <img 
                  src={slide.img} 
                  alt={`Banner ${slide.id}`} 
                  loading={index === currentSlide ? 'eager' : 'lazy'} 
                  decoding="async"
                  fetchpriority={index === currentSlide ? 'high' : 'low'}
                />
                <div className="slide-overlay"></div>
              </div>
              
              <div className="slide-content">
                <div className="content-container">
                  <div className="content-wrapper">
                    <div className="slide-badge">
                      <span className="badge-text">Premium Collection</span>
                    </div>
                    
                    <h1 className="slide-title" aria-live={index === currentSlide ? 'polite' : 'off'}>
                      {slide.title.split(' ').map((word, wordIndex) => (
                        <span key={wordIndex} className="title-word">
                          {word}
                        </span>
                      ))}
                    </h1>
                    
                    <p className="slide-subtitle">{slide.subtitle}</p>
                    <p className="slide-description">{slide.description}</p>
                    
                    <div className="slide-actions">
                      <Link to={slide.btnLink} className="tf-btn btn-fill animate-btn type-large text-uppercase text-decoration-none">
                        <span className="btn-text">{slide.btnText}</span>
                        <span className="btn-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="slider-dots">
          {sliderData.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleSlideChange(index)}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className="dot-inner"></span>
            </button>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          className="slider-nav prev-btn" 
          onClick={handlePrevSlide}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="slider-nav next-btn" 
          onClick={handleNextSlide}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Progress Bar */}
        <div className="slider-progress">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${((currentSlide + 1) / sliderData.length) * 100}%`,
              backgroundColor: sliderData[currentSlide]?.accentColor 
            }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default BannerSlider;
