import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Portfolio from "@/pages/Portfolio";

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <Portfolio />
    </MemoryRouter>,
  );
}

describe("Lab", () => {
  it("renders the page heading", () => {
    renderWithRouter();
    expect(
      screen.getByRole("heading", { name: "Lab", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders workbench section", () => {
    renderWithRouter();
    expect(screen.getByText("Workbench")).toBeInTheDocument();
  });

  it("renders project cards", () => {
    renderWithRouter();
    expect(screen.getByText("garbanzo-bot")).toBeInTheDocument();
  });
});
