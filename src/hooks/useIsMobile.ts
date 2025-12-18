import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is actually a mobile device (phone/tablet)
    const checkIfMobile = () => {
      const hasTouchScreen =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;

      // Check if it's a mobile device by screen size (either dimension)
      // Use the smaller dimension to handle both portrait and landscape
      const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
      const isSmallDevice = smallerDimension < 768;

      // Mobile if has touch OR is small device
      setIsMobile(hasTouchScreen || isSmallDevice);
    };

    checkIfMobile();

    // Re-check on resize and orientation change
    window.addEventListener('resize', checkIfMobile);
    window.addEventListener('orientationchange', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
      window.removeEventListener('orientationchange', checkIfMobile);
    };
  }, []);

  return isMobile;
};
