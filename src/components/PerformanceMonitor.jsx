import React, { useEffect, useState } from 'react';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      // Calculate timing metrics with proper error handling
      const domContentLoaded = navigation ? 
        (navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart) : 0;
      
      const loadComplete = navigation ? 
        Math.max(0, navigation.loadEventEnd - navigation.loadEventStart) : 0;
      
      // Get paint metrics with fallbacks
      const firstPaint = paint.find(p => p.name === 'first-paint')?.startTime || 0;
      const firstContentfulPaint = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      
      // Additional performance metrics
      const timeToFirstByte = navigation ? navigation.responseStart - navigation.requestStart : 0;
      const domProcessing = navigation ? navigation.domContentLoadedEventEnd - navigation.responseEnd : 0;
      
      const performanceMetrics = {
        // Navigation timing
        domContentLoaded: domContentLoaded,
        loadComplete: loadComplete,
        timeToFirstByte: timeToFirstByte,
        domProcessing: domProcessing,
        
        // Paint timing
        firstPaint: firstPaint,
        firstContentfulPaint: firstContentfulPaint,
        
        // Memory usage (if available)
        memory: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576),
          total: Math.round(performance.memory.totalJSHeapSize / 1048576),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        } : null,
        
        // Performance score
        performanceScore: calculatePerformanceScore(firstPaint, firstContentfulPaint, domContentLoaded),
        
        // Timestamp
        timestamp: Date.now()
      };

      setMetrics(performanceMetrics);
    };

    // Calculate performance score
    const calculatePerformanceScore = (fp, fcp, dcl) => {
      let score = 100;
      
      if (fp > 1000) score -= 20;
      if (fp > 2000) score -= 30;
      if (fcp > 1500) score -= 25;
      if (fcp > 2500) score -= 35;
      if (dcl > 100) score -= 15;
      
      return Math.max(0, score);
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => window.removeEventListener('load', measurePerformance);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
             <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🚀 Performance Monitor</div>
       {Object.keys(metrics).length > 0 && (
         <>
           <div style={{ 
             fontSize: '14px', 
             fontWeight: 'bold', 
             color: metrics.performanceScore >= 80 ? '#4CAF50' : metrics.performanceScore >= 60 ? '#FF9800' : '#F44336',
             marginBottom: '8px'
           }}>
             Score: {metrics.performanceScore}/100
           </div>
           <div>DOM Ready: {metrics.domContentLoaded?.toFixed(2)}ms</div>
           <div>Load Complete: {metrics.loadComplete?.toFixed(2)}ms</div>
           <div>First Paint: {metrics.firstPaint?.toFixed(2)}ms</div>
           <div>FCP: {metrics.firstContentfulPaint?.toFixed(2)}ms</div>
           <div>TTFB: {metrics.timeToFirstByte?.toFixed(2)}ms</div>
           <div>DOM Processing: {metrics.domProcessing?.toFixed(2)}ms</div>
           {metrics.memory && (
             <div>Memory: {metrics.memory.used}MB / {metrics.memory.total}MB</div>
           )}
         </>
       )}
    </div>
  );
};

export default PerformanceMonitor;
