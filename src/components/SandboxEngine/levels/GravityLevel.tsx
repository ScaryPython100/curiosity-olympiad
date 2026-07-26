import { useState, useRef, useEffect } from 'react';
import { DraggableItem, Position } from '../DraggableItem';

interface GravityLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
}

export function GravityLevel({ recordAction }: GravityLevelProps) {
  const [nodePos, setNodePos] = useState<Position>({ x: 100, y: 200 });
  const [showVector, setShowVector] = useState(false);
  const [attractorMass, setAttractorMass] = useState(1.0);
  const [launchSpeed, setLaunchSpeed] = useState(250);
  
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

  const handleMassChange = (val: number) => {
    setAttractorMass(val);
    recordAction('changed_attractor_mass', { val });
  };

  const handleSpeedChange = (val: number) => {
    setLaunchSpeed(val);
    recordAction('changed_launch_speed', { val });
  };

  // Calculate abstract trajectory based on position relative to attractor & mass
  const dx = attractor.x - (nodePos.x + 16); // Center of node
  const dy = attractor.y - (nodePos.y + 16);
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Crash radius expands with attractor mass
  const crashRadius = 60 * attractorMass;

  let pathD = "";
  if (dist < crashRadius) {
    // Crash path
    pathD = `M ${nodePos.x + 16} ${nodePos.y + 16} L ${attractor.x} ${attractor.y}`;
  } else {
    // Orbit / Slingshot path scaled by launch speed
    const curveScale = launchSpeed / 150;
    const controlX = attractor.x + (dx > 0 ? 150 * curveScale : -150 * curveScale);
    const controlY = attractor.y + (dy > 0 ? -150 * curveScale : 150 * curveScale);
    const endX = dx > 0 ? 800 : 0;
    const endY = nodePos.y > 200 ? 0 : 400;
    pathD = `M ${nodePos.x + 16} ${nodePos.y + 16} Q ${controlX} ${controlY} ${endX} ${endY}`;
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Level Header */}
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex flex-wrap justify-between items-center gap-2 shrink-0">
        <div className="flex-1 pr-4">
          <h2 className="text-base md:text-lg font-bold text-gray-100 flex items-center gap-2">
             <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded text-white uppercase tracking-wider">Experiment 2</span>
             Everyday Air & Fan Blades Lab
          </h2>
          <p className="text-xs text-indigo-200 mt-0.5">
            <strong>Objective:</strong> Adjust Ceiling Fan Speed Regulator and Airflow Speed to discover how fan blades create cooling breezes in daily life.
          </p>
        </div>
        <button 
          onClick={toggleVector}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${showVector ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {showVector ? 'Hide Airflow Breeze Lines' : 'Show Airflow Breeze Lines'}
        </button>
      </div>

      {/* Interactive Simulation Variables Toolbar */}
      <div className="bg-gray-900/90 border-b border-gray-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">Fan Speed Regulator: {Math.round(attractorMass * 2)}</span>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.2"
            value={attractorMass}
            onChange={(e) => handleMassChange(parseFloat(e.target.value))}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">Airflow Speed: {Math.round(launchSpeed / 10)} km/h</span>
          <input
            type="range"
            min="100"
            max="500"
            step="25"
            value={launchSpeed}
            onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <span className="material-symbols-outlined text-sm text-yellow-400">info</span>
          <span>Higher mass requires higher velocity for stable orbit</span>
        </div>
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
