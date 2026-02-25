import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import About from '@/pages/About';

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <About />
    </MemoryRouter>,
  );
}

describe('About', () => {
  it('renders the page heading', () => {
    renderWithRouter();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders experience section', () => {
    renderWithRouter();
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  it('renders skills section', () => {
    renderWithRouter();
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  it('renders company names', () => {
    renderWithRouter();
    expect(screen.getByText('Boston Dynamics')).toBeInTheDocument();
    expect(screen.getByText('Liberty Mutual Insurance')).toBeInTheDocument();
  });
});
