import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SEOMonitor = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track page views for SEO
      const trackPageView = () => {
        if (window.gtag) {
          window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: pathname,
          });
        }
      };

      // Track user engagement
      const trackEngagement = () => {
        if (window.gtag) {
          window.gtag('event', 'user_engagement', {
            value: 1000,
            non_interaction: true,
          });
        }
      };

      // Track scroll depth
      let maxScroll = 0;
      const trackScroll = () => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
          
          if (maxScroll >= 25 && maxScroll < 50) {
            window.gtag?.('event', 'scroll', { value: 25 });
          } else if (maxScroll >= 50 && maxScroll < 75) {
            window.gtag?.('event', 'scroll', { value: 50 });
          } else if (maxScroll >= 75) {
            window.gtag?.('event', 'scroll', { value: 75 });
          }
        }
      };

      // Track time on page
      let startTime = Date.now();
      const trackTimeOnPage = () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        if (timeSpent >= 30) {
          window.gtag?.('event', 'time_on_page', { value: timeSpent });
        }
      };

      // Event listeners
      window.addEventListener('scroll', trackScroll);
      window.addEventListener('beforeunload', trackTimeOnPage);
      
      // Initial tracking
      trackPageView();
      trackEngagement();

      // Cleanup
      return () => {
        window.removeEventListener('scroll', trackScroll);
        window.removeEventListener('beforeunload', trackTimeOnPage);
      };
    }
  }, [pathname]);

  return null;
};

export default SEOMonitor;






