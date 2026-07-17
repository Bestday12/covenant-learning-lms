import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/ui/Button.jsx";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Go</Button>);
    fireEvent.click(screen.getByText("Go"));
    expect(clicked).toBe(true);
  });

  it("disables button when loading", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
