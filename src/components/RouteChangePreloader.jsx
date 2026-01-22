import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePreloader } from '../context/PreloaderContext';

const RouteChangePreloader = () => {
  const { showPreloader, hidePreloader } = usePreloader();
  const location = useLocation();

  useEffect(() => {
    showPreloader();
    const timer = setTimeout(() => {
      hidePreloader();
    }, 300); // Simulate loading delay
    return () => clearTimeout(timer);
  }, [location]);

  return null;
};

export default RouteChangePreloader; 