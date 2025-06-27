import { ElevatorControlSystemService } from "@/commons/services/elevator.service";
import { render, screen } from "@testing-library/react";
import { type MockedFunction } from "vitest";

import BuildingVisualization from "@/ui/BuildingVisualization";
import { LogEntry } from "@/commons/models/elevator";

describe("BuildingVisualization", () => {
    let service: ElevatorControlSystemService;

    let mockLogCallback: MockedFunction<(log: LogEntry) => void>;
    const FLOOR = 10;
    const ELEVATOR = 4;

    beforeEach(() => {
        mockLogCallback = vi.fn();
        service = new ElevatorControlSystemService(
            mockLogCallback,
            FLOOR,
            ELEVATOR
        );
        vi.useFakeTimers();
    });

    it("should render the title", () => {
        render(<BuildingVisualization elevatorSystem={service} />);
        screen.getByText("Building Visualization");
    });

    it("should render building with floors and elevators", () => {
        const { container } =render(<BuildingVisualization elevatorSystem={service} />);

        service.floorsData.forEach((floor) => {
            // Check that each floor is rendered
            expect(screen.getByText(floor.name.replace(' Floor', 'F'))).toBeInTheDocument();
        })

        // Check that elevator positions are rendered (empty boxes when not on floor)
        const elevatorContainers = container.querySelectorAll(
            '.app-elevator'
        );
        expect(elevatorContainers.length).toBe(FLOOR * ELEVATOR);
    });
});
