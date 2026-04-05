import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { EnergySlider } from "@/components/session/energy-slider";
import { Checklist } from "@/components/session/checklist";
import { useSessionStore } from "@/store/session-store";

vi.mock("next/navigation", () => ({
  usePathname: () => "/session",
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

afterEach(cleanup);

describe("EnergySlider", () => {
  it("renders with label", () => {
    render(
      <EnergySlider value={5} onChange={vi.fn()} label="Energy level" />,
    );
    expect(screen.getByText("Energy level")).toBeInTheDocument();
  });

  it("shows current value", () => {
    render(<EnergySlider value={7} onChange={vi.fn()} label="Test" />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("calls onChange when slider moves", () => {
    const onChange = vi.fn();
    render(<EnergySlider value={5} onChange={onChange} label="Test" />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "8" } });
    expect(onChange).toHaveBeenCalledWith(8);
  });
});

describe("Checklist", () => {
  it("renders items", () => {
    render(
      <Checklist
        items={["Item 1", "Item 2", "Item 3"]}
        checked={[false, false, false]}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("calls onToggle with correct index", () => {
    const onToggle = vi.fn();
    render(
      <Checklist
        items={["A", "B", "C"]}
        checked={[false, false, false]}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getByText("B"));
    expect(onToggle).toHaveBeenCalledWith(1);
  });
});

describe("Session store integration", () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
  });

  it("full session flow: pre-check -> warmup -> working -> cooldown -> summary", () => {
    const store = useSessionStore.getState();
    expect(store.phase).toBe("pre-check");

    // Pre-check
    useSessionStore.getState().setEnergyPre(7);
    useSessionStore.getState().setPhase("warmup");
    expect(useSessionStore.getState().phase).toBe("warmup");

    // Warmup
    useSessionStore.getState().toggleWarmup(0);
    useSessionStore.getState().toggleWarmup(1);
    useSessionStore.getState().toggleWarmup(2);
    expect(useSessionStore.getState().warmupChecklist).toEqual([true, true, true]);
    useSessionStore.getState().setPhase("working");

    // Working - log a set
    useSessionStore.getState().logSet({
      exerciseId: "a0000000-0000-4000-8000-000000000001",
      setNumber: 1,
      weight: 12.5,
      reps: 10,
      rpe: 7,
      completed: true,
    });
    expect(useSessionStore.getState().completedSets).toHaveLength(1);

    // Cooldown
    useSessionStore.getState().setPhase("cooldown");
    useSessionStore.getState().toggleCooldown(0);
    useSessionStore.getState().toggleCooldown(1);
    useSessionStore.getState().toggleCooldown(2);
    useSessionStore.getState().setEnergyPost(8);

    // Summary
    useSessionStore.getState().setPhase("summary");
    expect(useSessionStore.getState().energyPre).toBe(7);
    expect(useSessionStore.getState().energyPost).toBe(8);
    expect(useSessionStore.getState().completedSets).toHaveLength(1);

    // Reset
    useSessionStore.getState().reset();
    expect(useSessionStore.getState().phase).toBe("pre-check");
    expect(useSessionStore.getState().completedSets).toEqual([]);
  });

  it("calculates total volume correctly", () => {
    useSessionStore.getState().logSet({
      exerciseId: "ex1",
      setNumber: 1,
      weight: 10,
      reps: 10,
      rpe: null,
      completed: true,
    });
    useSessionStore.getState().logSet({
      exerciseId: "ex1",
      setNumber: 2,
      weight: 10,
      reps: 10,
      rpe: null,
      completed: true,
    });

    const sets = useSessionStore.getState().completedSets;
    const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    expect(volume).toBe(200);
  });
});
