import { useState, useRef, useEffect } from 'react';
import { DraggableItem, Position } from '../DraggableItem';

interface ChemistryLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
}

export function ChemistryLevel({ recordAction }: ChemistryLevelProps) {
  const [dropA, setDropA] = useState<Position>({ x: 100, y: 100 });
  const [dropB, setDropB] = useState<Position>({ x: 100, y: 200 });
  const [dropC, setDropC] = useState<Position>({ x: 100, y: 300 });
  
  const [beakerMix, setBeakerMix] = useState<string[]>([]);
  
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

  const beakerCenter = { x: 400, y: 200 };
  
  const checkMix = (id: string, pos: Position) => {
    // If dropped near the beaker (center)
    const dx = beakerCenter.x - pos.x;
    const dy = beakerCenter.y - pos.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 80) {
      if (!beakerMix.includes(id)) {
        recordAction(`mixed_element_${id}`);
        setBeakerMix(prev => [...prev, id]);
      }
    }
  };

  const handleDragStart = (id: string) => {
    recordAction(`drag_start_${id}`);
  };

  const handleDrag = (id: string, newPos: Position) => {
    if (id === 'A') setDropA(newPos);
    if (id === 'B') setDropB(newPos);
    if (id === 'C') setDropC(newPos);
  };

  const handleDragEnd = (id: string, newPos: Position) => {
    recordAction(`drag_end_${id}`, newPos);
    handleDrag(id, newPos);
    checkMix(id, newPos);
  };

  const resetBeaker = () => {
    recordAction('optional_tool_used'); // Using this as the "reset" tool usage
    setBeakerMix([]);
    setDropA({ x: 100, y: 100 });
    setDropB({ x: 100, y: 200 });
    setDropC({ x: 100, y: 300 });
  };

  // Determine Beaker State based on mix
  let beakerColor = "bg-white/10";
  let showBubbles = false;

  if (beakerMix.length > 0) {
    if (beakerMix.includes('A') && beakerMix.includes('B') && beakerMix.includes('C')) {
      beakerColor = "bg-black"; // Overload
    }
    else if (beakerMix.includes('A') && beakerMix.includes('B')) {
      beakerColor = "bg-purple-500";
    }
    else if (beakerMix.includes('A') && beakerMix.includes('C')) {
      beakerColor = "bg-green-500";
      showBubbles = true;
    }
    else if (beakerMix.includes('B') && beakerMix.includes('C')) {
      beakerColor = "bg-orange-500";
    }
    else if (beakerMix.includes('A')) beakerColor = "bg-blue-500";
    else if (beakerMix.includes('B')) beakerColor = "bg-red-500";
    else if (beakerMix.includes('C')) beakerColor = "bg-yellow-500";
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Level Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
        <div className="flex-1 pr-4">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
             <span className="bg-indigo-600 text-xs px-2 py-1 rounded text-white uppercase tracking-wider">Mission 3</span>
             Chemical Ecosystem Module
          </h2>
          <p className="text-sm text-indigo-200 font-medium mt-1">
            <strong>Objective:</strong> Experiment by mixing the unknown liquids. Discover the exact combination that creates a bubbling green reaction.
          </p>
        </div>
        <button 
          onClick={resetBeaker}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Flush System
        </button>
      </div>

      {/* Physics Workspace */}
      <div 
        ref={workspaceRef}
        className="relative w-full h-[400px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-900 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        
        {/* Beaker Container */}
        <div 
          className="absolute border-4 border-t-0 border-white/30 rounded-b-3xl flex items-end justify-center overflow-hidden p-2"
          style={{ 
            left: beakerCenter.x - 60, 
            top: beakerCenter.y - 60, 
            width: 120, 
            height: 120 
          }}
        >
           <div className={`w-full h-3/4 rounded-b-xl transition-colors duration-700 ${beakerColor} relative overflow-hidden`}>
              {showBubbles && (
                <div className="absolute inset-0 flex items-end justify-around pb-2 opacity-50">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
           </div>
        </div>

        {/* Draggable Elements */}
        {!beakerMix.includes('A') && (
          <DraggableItem 
            id="A" 
            initialPosition={dropA} 
            onDragStart={handleDragStart} 
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            bounds={workspaceSize}
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full shadow-[0_0_15px_blue] cursor-grab flex items-center justify-center text-white font-bold">A</div>
          </DraggableItem>
        )}

        {!beakerMix.includes('B') && (
          <DraggableItem 
            id="B" 
            initialPosition={dropB} 
            onDragStart={handleDragStart} 
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            bounds={workspaceSize}
          >
            <div className="w-10 h-10 bg-red-500 rounded-full shadow-[0_0_15px_red] cursor-grab flex items-center justify-center text-white font-bold">B</div>
          </DraggableItem>
        )}

        {!beakerMix.includes('C') && (
          <DraggableItem 
            id="C" 
            initialPosition={dropC} 
            onDragStart={handleDragStart} 
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            bounds={workspaceSize}
          >
            <div className="w-10 h-10 bg-yellow-500 rounded-full shadow-[0_0_15px_yellow] cursor-grab flex items-center justify-center text-white font-bold">C</div>
          </DraggableItem>
        )}

      </div>
    </div>
  );
}
