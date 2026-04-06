import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import HomePage from "@/app/page";
import SessionPage from "@/app/session/page";
import ProgressPage from "@/app/progress/page";
import CheckinPage from "@/app/checkin/page";
import { useI18n } from "@/lib/i18n";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

afterEach(cleanup);
beforeEach(() => {
  // Set English for tests
  useI18n.setState({ locale: "en" });
});

describe("Home page", () => {
  it("renders greeting and name", () => {
    render(<HomePage />);
    expect(screen.getByText("Daniela")).toBeInTheDocument();
  });

  it("shows start cycle prompt when no cycle active", () => {
    render(<HomePage />);
    expect(
      screen.getByText("Start your 16-week program →"),
    ).toBeInTheDocument();
  });

  it("renders wellness section", () => {
    render(<HomePage />);
    expect(screen.getByText("Last session wellness")).toBeInTheDocument();
  });

  it("renders stats section", () => {
    render(<HomePage />);
    expect(screen.getByText("Total sessions")).toBeInTheDocument();
    expect(screen.getByText("Check-ins")).toBeInTheDocument();
  });
});

describe("Session page", () => {
  it("renders", () => {
    render(<SessionPage />);
    expect(screen.getByText("Workout Sessions")).toBeInTheDocument();
  });
});

describe("Progress page", () => {
  it("renders empty state when no data", () => {
    render(<ProgressPage />);
    expect(screen.getByText("No data yet")).toBeInTheDocument();
  });
});

describe("Checkin page", () => {
  it("renders", () => {
    render(<CheckinPage />);
    expect(screen.getByText("Daily Check-in")).toBeInTheDocument();
  });
});
