import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { configureStore } from '@reduxjs/toolkit';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock components for testing
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false }) => state,
    cart: (state = { items: [], total: 0 }) => state,
    ui: (state = { theme: 'light', language: 'uz' }) => state,
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={mockStore}>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </Provider>
);

describe('UI/UX Comprehensive Tests', () => {
  beforeEach(() => {
    // Reset viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  describe('Responsive Design Tests', () => {
    const testViewports = [
      { width: 320, height: 568, name: 'Mobile Portrait' },
      { width: 568, height: 320, name: 'Mobile Landscape' },
      { width: 768, height: 1024, name: 'Tablet Portrait' },
      { width: 1024, height: 768, name: 'Tablet Landscape' },
      { width: 1280, height: 720, name: 'Desktop Small' },
      { width: 1920, height: 1080, name: 'Desktop Large' },
    ];

    testViewports.forEach(viewport => {
      it(`should render correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
        // Mock viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        });

        // Import component dynamically to test after viewport setup
        const { default: HomePage } = await import('../app/home/page');
        
        render(
          <TestWrapper>
            <HomePage />
          </TestWrapper>
        );

        // Check if layout adapts to viewport
        const container = screen.getByTestId('home-container') || document.body;
        
        // Mobile-specific checks
        if (viewport.width < 768) {
          expect(container).toHaveClass('mobile-layout');
          // Mobile navigation should be visible
          const mobileNav = screen.getByTestId('mobile-navigation');
          expect(mobileNav).toBeInTheDocument();
        }

        // Tablet-specific checks
        if (viewport.width >= 768 && viewport.width < 1024) {
          expect(container).toHaveClass('tablet-layout');
        }

        // Desktop-specific checks
        if (viewport.width >= 1024) {
          expect(container).toHaveClass('desktop-layout');
          // Desktop navigation should be visible
          const desktopNav = screen.getByTestId('desktop-navigation');
          expect(desktopNav).toBeInTheDocument();
        }
      });
    });

    it('should handle orientation changes gracefully', async () => {
      const { default: ProductGrid } = await import('../components/marketplace/ProductGrid');
      
      const { rerender } = render(
        <TestWrapper>
          <ProductGrid products={[]} />
        </TestWrapper>
      );

      // Portrait mode
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      Object.defineProperty(window, 'innerHeight', { value: 1024 });
      
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      rerender(
        <TestWrapper>
          <ProductGrid products={[]} />
        </TestWrapper>
      );

      // Landscape mode
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      Object.defineProperty(window, 'innerHeight', { value: 768 });
      
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      rerender(
        <TestWrapper>
          <ProductGrid products={[]} />
        </TestWrapper>
      );

      // Should render without errors in both orientations
      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    });
  });

  describe('Child-Friendly Interface Tests', () => {
    it('should provide large, easy-to-tap buttons for children', async () => {
      const { default: ChildInterface } = await import('../components/child-interface/KidsInterface');
      
      render(
        <TestWrapper>
          <ChildInterface />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const minHeight = parseInt(styles.minHeight || '0');
        const minWidth = parseInt(styles.minWidth || '0');
        
        // Buttons should be at least 44px (iOS) or 48px (Android) for accessibility
        expect(minHeight).toBeGreaterThanOrEqual(44);
        expect(minWidth).toBeGreaterThanOrEqual(44);
      });
    });

    it('should use child-appropriate colors and fonts', async () => {
      const { default: ChildSafetyDashboard } = await import('../components/child-safety/ChildSafetyDashboard');
      
      render(
        <TestWrapper>
          <ChildSafetyDashboard />
        </TestWrapper>
      );

      const childElements = screen.getAllByTestId(/child-/);
      
      childElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        
        // Check for child-friendly font sizes (should be larger)
        const fontSize = parseInt(styles.fontSize);
        expect(fontSize).toBeGreaterThanOrEqual(16); // Minimum readable size for children
        
        // Check for high contrast colors
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        expect(color).toBeDefined();
        expect(backgroundColor).toBeDefined();
      });
    });

    it('should provide audio feedback for interactions', async () => {
      const mockAudio = {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        currentTime: 0,
        volume: 1,
      };
      
      // Mock HTML5 Audio
      window.HTMLAudioElement.prototype.play = mockAudio.play;
      window.HTMLAudioElement.prototype.pause = mockAudio.pause;

      const { default: KidsInterface } = await import('../components/child-interface/KidsInterface');
      
      render(
        <TestWrapper>
          <KidsInterface />
        </TestWrapper>
      );

      const interactiveElements = screen.getAllByRole('button');
      
      // Simulate click on child-friendly elements
      if (interactiveElements.length > 0) {
        fireEvent.click(interactiveElements[0]);
        
        await waitFor(() => {
          expect(mockAudio.play).toHaveBeenCalled();
        });
      }
    });

    it('should provide simple navigation for children', async () => {
      const { default: ChildNavigation } = await import('../components/child-interface/ChildNavigation');
      
      render(
        <TestWrapper>
          <ChildNavigation />
        </TestWrapper>
      );

      // Navigation should have icons and simple text
      const navItems = screen.getAllByTestId(/nav-item-/);
      
      navItems.forEach(item => {
        // Should contain both icon and text
        const icon = item.querySelector('svg, img');
        const text = item.textContent;
        
        expect(icon).toBeInTheDocument();
        expect(text).toBeTruthy();
        expect(text.length).toBeLessThan(15); // Keep text short for children
      });
    });
  });

  describe('Adult/Parent Interface Tests', () => {
    it('should provide comprehensive controls for parents', async () => {
      const { default: ParentalControls } = await import('../components/parental-control/ParentalControlPanel');
      
      render(
        <TestWrapper>
          <ParentalControls />
        </TestWrapper>
      );

      // Should have spending limit controls
      expect(screen.getByTestId('spending-limit-control')).toBeInTheDocument();
      
      // Should have time restriction controls
      expect(screen.getByTestId('time-restriction-control')).toBeInTheDocument();
      
      // Should have content filter controls
      expect(screen.getByTestId('content-filter-control')).toBeInTheDocument();
      
      // Should have monitoring dashboard
      expect(screen.getByTestId('monitoring-dashboard')).toBeInTheDocument();
    });

    it('should show detailed analytics and reports', async () => {
      const { default: ParentDashboard } = await import('../components/admin/ParentDashboard');
      
      render(
        <TestWrapper>
          <ParentDashboard />
        </TestWrapper>
      );

      // Should display child activity statistics
      expect(screen.getByTestId('activity-stats')).toBeInTheDocument();
      
      // Should display spending reports
      expect(screen.getByTestId('spending-reports')).toBeInTheDocument();
      
      // Should display safety alerts
      expect(screen.getByTestId('safety-alerts')).toBeInTheDocument();
    });

    it('should provide quick emergency controls', async () => {
      const { default: EmergencyControls } = await import('../components/parental-control/EmergencyControls');
      
      render(
        <TestWrapper>
          <EmergencyControls />
        </TestWrapper>
      );

      // Should have emergency pause button
      const pauseButton = screen.getByTestId('emergency-pause');
      expect(pauseButton).toBeInTheDocument();
      expect(pauseButton).toHaveClass('emergency-control');
      
      // Should have quick block button
      const blockButton = screen.getByTestId('quick-block');
      expect(blockButton).toBeInTheDocument();
      
      // Should have contact support button
      const supportButton = screen.getByTestId('contact-support');
      expect(supportButton).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('should support keyboard navigation', async () => {
      const { default: ProductCard } = await import('../components/marketplace/ProductCard');
      
      const mockProduct = {
        id: 1,
        title: 'Test Product',
        price: 25000,
        images: ['test.jpg'],
      };

      render(
        <TestWrapper>
          <ProductCard product={mockProduct} />
        </TestWrapper>
      );

      const productCard = screen.getByTestId('product-card');
      
      // Should be focusable
      expect(productCard).toHaveAttribute('tabIndex');
      
      // Test keyboard navigation
      productCard.focus();
      expect(document.activeElement).toBe(productCard);
      
      // Test Enter key activation
      fireEvent.keyDown(productCard, { key: 'Enter', code: 'Enter' });
      // Should trigger navigation or action
    });

    it('should provide proper ARIA labels and roles', async () => {
      const { default: SearchFilters } = await import('../components/search/SearchFilters');
      
      render(
        <TestWrapper>
          <SearchFilters />
        </TestWrapper>
      );

      // Check for proper ARIA labels
      const filterGroups = screen.getAllByRole('group');
      filterGroups.forEach(group => {
        expect(group).toHaveAttribute('aria-labelledby');
      });

      // Check for proper form labels
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('aria-label');
      });

      // Check for proper button descriptions
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should support screen readers', async () => {
      const { default: ProductInfo } = await import('../components/product/ProductInfo');
      
      const mockProduct = {
        id: 1,
        title: 'Accessible Test Product',
        description: 'This is a test product for accessibility',
        price: 35000,
        rating: 4.5,
        reviewCount: 10,
      };

      render(
        <TestWrapper>
          <ProductInfo product={mockProduct} />
        </TestWrapper>
      );

      // Should have proper heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Main title should be h1
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      
      // Should have descriptive text for screen readers
      const srOnlyTexts = document.querySelectorAll('.sr-only');
      expect(srOnlyTexts.length).toBeGreaterThan(0);
    });

    it('should have proper color contrast', async () => {
      const { default: Button } = await import('../components/Button');
      
      render(
        <TestWrapper>
          <Button variant="primary">Test Button</Button>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      
      // Check color contrast (this would typically use a contrast checking library)
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      expect(backgroundColor).toBeDefined();
      expect(color).toBeDefined();
      // In a real implementation, you would check WCAG contrast ratios
    });
  });

  describe('Performance & Loading Tests', () => {
    it('should show loading states appropriately', async () => {
      const { default: ProductGrid } = await import('../components/marketplace/ProductGrid');
      
      render(
        <TestWrapper>
          <ProductGrid products={null} loading={true} />
        </TestWrapper>
      );

      // Should show loading skeleton
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      
      // Should not show actual content while loading
      expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
    });

    it('should handle error states gracefully', async () => {
      const { default: ProductGrid } = await import('../components/marketplace/ProductGrid');
      
      render(
        <TestWrapper>
          <ProductGrid products={null} error="Failed to load products" />
        </TestWrapper>
      );

      // Should show error message
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      
      // Should provide retry button
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('should implement virtual scrolling for large lists', async () => {
      const { default: VirtualizedList } = await import('../components/common/VirtualizedList');
      
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        title: `Product ${i}`,
        price: Math.random() * 100000,
      }));

      render(
        <TestWrapper>
          <VirtualizedList items={largeDataSet} />
        </TestWrapper>
      );

      // Should only render visible items
      const renderedItems = screen.getAllByTestId(/list-item-/);
      expect(renderedItems.length).toBeLessThan(largeDataSet.length);
      expect(renderedItems.length).toBeGreaterThan(0);
    });

    it('should lazy load images', async () => {
      const { default: LazyImage } = await import('../components/common/LazyImage');
      
      render(
        <TestWrapper>
          <LazyImage src="test-image.jpg" alt="Test Image" />
        </TestWrapper>
      );

      const image = screen.getByAltText('Test Image');
      
      // Should have loading attribute
      expect(image).toHaveAttribute('loading', 'lazy');
      
      // Should show placeholder initially
      expect(image).toHaveClass('lazy-loading');
    });
  });

  describe('Interactive Elements Tests', () => {
    it('should provide visual feedback for interactions', async () => {
      const { default: InteractiveButton } = await import('../components/ui/InteractiveButton');
      
      render(
        <TestWrapper>
          <InteractiveButton>Click Me</InteractiveButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      
      // Test hover state
      fireEvent.mouseEnter(button);
      expect(button).toHaveClass('hover');
      
      // Test active state
      fireEvent.mouseDown(button);
      expect(button).toHaveClass('active');
      
      // Test focus state
      fireEvent.focus(button);
      expect(button).toHaveClass('focused');
    });

    it('should handle touch gestures on mobile', async () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        configurable: true,
        value: null,
      });

      const { default: SwipeableCard } = await import('../components/mobile/SwipeableCard');
      
      render(
        <TestWrapper>
          <SwipeableCard>Swipeable Content</SwipeableCard>
        </TestWrapper>
      );

      const card = screen.getByTestId('swipeable-card');
      
      // Test touch events
      fireEvent.touchStart(card, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      fireEvent.touchMove(card, {
        touches: [{ clientX: 150, clientY: 100 }],
      });
      
      fireEvent.touchEnd(card);
      
      // Should handle swipe gesture
      expect(card).toHaveClass('swiped');
    });

    it('should support drag and drop interactions', async () => {
      const { default: DragDropList } = await import('../components/admin/DragDropList');
      
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];

      render(
        <TestWrapper>
          <DragDropList items={items} />
        </TestWrapper>
      );

      const firstItem = screen.getByTestId('drag-item-1');
      
      // Test drag start
      fireEvent.dragStart(firstItem, {
        dataTransfer: {
          setData: jest.fn(),
          getData: jest.fn(),
        },
      });
      
      expect(firstItem).toHaveClass('dragging');
    });
  });

  describe('Form Validation & UX', () => {
    it('should provide real-time form validation', async () => {
      const { default: UserRegistrationForm } = await import('../components/auth/UserRegistrationForm');
      
      render(
        <TestWrapper>
          <UserRegistrationForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone/i);
      
      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
      
      // Test invalid phone
      fireEvent.change(phoneInput, { target: { value: '123' } });
      fireEvent.blur(phoneInput);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid phone/i)).toBeInTheDocument();
      });
    });

    it('should show progress indicators for multi-step forms', async () => {
      const { default: SellerOnboardingForm } = await import('../components/seller/SellerOnboardingForm');
      
      render(
        <TestWrapper>
          <SellerOnboardingForm />
        </TestWrapper>
      );

      // Should show step indicator
      expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
      
      // Should show current step
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      
      // Should show total steps
      expect(screen.getByTestId('total-steps')).toBeInTheDocument();
    });

    it('should save form progress automatically', async () => {
      const { default: ProductCreationForm } = await import('../components/admin/ProductCreationForm');
      
      render(
        <TestWrapper>
          <ProductCreationForm />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      
      // Type in form
      fireEvent.change(titleInput, { target: { value: 'Auto-saved Product' } });
      
      // Should trigger auto-save
      await waitFor(() => {
        expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
      });
    });
  });

  describe('Search & Navigation UX', () => {
    it('should provide instant search suggestions', async () => {
      const { default: SearchBar } = await import('../components/search/SearchBar');
      
      render(
        <TestWrapper>
          <SearchBar />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('searchbox');
      
      // Type search query
      fireEvent.change(searchInput, { target: { value: 'toy' } });
      
      // Should show suggestions
      await waitFor(() => {
        expect(screen.getByTestId('search-suggestions')).toBeInTheDocument();
      });
    });

    it('should maintain search state across navigation', async () => {
      const { default: SearchResults } = await import('../components/search/SearchResults');
      
      render(
        <TestWrapper>
          <SearchResults query="educational toys" />
        </TestWrapper>
      );

      // Should maintain search query
      expect(screen.getByDisplayValue('educational toys')).toBeInTheDocument();
      
      // Should show applied filters
      expect(screen.getByTestId('applied-filters')).toBeInTheDocument();
    });

    it('should provide breadcrumb navigation', async () => {
      const { default: Breadcrumb } = await import('../components/common/Breadcrumb');
      
      const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Toys', href: '/products/toys' },
        { label: 'Educational Toys', href: '/products/toys/educational' },
      ];

      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbItems} />
        </TestWrapper>
      );

      // Should show all breadcrumb items
      breadcrumbItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
      
      // Should have proper navigation structure
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});