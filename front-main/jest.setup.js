import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => {
  return function mockDynamic(loader) {
    const MockedComponent = (props) => {
      return <div data-testid="mocked-dynamic-component" {...props} />
    }
    MockedComponent.displayName = 'MockedDynamicComponent'
    return MockedComponent
  }
})

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockedImage(props) {
    return <img {...props} />
  }
})

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockedLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Mock Next.js Head component
jest.mock('next/head', () => {
  return function MockedHead({ children }) {
    return <>{children}</>
  }
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}

  observe() {
    return null
  }

  disconnect() {
    return null
  }

  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}

  observe() {
    return null
  }

  disconnect() {
    return null
  }

  unobserve() {
    return null
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    minHeight: '0px',
    minWidth: '0px',
    fontSize: '16px',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)',
  }),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock console methods for cleaner test output
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global test utilities
global.testUtils = {
  // Mock API responses
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  }),

  // Create mock user
  createMockUser: () => ({
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    phone_number: '+998901234567',
    is_active: true,
    is_verified: true,
  }),

  // Create mock product
  createMockProduct: () => ({
    id: 1,
    title: 'Test Product',
    description: 'Test product description',
    price: 50000,
    images: ['test-image.jpg'],
    rating: 4.5,
    reviewCount: 10,
    category: { name: 'Test Category' },
    brand: { name: 'Test Brand' },
  }),

  // Create mock order
  createMockOrder: () => ({
    id: 1,
    order_number: 'TEST-001',
    status: 'PENDING',
    payment_status: 'PENDING',
    total_amount: 50000,
    final_amount: 50000,
    items: [
      {
        id: 1,
        quantity: 1,
        price: 50000,
        product: global.testUtils.createMockProduct(),
      },
    ],
  }),

  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Fire multiple events
  fireEvents: (element, events) => {
    const { fireEvent } = require('@testing-library/react')
    events.forEach(event => fireEvent(element, event))
  },
}

// Custom matchers
expect.extend({
  toHaveValidClassNames(received) {
    const isValid = typeof received === 'string' && received.trim().length > 0
    
    if (isValid) {
      return {
        message: () => `expected ${received} not to have valid class names`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to have valid class names`,
        pass: false,
      }
    }
  },

  toBeResponsive(received) {
    // Mock responsive check - in real implementation, this would check CSS media queries
    const hasResponsiveClasses = received.className && (
      received.className.includes('mobile-') ||
      received.className.includes('tablet-') ||
      received.className.includes('desktop-') ||
      received.className.includes('responsive')
    )
    
    if (hasResponsiveClasses) {
      return {
        message: () => `expected element not to be responsive`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected element to be responsive`,
        pass: false,
      }
    }
  },

  toBeAccessible(received) {
    // Basic accessibility checks
    const hasAriaLabel = received.getAttribute('aria-label')
    const hasRole = received.getAttribute('role')
    const hasTabIndex = received.getAttribute('tabindex')
    const isAccessible = hasAriaLabel || hasRole || hasTabIndex || received.tagName === 'BUTTON'
    
    if (isAccessible) {
      return {
        message: () => `expected element not to be accessible`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected element to be accessible`,
        pass: false,
      }
    }
  },
})