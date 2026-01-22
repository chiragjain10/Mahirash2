import React, { useState, useEffect, useRef } from 'react';
import './VideoBanner.css';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const HeroVideo = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoUrl, setVideoUrl] = useState('images/video2.mp4'); // default
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Prefer last uploaded URL (even if Firestore rules block reads for now)
    try {
      const cached = localStorage.getItem('siteConfig.heroVideoUrl');
      if (cached) setVideoUrl(cached);
    } catch (_) {}

    const ref = doc(db, 'siteConfig', 'videos');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        const nextUrl = data?.heroVideoUrl || 'images/video2.mp4';
        setVideoUrl(nextUrl);
        try {
          if (data?.heroVideoUrl) localStorage.setItem('siteConfig.heroVideoUrl', data.heroVideoUrl);
          else localStorage.removeItem('siteConfig.heroVideoUrl');
        } catch (_) {}
      },
      (error) => {
        console.error('Error loading hero video config:', error);
        // keep whatever is already set (cached/default)
      }
    );

    return () => unsub();
  }, []);

  return (
    <section className={`premium-hero ${isLoaded ? 'is-visible' : ''}`}>
      {/* The Grain Overlay adds a "film" texture to the video */}
      <div className="film-grain"></div>
      
      {/* The Vignette creates depth around the edges */}
      <div className="vignette"></div>

      <div className="video-frame">
        <video
          ref={videoRef}
          className="hero-video-element"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>

      {/* Minimalist edge accent */}
      <div className="edge-accent top"></div>
      <div className="edge-accent bottom"></div>
    </section>
  );
};

export default HeroVideo;