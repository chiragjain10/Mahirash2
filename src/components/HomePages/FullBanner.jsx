import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const FullScreenBanner = () => {
  const navigate = useNavigate();
  const [bannerUrl, setBannerUrl] = useState('');

  const handleClick = () => {
    navigate('/category');
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      // Fast path: localStorage (so it still works if Firestore read is blocked)
      try {
        const cached = localStorage.getItem('siteConfig.fullBannerUrl');
        if (cached && isMounted) setBannerUrl(cached);
      } catch (_) {}

      try {
        const ref = doc(db, 'siteConfig', 'banners');
        const snap = await getDoc(ref);
        const url = snap.exists() ? (snap.data()?.fullBannerUrl || '') : '';
        if (!isMounted) return;
        setBannerUrl(url);
        try {
          if (url) localStorage.setItem('siteConfig.fullBannerUrl', url);
          else localStorage.removeItem('siteConfig.fullBannerUrl');
        } catch (_) {}
      } catch (error) {
        // If Firestore permissions block reads, keep localStorage or fallback image
        console.error('Error fetching banner config:', error);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer"
      data-aos="zoom-in"
      data-aos-duration="800"
      data-aos-delay="200"
    >
      <img
        src={bannerUrl || "./images/fb.png"}
        alt="Mahirash Perfume Banner"
        className="mb-5"
      />
    </div>
  );
};

export default FullScreenBanner;
