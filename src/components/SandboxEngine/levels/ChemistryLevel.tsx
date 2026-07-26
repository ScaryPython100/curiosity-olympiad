import { useState, useRef, useEffect } from 'react';
import { DraggableItem, Position } from '../DraggableItem';

interface ChemistryLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
  experimentSubIndex?: number;
}

export function ChemistryLevel({ recordAction, experimentSubIndex = 0 }: ChemistryLevelProps) {
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

  const [temperature, setTemperature] = useState(25);
  const [catalystAdded, setCatalystAdded] = useState(false);
  const [stirSpeed, setStirSpeed] = useState(2);

  const expInfo = [
    {
      title: "Everyday Kitchen Science & Heat Lab",
      objective: "Adjust Soup Temperature (°C) and Stirring Speed to discover how heat transfers in your kitchen.",
      slider1Label: "Soup Temperature",
      slider1Val: `${temperature}°C`,
      slider2Label: "Stirring Speed",
      slider2Val: stirSpeed === 1 ? "Gentle" : stirSpeed === 2 ? "Moderate" : "Rapid"
    },
    {
      title: "Earthenware Matka Evaporative Cooling Lab",
      objective: "Adjust Clay Porosity and Ambient Humidity to observe natural evaporative cooling without electricity.",
      slider1Label: "Clay Porosity",
      slider1Val: `${Math.round(temperature * 0.9)}%`,
      slider2Label: "Ambient Humidity",
      slider2Val: `${Math.round(stirSpeed * 25)}%`
    },
    {
      title: "Candle Flame Oxygen Depletion & Reaction Lab",
      objective: "Adjust Glass Jar Volume and Oxygen Concentration to observe combustion kinetics and flame extinction.",
      slider1Label: "Glass Jar Volume",
      slider1Val: `${Math.round(temperature * 10)} mL`,
      slider2Label: "Oxygen Concentration",
      slider2Val: `${Math.round(stirSpeed * 7 + 7)}%`
    }
  ][experimentSubIndex] || {
    title: "Everyday Kitchen Science & Heat Lab",
    objective: "Adjust Soup Temperature (°C) and Stirring Speed to discover how heat transfers in your kitchen.",
    slider1Label: "Soup Temperature",
    slider1Val: `${temperature}°C`,
    slider2Label: "Stirring Speed",
    slider2Val: stirSpeed === 1 ? "Gentle" : stirSpeed === 2 ? "Moderate" : "Rapid"
  };

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
    setTemperature(25);
    setCatalystAdded(false);
  };

  const handleTempChange = (val: number) => {
    setTemperature(val);
    recordAction('changed_temperature', { val });
  };

  const handleStirChange = (val: number) => {
    setStirSpeed(val);
    recordAction('changed_stir_speed', { val });
  };

  // Determine Beaker State based on mix & temperature
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

  // High temp or catalyst induces bubbling in any mixed reaction
  if (beakerMix.length > 0 && (temperature > 60 || catalystAdded)) {
    showBubbles = true;
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Level Header */}
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex flex-wrap justify-between items-center gap-2 shrink-0">
        <div className="flex-1 pr-4">
          <h2 className="text-base md:text-lg font-bold text-gray-100 flex items-center gap-2">
             <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded text-white uppercase tracking-wider">Experiment {experimentSubIndex + 1}</span>
             {expInfo.title}
          </h2>
          <p className="text-xs text-indigo-200 mt-0.5">
            <strong>Objective:</strong> {expInfo.objective}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCatalystAdded(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${catalystAdded ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {catalystAdded ? 'Wooden Spoon (Insulator)' : 'Metal Spoon (Conductor)'}
          </button>
          
          <button 
            onClick={resetBeaker}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
          >
            Reset Bowl
          </button>
        </div>
      </div>

      {/* Interactive Simulation Variables Toolbar */}
      <div className="bg-gray-900/90 border-b border-gray-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider1Label}: {expInfo.slider1Val}</span>
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={temperature}
            onChange={(e) => handleTempChange(parseInt(e.target.value))}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider2Label}: {expInfo.slider2Val}</span>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={stirSpeed}
            onChange={(e) => handleStirChange(parseInt(e.target.value))}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <span className="material-symbols-outlined text-sm text-yellow-400">info</span>
          <span>{temperature > 60 ? '🔥 High thermal energy: accelerated reaction' : 'Optimal reaction at 25°C-40°C'}</span>
        </div>
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
