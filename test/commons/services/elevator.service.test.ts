import { describe, it, expect, beforeEach, vi, afterEach, type MockedFunction } from 'vitest';
import { ElevatorControlSystemService } from '@/commons/services/elevator.service';
import type { LogEntry } from '@/commons/models/elevator';

// Mock the utility functions
vi.mock('@/commons/utils/helper.util', () => ({
  generateUniqueId: vi.fn(() => 'test-id-123'),
  getOrdinalSuffix: vi.fn((num: number) => {
    if (num === 1) return '1st';
    if (num === 2) return '2nd';
    if (num === 3) return '3rd';
    return `${num}th`;
  })
}));



describe('ElevatorControlSystemService', () => {
  let service: ElevatorControlSystemService;

  let mockLogCallback: MockedFunction<(log: LogEntry) => void>;
  const FLOOR = 10;
  const ELEVATOR = 4;
  const OPERATION = 10;

  beforeEach(() => {
    mockLogCallback = vi.fn();
    service = new ElevatorControlSystemService(mockLogCallback, FLOOR, ELEVATOR, OPERATION, OPERATION);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct number of floors', () => {
      expect(service.floorsData).toHaveLength(FLOOR);
      expect(service.floorsData[0].id).toBe(1);
      expect(service.floorsData[9].id).toBe(10);
    });

    it('should initialize with correct number of elevators', () => {
      expect(service.elevators).toHaveLength(ELEVATOR);
      service.elevators.forEach((elevator, index) => {
        expect(elevator.id).toBe(index + 1);
        expect(elevator.currentFloor).toBeGreaterThanOrEqual(1);
        expect(elevator.currentFloor).toBeLessThanOrEqual(10);
        expect(elevator.direction).toBe('idle');
        expect(elevator.isMoving).toBe(false);
        expect(elevator.isDoorOpen).toBe(false);
        expect(elevator.targetFloors).toEqual([]);
        expect(elevator.requests).toEqual([]);
      });
    });

    it('should set correct configuration values', () => {
      expect(service.floorCount).toBe(FLOOR);
      expect(service.elevatorCount).toBe(ELEVATOR);
      expect(service.doorOperation).toBe(OPERATION);
      expect(service.travelTime).toBe(OPERATION);
    });
  });

  describe('Request Elevator', () => {
    it('should accept a valid elevator request', () => {
      service.requestElevator(3, 7, 'up');

      expect(mockLogCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'UP request from floor 3 to floor 7',
          type: 'request'
        })
      );
    });

    it('should assign request to the best available elevator', () => {
      // Set specific positions for elevators
      service.elevators[0].currentFloor = 1;
      service.elevators[1].currentFloor = 5;
      service.elevators[2].currentFloor = 10;
      service.elevators[3].currentFloor = 9;

      service.requestElevator(4, 8, 'up');

      // Elevator 2 (at floor 5) should be closest to floor 4
      expect(service.elevators[1].requests).toHaveLength(1);
      expect(service.elevators[1].targetFloors).toContain(4);
    });
  });


  describe('Elevator Movement', () => {
    it('should start moving elevator when it has targets', () => {
      service.elevators[0].currentFloor = 1;
      service.requestElevator(1, 2, 'up');
      service.simulateStep();
      vi.advanceTimersByTime(OPERATION * 1000);

      expect(service.elevators[0].isMoving).toBe(true);
      expect(service.elevators[0].direction).toBe('up');
    });

    it('should move elevator up one floor after travel time', () => {
      service.elevators[0].currentFloor = 3;
      service.elevators[0].direction = service.IDLE;

      service.requestElevator(3, 4, 'up');

      service.simulateStep();
      vi.advanceTimersByTime(OPERATION * 1000); // 10 seconds door operation time 
      vi.advanceTimersByTime(OPERATION * 1000); // 10 seconds for travel time 

      expect(service.elevators[0].currentFloor).toBe(4);
    });

    it('should move elevator down one floor when going down', () => {
      service.elevators[0].currentFloor = 5;
      service.elevators[0].direction = service.IDLE;

      service.requestElevator(5, 2, 'down');

      service.simulateStep();
      vi.advanceTimersByTime(OPERATION  * 1000); // 10 seconds door operation time
      vi.advanceTimersByTime(OPERATION  * 1000); // 10 seconds for travel time

      expect(service.elevators[0].currentFloor).toBe(4);
      expect(service.elevators[0].direction).toBe('down');
    });
  });

  describe('Arrival Handling', () => {
    it('should handle passenger pickup at target floor', () => {
      const elevator = service.elevators[0];
      elevator.currentFloor = 3;
      elevator.targetFloors = [3, 7];
      elevator.requests = [{ floor: 3, destination: 7, direction: 'up', timestamp: Date.now() }];

      service.simulateStep();

      expect(elevator.isDoorOpen).toBe(true);
      expect(elevator.targetFloors).toContain(7);
      expect(mockLogCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Elevator 1 picking up passenger at floor 3 going to floor 7',
          type: 'pickup'
        })
      );
    });

    it('should handle passenger dropoff at destination floor', () => {
      const elevator = service.elevators[0];
      elevator.currentFloor = 7;
      elevator.targetFloors = [7];
      elevator.requests = [{ floor: 3, destination: 7, direction: 'up', timestamp: Date.now() }];

      service.simulateStep();

      expect(elevator.isDoorOpen).toBe(true);
      expect(mockLogCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Elevator 1 dropping off passenger at floor 7 (picked up from floor 3)',
          type: 'arrival'
        })
      );
    });

    it('should close doors after door operation time', () => {
      const elevator = service.elevators[0];
      elevator.currentFloor = 3;
      elevator.targetFloors = [3];
      elevator.requests = [{ floor: 3, destination: 7, direction: 'up', timestamp: Date.now() }];

      service.simulateStep();
      expect(elevator.isDoorOpen).toBe(true);

      vi.advanceTimersByTime(OPERATION * 1000); // 10 seconds door operation time

      expect(elevator.isDoorOpen).toBe(false);
      expect(mockLogCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Elevator 1 doors closed at floor 3',
          type: 'movement'
        })
      );
    });
  });

  describe('Random Request Generation', () => {
    it('should generate valid random requests', () => {
      const originalMath = Math.random;
      Math.random = vi.fn()
        .mockReturnValueOnce(0.3) // floor = 4
        .mockReturnValueOnce(0.7); // destination = 8

      service.generateRandomRequest();

      expect(mockLogCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'UP request from floor 4 to floor 8',
          type: 'request'
        })
      );

      Math.random = originalMath;
    });

    it('should ensure floor and destination are different', () => {
      const originalMath = Math.random;
      Math.random = vi.fn()
        .mockReturnValueOnce(0.5) // floor = 6
        .mockReturnValueOnce(0.5) // destination = 6 (same as floor)
        .mockReturnValueOnce(0.3); // destination = 4 (different from floor)

      service.generateRandomRequest();

      expect(mockLogCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'DOWN request from floor 6 to floor 4',
          type: 'request'
        })
      );

      Math.random = originalMath;
    });
  });

  describe('Edge Cases', () => {
    it('should handle elevator with no targets', () => {
      const elevator = service.elevators[0];
      elevator.targetFloors = [];
      elevator.direction = 'up';
      elevator.isMoving = true;

      service.simulateStep();

      expect(elevator.direction).toBe('idle');
      expect(elevator.isMoving).toBe(false);
    });

    it('should not process elevator when doors are open', () => {
      const elevator = service.elevators[0];
      elevator.isDoorOpen = true;
      elevator.targetFloors = [5];
      elevator.currentFloor = 3;

      service.simulateStep();

      expect(elevator.isMoving).toBe(false);
      expect(elevator.currentFloor).toBe(3);
    });

    it('should handle multiple requests for same elevator', () => {
      service.elevators[0].currentFloor = 1;
      
      service.requestElevator(2, 5, 'up');
      service.requestElevator(3, 7, 'up');
      service.requestElevator(4, 6, 'up');

      const assignedElevator = service.elevators.find(e => e.requests.length > 0);
      expect(assignedElevator?.requests.length).toBeGreaterThan(0);
      expect(assignedElevator?.targetFloors.length).toBeGreaterThan(0);
    });
  });

});