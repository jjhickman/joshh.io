import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Contact from "@/pages/Contact";

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <Contact />
    </MemoryRouter>,
  );
}

describe("Contact", () => {
  it("renders the page heading", () => {
    renderWithRouter();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders social links", () => {
    renderWithRouter();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("YouTube")).toBeInTheDocument();
  });
});
