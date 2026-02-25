import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Home from "@/pages/Home";

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe("Home", () => {
  it("renders the hero heading", () => {
    renderWithRouter();
    expect(screen.getByText("Josh Hickman")).toBeInTheDocument();
  });

  it("renders supporting copy", () => {
    renderWithRouter();
    expect(screen.getByText(/build software in boston/i)).toBeInTheDocument();
  });

  it("renders CTA buttons", () => {
    renderWithRouter();
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders featured projects section", () => {
    renderWithRouter();
    expect(screen.getByText("Featured Projects")).toBeInTheDocument();
  });
});
