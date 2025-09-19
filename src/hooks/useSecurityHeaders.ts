import { useEffect } from 'react';

/**
 * Custom hook to set security-related meta tags and headers
 * Note: Some headers like CSP are limited due to iframe usage in Lovable
 */
export const useSecurityHeaders = () => {
  useEffect(() => {
    // Set viewport for responsive design and prevent zoom exploitation
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }

    // Prevent MIME type sniffing
    const metaNoSniff = document.createElement('meta');
    metaNoSniff.httpEquiv = 'X-Content-Type-Options';
    metaNoSniff.content = 'nosniff';
    document.head.appendChild(metaNoSniff);

    // Referrer policy for privacy
    const metaReferrer = document.createElement('meta');
    metaReferrer.name = 'referrer';
    metaReferrer.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(metaReferrer);

    // Cleanup function
    return () => {
      document.head.removeChild(metaNoSniff);
      document.head.removeChild(metaReferrer);
    };
  }, []);
};