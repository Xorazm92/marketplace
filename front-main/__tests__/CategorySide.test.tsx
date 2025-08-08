import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
// Mock next/router for CategoryCard component
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    pathname: '/',
    push: jest.fn(),
  }),
}));

import CategorySide from '../components/home/category';
// Mock the useCategory hook
jest.mock('../hooks/category', () => ({
  useCategory: jest.fn()
}));

import { useCategory } from '../hooks/category';

describe('CategorySide component', () => {
  const mockCategories = [
    { id: 1, name: 'Category 1', logo: 'logo1.png', slug: 'cat1' },
    { id: 2, name: 'Category 2', logo: 'logo2.png', slug: 'cat2' },
    { id: 3, name: 'Category 3', logo: 'logo3.png', slug: 'cat3' },
    { id: 4, name: 'Category 4', logo: 'logo4.png', slug: 'cat4' },
    { id: 5, name: 'Category 5', logo: 'logo5.png', slug: 'cat5' },
    { id: 6, name: 'Category 6', logo: 'logo6.png', slug: 'cat6' },
    { id: 7, name: 'Category 7', logo: 'logo7.png', slug: 'cat7' },
    { id: 8, name: 'Category 8', logo: 'logo8.png', slug: 'cat8' },
    { id: 9, name: 'Category 9', logo: 'logo9.png', slug: 'cat9' },
    { id: 10, name: 'Category 10', logo: 'logo10.png', slug: 'cat10' },
    { id: 11, name: 'Category 11', logo: 'logo11.png', slug: 'cat11' },
    { id: 12, name: 'Category 12', logo: 'logo12.png', slug: 'cat12' }
  ];

  it('renders loading state', () => {
    (useCategory as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });
    render(<CategorySide />);
    // Expect skeletons to be rendered (10 skeletons)
    const skeletons = screen.getAllByTestId('category-card-skeleton');
    expect(skeletons).toHaveLength(10);
  });

  it('renders categories and view all button', () => {
    (useCategory as jest.Mock).mockReturnValue({ data: mockCategories, isLoading: false });
    render(<CategorySide />);
    // Should render initial visible categories (DEFAULT_VISIBLE_COUNT = 11)
    const categoryCards = screen.getAllByTestId('category-card');
    expect(categoryCards).toHaveLength(11);
    // View all button should be present because not all categories shown
    const viewAll = screen.getByText(/Barchasini ko'rish/i);
    expect(viewAll).toBeInTheDocument();
    // Click view all to show more
    fireEvent.click(viewAll);
    // After click, all categories should be rendered (12)
    const allCards = screen.getAllByTestId('category-card');
    expect(allCards).toHaveLength(12);
  });
});
