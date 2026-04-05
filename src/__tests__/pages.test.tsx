import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import SessionPage from "@/app/session/page";
import ProgressPage from "@/app/progress/page";
import CheckinPage from "@/app/checkin/page";

describe("Page rendering", () => {
  it("renders home page with greeting", () => {
    render(<HomePage />);
    expect(screen.getByText(/Daniela/)).toBeInTheDocument();
    expect(screen.getByText(/Day A/)).toBeInTheDocument();
    expect(screen.getByText(/Start Session/)).toBeInTheDocument();
  });

  it("renders session page", () => {
    render(<SessionPage />);
    expect(screen.getByText("Workout Session")).toBeInTheDocument();
  });

  it("renders progress page", () => {
    render(<ProgressPage />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
  });

  it("renders checkin page", () => {
    render(<CheckinPage />);
    expect(screen.getByText("Daily Check-in")).toBeInTheDocument();
  });
});
