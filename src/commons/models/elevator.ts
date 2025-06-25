export interface Floor {
  id: number;
  name: string;
}

export interface ElevatorRequest {
  floor: number;
  destination: number;
  direction: 'up' | 'down';
  timestamp: number;
}

export interface Elevator {
  id: number;
  currentFloor: number;
  targetFloors: number[];
  direction: 'up' | 'down' | 'idle';
  isMoving: boolean;
  isDoorOpen: boolean;
  requests: ElevatorRequest[];  // Simple array of requests assigned to this elevator
  currentMoving?: number; // Timer for current movement
}

export interface LogEntry {
  id: any;
  message: string;
  timestamp: number;
  type: 'request' | 'movement' | 'arrival' | 'pickup' | 'status';

  // Optional properties for more detailed logs
  direction?: 'up' | 'down' | 'idle'
}