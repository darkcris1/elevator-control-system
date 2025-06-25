import type { ElevatorControlSystemService } from '@/commons/services/elevator.service';

interface BuildingVisualizationProps {
    elevatorSystem: ElevatorControlSystemService
}


export default function BuildingVisualization({
    elevatorSystem,
}: BuildingVisualizationProps) {
  return (
    <div className='border  border-gray-300 rounded-lg p-4 bg-white min-h-[calc(100vh-56px)]'>
      <h2 className='text-xl font-semibold mb-4 text-center'>Building Visualization</h2>
      <ul className='flex gap-2 items-center justify-center'>
        <li className='flex items-center gap-1 text-xs'>
          <span className='h-2 w-2 bg-green-600'></span>
          Up
        </li>
        <li className='flex items-center gap-1 text-xs'>
          <div className='h-2 w-2 bg-red-600'></div>
          Down
        </li>
        <li className='flex items-center gap-1 text-xs'>
          <div className='h-2 w-2 bg-blue-600'></div>
          Idle
        </li>
        
      </ul>
      <div className='flex justify-center pb-8 mt-1'>
        <div className='grid grid-rows-10 gap-1 border-2 border-gray-400 p-2 bg-gray-100 rounded-lg'>
          {elevatorSystem.floorsData.slice().reverse().map((floor) => (
            <article key={floor.id} className='flex items-center gap-2 p-2 border border-gray-300 bg-white rounded min-h-[40px]'>
              <div className='w-8 text-xs font-semibold text-center'>
                {floor.id}
              </div>
              <div className='flex gap-1 flex-1'>
                {elevatorSystem && elevatorSystem.elevators.map((elevator) => {
                  const isOnFloor = elevator.currentFloor === floor.id;
                  
                  return (
                    <article
                      key={`elevator-${elevator.id}-floor-${floor.id}`}
                      className={`w-8 relative h-8 rounded border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isOnFloor
                          ? elevator.direction === elevatorSystem.UP
                            ? 'bg-green-500 border-green-600 text-white animate-pulse'
                            : elevator.direction === elevatorSystem.DOWN
                            ? 'bg-red-500 border-red-600 text-white animate-pulse'
                            : `bg-blue-500 border-blue-600 text-white ${elevator.isDoorOpen ? 'animate-pulse' : ''}`
                          : 'bg-gray-200 border-gray-300 text-gray-400'
                      }`}
                      title={isOnFloor ? `Elevator ${elevator.id} - ${elevator.direction}` : ''}
                    >
                      {isOnFloor ? elevator.id : ''}
                    </article>
                  );
                })}
              </div>
              <div className='text-xs text-gray-600 w-16'>
                {floor.name.replace(' Floor', 'F')}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
