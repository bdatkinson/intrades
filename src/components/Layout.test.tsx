import { render, screen } from '@testing-library/react';
import Layout from './Layout';

describe('Layout', () => {
  it('renders header, main and footer', () => {
    render(<Layout />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
