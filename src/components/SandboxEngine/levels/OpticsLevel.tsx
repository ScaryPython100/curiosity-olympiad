import { useState, useRef, useEffect } from 'react';
import { DraggableItem, Position } from '../DraggableItem';

interface OpticsLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
}

export function OpticsLevel({ recordAction }: OpticsLevelProps) {
  const [flashlightPos, setFlashlightPos] = useState<Position>({ x: 50, y: 150 });
  const [prismPos, setPrismPos] = useState<Position>({ x: 400, y: 250 });
  
  const [useRedPrism, setUseRedPrism] = useState(false);
  
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [workspaceSize, setWorkspaceSize] = useState({ width: 800, height: 400 });

  useEffect(() => {
    if (workspaceRef.current) {
      setWorkspaceSize({
        width: workspaceRef.current.clientWidth,
        height: workspaceRef.current.clientHeight
      });
    }
  }, []);

  // Simple collision detection for beam (Flashlight points straight right)
  const beamY = flashlightPos.y + 20;
  const beamX = flashlightPos.x + 60;
  
  const prismHit = 
    prismPos.x > beamX &&
    prismPos.x < beamX + 600 && // Within beam range
    beamY > prismPos.y &&
    beamY < prismPos.y + 60; // Hits the prism height
    
  const handleDragStart = (id: string) => {
    recordAction(`drag_start_${id}`);
  };

  const handleDrag = (id: string, newPos: Position) => {
    if (id === 'flashlight') setFlashlightPos(newPos);
    if (id === 'prism') setPrismPos(newPos);
  };

  const handleDragEnd = (id: string, newPos: Position) => {
    recordAction(`drag_end_${id}`, newPos);
    handleDrag(id, newPos);
  };

  const toggleOptionalTool = () => {
    recordAction('optional_tool_used');
    setUseRedPrism(prev => !prev);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Level Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
        <div className="flex-1 pr-4">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
             <span className="bg-indigo-600 text-xs px-2 py-1 rounded text-white uppercase tracking-wider">Mission 1</span>
             Optics Module
          </h2>
          <p className="text-sm text-indigo-200 font-medium mt-1">
            <strong>Objective:</strong> Use the prism to split the white light beam. Experiment with the Red Glass to observe how it filters the spectrum.
          </p>
        </div>
        <button 
          onClick={toggleOptionalTool}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${useRedPrism ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {useRedPrism ? 'Disable Red Glass' : 'Use Red Glass'}
        </button>
      </div>

      {/* Physics Workspace */}
      <div 
        ref={workspaceRef}
        className="relative w-full h-[400px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-900 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {!prismHit && (
          <div 
            className="absolute h-4 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] pointer-events-none"
            style={{ left: beamX, top: beamY - 2, width: workspaceSize.width - beamX }}
          />
        )}

        {prismHit && (
          <>
            <div 
              className="absolute h-4 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] pointer-events-none"
              style={{ left: beamX, top: beamY - 2, width: prismPos.x - beamX }}
            />
            <div className="absolute opacity-80 pointer-events-none" style={{ left: prismPos.x + 28, top: beamY - 12 }}>
               {useRedPrism ? (
                  <div className="w-[800px] h-8 bg-red-500 shadow-[0_0_30px_rgba(255,0,0,1)] origin-left -rotate-6" />
               ) : (
                 <div className="flex flex-col gap-0.5">
                   <div className="w-[800px] h-2 bg-red-500 shadow-[0_0_10px_red] origin-left -rotate-12" />
                   <div className="w-[800px] h-2 bg-yellow-500 shadow-[0_0_10px_yellow] origin-left -rotate-6" />
                   <div className="w-[800px] h-2 bg-green-500 shadow-[0_0_10px_green] origin-left rotate-0" />
                   <div className="w-[800px] h-2 bg-blue-500 shadow-[0_0_10px_blue] origin-left rotate-6" />
                   <div className="w-[800px] h-2 bg-purple-500 shadow-[0_0_10px_purple] origin-left rotate-12" />
                 </div>
               )}
            </div>
          </>
        )}

        <DraggableItem 
          id="flashlight" 
          initialPosition={flashlightPos} 
          onDragStart={handleDragStart} 
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          bounds={workspaceSize}
        >
          <div className="w-16 h-10 bg-gray-700 rounded-lg flex items-center justify-end pr-1 border-2 border-gray-600 shadow-xl cursor-grab">
             <div className="w-2 h-8 bg-yellow-300 rounded-sm" />
          </div>
        </DraggableItem>

        <DraggableItem 
          id="prism" 
          initialPosition={prismPos} 
          onDragStart={handleDragStart} 
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          bounds={workspaceSize}
        >
          <div className={`w-14 h-16 ${useRedPrism ? 'bg-red-400/50 border-red-500' : 'bg-white/30 border-white/50'} backdrop-blur-md rounded-sm border-[1px] shadow-2xl flex items-center justify-center cursor-grab`} style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
          </div>
        </DraggableItem>
      </div>
    </div>
  );
}
