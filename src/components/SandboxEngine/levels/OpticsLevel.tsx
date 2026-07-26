import { useState, useRef, useEffect } from 'react';
import { DraggableItem, Position } from '../DraggableItem';

interface OpticsLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
}

export function OpticsLevel({ recordAction }: OpticsLevelProps) {
  const [flashlightPos, setFlashlightPos] = useState<Position>({ x: 50, y: 150 });
  const [prismPos, setPrismPos] = useState<Position>({ x: 400, y: 250 });
  
  const [useRedPrism, setUseRedPrism] = useState(false);
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [beamIntensity, setBeamIntensity] = useState(100);
  const [slitWidth, setSlitWidth] = useState(2);

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

  const handleRefractiveChange = (val: number) => {
    setRefractiveIndex(val);
    recordAction('changed_refractive_index', { val });
  };

  const handleIntensityChange = (val: number) => {
    setBeamIntensity(val);
    recordAction('changed_beam_intensity', { val });
  };

  // Dispersion factor scales with refractive index n
  const dispScale = (refractiveIndex - 1) * 2;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Level Header */}
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex flex-wrap justify-between items-center gap-2 shrink-0">
        <div className="flex-1 pr-4">
          <h2 className="text-base md:text-lg font-bold text-gray-100 flex items-center gap-2">
             <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded text-white uppercase tracking-wider">Experiment 1</span>
             Everyday Light & Magnification Lab
          </h2>
          <p className="text-xs text-indigo-200 mt-0.5">
            <strong>Objective:</strong> Adjust Water Bowl Curvature and Daylight Brightness to discover how curved water bends light to magnify objects in daily life.
          </p>
        </div>
        <button 
          onClick={toggleOptionalTool}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${useRedPrism ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {useRedPrism ? 'Normal Daylight' : 'Toggle Sunset Orange Light'}
        </button>
      </div>

      {/* Interactive Simulation Variables Toolbar */}
      <div className="bg-gray-900/90 border-b border-gray-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">Water Bowl Curvature: {Math.round((refractiveIndex - 1) * 100)}%</span>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.05"
            value={refractiveIndex}
            onChange={(e) => handleRefractiveChange(parseFloat(e.target.value))}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">Daylight Brightness: {beamIntensity}%</span>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={beamIntensity}
            onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">Lemon Size:</span>
          {[1, 2, 5].map((w) => (
            <button
              key={w}
              onClick={() => { setSlitWidth(w); recordAction('changed_slit_width', { width: w }); }}
              className={`px-2 py-0.5 rounded font-mono ${slitWidth === w ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-800 text-gray-400'}`}
            >
              {w === 1 ? "Small" : w === 2 ? "Medium" : "Large"}
            </button>
          ))}
        </div>
      </div>

      {/* Physics Workspace */}
      <div 
        ref={workspaceRef}
        className="relative w-full flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-950 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {!prismHit && (
          <div 
            className="absolute bg-white pointer-events-none transition-opacity duration-200"
            style={{ 
              left: beamX, 
              top: beamY - (slitWidth * 1.5), 
              width: workspaceSize.width - beamX,
              height: slitWidth * 3,
              opacity: beamIntensity / 100,
              boxShadow: `0 0 ${slitWidth * 6}px rgba(255,255,255,0.8)` 
            }}
          />
        )}

        {prismHit && (
          <>
            <div 
              className="absolute bg-white pointer-events-none transition-opacity duration-200"
              style={{ 
                left: beamX, 
                top: beamY - (slitWidth * 1.5), 
                width: prismPos.x - beamX,
                height: slitWidth * 3,
                opacity: beamIntensity / 100,
                boxShadow: `0 0 ${slitWidth * 6}px rgba(255,255,255,0.8)` 
              }}
            />
            <div className="absolute pointer-events-none" style={{ left: prismPos.x + 28, top: beamY - 12, opacity: beamIntensity / 100 }}>
               {useRedPrism ? (
                  <div className="w-[800px] h-8 bg-red-500 shadow-[0_0_30px_rgba(255,0,0,1)] origin-left -rotate-6" />
               ) : (
                 <div className="flex flex-col gap-0.5">
                   <div 
                     className="w-[800px] h-2 bg-red-500 shadow-[0_0_10px_red] origin-left transition-transform" 
                     style={{ transform: `rotate(${-12 * dispScale}deg)` }}
                   />
                   <div 
                     className="w-[800px] h-2 bg-yellow-500 shadow-[0_0_10px_yellow] origin-left transition-transform"
                     style={{ transform: `rotate(${-6 * dispScale}deg)` }}
                   />
                   <div 
                     className="w-[800px] h-2 bg-green-500 shadow-[0_0_10px_green] origin-left transition-transform"
                     style={{ transform: `rotate(0deg)` }}
                   />
                   <div 
                     className="w-[800px] h-2 bg-blue-500 shadow-[0_0_10px_blue] origin-left transition-transform"
                     style={{ transform: `rotate(${6 * dispScale}deg)` }}
                   />
                   <div 
                     className="w-[800px] h-2 bg-purple-500 shadow-[0_0_10px_purple] origin-left transition-transform"
                     style={{ transform: `rotate(${12 * dispScale}deg)` }}
                   />
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
