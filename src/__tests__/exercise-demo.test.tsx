import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ExerciseDemo } from "@/components/session/exercise-demo";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

afterEach(cleanup);

describe("ExerciseDemo", () => {
  it("renders image when gifUrl is provided", () => {
    render(
      <ExerciseDemo
        gifUrl="https://example.com/squat.jpg"
        exerciseName="Goblet Squat"
        instructions={["Stand with feet shoulder-width apart"]}
        muscleGroups={["quads", "glutes"]}
      />,
    );
    expect(screen.getByAltText("Goblet Squat demonstration")).toBeInTheDocument();
  });

  it("shows 'How to do this' toggle with instructions", () => {
    render(
      <ExerciseDemo
        gifUrl={null}
        exerciseName="Plank"
        instructions={["Get into position", "Hold for 30 seconds"]}
        muscleGroups={["core"]}
      />,
    );
    const toggle = screen.getByText("How to do this");
    expect(toggle).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByText("Get into position")).toBeInTheDocument();
    expect(screen.getByText("Hold for 30 seconds")).toBeInTheDocument();
  });

  it("shows muscle group badges when instructions expanded", () => {
    render(
      <ExerciseDemo
        gifUrl={null}
        exerciseName="Test"
        instructions={["Step 1"]}
        muscleGroups={["quads", "glutes"]}
      />,
    );
    fireEvent.click(screen.getByText("How to do this"));
    expect(screen.getByText("quads")).toBeInTheDocument();
    expect(screen.getByText("glutes")).toBeInTheDocument();
  });

  it("shows fallback when no gif and no instructions", () => {
    render(
      <ExerciseDemo
        gifUrl={null}
        exerciseName="Unknown Exercise"
        instructions={[]}
        muscleGroups={[]}
      />,
    );
    expect(screen.getByText("No demo available for this exercise.")).toBeInTheDocument();
  });

  it("opens fullscreen overlay on image click", () => {
    render(
      <ExerciseDemo
        gifUrl="https://example.com/squat.jpg"
        exerciseName="Squat"
        instructions={[]}
        muscleGroups={[]}
      />,
    );
    // Click the image button to expand
    fireEvent.click(screen.getByAltText("Squat demonstration"));
    // Should now show close button
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });
});
