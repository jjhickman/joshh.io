import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Blog from '@/pages/Blog';

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <Blog />
    </MemoryRouter>,
  );
}

describe('Blog', () => {
  it('renders the page heading', () => {
    renderWithRouter();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('renders coming soon message', () => {
    renderWithRouter();
    expect(
      screen.getByText('Posts coming soon. Check back later.'),
    ).toBeInTheDocument();
  });
});
