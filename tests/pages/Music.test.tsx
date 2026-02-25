import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Music from "@/pages/Music";

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <Music />
    </MemoryRouter>,
  );
}

describe("Studio", () => {
  it("renders the page heading", () => {
    renderWithRouter();
    expect(screen.getByText("Studio")).toBeInTheDocument();
  });

  it("renders influences", () => {
    renderWithRouter();
    expect(screen.getByText("Post-Punk")).toBeInTheDocument();
    expect(screen.getByText("Electronic")).toBeInTheDocument();
  });

  it("renders the concept section", () => {
    renderWithRouter();
    expect(screen.getByText("Current Status")).toBeInTheDocument();
  });
});
