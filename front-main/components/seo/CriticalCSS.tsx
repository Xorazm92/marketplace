import { useEffect } from 'react';

interface CriticalCSSProps {
  route?: string;
}

const CriticalCSS: React.FC<CriticalCSSProps> = ({ route = '/' }) => {
  useEffect(() => {
    // Generate critical CSS based on current route
    const criticalStyles = generateCriticalCSS(route);
    
    // Inject critical CSS
    if (criticalStyles) {
      const style = document.createElement('style');
      style.id = 'critical-css';
      style.textContent = criticalStyles;
      document.head.appendChild(style);
    }

    // Lazy load non-critical CSS
    loadNonCriticalCSS();

    return () => {
      // Cleanup
      const existingStyle = document.getElementById('critical-css');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [route]);

  const generateCriticalCSS = (currentRoute: string): string => {
    // Base critical CSS for all pages
    const baseCritical = `
      /* Critical CSS Variables */
      :root {
        --primary-orange: #f16521;
        --primary-coral: #ff6b6b;
        --success: #22c55e;
        --error: #ef4444;
        --warning: #f59e0b;
        --info: #3b82f6;
        --text-primary: #1a1a1a;
        --text-secondary: #4a5568;
        --text-muted: #718096;
        --text-inverse: #ffffff;
        --background-primary: #ffffff;
        --background-secondary: #f8fafc;
        --background-tertiary: #e2e8f0;
        --border-light: #e2e8f0;
        --border-medium: #cbd5e0;
        --border-dark: #a0aec0;
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        --radius-sm: 0.25rem;
        --radius-md: 0.375rem;
        --radius-lg: 0.5rem;
        --radius-xl: 0.75rem;
        --radius-full: 9999px;
        --space-xs: 0.25rem;
        --space-sm: 0.5rem;
        --space-md: 0.75rem;
        --space-lg: 1rem;
        --space-xl: 1.5rem;
        --space-2xl: 2rem;
        --space-3xl: 3rem;
        --text-xs: 0.75rem;
        --text-sm: 0.875rem;
        --text-base: 1rem;
        --text-lg: 1.125rem;
        --text-xl: 1.25rem;
        --text-2xl: 1.5rem;
        --text-3xl: 1.875rem;
        --transition-fast: all 0.15s ease;
        --transition-medium: all 0.3s ease;
        --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      /* Critical Reset */
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html {
        line-height: 1.6;
        -webkit-text-size-adjust: 100%;
        font-family: var(--font-family);
        scroll-behavior: smooth;
      }

      body {
        color: var(--text-primary);
        background-color: var(--background-primary);
        font-size: var(--text-base);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }

      /* Critical Layout Styles */
      .layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      /* Critical Navigation Styles */
      nav {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: var(--background-primary);
        border-bottom: 1px solid var(--border-light);
        backdrop-filter: blur(10px);
        transition: var(--transition-fast);
      }

      /* Critical Loading Styles */
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        color: var(--text-muted);
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-light);
        border-top: 3px solid var(--primary-orange);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Critical Button Styles */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        padding: var(--space-md) var(--space-lg);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition: var(--transition-fast);
        user-select: none;
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--primary-orange) 0%, var(--primary-coral) 100%);
        color: var(--text-inverse);
      }

      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      /* Critical Typography */
      h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        line-height: 1.2;
        margin-bottom: var(--space-md);
      }

      h1 { font-size: var(--text-3xl); }
      h2 { font-size: var(--text-2xl); }
      h3 { font-size: var(--text-xl); }
      h4 { font-size: var(--text-lg); }
      h5 { font-size: var(--text-base); }
      h6 { font-size: var(--text-sm); }

      p {
        margin-bottom: var(--space-md);
        line-height: 1.6;
      }

      /* Critical Image Styles */
      img {
        max-width: 100%;
        height: auto;
        border-radius: var(--radius-md);
      }

      img.lazy {
        opacity: 0;
        transition: opacity 0.3s;
      }

      img:not(.lazy) {
        opacity: 1;
      }

      /* Critical Responsive */
      @media (max-width: 768px) {
        :root {
          --text-xs: 0.7rem;
          --text-sm: 0.8rem;
          --text-base: 0.9rem;
          --text-lg: 1rem;
          --text-xl: 1.1rem;
          --text-2xl: 1.3rem;
          --text-3xl: 1.6rem;
          --space-sm: 0.4rem;
          --space-md: 0.6rem;
          --space-lg: 0.8rem;
          --space-xl: 1.2rem;
          --space-2xl: 1.6rem;
        }

        .btn {
          padding: var(--space-sm) var(--space-md);
          font-size: var(--text-xs);
        }
      }

      /* Critical Accessibility */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        html {
          scroll-behavior: auto;
        }
      }

      @media (prefers-contrast: high) {
        :root {
          --text-primary: #000000;
          --text-secondary: #333333;
          --background-primary: #ffffff;
          --border-light: #000000;
        }
      }

      /* Focus styles for accessibility */
      :focus-visible {
        outline: 2px solid var(--primary-orange);
        outline-offset: 2px;
      }

      /* Skip to content link */
      .skip-to-content {
        position: absolute;
        top: -50px;
        left: 10px;
        background: var(--primary-orange);
        color: var(--text-inverse);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-md);
        text-decoration: none;
        z-index: 9999;
        transition: top 0.3s;
      }

      .skip-to-content:focus {
        top: 10px;
      }
    `;

    // Route-specific critical CSS
    let routeSpecific = '';
    
    switch (currentRoute) {
      case '/':
        routeSpecific = `
          /* Critical Homepage Styles */
          .hero {
            background: linear-gradient(135deg, #fff5f0 0%, #ffeee6 100%);
            padding: var(--space-3xl) 0;
            text-align: center;
          }

          .hero h1 {
            font-size: var(--text-3xl);
            margin-bottom: var(--space-lg);
            background: linear-gradient(135deg, var(--primary-orange) 0%, var(--primary-coral) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .search-bar {
            max-width: 600px;
            margin: 0 auto var(--space-xl);
            position: relative;
          }

          .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: var(--space-lg);
            padding: var(--space-xl) 0;
          }

          @media (max-width: 768px) {
            .product-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: var(--space-md);
            }
          }
        `;
        break;
        
      case '/products':
        routeSpecific = `
          /* Critical Products Page Styles */
          .filters {
            display: flex;
            gap: var(--space-md);
            padding: var(--space-lg) 0;
            border-bottom: 1px solid var(--border-light);
          }

          .product-card {
            background: var(--background-primary);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-lg);
            overflow: hidden;
            transition: var(--transition-fast);
          }

          .product-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
          }
        `;
        break;
        
      default:
        routeSpecific = '';
    }

    return baseCritical + routeSpecific;
  };

  const loadNonCriticalCSS = () => {
    // Load non-critical CSS after page load
    if (typeof window !== 'undefined') {
      const loadCSS = (href: string) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = () => {
          link.media = 'all';
        };
        document.head.appendChild(link);
      };

      // Delay loading to not block initial render
      setTimeout(() => {
        // Load route-specific CSS
        const routeCSS = {
          '/': ['/styles/home.css'],
          '/products': ['/styles/products.css', '/styles/filters.css'],
          '/cart': ['/styles/cart.css'],
          '/checkout': ['/styles/checkout.css']
        };

        const currentRoute = window.location.pathname;
        const cssFiles = routeCSS[currentRoute as keyof typeof routeCSS] || [];
        
        cssFiles.forEach(loadCSS);

        // Load common non-critical CSS
        [
          '/styles/animations.css',
          '/styles/utilities.css',
          '/styles/print.css'
        ].forEach(loadCSS);
      }, 100);
    }
  };

  return null;
};

export default CriticalCSS;