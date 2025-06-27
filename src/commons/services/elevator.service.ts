import type { Elevator, ElevatorRequest, Floor, LogEntry } from "@/commons/models/elevator";
import { generateUniqueId, getOrdinalSuffix } from "@/commons/utils/helper.util";



// Elevator Control System Class
export class ElevatorControlSystemService {

  UP: Elevator['direction'] = 'up'
  DOWN: Elevator['direction'] = 'down'
  IDLE: Elevator['direction'] = 'idle'

  // List of floors in the system.
  floorsData: Floor[] = [];

  /**
   * List of elevators in the system.
   */
  elevators: Elevator[] = [];

  /**
   * List of pending elevator requests.
   */
  private pendingRequests: ElevatorRequest[] = [];

  // callback for triggering log updates in the UI
  private logCallback: (log: LogEntry) => void;

  constructor(
    logCallback: (log: LogEntry) => void,
    public floorCount: number,
    public elevatorCount: number,
    public doorOperation = 10,
    public travelTime = 10,
  ) {
    this.logCallback = logCallback;
    this.initializeFloors();
    this.initializeElevators();
  }

  /**
   * Initializes the floors data based on the configured floor count.
   */
  private initializeFloors(): void {
    this.floorsData = [];
    for (let i = 1; i <= this.floorCount; i++) {
      this.floorsData.push({
        id: i,
        name: `${getOrdinalSuffix(i)} Floor`
      });
    }
  }

  private initializeElevators(): void {
    // Initialize elevators starting at random floors
    for (let i = 1; i <= this.elevatorCount; i++) {
      const startFloor = Math.floor(Math.random() * this.floorCount) + 1;
      this.elevators.push({
        id: i,
        currentFloor: startFloor,
        targetFloors: [],
        direction: this.IDLE,
        isMoving: false,
        isDoorOpen: false,
        requests: [],
      });
    }
  }

  private log(message: string, type: LogEntry['type'], direction?: LogEntry['direction']): void {
    const logEntry: LogEntry = {
      id: generateUniqueId(),
      message,
      timestamp: Date.now(),
      type,
      direction
    };
    this.logCallback(logEntry);
  }

  public requestElevator(floor: number, destination: number, direction: 'up' | 'down'): void {
    const request: ElevatorRequest = {
      floor,
      destination,
      direction,
      timestamp: Date.now(),
    };

    this.pendingRequests.push(request);

    this.log(`${direction.toUpperCase()} request from floor ${floor} to floor ${destination}`, 'request');

    // Find best elevator for this request
    const bestElevator = this.findBestElevator(request);

    if (bestElevator) {
      this.assignRequest(bestElevator, request);
    }
  }

  /**
   * Finds the best elevator to handle the given request based on current state.
   * This method uses a simple scoring system to determine the best match.
   */
  private findBestElevator(request: ElevatorRequest): Elevator | null {
    let bestElevator: Elevator | null = null;
    let bestScore = Infinity;

    for (const elevator of this.elevators) {
      const score = this.calculateElevatorScore(elevator, request);

      if (score < bestScore) {
        bestScore = score;
        bestElevator = elevator;
      }
    }

    return bestElevator;
  }

  

  /**
   * Calculates a score for the elevator based on its current state and the nearest.
   * @returns 
   */
  private calculateElevatorScore(elevator: Elevator, request: ElevatorRequest): number {
    // Simple scoring: distance + direction compatibility
    const distance = Math.abs(elevator.currentFloor - request.floor);



    // Prefer elevators already moving in the same direction or idle
    let directionPenalty = 0;

    const lastReq = elevator.requests[elevator.requests.length - 1];

    if (
      elevator.currentFloor === request.floor && elevator.direction === request.direction ||
      elevator.currentFloor === request.floor && (elevator.direction === this.IDLE)

    ) {
      directionPenalty = -20;
    }

    // If the elevator is not idle, check if it is moving in the same direction
    if (lastReq && lastReq.direction !== request.direction) {
      directionPenalty = 20;
    }

    return distance + directionPenalty;
  }

  /**
   * Assigns the elevator to the request and updates its state.
   */
  private assignRequest(elevator: Elevator, request: ElevatorRequest): void {
    // Add request to elevator's requests array
    elevator.requests.push(request);
    
    // Add pickup floor to targets if not already there
    if (!elevator.targetFloors.includes(request.floor)) {
      elevator.targetFloors.push(request.floor);
    }

    // Sort target floors to ensure efficient routing
    this.sortTargetFloors(elevator);

    // Remove request from pending
    this.pendingRequests = this.pendingRequests.filter(
      r => !(r.floor === request.floor && r.destination === request.destination && r.direction === request.direction)
    );

    this.log(`Elevator ${elevator.id} assigned to pickup at floor ${request.floor}, destination floor ${request.destination}`, 'pickup');
  }

