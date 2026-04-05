import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import HomePage from "@/app/page";
import SessionPage from "@/app/session/page";
import ProgressPage from "@/app/progress/page";
import CheckinPage from "@/app/checkin/page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

afterEach(cleanup);

describe("Home page", () => {
  it("renders greeting and name", () => {
    render(<HomePage />);
    expect(screen.getByText("Daniela")).toBeInTheDocument();
  });

  it("renders phase badge", () => {
    render(<HomePage />);
    expect(screen.getByText(/Phase 1/)).toBeInTheDocument();
  });

  it("renders wellness section", () => {
    render(<HomePage />);
    expect(screen.getByText("Last session wellness")).toBeInTheDocument();
  });

  it("renders stats section", () => {
    render(<HomePage />);
    expect(screen.getByText("This week")).toBeInTheDocument();
    expect(screen.getByText("Sessions done")).toBeInTheDocument();
  });

  it("renders phase progress", () => {
    render(<HomePage />);
    expect(screen.getByText("Phase progress")).toBeInTheDocument();
  });
});

describe("Session page", () => {
  it("renders", () => {
    render(<SessionPage />);
    expect(screen.getByText("Workout Session")).toBeInTheDocument();
  });
});

describe("Progress page", () => {
  it("renders", () => {
    render(<ProgressPage />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
  });
});

describe("Checkin page", () => {
  it("renders", () => {
    render(<CheckinPage />);
    expect(screen.getByText("Daily Check-in")).toBeInTheDocument();
  });
});
