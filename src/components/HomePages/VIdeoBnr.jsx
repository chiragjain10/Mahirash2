import React, { useEffect, useState } from 'react';
import './CinematicStage.css';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const CinematicStage = () => {
  const [videoUrl, setVideoUrl] = useState('images/video3.mp4'); // default

  useEffect(() => {
    // Prefer last uploaded URL (even if Firestore rules block reads for now)
    try {
      const cached = localStorage.getItem('siteConfig.stageVideoUrl');
      if (cached) setVideoUrl(cached);
    } catch (_) {}

    const ref = doc(db, 'siteConfig', 'videos');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        const nextUrl = data?.stageVideoUrl || 'images/video3.mp4';
        setVideoUrl(nextUrl);
        try {
          if (data?.stageVideoUrl) localStorage.setItem('siteConfig.stageVideoUrl', data.stageVideoUrl);
          else localStorage.removeItem('siteConfig.stageVideoUrl');
        } catch (_) {}
      },
      (error) => {
        console.error('Error loading cinematic stage video config:', error);
        // keep whatever is already set (cached/default)
      }
    );

    return () => unsub();
  }, []);

  return (
    <main className="stage-root">
      <video
        className="stage-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </main>
  );
};

export default CinematicStage;
