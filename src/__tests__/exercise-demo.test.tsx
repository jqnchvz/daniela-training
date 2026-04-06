import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ExerciseDemo } from "@/components/session/exercise-demo";
import { useI18n } from "@/lib/i18n";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

afterEach(cleanup);
beforeEach(() => {
  useI18n.setState({ locale: "en" });
});

describe("ExerciseDemo", () => {
  it("renders image when gifUrl is provided", () => {
    render(
      <ExerciseDemo
        gifUrl="https://example.com/squat.jpg"
        gifUrl2="https://example.com/squat2.jpg"
        exerciseName="Goblet Squat"
        instructions={["Stand with feet shoulder-width apart"]}
        instructionsEs={["De pie con los pies al ancho de los hombros"]}
        muscleGroups={["quads", "glutes"]}
      />,
    );
    expect(screen.getByAltText("Goblet Squat demonstration")).toBeInTheDocument();
  });

  it("shows English instructions by default", () => {
    render(
      <ExerciseDemo
        gifUrl={null}
        gifUrl2={null}
        exerciseName="Plank"
        instructions={["Get into position", "Hold for 30 seconds"]}
        instructionsEs={["Ponte en posición", "Mantén 30 segundos"]}
        muscleGroups={["core"]}
      />,
    );
    fireEvent.click(screen.getByText("How to do this"));
    expect(screen.getByText("Get into position")).toBeInTheDocument();
  });

  it("shows Spanish instructions when locale is es", () => {
    useI18n.setState({ locale: "es" });
    render(
      <ExerciseDemo
        gifUrl={null}
        gifUrl2={null}
        exerciseName="Plancha"
        instructions={["Get into position"]}
        instructionsEs={["Ponte en posición"]}
        muscleGroups={["core"]}
      />,
    );
    fireEvent.click(screen.getByText("Cómo hacerlo"));
    expect(screen.getByText("Ponte en posición")).toBeInTheDocument();
  });

  it("shows fallback when no gif and no instructions", () => {
    render(
      <ExerciseDemo
        gifUrl={null}
        gifUrl2={null}
        exerciseName="Unknown Exercise"
        instructions={[]}
        instructionsEs={[]}
        muscleGroups={[]}
      />,
    );
    expect(screen.getByText("No demo available for this exercise.")).toBeInTheDocument();
  });
});
