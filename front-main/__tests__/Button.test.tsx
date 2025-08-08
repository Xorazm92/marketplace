import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../components/Button/Button';

test('renders button with children and variant', () => {
  render(<Button variant="primary">Click Me</Button>);
  const btn = screen.getByRole('button', { name: /click me/i });
  expect(btn).toBeInTheDocument();
  // Ensure the primary style class is applied (assuming CSS module naming)
  expect(btn).toHaveClass('button');
});