  /**
   * Sorts the target floors of the elevator based on its current direction and position. 
   */
  private sortTargetFloors(elevator: Elevator): void {
    if (elevator.targetFloors.length === 0) return;

    // Determine the direction the elevator should move
    const currentFloor = elevator.currentFloor;
    const nextFloor = elevator.targetFloors[0];
    
    // If elevator is idle, determine direction based on first target
    if (elevator.direction === this.IDLE) {
      elevator.direction = nextFloor > currentFloor ? this.UP : this.DOWN;
    }

    // Sort floors based on current direction and position
    elevator.targetFloors.sort((a, b) => {
      if (elevator.direction === this.UP) {
        // For upward movement, prioritize floors above current floor first
        const aAbove = a >= currentFloor;
        const bAbove = b >= currentFloor;
        
        if (aAbove && bAbove) {
          return a - b; // Both above, sort ascending
        } else if (aAbove && !bAbove) {
          return -1; // a is above (priority), b is below
        } else if (!aAbove && bAbove) {
          return 1; // b is above (priority), a is below
        } else {
          return b - a; // Both below, sort descending (highest first)
        }
      } else {
        // For downward movement, prioritize floors below current floor first
        const aBelow = a <= currentFloor;
        const bBelow = b <= currentFloor;
        
        if (aBelow && bBelow) {
          return b - a; // Both below, sort descending
        } else if (aBelow && !bBelow) {
          return -1; // a is below (priority), b is above
        } else if (!aBelow && bBelow) {
          return 1; // b is below (priority), a is above
        } else {
          return a - b; // Both above, sort ascending (lowest first)
        }
      }
    });
  }

  public simulateStep(): void {
    for (const elevator of this.elevators) {
      this.processElevator(elevator);
    }
  }

  /**
   * Processes the elevator's current state and actions.
   */
  private processElevator(elevator: Elevator): void {
    if (elevator.targetFloors.length === 0) {
      elevator.direction = this.IDLE;
      elevator.isMoving = false;
      return;
    }

    if (elevator.isDoorOpen) {
      // Door is already open, don't process further until it closes
      return;
    }

    if (!elevator.isMoving) {
      // Check if we're at a target floor
      if (elevator.targetFloors.includes(elevator.currentFloor)) {
        this.handleArrival(elevator);
        return;
      }

      // Start moving to next target
      this.startMoving(elevator);
    }
  }

  /**
   * Handles the arrival of the elevator at a target floor.
   */
  private handleArrival(elevator: Elevator): void {
    clearTimeout(elevator.currentMoving);
    const currentFloor = elevator.currentFloor;
    
    // Check if there are requests to pick up at this floor
    const pickupRequests = elevator.requests.filter(r => r.floor === currentFloor);
    
    // Check if there are requests to drop off at this floor (passengers already in elevator)
    const dropoffRequests = elevator.requests.filter(r => r.destination === currentFloor && r.floor !== currentFloor);
    
    if (pickupRequests.length > 0) {
      // Pick up passengers
      for (const request of pickupRequests) {
        this.log(`Elevator ${elevator.id} picking up passenger at floor ${currentFloor} going to floor ${request.destination}`, 'pickup');
        
        // Add destination to targets if not already there
        if (!elevator.targetFloors.includes(request.destination)) {
          elevator.targetFloors.push(request.destination);
        }
      }
    }
    
    if (dropoffRequests.length > 0) {
      // Drop off passengers
      for (const request of dropoffRequests) {
        this.log(`Elevator ${elevator.id} dropping off passenger at floor ${currentFloor} (picked up from floor ${request.floor})`, 'arrival');
      }
      
      // Remove completed requests (passengers dropped off)
      elevator.requests = elevator.requests.filter(r => r.destination !== currentFloor || r.floor === currentFloor);
    }
    
    // Remove current floor from targets
    elevator.targetFloors = elevator.targetFloors.filter(f => f !== currentFloor);
    elevator.isDoorOpen = true;
    elevator.isMoving = false;

    // Simulate passenger exchange
    elevator.currentMoving = window.setTimeout(() => {
      elevator.isDoorOpen = false;
      this.log(`Elevator ${elevator.id} doors closed at floor ${elevator.currentFloor}`, 'movement', this.IDLE);
      
      // After doors close, re-sort targets and continue processing
      this.sortTargetFloors(elevator);
      
      // Immediately continue processing after doors close
      this.processElevator(elevator);
    }, this.doorOperation * 1000);
  }

  /**
   * Starts moving the elevator towards its next target floor.
   */
  private startMoving(elevator: Elevator): void {
    if (elevator.targetFloors.length === 0) return;
    clearTimeout(elevator.currentMoving);

    const nextTarget = elevator.targetFloors[0];
    
    // Update direction based on next target
    const newDirection = nextTarget > elevator.currentFloor ? this.UP : this.DOWN;
    elevator.direction = newDirection;
    elevator.isMoving = true;

    this.log(`Elevator ${elevator.id} moving ${elevator.direction} from floor ${elevator.currentFloor}`, 'movement', elevator.direction);

    // Simulate movement
    elevator.currentMoving = window.setTimeout(() => {
      elevator.currentFloor += elevator.direction === this.UP ? 1 : -1;
      elevator.isMoving = false;

      this.log(`Elevator ${elevator.id} reached floor ${elevator.currentFloor}`, 'movement', this.IDLE);

      // Continue processing this elevator
      this.processElevator(elevator);
    }, this.travelTime * 1000);
  }

  /**
   * Generates a random elevator request for testing purposes.
   */
  public generateRandomRequest(): void {
    const floor = Math.floor(Math.random() * this.floorCount) + 1;
    let destination: number;
    let direction;

    // Generate a valid destination
    do {
      destination = Math.floor(Math.random() * this.floorCount) + 1;
    } while (destination === floor);

    direction = (destination > floor ? this.UP : this.DOWN) as 'up' | 'down';

    this.requestElevator(floor, destination, direction);
  }
}


// test with bun
// const system = new ElevatorControlSystemService((log)=> console.log(log.message), 10, 3, 0, 0);

// system.generateRandomRequest();
// system.simulateStep()