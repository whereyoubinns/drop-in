import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device has touch capability
    const checkIfMobile = () => {
      const hasTouchScreen =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;

      // Also check screen width for additional confidence
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(hasTouchScreen || isSmallScreen);
    };

    checkIfMobile();

    // Re-check on resize
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
};

