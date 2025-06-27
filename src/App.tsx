import { useState, useEffect, useRef } from 'react'
import type { LogEntry } from '@/commons/models/elevator';
import { ElevatorControlSystemService } from '@/commons/services/elevator.service';
import BuildingVisualization from '@/ui/BuildingVisualization';
import { Button } from '@/ui/components/Button';

// Elevator system configuration
const FLOORS = 10;
const ELEVATORS = 4;


function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [elevatorSystem, setElevatorSystem] = useState<ElevatorControlSystemService | null>(null);
  const intervalRef = useRef<number | null>(null);

  const addLog = (log: LogEntry) => {
    setLogs(prevLogs => [log, ...prevLogs].slice(0, 30)); // Keep last 30 logs to prevent long lists and performance issues
  };

  const handleManualRequest = () => {
    if (elevatorSystem) {
      elevatorSystem.generateRandomRequest();
    }
  };

  useEffect(() => {
    // Initialize elevator system
    const system = new ElevatorControlSystemService(addLog, FLOORS, ELEVATORS);
    setElevatorSystem(system);

    // Start simulation
    const simulationInterval = window.setInterval(() => {
      system.simulateStep();
    }, 1000);
    intervalRef.current = simulationInterval

    return () => {
      clearInterval(simulationInterval);
    };
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLogTypeColor = (log: LogEntry) => {
    switch (log.type) {
      case 'request': return 'text-blue-600';
      case 'movement': 
        if (log.direction == 'down') return 'text-red-600';
        if (log.direction == 'idle') return 'text-teal-600';
        return 'text-green-600';
      case 'arrival': return 'text-purple-600';
      case 'pickup': return 'text-orange-600';
      case 'status': return 'text-gray-600';
      default: return 'text-gray-800';
    }
  };

  if (!elevatorSystem) { 
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex-col flex gap-2 p-2 w-full min-h-screen md:h-screen overflow-hidden bg-gray-50">
      <h1 className='text-2xl font-bold text-center'>
        Elevator Control System
      </h1>
      
      <main className='flex gap-4 grow md:flex-row flex-col '>
        <section className='md:w-[30%]'>
          <div className='flex flex-col h-[calc(100vh-56px)]  border border-gray-300 rounded-lg p-4 bg-white'>
            <h2 className='text-xl font-semibold mb-4'>System Status</h2>
            <ul className='text-sm text-gray-600 mb-4 list-disc pl-4'>
              <li>Building: {elevatorSystem.floorsData.length} floors</li>
              <li>Elevators: {elevatorSystem.elevatorCount} cars</li>
              <li>Travel time: {elevatorSystem.travelTime}s per floor</li>
              <li>Door operation: {elevatorSystem.doorOperation}s</li>
            </ul>

            <Button
              onClick={handleManualRequest}
              id='request-elevator'
              >
              Request Elevator (Random Floor and destination)
            </Button>
          </div>
        </section>

        <section className='md:w-[40%]'>
          <BuildingVisualization
            elevatorSystem={elevatorSystem}
            ></BuildingVisualization>
        </section>

        <aside className='md:w-[30%] h-[calc(100vh-56px)] flex flex-col border overflow-hidden border-gray-300 rounded-lg p-4 bg-white'>
          <h2 className='text-xl font-semibold mb-4'>Logs</h2>
          <div className='space-y-1 grow overflow-auto max-h-full pb-2'>
            {logs.map((log) => (
              <article key={log.id} className='app-log p-2 border-b border-gray-100 text-xs'>
                <div className='flex justify-between items-start'>
                  <span className={`font-medium ${getLogTypeColor(log)}`}>
                    {log.message}
                  </span>
                  <span className='text-xs text-gray-500 ml-2 flex-shrink-0'>
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              </article>
            ))}
            {logs.length === 0 && (
              <article className='text-gray-500 text-center py-4 text-xs'>
                System starting... logs will appear here
              </article>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App
