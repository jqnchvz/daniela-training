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
  it("renders greeting and workout info", () => {
    render(<HomePage />);
    expect(screen.getByText(/Daniela/)).toBeInTheDocument();
  });

  it("renders quick stats", () => {
    render(<HomePage />);
    expect(screen.getByText("Streak")).toBeInTheDocument();
    expect(screen.getByText("This week")).toBeInTheDocument();
    expect(screen.getByText("Energy")).toBeInTheDocument();
  });

  it("renders check-in prompt", () => {
    render(<HomePage />);
    expect(screen.getByText("Check in")).toBeInTheDocument();
  });

  it("renders last session section", () => {
    render(<HomePage />);
    expect(screen.getByText("Last session")).toBeInTheDocument();
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
