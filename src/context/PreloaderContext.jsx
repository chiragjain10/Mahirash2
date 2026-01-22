import React, { createContext, useContext, useState, useCallback } from 'react';
import Preloader from '../components/Preloader';

const PreloaderContext = createContext();

export const usePreloader = () => useContext(PreloaderContext);

export const PreloaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showPreloader = useCallback(() => setIsLoading(true), []);
  const hidePreloader = useCallback(() => setIsLoading(false), []);

  return (
    <PreloaderContext.Provider value={{ isLoading, showPreloader, hidePreloader }}>
      {isLoading && <Preloader />}
      {children}
    </PreloaderContext.Provider>
  );
}; 