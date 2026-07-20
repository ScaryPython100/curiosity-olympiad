import { useState, useRef, useEffect } from 'react';
import { DraggableItem, Position } from '../DraggableItem';

interface GravityLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
}

export function GravityLevel({ recordAction }: GravityLevelProps) {
  const [nodePos, setNodePos] = useState<Position>({ x: 100, y: 200 });
  const [showVector, setShowVector] = useState(false);
  
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

  const attractor = { x: 400, y: 200 };
  
  const handleDragStart = (id: string) => {
    recordAction(`drag_start_${id}`);
  };

  const handleDrag = (id: string, newPos: Position) => {
    if (id === 'node') setNodePos(newPos);
  };

  const handleDragEnd = (id: string, newPos: Position) => {
    recordAction(`drag_end_${id}`, newPos);
    handleDrag(id, newPos);
  };

  const toggleVector = () => {
    recordAction('optional_tool_used');
    setShowVector(prev => !prev);
  };

  // Calculate abstract trajectory based on position relative to attractor
  // Purely visual to spark curiosity without needing real physics loops
  const dx = attractor.x - (nodePos.x + 16); // Center of node
  const dy = attractor.y - (nodePos.y + 16);
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  let pathD = "";
  if (dist < 80) {
    // Crash path
    pathD = `M ${nodePos.x + 16} ${nodePos.y + 16} L ${attractor.x} ${attractor.y}`;
  } else {
    // Orbit / Slingshot path
    const controlX = attractor.x + (dx > 0 ? 150 : -150);
    const controlY = attractor.y + (dy > 0 ? -150 : 150);
    const endX = dx > 0 ? 800 : 0;
    const endY = nodePos.y > 200 ? 0 : 400;
    pathD = `M ${nodePos.x + 16} ${nodePos.y + 16} Q ${controlX} ${controlY} ${endX} ${endY}`;
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Level Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
        <div className="flex-1 pr-4">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
             <span className="bg-indigo-600 text-xs px-2 py-1 rounded text-white uppercase tracking-wider">Mission 2</span>
             Orbital Gravity Module
          </h2>
          <p className="text-sm text-indigo-200 font-medium mt-1">
            <strong>Objective:</strong> Drag the Moon (white node) to find a position that achieves a stable, curved orbit around Earth without crashing.
          </p>
        </div>
        <button 
          onClick={toggleVector}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${showVector ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {showVector ? 'Hide Prediction' : 'Show Prediction'}
        </button>
      </div>

      {/* Physics Workspace */}
      <div 
        ref={workspaceRef}
        className="relative w-full h-[400px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-900 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        
        {/* Attractor (The "Earth") */}
        <div 
          className="absolute rounded-full bg-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.8)] flex items-center justify-center border-2 border-blue-400"
          style={{ 
            left: attractor.x - 32, 
            top: attractor.y - 32, 
            width: 64, 
            height: 64 
          }}
        >
          <span className="text-white text-xs font-bold opacity-80 pointer-events-none">Earth</span>
        </div>

        {/* The Trajectory Path */}
        {showVector && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path 
              d={pathD} 
              fill="none" 
              stroke={dist < 80 ? "red" : "rgba(255, 255, 255, 0.5)"} 
              strokeWidth="2" 
              strokeDasharray="5,5" 
            />
          </svg>
        )}

        {/* Draggable Node (The Moon) */}
        <DraggableItem 
          id="node" 
          initialPosition={nodePos} 
          onDragStart={handleDragStart} 
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          bounds={workspaceSize}
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-xl cursor-grab">
             <span className="text-gray-500 text-[10px] font-bold pointer-events-none">Moon</span>
          </div>
        </DraggableItem>

      </div>
    </div>
  );
}
